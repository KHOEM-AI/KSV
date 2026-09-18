// =============================================================
// KSV — Discovery & Pairing API
// Domain: Scan → Verify → Own → Pair → Secure Connection → Ready
// RULE: Discovery ≠ Permission. Found ≠ Authorized.
// =============================================================

import type { DeviceProtocol, DeviceCategory } from './device';

export type DiscoveryMethod = 'bluetooth' | 'wifi' | 'local_network' | 'qr' | 'nfc' | 'gateway' | 'cloud_api' | 'manual';
export type PairingMethod = 'pin' | 'qr' | 'nfc' | 'push_button' | 'certificate' | 'manufacturer_credential' | 'owner_approval';
export type PairingStatus = 'pending' | 'owner_verifying' | 'pairing' | 'paired' | 'failed' | 'cancelled' | 'expired';
export type DiscoveredDeviceStatus = 'found' | 'verifying' | 'authorized' | 'unauthorized' | 'paired';

// ---------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------

export interface DiscoveredDevice {
  discoveryId: string;
  discoveryMethod: DiscoveryMethod;
  rawIdentifier: string;          // MAC, UUID, serial — for matching purposes
  name?: string;                  // Advertised name (may be spoofed — verify before trust)
  manufacturer?: string;
  model?: string;
  protocol: DeviceProtocol;
  signalStrength?: number;        // RSSI (Bluetooth/Wi-Fi)
  ipAddress?: string;
  status: DiscoveredDeviceStatus;
  discoveredAt: string;
  expiresAt: string;              // Discovery results expire
  // NOTE: This is DISCOVERY data only. It does NOT grant any permission.
}

export interface PairingSession {
  pairingSessionId: string;
  discoveryId?: string;
  deviceId?: string;              // Assigned after pairing
  accountId: string;
  method: PairingMethod;
  status: PairingStatus;
  initiatedAt: string;
  expiresAt: string;
  verificationData?: PairingVerificationData;
  failureReason?: string;
}

export interface PairingVerificationData {
  pinCode?: string;               // Shown on device screen — user enters in app
  qrPayload?: string;             // For QR-based pairing
  manufacturerChallengeToken?: string;
  // NOTE: Private keys / certs are never included in API responses
}

// ---------------------------------------------------------------
// Request / Response Shapes
// ---------------------------------------------------------------

export interface StartDiscoveryRequest {
  methods: DiscoveryMethod[];
  gatewayId?: string;
  durationSeconds?: number;       // How long to scan (default: 30)
  category?: DeviceCategory;
}

export interface StartDiscoveryResponse {
  discoveryJobId: string;
  methods: DiscoveryMethod[];
  expiresAt: string;
  message: string;
}

export interface ListDiscoveredDevicesRequest {
  discoveryJobId?: string;
  method?: DiscoveryMethod;
  includeExpired?: boolean;
}

export interface ListDiscoveredDevicesResponse {
  devices: DiscoveredDevice[];
  total: number;
  message: string;
  // Reminder: these are UNVERIFIED discovered devices
  // None have permission until explicitly paired and authorized
}

export interface VerifyDiscoveredDeviceRequest {
  discoveryId: string;
  manufacturerCredential?: string;
  ownerProof?: string;
}

export interface VerifyDiscoveredDeviceResponse {
  success: boolean;
  discoveryId: string;
  isOwnerVerified: boolean;
  requiresManufacturerCredential: boolean;
  message: string;
}

export interface InitiatePairingRequest {
  discoveryId: string;
  method: PairingMethod;
  orgId?: string;
  siteId?: string;
  buildingId?: string;
  roomId?: string;
  deviceName: string;
}

export interface InitiatePairingResponse {
  pairingSessionId: string;
  method: PairingMethod;
  verificationData?: PairingVerificationData;
  expiresAt: string;
  instructions: string;
}

export interface CompletePairingRequest {
  pairingSessionId: string;
  userVerificationCode?: string;  // PIN entered by user
  manufacturerToken?: string;
  approvalToken?: string;
}

export interface CompletePairingResponse {
  success: boolean;
  deviceId?: string;
  status: PairingStatus;
  message: string;
}

export interface UnpairDeviceRequest {
  deviceId: string;
  reason?: string;
  revokePermissions: boolean;
  wipeLocalData?: boolean;
}

export interface UnpairDeviceResponse {
  success: boolean;
  deviceId: string;
  permissionsRevoked: boolean;
  message: string;
}

// ---------------------------------------------------------------
// API Route Definitions
// ---------------------------------------------------------------

export const DISCOVERY_ROUTES = {
  // Discovery
  START_DISCOVERY:             'POST /api/v1/discovery/start',
  STOP_DISCOVERY:              'POST /api/v1/discovery/:discoveryJobId/stop',
  LIST_DISCOVERED:             'GET  /api/v1/discovery/devices',
  GET_DISCOVERED_DEVICE:       'GET  /api/v1/discovery/devices/:discoveryId',
  VERIFY_DISCOVERED_DEVICE:    'POST /api/v1/discovery/devices/:discoveryId/verify',
  DISMISS_DISCOVERED_DEVICE:   'DELETE /api/v1/discovery/devices/:discoveryId',

  // Pairing
  INITIATE_PAIRING:            'POST /api/v1/pairing/initiate',
  GET_PAIRING_STATUS:          'GET  /api/v1/pairing/:pairingSessionId',
  COMPLETE_PAIRING:            'POST /api/v1/pairing/:pairingSessionId/complete',
  CANCEL_PAIRING:              'POST /api/v1/pairing/:pairingSessionId/cancel',

  // Unpairing
  UNPAIR_DEVICE:               'POST /api/v1/devices/:deviceId/unpair',
  REPAIR_DEVICE:               'POST /api/v1/devices/:deviceId/repair',
} as const;

// ---------------------------------------------------------------
// Handler Interfaces
// ---------------------------------------------------------------

export interface DiscoveryAPIHandlers {
  startDiscovery(accountId: string, req: StartDiscoveryRequest): Promise<StartDiscoveryResponse>;
  stopDiscovery(accountId: string, discoveryJobId: string): Promise<{ success: boolean }>;
  listDiscoveredDevices(accountId: string, req: ListDiscoveredDevicesRequest): Promise<ListDiscoveredDevicesResponse>;
  verifyDiscoveredDevice(accountId: string, req: VerifyDiscoveredDeviceRequest): Promise<VerifyDiscoveredDeviceResponse>;
  dismissDiscoveredDevice(accountId: string, discoveryId: string): Promise<{ success: boolean }>;

  initiatePairing(accountId: string, req: InitiatePairingRequest): Promise<InitiatePairingResponse>;
  getPairingStatus(accountId: string, pairingSessionId: string): Promise<PairingSession>;
  completePairing(accountId: string, req: CompletePairingRequest): Promise<CompletePairingResponse>;
  cancelPairing(accountId: string, pairingSessionId: string): Promise<{ success: boolean }>;

  unpairDevice(accountId: string, req: UnpairDeviceRequest): Promise<UnpairDeviceResponse>;
}

// ---------------------------------------------------------------
// Security Rules
// ---------------------------------------------------------------

export const DISCOVERY_SECURITY_RULES = {
  /**
   * DISCOVERY NEVER EQUALS PERMISSION.
   * A found device has zero authorization until explicitly paired and
   * the owner verifies their credentials.
   */
  DISCOVERY_NEVER_GRANTS_PERMISSION: true,

  /**
   * Advertised device names may be spoofed.
   * Identity is always verified via manufacturer credentials or owner proof.
   */
  ADVERTISED_NAME_NOT_TRUSTED: true,

  /** Discovery sessions expire — found devices must be acted on within the window. */
  DISCOVERY_SESSION_EXPIRY_SECONDS: 300,

  /** Pairing sessions expire — user must complete pairing within this window. */
  PAIRING_SESSION_EXPIRY_SECONDS: 120,

  /**
   * Firmware and device credentials are verified cryptographically
   * before any pairing is accepted.
   */
  CRYPTOGRAPHIC_VERIFICATION_REQUIRED: true,
} as const;

// ---------------------------------------------------------------
// Audit Events
// ---------------------------------------------------------------

export type DiscoveryAuditEvent =
  | 'discovery.scan.started'
  | 'discovery.scan.stopped'
  | 'discovery.device.found'
  | 'discovery.device.verified'
  | 'discovery.device.verification_failed'
  | 'discovery.device.dismissed'
  | 'pairing.initiated'
  | 'pairing.completed'
  | 'pairing.failed'
  | 'pairing.cancelled'
  | 'pairing.expired'
  | 'device.unpaired'
  | 'device.repaired';
