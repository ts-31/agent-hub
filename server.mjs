// server.mjs
import "dotenv/config"; 
import next from "next";
import { createServer } from "http";
import { parse } from "url";
import { Server as SocketIOServer } from "socket.io";
import { getFirebaseAdmin } from "./src/lib/firebaseAdmin.js";
import { dbConnect } from "./src/lib/mongoose.js";
import Project from "./src/models/Project.js";
import Message from "./src/models/Message.js";
import User from "./src/models/User.js";
import { callGeminiAgent } from "./src/lib/geminiClient.js";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split("; ").map((c) => {
      const [key, ...v] = c.split("=");
      return [key, decodeURIComponent(v.join("="))];
    })
  );
}

async function verifyFirebaseCookie(sessionCookie) {
  const admin = getFirebaseAdmin();
  try {
    const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
    return decoded;
  } catch (err) {
    console.log("Invalid session cookie:", err?.message || err);
    return null;
  }
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(server, {
    path: "/socket.io",
    cors: {
      origin: "*", // tighten in prod
      credentials: true,
    },
  });

  // Socket auth middleware (checks session cookie)
  io.use(async (socket, next) => {
    const headers = socket.handshake.headers || {};
    const cookies = parseCookies(headers.cookie || "");
    const sessionCookie = cookies.session;

    if (!sessionCookie) {
      return next(new Error("No auth cookie"));
    }

    const decoded = await verifyFirebaseCookie(sessionCookie);
    if (!decoded) {
      return next(new Error("Invalid or expired session"));
    }

    socket.user = decoded; // contains uid
    next();
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id} (uid: ${socket.user.uid})`);
    socket.join(`user_${socket.user.uid}`);

    socket.on("message", async (data) => {
      try {
        const { projectId, content } = data || {};
        if (!projectId || !content) {
          socket.emit("message:error", {
            error: "Missing projectId or content",
          });
          return;
        }

        // ensure DB connection
        await dbConnect();

        // find app user by firebaseUid (must exist)
        const user = await User.findOne({
          firebaseUid: socket.user.uid,
        }).exec();
        if (!user) {
          socket.emit("message:error", { error: "User record not found" });
          return;
        }

        // check project belongs to user
        const project = await Project.findById(projectId).exec();
        if (!project) {
          socket.emit("message:error", { error: "Project not found" });
          return;
        }
        if (project.userId.toString() !== user._id.toString()) {
          socket.emit("message:error", {
            error: "Not authorized for this project",
          });
          return;
        }

        // store user message
        const userMsg = await Message.create({
          projectId: project._id,
          userId: user._id,
          role: "user",
          content,
        });

        // fetch last 10 messages (including this one)
        const recent = await Message.find({ projectId: project._id })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();

        // reverse to chronological order and map to {role,content}
        const formatted = recent.reverse().map((m) => ({
          role: m.role,
          content: m.content,
        }));

        // call gemini (blocking)
        let assistantText = "";
        try {
          assistantText = await callGeminiAgent({
            agentName: project.name || "agent",
            systemPrompt: project.systemPrompt || "",
            messages: formatted,
          });
        } catch (llmErr) {
          // mark user message metadata as error (optional)
          await Message.findByIdAndUpdate(userMsg._id, {
            $set: {
              "metadata.status": "llm_error",
              "metadata.error": llmErr?.message || "LLM error",
            },
          }).exec();

          console.log("LLM call failed:", llmErr?.message || llmErr);
          socket.emit("message:error", { error: "LLM call failed" });
          return;
        }

        // persist assistant message
        const assistantMsg = await Message.create({
          projectId: project._id,
          userId: user._id,
          role: "assistant",
          content: assistantText,
        });

        // send assistant message back to this user (frontend expects a 'message' event)
        // payload shape: { text: string, _id: string } — use text property so existing client mapping works
        io.to(`user_${socket.user.uid}`).emit("message", {
          _id: assistantMsg._id,
          text: assistantMsg.content,
          role: "assistant",
        });
      } catch (err) {
        console.log("Error processing socket message:", err?.message || err);
        socket.emit("message:error", { error: "Internal server error" });
      }
    });

    socket.on("disconnect", () => {
      console.log(
        `Client disconnected: ${socket.id} (uid: ${socket.user.uid})`
      );
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server ready on http://localhost:${PORT}`);
  });
});
