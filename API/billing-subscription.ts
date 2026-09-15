/**
 * KSV API — Billing & Subscription Domain
 * Location: khoem-now/API/billing-subscription.ts
 *
 * Manages plans, invoices, and payment methods. Deliberately isolated
 * from the Security Core — no billing type here ever grants device
 * access or platform permissions.
 */

// ============================================================
// Types
// ============================================================

export type PlanTier = "free" | "pro" | "enterprise";
export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "trialing";
export type InvoiceStatus = "paid" | "due" | "overdue" | "void";
export type PaymentMethodType = "card" | "bank" | "wallet";

export interface SubscriptionPlan {
  planId: string;
  name: string;
  tier: PlanTier;
  deviceLimit: number;
  priceMonthly: number;
  currency: string;
}

export interface OrganizationSubscription {
  subscriptionId: string;
  organizationId: string;
  planId: string;
  status: SubscriptionStatus;
  renewalDate: string;
  createdAt: string;
}

export interface Invoice {
  invoiceId: string;
  organizationId: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issuedAt: string;
  dueAt: string;
}

export interface PaymentMethod {
  methodId: string;
  organizationId: string;
  type: PaymentMethodType;
  last4: string; // never the full number — tokenized by payment processor
  isDefault: boolean;
}

export interface UsageMeter {
  organizationId: string;
  metricType: "devices" | "commands" | "storage";
  currentValue: number;
  limit: number;
}

// ============================================================
// Routes
// ============================================================

export const BILLING_ROUTES = {
  LIST_PLANS: { method: "GET", path: "/api/v1/billing/plans" },
  CREATE_SUBSCRIPTION: { method: "POST", path: "/api/v1/billing/subscriptions" },
  UPDATE_SUBSCRIPTION: { method: "PUT", path: "/api/v1/billing/subscriptions/:id" },
  CANCEL_SUBSCRIPTION: { method: "DELETE", path: "/api/v1/billing/subscriptions/:id" },
  LIST_INVOICES: { method: "GET", path: "/api/v1/billing/invoices" },
  DOWNLOAD_INVOICE: { method: "GET", path: "/api/v1/billing/invoices/:id/download" },
  ADD_PAYMENT_METHOD: { method: "POST", path: "/api/v1/billing/payment-methods" },
  REMOVE_PAYMENT_METHOD: { method: "DELETE", path: "/api/v1/billing/payment-methods/:id" },
  GET_USAGE: { method: "GET", path: "/api/v1/billing/usage" },
} as const;

// ============================================================
// Security Rules
// ============================================================

export const BILLING_SECURITY_RULES = [
  "FULL_CARD_NUMBER_NEVER_STORED", // tokenized by payment processor only
  "ONLY_BILLING_ADMIN_CAN_VIEW_BILLING_DATA",
  "USAGE_OVER_LIMIT_NOTIFIES_BEFORE_SUSPENDING", // grace period, not instant cutoff
  "DOWNGRADE_BLOCKED_IF_OVER_NEW_PLAN_DEVICE_LIMIT",
] as const;

// ============================================================
// Audit Events
// ============================================================

export enum BillingAuditEvent {
  SUBSCRIPTION_CREATED = "subscription.created",
  SUBSCRIPTION_UPGRADED = "subscription.upgraded",
  SUBSCRIPTION_DOWNGRADED = "subscription.downgraded",
  SUBSCRIPTION_CANCELLED = "subscription.cancelled",
  INVOICE_GENERATED = "invoice.generated",
  INVOICE_PAID = "invoice.paid",
  PAYMENT_METHOD_ADDED = "payment_method.added",
  PAYMENT_METHOD_REMOVED = "payment_method.removed",
}
