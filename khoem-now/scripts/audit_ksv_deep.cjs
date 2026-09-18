const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');

const exts = new Set(['.ts', '.tsx', '.js', '.jsx']);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;

  for (const name of fs.readdirSync(dir)) {
    if (
      name === 'node_modules' ||
      name === '.git' ||
      name === 'dist' ||
      name === 'build'
    ) continue;

    const full = path.join(dir, name);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      walk(full, out);
    } else if (exts.has(path.extname(full))) {
      out.push(full);
    }
  }

  return out;
}

function rel(file) {
  return path.relative(ROOT, file).replaceAll(path.sep, '/');
}

function read(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return '';
  }
}

const files = walk(SRC);

console.log('\n==============================================');
console.log(' KSV DEEP STRUCTURE / CONNECTION AUDIT');
console.log(' READ ONLY — NO SOURCE FILE CHANGED');
console.log('==============================================\n');

console.log(`Source files scanned: ${files.length}\n`);

/* ==================================================
   1. VIEW FILES
================================================== */

console.log('----------------------------------------------');
console.log('1. VIEW / PAGE COMPONENTS');
console.log('----------------------------------------------');

const viewFiles = files.filter(f => {
  const p = rel(f);
  return p.includes('/views/') || /View\.(tsx|ts)$/.test(p);
});

for (const file of viewFiles) {
  console.log(`VIEW: ${rel(file)}`);
}

console.log(`\nTotal views: ${viewFiles.length}\n`);

/* ==================================================
   2. APP IMPORTS
================================================== */

console.log('----------------------------------------------');
console.log('2. APP / VIEW IMPORT CONNECTIONS');
console.log('----------------------------------------------');

const appCandidates = files.filter(f => {
  const name = path.basename(f);
  return name === 'App.tsx' || name === 'App.ts';
});

for (const file of appCandidates) {
  const text = read(file);

  console.log(`\nFILE: ${rel(file)}`);

  const imports = [
    ...text.matchAll(
      /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g
    )
  ];

  const viewImports = imports
    .map(m => m[1])
    .filter(x =>
      x.includes('/views/') ||
      x.includes('./views/') ||
      x.includes('../views/')
    );

  if (viewImports.length === 0) {
    console.log('  No direct view imports detected.');
  } else {
    for (const item of [...new Set(viewImports)]) {
      console.log(`  IMPORTS VIEW: ${item}`);
    }
  }
}

/* ==================================================
   3. VIEW STATE / PAGE SWITCHING
================================================== */

console.log('\n----------------------------------------------');
console.log('3. VIEW / PAGE SWITCHING LOGIC');
console.log('----------------------------------------------');

const switchPatterns = [
  /\buseState\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
  /\bset[A-Z][A-Za-z0-9_]*\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
  /\bactive[A-Za-z]*\s*===\s*['"`]([^'"`]+)['"`]/g,
  /\bcurrent[A-Za-z]*\s*===\s*['"`]([^'"`]+)['"`]/g,
  /\bview\s*===\s*['"`]([^'"`]+)['"`]/g
];

for (const file of files) {
  const text = read(file);
  let found = [];

  for (const regex of switchPatterns) {
    for (const m of text.matchAll(regex)) {
      found.push(m[1]);
    }
  }

  found = [...new Set(found)];

  if (found.length > 0) {
    console.log(`\nFILE: ${rel(file)}`);

    for (const value of found) {
      console.log(`  STATE/VALUE: ${value}`);
    }
  }
}

/* ==================================================
   4. NAVIGATION HANDLERS
================================================== */

console.log('\n----------------------------------------------');
console.log('4. NAVIGATION / CLICK HANDLERS');
console.log('----------------------------------------------');

const navigationPatterns = [
  /onClick\s*=\s*\{([^}]+)\}/g,
  /onPress\s*=\s*\{([^}]+)\}/g,
  /\bset[A-Z][A-Za-z0-9_]*\s*\(/g,
  /\bnavigate\s*\(/g,
  /\bpush\s*\(/g
];

for (const file of files) {
  const text = read(file);
  const hits = [];

  for (const regex of navigationPatterns) {
    for (const m of text.matchAll(regex)) {
      hits.push(m[0].trim());
    }
  }

  if (hits.length > 0) {
    console.log(`\nFILE: ${rel(file)}`);

    for (const hit of [...new Set(hits)].slice(0, 50)) {
      console.log(`  ${hit}`);
    }
  }
}

/* ==================================================
   5. RENDERED VIEWS
================================================== */

console.log('\n----------------------------------------------');
console.log('5. VIEW COMPONENT RENDER REFERENCES');
console.log('----------------------------------------------');

const viewNames = viewFiles.map(f =>
  path.basename(f).replace(/\.(tsx|ts)$/, '')
);

for (const file of files) {
  const text = read(file);

  const used = [];

  for (const name of viewNames) {
    const regex = new RegExp(`\\b${name}\\b`, 'g');

    if (regex.test(text)) {
      used.push(name);
    }
  }

  if (used.length > 0) {
    console.log(`\nFILE: ${rel(file)}`);

    for (const name of [...new Set(used)]) {
      console.log(`  REFERENCES: ${name}`);
    }
  }
}

/* ==================================================
   6. TRANSLATION FILES
================================================== */

console.log('\n----------------------------------------------');
console.log('6. TRANSLATION FILES');
console.log('----------------------------------------------');

const translationFiles = files.filter(f => {
  const p = rel(f).toLowerCase();

  return (
    p.includes('translation') ||
    p.includes('locale') ||
    p.includes('localization') ||
    p.includes('i18n')
  );
});

for (const file of translationFiles) {
  console.log(`FILE: ${rel(file)}`);
}

/* ==================================================
   7. TRANSLATION KEYS USED
================================================== */

console.log('\n----------------------------------------------');
console.log('7. TRANSLATION KEYS USED BY SOURCE');
console.log('----------------------------------------------');

const usedKeys = new Map();

const keyPatterns = [
  /\bt\(\s*['"`]([^'"`]+)['"`]/g,
  /\b(?:i18n|intl)\.t\(\s*['"`]([^'"`]+)['"`]/g,
  /\btranslate\(\s*['"`]([^'"`]+)['"`]/g
];

for (const file of files) {
  const text = read(file);

  for (const regex of keyPatterns) {
    for (const m of text.matchAll(regex)) {
      const key = m[1];

      if (!usedKeys.has(key)) {
        usedKeys.set(key, []);
      }

      usedKeys.get(key).push(rel(file));
    }
  }
}

console.log(`Used translation keys: ${usedKeys.size}\n`);

for (const [key, locations] of usedKeys) {
  console.log(`${key}`);

  for (const file of [...new Set(locations)]) {
    console.log(`  <- ${file}`);
  }
}

/* ==================================================
   8. TRANSLATION DEFINITIONS
================================================== */

console.log('\n----------------------------------------------');
console.log('8. TRANSLATION KEY DEFINITIONS');
console.log('----------------------------------------------');

const definitionFiles = translationFiles.filter(f =>
  /translations?\.(ts|tsx|js|jsx)$/i.test(path.basename(f))
);

const definedKeys = new Map();

for (const file of definitionFiles) {
  const text = read(file);

  const patterns = [
    /['"`]([^'"`]+)['"`]\s*:/g,
    /['"`]([^'"`]+)['"`]\s*=>/g
  ];

  for (const regex of patterns) {
    for (const m of text.matchAll(regex)) {
      const key = m[1];

      if (
        key.includes('.') ||
        key.startsWith('intl') ||
        key.startsWith('view') ||
        key.startsWith('dashboard')
      ) {
        if (!definedKeys.has(key)) {
          definedKeys.set(key, []);
        }

        definedKeys.get(key).push(rel(file));
      }
    }
  }
}

console.log(`Defined candidate keys: ${definedKeys.size}`);

/* ==================================================
   9. USED BUT NOT DEFINED
================================================== */

console.log('\n----------------------------------------------');
console.log('9. USED BUT NOT FOUND IN TRANSLATION DEFINITIONS');
console.log('----------------------------------------------');

let missingTranslationCount = 0;

for (const key of usedKeys.keys()) {
  if (!definedKeys.has(key)) {
    console.log(`MISSING: ${key}`);
    missingTranslationCount++;
  }
}

console.log(`\nMissing candidate translation keys: ${missingTranslationCount}`);

/* ==================================================
   10. DUPLICATE TRANSLATION KEYS
================================================== */

console.log('\n----------------------------------------------');
console.log('10. POSSIBLE DUPLICATE TRANSLATION KEYS');
console.log('----------------------------------------------');

const duplicateKeys = new Map();

for (const file of definitionFiles) {
  const text = read(file);

  for (const regex of [
    /['"`]([^'"`]+)['"`]\s*:/g,
    /['"`]([^'"`]+)['"`]\s*=>/g
  ]) {
    for (const m of text.matchAll(regex)) {
      const key = m[1];

      if (!duplicateKeys.has(key)) {
        duplicateKeys.set(key, []);
      }

      duplicateKeys.get(key).push(rel(file));
    }
  }
}

let duplicateCount = 0;

for (const [key, locations] of duplicateKeys) {
  if (locations.length > 1) {
    console.log(`DUPLICATE: ${key}`);

    for (const file of [...new Set(locations)]) {
      console.log(`  <- ${file}`);
    }

    duplicateCount++;
  }
}

console.log(`\nPossible duplicate keys: ${duplicateCount}`);

/* ==================================================
   11. COMPONENT IMPORTS
================================================== */

console.log('\n----------------------------------------------');
console.log('11. COMPONENT IMPORT GRAPH');
console.log('----------------------------------------------');

for (const file of files) {
  const text = read(file);

  const imports = [
    ...text.matchAll(
      /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g
    )
  ]
    .map(m => m[1])
    .filter(x =>
      x.startsWith('./') ||
      x.startsWith('../') ||
      x.startsWith('@/') ||
      x.includes('/src/')
    );

  if (imports.length > 0) {
    console.log(`\n${rel(file)}`);

    for (const item of [...new Set(imports)]) {
      console.log(`  -> ${item}`);
    }
  }
}

/* ==================================================
   12. POTENTIAL DEAD VIEWS
================================================== */

console.log('\n----------------------------------------------');
console.log('12. POSSIBLE UNUSED VIEW FILES');
console.log('----------------------------------------------');

const allSourceText = files
  .map(read)
  .join('\n');

for (const file of viewFiles) {
  const name = path.basename(file).replace(/\.(tsx|ts)$/, '');

  const regex = new RegExp(`\\b${name}\\b`, 'g');
  const count = [...allSourceText.matchAll(regex)].length;

  if (count <= 1) {
    console.log(`POSSIBLY UNUSED: ${rel(file)}`);
  }
}

/* ==================================================
   13. DEFAULT EXPORTS / COMPONENT EXPORTS
================================================== */

console.log('\n----------------------------------------------');
console.log('13. VIEW EXPORT CHECK');
console.log('----------------------------------------------');

for (const file of viewFiles) {
  const text = read(file);

  const hasDefault = /export\s+default\s+/.test(text);
  const hasNamed = /export\s+(const|function|class)\s+/.test(text);

  console.log(
    `${rel(file)} -> default:${hasDefault ? 'YES' : 'NO'} named:${hasNamed ? 'YES' : 'NO'}`
  );
}

/* ==================================================
   14. ERROR-PRONE PATTERNS
================================================== */

console.log('\n----------------------------------------------');
console.log('14. POTENTIAL CONNECTION / CODE RISKS');
console.log('----------------------------------------------');

let riskCount = 0;

for (const file of files) {
  const text = read(file);
  const lines = text.split(/\r?\n/);

  lines.forEach((line, index) => {
    if (
      /TODO|FIXME/i.test(line) ||
      /throw new Error/i.test(line) ||
      /console\.error/i.test(line) ||
      /return null/i.test(line)
    ) {
      console.log(`${rel(file)}:${index + 1}`);
      console.log(`  ${line.trim()}`);
      riskCount++;
    }
  });
}

console.log(`\nPotential risk lines: ${riskCount}`);

/* ==================================================
   FINAL
================================================== */

console.log('\n==============================================');
console.log(' DEEP AUDIT COMPLETE');
console.log(' READ ONLY — NO SOURCE FILE CHANGED');
console.log('==============================================\n');

console.log('IMPORTANT:');
console.log('This audit reports possible problems only.');
console.log('It does NOT automatically modify, delete, rename,');
console.log('or rewrite any KSV source file.\n');
