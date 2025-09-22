"use client";

import React, { useEffect, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { toast } from "react-hot-toast";

export default function LoginModal({
  open = false,
  onClose = () => {},
  onGoogleSignIn = () => {},
}) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setLoading(false);
    }
  }, [open]);

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

  async function handleGoogleSignIn() {
    onGoogleSignIn();
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const token = await userCredential.user.getIdToken();
      console.log("Firebase ID token:", token);

      toast.success("Successfully logged in!");
      onClose();
    } catch (err) {
      console.log("Google sign-in error:", err);
      toast.error(err?.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{ backgroundColor: "var(--overlay)" }}
        onClick={onClose}
      />

      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="relative w-full max-w-md mx-4 bg-background text-foreground rounded-xl shadow-lg border-2"
        style={{ borderColor: "var(--modal-border)" }}
      >
        <div className="px-6 py-4 flex items-center justify-between border-b border-muted/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-sm font-bold text-white">
              AH
            </div>
            <div className="text-lg font-semibold">Sign in</div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted hover:text-foreground/80"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="text-sm text-muted mb-4">Sign in with Google</div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2 rounded-md border border-muted bg-transparent hover:bg-muted/10 disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 533.5 544.3"
              className="w-5 h-5"
              aria-hidden="true"
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
        </div>

        <div className="px-6 py-3 text-xs text-muted border-t border-muted/40">
          By continuing you agree to the Terms of Service.
        </div>
      </div>
    </div>
  );
}
