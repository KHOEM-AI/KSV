/**
 * KSV - Backend Server Entry Point
 * Run with: npm run server
 */
// MUST be the first import — loads .env into process.env before any
// other module (connection.ts, auth.middleware.ts, rate-limiter.ts)
// reads process.env.DATABASE_URL / JWT_ACCESS_SECRET / etc.
import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDatabase } from "./infrastructure/database/connection.ts";
import { Certificate, Command, Device } from "./infrastructure/database/models.ts";
import { authenticate } from "./core/auth/auth.middleware.ts";
import { requirePermission } from "./core/auth/rbac.policy.ts";
import { deviceCommandRateLimiter } from "./core/security/rate-limiter.ts";
import { evaluateSafetyForDevice } from "./core/safety/safety.engine.ts";
import { auditDeviceCommand } from "./core/security/audit.log.ts";

const PORT = process.env.PORT || 3000;

async function main() {
  await connectDatabase();

  const app = express();
  app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(",") || "*" }));
  app.use(express.json());

  // GET /api/certificates — list all
  app.get("/api/certificates", async (_req, res) => {
    try {
      const certs = await Certificate.find().populate("holderUserId", "firstName lastName email");
      res.json({ certificates: certs });
    } catch (err) {
      res.status(500).json({ error: "Failed to load certificates" });
    }
  });

  // POST /api/certificates — create one
  app.post("/api/certificates", async (req, res) => {
    try {
      const cert = await Certificate.create(req.body);
      res.status(201).json({ certificate: cert });
    } catch (err) {
      res.status(400).json({ error: "Failed to create certificate" });
    }
  });

  // ============================================================
  // POST /api/devices/:id/commands
  //
  // Flow (per KSV Command Engine, section 14):
  //   Authenticate → Authorize (device:command) → Rate limit
  //   → Safety check → Execute → Audit → Response
  //
  // Request body:
  //   {
  //     "commandType": "UNLOCK",           // required
  //     "payload": { ... },                // optional, command-specific
  //     "signals": { "isInsideGeoFence": true, ... } // optional, for safety engine
  //   }
  //
  // NOTE: this does not yet dispatch to a real gateway/protocol adapter
  // (that layer — src/core/protocol, src/core/gateway — is future work
  // per the Controls Wiring Audit doc). Once safety clears a command,
  // it is recorded as "success" immediately. Swap that line for a real
  // dispatch call once the gateway layer exists; nothing else in this
  // route needs to change.
  // ============================================================
  app.post(
    "/api/devices/:id/commands",
    authenticate,
    requirePermission("device:command"),
    deviceCommandRateLimiter,
    async (req, res) => {
      const deviceId = req.params.id;
      const { commandType, payload, signals } = req.body ?? {};
      const user = req.user!; // authenticate() guarantees this is set

      if (!commandType || typeof commandType !== "string") {
        res.status(400).json({ error: "BAD_REQUEST", message: "commandType is required." });
        return;
      }

      if (!user.organizationId) {
        // Fail closed: a device command must be scoped to an organization.
        res.status(400).json({
          error: "BAD_REQUEST",
          message: "Authenticated user has no organizationId — cannot evaluate safety/ownership.",
        });
        return;
      }

      try {
        const safetyResult = await evaluateSafetyForDevice(
          deviceId,
          user.organizationId,
          commandType,
          { payload, signals }
        );

        if (safetyResult.decision === "BLOCKED") {
          const blockedCommand = await Command.create({
            deviceId,
            userId: user.id,
            type: commandType,
            payload,
            status: "blocked",
            response: { reason: safetyResult.reason, ruleName: safetyResult.ruleName },
            sentAt: new Date(),
            completedAt: new Date(),
          });

          await auditDeviceCommand(user.id, deviceId, commandType, "BLOCKED", {
            reason: safetyResult.reason,
          });

          res.status(403).json({
            error: "SAFETY_BLOCKED",
            message: safetyResult.reason,
            ruleId: safetyResult.ruleId,
            commandId: blockedCommand._id,
          });
          return;
        }

        // ALLOWED — no real protocol/gateway dispatch exists yet, so the
        // command is recorded as sent + immediately successful. Replace
        // this block with an actual dispatch call once that layer exists.
        const sentAt = new Date();
        const command = await Command.create({
          deviceId,
          userId: user.id,
          type: commandType,
          payload,
          status: "success",
          sentAt,
          completedAt: new Date(),
        });

        await Device.updateOne({ _id: deviceId }, { lastSeenAt: new Date() });

        await auditDeviceCommand(user.id, deviceId, commandType, "SUCCESS");

        res.status(201).json({ command });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[COMMANDS] Failed to process device command:", err);

        await auditDeviceCommand(user.id, deviceId, commandType, "FAILURE", {
          reason: "Internal error while processing command.",
        });

        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to process command." });
      }
    }
  );

  app.listen(PORT, () => {
    console.log(`[Server] KSV API running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("[Server] Fatal startup error:", err);
  process.exit(1);
});
