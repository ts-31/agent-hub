import React from "react";
import ProjectList from "./ProjectList";

function Sidebar({ width, projects, selectedProjectId, setSelectedProjectId }) {
  return (
    <aside
      className="hidden md:flex md:flex-col bg-background border-r border-gray-700 p-4"
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
        <ProjectList
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
        />
      </div>
    </aside>
  );
}

export default Sidebar;
