import "dotenv/config";
import { connectDatabase, disconnectDatabase } from "./src/infrastructure/database/connection.ts";
import { User, Organization } from "./src/infrastructure/database/models.ts";

async function fixOrg() {
  await connectDatabase();
  const org = await Organization.findOne({ name: "KSV Global Holdings" });
  if (!org) {
    console.log("KSV Global Holdings not found.");
    await disconnectDatabase();
    return;
  }
  const user = await User.findOne({ email: "admin@ksv.local" });
  if (!user) {
    console.log("admin@ksv.local not found.");
    await disconnectDatabase();
    return;
  }
  user.organizationId = org._id;
  await user.save();
  console.log(`Linked admin@ksv.local -> ${org.name} (${org._id})`);
  await disconnectDatabase();
}

fixOrg().catch((err) => { console.error(err); process.exit(1); });
