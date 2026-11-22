import test, { after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

// Run from ~/KSV/gateway. No hardware is touched: torch is only reached with a bad command (400), the bridge runs in dry mode.
const TOKEN = "k".repeat(32);
const procs = [];
const start = async (file, port, token) => {
  const p = spawn("node", [file], {
    env: { ...process.env, PORT: String(port), KSV_PHONE_DRY: "1", PHONE_BRIDGE_TOKEN: token },
    stdio: "ignore",
  });
  procs.push(p);
  for (let i = 0; i < 50; i++) {
    try { await fetch(`http://127.0.0.1:${port}/ping`); return; } catch { await new Promise((r) => setTimeout(r, 100)); }
  }
  throw new Error("bridge did not start");
};
const post = (port, body, token) =>
  fetch(`http://127.0.0.1:${port}/command`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { "x-phone-token": token } : {}) },
    body: JSON.stringify(body),
  });
after(() => procs.forEach((p) => p.kill()));

test("torch: missing or wrong token is 401, right token reaches validation", async () => {
  await start("tools/phone-torch.mjs", 9390, TOKEN);
  assert.equal((await post(9390, { command: "NOPE" })).status, 401);
  assert.equal((await post(9390, { command: "NOPE" }, "x".repeat(32))).status, 401);
  assert.equal((await post(9390, { command: "NOPE" }, TOKEN)).status, 400);
});

test("torch: no token configured is 503 even if a header is sent", async () => {
  await start("tools/phone-torch.mjs", 9391, "");
  assert.equal((await post(9391, { command: "NOPE" }, TOKEN)).status, 503);
});

test("bridge: 401 without token, 200 with token (dry run)", async () => {
  await start("tools/phone-bridge.mjs", 9392, TOKEN);
  assert.equal((await post(9392, { command: "GET_STATUS" })).status, 401);
  assert.equal((await post(9392, { command: "GET_STATUS" }, "x".repeat(32))).status, 401);
  const r = await post(9392, { command: "GET_STATUS" }, TOKEN);
  assert.equal(r.status, 200);
  assert.equal((await r.json()).state.batteryPercent, 50);
});
