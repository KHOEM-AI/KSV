import "dotenv/config";
import { connectDatabase } from "./src/infrastructure/database/connection.ts";
import { Organization } from "./src/infrastructure/database/models.ts";

async function check() {
  await connectDatabase();
  const orgs = await Organization.find().lean();
  console.log("Organization count:", orgs.length);
  for (const o of orgs) {
    console.log(" -", String(o._id), "|", o.name, "|", o.country ?? "(no country)");
  }
  process.exit(0);
}

check().catch((e) => { console.error(e); process.exit(1); });
