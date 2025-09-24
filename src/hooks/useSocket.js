import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";

// Singleton socket instance
let socketInstance = null;

export function getSocket() {
  if (typeof window === "undefined") return null;

  if (!socketInstance) {
    socketInstance = io({
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });
  }
  return socketInstance;
}

export default function useSocket({
  onMessage,
  onConnect,
  onDisconnect,
  onConnectError,
}) {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;
    if (!socket) return;

    // Set initial connection status
    onConnect(socket.connected);

    // Event listeners
    socket.on("connect", () => {
      onConnect(true);
      toast.success("Connected to chat");
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      onDisconnect(false);
      toast.error("Disconnected from chat");
      console.log("Socket disconnected:", reason);
    });

    socket.on("message", (payload) => {
      const assistantMsg = {
        id: Date.now(),
        role: "assistant",
        text:
          typeof payload === "string"
            ? payload
            : payload?.text ?? JSON.stringify(payload),
      };
      onMessage(assistantMsg);
    });

    socket.on("connect_error", (err) => {
      onConnectError(false);
      console.log("Socket connection failed:", err.message);
      if (
        err.message === "No auth cookie" ||
        err.message === "Invalid or expired session"
      ) {
        toast.error("Unauthorized: Please log in to access chat");
      } else {
        toast.error(`Socket error: ${err.message}`);
      }
    });

    // Cleanup
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message");
      socket.off("connect_error");
    };
  }, [onMessage, onConnect, onDisconnect, onConnectError]);

  return {
    socket: socketRef.current,
    sendMessage: (message) => {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("message", message);
      } else {
        toast.error("Socket not connected");
      }
    },
  };
}
