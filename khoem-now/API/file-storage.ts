/**
 * KSV API — File & Media Storage Domain
 * Location: khoem-now/API/file-storage.ts
 *
 * Handles uploads/downloads for firmware binaries, exported reports,
 * incident evidence, and device photos. Firmware files here connect
 * directly to the signed-update rule in device.ts.
 */

// ============================================================
// Types
// ============================================================

export type FileCategory =
  | "firmware"
  | "report_export"
  | "incident_evidence"
  | "device_photo"
  | "avatar";

export interface StoredFile {
  fileId: string;
  ownerType: "device" | "organization" | "account";
  ownerId: string;
  category: FileCategory;
  sizeBytes: number;
  checksum: string; // sha256
  isImmutable: boolean; // true once attached to an incident
  createdAt: string;
}

export interface UploadSession {
  uploadId: string;
  status: "pending" | "uploaded" | "verified" | "expired";
  maxSizeBytes: number;
  expiresAt: string;
}

export interface FileAccessGrant {
  grantId: string;
  fileId: string;
  granteeAccountId: string;
  permission: "read_only";
  expiresAt: string;
}

export interface StorageQuota {
  organizationId: string;
  usedBytes: number;
  limitBytes: number;
}

// ============================================================
// Routes
// ============================================================

export const FILE_STORAGE_ROUTES = {
  UPLOAD_INITIATE: { method: "POST", path: "/api/v1/files/upload/initiate" },
  UPLOAD_COMPLETE: { method: "POST", path: "/api/v1/files/upload/complete" },
  DOWNLOAD: { method: "GET", path: "/api/v1/files/:id" },
  DELETE: { method: "DELETE", path: "/api/v1/files/:id" },
  SHARE: { method: "POST", path: "/api/v1/files/:id/share" },
  GET_QUOTA: { method: "GET", path: "/api/v1/files/storage/quota" },
} as const;

// ============================================================
// Security Rules
// ============================================================

export const FILE_STORAGE_SECURITY_RULES = [
  "FIRMWARE_MUST_BE_SIGNED_AND_CHECKSUM_VERIFIED", // ties to device.ts firmware update rule
  "FILES_ARE_PRIVATE_BY_DEFAULT_SHARING_REQUIRES_EXPLICIT_GRANT",
  "INCIDENT_EVIDENCE_IS_IMMUTABLE_ONCE_ATTACHED", // ties to security.ts incident rules
  "MALWARE_SCAN_REQUIRED_BEFORE_FILE_AVAILABLE",
] as const;

// ============================================================
// Audit Events
// ============================================================

export enum FileStorageAuditEvent {
  UPLOADED = "file.uploaded",
  DOWNLOADED = "file.downloaded",
  DELETED = "file.deleted",
  ACCESS_GRANTED = "file.access_granted",
  ACCESS_REVOKED = "file.access_revoked",
  CHECKSUM_MISMATCH = "file.checksum_mismatch",
}
