/**
 * KSV — RBAC (Role-Based Access Control) Policy
 * Location in project: src/core/auth/rbac.policy.ts
 *
 * Purpose (per KSV Security Design, section 7 — Authorization System):
 *   User Command → Authentication → AUTHORIZATION → Device Capability → Safety → Execute
 *
 * This file answers "what is this authenticated user ALLOWED to do?".
 * It assumes `authenticate` (auth.middleware.ts) has already run and
 * populated req.user — this middleware must always run AFTER authenticate.
 *
 * Design follows the KSV role hierarchy (section 7):
 *   Owner > SuperAdmin > OrgAdmin > Manager > Operator > Controller > Viewer > Guest
 */

import type { Request, Response, NextFunction } from "express";

// ---- Role hierarchy -----------------------------------------------------
// Higher number = more privilege. Used for "at least this role" checks.
export const ROLE_RANK: Record<string, number> = {
  Guest: 0,
  Viewer: 1,
  Controller: 2,
  Operator: 3,
  Manager: 4,
  OrgAdmin: 5,
  SuperAdmin: 6,
  Owner: 7,
};

export type KsvRole = keyof typeof ROLE_RANK;

// ---- Permission model -----------------------------------------------------
// A permission is a simple "resource:action" string, e.g. "device:command".
// Roles map to the set of permissions they hold. Keep this table as the
// single source of truth — do not scatter role checks across controllers.
const ROLE_PERMISSIONS: Record<KsvRole, string[]> = {
  Guest: [],
  Viewer: ["device:read", "org:read"],
  Controller: ["device:read", "device:command"],
  Operator: ["device:read", "device:command", "device:pair", "automation:read"],
  Manager: [
    "device:read",
    "device:command",
    "device:pair",
    "device:manage",
    "automation:read",
    "automation:manage",
    "org:read",
  ],
  OrgAdmin: [
    "device:read",
    "device:command",
    "device:pair",
    "device:manage",
    "automation:read",
    "automation:manage",
    "org:read",
    "org:manage",
    "user:manage",
    "audit:read",
  ],
  SuperAdmin: [
    "device:*",
    "automation:*",
    "org:*",
    "user:*",
    "audit:read",
    "security:manage",
  ],
  Owner: ["*"], // full platform control — grant sparingly, never by default
};

/**
 * Returns true if `role` holds `permission`, honoring wildcard entries
 * like "device:*" or the platform-wide "*".
 */
export function roleHasPermission(role: string, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role as KsvRole];
  if (!perms) return false; // unknown role → deny (fail closed)

  if (perms.includes("*")) return true;

  const [resource] = permission.split(":");
  if (perms.includes(`${resource}:*`)) return true;

  return perms.includes(permission);
}

// ---- Middleware factory ---------------------------------------------------
/**
 * requirePermission("device:command") returns a middleware that:
 *   1. Rejects if req.user is missing (authenticate() didn't run, or failed)
 *   2. Rejects with 403 if the user's role lacks the permission
 *   3. Calls next() only if the permission check passes
 *
 * Usage in a route:
 *   router.post("/devices/:id/commands",
 *     authenticate,
 *     requirePermission("device:command"),
 *     commandController.create
 *   );
 */
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      // This should not happen if authenticate() runs first — but never
      // assume; fail closed rather than trusting middleware order blindly.
      res.status(401).json({
        error: "UNAUTHENTICATED",
        message: "No authenticated user on request.",
      });
      return;
    }

    if (!roleHasPermission(req.user.role, permission)) {
      res.status(403).json({
        error: "FORBIDDEN",
        message: `Role '${req.user.role}' lacks permission '${permission}'.`,
      });
      return;
    }

    next();
  };
}

/**
 * requireMinRole("Manager") — coarser check for endpoints organized by
 * role tier rather than fine-grained permission (e.g. admin-only routes).
 * Prefer requirePermission() where a specific action/resource is known.
 */
export function requireMinRole(minRole: KsvRole) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: "UNAUTHENTICATED",
        message: "No authenticated user on request.",
      });
      return;
    }

    const userRank = ROLE_RANK[req.user.role as KsvRole] ?? -1;
    const requiredRank = ROLE_RANK[minRole];

    if (userRank < requiredRank) {
      res.status(403).json({
        error: "FORBIDDEN",
        message: `Requires role '${minRole}' or higher.`,
      });
      return;
    }

    next();
  };
}
