// KSV — ឃ្លាំងទុកឧបករណ៍ (ឯកសារ JSON ក្នុងម៉ាស៊ីនខ្លួនឯង — មិនឡើង GitHub)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEVICE_TYPES } from "./catalog.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const dataDir = () => process.env.KSV_DATA_DIR || path.join(HERE, "..", "data");
const devicesFile = () => path.join(dataDir(), "devices.json");
const auditFile = () => path.join(dataDir(), "command-log.jsonl");

export const ADAPTER_NAMES = ["sim", "http", "mqtt"];
const ID_RE = /^[a-z0-9][a-z0-9_-]{1,39}$/i;

let devices = null; // Map(id → device)
const states = new Map(); // Map(id → state ចុងក្រោយ) — ក្នុង memory

function load() {
  if (devices) return devices;
  devices = new Map();
  try {
    const list = JSON.parse(fs.readFileSync(devicesFile(), "utf8"));
    for (const d of list) devices.set(d.id, d);
  } catch {
    /* មិនទាន់មានឯកសារ — ចាប់ផ្តើមទទេ */
  }
  return devices;
}

function save() {
  fs.mkdirSync(dataDir(), { recursive: true });
  const tmp = devicesFile() + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify([...load().values()], null, 2));
  fs.renameSync(tmp, devicesFile()); // សរសេរពេញមុន ទើបជំនួស
}

// http adapter អនុញ្ញាតតែ LAN / localhost (កុំឱ្យ gateway ត្រូវបានប្រើហៅអ៊ីនធឺណិតសាធារណៈ)
export function isPrivateHost(hostname) {
  const h = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (h === "localhost" || h === "::1" || h.endsWith(".local")) return true;
  const m = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  return a === 127 || a === 10 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31);
}

export function registerDevice(input) {
  const errors = [];
  const { id, name, type, adapter = "sim", endpoint, deviceCode, room } = input || {};

  if (!ID_RE.test(id || "")) errors.push("id ត្រូវជា a-z 0-9 _ - (2..40 តួ)");
  if (!name || typeof name !== "string") errors.push("ត្រូវការ name");
  if (!DEVICE_TYPES[type]) errors.push(`type ត្រូវជាមួយក្នុង៖ ${Object.keys(DEVICE_TYPES).join(", ")}`);
  if (!ADAPTER_NAMES.includes(adapter)) errors.push(`adapter ត្រូវជាមួយក្នុង៖ ${ADAPTER_NAMES.join(", ")}`);

  if (adapter === "http") {
    try {
      const u = new URL(endpoint);
      if (!["http:", "https:"].includes(u.protocol)) errors.push("endpoint ត្រូវជា http/https");
      else if (!isPrivateHost(u.hostname)) errors.push("endpoint ត្រូវជា LAN/localhost ប៉ុណ្ណោះ");
    } catch {
      errors.push("adapter http ត្រូវការ endpoint ដូច http://192.168.1.50");
    }
  }
  if (adapter === "mqtt" && deviceCode !== undefined && !ID_RE.test(deviceCode)) {
    errors.push("deviceCode មិនត្រឹមត្រូវ");
  }
  if (errors.length) return { ok: false, errors };

  if (load().has(id)) return { ok: false, errors: [`id "${id}" មានរួចហើយ`] };

  const device = {
    id,
    name,
    type,
    adapter,
    ...(endpoint ? { endpoint } : {}),
    ...(adapter === "mqtt" ? { deviceCode: deviceCode || id } : {}),
    ...(room ? { room: String(room) } : {}),
    disabled: false,
    createdAt: new Date().toISOString(),
  };
  load().set(id, device);
  save();
  return { ok: true, device };
}

export const getDevice = (id) => load().get(id) || null;
export const listDevices = () => [...load().values()];

export function setDisabled(id, disabled) {
  const d = load().get(id);
  if (!d) return null;
  d.disabled = !!disabled;
  save();
  return d;
}

export const getState = (id) => states.get(id) || {};
export function setState(id, patch) {
  const next = { ...getState(id), ...patch, updatedAt: new Date().toISOString() };
  states.set(id, next);
  return next;
}

// កត់ត្រាគ្រប់ពាក្យបញ្ជា (រួមទាំងដែលត្រូវបានរារាំង)
export function audit(entry) {
  try {
    fs.mkdirSync(dataDir(), { recursive: true });
    fs.appendFileSync(auditFile(), JSON.stringify({ at: new Date().toISOString(), ...entry }) + "\n");
  } catch (e) {
    console.error("[KSV audit] សរសេរមិនបាន:", e.message);
  }
}

// សម្រាប់ test
export function _reset() {
  devices = null;
  states.clear();
}
