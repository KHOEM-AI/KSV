import "dotenv/config";
import { connectDatabase } from "./src/infrastructure/database/connection.ts";
import { User, Organization } from "./src/infrastructure/database/models.ts";
import bcrypt from "bcryptjs";

async function seed() {
  await connectDatabase();

  const existing = await User.findOne({ email: "admin@ksv.com" });
  if (existing) {
    console.log("Admin user already exists:", existing._id);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash("Admin123!", 12);

  const user = await User.create({
    email: "admin@ksv.com",
    passwordHash,
    role: "Owner",
    firstName: "Admin",
    lastName: "KSV",
    isActive: true,
  });
  console.log("User created:", user._id);

  const org = await Organization.create({
    name: "KSV Global Holdings",
    type: "company",
    ownerId: user._id,
  });
  console.log("Organization created:", org._id);

  user.organizationId = org._id;
  await user.save();
  console.log("Linked user to organization");

  console.log("Login email: admin@ksv.com");
  console.log("Login password: Admin123!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
