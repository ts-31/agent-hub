import React from "react";
import ProjectList from "./ProjectList";

function Sidebar({ width, projects, selectedProjectId, setSelectedProjectId }) {
  return (
    <aside
      className="hidden md:flex md:flex-col bg-background border-r border-gray-700 p-4"
      style={{ width }}
    >
      <div className="text-sm font-semibold mb-4">Projects</div>
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
