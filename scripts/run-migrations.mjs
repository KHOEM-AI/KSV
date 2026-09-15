// scripts/run-migrations.mjs
//
// KSV — Database Module
// Small standalone runner that applies pending SQL migrations in
// order. Plain ESM (.mjs) on purpose: this runs before the app
// even builds, so it must not depend on the TypeScript build output.
//
// Expected folder layout (create this if it doesn't exist yet):
//
//   khoem-now/
//     migrations/
//       0001_create_users.sql
//       0002_create_devices.sql
//       0003_create_permissions.sql
//       ...
//
// Migration files are applied in filename order, so always prefix
// them with a zero-padded number (0001_, 0002_, ...).
//
// Usage:
//   node scripts/run-migrations.mjs
//   (or: npm run migrate)

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, "..", "migrations");

async function getMigrationFiles() {
  try {
    const files = await readdir(MIGRATIONS_DIR);
    return files.filter((f) => f.endsWith(".sql")).sort();
  } catch {
    console.warn(`[migrate] No migrations/ folder found at ${MIGRATIONS_DIR}`);
    return [];
  }
}

async function getAppliedMigrations() {
  // TODO: replace with a real query against a "schema_migrations" table, e.g.:
  // const rows = await db.query("SELECT filename FROM schema_migrations");
  // return new Set(rows.map((r) => r.filename));
  return new Set();
}

async function markMigrationApplied(filename) {
  // TODO: replace with a real insert, e.g.:
  // await db.query("INSERT INTO schema_migrations (filename, applied_at) VALUES ($1, NOW())", [filename]);
  void filename;
}

async function runMigrations() {
  const files = await getMigrationFiles();
  const applied = await getAppliedMigrations();
  const pending = files.filter((f) => !applied.has(f));

  if (pending.length === 0) {
    console.log("[migrate] No pending migrations. Database is up to date.");
    return;
  }

  console.log(`[migrate] ${pending.length} pending migration(s):`);

  for (const filename of pending) {
    const filePath = path.join(MIGRATIONS_DIR, filename);
    const sql = await readFile(filePath, "utf-8");

    console.log(`  -> Applying ${filename}...`);
    // TODO: replace with a real execution call, e.g.:
    // await db.query(sql);
    void sql;

    await markMigrationApplied(filename);
    console.log(`  -> ${filename} applied.`);
  }

  console.log("[migrate] Done.");
}

runMigrations().catch((err) => {
  console.error("[migrate] Failed:", err);
  process.exit(1);
});
