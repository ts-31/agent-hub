import React from "react";
import ThinkingDots from "./ThinkingDots";

export default function MessageList({ messages, isThinking = false }) {
  return (
    <div className="mx-auto max-w-3xl w-full space-y-4">
      {messages.length === 0 && (
        <div className="text-center text-sm text-foreground/60">
          No messages yet — start the conversation below.
        </div>
      )}

      {messages.map((m) => (
        <div
          key={m.id}
          className={`flex w-full ${m.role === "user" ? "justify-end" : ""}`}
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

      {isThinking && (
        <div className="flex w-full">
          <div className="inline-flex items-center rounded-xl border max-w-[65%] px-3 py-2 text-base bg-gray-800 border-gray-700 text-foreground">
            <ThinkingDots />
          </div>
        </div>
      )}
    </div>
  );
}
