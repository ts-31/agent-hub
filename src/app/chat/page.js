"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import useSocket from "@/hooks/useSocket";
import Sidebar from "@/components/chat/Sidebar";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import ChatInput from "@/components/chat/ChatInput";

/* ---------- Auto-scroll helpers ---------- */
const SCROLL_THRESHOLD = 100; // px

function isUserNearBottom(el, threshold = SCROLL_THRESHOLD) {
  if (!el) return true; // if unknown, assume safe to scroll
  return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
}

function scrollToBottom(el, smooth = true) {
  if (!el) return;
  if (smooth && el.scrollTo) {
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  } else {
    el.scrollTop = el.scrollHeight;
  }
}
/* ----------------------------------------- */

export default function Chat() {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [online, setOnline] = useState(false);

  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);

  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const startWidthRef = useRef(sidebarWidth);

  // Socket: wrap onMessage to decide whether to autoscroll
  const { socket, sendMessage } = useSocket({
    onMessage: (message) => {
      const chatContainer = chatContainerRef.current;
      const shouldAutoScroll = isUserNearBottom(chatContainer);

      setMessages((m) => [...m, message]);

      // after DOM paint, scroll if user was near bottom
      requestAnimationFrame(() => {
        if (shouldAutoScroll) scrollToBottom(chatContainer, true);
      });
    },
    onConnect: (status) => setOnline(status),
    onDisconnect: (status) => setOnline(status),
    onConnectError: (status) => setOnline(status),
  });

  // Auto-scroll on mount/update only if near bottom
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    if (isUserNearBottom(chatContainer)) {
      scrollToBottom(chatContainer, false);
    }
  }, []); // run once on mount

  function autoGrowTextarea() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }

  function handleSend() {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), role: "user", text: input.trim() };

    // check user's position *before* adding the message
    const chatContainer = chatContainerRef.current;
    const shouldAutoScroll = isUserNearBottom(chatContainer);

    // optimistically append the message
    setMessages((m) => [...m, userMsg]);
    sendMessage(input.trim());
    setInput("");

    // after DOM update, scroll if appropriate
    requestAnimationFrame(() => {
      if (shouldAutoScroll) scrollToBottom(chatContainer, true);
    });
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  useEffect(() => autoGrowTextarea(), [input]);

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
      <Sidebar
        width={sidebarWidth}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
        setProjectName={setProjectName}
      />

      <div
        className="hidden md:block cursor-col-resize select-none h-full bg-gray-800 hover:bg-gray-600"
        onMouseDown={startDrag}
        style={{ width: 6 }}
        aria-hidden
      />

      <main className="flex-1 flex flex-col">
        <ChatHeader projectName={projectName} online={online} />

        {/* add scroll-smooth for extra polish; programmatic scroll uses behavior:'smooth' */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-auto py-6 px-6 scroll-smooth"
        >
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
