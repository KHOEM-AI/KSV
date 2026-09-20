/**
 * KSV - Backend Server Entry Point
 * Run with: npm run server
 */
// MUST load dotenv before modules that read process.env.
// other modules (connection.ts, auth.middleware.ts, rate-limiter.ts) read process.env.DATABASE_URL / JWT_ACCESS_SECRET / etc.
// other module (connection.ts, auth.middleware.ts, rate-limiter.ts)
// reads process.env.DATABASE_URL / JWT_ACCESS_SECRET / etc.
import "dotenv/config";
import { interpretIntent } from "./core/ai/khoem-ai-brain.ts";
import express from "express";
import cors from "cors";
import { connectDatabase } from "./infrastructure/database/connection.ts";
import { Certificate, Command, Device, Settings, ThreatDetection, SecurityIncident, Organization, Site, Building, Room, SafetyRule, Gateway, GatewayProvisioningToken, AuditLog, Protocol, Notification, Country, AutomationRule, Discovery, Language, SafetyLog, DeviceLog, OrganizationSubscription, Invoice, AIConversationSession, PaymentMethod } from "./infrastructure/database/models.ts";
import { User, Session, MFAChallenge, PairingSession, AutomationScene, RecoverySession } from "./infrastructure/database/models.ts";
import { authenticate } from "./core/auth/auth.middleware.ts";
import { requirePermission, requireMinRole } from "./core/auth/rbac.policy.ts";
import { deviceCommandRateLimiter, authRateLimiter } from "./core/security/rate-limiter.ts";
import { evaluateSafetyForDevice } from "./core/safety/safety.engine.ts";
import { auditDeviceCommand } from "./core/security/audit.log.ts";
import { DefaultGatewayDispatcher } from "./core/gateway/gateway.dispatcher.ts";
import { startMqttClient } from "./infrastructure/mqtt/client.ts";
import { applyDispatchResult } from "./core/gateway/command.lifecycle.ts";
import { startAutomationEngine } from "./core/automation/automation.engine.ts";
import { evaluateSelfDefense } from "./core/ai/khoem-ai-brain.ts";
import { generateSecureToken } from "./core/security/encryption.util.ts";
import bcrypt from "bcryptjs";
import { encryptField as encMfa, decryptField as decMfa } from "./core/security/encryption.util.ts";

// MFA secrets are stored encrypted ("iv:tag:cipher"). Old plaintext secrets
// (base32, no ":") are still accepted so existing users keep working.
function readMfaSecret(stored: string | null | undefined): string {
  if (!stored) throw new Error("mfaSecret missing");
  return stored.includes(":") ? decMfa(stored) : stored;
}
import jwt from "jsonwebtoken";
import * as otplib from "otplib";
import crypto from "node:crypto";
import mongoose from "mongoose";
import { GLOBAL_195_VOCABULARY_30K as GLOBAL_195_VOCABULARY } from "./core/ai/patterns/global-195-vocabulary.ts";
import { guardRespectfulResponse } from "./core/ai/khoem-ai-conduct.ts";

function hashRefreshToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function maskDestination(value?: string): string | undefined {
  if (!value) return undefined;
  if (value.includes("@")) {
    const [name, domain] = value.split("@");
    return `${name.slice(0, 1)}***@${domain}`;
  }
  return `***${value.slice(-3)}`;
}


const PORT = process.env.PORT || 3000;
const KSV_CLOUD_ENDPOINT = process.env.KSV_CLOUD_ENDPOINT;


async function toKSVOrganization(org: Record<string, unknown>): Promise<Record<string, unknown>> {
  const orgId = org._id;
  const ownerId = org.ownerId;
  const [memberCount, siteCount, deviceCount] = await Promise.all([
    User.countDocuments({ organizationId: orgId }),
    Site.countDocuments({ organizationId: orgId }),
    Device.countDocuments({ organizationId: orgId }),
  ]);
  const createdAt = org.createdAt instanceof Date ? org.createdAt : new Date();
  const updatedAt = org.updatedAt instanceof Date ? org.updatedAt : new Date();
  return {
    orgId: String(orgId),
    name: org.name ?? "",
    type: "company",
    countryCode: org.country ?? "",
    timezone: org.timezone ?? "UTC",
    primaryLanguage: "en",
    ownerAccountId: String(ownerId),
    memberCount,
    siteCount,
    deviceCount,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    isActive: true,
  };
}

async function toKSVSite(site: Record<string, unknown>): Promise<Record<string, unknown>> {
  const siteId = site._id;
  const orgId = site.organizationId;
  const [buildingCount, deviceCount] = await Promise.all([
    Promise.resolve(0),
    Device.countDocuments({ siteId }),
  ]);
  const createdAt = site.createdAt instanceof Date ? site.createdAt : new Date();
  return {
    siteId: String(siteId),
    orgId: String(orgId),
    name: site.name ?? "",
    type: site.type ?? "office",
    address: site.address ?? undefined,
    countryCode: site.country ?? undefined,
    timezone: site.timezone ?? undefined,
    buildingCount,
    deviceCount,
    isActive: site.isActive ?? true,
    createdAt: createdAt.toISOString(),
  };
}

function mapUserRoleToMemberRole(role: string): string {
  const r = (role || "").toLowerCase();
  if (r === "owner") return "owner";
  if (r === "orgadmin" || r === "superadmin") return "admin";
  if (r === "manager") return "manager";
  if (r === "operator" || r === "controller") return "operator";
  if (r === "guest") return "guest";
  return "viewer";
}

function toKSVOrgMember(user: Record<string, unknown>): Record<string, unknown> {
  const memberId = user._id;
  const firstName = (user.firstName as string) || "";
  const lastName = (user.lastName as string) || "";
  const email = (user.email as string) || "";
  const displayName = `${firstName} ${lastName}`.trim() || email;
  const createdAt = user.createdAt instanceof Date ? user.createdAt : new Date();
  const lastLoginAt = user.lastLoginAt instanceof Date ? user.lastLoginAt : undefined;
  return {
    memberId: String(memberId),
    orgId: String(user.organizationId ?? ""),
    accountId: String(memberId),
    displayName,
    email: email || undefined,
    role: mapUserRoleToMemberRole((user.role as string) || "Viewer"),
    joinedAt: createdAt.toISOString(),
    invitedBy: "system",
    isActive: user.isActive ?? true,
    lastActivityAt: lastLoginAt ? lastLoginAt.toISOString() : undefined,
  };
}

async function toKSVBuilding(b: Record<string, unknown>): Promise<Record<string, unknown>> {
  const buildingId = b._id;
  const siteId = b.siteId;
  const orgId = b.organizationId;
  const [roomCount, deviceCount] = await Promise.all([
    Room.countDocuments({ buildingId }),
    Device.countDocuments({ buildingId }),
  ]);
  const createdAt = b.createdAt instanceof Date ? b.createdAt : new Date();
  return {
    buildingId: String(buildingId),
    siteId: String(siteId),
    orgId: String(orgId),
    name: b.name ?? "",
    type: b.type ?? "main",
    floorCount: b.floorCount ?? 1,
    roomCount,
    deviceCount,
    isActive: b.isActive ?? true,
    createdAt: createdAt.toISOString(),
  };
}

async function toKSVRoom(r: Record<string, unknown>): Promise<Record<string, unknown>> {
  const roomId = r._id;
  const deviceCount = await Device.countDocuments({ roomId });
  return {
    roomId: String(roomId),
    buildingId: String(r.buildingId),
    siteId: String(r.siteId),
    orgId: String(r.organizationId),
    name: r.name ?? "",
    floor: r.floor ?? 0,
    deviceCount,
    isActive: r.isActive ?? true,
  };
}

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
    } catch {
      res.status(500).json({ error: "Failed to load certificates" });
    }
  });

  // GET /api/health — lightweight health check
  app.get("/api/vocabulary", (_req, res) => { res.json({ total: GLOBAL_195_VOCABULARY.length, data: GLOBAL_195_VOCABULARY }); });
  app.get("/api/vocabulary/:language", (req, res) => { const filtered = GLOBAL_195_VOCABULARY.filter((entry) => entry.language === req.params.language); res.json({ language: req.params.language, total: filtered.length, data: filtered }); });

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // GET /api/version — server version info
  app.get("/api/version", (_req, res) => {
    res.json({
      name: "KSV API",
      version: "1.0.0",
      node: process.version,
      env: process.env.NODE_ENV ?? "development",
    });
  });

  // POST /api/certificates — create one
  app.post("/api/certificates", async (req, res) => {
    try {
      const cert = await Certificate.create(req.body);
      res.status(201).json({ certificate: cert });
    } catch {
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

      // KHOEM-AI Brain — rule-based request pattern check (injection
      // signatures in the payload). Runs alongside, not instead of,
      // rbac/rate-limiter/safety.engine. See khoem-ai-brain.ts for scope.
      const brain = evaluateSelfDefense({ text: JSON.stringify(payload ?? {}), source: "user_input" });
      if (brain.protected) {
        await auditDeviceCommand(user.id, deviceId, commandType, "BLOCKED", String(user.organizationId ?? ""), {
          reason: brain.reason,
        }, {
          matchedSignatures: brain.riskFactors.map((f) => f.code),
        });
        res.status(400).json({
          error: "REQUEST_PATTERN_BLOCKED",
          message: "Request blocked by pattern analysis.",
          reasons: [brain.reason],
        });
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
        // KSV-ESTOP-GUARD: refuse commands while an emergency stop is active (fail closed)
        {
          const stopFilter: Record<string, unknown> = {
            organizationId: user.organizationId,
            releasedAt: { $exists: false },
          };
          stopFilter.$or = mongoose.isValidObjectId(deviceId)
            ? [{ scope: "organization" }, { deviceId }]
            : [{ scope: "organization" }];
          const activeStop = await EmergencyStop.findOne(stopFilter).lean();
          if (activeStop) {
            const stoppedCommand = await Command.create({
              deviceId,
              userId: user.id,
              type: commandType,
              payload,
              status: "blocked",
              response: { reason: "Emergency stop active: " + activeStop.reason, ruleName: "EMERGENCY_STOP" },
              sentAt: new Date(),
              completedAt: new Date(),
            });
            await auditDeviceCommand(user.id, deviceId, commandType, "BLOCKED", String(user.organizationId), {
              reason: "Emergency stop active",
            });
            res.status(423).json({
              error: "EMERGENCY_STOP_ACTIVE",
              message: "Emergency stop is active. Commands are blocked.",
              commandId: stoppedCommand._id,
            });
            return;
          }
        }

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
        console.error("[COMMANDS] Failed to process device command:", err);

        await auditDeviceCommand(user.id, deviceId, commandType, "FAILURE", String(user.organizationId), {
          reason: "Internal error while processing command.",
        });

        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to process command." });
      }
    }
  );


  // ===== KSV-AUTH-SESSIONS (added 2026-09-20) =====
  function authSignAccess(user: { _id: unknown; role: string; organizationId?: unknown }): string {
    return jwt.sign(
      {
        sub: String(user._id),
        role: user.role,
        organizationId: user.organizationId ? String(user.organizationId) : undefined,
      },
      process.env.JWT_ACCESS_SECRET as string,
      { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as jwt.SignOptions["expiresIn"] }
    );
  }

  function authSessionView(s: any, mfaVerified: boolean) {
    return {
      sessionId: String(s._id),
      accountId: String(s.userId),
      ipAddress: s.ip,
      userAgent: s.userAgent,
      createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : undefined,
      expiresAt: new Date(s.expiresAt).toISOString(),
      lastActivityAt: s.createdAt ? new Date(s.createdAt).toISOString() : undefined,
      status: "active",
      mfaVerified,
      loginMethod: "password",
    };
  }

  // POST /api/auth/token/refresh (rotating refresh token + reuse detection)
  app.post("/api/auth/token/refresh", authRateLimiter, async (req, res) => {
    try {
      const { refreshToken } = req.body ?? {};
      if (!refreshToken || typeof refreshToken !== "string") {
        res.status(400).json({ result: "failed", message: "refreshToken is required." });
        return;
      }
      let sub: string;
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);
        if (typeof decoded === "string" || decoded.type !== "refresh" || !decoded.sub) {
          throw new Error("bad token");
        }
        sub = String(decoded.sub);
      } catch {
        res.status(401).json({ result: "failed", message: "Invalid or expired refresh token." });
        return;
      }
      const session = await Session.findOne({ refreshToken: hashRefreshToken(refreshToken) });
      if (!session || session.revokedAt) {
        await Session.updateMany({ userId: sub, revokedAt: null }, { revokedAt: new Date() });
        res.status(401).json({ result: "failed", message: "Refresh token is no longer valid. Please log in again." });
        return;
      }
      const nowMs = Date.now();
      if (session.expiresAt.getTime() <= nowMs) {
        res.status(401).json({ result: "failed", message: "Session expired. Please log in again." });
        return;
      }
      const user = await User.findById(session.userId);
      if (!user || !user.isActive) {
        session.revokedAt = new Date();
        await session.save();
        res.status(401).json({ result: "failed", message: "Account is not active." });
        return;
      }
      const secondsLeft = Math.max(1, Math.floor((session.expiresAt.getTime() - nowMs) / 1000));
      const newRefresh = jwt.sign(
        { sub: String(user._id), type: "refresh", jti: crypto.randomUUID() },
        process.env.JWT_REFRESH_SECRET as string,
        { expiresIn: secondsLeft }
      );
      session.refreshToken = hashRefreshToken(newRefresh);
      session.ip = req.ip;
      session.userAgent = req.headers["user-agent"];
      await session.save();
      res.json({
        result: "success",
        session: authSessionView(session, !user.mfaEnabled),
        token: {
          accessToken: authSignAccess(user),
          refreshToken: newRefresh,
          expiresIn: 15 * 60,
          tokenType: "Bearer",
        },
      });
    } catch (err) {
      console.error("[AUTH] Refresh failed:", err);
      res.status(500).json({ result: "failed", message: "Token refresh failed due to a server error." });
    }
  });

  // POST /api/auth/logout  body: { sessionId? | refreshToken? | allSessions? }
  app.post("/api/auth/location", authenticate, async (req, res) => {
    try {
      const { lat, lng } = req.body ?? {};
      if (
        typeof lat !== "number" || typeof lng !== "number" ||
        !Number.isFinite(lat) || !Number.isFinite(lng) ||
        lat < -90 || lat > 90 || lng < -180 || lng > 180
      ) {
        return res.status(400).json({ error: "invalid_coordinates" });
      }
      await User.updateOne(
        { _id: req.user!.id },
        { $set: { lastKnownLocation: { lat, lng, updatedAt: new Date() } } }
      );
      return res.json({ success: true });
    } catch (err) {
      console.error("location update failed", err);
      return res.status(500).json({ error: "location_update_failed" });
    }
  });

  app.post("/api/auth/logout", authenticate, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { sessionId, allSessions, refreshToken } = req.body ?? {};
      const now = new Date();
      let revoked = 0;
      if (allSessions === true) {
        const r = await Session.updateMany({ userId, revokedAt: null }, { revokedAt: now });
        revoked = r.modifiedCount;
      } else if (typeof sessionId === "string" && mongoose.isValidObjectId(sessionId)) {
        const r = await Session.updateOne({ _id: sessionId, userId, revokedAt: null }, { revokedAt: now });
        revoked = r.modifiedCount;
      } else if (typeof refreshToken === "string") {
        const r = await Session.updateOne(
          { refreshToken: hashRefreshToken(refreshToken), userId, revokedAt: null },
          { revokedAt: now }
        );
        revoked = r.modifiedCount;
      } else {
        res.status(400).json({ result: "failed", message: "Provide sessionId, refreshToken, or allSessions=true." });
        return;
      }
      res.json({ success: true, result: "success", sessionsRevoked: revoked, message: "Logged out." });
    } catch (err) {
      console.error("[AUTH] Logout failed:", err);
      res.status(500).json({ result: "failed", message: "Logout failed due to a server error." });
    }
  });

  // GET /api/auth/sessions
  app.get("/api/auth/sessions", authenticate, async (req, res) => {
    try {
      const sessions = await Session.find({
        userId: req.user!.id,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 });
      res.json({ sessions: sessions.map((s: any) => authSessionView(s, true)) });
    } catch (err) {
      console.error("[AUTH] List sessions failed:", err);
      res.status(500).json({ error: "SERVER_ERROR", message: "Could not list sessions." });
    }
  });

  // DELETE /api/auth/sessions/:sessionId
  app.delete("/api/auth/sessions/:sessionId", authenticate, async (req, res) => {
    try {
      const sessionId = req.params.sessionId as string;
      if (!mongoose.isValidObjectId(sessionId)) {
        res.status(400).json({ error: "BAD_REQUEST", message: "Invalid sessionId." });
        return;
      }
      const r = await Session.updateOne(
        { _id: sessionId, userId: req.user!.id, revokedAt: null },
        { revokedAt: new Date() }
      );
      if (r.modifiedCount === 0) {
        res.status(404).json({ error: "NOT_FOUND", message: "Session not found." });
        return;
      }
      res.json({ success: true });
    } catch (err) {
      console.error("[AUTH] Revoke session failed:", err);
      res.status(500).json({ error: "SERVER_ERROR", message: "Could not revoke session." });
    }
  });
  // ===== END KSV-AUTH-SESSIONS =====

  // POST /api/auth/password/change
  app.post("/api/auth/password/change", authenticate, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body ?? {};

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          error: "BAD_REQUEST",
          message: "currentPassword and newPassword are required.",
        });
        return;
      }

      const userId = req.user!.id;
      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({ error: "NOT_FOUND", message: "User not found." });
        return;
      }

      const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);

      if (!passwordMatches) {
        res.status(401).json({
          error: "UNAUTHORIZED",
          message: "Current password is incorrect.",
        });
        return;
      }

      user.passwordHash = await bcrypt.hash(newPassword, 12);
      await user.save();

      res.json({
        success: true,
        sessionRevoked: false,
        message: "Password changed successfully.",
      });
    } catch (err) {
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: err instanceof Error ? err.message : "Failed to change password.",
      });
    }
  });
  // POST /api/auth/login/password
  // POST /api/auth/register
  app.post("/api/auth/register", authRateLimiter, async (req, res) => {
    try {
      const { email, password, firstName, lastName, organizationName } = req.body ?? {};

      if (!email || !password || !firstName || !lastName || !organizationName) {
        res.status(400).json({
          result: "failed",
          message: "email, password, firstName, lastName, and organizationName are required.",
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          result: "failed",
          message: "Password must be at least 6 characters.",
        });
        return;
      }

      const hasLetter = /[A-Za-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSymbol = /[^A-Za-z0-9]/.test(password);
      if (!hasLetter || !hasNumber || !hasSymbol) {
        res.status(400).json({
          result: "failed",
          message: "Password must include at least one letter, one number, and one symbol.",
        });
        return;
      }

      const existing = await User.findOne({ email });
      if (existing) {
        res.status(409).json({
          result: "failed",
          message: "An account with this email already exists.",
        });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 12);

      // Each self-registered user gets their own organization and becomes
      // its OrgAdmin (full control of their own org, not platform-wide).
      const organization = await Organization.create({
        name: organizationName,
        ownerId: new mongoose.Types.ObjectId(), // placeholder, corrected below
      });

      const user = await User.create({
        email,
        passwordHash,
        role: "OrgAdmin",
        firstName,
        lastName,
        isActive: true,
        organizationId: organization._id,
      });

      organization.ownerId = user._id;
      await organization.save();

      const now = new Date();
      const accessToken = jwt.sign(
        { sub: String(user._id), role: user.role, organizationId: String(organization._id) },
        process.env.JWT_ACCESS_SECRET as string,
        { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as jwt.SignOptions["expiresIn"] }
      );
      const refreshToken = jwt.sign(
        { sub: String(user._id), type: "refresh" },
        process.env.JWT_REFRESH_SECRET as string,
        { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"] }
      );

      const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
      const match = refreshExpiresIn.match(/^(\d+)([smhd])$/);
      if (!match) {
        throw new Error("Invalid JWT_REFRESH_EXPIRES_IN format. Use values such as 7d, 24h, 60m.");
      }
      const amount = Number(match[1]);
      const unit = match[2];
      const millisecondsPerUnit: Record<string, number> = {
        s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000,
      };
      const expiresAt = new Date(now.getTime() + amount * millisecondsPerUnit[unit]);

      const session = await Session.create({
        userId: user._id,
        refreshToken: hashRefreshToken(refreshToken),
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        expiresAt,
      });

      res.status(201).json({
        result: "success",
        session: {
          sessionId: String(session._id),
          accountId: String(user._id),
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
          createdAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          lastActivityAt: now.toISOString(),
          status: "active",
          mfaVerified: true,
          loginMethod: "password",
          countryCode: undefined,
        },
        token: {
          accessToken,
          refreshToken,
          expiresIn: 15 * 60,
          tokenType: "Bearer",
        },
        message: "Account created successfully.",
      });
    } catch (err) {
      console.error("[AUTH] Register failed:", err);
      res.status(500).json({ result: "failed", message: "Registration failed due to a server error." });
    }
  });

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

      if (user.mfaEnabled) {
        const challenge = await MFAChallenge.create({
          userId: user._id,
          method: user.mfaMethod || "totp",
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });

        res.json({
          result: "mfa_required",
          mfaChallenge: {
            challengeId: String(challenge._id),
            method: challenge.method,
            expiresAt: challenge.expiresAt.toISOString(),
            maskedDestination:
              user.mfaMethod === "sms_otp"
                ? maskDestination(user.mfaPhoneNumber)
                : user.mfaMethod === "email_otp"
                ? maskDestination(user.mfaEmail)
                : undefined,
          },
          message: "MFA verification required.",
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
          expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as jwt.SignOptions["expiresIn"],
        }
      );

      const refreshToken = jwt.sign(
        {
          sub: String(user._id),
          type: "refresh",
        },
        process.env.JWT_REFRESH_SECRET as string,
        {
          expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"],
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

  // POST /api/auth/mfa/enroll
  app.post("/api/auth/mfa/enroll", authenticate, async (req, res) => {
    try {
      const user = req.user!;
      const { method, phoneNumber, email } = req.body ?? {};

      if (!method) {
        res.status(400).json({ success: false, message: "method is required." });
        return;
      }

      const dbUser = await User.findById(user.id);
      if (!dbUser) {
        res.status(404).json({ success: false, message: "User not found." });
        return;
      }

      let totpSecret: string | undefined;

      if (method === "totp") {
        totpSecret = otplib.generateSecret();
        dbUser.mfaSecret = encMfa(totpSecret);
      } else if (method === "sms_otp") {
        if (!phoneNumber) {
          res.status(400).json({ success: false, message: "phoneNumber is required for sms_otp." });
          return;
        }
        dbUser.mfaPhoneNumber = phoneNumber;
      } else if (method === "email_otp") {
        if (!email) {
          res.status(400).json({ success: false, message: "email is required for email_otp." });
          return;
        }
        dbUser.mfaEmail = email;
      }

      dbUser.mfaMethod = method;
      // mfaEnabled stays false until enroll/confirm succeeds
      await dbUser.save();

      res.json({
        success: true,
        method,
        totpSecret: method === "totp" ? totpSecret : undefined,
        confirmationRequired: true,
        message: "Enrollment started. Confirm with a verification code to activate.",
      });
    } catch (err) {
      console.error("[AUTH] MFA enroll failed:", err);
      res.status(500).json({ success: false, message: "MFA enroll failed due to a server error." });
    }
  });

  // POST /api/auth/mfa/enroll/confirm
  app.post("/api/auth/mfa/enroll/confirm", authenticate, async (req, res) => {
    try {
      const user = req.user!;
      const { method, verificationCode } = req.body ?? {};

      if (!method || !verificationCode) {
        res.status(400).json({ success: false, message: "method and verificationCode are required." });
        return;
      }

      const dbUser = await User.findById(user.id);
      if (!dbUser || dbUser.mfaMethod !== method) {
        res.status(400).json({ success: false, message: "No matching pending enrollment found." });
        return;
      }

      if (method === "totp") {
        if (!dbUser.mfaSecret) {
          res.status(400).json({ success: false, message: "No TOTP secret on file." });
          return;
        }
        const result = await otplib.verify({ secret: readMfaSecret(dbUser.mfaSecret), token: verificationCode, strategy: "totp" });
        if (!result.valid) {
          res.status(401).json({ success: false, message: "Invalid verification code." });
          return;
        }
      }
      // sms_otp / email_otp confirmation would check a sent code here (not wired to an SMS/email provider yet)

      dbUser.mfaEnabled = true;
      await dbUser.save();

      res.json({ success: true, message: "MFA enabled successfully." });
    } catch (err) {
      console.error("[AUTH] MFA enroll confirm failed:", err);
      res.status(500).json({ success: false, message: "MFA confirmation failed due to a server error." });
    }
  });

  // POST /api/auth/mfa/disable
  app.post("/api/auth/mfa/disable", authenticate, async (req, res) => {
    try {
      const user = req.user!;
      const { method, confirmCode } = req.body ?? {};

      const dbUser = await User.findById(user.id);
      if (!dbUser || !dbUser.mfaEnabled) {
        res.status(400).json({ success: false, message: "MFA is not currently enabled." });
        return;
      }

      if (dbUser.mfaMethod === "totp") {
        if (!dbUser.mfaSecret) {
          res.status(400).json({ success: false, message: "No TOTP secret on file." });
          return;
        }
        const result = await otplib.verify({ secret: readMfaSecret(dbUser.mfaSecret), token: confirmCode, strategy: "totp" });
        if (!result.valid) {
          res.status(401).json({ success: false, message: "Invalid confirmation code." });
          return;
        }
      }

      dbUser.mfaEnabled = false;
      dbUser.mfaMethod = null;
      dbUser.mfaSecret = null;
      await dbUser.save();

      res.json({ success: true });
    } catch (err) {
      console.error("[AUTH] MFA disable failed:", err);
      res.status(500).json({ success: false, message: "MFA disable failed due to a server error." });
    }
  });

  // POST /api/auth/mfa/verify  (called after login returns mfa_required)
  app.post("/api/auth/mfa/verify", authRateLimiter, async (req, res) => {
    try {
      const { challengeId, code } = req.body ?? {};

      if (!challengeId || !code) {
        res.status(400).json({ success: false, message: "challengeId and code are required." });
        return;
      }

      const challenge = await MFAChallenge.findById(challengeId);
      if (!challenge || challenge.consumedAt || challenge.expiresAt < new Date()) {
        res.status(401).json({ success: false, message: "Challenge is invalid or expired." });
        return;
      }

      if (challenge.attemptsRemaining <= 0) {
        res.status(401).json({ success: false, message: "No attempts remaining." });
        return;
      }

      const dbUser = await User.findById(challenge.userId);
      if (!dbUser) {
        res.status(401).json({ success: false, message: "User not found." });
        return;
      }

      let valid = false;
      if (challenge.method === "totp") {
        if (dbUser.mfaSecret) {
          const result = await otplib.verify({ secret: readMfaSecret(dbUser.mfaSecret), token: code, strategy: "totp" });
          valid = result.valid;
        }
      }
      // sms_otp / email_otp would compare against challenge.codeHash here

      if (!valid) {
        challenge.attemptsRemaining -= 1;
        await challenge.save();
        res.status(401).json({
          success: false,
          attemptsRemaining: challenge.attemptsRemaining,
          message: "Invalid code.",
        });
        return;
      }

      challenge.consumedAt = new Date();
      await challenge.save();

      const now = new Date();
      const accessToken = jwt.sign(
        {
          sub: String(dbUser._id),
          role: dbUser.role,
          organizationId: dbUser.organizationId ? String(dbUser.organizationId) : undefined,
        },
        process.env.JWT_ACCESS_SECRET as string,
        { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as jwt.SignOptions["expiresIn"] }
      );
      const refreshToken = jwt.sign(
        { sub: String(dbUser._id), type: "refresh" },
        process.env.JWT_REFRESH_SECRET as string,
        { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"] }
      );

      const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
      const match = refreshExpiresIn.match(/^(\d+)([smhd])$/);
      if (!match) {
        throw new Error("Invalid JWT_REFRESH_EXPIRES_IN format. Use values such as 7d, 24h, 60m.");
      }
      const amount = Number(match[1]);
      const unit = match[2];
      const millisecondsPerUnit: Record<string, number> = {
        s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000,
      };
      const expiresAt = new Date(now.getTime() + amount * millisecondsPerUnit[unit]);

      const session = await Session.create({
        userId: dbUser._id,
        refreshToken: hashRefreshToken(refreshToken),
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        expiresAt,
      });

      dbUser.lastLoginAt = now;
      await dbUser.save();

      res.json({
        success: true,
        session: {
          sessionId: String(session._id),
          accountId: String(dbUser._id),
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
          createdAt: session.createdAt ? new Date(session.createdAt).toISOString() : now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          lastActivityAt: now.toISOString(),
          status: "active",
          mfaVerified: true,
          loginMethod: "password",
          countryCode: undefined,
        },
        token: {
          accessToken,
          refreshToken,
          expiresIn: 15 * 60,
          tokenType: "Bearer",
        },
        message: "MFA verified. Login successful.",
      });
    } catch (err) {
      console.error("[AUTH] MFA verify failed:", err);
      res.status(500).json({ success: false, message: "MFA verification failed due to a server error." });
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
      } catch {
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
    } catch {
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
    } catch {
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load device state." });
    }
  });

  // GET /api/devices/:id — single device
  app.get(
    "/api/devices/:id",
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
        }).lean();
        if (!device) {
          res.status(404).json({ error: "DEVICE_NOT_FOUND" });
          return;
        }
        res.json({ device });
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load device." });
      }
    }
  );

  // POST /api/devices — create device
  app.post(
    "/api/devices",
    authenticate,
    requirePermission("device:manage"),
    async (req, res) => {
      const user = req.user!;
      if (!user.organizationId) {
        res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
        return;
      }
      try {
        const { name, deviceCode, type, status, siteId, gatewayId, firmwareVersion, criticality } = req.body || {};
        const CRITICALITY_LEVELS = ["life_support", "clinical", "robot_mobile", "facility", "consumer"];
        if (criticality !== undefined && !CRITICALITY_LEVELS.includes(criticality)) {
          res.status(400).json({ error: "BAD_REQUEST", message: `criticality must be one of: ${CRITICALITY_LEVELS.join(", ")}.` });
          return;
        }
        if (!name || !deviceCode || !type) {
          res.status(400).json({ error: "BAD_REQUEST", message: "name, deviceCode and type are required." });
          return;
        }
        const exists = await Device.findOne({ deviceCode }).lean();
        if (exists) {
          res.status(409).json({ error: "DEVICE_CODE_TAKEN" });
          return;
        }
        const device = await Device.create({
          name,
          deviceCode,
          type,
          status: status ?? "offline",
          organizationId: user.organizationId,
          siteId,
          gatewayId,
          firmwareVersion,
          criticality: criticality ?? "facility",
        });
        res.status(201).json({ device: device.toObject() });
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to create device." });
      }
    }
  );

  // PUT /api/devices/:id — update device
  app.put(
    "/api/devices/:id",
    authenticate,
    requirePermission("device:manage"),
    async (req, res) => {
      const user = req.user!;
      if (!user.organizationId) {
        res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
        return;
      }
      try {
        const { name, type, status, siteId, gatewayId, firmwareVersion } = req.body || {};
        const update: Record<string, unknown> = {};
        if (name) update.name = name;
        if (type) update.type = type;
        if (status) update.status = status;
        if (siteId !== undefined) update.siteId = siteId;
        if (gatewayId !== undefined) update.gatewayId = gatewayId;
        if (firmwareVersion) update.firmwareVersion = firmwareVersion;

        const device = await Device.findOneAndUpdate(
          { _id: req.params.id, organizationId: user.organizationId },
          update,
          { new: true }
        ).lean();
        if (!device) {
          res.status(404).json({ error: "DEVICE_NOT_FOUND" });
          return;
        }
        res.json({ device });
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to update device." });
      }
    }
  );

  // DELETE /api/devices/:id — remove device
  app.delete(
    "/api/devices/:id",
    authenticate,
    requirePermission("device:manage"),
    async (req, res) => {
      const user = req.user!;
      if (!user.organizationId) {
        res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
        return;
      }
      try {
        const result = await Device.findOneAndDelete({
          _id: req.params.id,
          organizationId: user.organizationId,
        });
        if (!result) {
          res.status(404).json({ error: "DEVICE_NOT_FOUND" });
          return;
        }
        res.json({ success: true });
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to delete device." });
      }
    }
  );

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
      } catch {
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
    } catch {
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load threats." });
    }
  });

  // GET /api/security/sessions — active sessions for the user's organization
  app.get(
    "/api/security/sessions",
    authenticate,
    requirePermission("org:read"),
    async (req, res) => {
      const user = req.user!;
      if (!user.organizationId) {
        res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
        return;
      }
      try {
        const orgUsers = await User.find({ organizationId: user.organizationId })
          .select("_id firstName lastName email role")
          .lean();
        const userIds = orgUsers.map((u) => u._id);
        const userById = new Map(orgUsers.map((u) => [String(u._id), u]));

        const sessions = await Session.find({
          userId: { $in: userIds },
          revokedAt: { $exists: false },
          expiresAt: { $gt: new Date() },
        })
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();

        const result = sessions.map((sess) => {
          const u = userById.get(String(sess.userId));
          const firstName = (u?.firstName as string) || "";
          const lastName = (u?.lastName as string) || "";
          const displayName = `${firstName} ${lastName}`.trim() || (u?.email as string) || "Unknown";
          return {
            sessionId: String(sess._id),
            userId: String(sess.userId),
            user: displayName,
            email: u?.email ?? "",
            role: u?.role ?? "",
            ip: sess.ip ?? "",
            userAgent: sess.userAgent ?? "",
            createdAt: sess.createdAt instanceof Date ? sess.createdAt.toISOString() : new Date().toISOString(),
            expiresAt: sess.expiresAt instanceof Date ? sess.expiresAt.toISOString() : "",
          };
        });

        res.json({ sessions: result, total: result.length });
      } catch (err) {
        res.status(500).json({
          error: "INTERNAL_ERROR",
          message: err instanceof Error ? err.message : "Failed to load sessions.",
        });
      }
    }
  );

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
    } catch {
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
        const orgs = await Organization.find({ _id: user.organizationId }).lean();
        const organizations = await Promise.all(orgs.map((o) => toKSVOrganization(o as Record<string, unknown>)));
        res.json({ organizations });
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load organizations." });
      }
    }
  );

  // GET /api/organizations/:orgId — single organization
  app.get(
    "/api/organizations/:orgId",
    authenticate,
    requirePermission("org:read"),
    async (req, res) => {
      try {
        const org = await Organization.findById(req.params.orgId).lean();
        if (!org) {
          res.status(404).json({ error: "NOT_FOUND" });
          return;
        }
        res.json(await toKSVOrganization(org as Record<string, unknown>));
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load organization." });
      }
    }
  );

  // POST /api/organizations — create organization
  app.post(
    "/api/organizations",
    authenticate,
    requirePermission("org:manage"),
    async (req, res) => {
      const user = req.user!;
      try {
        const { name, countryCode, timezone } = req.body || {};
        if (!name || typeof name !== "string") {
          res.status(400).json({ error: "BAD_REQUEST", message: "name is required" });
          return;
        }
        const org = await Organization.create({
          name,
          ownerId: user.id,
          country: countryCode,
          timezone,
        });
        res.status(201).json(await toKSVOrganization(org.toObject() as Record<string, unknown>));
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to create organization." });
      }
    }
  );

  // PUT /api/organizations/:orgId — update organization
  app.put(
    "/api/organizations/:orgId",
    authenticate,
    requirePermission("org:manage"),
    async (req, res) => {
      try {
        const { name, countryCode, timezone } = req.body || {};
        const update: Record<string, unknown> = {};
        if (name) update.name = name;
        if (countryCode) update.country = countryCode;
        if (timezone) update.timezone = timezone;
        const org = await Organization.findByIdAndUpdate(req.params.orgId, update, { new: true }).lean();
        if (!org) {
          res.status(404).json({ error: "NOT_FOUND" });
          return;
        }
        res.json(await toKSVOrganization(org as Record<string, unknown>));
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to update organization." });
      }
    }
  );

  // DELETE /api/organizations/:orgId
  app.delete(
    "/api/organizations/:orgId",
    authenticate,
    requirePermission("org:manage"),
    async (req, res) => {
      try {
        const result = await Organization.findByIdAndDelete(req.params.orgId);
        if (!result) {
          res.status(404).json({ error: "NOT_FOUND" });
          return;
        }
        res.json({ success: true });
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to delete organization." });
      }
    }
  );

  // GET /api/organizations/:orgId/sites — list sites
  app.get(
    "/api/organizations/:orgId/sites",
    authenticate,
    requirePermission("org:read"),
    async (req, res) => {
      try {
        const sites = await Site.find({ organizationId: req.params.orgId }).lean();
        const result = await Promise.all(sites.map((x) => toKSVSite(x as Record<string, unknown>)));
        res.json(result);
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load sites." });
      }
    }
  );

  // GET /api/organizations/:orgId/sites/:siteId
  app.get(
    "/api/organizations/:orgId/sites/:siteId",
    authenticate,
    requirePermission("org:read"),
    async (req, res) => {
      try {
        const site = await Site.findOne({
          _id: req.params.siteId,
          organizationId: req.params.orgId,
        }).lean();
        if (!site) {
          res.status(404).json({ error: "NOT_FOUND" });
          return;
        }
        res.json(await toKSVSite(site as Record<string, unknown>));
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load site." });
      }
    }
  );

  // POST /api/organizations/:orgId/sites
  app.post(
    "/api/organizations/:orgId/sites",
    authenticate,
    requirePermission("org:manage"),
    async (req, res) => {
      try {
        const { name, type, address, countryCode, timezone } = req.body || {};
        if (!name) {
          res.status(400).json({ error: "BAD_REQUEST", message: "name is required" });
          return;
        }
        const site = await Site.create({
          organizationId: req.params.orgId,
          name,
          type,
          address,
          country: countryCode,
          timezone,
        });
        res.status(201).json(await toKSVSite(site.toObject() as Record<string, unknown>));
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to create site." });
      }
    }
  );

  // PUT /api/organizations/:orgId/sites/:siteId
  app.put(
    "/api/organizations/:orgId/sites/:siteId",
    authenticate,
    requirePermission("org:manage"),
    async (req, res) => {
      try {
        const { name, type, address, countryCode, timezone } = req.body || {};
        const update: Record<string, unknown> = {};
        if (name) update.name = name;
        if (type) update.type = type;
        if (address) update.address = address;
        if (countryCode) update.country = countryCode;
        if (timezone) update.timezone = timezone;
        const site = await Site.findOneAndUpdate(
          { _id: req.params.siteId, organizationId: req.params.orgId },
          update,
          { new: true }
        ).lean();
        if (!site) {
          res.status(404).json({ error: "NOT_FOUND" });
          return;
        }
        res.json(await toKSVSite(site as Record<string, unknown>));
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to update site." });
      }
    }
  );

  // DELETE /api/organizations/:orgId/sites/:siteId
  app.delete(
    "/api/organizations/:orgId/sites/:siteId",
    authenticate,
    requirePermission("org:manage"),
    async (req, res) => {
      try {
        const result = await Site.findOneAndDelete({
          _id: req.params.siteId,
          organizationId: req.params.orgId,
        });
        if (!result) {
          res.status(404).json({ error: "NOT_FOUND" });
          return;
        }
        res.json({ success: true });
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to delete site." });
      }
    }
  );

  // GET /api/organizations/:orgId/members — list members
  app.get(
    "/api/organizations/:orgId/members",
    authenticate,
    requirePermission("org:read"),
    async (req, res) => {
      try {
        const users = await User.find({ organizationId: req.params.orgId }).lean();
        const members = users.map((u) => toKSVOrgMember(u as Record<string, unknown>));
        res.json(members);
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load members." });
      }
    }
  );

  // GET /api/organizations/:orgId/members/:memberId
  app.get(
    "/api/organizations/:orgId/members/:memberId",
    authenticate,
    requirePermission("org:read"),
    async (req, res) => {
      try {
        const user = await User.findOne({
          _id: req.params.memberId,
          organizationId: req.params.orgId,
        }).lean();
        if (!user) {
          res.status(404).json({ error: "NOT_FOUND" });
          return;
        }
        res.json(toKSVOrgMember(user as Record<string, unknown>));
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load member." });
      }
    }
  );

  // PUT /api/organizations/:orgId/members/:memberId/role
  app.put(
    "/api/organizations/:orgId/members/:memberId/role",
    authenticate,
    requirePermission("org:manage"),
    async (req, res) => {
      try {
        const { newRole } = req.body || {};
        const roleMap: Record<string, string> = {
          owner: "Owner",
          admin: "OrgAdmin",
          manager: "Manager",
          operator: "Operator",
          viewer: "Viewer",
          guest: "Guest",
        };
        const mapped = roleMap[newRole];
        if (!mapped) {
          res.status(400).json({ error: "BAD_REQUEST", message: "Invalid newRole" });
          return;
        }
        const user = await User.findOneAndUpdate(
          { _id: req.params.memberId, organizationId: req.params.orgId },
          { role: mapped },
          { new: true }
        ).lean();
        if (!user) {
          res.status(404).json({ error: "NOT_FOUND" });
          return;
        }
        res.json(toKSVOrgMember(user as Record<string, unknown>));
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to update member role." });
      }
    }
  );

  // DELETE /api/organizations/:orgId/members/:memberId
  app.delete(
    "/api/organizations/:orgId/members/:memberId",
    authenticate,
    requirePermission("org:manage"),
    async (req, res) => {
      try {
        const result = await User.findOneAndUpdate(
          { _id: req.params.memberId, organizationId: req.params.orgId },
          { isActive: false },
          { new: true }
        );
        if (!result) {
          res.status(404).json({ error: "NOT_FOUND" });
          return;
        }
        res.json({ success: true });
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to remove member." });
      }
    }
  );

  // GET /api/organizations/:orgId/sites/:siteId/buildings
  app.get(
    "/api/organizations/:orgId/sites/:siteId/buildings",
    authenticate,
    requirePermission("org:read"),
    async (req, res) => {
      try {
        const buildings = await Building.find({
          organizationId: req.params.orgId,
          siteId: req.params.siteId,
        }).lean();
        const result = await Promise.all(buildings.map((b) => toKSVBuilding(b as Record<string, unknown>)));
        res.json(result);
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load buildings." });
      }
    }
  );

  // POST /api/organizations/:orgId/sites/:siteId/buildings
  app.post(
    "/api/organizations/:orgId/sites/:siteId/buildings",
    authenticate,
    requirePermission("org:manage"),
    async (req, res) => {
      try {
        const { name, type, floorCount } = req.body || {};
        if (!name) {
          res.status(400).json({ error: "BAD_REQUEST", message: "name is required" });
          return;
        }
        const building = await Building.create({
          organizationId: req.params.orgId,
          siteId: req.params.siteId,
          name,
          type,
          floorCount,
        });
        res.status(201).json(await toKSVBuilding(building.toObject() as Record<string, unknown>));
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to create building." });
      }
    }
  );

  // PUT /api/organizations/:orgId/sites/:siteId/buildings/:buildingId
  app.put(
    "/api/organizations/:orgId/sites/:siteId/buildings/:buildingId",
    authenticate,
    requirePermission("org:manage"),
    async (req, res) => {
      try {
        const { name, type, floorCount } = req.body || {};
        const update: Record<string, unknown> = {};
        if (name) update.name = name;
        if (type) update.type = type;
        if (typeof floorCount === "number") update.floorCount = floorCount;
        const building = await Building.findOneAndUpdate(
          {
            _id: req.params.buildingId,
            organizationId: req.params.orgId,
            siteId: req.params.siteId,
          },
          update,
          { new: true }
        ).lean();
        if (!building) {
          res.status(404).json({ error: "NOT_FOUND" });
          return;
        }
        res.json(await toKSVBuilding(building as Record<string, unknown>));
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to update building." });
      }
    }
  );

  // DELETE /api/organizations/:orgId/sites/:siteId/buildings/:buildingId
  app.delete(
    "/api/organizations/:orgId/sites/:siteId/buildings/:buildingId",
    authenticate,
    requirePermission("org:manage"),
    async (req, res) => {
      try {
        const result = await Building.findOneAndDelete({
          _id: req.params.buildingId,
          organizationId: req.params.orgId,
          siteId: req.params.siteId,
        });
        if (!result) {
          res.status(404).json({ error: "NOT_FOUND" });
          return;
        }
        res.json({ success: true });
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to delete building." });
      }
    }
  );

  // GET /api/organizations/:orgId/sites/:siteId/buildings/:buildingId/rooms
  app.get(
    "/api/organizations/:orgId/sites/:siteId/buildings/:buildingId/rooms",
    authenticate,
    requirePermission("org:read"),
    async (req, res) => {
      try {
        const rooms = await Room.find({
          organizationId: req.params.orgId,
          siteId: req.params.siteId,
          buildingId: req.params.buildingId,
        }).lean();
        const result = await Promise.all(rooms.map((r) => toKSVRoom(r as Record<string, unknown>)));
        res.json(result);
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load rooms." });
      }
    }
  );

  // POST /api/organizations/:orgId/sites/:siteId/buildings/:buildingId/rooms
  app.post(
    "/api/organizations/:orgId/sites/:siteId/buildings/:buildingId/rooms",
    authenticate,
    requirePermission("org:manage"),
    async (req, res) => {
      try {
        const { name, floor } = req.body || {};
        if (!name) {
          res.status(400).json({ error: "BAD_REQUEST", message: "name is required" });
          return;
        }
        const room = await Room.create({
          organizationId: req.params.orgId,
          siteId: req.params.siteId,
          buildingId: req.params.buildingId,
          name,
          floor,
        });
        res.status(201).json(await toKSVRoom(room.toObject() as Record<string, unknown>));
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to create room." });
      }
    }
  );

  // PUT /api/organizations/:orgId/sites/:siteId/buildings/:buildingId/rooms/:roomId
  app.put(
    "/api/organizations/:orgId/sites/:siteId/buildings/:buildingId/rooms/:roomId",
    authenticate,
    requirePermission("org:manage"),
    async (req, res) => {
      try {
        const { name, floor } = req.body || {};
        const update: Record<string, unknown> = {};
        if (name) update.name = name;
        if (typeof floor === "number") update.floor = floor;
        const room = await Room.findOneAndUpdate(
          {
            _id: req.params.roomId,
            organizationId: req.params.orgId,
            siteId: req.params.siteId,
            buildingId: req.params.buildingId,
          },
          update,
          { new: true }
        ).lean();
        if (!room) {
          res.status(404).json({ error: "NOT_FOUND" });
          return;
        }
        res.json(await toKSVRoom(room as Record<string, unknown>));
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to update room." });
      }
    }
  );

  // DELETE /api/organizations/:orgId/sites/:siteId/buildings/:buildingId/rooms/:roomId
  app.delete(
    "/api/organizations/:orgId/sites/:siteId/buildings/:buildingId/rooms/:roomId",
    authenticate,
    requirePermission("org:manage"),
    async (req, res) => {
      try {
        const result = await Room.findOneAndDelete({
          _id: req.params.roomId,
          organizationId: req.params.orgId,
          siteId: req.params.siteId,
          buildingId: req.params.buildingId,
        });
        if (!result) {
          res.status(404).json({ error: "NOT_FOUND" });
          return;
        }
        res.json({ success: true });
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to delete room." });
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
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load safety rules." });
      }
    }
  );

  // ===== KSV-SAFETY-ROUTES (added 2026-09-20) =====
  const SAFETY_SEVERITIES = ["low", "medium", "high", "critical"];
  const SAFETY_CATEGORIES = ["door", "vehicle", "industrial", "hvac", "sensor", "other"];
  const EmergencyStop =
    (mongoose.models.EmergencyStop as any) ||
    mongoose.model(
      "EmergencyStop",
      new mongoose.Schema(
        {
          organizationId: { type: mongoose.Schema.Types.ObjectId, required: true },
          scope: { type: String, required: true }, // organization | device
          deviceId: { type: mongoose.Schema.Types.ObjectId },
          reason: { type: String, required: true },
          activatedBy: { type: mongoose.Schema.Types.ObjectId },
          activatedAt: { type: Date, default: Date.now },
          releasedAt: Date,
          releasedBy: { type: mongoose.Schema.Types.ObjectId },
          releaseNote: String,
        },
        { timestamps: true }
      )
    );

  // POST /api/safety/rules
  app.post("/api/safety/rules", authenticate, requirePermission("org:manage"), async (req, res) => {
    try {
      const orgId = req.user!.organizationId;
      if (!orgId) { res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." }); return; }
      const { name, category, severity } = req.body ?? {};
      if (typeof name !== "string" || !name.trim()) { res.status(400).json({ error: "BAD_REQUEST", message: "name is required." }); return; }
      if (!SAFETY_CATEGORIES.includes(category)) { res.status(400).json({ error: "BAD_REQUEST", message: "category must be one of: " + SAFETY_CATEGORIES.join(", ") }); return; }
      if (!SAFETY_SEVERITIES.includes(severity)) { res.status(400).json({ error: "BAD_REQUEST", message: "severity must be one of: " + SAFETY_SEVERITIES.join(", ") }); return; }
      const rule = await SafetyRule.create({ organizationId: orgId, name: name.trim(), category, severity });
      res.status(201).json({ rule });
    } catch (err) {
      console.error("[SAFETY] create rule failed:", err);
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to create safety rule." });
    }
  });

  // GET /api/safety/rules/:ruleId
  app.get("/api/safety/rules/:ruleId", authenticate, requirePermission("org:read"), async (req, res) => {
    try {
      const ruleId = req.params.ruleId as string;
      if (!mongoose.isValidObjectId(ruleId)) { res.status(400).json({ error: "BAD_REQUEST", message: "Invalid ruleId." }); return; }
      const rule = await SafetyRule.findOne({ _id: ruleId, organizationId: req.user!.organizationId }).lean();
      if (!rule) { res.status(404).json({ error: "NOT_FOUND", message: "Rule not found." }); return; }
      res.json({ rule });
    } catch (err) {
      console.error("[SAFETY] get rule failed:", err);
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load safety rule." });
    }
  });

  // PUT /api/safety/rules/:ruleId
  app.put("/api/safety/rules/:ruleId", authenticate, requirePermission("org:manage"), async (req, res) => {
    try {
      const ruleId = req.params.ruleId as string;
      if (!mongoose.isValidObjectId(ruleId)) { res.status(400).json({ error: "BAD_REQUEST", message: "Invalid ruleId." }); return; }
      const { name, category, severity } = req.body ?? {};
      const patch: Record<string, unknown> = {};
      if (name !== undefined) { if (typeof name !== "string" || !name.trim()) { res.status(400).json({ error: "BAD_REQUEST", message: "Invalid name." }); return; } patch.name = name.trim(); }
      if (category !== undefined) { if (!SAFETY_CATEGORIES.includes(category)) { res.status(400).json({ error: "BAD_REQUEST", message: "Invalid category." }); return; } patch.category = category; }
      if (severity !== undefined) { if (!SAFETY_SEVERITIES.includes(severity)) { res.status(400).json({ error: "BAD_REQUEST", message: "Invalid severity." }); return; } patch.severity = severity; }
      if (Object.keys(patch).length === 0) { res.status(400).json({ error: "BAD_REQUEST", message: "Nothing to update." }); return; }
      const rule = await SafetyRule.findOneAndUpdate({ _id: ruleId, organizationId: req.user!.organizationId }, patch, { new: true }).lean();
      if (!rule) { res.status(404).json({ error: "NOT_FOUND", message: "Rule not found." }); return; }
      res.json({ rule });
    } catch (err) {
      console.error("[SAFETY] update rule failed:", err);
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to update safety rule." });
    }
  });

  // DELETE /api/safety/rules/:ruleId
  app.delete("/api/safety/rules/:ruleId", authenticate, requirePermission("org:manage"), async (req, res) => {
    try {
      const ruleId = req.params.ruleId as string;
      if (!mongoose.isValidObjectId(ruleId)) { res.status(400).json({ error: "BAD_REQUEST", message: "Invalid ruleId." }); return; }
      const r = await SafetyRule.deleteOne({ _id: ruleId, organizationId: req.user!.organizationId });
      if (r.deletedCount === 0) { res.status(404).json({ error: "NOT_FOUND", message: "Rule not found." }); return; }
      res.json({ success: true });
    } catch (err) {
      console.error("[SAFETY] delete rule failed:", err);
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to delete safety rule." });
    }
  });

  // POST /api/safety/rules/:ruleId/enable | disable
  for (const action of ["enable", "disable"] as const) {
    app.post("/api/safety/rules/:ruleId/" + action, authenticate, requirePermission("org:manage"), async (req, res) => {
      try {
        const ruleId = req.params.ruleId as string;
        if (!mongoose.isValidObjectId(ruleId)) { res.status(400).json({ error: "BAD_REQUEST", message: "Invalid ruleId." }); return; }
        const rule = await SafetyRule.findOneAndUpdate(
          { _id: ruleId, organizationId: req.user!.organizationId },
          { isEnabled: action === "enable" },
          { new: true }
        ).lean();
        if (!rule) { res.status(404).json({ error: "NOT_FOUND", message: "Rule not found." }); return; }
        res.json({ rule });
      } catch (err) {
        console.error("[SAFETY] toggle rule failed:", err);
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to update safety rule." });
      }
    });
  }

  // GET /api/safety/events/:eventId
  app.get("/api/safety/events/:eventId", authenticate, requirePermission("org:read"), async (req, res) => {
    try {
      const eventId = req.params.eventId as string;
      if (!mongoose.isValidObjectId(eventId)) { res.status(400).json({ error: "BAD_REQUEST", message: "Invalid eventId." }); return; }
      const ev: any = await SafetyLog.findById(eventId).lean();
      if (!ev) { res.status(404).json({ error: "NOT_FOUND", message: "Event not found." }); return; }
      const dev = await Device.findOne({ _id: ev.deviceId, organizationId: req.user!.organizationId }).select("_id").lean();
      if (!dev) { res.status(404).json({ error: "NOT_FOUND", message: "Event not found." }); return; }
      res.json({ event: ev });
    } catch (err) {
      console.error("[SAFETY] get event failed:", err);
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load safety event." });
    }
  });

  // GET /api/safety/emergency-stop  (active stops)
  app.get("/api/safety/emergency-stop", authenticate, requirePermission("org:read"), async (req, res) => {
    try {
      const stops = await EmergencyStop.find({ organizationId: req.user!.organizationId, releasedAt: { $exists: false } }).lean();
      res.json({ active: stops.length > 0, stops });
    } catch (err) {
      console.error("[SAFETY] list stops failed:", err);
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load emergency stops." });
    }
  });

  // POST /api/safety/emergency-stop  body: { reason, deviceId? }  (no deviceId = whole organization)
  app.post("/api/safety/emergency-stop", authenticate, requirePermission("device:command"), async (req, res) => {
    try {
      const user = req.user!;
      if (!user.organizationId) { res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." }); return; }
      const { reason, deviceId } = req.body ?? {};
      if (typeof reason !== "string" || !reason.trim()) { res.status(400).json({ error: "BAD_REQUEST", message: "reason is required." }); return; }

      let devices: any[];
      if (deviceId !== undefined) {
        if (!mongoose.isValidObjectId(deviceId)) { res.status(400).json({ error: "BAD_REQUEST", message: "Invalid deviceId." }); return; }
        devices = await Device.find({ _id: deviceId, organizationId: user.organizationId }).select("_id").lean();
        if (devices.length === 0) { res.status(404).json({ error: "NOT_FOUND", message: "Device not found." }); return; }
      } else {
        devices = await Device.find({ organizationId: user.organizationId }).select("_id").lean();
      }

      const already = await EmergencyStop.findOne({
        organizationId: user.organizationId,
        releasedAt: { $exists: false },
        ...(deviceId !== undefined ? { $or: [{ deviceId }, { scope: "organization" }] } : { scope: "organization" }),
      }).lean();
      if (already) { res.status(409).json({ error: "CONFLICT", message: "Emergency stop already active.", stopId: String(already._id) }); return; }

      const stop = await EmergencyStop.create({
        organizationId: user.organizationId,
        scope: deviceId !== undefined ? "device" : "organization",
        deviceId: deviceId !== undefined ? deviceId : undefined,
        reason: reason.trim(),
        activatedBy: user.id,
      });

      if (devices.length > 0) {
        await SafetyLog.insertMany(devices.map((d) => ({
          deviceId: d._id,
          eventType: "emergency_stop",
          severity: "critical",
          message: "Emergency stop activated: " + reason.trim(),
        })));
      }
      console.warn("[SAFETY] EMERGENCY STOP", String(stop._id), "org", user.organizationId, "devices", devices.length);
      res.status(201).json({ success: true, stopId: String(stop._id), scope: stop.scope, devicesAffected: devices.length, activatedAt: stop.activatedAt });
    } catch (err) {
      console.error("[SAFETY] emergency stop failed:", err);
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to activate emergency stop." });
    }
  });

  // POST /api/safety/emergency-stop/release  body: { stopId?, note? }  (Manager or higher)
  app.post("/api/safety/emergency-stop/release", authenticate, requireMinRole("Manager"), async (req, res) => {
    try {
      const user = req.user!;
      const { stopId, note } = req.body ?? {};
      const filter: Record<string, unknown> = { organizationId: user.organizationId, releasedAt: { $exists: false } };
      if (stopId !== undefined) {
        if (!mongoose.isValidObjectId(stopId)) { res.status(400).json({ error: "BAD_REQUEST", message: "Invalid stopId." }); return; }
        filter._id = stopId;
      }
      const r = await EmergencyStop.updateMany(filter, { releasedAt: new Date(), releasedBy: user.id, releaseNote: typeof note === "string" ? note : undefined });
      if (r.modifiedCount === 0) { res.status(404).json({ error: "NOT_FOUND", message: "No active emergency stop." }); return; }
      console.warn("[SAFETY] EMERGENCY STOP RELEASED org", user.organizationId, "count", r.modifiedCount);
      res.json({ success: true, released: r.modifiedCount });
    } catch (err) {
      console.error("[SAFETY] release stop failed:", err);
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to release emergency stop." });
    }
  });
  // ===== END KSV-SAFETY-ROUTES =====

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
        const gateways = await Gateway.find({
          organizationId: user.organizationId,
        }).lean();

        res.json({ gateways, total: gateways.length });
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load gateways." });
      }
    }
  );


  // GET /api/gateways — organization-scoped Gateway list
  // POST /api/gateways - Register new gateway & issue provisioning token
  app.post(
    "/api/gateways",
    authenticate,
    requirePermission("org:manage"),
    async (req, res) => {
      try {
        const organizationId = req.user?.organizationId;
        if (!organizationId) {
          return res.status(403).json({
            error: "Unauthorized: Missing organization context",
          });
        }

        const {
          name,
          type,
          mode,
          firmwareVersion,
          serialNumber,
          orgId,
          siteId,
          buildingId,
          supportedProtocols,
          isOfflineCapable,
          offlineAuthEnabled,
        } = req.body || {};

        const allowedTypes = [
          "home",
          "building",
          "industrial",
          "vehicle",
          "portable",
        ];

        const allowedModes = [
          "cloud_connected",
          "local_only",
          "hybrid",
        ];

        const allowedProtocols = [
          "bluetooth",
          "wifi",
          "mqtt",
          "http_api",
          "infrared",
          "zigbee",
          "zwave",
          "lorawan",
          "modbus",
          "bacnet",
          "can_bus",
          "custom",
        ];

        if (!name || typeof name !== "string" || !name.trim()) {
          return res.status(400).json({
            error: "Validation failed: 'name' is required",
          });
        }

        if (!allowedTypes.includes(type)) {
          return res.status(400).json({
            error: "Validation failed: invalid 'type'",
          });
        }

        if (!allowedModes.includes(mode)) {
          return res.status(400).json({
            error: "Validation failed: invalid 'mode'",
          });
        }

        if (
          !firmwareVersion ||
          typeof firmwareVersion !== "string" ||
          !firmwareVersion.trim()
        ) {
          return res.status(400).json({
            error: "Validation failed: 'firmwareVersion' is required",
          });
        }

        if (
          !Array.isArray(supportedProtocols) ||
          supportedProtocols.length === 0 ||
          supportedProtocols.some(
            (protocol) => !allowedProtocols.includes(protocol)
          )
        ) {
          return res.status(400).json({
            error:
              "Validation failed: 'supportedProtocols' must contain only supported DeviceProtocol values",
          });
        }

        if (typeof isOfflineCapable !== "boolean") {
          return res.status(400).json({
            error: "Validation failed: 'isOfflineCapable' must be a boolean",
          });
        }

        if (typeof offlineAuthEnabled !== "boolean") {
          return res.status(400).json({
            error: "Validation failed: 'offlineAuthEnabled' must be a boolean",
          });
        }

        if (offlineAuthEnabled && !isOfflineCapable) {
          return res.status(400).json({
            error:
              "Validation failed: offline authentication requires offline capability",
          });
        }

        if (orgId && orgId !== organizationId) {
          return res.status(403).json({
            error: "Organization mismatch",
          });
        }

        if (siteId) {
          if (!mongoose.Types.ObjectId.isValid(siteId)) {
            return res.status(400).json({
              error: "Validation failed: invalid 'siteId'",
            });
          }

          const site = await Site.findOne({
            _id: siteId,
            organizationId,
          });

          if (!site) {
            return res.status(403).json({
              error: "Site does not belong to the authenticated organization",
            });
          }
        }

      if (!KSV_CLOUD_ENDPOINT) {
        return res.status(503).json({
          error: "Service unavailable: KSV_CLOUD_ENDPOINT is not configured",
        });
      }

        const gateway = await Gateway.create({
          name: name.trim(),
          organizationId,
          type,
          mode,
          firmwareVersion: firmwareVersion.trim(),
          serialNumber,
          siteId,
          buildingId,
          supportedProtocols,
          isOfflineCapable,
          offlineAuthEnabled,
        });

        const rawToken = generateSecureToken();
        const tokenHash = hashRefreshToken(rawToken);
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

        await GatewayProvisioningToken.create({
          gatewayId: gateway._id,
          tokenHash,
          expiresAt,
          createdBy: req.user!.id,
        });

      return res.status(201).json({
        success: true,
        gateway: {
          gatewayId: gateway._id.toString(),
          name: gateway.name,
          type: gateway.type,
          firmwareVersion: gateway.firmwareVersion,
          serialNumber: gateway.serialNumber,
          status: gateway.status,
          mode: gateway.mode,
          supportedProtocols: gateway.supportedProtocols,
          connectedDeviceCount: gateway.deviceCount ?? 0,
          ownerAccountId: req.user!.id,
          orgId: gateway.organizationId.toString(),
          siteId: gateway.siteId?.toString(),
          buildingId: gateway.buildingId?.toString(),
          lastSeenAt: gateway.lastPingAt?.toISOString(),
          isOfflineCapable: gateway.isOfflineCapable,
          offlineAuthEnabled: gateway.offlineAuthEnabled,
          ipAddress: gateway.ipAddress,
          cpuUsage: gateway.cpuUsage,
          memUsage: gateway.memUsage,
          createdAt: gateway.createdAt.toISOString(),
        },
        provisioningToken: rawToken,
        cloudEndpoint: KSV_CLOUD_ENDPOINT,
        message: "Gateway registered successfully",
      });
      } catch (err: unknown) {
        return res.status(500).json({
          error: "Internal server error",
          details: err instanceof Error ? err.message : String(err),
        });
      }
    }
  );

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
      } catch {
        res.status(500).json({
          error: "INTERNAL_ERROR",
          message: "Failed to load gateways.",
        });
      }
    }
  );

  // GET /api/gateways/:gatewayId — organization-scoped Gateway detail
  app.get(
    "/api/gateways/:gatewayId",
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
        const device = await Device.findOne({
          organizationId: user.organizationId,
          gatewayId: req.params.gatewayId,
        }).lean();

        if (!device) {
          res.status(404).json({
            error: "NOT_FOUND",
            message: "Gateway not found.",
          });
          return;
        }

        const gateway = await Gateway.findById(req.params.gatewayId).lean();

        if (!gateway) {
          res.status(404).json({
            error: "NOT_FOUND",
            message: "Gateway not found.",
          });
          return;
        }

        res.json({ gateway });
      } catch {
        res.status(500).json({
          error: "INTERNAL_ERROR",
          message: "Failed to load gateway.",
        });
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
      } catch {
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
      } catch {
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
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load protocols." });
      }
    }
  );

  // GET /api/protocols/adapters — protocol adapters with device counts
  app.get(
    "/api/protocols/adapters",
    authenticate,
    requirePermission("org:read"),
    async (_req, res) => {
      try {
        const protocols = await Protocol.find().lean();
        const adapters = await Promise.all(
          protocols.map(async (p) => {
            const currentDeviceCount = await Device.countDocuments({
              "protocol": p.code,
            });
            return {
              adapterId: String(p._id),
              protocol: p.code,
              name: p.name,
              version: "1.0.0",
              status: "active",
              supportedManufacturers: [],
              supportedDeviceTypes: [],
              isSecureChannel: Boolean(p.securityType),
              requiresGateway: false,
              maxDevicesPerAdapter: 10000,
              currentDeviceCount,
              createdAt: new Date().toISOString(),
            };
          })
        );
        res.json({ adapters });
      } catch {
        res.status(500).json({
          error: "INTERNAL_ERROR",
          message: "Failed to load protocol adapters.",
        });
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
      } catch {
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
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load notifications." });
      }
    }
  );

  // GET /api/map/devices — devices with coordinates for the interactive map
  app.get(
    "/api/map/devices",
    authenticate,
    requirePermission("device:read"),
    async (req, res) => {
      const user = req.user!;
      if (!user.organizationId) {
        res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
        return;
      }
      try {
        const devices = await Device.find({
          organizationId: user.organizationId,
          latitude: { $exists: true, $ne: null },
          longitude: { $exists: true, $ne: null },
        })
          .select("deviceCode name type status latitude longitude siteId firmwareVersion lastSeenAt")
          .lean();

        const siteIds = Array.from(
          new Set(devices.map((d) => d.siteId).filter(Boolean).map((id) => String(id)))
        );
        const sites = await Site.find({ _id: { $in: siteIds } }).lean();
        const siteById = new Map(sites.map((s) => [String(s._id), s]));

        const result = devices.map((d) => {
          const site = d.siteId ? siteById.get(String(d.siteId)) : undefined;
          return {
            deviceId: String(d._id),
            deviceCode: d.deviceCode,
            name: d.name,
            type: d.type,
            status: d.status,
            latitude: d.latitude,
            longitude: d.longitude,
            site: site?.name ?? "",
            country: site?.country ?? "",
            firmwareVersion: d.firmwareVersion ?? "",
          };
        });

        res.json({ devices: result, total: result.length });
      } catch (err) {
        res.status(500).json({
          error: "INTERNAL_ERROR",
          message: err instanceof Error ? err.message : "Failed to load map devices.",
        });
      }
    }
  );

  // GET /api/international/countries — list all countries
  app.get(
    "/api/international/countries",
    async (_req, res) => {
      try {
        const docs = await Country.find().sort({ name: 1 }).lean();
        const countries = docs.map((c) => ({
          code: c.code,
          name: c.name,
          timezone: c.timezone ?? "UTC",
          timezones: c.timezones ?? [],
          dialCode: c.dialCode ?? "",
        }));
        res.json(countries);
      } catch {
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
      } catch {
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
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load discovered devices." });
      }
    }
  );

  // ============================================================
  // PAIRING  (Discovery → Owner verified → Permission → Ready)
  // ============================================================
  const PAIRING_TTL_MS = 10 * 60 * 1000;
  const PAIRING_MAX_ATTEMPTS = 5;
  const PAIRING_METHODS = ["device_code", "qr", "pin", "manufacturer_credential", "certificate"];
  const hashProof = (p: string) => crypto.createHash("sha256").update(p).digest("hex");
  const proofMatches = (p: string, storedHash: string) => {
    const a = Buffer.from(hashProof(p), "hex");
    const b = Buffer.from(storedHash, "hex");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  };
  const pairView = (doc: any) => {
    const o: any = typeof doc.toObject === "function" ? doc.toObject() : { ...doc };
    delete o.proofHash;
    return o;
  };
  const pairAudit = async (user: any, action: string, result: string, deviceId?: unknown, reason?: string) => {
    try {
      await AuditLog.create({ userId: user.id, organizationId: user.organizationId, deviceId, action, result, reason });
    } catch (err) {
      console.error("[pairing] audit write failed", err);
    }
  };

  // POST /api/pairing/sessions — start pairing for a discovered device
  app.post("/api/pairing/sessions", authenticate, requirePermission("device:pair"), async (req, res) => {
    const user = req.user!;
    if (!user.organizationId) {
      res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
      return;
    }
    const { discoveryId, method, proof } = req.body ?? {};
    if (
      !mongoose.isValidObjectId(discoveryId) ||
      typeof method !== "string" || !PAIRING_METHODS.includes(method) ||
      typeof proof !== "string" || proof.length < 1 || proof.length > 256
    ) {
      res.status(400).json({ error: "BAD_REQUEST", message: "discoveryId, method and proof are required." });
      return;
    }
    try {
      const discovery = await Discovery.findById(discoveryId).lean();
      const device = discovery
        ? await Device.findOne({ _id: discovery.deviceId, organizationId: user.organizationId }).lean()
        : null;
      if (!discovery || !device) {
        res.status(404).json({ error: "NOT_FOUND", message: "Discovered device not found." });
        return;
      }
      const existing = await PairingSession.findOne({
        deviceId: device._id,
        revokedAt: null,
        $or: [
          { status: "ready" },
          { status: { $in: ["owner_verification_pending", "permission_pending"] }, expiresAt: { $gt: new Date() } },
        ],
      }).lean();
      if (existing) {
        res.status(409).json({ error: "CONFLICT", message: "Device already paired or has an active pairing session." });
        return;
      }
      const session = await PairingSession.create({
        discoveryId: discovery._id,
        deviceId: device._id,
        organizationId: user.organizationId,
        requestedBy: user.id,
        method,
        proofHash: hashProof(proof),
        expiresAt: new Date(Date.now() + PAIRING_TTL_MS),
      });
      await pairAudit(user, "pairing:start", "SUCCESS", device._id, method);
      res.status(201).json(pairView(session));
    } catch {
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to start pairing." });
    }
  });

  // GET /api/pairing/sessions/:id
  app.get("/api/pairing/sessions/:id", authenticate, requirePermission("device:read"), async (req, res) => {
    const user = req.user!;
    const id = String(req.params.id);
    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ error: "BAD_REQUEST", message: "Invalid session id." });
      return;
    }
    try {
      const session = await PairingSession.findOne({ _id: id, organizationId: user.organizationId }).select("-proofHash").lean();
      if (!session) {
        res.status(404).json({ error: "NOT_FOUND", message: "Pairing session not found." });
        return;
      }
      res.json(session);
    } catch {
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load pairing session." });
    }
  });

  // POST /api/pairing/sessions/:id/verify-owner — owner approves with proof
  app.post("/api/pairing/sessions/:id/verify-owner", authenticate, requirePermission("device:manage"), async (req, res) => {
    const user = req.user!;
    const id = String(req.params.id);
    const { proof } = req.body ?? {};
    if (!mongoose.isValidObjectId(id) || typeof proof !== "string" || proof.length < 1 || proof.length > 256) {
      res.status(400).json({ error: "BAD_REQUEST", message: "Valid session id and proof are required." });
      return;
    }
    try {
      const session = await PairingSession.findOne({ _id: id, organizationId: user.organizationId });
      if (!session) {
        res.status(404).json({ error: "NOT_FOUND", message: "Pairing session not found." });
        return;
      }
      if (session.status !== "owner_verification_pending") {
        res.status(409).json({ error: "CONFLICT", message: "Session is not awaiting owner verification." });
        return;
      }
      if (session.expiresAt.getTime() < Date.now()) {
        session.status = "expired";
        await session.save();
        res.status(410).json({ error: "EXPIRED", message: "Pairing session expired." });
        return;
      }
      if (session.attempts >= PAIRING_MAX_ATTEMPTS) {
        session.status = "failed";
        await session.save();
        await pairAudit(user, "pairing:verify-owner", "BLOCKED", session.deviceId, "too_many_attempts");
        res.status(429).json({ error: "TOO_MANY_ATTEMPTS", message: "Too many attempts. Start a new session." });
        return;
      }
      if (!proofMatches(proof, session.proofHash)) {
        session.attempts += 1;
        await session.save();
        await pairAudit(user, "pairing:verify-owner", "FAILURE", session.deviceId, "proof_mismatch");
        res.status(401).json({ error: "PROOF_INVALID", message: "Proof does not match." });
        return;
      }
      session.status = "permission_pending";
      session.ownerVerifiedBy = user.id;
      session.ownerVerifiedAt = new Date();
      await session.save();
      await pairAudit(user, "pairing:verify-owner", "SUCCESS", session.deviceId);
      res.json(pairView(session));
    } catch {
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to verify owner." });
    }
  });

  // POST /api/pairing/sessions/:id/confirm — finalize pairing
  app.post("/api/pairing/sessions/:id/confirm", authenticate, requirePermission("device:manage"), async (req, res) => {
    const user = req.user!;
    const id = String(req.params.id);
    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ error: "BAD_REQUEST", message: "Invalid session id." });
      return;
    }
    try {
      const session = await PairingSession.findOne({ _id: id, organizationId: user.organizationId });
      if (!session) {
        res.status(404).json({ error: "NOT_FOUND", message: "Pairing session not found." });
        return;
      }
      if (session.status !== "permission_pending") {
        res.status(409).json({ error: "CONFLICT", message: "Owner must be verified before confirming." });
        return;
      }
      if (session.expiresAt.getTime() < Date.now()) {
        session.status = "expired";
        await session.save();
        res.status(410).json({ error: "EXPIRED", message: "Pairing session expired." });
        return;
      }
      session.status = "ready";
      session.pairedAt = new Date();
      await session.save();
      await pairAudit(user, "pairing:confirm", "SUCCESS", session.deviceId, session.method);
      res.json(pairView(session));
    } catch {
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to confirm pairing." });
    }
  });

  // DELETE /api/pairing/sessions/:id — cancel an unfinished session
  app.delete("/api/pairing/sessions/:id", authenticate, requirePermission("device:pair"), async (req, res) => {
    const user = req.user!;
    const id = String(req.params.id);
    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ error: "BAD_REQUEST", message: "Invalid session id." });
      return;
    }
    try {
      const session = await PairingSession.findOne({ _id: id, organizationId: user.organizationId });
      if (!session) {
        res.status(404).json({ error: "NOT_FOUND", message: "Pairing session not found." });
        return;
      }
      if (session.status === "ready") {
        res.status(409).json({ error: "CONFLICT", message: "Already paired. Use unpair instead." });
        return;
      }
      session.status = "failed";
      await session.save();
      await pairAudit(user, "pairing:cancel", "SUCCESS", session.deviceId);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to cancel pairing." });
    }
  });

  // GET /api/pairing/devices — currently paired devices
  app.get("/api/pairing/devices", authenticate, requirePermission("device:read"), async (req, res) => {
    const user = req.user!;
    try {
      const paired = await PairingSession.find({
        organizationId: user.organizationId,
        status: "ready",
        revokedAt: null,
      })
        .select("-proofHash")
        .sort({ pairedAt: -1 })
        .limit(200)
        .lean();
      res.json({ devices: paired, total: paired.length });
    } catch {
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to list paired devices." });
    }
  });

  // POST /api/pairing/devices/:deviceId/unpair
  app.post("/api/pairing/devices/:deviceId/unpair", authenticate, requirePermission("device:manage"), async (req, res) => {
    const user = req.user!;
    const deviceId = String(req.params.deviceId);
    const reason = typeof req.body?.reason === "string" ? req.body.reason.slice(0, 200) : undefined;
    if (!mongoose.isValidObjectId(deviceId)) {
      res.status(400).json({ error: "BAD_REQUEST", message: "Invalid device id." });
      return;
    }
    try {
      const session = await PairingSession.findOne({
        deviceId,
        organizationId: user.organizationId,
        status: "ready",
        revokedAt: null,
      });
      if (!session) {
        res.status(404).json({ error: "NOT_FOUND", message: "No active pairing for this device." });
        return;
      }
      session.revokedAt = new Date();
      session.revokeReason = reason;
      await session.save();
      await pairAudit(user, "pairing:unpair", "SUCCESS", session.deviceId, reason);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to unpair device." });
    }
  });

  // ============================================================
  // AUTOMATION RULES (CRUD only — execution must go through the same
  // permission + safety pipeline as manual commands; not enabled here)
  // ============================================================
  const isPlainObject = (v: unknown): v is Record<string, any> =>
    typeof v === "object" && v !== null && !Array.isArray(v);
  const smallJson = (v: unknown) => JSON.stringify(v).length <= 4096;
  const autoAudit = async (user: any, action: string, result: string, reason?: string) => {
    try {
      await AuditLog.create({ userId: user.id, organizationId: user.organizationId, action, result, reason });
    } catch (err) {
      console.error("[automation] audit write failed", err);
    }
  };
  const validateRuleParts = async (
    orgId: unknown,
    body: any,
    partial: boolean
  ): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; message: string }> => {
    const data: Record<string, unknown> = {};
    if (!partial || body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length < 1 || body.name.length > 100) {
        return { ok: false, message: "name must be 1-100 characters." };
      }
      data.name = body.name.trim();
    }
    if (!partial || body.trigger !== undefined) {
      const t = body.trigger;
      if (!isPlainObject(t) || typeof t.type !== "string" || t.type.length < 1 || t.type.length > 32 || !smallJson(t)) {
        return { ok: false, message: "trigger must be an object with a string type." };
      }
      data.trigger = t;
    }
    if (!partial || body.action !== undefined) {
      const a = body.action;
      if (
        !isPlainObject(a) ||
        !mongoose.isValidObjectId(a.deviceId) ||
        typeof a.commandType !== "string" || a.commandType.length < 1 || a.commandType.length > 64 ||
        (a.payload !== undefined && !isPlainObject(a.payload)) ||
        !smallJson(a)
      ) {
        return { ok: false, message: "action must include deviceId, commandType and optional payload object." };
      }
      const owned = await Device.exists({ _id: a.deviceId, organizationId: orgId });
      if (!owned) return { ok: false, message: "action.deviceId does not belong to your organization." };
      data.action = a;
    }
    if (body.isEnabled !== undefined) {
      if (typeof body.isEnabled !== "boolean") return { ok: false, message: "isEnabled must be boolean." };
      data.isEnabled = body.isEnabled;
    }
    return { ok: true, data };
  };

  // POST /api/automation/rules — create (starts DISABLED unless isEnabled:true)
  app.post(
    "/api/automation/rules",
    authenticate,
    requirePermission("automation:manage"),
    requirePermission("device:command"),
    async (req, res) => {
      const user = req.user!;
      if (!user.organizationId) {
        res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
        return;
      }
      try {
        const body = req.body ?? {};
        const v = await validateRuleParts(user.organizationId, body, false);
        if (!v.ok) {
          res.status(400).json({ error: "BAD_REQUEST", message: v.message });
          return;
        }
        const rule = await AutomationRule.create({
          organizationId: user.organizationId,
          isEnabled: false,
          ...v.data,
        });
        await autoAudit(user, "automation:rule.create", "SUCCESS", String(rule._id));
        res.status(201).json(rule);
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to create rule." });
      }
    }
  );

  // GET /api/automation/rules/:id
  app.get("/api/automation/rules/:id", authenticate, requirePermission("automation:read"), async (req, res) => {
    const user = req.user!;
    const id = String(req.params.id);
    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ error: "BAD_REQUEST", message: "Invalid rule id." });
      return;
    }
    try {
      const rule = await AutomationRule.findOne({ _id: id, organizationId: user.organizationId }).lean();
      if (!rule) {
        res.status(404).json({ error: "NOT_FOUND", message: "Rule not found." });
        return;
      }
      res.json(rule);
    } catch {
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load rule." });
    }
  });

  // PATCH /api/automation/rules/:id
  app.patch(
    "/api/automation/rules/:id",
    authenticate,
    requirePermission("automation:manage"),
    requirePermission("device:command"),
    async (req, res) => {
      const user = req.user!;
      const id = String(req.params.id);
      if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ error: "BAD_REQUEST", message: "Invalid rule id." });
        return;
      }
      try {
        const v = await validateRuleParts(user.organizationId, req.body ?? {}, true);
        if (!v.ok) {
          res.status(400).json({ error: "BAD_REQUEST", message: v.message });
          return;
        }
        if (Object.keys(v.data).length === 0) {
          res.status(400).json({ error: "BAD_REQUEST", message: "Nothing to update." });
          return;
        }
        const rule = await AutomationRule.findOneAndUpdate(
          { _id: id, organizationId: user.organizationId },
          { $set: v.data },
          { new: true }
        ).lean();
        if (!rule) {
          res.status(404).json({ error: "NOT_FOUND", message: "Rule not found." });
          return;
        }
        await autoAudit(user, "automation:rule.update", "SUCCESS", id);
        res.json(rule);
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to update rule." });
      }
    }
  );

  // DELETE /api/automation/rules/:id
  app.delete("/api/automation/rules/:id", authenticate, requirePermission("automation:manage"), async (req, res) => {
    const user = req.user!;
    const id = String(req.params.id);
    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ error: "BAD_REQUEST", message: "Invalid rule id." });
      return;
    }
    try {
      const del = await AutomationRule.deleteOne({ _id: id, organizationId: user.organizationId });
      if (del.deletedCount === 0) {
        res.status(404).json({ error: "NOT_FOUND", message: "Rule not found." });
        return;
      }
      await autoAudit(user, "automation:rule.delete", "SUCCESS", id);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to delete rule." });
    }
  });

  // POST /api/automation/rules/:id/enable | /disable
  for (const [verb, flag] of [["enable", true], ["disable", false]] as const) {
    app.post(
      `/api/automation/rules/:id/${verb}`,
      authenticate,
      requirePermission("automation:manage"),
      async (req, res) => {
        const user = req.user!;
        const id = String(req.params.id);
        if (!mongoose.isValidObjectId(id)) {
          res.status(400).json({ error: "BAD_REQUEST", message: "Invalid rule id." });
          return;
        }
        try {
          const rule = await AutomationRule.findOneAndUpdate(
            { _id: id, organizationId: user.organizationId },
            { $set: { isEnabled: flag } },
            { new: true }
          ).lean();
          if (!rule) {
            res.status(404).json({ error: "NOT_FOUND", message: "Rule not found." });
            return;
          }
          await autoAudit(user, `automation:rule.${verb}`, "SUCCESS", id);
          res.json(rule);
        } catch {
          res.status(500).json({ error: "INTERNAL_ERROR", message: `Failed to ${verb} rule.` });
        }
      }
    );
  }

  // ============================================================
  // SAFETY CHECK (dry-run) + DEVICE SAFETY STATUS
  // ============================================================
  // POST /api/safety/check  body: { deviceId, commandType, payload? }
  // Dry-run: runs the SAME emergency-stop guard + Safety Engine as a real
  // command, but creates NO command and dispatches NOTHING to the device.
  // (A BLOCKED result is still recorded in SafetyLog by the engine.)
  app.post("/api/safety/check", authenticate, requirePermission("device:read"), async (req, res) => {
    const user = req.user!;
    if (!user.organizationId) {
      res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
      return;
    }
    const { deviceId, commandType, payload } = req.body ?? {};
    if (
      !mongoose.isValidObjectId(deviceId) ||
      typeof commandType !== "string" || commandType.length < 1 || commandType.length > 64 ||
      (payload !== undefined && (typeof payload !== "object" || payload === null || Array.isArray(payload)))
    ) {
      res.status(400).json({ error: "BAD_REQUEST", message: "deviceId and commandType are required; payload must be an object." });
      return;
    }
    try {
      const device = await Device.findOne({ _id: deviceId, organizationId: user.organizationId })
        .select("name type criticality")
        .lean();
      if (!device) {
        res.status(404).json({ error: "NOT_FOUND", message: "Device not found." });
        return;
      }
      const criticality = (device as { criticality?: string }).criticality ?? "facility";

      const activeStop = await EmergencyStop.findOne({
        organizationId: user.organizationId,
        releasedAt: { $exists: false },
        $or: [{ scope: "organization" }, { deviceId }],
      }).lean();
      if (activeStop) {
        res.json({
          dryRun: true,
          allowed: false,
          requiresConfirmation: false,
          criticality,
          ruleName: "EMERGENCY_STOP",
          blockingReason: "Emergency stop active: " + activeStop.reason,
          message: "Command would be blocked.",
        });
        return;
      }

      const result = await evaluateSafetyForDevice(deviceId, user.organizationId, commandType, { payload });
      const allowed = result.decision === "ALLOWED";
      res.json({
        dryRun: true,
        allowed,
        requiresConfirmation: false,
        criticality,
        ruleId: result.ruleId,
        ruleName: result.ruleName,
        blockingReason: allowed ? undefined : result.reason,
        message: allowed ? "Command would pass the safety check." : "Command would be blocked.",
      });
    } catch (err) {
      console.error("[SAFETY] check failed:", err);
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Safety check failed (treat as blocked)." });
    }
  });

  // GET /api/safety/devices — safety status of every device in the organization
  app.get("/api/safety/devices", authenticate, requirePermission("device:read"), async (req, res) => {
    const user = req.user!;
    if (!user.organizationId) {
      res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
      return;
    }
    try {
      const devices = await Device.find({ organizationId: user.organizationId })
        .select("name deviceCode type status criticality")
        .limit(500)
        .lean();
      const stops = await EmergencyStop.find({
        organizationId: user.organizationId,
        releasedAt: { $exists: false },
      }).lean();
      const orgStop = stops.find((x: any) => x.scope === "organization");
      const ids = devices.map((d: any) => d._id);
      const lastEvents = ids.length
        ? await SafetyLog.aggregate([
            { $match: { deviceId: { $in: ids } } },
            { $sort: { createdAt: -1 } },
            { $group: { _id: "$deviceId", eventType: { $first: "$eventType" }, severity: { $first: "$severity" }, message: { $first: "$message" }, occurredAt: { $first: "$createdAt" } } },
          ])
        : [];
      const lastById = new Map(lastEvents.map((e: any) => [String(e._id), e]));
      const out = devices.map((d: any) => {
        const own = stops.find((x: any) => x.deviceId && String(x.deviceId) === String(d._id));
        const stopped = Boolean(orgStop || own);
        const critical = (d.criticality ?? "facility") === "life_support";
        const last = lastById.get(String(d._id));
        return {
          deviceId: d._id,
          name: d.name,
          deviceCode: d.deviceCode,
          type: d.type,
          status: d.status,
          criticality: d.criticality ?? "facility",
          controlMode: critical ? "read_only" : "controlled",
          isEmergencyStopped: stopped,
          lastEvent: last
            ? { eventType: last.eventType, severity: last.severity, message: last.message, occurredAt: last.occurredAt }
            : undefined,
        };
      });
      res.json({ devices: out, total: out.length, emergencyStopActive: stops.length > 0 });
    } catch (err) {
      console.error("[SAFETY] device status failed:", err);
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load device safety status." });
    }
  });

  // ============================================================
  // AUTOMATION SCENES — activation runs EVERY action through the same
  // pipeline as a manual command: emergency-stop guard → Safety Engine →
  // gateway dispatch → audit. bypassSafety is never accepted.
  // ============================================================
  const SCENE_MAX_ACTIONS = 20;
  const validateScene = async (
    orgId: unknown,
    body: any,
    partial: boolean
  ): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; message: string }> => {
    const data: Record<string, unknown> = {};
    if (!partial || body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length < 1 || body.name.length > 100) {
        return { ok: false, message: "name must be 1-100 characters." };
      }
      data.name = body.name.trim();
    }
    if (body.description !== undefined) {
      if (typeof body.description !== "string" || body.description.length > 500) {
        return { ok: false, message: "description must be a string up to 500 characters." };
      }
      data.description = body.description;
    }
    if (body.roomId !== undefined) {
      if (!mongoose.isValidObjectId(body.roomId)) return { ok: false, message: "roomId is invalid." };
      data.roomId = body.roomId;
    }
    if (!partial || body.actions !== undefined) {
      const acts = body.actions;
      if (!Array.isArray(acts) || acts.length < 1 || acts.length > SCENE_MAX_ACTIONS) {
        return { ok: false, message: `actions must be an array of 1-${SCENE_MAX_ACTIONS} items.` };
      }
      const clean: Record<string, unknown>[] = [];
      for (const a of acts) {
        if (
          !isPlainObject(a) ||
          "bypassSafety" in a ||
          !mongoose.isValidObjectId(a.deviceId) ||
          typeof a.commandType !== "string" || a.commandType.length < 1 || a.commandType.length > 64 ||
          (a.payload !== undefined && !isPlainObject(a.payload)) ||
          !smallJson(a)
        ) {
          return { ok: false, message: "each action needs deviceId + commandType (+ optional payload object); bypassSafety is not allowed." };
        }
        clean.push({ deviceId: a.deviceId, commandType: a.commandType, ...(a.payload ? { payload: a.payload } : {}) });
      }
      const ids = [...new Set(clean.map((a) => String(a.deviceId)))];
      const owned = await Device.find({ _id: { $in: ids }, organizationId: orgId }).select("criticality").lean();
      if (owned.length !== ids.length) {
        return { ok: false, message: "every action deviceId must belong to your organization." };
      }
      if (owned.some((d: any) => d.criticality === "life_support")) {
        return { ok: false, message: "life_support devices cannot be part of a scene." };
      }
      data.actions = clean;
    }
    return { ok: true, data };
  };

  // POST /api/automation/scenes
  app.post("/api/automation/scenes", authenticate, requirePermission("automation:manage"), requirePermission("device:command"), async (req, res) => {
    const user = req.user!;
    if (!user.organizationId) {
      res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
      return;
    }
    try {
      const v = await validateScene(user.organizationId, req.body ?? {}, false);
      if (!v.ok) {
        res.status(400).json({ error: "BAD_REQUEST", message: v.message });
        return;
      }
      const scene = await AutomationScene.create({ organizationId: user.organizationId, createdBy: user.id, ...v.data });
      await autoAudit(user, "automation:scene.create", "SUCCESS", String(scene._id));
      res.status(201).json(scene);
    } catch {
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to create scene." });
    }
  });

  // GET /api/automation/scenes
  app.get("/api/automation/scenes", authenticate, requirePermission("automation:read"), async (req, res) => {
    try {
      const scenes = await AutomationScene.find({ organizationId: req.user!.organizationId }).sort({ createdAt: -1 }).limit(200).lean();
      res.json({ scenes, total: scenes.length });
    } catch {
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to list scenes." });
    }
  });

  // GET /api/automation/scenes/:id
  app.get("/api/automation/scenes/:id", authenticate, requirePermission("automation:read"), async (req, res) => {
    const id = String(req.params.id);
    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ error: "BAD_REQUEST", message: "Invalid scene id." });
      return;
    }
    try {
      const scene = await AutomationScene.findOne({ _id: id, organizationId: req.user!.organizationId }).lean();
      if (!scene) {
        res.status(404).json({ error: "NOT_FOUND", message: "Scene not found." });
        return;
      }
      res.json(scene);
    } catch {
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load scene." });
    }
  });

  // PUT /api/automation/scenes/:id
  app.put("/api/automation/scenes/:id", authenticate, requirePermission("automation:manage"), requirePermission("device:command"), async (req, res) => {
    const user = req.user!;
    const id = String(req.params.id);
    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ error: "BAD_REQUEST", message: "Invalid scene id." });
      return;
    }
    try {
      const v = await validateScene(user.organizationId, req.body ?? {}, true);
      if (!v.ok) {
        res.status(400).json({ error: "BAD_REQUEST", message: v.message });
        return;
      }
      if (Object.keys(v.data).length === 0) {
        res.status(400).json({ error: "BAD_REQUEST", message: "Nothing to update." });
        return;
      }
      const scene = await AutomationScene.findOneAndUpdate({ _id: id, organizationId: user.organizationId }, { $set: v.data }, { new: true }).lean();
      if (!scene) {
        res.status(404).json({ error: "NOT_FOUND", message: "Scene not found." });
        return;
      }
      await autoAudit(user, "automation:scene.update", "SUCCESS", id);
      res.json(scene);
    } catch {
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to update scene." });
    }
  });

  // DELETE /api/automation/scenes/:id
  app.delete("/api/automation/scenes/:id", authenticate, requirePermission("automation:manage"), async (req, res) => {
    const user = req.user!;
    const id = String(req.params.id);
    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ error: "BAD_REQUEST", message: "Invalid scene id." });
      return;
    }
    try {
      const del = await AutomationScene.deleteOne({ _id: id, organizationId: user.organizationId });
      if (del.deletedCount === 0) {
        res.status(404).json({ error: "NOT_FOUND", message: "Scene not found." });
        return;
      }
      await autoAudit(user, "automation:scene.delete", "SUCCESS", id);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to delete scene." });
    }
  });

  // POST /api/automation/scenes/:id/activate
  app.post("/api/automation/scenes/:id/activate", authenticate, deviceCommandRateLimiter, requirePermission("device:command"), async (req, res) => {
    const user = req.user!;
    const id = String(req.params.id);
    if (!user.organizationId || !mongoose.isValidObjectId(id)) {
      res.status(400).json({ error: "BAD_REQUEST", message: "Valid scene id and organization required." });
      return;
    }
    try {
      const scene: any = await AutomationScene.findOne({ _id: id, organizationId: user.organizationId }).lean();
      if (!scene) {
        res.status(404).json({ error: "NOT_FOUND", message: "Scene not found." });
        return;
      }
      const results: Array<Record<string, unknown>> = [];
      for (const act of scene.actions ?? []) {
        const deviceId = String(act.deviceId);
        const commandType = String(act.commandType);
        const payload = act.payload;
        const orgId = String(user.organizationId);

        const blocked = async (reason: string, ruleName?: string) => {
          const cmd = await Command.create({
            deviceId, userId: user.id, type: commandType, payload,
            status: "blocked", response: { reason, ruleName }, sentAt: new Date(), completedAt: new Date(),
          });
          await auditDeviceCommand(user.id, deviceId, commandType, "BLOCKED", orgId, { reason: `${reason} (scene ${id})` });
          results.push({ deviceId, commandType, status: "blocked", reason, commandId: cmd._id });
        };

        const activeStop = await EmergencyStop.findOne({
          organizationId: user.organizationId,
          releasedAt: { $exists: false },
          $or: [{ scope: "organization" }, { deviceId }],
        }).lean();
        if (activeStop) {
          await blocked("Emergency stop active: " + activeStop.reason, "EMERGENCY_STOP");
          continue;
        }

        const safety = await evaluateSafetyForDevice(deviceId, orgId, commandType, { payload });
        if (safety.decision === "BLOCKED") {
          await blocked(safety.reason ?? "Blocked by safety.", safety.ruleName);
          continue;
        }

        const device: any = await Device.findOne({ _id: deviceId, organizationId: user.organizationId }).lean();
        if (!device) {
          await blocked("Device not found.");
          continue;
        }
        const command = await Command.create({ deviceId, userId: user.id, type: commandType, payload, status: "pending" });
        const dispatchResult = await gatewayDispatcher.dispatch({
          deviceId,
          organizationId: orgId,
          commandId: String(command._id),
          command: { deviceId, deviceCode: device.deviceCode, deviceType: device.type, commandType, payload },
        });
        await applyDispatchResult(String(command._id), dispatchResult);
        if (dispatchResult.status === "success") {
          await auditDeviceCommand(user.id, deviceId, commandType, "SUCCESS", orgId, { reason: `scene ${id}` });
        } else if (dispatchResult.status === "failed") {
          await auditDeviceCommand(user.id, deviceId, commandType, "FAILURE", orgId, {
            reason: `${dispatchResult.message} (scene ${id})`,
            code: dispatchResult.code,
          });
        }
        results.push({ deviceId, commandType, status: dispatchResult.status, commandId: command._id });
      }
      const issued = results.filter((r) => r.status === "success").length;
      const blockedCount = results.filter((r) => r.status === "blocked").length;
      await autoAudit(user, "automation:scene.activate", blockedCount ? "PARTIAL" : "SUCCESS", `${id} issued=${issued} blocked=${blockedCount}`);
      res.json({ success: blockedCount === 0 && issued === results.length, commandsIssued: issued, blocked: blockedCount, total: results.length, results });
    } catch (err) {
      console.error("[SCENES] activate failed:", err);
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to activate scene." });
    }
  });

  // ============================================================
  // ACCOUNT RECOVERY (email OTP → recovery token → NEW password)
  // Never reveals whether an account exists. OTP: 6 digits, HMAC-stored,
  // single use, 10 min, 5 attempts. Success revokes ALL old sessions.
  // Delivery: no email/SMS provider yet. The OTP is printed to the server
  // log ONLY when NODE_ENV !== "production"; in production nothing is sent.
  // ============================================================
  const REC_OTP_MS = 10 * 60 * 1000;
  const REC_TOKEN_MS = 15 * 60 * 1000;
  const REC_MAX_ATTEMPTS = 5;
  const recHmac = (sessionId: string, code: string) =>
    crypto.createHmac("sha256", String(process.env.JWT_ACCESS_SECRET) + ":" + sessionId).update(code).digest("hex");
  const recSha = (v: string) => crypto.createHash("sha256").update(v).digest("hex");
  const recSafeEq = (a: string, b: string) => {
    const x = Buffer.from(a, "hex");
    const y = Buffer.from(b, "hex");
    return x.length === y.length && crypto.timingSafeEqual(x, y);
  };
  const recPasswordOk = (pw: unknown): pw is string =>
    typeof pw === "string" && pw.length >= 6 && pw.length <= 128 && /[A-Za-z]/.test(pw) && /\d/.test(pw) && /[^A-Za-z0-9]/.test(pw);
  const recAudit = async (userId: unknown, orgId: unknown, action: string, result: string, reason?: string) => {
    try {
      await AuditLog.create({ userId, organizationId: orgId, action, result, reason });
    } catch (err) {
      console.error("[recovery] audit failed", err);
    }
  };

  // POST /api/recovery/initiate  body: { email }
  app.post("/api/recovery/initiate", authRateLimiter, async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const expiresAt = new Date(Date.now() + REC_OTP_MS);
    const generic = (id: string) =>
      res.json({ recoverySessionId: id, expiresAt, message: "If the account exists, a verification code has been sent." });
    if (!email || email.length > 254) {
      res.status(400).json({ error: "BAD_REQUEST", message: "email is required." });
      return;
    }
    try {
      const user: any = await User.findOne({ email, isActive: true }).lean();
      if (!user) {
        generic(String(new mongoose.Types.ObjectId())); // same shape, nothing created
        return;
      }
      const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
      const sid = new mongoose.Types.ObjectId();
      await RecoverySession.updateMany({ userId: user._id, completedAt: null, cancelledAt: null }, { $set: { cancelledAt: new Date() } });
      await RecoverySession.create({ _id: sid, userId: user._id, codeHash: recHmac(String(sid), code), expiresAt });
      if (process.env.NODE_ENV !== "production") {
        console.log(`[RECOVERY][DEV ONLY] OTP for ${email}: ${code}`);
      } else {
        console.warn("[RECOVERY] no email/SMS provider configured — OTP not delivered");
      }
      await recAudit(user._id, user.organizationId, "recovery:initiate", "SUCCESS");
      generic(String(sid));
    } catch (err) {
      console.error("[recovery] initiate failed", err);
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Recovery failed." });
    }
  });

  // POST /api/recovery/otp/verify  body: { recoverySessionId, code }
  app.post("/api/recovery/otp/verify", authRateLimiter, async (req, res) => {
    const { recoverySessionId, code } = req.body ?? {};
    if (!mongoose.isValidObjectId(recoverySessionId) || typeof code !== "string" || !/^\d{6}$/.test(code)) {
      res.status(401).json({ error: "INVALID_CODE", message: "Invalid or expired code." });
      return;
    }
    try {
      const sess: any = await RecoverySession.findOneAndUpdate(
        {
          _id: recoverySessionId,
          verifiedAt: null, completedAt: null, cancelledAt: null,
          expiresAt: { $gt: new Date() },
          attempts: { $lt: REC_MAX_ATTEMPTS },
        },
        { $inc: { attempts: 1 } },
        { new: true }
      );
      if (!sess || !recSafeEq(recHmac(String(sess._id), code), sess.codeHash)) {
        if (sess) await recAudit(sess.userId, undefined, "recovery:otp", "FAILURE", "wrong_code");
        res.status(401).json({ error: "INVALID_CODE", message: "Invalid or expired code." });
        return;
      }
      const token = crypto.randomBytes(32).toString("hex");
      await RecoverySession.updateOne(
        { _id: sess._id },
        { $set: { verifiedAt: new Date(), tokenHash: recSha(token), tokenExpiresAt: new Date(Date.now() + REC_TOKEN_MS) } }
      );
      await recAudit(sess.userId, undefined, "recovery:otp", "SUCCESS");
      res.json({ verified: true, recoveryToken: token, expiresAt: new Date(Date.now() + REC_TOKEN_MS) });
    } catch (err) {
      console.error("[recovery] verify failed", err);
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Verification failed." });
    }
  });

  // POST /api/recovery/password/reset  body: { recoveryToken, newPassword }
  app.post("/api/recovery/password/reset", authRateLimiter, async (req, res) => {
    const { recoveryToken, newPassword } = req.body ?? {};
    if (typeof recoveryToken !== "string" || recoveryToken.length !== 64) {
      res.status(401).json({ error: "INVALID_TOKEN", message: "Invalid or expired recovery token." });
      return;
    }
    if (!recPasswordOk(newPassword)) {
      res.status(400).json({ error: "WEAK_PASSWORD", message: "Password must be 6+ characters with a letter, a number and a symbol." });
      return;
    }
    try {
      const sess: any = await RecoverySession.findOneAndUpdate(
        { tokenHash: recSha(recoveryToken), verifiedAt: { $ne: null }, completedAt: null, cancelledAt: null, tokenExpiresAt: { $gt: new Date() } },
        { $set: { completedAt: new Date() } }
      );
      if (!sess) {
        res.status(401).json({ error: "INVALID_TOKEN", message: "Invalid or expired recovery token." });
        return;
      }
      const passwordHash = await bcrypt.hash(newPassword, 12);
      const user: any = await User.findByIdAndUpdate(sess.userId, { $set: { passwordHash } });
      await Session.deleteMany({ userId: sess.userId }); // revoke all old sessions
      await recAudit(sess.userId, user?.organizationId, "recovery:password.reset", "SUCCESS");
      res.json({ success: true, message: "Password updated. Please log in again." });
    } catch (err) {
      console.error("[recovery] reset failed", err);
      res.status(500).json({ error: "INTERNAL_ERROR", message: "Password reset failed." });
    }
  });

  // POST /api/recovery/cancel  body: { recoverySessionId }
  app.post("/api/recovery/cancel", authRateLimiter, async (req, res) => {
    const id = req.body?.recoverySessionId;
    if (mongoose.isValidObjectId(id)) {
      await RecoverySession.updateOne({ _id: id, completedAt: null }, { $set: { cancelledAt: new Date() } }).catch(() => {});
    }
    res.json({ success: true }); // same answer whether or not it existed
  });

  // GET /api/international/languages — list all supported languages
  app.get(
    "/api/international/languages",
    async (req, res) => {
      try {
        const languages = await Language.find().lean();
        res.json({ languages, total: languages.length });
      } catch {
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
      } catch {
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
      } catch {
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
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load invoices." });
      }
    }
  );

  // GET /api/billing/invoices/:id/download — download an invoice
  // NOTE: no PDF library is available in this project yet (checked
  // package.json). Returns a plain-text invoice summary as a downloadable
  // file for now — matches the frontend's .blob() contract without
  // pretending a real PDF exists. Swap for real PDF generation once a
  // library (e.g. pdfkit) is added.
  app.get(
    "/api/billing/invoices/:id/download",
    authenticate,
    requirePermission("org:read"),
    async (req, res) => {
      const user = req.user!;
      try {
        const invoice = await Invoice.findOne({
          _id: req.params.id,
          organizationId: user.organizationId,
        }).lean();
        if (!invoice) {
          res.status(404).json({ error: "NOT_FOUND", message: "Invoice not found." });
          return;
        }

        const text = [
          "KSV Invoice",
          `Invoice ID: ${invoice._id}`,
          `Organization: ${invoice.organizationId}`,
          `Amount: ${invoice.amount} ${invoice.currency}`,
          `Status: ${invoice.status}`,
          `Issued: ${invoice.issuedAt}`,
          `Due: ${invoice.dueAt || "N/A"}`,
        ].join("\n");

        res.setHeader("Content-Type", "text/plain");
        res.setHeader("Content-Disposition", `attachment; filename="invoice-${invoice._id}.txt"`);
        res.send(text);
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to download invoice." });
      }
    }
  );

  // POST /api/billing/payment-methods — add a payment method
  // "token" is a payment-processor token (e.g. Stripe), never a raw
  // card number — only last4 is ever stored (FULL_CARD_NUMBER_NEVER_STORED).
  app.post(
    "/api/billing/payment-methods",
    authenticate,
    requirePermission("org:manage"),
    async (req, res) => {
      const _user = req.user!;
      const { type, token } = req.body || {};

      const validTypes = ["card", "bank", "wallet"];
      if (!type || !validTypes.includes(type)) {
        res.status(400).json({ error: "BAD_REQUEST", message: `type must be one of: ${validTypes.join(", ")}` });
        return;
      }
      if (!token || typeof token !== "string") {
        res.status(400).json({ error: "BAD_REQUEST", message: "token (payment processor token) is required." });
        return;
      }

      // KSV currently has no payment-processor integration.
      // Do not derive or invent last4 from an opaque processor token.
      // A real processor integration must provide the verified last4.
      res.status(503).json({
        error: "PAYMENT_PROCESSOR_NOT_CONFIGURED",
        message: "Payment processor integration is not configured.",
      });
    }
  );

  // DELETE /api/billing/payment-methods/:id — remove a payment method
  app.delete(
    "/api/billing/payment-methods/:id",
    authenticate,
    requirePermission("org:manage"),
    async (req, res) => {
      const user = req.user!;
      try {
        const result = await PaymentMethod.deleteOne({
          _id: req.params.id,
          organizationId: user.organizationId,
        });
        if (result.deletedCount === 0) {
          res.status(404).json({ error: "NOT_FOUND", message: "Payment method not found." });
          return;
        }
        res.json({ success: true });
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to remove payment method." });
      }
    }
  );

  // GET /api/billing/usage — current usage vs plan limit
  // NOTE: only "devices" is reported — the only metric with real tracked
  // data (Device count). "commands" and "storage" usage are not tracked
  // anywhere in this codebase yet, so they are omitted rather than faked.
  app.get(
    "/api/billing/usage",
    authenticate,
    requirePermission("org:read"),
    async (req, res) => {
      const user = req.user!;
      const planDeviceLimits: Record<string, number> = { free: 5, pro: 50, enterprise: 9999 };
      try {
        const subscription = await OrganizationSubscription.findOne({ organizationId: user.organizationId }).lean();
        const planId = subscription?.planId || "free";
        const limit = planDeviceLimits[planId] ?? planDeviceLimits.free;
        const currentValue = await Device.countDocuments({ organizationId: user.organizationId });

        res.json({
          usage: [
            { organizationId: String(user.organizationId), metricType: "devices", currentValue, limit },
          ],
        });
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load usage." });
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
      } catch {
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
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to update subscription." });
      }
    }
  );

  // DELETE /api/billing/subscriptions/:id — cancel a subscription
  app.delete(
    "/api/billing/subscriptions/:id",
    authenticate,
    requirePermission("org:manage"),
    async (req, res) => {
      const user = req.user!;
      try {
        const subscription = await OrganizationSubscription.findOne({
          _id: req.params.id,
          organizationId: user.organizationId,
        });
        if (!subscription) {
          res.status(404).json({ error: "NOT_FOUND", message: "Subscription not found." });
          return;
        }

        subscription.status = "cancelled";
        await subscription.save();

        res.json({ subscription });
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to cancel subscription." });
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
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to create subscription." });
      }
    }
  );



  // ============================================================
// AI Device Entity Resolution
// Resolves a natural-language device reference only inside the
// authenticated user's organization. No command is executed here.
// ============================================================
async function resolveAIDevice(
  naturalLanguageInput: string,
  organizationId: unknown,
) {
  if (!organizationId) {
    return {
      status: "error" as const,
      reason: "Authenticated user has no organizationId.",
    };
  }

  const text = naturalLanguageInput.trim();
  if (!text) {
    return {
      status: "not_found" as const,
      reason: "No device reference was provided.",
    };
  }

  const orgId = String(organizationId);

  // Prefer an explicit device code such as DEV-04821.
  const codeMatch = text.match(/\bDEV-[A-Z0-9_-]+\b/i);

  if (codeMatch) {
    const deviceCode = codeMatch[0].toUpperCase();

    const device = await Device.findOne({
      deviceCode,
      organizationId,
    }).lean();

    if (!device) {
      return {
        status: "not_found" as const,
        reason: `Device code ${deviceCode} was not found in the authenticated organization.`,
      };
    }

    return {
      status: "resolved" as const,
      device,
      matchedBy: "deviceCode" as const,
    };
  }

  // Otherwise match the device name within the authenticated organization.
  const devices = await Device.find({
    organizationId,
    name: { $regex: text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" },
  })
    .select("_id name deviceCode type status organizationId")
    .limit(10)
    .lean();

  if (devices.length === 1) {
    return {
      status: "resolved" as const,
      device: devices[0],
      matchedBy: "name" as const,
    };
  }

  if (devices.length > 1) {
    return {
      status: "ambiguous" as const,
      devices,
      reason: `Multiple devices matched the reference inside organization ${orgId}.`,
    };
  }

  return {
    status: "not_found" as const,
    reason: "No matching device was found in the authenticated organization.",
  };
}

// POST /api/ai/interpret — AI Orchestration (MOCK)
  // NOTE: no AI provider API key is configured yet. This uses a simple
  // keyword-matching stub so the pipeline (auth -> session -> audit) can
  // be built and tested now, and swapped for a real model call later
  // without changing the route contract.
  app.post(
    "/api/ai/interpret",
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
        // --- Deterministic intent interpretation ---
        // Interpretation produces intent only. It does not execute a device command.
        // Command types are restricted to the real KSV command contract.
        const intentResult = interpretIntent({ text: naturalLanguageInput });

        let resolvedDevice: Awaited<ReturnType<typeof resolveAIDevice>> | null = null;
        let deviceResolutionReason: string | undefined;

        if (intentResult.intent === "control_request") {
          resolvedDevice = await resolveAIDevice(
            naturalLanguageInput,
            user.organizationId,
          );

          if (resolvedDevice.status !== "resolved") {
            deviceResolutionReason = resolvedDevice.reason;
          }
        }

        const resolvedDeviceData =
          resolvedDevice?.status === "resolved"
            ? resolvedDevice.device
            : null;

        const commandReady =
          intentResult.intent === "control_request" &&
          !!intentResult.commandType &&
          resolvedDeviceData !== null;

        const requiresClarification =
          intentResult.requiresClarification ||
          (intentResult.intent === "control_request" && !commandReady);

        const assistantMessage =
          intentResult.intent === "greeting"
            ? "សួស្ដីបង 👋 ខ្ញុំជា KHOEM-AI។ បងអាចសួរខ្ញុំអំពីឧបករណ៍ ស្ថានភាព ឬសកម្មភាពដែលបងចង់ធ្វើបាន។"
            : intentResult.intent === "question"
              ? "បានបង។ បងអាចសួរខ្ញុំបានដោយផ្ទាល់ ហើយខ្ញុំនឹងព្យាយាមយល់សំណួរ និងឆ្លើយតាមអ្វីដែល KHOEM-AI អាចធ្វើបាន។"
              : undefined;

        const result = {
          requestId: `ai-${Date.now()}`,
          confidence: commandReady
            ? intentResult.confidence
            : Math.min(intentResult.confidence, 0.2),
          intent: intentResult.intent,
          assistantMessage: guardRespectfulResponse(naturalLanguageInput, /[\u1780-\u17FF]/.test(naturalLanguageInput) ? "km" : "en") ?? assistantMessage,
          structuredCommand: commandReady
            ? {
                deviceId: String(resolvedDeviceData!._id),
                commandType: intentResult.commandType,
              }
            : undefined,
          requiresClarification,
          ambiguityOptions: requiresClarification
            ? [{
                label:
                  deviceResolutionReason ||
                  "សូមបញ្ជាក់ឧបករណ៍ និងសកម្មភាពដែលបងត្រូវការ។",
                structuredCommand: null,
              }]
            : undefined,
          reasoning: deviceResolutionReason
            ? `${intentResult.reason} ${deviceResolutionReason}`
            : intentResult.reason,
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
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to interpret input." });
      }
    }
  );


  // GET /api/ai/sessions/:id — fetch one AI conversation session
  app.get(
    "/api/ai/sessions/:id",
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
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load session." });
      }
    }
  );

  // DELETE /api/ai/sessions/:id — delete a session (privacy)
  app.delete(
    "/api/ai/sessions/:id",
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
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to delete session." });
      }
    }
  );


  // POST /api/ai/interpret/confirm — user confirms an ambiguous
  // AI interpretation by picking one of the ambiguityOptions returned
  // from /api/ai/interpret.
  app.post(
    "/api/ai/interpret/confirm",
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
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to confirm interpretation." });
      }
    }
  );


  // GET /api/ai/models — list AI model profiles the org may use
  // NOTE: static list for now (no AIModelProfile DB table yet — no real
  // provider is configured). Only "internal" (the mock interpreter) is
  // enabled. Swap for a DB-backed list once Anthropic/OpenAI keys exist.
  app.get(
    "/api/ai/models",
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


  // POST /api/ai/models/:id/enable — Admin: toggle a model's enabled flag
  // NOTE: models are a static in-memory list for now (no AIModelProfile DB
  // table — no real provider configured yet). "internal-mock-v1" cannot be
  // disabled since it is the only working interpreter right now.
  app.post(
    "/api/ai/models/:id/enable",
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
      const countriesDeployed = (await Site.distinct("country", { organizationId: orgId, country: { $ne: null } })).length;
      res.json({ totalDevices, onlineDevices, safetyRules, gateways, warningDevices, countriesDeployed });
    } catch {
      res.status(500).json({ error: "INTERNAL_ERROR" });
    }
  });


  // GET /api/dashboard/full — full dashboard data in one call
  app.get(
    "/api/dashboard/full",
    authenticate,
    requirePermission("device:read"),
    async (req, res) => {
      const user = req.user!;
      if (!user.organizationId) {
        res.status(400).json({ error: "BAD_REQUEST", message: "No organizationId on user." });
        return;
      }
      const orgId = user.organizationId;
      try {
        const now = new Date();
        const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const since24d = new Date(now.getTime() - 24 * 24 * 60 * 60 * 1000);

        const [
          totalDevices,
          onlineDevices,
          warningDevices,
          safetyRulesCount,
          gatewayIdsForCount,
          countriesDeployed,
          trafficRaw,
          alertRaw,
          openAlerts,
          latencyRaw,
          org,
        ] = await Promise.all([
          Device.countDocuments({ organizationId: orgId }),
          Device.countDocuments({ organizationId: orgId, status: "online" }),
          Device.countDocuments({ organizationId: orgId, status: "warning" }),
          SafetyRule.countDocuments({ organizationId: orgId, isEnabled: true }),
          Device.find({ organizationId: orgId, gatewayId: { $ne: null } }).distinct("gatewayId"),
          Site.distinct("country", { organizationId: orgId, country: { $ne: null } }),
          Command.aggregate([
            { $match: { createdAt: { $gte: since24h } } },
            { $group: { _id: { $hour: "$createdAt" }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ]),
          SafetyLog.aggregate([
            { $match: { createdAt: { $gte: since24d } } },
            { $group: { _id: { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
            { $limit: 24 },
          ]),
          SecurityIncident.countDocuments({ organizationId: orgId, status: { $ne: "resolved" } }),
          Command.aggregate([
            {
              $match: {
                sentAt: { $gte: since24h, $ne: null },
                completedAt: { $ne: null },
              },
            },
            {
              $project: {
                latency: { $subtract: ["$completedAt", "$sentAt"] },
              },
            },
            { $group: { _id: null, avg: { $avg: "$latency" } } },
          ]),
          Organization.findById(orgId).lean(),
        ]);

        const gatewaysOnline = await Gateway.countDocuments({
          _id: { $in: gatewayIdsForCount },
          status: "online",
        });

        // Fill 24 hourly buckets
        const trafficByHour: Record<number, number> = {};
        for (const t of trafficRaw) trafficByHour[t._id] = t.count;
        const traffic: number[] = [];
        for (let h = 0; h < 24; h++) traffic.push(trafficByHour[h] ?? 0);

        // Alert trend → last 24 points (fill zeros if missing)
        const alertTrend: number[] = alertRaw.map((a: { count: number }) => a.count);
        while (alertTrend.length < 24) alertTrend.unshift(0);

        const avgLatencyMs = latencyRaw.length > 0 ? Math.round(latencyRaw[0].avg) : 0;

        const createdAt = org?.createdAt instanceof Date ? org.createdAt : now;
        const uptimeDays = Math.max(1, Math.floor((now.getTime() - createdAt.getTime()) / (24 * 60 * 60 * 1000)));

        // Top sites by device count
        const topSitesRaw = await Device.aggregate([
          { $match: { organizationId: orgId, siteId: { $ne: null } } },
          {
            $group: {
              _id: "$siteId",
              total: { $sum: 1 },
              online: { $sum: { $cond: [{ $eq: ["$status", "online"] }, 1, 0] } },
            },
          },
          { $sort: { total: -1 } },
          { $limit: 5 },
        ]);
        const siteIds = topSitesRaw.map((s: { _id: unknown }) => s._id);
        const siteDocs = await Site.find({ _id: { $in: siteIds } }).lean();
        const siteById = new Map(siteDocs.map((s) => [String(s._id), s]));
        const topSites = topSitesRaw.map((s: { _id: unknown; total: number; online: number }) => {
          const site = siteById.get(String(s._id));
          return {
            name: site?.name ?? "Unknown",
            devices: s.total,
            load: s.total > 0 ? Math.round((s.online / s.total) * 100) : 0,
          };
        });

        // Recent devices
        const recentDevicesRaw = await Device.find({ organizationId: orgId })
          .sort({ updatedAt: -1 })
          .limit(5)
          .lean();

        // Recent safety rules
        const recentSafetyRules = await SafetyRule.find({ organizationId: orgId })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean();

        // Protocols
        const protocols = await Protocol.find().limit(10).lean();

        // Gateways (top 6)
        const gatewaysRaw = await Gateway.find({ _id: { $in: gatewayIdsForCount } })
          .limit(6)
          .lean();

        res.json({
          stats: {
            totalDevices,
            onlineDevices,
            safetyRules: safetyRulesCount,
            gateways: gatewaysOnline,
            warningDevices,
            countriesDeployed: countriesDeployed.length,
          },
          traffic,
          alertTrend,
          openAlerts,
          avgLatencyMs,
          uptimeDays,
          topSites,
          recentDevices: recentDevicesRaw,
          recentSafetyRules,
          protocols,
          gateways: gatewaysRaw,
        });
      } catch (err) {
        res.status(500).json({
          error: "INTERNAL_ERROR",
          message: err instanceof Error ? err.message : "Failed to load dashboard.",
        });
      }
    }
  );

  // GET /api/ai/usage — AI interpretation usage stats for the account
  // NOTE: derived from AIConversationSession.turns (no separate usage
  // table yet). Counts "user" turns as interpretation requests made.
  app.get(
    "/api/ai/usage",
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
      } catch {
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to load usage stats." });
      }
    }
  );


  // POST /api/ai/feedback — user feedback on an AI interpretation result
  // (helps track/improve accuracy over time). Stored as an AuditLog entry
  // since there is no dedicated feedback table yet.
  app.post(
    "/api/ai/feedback",
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
      } catch {
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

  // Start MQTT client (optional — logs failure but never crashes the app).
  try {
    startMqttClient();
    startAutomationEngine({ dispatcher: gatewayDispatcher, emergencyStop: EmergencyStop });
  } catch (err) {
    console.error("[MQTT] Failed to start:", err instanceof Error ? err.message : err);
  }
}

main().catch((err) => {
  console.error("[Server] Fatal startup error:", err);
  process.exit(1);
});
