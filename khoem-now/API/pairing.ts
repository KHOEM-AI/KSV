/**
 * khoem-now/API/pairing.ts
 * Device Pairing API — "ភ្ជាប់ឧបករណ៍ចូលជាផ្លូវការ ក្រោយ Discovery"
 *
 * ស្នូល: ខុសពី discovery.ts (គ្រាន់តែរកឃើញ, គ្មានសិទ្ធិ) — pairing.ts ជាជំហាន
 * ដែលបង្កើត Ownership ដំបូង (Section 11) ។ លំដាប់ធម្មតា (Section 10):
 *   SCAN → DEVICE FOUND (discovery.ts) → IDENTITY VERIFIED → OWNER VERIFIED
 *        → PAIRING → PERMISSION → SECURE CONNECTION → READY
 */

import type { DiscoveredDevice } from './discovery';

// ============================================================
// Types
// ============================================================

export type PairingMethod =
  | 'device_code'
  | 'qr'
  | 'pin'
  | 'manufacturer_credential'
  | 'certificate';

export type PairingStatus =
  | 'identity_verified'
  | 'owner_verification_pending'
  | 'paired'
  | 'permission_pending'
  | 'ready'
  | 'failed'
  | 'expired';

export interface DevicePairingRequest {
  requestId: string;
  accountId: string;
  discoveredDeviceId: DiscoveredDevice['deviceId'];
  method: PairingMethod;
  proof: string; // QR payload / PIN / manufacturer credential token / cert
}

export interface PairingSession {
  sessionId: string;
  requestId: string;
  status: PairingStatus;
  deviceId?: string; // assigned once paired
  ownerAccountId: string;
  organizationId?: string;
  createdAt: string;
  expiresAt: string; // TTL — session មិនអាចនៅសល់ចោលមិនកំណត់
}

export interface DevicePairingRecord {
  deviceId: string;
  ownerAccountId: string;
  organizationId?: string;
  pairedAt: string;
  pairingMethod: PairingMethod;
  revokedAt?: string;
}

export interface OwnershipTransferRequest {
  transferId: string;
  deviceId: string;
  fromAccountId: string;
  toAccountId: string;
  status: 'pending_current_owner' | 'pending_new_owner' | 'completed' | 'rejected';
}

export interface UnpairRequest {
  deviceId: string;
  requestedBy: string;
  reason?: string;
}

// ============================================================
// API Routes (8 endpoints)
// ============================================================

export const PAIRING_ROUTES = {
  startSession: { method: 'POST', path: '/api/v1/pairing/sessions' },
  getSession: { method: 'GET', path: '/api/v1/pairing/sessions/:id' },
  verifyOwner: { method: 'POST', path: '/api/v1/pairing/sessions/:id/verify-owner' },
  confirmPairing: { method: 'POST', path: '/api/v1/pairing/sessions/:id/confirm' },
  cancelSession: { method: 'DELETE', path: '/api/v1/pairing/sessions/:id' },
  listPairedDevices: { method: 'GET', path: '/api/v1/pairing/devices' },
  unpairDevice: { method: 'POST', path: '/api/v1/pairing/devices/:deviceId/unpair' },
  transferOwnership: { method: 'POST', path: '/api/v1/pairing/devices/:deviceId/transfer' },
} as const;

// ============================================================
// Security Rules
// ============================================================
// - Discovery ≠ Permission — pairing តែងតែត្រូវការ owner verification
//   ដាច់ដោយឡែក មិនអាចទុកចិត្តលើ discoveredDeviceId ម្នាក់ឯងទេ
// - Session មាន TTL ខ្លី (expiresAt) — pairing មិនចប់ក្នុងពេលកំណត់ត្រូវ expire
// - ជោគជ័យ Pairing = ការបង្កើត Ownership record ដំបូង (Section 11) — នេះជា
//   ប្រភពដើមនៃសិទ្ធិទាំងអស់លើ device នោះ
// - Unpair ត្រូវ cascade-revoke គ្រប់ permission/delegation ដែលភ្ជាប់មកពី
//   ownership នេះ (មិនមែនលុបតែ record ដោយមិនប៉ះ permission ផ្សេង)
// - Ownership Transfer ត្រូវការ confirmation ពី **ទាំងម្ចាស់ចាស់ និងម្ចាស់ថ្មី**
//   (មិនមែនម្ចាស់ចាស់ម្នាក់ឯងសម្រេចបាន)

// ============================================================
// Audit Events (8 events)
// ============================================================

export type PairingAuditEvent =
  | 'pairing.session_started'
  | 'pairing.identity_verified'
  | 'pairing.owner_verified'
  | 'pairing.completed'
  | 'pairing.failed'
  | 'pairing.session_expired'
  | 'pairing.device_unpaired'
  | 'pairing.ownership_transferred';

