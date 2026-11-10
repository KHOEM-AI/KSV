// Pure helpers for CatalogPanel (no React, no network) so they can be tested with `npm run test:panel`.
// The panel is built from what the KSV gateway says about a device type (GET /ksv-api/types/:type),
// so the gateway stays the only place that defines which commands exist.

export interface ParamInfo {
  type?: string;
  min?: number;
  max?: number;
  unit?: string;
  values?: (string | number)[];
  required?: boolean;
  optional?: boolean;
}

export interface CommandInfo {
  command: string;
  km?: string;
  readOnly?: boolean;
  needsConfirmation?: boolean;
  params?: Record<string, ParamInfo>;
}

export interface TypeInfo {
  type: string;
  km?: string;
  commands: CommandInfo[];
}

export type PanelValues = Record<string, string | number | boolean>;

/** Used when the gateway cannot describe a type: the safest controls every device understands. */
export const FALLBACK_TYPE: TypeInfo = {
  type: 'generic',
  km: 'ឧបករណ៍ទូទៅ',
  commands: [
    { command: 'ON', km: 'បើក' },
    { command: 'OFF', km: 'បិទ' },
    { command: 'GET_STATUS', km: 'ស្ថានភាព', readOnly: true },
  ],
};

export const isOptional = (p: ParamInfo): boolean => p.optional === true || p.required === false;

export function defaultValue(p: ParamInfo): string | number | boolean {
  if (p.type === 'int' || p.type === 'number') return Math.round(((p.min ?? 0) + (p.max ?? 100)) / 2);
  if (p.type === 'enum') return p.values?.[0] ?? '';
  if (p.type === 'hex' || p.type === 'color') return '#ffb020';
  if (p.type === 'bool' || p.type === 'boolean') return false;
  return '';
}

/** Turns the control values into the params of one command (optional params are sent only if touched). */
export function buildPayload(params: Record<string, ParamInfo> | undefined, values: PanelValues): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, spec] of Object.entries(params ?? {})) {
    let v = values[key];
    if (v === undefined) {
      if (isOptional(spec)) continue;
      v = defaultValue(spec);
    }
    if (spec.type === 'int' || spec.type === 'number') out[key] = Number(v);
    else if (spec.type === 'enum') out[key] = spec.values?.find((x) => String(x) === String(v)) ?? v;
    else if (spec.type === 'bool' || spec.type === 'boolean') out[key] = Boolean(v);
    else out[key] = String(v);
  }
  return out;
}

/** Accepts the gateway answer only if it has the expected shape. */
export function parseType(body: unknown): TypeInfo | null {
  const b = body as { type?: unknown; km?: unknown; commands?: unknown } | null;
  if (!b || typeof b !== 'object' || !Array.isArray(b.commands)) return null;
  const commands = (b.commands as unknown[]).filter(
    (c): c is CommandInfo => !!c && typeof c === 'object' && typeof (c as { command?: unknown }).command === 'string',
  );
  if (commands.length === 0) return null;
  return { type: typeof b.type === 'string' ? b.type : 'device', km: typeof b.km === 'string' ? b.km : undefined, commands };
}

export const errorText = (e: unknown): string => (e instanceof Error ? e.message : String(e));

/** The gateway answers 428 CONFIRMATION_REQUIRED when a command needs an explicit "yes". */
export const isConfirmRequired = (e: unknown): boolean => /^428\b|CONFIRMATION_REQUIRED/i.test(errorText(e));

export function describeState(state: Record<string, unknown> | undefined): string[] {
  return Object.entries(state ?? {})
    .filter(([k]) => k !== 'lastCommand' && k !== 'updatedAt')
    .map(([k, v]) => `${k}: ${typeof v === 'boolean' ? (v ? 'on' : 'off') : typeof v === 'object' ? JSON.stringify(v) : String(v)}`);
}
