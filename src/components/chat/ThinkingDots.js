import React from "react";

export default function ThinkingDots() {
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
