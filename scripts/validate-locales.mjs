// Copyright (c) 2026 @KHOEM-AI. All rights reserved.
import { load } from './i18n-parse.mjs';

const data = load();
const by = Object.fromEntries(data.dicts.map((d) => [d.name, d]));
const { en, km } = by;
if (!en || !km) { console.log('❌ រកមិនឃើញ dict en ឬ km'); process.exit(1); }

const E = new Set(en.entries.map((e) => e.key));
const K = new Set(km.entries.map((e) => e.key));
const missing = [...E].filter((k) => !K.has(k));
const extra = [...K].filter((k) => !E.has(k));
const ph = (d) => new Map(d.entries.map((e) => [e.key, [...e.rest.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',')]));
const pe = ph(en), pk = ph(km);
const phBad = [...E].filter((k) => K.has(k) && pe.get(k) !== pk.get(k));
const empty = km.entries.filter((e) => /^(''|"")\s*,?\s*$/.test(e.rest)).map((e) => e.key);

const show = (label, arr) => {
  if (!arr.length) return;
  console.log(`${label} (${arr.length}):`);
  arr.slice(0, 15).forEach((k) => console.log('   ' + k));
  if (arr.length > 15) console.log(`   ... និង ${arr.length - 15} ទៀត`);
};
console.log(`en ${E.size} key · km ${K.size} key`);
show('❌ km ខ្វះ key ពី en', missing);
show('⚠️ km មាន key លើស', extra);
show('⚠️ placeholder {..} មិនត្រូវគ្នា en/km', phBad);
show('⚠️ km តម្លៃទទេ', empty);
if (en.unparsed || km.unparsed) console.log(`ℹ️ បន្ទាត់មិនបានអាន៖ en ${en.unparsed}, km ${km.unparsed}`);
console.log(`ភាសាផ្សេង ${data.dicts.length - 2} dict · មើល npm run report:translations`);
if (missing.length) process.exit(1);
console.log('✅ km គ្រប់ key ពី en');
