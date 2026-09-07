import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDatabase, disconnectDatabase } from "../src/infrastructure/database/connection.ts";
import { User } from "../src/infrastructure/database/models.ts";

async function seedAdmin() {
  await connectDatabase();
  const email = "admin@ksv.local";
  const password = "Admin123!";
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`[seed-admin] User ${email} already exists. Skipping.`);
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash, role: "Owner", firstName: "Admin", lastName: "User", isActive: true });
    console.log(`[seed-admin] Created: ${user.email} (${user.role})`);
    console.log(`[seed-admin] Login -> email: ${email}  password: ${password}`);
  }
  await disconnectDatabase();
}

seedAdmin().catch((err) => {
  console.error("[seed-admin] Failed:", err);
  process.exit(1);
});
