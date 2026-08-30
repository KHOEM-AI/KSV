/**
 * KSV - Mongoose Models
 * Location in project: src/infrastructure/database/models.ts
 *
 * Converted from prisma/schema.prisma (kept as design reference / docs).
 * Mongoose is used instead of Prisma because Prisma's binary query
 * engine does not run on Android/Termux - Mongoose is pure JS and
 * works identically everywhere.
 *
 * Field-level comments mirror the original Prisma schema so the two
 * stay easy to cross-reference.
 */

import mongoose, { Schema, model } from "mongoose";
const { models } = mongoose;

const { ObjectId } = Schema.Types;

// ============================================================
// IDENTITY & ACCOUNT
// ============================================================

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }, // never plain text
    role: { type: String, required: true }, // Owner | SuperAdmin | OrgAdmin | Manager | Operator | Controller | Viewer | Guest
    firstName: String,
    lastName: String,
    isActive: { type: Boolean, default: true },
    mfaEnabled: { type: Boolean, default: false },
    lastLoginAt: Date,
    organizationId: { type: ObjectId, ref: "Organization" },
  },
  { timestamps: true }
);

const sessionSchema = new Schema(
  {
    userId: { type: ObjectId, ref: "User", required: true },
    refreshToken: { type: String, required: true, unique: true }, // store a HASH, not raw value
    ip: String,
    userAgent: String,
    expiresAt: { type: Date, required: true },
    revokedAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// ============================================================
// ORGANIZATION & ENTERPRISE
// ============================================================

const organizationSchema = new Schema(
  {
    name: { type: String, required: true },
    ownerId: { type: ObjectId, required: true },
    country: String, // ISO country code
    timezone: String,
  },
  { timestamps: true }
);

const siteSchema = new Schema(
  {
    organizationId: { type: ObjectId, ref: "Organization", required: true },
    name: { type: String, required: true }, // e.g. "Frankfurt HQ"
    address: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// ============================================================
// DEVICE INTELLIGENCE
// ============================================================

const deviceSchema = new Schema(
  {
    name: { type: String, required: true },
    deviceCode: { type: String, required: true, unique: true }, // e.g. "DEV-04821"
    type: { type: String, required: true }, // door | hvac | vehicle | industrial | sensor
    status: { type: String, default: "offline" }, // online | offline | warning | maintenance
    organizationId: { type: ObjectId, ref: "Organization", required: true },
    siteId: { type: ObjectId, ref: "Site" },
    gatewayId: { type: ObjectId, ref: "Gateway" },
    protocolId: { type: ObjectId, ref: "Protocol" },
    firmwareVersion: String,
    lastSeenAt: Date,
  },
  { timestamps: true }
);

const discoverySchema = new Schema(
  {
    deviceId: { type: ObjectId, ref: "Device", required: true },
    method: { type: String, required: true }, // bluetooth | wifi | qr | nfc | cloud
    ipAddress: String,
    macAddress: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// ============================================================
// COMMAND & AUTOMATION
// ============================================================

const commandSchema = new Schema(
  {
    deviceId: { type: ObjectId, ref: "Device", required: true },
    userId: { type: ObjectId, ref: "User" }, // null if triggered by automation/safety-engine
    type: { type: String, required: true }, // e.g. "UNLOCK", "SETPOINT"
    payload: Schema.Types.Mixed,
    status: { type: String, default: "pending" }, // pending | success | failed | blocked
    response: Schema.Types.Mixed,
    sentAt: Date,
    completedAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const automationRuleSchema = new Schema(
  {
    organizationId: { type: ObjectId, ref: "Organization", required: true },
    name: { type: String, required: true },
    trigger: Schema.Types.Mixed, // e.g. { type: "time", value: "18:00" }
    action: Schema.Types.Mixed, // e.g. { deviceId, commandType, payload }
    isEnabled: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// ============================================================
// CONNECTIVITY & PROTOCOLS
// ============================================================

const gatewaySchema = new Schema(
  {
    name: { type: String, required: true }, // e.g. "Frankfurt Edge Controller"
    ipAddress: { type: String, required: true },
    status: { type: String, default: "offline" },
    cpuUsage: Number,
    memUsage: Number,
    deviceCount: { type: Number, default: 0 },
    version: String,
    lastPingAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const protocolSchema = new Schema({
  name: { type: String, required: true }, // Bluetooth LE | Wi-Fi 6 | MQTT | Infrared | Zigbee
  code: { type: String, required: true, unique: true }, // PROTO_BLE, PROTO_WIFI...
  securityType: String, // AES-CCM | WPA3-Enterprise | TLS 1.3 | AES-128
  config: Schema.Types.Mixed,
});

// ============================================================
// SAFETY & SECURITY
// ============================================================

const safetyRuleSchema = new Schema(
  {
    organizationId: { type: ObjectId, ref: "Organization", required: true },
    name: { type: String, required: true }, // e.g. "Robot Speed Limit in Human Zone"
    category: { type: String, required: true }, // door | vehicle | industrial
    severity: { type: String, required: true }, // low | medium | high | critical
    triggerCount: { type: Number, default: 0 },
    isEnabled: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const safetyLogSchema = new Schema(
  {
    deviceId: { type: ObjectId, ref: "Device", required: true },
    eventType: { type: String, required: true },
    severity: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// ============================================================
// MONITORING / EVENTS
// ============================================================

const deviceLogSchema = new Schema(
  {
    deviceId: { type: ObjectId, ref: "Device", required: true },
    data: Schema.Types.Mixed,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const eventSchema = new Schema(
  {
    type: { type: String, required: true },
    source: { type: String, required: true },
    payload: Schema.Types.Mixed,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// ============================================================
// AUDIT (append-only - no update/delete exposed anywhere in the app)
// ============================================================

const auditLogSchema = new Schema(
  {
    userId: { type: ObjectId, ref: "User" },
    action: { type: String, required: true }, // e.g. "device:command", "auth:login"
    deviceId: { type: ObjectId, ref: "Device" },
    organizationId: { type: ObjectId, ref: "Organization" },
    result: { type: String, required: true }, // SUCCESS | FAILURE | BLOCKED
    ip: String,
    userAgent: String,
    reason: String,
    details: String, // JSON-stringified, sanitized (secrets redacted)
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// ============================================================
// INTERNATIONALIZATION
// ============================================================

const countrySchema = new Schema({
  code: { type: String, required: true, unique: true }, // ISO 3166-1 alpha-2
  name: { type: String, required: true },
  timezone: String,
});

const languageSchema = new Schema({
  code: { type: String, required: true, unique: true }, // ISO 639-1
  name: { type: String, required: true },
});

// ============================================================
// Export models
// Guard against "OverwriteModelError" when this file is imported
// multiple times (common with hot-reload in dev).
// ============================================================

export const User = models.User || model("User", userSchema);
export const Session = models.Session || model("Session", sessionSchema);
export const Organization = models.Organization || model("Organization", organizationSchema);
export const Site = models.Site || model("Site", siteSchema);
export const Device = models.Device || model("Device", deviceSchema);
export const Discovery = models.Discovery || model("Discovery", discoverySchema);
export const Command = models.Command || model("Command", commandSchema);
export const AutomationRule = models.AutomationRule || model("AutomationRule", automationRuleSchema);
export const Gateway = models.Gateway || model("Gateway", gatewaySchema);
export const Protocol = models.Protocol || model("Protocol", protocolSchema);
export const SafetyRule = models.SafetyRule || model("SafetyRule", safetyRuleSchema);
export const SafetyLog = models.SafetyLog || model("SafetyLog", safetyLogSchema);
export const DeviceLog = models.DeviceLog || model("DeviceLog", deviceLogSchema);
export const Event = models.Event || model("Event", eventSchema);
export const AuditLog = models.AuditLog || model("AuditLog", auditLogSchema);
export const Country = models.Country || model("Country", countrySchema);
export const Language = models.Language || model("Language", languageSchema);

// ============================================================
// CERTIFICATES (Personal / Organization achievements)
// ============================================================

const certificateSchema = new Schema(
  {
    title: { type: String, required: true },
    issuer: { type: String, required: true },
    holderUserId: { type: ObjectId, ref: "User", required: true },
    issuedAt: { type: Date, required: true },
    expiresAt: Date, // null/undefined = never expires
    category: String,
    verified: { type: Boolean, default: false },
    sourceUrl: String, // link to original certificate image/page
  },
  { timestamps: true }
);

export const Certificate = models.Certificate || model("Certificate", certificateSchema);
