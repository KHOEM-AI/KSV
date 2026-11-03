// Run: npm run test:catalog
import test from "node:test";
import assert from "node:assert/strict";
import { DEVICE_CATALOG, describeCatalog, resolveCatalogType } from "./device.catalog.ts";
import { catalogMode, checkCatalogCommand } from "./device.validator.ts";

test("catalog has the 22 general device kinds, every command has a Khmer name", () => {
  assert.deepEqual(Object.keys(DEVICE_CATALOG).sort(), [
    "ac", "camera", "car", "cooker", "dishwasher", "door", "fan", "fridge", "gate", "generic", "heater", "light",
    "motor", "motorcycle", "pump", "robot", "sensor", "speaker", "street_light", "subwoofer", "tv", "washer",
  ]);
  for (const [type, t] of Object.entries(DEVICE_CATALOG)) {
    assert.ok(t.km, type);
    for (const [cmd, def] of Object.entries(t.commands)) assert.ok(def.km, `${type}.${cmd}`);
  }
});

test("khoem-now types hvac and vehicle map to ac and car; unknown types are skipped", () => {
  assert.equal(resolveCatalogType("hvac"), "ac");
  assert.equal(resolveCatalogType("vehicle"), "car");
  assert.equal(resolveCatalogType("LIGHT"), "light");
  assert.equal(resolveCatalogType("door"), "door");
  assert.equal(resolveCatalogType("industrial"), null);
  assert.equal(resolveCatalogType("constructor"), null);
  assert.deepEqual(checkCatalogCommand("industrial", "START", {}), { ok: true, skipped: true });
});

test("ranges, enums, hex, required and unknown params", () => {
  assert.equal(checkCatalogCommand("ac", "set_temperature", { value: 24 }).ok, true);
  assert.equal(checkCatalogCommand("hvac", "SET_TEMPERATURE", { value: 40 }).ok, false);
  assert.equal(checkCatalogCommand("ac", "SET_TEMPERATURE", { value: "24" }).ok, false);
  assert.equal(checkCatalogCommand("ac", "SET_TEMPERATURE", {}).ok, false);
  assert.equal(checkCatalogCommand("ac", "SET_TEMPERATURE", { value: 24, extra: 1 }).ok, false);
  assert.equal(checkCatalogCommand("light", "SET_COLOR", { hex: "#FF8800" }).ok, true);
  assert.equal(checkCatalogCommand("light", "SET_COLOR", { hex: "red" }).ok, false);
  assert.equal(checkCatalogCommand("subwoofer", "SET_PHASE", { value: 180 }).ok, true);
  assert.equal(checkCatalogCommand("subwoofer", "SET_PHASE", { value: 90 }).ok, false);
  assert.equal(checkCatalogCommand("fridge", "SET_FREEZER_TEMPERATURE", { value: -18 }).ok, true);
});

test("cooker START needs mode and durationMinutes; 'confirmed' is allowed as a pipeline key", () => {
  assert.equal(checkCatalogCommand("cooker", "START", { mode: "rice" }).ok, false);
  const ok = checkCatalogCommand("cooker", "START", { mode: "rice", durationMinutes: 30, confirmed: true });
  assert.equal(ok.ok, true);
  assert.deepEqual((ok as { params: object }).params, { mode: "rice", durationMinutes: 30 });
  assert.equal(checkCatalogCommand("cooker", "START", { mode: "rice", durationMinutes: 9999 }).ok, false);
});

test("unknown command lists the allowed ones; missing payload counts as {}", () => {
  const r = checkCatalogCommand("robot", "EXPLODE", {});
  assert.equal(r.ok, false);
  assert.ok((r as { allowed: string[] }).allowed.includes("EMERGENCY_STOP"));
  assert.equal(checkCatalogCommand("light", "ON", undefined).ok, true);
  assert.equal(checkCatalogCommand("robot", "MOVE", { direction: "left", distanceCm: 30, speedPercent: 40 }).ok, true);
});

test("describeCatalog: list, one type, unknown type", () => {
  assert.equal((describeCatalog() as unknown[]).length, 22);
  const one = describeCatalog("cooker") as { commands: { command: string }[] };
  assert.ok(one.commands.some((c) => c.command === "START"));
  assert.equal(describeCatalog("toaster"), null);
});

test("catalogMode defaults to off", () => {
  const saved = process.env.KSV_DEVICE_CATALOG;
  try {
    delete process.env.KSV_DEVICE_CATALOG;
    assert.equal(catalogMode(), "off");
    process.env.KSV_DEVICE_CATALOG = "STRICT";
    assert.equal(catalogMode(), "strict");
    process.env.KSV_DEVICE_CATALOG = "warn";
    assert.equal(catalogMode(), "warn");
    process.env.KSV_DEVICE_CATALOG = "banana";
    assert.equal(catalogMode(), "off");
  } finally {
    if (saved === undefined) delete process.env.KSV_DEVICE_CATALOG;
    else process.env.KSV_DEVICE_CATALOG = saved;
  }
});

test("lights: house bulb, street light, car and motorcycle lights", () => {
  assert.equal(checkCatalogCommand("bulb", "ON", {}).ok, true);
  assert.equal(checkCatalogCommand("lamp", "SET_BRIGHTNESS", { value: 60 }).ok, true);
  assert.equal(checkCatalogCommand("light", "SET_TIMER", { value: 30 }).ok, true);
  assert.equal(checkCatalogCommand("street_light", "SET_MODE", { value: "auto" }).ok, true);
  assert.equal(checkCatalogCommand("streetlight", "SET_MODE", { value: "dark" }).ok, false);
  assert.equal(checkCatalogCommand("car", "SET_HEADLIGHT", { value: "high" }).ok, true);
  assert.equal(checkCatalogCommand("vehicle", "SET_TURN_SIGNAL", { value: "hazard" }).ok, true);
  assert.equal(checkCatalogCommand("car", "SET_INTERIOR_LIGHT", { value: 50 }).ok, true);
  assert.equal(checkCatalogCommand("motorbike", "SET_HEADLIGHT", { value: "low" }).ok, true);
  assert.equal(checkCatalogCommand("motorcycle", "SET_HEADLIGHT", { value: "blue" }).ok, false);
  assert.equal(checkCatalogCommand("motorcycle", "SET_INTERIOR_LIGHT", { value: 5 }).ok, false);
});

test("other general devices: generic, fan, tv, gate, door, camera, heater, pump, motor, washer", () => {
  assert.equal(checkCatalogCommand("outlet", "TOGGLE", {}).ok, true);
  assert.equal(checkCatalogCommand("relay", "SET_LEVEL", { value: 50 }).ok, true);
  assert.equal(checkCatalogCommand("generic", "SET_LEVEL", { value: 101 }).ok, false);
  assert.equal(checkCatalogCommand("fan", "SET_SPEED", { value: 3 }).ok, true);
  assert.equal(checkCatalogCommand("fan", "SET_SPEED", { value: 9 }).ok, false);
  assert.equal(checkCatalogCommand("television", "SET_INPUT", { value: "hdmi2" }).ok, true);
  assert.equal(checkCatalogCommand("garage", "SET_POSITION", { value: 50 }).ok, true);
  assert.equal(checkCatalogCommand("lock", "UNLOCK", {}).ok, true);
  assert.equal(checkCatalogCommand("cctv", "START_RECORDING", {}).ok, true);
  assert.equal(checkCatalogCommand("water_heater", "START", { temperature: 60 }).ok, false); // durationMinutes required
  assert.equal(checkCatalogCommand("water_heater", "START", { durationMinutes: 30, temperature: 60 }).ok, true);
  assert.equal(checkCatalogCommand("pump", "SET_SPEED", { value: 5 }).ok, false);
  assert.equal(checkCatalogCommand("motor", "SET_DIRECTION", { value: "reverse" }).ok, true);
  assert.equal(checkCatalogCommand("washing_machine", "START", { program: "eco" }).ok, true);
});
