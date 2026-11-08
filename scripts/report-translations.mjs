// Copyright (c) 2026 @KHOEM-AI. All rights reserved.
import { load } from './i18n-parse.mjs';

const data = load();
const en = data.dicts.find((d) => d.name === 'en');
if (!en) { console.log('❌ រកមិនឃើញ dict en'); process.exit(1); }
const E = new Set(en.entries.map((e) => e.key));
let full = 0;
for (const d of data.dicts) {
  const have = new Set(d.entries.map((e) => e.key));
  const n = [...E].filter((k) => have.has(k)).length;
  const pct = Math.round((n / E.size) * 100);
  if (pct >= 100) full++;
  const bar = '█'.repeat(Math.round(pct / 5)).padEnd(20, '░');
  console.log(`${d.name.padEnd(5)} ${bar} ${String(pct).padStart(3)}%  ${n}/${E.size}`);
}
console.log(`\nពេញលេញ ${full}/${data.dicts.length} ភាសា (គិតតាម key របស់ en = ${E.size})`);
