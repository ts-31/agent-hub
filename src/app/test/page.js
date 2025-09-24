"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function ChatPage() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const s = io(); // connects to same origin (http://localhost:3000)
    setSocket(s);

    s.on("connect", () => console.log("✅ Connected to WS server"));
    s.on("message", (msg) => setMessages((prev) => [...prev, msg]));

    return () => s.disconnect();
  }, []);

  const sendMessage = () => {
    if (socket) socket.emit("message", "Hello from client!");
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Socket.IO Chat</h1>
      <button
        onClick={sendMessage}
        className="px-4 py-2 bg-blue-500 text-white rounded mt-2"
      >
        Send Message
      </button>

      <ul className="mt-4">
        {messages.map((m, i) => (
          <li key={i} className="text-gray-200">
            {m}
          </li>
        ))}
      </ul>
    </div>
  );
}
