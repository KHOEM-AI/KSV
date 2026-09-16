// =============================================================
// KSV — Audit API
// Domain: WHO did WHAT, to WHICH device, WHEN, WHERE, AUTHORIZED?, RESULT
// RULE: Passwords and secrets are NEVER stored in audit logs
// =============================================================

export type AuditCategory =
  | 'identity'
  | 'authentication'
  | 'authorization'
  | 'organization'
  | 'device'
  | 'discovery'
  | 'command'
  | 'automation'
  | 'safety'
  | 'security'
  | 'gateway'
  | 'protocol'
  | 'notification'
  | 'administration';

export type AuditResult = 'success' | 'failure' | 'denied' | 'error' | 'pending';

// ---------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------

export interface AuditRecord {
  auditId: string;
  category: AuditCategory;
  eventType: string;              // e.g. "command.issued", "auth.login.success"
  actorAccountId?: string;        // Who performed the action
  actorType: 'user' | 'admin' | 'system' | 'automation' | 'ai_layer' | 'gateway';
  targetType?: string;            // e.g. "device", "account", "organization"
  targetId?: string;
  action: string;                 // Human-readable description
  result: AuditResult;
  reason?: string;                // Reason for denial/failure
  ipAddress?: string;
  sessionId?: string;
  orgId?: string;
  siteId?: string;
  metadata?: Record<string, unknown>;  // NEVER includes passwords/secrets/tokens
  occurredAt: string;
  // Immutable — audit records cannot be edited or deleted through the API
}

export interface AuditQuery {
  category?: AuditCategory;
  eventType?: string;
  actorAccountId?: string;
  targetType?: string;
  targetId?: string;
  result?: AuditResult;
  orgId?: string;
  fromTime?: string;
  toTime?: string;
  limit?: number;
  offset?: number;
}

export interface AuditQueryResponse {
  records: AuditRecord[];
  total: number;
  limit: number;
  offset: number;
}

export interface AuditExportRequest {
  query: AuditQuery;
  format: 'csv' | 'json' | 'pdf';
  reason: string;                 // Compliance requests must state a reason
}

export interface AuditExportResponse {
  exportId: string;
  status: 'processing' | 'ready' | 'failed';
  downloadUrl?: string;
  expiresAt?: string;
}

export interface ComplianceReportRequest {
  orgId?: string;
  fromTime: string;
  toTime: string;
  reportType: 'access_summary' | 'device_control_summary' | 'security_events' | 'full';
}

export interface ComplianceReport {
  reportId: string;
  orgId?: string;
  period: { from: string; to: string };
  reportType: string;
  totalEvents: number;
  eventsByCategory: Record<AuditCategory, number>;
  securityIncidentCount: number;
  deniedAccessCount: number;
  generatedAt: string;
  downloadUrl?: string;
}

// ---------------------------------------------------------------
// API Route Definitions
// ---------------------------------------------------------------

export const AUDIT_ROUTES = {
  // Write (internal — called by all other API domains, never by end users directly)
  RECORD_EVENT:            'POST /api/v1/audit/events',           // Internal only

  // Query
  QUERY_AUDIT_LOG:         'GET  /api/v1/audit/events',
  GET_AUDIT_RECORD:        'GET  /api/v1/audit/events/:auditId',

  // Export / Compliance
  EXPORT_AUDIT_LOG:        'POST /api/v1/audit/export',
  GET_EXPORT_STATUS:       'GET  /api/v1/audit/export/:exportId',
  GENERATE_COMPLIANCE_REPORT: 'POST /api/v1/audit/compliance-report',
  LIST_COMPLIANCE_REPORTS: 'GET  /api/v1/audit/compliance-report',

  // Per-resource audit trail (convenience endpoints)
  DEVICE_AUDIT_TRAIL:      'GET  /api/v1/audit/devices/:deviceId',
  ACCOUNT_AUDIT_TRAIL:     'GET  /api/v1/audit/accounts/:accountId',
  ORG_AUDIT_TRAIL:         'GET  /api/v1/audit/orgs/:orgId',
} as const;

// ---------------------------------------------------------------
// Handler Interfaces
// ---------------------------------------------------------------

export interface AuditAPIHandlers {
  /**
   * Records an audit event. Called internally by every other API domain.
   * Not exposed for direct end-user calls.
   * Rejects any payload containing password/secret/token fields.
   */
  recordEvent(record: Omit<AuditRecord, 'auditId' | 'occurredAt'>): Promise<{ auditId: string }>;

  /**
   * Query the audit log with filters.
   * Requires "view_audit" permission on the relevant resource/org.
   */
  queryAuditLog(requestingAccountId: string, query: AuditQuery): Promise<AuditQueryResponse>;

  getAuditRecord(auditId: string, requestingAccountId: string): Promise<AuditRecord>;

  /**
   * Export audit records for compliance/legal purposes.
   * Requires a stated reason — itself logged as an audit event.
   */
  exportAuditLog(requestingAccountId: string, req: AuditExportRequest): Promise<AuditExportResponse>;
  getExportStatus(exportId: string, requestingAccountId: string): Promise<AuditExportResponse>;

  generateComplianceReport(
    requestingAccountId: string,
    req: ComplianceReportRequest
  ): Promise<ComplianceReport>;
  listComplianceReports(orgId: string, requestingAccountId: string): Promise<ComplianceReport[]>;

  getDeviceAuditTrail(deviceId: string, requestingAccountId: string): Promise<AuditRecord[]>;
  getAccountAuditTrail(accountId: string, requestingAccountId: string): Promise<AuditRecord[]>;
  getOrgAuditTrail(orgId: string, requestingAccountId: string): Promise<AuditRecord[]>;
}

// ---------------------------------------------------------------
// Security Rules
// ---------------------------------------------------------------

export const AUDIT_SECURITY_RULES = {
  /**
   * Passwords, tokens, API keys, and secrets are NEVER stored
   * in audit log metadata. The recordEvent handler strips/rejects
   * any field matching known secret patterns before persisting.
   */
  NO_SECRETS_IN_AUDIT_LOG: true,

  /** Audit records are immutable once written. No update or delete endpoint exists. */
  AUDIT_RECORDS_IMMUTABLE: true,

  /** Audit records are retained for at least this many days (compliance baseline). */
  MIN_RETENTION_DAYS: 365,

  /** Viewing another account's audit trail requires an explicit "view_audit" permission. */
  VIEW_AUDIT_REQUIRES_PERMISSION: true,

  /** Every audit export is itself logged as an audit event, with the requester and reason. */
  EXPORTS_ARE_SELF_AUDITED: true,
} as const;

// ---------------------------------------------------------------
// This domain generates NO further audit events about itself
// beyond what AUDIT_SECURITY_RULES.EXPORTS_ARE_SELF_AUDITED covers,
// to avoid infinite recursive logging loops.
// ---------------------------------------------------------------
export type AuditAuditEvent =
  | 'audit.export.requested'
  | 'audit.export.completed'
  | 'audit.compliance_report.generated'
  | 'audit.query.executed_by_admin';
