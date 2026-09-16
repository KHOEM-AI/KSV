// =============================================================
// KSV — Security API
// Domain: Encryption, Key/Secret Management, Monitoring, Incident Response
// RULE: No single credential/admin/device has unlimited platform control
// =============================================================

export type KeyType = 'api_key' | 'device_key' | 'certificate' | 'oauth_secret' | 'encryption_key' | 'service_credential';
export type KeyStatus = 'active' | 'rotating' | 'expired' | 'revoked' | 'compromised';
export type ThreatSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ThreatType =
  | 'brute_force'
  | 'suspicious_login'
  | 'unusual_location'
  | 'unusual_time'
  | 'abnormal_command_pattern'
  | 'permission_abuse'
  | 'device_compromise_indicator'
  | 'api_abuse'
  | 'rate_limit_exceeded'
  | 'account_takeover_indicator';

export type IncidentStatus = 'detected' | 'investigating' | 'contained' | 'resolved' | 'false_positive';

// ---------------------------------------------------------------
// Key & Secret Management
// ---------------------------------------------------------------

export interface ManagedKey {
  keyId: string;
  type: KeyType;
  ownerType: 'platform' | 'device' | 'organization' | 'user';
  ownerId: string;
  status: KeyStatus;
  algorithm?: string;
  createdAt: string;
  expiresAt?: string;
  lastRotatedAt?: string;
  rotationIntervalDays?: number;
  // The actual key VALUE is never returned by any API response.
  // Only metadata is exposed. Retrieval requires a separate,
  // heavily audited "reveal" flow limited to system processes.
}

export interface RotateKeyRequest {
  keyId: string;
  reason: string;
  immediate: boolean;           // If false, schedules rotation with grace period
}

export interface RevokeKeyRequest {
  keyId: string;
  reason: string;
  cascadeRevoke: boolean;       // Also revoke dependent keys/sessions
}

// ---------------------------------------------------------------
// Threat Detection & Monitoring
// ---------------------------------------------------------------

export interface ThreatDetection {
  detectionId: string;
  type: ThreatType;
  severity: ThreatSeverity;
  accountId?: string;
  deviceId?: string;
  ipAddress?: string;
  description: string;
  detectedAt: string;
  autoActionTaken?: string;
  requiresReview: boolean;
  falsePositiveMarked: boolean;
}

export interface SecurityIncident {
  incidentId: string;
  title: string;
  status: IncidentStatus;
  severity: ThreatSeverity;
  relatedDetectionIds: string[];
  affectedAccountIds: string[];
  affectedDeviceIds: string[];
  detectedAt: string;
  containedAt?: string;
  resolvedAt?: string;
  assignedTo?: string;
  actionsToken: IncidentAction[];
  evidencePreserved: boolean;
}

export interface IncidentAction {
  actionId: string;
  type: 'disable_account' | 'revoke_session' | 'revoke_device' | 'revoke_permission' |
        'rotate_key' | 'block_ip' | 'isolate_device' | 'alert_admin' | 'preserve_evidence';
  targetId: string;
  performedBy: string;
  performedAt: string;
  result: 'success' | 'failed';
}

// ---------------------------------------------------------------
// Request / Response Shapes
// ---------------------------------------------------------------

export interface ListKeysRequest {
  type?: KeyType;
  ownerType?: string;
  ownerId?: string;
  status?: KeyStatus;
}

export interface ListKeysResponse {
  keys: ManagedKey[];            // Metadata only — never actual key material
  total: number;
}

export interface CreateKeyRequest {
  type: KeyType;
  ownerType: 'platform' | 'device' | 'organization' | 'user';
  ownerId: string;
  algorithm?: string;
  expiresInDays?: number;
  rotationIntervalDays?: number;
}

export interface CreateKeyResponse {
  keyId: string;
  // The raw key/secret is returned EXACTLY ONCE at creation time.
  // It is never retrievable again through any API.
  secretValue: string;
  createdAt: string;
  expiresAt?: string;
  warning: string;               // "Store this securely — it will not be shown again"
}

export interface ListThreatsRequest {
  severity?: ThreatSeverity;
  type?: ThreatType;
  accountId?: string;
  fromTime?: string;
  toTime?: string;
  requiresReview?: boolean;
}

export interface MarkFalsePositiveRequest {
  detectionId: string;
  reason: string;
}

export interface CreateIncidentRequest {
  title: string;
  severity: ThreatSeverity;
  relatedDetectionIds: string[];
  description: string;
}

export interface TakeIncidentActionRequest {
  incidentId: string;
  action: IncidentAction['type'];
  targetId: string;
  reason: string;
}

export interface EncryptDataRequest {
  plaintext: string;
  keyId?: string;                // If omitted, uses default platform key
  context?: string;              // Additional authenticated data (AAD)
}

export interface EncryptDataResponse {
  ciphertext: string;
  keyId: string;
  algorithm: string;
}

export interface DecryptDataRequest {
  ciphertext: string;
  keyId: string;
  context?: string;
}

// ---------------------------------------------------------------
// API Route Definitions
// ---------------------------------------------------------------

export const SECURITY_ROUTES = {
  // Key management (Admin / System only)
  CREATE_KEY:              'POST /api/v1/security/keys',
  LIST_KEYS:               'GET  /api/v1/security/keys',
  GET_KEY_METADATA:        'GET  /api/v1/security/keys/:keyId',
  ROTATE_KEY:              'POST /api/v1/security/keys/:keyId/rotate',
  REVOKE_KEY:              'POST /api/v1/security/keys/:keyId/revoke',

  // Encryption service (internal use)
  ENCRYPT:                 'POST /api/v1/security/encrypt',
  DECRYPT:                 'POST /api/v1/security/decrypt',

  // Threat detection
  LIST_THREATS:            'GET  /api/v1/security/threats',
  GET_THREAT:              'GET  /api/v1/security/threats/:detectionId',
  MARK_FALSE_POSITIVE:     'POST /api/v1/security/threats/:detectionId/false-positive',

  // Incidents
  CREATE_INCIDENT:         'POST /api/v1/security/incidents',
  LIST_INCIDENTS:          'GET  /api/v1/security/incidents',
  GET_INCIDENT:            'GET  /api/v1/security/incidents/:incidentId',
  TAKE_INCIDENT_ACTION:    'POST /api/v1/security/incidents/:incidentId/actions',
  RESOLVE_INCIDENT:        'POST /api/v1/security/incidents/:incidentId/resolve',

  // Rate limiting status
  GET_RATE_LIMIT_STATUS:   'GET  /api/v1/security/rate-limit/:accountId',
} as const;

// ---------------------------------------------------------------
// Handler Interfaces
// ---------------------------------------------------------------

export interface SecurityAPIHandlers {
  createKey(adminAccountId: string, req: CreateKeyRequest): Promise<CreateKeyResponse>;
  listKeys(adminAccountId: string, req: ListKeysRequest): Promise<ListKeysResponse>;
  getKeyMetadata(keyId: string, adminAccountId: string): Promise<ManagedKey>;
  rotateKey(adminAccountId: string, req: RotateKeyRequest): Promise<{ success: boolean; newKeyId: string }>;
  revokeKey(adminAccountId: string, req: RevokeKeyRequest): Promise<{ success: boolean; affectedCount: number }>;

  encrypt(req: EncryptDataRequest): Promise<EncryptDataResponse>;
  decrypt(req: DecryptDataRequest): Promise<{ plaintext: string }>;

  listThreats(adminAccountId: string, req: ListThreatsRequest): Promise<{ threats: ThreatDetection[]; total: number }>;
  getThreat(detectionId: string, adminAccountId: string): Promise<ThreatDetection>;
  markFalsePositive(adminAccountId: string, req: MarkFalsePositiveRequest): Promise<{ success: boolean }>;

  createIncident(adminAccountId: string, req: CreateIncidentRequest): Promise<SecurityIncident>;
  listIncidents(adminAccountId: string, status?: IncidentStatus): Promise<SecurityIncident[]>;
  getIncident(incidentId: string, adminAccountId: string): Promise<SecurityIncident>;
  takeIncidentAction(adminAccountId: string, req: TakeIncidentActionRequest): Promise<IncidentAction>;
  resolveIncident(incidentId: string, adminAccountId: string, summary: string): Promise<{ success: boolean }>;

  getRateLimitStatus(accountId: string): Promise<{ remaining: number; resetAt: string; limit: number }>;
}

// ---------------------------------------------------------------
// Security Rules
// ---------------------------------------------------------------

export const SECURITY_CORE_RULES = {
  /**
   * Raw key/secret material is returned EXACTLY ONCE, at creation.
   * No API can retrieve it again afterward — only rotate or revoke.
   */
  SECRETS_SHOWN_ONCE_ONLY: true,

  /** All secrets at rest are encrypted using platform-managed encryption keys. */
  ENCRYPTION_AT_REST: true,

  /** All API traffic must use TLS 1.2 or higher. */
  MIN_TLS_VERSION: '1.2',

  /**
   * THE MOST IMPORTANT SECURITY RULE:
   * No single credential, account, API, administrator, device, or
   * security layer should automatically have unlimited control
   * over the entire platform.
   */
  NO_SINGLE_POINT_OF_UNLIMITED_CONTROL: true,

  /** Detected threats requiring review must be triaged within this window. */
  THREAT_REVIEW_SLA_HOURS: 4,

  /** Critical incidents trigger automatic admin alerts. */
  CRITICAL_INCIDENT_AUTO_ALERT: true,
} as const;

// ---------------------------------------------------------------
// Audit Events
// ---------------------------------------------------------------

export type SecurityAuditEvent =
  | 'security.key.created'
  | 'security.key.rotated'
  | 'security.key.revoked'
  | 'security.key.compromised'
  | 'security.threat.detected'
  | 'security.threat.false_positive'
  | 'security.incident.created'
  | 'security.incident.action_taken'
  | 'security.incident.resolved'
  | 'security.rate_limit.exceeded'
  | 'security.encryption.performed'
  | 'security.decryption.performed';
