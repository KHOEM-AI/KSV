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
import { Certificate, Command, Device, Settings, ThreatDetection, SecurityIncident, Organization } from "./infrastructure/database/models.ts";
import { User } from "./infrastructure/database/models.ts";
import { authenticate } from "./core/auth/auth.middleware.ts";
import { requirePermission, requireMinRole } from "./core/auth/rbac.policy.ts";
import { deviceCommandRateLimiter, authRateLimiter } from "./core/security/rate-limiter.ts";
import { evaluateSafetyForDevice } from "./core/safety/safety.engine.ts";
import { auditDeviceCommand } from "./core/security/audit.log.ts";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

  // POST /api/users — create one (Owner only, password hashed, no mass-assignment)
  app.post(
    "/api/users",
    authenticate,
    requireMinRole("Owner"),
    async (req, res) => {
      try {
        const { email, password, role, firstName, lastName, organizationId } = req.body ?? {};

        if (!email || !password || !role) {
          res.status(400).json({ error: "BAD_REQUEST", message: "email, password, and role are required." });
          return;
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.create({ email, passwordHash, role, firstName, lastName, organizationId });

        const safeUser = user.toObject();
        delete safeUser.passwordHash;

        res.status(201).json({ user: safeUser });
      } catch (err) {
        res.status(400).json({ error: "Failed to create user", details: String(err) });
      }
    }
  );

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

  // POST /api/auth/login/password
  app.post("/api/auth/login/password", authRateLimiter, async (req, res) => {
    try {
      const { email, password } = req.body ?? {};

      if (!email || !password) {
        res.status(400).json({
          result: "failed",
          message: "email and password are required.",
        });
        return;
      }

      const user = await User.findOne({ email });
      if (!user || !user.isActive) {
        res.status(401).json({
          result: "failed",
          message: "Email or password is incorrect.",
        });
        return;
      }

      const passwordMatches = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatches) {
        res.status(401).json({
          result: "failed",
          message: "Email or password is incorrect.",
        });
        return;
      }

      const accessToken = jwt.sign(
        {
          sub: String(user._id),
          role: user.role,
          organizationId: user.organizationId ? String(user.organizationId) : undefined,
        },
        process.env.JWT_ACCESS_SECRET as string,
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        { sub: String(user._id) },
        (process.env.JWT_REFRESH_SECRET || process.env.JWT_ACCESS_SECRET) as string,
        { expiresIn: "7d" }
      );

      user.lastLoginAt = new Date();
      await user.save();

      res.json({
        result: "success",
        session: {
          sessionId: String(user._id) + "-" + Date.now(),
          accountId: String(user._id),
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
          createdAt: new Date().toISOString(),
        },
        token: {
          accessToken,
          refreshToken,
          expiresIn: 900,
          tokenType: "Bearer",
        },
        message: "Login successful.",
      });
    } catch (err) {
      res.status(500).json({ result: "failed", message: "Login failed due to a server error." });
    }
  });

  // GET /api/settings
  app.get(
    "/api/settings",
    authenticate,
    requirePermission("org:read"),
    async (req, res) => {
      const user = req.user!;
      if (!user.organizationId) {
        res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
        return;
      }
      let settings = await Settings.findOne({ organizationId: user.organizationId }).lean();
      if (!settings) {
        settings = await Settings.create({ organizationId: user.organizationId });
      }
      res.json({ settings });
    }
  );

  // PUT /api/settings
  app.put(
    "/api/settings",
    authenticate,
    requirePermission("org:manage"),
    async (req, res) => {
      const user = req.user!;
      if (!user.organizationId) {
        res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
        return;
      }
      try {
        const updated = await Settings.findOneAndUpdate(
          { organizationId: user.organizationId },
          { $set: req.body },
          { new: true, upsert: true }
        );
        await auditDeviceCommand(user.id, "settings", "UPDATE_SETTINGS", "SUCCESS");
        res.json({ settings: updated });
      } catch (err) {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to save settings." });
      }
    }
  );


  // GET /api/devices — list devices for the user's organization
  app.get("/api/devices", authenticate, requirePermission("device:read"), async (req, res) => {
    const user = req.user!;
    if (!user.organizationId) {
      res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
      return;
    }
    try {
      const devices = await Device.find({ organizationId: user.organizationId }).lean();
      res.json({ devices, total: devices.length });
    } catch (err) {
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load devices." });
    }
  });

  // GET /api/devices/:id/state — single device current state
  app.get("/api/devices/:id/state", authenticate, requirePermission("device:read"), async (req, res) => {
    try {
      const device = await Device.findById(req.params.id).lean();
      if (!device) {
        res.status(404).json({ error: "DEVICE_NOT_FOUND" });
        return;
      }
      res.json({ device });
    } catch (err) {
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load device state." });
    }
  });

  // GET /api/commands/recent — latest dispatched commands across the
  // org, for "Live Control Activity" style feeds. Joins through Device
  // since Command has no organizationId of its own.
  app.get("/api/commands/recent", authenticate, requirePermission("device:read"), async (req, res) => {
    const user = req.user!;
    if (!user.organizationId) {
      res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
      return;
    }
    try {
      const limit = Math.min(Number(req.query.limit) || 10, 50);
      const deviceIds = await Device.find({ organizationId: user.organizationId }).distinct("_id");
      const commands = await Command.find({ deviceId: { $in: deviceIds } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("deviceId", "name")
        .populate("userId", "email")
        .lean();
      res.json({ commands });
    } catch (err) {
      console.error("[COMMANDS] Failed to load recent commands:", err);
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load recent commands." });
    }
  });


  // GET /api/security/threats — list threat detections for the org
  app.get("/api/security/threats", authenticate, requirePermission("org:read"), async (req, res) => {
    const user = req.user!;
    if (!user.organizationId) {
      res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
      return;
    }
    try {
      const threats = await ThreatDetection.find({ organizationId: user.organizationId })
        .sort({ detectedAt: -1 })
        .lean();
      res.json({ threats, total: threats.length });
    } catch (err) {
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load threats." });
    }
  });

  // GET /api/security/incidents — list security incidents for the org
  app.get("/api/security/incidents", authenticate, requirePermission("org:read"), async (req, res) => {
    const user = req.user!;
    if (!user.organizationId) {
      res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
      return;
    }
    try {
      const incidents = await SecurityIncident.find({ organizationId: user.organizationId })
        .sort({ detectedAt: -1 })
        .lean();
      res.json({ incidents, total: incidents.length });
    } catch (err) {
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load incidents." });
    }
  });
  // GET /api/organizations — list organizations the user belongs to
  app.get(
    "/api/organizations",
    authenticate,
    requirePermission("org:read"),
    async (req, res) => {
      const user = req.user!;
      if (!user.organizationId) {
        res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
        return;
      }
      try {
        const org = await Organization.findById(user.organizationId).lean();
        if (!org) {
          res.status(404).json({ error: "NOT_FOUND" });
          return;
        }
        res.json({ organizations: [org] });
      } catch (err) {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load organizations." });
      }
    }
  );

  // GET /api/organizations — list organizations the user belongs to
  app.get(
    "/api/organizations",
    authenticate,
    requirePermission("org:read"),
    async (req, res) => {
      const user = req.user!;
      if (!user.organizationId) {
        res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
        return;
      }
      try {
        const org = await Organization.findById(user.organizationId).lean();
        if (!org) {
          res.status(404).json({ error: "NOT_FOUND" });
          return;
        }
        res.json({ organizations: [org] });
      } catch (err) {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load organizations." });
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
