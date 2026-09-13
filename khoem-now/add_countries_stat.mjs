import { readFileSync, writeFileSync } from "fs";

const path = "src/server.ts";
const content = readFileSync(path, "utf8");

if (content.includes("countriesDeployed")) {
  console.error("ERROR: countriesDeployed already wired. Aborting, no changes made.");
  process.exit(1);
}

const marker = `      const warningDevices = await Device.countDocuments({ organizationId: orgId, status: "warning" });
      res.json({ totalDevices, onlineDevices, safetyRules, gateways, warningDevices });`;

if (content.split(marker).length - 1 !== 1) {
  console.error("ERROR: marker not found exactly once. Aborting.");
  process.exit(1);
}

const replacement = `      const warningDevices = await Device.countDocuments({ organizationId: orgId, status: "warning" });
      const countriesDeployed = (await Site.distinct("country", { organizationId: orgId, country: { $ne: null } })).length;
      res.json({ totalDevices, onlineDevices, safetyRules, gateways, warningDevices, countriesDeployed });`;

const updated = content.replace(marker, replacement);
writeFileSync(path, updated, "utf8");
console.log("Wired successfully.");
