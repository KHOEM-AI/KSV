import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  durationMs?: number;
  label?: string;
  doneLabel?: string;
  disabled?: boolean;
  variant?: "light" | "dark";
  hint?: string;
  height?: number;
  fontSize?: number;
  onComplete: () => void;
}

const GRADIENT =
  "linear-gradient(90deg,#ef4444 0%,#38bdf8 50%,#22c55e 100%)";
const DARK_GRADIENT =
  "linear-gradient(90deg,#b91c1c 0%,#0284c7 50%,#15803d 100%)";

export default function HoldToUnlock({
  durationMs = 10000,
  label = "Hold to unlock",
  doneLabel = "Unlocked ✓",
  disabled = false,
  variant = "light",
  hint,
  height = 76,
  fontSize = 18,
  onComplete,
}: Props) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);

  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    startRef.current = null;
  }, []);

  const tick = useCallback(
    (now: number) => {
      if (startRef.current === null) return;

      const p = Math.min(1, (now - startRef.current) / durationMs);
      setProgress(p);

      if (p >= 1) {
        if (!doneRef.current) {
          doneRef.current = true;
          setDone(true);
          setHolding(false);
          stop();
          onCompleteRef.current();
        }
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [durationMs, stop]
  );

  const begin = useCallback(() => {
    if (disabled || doneRef.current || startRef.current !== null) return;

    setHolding(true);
    startRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  }, [disabled, tick]);

  const cancel = useCallback(() => {
    if (doneRef.current) return;

    setHolding(false);
    stop();
    setProgress(0);
  }, [stop]);

  useEffect(() => () => stop(), [stop]);

  const pct = Math.round(progress * 100);
  const secondsLeft = Math.ceil((1 - progress) * (durationMs / 1000));
  const dark = variant === "dark";
  const track = dark ? "#172033" : "#e5e7eb";

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-disabled={disabled}
      aria-valuenow={pct}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        begin();
      }}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          begin();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") cancel();
      }}
      onBlur={cancel}
      style={{
        position: "relative",
        height,
        borderRadius: dark ? 20 : 16,
        overflow: "hidden",
        background: track,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        touchAction: "none",
        transform: dark ? (holding ? "translateY(5px)" : "translateY(0)") : holding ? "scale(0.985)" : "scale(1)",
        transition: "transform 120ms ease, box-shadow 120ms ease",
        border: dark ? "1px solid rgba(148,163,184,0.22)" : undefined,
        boxShadow: dark
          ? holding
            ? "0 1px 0 #05080f, 0 4px 10px rgba(0,0,0,0.5), 0 0 0 3px rgba(56,189,248,0.4)"
            : "0 6px 0 #05080f, 0 16px 28px rgba(0,0,0,0.55), 0 0 22px rgba(56,189,248,0.12)"
          : holding
            ? "0 0 0 3px rgba(56,189,248,0.45)"
            : "0 1px 3px rgba(0,0,0,0.15)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: done ? (dark ? "#15803d" : "#22c55e") : dark ? DARK_GRADIENT : GRADIENT,
          transition: "background 300ms ease",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 0,
          width: done ? "0%" : `${100 - progress * 100}%`,
          background: track,
        }}
      />

      {dark && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 55%)",
            pointerEvents: "none",
          }}
        />
      )}
      <div
        style={{
          position: "relative",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 4,
          fontWeight: 700,
          fontSize,
          color: done || progress > 0.5 ? "#ffffff" : dark ? "#e2e8f0" : "#0f172a",
          textShadow:
            done || progress > 0.5 ? "0 1px 3px rgba(0,0,0,0.45)" : "none",
        }}
      >
        {done ? (
          <span>{doneLabel}</span>
        ) : holding ? (
          <span>
            {pct}% · {secondsLeft}s left
          </span>
        ) : (
          <span>🔒 {label}</span>
        )}
        {hint && !done && (
          <span style={{ fontSize: Math.round(fontSize * 0.62), fontWeight: 500, opacity: 0.85 }}>
            {holding ? "Keep holding…" : hint}
          </span>
        )}
      </div>
    </div>
  );
}
