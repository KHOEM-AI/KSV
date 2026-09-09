import "dotenv/config";
import { connectDatabase } from "./src/infrastructure/database/connection.ts";
import { Device, Organization } from "./src/infrastructure/database/models.ts";

async function seed() {
  await connectDatabase();

  const org = await Organization.findOne({ name: "KSV Global Holdings" });
  if (!org) {
    console.log("Organization not found. Run seed-admin.ts first.");
    process.exit(1);
  }

  const devices = [
    { name: "North Vault Door", deviceCode: "DEV-04821", type: "Access", status: "online", firmwareVersion: "4.2.1", organizationId: org._id },
    { name: "Cleanroom HVAC Unit 3", deviceCode: "DEV-04822", type: "Climate", status: "warning", firmwareVersion: "3.8.0", organizationId: org._id },
    { name: "Press Line 7 Interlock", deviceCode: "DEV-04823", type: "Industrial", status: "online", firmwareVersion: "5.1.2", organizationId: org._id },
    { name: "Fleet Van KR-2291", deviceCode: "DEV-04824", type: "Vehicle", status: "offline", firmwareVersion: "2.4.0", organizationId: org._id },
    { name: "Rooftop Air Sensor", deviceCode: "DEV-04825", type: "Sensor", status: "online", firmwareVersion: "1.9.3", organizationId: org._id },
    { name: "East Gate Barrier", deviceCode: "DEV-04826", type: "Access", status: "maintenance", firmwareVersion: "4.0.0", organizationId: org._id },
    { name: "Core Switch RACK-12", deviceCode: "DEV-04827", type: "Network", status: "online", firmwareVersion: "6.2.0", organizationId: org._id },
    { name: "Robot Arm RA-04", deviceCode: "DEV-04828", type: "Industrial", status: "warning", firmwareVersion: "5.0.4", organizationId: org._id },
    { name: "Server Room Door", deviceCode: "DEV-04829", type: "Access", status: "online", firmwareVersion: "4.2.1", organizationId: org._id },
    { name: "Cold Storage Monitor", deviceCode: "DEV-04830", type: "Climate", status: "online", firmwareVersion: "3.8.6", organizationId: org._id },
  ];

  await Device.deleteMany({ organizationId: org._id });
  const created = await Device.insertMany(devices);
  console.log(`Created ${created.length} devices`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
