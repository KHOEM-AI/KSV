// Run: npm run test:aggregates
import test from "node:test";
import assert from "node:assert/strict";
import { averageDurationMs, countByUtcDay, countByUtcHour, firstPerKey, topSitesByDevices } from "./portableAggregates.ts";

test("firstPerKey keeps the first (newest) row of each key", () => {
  const m = firstPerKey([{ d: "a", v: 3 }, { d: "b", v: 2 }, { d: "a", v: 1 }], "d");
  assert.equal(m.get("a")?.v, 3);
  assert.equal(m.get("b")?.v, 2);
  assert.equal(m.size, 2);
});

test("countByUtcHour groups by UTC hour, sorted", () => {
  const r = countByUtcHour([
    { t: new Date("2026-11-24T05:30:00Z") }, { t: new Date("2026-11-24T05:59:59Z") }, { t: new Date("2026-11-23T02:00:00Z") },
    { t: "not a date" },
  ], "t");
  assert.deepEqual(r, [{ _id: 2, count: 1 }, { _id: 5, count: 2 }]);
});

test("countByUtcDay groups by UTC day, oldest first", () => {
  const r = countByUtcDay([
    { t: new Date("2026-11-24T23:59:00Z") }, { t: new Date("2026-11-23T00:01:00Z") }, { t: new Date("2026-11-24T00:00:00Z") },
  ], "t");
  assert.deepEqual(r.map((x) => [x.month, x.day, x.count]), [[11, 23, 1], [11, 24, 2]]);
});

test("averageDurationMs ignores rows without both dates; null when empty", () => {
  const a = new Date("2026-11-24T05:30:00Z");
  const b = new Date("2026-11-24T05:30:02Z");
  assert.equal(averageDurationMs([{ s: a, e: b }, { s: a, e: new Date("2026-11-24T05:30:04Z") }, { s: a }, { e: b }], "s", "e"), 3000);
  assert.equal(averageDurationMs([{ s: a }], "s", "e"), null);
  assert.equal(averageDurationMs([], "s", "e"), null);
});

test("topSitesByDevices counts total and online, biggest first, limited, skips no site", () => {
  const r = topSitesByDevices([
    { siteId: "x", status: "online" }, { siteId: "x", status: "offline" }, { siteId: "y", status: "online" },
    { siteId: "x", status: "online" }, { siteId: null, status: "online" }, { status: "online" },
  ], 1);
  assert.deepEqual(r, [{ _id: "x", total: 3, online: 2 }]);
});
