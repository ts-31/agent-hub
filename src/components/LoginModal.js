"use client";

import React, { useEffect, useState } from "react";

export default function LoginModal({
  open = false,
  onClose = () => {},
  onGoogleSignIn,
}) {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) {
      setLoading(false);
      setError(null);
      setMode("login");
    }
  }, [open]);

  // close on Escape key
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay: silvery/white blur */}
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
        className="relative w-full max-w-md mx-4 bg-background text-foreground rounded-xl shadow-lg border-2"
        style={{ borderColor: "var(--modal-border)" }}
      >
        {/* header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-muted/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-sm font-bold text-white">
              AH
            </div>
            <div className="text-lg font-semibold">
              {mode === "login" ? "Sign in" : "Create account"}
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted hover:text-foreground/80"
          >
            ✕
          </button>
        </div>

        {/* tabs */}
        <div className="px-6 py-3 flex gap-2">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-md border ${
              mode === "login"
                ? "border-primary text-primary bg-muted/10"
                : "border-transparent text-muted hover:border-muted"
            }`}
            type="button"
          >
            Login
          </button>

          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-md border ${
              mode === "register"
                ? "border-primary text-primary bg-muted/10"
                : "border-transparent text-muted hover:border-muted"
            }`}
            type="button"
          >
            Register
          </button>
        </div>

        {/* google-only sign-in block */}
        <div className="px-6 py-6">
          <div className="text-sm text-muted mb-4">
            Quick sign in with Google
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={async () => {
                setError(null);
                setLoading(true);
                try {
                  if (onGoogleSignIn) await onGoogleSignIn();
                  onClose();
                } catch (err) {
                  setError(err?.message || "Google sign-in failed");
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full flex items-center justify-center gap-3 py-2 rounded-md border border-muted bg-transparent hover:bg-muted/10"
            >
              {/* Google logo */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 533.5 544.3"
                className="w-5 h-5"
                aria-hidden
              >
                <path
                  fill="#4285f4"
                  d="M533.5 278.4c0-17.4-1.6-34-4.6-50.1H272v95h147.1c-6.3 34.2-25.4 63.1-54 82.3v68.3h87.2c51.2-47.1 80.2-116.6 80.2-195.5z"
                />
                <path
                  fill="#34a853"
                  d="M272 544.3c73.7 0 135.6-24.5 180.8-66.6l-87.2-68.3c-24.3 16.3-55.6 25.7-93.6 25.7-71.9 0-132.9-48.5-154.8-113.9H28.9v71.5C74.1 483 165.4 544.3 272 544.3z"
                />
                <path
                  fill="#fbbc04"
                  d="M117.2 327.1c-10.8-32.7-10.8-67.6 0-100.3V155.3H28.9c-39.5 78.7-39.5 170.4 0 249.1l88.3-77.3z"
                />
                <path
                  fill="#ea4335"
                  d="M272 107.7c39 0 74 13.4 101.6 39.7l76.2-76.2C407.5 24 344.4 0 272 0 165.4 0 74.1 61.3 28.9 155.3l88.3 71.5C139.1 156.2 200.1 107.7 272 107.7z"
                />
              </svg>

              <span className="text-sm">
                {loading ? "Signing in..." : "Sign in with Google"}
              </span>
            </button>

            {error && <div className="text-red-400 text-sm mt-1">{error}</div>}
          </div>
        </div>

        <div className="px-6 py-3 text-xs text-muted border-t border-muted/40">
          By continuing you agree to the Terms of Service.
        </div>
      </div>
    </div>
  );
}
