import "dotenv/config";
import { connectDatabase } from "./src/infrastructure/database/connection.ts";
import { Device, Organization, Gateway } from "./src/infrastructure/database/models.ts";

const ORG_ID = "6a9e7ea3176a7202190df575";

async function seed() {
  await connectDatabase();

  const org = await Organization.findById(ORG_ID);
  if (!org) {
    console.log(`Organization ${ORG_ID} not found.`);
    process.exit(1);
  }

  const gateways = [
    { name: "Frankfurt Edge Controller", type: "edge", mode: "hybrid", status: "online", ipAddress: "10.20.1.4", firmwareVersion: "4.2.0", cpuUsage: 34, memUsage: 58 },
    { name: "Singapore Edge Controller", type: "edge", mode: "hybrid", status: "online", ipAddress: "10.30.2.4", firmwareVersion: "4.2.0", cpuUsage: 41, memUsage: 62 },
    { name: "Taipei Edge Controller", type: "edge", mode: "hybrid", status: "online", ipAddress: "10.40.1.9", firmwareVersion: "4.1.5", cpuUsage: 78, memUsage: 84 },
    { name: "Stuttgart Edge Controller", type: "edge", mode: "hybrid", status: "online", ipAddress: "10.50.1.2", firmwareVersion: "4.2.0", cpuUsage: 28, memUsage: 49 },
    { name: "Dubai Edge Controller", type: "edge", mode: "hybrid", status: "offline", ipAddress: "10.60.1.7", firmwareVersion: "3.9.8", cpuUsage: 0, memUsage: 0 },
    { name: "Seoul Edge Controller", type: "edge", mode: "hybrid", status: "online", ipAddress: "10.70.1.3", firmwareVersion: "4.2.0", cpuUsage: 52, memUsage: 67 },
  ];

  const gatewayDocs = [];
  for (const gw of gateways) {
    const doc = await Gateway.findOneAndUpdate(
      { name: gw.name, organizationId: org._id },
      { $set: { ...gw, organizationId: org._id } },
      { upsert: true, new: true }
    );
    gatewayDocs.push(doc);
  }
  console.log(`Upserted ${gatewayDocs.length} gateways.`);

  // Distribute all 110 devices across the 5 ONLINE gateways only
  // (Dubai stays offline with 0 devices, matching its offline status).
  const onlineGateways = gatewayDocs.filter((g) => g.status === "online");
  const allDevices = await Device.find({ organizationId: org._id }).select("_id");

  let i = 0;
  for (const device of allDevices) {
    const gw = onlineGateways[i % onlineGateways.length];
    await Device.updateOne({ _id: device._id }, { $set: { gatewayId: gw._id } });
    i++;
  }
  console.log(`Linked ${allDevices.length} devices across ${onlineGateways.length} online gateways.`);

  // Update each gateway's deviceCount to match reality
  for (const gw of gatewayDocs) {
    const count = await Device.countDocuments({ gatewayId: gw._id });
    await Gateway.updateOne({ _id: gw._id }, { $set: { deviceCount: count } });
  }

  const totalOnlineGateways = await Gateway.countDocuments({ organizationId: org._id, status: "online" });
  console.log(`Total online gateways: ${totalOnlineGateways}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
