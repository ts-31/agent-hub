import next from "next";
import { createServer } from "http";
import { parse } from "url";
import { Server as SocketIOServer } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    // Pass all HTTP requests to Next.js
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // ✅ Attach Socket.IO to the *same* server
  const io = new SocketIOServer(server, {
    path: "/socket.io", // default path (you can omit)
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("🔗 Client connected:", socket.id);

    socket.on("message", (msg) => {
      console.log("📨 Received:", msg);
      socket.emit("message", `Echo: ${msg}`);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`✅ Server ready on http://localhost:${PORT}`);
  });
});
