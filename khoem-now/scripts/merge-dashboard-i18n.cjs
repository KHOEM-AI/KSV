// Merges the dashboard.i18n.ts DASHBOARD_PATCH keys into the existing
// `en`, `km`, `zh` Dict blocks inside src/i18n/translations.ts.
//
// Safe by design:
//   - Only ADDS keys that are missing from a given language block.
//   - Never overwrites an existing key (so nothing already translated
//     gets clobbered).
//   - Prints a summary of what was added / what was already present.
//
// Usage (from project root, e.g. ~/KSV/khoem-now):
//   node scripts/merge-dashboard-i18n.cjs

const fs = require("fs");
const path = require("path");

const TRANSLATIONS_PATH = path.join("src", "i18n", "translations.ts");

// Inline the patch data here (kept identical to dashboard.i18n.ts)
// so this script has no import/build-step dependency.
const DASHBOARD_PATCH = require("./dashboard-patch-data.cjs");

function findBlockRange(content, constName) {
  const startMarker = `const ${constName}: Dict = {`;
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) {
    return null;
  }

  const braceOpenIdx = startIdx + startMarker.length - 1; // index of "{"
  let depth = 0;
  for (let i = braceOpenIdx; i < content.length; i += 1) {
    if (content[i] === "{") depth += 1;
    if (content[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        return { startIdx, braceOpenIdx, closeIdx: i };
      }
    }
  }
  return null;
}

function mergeLang(content, constName, patchDict) {
  const range = findBlockRange(content, constName);
  if (!range) {
    console.warn(`SKIP: could not find "const ${constName}: Dict = { ... }" block.`);
    return { content, added: [], skipped: [] };
  }

  const blockText = content.slice(range.braceOpenIdx, range.closeIdx + 1);
  const added = [];
  const skipped = [];
  const linesToInsert = [];

  for (const [key, value] of Object.entries(patchDict)) {
    const keyPattern = new RegExp(`['"]${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}['"]\\s*:`);
    if (keyPattern.test(blockText)) {
      skipped.push(key);
      continue;
    }
    const escapedValue = value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    linesToInsert.push(`  '${key}': '${escapedValue}',`);
    added.push(key);
  }

  if (linesToInsert.length === 0) {
    return { content, added, skipped };
  }

  const insertion = "\n" + linesToInsert.join("\n");
  const newContent =
    content.slice(0, range.closeIdx) + insertion + "\n" + content.slice(range.closeIdx);

  return { content: newContent, added, skipped };
}

function main() {
  if (!fs.existsSync(TRANSLATIONS_PATH)) {
    console.error(`ERROR: ${TRANSLATIONS_PATH} not found. Run this from the project root.`);
    process.exit(1);
  }

  let content = fs.readFileSync(TRANSLATIONS_PATH, "utf8");
  const report = {};

  for (const lang of Object.keys(DASHBOARD_PATCH)) {
    const result = mergeLang(content, lang, DASHBOARD_PATCH[lang]);
    content = result.content;
    report[lang] = { added: result.added.length, skipped: result.skipped.length };
  }

  fs.writeFileSync(TRANSLATIONS_PATH, content, "utf8");

  console.log("Merge complete.");
  for (const [lang, stats] of Object.entries(report)) {
    console.log(`  ${lang}: +${stats.added} added, ${stats.skipped} already present`);
  }
}

main();
