import React, { useEffect, useState } from "react";
import ProjectList from "./ProjectList";

function Sidebar({
  width,
  projects: initialProjects = null,
  selectedProjectId,
  setSelectedProjectId,
}) {
  const [projects, setProjects] = useState(initialProjects || []);
  const [loading, setLoading] = useState(!initialProjects); // only show loader if we need to fetch
  const [error, setError] = useState(null);

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
          credentials: "include", // send session cookie
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || "Failed to fetch projects");
        }

        const mapped = (data.projects || []).map((p) => ({
          id: p._id,
          name: p.name,
          chats: [], // leave empty; chat messages handled separately
        }));

        if (!mounted) return;

        setProjects(mapped);

        // auto-select first project if none selected
        if (!selectedProjectId && mapped.length > 0) {
          setSelectedProjectId(mapped[0].id);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || "Error fetching projects");
        setProjects([]);
        // clear selection on error
        setSelectedProjectId(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchProjects();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProjects]); // run once (or if initialProjects changes)

  // keep projects in sync if parent updates initialProjects later
  useEffect(() => {
    if (initialProjects) setProjects(initialProjects);
  }, [initialProjects]);

  return (
    <aside
      className="hidden md:flex md:flex-col bg-background border-r border-foreground p-4"
      style={{ width }}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">Projects</div>

          {/* New Project button (beautiful, no-op) */}
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-white text-sm font-medium shadow-md border border-foreground hover:scale-[1.02] transition-transform active:scale-100"
            aria-label="Create new project (not implemented)"
            onClick={(e) => {
              e.preventDefault();
              // no-op for now; reserved for future behavior
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
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <svg
              className="w-6 h-6 animate-spin text-muted"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
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
    </aside>
  );
}

export default Sidebar;
