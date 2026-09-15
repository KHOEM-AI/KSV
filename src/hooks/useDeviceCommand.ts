/**
 * KSV — useDeviceCommand hook
 *
 * Command lifecycle:
 *   sending → pending → poll backend status → success / failed
 *
 * Important:
 *   HTTP 201 only means the command was accepted/created.
 *   UI success is shown only after the backend reports "success",
 *   which means the gateway/protocol layer received an ACK.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import {
  dispatchCommand,
  getCommandStatus,
  ApiError,
  type DispatchCommandInput,
  type DispatchCommandResult,
  type CommandHistoryEntry,
} from "../lib/api";

export type CommandUiState =
  | "idle"
  | "sending"
  | "pending"
  | "success"
  | "blocked"
  | "error";

const POLL_INTERVAL_MS = 750;
const POLL_TIMEOUT_MS = 20_000;
const SUCCESS_DISPLAY_MS = 1_500;

function getCommandErrorMessage(command: CommandHistoryEntry): string {
  const response = command.response;

  if (response && typeof response.message === "string") {
    return response.message;
  }

  return "Command failed.";
}

export function useDeviceCommand(deviceId: string) {
  const [state, setState] = useState<CommandUiState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    cancelledRef.current = false;

    return () => {
      cancelledRef.current = true;
      clearTimers();
    };
  }, [clearTimers]);

  const showSuccessThenIdle = useCallback(() => {
    if (cancelledRef.current) return;

    setState("success");
    setMessage(null);

    resetTimerRef.current = setTimeout(() => {
      if (cancelledRef.current) return;
      setState("idle");
      setMessage(null);
      resetTimerRef.current = null;
    }, SUCCESS_DISPLAY_MS);
  }, []);

  const pollUntilComplete = useCallback(
    async (commandId: string) => {
      const startedAt = Date.now();

      while (!cancelledRef.current) {
        if (Date.now() - startedAt >= POLL_TIMEOUT_MS) {
          setState("error");
          setMessage(
            "Command is still pending — no device ACK received within the timeout."
          );
          return null;
        }

        await new Promise<void>((resolve) => {
          pollTimerRef.current = setTimeout(() => {
            pollTimerRef.current = null;
            resolve();
          }, POLL_INTERVAL_MS);
        });

        if (cancelledRef.current) return null;

        try {
          const command = await getCommandStatus(commandId);

          if (cancelledRef.current) return null;

          if (command.status === "success") {
            showSuccessThenIdle();
            return command;
          }

          if (command.status === "failed") {
            setState("error");
            setMessage(getCommandErrorMessage(command));
            return null;
          }

          if (command.status === "blocked") {
            setState("blocked");
            setMessage(getCommandErrorMessage(command));
            return null;
          }

          setState("pending");
        } catch (err) {
          if (cancelledRef.current) return null;

          setState("error");
          setMessage(
            err instanceof Error
              ? err.message
              : "Failed to check command status."
          );
          return null;
        }
      }

      return null;
    },
    [showSuccessThenIdle]
  );

  const send = useCallback(
    async (
      type: string,
      payload?: DispatchCommandInput["payload"],
      signals?: DispatchCommandInput["signals"]
    ): Promise<DispatchCommandResult | null> => {
      clearTimers();

      cancelledRef.current = false;
      setState("sending");
      setMessage(null);

      try {
        const result = await dispatchCommand({
          deviceId,
          type,
          payload,
          signals,
        });

        if (cancelledRef.current) return null;

        if (result.status === "success") {
          showSuccessThenIdle();
          return result;
        }

        if (result.status === "failed") {
          setState("error");

          const command = result.command;
          setMessage(
            command
              ? getCommandErrorMessage(command)
              : "Command failed."
          );

          return null;
        }

        if (result.status === "blocked") {
          setState("blocked");

          const command = result.command;
          setMessage(
            command
              ? getCommandErrorMessage(command)
              : "Command was blocked."
          );

          return null;
        }

        setState("pending");

        await pollUntilComplete(result.commandId);

        return result;
      } catch (err) {
        if (cancelledRef.current) return null;

        if (err instanceof ApiError && err.code === "SAFETY_BLOCKED") {
          setState("blocked");
          setMessage(err.message);
        } else if (
          err instanceof ApiError &&
          err.code === "RATE_LIMITED"
        ) {
          setState("blocked");
          setMessage("សូមរង់ចាំបន្តិច — ចេញ command លឿនពេក");
        } else {
          setState("error");
          setMessage(
            err instanceof Error ? err.message : "Command failed"
          );
        }

        return null;
      }
    },
    [clearTimers, deviceId, pollUntilComplete, showSuccessThenIdle]
  );

  return {
    send,
    state,
    message,
    isSending: state === "sending" || state === "pending",
  };
}
