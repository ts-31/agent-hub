// src/components/Sidebar.js
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import ProjectList from "./ProjectList";
import NewProjectModal from "./NewProjectModal";
import { useAuth } from "@/context/AuthContext";

function Sidebar({
  width,
  projects: initialProjects = null,
  selectedProjectId,
  setSelectedProjectId,
  setProjectName,
}) {
  const router = useRouter();
  const { logOut } = useAuth();

  const [projects, setProjects] = useState(initialProjects || []);
  const [loading, setLoading] = useState(!initialProjects);
  const [error, setError] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    if (initialProjects) return;
    let mounted = true;

    async function fetchProjects() {
      setLoading(true);
      setError(null);
      try {
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(
          /\/$/,
          ""
        );
        const url = base ? `${base}/api/projects` : "/api/projects";
        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed to fetch projects");
        const mapped = (data.projects || []).map((p) => ({
          id: p._id,
          name: p.name,
          chats: [],
        }));
        if (!mounted) return;
        setProjects(mapped);
        if (!selectedProjectId && mapped.length > 0) {
          setSelectedProjectId(mapped[0].id);
          setProjectName(mapped[0].name);
        } else setProjectName("");
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || "Error fetching projects");
        setProjects([]);
        setSelectedProjectId(null);
        setProjectName("");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchProjects();
    return () => {
      mounted = false;
    };
  }, [
    initialProjects,
    setSelectedProjectId,
    setProjectName,
    selectedProjectId,
  ]);

  useEffect(() => {
    if (initialProjects) {
      setProjects(initialProjects);
      if (!selectedProjectId && initialProjects.length > 0) {
        setSelectedProjectId(initialProjects[0].id);
        setProjectName(initialProjects[0].name);
      }
    }
  }, [
    initialProjects,
    setSelectedProjectId,
    setProjectName,
    selectedProjectId,
  ]);

  useEffect(() => {
    if (selectedProjectId && projects.length > 0) {
      const selectedProject = projects.find((p) => p.id === selectedProjectId);
      setProjectName(selectedProject ? selectedProject.name : "");
    } else {
      setProjectName("");
    }
  }, [selectedProjectId, projects, setProjectName]);

  function handleCreateProject(project) {
    const mapped = { id: project._id, name: project.name, chats: [] };
    setProjects((prev) => [mapped, ...prev]);
    setSelectedProjectId(mapped.id);
    setProjectName(mapped.name);
    setShowNewModal(false);
  }

  async function handleLogout() {
    if (logoutLoading) return;
    setLogoutLoading(true);

    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(
        /\/$/,
        ""
      );
      const logoutUrl = base ? `${base}/api/auth/logout` : `/api/auth/logout`;

      const res = await fetch(logoutUrl, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));

      try {
        await logOut();
      } catch (e) {
        console.log("Local signOut failed:", e);
      }

      if (res.ok) {
        toast.success("Successfully logged out!");
        router.push("/");
      } else {
        toast.error(data?.error || "Logout failed!");
      }
    } catch (err) {
      try {
        await logOut();
      } catch (e) {
        console.log("Local signOut failed after error:", e);
      }
      console.log("Logout error:", err);
      toast.error("Logout failed!");
    } finally {
      setLogoutLoading(false);
    }
  }

  return (
    <aside
      className="hidden md:flex md:flex-col bg-background border-r border-foreground p-4"
      style={{ width }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">Projects</div>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-white text-sm font-medium shadow-md border border-foreground hover:scale-[1.02] transition-transform active:scale-100"
          onClick={(e) => {
            e.preventDefault();
            setShowNewModal(true);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>New Project</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <span>Loading projects...</span>
          </div>
        ) : error ? (
          <div className="text-sm text-red-400 px-2">{error}</div>
        ) : (
          <ProjectList
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
          />
        )}
      </div>

      <NewProjectModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreate={handleCreateProject}
      />

      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={handleLogout}
          disabled={logoutLoading}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium shadow-md border"
          style={{
            color: "var(--color-foreground)",
            borderColor: "var(--color-foreground)",
            opacity: logoutLoading ? 0.8 : 1,
            cursor: logoutLoading ? "not-allowed" : "pointer",
          }}
        >
          {logoutLoading ? <span>Logging out...</span> : <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
