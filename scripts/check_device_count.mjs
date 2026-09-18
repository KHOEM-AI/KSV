import "dotenv/config";
import { connectDatabase } from "./src/infrastructure/database/connection.ts";
import { Device } from "./src/infrastructure/database/models.ts";

const ORG_ID = "6a9e7ea3176a7202190df575";

await connectDatabase();
const total = await Device.countDocuments({ organizationId: ORG_ID });
const ourSeeded = await Device.countDocuments({ organizationId: ORG_ID, deviceCode: { $regex: /^DEV-048/ } });
console.log("Total devices in DB for this org:", total);
console.log("Devices matching our DEV-048xx codes:", ourSeeded);
process.exit(0);
