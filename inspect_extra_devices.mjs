import "dotenv/config";
import { connectDatabase } from "./src/infrastructure/database/connection.ts";
import { Device } from "./src/infrastructure/database/models.ts";

const ORG_ID = "6a9e7ea3176a7202190df575";

await connectDatabase();
const ourCount = await Device.countDocuments({ organizationId: ORG_ID, deviceCode: { $regex: /^DEV-04(8|9)/ } });
console.log("Our real seeded devices (DEV-048xx + DEV-049xx):", ourCount);

const extra = await Device.find({ organizationId: ORG_ID, deviceCode: { $not: /^DEV-04(8|9)/ } })
  .limit(5)
  .select("name deviceCode type status createdAt");
console.log("Sample of 5 EXTRA (non-ours) devices:");
console.log(JSON.stringify(extra, null, 2));

const extraCount = await Device.countDocuments({ organizationId: ORG_ID, deviceCode: { $not: /^DEV-04(8|9)/ } });
console.log("Total EXTRA devices:", extraCount);
process.exit(0);
