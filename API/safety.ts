// =============================================================
// KSV — Safety API
// Domain: Safety Engine — separate from Security, works alongside it
// RULE: Authorized ≠ Safe. Safety Engine can block any command.
// =============================================================

export type SafetyRuleType =
  | 'operating_hours'
  | 'interlock'
  | 'rate_limit'
  | 'value_range'
  | 'sequence_requirement'
  | 'human_presence'
  | 'environmental_condition'
  | 'emergency_override'
  | 'dependency_check';

export type SafetyRuleSeverity = 'critical' | 'high' | 'medium' | 'low';
export type SafetyEventType = 'rule_triggered' | 'emergency_stop' | 'interlock_activated' | 'manual_override' | 'system_safe';
export type SafetyState = 'normal' | 'warning' | 'alert' | 'emergency' | 'lockdown';

// ---------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------

export interface SafetyRule {
  ruleId: string;
  name: string;
  description: string;
  type: SafetyRuleType;
  severity: SafetyRuleSeverity;
  deviceIds: string[];            // Which devices this rule applies to
  deviceTypes?: string[];
  conditions: SafetyCondition;
  action: SafetyAction;
  isActive: boolean;
  orgId?: string;
  createdBy: string;
  createdAt: string;
  triggeredCount: number;
  lastTriggeredAt?: string;
}

export interface SafetyCondition {
  // Operating hours
  allowedFromTime?: string;       // HH:MM 24h
  allowedToTime?: string;
  allowedDaysOfWeek?: number[];

  // Value range
  minValue?: number;
  maxValue?: number;
  capability?: string;

  // Rate limit
  maxCommandsPerMinute?: number;
  maxCommandsPerHour?: number;

  // Interlock: device B must be in state X before device A can act
  interlockDeviceId?: string;
  interlockCapability?: string;
  interlockRequiredValue?: unknown;

  // Environmental
  temperatureMaxC?: number;
  temperatureMinC?: number;
  humidityMaxPct?: number;

  // Sequence: device must be in X state first
  requiredPrecedingAction?: string;
}

export interface SafetyAction {
  type: 'block' | 'warn' | 'require_confirmation' | 'emergency_stop' | 'alert_admin';
  message: string;
  requireApprovalFrom?: string;   // accountId of required approver
  alertAccountIds?: string[];
  autoResetAfterSeconds?: number;
}

export interface SafetyCheckRequest {
  deviceId: string;
  capability: string;
  value: unknown;
  commandId: string;
  accountId: string;
  context?: Record<string, unknown>;
}

export interface SafetyCheckResponse {
  commandId: string;
  allowed: boolean;
  triggeredRules: Array<{
    ruleId: string;
    name: string;
    severity: SafetyRuleSeverity;
    action: SafetyAction;
  }>;
  requiresConfirmation: boolean;
  blockingReason?: string;
  message: string;
}

export interface SafetyEvent {
  eventId: string;
  eventType: SafetyEventType;
  deviceId: string;
  ruleId?: string;
  commandId?: string;
  triggeredBy?: string;
  severity: SafetyRuleSeverity;
  state: SafetyState;
  message: string;
  occurredAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface DeviceSafetyStatus {
  deviceId: string;
  state: SafetyState;
  activeRules: SafetyRule[];
  lastEvent?: SafetyEvent;
  isEmergencyStopped: boolean;
  emergencyStoppedAt?: string;
  emergencyStoppedBy?: string;
}

// ---------------------------------------------------------------
// Request / Response Shapes
// ---------------------------------------------------------------

export interface CreateSafetyRuleRequest {
  name: string;
  description: string;
  type: SafetyRuleType;
  severity: SafetyRuleSeverity;
  deviceIds: string[];
  deviceTypes?: string[];
  conditions: SafetyCondition;
  action: SafetyAction;
  orgId?: string;
}

export interface UpdateSafetyRuleRequest {
  name?: string;
  description?: string;
  conditions?: SafetyCondition;
  action?: SafetyAction;
  isActive?: boolean;
}

export interface EmergencyStopRequest {
  scope: 'device' | 'room' | 'building' | 'site' | 'org';
  scopeId: string;
  reason: string;
  confirmationToken: string;      // Required — prevents accidental triggers
}

export interface EmergencyStopResponse {
  success: boolean;
  stoppedDeviceCount: number;
  stoppedAt: string;
  eventIds: string[];
  message: string;
}

export interface ReleaseEmergencyStopRequest {
  scope: 'device' | 'room' | 'building' | 'site' | 'org';
  scopeId: string;
  reason: string;
  safetyVerification: string;     // Checklist confirmation before release
}

export interface ListSafetyEventsRequest {
  deviceId?: string;
  ruleId?: string;
  eventType?: SafetyEventType;
  fromTime?: string;
  toTime?: string;
  limit?: number;
  offset?: number;
}

// ---------------------------------------------------------------
// API Route Definitions
// ---------------------------------------------------------------

export const SAFETY_ROUTES = {
  // Safety check (called by Command API internally)
  CHECK_SAFETY:            'POST /api/v1/safety/check',

  // Rules
  CREATE_RULE:             'POST /api/v1/safety/rules',
  LIST_RULES:              'GET  /api/v1/safety/rules',
  GET_RULE:                'GET  /api/v1/safety/rules/:ruleId',
  UPDATE_RULE:             'PUT  /api/v1/safety/rules/:ruleId',
  DELETE_RULE:             'DELETE /api/v1/safety/rules/:ruleId',
  ENABLE_RULE:             'POST /api/v1/safety/rules/:ruleId/enable',
  DISABLE_RULE:            'POST /api/v1/safety/rules/:ruleId/disable',

  // Device safety status
  GET_DEVICE_SAFETY:       'GET  /api/v1/safety/devices/:deviceId',
  LIST_DEVICE_SAFETY:      'GET  /api/v1/safety/devices',

  // Emergency
  EMERGENCY_STOP:          'POST /api/v1/safety/emergency-stop',
  RELEASE_EMERGENCY_STOP:  'POST /api/v1/safety/emergency-stop/release',

  // Events
  LIST_SAFETY_EVENTS:      'GET  /api/v1/safety/events',
  GET_SAFETY_EVENT:        'GET  /api/v1/safety/events/:eventId',
} as const;

// ---------------------------------------------------------------
// Handler Interfaces
// ---------------------------------------------------------------

export interface SafetyAPIHandlers {
  checkSafety(req: SafetyCheckRequest): Promise<SafetyCheckResponse>;

  createRule(accountId: string, req: CreateSafetyRuleRequest): Promise<SafetyRule>;
  listRules(accountId: string, orgId?: string): Promise<SafetyRule[]>;
  getRule(ruleId: string, accountId: string): Promise<SafetyRule>;
  updateRule(ruleId: string, req: UpdateSafetyRuleRequest, accountId: string): Promise<SafetyRule>;
  deleteRule(ruleId: string, accountId: string): Promise<{ success: boolean }>;
  enableRule(ruleId: string, accountId: string): Promise<{ success: boolean }>;
  disableRule(ruleId: string, accountId: string): Promise<{ success: boolean }>;

  getDeviceSafetyStatus(deviceId: string, accountId: string): Promise<DeviceSafetyStatus>;

  emergencyStop(accountId: string, req: EmergencyStopRequest): Promise<EmergencyStopResponse>;
  releaseEmergencyStop(accountId: string, req: ReleaseEmergencyStopRequest): Promise<{ success: boolean; releasedDeviceCount: number }>;

  listSafetyEvents(accountId: string, req: ListSafetyEventsRequest): Promise<{ events: SafetyEvent[]; total: number }>;
  getSafetyEvent(eventId: string, accountId: string): Promise<SafetyEvent>;
}

// ---------------------------------------------------------------
// Security Rules
// ---------------------------------------------------------------

export const SAFETY_SECURITY_RULES = {
  /**
   * Safety Engine operates INDEPENDENTLY from Security.
   * Even an authorized, authenticated user can be blocked by Safety rules.
   */
  SAFETY_INDEPENDENT_FROM_SECURITY: true,

  /**
   * Emergency Stop cannot be blocked by automation rules or AI.
   * It always takes precedence.
   */
  EMERGENCY_STOP_CANNOT_BE_OVERRIDDEN: true,

  /**
   * Safety rules for industrial/vehicle/high-risk devices require
   * at minimum "manager" permission level to modify.
   */
  HIGH_RISK_RULES_REQUIRE_MANAGER: true,

  /**
   * Releasing an Emergency Stop requires explicit safety verification.
   * It is not undone automatically or by a simple API call.
   */
  EMERGENCY_RELEASE_REQUIRES_VERIFICATION: true,
} as const;

// ---------------------------------------------------------------
// Audit Events
// ---------------------------------------------------------------

export type SafetyAuditEvent =
  | 'safety.check.passed'
  | 'safety.check.blocked'
  | 'safety.check.warning'
  | 'safety.rule.created'
  | 'safety.rule.updated'
  | 'safety.rule.deleted'
  | 'safety.rule.enabled'
  | 'safety.rule.disabled'
  | 'safety.rule.triggered'
  | 'safety.emergency_stop.activated'
  | 'safety.emergency_stop.released'
  | 'safety.interlock.activated'
  | 'safety.device.state_changed';
