const fs = require('fs');
const path = 'src/i18n/translations.ts';
const content = fs.readFileSync(path, 'utf8');
const lang = process.argv[2];
if (!lang) { console.error('Usage: node find_missing.cjs <langCode>'); process.exit(1); }

function extractBlock(langCode) {
  const startRe = new RegExp(`^const ${langCode}: Dict = \\{$`, 'm');
  const startMatch = startRe.exec(content);
  if (!startMatch) throw new Error(`Cannot find start of block for ${langCode}`);
  const bodyStart = startMatch.index + startMatch[0].length;
  const endRe = /^\};$/m;
  endRe.lastIndex = bodyStart;
  const endMatch = endRe.exec(content.slice(bodyStart));
  if (!endMatch) throw new Error(`Cannot find end of block for ${langCode}`);
  return content.slice(bodyStart, bodyStart + endMatch.index);
}

function extractPairs(block) {
  const map = new Map();
  const re = /'([a-zA-Z0-9_.]+)':\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g;
  let m;
  while ((m = re.exec(block))) {
    map.set(m[1], m[2] !== undefined ? m[2] : m[3]);
  }
  return map;
}

const enPairs = extractPairs(extractBlock('en'));
const targetPairs = extractPairs(extractBlock(lang));

const missing = [];
for (const [key, val] of enPairs) {
  if (!targetPairs.has(key)) missing.push([key, val]);
}

console.log(`Language: ${lang}`);
console.log(`Total en keys: ${enPairs.size}`);
console.log(`Total ${lang} keys: ${targetPairs.size}`);
console.log(`Missing in ${lang}: ${missing.length}`);
console.log('---MISSING-START---');
for (const [key, val] of missing) console.log(`${key}\t${val}`);
console.log('---MISSING-END---');
