import "dotenv/config";
import { connectDatabase } from "./src/infrastructure/database/connection.ts";
import { Device, Site, Organization } from "./src/infrastructure/database/models.ts";

const ORG_ID = "6aa8561ec72b7a4925afb8ad";

const SITES = [
  { name: "Frankfurt HQ",        address: "Frankfurt, Germany",     country: "DE" },
  { name: "Singapore DC",        address: "Singapore",              country: "SG" },
  { name: "Taipei Fab",          address: "Taipei, Taiwan",         country: "TW" },
  { name: "Stuttgart Plant",     address: "Stuttgart, Germany",     country: "DE" },
  { name: "Seoul Depot",         address: "Seoul, South Korea",     country: "KR" },
  { name: "Dubai Logistics",     address: "Dubai, UAE",             country: "AE" },
];

const DEVICES = [
  { code: "DEV-04821", name: "North Vault Door",      type: "Access",     status: "online",      site: "Frankfurt HQ",    lat: 50.1109, lng: 8.6821,   fw: "4.2.1" },
  { code: "DEV-04822", name: "Cleanroom HVAC Unit 3", type: "Climate",    status: "warning",     site: "Taipei Fab",      lat: 25.0330, lng: 121.5654, fw: "3.8.0" },
  { code: "DEV-04823", name: "Press Line 7 Interlock",type: "Industrial", status: "online",      site: "Stuttgart Plant", lat: 48.7758, lng: 9.1829,   fw: "2.5.0" },
  { code: "DEV-04824", name: "Fleet Van KR-2291",     type: "Vehicle",    status: "offline",     site: "Seoul Depot",     lat: 37.5665, lng: 126.9780, fw: "1.9.3" },
  { code: "DEV-04825", name: "Rooftop Air Sensor",    type: "Sensor",     status: "online",      site: "Frankfurt HQ",    lat: 50.1160, lng: 8.6900,   fw: "1.2.0" },
  { code: "DEV-04826", name: "East Gate Barrier",     type: "Access",     status: "maintenance", site: "Dubai Logistics", lat: 25.2048, lng: 55.2708,  fw: "3.0.1" },
  { code: "DEV-04827", name: "Core Switch RACK-12",   type: "Sensor",     status: "online",      site: "Singapore DC",    lat: 1.3521,  lng: 103.8198, fw: "5.1.2" },
  { code: "DEV-04828", name: "Robot Arm RA-04",       type: "Industrial", status: "warning",     site: "Taipei Fab",      lat: 25.0360, lng: 121.5600, fw: "2.7.0" },
  { code: "DEV-04829", name: "Server Room Door",      type: "Access",     status: "online",      site: "Singapore DC",    lat: 1.3500,  lng: 103.8200, fw: "4.0.0" },
  { code: "DEV-04830", name: "Cold Storage Monitor",  type: "Climate",    status: "online",      site: "Stuttgart Plant", lat: 48.7800, lng: 9.1800,   fw: "2.0.0" },
  { code: "DEV-04831", name: "Seoul Gate Sensor",     type: "Access",     status: "online",      site: "Seoul Depot",     lat: 37.5700, lng: 126.9800, fw: "3.5.0" },
  { code: "DEV-04832", name: "Dubai Climate Unit",    type: "Climate",    status: "offline",     site: "Dubai Logistics", lat: 25.2100, lng: 55.2750,  fw: "3.1.4" },
];

async function seed() {
  await connectDatabase();
  const org = await Organization.findById(ORG_ID);
  if (!org) {
    console.log(`Organization ${ORG_ID} not found.`);
    process.exit(1);
  }

  // 1. Sites — upsert by (organizationId, name)
  const siteIdByName: Record<string, unknown> = {};
  for (const s of SITES) {
    const site = await Site.findOneAndUpdate(
      { organizationId: org._id, name: s.name },
      { organizationId: org._id, name: s.name, address: s.address, country: s.country },
      { upsert: true, returnDocument: 'after' }
    );
    siteIdByName[s.name] = site._id;
  }
  console.log(`Sites: ${Object.keys(siteIdByName).length}`);

  // 2. Devices — upsert by deviceCode
  let inserted = 0, updated = 0;
  for (const d of DEVICES) {
    const result = await Device.updateOne(
      { deviceCode: d.code },
      {
        deviceCode: d.code,
        name: d.name,
        type: d.type,
        status: d.status,
        organizationId: org._id,
        siteId: siteIdByName[d.site],
        firmwareVersion: d.fw,
        latitude: d.lat,
        longitude: d.lng,
        lastSeenAt: new Date(),
      },
      { upsert: true }
    );
    if (result.upsertedCount > 0) inserted++; else updated++;
  }

  const totalDevices = await Device.countDocuments({ organizationId: org._id });
  const withGeo = await Device.countDocuments({ organizationId: org._id, latitude: { $exists: true }, longitude: { $exists: true } });
  console.log(`Devices inserted: ${inserted}, updated: ${updated}`);
  console.log(`Total devices: ${totalDevices}, with coordinates: ${withGeo}`);
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
