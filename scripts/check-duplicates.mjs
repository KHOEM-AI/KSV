// Copyright (c) 2026 @KHOEM-AI. All rights reserved.
import { load } from './i18n-parse.mjs';

const data = load();
let total = 0;
const names = new Map();
for (const d of data.dicts) {
  names.set(d.name, (names.get(d.name) || 0) + 1);
  const seen = new Map();
  for (const e of d.entries) seen.set(e.key, [...(seen.get(e.key) || []), e.line]);
  const dups = [...seen].filter(([, l]) => l.length > 1);
  total += dups.length;
  if (dups.length) {
    console.log(`❌ ${d.name}: ${dups.length} key ស្ទួន`);
    dups.slice(0, 10).forEach(([k, l]) => console.log(`   ${k} → បន្ទាត់ ${l.join(', ')}`));
    if (dups.length > 10) console.log(`   ... និង ${dups.length - 10} ទៀត`);
  }
}
const dupNames = [...names].filter(([, n]) => n > 1);
dupNames.forEach(([n]) => console.log(`❌ dict "${n}" ប្រកាសច្រើនដង`));

const start = data.text.indexOf('export const TRANSLATIONS');
if (start >= 0) {
  const end = data.text.indexOf('\n};', start);
  const block = data.text.slice(start, end > 0 ? end : undefined);
  const unreg = data.dicts.filter((d) => !new RegExp(`\\b${d.name}\\b`).test(block)).map((d) => d.name);
  if (unreg.length) console.log(`⚠️ dict មិនបានចុះក្នុង TRANSLATIONS៖ ${unreg.join(', ')}`);
}
if (total || dupNames.length) { console.log(`\n${total} key ស្ទួន`); process.exit(1); }
console.log('✅ គ្មាន key ស្ទួន');
