/**
 * KSV — Audit Log System
 * Location in project: src/core/security/audit.log.ts
 *
 * Purpose (per KSV Security Design, section 23 — Audit System):
 *   Every important action must be reviewable after the fact:
 *   Who, What, Which Device, When, Where/Context, Authorized?, Result.
 *
 * HARD RULE: Passwords and secrets must NEVER be written to the audit
 * log, under any circumstances (see section 23's explicit warning).
 * This file's `sanitizePayload()` strips known-sensitive keys before
 * anything is persisted — but callers must still avoid passing secrets
 * into `details` in the first place.
 *
 * This is an append-only log by design: no update/delete functions are
 * exported here on purpose. Audit entries must not be editable.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================================
// Types
// ============================================================

export type AuditResult = "SUCCESS" | "FAILURE" | "BLOCKED";

export interface AuditEntryInput {
  userId: string | null; // null for unauthenticated/system-triggered events
  action: string; // e.g. "device:command", "auth:login", "org:member:add"
  deviceId?: string | null;
  organizationId?: string | null;
  result: AuditResult;
  context?: {
    ip?: string;
    userAgent?: string;
    reason?: string; // e.g. why a command was BLOCKED (failed safety check, etc.)
  };
  details?: Record<string, unknown>; // free-form extra data — gets sanitized
}

// ============================================================
// Sanitization — strip anything that looks like a secret
// ============================================================

const SENSITIVE_KEY_PATTERN =
  /password|secret|token|apikey|api_key|credential|authorization|privatekey|private_key/i;

/**
 * Recursively removes any object key that looks sensitive, replacing
 * its value with "[REDACTED]". Applied to `details` before every write,
 * as a last line of defense in case a caller accidentally includes
 * sensitive data.
 */
function sanitizePayload(payload: unknown): unknown {
  if (payload === null || typeof payload !== "object") {
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload.map(sanitizePayload);
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      result[key] = "[REDACTED]";
    } else {
      result[key] = sanitizePayload(value);
    }
  }
  return result;
}

// ============================================================
// Write path (the only way to create audit entries — append only)
// ============================================================

/**
 * Records one audit entry. Call this from every security-relevant
 * action: logins, permission checks that fail, device commands,
 * pairing/unpairing, org/member changes, key rotations, etc.
 *
 * This function must never throw in a way that blocks the calling
 * request — audit logging failing should be logged separately (e.g.
 * to stderr/monitoring) but should not itself take down the feature
 * that triggered it. Wrap the DB write in try/catch.
 */
export async function recordAuditEntry(entry: AuditEntryInput): Promise<void> {
  const safeDetails = entry.details ? sanitizePayload(entry.details) : undefined;

  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        deviceId: entry.deviceId ?? null,
        organizationId: entry.organizationId ?? null,
        result: entry.result,
        ip: entry.context?.ip ?? null,
        userAgent: entry.context?.userAgent ?? null,
        reason: entry.context?.reason ?? null,
        details: safeDetails ? JSON.stringify(safeDetails) : null,
        createdAt: new Date(),
      },
    });
  } catch (err) {
    // Audit logging must be resilient: a DB hiccup here should not
    // block the user's actual request. Surface to monitoring instead.
    // eslint-disable-next-line no-console
    console.error("[AUDIT] Failed to write audit entry:", err, {
      action: entry.action,
      userId: entry.userId,
    });
  }
}

// ============================================================
// Convenience wrappers for common event types
// ============================================================

export async function auditLogin(
  userId: string,
  result: AuditResult,
  context?: AuditEntryInput["context"]
): Promise<void> {
  return recordAuditEntry({ userId, action: "auth:login", result, context });
}

export async function auditDeviceCommand(
  userId: string,
  deviceId: string,
  commandType: string,
  result: AuditResult,
  context?: AuditEntryInput["context"]
): Promise<void> {
  return recordAuditEntry({
    userId,
    deviceId,
    action: "device:command",
    result,
    context,
    details: { commandType },
  });
}

export async function auditPermissionDenied(
  userId: string,
  action: string,
  context?: AuditEntryInput["context"]
): Promise<void> {
  return recordAuditEntry({
    userId,
    action,
    result: "BLOCKED",
    context: { ...context, reason: context?.reason ?? "Insufficient permissions" },
  });
}

// ============================================================
// Read path — for the Audit/Activity view (AuditView.tsx)
// ============================================================

export interface AuditQueryOptions {
  organizationId?: string;
  userId?: string;
  deviceId?: string;
  action?: string;
  result?: AuditResult;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Queries audit entries for display (e.g. the "សកម្មភាពត្រូវគ្រប់គ្រងផ្ទាល់"
 * activity feed seen in the KSV dashboard). Read-only — this file
 * intentionally exposes no update/delete for audit rows.
 */
export async function queryAuditLog(options: AuditQueryOptions = {}) {
  const {
    organizationId,
    userId,
    deviceId,
    action,
    result,
    fromDate,
    toDate,
    limit = 50,
    offset = 0,
  } = options;

  return prisma.auditLog.findMany({
    where: {
      ...(organizationId && { organizationId }),
      ...(userId && { userId }),
      ...(deviceId && { deviceId }),
      ...(action && { action }),
      ...(result && { result }),
      ...(fromDate || toDate
        ? {
            createdAt: {
              ...(fromDate && { gte: fromDate }),
              ...(toDate && { lte: toDate }),
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}
