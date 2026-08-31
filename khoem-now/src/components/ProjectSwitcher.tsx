import { useState, useRef, useEffect } from "react";
import { Grid3x3, ChevronDown } from "lucide-react";

type ProjectKey = "AI" | "KI" | "CAI" | "KSV";

interface ProjectInfo {
  label: string;
  url: string;
}

const PROJECTS: Record<ProjectKey, ProjectInfo> = {
  AI: { label: "AI", url: "http://localhost:3000" },
  KI: { label: "KI", url: "http://localhost:4000" },
  CAI: { label: "CAI", url: "http://localhost:5174" },
  KSV: { label: "KSV", url: "http://localhost:5173" },
};

const ORDER: ProjectKey[] = ["AI", "KI", "CAI", "KSV"];

interface ProjectSwitcherProps {
  current: ProjectKey;
}

export function ProjectSwitcher({ current }: ProjectSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const others = ORDER.filter((key) => key !== current);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Switch project"
        className="flex h-9 items-center gap-1.5 rounded-xl border border-ink-700 bg-ink-850/60 px-2.5 text-ink-300 transition-colors hover:text-white"
      >
        <Grid3x3 size={16} />
        <span className="hidden text-xs font-semibold sm:inline">{current}</span>
        <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-40 w-36 overflow-hidden rounded-xl border border-ink-700 bg-ink-900 shadow-xl">
          {others.map((key) => (
            <a
              key={key}
              href={PROJECTS[key].url}
              className="block px-3 py-2.5 text-sm text-ink-200 transition-colors hover:bg-ink-800 hover:text-white"
            >
              {PROJECTS[key].label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
