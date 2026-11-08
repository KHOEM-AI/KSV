// Copyright (c) 2026 @KHOEM-AI. All rights reserved.
import fs from 'node:fs';

export const FILE = 'khoem-now/src/i18n/translations.ts';

export function readDicts(file = FILE) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const dicts = [];
  let cur = null;
  lines.forEach((line, i) => {
    if (!cur) {
      const m = line.match(/^const (\w+): Dict = \{\s*$/);
      if (m) cur = { name: m[1], start: i + 1, entries: [], unparsed: 0 };
      return;
    }
    if (/^\};?\s*$/.test(line)) { dicts.push(cur); cur = null; return; }
    const t = line.trim();
    if (!t || t.startsWith('//')) return;
    const k = line.match(/^\s*(?:'((?:[^'\\]|\\.)+)'|"((?:[^"\\]|\\.)+)")\s*:\s*(.*)$/);
    if (k) cur.entries.push({ key: k[1] ?? k[2], rest: k[3], line: i + 1 });
    else cur.unparsed++;
  });
  if (cur) throw new Error(`dict "${cur.name}" មិនបិទ (ចាប់ពីបន្ទាត់ ${cur.start})`);
  const declared = lines.filter((l) => /^const \w+: Dict = \{/.test(l)).length;
  if (declared !== dicts.length) throw new Error(`រកឃើញ ${declared} dict តែអានបាន ${dicts.length} (ទម្រង់ខុស)`);
  return { dicts, text: lines.join('\n') };
}

export function load() {
  try { return readDicts(); } catch (e) { console.log('❌ ' + e.message); process.exit(1); }
}
