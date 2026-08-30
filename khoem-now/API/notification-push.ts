/**
 * KSV API — Push Notification Delivery Domain
 * Location: khoem-now/API/notification-push.ts
 *
 * The delivery LAYER for push (iOS/Android/Web). Kept separate from
 * notification.ts, which owns notification CONTENT and CATEGORY rules
 * (what to send, to whom, under what preference). This file is about
 * HOW a push actually reaches a device token.
 */

// ============================================================
// Types
// ============================================================

export type PushPlatform = "fcm" | "apns" | "web_push";
export type PushDeliveryStatus = "queued" | "sent" | "failed" | "invalid_token";

export interface PushProvider {
  providerId: string;
  platform: PushPlatform;
  credentialsRef: string; // reference into Key & Secret Management, never raw here
  isActive: boolean;
}

export interface PushDeliveryAttempt {
  attemptId: string;
  notificationId: string;
  deviceTokenId: string;
  status: PushDeliveryStatus;
  errorCode?: string;
  attemptedAt: string;
}

export interface PushBatchJob {
  jobId: string;
  targetCount: number;
  sentCount: number;
  failedCount: number;
  status: "pending" | "running" | "completed" | "failed";
}

export interface DeviceTokenHealth {
  tokenId: string;
  isValid: boolean;
  lastSuccessAt?: string;
  consecutiveFailures: number;
}

// ============================================================
// Routes
// ============================================================

export const PUSH_ROUTES = {
  SEND: { method: "POST", path: "/api/v1/push/send" },
  SEND_BATCH: { method: "POST", path: "/api/v1/push/send-batch" },
  GET_JOB: { method: "GET", path: "/api/v1/push/jobs/:id" },
  CONFIGURE_PROVIDER: { method: "POST", path: "/api/v1/push/providers" },
  TOKEN_HEALTH: { method: "GET", path: "/api/v1/push/tokens/:id/health" },
  CLEANUP_TOKENS: { method: "POST", path: "/api/v1/push/tokens/cleanup" },
} as const;

// ============================================================
// Security Rules
// ============================================================

export const PUSH_SECURITY_RULES = [
  "PROVIDER_CREDENTIALS_STORED_VIA_KEY_MANAGEMENT", // see security.ts, never plain config
  "INVALID_TOKENS_AUTO_CLEANED_AFTER_N_FAILURES",
  "PUSH_PAYLOAD_CONTAINS_NO_SENSITIVE_DATA", // title/body/deep-link only
  "BATCH_RATE_LIMITED_TO_PROVIDER_QUOTA",
] as const;

// ============================================================
// Audit Events
// ============================================================

export enum PushAuditEvent {
  DELIVERY_FAILED = "push.delivery_failed",
  PROVIDER_CONFIGURED = "push.provider_configured",
  TOKENS_CLEANED = "push.tokens_cleaned",
  BATCH_JOB_COMPLETED = "push.batch_job_completed",
}
