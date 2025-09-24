"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function NewProjectModal({
  open = false,
  onClose = () => {},
  onCreate = () => {},
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setSystemPrompt("");
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  async function handleAddProject() {
    if (!name.trim()) {
      toast.error("Project name is required");
      return;
    }

    setLoading(true);
    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(
        /\/$/,
        ""
      );
      const url = base ? `${base}/api/projects` : "/api/projects";

      const res = await fetch(url, {
        method: "POST",
        credentials: "include", // send session cookie
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          systemPrompt: systemPrompt.trim() || undefined,
          meta: {},
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data?.error || "Failed to create project";
        toast.error(message);
        return;
      }

      const project = data.project;
      if (!project) {
        toast.error("Unexpected response from server");
        return;
      }

      toast.success("Project created");
      // inform parent so it can add to UI
      try {
        onCreate(project);
      } catch (e) {
        // ignore errors in parent callback
        console.log("onCreate callback error", e);
      }

      onClose();
    } catch (err) {
      console.log("Create project error", err);
      toast.error(err?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

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
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
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

          <button
            type="button"
            onClick={handleAddProject}
            disabled={loading}
            className="px-4 py-2 rounded-md"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-foreground)",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
