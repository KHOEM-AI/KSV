## existing safety routes in server.ts
1684:  // GET /api/safety/rules — list safety rules for the user's organization
1686:    "/api/safety/rules",
2328:  // GET /api/safety/events — list recent safety log events
2330:    "/api/safety/events",

## safety/rules route (from line 1686)
  // GET /api/safety/rules — list safety rules for the user's organization
  app.get(
    "/api/safety/rules",
    authenticate,
    requirePermission("org:read"),
    async (req, res) => {
      const user = req.user!;
      if (!user.organizationId) {
        res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
        return;
      }
      try {
        const rules = await SafetyRule.find({ organizationId: user.organizationId }).lean();
        res.json({ rules, total: rules.length });
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load safety rules." });
      }
    }
  );

  // GET /api/gateways — list all gateways
  app.get(
    "/api/gateways",
    authenticate,
    requirePermission("org:read"),
    async (req, res) => {
      const user = req.user!;
      if (!user.organizationId) {
        res.status(400).json({
          error: "BAD_REQUEST",
          message: "No organizationId on user.",
        });
        return;
      }

      try {
        const gateways = await Gateway.find({
          organizationId: user.organizationId,
        }).lean();

        res.json({ gateways, total: gateways.length });
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load gateways." });

## safety/events route (from line 2330)
  // GET /api/safety/events — list recent safety log events
  app.get(
    "/api/safety/events",
    authenticate,
    requirePermission("org:read"),
    async (req, res) => {
      const user = req.user!;
      if (!user.organizationId) {
        res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
        return;
      }
      try {
        const deviceIds = await Device.find({
          organizationId: user.organizationId,
        }).distinct("_id");

        const events = await SafetyLog.find({
          deviceId: { $in: deviceIds },
        })
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();

        res.json({ events, total: events.length });
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load safety events." });
      }
    }
  );

  // GET /api/telemetry/devices/:id — telemetry/log history for a device
  app.get(
    "/api/telemetry/devices/:id",

## SafetyRule + SafetyLog schema (223-256)
const safetyRuleSchema = new Schema(
  {
    organizationId: { type: ObjectId, ref: "Organization", required: true },
    name: { type: String, required: true }, // e.g. "Robot Speed Limit in Human Zone"
    category: { type: String, required: true }, // door | vehicle | industrial
    severity: { type: String, required: true }, // low | medium | high | critical
    triggerCount: { type: Number, default: 0 },
    isEnabled: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const safetyLogSchema = new Schema(
  {
    deviceId: { type: ObjectId, ref: "Device", required: true },
    eventType: { type: String, required: true },
    severity: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// ============================================================
// MONITORING / EVENTS
// ============================================================

const deviceLogSchema = new Schema(
  {
    deviceId: { type: ObjectId, ref: "Device", required: true },
    data: Schema.Types.Mixed,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);


## Device schema (81-104)
const deviceSchema = new Schema(
  {
    name: { type: String, required: true },
    deviceCode: { type: String, required: true, unique: true }, // e.g. "DEV-04821"
    type: { type: String, required: true }, // door | hvac | vehicle | industrial | sensor
    status: { type: String, default: "offline" }, // online | offline | warning | maintenance
    organizationId: { type: ObjectId, ref: "Organization", required: true },
    siteId: { type: ObjectId, ref: "Site" },
    gatewayId: { type: ObjectId, ref: "Gateway" },
    protocolId: { type: ObjectId, ref: "Protocol" },
    firmwareVersion: String,
    lastSeenAt: Date,
    // true = company-owned fleet vehicle/asset (subject to business-hours
    // rules like Ignition Lock After Hours); false/unset = customer-owned,
    // no such restriction — customers need 24/7 access for real emergencies.
    isCompanyFleet: { type: Boolean, default: false },
    // Geographic coordinates for the interactive map view (README Section 44).
    // Optional — devices without coordinates simply do not appear on the map.
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { timestamps: true }
);


## safety.engine exports + head
33:export type SafetyDecision = "ALLOWED" | "BLOCKED";
35:export interface SafetyCheckResult {
42:export interface CommandContext {
318:export async function evaluateSafety(
380:export async function evaluateSafetyForDevice(
/**
 * KSV — Safety Engine
 * Location in project: src/core/safety/safety.engine.ts
 *
 * Purpose (per KSV Security Design, section 19 — Safety Engine):
 *   Security ≠ Safety. Having permission to use a device does not mean
 *   a command is always safe to execute right now.
 *
 *   User Authorized ✓ → Security Check ✓ → Safety Check ✗ → COMMAND BLOCKED
 *
 * This engine runs AFTER authentication + authorization (auth.middleware.ts,
 * rbac.policy.ts) and BEFORE a command is dispatched to a device. It is a
 * separate concern from permissions: an Operator can be fully authorized to
 * command a vehicle or robot arm, and still be blocked here if the action
 * would be unsafe (vehicle outside geo-fence, robot arm in a human zone at
 * unsafe speed, door force-locked during a tamper event, etc).
 *
 * Fail-safe default: if a rule's condition cannot be evaluated (missing
 * data, evaluator error), the engine BLOCKS the command rather than
 * allowing it through. Never fail open on safety checks.
 *
 * Every BLOCKED decision is written to SafetyLog (append-only, mirrors
 * the AuditLog pattern in audit.log.ts) so the Safety/Audit views have
 * a durable record of what was stopped and why — not just a counter.
 */

import { SafetyRule, SafetyLog, Device } from "../../infrastructure/database/models.ts";

// ============================================================
// Types
// ============================================================

export type SafetyDecision = "ALLOWED" | "BLOCKED";

export interface SafetyCheckResult {
  decision: SafetyDecision;
  reason?: string; // populated when BLOCKED
  ruleId?: string; // which rule caused the block, if any
  ruleName?: string;
}

export interface CommandContext {
  deviceId: string;
  deviceType: string; // "door" | "vehicle" | "industrial" | ...
  organizationId: string;
  commandType: string; // "UNLOCK", "IMMOBILIZE", "SPEED_LIMIT", ...
  isCompanyFleet?: boolean; // true = company-owned vehicle/asset, subject to business-hours rules
  payload?: Record<string, unknown>;
  // Signals the safety engine may need — supplied by the caller, since
  // this engine does not reach into hardware/telemetry itself.
  signals?: {
    isInsideGeoFence?: boolean;
    humanZoneOccupied?: boolean;
    tamperDetected?: boolean;
    currentSpeed?: number;
    doorForceLockActive?: boolean;
    duressCodeEntered?: boolean;
    emergencyShutdownActive?: boolean;
  };
}

## rbac permissions
34:// A permission is a simple "resource:action" string, e.g. "device:command".
39:  Viewer: ["device:read", "org:read"],
40:  Controller: ["device:read", "device:command"],
41:  Operator: ["device:read", "device:command", "device:pair", "automation:read"],
43:    "device:read",
44:    "device:command",
45:    "device:pair",
46:    "device:manage",
47:    "automation:read",
48:    "automation:manage",
49:    "org:read",
52:    "device:read",
53:    "device:command",
54:    "device:pair",
55:    "device:manage",
56:    "automation:read",
57:    "automation:manage",
58:    "org:read",
59:    "org:manage",
60:    "user:manage",
61:    "audit:read",
68:    "audit:read",
69:    "security:manage",
92: * requirePermission("device:command") returns a middleware that:
100: *     requirePermission("device:command"),
20:export const ROLE_RANK: Record<string, number> = {
31:export type KsvRole = keyof typeof ROLE_RANK;
78:export function roleHasPermission(role: string, permission: string): boolean {
104:export function requirePermission(permission: string) {
133:export function requireMinRole(minRole: KsvRole) {

## audit helpers
26:export type AuditResult = "SUCCESS" | "FAILURE" | "BLOCKED";
28:export interface AuditEntryInput {
74:export async function recordAuditEntry(entry: AuditEntryInput): Promise<void> {
103:export async function auditLogin(
111:export async function auditDeviceCommand(
131:export async function auditPermissionDenied(
148:export interface AuditQueryOptions {
160:export async function queryAuditLog(options: AuditQueryOptions = {}) {

## AuditLog schema (270-284)
const auditLogSchema = new Schema(
  {
    userId: { type: ObjectId, ref: "User" },
    action: { type: String, required: true }, // e.g. "device:command", "auth:login"
    deviceId: { type: ObjectId, ref: "Device" },
    organizationId: { type: ObjectId, ref: "Organization" },
    result: { type: String, required: true }, // SUCCESS | FAILURE | BLOCKED
    ip: String,
    userAgent: String,
    reason: String,
    details: String, // JSON-stringified, sanitized (secrets redacted)
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);


## API/safety.ts routes + key types
189:export const SAFETY_ROUTES = {
191:  CHECK_SAFETY:            'POST /api/v1/safety/check',
194:  CREATE_RULE:             'POST /api/v1/safety/rules',
195:  LIST_RULES:              'GET  /api/v1/safety/rules',
196:  GET_RULE:                'GET  /api/v1/safety/rules/:ruleId',
197:  UPDATE_RULE:             'PUT  /api/v1/safety/rules/:ruleId',
198:  DELETE_RULE:             'DELETE /api/v1/safety/rules/:ruleId',
199:  ENABLE_RULE:             'POST /api/v1/safety/rules/:ruleId/enable',
200:  DISABLE_RULE:            'POST /api/v1/safety/rules/:ruleId/disable',
203:  GET_DEVICE_SAFETY:       'GET  /api/v1/safety/devices/:deviceId',
204:  LIST_DEVICE_SAFETY:      'GET  /api/v1/safety/devices',
207:  EMERGENCY_STOP:          'POST /api/v1/safety/emergency-stop',
208:  RELEASE_EMERGENCY_STOP:  'POST /api/v1/safety/emergency-stop/release',
211:  LIST_SAFETY_EVENTS:      'GET  /api/v1/safety/events',
212:  GET_SAFETY_EVENT:        'GET  /api/v1/safety/events/:eventId',
7:export type SafetyRuleType =
18:export type SafetyRuleSeverity = 'critical' | 'high' | 'medium' | 'low';
19:export type SafetyEventType = 'rule_triggered' | 'emergency_stop' | 'interlock_activated' | 'manual_override' | 'system_safe';
20:export type SafetyState = 'normal' | 'warning' | 'alert' | 'emergency' | 'lockdown';
26:export interface SafetyRule {
44:export interface SafetyCondition {
73:export interface SafetyAction {
81:export interface SafetyCheckRequest {
90:export interface SafetyCheckResponse {
104:export interface SafetyEvent {
119:export interface DeviceSafetyStatus {
133:export interface CreateSafetyRuleRequest {
145:export interface UpdateSafetyRuleRequest {
153:export interface EmergencyStopRequest {
160:export interface EmergencyStopResponse {
168:export interface ReleaseEmergencyStopRequest {
175:export interface ListSafetyEventsRequest {
219:export interface SafetyAPIHandlers {
273:export type SafetyAuditEvent =

## how command route uses safety (evaluateSafetyForDevice)
19:import { evaluateSafetyForDevice } from "./core/safety/safety.engine.ts";
307:        const safetyResult = await evaluateSafetyForDevice(
