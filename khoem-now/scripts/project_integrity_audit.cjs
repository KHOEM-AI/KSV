const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');

const EXTS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs'
]);

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.expo',
  '.next',
  'coverage'
]);

const errors = [];
const warnings = [];
const infos = [];
const falsePositives = [];

function add(list, code, file, message, extra = '') {
  list.push({
    code,
    file: file ? rel(file) : '',
    message,
    extra
  });
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;

  for (const name of fs.readdirSync(dir)) {
    if (IGNORE_DIRS.has(name)) continue;

    const full = path.join(dir, name);

    let stat;
    try {
      stat = fs.statSync(full);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      walk(full, out);
    } else if (EXTS.has(path.extname(full))) {
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

function exists(file) {
  try {
    return fs.existsSync(file) && fs.statSync(file).isFile();
  } catch {
    return false;
  }
}

function unique(arr) {
  return [...new Set(arr)];
}

function stripExtension(file) {
  return file.replace(/\.(tsx|ts|jsx|js|mjs|cjs)$/i, '');
}

function isSourceFile(file) {
  return EXTS.has(path.extname(file));
}

/* =========================================================
   SOURCE INVENTORY
========================================================= */

const files = walk(SRC);

console.log('\n============================================================');
console.log(' PROJECT INTEGRITY AUDIT');
console.log(' READ ONLY — NO SOURCE FILE CHANGED');
console.log('============================================================\n');

console.log(`Project root : ${ROOT}`);
console.log(`Source root  : ${rel(SRC) || 'src'}`);
console.log(`Source files : ${files.length}\n`);

if (!fs.existsSync(SRC)) {
  add(
    errors,
    'SRC_ROOT_MISSING',
    null,
    `Source directory does not exist: ${rel(SRC)}`
  );
}

/* =========================================================
   PATH ALIAS
========================================================= */

let tsconfig = null;

for (const name of ['tsconfig.json', 'jsconfig.json']) {
  const candidate = path.join(ROOT, name);

  if (exists(candidate)) {
    try {
      tsconfig = JSON.parse(read(candidate));
      infos.push({
        code: 'CONFIG_FOUND',
        file: name,
        message: `Found ${name}`
      });
      break;
    } catch {
      add(
        warnings,
        'CONFIG_PARSE_FAILED',
        candidate,
        `Could not parse ${name} as JSON.`
      );
    }
  }
}

let aliasBaseUrl = ROOT;
const aliases = {};

if (tsconfig?.compilerOptions) {
  const options = tsconfig.compilerOptions;

  if (options.baseUrl) {
    aliasBaseUrl = path.resolve(ROOT, options.baseUrl);
  }

  if (options.paths && typeof options.paths === 'object') {
    for (const [key, values] of Object.entries(options.paths)) {
      if (!Array.isArray(values)) continue;

      aliases[key] = values.map(v =>
        path.resolve(aliasBaseUrl, v.replace(/\*$/, ''))
      );
    }
  }
}

/* =========================================================
   IMPORT EXTRACTION
========================================================= */

function extractImports(text) {
  const results = [];

  const patterns = [
    /import\s+(?:[\s\S]*?\s+from\s+)?['"`]([^'"`]+)['"`]/g,
    /export\s+(?:[\s\S]*?\s+from\s+)?['"`]([^'"`]+)['"`]/g,
    /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g
  ];

  for (const regex of patterns) {
    for (const match of text.matchAll(regex)) {
      results.push(match[1]);
    }
  }

  return unique(results);
}

/* =========================================================
   IMPORT RESOLUTION
========================================================= */

function resolveAsFile(base) {
  const candidates = [
    base,
    ...[...EXTS].map(ext => `${base}${ext}`),
    ...[...EXTS].map(ext => path.join(base, `index${ext}`))
  ];

  for (const candidate of candidates) {
    if (exists(candidate)) return candidate;
  }

  return null;
}

function resolveAlias(specifier) {
  for (const [pattern, targets] of Object.entries(aliases)) {
    const prefix = pattern.endsWith('/*')
      ? pattern.slice(0, -2)
      : pattern;

    if (
      specifier === prefix ||
      specifier.startsWith(`${prefix}/`)
    ) {
      const remainder = specifier.slice(prefix.length).replace(/^\/+/, '');

      for (const target of targets) {
        const resolved = resolveAsFile(
          path.join(target, remainder)
        );

        if (resolved) return resolved;
      }
    }
  }

  return null;
}

function resolveImport(fromFile, specifier) {
  if (specifier.startsWith('.')) {
    return resolveAsFile(
      path.resolve(path.dirname(fromFile), specifier)
    );
  }

  const aliasResolved = resolveAlias(specifier);

  if (aliasResolved) return aliasResolved;

  if (specifier.startsWith('@/')) {
    return resolveAsFile(
      path.join(SRC, specifier.slice(2))
    );
  }

  return null;
}

/* =========================================================
   1. IMPORT RESOLUTION AUDIT
========================================================= */

console.log('------------------------------------------------------------');
console.log('1. IMPORT RESOLUTION');
console.log('------------------------------------------------------------');

let importCount = 0;
let unresolvedCount = 0;

for (const file of files) {
  const text = read(file);
  const imports = extractImports(text);

  for (const specifier of imports) {
    const isLocal =
      specifier.startsWith('.') ||
      specifier.startsWith('@/') ||
      Object.keys(aliases).some(key => {
        const prefix = key.endsWith('/*')
          ? key.slice(0, -2)
          : key;

        return (
          specifier === prefix ||
          specifier.startsWith(`${prefix}/`)
        );
      });

    if (!isLocal) continue;

    importCount++;

    const resolved = resolveImport(file, specifier);

    if (!resolved) {
      unresolvedCount++;

      add(
        errors,
        'IMPORT_UNRESOLVED',
        file,
        `Cannot resolve local import: ${specifier}`
      );
    }
  }
}

console.log(`Local imports checked : ${importCount}`);
console.log(`Unresolved imports    : ${unresolvedCount}\n`);

/* =========================================================
   2. VIEW / APP CONNECTION
========================================================= */

console.log('------------------------------------------------------------');
console.log('2. VIEW / APP CONNECTION');
console.log('------------------------------------------------------------');

const viewFiles = files.filter(file => {
  const p = rel(file);
  return (
    p.includes('/views/') ||
    /View\.(tsx|ts|jsx|js)$/.test(p)
  );
});

const viewNames = new Map();

for (const file of viewFiles) {
  const name = path.basename(file).replace(
    /\.(tsx|ts|jsx|js)$/,
    ''
  );

  viewNames.set(name, file);
}

const appFiles = files.filter(file => {
  const name = path.basename(file);
  return /^App\.(tsx|ts|jsx|js)$/.test(name);
});

console.log(`Views discovered : ${viewFiles.length}`);
console.log(`App files        : ${appFiles.length}\n`);

const importedViews = new Set();

for (const appFile of appFiles) {
  const imports = extractImports(read(appFile));

  for (const specifier of imports) {
    const resolved = resolveImport(appFile, specifier);

    if (!resolved) continue;

    const name = path.basename(resolved).replace(
      /\.(tsx|ts|jsx|js)$/,
      ''
    );

    if (viewNames.has(name)) {
      importedViews.add(name);
    }
  }
}

for (const [name, file] of viewNames) {
  if (importedViews.has(name)) {
    add(
      infos,
      'VIEW_CONNECTED',
      file,
      `View is imported by App: ${name}`
    );
  } else {
    add(
      warnings,
      'VIEW_NOT_IMPORTED_BY_APP',
      file,
      `View is not imported by an App entry point: ${name}`
    );
  }
}

console.log(`Views connected to App : ${importedViews.size}`);
console.log(`Views not connected    : ${
  viewFiles.length - importedViews.size
}\n`);

/* =========================================================
   3. COMPONENT REFERENCE GRAPH
========================================================= */

console.log('------------------------------------------------------------');
console.log('3. COMPONENT / MODULE CONNECTION GRAPH');
console.log('------------------------------------------------------------');

let graphEdges = 0;

for (const file of files) {
  const imports = extractImports(read(file));

  for (const specifier of imports) {
    const resolved = resolveImport(file, specifier);

    if (!resolved) continue;

    graphEdges++;

    add(
      infos,
      'IMPORT_CONNECTION',
      file,
      `${rel(file)} -> ${rel(resolved)}`
    );
  }
}

console.log(`Resolved local graph edges : ${graphEdges}\n`);

/* =========================================================
   4. TRANSLATION FILE DISCOVERY
========================================================= */

console.log('------------------------------------------------------------');
console.log('4. TRANSLATION INTEGRITY');
console.log('------------------------------------------------------------');

const translationFiles = files.filter(file => {
  const p = rel(file).toLowerCase();

  return (
    p.includes('/i18n/') ||
    p.includes('translation') ||
    p.includes('locale') ||
    p.includes('localization') ||
    p.includes('i18n')
  );
});

console.log(`Translation-related files : ${translationFiles.length}`);

for (const file of translationFiles) {
  console.log(`  ${rel(file)}`);
}

/* =========================================================
   TRANSLATION USAGE
========================================================= */

const usedKeys = new Map();

function addUsedKey(key, file, sourceType) {
  if (!usedKeys.has(key)) {
    usedKeys.set(key, []);
  }

  usedKeys.get(key).push({
    file,
    sourceType
  });
}

for (const file of files) {
  const text = read(file);

  const patterns = [
    {
      regex: /\bt\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      type: 't()'
    },
    {
      regex: /\b(?:i18n|intl)\.t\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      type: 'i18n.t()'
    },
    {
      regex: /\btranslate\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      type: 'translate()'
    }
  ];

  for (const { regex, type } of patterns) {
    for (const match of text.matchAll(regex)) {
      addUsedKey(match[1], file, type);
    }
  }
}

/* =========================================================
   DYNAMIC TRANSLATION KEYS
========================================================= */

const dynamicTranslationKeys = [];

for (const file of files) {
  const text = read(file);

  const patterns = [
    /\bt\(\s*`([^`]*\$\{[^`]+\}[^`]*)`\s*\)/g,
    /\bt\(\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\)/g,
    /\btranslate\(\s*`([^`]*\$\{[^`]+\}[^`]*)`\s*\)/g
  ];

  for (const regex of patterns) {
    for (const match of text.matchAll(regex)) {
      dynamicTranslationKeys.push({
        file,
        expression: match[1]
      });
    }
  }
}

/* =========================================================
   TRANSLATION DEFINITIONS
========================================================= */

const definedKeys = new Map();

function collectObjectKeys(text, file) {
  const patterns = [
    /['"`]([^'"`]+)['"`]\s*:/g,
    /['"`]([^'"`]+)['"`]\s*=>/g
  ];

  for (const regex of patterns) {
    for (const match of text.matchAll(regex)) {
      const key = match[1];

      if (!key.includes('.')) continue;

      if (!definedKeys.has(key)) {
        definedKeys.set(key, []);
      }

      definedKeys.get(key).push(file);
    }
  }
}

for (const file of translationFiles) {
  collectObjectKeys(read(file), file);
}

/* =========================================================
   USED / DEFINED / MISSING
========================================================= */

let missingTranslationCount = 0;
let duplicateTranslationCount = 0;

for (const [key, locations] of usedKeys) {
  if (definedKeys.has(key)) {
    add(
      infos,
      'TRANSLATION_RESOLVED',
      locations[0].file,
      `Translation key resolved: ${key}`
    );
  } else {
    missingTranslationCount++;

    add(
      errors,
      'TRANSLATION_MISSING',
      locations[0].file,
      `Translation key is used but not statically defined: ${key}`
    );
  }
}

for (const [key, locations] of definedKeys) {
  const uniqueLocations = unique(locations);

  if (uniqueLocations.length > 1) {
    duplicateTranslationCount++;

    add(
      warnings,
      'TRANSLATION_DUPLICATE',
      uniqueLocations[0],
      `Translation key appears in multiple files: ${key}`,
      uniqueLocations.join(', ')
    );
  }
}

for (const item of dynamicTranslationKeys) {
  add(
    warnings,
    'TRANSLATION_DYNAMIC_KEY',
    item.file,
    `Dynamic translation expression requires runtime verification: ${item.expression}`
  );
}

console.log(`Used translation keys       : ${usedKeys.size}`);
console.log(`Defined translation keys     : ${definedKeys.size}`);
console.log(`Missing static keys          : ${missingTranslationCount}`);
console.log(`Duplicate definition groups  : ${duplicateTranslationCount}`);
console.log(`Dynamic key expressions      : ${dynamicTranslationKeys.length}\n`);

/* =========================================================
   5. DEAD VIEW DETECTION
========================================================= */

console.log('------------------------------------------------------------');
console.log('5. DEAD CODE / UNUSED VIEW DETECTION');
console.log('------------------------------------------------------------');

const allTextByFile = new Map();

for (const file of files) {
  allTextByFile.set(file, read(file));
}

let possibleDeadViews = 0;

for (const [name, file] of viewNames) {
  let externalReferenceCount = 0;

  for (const otherFile of files) {
    if (otherFile === file) continue;

    const text = allTextByFile.get(otherFile);

    const regex = new RegExp(
      `\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
      'g'
    );

    externalReferenceCount += [
      ...text.matchAll(regex)
    ].length;
  }

  if (externalReferenceCount === 0) {
    possibleDeadViews++;

    add(
      warnings,
      'POSSIBLE_DEAD_VIEW',
      file,
      `No external source reference found for view: ${name}`
    );
  } else {
    add(
      infos,
      'VIEW_REFERENCED',
      file,
      `${name} has ${externalReferenceCount} external source reference(s).`
    );
  }
}

console.log(`Possible dead views : ${possibleDeadViews}\n`);

/* =========================================================
   6. EXPORT INTEGRITY
========================================================= */

console.log('------------------------------------------------------------');
console.log('6. EXPORT INTEGRITY');
console.log('------------------------------------------------------------');

for (const file of viewFiles) {
  const text = read(file);

  const hasDefault = /export\s+default\s+/.test(text);
  const hasNamed =
    /export\s+(?:const|function|class)\s+/.test(text);

  if (!hasDefault && !hasNamed) {
    add(
      errors,
      'VIEW_NO_EXPORT',
      file,
      'View file contains no detectable default or named export.'
    );
  } else {
    add(
      infos,
      'VIEW_EXPORT_OK',
      file,
      `Export detected: default=${hasDefault ? 'YES' : 'NO'}, named=${hasNamed ? 'YES' : 'NO'}`
    );
  }
}

/* =========================================================
   7. NAVIGATION / STATE SIGNALS
========================================================= */

console.log('------------------------------------------------------------');
console.log('7. NAVIGATION / STATE SIGNALS');
console.log('------------------------------------------------------------');

const navigationPatterns = [
  /\bonClick\s*=/g,
  /\bonPress\s*=/g,
  /\bnavigate\s*\(/g,
  /\bpush\s*\(/g,
  /\bsetActive\s*\(/g,
  /\bset[A-Z][A-Za-z0-9_]*\s*\(/g
];

let navigationHits = 0;

for (const file of files) {
  const text = read(file);
  let count = 0;

  for (const regex of navigationPatterns) {
    count += [...text.matchAll(regex)].length;
  }

  if (count > 0) {
    navigationHits += count;

    add(
      infos,
      'NAVIGATION_SIGNAL',
      file,
      `${count} navigation/state handler signal(s) detected.`
    );
  }
}

console.log(`Navigation/state signals : ${navigationHits}\n`);

/* =========================================================
   8. RISK PATTERN CLASSIFICATION
========================================================= */

console.log('------------------------------------------------------------');
console.log('8. CODE RISK PATTERNS');
console.log('------------------------------------------------------------');

for (const file of files) {
  const lines = read(file).split(/\r?\n/);

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) return;

    const lineNumber = index + 1;

    if (/TODO|FIXME/i.test(trimmed)) {
      add(
        warnings,
        'TODO_FIXME',
        file,
        `TODO/FIXME marker at line ${lineNumber}`,
        trimmed
      );
    }

    if (/throw\s+new\s+Error/i.test(trimmed)) {
      add(
        infos,
        'EXPLICIT_ERROR_THROW',
        file,
        `Explicit error throw at line ${lineNumber}`,
        trimmed
      );
    }

    if (/console\.error/i.test(trimmed)) {
      add(
        warnings,
        'CONSOLE_ERROR',
        file,
        `console.error at line ${lineNumber}`,
        trimmed
      );
    }

    if (/return\s+null/i.test(trimmed)) {
      add(
        warnings,
        'RETURN_NULL',
        file,
        `return null at line ${lineNumber}`,
        trimmed
      );
    }
  });
}

/* =========================================================
   9. FALSE POSITIVE CLASSIFICATION
========================================================= */

for (const item of dynamicTranslationKeys) {
  add(
    falsePositives,
    'DYNAMIC_TRANSLATION_NOT_STATIC_ERROR',
    item.file,
    `Static scanner cannot prove this key exists: ${item.expression}`,
    'Requires runtime/key-space validation.'
  );
}

/* =========================================================
   10. REPORT
========================================================= */

function printSection(title, list) {
  console.log('\n------------------------------------------------------------');
  console.log(title);
  console.log('------------------------------------------------------------');

  if (list.length === 0) {
    console.log('NONE');
    return;
  }

  for (const item of list) {
    const location = item.file
      ? `${item.file}`
      : 'PROJECT';

    console.log(`[${item.code}] ${location}`);

    if (item.message) {
      console.log(`  ${item.message}`);
    }

    if (item.extra) {
      console.log(`  ${item.extra}`);
    }
  }
}

printSection('ERRORS', errors);
printSection('WARNINGS', warnings);
printSection('INFO', infos);
printSection('FALSE POSITIVES / SCANNER LIMITATIONS', falsePositives);

/* =========================================================
   SUMMARY
========================================================= */

console.log('\n============================================================');
console.log(' AUDIT SUMMARY');
console.log('============================================================');

console.log(`ERRORS          : ${errors.length}`);
console.log(`WARNINGS        : ${warnings.length}`);
console.log(`INFO            : ${infos.length}`);
console.log(`FALSE POSITIVE  : ${falsePositives.length}`);

console.log('\n============================================================');
console.log(' PROJECT INTEGRITY AUDIT COMPLETE');
console.log(' READ ONLY — NO SOURCE FILE CHANGED');
console.log('============================================================\n');

/* =========================================================
   MACHINE-READABLE REPORT
========================================================= */

const report = [];

report.push('============================================================');
report.push(' PROJECT INTEGRITY AUDIT REPORT');
report.push(' READ ONLY — NO SOURCE FILE CHANGED');
report.push('============================================================');
report.push('');
report.push(`Project root : ${ROOT}`);
report.push(`Source files : ${files.length}`);
report.push('');

function reportSection(title, list) {
  report.push('------------------------------------------------------------');
  report.push(title);
  report.push('------------------------------------------------------------');

  if (list.length === 0) {
    report.push('NONE');
    report.push('');
    return;
  }

  for (const item of list) {
    report.push(`[${item.code}] ${item.file || 'PROJECT'}`);
    report.push(`  ${item.message}`);

    if (item.extra) {
      report.push(`  ${item.extra}`);
    }
  }

  report.push('');
}

reportSection('ERRORS', errors);
reportSection('WARNINGS', warnings);
reportSection('INFO', infos);
reportSection(
  'FALSE POSITIVES / SCANNER LIMITATIONS',
  falsePositives
);

report.push('============================================================');
report.push(' SUMMARY');
report.push('============================================================');
report.push(`ERRORS          : ${errors.length}`);
report.push(`WARNINGS        : ${warnings.length}`);
report.push(`INFO            : ${infos.length}`);
report.push(`FALSE POSITIVE  : ${falsePositives.length}`);
report.push('');
report.push('IMPORTANT:');
report.push('This audit does not modify source files.');
report.push('Static analysis cannot prove every runtime behavior.');
report.push('Review ERROR items before changing source code.');
report.push('');

const reportPath = path.join(
  ROOT,
  'project_integrity_report.txt'
);

fs.writeFileSync(
  reportPath,
  report.join('\n'),
  'utf8'
);

console.log(`Report written to: ${rel(reportPath)}`);
