"use client";

import React, { useEffect } from "react";

export default function NewProjectModal({ open = false, onClose = () => {} }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      window.addEventListener("keydown", handleKey);
      const modal = document.querySelector("[role='dialog']");
      if (modal) modal.focus();
    }
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* blur overlay (matches LoginModal) */}
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{ backgroundColor: "var(--overlay)" }}
        onClick={onClose}
      />

      {/* modal panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="relative w-full max-w-lg mx-4 bg-background text-foreground rounded-xl shadow-lg border-2"
        style={{ borderColor: "var(--modal-border)" }}
      >
        <div className="px-6 py-4 flex items-center justify-between border-b border-muted/40">
          <div className="text-lg font-semibold">New Project</div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted hover:text-foreground/80"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm mb-1">Project name</label>
            <input
              type="text"
              placeholder="My project"
              className="w-full rounded-md px-3 py-2"
              style={{
                backgroundColor: "transparent",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "var(--color-foreground)",
              }}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Description</label>
            <input
              type="text"
              placeholder="Short description (optional)"
              className="w-full rounded-md px-3 py-2"
              style={{
                backgroundColor: "transparent",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "var(--color-foreground)",
              }}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">System prompt</label>
            <textarea
              placeholder="Define the agent's role / instructions..."
              className="w-full rounded-md px-3 py-2 min-h-[100px] resize-vertical"
              style={{
                backgroundColor: "transparent",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "var(--color-foreground)",
              }}
            />
          </div>
        </div>

        <div className="px-6 py-4 flex items-center justify-end gap-3 border-t border-muted/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md"
            style={{
              border: "1px solid rgba(255,255,255,0.06)",
              color: "var(--color-foreground)",
              backgroundColor: "transparent",
            }}
          >
            Cancel
          </button>

          {/* Add button intentionally does nothing */}
          <button
            type="button"
            onClick={() => {}}
            className="px-4 py-2 rounded-md"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-foreground)",
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
