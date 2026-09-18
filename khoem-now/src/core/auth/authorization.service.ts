import {
  Device,
  Organization,
  Permission,
  Site,
  User,
} from "../../infrastructure/database/models.ts";
import {
  checkPermission,
  permissionLevelAtLeast,
  type PermissionAction,
  type PermissionCheckContext,
  type PermissionLevel,
  type PermissionResourceType,
} from "./authorization.engine.ts";
import { recordAuditEntry } from "../security/audit.log.ts";

const SUPPORTED_RESOURCE_TYPES: PermissionResourceType[] = [
  "organization",
  "site",
  "device",
];

const PERMISSION_LEVELS: PermissionLevel[] = [
  "temporary",
  "guest",
  "viewer",
  "controller",
  "operator",
  "manager",
  "org_admin",
  "super_admin",
  "owner",
];

function isSupportedResourceType(
  value: string,
): value is PermissionResourceType {
  return SUPPORTED_RESOURCE_TYPES.includes(value as PermissionResourceType);
}

function isPermissionLevel(value: string): value is PermissionLevel {
  return PERMISSION_LEVELS.includes(value as PermissionLevel);
}

function isValidAction(value: string): value is PermissionAction {
  return [
    "read",
    "write",
    "control",
    "pair",
    "unpair",
    "manage_permissions",
    "delete",
    "transfer_ownership",
    "emergency_stop",
    "view_audit",
    "manage_organization",
  ].includes(value as PermissionAction);
}

async function validateOrganization(
  organizationId: string,
): Promise<boolean> {
  if (!organizationId) return false;

  const organization = await Organization.findById(organizationId)
    .select("_id")
    .lean();

  return Boolean(organization);
}

async function validateAccountInOrganization(
  accountId: string,
  organizationId: string,
): Promise<boolean> {
  if (!accountId || !organizationId) return false;

  const user = await User.findOne({
    _id: accountId,
    organizationId,
    isActive: true,
  })
    .select("_id")
    .lean();

  return Boolean(user);
}

async function validateResourceInOrganization(
  organizationId: string,
  resourceType: PermissionResourceType,
  resourceId: string,
): Promise<boolean> {
  if (!organizationId || !resourceId) return false;

  switch (resourceType) {
    case "organization": {
      return resourceId === organizationId &&
        await validateOrganization(organizationId);
    }

    case "site": {
      const site = await Site.findOne({
        _id: resourceId,
        organizationId,
      })
        .select("_id")
        .lean();

      return Boolean(site);
    }

    case "device": {
      const device = await Device.findOne({
        _id: resourceId,
        organizationId,
      })
        .select("_id")
        .lean();

      return Boolean(device);
    }

    default:
      return false;
  }
}

async function getHighestGrantingLevel(
  accountId: string,
  organizationId: string,
  resourceType: PermissionResourceType,
  resourceId: string,
): Promise<PermissionLevel | null> {
  const permissions = await Permission.find({
    organizationId,
    accountId,
    resourceType,
    resourceId,
    isRevoked: false,
  })
    .select("level expiresAt")
    .lean();

  const now = new Date();
  let highest: PermissionLevel | null = null;

  for (const permission of permissions) {
    if (
      permission.expiresAt &&
      permission.expiresAt.getTime() <= now.getTime()
    ) {
      continue;
    }

    if (!isPermissionLevel(permission.level)) {
      continue;
    }

    if (
      highest === null ||
      permissionLevelAtLeast(permission.level, highest)
    ) {
      highest = permission.level;
    }
  }

  return highest;
}

export interface GrantPermissionInput {
  granterAccountId: string;
  organizationId: string;
  targetAccountId: string;
  resourceType: PermissionResourceType;
  resourceId: string;
  actions: PermissionAction[];
  level: PermissionLevel;
  expiresAt?: Date;
  conditions?: Record<string, unknown>;
  reason?: string;
}

export interface GrantPermissionResult {
  success: boolean;
  permissionId?: string;
  message: string;
}

export async function grantPermission(
  input: GrantPermissionInput,
): Promise<GrantPermissionResult> {
  const {
    granterAccountId,
    organizationId,
    targetAccountId,
    resourceType,
    resourceId,
    actions,
    level,
    expiresAt,
    conditions,
    reason,
  } = input;

  if (
    !granterAccountId ||
    !organizationId ||
    !targetAccountId ||
    !resourceId
  ) {
    return {
      success: false,
      message: "INVALID_PERMISSION_REQUEST",
    };
  }

  if (!isSupportedResourceType(resourceType)) {
    return {
      success: false,
      message: "UNSUPPORTED_RESOURCE_TYPE",
    };
  }

  if (!isPermissionLevel(level)) {
    return {
      success: false,
      message: "INVALID_PERMISSION_LEVEL",
    };
  }

  if (actions.length === 0 || actions.some((action) => !isValidAction(action))) {
    return {
      success: false,
      message: "INVALID_PERMISSION_ACTION",
    };
  }

  if (expiresAt && expiresAt.getTime() <= Date.now()) {
    return {
      success: false,
      message: "INVALID_EXPIRATION",
    };
  }

  if (!(await validateOrganization(organizationId))) {
    return {
      success: false,
      message: "ORGANIZATION_NOT_FOUND",
    };
  }

  if (
    !(await validateAccountInOrganization(
      granterAccountId,
      organizationId,
    ))
  ) {
    return {
      success: false,
      message: "GRANTER_NOT_IN_ORGANIZATION",
    };
  }

  if (
    !(await validateAccountInOrganization(
      targetAccountId,
      organizationId,
    ))
  ) {
    return {
      success: false,
      message: "TARGET_ACCOUNT_NOT_IN_ORGANIZATION",
    };
  }

  if (
    !(await validateResourceInOrganization(
      organizationId,
      resourceType,
      resourceId,
    ))
  ) {
    return {
      success: false,
      message: "RESOURCE_NOT_IN_ORGANIZATION",
    };
  }

  const granterLevel = await getHighestGrantingLevel(
    granterAccountId,
    organizationId,
    resourceType,
    resourceId,
  );

  if (!granterLevel) {
    await recordAuditEntry({
      userId: granterAccountId,
      organizationId,
      action: "authz:permission_grant",
      result: "BLOCKED",
      context: {
        reason: "Granter has no permission on the resource",
        code: "GRANTER_PERMISSION_NOT_FOUND",
      },
      details: {
        targetAccountId,
        resourceType,
        resourceId,
        actions,
        requestedLevel: level,
        reason,
      },
    });

    return {
      success: false,
      message: "GRANTER_PERMISSION_NOT_FOUND",
    };
  }

  if (!permissionLevelAtLeast(granterLevel, level)) {
    await recordAuditEntry({
      userId: granterAccountId,
      organizationId,
      action: "authz:permission_grant",
      result: "BLOCKED",
      context: {
        reason: "Cannot grant permission above granter level",
        code: "CANNOT_GRANT_ABOVE_OWN_LEVEL",
      },
      details: {
        targetAccountId,
        resourceType,
        resourceId,
        actions,
        granterLevel,
        requestedLevel: level,
        reason,
      },
    });

    return {
      success: false,
      message: "CANNOT_GRANT_ABOVE_OWN_LEVEL",
    };
  }

  const existing = await Permission.findOne({
    organizationId,
    accountId: targetAccountId,
    resourceType,
    resourceId,
    isRevoked: false,
    actions: { $all: actions, $size: actions.length },
  })
    .select("_id")
    .lean();

  if (existing) {
    return {
      success: false,
      message: "PERMISSION_ALREADY_EXISTS",
    };
  }

  const permission = await Permission.create({
    organizationId,
    accountId: targetAccountId,
    resourceType,
    resourceId,
    actions,
    level,
    grantedBy: granterAccountId,
    expiresAt,
    conditions,
    isRevoked: false,
  });

  await recordAuditEntry({
    userId: granterAccountId,
    organizationId,
    action: "authz:permission_grant",
    result: "SUCCESS",
    context: { reason },
    details: {
      permissionId: String(permission._id),
      targetAccountId,
      resourceType,
      resourceId,
      actions,
      level,
      expiresAt: expiresAt?.toISOString(),
    },
  });

  return {
    success: true,
    permissionId: String(permission._id),
    message: "PERMISSION_GRANTED",
  };
}

export async function revokePermission(
  revokerAccountId: string,
  organizationId: string,
  permissionId: string,
  reason?: string,
): Promise<{ success: boolean; message: string }> {
  if (!revokerAccountId || !organizationId || !permissionId) {
    return {
      success: false,
      message: "INVALID_PERMISSION_REQUEST",
    };
  }

  const permission = await Permission.findOne({
    _id: permissionId,
    organizationId,
    isRevoked: false,
  }).lean();

  if (!permission) {
    return {
      success: false,
      message: "PERMISSION_NOT_FOUND",
    };
  }

  if (!isSupportedResourceType(permission.resourceType)) {
    return {
      success: false,
      message: "UNSUPPORTED_RESOURCE_TYPE",
    };
  }

  const revokerLevel = await getHighestGrantingLevel(
    revokerAccountId,
    organizationId,
    permission.resourceType,
    permission.resourceId,
  );

  if (!revokerLevel) {
    await recordAuditEntry({
      userId: revokerAccountId,
      organizationId,
      action: "authz:permission_revoke",
      result: "BLOCKED",
      context: {
        reason: "Revoker has no permission on the resource",
        code: "REVOKER_PERMISSION_NOT_FOUND",
      },
      details: { permissionId },
    });

    return {
      success: false,
      message: "REVOKER_PERMISSION_NOT_FOUND",
    };
  }

  if (
    !isPermissionLevel(permission.level) ||
    !permissionLevelAtLeast(revokerLevel, permission.level)
  ) {
    return {
      success: false,
      message: "INSUFFICIENT_PERMISSION_LEVEL",
    };
  }

  const updated = await Permission.updateOne(
    {
      _id: permissionId,
      organizationId,
      isRevoked: false,
    },
    {
      $set: { isRevoked: true },
    },
  );

  if (updated.modifiedCount !== 1) {
    return {
      success: false,
      message: "PERMISSION_REVOKE_CONFLICT",
    };
  }

  await recordAuditEntry({
    userId: revokerAccountId,
    organizationId,
    action: "authz:permission_revoke",
    result: "SUCCESS",
    context: { reason },
    details: {
      permissionId,
      targetAccountId: String(permission.accountId),
      resourceType: permission.resourceType,
      resourceId: permission.resourceId,
    },
  });

  return {
    success: true,
    message: "PERMISSION_REVOKED",
  };
}

export async function checkAuthorization(
  input: {
    accountId: string;
    organizationId: string;
    resourceType: PermissionResourceType;
    resourceId: string;
    action: PermissionAction;
    context?: PermissionCheckContext;
  },
) {
  if (!isSupportedResourceType(input.resourceType)) {
    return {
      allowed: false,
      reason: "UNSUPPORTED_RESOURCE_TYPE",
    };
  }

  if (!isValidAction(input.action)) {
    return {
      allowed: false,
      reason: "INVALID_PERMISSION_ACTION",
    };
  }

  if (
    !(await validateResourceInOrganization(
      input.organizationId,
      input.resourceType,
      input.resourceId,
    ))
  ) {
    return {
      allowed: false,
      reason: "RESOURCE_NOT_IN_ORGANIZATION",
    };
  }

  const result = await checkPermission(input);

  await recordAuditEntry({
    userId: input.accountId,
    organizationId: input.organizationId,
    action: "authz:permission_check",
    result: result.allowed ? "SUCCESS" : "BLOCKED",
    context: {
      reason: result.reason,
      code: result.reason,
    },
    details: {
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      action: input.action,
      permissionId: result.permissionId,
      conditionsFailed: result.conditionsFailed,
    },
  });

  return result;
}
