import "dotenv/config";
import { connectDatabase } from "./src/infrastructure/database/connection.ts";
import { Device, Organization } from "./src/infrastructure/database/models.ts";

// Uses the exact org _id (not name) — see README "recurring bug class" note:
// name-based lookups broke once when two orgs existed with different names.
const ORG_ID = "6a9e7ea3176a7202190df575";

async function seed() {
  await connectDatabase();

  const org = await Organization.findById(ORG_ID);
  if (!org) {
    console.log(`Organization ${ORG_ID} not found. Run seed-admin.ts first.`);
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
    { name: "West Wing Door", deviceCode: "DEV-04831", type: "Access", status: "online", firmwareVersion: "4.2.1", organizationId: org._id },
    { name: "Warehouse HVAC Unit 1", deviceCode: "DEV-04832", type: "Climate", status: "online", firmwareVersion: "3.8.0", organizationId: org._id },
    { name: "Conveyor Belt Line 3", deviceCode: "DEV-04833", type: "Industrial", status: "online", firmwareVersion: "5.1.0", organizationId: org._id },
    { name: "Fleet Truck KR-3110", deviceCode: "DEV-04834", type: "Vehicle", status: "online", firmwareVersion: "2.4.0", organizationId: org._id },
    { name: "Loading Dock Sensor", deviceCode: "DEV-04835", type: "Sensor", status: "online", firmwareVersion: "1.9.3", organizationId: org._id },
    { name: "Parking Barrier North", deviceCode: "DEV-04836", type: "Access", status: "offline", firmwareVersion: "4.0.0", organizationId: org._id },
    { name: "Edge Router Rack-7", deviceCode: "DEV-04837", type: "Network", status: "online", firmwareVersion: "6.2.0", organizationId: org._id },
    { name: "Welding Robot RA-09", deviceCode: "DEV-04838", type: "Industrial", status: "online", firmwareVersion: "5.0.4", organizationId: org._id },
    { name: "Lobby Access Door", deviceCode: "DEV-04839", type: "Access", status: "online", firmwareVersion: "4.2.1", organizationId: org._id },
    { name: "Freezer Unit Monitor", deviceCode: "DEV-04840", type: "Climate", status: "online", firmwareVersion: "3.8.6", organizationId: org._id },
    { name: "Smart Thermostat Living Room", deviceCode: "DEV-04841", type: "Climate", status: "online", firmwareVersion: "2.1.0", organizationId: org._id },
    { name: "Smart Front Door Lock", deviceCode: "DEV-04842", type: "Access", status: "online", firmwareVersion: "3.0.2", organizationId: org._id },
    { name: "Smoke & CO Detector Kitchen", deviceCode: "DEV-04843", type: "Sensor", status: "online", firmwareVersion: "1.4.1", organizationId: org._id },
    { name: "Robot Vacuum Cleaner", deviceCode: "DEV-04844", type: "Industrial", status: "online", firmwareVersion: "4.5.0", organizationId: org._id },
    { name: "Smart Security Camera Porch", deviceCode: "DEV-04845", type: "Sensor", status: "online", firmwareVersion: "2.8.3", organizationId: org._id },
    { name: "Hydraulic Press Controller Bay 2", deviceCode: "DEV-04846", type: "Industrial", status: "online", firmwareVersion: "6.1.4", organizationId: org._id },
    { name: "Handheld Barcode Scanner Dock 3", deviceCode: "DEV-04847", type: "Industrial", status: "online", firmwareVersion: "1.2.0", organizationId: org._id },
    { name: "Overhead Crane Controller Bay 1", deviceCode: "DEV-04848", type: "Industrial", status: "maintenance", firmwareVersion: "5.3.1", organizationId: org._id },
    { name: "CNC Machine Monitor Station 5", deviceCode: "DEV-04849", type: "Industrial", status: "online", firmwareVersion: "3.9.7", organizationId: org._id },
    { name: "Smart Garage Door Opener", deviceCode: "DEV-04850", type: "Access", status: "online", firmwareVersion: "2.0.5", organizationId: org._id },
  ];

  // SAFE: upsert by deviceCode instead of deleteMany + insertMany.
  // This means running this script again will NEVER wipe existing
  // devices — it only creates missing ones or updates matching ones
  // by deviceCode. Any device manually added later (not in this list)
  // is left untouched.
  let created = 0;
  let updated = 0;

  for (const device of devices) {
    const result = await Device.updateOne(
      { deviceCode: device.deviceCode, organizationId: org._id },
      { $set: device },
      { upsert: true }
    );
    if (result.upsertedCount > 0) {
      created++;
    } else if (result.modifiedCount > 0) {
      updated++;
    }
  }

  const total = await Device.countDocuments({ organizationId: org._id });
  console.log(`Upserted seed list: ${created} created, ${updated} updated, ${devices.length - created - updated} unchanged.`);
  console.log(`Total devices now in org: ${total}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
