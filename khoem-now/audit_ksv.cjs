const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');

const exts = new Set(['.ts', '.tsx', '.js', '.jsx', '.md']);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;

  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git' || name === 'dist' || name === 'build') continue;

    const full = path.join(dir, name);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) walk(full, out);
    else if (exts.has(path.extname(full))) out.push(full);
  }

  return out;
}

function rel(file) {
  return path.relative(ROOT, file).replaceAll(path.sep, '/');
}

const files = walk(ROOT);

const sourceFiles = files.filter(f =>
  ['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(f))
);

const mdFiles = files.filter(f => path.extname(f) === '.md');

console.log('\n========================================');
console.log(' KSV PROJECT STRUCTURE AUDIT');
console.log('========================================\n');

console.log(`Total source files : ${sourceFiles.length}`);
console.log(`Total markdown     : ${mdFiles.length}`);
console.log(`Total scanned      : ${files.length}\n`);


// --------------------------------------------------
// 1. Translation usage
// --------------------------------------------------

const usedKeys = new Map();

const keyPatterns = [
  /\bt\(\s*['"`]([^'"`]+)['"`]/g,
  /\b(?:i18n|intl)\.t\(\s*['"`]([^'"`]+)['"`]/g,
  /\btranslate\(\s*['"`]([^'"`]+)['"`]/g
];

for (const file of sourceFiles) {
  const text = fs.readFileSync(file, 'utf8');

  for (const regex of keyPatterns) {
    let m;

    while ((m = regex.exec(text)) !== null) {
      const key = m[1];

      if (!usedKeys.has(key)) usedKeys.set(key, []);
      usedKeys.get(key).push(rel(file));
    }
  }
}

console.log('----------------------------------------');
console.log('TRANSLATION KEYS USED BY APPLICATION');
console.log('----------------------------------------');
console.log(`Used translation keys: ${usedKeys.size}\n`);


// --------------------------------------------------
// 2. Find translation files
// --------------------------------------------------

const translationFiles = sourceFiles.filter(f => {
  const p = rel(f).toLowerCase();

  return (
    p.includes('translation') ||
    p.includes('localization') ||
    p.includes('locale') ||
    p.includes('i18n')
  );
});

console.log('----------------------------------------');
console.log('TRANSLATION / I18N FILES');
console.log('----------------------------------------');

for (const file of translationFiles) {
  console.log(rel(file));
}

console.log('');


// --------------------------------------------------
// 3. Find navigation / routing
// --------------------------------------------------

const routeHits = [];

const routePatterns = [
  /\bpath\s*[:=]\s*['"`]([^'"`]+)['"`]/g,
  /\bto\s*[:=]\s*['"`]([^'"`]+)['"`]/g,
  /\bhref\s*[:=]\s*['"`]([^'"`]+)['"`]/g,
  /\bnavigate\(\s*['"`]([^'"`]+)['"`]/g,
  /\bpush\(\s*['"`]([^'"`]+)['"`]/g,
  /\bpathname\s*[:=]\s*['"`]([^'"`]+)['"`]/g
];

for (const file of sourceFiles) {
  const text = fs.readFileSync(file, 'utf8');

  for (const regex of routePatterns) {
    let m;

    while ((m = regex.exec(text)) !== null) {
      const value = m[1];

      if (
        value.startsWith('/') ||
        value.startsWith('./') ||
        value.startsWith('../')
      ) {
        routeHits.push({
          file: rel(file),
          value
        });
      }
    }
  }
}

console.log('----------------------------------------');
console.log('NAVIGATION / ROUTE REFERENCES');
console.log('----------------------------------------');

const uniqueRoutes = new Map();

for (const hit of routeHits) {
  if (!uniqueRoutes.has(hit.value)) {
    uniqueRoutes.set(hit.value, []);
  }

  uniqueRoutes.get(hit.value).push(hit.file);
}

for (const [route, locations] of uniqueRoutes) {
  console.log(`ROUTE: ${route}`);

  for (const location of [...new Set(locations)]) {
    console.log(`  <- ${location}`);
  }
}

console.log(`\nUnique route references: ${uniqueRoutes.size}\n`);


// --------------------------------------------------
// 4. Buttons / actions
// --------------------------------------------------

const actionHits = [];

const actionPatterns = [
  /\bonClick\s*=\s*\{([^}]+)\}/g,
  /\bonPress\s*=\s*\{([^}]+)\}/g,
  /<button\b/gi,
  /<Button\b/gi,
  /<Pressable\b/gi
];

for (const file of sourceFiles) {
  const text = fs.readFileSync(file, 'utf8');

  if (
    /<button\b/i.test(text) ||
    /<Button\b/i.test(text) ||
    /<Pressable\b/i.test(text) ||
    /\bonClick\s*=/.test(text) ||
    /\bonPress\s*=/.test(text)
  ) {
    actionHits.push(rel(file));
  }
}

console.log('----------------------------------------');
console.log('FILES CONTAINING UI ACTIONS / BUTTONS');
console.log('----------------------------------------');

for (const file of [...new Set(actionHits)]) {
  console.log(file);
}

console.log(`\nAction/UI files: ${new Set(actionHits).size}\n`);


// --------------------------------------------------
// 5. TODO / FIXME / placeholder
// --------------------------------------------------

console.log('----------------------------------------');
console.log('TODO / FIXME / PLACEHOLDER CHECK');
console.log('----------------------------------------');

let todoCount = 0;

for (const file of sourceFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);

  lines.forEach((line, index) => {
    if (
      /\bTODO\b/i.test(line) ||
      /\bFIXME\b/i.test(line) ||
      /not implemented/i.test(line) ||
      /placeholder/i.test(line) ||
      /coming soon/i.test(line)
    ) {
      console.log(`${rel(file)}:${index + 1}`);
      console.log(`  ${line.trim()}`);
      todoCount++;
    }
  });
}

console.log(`\nPotential incomplete markers: ${todoCount}\n`);


// --------------------------------------------------
// 6. Empty / suspicious files
// --------------------------------------------------

console.log('----------------------------------------');
console.log('VERY SMALL SOURCE FILES');
console.log('----------------------------------------');

for (const file of sourceFiles) {
  const text = fs.readFileSync(file, 'utf8').trim();

  if (text.length < 80) {
    console.log(`${rel(file)}  (${text.length} chars)`);
  }
}

console.log('');


// --------------------------------------------------
// 7. Duplicate-looking filenames
// --------------------------------------------------

console.log('----------------------------------------');
console.log('POSSIBLE DUPLICATE FILE NAMES');
console.log('----------------------------------------');

const byName = new Map();

for (const file of files) {
  const name = path.basename(file).toLowerCase();

  if (!byName.has(name)) byName.set(name, []);
  byName.get(name).push(rel(file));
}

for (const [name, locations] of byName) {
  if (locations.length > 1) {
    console.log(`\n${name}`);

    for (const location of locations) {
      console.log(`  ${location}`);
    }
  }
}

console.log('\n========================================');
console.log(' AUDIT COMPLETE - NO SOURCE FILE CHANGED');
console.log('========================================\n');

