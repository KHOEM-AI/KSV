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
import { Certificate, Command, Device, Settings, ThreatDetection, SecurityIncident, Organization, SafetyRule, Gateway, AuditLog, Protocol, Notification, Country, AutomationRule, Discovery, Language, SafetyLog, DeviceLog, OrganizationSubscription, Invoice, AIConversationSession } from "./infrastructure/database/models.ts";
import { User, Session } from "./infrastructure/database/models.ts";
import { authenticate } from "./core/auth/auth.middleware.ts";
import { requirePermission, requireMinRole } from "./core/auth/rbac.policy.ts";
import { deviceCommandRateLimiter, authRateLimiter } from "./core/security/rate-limiter.ts";
import { evaluateSafetyForDevice } from "./core/safety/safety.engine.ts";
import { auditDeviceCommand } from "./core/security/audit.log.ts";
import { DefaultGatewayDispatcher } from "./core/gateway/gateway.dispatcher.ts";
import { applyDispatchResult } from "./core/gateway/command.lifecycle.ts";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

function hashRefreshToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}


const PORT = process.env.PORT || 3000;

async function main() {
  await connectDatabase();

  const app = express();
  const gatewayDispatcher = new DefaultGatewayDispatcher();
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
  //   → Safety check → Create pending command → Dispatch → Audit → Response
  //
  // Request body:
  //   {
  //     "commandType": "UNLOCK",           // required
  //     "payload": { ... },                // optional, command-specific
  //     "signals": { "isInsideGeoFence": true, ... } // optional, for safety engine
  //   }
  //
  // The command is persisted as pending, then dispatched through the
  // gateway/protocol layer. Success is recorded only after an actual
  // transport/protocol acknowledgement. If no adapter/transport is
  // configured, the dispatcher fails closed instead of reporting success.
  // ============================================================
  app.post(
    "/api/devices/:id/commands",
    authenticate,
    requirePermission("device:command"),
    deviceCommandRateLimiter,
    async (req, res) => {
      const rawDeviceId = req.params.id;
      if (typeof rawDeviceId !== "string") {
        res.status(400).json({ error: "INVALID_DEVICE_ID" });
        return;
      }
      const deviceId = rawDeviceId;
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

          await auditDeviceCommand(user.id, deviceId, commandType, "BLOCKED", String(user.organizationId), {
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

        // ALLOWED — create the command as pending, then dispatch it through
        // the gateway/protocol layer. A command is successful only after
        // the physical transport/protocol returns an acknowledgement.
        const device = await Device.findOne({
          _id: deviceId,
          organizationId: user.organizationId,
        }).lean();

        if (!device) {
          res.status(404).json({
            error: "DEVICE_NOT_FOUND",
            message: "Device not found.",
          });
          return;
        }

        const command = await Command.create({
          deviceId,
          userId: user.id,
          type: commandType,
          payload,
          status: "pending",
        });

        const dispatchResult = await gatewayDispatcher.dispatch({
          deviceId,
          organizationId: String(user.organizationId),
          commandId: String(command._id),
          command: {
            deviceId,
            deviceCode: device.deviceCode,
            deviceType: device.type,
            commandType,
            payload,
          },
        });

        await applyDispatchResult(String(command._id), dispatchResult);

        const updatedCommand = await Command.findById(command._id).lean();

        if (dispatchResult.status === "success") {
          await auditDeviceCommand(
            user.id,
            deviceId,
            commandType,
            "SUCCESS",
            String(user.organizationId)
          );
        } else if (dispatchResult.status === "failed") {
          await auditDeviceCommand(
            user.id,
            deviceId,
            commandType,
            "FAILURE",
            String(user.organizationId),
            {
              reason: dispatchResult.message,
              code: dispatchResult.code,
            }
          );
        }

        res.status(201).json({
          commandId: String(updatedCommand?._id ?? command._id),
          deviceId,
          type: commandType,
          status: updatedCommand?.status ?? "pending",
          command: updatedCommand,
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[COMMANDS] Failed to process device command:", err);

        await auditDeviceCommand(user.id, deviceId, commandType, "FAILURE", String(user.organizationId), {
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

      const passwordMatches = await bcrypt.compare(
        password,
        user.passwordHash
      );

      if (!passwordMatches) {
        res.status(401).json({
          result: "failed",
          message: "Email or password is incorrect.",
        });
        return;
      }

      const now = new Date();

      const accessToken = jwt.sign(
        {
          sub: String(user._id),
          role: user.role,
          organizationId: user.organizationId
            ? String(user.organizationId)
            : undefined,
        },
        process.env.JWT_ACCESS_SECRET as string,
        {
          expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
        }
      );

      const refreshToken = jwt.sign(
        {
          sub: String(user._id),
          type: "refresh",
        },
        process.env.JWT_REFRESH_SECRET as string,
        {
          expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
        }
      );

      const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

      const match = refreshExpiresIn.match(/^(\d+)([smhd])$/);

      if (!match) {
        throw new Error(
          "Invalid JWT_REFRESH_EXPIRES_IN format. Use values such as 7d, 24h, 60m."
        );
      }

      const amount = Number(match[1]);
      const unit = match[2];

      const millisecondsPerUnit: Record<string, number> = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
      };

      const expiresAt = new Date(
        now.getTime() + amount * millisecondsPerUnit[unit]
      );

      const session = await Session.create({
        userId: user._id,
        refreshToken: hashRefreshToken(refreshToken),
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        expiresAt,
      });

      user.lastLoginAt = now;
      await user.save();

      res.json({
        result: "success",
        session: {
          sessionId: String(session._id),
          accountId: String(user._id),
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
          createdAt: session.createdAt
            ? new Date(session.createdAt).toISOString()
            : now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          lastActivityAt: now.toISOString(),
          status: "active",
          mfaVerified: !user.mfaEnabled,
          loginMethod: "password",
          countryCode: undefined,
        },
        token: {
          accessToken,
          refreshToken,
          expiresIn: 15 * 60,
          tokenType: "Bearer",
        },
        message: "Login successful.",
      });
    } catch (err) {
      console.error("[AUTH] Password login failed:", err);

      res.status(500).json({
        result: "failed",
        message: "Login failed due to a server error.",
      });
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
        await auditDeviceCommand(user.id, "settings", "UPDATE_SETTINGS", "SUCCESS", String(user.organizationId));
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
    const user = req.user!;
    if (!user.organizationId) {
      res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
      return;
    }
    try {
      const device = await Device.findOne({
        _id: req.params.id,
        organizationId: user.organizationId,
      }).lean();
      if (!device) {
        res.status(404).json({ error: "DEVICE_NOT_FOUND" });
        return;
      }
      res.json({ device });
    } catch (err) {
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load device state." });
    }
  });

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


  // GET /api/commands/recent — latest dispatched commands across the
  // org, for "Live Control Activity" style feeds. Joins through Device
  // since Command has no organizationId of its own.
  // GET /api/commands/:id — single command status for polling.
  // Command ownership is verified through the user's organization.
  app.get("/api/commands/:id", authenticate, requirePermission("device:read"), async (req, res) => {
    const user = req.user!;
    if (!user.organizationId) {
      res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
      return;
    }

    try {
      const command = await Command.findById(req.params.id).lean();
      if (!command) {
        res.status(404).json({ error: "COMMAND_NOT_FOUND", message: "Command not found." });
        return;
      }

      const device = await Device.findOne({
        _id: command.deviceId,
        organizationId: user.organizationId,
      }).lean();

      if (!device) {
        res.status(404).json({ error: "COMMAND_NOT_FOUND", message: "Command not found." });
        return;
      }

      res.json(command);
    } catch (err) {
      console.error("[COMMANDS] Failed to load command status:", err);
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load command status." });
    }
  });

  // GET /api/security/threats — list threat detections for the org

  // POST /api/security/threats — create a threat detection (manual entry or
  // future automated monitor). Requires org:manage since this writes security data.
  app.post(
    "/api/security/threats",
    authenticate,
    requirePermission("org:manage"),
    async (req, res) => {
      const user = req.user!;
      if (!user.organizationId) {
        res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
        return;
      }
      const { type, severity, deviceId, ipAddress, description, requiresReview } = req.body ?? {};
      if (!type || !severity || !description) {
        res.status(400).json({
          error: "BAD_REQUEST",
          message: "type, severity, and description are required.",
        });
        return;
      }
      try {
        const threat = await ThreatDetection.create({
          type,
          severity,
          deviceId,
          ipAddress,
          description,
          organizationId: user.organizationId,
          requiresReview: requiresReview ?? true,
        });
        res.status(201).json({ threat });
      } catch (err) {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to create threat." });
      }
    }
  );

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

  // GET /api/safety/rules — list safety rules for the user's organization
  app.get(
    "/api/safety/rules",
    authenticate,
    requirePermission("org:read"),
    async (req, res) => {
      const user = req.user!;
      if (!user.organizationId) {
        res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
        return;
      }
      try {
        const rules = await SafetyRule.find({ organizationId: user.organizationId }).lean();
        res.json({ rules, total: rules.length });
      } catch (err) {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load safety rules." });
      }
    }
  );

  // GET /api/gateways — list all gateways
  app.get(
    "/api/gateways",
    authenticate,
    requirePermission("org:read"),
    async (req, res) => {
      const user = req.user!;
      if (!user.organizationId) {
        res.status(400).json({
          error: "BAD_REQUEST",
          message: "No organizationId on user.",
        });
        return;
      }

      try {
        const gatewayIds = await Device.find({
          organizationId: user.organizationId,
          gatewayId: { $ne: null },
        }).distinct("gatewayId");

        const gateways = await Gateway.find({
          _id: { $in: gatewayIds },
        }).lean();

        res.json({ gateways, total: gateways.length });
      } catch (err) {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load gateways." });
      }
    }
  );


  // GET /api/audit/events — AuditLog entries reshaped for AuditView.tsx
  // (audit.log.ts writes AuditLog docs; this maps them to the
  // { id, actor, action, target, result, category, ip, timestamp }
  // shape the frontend's AuditEventEntry expects.)
  app.get(
    "/api/audit/events",
    authenticate,
    requirePermission("org:read"),
    async (req, res) => {
      const user = req.user!;
      if (!user.organizationId) {
        res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
        return;
      }
      const limit = Math.min(Number(req.query.limit) || 200, 500);
      try {
        const logs = await AuditLog.find({ organizationId: user.organizationId })
          .sort({ createdAt: -1 })
          .limit(limit)
          .populate("userId", "email")
          .lean();

        const RESULT_MAP: Record<string, string> = {"SUCCESS":"success","BLOCKED":"denied","FAILURE":"error"};

        const categoryOf = (action: string) => {
          const prefix = String(action).split(":")[0];
          if (prefix === "auth") return "auth";
          if (prefix === "device") return "device";
          if (prefix === "safety") return "safety";
          if (prefix === "settings" || prefix === "org") return "admin";
          return "network";
        };

        const events = logs.map((log) => ({
          id: String(log._id),
          actor: log.userId && typeof log.userId === "object" ? log.userId.email : "system",
          action: log.action,
          target: log.deviceId ? String(log.deviceId) : (log.reason || log.action),
          result: RESULT_MAP[log.result] || "error",
          category: categoryOf(log.action),
          ip: log.ip || "",
          timestamp: log.createdAt,
        }));

        res.json({ events, total: events.length });
      } catch (err) {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load audit events." });
      }
    }
  );

  // GET /api/audit/logs — list audit log entries for the user's organization
  app.get(
    "/api/audit/logs",
    authenticate,
    requirePermission("org:read"),
    async (req, res) => {
      const user = req.user!;
      if (!user.organizationId) {
        res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
        return;
      }
      const limit = Math.min(Number(req.query.limit) || 50, 200);
      try {
        const logs = await AuditLog.find({ organizationId: user.organizationId })
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean();
        res.json({ logs, total: logs.length });
      } catch (err) {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load audit logs." });
      }
    }
  );

  // GET /api/protocols — list all protocol adapters
  app.get(
    "/api/protocols",
    authenticate,
    requirePermission("org:read"),
    async (req, res) => {
      try {
        const protocols = await Protocol.find().lean();
        res.json({ protocols, total: protocols.length });
      } catch (err) {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load protocols." });
      }
    }
  );

  // GET /api/identity/account — returns the authenticated user's own account
  app.get(
    "/api/identity/account",
    authenticate,
    async (req, res) => {
      const user = req.user!;
      try {
        const account = await User.findById(user.id).select("-passwordHash").lean();
        if (!account) {
          res.status(404).json({ error: "NOT_FOUND" });
          return;
        }
        res.json({ account });
      } catch (err) {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load account." });
      }
    }
  );

  // GET /api/notifications — list notifications for the authenticated user
  app.get(
    "/api/notifications",
    authenticate,
    async (req, res) => {
      const user = req.user!;
      try {
        const notifications = await Notification.find({ accountId: user.id })
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();
        const unreadCount = await Notification.countDocuments({ accountId: user.id, isRead: false });
        res.json({ notifications, unreadCount, total: notifications.length });
      } catch (err) {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load notifications." });
      }
    }
  );

  // GET /api/international/countries — list all countries
  app.get(
    "/api/international/countries",
    async (req, res) => {
      try {
        const countries = await Country.find().lean();
        res.json({ countries, total: countries.length });
      } catch (err) {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load countries." });
      }
    }
  );

  // GET /api/automation/rules — list automation rules for the user's organization
  app.get(
    "/api/automation/rules",
    authenticate,
    requirePermission("org:read"),
    async (req, res) => {
      const user = req.user!;
      if (!user.organizationId) {
        res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
        return;
      }
      try {
        const rules = await AutomationRule.find({ organizationId: user.organizationId }).lean();
        res.json({ rules, total: rules.length });
      } catch (err) {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load automation rules." });
      }
    }
  );

  // GET /api/discovery/devices — list recently discovered (unpaired) devices
  app.get(
    "/api/discovery/devices",
    authenticate,
    requirePermission("device:read"),
    async (req, res) => {
      const user = req.user!;
      if (!user.organizationId) {
        res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
        return;
      }
      try {
        const deviceIds = await Device.find({
          organizationId: user.organizationId,
        }).distinct("_id");

        const discovered = await Discovery.find({
          deviceId: { $in: deviceIds },
        })
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();

        res.json({ devices: discovered, total: discovered.length });
      } catch (err) {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load discovered devices." });
      }
    }
  );

  // GET /api/international/languages — list all supported languages
  app.get(
    "/api/international/languages",
    async (req, res) => {
      try {
        const languages = await Language.find().lean();
        res.json({ languages, total: languages.length });
      } catch (err) {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load languages." });
      }
    }
  );

  // GET /api/safety/events — list recent safety log events
  app.get(
    "/api/safety/events",
    authenticate,
    requirePermission("org:read"),
    async (req, res) => {
      const user = req.user!;
      if (!user.organizationId) {
        res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
        return;
      }
      try {
        const deviceIds = await Device.find({
          organizationId: user.organizationId,
        }).distinct("_id");

        const events = await SafetyLog.find({
          deviceId: { $in: deviceIds },
        })
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();

        res.json({ events, total: events.length });
      } catch (err) {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load safety events." });
      }
    }
  );

  // GET /api/telemetry/devices/:id — telemetry/log history for a device
  app.get(
    "/api/telemetry/devices/:id",
    authenticate,
    requirePermission("device:read"),
    async (req, res) => {
      const user = req.user!;
      if (!user.organizationId) {
        res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
        return;
      }
      try {
        const device = await Device.findOne({
          _id: req.params.id,
          organizationId: user.organizationId,
        })
          .select({ _id: 1 })
          .lean();

        if (!device) {
          res.status(404).json({ error: "DEVICE_NOT_FOUND" });
          return;
        }

        const logs = await DeviceLog.find({ deviceId: device._id })
          .sort({ createdAt: -1 })
          .limit(100)
          .lean();

        res.json({ logs, total: logs.length });
      } catch (err) {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load device telemetry." });
      }
    }
  );

  // GET /api/billing/invoices — list invoices for the user's organization
  app.get(
    "/api/billing/invoices",
    authenticate,
    requirePermission("org:read"),
    async (req, res) => {
      const user = req.user!;
      if (!user.organizationId) {
        res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
        return;
      }
      try {
        const invoices = await Invoice.find({ organizationId: user.organizationId }).sort({ issuedAt: -1 }).lean();
        res.json({ invoices, total: invoices.length });
      } catch (err) {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load invoices." });
      }
    }
  );

  // GET /api/billing/subscriptions — current subscription for the organization
  app.get(
    "/api/billing/subscriptions",
    authenticate,
    requirePermission("org:read"),
    async (req, res) => {
      const user = req.user!;
      if (!user.organizationId) {
        res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
        return;
      }
      try {
        const subscription = await OrganizationSubscription.findOne({ organizationId: user.organizationId }).lean();
        res.json({ subscription });
      } catch (err) {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load subscription." });
      }
    }
  );

  // PUT /api/billing/subscriptions/:id — upgrade or downgrade the plan
  app.put(
    "/api/billing/subscriptions/:id",
    authenticate,
    requirePermission("org:manage"),
    async (req, res) => {
      const user = req.user!;
      const { planId } = req.body || {};

      const planDeviceLimits: Record<string, number> = {"free":5,"pro":50,"enterprise":9999};
      if (!planId || !(planId in planDeviceLimits)) {
        res.status(400).json({ error: "BAD_REQUEST", message: `planId must be one of: ${Object.keys(planDeviceLimits).join(", ")}` });
        return;
      }

      try {
        const subscription = await OrganizationSubscription.findOne({
          _id: req.params.id,
          organizationId: user.organizationId,
        });
        if (!subscription) {
          res.status(404).json({ error: "NOT_FOUND", message: "Subscription not found." });
          return;
        }

        const newLimit = planDeviceLimits[planId];
        const deviceCount = await Device.countDocuments({ organizationId: user.organizationId });
        if (deviceCount > newLimit) {
          res.status(400).json({
            error: "DEVICE_LIMIT_EXCEEDED",
            message: `Cannot downgrade to '${planId}' (limit ${newLimit}): organization has ${deviceCount} devices. Archive/remove devices first.`,
          });
          return;
        }

        subscription.planId = planId;
        await subscription.save();

        res.json({ subscription });
      } catch (err) {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to update subscription." });
      }
    }
  );

  // POST /api/billing/subscriptions — subscribe the organization to a plan
  app.post(
    "/api/billing/subscriptions",
    authenticate,
    requirePermission("org:manage"),
    async (req, res) => {
      const user = req.user!;
      const { planId } = req.body || {};

      if (!user.organizationId) {
        res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
        return;
      }
      const validPlanIds = ["free","pro","enterprise"];
      if (!planId || !validPlanIds.includes(planId)) {
        res.status(400).json({ error: "BAD_REQUEST", message: `planId must be one of: ${validPlanIds.join(", ")}` });
        return;
      }

      try {
        const existing = await OrganizationSubscription.findOne({ organizationId: user.organizationId });
        if (existing) {
          res.status(400).json({ error: "BAD_REQUEST", message: "Organization already has a subscription. Use PUT to change plans." });
          return;
        }

        const renewalDate = new Date();
        renewalDate.setMonth(renewalDate.getMonth() + 1);

        const subscription = await OrganizationSubscription.create({
          organizationId: user.organizationId,
          planId,
          status: "active",
          renewalDate,
        });

        res.status(201).json({ subscription });
      } catch (err) {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to create subscription." });
      }
    }
  );



  // POST /api/v1/ai/interpret — AI Orchestration (MOCK)
  // NOTE: no AI provider API key is configured yet. This uses a simple
  // keyword-matching stub so the pipeline (auth -> session -> audit) can
  // be built and tested now, and swapped for a real model call later
  // without changing the route contract.
  app.post(
    "/api/v1/ai/interpret",
    authenticate,
    requirePermission("device:read"),
    async (req, res) => {
      const user = req.user!;
      const { naturalLanguageInput, sessionId } = req.body || {};

      if (!naturalLanguageInput || typeof naturalLanguageInput !== "string") {
        res.status(400).json({ error: "BAD_REQUEST", message: "naturalLanguageInput is required." });
        return;
      }

      try {
        // --- MOCK interpretation logic (keyword match only) ---
        const text = naturalLanguageInput.toLowerCase();
        const requiresClarification = !(text.includes("turn on") || text.includes("turn off") || text.includes("status"));

        const result = {
          requestId: `mock-${Date.now()}`,
          confidence: requiresClarification ? 0.3 : 0.6,
          structuredCommand: requiresClarification
            ? undefined
            : { deviceId: "UNKNOWN", commandType: text.includes("turn off") ? "POWER_OFF" : "POWER_ON" },
          requiresClarification,
          ambiguityOptions: requiresClarification
            ? [{ label: "Please specify a device and action.", structuredCommand: null }]
            : undefined,
        };

        // Persist / append to conversation session
        let session;
        if (sessionId) {
          session = await AIConversationSession.findOne({ _id: sessionId, accountId: user.id });
        }
        if (!session) {
          session = new AIConversationSession({
            accountId: user.id,
            organizationId: user.organizationId,
            turns: [],
            expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
          });
        }
        session.turns.push({ role: "user", text: naturalLanguageInput, createdAt: new Date() });
        session.turns.push({ role: "assistant", text: JSON.stringify(result), createdAt: new Date() });
        await session.save();

        res.json({ ...result, sessionId: String(session._id) });
      } catch (err) {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to interpret input." });
      }
    }
  );


  // GET /api/v1/ai/sessions/:id — fetch one AI conversation session
  app.get(
    "/api/v1/ai/sessions/:id",
    authenticate,
    requirePermission("device:read"),
    async (req, res) => {
      const user = req.user!;
      try {
        const session = await AIConversationSession.findOne({
          _id: req.params.id,
          accountId: user.id,
        }).lean();
        if (!session) {
          res.status(404).json({ error: "NOT_FOUND", message: "Session not found." });
          return;
        }
        res.json({ session });
      } catch (err) {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load session." });
      }
    }
  );

  // DELETE /api/v1/ai/sessions/:id — delete a session (privacy)
  app.delete(
    "/api/v1/ai/sessions/:id",
    authenticate,
    requirePermission("device:read"),
    async (req, res) => {
      const user = req.user!;
      try {
        const result = await AIConversationSession.deleteOne({
          _id: req.params.id,
          accountId: user.id,
        });
        if (result.deletedCount === 0) {
          res.status(404).json({ error: "NOT_FOUND", message: "Session not found." });
          return;
        }
        res.status(204).send();
      } catch (err) {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to delete session." });
      }
    }
  );


  // POST /api/v1/ai/interpret/confirm — user confirms an ambiguous
  // AI interpretation by picking one of the ambiguityOptions returned
  // from /api/v1/ai/interpret.
  app.post(
    "/api/v1/ai/interpret/confirm",
    authenticate,
    requirePermission("device:read"),
    async (req, res) => {
      const user = req.user!;
      const { sessionId, structuredCommand } = req.body || {};

      if (!sessionId || !structuredCommand || typeof structuredCommand !== "object") {
        res.status(400).json({ error: "BAD_REQUEST", message: "sessionId and structuredCommand are required." });
        return;
      }
      if (!structuredCommand.deviceId || !structuredCommand.commandType) {
        res.status(400).json({ error: "BAD_REQUEST", message: "structuredCommand must include deviceId and commandType." });
        return;
      }

      try {
        const session = await AIConversationSession.findOne({ _id: sessionId, accountId: user.id });
        if (!session) {
          res.status(404).json({ error: "NOT_FOUND", message: "Session not found." });
          return;
        }

        // NOTE: this only records the confirmation. Actually dispatching
        // structuredCommand through the Command Pipeline (authenticate ->
        // authorize -> safety -> execute -> audit) is a separate step,
        // shared with manually typed commands — not duplicated here.
        session.turns.push({
          role: "user",
          text: `[confirmed] ${JSON.stringify(structuredCommand)}`,
          createdAt: new Date(),
        });
        await session.save();

        res.json({ confirmed: true, structuredCommand, sessionId: String(session._id) });
      } catch (err) {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to confirm interpretation." });
      }
    }
  );


  // GET /api/v1/ai/models — list AI model profiles the org may use
  // NOTE: static list for now (no AIModelProfile DB table yet — no real
  // provider is configured). Only "internal" (the mock interpreter) is
  // enabled. Swap for a DB-backed list once Anthropic/OpenAI keys exist.
  app.get(
    "/api/v1/ai/models",
    authenticate,
    requirePermission("device:read"),
    async (_req, res) => {
      const models = [
        {
          modelId: "internal-mock-v1",
          provider: "internal",
          version: "1.0.0-mock",
          allowedScopes: ["device:read"],
          isEnabled: true,
        },
        {
          modelId: "anthropic-claude",
          provider: "anthropic",
          version: "not-configured",
          allowedScopes: [],
          isEnabled: false,
        },
        {
          modelId: "openai-gpt",
          provider: "openai",
          version: "not-configured",
          allowedScopes: [],
          isEnabled: false,
        },
      ];
      res.json({ models });
    }
  );


  // POST /api/v1/ai/models/:id/enable — Admin: toggle a model's enabled flag
  // NOTE: models are a static in-memory list for now (no AIModelProfile DB
  // table — no real provider configured yet). "internal-mock-v1" cannot be
  // disabled since it is the only working interpreter right now.
  app.post(
    "/api/v1/ai/models/:id/enable",
    authenticate,
    requireMinRole("OrgAdmin"),
    async (req, res) => {
      const rawId = req.params.id;
      if (typeof rawId !== "string") {
        res.status(400).json({ error: "INVALID_MODEL_ID" });
        return;
      }
      const id = rawId;
      const { isEnabled } = req.body || {};

      if (typeof isEnabled !== "boolean") {
        res.status(400).json({ error: "BAD_REQUEST", message: "isEnabled (boolean) is required." });
        return;
      }

      const knownModelIds = ["internal-mock-v1", "anthropic-claude", "openai-gpt"];
      if (!knownModelIds.includes(id)) {
        res.status(404).json({ error: "NOT_FOUND", message: "Unknown modelId." });
        return;
      }
      if (id === "internal-mock-v1" && !isEnabled) {
        res.status(400).json({ error: "BAD_REQUEST", message: "internal-mock-v1 cannot be disabled (no other provider is configured)." });
        return;
      }
      if ((id === "anthropic-claude" || id === "openai-gpt") && isEnabled) {
        res.status(400).json({ error: "BAD_REQUEST", message: `${id} has no API key configured yet and cannot be enabled.` });
        return;
      }

      // NOTE: no persistence yet (static list) — this confirms the request
      // is valid and well-formed. Once AIModelProfile is a real DB model,
      // this will update it and return the new state.
      res.json({ modelId: id, isEnabled, persisted: false });
    }
  );

  app.get("/api/dashboard/stats", authenticate, requirePermission("device:read"), async (req, res) => {
    const user = req.user!;
    if (!user.organizationId) { res.status(400).json({ error: "BAD_REQUEST" }); return; }
    try {
      const orgId = user.organizationId;
      const totalDevices = await Device.countDocuments({ organizationId: orgId });
      const onlineDevices = await Device.countDocuments({ organizationId: orgId, status: "online" });
      const safetyRules = await SafetyRule.countDocuments({ organizationId: orgId, isEnabled: true });
      const gatewayIds = await Device.find({ organizationId: orgId, gatewayId: { $ne: null } }).distinct("gatewayId");
      const gateways = await Gateway.countDocuments({ _id: { $in: gatewayIds }, status: "online" });
      const warningDevices = await Device.countDocuments({ organizationId: orgId, status: "warning" });
      res.json({ totalDevices, onlineDevices, safetyRules, gateways, warningDevices });
    } catch (err) {
      res.status(500).json({ error: "INTERNAL_ERROR" });
    }
  });


  // GET /api/v1/ai/usage — AI interpretation usage stats for the account
  // NOTE: derived from AIConversationSession.turns (no separate usage
  // table yet). Counts "user" turns as interpretation requests made.
  app.get(
    "/api/v1/ai/usage",
    authenticate,
    requirePermission("device:read"),
    async (req, res) => {
      const user = req.user!;
      try {
        const sessions = await AIConversationSession.find({ accountId: user.id })
          .select("turns createdAt")
          .lean();

        let totalRequests = 0;
        let lastRequestAt = null;
        for (const session of sessions) {
          for (const turn of session.turns) {
            if (turn.role === "user") {
              totalRequests += 1;
              if (!lastRequestAt || turn.createdAt > lastRequestAt) {
                lastRequestAt = turn.createdAt;
              }
            }
          }
        }

        res.json({
          accountId: String(user.id),
          totalSessions: sessions.length,
          totalInterpretationRequests: totalRequests,
          lastRequestAt,
        });
      } catch (err) {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load usage stats." });
      }
    }
  );


  // POST /api/v1/ai/feedback — user feedback on an AI interpretation result
  // (helps track/improve accuracy over time). Stored as an AuditLog entry
  // since there is no dedicated feedback table yet.
  app.post(
    "/api/v1/ai/feedback",
    authenticate,
    requirePermission("device:read"),
    async (req, res) => {
      const user = req.user!;
      const { sessionId, requestId, rating, comment } = req.body || {};

      if (!requestId || typeof requestId !== "string") {
        res.status(400).json({ error: "BAD_REQUEST", message: "requestId is required." });
        return;
      }
      if (rating !== "positive" && rating !== "negative") {
        res.status(400).json({ error: "BAD_REQUEST", message: "rating must be 'positive' or 'negative'." });
        return;
      }

      try {
        await AuditLog.create({
          userId: user.id,
          organizationId: user.organizationId,
          action: "ai.feedback.submitted",
          result: "SUCCESS",
          reason: rating,
          details: JSON.stringify({ requestId, sessionId, comment: comment || null }),
        });

        res.status(201).json({ recorded: true, requestId, rating });
      } catch (err) {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to record feedback." });
      }
    }
  );


  // GET /api/billing/plans — list available subscription plans
  // NOTE: static list for now (no SubscriptionPlan DB table yet — plans
  // are fixed tiers, not per-organization data).
  app.get(
    "/api/billing/plans",
    authenticate,
    requirePermission("org:read"),
    async (_req, res) => {
      const plans = [
        { planId: "free", name: "Free", tier: "free", deviceLimit: 5, priceMonthly: 0, currency: "USD" },
        { planId: "pro", name: "Pro", tier: "pro", deviceLimit: 50, priceMonthly: 49, currency: "USD" },
        { planId: "enterprise", name: "Enterprise", tier: "enterprise", deviceLimit: 9999, priceMonthly: 499, currency: "USD" },
      ];
      res.json({ plans });
    }
  );

  // POST /api/authz/check
  app.post(
    "/api/authz/check",
    authenticate,
    async (req, res) => {
      const user = req.user!;
      const { resourceType, resourceId, action } = req.body ?? {};

      if (!resourceType || !resourceId || !action) {
        res.status(400).json({ error: "BAD_REQUEST", message: "resourceType, resourceId, and action are required." });
        return;
      }

      let allowed = false;
      let reason = "Resource not in user's organization.";

      if (resourceType === "organization" && resourceId === user.organizationId) {
        allowed = true;
        reason = "Resource belongs to user's organization.";
      } else if (resourceType === "device") {
        const device = await Device.findOne({ _id: resourceId, organizationId: user.organizationId }).lean();
        if (device) {
          allowed = true;
          reason = "Device belongs to user's organization.";
        }
      }

      res.json({ allowed, reason });
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
