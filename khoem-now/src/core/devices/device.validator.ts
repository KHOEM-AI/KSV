/**
 * KSV — validates a command + payload against the device catalog.
 *
 * Mode (env KSV_DEVICE_CATALOG):
 *   off    (default) nothing changes
 *   warn   mismatches are written to the log, the command still goes through
 *   strict mismatches are rejected with HTTP 400 before dispatch
 * Device types that are not in the catalog (door, industrial, ...) are skipped.
 * Safety Engine / Emergency Stop / RBAC are NOT touched by this file.
 */

import { DEVICE_CATALOG, resolveCatalogType, type ParamSpec } from "./device.catalog.ts";

export type CatalogMode = "off" | "warn" | "strict";

export type CatalogCheck =
  | { ok: true; skipped?: true; type?: string; command?: string; params?: Record<string, unknown> }
  | { ok: false; code: "UNKNOWN_COMMAND" | "INVALID_PARAMS"; message: string; allowed?: string[] };

// keys the command pipeline itself puts in the payload; not device parameters
const RESERVED_KEYS = new Set(["confirmed"]);

export function catalogMode(): CatalogMode {
  const v = String(process.env.KSV_DEVICE_CATALOG ?? "off").toLowerCase();
  return v === "warn" || v === "strict" ? v : "off";
}

function checkParam(name: string, spec: ParamSpec, raw: unknown): { value?: unknown; error?: string } {
  switch (spec.type) {
    case "int":
      if (typeof raw !== "number" || !Number.isInteger(raw)) return { error: `${name} must be an integer` };
      if (raw < spec.min || raw > spec.max) {
        return { error: `${name} must be between ${spec.min} and ${spec.max}${spec.unit ? " " + spec.unit : ""}` };
      }
      return { value: raw };
    case "enum":
      if (!spec.values.includes(raw as string | number)) return { error: `${name} must be one of: ${spec.values.join(", ")}` };
      return { value: raw };
    case "hex":
      if (typeof raw !== "string" || !/^#[0-9a-fA-F]{6}$/.test(raw)) return { error: `${name} must be a HEX colour like #ff8800` };
      return { value: raw.toLowerCase() };
  }
}

export function checkCatalogCommand(deviceType: string, commandType: string, payload: unknown): CatalogCheck {
  const typeKey = resolveCatalogType(deviceType);
  if (!typeKey) return { ok: true, skipped: true };

  const command = String(commandType ?? "").toUpperCase();
  const def = DEVICE_CATALOG[typeKey].commands[command];
  if (!def) {
    return {
      ok: false,
      code: "UNKNOWN_COMMAND",
      message: `"${typeKey}" has no command "${command}"`,
      allowed: Object.keys(DEVICE_CATALOG[typeKey].commands),
    };
  }

  const body = payload && typeof payload === "object" && !Array.isArray(payload) ? (payload as Record<string, unknown>) : {};
  const spec = def.params ?? {};
  const clean: Record<string, unknown> = {};
  const errors: string[] = [];

  for (const key of Object.keys(body)) {
    if (!(key in spec) && !RESERVED_KEYS.has(key)) errors.push(`param "${key}" is not allowed`);
  }
  for (const [key, s] of Object.entries(spec)) {
    const raw = body[key];
    if (raw === undefined) {
      if (!s.optional) errors.push(`param "${key}" is required`);
      continue;
    }
    const r = checkParam(key, s, raw);
    if (r.error) errors.push(r.error);
    else clean[key] = r.value;
  }
  if (errors.length) return { ok: false, code: "INVALID_PARAMS", message: errors.join("; ") };

  return { ok: true, type: typeKey, command, params: clean };
}
