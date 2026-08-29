/**
 * KSV - Backend Server Entry Point
 * Run with: npm run server
 *
 * This is the ONLY place that starts the Node/Mongoose backend.
 * Vite (npm run dev) only serves the frontend — it never touches this file.
 */
import { connectDatabase } from "./infrastructure/database/connection.ts";

async function main() {
  await connectDatabase();
  console.log("[Server] Database ready. Add your API routes/listener here.");
}

main().catch((err) => {
  console.error("[Server] Fatal startup error:", err);
  process.exit(1);
});
