import "dotenv/config";
import { connectDatabase } from "./src/infrastructure/database/connection.ts";
import { Device, Gateway, Organization } from "./src/infrastructure/database/models.ts";

const ORG_ID = "6a9e7ea3176a7202190df575";

const TYPE_NAMES = {
  Access: ["Door Lock", "Gate Barrier", "Turnstile", "Badge Reader", "Window Sensor"],
  Climate: ["HVAC Unit", "Freezer Monitor", "Thermostat", "Humidity Sensor", "Cooling Fan"],
  Industrial: ["Robot Arm", "Conveyor Belt", "Press Controller", "CNC Monitor", "Crane Controller"],
  Vehicle: ["Fleet Van", "Delivery Truck", "Forklift Tracker", "EV Charger", "Fleet Car"],
  Sensor: ["Air Quality Sensor", "Motion Detector", "Smoke Detector", "Water Leak Sensor", "Temperature Probe"],
  Network: ["Edge Switch", "Core Router", "Access Point", "Network Bridge", "Signal Repeater"],
};
const LOCATIONS = ["North Wing", "South Depot", "Bay 3", "Floor 2", "Rack 7", "Zone B", "Building C", "Dock 5", "Lab 1", "Unit 12"];
const STATUS_WEIGHTED = ["online","online","online","online","online","online","online","warning","offline","maintenance"];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function seed() {
  await connectDatabase();
  const org = await Organization.findById(ORG_ID);
  if (!org) { console.log("Org not found"); process.exit(1); }

  const gateways = await Gateway.find({ organizationId: org._id, status: "online" });
  if (gateways.length === 0) { console.log("No online gateways found — run seed-gateways.mjs first"); process.exit(1); }

  const existingCount = await Device.countDocuments({ organizationId: org._id });
  const TARGET_TOTAL = 1000;
  const toCreate = TARGET_TOTAL - existingCount;
  if (toCreate <= 0) { console.log(`Already at or above ${TARGET_TOTAL} (${existingCount}). Nothing to do.`); process.exit(0); }

  const types = Object.keys(TYPE_NAMES);
  let startNum = 5000; // starts after our DEV-049xx range
  const docs = [];
  for (let i = 0; i < toCreate; i++) {
    const type = types[i % types.length];
    const baseName = pick(TYPE_NAMES[type]);
    const location = pick(LOCATIONS);
    const code = `DEV-${startNum + i}`;
    const gw = gateways[i % gateways.length];
    docs.push({
      name: `${baseName} ${location}`,
      deviceCode: code,
      type,
      status: pick(STATUS_WEIGHTED),
      organizationId: org._id,
      gatewayId: gw._id,
      firmwareVersion: `${1 + (i % 6)}.${i % 10}.${(i * 3) % 10}`,
    });
  }

  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < docs.length; i += BATCH) {
    const chunk = docs.slice(i, i + BATCH);
    await Device.insertMany(chunk, { ordered: false });
    inserted += chunk.length;
  }
  console.log(`Inserted ${inserted} new devices.`);

  // Refresh gateway deviceCount to match reality
  for (const gw of gateways) {
    const count = await Device.countDocuments({ gatewayId: gw._id });
    await Gateway.updateOne({ _id: gw._id }, { $set: { deviceCount: count } });
  }

  const total = await Device.countDocuments({ organizationId: org._id });
  console.log(`Total devices now: ${total}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
