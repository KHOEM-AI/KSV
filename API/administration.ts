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
