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
  | 'bacnet'
  | 'can_bus'
  | 'custom';

export type DeviceStatus = 'online' | 'offline' | 'pairing' | 'error' | 'maintenance' | 'decommissioned';

export type DeviceSecurityState = 'trusted' | 'unverified' | 'quarantined' | 'revoked';

export type DeviceLifecycleStage =
  | 'discovered'
  | 'verified'
  | 'paired'
  | 'active'
  | 'updated'
  | 'suspended'
  | 'revoked'
  | 'removed';

// ---------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------

export interface DeviceCapability {
  capabilityId: string;
  name: string;                   // e.g. "Power", "Volume", "Temperature"
  type: 'toggle' | 'range' | 'enum' | 'trigger' | 'read_only';
  minValue?: number;
  maxValue?: number;
  step?: number;
  unit?: string;                  // e.g. "°C", "%", "dB"
  enumValues?: string[];
  requiresPermissionLevel: string;
  isSafetyRelevant: boolean;      // True = Safety Engine must also approve
  isHighRisk: boolean;            // True = requires additional confirmation
}

export interface KSVDevice {
  deviceId: string;
  name: string;
  category: DeviceCategory;
  type: DeviceType;
  manufacturer: string;
  brand: string;
  model: string;
  serialNumber?: string;
  firmwareVersion?: string;
  hardwareVersion?: string;
  macAddress?: string;
  protocol: DeviceProtocol[];
  status: DeviceStatus;
  securityState: DeviceSecurityState;
  lifecycleStage: DeviceLifecycleStage;
  capabilities: DeviceCapability[];
  ownerAccountId: string;
  orgId?: string;
  siteId?: string;
  buildingId?: string;
  roomId?: string;
  gatewayId?: string;
  lastSeenAt?: string;
  lastCommandAt?: string;
  pairedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, string>;
}

export interface DeviceState {
  deviceId: string;
  timestamp: string;
  values: Record<string, unknown>;  // capability name → current value
  isStale: boolean;
  staleSince?: string;
}

// ---------------------------------------------------------------
// Request / Response Shapes
// ---------------------------------------------------------------

export interface RegisterDeviceRequest {
  name: string;
  category: DeviceCategory;
  type: DeviceType;
  manufacturer: string;
  brand: string;
  model: string;
  serialNumber?: string;
  protocol: DeviceProtocol[];
  orgId?: string;
  siteId?: string;
  buildingId?: string;
  roomId?: string;
  gatewayId?: string;
  metadata?: Record<string, string>;
}

export interface UpdateDeviceRequest {
  name?: string;
  roomId?: string;
  buildingId?: string;
  siteId?: string;
  metadata?: Record<string, string>;
}

export interface ListDevicesRequest {
  orgId?: string;
  siteId?: string;
  buildingId?: string;
  roomId?: string;
  category?: DeviceCategory;
  type?: DeviceType;
  status?: DeviceStatus;
  lifecycleStage?: DeviceLifecycleStage;
  protocol?: DeviceProtocol;
  limit?: number;
  offset?: number;
}

export interface ListDevicesResponse {
  devices: KSVDevice[];
  total: number;
  limit: number;
  offset: number;
}

export interface GetDeviceStateResponse {
  device: KSVDevice;
  state: DeviceState;
}

export interface UpdateFirmwareRequest {
  deviceId: string;
  targetVersion: string;
  updateUrl?: string;
  signature?: string;           // Signed update — MUST be verified before applying
  scheduleAt?: string;          // If omitted, update is applied immediately
}

export interface UpdateFirmwareResponse {
  success: boolean;
  jobId: string;
  currentVersion: string;
  targetVersion: string;
  scheduledAt?: string;
  message: string;
}

export interface QuarantineDeviceRequest {
  deviceId: string;
  reason: string;
  adminAccountId: string;
}

export interface DecommissionDeviceRequest {
  deviceId: string;
  reason: string;
  wipeLocalData: boolean;
}

// ---------------------------------------------------------------
// API Route Definitions
// ---------------------------------------------------------------

export const DEVICE_ROUTES = {
  // CRUD
  REGISTER_DEVICE:         'POST /api/v1/devices',
  LIST_DEVICES:            'GET  /api/v1/devices',
  GET_DEVICE:              'GET  /api/v1/devices/:deviceId',
  UPDATE_DEVICE:           'PUT  /api/v1/devices/:deviceId',
  DELETE_DEVICE:           'DELETE /api/v1/devices/:deviceId',

  // State
  GET_DEVICE_STATE:        'GET  /api/v1/devices/:deviceId/state',

  // Capabilities
  LIST_CAPABILITIES:       'GET  /api/v1/devices/:deviceId/capabilities',
  GET_CAPABILITY:          'GET  /api/v1/devices/:deviceId/capabilities/:capabilityId',

  // Firmware
  UPDATE_FIRMWARE:         'POST /api/v1/devices/:deviceId/firmware/update',
  GET_FIRMWARE_STATUS:     'GET  /api/v1/devices/:deviceId/firmware/status',
  ROLLBACK_FIRMWARE:       'POST /api/v1/devices/:deviceId/firmware/rollback',

  // Lifecycle
  QUARANTINE_DEVICE:       'POST /api/v1/devices/:deviceId/quarantine',
  RELEASE_QUARANTINE:      'POST /api/v1/devices/:deviceId/quarantine/release',
  DECOMMISSION_DEVICE:     'POST /api/v1/devices/:deviceId/decommission',

  // Groups
  LIST_DEVICE_GROUPS:      'GET  /api/v1/device-groups',
  CREATE_DEVICE_GROUP:     'POST /api/v1/device-groups',
  ADD_TO_GROUP:            'POST /api/v1/device-groups/:groupId/devices',
  REMOVE_FROM_GROUP:       'DELETE /api/v1/device-groups/:groupId/devices/:deviceId',
} as const;

// ---------------------------------------------------------------
// Handler Interfaces
// ---------------------------------------------------------------

export interface DeviceAPIHandlers {
  registerDevice(accountId: string, req: RegisterDeviceRequest): Promise<KSVDevice>;
  listDevices(accountId: string, req: ListDevicesRequest): Promise<ListDevicesResponse>;
  getDevice(deviceId: string, accountId: string): Promise<KSVDevice>;
  updateDevice(deviceId: string, req: UpdateDeviceRequest, accountId: string): Promise<KSVDevice>;
  deleteDevice(deviceId: string, accountId: string): Promise<{ success: boolean }>;

  getDeviceState(deviceId: string, accountId: string): Promise<GetDeviceStateResponse>;
  listCapabilities(deviceId: string, accountId: string): Promise<DeviceCapability[]>;

  updateFirmware(req: UpdateFirmwareRequest, accountId: string): Promise<UpdateFirmwareResponse>;
  rollbackFirmware(deviceId: string, targetVersion: string, accountId: string): Promise<{ success: boolean }>;

  quarantineDevice(req: QuarantineDeviceRequest): Promise<{ success: boolean }>;
  releaseQuarantine(deviceId: string, adminAccountId: string, reason: string): Promise<{ success: boolean }>;
  decommissionDevice(req: DecommissionDeviceRequest, accountId: string): Promise<{ success: boolean }>;
}

// ---------------------------------------------------------------
// Security Rules
// ---------------------------------------------------------------

export const DEVICE_SECURITY_RULES = {
  /** Firmware updates must be cryptographically signed before application. */
  FIRMWARE_MUST_BE_SIGNED: true,

  /** Quarantined devices cannot receive commands until released by an admin. */
  QUARANTINED_DEVICE_NO_COMMANDS: true,

  /**
   * Capabilities marked as safety-relevant must also pass the Safety Engine
   * before a command is executed.
   */
  SAFETY_RELEVANT_CAPABILITIES_REQUIRE_SAFETY_CHECK: true,

  /**
   * High-risk capabilities require additional human confirmation.
   */
  HIGH_RISK_REQUIRES_CONFIRMATION: true,
} as const;

// ---------------------------------------------------------------
// Audit Events
// ---------------------------------------------------------------

export type DeviceAuditEvent =
  | 'device.registered'
  | 'device.updated'
  | 'device.deleted'
  | 'device.state.read'
  | 'device.firmware.update_started'
  | 'device.firmware.update_completed'
  | 'device.firmware.update_failed'
  | 'device.firmware.rolled_back'
  | 'device.quarantined'
  | 'device.quarantine_released'
  | 'device.decommissioned'
  | 'device.security_state_changed';
