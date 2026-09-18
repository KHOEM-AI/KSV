import { Device, Permission, Site, User } from "@/infrastructure/database/models";

export type PermissionLevel =
  | "owner"
  | "super_admin"
  | "org_admin"
  | "manager"
  | "operator"
  | "controller"
  | "viewer"
  | "guest"
  | "temporary";

export type PermissionAction =
  | "read"
  | "write"
  | "control"
  | "pair"
  | "unpair"
  | "manage_permissions"
  | "delete"
  | "transfer_ownership"
  | "emergency_stop"
  | "view_audit"
  | "manage_organization";

export type PermissionResourceType =
  | "device"
  | "device_group"
  | "organization"
  | "site"
  | "building"
  | "room"
  | "gateway"
  | "protocol"
  | "audit_log"
  | "user_management";

export interface PermissionCheckContext {
  currentTime?: string;
  locationSiteId?: string;
  locationBuildingId?: string;
}

export interface PermissionCheckInput {
  accountId: string;
  organizationId: string;
  resourceType: PermissionResourceType;
  resourceId: string;
  action: PermissionAction;
  context?: PermissionCheckContext;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  permissionId?: string;
  requiresApproval?: boolean;
  approverAccountId?: string;
  conditionsFailed?: string[];
}

const PERMISSION_LEVEL_RANK: Record<PermissionLevel, number> = {
  temporary: 0,
  guest: 1,
  viewer: 2,
  controller: 3,
  operator: 4,
  manager: 5,
  org_admin: 6,
  super_admin: 7,
  owner: 8,
};

function isPermissionLevel(value: unknown): value is PermissionLevel {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(PERMISSION_LEVEL_RANK, value)
  );
}

function isExpired(expiresAt?: Date | null, now = new Date()): boolean {
  return expiresAt instanceof Date && expiresAt.getTime() <= now.getTime();
}

function matchesTimeCondition(
  timeFrom: string | undefined,
  timeTo: string | undefined,
  now: Date,
): boolean {
  if (!timeFrom && !timeTo) return true;
  if (!timeFrom || !timeTo) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [fromHour, fromMinute] = timeFrom.split(":").map(Number);
  const [toHour, toMinute] = timeTo.split(":").map(Number);

  if (
    !Number.isInteger(fromHour) ||
    !Number.isInteger(fromMinute) ||
    !Number.isInteger(toHour) ||
    !Number.isInteger(toMinute) ||
    fromHour < 0 ||
    fromHour > 23 ||
    toHour < 0 ||
    toHour > 23 ||
    fromMinute < 0 ||
    fromMinute > 59 ||
    toMinute < 0 ||
    toMinute > 59
  ) {
    return false;
  }

  const from = fromHour * 60 + fromMinute;
  const to = toHour * 60 + toMinute;

  if (from === to) return true;
  if (from < to) return currentMinutes >= from && currentMinutes < to;

  return currentMinutes >= from || currentMinutes < to;
}

function matchesDaysCondition(daysOfWeek: unknown, now: Date): boolean {
  if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) return true;

  const today = now.getDay();

  return daysOfWeek.includes(today);
}

export async function checkPermission(
  input: PermissionCheckInput,
): Promise<PermissionCheckResult> {
  const {
    accountId,
    organizationId,
    resourceType,
    resourceId,
    action,
    context,
  } = input;

  if (!accountId || !organizationId || !resourceId) {
    return {
      allowed: false,
      reason: "INVALID_PERMISSION_REQUEST",
    };
  }

  const user = await User.findOne({
    _id: accountId,
    organizationId,
    isActive: true,
  })
    .select("_id organizationId")
    .lean();

  if (!user) {
    return {
      allowed: false,
      reason: "ACCOUNT_NOT_IN_ORGANIZATION",
    };
  }

  /*
   * Resource ownership/tenant validation.
   *
   * We deliberately validate resources before permission evaluation.
   * Organization membership must never become implicit permission.
   */
  if (resourceType === "device") {
    const device = await Device.findOne({
      _id: resourceId,
      organizationId,
    })
      .select("_id organizationId")
      .lean();

    if (!device) {
      return {
        allowed: false,
        reason: "RESOURCE_NOT_IN_ORGANIZATION",
      };
    }
  }

  if (resourceType === "site") {
    const site = await Site.findOne({
      _id: resourceId,
      organizationId,
    })
      .select("_id organizationId")
      .lean();

    if (!site) {
      return {
        allowed: false,
        reason: "RESOURCE_NOT_IN_ORGANIZATION",
      };
    }
  }

  if (resourceType === "organization" && resourceId !== organizationId) {
    return {
      allowed: false,
      reason: "RESOURCE_NOT_IN_ORGANIZATION",
    };
  }

  const permission = await Permission.findOne({
    organizationId,
    accountId,
    resourceType,
    resourceId,
    actions: action,
    isRevoked: false,
  })
    .select(
      "_id level expiresAt conditions",
    )
    .lean();

  if (!permission) {
    return {
      allowed: false,
      reason: "PERMISSION_NOT_FOUND",
    };
  }

  const now = context?.currentTime
    ? new Date(context.currentTime)
    : new Date();

  if (Number.isNaN(now.getTime())) {
    return {
      allowed: false,
      reason: "INVALID_CONTEXT_TIME",
    };
  }

  if (isExpired(permission.expiresAt, now)) {
    return {
      allowed: false,
      reason: "PERMISSION_EXPIRED",
      permissionId: String(permission._id),
    };
  }

  if (!isPermissionLevel(permission.level)) {
    return {
      allowed: false,
      reason: "INVALID_PERMISSION_LEVEL",
      permissionId: String(permission._id),
    };
  }

  const conditionsFailed: string[] = [];
  const conditions = permission.conditions;

  if (conditions) {
    if (!matchesTimeCondition(conditions.timeFrom, conditions.timeTo, now)) {
      conditionsFailed.push("TIME_RESTRICTION");
    }

    if (!matchesDaysCondition(conditions.daysOfWeek, now)) {
      conditionsFailed.push("DAY_RESTRICTION");
    }

    const location = conditions.locationRestriction;

    if (location) {
      if (location.type === "site") {
        if (
          !context?.locationSiteId ||
          context.locationSiteId !== location.siteId
        ) {
          conditionsFailed.push("SITE_RESTRICTION");
        }
      }

      if (location.type === "building") {
        if (
          !context?.locationBuildingId ||
          context.locationBuildingId !== location.buildingId
        ) {
          conditionsFailed.push("BUILDING_RESTRICTION");
        }
      }

      if (location.type === "gps_radius") {
        // GPS is intentionally unsupported by the current PermissionCheckContext.
        // Fail closed instead of pretending GPS verification occurred.
        conditionsFailed.push("GPS_CONTEXT_UNAVAILABLE");
      }
    }
  }

  if (conditionsFailed.length > 0) {
    return {
      allowed: false,
      reason: "PERMISSION_CONDITIONS_FAILED",
      permissionId: String(permission._id),
      conditionsFailed,
    };
  }

  if (conditions?.maxUsageCount !== undefined) {
    const currentUsageCount = conditions.currentUsageCount ?? 0;

    if (currentUsageCount >= conditions.maxUsageCount) {
      return {
        allowed: false,
        reason: "PERMISSION_USAGE_LIMIT_REACHED",
        permissionId: String(permission._id),
      };
    }
  }

  if (conditions?.requiresApproval) {
    return {
      allowed: false,
      reason: "APPROVAL_REQUIRED",
      permissionId: String(permission._id),
      requiresApproval: true,
      approverAccountId: permission.conditions.approverAccountId
        ? String(permission.conditions.approverAccountId)
        : undefined,
    };
  }

  return {
    allowed: true,
    permissionId: String(permission._id),
  };
}

export function permissionLevelAtLeast(
  actual: PermissionLevel,
  required: PermissionLevel,
): boolean {
  return PERMISSION_LEVEL_RANK[actual] >= PERMISSION_LEVEL_RANK[required];
}

export { PERMISSION_LEVEL_RANK };
