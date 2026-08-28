// =============================================================
// KSV — Organization API
// Domain: Company → Site → Building → Room → Devices → Users → Roles
// Supports both Personal (Smart Home) and Enterprise/Industrial use
// =============================================================

export type OrgType = 'personal' | 'family' | 'company' | 'government' | 'ngo' | 'other';
export type MemberRole = 'owner' | 'admin' | 'manager' | 'operator' | 'viewer' | 'guest';
export type SiteType = 'office' | 'factory' | 'warehouse' | 'residential' | 'commercial' | 'industrial' | 'mixed';
export type BuildingType = 'main' | 'annex' | 'warehouse' | 'parking' | 'utility' | 'residential';

// ---------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------

export interface KSVOrganization {
  orgId: string;
  name: string;
  type: OrgType;
  countryCode: string;
  timezone: string;
  primaryLanguage: string;
  logoUrl?: string;
  ownerAccountId: string;
  memberCount: number;
  siteCount: number;
  deviceCount: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  subscription?: OrgSubscription;
}

export interface OrgSubscription {
  plan: 'free' | 'personal' | 'business' | 'enterprise';
  maxMembers: number;
  maxDevices: number;
  maxSites: number;
  validUntil?: string;
}

export interface KSVSite {
  siteId: string;
  orgId: string;
  name: string;
  type: SiteType;
  address?: string;
  countryCode?: string;
  timezone?: string;
  buildingCount: number;
  deviceCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface KSVBuilding {
  buildingId: string;
  siteId: string;
  orgId: string;
  name: string;
  type: BuildingType;
  floorCount?: number;
  roomCount: number;
  deviceCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface KSVRoom {
  roomId: string;
  buildingId: string;
  siteId: string;
  orgId: string;
  name: string;
  floor?: number;
  deviceCount: number;
  isActive: boolean;
}

export interface KSVOrgMember {
  memberId: string;
  orgId: string;
  accountId: string;
  displayName: string;
  email?: string;
  role: MemberRole;
  joinedAt: string;
  invitedBy: string;
  isActive: boolean;
  lastActivityAt?: string;
}

export interface KSVOrgPolicy {
  policyId: string;
  orgId: string;
  name: string;
  description?: string;
  rules: PolicyRule[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyRule {
  ruleId: string;
  resourceType: string;
  actions: string[];
  conditions?: Record<string, unknown>;
  effect: 'allow' | 'deny';
}

// ---------------------------------------------------------------
// Request / Response Shapes
// ---------------------------------------------------------------

export interface CreateOrgRequest {
  name: string;
  type: OrgType;
  countryCode: string;
  timezone: string;
  primaryLanguage: string;
  logoUrl?: string;
}

export interface UpdateOrgRequest {
  name?: string;
  logoUrl?: string;
  primaryLanguage?: string;
}

export interface CreateSiteRequest {
  name: string;
  type: SiteType;
  address?: string;
  countryCode?: string;
  timezone?: string;
}

export interface CreateBuildingRequest {
  siteId: string;
  name: string;
  type: BuildingType;
  floorCount?: number;
}

export interface CreateRoomRequest {
  buildingId: string;
  name: string;
  floor?: number;
}

export interface InviteMemberRequest {
  email: string;
  role: MemberRole;
  siteAccess?: string[];
  expiresAt?: string;
  message?: string;
}

export interface InviteMemberResponse {
  success: boolean;
  invitationId: string;
  invitedEmail: string;
  role: MemberRole;
  expiresAt: string;
  message: string;
}

export interface UpdateMemberRoleRequest {
  memberId: string;
  newRole: MemberRole;
  reason?: string;
}

export interface RemoveMemberRequest {
  memberId: string;
  reason?: string;
  revokeDeviceAccess: boolean;
}

// ---------------------------------------------------------------
// API Route Definitions
// ---------------------------------------------------------------

export const ORGANIZATION_ROUTES = {
  // Organizations
  CREATE_ORG:              'POST /api/v1/orgs',
  LIST_MY_ORGS:            'GET  /api/v1/orgs',
  GET_ORG:                 'GET  /api/v1/orgs/:orgId',
  UPDATE_ORG:              'PUT  /api/v1/orgs/:orgId',
  DELETE_ORG:              'DELETE /api/v1/orgs/:orgId',

  // Sites
  CREATE_SITE:             'POST /api/v1/orgs/:orgId/sites',
  LIST_SITES:              'GET  /api/v1/orgs/:orgId/sites',
  GET_SITE:                'GET  /api/v1/orgs/:orgId/sites/:siteId',
  UPDATE_SITE:             'PUT  /api/v1/orgs/:orgId/sites/:siteId',
  DELETE_SITE:             'DELETE /api/v1/orgs/:orgId/sites/:siteId',

  // Buildings
  CREATE_BUILDING:         'POST /api/v1/orgs/:orgId/sites/:siteId/buildings',
  LIST_BUILDINGS:          'GET  /api/v1/orgs/:orgId/sites/:siteId/buildings',
  GET_BUILDING:            'GET  /api/v1/orgs/:orgId/sites/:siteId/buildings/:buildingId',
  UPDATE_BUILDING:         'PUT  /api/v1/orgs/:orgId/sites/:siteId/buildings/:buildingId',
  DELETE_BUILDING:         'DELETE /api/v1/orgs/:orgId/sites/:siteId/buildings/:buildingId',

  // Rooms
  CREATE_ROOM:             'POST /api/v1/orgs/:orgId/sites/:siteId/buildings/:buildingId/rooms',
  LIST_ROOMS:              'GET  /api/v1/orgs/:orgId/sites/:siteId/buildings/:buildingId/rooms',
  UPDATE_ROOM:             'PUT  /api/v1/orgs/:orgId/sites/:siteId/buildings/:buildingId/rooms/:roomId',
  DELETE_ROOM:             'DELETE /api/v1/orgs/:orgId/sites/:siteId/buildings/:buildingId/rooms/:roomId',

  // Members
  INVITE_MEMBER:           'POST /api/v1/orgs/:orgId/members/invite',
  LIST_MEMBERS:            'GET  /api/v1/orgs/:orgId/members',
  GET_MEMBER:              'GET  /api/v1/orgs/:orgId/members/:memberId',
  UPDATE_MEMBER_ROLE:      'PUT  /api/v1/orgs/:orgId/members/:memberId/role',
  REMOVE_MEMBER:           'DELETE /api/v1/orgs/:orgId/members/:memberId',

  // Policies
  CREATE_POLICY:           'POST /api/v1/orgs/:orgId/policies',
  LIST_POLICIES:           'GET  /api/v1/orgs/:orgId/policies',
  GET_POLICY:              'GET  /api/v1/orgs/:orgId/policies/:policyId',
  UPDATE_POLICY:           'PUT  /api/v1/orgs/:orgId/policies/:policyId',
  DELETE_POLICY:           'DELETE /api/v1/orgs/:orgId/policies/:policyId',
} as const;

// ---------------------------------------------------------------
// Handler Interfaces
// ---------------------------------------------------------------

export interface OrganizationAPIHandlers {
  createOrg(accountId: string, req: CreateOrgRequest): Promise<KSVOrganization>;
  listMyOrgs(accountId: string): Promise<KSVOrganization[]>;
  getOrg(orgId: string, requestingAccountId: string): Promise<KSVOrganization>;
  updateOrg(orgId: string, req: UpdateOrgRequest, accountId: string): Promise<KSVOrganization>;
  deleteOrg(orgId: string, accountId: string, confirmPhrase: string): Promise<{ success: boolean }>;

  createSite(orgId: string, req: CreateSiteRequest, accountId: string): Promise<KSVSite>;
  listSites(orgId: string, accountId: string): Promise<KSVSite[]>;
  getSite(orgId: string, siteId: string, accountId: string): Promise<KSVSite>;
  updateSite(orgId: string, siteId: string, req: CreateSiteRequest, accountId: string): Promise<KSVSite>;
  deleteSite(orgId: string, siteId: string, accountId: string): Promise<{ success: boolean }>;

  createBuilding(orgId: string, siteId: string, req: CreateBuildingRequest, accountId: string): Promise<KSVBuilding>;
  listBuildings(orgId: string, siteId: string, accountId: string): Promise<KSVBuilding[]>;
  updateBuilding(orgId: string, siteId: string, buildingId: string, req: CreateBuildingRequest, accountId: string): Promise<KSVBuilding>;
  deleteBuilding(orgId: string, siteId: string, buildingId: string, accountId: string): Promise<{ success: boolean }>;

  createRoom(orgId: string, siteId: string, buildingId: string, req: CreateRoomRequest, accountId: string): Promise<KSVRoom>;
  listRooms(orgId: string, siteId: string, buildingId: string, accountId: string): Promise<KSVRoom[]>;
  updateRoom(orgId: string, siteId: string, buildingId: string, roomId: string, req: CreateRoomRequest, accountId: string): Promise<KSVRoom>;
  deleteRoom(orgId: string, siteId: string, buildingId: string, roomId: string, accountId: string): Promise<{ success: boolean }>;

  inviteMember(orgId: string, req: InviteMemberRequest, inviterAccountId: string): Promise<InviteMemberResponse>;
  listMembers(orgId: string, accountId: string): Promise<KSVOrgMember[]>;
  getMember(orgId: string, memberId: string, accountId: string): Promise<KSVOrgMember>;
  updateMemberRole(orgId: string, req: UpdateMemberRoleRequest, accountId: string): Promise<KSVOrgMember>;
  removeMember(orgId: string, req: RemoveMemberRequest, adminAccountId: string): Promise<{ success: boolean }>;
}

// ---------------------------------------------------------------
// Audit Events
// ---------------------------------------------------------------

export type OrganizationAuditEvent =
  | 'org.created'
  | 'org.updated'
  | 'org.deleted'
  | 'org.site.created'
  | 'org.site.updated'
  | 'org.site.deleted'
  | 'org.building.created'
  | 'org.building.deleted'
  | 'org.room.created'
  | 'org.room.deleted'
  | 'org.member.invited'
  | 'org.member.joined'
  | 'org.member.role_changed'
  | 'org.member.removed'
  | 'org.policy.created'
  | 'org.policy.updated'
  | 'org.policy.deleted';

// ---------------------------------------------------------------
// Security Rules
// ---------------------------------------------------------------

export const ORGANIZATION_SECURITY_RULES = {
  /** Only the org owner can delete the organization. Requires a confirm phrase. */
  ONLY_OWNER_CAN_DELETE_ORG: true,

  /** An organization must always retain at least one owner-level member. */
  MINIMUM_ONE_OWNER_REQUIRED: true,

  /** A member cannot assign a role higher than their own to someone else. */
  CANNOT_ASSIGN_ROLE_ABOVE_OWN: true,

  /** Removing a member revokes their device access unless explicitly retained. */
  MEMBER_REMOVAL_REVOKES_DEVICE_ACCESS_BY_DEFAULT: true,

  /** Devices must be reassigned or decommissioned before a site/building/room can be deleted. */
  CANNOT_DELETE_LOCATION_WITH_ACTIVE_DEVICES: true,
} as const;

// ---------------------------------------------------------------
// Security Rules
// ---------------------------------------------------------------

export const ORGANIZATION_SECURITY_RULES = {
  /** Only the org owner can delete the organization. Requires a confirm phrase. */
  ONLY_OWNER_CAN_DELETE_ORG: true,

  /** An organization must always retain at least one owner-level member. */
  MINIMUM_ONE_OWNER_REQUIRED: true,

  /** A member cannot assign a role higher than their own to someone else. */
  CANNOT_ASSIGN_ROLE_ABOVE_OWN: true,

  /** Removing a member revokes their device access unless explicitly retained. */
  MEMBER_REMOVAL_REVOKES_DEVICE_ACCESS_BY_DEFAULT: true,

  /** Devices must be reassigned or decommissioned before a site/building/room can be deleted. */
  CANNOT_DELETE_LOCATION_WITH_ACTIVE_DEVICES: true,
} as const;
