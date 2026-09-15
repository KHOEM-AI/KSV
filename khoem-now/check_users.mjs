import "dotenv/config";
import mongoose from "mongoose";

async function check() {
  await mongoose.connect(process.env.DATABASE_URL);
  const users = await mongoose.connection.db.listCollections().toArray();
  console.log("Collections:", users.map(u => u.name));
  const found = await mongoose.connection.collection("users").find({}).limit(5).toArray();
  console.log("Users:", found.map(u => ({ email: u.email, id: u._id })));
  process.exit(0);
}

check();
