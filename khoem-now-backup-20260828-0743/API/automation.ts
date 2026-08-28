// =============================================================
// KSV — Automation API
// Domain: IF condition THEN action — Time/Sensor/Event-based
// RULE: Automation obeys the same Permission + Safety rules as manual commands
// =============================================================

export type TriggerType =
  | 'schedule'
  | 'device_state'
  | 'sensor_value'
  | 'time_of_day'
  | 'sunrise_sunset'
  | 'location_enter'
  | 'location_exit'
  | 'device_online'
  | 'device_offline'
  | 'safety_event'
  | 'manual';

export type AutomationStatus = 'active' | 'inactive' | 'paused' | 'error' | 'running';
export type ConditionOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'in' | 'not_in';
export type ActionType = 'device_command' | 'notification' | 'scene_activate' | 'webhook' | 'delay';

// ---------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------

export interface AutomationRule {
  ruleId: string;
  name: string;
  description?: string;
  status: AutomationStatus;
  ownerAccountId: string;
  orgId?: string;
  siteId?: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  conditionLogic: 'all' | 'any';
  actions: AutomationAction[];
  lastTriggeredAt?: string;
  triggerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationTrigger {
  type: TriggerType;
  // Schedule
  cronExpression?: string;
  timezone?: string;
  // Device state
  deviceId?: string;
  capability?: string;
  // Sensor value
  sensorDeviceId?: string;
  sensorCapability?: string;
  // Time of day
  time?: string;              // HH:MM 24h
  daysOfWeek?: number[];
  // Sunrise/Sunset
  sunriseOffsetMinutes?: number;
  sunsetOffsetMinutes?: number;
  // Location
  siteId?: string;
  buildingId?: string;
}

export interface AutomationCondition {
  conditionId: string;
  deviceId?: string;
  capability?: string;
  operator: ConditionOperator;
  value: unknown;
  valueMax?: unknown;         // For 'between' operator
}

export interface AutomationAction {
  actionId: string;
  order: number;
  type: ActionType;
  // Device command
  deviceId?: string;
  capability?: string;
  commandValue?: unknown;
  // Notification
  notifyAccountIds?: string[];
  notificationMessage?: string;
  // Scene
  sceneId?: string;
  // Webhook
  webhookUrl?: string;
  webhookPayload?: Record<string, unknown>;
  // Delay
  delaySeconds?: number;
  // Safety override prevention
  bypassSafety: false;        // ALWAYS false — automation CANNOT bypass Safety Engine
}

export interface AutomationScene {
  sceneId: string;
  name: string;
  description?: string;
  ownerAccountId: string;
  orgId?: string;
  roomId?: string;
  actions: AutomationAction[];
  createdAt: string;
}

export interface AutomationLog {
  logId: string;
  ruleId: string;
  triggeredAt: string;
  conditionsMet: boolean;
  actionsExecuted: number;
  actionsFailed: number;
  durationMs: number;
  results: Array<{
    actionId: string;
    success: boolean;
    commandId?: string;
    errorMessage?: string;
  }>;
}

// ---------------------------------------------------------------
// Request / Response Shapes
// ---------------------------------------------------------------

export interface CreateRuleRequest {
  name: string;
  description?: string;
  orgId?: string;
  siteId?: string;
  trigger: AutomationTrigger;
  conditions?: AutomationCondition[];
  conditionLogic?: 'all' | 'any';
  actions: Omit<AutomationAction, 'bypassSafety'>[];
}

export interface UpdateRuleRequest {
  name?: string;
  description?: string;
  trigger?: AutomationTrigger;
  conditions?: AutomationCondition[];
  conditionLogic?: 'all' | 'any';
  actions?: Omit<AutomationAction, 'bypassSafety'>[];
  status?: 'active' | 'inactive';
}

export interface TestRuleRequest {
  ruleId: string;
  dryRun: boolean;            // If true, validate only — do not execute
}

export interface TestRuleResponse {
  ruleId: string;
  conditionsMet: boolean;
  actionsWouldExecute: AutomationAction[];
  safetyCheckResults: Array<{
    actionId: string;
    allowed: boolean;
    reason?: string;
  }>;
  message: string;
}

export interface CreateSceneRequest {
  name: string;
  description?: string;
  orgId?: string;
  roomId?: string;
  actions: Omit<AutomationAction, 'bypassSafety'>[];
}

export interface ActivateSceneRequest {
  sceneId: string;
  context?: Record<string, unknown>;
}

export interface ListAutomationLogsRequest {
  ruleId?: string;
  fromTime?: string;
  toTime?: string;
  limit?: number;
  offset?: number;
}

// ---------------------------------------------------------------
// API Route Definitions
// ---------------------------------------------------------------

export const AUTOMATION_ROUTES = {
  // Rules
  CREATE_RULE:             'POST /api/v1/automation/rules',
  LIST_RULES:              'GET  /api/v1/automation/rules',
  GET_RULE:                'GET  /api/v1/automation/rules/:ruleId',
  UPDATE_RULE:             'PUT  /api/v1/automation/rules/:ruleId',
  DELETE_RULE:             'DELETE /api/v1/automation/rules/:ruleId',
  ENABLE_RULE:             'POST /api/v1/automation/rules/:ruleId/enable',
  DISABLE_RULE:            'POST /api/v1/automation/rules/:ruleId/disable',
  TEST_RULE:               'POST /api/v1/automation/rules/:ruleId/test',

  // Scenes
  CREATE_SCENE:            'POST /api/v1/automation/scenes',
  LIST_SCENES:             'GET  /api/v1/automation/scenes',
  GET_SCENE:               'GET  /api/v1/automation/scenes/:sceneId',
  UPDATE_SCENE:            'PUT  /api/v1/automation/scenes/:sceneId',
  DELETE_SCENE:            'DELETE /api/v1/automation/scenes/:sceneId',
  ACTIVATE_SCENE:          'POST /api/v1/automation/scenes/:sceneId/activate',

  // Logs
  LIST_AUTOMATION_LOGS:    'GET  /api/v1/automation/logs',
  GET_AUTOMATION_LOG:      'GET  /api/v1/automation/logs/:logId',
} as const;

// ---------------------------------------------------------------
// Handler Interfaces
// ---------------------------------------------------------------

export interface AutomationAPIHandlers {
  createRule(accountId: string, req: CreateRuleRequest): Promise<AutomationRule>;
  listRules(accountId: string, orgId?: string): Promise<AutomationRule[]>;
  getRule(ruleId: string, accountId: string): Promise<AutomationRule>;
  updateRule(ruleId: string, req: UpdateRuleRequest, accountId: string): Promise<AutomationRule>;
  deleteRule(ruleId: string, accountId: string): Promise<{ success: boolean }>;
  enableRule(ruleId: string, accountId: string): Promise<{ success: boolean }>;
  disableRule(ruleId: string, accountId: string): Promise<{ success: boolean }>;
  testRule(accountId: string, req: TestRuleRequest): Promise<TestRuleResponse>;

  createScene(accountId: string, req: CreateSceneRequest): Promise<AutomationScene>;
  listScenes(accountId: string, orgId?: string): Promise<AutomationScene[]>;
  getScene(sceneId: string, accountId: string): Promise<AutomationScene>;
  updateScene(sceneId: string, req: CreateSceneRequest, accountId: string): Promise<AutomationScene>;
  deleteScene(sceneId: string, accountId: string): Promise<{ success: boolean }>;
  activateScene(accountId: string, req: ActivateSceneRequest): Promise<{ success: boolean; commandsIssued: number }>;

  listLogs(accountId: string, req: ListAutomationLogsRequest): Promise<{ logs: AutomationLog[]; total: number }>;
  getLog(logId: string, accountId: string): Promise<AutomationLog>;
}

// ---------------------------------------------------------------
// Security Rules
// ---------------------------------------------------------------

export const AUTOMATION_SECURITY_RULES = {
  /**
   * Automation rules CANNOT bypass Authorization.
   * Every action in an automation goes through the same
   * Command pipeline as a manual command.
   */
  AUTOMATION_CANNOT_BYPASS_AUTHZ: true,

  /**
   * Automation rules CANNOT bypass the Safety Engine.
   * bypassSafety is always forced to false.
   */
  AUTOMATION_CANNOT_BYPASS_SAFETY: true,

  /**
   * Automation rules cannot grant themselves higher permissions
   * than the owner of the rule.
   */
  AUTOMATION_INHERITS_OWNER_PERMISSIONS: true,

  /**
   * If an automation rule is created by an operator,
   * it can only issue commands the operator is permitted to issue manually.
   */
  RULE_PERMISSIONS_BOUNDED_BY_CREATOR: true,
} as const;

// ---------------------------------------------------------------
// Audit Events
// ---------------------------------------------------------------

export type AutomationAuditEvent =
  | 'automation.rule.created'
  | 'automation.rule.updated'
  | 'automation.rule.deleted'
  | 'automation.rule.enabled'
  | 'automation.rule.disabled'
  | 'automation.rule.triggered'
  | 'automation.rule.trigger_failed'
  | 'automation.rule.safety_blocked'
  | 'automation.scene.created'
  | 'automation.scene.updated'
  | 'automation.scene.deleted'
  | 'automation.scene.activated'
  | 'automation.scene.activation_failed';
