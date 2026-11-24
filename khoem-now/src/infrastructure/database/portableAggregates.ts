// Plain-JavaScript replacements for aggregation operators that FerretDB (SQLite) does not implement:
// $first, $hour, $dayOfMonth, $month, $subtract, $avg of an expression, $cond, $eq.
// The route reads the documents with find() and these functions do the counting, so the same code works on any MongoDB-compatible database.

type Row = Record<string, any>;

// Newest row per key. `rows` must already be sorted newest first (the first row of each key wins, like $first).
export function firstPerKey(rows: Row[], key: string): Map<string, Row> {
  const out = new Map<string, Row>();
  for (const r of rows) {
    const k = String(r[key]);
    if (!out.has(k)) out.set(k, r);
  }
  return out;
}

// Rows per UTC hour of `field` (same as $hour, which is UTC): [{ _id: hour, count }], sorted by hour.
export function countByUtcHour(rows: Row[], field: string): { _id: number; count: number }[] {
  const n = new Map<number, number>();
  for (const r of rows) {
    const d = r[field] instanceof Date ? r[field] : new Date(r[field]);
    if (Number.isNaN(d.getTime())) continue;
    n.set(d.getUTCHours(), (n.get(d.getUTCHours()) ?? 0) + 1);
  }
  return [...n.entries()].sort((a, b) => a[0] - b[0]).map(([_id, count]) => ({ _id, count }));
}

// Rows per UTC calendar day of `field`, oldest day first: [{ day, month, count }].
export function countByUtcDay(rows: Row[], field: string): { day: number; month: number; count: number; t: number }[] {
  const n = new Map<string, { day: number; month: number; count: number; t: number }>();
  for (const r of rows) {
    const d = r[field] instanceof Date ? r[field] : new Date(r[field]);
    if (Number.isNaN(d.getTime())) continue;
    const t = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    const k = String(t);
    const cur = n.get(k) ?? { day: d.getUTCDate(), month: d.getUTCMonth() + 1, count: 0, t };
    cur.count += 1;
    n.set(k, cur);
  }
  return [...n.values()].sort((a, b) => a.t - b.t);
}

// Average (end - start) in milliseconds over rows that have both dates; null when there is none.
export function averageDurationMs(rows: Row[], startField: string, endField: string): number | null {
  let sum = 0;
  let n = 0;
  for (const r of rows) {
    const a = r[startField] ? new Date(r[startField]).getTime() : NaN;
    const b = r[endField] ? new Date(r[endField]).getTime() : NaN;
    if (Number.isNaN(a) || Number.isNaN(b)) continue;
    sum += b - a;
    n += 1;
  }
  return n ? sum / n : null;
}

// Devices per site with how many are online, biggest site first: [{ _id, total, online }].
export function topSitesByDevices(devices: Row[], limit: number): { _id: unknown; total: number; online: number }[] {
  const n = new Map<string, { _id: unknown; total: number; online: number }>();
  for (const d of devices) {
    if (d.siteId === null || d.siteId === undefined) continue;
    const k = String(d.siteId);
    const cur = n.get(k) ?? { _id: d.siteId, total: 0, online: 0 };
    cur.total += 1;
    if (d.status === "online") cur.online += 1;
    n.set(k, cur);
  }
  return [...n.values()].sort((a, b) => b.total - a.total).slice(0, limit);
}
