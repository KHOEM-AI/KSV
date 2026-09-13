import "dotenv/config";
import { connectDatabase } from "./src/infrastructure/database/connection.ts";
import { Device } from "./src/infrastructure/database/models.ts";

const ORG_ID = "6a9e7ea3176a7202190df575";

await connectDatabase();
const toDelete = await Device.countDocuments({ organizationId: ORG_ID, deviceCode: { $not: /^DEV-04(8|9)/ } });
const toKeep = await Device.countDocuments({ organizationId: ORG_ID, deviceCode: { $regex: /^DEV-04(8|9)/ } });
console.log("Would DELETE (fake):", toDelete);
console.log("Would KEEP (real, our 110):", toKeep);
process.exit(0);
