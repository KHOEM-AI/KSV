import "dotenv/config";
import { connectDatabase } from "./src/infrastructure/database/connection.ts";
import { Country } from "./src/infrastructure/database/models.ts";
import { COUNTRIES } from "./src/data/countries.ts";

async function seed() {
  await connectDatabase();

  let inserted = 0;
  let updated = 0;

  for (const c of COUNTRIES) {
    const result = await Country.updateOne(
      { code: c.code },
      {
        code: c.code,
        name: c.name,
        timezone: c.timezone,
        timezones: c.timezones ?? [],
        dialCode: c.dialCode,
      },
      { upsert: true }
    );
    if (result.upsertedCount > 0) inserted++;
    else updated++;
  }

  const total = await Country.countDocuments();
  console.log(`Inserted: ${inserted}, Updated: ${updated}, Total in DB: ${total}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
