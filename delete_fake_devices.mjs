import "dotenv/config";
import { connectDatabase } from "./src/infrastructure/database/connection.ts";
import { Device } from "./src/infrastructure/database/models.ts";

const ORG_ID = "6a9e7ea3176a7202190df575";

await connectDatabase();
const result = await Device.deleteMany({
  organizationId: ORG_ID,
  deviceCode: { $not: /^DEV-04(8|9)/ },
});
console.log("Deleted fake devices:", result.deletedCount);

const remaining = await Device.countDocuments({ organizationId: ORG_ID });
console.log("Devices remaining (should be 110):", remaining);
process.exit(0);
