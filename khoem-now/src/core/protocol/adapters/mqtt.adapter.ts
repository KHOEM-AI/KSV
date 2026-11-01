/**
 * KSV — MQTT protocol adapter (code: PROTO_MQTT)
 *
 * Publishes the command to the own broker:
 *   <prefix>/<deviceCode>/command   { "command": "...", "params": {...} }
 *
 * Devices already report back on <prefix>/<deviceCode>/status and /telemetry
 * (handled by infrastructure/mqtt/client.ts).
 *
 * "acknowledged" means the broker accepted the message (QoS 1). The device's
 * own confirmation arrives later on /status or /telemetry.
 */

import type { ProtocolAck, ProtocolAdapter, ProtocolCommand } from "../protocol.types.ts";

export type MqttAdapterDeps = {
  publish?: (deviceCode: string, body: Record<string, unknown>) => Promise<{ topic: string }>;
};

async function defaultPublish(deviceCode: string, body: Record<string, unknown>) {
  const { publishMqttCommand } = await import("../../../infrastructure/mqtt/client.ts");
  return publishMqttCommand(deviceCode, body);
}

export function createMqttAdapter(deps: MqttAdapterDeps = {}): ProtocolAdapter {
  const publish = deps.publish ?? defaultPublish;

  return {
    code: "PROTO_MQTT",

    async send(command: ProtocolCommand): Promise<ProtocolAck> {
      const { topic } = await publish(command.deviceCode, {
        command: command.commandType,
        params: command.payload ?? {},
      });

      return {
        acknowledged: true,
        response: { topic, note: "accepted by broker; device confirms later on /status or /telemetry" },
        receivedAt: new Date(),
      };
    },
  };
}
