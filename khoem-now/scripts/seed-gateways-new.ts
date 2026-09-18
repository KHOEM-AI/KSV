import "dotenv/config";
import { connectDatabase } from "./src/infrastructure/database/connection.ts";
import { Organization, Gateway } from "./src/infrastructure/database/models.ts";

const ORG_ID = "6aa8561ec72b7a4925afb8ad";

const GATEWAYS = [
  { name: "Frankfurt Edge Controller", type: "edge", mode: "hybrid", status: "online", ipAddress: "10.20.1.4", firmwareVersion: "4.2.0", cpuUsage: 34, memUsage: 58 },
  { name: "Singapore Edge Controller", type: "edge", mode: "hybrid", status: "online", ipAddress: "10.30.2.4", firmwareVersion: "4.2.0", cpuUsage: 41, memUsage: 62 },
  { name: "Taipei Edge Controller", type: "edge", mode: "hybrid", status: "online", ipAddress: "10.40.1.9", firmwareVersion: "4.1.5", cpuUsage: 78, memUsage: 84 },
  { name: "Stuttgart Edge Controller", type: "edge", mode: "hybrid", status: "online", ipAddress: "10.50.1.2", firmwareVersion: "4.2.0", cpuUsage: 28, memUsage: 49 },
  { name: "Dubai Edge Controller", type: "edge", mode: "hybrid", status: "online", ipAddress: "10.60.1.7", firmwareVersion: "3.9.8", cpuUsage: 45, memUsage: 55 },
  { name: "Seoul Edge Controller", type: "edge", mode: "hybrid", status: "online", ipAddress: "10.70.1.3", firmwareVersion: "4.2.0", cpuUsage: 52, memUsage: 67 },
];

async function seed() {
  await connectDatabase();
  const org = await Organization.findById(ORG_ID);
  if (!org) {
    console.log("Org not found:", ORG_ID);
    process.exit(1);
  }

  let inserted = 0, updated = 0;
  for (const gw of GATEWAYS) {
    const result = await Gateway.updateOne(
      { name: gw.name, organizationId: org._id },
      { ...gw, organizationId: org._id },
      { upsert: true }
    );
    if (result.upsertedCount > 0) inserted++;
    else updated++;
  }
  const total = await Gateway.countDocuments({ organizationId: org._id });
  console.log(`Gateways inserted: ${inserted}, updated: ${updated}, total: ${total}`);
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
