// Run: npm run test:catalog
import test from "node:test";
import assert from "node:assert/strict";
import { DEVICE_CATALOG, describeCatalog, resolveCatalogType } from "./device.catalog.ts";
import { catalogMode, checkCatalogCommand } from "./device.validator.ts";

test("catalog has the 10 general device kinds, every command has a Khmer name", () => {
  assert.deepEqual(
    Object.keys(DEVICE_CATALOG).sort(),
    ["ac", "car", "cooker", "dishwasher", "fridge", "light", "robot", "sensor", "speaker", "subwoofer"],
  );
  for (const [type, t] of Object.entries(DEVICE_CATALOG)) {
    assert.ok(t.km, type);
    for (const [cmd, def] of Object.entries(t.commands)) assert.ok(def.km, `${type}.${cmd}`);
  }
});

test("khoem-now types hvac and vehicle map to ac and car; unknown types are skipped", () => {
  assert.equal(resolveCatalogType("hvac"), "ac");
  assert.equal(resolveCatalogType("vehicle"), "car");
  assert.equal(resolveCatalogType("LIGHT"), "light");
  assert.equal(resolveCatalogType("door"), null);
  assert.equal(resolveCatalogType("constructor"), null);
  assert.deepEqual(checkCatalogCommand("door", "UNLOCK", {}), { ok: true, skipped: true });
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
  assert.equal((describeCatalog() as unknown[]).length, 10);
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
