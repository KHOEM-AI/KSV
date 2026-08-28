// =============================================================
// KSV — Command API
// Domain: User Command → Auth → AuthZ → Capability → Safety → Execute → Audit
// RULE: Every command passes through ALL layers. No shortcuts.
// =============================================================

export type CommandStatus =
  | 'pending'
  | 'auth_check'
  | 'safety_check'
  | 'executing'
  | 'success'
  | 'failed'
  | 'rejected_auth'
  | 'rejected_safety'
  | 'rejected_capability'
  | 'timeout'
  | 'cancelled';

export type CommandSource = 'user_app' | 'automation' | 'ai_layer' | 'api' | 'gateway_local' | 'admin';

// ---------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------

export interface KSVCommand {
  commandId: string;
  deviceId: string;
  capability: string;
  value: unknown;
  source: CommandSource;
  issuedBy: string;               // accountId
  sessionId?: string;
  status: CommandStatus;
  issuedAt: string;
  executedAt?: string;
  completedAt?: string;
  result?: CommandResult;
  safetyCheckResult?: SafetyCheckResult;
  authCheckResult?: AuthCheckResult;
}

export interface CommandResult {
  success: boolean;
  returnedValue?: unknown;
  errorCode?: string;
  errorMessage?: string;
  deviceFeedback?: unknown;
}

export interface AuthCheckResult {
  allowed: boolean;
  reason?: string;
  permissionId?: string;
}

export interface SafetyCheckResult {
  allowed: boolean;
  reason?: string;
  ruleId?: string;
  requiresConfirmation?: boolean;
}

// ---------------------------------------------------------------
// Request / Response Shapes
// ---------------------------------------------------------------

export interface IssueCommandRequest {
  deviceId: string;
  capability: string;
  value: unknown;
  confirmationToken?: string;     // Required for high-risk commands
  context?: CommandContext;
}

export interface CommandContext {
  locationSiteId?: string;
  locationBuildingId?: string;
  userConfirmed?: boolean;
  reason?: string;
}

export interface IssueCommandResponse {
  commandId: string;
  status: CommandStatus;
  requiresConfirmation?: boolean;
  confirmationChallenge?: string;
  estimatedCompletionMs?: number;
  message: string;
}

export interface GetCommandStatusResponse {
  command: KSVCommand;
}

export interface IssueBatchCommandRequest {
  commands: Array<{
    deviceId: string;
    capability: string;
    value: unknown;
  }>;
  failFast?: boolean;            // Stop on first failure
  confirmationToken?: string;
}

export interface IssueBatchCommandResponse {
  batchId: string;
  total: number;
  accepted: number;
  rejected: number;
  commands: Array<{
    commandId: string;
    deviceId: string;
    status: CommandStatus;
  }>;
}

export interface CancelCommandRequest {
  commandId: string;
  reason?: string;
}

export interface ListCommandHistoryRequest {
  deviceId?: string;
  accountId?: string;
  status?: CommandStatus;
  fromTime?: string;
  toTime?: string;
  limit?: number;
  offset?: number;
}

export interface ListCommandHistoryResponse {
  commands: KSVCommand[];
  total: number;
}

export interface EmergencyStopRequest {
  scope: 'device' | 'room' | 'building' | 'site' | 'org';
  scopeId: string;
  reason: string;
  confirmationToken: string;
}

export interface EmergencyStopResponse {
  success: boolean;
  affectedDeviceCount: number;
  stoppedAt: string;
  message: string;
}

// ---------------------------------------------------------------
// API Route Definitions
// ---------------------------------------------------------------

export const COMMAND_ROUTES = {
  ISSUE_COMMAND:           'POST /api/v1/commands',
  ISSUE_BATCH_COMMAND:     'POST /api/v1/commands/batch',
  GET_COMMAND_STATUS:      'GET  /api/v1/commands/:commandId',
  CANCEL_COMMAND:          'POST /api/v1/commands/:commandId/cancel',
  LIST_COMMAND_HISTORY:    'GET  /api/v1/commands/history',
  EMERGENCY_STOP:          'POST /api/v1/commands/emergency-stop',
} as const;

// ---------------------------------------------------------------
// Command Execution Pipeline
// ---------------------------------------------------------------

/**
 * Every command passes through this pipeline in strict order.
 * No step can be skipped. Failure at any step rejects the command.
 *
 * 1. PARSE       — Validate command structure and capability name
 * 2. AUTHENTICATE — Verify the session is valid and not expired
 * 3. AUTHORIZE   — Check permission for this device + capability + action
 * 4. CAPABILITY  — Verify the device supports this capability
 * 5. SAFETY      — Check Safety Engine (especially for high-risk devices)
 * 6. CONFIRM     — If high-risk, require explicit human confirmation
 * 7. EXECUTE     — Send command to device via appropriate protocol
 * 8. RESULT      — Collect device feedback
 * 9. AUDIT       — Record all of the above (not the user's password/secrets)
 */
export const COMMAND_PIPELINE_STAGES = [
  'parse',
  'authenticate',
  'authorize',
  'capability_check',
  'safety_check',
  'human_confirmation',
  'execute',
  'collect_result',
  'audit',
] as const;

// ---------------------------------------------------------------
// Handler Interfaces
// ---------------------------------------------------------------

export interface CommandAPIHandlers {
  /**
   * Issue a single command to a device.
   * Runs through the full pipeline: Auth → AuthZ → Capability → Safety → Execute.
   */
  issueCommand(accountId: string, sessionId: string, req: IssueCommandRequest): Promise<IssueCommandResponse>;

  /**
   * Issue commands to multiple devices at once.
   */
  issueBatchCommand(accountId: string, sessionId: string, req: IssueBatchCommandRequest): Promise<IssueBatchCommandResponse>;

  /**
   * Poll the status of a command (for async commands).
   */
  getCommandStatus(commandId: string, accountId: string): Promise<GetCommandStatusResponse>;

  /**
   * Cancel a pending or executing command (if possible).
   */
  cancelCommand(accountId: string, req: CancelCommandRequest): Promise<{ success: boolean }>;

  /**
   * List command history with filters.
   */
  listCommandHistory(accountId: string, req: ListCommandHistoryRequest): Promise<ListCommandHistoryResponse>;

  /**
   * Immediately stop all commands for a scope (device/room/building/site/org).
   * Used in emergencies. Requires confirmation token.
   */
  emergencyStop(accountId: string, req: EmergencyStopRequest): Promise<EmergencyStopResponse>;
}

// ---------------------------------------------------------------
// Security Rules
// ---------------------------------------------------------------

export const COMMAND_SECURITY_RULES = {
  /** Every command must pass authentication before anything else. */
  AUTHENTICATION_REQUIRED: true,

  /** Every command must pass authorization (explicit permission). */
  AUTHORIZATION_REQUIRED: true,

  /** Safety-relevant capabilities must pass the Safety Engine. */
  SAFETY_CHECK_FOR_HIGH_RISK: true,

  /** High-risk commands require a human confirmation token. */
  HIGH_RISK_REQUIRES_CONFIRMATION: true,

  /** Commands time out if not completed within this many seconds. */
  DEFAULT_TIMEOUT_SECONDS: 30,

  /** Emergency stop is always honored regardless of automation state. */
  EMERGENCY_STOP_CANNOT_BE_BLOCKED: true,

  /** All commands are audited — including rejected ones. */
  ALL_COMMANDS_AUDITED: true,

  /**
   * AI-layer commands are NOT trusted more than user commands.
   * They go through the same pipeline.
   */
  AI_COMMANDS_SAME_PIPELINE: true,
} as const;

// ---------------------------------------------------------------
// Audit Events
// ---------------------------------------------------------------

export type CommandAuditEvent =
  | 'command.issued'
  | 'command.auth_rejected'
  | 'command.authz_rejected'
  | 'command.capability_rejected'
  | 'command.safety_rejected'
  | 'command.confirmation_required'
  | 'command.confirmed'
  | 'command.executed'
  | 'command.failed'
  | 'command.timeout'
  | 'command.cancelled'
  | 'command.batch_issued'
  | 'command.emergency_stop';
