/**
 * KSV API — Geolocation & Map Domain
 * Location: khoem-now/API/geolocation-map.ts
 *
 * Site/device location and geo-fence definitions. Per Security Core
 * principle (see security.ts): GPS is a CONTEXT SIGNAL only, never a
 * primary authentication or authorization mechanism on its own.
 */

// ============================================================
// Types
// ============================================================

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  recordedAt: string;
}

export interface SiteMapPin {
  targetType: "site" | "device";
  targetId: string;
  location: GeoLocation;
  floorLevel?: number;
}

export interface GeoFencePoint {
  latitude: number;
  longitude: number;
}

export type GeoFenceTarget =
  | { type: "deviceIds"; deviceIds: string[] }
  | { type: "category"; category: string };

export interface GeoFence {
  fenceId: string;
  organizationId: string;
  name: string;
  polygon: GeoFencePoint[];
  appliesTo: GeoFenceTarget;
  isEnabled: boolean;
}

export type GeoFenceEventType = "entered" | "exited";

export interface GeoFenceEvent {
  eventId: string;
  deviceId: string;
  fenceId: string;
  eventType: GeoFenceEventType;
  occurredAt: string;
}

export interface VehicleTrackingSession {
  sessionId: string;
  deviceId: string;
  routePoints: GeoLocation[];
  startedAt: string;
  endedAt?: string;
}

// ============================================================
// Routes
// ============================================================

export const GEO_ROUTES = {
  SITE_MAP: { method: "GET", path: "/api/v1/geo/sites/:id/map" },
  CREATE_FENCE: { method: "POST", path: "/api/v1/geo/fences" },
  LIST_FENCES: { method: "GET", path: "/api/v1/geo/fences" },
  UPDATE_FENCE: { method: "PUT", path: "/api/v1/geo/fences/:id" },
  DELETE_FENCE: { method: "DELETE", path: "/api/v1/geo/fences/:id" },
  REPORT_LOCATION: { method: "POST", path: "/api/v1/geo/devices/:id/location" },
  LOCATION_HISTORY: { method: "GET", path: "/api/v1/geo/devices/:id/location/history" },
  FENCE_EVENTS: { method: "GET", path: "/api/v1/geo/fences/:id/events" },
  VEHICLE_TRACKING: { method: "GET", path: "/api/v1/geo/vehicles/:id/tracking" },
} as const;

// ============================================================
// Security Rules
// ============================================================

export const GEO_SECURITY_RULES = [
  "GPS_IS_A_CONTEXT_SIGNAL_NEVER_PRIMARY_AUTH", // must combine with Identity + Credentials + Policy
  "FENCE_EVENTS_FORWARDED_TO_SAFETY_ENGINE", // e.g. "Vehicle Immobilize Outside Geo-Fence" in safety.ts
  "LOCATION_REPORTING_REQUIRES_DEVICE_AUTHENTICATION",
  "LOCATION_HISTORY_RETENTION_POLICY_ENFORCED", // location is sensitive personal/operational data
  "FENCE_BOUNDARY_EDITS_ALWAYS_AUDITED", // directly affects a safety rule
] as const;

// ============================================================
// Audit Events
// ============================================================

export enum GeoAuditEvent {
  GEOFENCE_CREATED = "geofence.created",
  GEOFENCE_UPDATED = "geofence.updated",
  GEOFENCE_DELETED = "geofence.deleted",
  GEOFENCE_ENTERED = "geofence.entered",
  GEOFENCE_EXITED = "geofence.exited",
  LOCATION_HISTORY_EXPORTED = "location.history_exported",
}
