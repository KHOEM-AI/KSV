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
    // true = company-owned fleet vehicle/asset (subject to business-hours
    // rules like Ignition Lock After Hours); false/unset = customer-owned,
    // no such restriction — customers need 24/7 access for real emergencies.
    isCompanyFleet: { type: Boolean, default: false },
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
    organizationId: {
      type: ObjectId,
      ref: "Organization",
      required: true,
    },
    type: { type: String, required: true },
    mode: { type: String, required: true },
    serialNumber: { type: String },
    siteId: {
      type: ObjectId,
      ref: "Site",
    },
    buildingId: {
      type: ObjectId,
      ref: "Building",
    },
    supportedProtocols: { type: [String], default: [] },
    isOfflineCapable: { type: Boolean, default: false },
    offlineAuthEnabled: { type: Boolean, default: false },
    ipAddress: { type: String },
    status: { type: String, default: "offline" },
    cpuUsage: Number,
    memUsage: Number,
    deviceCount: { type: Number, default: 0 },
    firmwareVersion: { type: String, required: true },
    lastPingAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);


const gatewayProvisioningTokenSchema = new Schema(
  {
    gatewayId: {
      type: ObjectId,
      ref: "Gateway",
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    usedAt: {
      type: Date,
    },
    createdBy: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

gatewayProvisioningTokenSchema.index({ expiresAt: 1 });

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

const threatDetectionSchema = new Schema(
  {
    type: { type: String, required: true },
    severity: { type: String, required: true },
    accountId: { type: ObjectId, ref: "User" },
    deviceId: { type: ObjectId, ref: "Device" },
    organizationId: { type: ObjectId, ref: "Organization" },
    ipAddress: String,
    description: { type: String, required: true },
    autoActionTaken: String,
    requiresReview: { type: Boolean, default: true },
    falsePositiveMarked: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "detectedAt", updatedAt: false } }
);

const securityIncidentSchema = new Schema(
  {
    title: { type: String, required: true },
    status: { type: String, required: true, default: "detected" },
    severity: { type: String, required: true },
    organizationId: { type: ObjectId, ref: "Organization" },
    relatedDetectionIds: [{ type: ObjectId, ref: "ThreatDetection" }],
    affectedAccountIds: [{ type: ObjectId, ref: "User" }],
    affectedDeviceIds: [{ type: ObjectId, ref: "Device" }],
    containedAt: Date,
    resolvedAt: Date,
    assignedTo: { type: ObjectId, ref: "User" },
    evidencePreserved: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "detectedAt", updatedAt: false } }
);

// ============================================================
// AI ORCHESTRATION
// ============================================================

const aiConversationSessionSchema = new Schema(
  {
    accountId: { type: ObjectId, ref: "User", required: true },
    organizationId: { type: ObjectId, ref: "Organization" },
    turns: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    expiresAt: { type: Date, required: true },
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

export const GatewayProvisioningToken =
  models.GatewayProvisioningToken ||
  model("GatewayProvisioningToken", gatewayProvisioningTokenSchema);

export const Protocol = models.Protocol || model("Protocol", protocolSchema);
export const SafetyRule = models.SafetyRule || model("SafetyRule", safetyRuleSchema);
export const SafetyLog = models.SafetyLog || model("SafetyLog", safetyLogSchema);
export const DeviceLog = models.DeviceLog || model("DeviceLog", deviceLogSchema);
export const Event = models.Event || model("Event", eventSchema);
export const AuditLog = models.AuditLog || model("AuditLog", auditLogSchema);
export const AIConversationSession = models.AIConversationSession || model("AIConversationSession", aiConversationSessionSchema);
export const Country = models.Country || model("Country", countrySchema);
export const Language = models.Language || model("Language", languageSchema);
export const ThreatDetection = models.ThreatDetection || model("ThreatDetection", threatDetectionSchema);
export const SecurityIncident = models.SecurityIncident || model("SecurityIncident", securityIncidentSchema);

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

const settingsSchema = new Schema(
  {
    organizationId: { type: ObjectId, required: true, unique: true },
    autoUpdate: { type: Boolean, default: true },
    offlineMode: { type: Boolean, default: true },
    auditLog: { type: Boolean, default: true },
    twoFactor: { type: Boolean, default: true },
    zeroPlaintext: { type: Boolean, default: true },
    safetyOverride: { type: Boolean, default: false },
    emailAlerts: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: false },
    defaultLanguage: { type: String, default: "en-US" },
    defaultTimezone: { type: String, default: "Auto" },
  },
  { timestamps: true }
);

export const Settings = models.Settings || model("Settings", settingsSchema);


// ============================================================
// NOTIFICATIONS
// ============================================================

const notificationSchema = new Schema(
  {
    accountId: { type: ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    priority: { type: String, default: "normal" },
    title: { type: String, required: true },
    body: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    readAt: Date,
  },
  { timestamps: true }
);

export const Notification = models.Notification || model("Notification", notificationSchema);

// ============================================================
// BILLING & SUBSCRIPTION
// ============================================================

const organizationSubscriptionSchema = new Schema(
  {
    organizationId: { type: ObjectId, ref: "Organization", required: true },
    planId: { type: String, required: true }, // "free" | "pro" | "enterprise"
    status: { type: String, default: "active" }, // active | past_due | cancelled | trialing
    renewalDate: Date,
  },
  { timestamps: true }
);

const invoiceSchema = new Schema(
  {
    organizationId: { type: ObjectId, ref: "Organization", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    status: { type: String, default: "due" }, // paid | due | overdue | void
    dueAt: Date,
  },
  { timestamps: { createdAt: "issuedAt", updatedAt: false } }
);

export const OrganizationSubscription =
  models.OrganizationSubscription || model("OrganizationSubscription", organizationSubscriptionSchema);
export const Invoice = models.Invoice || model("Invoice", invoiceSchema);




// ============================================================
// AUTHORIZATION / PERMISSIONS
// ============================================================

const permissionLocationRestrictionSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["site", "building", "gps_radius"],
    },
    siteId: String,
    buildingId: String,
    gpsLatitude: Number,
    gpsLongitude: Number,
    gpsRadiusMeters: Number,

    isSecondaryContextOnly: {
      type: Boolean,
      required: true,
      default: true,
      validate: {
        validator: (value: boolean) => value === true,
        message: "Location restriction must remain secondary context only.",
      },
    },
  },
  { _id: false }
);

const permissionConditionsSchema = new Schema(
  {
    timeFrom: String,
    timeTo: String,

    daysOfWeek: {
      type: [Number],
      validate: {
        validator: (days: number[]) =>
          days.every((day) => Number.isInteger(day) && day >= 0 && day <= 6),
        message: "daysOfWeek must contain values from 0 (Sunday) to 6 (Saturday).",
      },
    },

    locationRestriction: permissionLocationRestrictionSchema,

    requiresApproval: {
      type: Boolean,
      default: false,
    },

    approverAccountId: {
      type: ObjectId,
      ref: "User",
    },

    maxUsageCount: {
      type: Number,
      min: 1,
    },

    currentUsageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const permissionSchema = new Schema(
  {
    organizationId: {
      type: ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    accountId: {
      type: ObjectId,
      ref: "User",
      required: true,
    },

    resourceType: {
      type: String,
      required: true,
      enum: [
        "device",
        "device_group",
        "organization",
        "site",
        "building",
        "room",
        "gateway",
        "protocol",
        "audit_log",
        "user_management",
      ],
    },

    resourceId: {
      type: String,
      required: true,
      trim: true,
    },

    actions: {
      type: [String],
      required: true,
      validate: {
        validator: (actions: string[]) => actions.length > 0,
        message: "A permission must contain at least one action.",
      },
      enum: [
        "read",
        "write",
        "control",
        "pair",
        "unpair",
        "manage_permissions",
        "delete",
        "transfer_ownership",
        "emergency_stop",
        "view_audit",
        "manage_organization",
      ],
    },

    level: {
      type: String,
      required: true,
      enum: [
        "owner",
        "super_admin",
        "org_admin",
        "manager",
        "operator",
        "controller",
        "viewer",
        "guest",
        "temporary",
      ],
    },

    grantedBy: {
      type: ObjectId,
      ref: "User",
      required: true,
    },

    grantedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    expiresAt: Date,

    conditions: permissionConditionsSchema,

    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

permissionSchema.index({
  organizationId: 1,
  accountId: 1,
  isRevoked: 1,
});

permissionSchema.index({
  organizationId: 1,
  resourceType: 1,
  resourceId: 1,
  isRevoked: 1,
});

export const Permission =
  models.Permission || model("Permission", permissionSchema);
