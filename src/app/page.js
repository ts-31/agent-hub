"use client";
import { useState } from "react";
import LoginModal from "@/components/LoginModal";

export default function Page() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center font-bold text-sm text-white">
            AH
          </div>
          <span className="text-lg font-semibold">AgentHub</span>
        </div>

        <nav>
          <button
            onClick={() => setShowLogin(true)}
            className="px-4 py-2 rounded-md border border-muted bg-transparent text-foreground hover:bg-muted/20"
          >
            Login
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <section className="max-w-4xl w-full text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Build and manage AI agents — simple, fast.
          </h1>
          <p className="text-lg md:text-xl text-muted mb-8">
            Create projects, attach prompts and files, and chat with your agents
            in real-time.
          </p>

          <div className="flex items-center justify-center gap-4">
            <button className="px-6 py-3 rounded-md bg-primary text-white font-medium shadow">
              Get Started
            </button>
            <button className="px-6 py-3 rounded-md border border-muted text-foreground">
              Explore Demo
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-sm text-muted">
        © {new Date().getFullYear()} AgentHub
      </footer>

      {/* Login Modal */}
      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onGoogleSignIn={() => console.log("Google sign-in initiated")}
      />
    </div>
  );
}
