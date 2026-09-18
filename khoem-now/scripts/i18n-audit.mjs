#!/usr/bin/env node
/**
 * KSV — i18n Audit  (run: node scripts/i18n-audit.mjs)
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const TRANSLATIONS_FILE = join(SRC, 'i18n', 'translations.ts');
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'build', '.next', 'coverage']);
const SKIP_FILE = /\.(backup-|bak|before-|orig|old)/i;

const args = process.argv.slice(2);
const AS_JSON = args.includes('--json');
const ONLY_LANG = (() => { const i = args.indexOf('--lang'); return i !== -1 ? args[i + 1] : null; })();

function walk(dir, out = []) {
  let entries; try { entries = readdirSync(dir); } catch { return out; }
  for (const name of entries) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    let st; try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) walk(full, out);
    else if (['.ts', '.tsx'].includes(extname(full)) && !SKIP_FILE.test(name)) out.push(full);
  }
  return out;
}

const transSrc = readFileSync(TRANSLATIONS_FILE, 'utf8');

function parseLanguageCodes(source) {
  const m = source.match(/export const TRANSLATIONS[\s\S]*?=\s*\{([\s\S]*?)\n\};/);
  if (!m) return [];
  return m[1].split(',').map((s) => s.trim()).filter((s) => /^[A-Za-z0-9_]+$/.test(s));
}
const LANGS = parseLanguageCodes(transSrc);

function parseDict(source, varName) {
  const re = new RegExp(`^(?:export\\s+)?const\\s+${varName}\\s*:\\s*Dict\\s*=\\s*\\{`, 'm');
  const hit = re.exec(source);
  if (!hit) return null;
  const bodyStart = hit.index + hit[0].length;
  const bodyEnd = source.indexOf('\n};', bodyStart);
  const body = source.slice(bodyStart, bodyEnd === -1 ? source.length : bodyEnd);
  const keys = []; const seen = new Set(); const duplicates = [];
  const keyRe = /^\s*(['"])(.+?)\1\s*:/gm;
  let k;
  while ((k = keyRe.exec(body))) {
    const key = k[2];
    if (seen.has(key)) duplicates.push(key); else seen.add(key);
    keys.push(key);
  }
  return { keys: new Set(keys), count: keys.length, duplicates };
}

const dicts = {};
for (const code of LANGS) dicts[code] = parseDict(transSrc, code);

const usage = new Map();
const files = walk(SRC);
for (const file of files) {
  if (file === TRANSLATIONS_FILE) continue;
  const text = readFileSync(file, 'utf8');
  const re = /\bt\(\s*(['"])((?:\\.|(?!\1)[^\\])+)\1/g;
  let u;
  while ((u = re.exec(text))) {
    const key = u[2];
    if (!usage.has(key)) usage.set(key, new Set());
    usage.get(key).add(relative(ROOT, file));
  }
}
const usedKeys = [...usage.keys()].sort();

const enDict = dicts.en;
if (!enDict) { console.error('✖ រកមិនឃើញ const en: Dict'); process.exit(2); }

const missingInEnglish = usedKeys.filter((k) => !enDict.keys.has(k));
const unusedInEnglish = [...enDict.keys].filter((k) => !usage.has(k)).sort();

const report = LANGS.map((code) => {
  const d = dicts[code];
  if (!d) return { code, error: 'dictionary អានមិនបាន' };
  const missing = usedKeys.filter((k) => !d.keys.has(k));
  const covered = usedKeys.length - missing.length;
  return { code, defined: d.keys.size, missing, missingCount: missing.length,
    duplicates: d.duplicates, coverage: usedKeys.length ? (covered / usedKeys.length) * 100 : 100 };
});

if (AS_JSON) {
  console.log(JSON.stringify({ usedKeysCount: usedKeys.length, missingInEnglish, unusedInEnglish, report }, null, 2));
  process.exit(missingInEnglish.length ? 1 : 0);
}

if (ONLY_LANG) {
  const r = report.find((x) => x.code === ONLY_LANG);
  if (!r) { console.error(`✖ រកមិនឃើញភាសា "${ONLY_LANG}". មាន៖ ${LANGS.join(', ')}`); process.exit(2); }
  console.log(`\n── KEY ខ្វះសម្រាប់ "${ONLY_LANG}" (${r.missingCount}) ──\n`);
  r.missing.forEach((k) => console.log(`  ${k}\n      ↳ ប្រើក្នុង៖ ${[...usage.get(k)].join(', ')}`));
  if (!r.missingCount) console.log('  ✓ គ្មានខ្វះទេ');
  console.log();
  process.exit(0);
}

const pad = (s, n) => String(s).padEnd(n);
const padL = (s, n) => String(s).padStart(n);
console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║              KSV — i18n AUDIT REPORT                        ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');
console.log(`  File កូដដែលស្កេន      ៖ ${files.length}`);
console.log(`  Key ដែលកូដប្រើ (t('…')) ៖ ${usedKeys.length}`);
console.log(`  ភាសាដែលរកឃើញ       ៖ ${LANGS.length}\n`);
console.log(`  ${pad('code', 8)}${padL('keys', 8)}${padL('ខ្វះ', 8)}${padL('ស្ទួន', 8)}${padL('coverage', 12)}`);
console.log('  ' + '─'.repeat(44));
const sorted = [...report].sort((a, b) => (a.coverage ?? 0) - (b.coverage ?? 0));
for (const r of sorted) {
  if (r.error) { console.log(`  ${pad(r.code, 8)}${r.error}`); continue; }
  const bar = r.coverage === 100 ? ' ✓' : '';
  console.log(`  ${pad(r.code, 8)}${padL(r.defined, 8)}${padL(r.missingCount, 8)}${padL(r.duplicates.length, 8)}${padL(r.coverage.toFixed(1) + '%', 12)}${bar}`);
}
if (missingInEnglish.length) {
  console.log(`\n  ⛔ KEY ប្រើក្នុងកូដ តែអត់មានក្នុង en (${missingInEnglish.length})៖`);
  missingInEnglish.forEach((k) => console.log(`      • ${k}  ↳ ${[...usage.get(k)].join(', ')}`));
}
console.log('\n');
process.exit(missingInEnglish.length ? 1 : 0);
