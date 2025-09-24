import React from "react";

function ChatHeader({ projectName, online }) {
  return (
    <header className="flex items-center justify-between border-b border-gray-800 px-6 h-16">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">AgentHub Chat</h1>
        <div className="ml-3 text-sm text-foreground/70">{projectName}</div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`inline-block w-3 h-3 rounded-full ${
            online ? "bg-green-400" : "bg-red-500"
          }`}
          aria-hidden
        />
        <div
          className={`text-sm ${online ? "text-green-300" : "text-red-300"}`}
          aria-live="polite"
        >
          {online ? "Online" : "Offline"}
        </div>
      </div>
    </header>
  );
}

export default ChatHeader;
