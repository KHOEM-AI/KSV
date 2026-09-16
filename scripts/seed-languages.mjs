// scripts/seed-languages.mjs
//
// KSV — International Module
// Small standalone script to seed the "languages" reference table.
// Plain ESM (.mjs) on purpose — same reasoning as seed-countries.mjs:
// this is a one-off data loading utility, not application logic.
//
// Usage:
//   node scripts/seed-languages.mjs
//   (or: npm run seed:languages)

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Small sample. Replace / extend with the full language list in
// data/languages.json. Keep in mind: a country can support several
// of these — languages are their own independent table, not tied
// 1-to-1 with countries.
const DEFAULT_LANGUAGES = [
  { code: "km", name: "Khmer", nativeName: "ខ្មែរ" },
  { code: "en", name: "English", nativeName: "English" },
  { code: "th", name: "Thai", nativeName: "ไทย" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
];

async function loadLanguagesData() {
  const dataPath = path.join(__dirname, "..", "data", "languages.json");
  try {
    const raw = await readFile(dataPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    console.warn(
      `[seed-languages] data/languages.json not found, using ${DEFAULT_LANGUAGES.length} built-in sample languages.`
    );
    return DEFAULT_LANGUAGES;
  }
}

async function seedLanguages() {
  const languages = await loadLanguagesData();

  console.log(`[seed-languages] Seeding ${languages.length} languages...`);

  for (const language of languages) {
    // TODO: replace this with your real DB client call, e.g.:
    // await db.language.upsert({ where: { code: language.code }, update: language, create: language });
    console.log(`  -> ${language.code} (${language.name} / ${language.nativeName})`);
  }

  console.log("[seed-languages] Done.");
}

seedLanguages().catch((err) => {
  console.error("[seed-languages] Failed:", err);
  process.exit(1);
});
