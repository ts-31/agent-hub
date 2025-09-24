"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";
import Sidebar from "@/components/chat/Sidebar";
import ProjectList from "@/components/chat/ProjectList";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import ChatInput from "@/components/chat/ChatInput";

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

export default function Chat() {
  const [projects] = useState(STATIC_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0].id);
  const [messages, setMessages] = useState(() => projects[0].chats || []);
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  const socketRef = useRef(null);
  const [online, setOnline] = useState(false);

  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const startWidthRef = useRef(sidebarWidth);

  useEffect(() => {
    const proj = projects.find((p) => p.id === selectedProjectId);
    setMessages(proj?.chats || []);
  }, [selectedProjectId, projects]);

  function autoGrowTextarea() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }

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

    socket.off("connect");
    socket.off("disconnect");
    socket.off("message");
    socket.off("connect_error");

    setOnline(!!socket.connected);

    socket.on("connect", () => {
      setOnline(true);
      toast.success("Connected to chat");
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      setOnline(false);
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
      setOnline(false);
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
      <Sidebar
        width={sidebarWidth}
        projects={projects}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
      />

      <div
        className="hidden md:block cursor-col-resize select-none h-full bg-gray-800 hover:bg-gray-600"
        onMouseDown={startDrag}
        style={{ width: 6 }}
        aria-hidden
      />

      <Sheet>
        <div className="md:hidden absolute top-4 left-4 z-30">
          <SheetTrigger asChild>
            <Button size="sm">Projects</Button>
          </SheetTrigger>
        </div>
        <SheetContent side="left" className="w-72 p-4 md:hidden">
          <div className="text-sm font-semibold mb-4">Projects</div>
          <ProjectList
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
          />
          <div className="mt-6">
            <SheetClose asChild>
              <Button>Close</Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>

      <main className="flex-1 flex flex-col">
        <ChatHeader
          projectName={projects.find((p) => p.id === selectedProjectId)?.name}
          online={online}
        />

        <div className="flex-1 overflow-auto py-6 px-6">
          <MessageList messages={messages} />
        </div>

        <ChatInput
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          handleKeyDown={handleKeyDown}
          textareaRef={textareaRef}
          autoGrowTextarea={autoGrowTextarea}
        />
      </main>
    </div>
  );
}
