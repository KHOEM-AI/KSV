/**
 * KSV API — Reporting & Export Domain
 * Location: khoem-now/API/reporting-export.ts
 *
 * Formatted business reports (compliance, device health, billing
 * summary) — distinct from audit.ts's raw log export. Every report
 * respects the same permission boundaries as the underlying data.
 */

// ============================================================
// Types
// ============================================================

export type ReportCategory = "compliance" | "device_health" | "billing" | "security";
export type ReportFormat = "pdf" | "csv" | "xlsx";
export type ReportFrequency = "daily" | "weekly" | "monthly";

export interface ReportTemplate {
  templateId: string;
  name: string;
  category: ReportCategory;
  fields: string[];
}

export interface ScheduledReport {
  scheduleId: string;
  templateId: string;
  organizationId: string;
  frequency: ReportFrequency;
  recipients: string[]; // account IDs or emails
  isEnabled: boolean;
}

export interface ReportInstance {
  instanceId: string;
  templateId: string;
  generatedAt: string;
  format: ReportFormat;
  fileId: string; // references file-storage.ts StoredFile
}

export interface ExportJob {
  jobId: string;
  dataScope: string; // e.g. "devices", "audit_logs", "commands"
  status: "pending" | "running" | "completed" | "failed";
  requestedBy: string; // accountId
  createdAt: string;
}

// ============================================================
// Routes
// ============================================================

export const REPORTING_ROUTES = {
  LIST_TEMPLATES: { method: "GET", path: "/api/v1/reports/templates" },
  GENERATE: { method: "POST", path: "/api/v1/reports/generate" },
  SCHEDULE: { method: "POST", path: "/api/v1/reports/schedule" },
  LIST_SCHEDULED: { method: "GET", path: "/api/v1/reports/scheduled" },
  CANCEL_SCHEDULE: { method: "DELETE", path: "/api/v1/reports/scheduled/:id" },
  DOWNLOAD_INSTANCE: { method: "GET", path: "/api/v1/reports/instances/:id/download" },
  START_EXPORT_JOB: { method: "POST", path: "/api/v1/export/jobs" },
  GET_EXPORT_JOB: { method: "GET", path: "/api/v1/export/jobs/:id" },
} as const;

// ============================================================
// Security Rules
// ============================================================

export const REPORTING_SECURITY_RULES = [
  "REPORT_GENERATION_RESPECTS_UNDERLYING_DATA_PERMISSIONS",
  "COMPLIANCE_REPORTS_REQUIRE_COMPLIANCE_ADMIN_OR_ORG_ADMIN",
  "GENERATED_REPORTS_STORED_WITH_ACCESS_GRANT", // ties to file-storage.ts
  "LARGE_EXPORTS_RUN_ASYNC_TO_AVOID_TIMEOUT", // >10,000 records
] as const;

// ============================================================
// Audit Events
// ============================================================

export enum ReportingAuditEvent {
  REPORT_GENERATED = "report.generated",
  REPORT_SCHEDULED = "report.scheduled",
  SCHEDULE_CANCELLED = "report.schedule_cancelled",
  EXPORT_JOB_STARTED = "export.job_started",
  EXPORT_JOB_COMPLETED = "export.job_completed",
}
