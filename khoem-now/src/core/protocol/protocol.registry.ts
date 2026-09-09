import type { ProtocolAdapter } from "./protocol.types.ts";

const adapters = new Map<string, ProtocolAdapter>();

export function registerProtocolAdapter(adapter: ProtocolAdapter): void {
  adapters.set(adapter.code, adapter);
}

export function getProtocolAdapter(code: string): ProtocolAdapter | null {
  return adapters.get(code) ?? null;
}
