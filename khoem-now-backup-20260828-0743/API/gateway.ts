// =============================================================
// KSV — Gateway API
// Domain: Edge controller bridging KSV Cloud ↔ Local Devices
// RULE: Gateway is a BRIDGE, not a Security bypass
// =============================================================

import type { DeviceProtocol } from './device';

export type GatewayStatus = 'online' | 'offline' | 'degraded' | 'maintenance' | 'updating';
export type GatewayMode = 'cloud_connected' | 'local_only' | 'hybrid';
export type GatewayType = 'home' | 'building' | 'industrial' | 'vehicle' | 'portable';

// ---------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------

export interface KSVGateway {
  gatewayId: string;
  name: string;
  type: GatewayType;
  firmwareVersion: string;
  hardwareVersion?: string;
  serialNumber?: string;
  macAddress?: string;
  ipAddress?: string;
  status: GatewayStatus;
  mode: GatewayMode;
  supportedProtocols: DeviceProtocol[];
  connectedDeviceCount: number;
  ownerAccountId: string;
  orgId?: string;
  siteId?: string;
  buildingId?: string;
  lastSeenAt?: string;
  lastSyncAt?: string;
  isOfflineCapable: boolean;
  offlineAuthEnabled: boolean;
  cpuUsage?: number;
  memUsage?: number;
  createdAt: string;
}

export interface GatewayHeartbeat {
  gatewayId: string;
  timestamp: string;
  status: GatewayStatus;
  cpuUsage: number;
  memUsage: number;
  connectedDeviceCount: number;
  pendingCommandCount: number;
  networkQuality?: 'good' | 'degraded' | 'poor';
}

export interface OfflinePolicyConfig {
  allowLocalControl: boolean;
  localControlDurationHours: number;
  allowedCapabilities: string[];
  requireLocalAuth: boolean;
  syncOnReconnect: boolean;
}

// ---------------------------------------------------------------
// Request / Response Shapes
// ---------------------------------------------------------------

export interface RegisterGatewayRequest {
  name: string;
  type: GatewayType;
  serialNumber?: string;
  orgId?: string;
  siteId?: string;
  buildingId?: string;
  supportedProtocols: DeviceProtocol[];
  isOfflineCapable: boolean;
  offlineAuthEnabled: boolean;
}

export interface RegisterGatewayResponse {
  success: boolean;
  gateway: KSVGateway;
  provisioningToken: string;      // One-time token for gateway to authenticate with cloud
  cloudEndpoint: string;
  message: string;
}

export interface UpdateGatewayRequest {
  name?: string;
  offlinePolicyConfig?: OfflinePolicyConfig;
}

export interface GatewayStatusResponse {
  gateway: KSVGateway;
  heartbeat?: GatewayHeartbeat;
  connectedDevices: Array<{ deviceId: string; protocol: DeviceProtocol; status: string }>;
}

export interface UpdateGatewayFirmwareRequest {
  gatewayId: string;
  targetVersion: string;
  signature: string;              // Must be verified before applying
  scheduleAt?: string;
}

export interface LocalCommandRequest {
  gatewayId: string;
  deviceId: string;
  capability: string;
  value: unknown;
  offlineToken?: string;          // Required when operating in offline mode
  issuedAt: string;
  expiresAt: string;
}

export interface SyncQueueResponse {
  pendingCount: number;
  commands: Array<{
    commandId: string;
    deviceId: string;
    capability: string;
    value: unknown;
    issuedAt: string;
    expiresAt: string;
  }>;
}

export interface GatewaySyncRequest {
  gatewayId: string;
  lastSyncAt?: string;
  deviceStates: Array<{
    deviceId: string;
    values: Record<string, unknown>;
    timestamp: string;
  }>;
  executedCommands: Array<{
    commandId: string;
    result: 'success' | 'failed';
    executedAt: string;
    errorMessage?: string;
  }>;
}

export interface GatewaySyncResponse {
  success: boolean;
  pendingCommands: SyncQueueResponse;
  updatedPolicies: boolean;
  message: string;
}

// ---------------------------------------------------------------
// API Route Definitions
// ---------------------------------------------------------------

export const GATEWAY_ROUTES = {
  REGISTER_GATEWAY:        'POST /api/v1/gateways',
  LIST_GATEWAYS:           'GET  /api/v1/gateways',
  GET_GATEWAY:             'GET  /api/v1/gateways/:gatewayId',
  UPDATE_GATEWAY:          'PUT  /api/v1/gateways/:gatewayId',
  DELETE_GATEWAY:          'DELETE /api/v1/gateways/:gatewayId',
  GET_GATEWAY_STATUS:      'GET  /api/v1/gateways/:gatewayId/status',

  // Heartbeat (called by gateway device, not user)
  GATEWAY_HEARTBEAT:       'POST /api/v1/gateways/:gatewayId/heartbeat',

  // Sync (called by gateway on reconnect)
  GATEWAY_SYNC:            'POST /api/v1/gateways/:gatewayId/sync',
  GET_SYNC_QUEUE:          'GET  /api/v1/gateways/:gatewayId/sync/queue',

  // Commands via gateway
  SEND_LOCAL_COMMAND:      'POST /api/v1/gateways/:gatewayId/command',

  // Firmware
  UPDATE_GATEWAY_FIRMWARE: 'POST /api/v1/gateways/:gatewayId/firmware/update',

  // Offline policy
  GET_OFFLINE_POLICY:      'GET  /api/v1/gateways/:gatewayId/offline-policy',
  UPDATE_OFFLINE_POLICY:   'PUT  /api/v1/gateways/:gatewayId/offline-policy',

  // Connected devices
  LIST_GATEWAY_DEVICES:    'GET  /api/v1/gateways/:gatewayId/devices',
} as const;

// ---------------------------------------------------------------
// Handler Interfaces
// ---------------------------------------------------------------

export interface GatewayAPIHandlers {
  registerGateway(accountId: string, req: RegisterGatewayRequest): Promise<RegisterGatewayResponse>;
  listGateways(accountId: string, orgId?: string): Promise<KSVGateway[]>;
  getGateway(gatewayId: string, accountId: string): Promise<KSVGateway>;
  updateGateway(gatewayId: string, req: UpdateGatewayRequest, accountId: string): Promise<KSVGateway>;
  deleteGateway(gatewayId: string, accountId: string): Promise<{ success: boolean }>;
  getGatewayStatus(gatewayId: string, accountId: string): Promise<GatewayStatusResponse>;

  receiveHeartbeat(gatewayId: string, heartbeat: GatewayHeartbeat): Promise<{ acknowledged: boolean }>;
  syncGateway(gatewayId: string, req: GatewaySyncRequest): Promise<GatewaySyncResponse>;
  getSyncQueue(gatewayId: string): Promise<SyncQueueResponse>;

  sendLocalCommand(accountId: string, req: LocalCommandRequest): Promise<{ commandId: string; queued: boolean }>;
  updateGatewayFirmware(req: UpdateGatewayFirmwareRequest, accountId: string): Promise<{ success: boolean; jobId: string }>;

  getOfflinePolicy(gatewayId: string, accountId: string): Promise<OfflinePolicyConfig>;
  updateOfflinePolicy(gatewayId: string, req: OfflinePolicyConfig, accountId: string): Promise<{ success: boolean }>;
}

// ---------------------------------------------------------------
// Security Rules
// ---------------------------------------------------------------

export const GATEWAY_SECURITY_RULES = {
  /** Gateway provisioning tokens are one-time use and expire quickly. */
  PROVISIONING_TOKEN_SINGLE_USE: true,
  PROVISIONING_TOKEN_EXPIRY_MINUTES: 30,

  /**
   * Gateway firmware updates must be cryptographically signed.
   * An unsigned update is rejected.
   */
  FIRMWARE_SIGNATURE_REQUIRED: true,

  /**
   * A gateway failure must NOT allow unauthenticated local access.
   * Cloud failure = fall back to offline policy, not open access.
   */
  OFFLINE_POLICY_MUST_BE_DEFINED: true,

  /**
   * Commands queued while a gateway is offline must expire.
   * Stale commands are not executed after expiry.
   */
  OFFLINE_COMMAND_EXPIRY: true,

  /**
   * Gateway is a bridge only.
   * It cannot override cloud-level permissions or safety rules.
   */
  GATEWAY_CANNOT_OVERRIDE_PERMISSIONS: true,
} as const;

// ---------------------------------------------------------------
// Audit Events
// ---------------------------------------------------------------

export type GatewayAuditEvent =
  | 'gateway.registered'
  | 'gateway.updated'
  | 'gateway.deleted'
  | 'gateway.online'
  | 'gateway.offline'
  | 'gateway.degraded'
  | 'gateway.heartbeat'
  | 'gateway.sync.completed'
  | 'gateway.firmware.update_started'
  | 'gateway.firmware.update_completed'
  | 'gateway.offline_policy.updated'
  | 'gateway.local_command.issued'
  | 'gateway.local_command.expired';
