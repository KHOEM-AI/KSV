/**
 * KSV — Frontend API Client
 * Location: khoem-now/src/lib/api.ts
 *
 * The single place the frontend talks to the backend. ControlsView.tsx
 * (and every other view) should import from here instead of using
 * local useState toggles that don't persist or audit anything.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

function getAccessToken(): string | null {
  // Wherever the app stores the JWT after login — adjust if your
  // auth flow keeps it somewhere else (context, cookie, etc).
  return localStorage.getItem("ksv_access_token");
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    // Surface the backend's error shape (SAFETY_BLOCKED, RATE_LIMITED, etc.)
    // so the UI can show a real, specific message instead of "something
    // went wrong".
    throw new ApiError(res.status, body?.error ?? "UNKNOWN_ERROR", body?.message ?? res.statusText, body);
  }

  return body as T;
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// ============================================================
// Command endpoints — mirrors command.routes.ts exactly
// ============================================================

export interface DispatchCommandInput {
  deviceId: string;
  type: string; // "UNLOCK", "LOCK", "SETPOINT", "SPEED_LIMIT", "RESET", "OPEN", ...
  payload?: Record<string, unknown>;
  signals?: {
    isInsideGeoFence?: boolean;
    humanZoneOccupied?: boolean;
    tamperDetected?: boolean;
    currentSpeed?: number;
    doorForceLockActive?: boolean;
  };
}

export interface DispatchCommandResult {
  commandId: string;
  deviceId: string;
  type: string;
  status: "pending";
}

export async function dispatchCommand(input: DispatchCommandInput): Promise<DispatchCommandResult> {
  return apiFetch<DispatchCommandResult>(`/devices/${input.deviceId}/commands`, {
    method: "POST",
    body: JSON.stringify({ type: input.type, payload: input.payload, signals: input.signals }),
  });
}

export interface CommandHistoryEntry {
  _id: string;
  deviceId: string;
  userId: string;
  type: string;
  status: string;
  createdAt: string;
}

export async function getDeviceCommandHistory(deviceId: string, limit = 10): Promise<{ commands: CommandHistoryEntry[] }> {
  return apiFetch(`/devices/${deviceId}/commands?limit=${limit}`);
}

export async function getCommandStatus(commandId: string): Promise<CommandHistoryEntry> {
  return apiFetch(`/commands/${commandId}`);
}
