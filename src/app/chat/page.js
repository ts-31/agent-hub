// src/app/chat/page.js
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
  const [projects, setProjects] = useState([]); // fetched projects
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [online, setOnline] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [fetchError, setFetchError] = useState(null);

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

  // fetch projects for logged-in user
  useEffect(() => {
    let mounted = true;
    async function fetchProjects() {
      setLoadingProjects(true);
      setFetchError(null);
      try {
        const res = await fetch("/api/projects", {
          method: "GET",
          credentials: "include", // send session cookie
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || "Failed to fetch projects");
        }

        // map backend projects to expected shape: { id, name, chats }
        const mapped = (data.projects || []).map((p) => ({
          id: p._id,
          name: p.name,
          // keep chats empty for now; chat messages handled separately
          chats: [],
        }));

        if (!mounted) return;
        setProjects(mapped);
        if (mapped.length > 0) {
          setSelectedProjectId((prev) => prev || mapped[0].id);
          setMessages(mapped[0].chats || []);
        } else {
          setSelectedProjectId(null);
          setMessages([]);
        }
      } catch (err) {
        if (!mounted) return;
        setFetchError(err?.message || "Error fetching projects");
        setProjects([]);
        setSelectedProjectId(null);
        setMessages([]);
      } finally {
        if (mounted) setLoadingProjects(false);
      }
    }

    fetchProjects();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const proj = projects.find((p) => p.id === selectedProjectId);
    setMessages(proj?.chats || []);
  }, [selectedProjectId, projects]);

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

          {/* Loader or ProjectList */}
          {loadingProjects ? (
            <div className="flex items-center justify-center py-6">
              {/* simple spinner */}
              <svg
                className="w-6 h-6 animate-spin text-muted"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            </div>
          ) : fetchError ? (
            <div className="text-sm text-red-400">{fetchError}</div>
          ) : (
            <ProjectList
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
            />
          )}

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
