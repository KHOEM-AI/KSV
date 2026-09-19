## server.ts: lines 1-60
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
import { User, Session } from "./infrastructure/database/models.ts";
import { authenticate } from "./core/auth/auth.middleware.ts";
import { requirePermission, requireMinRole } from "./core/auth/rbac.policy.ts";
import { deviceCommandRateLimiter, authRateLimiter } from "./core/security/rate-limiter.ts";
import { evaluateSafetyForDevice } from "./core/safety/safety.engine.ts";
import { auditDeviceCommand } from "./core/security/audit.log.ts";
import { DefaultGatewayDispatcher } from "./core/gateway/gateway.dispatcher.ts";
import { startMqttClient } from "./infrastructure/mqtt/client.ts";
import { applyDispatchResult } from "./core/gateway/command.lifecycle.ts";
import { evaluateSelfDefense } from "./core/ai/khoem-ai-brain.ts";
import { generateSecureToken } from "./core/security/encryption.util.ts";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import mongoose from "mongoose";
import { GLOBAL_195_VOCABULARY_30K as GLOBAL_195_VOCABULARY } from "./core/ai/patterns/global-195-vocabulary.ts";
import { guardRespectfulResponse } from "./core/ai/khoem-ai-conduct.ts";

function hashRefreshToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
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

## auth routes in server.ts
6:// other modules (connection.ts, auth.middleware.ts, rate-limiter.ts) read process.env.DATABASE_URL / JWT_ACCESS_SECRET / etc.
8:// reads process.env.DATABASE_URL / JWT_ACCESS_SECRET / etc.
16:import { authenticate } from "./core/auth/auth.middleware.ts";
27:import jwt from "jsonwebtoken";
215:    authenticate,
261:    authenticate,
272:      const user = req.user!; // authenticate() guarantees this is set
422:  // POST /api/auth/password/change
423:  app.post("/api/auth/password/change", authenticate, async (req, res) => {
468:  // POST /api/auth/login/password
469:  app.post("/api/auth/login/password", authRateLimiter, async (req, res) => {
506:      const accessToken = jwt.sign(
514:        process.env.JWT_ACCESS_SECRET as string,
516:          expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as jwt.SignOptions["expiresIn"],
520:      const refreshToken = jwt.sign(
525:        process.env.JWT_REFRESH_SECRET as string,
527:          expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"],
531:      const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
537:          "Invalid JWT_REFRESH_EXPIRES_IN format. Use values such as 7d, 24h, 60m."
604:    authenticate,
623:    authenticate,
647:  app.get("/api/devices", authenticate, requirePermission("device:read"), async (req, res) => {
662:  app.get("/api/devices/:id/state", authenticate, requirePermission("device:read"), async (req, res) => {
686:    authenticate,
713:    authenticate,
752:    authenticate,
789:    authenticate,
813:  app.get("/api/commands/recent", authenticate, requirePermission("device:read"), async (req, res) => {
841:  app.get("/api/commands/:id", authenticate, requirePermission("device:read"), async (req, res) => {
878:    authenticate,

## login route (from line 468)
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

## db models
23:const userSchema = new Schema(
38:const sessionSchema = new Schema(
54:const organizationSchema = new Schema(
64:const siteSchema = new Schema(
81:const deviceSchema = new Schema(
105:const discoverySchema = new Schema(
119:const commandSchema = new Schema(
133:const automationRuleSchema = new Schema(
148:const gatewaySchema = new Schema(
182:const gatewayProvisioningTokenSchema = new Schema(
212:const protocolSchema = new Schema({
223:const safetyRuleSchema = new Schema(
235:const safetyLogSchema = new Schema(
249:const deviceLogSchema = new Schema(
257:const eventSchema = new Schema(
270:const auditLogSchema = new Schema(
285:const threatDetectionSchema = new Schema(
301:const securityIncidentSchema = new Schema(
322:const aiConversationSessionSchema = new Schema(
345:const countrySchema = new Schema({
353:const languageSchema = new Schema({
364:export const User = models.User || model("User", userSchema);
365:export const Session = models.Session || model("Session", sessionSchema);
366:export const Organization = models.Organization || model("Organization", organizationSchema);
367:export const Site = models.Site || model("Site", siteSchema);
369:const buildingSchema = new Schema(
380:export const Building = models.Building || model("Building", buildingSchema);
382:const roomSchema = new Schema(
393:export const Room = models.Room || model("Room", roomSchema);
394:export const Device = models.Device || model("Device", deviceSchema);
395:export const Discovery = models.Discovery || model("Discovery", discoverySchema);
396:export const Command = models.Command || model("Command", commandSchema);
397:export const AutomationRule = models.AutomationRule || model("AutomationRule", automationRuleSchema);
398:export const Gateway = models.Gateway || model("Gateway", gatewaySchema);
400:export const GatewayProvisioningToken =
402:  model("GatewayProvisioningToken", gatewayProvisioningTokenSchema);
404:export const Protocol = models.Protocol || model("Protocol", protocolSchema);
405:export const SafetyRule = models.SafetyRule || model("SafetyRule", safetyRuleSchema);
406:export const SafetyLog = models.SafetyLog || model("SafetyLog", safetyLogSchema);
407:export const DeviceLog = models.DeviceLog || model("DeviceLog", deviceLogSchema);

## API/authentication.ts: routes + request types
9:export type LoginResult = 'success' | 'mfa_required' | 'failed' | 'account_suspended' | 'account_deleted';
16:  sessionId: string;
25:  mfaVerified: boolean;
32:  refreshToken: string;         // Longer-lived (e.g. 7 days) — stored securely
63:  session?: KSVSession;
65:  mfaChallenge?: MFAChallenge;  // Present if MFA is required
77:  session?: KSVSession;
83:  refreshToken: string;
88:  session: KSVSession;
92:  sessionId?: string;           // If omitted, logs out current session only
93:  allSessions?: boolean;        // If true, revokes ALL sessions for this account
103:  sessions: KSVSession[];
107:  sessionId: string;
142:  sessionRevoked: boolean;      // Other sessions are revoked after password change
155:  result: 'success' | 'failed' | 'mfa_failed' | 'account_locked';
171:export const AUTHENTICATION_ROUTES = {
177:  MFA_CHALLENGE:           'GET  /api/v1/auth/mfa/challenge/:challengeId',
178:  MFA_VERIFY:              'POST /api/v1/auth/mfa/verify',
179:  MFA_ENROLL:              'POST /api/v1/auth/mfa/enroll',
180:  MFA_CONFIRM_ENROLL:      'POST /api/v1/auth/mfa/enroll/confirm',
181:  MFA_DISABLE:             'POST /api/v1/auth/mfa/disable',
182:  MFA_LIST:                'GET  /api/v1/auth/mfa/methods',
185:  REFRESH_TOKEN:           'POST /api/v1/auth/token/refresh',
188:  LIST_SESSIONS:           'GET  /api/v1/auth/sessions',
189:  REVOKE_SESSION:          'DELETE /api/v1/auth/sessions/:sessionId',
190:  LOGOUT:                  'POST /api/v1/auth/logout',
224:   * Exchange refresh token for a new access token.
226:  refreshToken(req: RefreshTokenRequest): Promise<RefreshTokenResponse>;
229:   * Revoke one or all sessions for the current user.
231:  logout(accountId: string, req: LogoutRequest): Promise<LogoutResponse>;
234:   * List all active sessions for the current user.
239:   * Revoke a specific session by ID.
241:  revokeSession(accountId: string, sessionId: string): Promise<{ success: boolean }>;
263:   * After a password change, all other sessions are revoked for security.
285:   * Admin: revoke all sessions for an account (emergency use).
323:  /** After a password change, all other sessions are revoked. */
338:  | 'auth.mfa.challenge_issued'
339:  | 'auth.mfa.verified'
340:  | 'auth.mfa.failed'
341:  | 'auth.mfa.enrolled'
342:  | 'auth.mfa.disabled'
343:  | 'auth.token.refreshed'
344:  | 'auth.session.revoked'
345:  | 'auth.session.all_revoked'
346:  | 'auth.logout'

## src/core/auth
auth.middleware.ts
authorization.engine.ts
authorization.service.ts
rbac.policy.ts
/**
 * KSV — Authentication Middleware
 * Location in project: src/core/auth/auth.middleware.ts
 *
 * Purpose (per KSV Security Design, sections 4 & 16):
 *   User Command → AUTHENTICATION → Authorization → Device Capability → Safety → Execute
 *
 * This middleware verifies the JWT access token on every protected request,
 * and attaches the authenticated user's identity to the request object.
 * It does NOT check permissions (that is rbac.policy.ts's job) — this file
 * only answers "who is making this request?".
 */

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

// ---- Config -----------------------------------------------------------
// NEVER hardcode secrets. Load from environment (.env, not committed to git).
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;

if (!ACCESS_TOKEN_SECRET) {
  // Fail loudly at startup rather than silently accepting unsigned tokens.
  throw new Error(
    "JWT_ACCESS_SECRET is not set. Refusing to start without it (Fail Securely principle)."
  );
}

// ---- Types --------------------------------------------------------------
export interface AuthenticatedUser {
  id: string;
  role: string; // Owner | SuperAdmin | OrgAdmin | Manager | Operator | Controller | Viewer | Guest
  organizationId?: string;
}

// Extend Express's Request type so controllers get typed access to req.user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// ---- Middleware ---------------------------------------------------------
/**
 * Verifies the Bearer token in the Authorization header.
 * On success: attaches req.user and calls next().
 * On failure: responds 401 immediately (fail closed, never fail open).

## .env keys
DATABASE_URL=***

PORT=***
NODE_ENV=***
ALLOWED_ORIGINS=***
LOG_LEVEL=***

FIELD_ENCRYPTION_KEY=***
JWT_ACCESS_SECRET=***
JWT_ACCESS_EXPIRES_IN=***
JWT_REFRESH_SECRET=***
JWT_REFRESH_EXPIRES_IN=***

OTP_LENGTH=***
OTP_EXPIRES_IN_MINUTES=***

RATE_LIMIT_WINDOW_MS=***
RATE_LIMIT_MAX_REQUESTS=***

# MQTT (device telemetry + real-time status)
MQTT_BROKER_URL=***
MQTT_CLIENT_ID=***
MQTT_TOPIC_PREFIX=***
ANTHROPIC_MODEL=***
ANTHROPIC_MODEL=***
ANTHROPIC_API_KEY=***
