// រត់៖ cd gateway && npm test
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

process.env.KSV_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "ksv-test-"));

const { DEVICE_TYPES } = await import("./catalog.js");
const { validateCommand } = await import("./commands.js");
const store = await import("./store.js");
const svc = await import("./service.js");

const reg = (id, type, extra = {}) => svc.register({ id, name: id, type, adapter: "sim", ...extra });

test("គ្រប់ប្រភេទមាន command ហើយ param spec ត្រឹមត្រូវ", () => {
  for (const [name, t] of Object.entries(DEVICE_TYPES)) {
    assert.ok(t.km && Object.keys(t.commands).length, name);
    for (const [cmd, def] of Object.entries(t.commands)) {
      assert.ok(def.km, `${name}.${cmd} ខ្វះ km`);
      for (const s of Object.values(def.params || {})) assert.ok(["int", "enum", "hex"].includes(s.type));
    }
  }
});

test("អំពូល៖ ពិនិត្យ range, hex, ពាក្យបញ្ជាមិនស្គាល់", () => {
  assert.equal(validateCommand("light", "set_brightness", { value: 50 }).ok, true);
  assert.equal(validateCommand("light", "SET_BRIGHTNESS", { value: 101 }).code, "INVALID_PARAMS");
  assert.equal(validateCommand("light", "SET_BRIGHTNESS", { value: "50" }).code, "INVALID_PARAMS");
  assert.equal(validateCommand("light", "SET_COLOR", { hex: "#FF8800" }).params.hex, "#ff8800");
  assert.equal(validateCommand("light", "SET_COLOR", { hex: "red" }).code, "INVALID_PARAMS");
  assert.equal(validateCommand("light", "EXPLODE").code, "UNKNOWN_COMMAND");
  assert.equal(validateCommand("light", "ON", { extra: 1 }).code, "INVALID_PARAMS");
  assert.equal(validateCommand("toaster", "ON").code, "UNKNOWN_TYPE");
});

test("ឆ្នាំង៖ START ត្រូវមាន durationMinutes និង confirmed", () => {
  const p = { mode: "rice", durationMinutes: 30 };
  assert.equal(validateCommand("cooker", "START", { mode: "rice" }).code, "INVALID_PARAMS");
  assert.equal(validateCommand("cooker", "START", p).code, "CONFIRMATION_REQUIRED");
  assert.equal(validateCommand("cooker", "START", p, { confirmed: true }).ok, true);
  assert.equal(validateCommand("cooker", "START", { ...p, durationMinutes: 9999 }, { confirmed: true }).code, "INVALID_PARAMS");
  assert.equal(validateCommand("cooker", "STOP").ok, true); // បិទមិនត្រូវការបញ្ជាក់
});

test("ធុងបាស/ភ្លេង៖ សំឡេងខ្លាំងត្រូវបញ្ជាក់", () => {
  assert.equal(validateCommand("subwoofer", "SET_VOLUME", { value: 60 }).ok, true);
  assert.equal(validateCommand("subwoofer", "SET_VOLUME", { value: 90 }).code, "CONFIRMATION_REQUIRED");
  assert.equal(validateCommand("subwoofer", "SET_VOLUME", { value: 90 }, { confirmed: true }).ok, true);
  assert.equal(validateCommand("subwoofer", "SET_PHASE", { value: 180 }).ok, true);
  assert.equal(validateCommand("subwoofer", "SET_PHASE", { value: 90 }).code, "INVALID_PARAMS");
  assert.equal(validateCommand("speaker", "SET_VOLUME", { value: 86 }).code, "CONFIRMATION_REQUIRED");
});

test("ទូទឹកកក៖ OFF ត្រូវបញ្ជាក់, សីតុណ្ហភាពក្នុង range", () => {
  assert.equal(validateCommand("fridge", "OFF").code, "CONFIRMATION_REQUIRED");
  assert.equal(validateCommand("fridge", "SET_TEMPERATURE", { value: 4 }).ok, true);
  assert.equal(validateCommand("fridge", "SET_TEMPERATURE", { value: 15 }).code, "INVALID_PARAMS");
  assert.equal(validateCommand("fridge", "SET_FREEZER_TEMPERATURE", { value: -18 }).ok, true);
});

test("ឡាន៖ guard stationary — មិនដឹង ឬកំពុងរត់ = ហាម", () => {
  const p = { durationMinutes: 5 };
  assert.equal(validateCommand("car", "START_ENGINE", p, { confirmed: true }).code, "STATE_UNKNOWN");
  assert.equal(validateCommand("car", "START_ENGINE", p, { confirmed: true, state: { speedKmh: 40 } }).code, "GUARD_BLOCKED");
  assert.equal(validateCommand("car", "UNLOCK", {}, { confirmed: true, state: { speedKmh: 40 } }).code, "GUARD_BLOCKED");
  assert.equal(validateCommand("car", "START_ENGINE", p, { state: { speedKmh: 0 } }).code, "CONFIRMATION_REQUIRED");
  assert.equal(validateCommand("car", "START_ENGINE", p, { confirmed: true, state: { speedKmh: 0 } }).ok, true);
  assert.equal(validateCommand("car", "LOCK").ok, true); // ចាក់សោសុវត្ថិភាពជានិច្ច
});

test("store៖ ចុះឈ្មោះ, ស្ទួន id, endpoint ត្រូវជា LAN", () => {
  assert.equal(reg("lamp-1", "light").status, 201);
  assert.equal(reg("lamp-1", "light").status, 400); // ស្ទួន
  assert.equal(reg("x", "light").status, 400); // id ខ្លីពេក
  assert.equal(reg("tv-1", "toaster").status, 400);
  assert.equal(reg("h1", "light", { adapter: "http", endpoint: "http://192.168.1.50" }).status, 201);
  assert.equal(reg("h2", "light", { adapter: "http", endpoint: "http://8.8.8.8" }).status, 400);
  assert.equal(reg("h3", "light", { adapter: "http", endpoint: "https://example.com" }).status, 400);
  assert.equal(reg("h4", "light", { adapter: "http" }).status, 400);
  assert.equal(store.isPrivateHost("172.16.0.1"), true);
  assert.equal(store.isPrivateHost("172.32.0.1"), false);
  assert.equal(store.isPrivateHost("[::1]"), true);
});

test("sim end-to-end៖ ឆ្នាំង ធុងបាស ឡាន", async () => {
  reg("pot-1", "cooker");
  let r = await svc.command("pot-1", { command: "START", params: { mode: "rice", durationMinutes: 30 } });
  assert.equal(r.status, 428);
  r = await svc.command("pot-1", { command: "START", params: { mode: "rice", durationMinutes: 30 }, confirmed: true });
  assert.equal(r.status, 200);
  assert.equal(svc.device("pot-1").body.state.running, true);
  assert.equal(svc.device("pot-1").body.state.durationMinutes, 30);
  r = await svc.command("pot-1", { command: "STOP" });
  assert.equal(svc.device("pot-1").body.state.running, false);

  reg("bass-1", "subwoofer");
  await svc.command("bass-1", { command: "SET_BASS_LEVEL", params: { value: -3 } });
  assert.equal(svc.device("bass-1").body.state.bassLevel, -3);

  reg("car-1", "car");
  r = await svc.command("car-1", { command: "UNLOCK", confirmed: true });
  assert.equal(r.body.error, "STATE_UNKNOWN");
  assert.equal(svc.reportState("car-1", { speedKmh: 0 }).status, 200);
  r = await svc.command("car-1", { command: "UNLOCK", confirmed: true });
  assert.equal(r.status, 200);
  assert.equal(svc.device("car-1").body.state.locked, false);
  assert.equal(svc.reportState("car-1", { speedKmh: -5 }).status, 400);
  assert.equal(svc.reportState("car-1", { speedKmh: { x: 1 } }).status, 400);
});

test("disable ឧបករណ៍ + ឧបករណ៍មិនមាន + audit log", async () => {
  reg("lamp-2", "light");
  svc.disable("lamp-2", true);
  assert.equal((await svc.command("lamp-2", { command: "ON" })).status, 423);
  svc.disable("lamp-2", false);
  assert.equal((await svc.command("lamp-2", { command: "ON" })).status, 200);
  assert.equal((await svc.command("nope-1", { command: "ON" })).status, 404);

  const log = fs.readFileSync(path.join(process.env.KSV_DATA_DIR, "command-log.jsonl"), "utf8").trim().split("\n").map(JSON.parse);
  assert.ok(log.some((l) => l.result === "CONFIRMATION_REQUIRED"));
  assert.ok(log.some((l) => l.result === "OK"));
  assert.ok(log.some((l) => l.result === "DEVICE_DISABLED"));
});

test("devices.json ត្រូវបានរក្សាទុក ហើយអានវិញបាន", () => {
  store._reset();
  assert.ok(store.getDevice("pot-1"));
  assert.equal(store.getDevice("pot-1").type, "cooker");
});
