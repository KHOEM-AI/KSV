# KSV — Verified Architecture Status

**Suggested location:** `khoem-now/DOCUMENTATION/verified-architecture-status.md`
**Date:** 30 August 2026
**Purpose:** Record of what has been cross-checked line-by-line and confirmed
consistent, so future developers/AI don't re-verify the same files or
"fix" something that already matches. Only ✅-confirmed items are listed
here — anything not listed has not been checked yet, and unresolved
mismatches are called out separately at the bottom.

**Source of truth rule:** `src/infrastructure/database/models.ts` is the
source of truth for all field names, since it's the actual running
database schema. Where a spec/README file disagrees with `models.ts`,
the spec gets corrected to match the code — not the other way around.

---

## ✅ Confirmed consistent (cross-checked against models.ts)

### `src/core/safety/safety.engine.ts`
- Imports `SafetyRule`, `SafetyLog`, `Device` from `models.ts` — all three
  exist with matching fields.
- Uses `SafetyRule.find({ organizationId, isEnabled })` — both fields
  exist on `safetyRuleSchema`.
- Reads `rule.name`, `rule.category`, `rule.severity` — all three are
  `required` fields on `safetyRuleSchema`.
- Calls `SafetyRule.updateOne(..., { $inc: { triggerCount: 1 } })` —
  `triggerCount` exists (`Number, default 0`).
- Calls `SafetyLog.create({ deviceId, eventType, severity, message })` —
  all four fields exist and match `safetyLogSchema`.
- Calls `Device.findById(deviceId)` → reads `device.type` — matches
  `deviceSchema.type` (required).
- Fail-safe default confirmed: if `SafetyRule.find()` throws, the
  engine returns `BLOCKED` rather than allowing the command through.
- Covers 4 of 8 mock safety rules from `src/data/domain.ts`: Vehicle
  Immobilize Outside Geo-Fence, Robot Speed Limit in Human Zone, Door
  Force-Lock on Tamper, Press E-Stop on Light Curtain Break. The other
  4 (Cold Storage, Duress Code, Ignition Lock After Hours, HVAC
  Emergency Shutdown) have no evaluator yet — they are silently
  skipped (never block), not broken.

### `src/core/auth/auth.middleware.ts`
- `req.user.role`, `req.user.organizationId` set by `authenticate()` —
  match `userSchema.role` and `userSchema.organizationId`.
- Fails closed on missing/invalid/expired token (401), never fails open.
- `JWT_ACCESS_SECRET` required at startup — throws rather than running
  with an unset secret.

### `src/core/auth/rbac.policy.ts`
- Role hierarchy (`Guest → Viewer → Controller → Operator → Manager →
  OrgAdmin → SuperAdmin → Owner`) matches the role list documented in
  `userSchema.role`'s comment.
- `requirePermission("device:command")` — permission string format
  (`resource:action`) matches the `action` field examples in
  `auditLogSchema` (e.g. `"device:command"`, `"auth:login"`).
- Fails closed: unknown role → deny; missing `req.user` → 401 before
  permission check even runs.

### `src/core/security/audit.log.ts`
- `auditDeviceCommand(userId, deviceId, commandType, result, context?)`
  — confirmed exact signature to use from the command route.
- `AuditResult = "SUCCESS" | "FAILURE" | "BLOCKED"` matches
  `auditLogSchema.result` comment (`SUCCESS | FAILURE | BLOCKED`).
- All fields written by `recordAuditEntry()` (`userId, action, deviceId,
  organizationId, result, ip, userAgent, reason, details`) exist on
  `auditLogSchema`.
- `sanitizePayload()` redacts any key matching
  `/password|secret|token|apikey|credential|authorization|privatekey/i`
  before writing `details` — satisfies the "never log secrets" rule.

### `src/core/security/rate-limiter.ts`
- `deviceCommandRateLimiter` exists, pre-configured: 30 requests/minute,
  keyed by `req.user.id` (falls back to IP only if unauthenticated).
- This is the exact limiter to import for the command route — no need
  to write a new one.

### Git / repo hygiene (as of 30 Aug 2026)
- `.env.backup` removed from git tracking and added to `.gitignore`.
- `git config --global core.editor "true"` set — `git pull`/merge no
  longer opens an editor.
- Repo fully synced with `github.com/KHOEM-AI/KSV` main branch (push
  `06faf812` confirmed landed).

---

## ⚠️ Confirmed mismatch — not yet fixed

### `API/command.ts` (spec/README) vs `models.ts` (actual code)
The API domain documentation describes `KSVCommand` with fields
`commandId, deviceId, capability, value, status, source`.

The actual Mongoose schema (`commandSchema` in `models.ts`) uses:
`deviceId, userId, type, payload, status, response, sentAt, completedAt`
(no separate `commandId` — Mongoose provides `_id` automatically, same
as every other model in this file).

**Decision (confirmed by project owner, 30 Aug 2026):** `models.ts`
field names (`type`, `payload`) are the standard going forward. The
`API/command.ts` documentation should be corrected to match — not the
other way around. This edit has not been made yet; exact line number
in `API/command.ts` still needs to be located (a first grep for the
literal string `"capability, value, status, source"` returned no
match, meaning the wording in the file differs slightly from what was
quoted from the README render — needs a fresh grep/view of the actual
file content before editing).

---

## Not yet checked
- `src/infrastructure/database/connection.ts`
- `src/core/security/encryption.util.ts`
- `src/server.ts` (whether any command route is actually mounted)
- `API/command.ts` full content (only the README-style domain summary
  has been reviewed so far, not the actual `.ts` file)
- `src/i18n/translations.ts` duplicate-key blocks (build succeeds
  despite warnings — cosmetic cleanup, not urgent)
