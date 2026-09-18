/**
 * KSV — MQTT Client
 *
 * Connects the backend to an MQTT broker so real IoT devices can publish
 * telemetry and status updates. Handles:
 *   <prefix>/<deviceCode>/status     → online | offline | warning | maintenance
 *   <prefix>/<deviceCode>/telemetry  → arbitrary JSON payload (saved to DeviceLog)
 *
 * The client is optional at runtime: if MQTT_BROKER_URL is missing or the
 * broker is unreachable, the app keeps working and simply logs the failure.
 */

import mqtt, { type MqttClient } from "mqtt";
import { Device, DeviceLog } from "../database/models.ts";

let client: MqttClient | null = null;
let isConnected = false;

const ALLOWED_STATUSES = new Set([
  "online",
  "offline",
  "warning",
  "maintenance",
  "pairing",
  "error",
  "decommissioned",
]);

function brokerUrl(): string | null {
  const url = process.env.MQTT_BROKER_URL;
  return url && url.trim() !== "" ? url : null;
}

function topicPrefix(): string {
  return process.env.MQTT_TOPIC_PREFIX ?? "ksv/devices";
}

async function handleStatusMessage(deviceCode: string, payload: string): Promise<void> {
  const status = payload.trim().toLowerCase();
  if (!ALLOWED_STATUSES.has(status)) {
    console.warn(`[MQTT] Ignored unknown status "${status}" for ${deviceCode}`);
    return;
  }
  await Device.updateOne(
    { deviceCode },
    { $set: { status, lastSeenAt: new Date() } }
  );
  console.log(`[MQTT] ${deviceCode} → status = ${status}`);
}

async function handleTelemetryMessage(deviceCode: string, payload: string): Promise<void> {
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(payload);
  } catch {
    parsed = { raw: payload };
  }

  const device = await Device.findOne({ deviceCode }).select("_id").lean();
  if (!device) {
    console.warn(`[MQTT] Telemetry for unknown device ${deviceCode}`);
    return;
  }

  await DeviceLog.create({
    deviceId: device._id,
    data: {
      eventType: "telemetry",
      severity: "info",
      message: `Telemetry from ${deviceCode}`,
      payload: parsed,
      receivedAt: new Date().toISOString(),
    },
  });

  await Device.updateOne(
    { _id: device._id },
    { $set: { lastSeenAt: new Date() } }
  );

  console.log(`[MQTT] ${deviceCode} → telemetry saved`);
}

export function startMqttClient(): void {
  const url = brokerUrl();
  if (!url) {
    console.log("[MQTT] MQTT_BROKER_URL not set — MQTT disabled.");
    return;
  }
  if (client) return;

  const prefix = topicPrefix();
  const topics = [`${prefix}/+/status`, `${prefix}/+/telemetry`];

  console.log(`[MQTT] Connecting to ${url} ...`);

  client = mqtt.connect(url, {
    clientId: `${process.env.MQTT_CLIENT_ID ?? "ksv-backend"}-${Math.random().toString(16).slice(2, 8)}`,
    clean: true,
    reconnectPeriod: 5000,
    connectTimeout: 10000,
  });

  client.on("connect", () => {
    isConnected = true;
    console.log("[MQTT] Connected");
    client?.subscribe(topics, { qos: 0 }, (err) => {
      if (err) console.error("[MQTT] Subscribe failed:", err.message);
      else console.log(`[MQTT] Subscribed: ${topics.join(", ")}`);
    });
  });

  client.on("reconnect", () => {
    console.log("[MQTT] Reconnecting...");
  });

  client.on("close", () => {
    isConnected = false;
  });

  client.on("error", (err) => {
    console.error("[MQTT] Error:", err.message);
  });

  client.on("message", (topic, buffer) => {
    const parts = topic.split("/");
    const deviceCode = parts[parts.length - 2];
    const kind = parts[parts.length - 1];
    const payload = buffer.toString("utf8");

    if (!deviceCode || !kind) return;

    void (async () => {
      try {
        if (kind === "status") {
          await handleStatusMessage(deviceCode, payload);
        } else if (kind === "telemetry") {
          await handleTelemetryMessage(deviceCode, payload);
        }
      } catch (err) {
        console.error(`[MQTT] Handler failed for ${topic}:`, err instanceof Error ? err.message : err);
      }
    })();
  });
}

export function stopMqttClient(): void {
  if (!client) return;
  client.end(true, () => {
    console.log("[MQTT] Disconnected");
    client = null;
    isConnected = false;
  });
}

export function mqttIsConnected(): boolean {
  return isConnected;
}
