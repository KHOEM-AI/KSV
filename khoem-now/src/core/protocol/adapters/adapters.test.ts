// Run: npm run test:adapters   (Node 22.18+ strips the types itself)
import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import type { AddressInfo } from "node:net";

import { createHttpAdapter, isLanHost } from "./http.adapter.ts";
import { createMqttAdapter } from "./mqtt.adapter.ts";
import { registerDefaultProtocolAdapters } from "./index.ts";
import { getProtocolAdapter } from "../protocol.registry.ts";
import type { ProtocolCommand } from "../protocol.types.ts";

const cmd = (over: Partial<ProtocolCommand> = {}): ProtocolCommand => ({
  deviceId: "dev1",
  deviceCode: "DEV-04821",
  deviceType: "industrial",
  commandType: "SET_SPEED",
  payload: { value: 40 },
  ...over,
});

function startDevice(handler: (body: any, res: http.ServerResponse) => void) {
  const seen: { method?: string; url?: string; body?: any } = {};
  const server = http.createServer((req, res) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      seen.method = req.method;
      seen.url = req.url;
      seen.body = raw ? JSON.parse(raw) : undefined;
      handler(seen.body, res);
    });
  });
  return new Promise<{ base: string; seen: typeof seen; close: () => void }>((resolve) =>
    server.listen(0, "127.0.0.1", () =>
      resolve({
        base: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
        seen,
        close: () => server.close(),
      }),
    ),
  );
}

test("isLanHost: LAN yes, public no", () => {
  for (const h of ["localhost", "127.0.0.1", "10.0.0.5", "192.168.1.50", "172.16.0.1", "172.31.9.9", "plc.local", "[::1]"]) {
    assert.equal(isLanHost(h), true, h);
  }
  for (const h of ["8.8.8.8", "172.32.0.1", "example.com", "192.169.1.1"]) assert.equal(isLanHost(h), false, h);
});

test("http adapter: POST /command with the command and params, ack on 200", async () => {
  const dev = await startDevice((_b, res) => {
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, speed: 40 }));
  });
  try {
    const adapter = createHttpAdapter({ resolveEndpoint: async () => dev.base });
    const ack = await adapter.send(cmd());
    assert.equal(ack.acknowledged, true);
    assert.deepEqual(ack.response, { ok: true, speed: 40 });
    assert.equal(dev.seen.method, "POST");
    assert.equal(dev.seen.url, "/command");
    assert.deepEqual(dev.seen.body, { command: "SET_SPEED", params: { value: 40 } });
  } finally {
    dev.close();
  }
});

test("http adapter: device error (500) is not acknowledged; empty payload becomes {}", async () => {
  const dev = await startDevice((_b, res) => {
    res.statusCode = 500;
    res.end("boom");
  });
  try {
    const adapter = createHttpAdapter({ resolveEndpoint: async () => dev.base });
    const ack = await adapter.send(cmd({ payload: undefined, commandType: "STOP" }));
    assert.equal(ack.acknowledged, false);
    assert.deepEqual(dev.seen.body, { command: "STOP", params: {} });
  } finally {
    dev.close();
  }
});

test("http adapter: refuses public address, unknown address, and times out", async () => {
  await assert.rejects(createHttpAdapter({ resolveEndpoint: async () => "http://8.8.8.8" }).send(cmd()), /non-LAN/);
  await assert.rejects(createHttpAdapter({ resolveEndpoint: async () => null }).send(cmd()), /No network address/);

  const slow = await startDevice(() => {
    /* never answers */
  });
  try {
    const adapter = createHttpAdapter({ resolveEndpoint: async () => slow.base, timeoutMs: 150 });
    await assert.rejects(adapter.send(cmd()));
  } finally {
    slow.close();
  }
});

test("mqtt adapter: publishes command body, ack = broker accepted; failure propagates", async () => {
  const calls: Array<[string, Record<string, unknown>]> = [];
  const adapter = createMqttAdapter({
    publish: async (code, body) => {
      calls.push([code, body]);
      return { topic: `ksv/devices/${code}/command` };
    },
  });
  const ack = await adapter.send(cmd({ commandType: "ON", payload: undefined }));
  assert.equal(ack.acknowledged, true);
  assert.equal(ack.response?.topic, "ksv/devices/DEV-04821/command");
  assert.deepEqual(calls, [["DEV-04821", { command: "ON", params: {} }]]);

  const down = createMqttAdapter({
    publish: async () => {
      throw new Error("MQTT broker is not connected");
    },
  });
  await assert.rejects(down.send(cmd()), /not connected/);
});

test("registerDefaultProtocolAdapters: PROTO_WIFI and PROTO_MQTT registered, PROTO_BLE is not", () => {
  assert.deepEqual(registerDefaultProtocolAdapters(), ["PROTO_WIFI", "PROTO_MQTT"]);
  assert.equal(getProtocolAdapter("PROTO_WIFI")?.code, "PROTO_WIFI");
  assert.equal(getProtocolAdapter("PROTO_MQTT")?.code, "PROTO_MQTT");
  assert.equal(getProtocolAdapter("PROTO_BLE"), null);
});
