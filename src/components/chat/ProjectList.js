import React from "react";

function ProjectList({ projects, selectedProjectId, onSelectProject }) {
  return (
    <div className="space-y-2">
      {projects.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelectProject(p.id)}
          className={`w-full text-left px-3 py-2 rounded-md text-sm border ${
            selectedProjectId === p.id
              ? "bg-gray-700 border-gray-600"
              : "hover:bg-gray-800 border-transparent"
          }`}
        >
          {p.name}
        </button>
      ))}
    </div>
  );
}

export default ProjectList;
