import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

async function reset() {
  await mongoose.connect(process.env.DATABASE_URL);
  const hash = await bcrypt.hash("2116", 12);
  const result = await mongoose.connection.collection("users").updateOne(
    { email: "khoemai9@gmail.com" },
    { $set: { passwordHash: hash } }
  );
  console.log("Updated:", result.modifiedCount);
  process.exit(0);
}

reset();
