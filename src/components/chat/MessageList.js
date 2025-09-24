import React, { useEffect, useRef } from "react";

function MessageList({ messages }) {
  const messagesRef = useRef(null);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div ref={messagesRef} className="mx-auto max-w-3xl w-full space-y-4">
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
    </div>
  );
}

export default MessageList;
