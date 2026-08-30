// =============================================================
// KSV — API Index
// Central export point for all API domains under khoem-now/API/
// =============================================================
//
// KSV API is organized by DOMAIN, not as one giant file.
// This keeps the codebase manageable as the platform grows.
//
// NOTE ON MERGED DOMAINS:
// "Pairing" was originally listed as its own domain in the
// project concept doc, but Discovery and Pairing are tightly
// coupled in the real flow (Scan → Found → Verify → Pair →
// Ready), so both live together in discovery.ts to avoid
// splitting one continuous flow across two files.
// =============================================================

export * from './identity';
export * from './authentication';
export * from './account-recovery';
export * from './authorization';
export * from './organization';
export * from './device';
export * from './discovery';        // includes Pairing
export * from './protocol';
export * from './gateway';
export * from './command';
export * from './safety';
export * from './automation';
export * from './security';
export * from './audit';
export * from './notification';
export * from './international';
export * from './administration';

// ---------------------------------------------------------------
// Combined Route Registry
// (useful for generating API docs, OpenAPI specs, or a router table)
// ---------------------------------------------------------------

import { IDENTITY_ROUTES } from './identity';
import { AUTHENTICATION_ROUTES } from './authentication';
import { ACCOUNT_RECOVERY_ROUTES } from './account-recovery';
import { AUTHORIZATION_ROUTES } from './authorization';
import { ORGANIZATION_ROUTES } from './organization';
import { DEVICE_ROUTES } from './device';
import { DISCOVERY_ROUTES } from './discovery';
import { PROTOCOL_ROUTES } from './protocol';
import { GATEWAY_ROUTES } from './gateway';
import { COMMAND_ROUTES } from './command';
import { SAFETY_ROUTES } from './safety';
import { AUTOMATION_ROUTES } from './automation';
import { SECURITY_ROUTES } from './security';
import { AUDIT_ROUTES } from './audit';
import { NOTIFICATION_ROUTES } from './notification';
import { INTERNATIONAL_ROUTES } from './international';
import { ADMINISTRATION_ROUTES } from './administration';

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
} as const;

// ---------------------------------------------------------------
// Domain File Map — 17 files covering the 18 domains
// named in the original KSV project concept
// ---------------------------------------------------------------

export const KSV_API_DOMAIN_FILES = [
  { domain: 'Identity',        file: 'identity.ts' },
  { domain: 'Authentication',  file: 'authentication.ts' },
  { domain: 'Account Recovery',file: 'account-recovery.ts' },
  { domain: 'Authorization',   file: 'authorization.ts' },
  { domain: 'Organization',    file: 'organization.ts' },
  { domain: 'Device',          file: 'device.ts' },
  { domain: 'Discovery',       file: 'discovery.ts' },
  { domain: 'Pairing',         file: 'discovery.ts (merged)' },
  { domain: 'Protocol',        file: 'protocol.ts' },
  { domain: 'Gateway',         file: 'gateway.ts' },
  { domain: 'Command',         file: 'command.ts' },
  { domain: 'Safety',          file: 'safety.ts' },
  { domain: 'Automation',      file: 'automation.ts' },
  { domain: 'Security',        file: 'security.ts' },
  { domain: 'Audit',           file: 'audit.ts' },
  { domain: 'Notification',    file: 'notification.ts' },
  { domain: 'International',   file: 'international.ts' },
  { domain: 'Administration',  file: 'administration.ts' },
] as const;
