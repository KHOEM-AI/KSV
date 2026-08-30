/**
 * KSV API — Integration & Webhook Domain
 * Location: khoem-now/API/integration-webhook.ts
 *
 * Outbound webhooks (KSV -> external system) and inbound integration
 * receivers. A webhook is a transport mechanism only — it never
 * bypasses the Command Pipeline (authenticate -> authorize -> safety).
 */

// ============================================================
// Types
// ============================================================

export type IntegrationProvider = "slack" | "teams" | "zapier" | "custom";
export type WebhookDeliveryStatus = "pending" | "delivered" | "failed" | "retrying";

export interface WebhookSubscription {
  webhookId: string;
  organizationId: string;
  eventTypes: string[]; // e.g. ["device.offline", "safety.blocked"]
  targetUrl: string; // must be HTTPS
  secretRef: string; // HMAC secret reference, never raw here
  isActive: boolean;
}

export interface WebhookDelivery {
  deliveryId: string;
  webhookId: string;
  payload: Record<string, unknown>;
  status: WebhookDeliveryStatus;
  responseCode?: number;
  retryCount: number;
  lastAttemptAt: string;
}

export interface IntegrationConnector {
  connectorId: string;
  organizationId: string;
  provider: IntegrationProvider;
  authType: "oauth" | "api_key";
  isConnected: boolean;
}

export interface IncomingWebhookEndpoint {
  endpointId: string;
  organizationId: string;
  sourceSystem: string;
  verificationToken: string;
}

// ============================================================
// Routes
// ============================================================

export const WEBHOOK_ROUTES = {
  CREATE: { method: "POST", path: "/api/v1/webhooks" },
  LIST: { method: "GET", path: "/api/v1/webhooks" },
  UPDATE: { method: "PUT", path: "/api/v1/webhooks/:id" },
  DELETE: { method: "DELETE", path: "/api/v1/webhooks/:id" },
  DELIVERIES: { method: "GET", path: "/api/v1/webhooks/:id/deliveries" },
  TEST: { method: "POST", path: "/api/v1/webhooks/:id/test" },
  CONNECT_INTEGRATION: { method: "POST", path: "/api/v1/integrations/connect" },
  DISCONNECT_INTEGRATION: { method: "DELETE", path: "/api/v1/integrations/:id/disconnect" },
  INCOMING: { method: "POST", path: "/api/v1/integrations/incoming/:endpointId" },
} as const;

// ============================================================
// Security Rules
// ============================================================

export const WEBHOOK_SECURITY_RULES = [
  "OUTBOUND_PAYLOAD_SIGNED_WITH_HMAC",
  "TARGET_URL_MUST_BE_HTTPS_ONLY",
  "INCOMING_WEBHOOK_REQUIRES_VERIFICATION_TOKEN",
  "FAILED_DELIVERY_USES_EXPONENTIAL_BACKOFF_MAX_5_RETRIES",
  "WEBHOOK_CANNOT_BYPASS_COMMAND_PIPELINE", // inbound device commands still go through authenticate/authorize/safety
] as const;

// ============================================================
// Audit Events
// ============================================================

export enum WebhookAuditEvent {
  CREATED = "webhook.created",
  DELETED = "webhook.deleted",
  DELIVERY_FAILED = "webhook.delivery_failed",
  DELIVERY_SUCCEEDED = "webhook.delivery_succeeded",
  INTEGRATION_CONNECTED = "integration.connected",
  INTEGRATION_DISCONNECTED = "integration.disconnected",
  INCOMING_REJECTED_UNVERIFIED = "incoming_webhook.rejected_unverified",
}
