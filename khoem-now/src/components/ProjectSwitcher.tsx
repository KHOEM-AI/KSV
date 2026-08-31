import React from "react";

type ProjectKey = "AI" | "KI" | "CAI" | "KSV";

interface ProjectInfo {
  label: string;
  url: string;
  bg: string;
  text: string;
}

const PROJECTS: Record<ProjectKey, ProjectInfo> = {
  AI: { label: "AI", url: "http://localhost:3000", bg: "#5DCAA5", text: "#04342C" },
  KI: { label: "KI", url: "http://localhost:4000", bg: "#AFA9EC", text: "#26215C" },
  CAI: { label: "CAI", url: "http://localhost:5174", bg: "#F0997B", text: "#4A1B0C" },
  KSV: { label: "KSV", url: "http://localhost:5173", bg: "#85B7EB", text: "#042C53" },
};

const ORDER: ProjectKey[] = ["AI", "KI", "CAI", "KSV"];

interface ProjectSwitcherProps {
  current: ProjectKey;
}

export function ProjectSwitcher({ current }: ProjectSwitcherProps) {
  const others = ORDER.filter((key) => key !== current);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 50,
        display: "flex",
        gap: 10,
        padding: 8,
        background: "rgba(20, 20, 24, 0.85)",
        backdropFilter: "blur(8px)",
        borderRadius: 16,
        boxShadow: "0 8px 24px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.25)",
      }}
    >
      {others.map((key) => {
        const project = PROJECTS[key];
        return (
          <a
            key={key}
            href={project.url}
            style={{
              flex: 1,
              height: 48,
              borderRadius: 12,
              background: project.bg,
              color: project.text,
              border: "none",
              fontSize: 13,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            {project.label}
          </a>
        );
      })}
    </div>
  );
}
