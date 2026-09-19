/**
 * KSV — Shared Constants
 * Location: khoem-now/src/lib/constants.ts
 *
 * Single source of truth for values used across multiple views/hooks,
 * so a typo in a command type string doesn't silently fail in one
 * component but not another.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

// Mirrors the commandType strings the backend (safety.engine.ts,
// command.routes.ts) expects. Import these instead of typing raw
// strings in each view.
export const COMMAND_TYPES = {
  LOCK: "LOCK",
  UNLOCK: "UNLOCK",
  OPEN: "OPEN",
  CLOSE: "CLOSE",
  RESET: "RESET",
  SETPOINT: "SETPOINT",
  SPEED_LIMIT: "SPEED_LIMIT",
  START: "START",
  STOP: "STOP",
  IMMOBILIZE: "IMMOBILIZE",
  RELEASE: "RELEASE",
} as const;

export type CommandType = (typeof COMMAND_TYPES)[keyof typeof COMMAND_TYPES];

// Mirrors DeviceCategory across device.ts / models.ts
export const DEVICE_CATEGORIES = {
  ACCESS: "access",
  CLIMATE: "climate",
  INDUSTRIAL: "industrial",
  VEHICLE: "vehicle",
  SENSOR: "sensor",
  NETWORK: "network",
} as const;

export const DEVICE_STATUS = {
  ONLINE: "online",
  OFFLINE: "offline",
  WARNING: "warning",
  MAINTENANCE: "maintenance",
} as const;

// Matches ROLE_RANK in rbac.policy.ts / auth.ts
export const ROLES = {
  GUEST: "Guest",
  VIEWER: "Viewer",
  CONTROLLER: "Controller",
  OPERATOR: "Operator",
  MANAGER: "Manager",
  ORG_ADMIN: "OrgAdmin",
  SUPER_ADMIN: "SuperAdmin",
  OWNER: "Owner",
} as const;

// How often the dashboard/controls page should poll for fresh device
// status if not using a live socket connection.
export const POLL_INTERVAL_MS = 5000;
