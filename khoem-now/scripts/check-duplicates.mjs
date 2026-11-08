#!/usr/bin/env node
// KSV — រកឯកសារ/ថតស្ទួន (run: node scripts/check-duplicates.mjs)
import { readdirSync, statSync } from 'node:fs';
import { join, relative, basename } from 'node:path';

const ROOT = process.cwd();
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'build', '.next', 'coverage']);
const BACKUP = /\.(backup-|bak|before-|orig|old)/i;
const errors = [];
const warnings = [];
const rel = (p) => relative(ROOT, p);

function walk(dir) {
  let names;
  try { names = readdirSync(dir); } catch { return; }
  const set = new Set(names);
  for (const name of names) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (name !== name.trim()) errors.push(`ឈ្មោះមានដកឃ្លាដើម/ចុង៖ "${name}" (${rel(full)})`);
    if (st.isDirectory()) {
      if (name === basename(dir)) errors.push(`ថតស្ទួន៖ ${rel(full)}`);
      walk(full);
      continue;
    }
    const m = name.match(/^(.+)_(\d+)(\.[A-Za-z]+)$/);
    if (m && set.has(m[1] + m[3])) errors.push(`ឯកសារស្ទួន៖ ${rel(full)} (មាន ${m[1]}${m[3]} ស្រាប់)`);
    if (BACKUP.test(name)) warnings.push(`ឯកសារបម្រុង៖ ${rel(full)}`);
  }
}

walk(ROOT);
for (const w of warnings) console.log('⚠', w);
for (const e of errors) console.log('⛔', e);
console.log(`\nកំហុស ${errors.length} · ព្រមាន ${warnings.length}`);
process.exit(errors.length ? 1 : 0);
