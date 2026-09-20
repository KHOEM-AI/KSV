/**
 * KSV — Automation Engine (time-based rules only)
 *
 * Runs enabled AutomationRules whose trigger is a time trigger:
 *   { type: "time_of_day", time: "HH:MM", daysOfWeek?: number[] (0=Sun), timezone?: string }
 *   { type: "time", value: "HH:MM", timezone?: string }            (legacy shape)
 *
 * SAFETY MODEL — an automated command gets NO extra privilege:
 *   e-stop guard → device criticality/Safety Engine → gateway dispatch → audit
 * exactly like a manual command. There is no bypass. life_support devices never run.
 * Disabled by default: set AUTOMATION_ENGINE=on in .env to start it.
 *
 * Each rule runs at most once per matching minute (atomic claim via lastRunKey).
 * Missed minutes (server down) are NOT caught up.
 */
import { AutomationRule, Command, Device } from "../../infrastructure/database/models.ts";
import { evaluateSafetyForDevice } from "../safety/safety.engine.ts";
import { auditDeviceCommand } from "../security/audit.log.ts";
import { applyDispatchResult } from "../gateway/command.lifecycle.ts";

interface Dispatcher {
  dispatch(req: any): Promise<any>;
}

interface EngineDeps {
  dispatcher: Dispatcher;
  emergencyStop: any; // Mongoose model, defined in server.ts
}

const TICK_MS = 30_000;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
// System-triggered actions have no user (audit userId = null).
const SYSTEM_USER = null as unknown as string;

/** Returns a minute key ("YYYY-MM-DD HH:MM" in the trigger's timezone) if the trigger matches `now`, else null. */
export function matchesSchedule(trigger: any, now: Date): string | null {
  if (!trigger || typeof trigger !== "object") return null;
  if (trigger.type !== "time" && trigger.type !== "time_of_day") return null;
  const time = typeof trigger.time === "string" ? trigger.time : trigger.value;
  if (typeof time !== "string" || !TIME_RE.test(time)) return null;

  const parts: Record<string, string> = {};
  try {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: trigger.timezone || undefined,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
    });
    for (const p of fmt.formatToParts(now)) parts[p.type] = p.value;
  } catch {
    return null; // invalid timezone → never run (fail closed)
  }

  const hhmm = `${parts.hour}:${parts.minute}`;
  if (hhmm !== time) return null;
  if (Array.isArray(trigger.daysOfWeek) && trigger.daysOfWeek.length > 0) {
    const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
    if (!trigger.daysOfWeek.includes(dow)) return null;
  }
  return `${parts.year}-${parts.month}-${parts.day} ${hhmm}`;
}

async function runRule(rule: any, key: string, deps: EngineDeps): Promise<void> {
  const orgId = String(rule.organizationId);
  const a = rule.action;
  const label = `automation rule ${rule._id} (${key})`;
  if (!a || typeof a !== "object" || !a.deviceId || typeof a.commandType !== "string") {
    console.warn(`[AUTOMATION] invalid action — skipped: ${label}`);
    return;
  }
  const deviceId = String(a.deviceId);
  const commandType: string = a.commandType;
  const payload = a.payload;

  const block = async (reason: string) => {
    try {
      await Command.create({
        deviceId,
        type: commandType,
        payload,
        status: "blocked",
        response: { reason, source: "automation", ruleId: String(rule._id) },
        sentAt: new Date(),
        completedAt: new Date(),
      });
    } catch (err) {
      console.error("[AUTOMATION] could not record blocked command", err);
    }
    await auditDeviceCommand(SYSTEM_USER, deviceId, commandType, "BLOCKED", orgId, {
      reason: `${reason} (${label})`,
    });
    console.warn(`[AUTOMATION] blocked: ${reason} — ${label}`);
  };

  const device: any = await Device.findOne({ _id: deviceId, organizationId: rule.organizationId }).lean();
  if (!device) return block("Device not found in the rule's organization.");
  if (device.criticality === "life_support") return block("life_support devices cannot be automated.");

  const activeStop: any = await deps.emergencyStop.findOne({
    organizationId: rule.organizationId,
    releasedAt: { $exists: false },
    $or: [{ scope: "organization" }, { deviceId }],
  }).lean();
  if (activeStop) return block("Emergency stop active: " + activeStop.reason);

  const safety = await evaluateSafetyForDevice(deviceId, orgId, commandType, { payload });
  if (safety.decision === "BLOCKED") return block(safety.reason ?? "Blocked by safety.");

  const command = await Command.create({ deviceId, type: commandType, payload, status: "pending" });
  const result = await deps.dispatcher.dispatch({
    deviceId,
    organizationId: orgId,
    commandId: String(command._id),
    command: { deviceId, deviceCode: device.deviceCode, deviceType: device.type, commandType, payload },
  });
  await applyDispatchResult(String(command._id), result);

  if (result.status === "success") {
    await auditDeviceCommand(SYSTEM_USER, deviceId, commandType, "SUCCESS", orgId, { reason: label });
  } else if (result.status === "failed") {
    await auditDeviceCommand(SYSTEM_USER, deviceId, commandType, "FAILURE", orgId, {
      reason: `${result.message} (${label})`,
      code: result.code,
    });
  }
  console.log(`[AUTOMATION] ${result.status}: ${commandType} → ${deviceId} — ${label}`);
}

let running = false;

async function tick(deps: EngineDeps): Promise<void> {
  if (running) return;
  running = true;
  try {
    const now = new Date();
    const rules = (await AutomationRule.find({ isEnabled: true }).lean()) as any[];
    for (const rule of rules) {
      const key = matchesSchedule(rule.trigger, now);
      if (!key) continue;
      // Atomic claim: only one process/tick may run this rule for this minute.
      const claimed = await AutomationRule.findOneAndUpdate(
        { _id: rule._id, isEnabled: true, lastRunKey: { $ne: key } },
        { $set: { lastRunKey: key, lastRunAt: now } }
      );
      if (!claimed) continue;
      try {
        await runRule(rule, key, deps);
      } catch (err) {
        console.error("[AUTOMATION] rule failed:", String(rule._id), err);
      }
    }
  } catch (err) {
    console.error("[AUTOMATION] tick failed:", err);
  } finally {
    running = false;
  }
}

export function startAutomationEngine(deps: EngineDeps): void {
  if (process.env.AUTOMATION_ENGINE !== "on") {
    console.log("[AUTOMATION] engine disabled (set AUTOMATION_ENGINE=on in .env to enable)");
    return;
  }
  if (!deps.emergencyStop) {
    console.error("[AUTOMATION] emergency-stop model missing — engine NOT started (fail closed)");
    return;
  }
  const timer = setInterval(() => {
    void tick(deps);
  }, TICK_MS);
  timer.unref?.();
  console.log("[AUTOMATION] engine started (time-based rules, tick 30s)");
}
