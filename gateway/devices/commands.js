// KSV — ពិនិត្យពាក្យបញ្ជា៖ type → command → params → guard → confirm
import { DEVICE_TYPES } from "./catalog.js";

const fail = (code, message, extra = {}) => ({ ok: false, code, message, ...extra });

function checkParam(name, spec, raw) {
  switch (spec.type) {
    case "int":
      if (!Number.isInteger(raw)) return { error: `${name} ត្រូវជាចំនួនគត់` };
      if (raw < spec.min || raw > spec.max) {
        return { error: `${name} ត្រូវនៅចន្លោះ ${spec.min}..${spec.max}${spec.unit ? " " + spec.unit : ""}` };
      }
      return { value: raw };
    case "enum":
      if (!spec.values.includes(raw)) return { error: `${name} ត្រូវជាមួយក្នុង៖ ${spec.values.join(", ")}` };
      return { value: raw };
    case "hex":
      if (typeof raw !== "string" || !/^#[0-9a-fA-F]{6}$/.test(raw)) return { error: `${name} ត្រូវជា HEX ដូច #ff8800` };
      return { value: raw.toLowerCase() };
    default:
      return { error: `${name}: ប្រភេទ param មិនស្គាល់` };
  }
}

/**
 * @param {string} typeName   ឧ. "cooker"
 * @param {string} command    ឧ. "START" (មិនប្រកាន់អក្សរធំតូច)
 * @param {object} params
 * @param {{confirmed?: boolean, state?: object}} ctx
 */
export function validateCommand(typeName, command, params = {}, ctx = {}) {
  const type = DEVICE_TYPES[typeName];
  if (!type) return fail("UNKNOWN_TYPE", `មិនស្គាល់ប្រភេទឧបករណ៍ "${typeName}"`);

  const cmdName = String(command || "").toUpperCase();
  const def = type.commands[cmdName];
  if (!def) {
    return fail("UNKNOWN_COMMAND", `"${typeName}" មិនមានពាក្យបញ្ជា "${cmdName}"`, {
      allowed: Object.keys(type.commands),
    });
  }

  if (params === null || typeof params !== "object" || Array.isArray(params)) {
    return fail("INVALID_PARAMS", "params ត្រូវជា object");
  }

  const spec = def.params || {};
  const clean = {};
  const errors = [];

  for (const key of Object.keys(params)) {
    if (!(key in spec)) errors.push(`param "${key}" មិនត្រូវបានអនុញ្ញាត`);
  }
  for (const [key, s] of Object.entries(spec)) {
    const raw = params[key];
    if (raw === undefined) {
      if (!s.optional) errors.push(`ត្រូវការ param "${key}"`);
      continue;
    }
    const r = checkParam(key, s, raw);
    if (r.error) errors.push(r.error);
    else clean[key] = r.value;
  }
  if (errors.length) return fail("INVALID_PARAMS", errors.join("; "), { errors });

  if (def.guard === "stationary") {
    const speed = ctx.state?.speedKmh;
    if (speed === undefined || speed === null) {
      return fail("STATE_UNKNOWN", "មិនដឹងស្ថានភាពឡាន (speedKmh) — ហាមបញ្ជាដើម្បីសុវត្ថិភាព");
    }
    if (speed !== 0) return fail("GUARD_BLOCKED", `ឡានកំពុងធ្វើដំណើរ (${speed} km/h) — ហាមបញ្ជា`);
  }

  const confirmed = ctx.confirmed === true;
  const why = def.confirm ? "ពាក្យបញ្ជានេះត្រូវការការបញ្ជាក់ (confirmed:true)" : def.confirmIf?.(clean) || null;
  if (why && !confirmed) return fail("CONFIRMATION_REQUIRED", why, { requiresConfirmation: true });

  return { ok: true, type: typeName, command: cmdName, params: clean, readOnly: !!def.readOnly };
}
