"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast"; // your global toast setup

const STATIC_PROJECTS = [
  {
    id: 1,
    name: "Project A",
    chats: [
      {
        id: 1,
        role: "assistant",
        text: "Hello — I'm Agent for Project A. How can I help?",
      },
      { id: 2, role: "user", text: "Give me a one-line summary of Project A." },
      {
        id: 3,
        role: "assistant",
        text: "Project A is a demo to showcase Chat-like UI with Next.js and Tailwind.",
      },
    ],
  },
  {
    id: 2,
    name: "Project B",
    chats: [
      {
        id: 1,
        role: "assistant",
        text: "Agent for Project B here — ready when you are.",
      },
    ],
  },
  {
    id: 3,
    name: "Project C",
    chats: [],
  },
];

export default function ChatPage() {
  const [projects] = useState(STATIC_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0].id);
  const [messages, setMessages] = useState(() => projects[0].chats || []);
  const [input, setInput] = useState("");
  const messagesRef = useRef(null);
  const textareaRef = useRef(null);

  const socketRef = useRef(null);

  // Sidebar/resizer state
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const startWidthRef = useRef(sidebarWidth);

  // Update messages when project changes
  useEffect(() => {
    const proj = projects.find((p) => p.id === selectedProjectId);
    setMessages(proj?.chats || []);
  }, [selectedProjectId, projects]);

  // Auto scroll to bottom
  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function autoGrowTextarea() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }

  useEffect(() => autoGrowTextarea(), [input]);

  // --- SOCKET.IO SETUP ---
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!window.__io) {
      window.__io = io({
        path: "/socket.io",
        transports: ["websocket", "polling"],
      });
    }

    const socket = window.__io;
    socketRef.current = socket;

    // Remove old listeners (Fast Refresh safety)
    socket.off("connect");
    socket.off("disconnect");
    socket.off("message");
    socket.off("connect_error");

    socket.on("connect", () => {
      toast.success("Connected to chat");
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
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
      setMessages((m) => [...m, assistantMsg]);
    });

    socket.on("connect_error", (err) => {
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

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message");
      socket.off("connect_error");
    };
  }, []);

  // Send message to server
  function handleSend() {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), role: "user", text: input.trim() };
    setMessages((m) => [...m, userMsg]);

    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit("message", input.trim());
    } else {
      toast.error("Socket not connected");
    }

    setInput("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Sidebar drag logic
  useEffect(() => {
    function onMouseMove(e) {
      if (!isDragging) return;
      const delta = e.clientX - dragStartX.current;
      const newW = Math.max(200, Math.min(420, startWidthRef.current + delta));
      setSidebarWidth(newW);
    }
    function onMouseUp() {
      if (isDragging) setIsDragging(false);
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging]);

  function startDrag(e) {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    startWidthRef.current = sidebarWidth;
  }

  return (
    <div className="h-screen flex bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex md:flex-col bg-background border-r border-gray-700 p-4"
        style={{ width: sidebarWidth }}
      >
        <div className="text-sm font-semibold mb-4">Projects</div>
        <div className="flex-1 space-y-2 overflow-auto">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm border ${
                selectedProjectId === p.id
                  ? "bg-gray-700 border-gray-600"
                  : "hover:bg-gray-800 border-transparent"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </aside>

      {/* Resizer */}
      <div
        className="hidden md:block cursor-col-resize select-none h-full bg-gray-800 hover:bg-gray-600"
        onMouseDown={startDrag}
        style={{ width: 6 }}
        aria-hidden
      />

      {/* Mobile sheet */}
      <Sheet>
        <div className="md:hidden absolute top-4 left-4 z-30">
          <SheetTrigger asChild>
            <Button size="sm">Projects</Button>
          </SheetTrigger>
        </div>
        <SheetContent side="left" className="w-72 p-4 md:hidden">
          <div className="text-sm font-semibold mb-4">Projects</div>
          <div className="space-y-2">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProjectId(p.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm border ${
                  selectedProjectId === p.id
                    ? "bg-gray-700 border-gray-600"
                    : "hover:bg-gray-800 border-transparent"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
          <div className="mt-6">
            <SheetClose asChild>
              <Button>Close</Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>

      {/* Chat */}
      <main className="flex-1 flex flex-col">
        <header className="flex items-center justify-between border-b border-gray-800 px-6 h-16">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">AgentHub Chat</h1>
            <div className="ml-3 text-sm text-foreground/70">
              {projects.find((p) => p.id === selectedProjectId)?.name}
            </div>
          </div>
          <div className="text-sm text-foreground/60 hidden sm:block">
            Online
          </div>
        </header>

        <div className="flex-1 overflow-auto py-6 px-6">
          <div ref={messagesRef} className="mx-auto max-w-3xl w-full space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-sm text-foreground/60">
                No messages yet — start the conversation below.
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex w-full ${
                  m.role === "user" ? "justify-end" : ""
                }`}
              >
                <div
                  className={`inline-block p-3 rounded-xl shadow-sm border max-w-[65%] w-auto text-base ${
                    m.role === "assistant"
                      ? "bg-gray-800 border-gray-700 text-foreground"
                      : "bg-gray-700 border-gray-600 text-foreground"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-800 py-4 px-6">
          <div className="mx-auto max-w-3xl w-full flex gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={autoGrowTextarea}
              rows={1}
              placeholder="Send a message..."
              className="flex-1 resize-none rounded-lg border border-gray-700 p-3 text-lg
                         focus:outline-none focus:ring-1 focus:ring-primary
                         placeholder:opacity-60 bg-background text-foreground
                         overflow-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent"
            />
            <button
              onClick={handleSend}
              className="flex-none h-12 w-12 flex items-center justify-center
                         rounded-md border border-foreground text-foreground hover:bg-foreground/10"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
