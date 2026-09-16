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
