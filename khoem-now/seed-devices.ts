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
    { name: "Smart Light Switch Bedroom", deviceCode: "DEV-04851", type: "Access", status: "online", firmwareVersion: "1.8.2", organizationId: org._id },
    { name: "Smart Doorbell Front", deviceCode: "DEV-04852", type: "Sensor", status: "online", firmwareVersion: "2.3.0", organizationId: org._id },
    { name: "Smart AC Controller Office", deviceCode: "DEV-04853", type: "Climate", status: "online", firmwareVersion: "2.5.1", organizationId: org._id },
    { name: "Water Leak Sensor Basement", deviceCode: "DEV-04854", type: "Sensor", status: "online", firmwareVersion: "1.1.3", organizationId: org._id },
    { name: "Smart Sprinkler Controller", deviceCode: "DEV-04855", type: "Climate", status: "online", firmwareVersion: "1.6.0", organizationId: org._id },
    { name: "Cafe Refrigerator Monitor", deviceCode: "DEV-04856", type: "Climate", status: "online", firmwareVersion: "2.0.4", organizationId: org._id },
    { name: "Coffee Machine Sensor Bay 1", deviceCode: "DEV-04857", type: "Sensor", status: "online", firmwareVersion: "1.3.2", organizationId: org._id },
    { name: "Warehouse Scanner Station 4", deviceCode: "DEV-04858", type: "Network", status: "online", firmwareVersion: "3.2.0", organizationId: org._id },
    { name: "Automated Packaging Line 2", deviceCode: "DEV-04859", type: "Industrial", status: "online", firmwareVersion: "4.7.1", organizationId: org._id },
    { name: "Waste Monitoring System A", deviceCode: "DEV-04860", type: "Sensor", status: "online", firmwareVersion: "1.9.0", organizationId: org._id },
    { name: "Smart Ceiling Fan Living Room", deviceCode: "DEV-04861", type: "Climate", status: "online", firmwareVersion: "1.2.4", organizationId: org._id },
    { name: "Smart Window Blind Controller", deviceCode: "DEV-04862", type: "Access", status: "online", firmwareVersion: "1.5.0", organizationId: org._id },
    { name: "Smart Pool Pump Monitor", deviceCode: "DEV-04863", type: "Climate", status: "online", firmwareVersion: "1.0.9", organizationId: org._id },
    { name: "Smart Pet Feeder", deviceCode: "DEV-04864", type: "Sensor", status: "online", firmwareVersion: "2.2.1", organizationId: org._id },
    { name: "Smart Mailbox Sensor", deviceCode: "DEV-04865", type: "Sensor", status: "online", firmwareVersion: "1.1.0", organizationId: org._id },
    { name: "Smart Attic Vent Fan", deviceCode: "DEV-04866", type: "Climate", status: "online", firmwareVersion: "1.3.2", organizationId: org._id },
    { name: "Smart Backyard Gate Lock", deviceCode: "DEV-04867", type: "Access", status: "online", firmwareVersion: "2.4.0", organizationId: org._id },
    { name: "Smart Humidifier Nursery", deviceCode: "DEV-04868", type: "Climate", status: "online", firmwareVersion: "1.6.3", organizationId: org._id },
    { name: "Smart Motion Light Hallway", deviceCode: "DEV-04869", type: "Sensor", status: "online", firmwareVersion: "1.9.5", organizationId: org._id },
    { name: "Smart EV Charger Garage", deviceCode: "DEV-04870", type: "Vehicle", status: "online", firmwareVersion: "3.1.0", organizationId: org._id },
    { name: "Bakery Oven Temp Monitor", deviceCode: "DEV-04871", type: "Climate", status: "online", firmwareVersion: "1.4.8", organizationId: org._id },
    { name: "Retail POS Terminal 2", deviceCode: "DEV-04872", type: "Network", status: "online", firmwareVersion: "4.0.1", organizationId: org._id },
    { name: "Bakery Freezer Sensor", deviceCode: "DEV-04873", type: "Climate", status: "online", firmwareVersion: "1.7.2", organizationId: org._id },
    { name: "Restaurant Grease Trap Monitor", deviceCode: "DEV-04874", type: "Sensor", status: "online", firmwareVersion: "1.0.5", organizationId: org._id },
    { name: "Small Shop Door Sensor", deviceCode: "DEV-04875", type: "Access", status: "online", firmwareVersion: "2.1.3", organizationId: org._id },
    { name: "Laundromat Washer Monitor 3", deviceCode: "DEV-04876", type: "Industrial", status: "online", firmwareVersion: "2.6.0", organizationId: org._id },
    { name: "Salon Sterilizer Unit", deviceCode: "DEV-04877", type: "Industrial", status: "online", firmwareVersion: "1.3.4", organizationId: org._id },
    { name: "Bike Shop Compressor", deviceCode: "DEV-04878", type: "Industrial", status: "online", firmwareVersion: "2.0.0", organizationId: org._id },
    { name: "Print Shop Plotter Monitor", deviceCode: "DEV-04879", type: "Industrial", status: "online", firmwareVersion: "1.8.1", organizationId: org._id },
    { name: "Pharmacy Cold Chain Sensor", deviceCode: "DEV-04880", type: "Climate", status: "online", firmwareVersion: "2.3.5", organizationId: org._id },
    { name: "Assembly Line Robot Arm 2", deviceCode: "DEV-04881", type: "Industrial", status: "online", firmwareVersion: "5.2.0", organizationId: org._id },
    { name: "Injection Molding Machine A", deviceCode: "DEV-04882", type: "Industrial", status: "online", firmwareVersion: "4.1.7", organizationId: org._id },
    { name: "Paint Booth Ventilation Fan", deviceCode: "DEV-04883", type: "Climate", status: "online", firmwareVersion: "2.5.3", organizationId: org._id },
    { name: "Forklift Fleet Tracker 4", deviceCode: "DEV-04884", type: "Vehicle", status: "online", firmwareVersion: "3.4.2", organizationId: org._id },
    { name: "Palletizer Robot Station 1", deviceCode: "DEV-04885", type: "Industrial", status: "online", firmwareVersion: "5.0.1", organizationId: org._id },
    { name: "Boiler Room Pressure Sensor", deviceCode: "DEV-04886", type: "Sensor", status: "online", firmwareVersion: "1.9.9", organizationId: org._id },
    { name: "Cooling Tower Monitor", deviceCode: "DEV-04887", type: "Climate", status: "online", firmwareVersion: "2.2.0", organizationId: org._id },
    { name: "Compressed Air System Gauge", deviceCode: "DEV-04888", type: "Sensor", status: "online", firmwareVersion: "1.5.6", organizationId: org._id },
    { name: "Emergency Exit Door Sensor 2", deviceCode: "DEV-04889", type: "Access", status: "online", firmwareVersion: "3.0.0", organizationId: org._id },
    { name: "Fire Suppression Panel", deviceCode: "DEV-04890", type: "Sensor", status: "online", firmwareVersion: "2.8.0", organizationId: org._id },
    { name: "Loading Ramp Sensor North", deviceCode: "DEV-04891", type: "Sensor", status: "online", firmwareVersion: "1.4.4", organizationId: org._id },
    { name: "Bottling Line Speed Monitor", deviceCode: "DEV-04892", type: "Industrial", status: "online", firmwareVersion: "3.6.1", organizationId: org._id },
    { name: "Quality Control Camera Line 4", deviceCode: "DEV-04893", type: "Sensor", status: "online", firmwareVersion: "2.9.3", organizationId: org._id },
    { name: "Rooftop Solar Inverter Monitor", deviceCode: "DEV-04894", type: "Sensor", status: "online", firmwareVersion: "1.6.8", organizationId: org._id },
    { name: "Backup Generator Controller", deviceCode: "DEV-04895", type: "Industrial", status: "online", firmwareVersion: "2.4.5", organizationId: org._id },
    { name: "Delivery Van Fleet Tracker 5", deviceCode: "DEV-04896", type: "Vehicle", status: "online", firmwareVersion: "3.4.2", organizationId: org._id },
    { name: "Server Room Cooling Unit 2", deviceCode: "DEV-04897", type: "Climate", status: "online", firmwareVersion: "2.7.1", organizationId: org._id },
    { name: "Network Switch Rack-15", deviceCode: "DEV-04898", type: "Network", status: "online", firmwareVersion: "6.3.0", organizationId: org._id },
    { name: "Elevator Motor Monitor Tower B", deviceCode: "DEV-04899", type: "Industrial", status: "online", firmwareVersion: "3.1.2", organizationId: org._id },
    { name: "Loading Dock Door Sensor 3", deviceCode: "DEV-04900", type: "Access", status: "online", firmwareVersion: "2.1.0", organizationId: org._id },
    { name: "Vineyard Irrigation Controller", deviceCode: "DEV-04901", type: "Climate", status: "online", firmwareVersion: "1.2.0", organizationId: org._id },
    { name: "Dairy Farm Milk Tank Sensor", deviceCode: "DEV-04902", type: "Climate", status: "online", firmwareVersion: "1.5.3", organizationId: org._id },
    { name: "Grain Silo Level Monitor", deviceCode: "DEV-04903", type: "Sensor", status: "online", firmwareVersion: "1.3.1", organizationId: org._id },
    { name: "Poultry House Ventilation Fan", deviceCode: "DEV-04904", type: "Climate", status: "online", firmwareVersion: "1.1.7", organizationId: org._id },
    { name: "Greenhouse Humidity Sensor", deviceCode: "DEV-04905", type: "Sensor", status: "online", firmwareVersion: "1.4.0", organizationId: org._id },
    { name: "Marina Dock Gate Lock", deviceCode: "DEV-04906", type: "Access", status: "online", firmwareVersion: "2.0.1", organizationId: org._id },
    { name: "Boat Fleet Tracker 6", deviceCode: "DEV-04907", type: "Vehicle", status: "online", firmwareVersion: "3.4.2", organizationId: org._id },
    { name: "Construction Site Crane Monitor", deviceCode: "DEV-04908", type: "Industrial", status: "online", firmwareVersion: "5.3.1", organizationId: org._id },
    { name: "Portable Generator Bay 3", deviceCode: "DEV-04909", type: "Industrial", status: "online", firmwareVersion: "2.4.5", organizationId: org._id },
    { name: "Site Perimeter Camera North", deviceCode: "DEV-04910", type: "Sensor", status: "online", firmwareVersion: "2.9.3", organizationId: org._id },
    { name: "Hotel Room Smart Lock 214", deviceCode: "DEV-04911", type: "Access", status: "online", firmwareVersion: "3.0.2", organizationId: org._id },
    { name: "Hotel Lobby HVAC Unit", deviceCode: "DEV-04912", type: "Climate", status: "online", firmwareVersion: "3.8.0", organizationId: org._id },
    { name: "Hotel Pool Chemical Sensor", deviceCode: "DEV-04913", type: "Sensor", status: "online", firmwareVersion: "1.6.4", organizationId: org._id },
    { name: "Parking Garage Barrier East", deviceCode: "DEV-04914", type: "Access", status: "online", firmwareVersion: "4.0.0", organizationId: org._id },
    { name: "EV Charging Station Bay 5", deviceCode: "DEV-04915", type: "Vehicle", status: "online", firmwareVersion: "3.1.0", organizationId: org._id },
    { name: "Gym Equipment Usage Sensor", deviceCode: "DEV-04916", type: "Sensor", status: "online", firmwareVersion: "1.2.8", organizationId: org._id },
    { name: "School Cafeteria Freezer", deviceCode: "DEV-04917", type: "Climate", status: "online", firmwareVersion: "3.8.6", organizationId: org._id },
    { name: "School Gate Access Control", deviceCode: "DEV-04918", type: "Access", status: "online", firmwareVersion: "4.2.1", organizationId: org._id },
    { name: "Library Book Return Sensor", deviceCode: "DEV-04919", type: "Sensor", status: "online", firmwareVersion: "1.0.9", organizationId: org._id },
    { name: "Hospital Ward Door Lock 5", deviceCode: "DEV-04920", type: "Access", status: "online", firmwareVersion: "4.2.1", organizationId: org._id },
    { name: "Hospital Oxygen Tank Monitor", deviceCode: "DEV-04921", type: "Sensor", status: "online", firmwareVersion: "2.1.5", organizationId: org._id },
    { name: "Pharmacy Freezer Unit B", deviceCode: "DEV-04922", type: "Climate", status: "online", firmwareVersion: "3.8.6", organizationId: org._id },
    { name: "Data Center CRAC Unit 3", deviceCode: "DEV-04923", type: "Climate", status: "online", firmwareVersion: "2.7.1", organizationId: org._id },
    { name: "Data Center Core Switch 2", deviceCode: "DEV-04924", type: "Network", status: "online", firmwareVersion: "6.3.0", organizationId: org._id },
    { name: "Data Center UPS Monitor", deviceCode: "DEV-04925", type: "Sensor", status: "online", firmwareVersion: "1.9.9", organizationId: org._id },
    { name: "Stadium Floodlight Controller", deviceCode: "DEV-04926", type: "Access", status: "online", firmwareVersion: "1.5.0", organizationId: org._id },
    { name: "Stadium Turnstile Gate 4", deviceCode: "DEV-04927", type: "Access", status: "online", firmwareVersion: "4.0.0", organizationId: org._id },
    { name: "Airport Baggage Scanner 7", deviceCode: "DEV-04928", type: "Network", status: "online", firmwareVersion: "3.2.0", organizationId: org._id },
    { name: "Airport Jet Bridge Sensor", deviceCode: "DEV-04929", type: "Sensor", status: "online", firmwareVersion: "1.4.4", organizationId: org._id },
    { name: "Airport Fuel Depot Monitor", deviceCode: "DEV-04930", type: "Climate", status: "online", firmwareVersion: "2.2.0", organizationId: org._id },
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
