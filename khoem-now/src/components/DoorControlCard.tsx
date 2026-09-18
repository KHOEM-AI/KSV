/**
 * KSV — Example: North Vault Door card wired to the REAL backend
 * This is a reference pattern — copy this shape into each card inside
 * ControlsView.tsx (Cleanroom HVAC, Robot Arm, East Gate Barrier, Cold
 * Storage Monitor, Press Line 7 E-Stop) replacing their local useState
 * toggles with useDeviceCommand() calls the same way.
 */

import { useState } from "react";
import { useDeviceCommand } from "../hooks/useDeviceCommand";

interface DoorControlCardProps {
  deviceId: string; // e.g. real MongoDB _id for DEV-04821
  deviceName: string;
  location: string;
  initialLocked?: boolean;
}

export function DoorControlCard({ deviceId, deviceName, location, initialLocked = false }: DoorControlCardProps) {
  const [locked, setLocked] = useState(initialLocked);
  const { send, state, message, isSending } = useDeviceCommand(deviceId);

  async function handleToggle() {
    const nextType = locked ? "UNLOCK" : "LOCK";
    const result = await send(nextType);

    // Only flip the UI state if the backend actually accepted the
    // command — never optimistically update before the safety check
    // and audit log confirm it went through.
    if (result) {
      setLocked(!locked);
    }
  }

  return (
    <div className="rounded-2xl border border-ink-700/70 bg-ink-900/60 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">{deviceName}</p>
          <p className="text-xs text-ink-400">{location}</p>
        </div>
        <span className={`h-2 w-2 rounded-full ${locked ? "bg-danger-500" : "bg-success-500"}`} />
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <div
          className={`flex h-24 w-24 items-center justify-center rounded-full border-2 ${
            locked ? "border-success-500/40 bg-success-500/10" : "border-danger-500/40 bg-danger-500/10"
          }`}
        >
          {/* Swap for real lock/unlock icon */}
          <span className={locked ? "text-success-400" : "text-danger-400"}>
            {locked ? "🔒" : "🔓"}
          </span>
        </div>
        <p className={`text-sm font-medium ${locked ? "text-success-400" : "text-danger-400"}`}>
          {locked ? "LOCKED" : "UNLOCKED"}
        </p>
      </div>

      <button
        onClick={handleToggle}
        disabled={isSending}
        className={`mt-4 w-full rounded-xl py-2.5 text-sm font-semibold transition-colors ${
          isSending
            ? "cursor-not-allowed bg-ink-700 text-ink-400"
            : locked
            ? "bg-brand-500 text-white hover:bg-brand-600"
            : "bg-ink-800 text-white hover:bg-ink-700 border border-ink-600"
        }`}
      >
        {isSending ? "កំពុងផ្ញើ..." : locked ? "Unlock" : "Lock"}
      </button>

      {/* Real-time feedback from the Safety Engine / rate-limiter —
          this is new: the mockup version had no way to show this. */}
      {state === "blocked" && (
        <p className="mt-2 rounded-lg bg-danger-500/10 px-3 py-2 text-xs text-danger-400">
          ⚠️ {message}
        </p>
      )}
      {state === "error" && (
        <p className="mt-2 rounded-lg bg-ink-700 px-3 py-2 text-xs text-ink-300">
          បញ្ហា: {message}
        </p>
      )}
    </div>
  );
}
