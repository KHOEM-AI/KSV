/**
 * KSV — useDeviceCommand hook
 * Location: khoem-now/src/hooks/useDeviceCommand.ts
 *
 * Wraps dispatchCommand() with the loading/error/blocked state every
 * control card needs, so ControlsView.tsx doesn't repeat this logic
 * six times (once per card).
 */

import { useState, useCallback } from "react";
import { dispatchCommand, ApiError, type DispatchCommandInput } from "../lib/api";

export type CommandUiState = "idle" | "sending" | "success" | "blocked" | "error";

export function useDeviceCommand(deviceId: string) {
  const [state, setState] = useState<CommandUiState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const send = useCallback(
    async (type: string, payload?: DispatchCommandInput["payload"], signals?: DispatchCommandInput["signals"]) => {
      setState("sending");
      setMessage(null);

      try {
        const result = await dispatchCommand({ deviceId, type, payload, signals });
        setState("success");
        // Reset back to idle after a moment so the button returns to normal.
        setTimeout(() => setState("idle"), 1500);
        return result;
      } catch (err) {
        if (err instanceof ApiError && err.code === "SAFETY_BLOCKED") {
          setState("blocked");
          setMessage(err.message); // e.g. "Door is force-locked due to a detected tamper event."
        } else if (err instanceof ApiError && err.code === "RATE_LIMITED") {
          setState("blocked");
          setMessage("សូមរង់ចាំបន្តិច — ចេញ command លឿនពេក");
        } else {
          setState("error");
          setMessage(err instanceof Error ? err.message : "Command failed");
        }
        return null;
      }
    },
    [deviceId]
  );

  return { send, state, message, isSending: state === "sending" };
}
