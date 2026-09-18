/**
 * KSV API — Analytics & Telemetry Domain
 * Location: khoem-now/API/analytics-telemetry.ts
 *
 * Operational metrics (CPU, temperature, throughput, uptime) — distinct
 * from audit.ts, which records security-relevant WHO/WHAT/WHEN events.
 * Telemetry is about device/platform HEALTH, not authorization history.
 */

// ============================================================
// Types
// ============================================================

export interface DeviceTelemetry {
  deviceId: string;
  metricName: string; // e.g. "cpu_usage", "temperature_c", "signal_strength"
  value: number;
  unit: string;
  recordedAt: string;
}

export interface PlatformMetric {
  metricName: string; // e.g. "connectedDevices", "commandsPerMin"
  value: number;
  timestamp: string;
}

export interface MetricAggregation {
  metricName: string;
  period: "hourly" | "daily" | "monthly";
  avg: number;
  min: number;
  max: number;
  p95: number;
}

export interface AnomalyDetectionResult {
  metricName: string;
  deviceId?: string;
  expectedRangeMin: number;
  expectedRangeMax: number;
  actualValue: number;
  isAnomaly: boolean;
  detectedAt: string;
}

export interface AnalyticsDashboard {
  dashboardId: string;
  organizationId: string;
  name: string;
  widgets: { widgetId: string; metricName: string; chartType: "line" | "bar" | "gauge" }[];
  refreshIntervalSec: number;
}

// ============================================================
// Routes
// ============================================================

export const TELEMETRY_ROUTES = {
  INGEST: { method: "POST", path: "/api/v1/telemetry/ingest" },
  DEVICE_HISTORY: { method: "GET", path: "/api/v1/telemetry/devices/:id" },
  PLATFORM_METRICS: { method: "GET", path: "/api/v1/telemetry/platform" },
  AGGREGATE: { method: "GET", path: "/api/v1/telemetry/aggregate" },
  ANOMALIES: { method: "GET", path: "/api/v1/telemetry/anomalies" },
  CREATE_DASHBOARD: { method: "POST", path: "/api/v1/telemetry/dashboards" },
  GET_DASHBOARD: { method: "GET", path: "/api/v1/telemetry/dashboards/:id" },
} as const;

// ============================================================
// Security Rules
// ============================================================

export const TELEMETRY_SECURITY_RULES = [
  "TELEMETRY_IS_NOT_AN_AUDIT_LOG_SUBSTITUTE", // security events still go through audit.ts
  "INGESTION_REQUIRES_DEVICE_AUTHENTICATION", // device key, not an open endpoint
  "ANOMALY_DETECTION_ONLY_ALERTS_NEVER_AUTO_ACTS", // auto-react belongs to automation.ts + safety.ts
  "RAW_TELEMETRY_RETENTION_90_DAYS_DEFAULT",
] as const;

// ============================================================
// Audit Events
// ============================================================

export enum TelemetryAuditEvent {
  INGESTION_FAILED = "telemetry.ingestion_failed",
  DASHBOARD_CREATED = "telemetry.dashboard_created",
  ANOMALY_DETECTED = "telemetry.anomaly_detected",
  EXPORT_REQUESTED = "telemetry.export_requested",
}
