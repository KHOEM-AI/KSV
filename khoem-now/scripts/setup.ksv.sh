#!/data/data/com.termux/files/usr/bin/bash
set -e
cd ~
mkdir -p khoem-now
cd khoem-now

mkdir -p "API"
mkdir -p "APP"
mkdir -p "AUDIT"
mkdir -p "AUTH"
mkdir -p "AUTOMATION"
mkdir -p "COMMAND"
mkdir -p "CONFIG"
mkdir -p "DATABASE"
mkdir -p "DEVICES"
mkdir -p "DOCUMENTATION"
mkdir -p "GATEWAY"
mkdir -p "INTERNATIONAL"
mkdir -p "NOTIFICATION"
mkdir -p "ORGANIZATION"
mkdir -p "PROTOCOLS"
mkdir -p "SAFETY"
mkdir -p "SECURITY"
mkdir -p "TESTS"
mkdir -p "USERS"
mkdir -p "src"
mkdir -p "src/components"

cat << 'KSVEOF' > ".gitignore"
node_modules
dist
.env
*.log
KSVEOF

cat << 'KSVEOF' > "API/README.md"
# API — ច្រកចូល Backend

API មិនគួរជា endpoint ធំមួយឯកសារតែមួយទេ (មិនមែន master-api.ts)។
ត្រូវបែងជា Domain ដើម្បីឱ្យគ្រប់គ្រងបានងាយ ទោះ Project ធំឡើងកម្រិតណាក៏ដោយ។

## Domains
- Identity API
- Authentication API
- Account API
- Authorization API
- Organization API
- Device API
- Discovery API
- Pairing API
- Protocol API
- Gateway API
- Command API
- Automation API
- Safety API
- Security API
- Audit API
- Notification API
- International API
- Administration API
KSVEOF

cat << 'KSVEOF' > "API/account-recovery.ts"
// =============================================================
// KSV — Account Recovery API
// Domain: Forgot password, OTP, Identity-based recovery
// RULE: Recovery creates a NEW password — never reveals the old one
// =============================================================

export type RecoveryMethod = 'email' | 'phone' | 'identity_provider' | 'backup_code';
export type RecoveryStatus = 'pending' | 'otp_sent' | 'otp_verified' | 'completed' | 'expired' | 'cancelled';

// ---------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------

export interface RecoverySession {
  recoverySessionId: string;
  accountId?: string;           // May be unknown at start
  method: RecoveryMethod;
  status: RecoveryStatus;
  maskedDestination?: string;   // e.g. "k***@gmail.com" or "+855 *** 123"
  initiatedAt: string;
  expiresAt: string;
  attemptsUsed: number;
  maxAttempts: number;
  ipAddress?: string;
}

export interface BackupCode {
  codeIndex: number;
  isUsed: boolean;
  usedAt?: string;
}

// ---------------------------------------------------------------
// Request / Response Shapes
// ---------------------------------------------------------------

export interface InitiateRecoveryRequest {
  method: RecoveryMethod;
  email?: string;
  phone?: string;
  countryCode?: string;
  provider?: 'google' | 'facebook' | 'tiktok' | 'apple';
}

export interface InitiateRecoveryResponse {
  recoverySessionId: string;
  method: RecoveryMethod;
  maskedDestination?: string;
  expiresAt: string;
  message: string;
  // NEVER includes: account ID, any password, any secret
}

export interface VerifyRecoveryOTPRequest {
  recoverySessionId: string;
  otp: string;                  // 6-digit code — single use, time-limited
}

export interface VerifyRecoveryOTPResponse {
  success: boolean;
  recoveryToken?: string;       // Short-lived token to authorize password reset
  attemptsRemaining?: number;
  expiresAt?: string;
  message: string;
}

export interface VerifyRecoveryOAuthRequest {
  recoverySessionId: string;
  provider: string;
  providerToken: string;        // Token from provider — KSV validates with provider
}

export interface ResetPasswordRequest {
  recoveryToken: string;        // From VerifyRecoveryOTPResponse
  newPassword: string;          // Sent over TLS; hashed server-side; never stored plain
  confirmNewPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  allSessionsRevoked: boolean;  // All existing sessions are revoked after reset
  message: string;
  // NEVER reveals old password
}

export interface ResendOTPRequest {
  recoverySessionId: string;
}

export interface ResendOTPResponse {
  success: boolean;
  maskedDestination: string;
  newExpiresAt: string;
  message: string;
}

export interface CancelRecoveryRequest {
  recoverySessionId: string;
}

export interface GenerateBackupCodesResponse {
  codes: string[];              // Show ONCE — user must store them securely
  generatedAt: string;
  totalCodes: number;
}

export interface UseBackupCodeRequest {
  recoverySessionId: string;
  backupCode: string;
}

export interface BackupCodeStatusResponse {
  totalCodes: number;
  usedCodes: number;
  remainingCodes: number;
  codes: BackupCode[];
}

// ---------------------------------------------------------------
// API Route Definitions
// ---------------------------------------------------------------

export const ACCOUNT_RECOVERY_ROUTES = {
  // Recovery initiation
  INITIATE_RECOVERY:       'POST /api/v1/recovery/initiate',
  RESEND_OTP:              'POST /api/v1/recovery/otp/resend',

  // OTP / Provider verification
  VERIFY_OTP:              'POST /api/v1/recovery/otp/verify',
  VERIFY_PROVIDER:         'POST /api/v1/recovery/provider/verify',
  USE_BACKUP_CODE:         'POST /api/v1/recovery/backup-code/verify',

  // Password reset (requires valid recovery token)
  RESET_PASSWORD:          'POST /api/v1/recovery/password/reset',

  // Cancel
  CANCEL_RECOVERY:         'POST /api/v1/recovery/cancel',

  // Backup codes (authenticated user)
  GENERATE_BACKUP_CODES:   'POST /api/v1/recovery/backup-codes/generate',
  BACKUP_CODE_STATUS:      'GET  /api/v1/recovery/backup-codes/status',
  REVOKE_BACKUP_CODES:     'POST /api/v1/recovery/backup-codes/revoke',
} as const;

// ---------------------------------------------------------------
// Handler Interfaces
// ---------------------------------------------------------------

export interface AccountRecoveryAPIHandlers {
  /**
   * Begin recovery flow. Sends OTP to email or phone (masked).
   * Does NOT confirm whether an account exists for that email/phone
   * (prevents account enumeration).
   */
  initiateRecovery(
    req: InitiateRecoveryRequest,
    ipAddress: string
  ): Promise<InitiateRecoveryResponse>;

  /**
   * Re-send OTP for an active recovery session.
   * Subject to rate limiting.
   */
  resendOTP(req: ResendOTPRequest): Promise<ResendOTPResponse>;

  /**
   * Verify a 6-digit OTP code.
   * Code is single-use and time-limited.
   * Returns a short-lived recovery token on success.
   */
  verifyRecoveryOTP(req: VerifyRecoveryOTPRequest): Promise<VerifyRecoveryOTPResponse>;

  /**
   * Verify recovery via an OAuth/OIDC provider token.
   * KSV validates the token with the provider.
   */
  verifyRecoveryOAuth(
    req: VerifyRecoveryOAuthRequest
  ): Promise<VerifyRecoveryOTPResponse>;

  /**
   * Verify recovery using a one-time backup code.
   */
  useBackupCode(req: UseBackupCodeRequest): Promise<VerifyRecoveryOTPResponse>;

  /**
   * Reset the password using a valid recovery token.
   * After reset, ALL existing sessions are revoked.
   * The old password is NEVER returned or logged.
   */
  resetPassword(req: ResetPasswordRequest): Promise<ResetPasswordResponse>;

  /**
   * Cancel an in-progress recovery session.
   */
  cancelRecovery(req: CancelRecoveryRequest): Promise<{ success: boolean }>;

  /**
   * Generate a new set of backup codes (authenticated user only).
   * Previous codes are revoked.
   * Codes are shown ONCE — KSV stores only hashes.
   */
  generateBackupCodes(accountId: string): Promise<GenerateBackupCodesResponse>;

  /**
   * Get the status of backup codes (how many remain).
   * Does NOT return the code values themselves.
   */
  getBackupCodeStatus(accountId: string): Promise<BackupCodeStatusResponse>;

  /**
   * Revoke all backup codes (authenticated user only).
   */
  revokeBackupCodes(accountId: string): Promise<{ success: boolean }>;
}

// ---------------------------------------------------------------
// Security Rules
// ---------------------------------------------------------------

export const ACCOUNT_RECOVERY_SECURITY_RULES = {
  /** OTP codes expire after this many minutes. */
  OTP_EXPIRY_MINUTES: 10,

  /** OTP codes are single-use. */
  OTP_SINGLE_USE: true,

  /** Maximum OTP verification attempts per recovery session. */
  MAX_OTP_ATTEMPTS: 5,

  /** Maximum recovery sessions per IP per hour. */
  RATE_LIMIT_PER_IP_PER_HOUR: 3,

  /** Recovery token (after OTP verified) expires after this many minutes. */
  RECOVERY_TOKEN_EXPIRY_MINUTES: 15,

  /**
   * After password reset, ALL sessions are revoked.
   * This forces re-login on all devices.
   */
  REVOKE_ALL_SESSIONS_AFTER_RESET: true,

  /**
   * The old password is NEVER revealed — not in response, not in logs.
   * Recovery only creates a NEW password.
   */
  OLD_PASSWORD_NEVER_REVEALED: true,

  /**
   * Account existence is NOT confirmed from an email/phone lookup.
   * The API always returns the same response to prevent account enumeration.
   */
  PREVENT_ACCOUNT_ENUMERATION: true,

  /** Backup codes are stored as hashes — plain codes are never saved. */
  BACKUP_CODES_HASHED_ONLY: true,

  /** Number of backup codes generated per set. */
  BACKUP_CODE_COUNT: 10,
} as const;

// ---------------------------------------------------------------
// Audit Events
// ---------------------------------------------------------------

export type AccountRecoveryAuditEvent =
  | 'recovery.initiated'
  | 'recovery.otp_sent'
  | 'recovery.otp_verified'
  | 'recovery.otp_failed'
  | 'recovery.otp_expired'
  | 'recovery.provider_verified'
  | 'recovery.backup_code_used'
  | 'recovery.password_reset'
  | 'recovery.sessions_revoked'
  | 'recovery.cancelled'
  | 'recovery.backup_codes_generated'
  | 'recovery.backup_codes_revoked'
  | 'recovery.rate_limit_exceeded';
KSVEOF

cat << 'KSVEOF' > "API/administration.ts"
// =============================================================
// KSV — Administration API
// Domain: Platform administration console
// RULE: Admin manages STATE and OPERATIONS — never sees user secrets
// =============================================================

export type AdminRole = 'super_admin' | 'security_admin' | 'support_admin' | 'billing_admin' | 'compliance_admin';
export type SystemHealthStatus = 'healthy' | 'degraded' | 'partial_outage' | 'major_outage';

// ---------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------

export interface AdminUser {
  adminId: string;
  accountId: string;
  roles: AdminRole[];
  grantedBy: string;
  grantedAt: string;
  lastActionAt?: string;
  isActive: boolean;
  mfaRequired: true;              // Always true for admin accounts
}

export interface SystemHealthReport {
  status: SystemHealthStatus;
  services: Array<{
    name: string;
    status: SystemHealthStatus;
    latencyMs?: number;
    errorRatePercent?: number;
  }>;
  activeIncidentCount: number;
  checkedAt: string;
}

export interface PlatformStatistics {
  totalAccounts: number;
  activeAccounts30d: number;
  totalOrganizations: number;
  totalDevices: number;
  onlineDevices: number;
  totalGateways: number;
  onlineGateways: number;
  commandsLast24h: number;
  activeSecurityIncidents: number;
  countriesActive: number;
  generatedAt: string;
}

export interface AdminActionLog {
  actionId: string;
  adminAccountId: string;
  action: string;
  targetType: string;
  targetId: string;
  reason: string;
  performedAt: string;
}

export interface FeatureFlag {
  flagKey: string;
  name: string;
  description: string;
  isEnabled: boolean;
  rolloutPercent: number;
  targetOrgIds?: string[];
  targetCountryCodes?: string[];
  updatedAt: string;
  updatedBy: string;
}

// ---------------------------------------------------------------
// Request / Response Shapes
// ---------------------------------------------------------------

export interface GrantAdminRoleRequest {
  targetAccountId: string;
  roles: AdminRole[];
  reason: string;
}

export interface RevokeAdminRoleRequest {
  targetAccountId: string;
  roles: AdminRole[];
  reason: string;
}

export interface SuspendAccountAdminRequest {
  targetAccountId: string;
  reason: string;
  notifyUser: boolean;
}

export interface SearchAccountsRequest {
  emailContains?: string;
  phoneContains?: string;
  status?: string;
  orgId?: string;
  limit?: number;
  offset?: number;
}

export interface SearchAccountsResponse {
  accounts: Array<{
    accountId: string;
    displayName: string;
    email?: string;               // Masked unless admin has support_admin role
    status: string;
    createdAt: string;
    lastLoginAt?: string;
    // NEVER includes: password hash, MFA secrets, OAuth tokens
  }>;
  total: number;
}

export interface UpdateFeatureFlagRequest {
  flagKey: string;
  isEnabled?: boolean;
  rolloutPercent?: number;
  targetOrgIds?: string[];
  targetCountryCodes?: string[];
}

export interface ImpersonateSessionRequest {
  targetAccountId: string;
  reason: string;
  durationMinutes: number;        // Max limited, e.g. 30 minutes
}

export interface ImpersonateSessionResponse {
  sessionToken: string;
  expiresAt: string;
  // Every impersonation session is heavily audited and visible
  // to the impersonated user afterward (transparency requirement)
  disclosedToUser: true;
}

// ---------------------------------------------------------------
// API Route Definitions
// ---------------------------------------------------------------

export const ADMINISTRATION_ROUTES = {
  // Admin role management (super_admin only)
  GRANT_ADMIN_ROLE:        'POST /api/v1/admin/roles/grant',
  REVOKE_ADMIN_ROLE:       'POST /api/v1/admin/roles/revoke',
  LIST_ADMINS:             'GET  /api/v1/admin/roles',

  // Account management
  SEARCH_ACCOUNTS:         'GET  /api/v1/admin/accounts/search',
  GET_ACCOUNT_DETAIL:      'GET  /api/v1/admin/accounts/:accountId',
  SUSPEND_ACCOUNT:         'POST /api/v1/admin/accounts/:accountId/suspend',
  REINSTATE_ACCOUNT:       'POST /api/v1/admin/accounts/:accountId/reinstate',
  IMPERSONATE_SESSION:     'POST /api/v1/admin/accounts/:accountId/impersonate',

  // Organization management
  SEARCH_ORGANIZATIONS:    'GET  /api/v1/admin/organizations/search',
  SUSPEND_ORGANIZATION:    'POST /api/v1/admin/organizations/:orgId/suspend',

  // System health
  GET_SYSTEM_HEALTH:       'GET  /api/v1/admin/system/health',
  GET_PLATFORM_STATS:      'GET  /api/v1/admin/system/stats',

  // Feature flags
  LIST_FEATURE_FLAGS:      'GET  /api/v1/admin/feature-flags',
  UPDATE_FEATURE_FLAG:     'PUT  /api/v1/admin/feature-flags/:flagKey',

  // Admin action log
  LIST_ADMIN_ACTIONS:      'GET  /api/v1/admin/actions',
} as const;

// ---------------------------------------------------------------
// Handler Interfaces
// ---------------------------------------------------------------

export interface AdministrationAPIHandlers {
  grantAdminRole(superAdminId: string, req: GrantAdminRoleRequest): Promise<AdminUser>;
  revokeAdminRole(superAdminId: string, req: RevokeAdminRoleRequest): Promise<{ success: boolean }>;
  listAdmins(requestingAdminId: string): Promise<AdminUser[]>;

  searchAccounts(adminId: string, req: SearchAccountsRequest): Promise<SearchAccountsResponse>;
  getAccountDetail(adminId: string, accountId: string): Promise<SearchAccountsResponse['accounts'][0]>;
  suspendAccount(adminId: string, req: SuspendAccountAdminRequest): Promise<{ success: boolean }>;
  reinstateAccount(adminId: string, accountId: string, reason: string): Promise<{ success: boolean }>;

  /**
   * Impersonate a user session for support purposes.
   * Requires support_admin role. Fully audited. Time-limited.
   * The impersonated user is notified this occurred.
   */
  impersonateSession(adminId: string, req: ImpersonateSessionRequest): Promise<ImpersonateSessionResponse>;

  suspendOrganization(adminId: string, orgId: string, reason: string): Promise<{ success: boolean }>;

  getSystemHealth(): Promise<SystemHealthReport>;
  getPlatformStats(adminId: string): Promise<PlatformStatistics>;

  listFeatureFlags(adminId: string): Promise<FeatureFlag[]>;
  updateFeatureFlag(adminId: string, req: UpdateFeatureFlagRequest): Promise<FeatureFlag>;

  listAdminActions(requestingAdminId: string, fromTime?: string, toTime?: string): Promise<AdminActionLog[]>;
}

// ---------------------------------------------------------------
// Security Rules — Least Privilege for Admins
// ---------------------------------------------------------------

export const ADMINISTRATION_SECURITY_RULES = {
  /**
   * Admin accounts can manage account STATE (suspend, reinstate, view metadata)
   * but can NEVER view a user's password, MFA secrets, or OAuth tokens.
   */
  ADMIN_NEVER_SEES_USER_SECRETS: true,

  /** All admin accounts must have MFA enabled — no exceptions. */
  MFA_MANDATORY_FOR_ADMINS: true,

  /** Only super_admin can grant or revoke other admin roles. */
  ONLY_SUPER_ADMIN_MANAGES_ROLES: true,

  /**
   * Impersonation sessions are time-limited, fully audited,
   * and disclosed to the impersonated user afterward.
   */
  IMPERSONATION_TRANSPARENT_AND_LIMITED: true,
  IMPERSONATION_MAX_DURATION_MINUTES: 30,

  /**
   * No admin role automatically has unlimited platform control.
   * Roles are scoped: security_admin cannot access billing data,
   * billing_admin cannot access security incidents, etc.
   */
  ROLES_ARE_SCOPED_NOT_UNLIMITED: true,
} as const;

// ---------------------------------------------------------------
// Audit Events
// ---------------------------------------------------------------

export type AdministrationAuditEvent =
  | 'admin.role.granted'
  | 'admin.role.revoked'
  | 'admin.account.suspended'
  | 'admin.account.reinstated'
  | 'admin.account.impersonation_started'
  | 'admin.account.impersonation_ended'
  | 'admin.organization.suspended'
  | 'admin.feature_flag.updated'
  | 'admin.accounts.searched';
KSVEOF

cat << 'KSVEOF' > "API/audit.ts"
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
KSVEOF

cat << 'KSVEOF' > "API/authentication.ts"
// =============================================================
// KSV — Authentication API
// Domain: "Is this really the user?" — Session, MFA, OTP
// =============================================================

export type MFAMethod = 'totp' | 'sms_otp' | 'email_otp' | 'hardware_key';
export type LoginMethod = 'password' | 'google' | 'facebook' | 'tiktok' | 'apple' | 'microsoft';
export type SessionStatus = 'active' | 'expired' | 'revoked';
export type LoginResult = 'success' | 'mfa_required' | 'failed' | 'account_suspended' | 'account_deleted';

// ---------------------------------------------------------------
// Session Types
// ---------------------------------------------------------------

export interface KSVSession {
  sessionId: string;
  accountId: string;
  deviceFingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  expiresAt: string;
  lastActivityAt: string;
  status: SessionStatus;
  mfaVerified: boolean;
  loginMethod: LoginMethod;
  countryCode?: string;
}

export interface KSVToken {
  accessToken: string;          // Short-lived (e.g. 15 minutes)
  refreshToken: string;         // Longer-lived (e.g. 7 days) — stored securely
  expiresIn: number;            // Seconds
  tokenType: 'Bearer';
}

export interface MFAChallenge {
  challengeId: string;
  method: MFAMethod;
  expiresAt: string;
  maskedDestination?: string;   // e.g. "+855 *** *** 123" — never full number
}

// ---------------------------------------------------------------
// Request / Response Shapes
// ---------------------------------------------------------------

export interface PasswordLoginRequest {
  email?: string;
  phone?: string;
  countryCode?: string;
  password: string;             // Sent over TLS; hashed server-side; never stored plain
}

export interface OAuthLoginRequest {
  provider: 'google' | 'facebook' | 'tiktok' | 'apple' | 'microsoft';
  providerToken: string;        // ID token from provider — KSV validates it
  // KSV NEVER receives the external account password
}

export interface LoginResponse {
  result: LoginResult;
  session?: KSVSession;
  token?: KSVToken;
  mfaChallenge?: MFAChallenge;  // Present if MFA is required
  message: string;
}

export interface MFAVerifyRequest {
  challengeId: string;
  code: string;                 // 6-digit OTP or TOTP code
}

export interface MFAVerifyResponse {
  success: boolean;
  token?: KSVToken;
  session?: KSVSession;
  attemptsRemaining?: number;
  message: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: KSVToken;
  session: KSVSession;
}

export interface LogoutRequest {
  sessionId?: string;           // If omitted, logs out current session only
  allSessions?: boolean;        // If true, revokes ALL sessions for this account
}

export interface LogoutResponse {
  success: boolean;
  revokedSessionCount: number;
  message: string;
}

export interface ListSessionsResponse {
  sessions: KSVSession[];
}

export interface RevokeSessionRequest {
  sessionId: string;
}

export interface MFAEnrollRequest {
  method: MFAMethod;
  phoneNumber?: string;         // For SMS OTP
  email?: string;               // For email OTP
}

export interface MFAEnrollResponse {
  success: boolean;
  method: MFAMethod;
  totpSecret?: string;          // Only for TOTP — show QR to user, then discard
  confirmationRequired: boolean;
  message: string;
}

export interface MFAConfirmEnrollRequest {
  method: MFAMethod;
  verificationCode: string;
}

export interface MFADisableRequest {
  method: MFAMethod;
  confirmCode: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  // Both sent over TLS; stored as secure hash only
}

export interface ChangePasswordResponse {
  success: boolean;
  sessionRevoked: boolean;      // Other sessions are revoked after password change
  message: string;
}

// ---------------------------------------------------------------
// Failed Login Tracking (Brute-Force Protection)
// ---------------------------------------------------------------

export interface LoginAttemptRecord {
  attemptId: string;
  accountId?: string;
  ipAddress: string;
  loginMethod: LoginMethod;
  result: 'success' | 'failed' | 'mfa_failed' | 'account_locked';
  attemptedAt: string;
  userAgent?: string;
}

export interface AccountLockStatus {
  isLocked: boolean;
  lockedUntil?: string;
  failedAttempts: number;
  maxAttempts: number;
}

// ---------------------------------------------------------------
// API Route Definitions
// ---------------------------------------------------------------

export const AUTHENTICATION_ROUTES = {
  // Login
  LOGIN_PASSWORD:          'POST /api/v1/auth/login/password',
  LOGIN_OAUTH:             'POST /api/v1/auth/login/oauth',

  // MFA
  MFA_CHALLENGE:           'GET  /api/v1/auth/mfa/challenge/:challengeId',
  MFA_VERIFY:              'POST /api/v1/auth/mfa/verify',
  MFA_ENROLL:              'POST /api/v1/auth/mfa/enroll',
  MFA_CONFIRM_ENROLL:      'POST /api/v1/auth/mfa/enroll/confirm',
  MFA_DISABLE:             'POST /api/v1/auth/mfa/disable',
  MFA_LIST:                'GET  /api/v1/auth/mfa/methods',

  // Tokens
  REFRESH_TOKEN:           'POST /api/v1/auth/token/refresh',

  // Sessions
  LIST_SESSIONS:           'GET  /api/v1/auth/sessions',
  REVOKE_SESSION:          'DELETE /api/v1/auth/sessions/:sessionId',
  LOGOUT:                  'POST /api/v1/auth/logout',

  // Password
  CHANGE_PASSWORD:         'POST /api/v1/auth/password/change',

  // Admin / Security
  LOCK_STATUS:             'GET  /api/v1/auth/lock-status/:accountId',      // Admin only
  UNLOCK_ACCOUNT:          'POST /api/v1/auth/unlock/:accountId',           // Admin only
  ADMIN_REVOKE_ALL:        'POST /api/v1/auth/admin/revoke-all/:accountId', // Admin only
} as const;

// ---------------------------------------------------------------
// Handler Interfaces
// ---------------------------------------------------------------

export interface AuthenticationAPIHandlers {
  /**
   * Authenticate with email/phone + password.
   * Password is verified server-side; never returned or logged.
   */
  loginWithPassword(req: PasswordLoginRequest): Promise<LoginResponse>;

  /**
   * Authenticate via OAuth/OIDC provider token.
   * KSV validates the token with the provider; does not handle external passwords.
   */
  loginWithOAuth(req: OAuthLoginRequest): Promise<LoginResponse>;

  /**
   * Complete MFA challenge after initial login.
   */
  verifyMFA(req: MFAVerifyRequest): Promise<MFAVerifyResponse>;

  /**
   * Exchange refresh token for a new access token.
   */
  refreshToken(req: RefreshTokenRequest): Promise<RefreshTokenResponse>;

  /**
   * Revoke one or all sessions for the current user.
   */
  logout(accountId: string, req: LogoutRequest): Promise<LogoutResponse>;

  /**
   * List all active sessions for the current user.
   */
  listSessions(accountId: string): Promise<ListSessionsResponse>;

  /**
   * Revoke a specific session by ID.
   */
  revokeSession(accountId: string, sessionId: string): Promise<{ success: boolean }>;

  /**
   * Enroll a new MFA method.
   */
  enrollMFA(accountId: string, req: MFAEnrollRequest): Promise<MFAEnrollResponse>;

  /**
   * Confirm MFA enrollment with a verification code.
   */
  confirmMFAEnroll(
    accountId: string,
    req: MFAConfirmEnrollRequest
  ): Promise<{ success: boolean; message: string }>;

  /**
   * Disable an MFA method.
   */
  disableMFA(accountId: string, req: MFADisableRequest): Promise<{ success: boolean }>;

  /**
   * Change the user's password.
   * After a password change, all other sessions are revoked for security.
   */
  changePassword(
    accountId: string,
    req: ChangePasswordRequest
  ): Promise<ChangePasswordResponse>;

  /**
   * Admin: check if an account is locked due to failed attempts.
   */
  getLockStatus(targetAccountId: string): Promise<AccountLockStatus>;

  /**
   * Admin: unlock a locked account.
   */
  unlockAccount(
    targetAccountId: string,
    adminAccountId: string,
    reason: string
  ): Promise<{ success: boolean }>;

  /**
   * Admin: revoke all sessions for an account (emergency use).
   */
  adminRevokeAll(
    targetAccountId: string,
    adminAccountId: string,
    reason: string
  ): Promise<{ revokedCount: number }>;
}

// ---------------------------------------------------------------
// Security Rules
// ---------------------------------------------------------------

export const AUTHENTICATION_SECURITY_RULES = {
  /** Passwords are never stored in plain text. Use bcrypt/argon2. */
  PASSWORDS_HASHED_ONLY: true,

  /** Passwords are never returned in any API response or log. */
  PASSWORDS_NEVER_RETURNED: true,

  /** MFA OTPs expire after this many minutes. */
  OTP_EXPIRY_MINUTES: 10,

  /** OTP codes are single-use. A used code cannot be replayed. */
  OTP_SINGLE_USE: true,

  /** Maximum failed login attempts before temporary lockout. */
  MAX_FAILED_ATTEMPTS: 5,

  /** Lockout duration in minutes after exceeding failed attempts. */
  LOCKOUT_DURATION_MINUTES: 15,

  /** Access tokens expire after this many minutes. */
  ACCESS_TOKEN_EXPIRY_MINUTES: 15,

  /** Refresh tokens expire after this many days. */
  REFRESH_TOKEN_EXPIRY_DAYS: 7,

  /** After a password change, all other sessions are revoked. */
  REVOKE_SESSIONS_ON_PASSWORD_CHANGE: true,

  /** OAuth tokens from providers are validated — never trusted blindly. */
  VALIDATE_OAUTH_TOKENS_WITH_PROVIDER: true,
} as const;

// ---------------------------------------------------------------
// Audit Events
// ---------------------------------------------------------------

export type AuthenticationAuditEvent =
  | 'auth.login.success'
  | 'auth.login.failed'
  | 'auth.login.account_suspended'
  | 'auth.mfa.challenge_issued'
  | 'auth.mfa.verified'
  | 'auth.mfa.failed'
  | 'auth.mfa.enrolled'
  | 'auth.mfa.disabled'
  | 'auth.token.refreshed'
  | 'auth.session.revoked'
  | 'auth.session.all_revoked'
  | 'auth.logout'
  | 'auth.password.changed'
  | 'auth.account.locked'
  | 'auth.account.unlocked'
  | 'auth.admin.emergency_revoke';
KSVEOF

cat << 'KSVEOF' > "API/authorization.ts"
// =============================================================
// KSV — Authorization API
// Domain: Who can do WHAT, to WHICH device, WHERE, WHEN, and HOW
// RULE: Authentication proves identity. Authorization proves permission.
// =============================================================

export type PermissionLevel =
  | 'owner'
  | 'super_admin'
  | 'org_admin'
  | 'manager'
  | 'operator'
  | 'controller'
  | 'viewer'
  | 'guest'
  | 'temporary';

export type ResourceType =
  | 'device'
  | 'device_group'
  | 'organization'
  | 'site'
  | 'building'
  | 'room'
  | 'gateway'
  | 'protocol'
  | 'audit_log'
  | 'user_management';

export type ActionType =
  | 'read'
  | 'write'
  | 'control'
  | 'pair'
  | 'unpair'
  | 'manage_permissions'
  | 'delete'
  | 'transfer_ownership'
  | 'emergency_stop'
  | 'view_audit'
  | 'manage_organization';

// ---------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------

export interface KSVPermission {
  permissionId: string;
  accountId: string;
  resourceType: ResourceType;
  resourceId: string;
  actions: ActionType[];
  level: PermissionLevel;
  grantedBy: string;            // accountId of the granter
  grantedAt: string;
  expiresAt?: string;           // For temporary permissions
  conditions?: PermissionConditions;
  isRevoked: boolean;
}

export interface PermissionConditions {
  /** If set, permission is valid only between these times (HH:MM 24h) */
  timeFrom?: string;
  timeTo?: string;
  /** Days of week (0=Sun, 6=Sat) */
  daysOfWeek?: number[];
  /** If set, permission is valid only when user is within this location */
  locationRestriction?: LocationRestriction;
  /** If set, additional approval is required before action is executed */
  requiresApproval?: boolean;
  approverAccountId?: string;
  /** Maximum number of times this permission can be used */
  maxUsageCount?: number;
  currentUsageCount?: number;
}

export interface LocationRestriction {
  type: 'site' | 'building' | 'gps_radius';
  siteId?: string;
  buildingId?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsRadiusMeters?: number;
  /** GPS is a context signal only — NOT a primary security control */
  isSecondaryContextOnly: true;
}

export interface PermissionCheckInput {
  accountId: string;
  resourceType: ResourceType;
  resourceId: string;
  action: ActionType;
  context?: PermissionCheckContext;
}

export interface PermissionCheckContext {
  currentTime?: string;
  locationSiteId?: string;
  locationBuildingId?: string;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  permissionId?: string;
  requiresApproval?: boolean;
  approverAccountId?: string;
  conditionsFailed?: string[];
}

// ---------------------------------------------------------------
// Request / Response Shapes
// ---------------------------------------------------------------

export interface GrantPermissionRequest {
  targetAccountId: string;
  resourceType: ResourceType;
  resourceId: string;
  actions: ActionType[];
  level: PermissionLevel;
  expiresAt?: string;
  conditions?: Omit<PermissionConditions, 'currentUsageCount'>;
  reason?: string;
}

export interface GrantPermissionResponse {
  success: boolean;
  permission: KSVPermission;
  message: string;
}

export interface RevokePermissionRequest {
  permissionId: string;
  reason?: string;
}

export interface RevokePermissionResponse {
  success: boolean;
  revokedPermissionId: string;
  message: string;
}

export interface ListPermissionsRequest {
  accountId?: string;
  resourceType?: ResourceType;
  resourceId?: string;
  includeExpired?: boolean;
  includeRevoked?: boolean;
}

export interface ListPermissionsResponse {
  permissions: KSVPermission[];
  total: number;
}

export interface ApproveActionRequest {
  pendingActionId: string;
  approverAccountId: string;
  approved: boolean;
  reason?: string;
}

export interface PendingApproval {
  pendingActionId: string;
  requestingAccountId: string;
  resourceType: ResourceType;
  resourceId: string;
  action: ActionType;
  requestedAt: string;
  expiresAt: string;
}

// ---------------------------------------------------------------
// API Route Definitions
// ---------------------------------------------------------------

export const AUTHORIZATION_ROUTES = {
  // Permission check (used internally by all other APIs)
  CHECK_PERMISSION:            'POST /api/v1/authz/check',
  CHECK_PERMISSIONS_BATCH:     'POST /api/v1/authz/check/batch',

  // Grant / Revoke
  GRANT_PERMISSION:            'POST /api/v1/authz/permissions',
  REVOKE_PERMISSION:           'DELETE /api/v1/authz/permissions/:permissionId',
  LIST_PERMISSIONS:            'GET  /api/v1/authz/permissions',
  GET_PERMISSION:              'GET  /api/v1/authz/permissions/:permissionId',
  UPDATE_PERMISSION:           'PUT  /api/v1/authz/permissions/:permissionId',

  // My permissions (current user)
  MY_PERMISSIONS:              'GET  /api/v1/authz/my-permissions',
  MY_PERMISSIONS_FOR_RESOURCE: 'GET  /api/v1/authz/my-permissions/:resourceType/:resourceId',

  // Approvals
  LIST_PENDING_APPROVALS:      'GET  /api/v1/authz/approvals/pending',
  APPROVE_ACTION:              'POST /api/v1/authz/approvals/:pendingActionId',

  // Resource ownership
  GET_OWNER:                   'GET  /api/v1/authz/owner/:resourceType/:resourceId',
  TRANSFER_OWNERSHIP:          'POST /api/v1/authz/owner/:resourceType/:resourceId/transfer',
} as const;

// ---------------------------------------------------------------
// Handler Interfaces
// ---------------------------------------------------------------

export interface AuthorizationAPIHandlers {
  /**
   * Check if an account has permission to perform an action on a resource.
   * This is called by every other API before executing any sensitive operation.
   */
  checkPermission(req: PermissionCheckInput): Promise<PermissionCheckResult>;

  /**
   * Check multiple permissions at once (for UI rendering).
   */
  checkPermissionsBatch(
    requests: PermissionCheckInput[]
  ): Promise<PermissionCheckResult[]>;

  /**
   * Grant a permission to another account.
   * Granters can only grant permissions up to (not exceeding) their own level.
   */
  grantPermission(
    granterAccountId: string,
    req: GrantPermissionRequest
  ): Promise<GrantPermissionResponse>;

  /**
   * Revoke a previously granted permission.
   */
  revokePermission(
    revokerAccountId: string,
    req: RevokePermissionRequest
  ): Promise<RevokePermissionResponse>;

  /**
   * List permissions with optional filters.
   */
  listPermissions(
    requestingAccountId: string,
    req: ListPermissionsRequest
  ): Promise<ListPermissionsResponse>;

  /**
   * Get all permissions the current user has.
   */
  getMyPermissions(accountId: string): Promise<ListPermissionsResponse>;

  /**
   * Get permissions the current user has for a specific resource.
   */
  getMyPermissionsForResource(
    accountId: string,
    resourceType: ResourceType,
    resourceId: string
  ): Promise<ListPermissionsResponse>;

  /**
   * List actions awaiting approval from the current user.
   */
  listPendingApprovals(approverAccountId: string): Promise<PendingApproval[]>;

  /**
   * Approve or reject a pending action.
   */
  approveAction(req: ApproveActionRequest): Promise<{ success: boolean; message: string }>;

  /**
   * Transfer ownership of a resource to another account.
   * This is an irreversible action requiring elevated confirmation.
   */
  transferOwnership(
    currentOwnerAccountId: string,
    resourceType: ResourceType,
    resourceId: string,
    newOwnerAccountId: string,
    confirmPhrase: string
  ): Promise<{ success: boolean; message: string }>;
}

// ---------------------------------------------------------------
// Security Rules
// ---------------------------------------------------------------

export const AUTHORIZATION_SECURITY_RULES = {
  /**
   * A user can only grant permissions up to (not exceeding) their own level.
   * An Operator cannot grant Owner-level permissions.
   */
  CANNOT_GRANT_ABOVE_OWN_LEVEL: true,

  /**
   * Being logged in does NOT automatically grant any device permission.
   * Every action requires an explicit permission check.
   */
  NO_IMPLICIT_PERMISSION: true,

  /**
   * GPS / location is a SECONDARY context signal only.
   * It is NEVER the sole basis for granting or denying permission.
   * The primary check is Identity + Cryptographic Credentials + Authorization.
   */
  GPS_IS_SECONDARY_CONTEXT_ONLY: true,

  /**
   * Temporary permissions automatically expire.
   * The system must not execute expired permissions.
   */
  EXPIRED_PERMISSIONS_REJECTED: true,

  /**
   * Revoked permissions take effect immediately.
   * Cached permission results must be invalidated on revocation.
   */
  REVOKED_PERMISSIONS_IMMEDIATE: true,

  /**
   * Ownership transfer is irreversible without the new owner's confirmation.
   */
  OWNERSHIP_TRANSFER_REQUIRES_CONFIRMATION: true,

  /**
   * Permission level hierarchy (lower index = higher privilege).
   */
  LEVEL_HIERARCHY: [
    'owner',
    'super_admin',
    'org_admin',
    'manager',
    'operator',
    'controller',
    'viewer',
    'guest',
    'temporary',
  ] as const,
} as const;

// ---------------------------------------------------------------
// Audit Events
// ---------------------------------------------------------------

export type AuthorizationAuditEvent =
  | 'authz.permission.check.allowed'
  | 'authz.permission.check.denied'
  | 'authz.permission.granted'
  | 'authz.permission.revoked'
  | 'authz.permission.expired'
  | 'authz.permission.condition_failed'
  | 'authz.approval.requested'
  | 'authz.approval.approved'
  | 'authz.approval.rejected'
  | 'authz.ownership.transferred';
KSVEOF

cat << 'KSVEOF' > "API/automation.ts"
// =============================================================
// KSV — Automation API
// Domain: IF condition THEN action — Time/Sensor/Event-based
// RULE: Automation obeys the same Permission + Safety rules as manual commands
// =============================================================

export type TriggerType =
  | 'schedule'
  | 'device_state'
  | 'sensor_value'
  | 'time_of_day'
  | 'sunrise_sunset'
  | 'location_enter'
  | 'location_exit'
  | 'device_online'
  | 'device_offline'
  | 'safety_event'
  | 'manual';

export type AutomationStatus = 'active' | 'inactive' | 'paused' | 'error' | 'running';
export type ConditionOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'in' | 'not_in';
export type ActionType = 'device_command' | 'notification' | 'scene_activate' | 'webhook' | 'delay';

// ---------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------

export interface AutomationRule {
  ruleId: string;
  name: string;
  description?: string;
  status: AutomationStatus;
  ownerAccountId: string;
  orgId?: string;
  siteId?: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  conditionLogic: 'all' | 'any';
  actions: AutomationAction[];
  lastTriggeredAt?: string;
  triggerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationTrigger {
  type: TriggerType;
  // Schedule
  cronExpression?: string;
  timezone?: string;
  // Device state
  deviceId?: string;
  capability?: string;
  // Sensor value
  sensorDeviceId?: string;
  sensorCapability?: string;
  // Time of day
  time?: string;              // HH:MM 24h
  daysOfWeek?: number[];
  // Sunrise/Sunset
  sunriseOffsetMinutes?: number;
  sunsetOffsetMinutes?: number;
  // Location
  siteId?: string;
  buildingId?: string;
}

export interface AutomationCondition {
  conditionId: string;
  deviceId?: string;
  capability?: string;
  operator: ConditionOperator;
  value: unknown;
  valueMax?: unknown;         // For 'between' operator
}

export interface AutomationAction {
  actionId: string;
  order: number;
  type: ActionType;
  // Device command
  deviceId?: string;
  capability?: string;
  commandValue?: unknown;
  // Notification
  notifyAccountIds?: string[];
  notificationMessage?: string;
  // Scene
  sceneId?: string;
  // Webhook
  webhookUrl?: string;
  webhookPayload?: Record<string, unknown>;
  // Delay
  delaySeconds?: number;
  // Safety override prevention
  bypassSafety: false;        // ALWAYS false — automation CANNOT bypass Safety Engine
}

export interface AutomationScene {
  sceneId: string;
  name: string;
  description?: string;
  ownerAccountId: string;
  orgId?: string;
  roomId?: string;
  actions: AutomationAction[];
  createdAt: string;
}

export interface AutomationLog {
  logId: string;
  ruleId: string;
  triggeredAt: string;
  conditionsMet: boolean;
  actionsExecuted: number;
  actionsFailed: number;
  durationMs: number;
  results: Array<{
    actionId: string;
    success: boolean;
    commandId?: string;
    errorMessage?: string;
  }>;
}

// ---------------------------------------------------------------
// Request / Response Shapes
// ---------------------------------------------------------------

export interface CreateRuleRequest {
  name: string;
  description?: string;
  orgId?: string;
  siteId?: string;
  trigger: AutomationTrigger;
  conditions?: AutomationCondition[];
  conditionLogic?: 'all' | 'any';
  actions: Omit<AutomationAction, 'bypassSafety'>[];
}

export interface UpdateRuleRequest {
  name?: string;
  description?: string;
  trigger?: AutomationTrigger;
  conditions?: AutomationCondition[];
  conditionLogic?: 'all' | 'any';
  actions?: Omit<AutomationAction, 'bypassSafety'>[];
  status?: 'active' | 'inactive';
}

export interface TestRuleRequest {
  ruleId: string;
  dryRun: boolean;            // If true, validate only — do not execute
}

export interface TestRuleResponse {
  ruleId: string;
  conditionsMet: boolean;
  actionsWouldExecute: AutomationAction[];
  safetyCheckResults: Array<{
    actionId: string;
    allowed: boolean;
    reason?: string;
  }>;
  message: string;
}

export interface CreateSceneRequest {
  name: string;
  description?: string;
  orgId?: string;
  roomId?: string;
  actions: Omit<AutomationAction, 'bypassSafety'>[];
}

export interface ActivateSceneRequest {
  sceneId: string;
  context?: Record<string, unknown>;
}

export interface ListAutomationLogsRequest {
  ruleId?: string;
  fromTime?: string;
  toTime?: string;
  limit?: number;
  offset?: number;
}

// ---------------------------------------------------------------
// API Route Definitions
// ---------------------------------------------------------------

export const AUTOMATION_ROUTES = {
  // Rules
  CREATE_RULE:             'POST /api/v1/automation/rules',
  LIST_RULES:              'GET  /api/v1/automation/rules',
  GET_RULE:                'GET  /api/v1/automation/rules/:ruleId',
  UPDATE_RULE:             'PUT  /api/v1/automation/rules/:ruleId',
  DELETE_RULE:             'DELETE /api/v1/automation/rules/:ruleId',
  ENABLE_RULE:             'POST /api/v1/automation/rules/:ruleId/enable',
  DISABLE_RULE:            'POST /api/v1/automation/rules/:ruleId/disable',
  TEST_RULE:               'POST /api/v1/automation/rules/:ruleId/test',

  // Scenes
  CREATE_SCENE:            'POST /api/v1/automation/scenes',
  LIST_SCENES:             'GET  /api/v1/automation/scenes',
  GET_SCENE:               'GET  /api/v1/automation/scenes/:sceneId',
  UPDATE_SCENE:            'PUT  /api/v1/automation/scenes/:sceneId',
  DELETE_SCENE:            'DELETE /api/v1/automation/scenes/:sceneId',
  ACTIVATE_SCENE:          'POST /api/v1/automation/scenes/:sceneId/activate',

  // Logs
  LIST_AUTOMATION_LOGS:    'GET  /api/v1/automation/logs',
  GET_AUTOMATION_LOG:      'GET  /api/v1/automation/logs/:logId',
} as const;

// ---------------------------------------------------------------
// Handler Interfaces
// ---------------------------------------------------------------

export interface AutomationAPIHandlers {
  createRule(accountId: string, req: CreateRuleRequest): Promise<AutomationRule>;
  listRules(accountId: string, orgId?: string): Promise<AutomationRule[]>;
  getRule(ruleId: string, accountId: string): Promise<AutomationRule>;
  updateRule(ruleId: string, req: UpdateRuleRequest, accountId: string): Promise<AutomationRule>;
  deleteRule(ruleId: string, accountId: string): Promise<{ success: boolean }>;
  enableRule(ruleId: string, accountId: string): Promise<{ success: boolean }>;
  disableRule(ruleId: string, accountId: string): Promise<{ success: boolean }>;
  testRule(accountId: string, req: TestRuleRequest): Promise<TestRuleResponse>;

  createScene(accountId: string, req: CreateSceneRequest): Promise<AutomationScene>;
  listScenes(accountId: string, orgId?: string): Promise<AutomationScene[]>;
  getScene(sceneId: string, accountId: string): Promise<AutomationScene>;
  updateScene(sceneId: string, req: CreateSceneRequest, accountId: string): Promise<AutomationScene>;
  deleteScene(sceneId: string, accountId: string): Promise<{ success: boolean }>;
  activateScene(accountId: string, req: ActivateSceneRequest): Promise<{ success: boolean; commandsIssued: number }>;

  listLogs(accountId: string, req: ListAutomationLogsRequest): Promise<{ logs: AutomationLog[]; total: number }>;
  getLog(logId: string, accountId: string): Promise<AutomationLog>;
}

// ---------------------------------------------------------------
// Security Rules
// ---------------------------------------------------------------

export const AUTOMATION_SECURITY_RULES = {
  /**
   * Automation rules CANNOT bypass Authorization.
   * Every action in an automation goes through the same
   * Command pipeline as a manual command.
   */
  AUTOMATION_CANNOT_BYPASS_AUTHZ: true,

  /**
   * Automation rules CANNOT bypass the Safety Engine.
   * bypassSafety is always forced to false.
   */
  AUTOMATION_CANNOT_BYPASS_SAFETY: true,

  /**
   * Automation rules cannot grant themselves higher permissions
   * than the owner of the rule.
   */
  AUTOMATION_INHERITS_OWNER_PERMISSIONS: true,

  /**
   * If an automation rule is created by an operator,
   * it can only issue commands the operator is permitted to issue manually.
   */
  RULE_PERMISSIONS_BOUNDED_BY_CREATOR: true,
} as const;

// ---------------------------------------------------------------
// Audit Events
// ---------------------------------------------------------------

export type AutomationAuditEvent =
  | 'automation.rule.created'
  | 'automation.rule.updated'
  | 'automation.rule.deleted'
  | 'automation.rule.enabled'
  | 'automation.rule.disabled'
  | 'automation.rule.triggered'
  | 'automation.rule.trigger_failed'
  | 'automation.rule.safety_blocked'
  | 'automation.scene.created'
  | 'automation.scene.updated'
  | 'automation.scene.deleted'
  | 'automation.scene.activated'
  | 'automation.scene.activation_failed';
KSVEOF

cat << 'KSVEOF' > "API/command.ts"
// =============================================================
// KSV — Command API
// Domain: User Command → Auth → AuthZ → Capability → Safety → Execute → Audit
// RULE: Every command passes through ALL layers. No shortcuts.
// =============================================================

export type CommandStatus =
  | 'pending'
  | 'auth_check'
  | 'safety_check'
  | 'executing'
  | 'success'
  | 'failed'
  | 'rejected_auth'
  | 'rejected_safety'
  | 'rejected_capability'
  | 'timeout'
  | 'cancelled';

export type CommandSource = 'user_app' | 'automation' | 'ai_layer' | 'api' | 'gateway_local' | 'admin';

// ---------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------

export interface KSVCommand {
  commandId: string;
  deviceId: string;
  capability: string;
  value: unknown;
  source: CommandSource;
  issuedBy: string;               // accountId
  sessionId?: string;
  status: CommandStatus;
  issuedAt: string;
  executedAt?: string;
  completedAt?: string;
  result?: CommandResult;
  safetyCheckResult?: SafetyCheckResult;
  authCheckResult?: AuthCheckResult;
}

export interface CommandResult {
  success: boolean;
  returnedValue?: unknown;
  errorCode?: string;
  errorMessage?: string;
  deviceFeedback?: unknown;
}

export interface AuthCheckResult {
  allowed: boolean;
  reason?: string;
  permissionId?: string;
}

export interface SafetyCheckResult {
  allowed: boolean;
  reason?: string;
  ruleId?: string;
  requiresConfirmation?: boolean;
}

// ---------------------------------------------------------------
// Request / Response Shapes
// ---------------------------------------------------------------

export interface IssueCommandRequest {
  deviceId: string;
  capability: string;
  value: unknown;
  confirmationToken?: string;     // Required for high-risk commands
  context?: CommandContext;
}

export interface CommandContext {
  locationSiteId?: string;
  locationBuildingId?: string;
  userConfirmed?: boolean;
  reason?: string;
}

export interface IssueCommandResponse {
  commandId: string;
  status: CommandStatus;
  requiresConfirmation?: boolean;
  confirmationChallenge?: string;
  estimatedCompletionMs?: number;
  message: string;
}

export interface GetCommandStatusResponse {
  command: KSVCommand;
}

export interface IssueBatchCommandRequest {
  commands: Array<{
    deviceId: string;
    capability: string;
    value: unknown;
  }>;
  failFast?: boolean;            // Stop on first failure
  confirmationToken?: string;
}

export interface IssueBatchCommandResponse {
  batchId: string;
  total: number;
  accepted: number;
  rejected: number;
  commands: Array<{
    commandId: string;
    deviceId: string;
    status: CommandStatus;
  }>;
}

export interface CancelCommandRequest {
  commandId: string;
  reason?: string;
}

export interface ListCommandHistoryRequest {
  deviceId?: string;
  accountId?: string;
  status?: CommandStatus;
  fromTime?: string;
  toTime?: string;
  limit?: number;
  offset?: number;
}

export interface ListCommandHistoryResponse {
  commands: KSVCommand[];
  total: number;
}

export interface EmergencyStopRequest {
  scope: 'device' | 'room' | 'building' | 'site' | 'org';
  scopeId: string;
  reason: string;
  confirmationToken: string;
}

export interface EmergencyStopResponse {
  success: boolean;
  affectedDeviceCount: number;
  stoppedAt: string;
  message: string;
}

// ---------------------------------------------------------------
// API Route Definitions
// ---------------------------------------------------------------

export const COMMAND_ROUTES = {
  ISSUE_COMMAND:           'POST /api/v1/commands',
  ISSUE_BATCH_COMMAND:     'POST /api/v1/commands/batch',
  GET_COMMAND_STATUS:      'GET  /api/v1/commands/:commandId',
  CANCEL_COMMAND:          'POST /api/v1/commands/:commandId/cancel',
  LIST_COMMAND_HISTORY:    'GET  /api/v1/commands/history',
  EMERGENCY_STOP:          'POST /api/v1/commands/emergency-stop',
} as const;

// ---------------------------------------------------------------
// Command Execution Pipeline
// ---------------------------------------------------------------

/**
 * Every command passes through this pipeline in strict order.
 * No step can be skipped. Failure at any step rejects the command.
 *
 * 1. PARSE       — Validate command structure and capability name
 * 2. AUTHENTICATE — Verify the session is valid and not expired
 * 3. AUTHORIZE   — Check permission for this device + capability + action
 * 4. CAPABILITY  — Verify the device supports this capability
 * 5. SAFETY      — Check Safety Engine (especially for high-risk devices)
 * 6. CONFIRM     — If high-risk, require explicit human confirmation
 * 7. EXECUTE     — Send command to device via appropriate protocol
 * 8. RESULT      — Collect device feedback
 * 9. AUDIT       — Record all of the above (not the user's password/secrets)
 */
export const COMMAND_PIPELINE_STAGES = [
  'parse',
  'authenticate',
  'authorize',
  'capability_check',
  'safety_check',
  'human_confirmation',
  'execute',
  'collect_result',
  'audit',
] as const;

// ---------------------------------------------------------------
// Handler Interfaces
// ---------------------------------------------------------------

export interface CommandAPIHandlers {
  /**
   * Issue a single command to a device.
   * Runs through the full pipeline: Auth → AuthZ → Capability → Safety → Execute.
   */
  issueCommand(accountId: string, sessionId: string, req: IssueCommandRequest): Promise<IssueCommandResponse>;

  /**
   * Issue commands to multiple devices at once.
   */
  issueBatchCommand(accountId: string, sessionId: string, req: IssueBatchCommandRequest): Promise<IssueBatchCommandResponse>;

  /**
   * Poll the status of a command (for async commands).
   */
  getCommandStatus(commandId: string, accountId: string): Promise<GetCommandStatusResponse>;

  /**
   * Cancel a pending or executing command (if possible).
   */
  cancelCommand(accountId: string, req: CancelCommandRequest): Promise<{ success: boolean }>;

  /**
   * List command history with filters.
   */
  listCommandHistory(accountId: string, req: ListCommandHistoryRequest): Promise<ListCommandHistoryResponse>;

  /**
   * Immediately stop all commands for a scope (device/room/building/site/org).
   * Used in emergencies. Requires confirmation token.
   */
  emergencyStop(accountId: string, req: EmergencyStopRequest): Promise<EmergencyStopResponse>;
}

// ---------------------------------------------------------------
// Security Rules
// ---------------------------------------------------------------

export const COMMAND_SECURITY_RULES = {
  /** Every command must pass authentication before anything else. */
  AUTHENTICATION_REQUIRED: true,

  /** Every command must pass authorization (explicit permission). */
  AUTHORIZATION_REQUIRED: true,

  /** Safety-relevant capabilities must pass the Safety Engine. */
  SAFETY_CHECK_FOR_HIGH_RISK: true,

  /** High-risk commands require a human confirmation token. */
  HIGH_RISK_REQUIRES_CONFIRMATION: true,

  /** Commands time out if not completed within this many seconds. */
  DEFAULT_TIMEOUT_SECONDS: 30,

  /** Emergency stop is always honored regardless of automation state. */
  EMERGENCY_STOP_CANNOT_BE_BLOCKED: true,

  /** All commands are audited — including rejected ones. */
  ALL_COMMANDS_AUDITED: true,

  /**
   * AI-layer commands are NOT trusted more than user commands.
   * They go through the same pipeline.
   */
  AI_COMMANDS_SAME_PIPELINE: true,
} as const;

// ---------------------------------------------------------------
// Audit Events
// ---------------------------------------------------------------

export type CommandAuditEvent =
  | 'command.issued'
  | 'command.auth_rejected'
  | 'command.authz_rejected'
  | 'command.capability_rejected'
  | 'command.safety_rejected'
  | 'command.confirmation_required'
  | 'command.confirmed'
  | 'command.executed'
  | 'command.failed'
  | 'command.timeout'
  | 'command.cancelled'
  | 'command.batch_issued'
  | 'command.emergency_stop';
KSVEOF

cat << 'KSVEOF' > "API/device.ts"
// =============================================================
// KSV — Device API
// Domain: Device Identity, Capability, Ownership, Lifecycle
// RULE: KSV knows WHAT a device can do, not just that it exists
// =============================================================

export type DeviceCategory =
  | 'home'
  | 'building'
  | 'vehicle'
  | 'industrial'
  | 'warehouse'
  | 'energy'
  | 'network'
  | 'other';

export type DeviceType =
  // Home
  | 'light' | 'fan' | 'ac' | 'tv' | 'speaker' | 'refrigerator'
  | 'washing_machine' | 'smart_lock' | 'gate' | 'garage'
  // Building
  | 'door' | 'elevator' | 'access_control' | 'parking_barrier'
  | 'hvac' | 'camera' | 'sensor' | 'alarm'
  // Vehicle
  | 'car' | 'ev' | 'fleet_vehicle' | 'bus'
  // Industrial
  | 'machine' | 'motor' | 'pump' | 'plc' | 'robot' | 'conveyor'
  // Warehouse
  | 'scanner' | 'forklift_sensor' | 'shelf_sensor'
  // Energy
  | 'solar_inverter' | 'battery' | 'meter' | 'energy_controller'
  // Network
  | 'gateway' | 'router' | 'hub'
  | 'custom';

export type DeviceProtocol =
  | 'bluetooth'
  | 'wifi'
  | 'mqtt'
  | 'http_api'
  | 'infrared'
  | 'zigbee'
  | 'zwave'
  | 'lorawan'
  | 'modbus'
  | 'bacnet'
  | 'can_bus'
  | 'custom';

export type DeviceStatus = 'online' | 'offline' | 'pairing' | 'error' | 'maintenance' | 'decommissioned';

export type DeviceSecurityState = 'trusted' | 'unverified' | 'quarantined' | 'revoked';

export type DeviceLifecycleStage =
  | 'discovered'
  | 'verified'
  | 'paired'
  | 'active'
  | 'updated'
  | 'suspended'
  | 'revoked'
  | 'removed';

// ---------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------

export interface DeviceCapability {
  capabilityId: string;
  name: string;                   // e.g. "Power", "Volume", "Temperature"
  type: 'toggle' | 'range' | 'enum' | 'trigger' | 'read_only';
  minValue?: number;
  maxValue?: number;
  step?: number;
  unit?: string;                  // e.g. "°C", "%", "dB"
  enumValues?: string[];
  requiresPermissionLevel: string;
  isSafetyRelevant: boolean;      // True = Safety Engine must also approve
  isHighRisk: boolean;            // True = requires additional confirmation
}

export interface KSVDevice {
  deviceId: string;
  name: string;
  category: DeviceCategory;
  type: DeviceType;
  manufacturer: string;
  brand: string;
  model: string;
  serialNumber?: string;
  firmwareVersion?: string;
  hardwareVersion?: string;
  macAddress?: string;
  protocol: DeviceProtocol[];
  status: DeviceStatus;
  securityState: DeviceSecurityState;
  lifecycleStage: DeviceLifecycleStage;
  capabilities: DeviceCapability[];
  ownerAccountId: string;
  orgId?: string;
  siteId?: string;
  buildingId?: string;
  roomId?: string;
  gatewayId?: string;
  lastSeenAt?: string;
  lastCommandAt?: string;
  pairedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, string>;
}

export interface DeviceState {
  deviceId: string;
  timestamp: string;
  values: Record<string, unknown>;  // capability name → current value
  isStale: boolean;
  staleSince?: string;
}

// ---------------------------------------------------------------
// Request / Response Shapes
// ---------------------------------------------------------------

export interface RegisterDeviceRequest {
  name: string;
  category: DeviceCategory;
  type: DeviceType;
  manufacturer: string;
  brand: string;
  model: string;
  serialNumber?: string;
  protocol: DeviceProtocol[];
  orgId?: string;
  siteId?: string;
  buildingId?: string;
  roomId?: string;
  gatewayId?: string;
  metadata?: Record<string, string>;
}

export interface UpdateDeviceRequest {
  name?: string;
  roomId?: string;
  buildingId?: string;
  siteId?: string;
  metadata?: Record<string, string>;
}

export interface ListDevicesRequest {
  orgId?: string;
  siteId?: string;
  buildingId?: string;
  roomId?: string;
  category?: DeviceCategory;
  type?: DeviceType;
  status?: DeviceStatus;
  lifecycleStage?: DeviceLifecycleStage;
  protocol?: DeviceProtocol;
  limit?: number;
  offset?: number;
}

export interface ListDevicesResponse {
  devices: KSVDevice[];
  total: number;
  limit: number;
  offset: number;
}

export interface GetDeviceStateResponse {
  device: KSVDevice;
  state: DeviceState;
}

export interface UpdateFirmwareRequest {
  deviceId: string;
  targetVersion: string;
  updateUrl?: string;
  signature?: string;           // Signed update — MUST be verified before applying
  scheduleAt?: string;          // If omitted, update is applied immediately
}

export interface UpdateFirmwareResponse {
  success: boolean;
  jobId: string;
  currentVersion: string;
  targetVersion: string;
  scheduledAt?: string;
  message: string;
}

export interface QuarantineDeviceRequest {
  deviceId: string;
  reason: string;
  adminAccountId: string;
}

export interface DecommissionDeviceRequest {
  deviceId: string;
  reason: string;
  wipeLocalData: boolean;
}

// ---------------------------------------------------------------
// API Route Definitions
// ---------------------------------------------------------------

export const DEVICE_ROUTES = {
  // CRUD
  REGISTER_DEVICE:         'POST /api/v1/devices',
  LIST_DEVICES:            'GET  /api/v1/devices',
  GET_DEVICE:              'GET  /api/v1/devices/:deviceId',
  UPDATE_DEVICE:           'PUT  /api/v1/devices/:deviceId',
  DELETE_DEVICE:           'DELETE /api/v1/devices/:deviceId',

  // State
  GET_DEVICE_STATE:        'GET  /api/v1/devices/:deviceId/state',

  // Capabilities
  LIST_CAPABILITIES:       'GET  /api/v1/devices/:deviceId/capabilities',
  GET_CAPABILITY:          'GET  /api/v1/devices/:deviceId/capabilities/:capabilityId',

  // Firmware
  UPDATE_FIRMWARE:         'POST /api/v1/devices/:deviceId/firmware/update',
  GET_FIRMWARE_STATUS:     'GET  /api/v1/devices/:deviceId/firmware/status',
  ROLLBACK_FIRMWARE:       'POST /api/v1/devices/:deviceId/firmware/rollback',

  // Lifecycle
  QUARANTINE_DEVICE:       'POST /api/v1/devices/:deviceId/quarantine',
  RELEASE_QUARANTINE:      'POST /api/v1/devices/:deviceId/quarantine/release',
  DECOMMISSION_DEVICE:     'POST /api/v1/devices/:deviceId/decommission',

  // Groups
  LIST_DEVICE_GROUPS:      'GET  /api/v1/device-groups',
  CREATE_DEVICE_GROUP:     'POST /api/v1/device-groups',
  ADD_TO_GROUP:            'POST /api/v1/device-groups/:groupId/devices',
  REMOVE_FROM_GROUP:       'DELETE /api/v1/device-groups/:groupId/devices/:deviceId',
} as const;

// ---------------------------------------------------------------
// Handler Interfaces
// ---------------------------------------------------------------

export interface DeviceAPIHandlers {
  registerDevice(accountId: string, req: RegisterDeviceRequest): Promise<KSVDevice>;
  listDevices(accountId: string, req: ListDevicesRequest): Promise<ListDevicesResponse>;
  getDevice(deviceId: string, accountId: string): Promise<KSVDevice>;
  updateDevice(deviceId: string, req: UpdateDeviceRequest, accountId: string): Promise<KSVDevice>;
  deleteDevice(deviceId: string, accountId: string): Promise<{ success: boolean }>;

  getDeviceState(deviceId: string, accountId: string): Promise<GetDeviceStateResponse>;
  listCapabilities(deviceId: string, accountId: string): Promise<DeviceCapability[]>;

  updateFirmware(req: UpdateFirmwareRequest, accountId: string): Promise<UpdateFirmwareResponse>;
  rollbackFirmware(deviceId: string, targetVersion: string, accountId: string): Promise<{ success: boolean }>;

  quarantineDevice(req: QuarantineDeviceRequest): Promise<{ success: boolean }>;
  releaseQuarantine(deviceId: string, adminAccountId: string, reason: string): Promise<{ success: boolean }>;
  decommissionDevice(req: DecommissionDeviceRequest, accountId: string): Promise<{ success: boolean }>;
}

// ---------------------------------------------------------------
// Security Rules
// ---------------------------------------------------------------

export const DEVICE_SECURITY_RULES = {
  /** Firmware updates must be cryptographically signed before application. */
  FIRMWARE_MUST_BE_SIGNED: true,

  /** Quarantined devices cannot receive commands until released by an admin. */
  QUARANTINED_DEVICE_NO_COMMANDS: true,

  /**
   * Capabilities marked as safety-relevant must also pass the Safety Engine
   * before a command is executed.
   */
  SAFETY_RELEVANT_CAPABILITIES_REQUIRE_SAFETY_CHECK: true,

  /**
   * High-risk capabilities require additional human confirmation.
   */
  HIGH_RISK_REQUIRES_CONFIRMATION: true,
} as const;

// ---------------------------------------------------------------
// Audit Events
// ---------------------------------------------------------------

export type DeviceAuditEvent =
  | 'device.registered'
  | 'device.updated'
  | 'device.deleted'
  | 'device.state.read'
  | 'device.firmware.update_started'
  | 'device.firmware.update_completed'
  | 'device.firmware.update_failed'
  | 'device.firmware.rolled_back'
  | 'device.quarantined'
  | 'device.quarantine_released'
  | 'device.decommissioned'
  | 'device.security_state_changed';
KSVEOF

cat << 'KSVEOF' > "API/discovery.ts"
// =============================================================
// KSV — Discovery & Pairing API
// Domain: Scan → Verify → Own → Pair → Secure Connection → Ready
// RULE: Discovery ≠ Permission. Found ≠ Authorized.
// =============================================================

import type { DeviceProtocol, DeviceCategory } from './device';

export type DiscoveryMethod = 'bluetooth' | 'wifi' | 'local_network' | 'qr' | 'nfc' | 'gateway' | 'cloud_api' | 'manual';
export type PairingMethod = 'pin' | 'qr' | 'nfc' | 'push_button' | 'certificate' | 'manufacturer_credential' | 'owner_approval';
export type PairingStatus = 'pending' | 'owner_verifying' | 'pairing' | 'paired' | 'failed' | 'cancelled' | 'expired';
export type DiscoveredDeviceStatus = 'found' | 'verifying' | 'authorized' | 'unauthorized' | 'paired';

// ---------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------

export interface DiscoveredDevice {
  discoveryId: string;
  discoveryMethod: DiscoveryMethod;
  rawIdentifier: string;          // MAC, UUID, serial — for matching purposes
  name?: string;                  // Advertised name (may be spoofed — verify before trust)
  manufacturer?: string;
  model?: string;
  protocol: DeviceProtocol;
  signalStrength?: number;        // RSSI (Bluetooth/Wi-Fi)
  ipAddress?: string;
  status: DiscoveredDeviceStatus;
  discoveredAt: string;
  expiresAt: string;              // Discovery results expire
  // NOTE: This is DISCOVERY data only. It does NOT grant any permission.
}

export interface PairingSession {
  pairingSessionId: string;
  discoveryId?: string;
  deviceId?: string;              // Assigned after pairing
  accountId: string;
  method: PairingMethod;
  status: PairingStatus;
  initiatedAt: string;
  expiresAt: string;
  verificationData?: PairingVerificationData;
  failureReason?: string;
}

export interface PairingVerificationData {
  pinCode?: string;               // Shown on device screen — user enters in app
  qrPayload?: string;             // For QR-based pairing
  manufacturerChallengeToken?: string;
  // NOTE: Private keys / certs are never included in API responses
}

// ---------------------------------------------------------------
// Request / Response Shapes
// ---------------------------------------------------------------

export interface StartDiscoveryRequest {
  methods: DiscoveryMethod[];
  gatewayId?: string;
  durationSeconds?: number;       // How long to scan (default: 30)
  category?: DeviceCategory;
}

export interface StartDiscoveryResponse {
  discoveryJobId: string;
  methods: DiscoveryMethod[];
  expiresAt: string;
  message: string;
}

export interface ListDiscoveredDevicesRequest {
  discoveryJobId?: string;
  method?: DiscoveryMethod;
  includeExpired?: boolean;
}

export interface ListDiscoveredDevicesResponse {
  devices: DiscoveredDevice[];
  total: number;
  message: string;
  // Reminder: these are UNVERIFIED discovered devices
  // None have permission until explicitly paired and authorized
}

export interface VerifyDiscoveredDeviceRequest {
  discoveryId: string;
  manufacturerCredential?: string;
  ownerProof?: string;
}

export interface VerifyDiscoveredDeviceResponse {
  success: boolean;
  discoveryId: string;
  isOwnerVerified: boolean;
  requiresManufacturerCredential: boolean;
  message: string;
}

export interface InitiatePairingRequest {
  discoveryId: string;
  method: PairingMethod;
  orgId?: string;
  siteId?: string;
  buildingId?: string;
  roomId?: string;
  deviceName: string;
}

export interface InitiatePairingResponse {
  pairingSessionId: string;
  method: PairingMethod;
  verificationData?: PairingVerificationData;
  expiresAt: string;
  instructions: string;
}

export interface CompletePairingRequest {
  pairingSessionId: string;
  userVerificationCode?: string;  // PIN entered by user
  manufacturerToken?: string;
  approvalToken?: string;
}

export interface CompletePairingResponse {
  success: boolean;
  deviceId?: string;
  status: PairingStatus;
  message: string;
}

export interface UnpairDeviceRequest {
  deviceId: string;
  reason?: string;
  revokePermissions: boolean;
  wipeLocalData?: boolean;
}

export interface UnpairDeviceResponse {
  success: boolean;
  deviceId: string;
  permissionsRevoked: boolean;
  message: string;
}

// ---------------------------------------------------------------
// API Route Definitions
// ---------------------------------------------------------------

export const DISCOVERY_ROUTES = {
  // Discovery
  START_DISCOVERY:             'POST /api/v1/discovery/start',
  STOP_DISCOVERY:              'POST /api/v1/discovery/:discoveryJobId/stop',
  LIST_DISCOVERED:             'GET  /api/v1/discovery/devices',
  GET_DISCOVERED_DEVICE:       'GET  /api/v1/discovery/devices/:discoveryId',
  VERIFY_DISCOVERED_DEVICE:    'POST /api/v1/discovery/devices/:discoveryId/verify',
  DISMISS_DISCOVERED_DEVICE:   'DELETE /api/v1/discovery/devices/:discoveryId',

  // Pairing
  INITIATE_PAIRING:            'POST /api/v1/pairing/initiate',
  GET_PAIRING_STATUS:          'GET  /api/v1/pairing/:pairingSessionId',
  COMPLETE_PAIRING:            'POST /api/v1/pairing/:pairingSessionId/complete',
  CANCEL_PAIRING:              'POST /api/v1/pairing/:pairingSessionId/cancel',

  // Unpairing
  UNPAIR_DEVICE:               'POST /api/v1/devices/:deviceId/unpair',
  REPAIR_DEVICE:               'POST /api/v1/devices/:deviceId/repair',
} as const;

// ---------------------------------------------------------------
// Handler Interfaces
// ---------------------------------------------------------------

export interface DiscoveryAPIHandlers {
  startDiscovery(accountId: string, req: StartDiscoveryRequest): Promise<StartDiscoveryResponse>;
  stopDiscovery(accountId: string, discoveryJobId: string): Promise<{ success: boolean }>;
  listDiscoveredDevices(accountId: string, req: ListDiscoveredDevicesRequest): Promise<ListDiscoveredDevicesResponse>;
  verifyDiscoveredDevice(accountId: string, req: VerifyDiscoveredDeviceRequest): Promise<VerifyDiscoveredDeviceResponse>;
  dismissDiscoveredDevice(accountId: string, discoveryId: string): Promise<{ success: boolean }>;

  initiatePairing(accountId: string, req: InitiatePairingRequest): Promise<InitiatePairingResponse>;
  getPairingStatus(accountId: string, pairingSessionId: string): Promise<PairingSession>;
  completePairing(accountId: string, req: CompletePairingRequest): Promise<CompletePairingResponse>;
  cancelPairing(accountId: string, pairingSessionId: string): Promise<{ success: boolean }>;

  unpairDevice(accountId: string, req: UnpairDeviceRequest): Promise<UnpairDeviceResponse>;
}

// ---------------------------------------------------------------
// Security Rules
// ---------------------------------------------------------------

export const DISCOVERY_SECURITY_RULES = {
  /**
   * DISCOVERY NEVER EQUALS PERMISSION.
   * A found device has zero authorization until explicitly paired and
   * the owner verifies their credentials.
   */
  DISCOVERY_NEVER_GRANTS_PERMISSION: true,

  /**
   * Advertised device names may be spoofed.
   * Identity is always verified via manufacturer credentials or owner proof.
   */
  ADVERTISED_NAME_NOT_TRUSTED: true,

  /** Discovery sessions expire — found devices must be acted on within the window. */
  DISCOVERY_SESSION_EXPIRY_SECONDS: 300,

  /** Pairing sessions expire — user must complete pairing within this window. */
  PAIRING_SESSION_EXPIRY_SECONDS: 120,

  /**
   * Firmware and device credentials are verified cryptographically
   * before any pairing is accepted.
   */
  CRYPTOGRAPHIC_VERIFICATION_REQUIRED: true,
} as const;

// ---------------------------------------------------------------
// Audit Events
// ---------------------------------------------------------------

export type DiscoveryAuditEvent =
  | 'discovery.scan.started'
  | 'discovery.scan.stopped'
  | 'discovery.device.found'
  | 'discovery.device.verified'
  | 'discovery.device.verification_failed'
  | 'discovery.device.dismissed'
  | 'pairing.initiated'
  | 'pairing.completed'
  | 'pairing.failed'
  | 'pairing.cancelled'
  | 'pairing.expired'
  | 'device.unpaired'
  | 'device.repaired';
KSVEOF

cat << 'KSVEOF' > "API/gateway.ts"
// =============================================================
// KSV — Gateway API
// Domain: Edge controller bridging KSV Cloud ↔ Local Devices
// RULE: Gateway is a BRIDGE, not a Security bypass
// =============================================================

import type { DeviceProtocol } from './device';

export type GatewayStatus = 'online' | 'offline' | 'degraded' | 'maintenance' | 'updating';
export type GatewayMode = 'cloud_connected' | 'local_only' | 'hybrid';
export type GatewayType = 'home' | 'building' | 'industrial' | 'vehicle' | 'portable';

// ---------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------

export interface KSVGateway {
  gatewayId: string;
  name: string;
  type: GatewayType;
  firmwareVersion: string;
  hardwareVersion?: string;
  serialNumber?: string;
  macAddress?: string;
  ipAddress?: string;
  status: GatewayStatus;
  mode: GatewayMode;
  supportedProtocols: DeviceProtocol[];
  connectedDeviceCount: number;
  ownerAccountId: string;
  orgId?: string;
  siteId?: string;
  buildingId?: string;
  lastSeenAt?: string;
  lastSyncAt?: string;
  isOfflineCapable: boolean;
  offlineAuthEnabled: boolean;
  cpuUsage?: number;
  memUsage?: number;
  createdAt: string;
}

export interface GatewayHeartbeat {
  gatewayId: string;
  timestamp: string;
  status: GatewayStatus;
  cpuUsage: number;
  memUsage: number;
  connectedDeviceCount: number;
  pendingCommandCount: number;
  networkQuality?: 'good' | 'degraded' | 'poor';
}

export interface OfflinePolicyConfig {
  allowLocalControl: boolean;
  localControlDurationHours: number;
  allowedCapabilities: string[];
  requireLocalAuth: boolean;
  syncOnReconnect: boolean;
}

// ---------------------------------------------------------------
// Request / Response Shapes
// ---------------------------------------------------------------

export interface RegisterGatewayRequest {
  name: string;
  type: GatewayType;
  serialNumber?: string;
  orgId?: string;
  siteId?: string;
  buildingId?: string;
  supportedProtocols: DeviceProtocol[];
  isOfflineCapable: boolean;
  offlineAuthEnabled: boolean;
}

export interface RegisterGatewayResponse {
  success: boolean;
  gateway: KSVGateway;
  provisioningToken: string;      // One-time token for gateway to authenticate with cloud
  cloudEndpoint: string;
  message: string;
}

export interface UpdateGatewayRequest {
  name?: string;
  offlinePolicyConfig?: OfflinePolicyConfig;
}

export interface GatewayStatusResponse {
  gateway: KSVGateway;
  heartbeat?: GatewayHeartbeat;
  connectedDevices: Array<{ deviceId: string; protocol: DeviceProtocol; status: string }>;
}

export interface UpdateGatewayFirmwareRequest {
  gatewayId: string;
  targetVersion: string;
  signature: string;              // Must be verified before applying
  scheduleAt?: string;
}

export interface LocalCommandRequest {
  gatewayId: string;
  deviceId: string;
  capability: string;
  value: unknown;
  offlineToken?: string;          // Required when operating in offline mode
  issuedAt: string;
  expiresAt: string;
}

export interface SyncQueueResponse {
  pendingCount: number;
  commands: Array<{
    commandId: string;
    deviceId: string;
    capability: string;
    value: unknown;
    issuedAt: string;
    expiresAt: string;
  }>;
}

export interface GatewaySyncRequest {
  gatewayId: string;
  lastSyncAt?: string;
  deviceStates: Array<{
    deviceId: string;
    values: Record<string, unknown>;
    timestamp: string;
  }>;
  executedCommands: Array<{
    commandId: string;
    result: 'success' | 'failed';
    executedAt: string;
    errorMessage?: string;
  }>;
}

export interface GatewaySyncResponse {
  success: boolean;
  pendingCommands: SyncQueueResponse;
  updatedPolicies: boolean;
  message: string;
}

// ---------------------------------------------------------------
// API Route Definitions
// ---------------------------------------------------------------

export const GATEWAY_ROUTES = {
  REGISTER_GATEWAY:        'POST /api/v1/gateways',
  LIST_GATEWAYS:           'GET  /api/v1/gateways',
  GET_GATEWAY:             'GET  /api/v1/gateways/:gatewayId',
  UPDATE_GATEWAY:          'PUT  /api/v1/gateways/:gatewayId',
  DELETE_GATEWAY:          'DELETE /api/v1/gateways/:gatewayId',
  GET_GATEWAY_STATUS:      'GET  /api/v1/gateways/:gatewayId/status',

  // Heartbeat (called by gateway device, not user)
  GATEWAY_HEARTBEAT:       'POST /api/v1/gateways/:gatewayId/heartbeat',

  // Sync (called by gateway on reconnect)
  GATEWAY_SYNC:            'POST /api/v1/gateways/:gatewayId/sync',
  GET_SYNC_QUEUE:          'GET  /api/v1/gateways/:gatewayId/sync/queue',

  // Commands via gateway
  SEND_LOCAL_COMMAND:      'POST /api/v1/gateways/:gatewayId/command',

  // Firmware
  UPDATE_GATEWAY_FIRMWARE: 'POST /api/v1/gateways/:gatewayId/firmware/update',

  // Offline policy
  GET_OFFLINE_POLICY:      'GET  /api/v1/gateways/:gatewayId/offline-policy',
  UPDATE_OFFLINE_POLICY:   'PUT  /api/v1/gateways/:gatewayId/offline-policy',

  // Connected devices
  LIST_GATEWAY_DEVICES:    'GET  /api/v1/gateways/:gatewayId/devices',
} as const;

// ---------------------------------------------------------------
// Handler Interfaces
// ---------------------------------------------------------------

export interface GatewayAPIHandlers {
  registerGateway(accountId: string, req: RegisterGatewayRequest): Promise<RegisterGatewayResponse>;
  listGateways(accountId: string, orgId?: string): Promise<KSVGateway[]>;
  getGateway(gatewayId: string, accountId: string): Promise<KSVGateway>;
  updateGateway(gatewayId: string, req: UpdateGatewayRequest, accountId: string): Promise<KSVGateway>;
  deleteGateway(gatewayId: string, accountId: string): Promise<{ success: boolean }>;
  getGatewayStatus(gatewayId: string, accountId: string): Promise<GatewayStatusResponse>;

  receiveHeartbeat(gatewayId: string, heartbeat: GatewayHeartbeat): Promise<{ acknowledged: boolean }>;
  syncGateway(gatewayId: string, req: GatewaySyncRequest): Promise<GatewaySyncResponse>;
  getSyncQueue(gatewayId: string): Promise<SyncQueueResponse>;

  sendLocalCommand(accountId: string, req: LocalCommandRequest): Promise<{ commandId: string; queued: boolean }>;
  updateGatewayFirmware(req: UpdateGatewayFirmwareRequest, accountId: string): Promise<{ success: boolean; jobId: string }>;

  getOfflinePolicy(gatewayId: string, accountId: string): Promise<OfflinePolicyConfig>;
  updateOfflinePolicy(gatewayId: string, req: OfflinePolicyConfig, accountId: string): Promise<{ success: boolean }>;
}

// ---------------------------------------------------------------
// Security Rules
// ---------------------------------------------------------------

export const GATEWAY_SECURITY_RULES = {
  /** Gateway provisioning tokens are one-time use and expire quickly. */
  PROVISIONING_TOKEN_SINGLE_USE: true,
  PROVISIONING_TOKEN_EXPIRY_MINUTES: 30,

  /**
   * Gateway firmware updates must be cryptographically signed.
   * An unsigned update is rejected.
   */
  FIRMWARE_SIGNATURE_REQUIRED: true,

  /**
   * A gateway failure must NOT allow unauthenticated local access.
   * Cloud failure = fall back to offline policy, not open access.
   */
  OFFLINE_POLICY_MUST_BE_DEFINED: true,

  /**
   * Commands queued while a gateway is offline must expire.
   * Stale commands are not executed after expiry.
   */
  OFFLINE_COMMAND_EXPIRY: true,

  /**
   * Gateway is a bridge only.
   * It cannot override cloud-level permissions or safety rules.
   */
  GATEWAY_CANNOT_OVERRIDE_PERMISSIONS: true,
} as const;

// ---------------------------------------------------------------
// Audit Events
// ---------------------------------------------------------------

export type GatewayAuditEvent =
  | 'gateway.registered'
  | 'gateway.updated'
  | 'gateway.deleted'
  | 'gateway.online'
  | 'gateway.offline'
  | 'gateway.degraded'
  | 'gateway.heartbeat'
  | 'gateway.sync.completed'
  | 'gateway.firmware.update_started'
  | 'gateway.firmware.update_completed'
  | 'gateway.offline_policy.updated'
  | 'gateway.local_command.issued'
  | 'gateway.local_command.expired';
KSVEOF

cat << 'KSVEOF' > "API/identity.ts"
// =============================================================
// KSV — Identity API
// Domain: Who is this user? One KSV Account → Multiple Identities
// =============================================================

export type IdentityProvider =
  | 'email'
  | 'phone'
  | 'google'
  | 'facebook'
  | 'tiktok'
  | 'apple'
  | 'microsoft'
  | 'custom';

export type AccountStatus = 'active' | 'suspended' | 'deleted' | 'pending_verification';

export type VerificationStatus = 'verified' | 'unverified' | 'pending';

// ---------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------

export interface KSVIdentity {
  identityId: string;
  accountId: string;
  provider: IdentityProvider;
  providerUserId: string;       // ID from the external provider
  email?: string;
  phoneNumber?: string;
  countryCode?: string;
  displayName?: string;
  avatarUrl?: string;
  verificationStatus: VerificationStatus;
  linkedAt: string;             // ISO 8601
  lastUsedAt?: string;
  isPrivate: boolean;           // Provider password is never stored here
}

export interface KSVAccount {
  accountId: string;
  primaryEmail?: string;
  primaryPhone?: string;
  displayName: string;
  avatarUrl?: string;
  status: AccountStatus;
  identities: KSVIdentity[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  preferredLanguage?: string;
  preferredCountry?: string;
  preferredTimeZone?: string;
}

// ---------------------------------------------------------------
// Request / Response Shapes
// ---------------------------------------------------------------

export interface LinkIdentityRequest {
  provider: IdentityProvider;
  providerToken: string;        // OAuth token or verification token from provider
  // KSV NEVER receives the user's external password
}

export interface LinkIdentityResponse {
  success: boolean;
  identity: KSVIdentity;
  message: string;
}

export interface UnlinkIdentityRequest {
  identityId: string;
  confirmAccountId: string;
}

export interface UnlinkIdentityResponse {
  success: boolean;
  removedIdentityId: string;
  remainingIdentities: number;
  message: string;
}

export interface GetAccountResponse {
  account: KSVAccount;
}

export interface UpdateAccountRequest {
  displayName?: string;
  avatarUrl?: string;
  preferredLanguage?: string;
  preferredCountry?: string;
  preferredTimeZone?: string;
}

export interface UpdateAccountResponse {
  success: boolean;
  account: KSVAccount;
}

export interface VerifyIdentityRequest {
  identityId: string;
  verificationCode: string;     // OTP or token
}

export interface VerifyIdentityResponse {
  success: boolean;
  verificationStatus: VerificationStatus;
  message: string;
}

export interface SuspendAccountRequest {
  reason: string;
  adminId: string;
}

export interface DeleteAccountRequest {
  confirmPhrase: string;        // User must type a confirm phrase
  reason?: string;
}

export interface DeleteAccountResponse {
  success: boolean;
  scheduledDeletionAt: string;  // Data is not deleted instantly — grace period
  message: string;
}

// ---------------------------------------------------------------
// API Route Definitions
// ---------------------------------------------------------------

export const IDENTITY_ROUTES = {
  // Account
  GET_ACCOUNT:             'GET  /api/v1/identity/account',
  UPDATE_ACCOUNT:          'PUT  /api/v1/identity/account',
  DELETE_ACCOUNT:          'DELETE /api/v1/identity/account',
  SUSPEND_ACCOUNT:         'POST /api/v1/identity/account/suspend',    // Admin only

  // Linked identities
  LIST_IDENTITIES:         'GET  /api/v1/identity/identities',
  LINK_IDENTITY:           'POST /api/v1/identity/identities/link',
  UNLINK_IDENTITY:         'DELETE /api/v1/identity/identities/:identityId',
  VERIFY_IDENTITY:         'POST /api/v1/identity/identities/:identityId/verify',

  // Lookup (Admin / internal only)
  LOOKUP_BY_EMAIL:         'GET  /api/v1/identity/lookup/email/:email',
  LOOKUP_BY_PHONE:         'GET  /api/v1/identity/lookup/phone/:phone',
  LOOKUP_BY_PROVIDER:      'GET  /api/v1/identity/lookup/provider/:provider/:providerUserId',
} as const;

// ---------------------------------------------------------------
// Handler Interfaces (to be implemented by the backend service)
// ---------------------------------------------------------------

export interface IdentityAPIHandlers {
  /**
   * Returns the full account object for the authenticated user.
   * Never returns passwords or provider secrets.
   */
  getAccount(accountId: string): Promise<GetAccountResponse>;

  /**
   * Updates non-sensitive profile fields.
   */
  updateAccount(
    accountId: string,
    req: UpdateAccountRequest
  ): Promise<UpdateAccountResponse>;

  /**
   * Links a new identity provider to an existing KSV account.
   * Uses OAuth/OIDC — KSV never receives the external password.
   */
  linkIdentity(
    accountId: string,
    req: LinkIdentityRequest
  ): Promise<LinkIdentityResponse>;

  /**
   * Removes an identity provider link.
   * Requires at least one identity to remain — cannot unlink the last one.
   */
  unlinkIdentity(
    accountId: string,
    req: UnlinkIdentityRequest
  ): Promise<UnlinkIdentityResponse>;

  /**
   * Sends / re-sends verification to the identity (email or phone OTP).
   */
  verifyIdentity(
    accountId: string,
    req: VerifyIdentityRequest
  ): Promise<VerifyIdentityResponse>;

  /**
   * Schedules account deletion. Data is retained for a grace period
   * (e.g. 30 days) before permanent removal.
   */
  deleteAccount(
    accountId: string,
    req: DeleteAccountRequest
  ): Promise<DeleteAccountResponse>;

  /**
   * Admin-only: suspends an account.
   * Suspended accounts cannot log in or issue commands.
   */
  suspendAccount(
    targetAccountId: string,
    req: SuspendAccountRequest,
    adminAccountId: string
  ): Promise<{ success: boolean; message: string }>;
}

// ---------------------------------------------------------------
// Security Rules (enforced at every handler)
// ---------------------------------------------------------------

export const IDENTITY_SECURITY_RULES = {
  /**
   * KSV NEVER stores external passwords.
   * Provider authentication uses OAuth 2.0 / OpenID Connect tokens only.
   */
  NO_EXTERNAL_PASSWORD_STORAGE: true,

  /**
   * Admins can suspend or delete accounts but CANNOT read
   * user passwords, external tokens, or linked provider secrets.
   */
  ADMIN_CANNOT_READ_USER_SECRETS: true,

  /**
   * An account must always retain at least one verified identity.
   * Unlinking the last identity is rejected.
   */
  MINIMUM_ONE_VERIFIED_IDENTITY: true,

  /**
   * Account deletion is not immediate.
   * A grace period (e.g. 30 days) allows the user to cancel.
   */
  DELETION_GRACE_PERIOD_DAYS: 30,

  /**
   * Identity verification codes (OTP) expire after this many minutes.
   */
  VERIFICATION_OTP_EXPIRY_MINUTES: 10,
} as const;

// ---------------------------------------------------------------
// Audit Events produced by this domain
// ---------------------------------------------------------------

export type IdentityAuditEvent =
  | 'identity.account.viewed'
  | 'identity.account.updated'
  | 'identity.account.suspended'
  | 'identity.account.deletion_scheduled'
  | 'identity.account.deletion_cancelled'
  | 'identity.provider.linked'
  | 'identity.provider.unlinked'
  | 'identity.provider.verified'
  | 'identity.provider.verification_failed';
KSVEOF

cat << 'KSVEOF' > "API/index.ts"
// =============================================================
// KSV — API Index
// Central export point for all API domains under khoem-now/API/
// =============================================================
//
// KSV API is organized by DOMAIN, not as one giant file.
// This keeps the codebase manageable as the platform grows.
//
// NOTE ON MERGED DOMAINS:
// "Pairing" was originally listed as its own domain in the
// project concept doc, but Discovery and Pairing are tightly
// coupled in the real flow (Scan → Found → Verify → Pair →
// Ready), so both live together in discovery.ts to avoid
// splitting one continuous flow across two files.
// =============================================================

export * from './identity';
export * from './authentication';
export * from './account-recovery';
export * from './authorization';
export * from './organization';
export * from './device';
export * from './discovery';        // includes Pairing
export * from './protocol';
export * from './gateway';
export * from './command';
export * from './safety';
export * from './automation';
export * from './security';
export * from './audit';
export * from './notification';
export * from './international';
export * from './administration';

// ---------------------------------------------------------------
// Combined Route Registry
// (useful for generating API docs, OpenAPI specs, or a router table)
// ---------------------------------------------------------------

import { IDENTITY_ROUTES } from './identity';
import { AUTHENTICATION_ROUTES } from './authentication';
import { ACCOUNT_RECOVERY_ROUTES } from './account-recovery';
import { AUTHORIZATION_ROUTES } from './authorization';
import { ORGANIZATION_ROUTES } from './organization';
import { DEVICE_ROUTES } from './device';
import { DISCOVERY_ROUTES } from './discovery';
import { PROTOCOL_ROUTES } from './protocol';
import { GATEWAY_ROUTES } from './gateway';
import { COMMAND_ROUTES } from './command';
import { SAFETY_ROUTES } from './safety';
import { AUTOMATION_ROUTES } from './automation';
import { SECURITY_ROUTES } from './security';
import { AUDIT_ROUTES } from './audit';
import { NOTIFICATION_ROUTES } from './notification';
import { INTERNATIONAL_ROUTES } from './international';
import { ADMINISTRATION_ROUTES } from './administration';

export const KSV_API_ROUTE_REGISTRY = {
  identity: IDENTITY_ROUTES,
  authentication: AUTHENTICATION_ROUTES,
  accountRecovery: ACCOUNT_RECOVERY_ROUTES,
  authorization: AUTHORIZATION_ROUTES,
  organization: ORGANIZATION_ROUTES,
  device: DEVICE_ROUTES,
  discovery: DISCOVERY_ROUTES,        // includes pairing routes
  protocol: PROTOCOL_ROUTES,
  gateway: GATEWAY_ROUTES,
  command: COMMAND_ROUTES,
  safety: SAFETY_ROUTES,
  automation: AUTOMATION_ROUTES,
  security: SECURITY_ROUTES,
  audit: AUDIT_ROUTES,
  notification: NOTIFICATION_ROUTES,
  international: INTERNATIONAL_ROUTES,
  administration: ADMINISTRATION_ROUTES,
} as const;

// ---------------------------------------------------------------
// Domain File Map — 17 files covering the 18 domains
// named in the original KSV project concept
// ---------------------------------------------------------------

export const KSV_API_DOMAIN_FILES = [
  { domain: 'Identity',        file: 'identity.ts' },
  { domain: 'Authentication',  file: 'authentication.ts' },
  { domain: 'Account Recovery',file: 'account-recovery.ts' },
  { domain: 'Authorization',   file: 'authorization.ts' },
  { domain: 'Organization',    file: 'organization.ts' },
  { domain: 'Device',          file: 'device.ts' },
  { domain: 'Discovery',       file: 'discovery.ts' },
  { domain: 'Pairing',         file: 'discovery.ts (merged)' },
  { domain: 'Protocol',        file: 'protocol.ts' },
  { domain: 'Gateway',         file: 'gateway.ts' },
  { domain: 'Command',         file: 'command.ts' },
  { domain: 'Safety',          file: 'safety.ts' },
  { domain: 'Automation',      file: 'automation.ts' },
  { domain: 'Security',        file: 'security.ts' },
  { domain: 'Audit',           file: 'audit.ts' },
  { domain: 'Notification',    file: 'notification.ts' },
  { domain: 'International',   file: 'international.ts' },
  { domain: 'Administration',  file: 'administration.ts' },
] as const;
KSVEOF

cat << 'KSVEOF' > "API/international.ts"
// ====================================
