// server.mjs
import next from "next";
import { createServer } from "http";
import { parse } from "url";
import { Server as SocketIOServer } from "socket.io";
import { getFirebaseAdmin } from "./src/lib/firebaseAdmin.js";

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
    return decoded; // contains uid and other claims
  } catch (err) {
    console.log("❌ Invalid session cookie:", err.message);
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
      origin: "*", // adjust in prod
    },
  });

  // ✅ Middleware: verify Firebase cookie before connection
  io.use(async (socket, next) => {
    const headers = socket.handshake.headers || {};
    console.log("WS handshake cookie header:", headers.cookie);

    const cookies = parseCookies(headers.cookie);
    const sessionCookie = cookies.session;

    if (!sessionCookie) {
      // send informative error for client to show
      return next(new Error("No auth cookie"));
    }

    const decoded = await verifyFirebaseCookie(sessionCookie);
    if (!decoded) {
      return next(new Error("Invalid or expired session"));
    }

    socket.user = decoded;
    next();
  });

  io.on("connection", (socket) => {
    console.log(`🔗 Client connected: ${socket.id} (uid: ${socket.user.uid})`);

    // ✅ Join per-user room
    socket.join(`user_${socket.user.uid}`);

    socket.on("message", (msg) => {
      console.log(`📨 Received from ${socket.user.uid}:`, msg);
      // echo back to this user's room
      io.to(`user_${socket.user.uid}`).emit("message", `Echo: ${msg}`);
    });

    socket.on("disconnect", () => {
      console.log(
        `❌ Client disconnected: ${socket.id} (uid: ${socket.user.uid})`
      );
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`✅ Server ready on http://localhost:${PORT}`);
  });
});
