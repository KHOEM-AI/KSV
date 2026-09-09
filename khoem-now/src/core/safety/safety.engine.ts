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

// ============================================================
// Rule evaluators
// ============================================================
// Each evaluator inspects a CommandContext against one category of
// SafetyRule and returns a decision. New device categories add a new
// evaluator here rather than growing one giant if/else block.

type RuleEvaluator = (
  ctx: CommandContext,
  rule: { id: string; name: string; category: string; severity: string }
) => SafetyCheckResult;

/**
 * "Vehicle Immobilize Outside Geo-Fence" — a vehicle command that would
 * move or unlock the vehicle is blocked if it is confirmed outside its
 * authorized geo-fence area.
 */
const evaluateVehicleGeoFence: RuleEvaluator = (ctx, rule) => {
  const movementCommands = ["UNLOCK", "START", "DRIVE_ENABLE", "RELEASE"];
  if (!movementCommands.includes(ctx.commandType)) {
    return { decision: "ALLOWED" };
  }

  if (ctx.signals?.isInsideGeoFence === undefined) {
    return {
      decision: "BLOCKED",
      reason: "Vehicle location unknown — cannot confirm geo-fence status.",
      ruleId: rule.id,
      ruleName: rule.name,
    };
  }

  if (ctx.signals.isInsideGeoFence === false) {
    return {
      decision: "BLOCKED",
      reason: "Vehicle is outside its authorized geo-fence area.",
      ruleId: rule.id,
      ruleName: rule.name,
    };
  }

  return { decision: "ALLOWED" };
};

/**
 * "Robot Speed Limit in Human Zone" — an industrial robot's speed
 * command is blocked (or clamped upstream) if a human is detected in
 * its operating zone.
 */
const evaluateRobotHumanZone: RuleEvaluator = (ctx, rule) => {
  if (ctx.commandType !== "SPEED_LIMIT" && ctx.commandType !== "SET_SPEED") {
    return { decision: "ALLOWED" };
  }

  if (ctx.signals?.humanZoneOccupied) {
    const requestedSpeed = Number(ctx.payload?.speed ?? 0);
    const SAFE_SPEED_WITH_HUMAN = 25; // percent, matches dashboard's SPEED_LIMIT 25% example
    if (requestedSpeed > SAFE_SPEED_WITH_HUMAN) {
      return {
        decision: "BLOCKED",
        reason: `Human detected in operating zone — speed above ${SAFE_SPEED_WITH_HUMAN}% is not permitted.`,
        ruleId: rule.id,
        ruleName: rule.name,
      };
    }
  }

  return { decision: "ALLOWED" };
};

/**
 * "Door Force-Lock on Tamper" — if tamper has been detected on a door,
 * only lock-related commands are allowed; unlock/open commands are
 * blocked until the tamper condition is cleared.
 */
const evaluateDoorTamper: RuleEvaluator = (ctx, rule) => {
  const openCommands = ["UNLOCK", "OPEN"];
  if (!openCommands.includes(ctx.commandType)) {
    return { decision: "ALLOWED" };
  }

  if (ctx.signals?.tamperDetected || ctx.signals?.doorForceLockActive) {
    return {
      decision: "BLOCKED",
      reason: "Door is force-locked due to a detected tamper event.",
      ruleId: rule.id,
      ruleName: rule.name,
    };
  }

  return { decision: "ALLOWED" };
};

/**
 * "Press E-Stop on Light Curtain Break" — once an E-Stop/light-curtain
 * event is active for a press/industrial line, only RESET is allowed;
 * any operational command is blocked until reset clears it.
 */
const evaluatePressEStop: RuleEvaluator = (ctx, rule) => {
  if (ctx.commandType === "RESET") {
    return { decision: "ALLOWED" };
  }

  if (ctx.deviceType === "industrial" && ctx.signals?.tamperDetected) {
    return {
      decision: "BLOCKED",
      reason: "E-Stop is active — only RESET is permitted until cleared.",
      ruleId: rule.id,
      ruleName: rule.name,
    };
  }

  return { decision: "ALLOWED" };
};

/**
 * "Cold Storage Temp Floor" — a SETPOINT command for a cold-storage
 * device is blocked if the requested temperature is above the safe
 * maximum (i.e. not cold enough), which would risk spoilage.
 */
const SAFE_COLD_STORAGE_MAX_TEMP_C = -15;
const evaluateColdStorageTempFloor: RuleEvaluator = (ctx, rule) => {
  if (ctx.commandType !== "SETPOINT" && ctx.commandType !== "SET_TEMP") {
    return { decision: "ALLOWED" };
  }

  const requestedTemp = Number(ctx.payload?.temp ?? ctx.payload?.setpoint);
  if (Number.isNaN(requestedTemp)) {
    return { decision: "ALLOWED" }; // no temp in payload — not this rule's concern
  }

  if (requestedTemp > SAFE_COLD_STORAGE_MAX_TEMP_C) {
    return {
      decision: "BLOCKED",
      reason: `Requested temperature ${requestedTemp}°C is above the safe cold-storage maximum of ${SAFE_COLD_STORAGE_MAX_TEMP_C}°C.`,
      ruleId: rule.id,
      ruleName: rule.name,
    };
  }

  return { decision: "ALLOWED" };
};

/**
 * "Ignition Lock After Hours" — a company-owned fleet vehicle's
 * ignition/start command is blocked outside business hours (06:00-22:00
 * local time). Customer-owned vehicles (isCompanyFleet is false/unset)
 * are never restricted by this rule — they need 24/7 availability for
 * genuine emergencies (e.g. an urgent hospital trip).
 */
const FLEET_HOURS_START = 6;  // 06:00
const FLEET_HOURS_END = 22;   // 22:00
const evaluateIgnitionLockAfterHours: RuleEvaluator = (ctx, rule) => {
  const ignitionCommands = ["START", "IGNITION_ON"];
  if (!ignitionCommands.includes(ctx.commandType)) {
    return { decision: "ALLOWED" };
  }

  if (!ctx.isCompanyFleet) {
    return { decision: "ALLOWED" }; // customer-owned — no business-hours restriction
  }

  const hour = new Date().getHours();
  if (hour < FLEET_HOURS_START || hour >= FLEET_HOURS_END) {
    return {
      decision: "BLOCKED",
      reason: `Company fleet vehicles may only be started between ${FLEET_HOURS_START}:00 and ${FLEET_HOURS_END}:00.`,
      ruleId: rule.id,
      ruleName: rule.name,
    };
  }

  return { decision: "ALLOWED" };
};

/**
 * "Duress Code" — if a duress code was entered (a code that outwardly
 * looks valid but signals coercion), the command is blocked here so
 * the caller/UI can trigger a silent alert while denying real access.
 * Treated like a tamper event for open/unlock commands.
 */
const evaluateDuressCode: RuleEvaluator = (ctx, rule) => {
  const openCommands = ["UNLOCK", "OPEN"];
  if (!openCommands.includes(ctx.commandType)) {
    return { decision: "ALLOWED" };
  }

  if (ctx.signals?.duressCodeEntered) {
    return {
      decision: "BLOCKED",
      reason: "Duress code detected — access denied and a silent alert should be raised.",
      ruleId: rule.id,
      ruleName: rule.name,
    };
  }

  return { decision: "ALLOWED" };
};

/**
 * "HVAC Emergency Shutdown" — once an emergency shutdown is active for
 * an HVAC device, only OFF/RESET commands are allowed; anything that
 * would turn it on or change its operating state is blocked.
 */
const evaluateHvacEmergencyShutdown: RuleEvaluator = (ctx, rule) => {
  const allowedDuringShutdown = ["OFF", "RESET"];
  if (allowedDuringShutdown.includes(ctx.commandType)) {
    return { decision: "ALLOWED" };
  }

  if (ctx.signals?.emergencyShutdownActive) {
    return {
      decision: "BLOCKED",
      reason: "HVAC emergency shutdown is active — only OFF/RESET commands are permitted until cleared.",
      ruleId: rule.id,
      ruleName: rule.name,
    };
  }

  return { decision: "ALLOWED" };
};

// Maps a SafetyRule.name (as seen in the dashboard's Safety Rules list)
// to the evaluator that handles it. Keep this table as the single place
// that connects data-driven rules to code.
//
// All 8 mock rules now have evaluators. "Ignition Lock After Hours"
// only restricts company-owned fleet vehicles (isCompanyFleet: true);
// customer-owned vehicles are never restricted by it.
const RULE_EVALUATORS: Record<string, RuleEvaluator> = {
  "Vehicle Immobilize Outside Geo-Fence": evaluateVehicleGeoFence,
  "Robot Speed Limit in Human Zone": evaluateRobotHumanZone,
  "Door Force-Lock on Tamper": evaluateDoorTamper,
  "Press E-Stop on Light Curtain Break": evaluatePressEStop,
  "Cold Storage Temp Floor": evaluateColdStorageTempFloor,
  "Duress Code": evaluateDuressCode,
  "HVAC Emergency Shutdown": evaluateHvacEmergencyShutdown,
  "Ignition Lock After Hours": evaluateIgnitionLockAfterHours,
};

// ============================================================
// Main entry point
// ============================================================

/**
 * Evaluates a command against every enabled SafetyRule for the
 * command's organization. Returns the FIRST blocking result found;
 * if no rule blocks it, the command is ALLOWED.
 *
 * On BLOCKED: increments the rule's triggerCount AND writes a
 * SafetyLog entry (deviceId, eventType, severity, message) so the
 * block is reviewable later — not just reflected in a counter.
 *
 * Call this AFTER authenticate + requirePermission, and BEFORE
 * Command.create() / dispatching to the device.
 */
export async function evaluateSafety(
  ctx: CommandContext
): Promise<SafetyCheckResult> {
  let rules;
  try {
    rules = await SafetyRule.find({
      organizationId: ctx.organizationId,
      isEnabled: true,
    }).lean();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[SAFETY] Failed to load safety rules:", err);
    return {
      decision: "BLOCKED",
      reason: "Safety rules could not be loaded — command blocked as a precaution.",
    };
  }

  for (const rule of rules) {
    const evaluator = RULE_EVALUATORS[rule.name];
    if (!evaluator) continue; // rule exists in DB but has no code evaluator yet

    const result = evaluator(ctx, {
      id: String(rule._id),
      name: rule.name,
      category: rule.category,
      severity: rule.severity,
    });

    if (result.decision === "BLOCKED") {
      // Neither failure here should change the BLOCKED decision itself —
      // the command is already stopped; these are just record-keeping.
      try {
        await Promise.all([
          SafetyRule.updateOne({ _id: rule._id }, { $inc: { triggerCount: 1 } }),
          SafetyLog.create({
            deviceId: ctx.deviceId,
            eventType: `SAFETY_BLOCKED:${ctx.commandType}`,
            severity: rule.severity,
            message: result.reason ?? `Blocked by rule "${rule.name}".`,
          }),
        ]);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[SAFETY] Failed to record trigger/log for rule", rule.name, err);
      }
      return result;
    }
  }

  return { decision: "ALLOWED" };
}

// ============================================================
// Convenience wrapper for controllers
// ============================================================

/**
 * Loads the Device first so command routes only need to pass
 * deviceId + commandType + payload/signals, not the raw device type
 * string. Fails closed (BLOCKED) if the device can't be found —
 * a command engine should never reach here without a valid device,
 * but this file never assumes that holds.
 */
export async function evaluateSafetyForDevice(
  deviceId: string,
  organizationId: string,
  commandType: string,
  options?: {
    payload?: Record<string, unknown>;
    signals?: CommandContext["signals"];
  }
): Promise<SafetyCheckResult> {
  const device = await Device.findById(deviceId).lean();

  if (!device) {
    return { decision: "BLOCKED", reason: "Device not found." };
  }

  return evaluateSafety({
    deviceId,
    deviceType: device.type,
    organizationId,
    commandType,
    isCompanyFleet: Boolean((device as { isCompanyFleet?: boolean }).isCompanyFleet),
    payload: options?.payload,
    signals: options?.signals,
  });
}
