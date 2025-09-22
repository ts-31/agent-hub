"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Send } from "lucide-react"; // Assuming lucide-react is installed for icons

export default function ChatPage() {
  const [chats, setChats] = useState([
    {
      id: 1,
      title: "Introduction to AI",
      lastMessage: "Hello, how can I help?",
    },
    { id: 2, title: "Next.js Tips", lastMessage: "What about routing?" },
    { id: 3, title: "Tailwind CSS", lastMessage: "Custom themes..." },
  ]); // Dummy chat history

  const [selectedChat, setSelectedChat] = useState(chats[0]); // Default to first chat

  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", content: "Hello! How can I assist you today?" },
    { id: 2, role: "user", content: "Tell me about Next.js." },
    {
      id: 3,
      role: "assistant",
      content:
        "Next.js is a React framework for building web applications with server-side rendering and static site generation.",
    },
  ]); // Dummy messages for the selected chat

  const [input, setInput] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMessage = {
      id: messages.length + 1,
      role: "user",
      content: input,
    };
    setMessages([...messages, newMessage]);
    setInput("");
    // Simulate assistant response (in real app, integrate with API)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: "assistant",
          content: "This is a simulated response.",
        },
      ]);
    }, 1000);
  };

  const handleNewChat = () => {
    const newChat = {
      id: chats.length + 1,
      title: `New Chat ${chats.length + 1}`,
      lastMessage: "",
    };
    setChats([...chats, newChat]);
    setSelectedChat(newChat);
    setMessages([]);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r border-border bg-surface-1">
        <div className="p-4">
          <Button
            variant="outline"
            className="w-full justify-start text-foreground"
            onClick={handleNewChat}
          >
            <Plus className="mr-2 h-4 w-4" /> New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`p-4 cursor-pointer hover:bg-surface-2 transition-colors ${
                selectedChat.id === chat.id ? "bg-surface-2" : ""
              }`}
              onClick={() => {
                setSelectedChat(chat);
                // In real app, load messages for this chat
                setMessages([
                  {
                    id: 1,
                    role: "assistant",
                    content: `Starting chat: ${chat.title}`,
                  },
                ]);
              }}
            >
              <div className="font-medium text-foreground">{chat.title}</div>
              <div className="text-sm text-foreground-muted truncate">
                {chat.lastMessage}
              </div>
            </div>
          ))}
        </ScrollArea>
        <Separator />
        <div className="p-4 flex items-center gap-2">
          <Avatar>
            <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="text-sm text-foreground">User Name</div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-6 flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] p-4 rounded-lg ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </ScrollArea>

        {/* Input Bar */}
        <div className="border-t border-border p-4 bg-card">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 resize-none min-h-[40px] max-h-[200px] border-input bg-background text-foreground placeholder:text-foreground-muted"
              rows={1}
            />
            <Button type="submit" size="icon" className="h-10 w-10">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
