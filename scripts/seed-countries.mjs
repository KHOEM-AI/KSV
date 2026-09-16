// scripts/seed-countries.mjs
//
// KSV — International Module
// Small standalone script to seed the "countries" reference table.
// Plain ESM (.mjs) is used here on purpose: this is a one-off data
// loading utility, not application logic, so it does not need
// TypeScript types or the full src/ build pipeline.
//
// Usage:
//   node scripts/seed-countries.mjs
//   (or: npm run seed:countries)

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Small sample. Replace / extend with the full ISO 3166-1 list
// (target: ~195 countries) in data/countries.json.
const DEFAULT_COUNTRIES = [
  { code: "KH", name: "Cambodia", defaultLanguage: "km", defaultTimeZone: "Asia/Phnom_Penh" },
  { code: "TH", name: "Thailand", defaultLanguage: "th", defaultTimeZone: "Asia/Bangkok" },
  { code: "JP", name: "Japan", defaultLanguage: "ja", defaultTimeZone: "Asia/Tokyo" },
  { code: "US", name: "United States", defaultLanguage: "en", defaultTimeZone: "America/New_York" },
];

async function loadCountriesData() {
  const dataPath = path.join(__dirname, "..", "data", "countries.json");
  try {
    const raw = await readFile(dataPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    console.warn(
      `[seed-countries] data/countries.json not found, using ${DEFAULT_COUNTRIES.length} built-in sample countries.`
    );
    return DEFAULT_COUNTRIES;
  }
}

async function seedCountries() {
  const countries = await loadCountriesData();

  console.log(`[seed-countries] Seeding ${countries.length} countries...`);

  for (const country of countries) {
    // TODO: replace this with your real DB client call, e.g.:
    // await db.country.upsert({ where: { code: country.code }, update: country, create: country });
    console.log(`  -> ${country.code} (${country.name})`);
  }

  console.log("[seed-countries] Done.");
}

seedCountries().catch((err) => {
  console.error("[seed-countries] Failed:", err);
  process.exit(1);
});
