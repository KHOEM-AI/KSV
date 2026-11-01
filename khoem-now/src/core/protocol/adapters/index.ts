/**
 * Registers the protocol adapters that are really implemented.
 * PROTO_BLE is intentionally not registered: Bluetooth cannot be driven from
 * the backend server — the dispatcher reports it as PROTOCOL_ADAPTER_UNAVAILABLE.
 */

import { registerProtocolAdapter } from "../protocol.registry.ts";
import { createHttpAdapter } from "./http.adapter.ts";
import { createMqttAdapter } from "./mqtt.adapter.ts";

export function registerDefaultProtocolAdapters(): string[] {
  const adapters = [createHttpAdapter(), createMqttAdapter()];
  for (const adapter of adapters) registerProtocolAdapter(adapter);
  return adapters.map((a) => a.code);
}
