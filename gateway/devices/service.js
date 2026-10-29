// KSV — ស្រទាប់សេវា (មិនពឹង express — សាកល្បងបានដោយផ្ទាល់)
// គ្រប់ពាក្យបញ្ជាកត់ audit ទាំងត្រូវអនុញ្ញាត និងត្រូវរារាំង។
import { describeType, listTypes } from "./catalog.js";
import { validateCommand } from "./commands.js";
import { adapters } from "./adapters.js";
import { audit, getDevice, getState, listDevices, registerDevice, setDisabled, setState } from "./store.js";

const HTTP_BY_CODE = {
  UNKNOWN_TYPE: 400,
  UNKNOWN_COMMAND: 400,
  INVALID_PARAMS: 400,
  CONFIRMATION_REQUIRED: 428,
  STATE_UNKNOWN: 409,
  GUARD_BLOCKED: 409,
  DEVICE_DISABLED: 423,
};

const reply = (status, body) => ({ status, body });
const notFound = (id) => reply(404, { error: "DEVICE_NOT_FOUND", message: `មិនមានឧបករណ៍ "${id}"` });

export const types = () => reply(200, { types: listTypes() });
export const typeDetail = (name) => {
  const d = describeType(name);
  return d ? reply(200, d) : reply(404, { error: "UNKNOWN_TYPE", message: `មិនស្គាល់ប្រភេទ "${name}"` });
};

export const devices = () => reply(200, { devices: listDevices().map((d) => ({ ...d, state: getState(d.id) })) });

export function device(id) {
  const d = getDevice(id);
  return d ? reply(200, { ...d, state: getState(id) }) : notFound(id);
}

export function register(body) {
  const r = registerDevice(body);
  return r.ok ? reply(201, r.device) : reply(400, { error: "INVALID_DEVICE", errors: r.errors });
}

export function disable(id, disabled) {
  const d = setDisabled(id, disabled);
  if (!d) return notFound(id);
  audit({ deviceId: id, event: disabled ? "device.disabled" : "device.enabled" });
  return reply(200, d);
}

// ឧបករណ៍/ស្ពាន MQTT រាយការណ៍ស្ថានភាពពិត (ឧ. speedKmh របស់ឡាន) សម្រាប់ guard
export function reportState(id, patch) {
  if (!getDevice(id)) return notFound(id);
  if (patch === null || typeof patch !== "object" || Array.isArray(patch)) {
    return reply(400, { error: "INVALID_STATE", message: "state ត្រូវជា object" });
  }
  const keys = Object.keys(patch);
  const ok = keys.length > 0 && keys.length <= 30 &&
    keys.every((k) => /^[A-Za-z][A-Za-z0-9_]{0,40}$/.test(k) && ["string", "number", "boolean"].includes(typeof patch[k]));
  if (!ok) return reply(400, { error: "INVALID_STATE", message: "key ≤30, តម្លៃជា string/number/boolean ប៉ុណ្ណោះ" });
  if ("speedKmh" in patch && !(Number.isFinite(patch.speedKmh) && patch.speedKmh >= 0)) {
    return reply(400, { error: "INVALID_STATE", message: "speedKmh ត្រូវជាលេខ ≥ 0" });
  }
  return reply(200, setState(id, patch));
}

export async function command(id, body) {
  const d = getDevice(id);
  if (!d) return notFound(id);

  const { command: cmd, params = {}, confirmed } = body || {};
  const log = (result, extra = {}) => audit({ deviceId: id, type: d.type, command: cmd, params, confirmed: confirmed === true, result, ...extra });

  if (d.disabled) {
    log("DEVICE_DISABLED");
    return reply(423, { error: "DEVICE_DISABLED", message: "ឧបករណ៍ត្រូវបានបិទដំណើរការ" });
  }

  const v = validateCommand(d.type, cmd, params, { confirmed, state: getState(id) });
  if (!v.ok) {
    log(v.code);
    const { ok, ...rest } = v;
    return reply(HTTP_BY_CODE[v.code] || 400, { error: v.code, ...rest });
  }

  try {
    const ack = await adapters[d.adapter].send(d, v);
    if (!ack.acknowledged) {
      log("NO_ACK");
      return reply(502, { error: "DEVICE_ACK_NOT_RECEIVED", message: "ឧបករណ៍មិនបានទទួល/បញ្ជាក់", response: ack.response });
    }
    log("OK");
    return reply(200, { ok: true, deviceId: id, command: v.command, params: v.params, response: ack.response });
  } catch (e) {
    log("TRANSPORT_ERROR", { error: e.message });
    return reply(502, { error: "TRANSPORT_ERROR", message: e.message });
  }
}
