/**
 * KSV - Database Connection (Mongoose)
 * Location in project: src/infrastructure/database/connection.ts
 *
 * Replaces Prisma, which requires a native binary engine that does not
 * run on Android/Termux. Mongoose is pure JavaScript and works
 * identically across Linux, macOS, Windows, and Android.
 */

import mongoose from "mongoose";

let isConnected = false;

export async function connectDatabase(): Promise<void> {
  if (isConnected) return;

  const uri = process.env.DATABASE_URL;
  if (!uri) {
    throw new Error(
      "DATABASE_URL is not set. Refusing to start without it (Fail Securely principle)."
    );
  }

  try {
    await mongoose.connect(uri);
    isConnected = true;
    // eslint-disable-next-line no-console
    console.log("[DB] Connected to MongoDB");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[DB] Connection failed:", err);
    throw err;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
}
