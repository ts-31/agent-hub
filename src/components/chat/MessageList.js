import React from "react";

function ThinkingDots() {
  return (
    <>
      <style>{`
        .ah-dots {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .ah-dot {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: var(--color-foreground, #ededed);
          opacity: 0.85;
          transform-origin: center bottom;
          animation: ah-bounce 900ms infinite ease-in-out;
        }

        .ah-dot:nth-child(1) { animation-delay: 0ms; }
        .ah-dot:nth-child(2) { animation-delay: 120ms; }
        .ah-dot:nth-child(3) { animation-delay: 240ms; }

        @keyframes ah-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>

      <div className="ah-dots" aria-hidden="true">
        <span className="ah-dot" />
        <span className="ah-dot" />
        <span className="ah-dot" />
      </div>
    </>
  );
}

function MessageList({ messages, isThinking = false }) {
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
          <div className="inline-block p-3 rounded-xl border max-w-[65%] w-auto text-base bg-gray-800 border-gray-700 text-foreground">
            <div className="flex items-center gap-2">
              <ThinkingDots />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageList;
