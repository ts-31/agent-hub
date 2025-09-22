"use client";

import { useState } from "react";
import LoginModal from "@/components/LoginModal";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

export default function Page() {
  const { user, logOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-md border border-muted bg-transparent text-foreground hover:bg-muted/20"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">
                    {user.displayName?.[0] || "U"}
                  </div>
                )}
                <span className="text-sm">{user.displayName}</span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-background border border-muted rounded-md shadow-lg z-10">
                  <button
                    onClick={async () => {
                      try {
                        await logOut();
                        toast.success("Successfully logged out!");
                      } catch (err) {
                        toast.error("Logout failed!"); 
                      } finally {
                        setDropdownOpen(false);
                      }
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="px-4 py-2 rounded-md border border-muted bg-transparent text-foreground hover:bg-muted/20"
            >
              Login
            </button>
          )}
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
