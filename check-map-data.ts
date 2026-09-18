import "dotenv/config";
import { connectDatabase } from "./src/infrastructure/database/connection.ts";
import { Device, Site, Organization } from "./src/infrastructure/database/models.ts";

async function check() {
  await connectDatabase();
  const orgCount = await Organization.countDocuments();
  const siteCount = await Site.countDocuments();
  const deviceCount = await Device.countDocuments();
  const devicesWithSite = await Device.countDocuments({ siteId: { $ne: null } });
  const devicesWithoutGeo = await Device.countDocuments({ latitude: { $exists: false } });

  console.log("Organizations:", orgCount);
  console.log("Sites:", siteCount);
  console.log("Devices:", deviceCount);
  console.log("Devices with siteId:", devicesWithSite);
  console.log("Devices without lat/lng:", devicesWithoutGeo);

  const sampleSites = await Site.find().limit(5).lean();
  console.log("\nSample sites:");
  for (const s of sampleSites) {
    console.log(" -", s.name, "| country:", s.country ?? "(none)");
  }
  process.exit(0);
}

check().catch((e) => { console.error(e); process.exit(1); });
