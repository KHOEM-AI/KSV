// src/components/PatternLock.tsx
// 3x3 pattern pad. Press and drag across the dots (numbered 1..9, left→right,
// top→bottom), lift the finger to finish. Works with touch, pen and mouse.
import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

type Props = {
  /** Called when the finger lifts. Dot numbers 1..9 in drawing order. */
  onComplete: (pattern: number[]) => void;
  disabled?: boolean;
  /** Line turns red. */
  error?: boolean;
  /** Line turns green. */
  success?: boolean;
  /** Pad width/height in px. */
  size?: number;
};

type Point = { x: number; y: number };

/** Dot that lies exactly between a and b (e.g. 1→3 passes 2), else null. */
function between(a: number, b: number): number | null {
  const ra = Math.floor(a / 3);
  const ca = a % 3;
  const rb = Math.floor(b / 3);
  const cb = b % 3;
  const dr = Math.abs(ra - rb);
  const dc = Math.abs(ca - cb);
  if ((dr === 2 || dc === 2) && dr % 2 === 0 && dc % 2 === 0) {
    return ((ra + rb) / 2) * 3 + (ca + cb) / 2;
  }
  return null;
}

export function PatternLock({
  onComplete,
  disabled = false,
  error = false,
  success = false,
  size = 264,
}: Props) {
  const cell = size / 3;
  const hitRadius = cell * 0.36;

  const [path, setPath] = useState<number[]>([]);
  const [pointer, setPointer] = useState<Point | null>(null);
  const pathRef = useRef<number[]>([]);
  const drawing = useRef(false);
  const clearTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(clearTimer.current), []);

  const center = (i: number): Point => ({
    x: ((i % 3) + 0.5) * cell,
    y: (Math.floor(i / 3) + 0.5) * cell,
  });

  const setBoth = (next: number[]) => {
    pathRef.current = next;
    setPath(next);
  };

  const localPoint = (e: ReactPointerEvent<HTMLDivElement>): Point => {
    const r = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * size,
      y: ((e.clientY - r.top) / r.height) * size,
    };
  };

  const track = (p: Point) => {
    setPointer(p);
    for (let i = 0; i < 9; i++) {
      const c = center(i);
      if (Math.hypot(p.x - c.x, p.y - c.y) > hitRadius) continue;
      const cur = pathRef.current;
      if (cur.includes(i)) return;
      const next = [...cur];
      if (cur.length > 0) {
        const mid = between(cur[cur.length - 1], i);
        if (mid !== null && !next.includes(mid)) next.push(mid);
      }
      next.push(i);
      setBoth(next);
      return;
    }
  };

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    window.clearTimeout(clearTimer.current);
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    setBoth([]);
    track(localPoint(e));
  };

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drawing.current) return;
    track(localPoint(e));
  };

  const onUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    setPointer(null);
    const done = pathRef.current;
    if (done.length > 0) {
      onComplete(done.map((i) => i + 1));
      clearTimer.current = window.setTimeout(() => setBoth([]), 700);
    }
  };

  const onCancel = () => {
    drawing.current = false;
    setPointer(null);
    setBoth([]);
  };

  const color = error ? "#ef4444" : success ? "#22c55e" : "#38bdf8";
  const last = path.length > 0 ? center(path[path.length - 1]) : null;

  return (
    <div
      role="application"
      aria-label="Pattern lock, 9 dots"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onCancel}
      style={{
        width: size,
        height: size,
        position: "relative",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0 }}>
        {path.length > 1 && (
          <polyline
            points={path.map((i) => `${center(i).x},${center(i).y}`).join(" ")}
            fill="none"
            stroke={color}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.85}
          />
        )}
        {last && pointer && (
          <line
            x1={last.x}
            y1={last.y}
            x2={pointer.x}
            y2={pointer.y}
            stroke={color}
            strokeWidth={5}
            strokeLinecap="round"
            opacity={0.55}
          />
        )}
        {Array.from({ length: 9 }, (_, i) => {
          const c = center(i);
          const active = path.includes(i);
          return (
            <g key={i}>
              <circle
                cx={c.x}
                cy={c.y}
                r={cell * 0.26}
                fill={active ? color : "none"}
                fillOpacity={0.14}
                stroke={active ? color : "rgba(148,163,184,0.35)"}
                strokeWidth={active ? 2 : 1.5}
              />
              <circle
                cx={c.x}
                cy={c.y}
                r={active ? 8 : 6}
                fill={active ? color : "rgba(226,232,240,0.75)"}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
