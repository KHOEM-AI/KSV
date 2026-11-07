// Pure helpers for CatalogPanel (no React, no network) so they can be tested with `npm run test:panel`.
import type { ParamSpec } from '../core/devices/device.catalog';

export type PanelValues = Record<string, string | number>;

export function defaultValue(spec: ParamSpec): string | number {
  if (spec.type === 'int') return Math.round((spec.min + spec.max) / 2);
  if (spec.type === 'enum') return spec.values[0];
  return '#ffb020';
}

/** Turns the control values into the payload of one command (optional params are sent only if touched). */
export function buildPayload(params: Record<string, ParamSpec> | undefined, values: PanelValues): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, spec] of Object.entries(params ?? {})) {
    let v = values[key];
    if (v === undefined) {
      if (spec.optional) continue;
      v = defaultValue(spec);
    }
    if (spec.type === 'int') out[key] = Number(v);
    else if (spec.type === 'enum') out[key] = spec.values.find((x) => String(x) === String(v)) ?? v;
    else out[key] = String(v);
  }
  return out;
}

// Commands the panel asks "are you sure?" for before sending. The Safety Engine on the server still decides.
const CONFIRM: Record<string, string[]> = {
  cooker: ['START', 'SET_TEMPERATURE', 'SET_POWER'],
  heater: ['START', 'SET_TEMPERATURE'],
  dishwasher: ['START'],
  washer: ['START'],
  fridge: ['OFF'],
  car: ['UNLOCK', 'START_ENGINE', 'STOP_ENGINE'],
  motorcycle: ['UNLOCK', 'START_ENGINE', 'STOP_ENGINE'],
  robot: ['START', 'RESUME', 'MOVE', 'GO_HOME', 'RESET_ESTOP'],
  motor: ['START'],
  door: ['UNLOCK'],
};

export function needsConfirm(typeKey: string, command: string): boolean {
  return (CONFIRM[typeKey] ?? []).includes(command);
}

const camel = (s: string) => s.toLowerCase().replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

/** Local mirror of a command — used for the state line and for practice mode (device not connected). */
export function applyPractice(prev: Record<string, unknown>, command: string, payload: Record<string, unknown>): Record<string, unknown> {
  const { confirmed: _confirmed, ...p } = payload;
  const s: Record<string, unknown> = { ...prev, lastCommand: command };
  switch (command) {
    case 'ON': s.power = true; break;
    case 'OFF': s.power = false; s.running = false; break;
    case 'TOGGLE': s.power = !prev.power; break;
    case 'MUTE': s.muted = true; break;
    case 'UNMUTE': s.muted = false; break;
    case 'PLAY': s.playing = true; break;
    case 'PAUSE': s.playing = false; break;
    case 'STOP': s.playing = false; s.running = false; break;
    case 'START': s.running = true; Object.assign(s, p); break;
    case 'LOCK': s.locked = true; break;
    case 'UNLOCK': s.locked = false; break;
    case 'OPEN': s.open = true; break;
    case 'CLOSE': s.open = false; break;
    case 'START_ENGINE': s.engineOn = true; break;
    case 'STOP_ENGINE': s.engineOn = false; break;
    case 'START_RECORDING': s.recording = true; break;
    case 'STOP_RECORDING': s.recording = false; break;
    case 'EMERGENCY_STOP': s.estopped = true; s.running = false; break;
    case 'RESET_ESTOP': s.estopped = false; break;
    default:
      if (command.startsWith('SET_')) s[camel(command.slice(4))] = 'value' in p ? p.value : 'hex' in p ? p.hex : p;
  }
  return s;
}

export function describeState(state: Record<string, unknown>): string[] {
  return Object.entries(state)
    .filter(([k]) => k !== 'lastCommand')
    .map(([k, v]) => `${k}: ${typeof v === 'boolean' ? (v ? 'on' : 'off') : typeof v === 'object' ? JSON.stringify(v) : String(v)}`);
}

export interface ErrorInfo {
  status?: number;
  code: string;
  message: string;
  /** the server asks for an explicit confirmation */
  confirm: boolean;
  /** device/session not reachable -> practice mode instead of an error */
  offline: boolean;
}

export function errorInfo(e: unknown): ErrorInfo {
  const o = (e ?? {}) as { status?: number; code?: string; message?: string; details?: unknown };
  let text = '';
  try {
    text = JSON.stringify(o.details ?? '');
  } catch {
    text = '';
  }
  const network = e instanceof TypeError;
  const status = typeof o.status === 'number' ? o.status : undefined;
  const code = o.code ?? (network ? 'NETWORK_ERROR' : 'ERROR');
  return {
    status,
    code,
    message: o.message ?? String(e),
    confirm: code === 'SAFETY_BLOCKED' && /confirm/i.test(`${text} ${o.message ?? ''}`),
    offline: status === 401 || status === 404 || network,
  };
}
