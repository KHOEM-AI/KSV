import { readFileSync, writeFileSync } from "fs";

const path = "seed-devices.ts";
const content = readFileSync(path, "utf8");

const marker = `    { name: "Loading Dock Door Sensor 3", deviceCode: "DEV-04900", type: "Access", status: "online", firmwareVersion: "2.1.0", organizationId: org._id },
  ];`;
const count = content.split(marker).length - 1;
if (count !== 1) { console.error("ERROR: expected 1, found " + count); process.exit(1); }

const newDevices = `    { name: "Loading Dock Door Sensor 3", deviceCode: "DEV-04900", type: "Access", status: "online", firmwareVersion: "2.1.0", organizationId: org._id },
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
  ];`;

const updated = content.replace(marker, newDevices);
writeFileSync(path, updated, "utf8");
console.log("Added 30 more devices (DEV-04901 to DEV-04930).");
