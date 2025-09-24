"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import useSocket from "@/hooks/useSocket";
import Sidebar from "@/components/chat/Sidebar";
import ProjectList from "@/components/chat/ProjectList";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import ChatInput from "@/components/chat/ChatInput";
import { STATIC_PROJECTS } from "@/data/projects";

export default function Chat() {
  const [projects] = useState(STATIC_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0].id);
  const [messages, setMessages] = useState(() => projects[0].chats || []);
  const [input, setInput] = useState("");
  const [online, setOnline] = useState(false);
  const textareaRef = useRef(null);

  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const startWidthRef = useRef(sidebarWidth);

  const { socket, sendMessage } = useSocket({
    onMessage: (message) => setMessages((m) => [...m, message]),
    onConnect: (status) => setOnline(status),
    onDisconnect: (status) => setOnline(status),
    onConnectError: (status) => setOnline(status),
  });

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

  function handleSend() {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), role: "user", text: input.trim() };
    setMessages((m) => [...m, userMsg]);
    sendMessage(input.trim());
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
