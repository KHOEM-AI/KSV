/**
 * KSV — Realtime Connection
 * Location: khoem-now/src/lib/websocket.ts
 *
 * Optional live layer for device status / command result updates —
 * matches the "Live" badge and animated Platform Traffic chart seen
 * on DashboardView. Falls back gracefully: if no WebSocket server is
 * running yet, callers should keep using POLL_INTERVAL_MS from
 * constants.ts instead.
 */

import { getAccessToken } from "./auth";

type MessageHandler = (data: unknown) => void;

let socket: WebSocket | null = null;
const handlers = new Map<string, Set<MessageHandler>>();

function getWsUrl(): string {
  const base = import.meta.env.VITE_WS_URL || "ws://localhost:3000/ws";
  const token = getAccessToken();
  return token ? `${base}?token=${encodeURIComponent(token)}` : base;
}

export function connectRealtime(): void {
  if (socket && socket.readyState === WebSocket.OPEN) return;

  try {
    socket = new WebSocket(getWsUrl());

    socket.onmessage = (event) => {
      let parsed: { type: string; payload: unknown };
      try {
        parsed = JSON.parse(event.data);
      } catch {
        return;
      }
      handlers.get(parsed.type)?.forEach((fn) => fn(parsed.payload));
    };

    socket.onclose = () => {
      // Simple reconnect after a delay — real production code would
      // want backoff, but this keeps the dashboard self-healing.
      setTimeout(connectRealtime, 5000);
    };

    socket.onerror = () => {
      socket?.close();
    };
  } catch {
    // No WebSocket server available yet — views using this should
    // fall back to polling via constants.ts POLL_INTERVAL_MS.
  }
}

export function disconnectRealtime(): void {
  socket?.close();
  socket = null;
}

/**
 * Subscribe to a message type, e.g. "device.status_changed" or
 * "command.result". Returns an unsubscribe function for cleanup in
 * a useEffect.
 */
export function onRealtimeEvent(type: string, handler: MessageHandler): () => void {
  if (!handlers.has(type)) handlers.set(type, new Set());
  handlers.get(type)!.add(handler);

  return () => {
    handlers.get(type)?.delete(handler);
  };
}
