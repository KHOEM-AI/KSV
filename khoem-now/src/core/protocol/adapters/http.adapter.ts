/**
 * KSV — Wi-Fi / HTTP protocol adapter (code: PROTO_WIFI)
 *
 * Sends a command straight to a device on the local network:
 *   POST http://<device-ip>[:port]/command   { "command": "...", "params": {...} }
 *
 * The device IP comes from the latest Discovery record of the device.
 * Only LAN / localhost addresses are allowed, so a bad record can never make
 * the backend call a public server. No cloud and no third-party SDK is used.
 */

import type { ProtocolAck, ProtocolAdapter, ProtocolCommand } from "../protocol.types.ts";

export type HttpAdapterDeps = {
  /** Returns the base URL of the device (e.g. http://192.168.1.50) or null. */
  resolveEndpoint?: (deviceId: string) => Promise<string | null>;
  timeoutMs?: number;
};

export function isLanHost(hostname: string): boolean {
  const h = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (h === "localhost" || h === "::1" || h.endsWith(".local")) return true;
  const m = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return false;
  const a = Number(m[1]);
  const b = Number(m[2]);
  return a === 127 || a === 10 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31);
}

// Default resolver: newest Discovery record that has an IP address.
async function resolveFromDiscovery(deviceId: string): Promise<string | null> {
  const { Discovery } = await import("../../../infrastructure/database/models.ts");
  const record = await Discovery.findOne({ deviceId, ipAddress: { $exists: true, $ne: null } })
    .sort({ createdAt: -1 })
    .lean();
  const ip = (record as { ipAddress?: string } | null)?.ipAddress;
  if (!ip) return null;
  const port = process.env.DEVICE_HTTP_PORT;
  return `http://${ip}${port && port !== "80" ? `:${port}` : ""}`;
}

export function createHttpAdapter(deps: HttpAdapterDeps = {}): ProtocolAdapter {
  const resolveEndpoint = deps.resolveEndpoint ?? resolveFromDiscovery;
  const timeoutMs = deps.timeoutMs ?? 5000;

  return {
    code: "PROTO_WIFI",

    async send(command: ProtocolCommand): Promise<ProtocolAck> {
      const base = await resolveEndpoint(command.deviceId);
      if (!base) throw new Error(`No network address known for device ${command.deviceCode}`);

      const url = new URL("/command", base);
      if (!["http:", "https:"].includes(url.protocol) || !isLanHost(url.hostname)) {
        throw new Error(`Refusing non-LAN address for device ${command.deviceCode}`);
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: command.commandType, params: command.payload ?? {} }),
        signal: AbortSignal.timeout(timeoutMs),
      });

      let response: Record<string, unknown> | undefined;
      try {
        response = (await res.json()) as Record<string, unknown>;
      } catch {
        response = undefined;
      }

      return { acknowledged: res.ok, response, receivedAt: new Date() };
    },
  };
}
