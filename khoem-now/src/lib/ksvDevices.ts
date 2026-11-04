const BASE = '/ksv-api';

export interface KsvDevice {
  id: string;
  name: string;
  type: string;
  adapter: string;
  disabled?: boolean;
  state?: Record<string, unknown>;
}

interface ApiBody { message?: string; error?: string }

async function call<T>(path: string, init?: RequestInit): Promise<{ status: number; body: T | null }> {
  const res = await fetch(BASE + path, { ...init, headers: { 'Content-Type': 'application/json' } });
  let body: T | null = null;
  try { body = (await res.json()) as T; } catch { body = null; }
  return { status: res.status, body };
}

function fail(status: number, body: unknown): Error {
  const b = body as ApiBody | null;
  return new Error(`${status} ${b?.message ?? b?.error ?? 'request failed'}`);
}

export async function getDevice(id: string): Promise<KsvDevice> {
  const r = await call<KsvDevice>(`/devices/${id}`);
  if (r.status !== 200 || !r.body) throw fail(r.status, r.body);
  return r.body;
}

export async function ensureDevice(id: string, name: string, type: string): Promise<KsvDevice> {
  const got = await call<KsvDevice>(`/devices/${id}`);
  if (got.status === 200 && got.body) return got.body;
  if (got.status !== 404) throw fail(got.status, got.body);
  const made = await call<unknown>('/devices', {
    method: 'POST',
    body: JSON.stringify({ id, name, type, adapter: 'sim' }),
  });
  if (made.status !== 201) throw fail(made.status, made.body);
  return getDevice(id);
}

export async function sendCommand(
  id: string,
  command: string,
  params: Record<string, unknown> = {},
  confirmed = false,
): Promise<void> {
  const r = await call<unknown>(`/devices/${id}/command`, {
    method: 'POST',
    body: JSON.stringify({ command, params, confirmed }),
  });
  if (r.status !== 200) throw fail(r.status, r.body);
}
