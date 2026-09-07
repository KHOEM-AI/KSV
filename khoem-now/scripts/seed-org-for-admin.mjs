import "dotenv/config";
import { connectDatabase, disconnectDatabase } from "../src/infrastructure/database/connection.ts";
import { User, Organization } from "../src/infrastructure/database/models.ts";

async function seedOrg() {
  await connectDatabase();

  const email = "admin@ksv.local";
  const user = await User.findOne({ email });
  if (!user) {
    console.error(`[seed-org] User ${email} not found. Run seed-admin-user.mjs first.`);
    await disconnectDatabase();
    return;
  }

  if (user.organizationId) {
    console.log(`[seed-org] User already has organizationId: ${user.organizationId}`);
  } else {
    const org = await Organization.create({
      name: "KSV Demo Org",
      ownerId: user._id,
      country: "KH",
      timezone: "Asia/Phnom_Penh",
    });
    user.organizationId = org._id;
    await user.save();
    console.log(`[seed-org] Created organization: ${org._id}`);
    console.log(`[seed-org] Linked to user: ${user.email}`);
  }

  await disconnectDatabase();
}

seedOrg().catch((err) => {
  console.error("[seed-org] Failed:", err);
  process.exit(1);
});
