const fs = require('fs');
const path = 'src/i18n/translations.ts';
const content = fs.readFileSync(path, 'utf8');

function extractBlock(langCode) {
  const startMarker = `const ${langCode}: Dict = {`;
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) throw new Error(`Cannot find block for ${langCode}`);
  const bodyStart = startIdx + startMarker.length;
  const endIdx = content.indexOf('\n};', bodyStart);
  return content.slice(bodyStart, endIdx);
}

function extractPairs(block) {
  const map = new Map();
  const re = /'([a-zA-Z0-9_.]+)':\s*'((?:[^'\\]|\\.)*)'/g;
  let m;
  while ((m = re.exec(block))) {
    map.set(m[1], m[2]);
  }
  return map;
}

const enPairs = extractPairs(extractBlock('en'));
const jaPairs = extractPairs(extractBlock('ja'));

const missing = [];
for (const [key, val] of enPairs) {
  if (!jaPairs.has(key)) missing.push([key, val]);
}

console.log(`Total en keys: ${enPairs.size}`);
console.log(`Total ja keys: ${jaPairs.size}`);
console.log(`Missing in ja: ${missing.length}`);
console.log('---MISSING-START---');
for (const [key, val] of missing) {
  console.log(`${key}\t${val}`);
}
console.log('---MISSING-END---');
