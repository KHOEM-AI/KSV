# Route inventory 2026-09-20 01:00

## server.ts routes
total calls: 85 | literal paths: 85 | non-literal: 0

[ai] 8
  POST /api/v1/ai/interpret
  GET /api/v1/ai/sessions/:id
  DELETE /api/v1/ai/sessions/:id
  POST /api/v1/ai/interpret/confirm
  GET /api/v1/ai/models
  POST /api/v1/ai/models/:id/enable
  GET /api/v1/ai/usage
  POST /api/v1/ai/feedback

[audit] 2
  GET /api/audit/events
  GET /api/audit/logs

[auth] 2
  POST /api/auth/password/change
  POST /api/auth/login/password

[authz] 1
  POST /api/authz/check

[automation] 1
  GET /api/automation/rules

[billing] 10
  GET /api/billing/invoices
  GET /api/billing/invoices/:id/download
  POST /api/billing/payment-methods
  DELETE /api/billing/payment-methods/:id
  GET /api/billing/usage
  GET /api/billing/subscriptions
  PUT /api/billing/subscriptions/:id
  DELETE /api/billing/subscriptions/:id
  POST /api/billing/subscriptions
  GET /api/billing/plans

[certificates] 2
  GET /api/certificates
  POST /api/certificates

[commands] 2
  GET /api/commands/recent
  GET /api/commands/:id

[dashboard] 2
  GET /api/dashboard/stats
  GET /api/dashboard/full

[devices] 7
  POST /api/devices/:id/commands
  GET /api/devices
  GET /api/devices/:id/state
  GET /api/devices/:id
  POST /api/devices
  PUT /api/devices/:id
  DELETE /api/devices/:id

[discovery] 1
  GET /api/discovery/devices

[gateways] 4
  GET /api/gateways
  POST /api/v1/gateways
  GET /api/v1/gateways
  GET /api/v1/gateways/:gatewayId

[health] 1
  GET /api/health

[identity] 1
  GET /api/identity/account

[international] 2
  GET /api/international/countries
  GET /api/international/languages

[map] 1
  GET /api/map/devices

[notifications] 1
  GET /api/notifications

[organizations] 22
  GET /api/organizations
  GET /api/organizations/:orgId
  POST /api/organizations
  PUT /api/organizations/:orgId
  DELETE /api/organizations/:orgId
  GET /api/organizations/:orgId/sites
  GET /api/organizations/:orgId/sites/:siteId
  POST /api/organizations/:orgId/sites
  PUT /api/organizations/:orgId/sites/:siteId
  DELETE /api/organizations/:orgId/sites/:siteId
  GET /api/organizations/:orgId/members
  GET /api/organizations/:orgId/members/:memberId
  PUT /api/organizations/:orgId/members/:memberId/role
  DELETE /api/organizations/:orgId/members/:memberId
  GET /api/organizations/:orgId/sites/:siteId/buildings
  POST /api/organizations/:orgId/sites/:siteId/buildings
  PUT /api/organizations/:orgId/sites/:siteId/buildings/:buildingId
  DELETE /api/organizations/:orgId/sites/:siteId/buildings/:buildingId
  GET /api/organizations/:orgId/sites/:siteId/buildings/:buildingId/rooms
  POST /api/organizations/:orgId/sites/:siteId/buildings/:buildingId/rooms
  PUT /api/organizations/:orgId/sites/:siteId/buildings/:buildingId/rooms/:roomId
  DELETE /api/organizations/:orgId/sites/:siteId/buildings/:buildingId/rooms/:roomId

[protocols] 2
  GET /api/protocols
  GET /api/protocols/adapters

[safety] 2
  GET /api/safety/rules
  GET /api/safety/events

[security] 4
  POST /api/security/threats
  GET /api/security/threats
  GET /api/security/sessions
  GET /api/security/incidents

[settings] 2
  GET /api/settings
  PUT /api/settings

[telemetry] 1
  GET /api/telemetry/devices/:id

[users] 1
  POST /api/users

[version] 1
  GET /api/version

[vocabulary] 2
  GET /api/vocabulary
  GET /api/vocabulary/:language

## API/device.ts contract format
// =============================================================
// KSV — Device API
// Domain: Device Identity, Capability, Ownership, Lifecycle
// RULE: KSV knows WHAT a device can do, not just that it exists
// =============================================================

export type DeviceCategory =
  | 'home'
  | 'building'
  | 'vehicle'
  | 'industrial'
  | 'warehouse'
  | 'energy'
  | 'network'
  | 'other';

export type DeviceType =
  // Home
  | 'light' | 'fan' | 'ac' | 'tv' | 'speaker' | 'refrigerator'
  | 'washing_machine' | 'smart_lock' | 'gate' | 'garage'
  // Building
  | 'door' | 'elevator' | 'access_control' | 'parking_barrier'
  | 'hvac' | 'camera' | 'sensor' | 'alarm'
  // Vehicle
  | 'car' | 'ev' | 'fleet_vehicle' | 'bus'
  // Industrial
  | 'machine' | 'motor' | 'pump' | 'plc' | 'robot' | 'conveyor'
  // Warehouse
  | 'scanner' | 'forklift_sensor' | 'shelf_sensor'
  // Energy
  | 'solar_inverter' | 'battery' | 'meter' | 'energy_controller'
  // Network
  | 'gateway' | 'router' | 'hub'
  | 'custom';

export type DeviceProtocol =
  | 'bluetooth'
  | 'wifi'
  | 'mqtt'
  | 'http_api'
  | 'infrared'
  | 'zigbee'
  | 'zwave'
  | 'lorawan'
  | 'modbus'

## API/index.ts registry (lines 76-110)
export const KSV_API_ROUTE_REGISTRY = {
  identity: IDENTITY_ROUTES,
  authentication: AUTHENTICATION_ROUTES,
  accountRecovery: ACCOUNT_RECOVERY_ROUTES,
  authorization: AUTHORIZATION_ROUTES,
  organization: ORGANIZATION_ROUTES,
  device: DEVICE_ROUTES,
  discovery: DISCOVERY_ROUTES,        // includes pairing routes
  protocol: PROTOCOL_ROUTES,
  gateway: GATEWAY_ROUTES,
  command: COMMAND_ROUTES,
  safety: SAFETY_ROUTES,
  automation: AUTOMATION_ROUTES,
  security: SECURITY_ROUTES,
  audit: AUDIT_ROUTES,
  notification: NOTIFICATION_ROUTES,
  international: INTERNATIONAL_ROUTES,
  administration: ADMINISTRATION_ROUTES,
  aiOrchestration: AI_ORCHESTRATION_ROUTES,
  billingSubscription: BILLING_ROUTES,
  analyticsTelemetry: TELEMETRY_ROUTES,
  notificationPush: PUSH_ROUTES,
  fileStorage: FILE_STORAGE_ROUTES,
  reportingExport: REPORTING_ROUTES,
  integrationWebhook: WEBHOOK_ROUTES,
  geolocationMap: GEO_ROUTES,
  maintenanceTicketing: TICKETING_ROUTES,
} as const;

// ---------------------------------------------------------------
// Domain File Map — 17 files covering the 18 domains
// named in the original KSV project concept
// ---------------------------------------------------------------

export const KSV_API_DOMAIN_FILES = [

## src/routes/index.ts
import { Router } from 'express';
import { identityRoutes } from '../modules/identity';
import { organizationRoutes } from '../modules/organization';
import { deviceRoutes } from '../modules/device';
import { discoveryRoutes } from '../modules/discovery';
import { commandRoutes } from '../modules/command';
import { gatewayRoutes } from '../modules/communication/gateway';
import { protocolRoutes } from '../modules/communication/protocol';
import { safetyRoutes } from '../modules/safety';

const router = Router();

router.use('/identity', identityRoutes);
router.use('/organization', organizationRoutes);
router.use('/device', deviceRoutes);
router.use('/discovery', discoveryRoutes);
router.use('/command', commandRoutes);
router.use('/gateway', gatewayRoutes);
router.use('/protocol', protocolRoutes);
router.use('/safety', safetyRoutes);

export default router;

## src/server/server.ts head
import { createApp } from '../app/app';
import { connectDatabase } from '../infrastructure/database';

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectDatabase();
    const app = createApp();
    app.listen(PORT, () => {
      console.log(`[Server] KSV API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

start();

## tsc app
src/app/app.ts(12,30): error TS2307: Cannot find module '../core/middleware/error-handler' or its corresponding type declarations.
src/components/AIWelcomeBanner.tsx(193,62): error TS2345: Argument of type 'SupportedLanguage' is not assignable to parameter of type '"km" | "en" | undefined'.
  Type '"zh"' is not assignable to type '"km" | "en" | undefined'.
src/modules/command/controllers/command.controller.ts(96,51): error TS2345: Argument of type 'string | string[]' is not assignable to parameter of type 'string'.
  Type 'string[]' is not assignable to type 'string'.
src/modules/communication/gateway/controllers/gateway.controller.ts(12,9): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/modules/communication/gateway/controllers/gateway.controller.ts(23,53): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/modules/communication/gateway/controllers/gateway.controller.ts(33,9): error TS2345: Argument of type 'string | string[]' is not assignable to parameter of type 'string'.
  Type 'string[]' is not assignable to type 'string'.
src/modules/communication/gateway/controllers/gateway.controller.ts(45,9): error TS2345: Argument of type 'string | string[]' is not assignable to parameter of type 'string'.
  Type 'string[]' is not assignable to type 'string'.
src/modules/communication/gateway/controllers/gateway.controller.ts(58,9): error TS2345: Argument of type 'string | string[]' is not assignable to parameter of type 'string'.
  Type 'string[]' is not assignable to type 'string'.
src/modules/communication/gateway/controllers/gateway.controller.ts(70,9): error TS2345: Argument of type 'string | string[]' is not assignable to parameter of type 'string'.
  Type 'string[]' is not assignable to type 'string'.
src/modules/communication/protocol/controllers/protocol.controller.ts(32,52): error TS2345: Argument of type 'string | string[]' is not assignable to parameter of type 'string'.
  Type 'string[]' is not assignable to type 'string'.
src/modules/communication/protocol/controllers/protocol.controller.ts(42,9): error TS2345: Argument of type 'string | string[]' is not assignable to parameter of type 'string'.
  Type 'string[]' is not assignable to type 'string'.
src/modules/communication/protocol/controllers/protocol.controller.ts(53,36): error TS2345: Argument of type 'string | string[]' is not assignable to parameter of type 'string'.
  Type 'string[]' is not assignable to type 'string'.
src/modules/device/controllers/device.controller.ts(47,50): error TS2345: Argument of type 'string | string[]' is not assignable to parameter of type 'string'.
  Type 'string[]' is not assignable to type 'string'.
src/modules/device/controllers/device.controller.ts(57,49): error TS2345: Argument of type 'string | string[]' is not assignable to parameter of type 'string'.
  Type 'string[]' is not assignable to type 'string'.
src/modules/device/controllers/device.controller.ts(67,34): error TS2345: Argument of type 'string | string[]' is not assignable to parameter of type 'string'.
  Type 'string[]' is not assignable to type 'string'.
src/modules/discovery/controllers/discovery.controller.ts(14,9): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/modules/discovery/controllers/discovery.controller.ts(25,50): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
src/modules/discovery/controllers/discovery.controller.ts(39,9): error TS2345: Argument of type 'string | string[]' is not assignable to parameter of type 'string'.
  Type 'string[]' is not assignable to type 'string'.
src/modules/discovery/controllers/discovery.controller.ts(51,9): error TS2345: Argument of type 'string | string[]' is not assignable to parameter of type 'string'.
  Type 'string[]' is not assignable to type 'string'.
src/modules/discovery/controllers/discovery.controller.ts(63,9): error TS2345: Argument of type 'string | string[]' is not assignable to parameter of type 'string'.
  Type 'string[]' is not assignable to type 'string'.
src/modules/discovery/controllers/discovery.controller.ts(75,9): error TS2345: Argument of type 'string | string[]' is not assignable to parameter of type 'string'.

## tsc node
