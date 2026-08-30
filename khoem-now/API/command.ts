// =============================================================
// KSV — Command API
// Domain: User Command → Auth → AuthZ → Capability → Safety → Execute → Audit
// RULE: Every command passes through ALL layers. No shortcuts.
//
// Field names below are kept in sync with the Mongoose schema
// (src/infrastructure/database/models.ts, commandSchema) — that file
// is the single source of truth. If this file and models.ts ever
// disagree again, fix THIS file, not the schema.
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

export interface KSVCommand {
  commandId: string;
  deviceId: string;
  type: string;
  payload: unknown;
  source: CommandSource;
  userId?: string;
  sessionId?: string;
  status: CommandStatus;
  sentAt?: string;
  completedAt?: string;
  response?: CommandResult;
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

export interface IssueCommandRequest {
  deviceId: string;
  type: string;
  payload: unknown;
  confirmationToken?: string;
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
    type: string;
    payload: unknown;
  }>;
  failFast?: boolean;
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

export const COMMAND_ROUTES = {
  ISSUE_COMMAND:           'POST /api/v1/commands',
  ISSUE_BATCH_COMMAND:     'POST /api/v1/commands/batch',
  GET_COMMAND_STATUS:      'GET  /api/v1/commands/:commandId',
  CANCEL_COMMAND:          'POST /api/v1/commands/:commandId/cancel',
  LIST_COMMAND_HISTORY:    'GET  /api/v1/commands/history',
  EMERGENCY_STOP:          'POST /api/v1/commands/emergency-stop',
} as const;

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

export interface CommandAPIHandlers {
  issueCommand(accountId: string, sessionId: string, req: IssueCommandRequest): Promise<IssueCommandResponse>;
  issueBatchCommand(accountId: string, sessionId: string, req: IssueBatchCommandRequest): Promise<IssueBatchCommandResponse>;
  getCommandStatus(commandId: string, accountId: string): Promise<GetCommandStatusResponse>;
  cancelCommand(accountId: string, req: CancelCommandRequest): Promise<{ success: boolean }>;
  listCommandHistory(accountId: string, req: ListCommandHistoryRequest): Promise<ListCommandHistoryResponse>;
  emergencyStop(accountId: string, req: EmergencyStopRequest): Promise<EmergencyStopResponse>;
}

export const COMMAND_SECURITY_RULES = {
  AUTHENTICATION_REQUIRED: true,
  AUTHORIZATION_REQUIRED: true,
  SAFETY_CHECK_FOR_HIGH_RISK: true,
  HIGH_RISK_REQUIRES_CONFIRMATION: true,
  DEFAULT_TIMEOUT_SECONDS: 30,
  EMERGENCY_STOP_CANNOT_BE_BLOCKED: true,
  ALL_COMMANDS_AUDITED: true,
  AI_COMMANDS_SAME_PIPELINE: true,
} as const;

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
