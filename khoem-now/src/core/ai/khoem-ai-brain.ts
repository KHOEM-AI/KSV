import { containsDisrespect as conductContainsDisrespect } from "./khoem-ai-conduct.ts";
/**
 * KHOEM-AI Brain
 * ------------------------------------------------------------------
 * Deterministic, rule-based analysis for the KSV platform.
 *
 * This module does not:
 *   - authenticate users;
 *   - grant permissions;
 *   - bypass the independent safety engine;
 *   - dispatch commands to physical devices;
 *   - claim success without a verified acknowledgement; or
 *   - replace a human decision-maker for critical actions.
 *
 * The expected command chain is:
 *
 *   identity
 *     -> authentication
 *     -> authorization
 *     -> intent interpretation
 *     -> brain analysis
 *     -> device capability check
 *     -> safety engine
 *     -> human confirmation, when required
 *     -> command execution
 *     -> real device acknowledgement
 *     -> audit
 *
 * The brain may add caution. It must never remove an authorization or
 * safety requirement supplied by another layer.
 */

// =====================================================================
// 1. Public identity and vocabulary
// =====================================================================

export const SELF_IDENTITY = Object.freeze({
  name: "KHOEM-AI",
  platform: "KSV",
  role: "Defensive deterministic rule-based AI decision layer",
  purpose:
    "Evaluate intent, estimate risk, preserve provenance, and disclose verified outcomes",
  autonomy: "non-autonomous",
  authority: "advisory and policy evaluation only",
  version: "3.0.0",
  mode: "RULE_BASED_ONLY",
  capabilities: [
    "Understand user intent",
    "Answer general customer questions",
    "Explain KSV features and workflows",
    "Evaluate risk and authorization context",
    "Disclose verified outcomes and limitations",
  ],
  notCapableOf: [
    "Bypass authorization",
    "Execute unauthorized device commands",
    "Act autonomously without policy checks",
    "Guarantee unverified information",
  ],
} as const);

export type ThreatLevel = "none" | "low" | "medium" | "high" | "critical";

export type BrainDecisionAction =
  | "allow"
  | "allow_after_confirmation"
  | "require_authorization"
  | "require_safety_check"
  | "block"
  | "decline"
  | "pending_verification";

export type BrainDecisionName = "ALLOW" | "WARN" | "BLOCK";

export type CommandStatus = "pending" | "success" | "failed" | "blocked";

export type VerificationStatus =
  | "verified"
  | "unverified"
  | "pending"
  | "failed"
  | "not_applicable"
  | "VERIFIED_REAL"
  | "UNVERIFIED"
  | "SIMULATED";

export type AuthorityStatus = "granted" | "denied" | "unknown";

export type SafetyStatus = "passed" | "allowed" | "blocked" | "unknown";

export type ProvenanceType =
  | "user_input"
  | "api_response"
  | "device_ack"
  | "protocol_result"
  | "database_record"
  | "system_policy"
  | "unverified_claim"
  | "simulation"
  | "rule_engine";

export type IntentType =
  | "greeting"
  | "question"
  | "status_request"
  | "read_request"
  | "control_request"
  | "security_request"
  | "account_request"
  | "help_request"
  | "unknown";

export type AICommandType =
  | "LOCK"
  | "UNLOCK"
  | "OPEN"
  | "CLOSE"
  | "RESET"
  | "SETPOINT"
  | "SPEED_LIMIT"
  | "START"
  | "STOP"
  | "IMMOBILIZE"
  | "RELEASE"
  | "FIRMWARE_UPDATE"
  | "DECOMMISSION"
  | "DELETE"
  | "TRANSFER_OWNERSHIP"
  | "EMERGENCY_RELEASE"
  | "REPAIR"
  | "QUARANTINE"
  | "SYNC"
  | "GET_STATUS"
  | "READ_STATE"
  | "READ_TELEMETRY"
  | "READ_CAPABILITIES";

export const AI_COMMAND_TYPES: readonly AICommandType[] = Object.freeze([
  "LOCK",
  "UNLOCK",
  "OPEN",
  "CLOSE",
  "RESET",
  "SETPOINT",
  "SPEED_LIMIT",
  "START",
  "STOP",
  "IMMOBILIZE",
  "RELEASE",
  "FIRMWARE_UPDATE",
  "DECOMMISSION",
  "DELETE",
  "TRANSFER_OWNERSHIP",
  "EMERGENCY_RELEASE",
  "REPAIR",
  "QUARANTINE",
  "SYNC",
  "GET_STATUS",
  "READ_STATE",
  "READ_TELEMETRY",
  "READ_CAPABILITIES",
]);

// =====================================================================
// 2. Public data contracts
// =====================================================================

export interface ProvenanceRecord {
  source: ProvenanceType;
  verified: boolean;
  receivedAt?: string;
  referenceId?: string;
  note?: string;
}

export interface ThreatSignal {
  code: string;
  severity: ThreatLevel;
  score: number;
  message: string;
  evidence?: string;
}

export interface CommandSignals {
  isInsideGeoFence?: boolean;
  humanZoneOccupied?: boolean;
  tamperDetected?: boolean;
  currentSpeed?: number;
  doorForceLockActive?: boolean;
}

export interface DeviceCommandInput {
  deviceId: string;
  type: string;
  payload?: Record<string, unknown>;
  signals?: CommandSignals;
  organizationId?: string;
  requestedByUserId?: string;
}

export type StructuredCommand = DeviceCommandInput;

export interface DeviceCommandOutcome {
  commandId?: string;
  deviceId: string;
  type: string;
  status: CommandStatus;
  response?: Record<string, unknown>;
  sentAt?: string;
  completedAt?: string;
  acknowledged?: boolean;
  acknowledgementId?: string;
  errorCode?: string;
  errorMessage?: string;
  organizationId?: string;
  provenance?: ProvenanceRecord[];
}

export interface AuthorityContext {
  status?: AuthorityStatus;
  authenticationStatus?: "authenticated" | "unauthenticated" | "unknown";
  userId?: string | null;
  actorId?: string | null;
  organizationId?: string | null;
  requiredPermission?: string;
  permission?: string;
  permissionSource?: string;
  reason?: string;
}

export interface SafetyContext {
  status: SafetyStatus;
  ruleId?: string;
  ruleIds?: string[];
  ruleName?: string;
  blockedBy?: string[];
  reason?: string;
  evaluatedAt?: string;
}

export interface AnalysisInput {
  text?: string;
  action?: string;
  requestedAction?: string;
  intent?: IntentType;
  command?: DeviceCommandInput;
  payload?: Record<string, unknown>;
  authority?: AuthorityContext;
  safety?: SafetyContext;
  provenance?: ProvenanceRecord[];
  conversationId?: string;
  userId?: string | null;
  organizationId?: string;
  ip?: string;
  deviceId?: string;
  confirmed?: boolean;
  userConfirmed?: boolean;
  humanAuthorized?: boolean;
  recentFailureCount?: number;
  recentFailures?: number;
  recentActionCount?: number;
  requestsInWindow?: number;
  windowSeconds?: number;
  requestId?: string;
}

export interface RiskFactor {
  code: string;
  level: ThreatLevel;
  weight: number;
  reason: string;
  source: ProvenanceType;
}

export interface BrainDecision {
  action: BrainDecisionAction;
  threatLevel: ThreatLevel;
  riskScore: number;
  requiresConfirmation: boolean;
  requiresAuthorization: boolean;
  requiresSafetyCheck: boolean;
  reason: string;
  userMessage: string;
  riskFactors: RiskFactor[];
}

export interface AnalysisResult {
  decision: BrainDecision;
  intent: IntentType;
  normalizedText: string;
  detectedInjection: boolean;
  detectedDisrespect: boolean;
  provenance: ProvenanceRecord[];
  safeFallback: string;
  threatLevel: ThreatLevel;
  score: number;
  reasons: string[];
  matchedSignatures: string[];
  signals: ThreatSignal[];
  safeToContinue: boolean;
  verificationStatus: VerificationStatus;
}

export interface AIIntentResult {
  intent: IntentType;
  commandType?: AICommandType;
  deviceId?: string;
  confidence: number;
  requiresClarification: boolean;
  reason: string;
  matchedPhrases: string[];
}

export interface CommandEvaluationInput {
  command: DeviceCommandInput;
  authority?: AuthorityContext;
  safety?: SafetyContext;
  confirmed?: boolean;
  userConfirmed?: boolean;
  humanAuthorized?: boolean;
  deviceKnown?: boolean;
  gatewayConfigured?: boolean;
  protocolConfigured?: boolean;
  adapterAvailable?: boolean;
  organizationMatches?: boolean;
  recentFailureCount?: number;
  recentActionCount?: number;
  windowSeconds?: number;
}

export interface CommandEvaluationResult {
  allowedToDispatch: boolean;
  decision: BrainDecision;
  normalizedCommand: DeviceCommandInput;
  requiredChecks: string[];
  blockedChecks: string[];
  provenance: ProvenanceRecord[];
  blocker:
    | "none"
    | "brain"
    | "authentication"
    | "authorization"
    | "safety"
    | "confirmation"
    | "verification"
    | "device"
    | "unknown";
}

export interface SelfDefenseInput {
  text?: string;
  source?: ProvenanceType;
  repeatedFailures?: number;
  requestsInWindow?: number;
  authorization?: AuthorityStatus;
  integrityWarning?: boolean;
  tamperDetected?: boolean;
}

export interface SelfDefenseResult {
  protected: boolean;
  threatLevel: ThreatLevel;
  action: BrainDecisionAction;
  reason: string;
  response: string;
  riskFactors: RiskFactor[];
}

export interface DeviceOutcomeInput {
  command: DeviceCommandInput;
  result: Partial<DeviceCommandOutcome>;
  acknowledged?: boolean;
  acknowledgementId?: string;
  protocolVerified?: boolean;
  transportVerified?: boolean;
  auditRecorded?: boolean;
}

export interface SafeFallback {
  code: string;
  message: string;
  disclose: boolean;
}

export interface BrainStatus {
  identity: typeof SELF_IDENTITY;
  deterministic: true;
  autonomousExecution: false;
  canGrantPermissions: false;
  canBypassSafety: false;
  canClaimDeviceSuccessWithoutAck: false;
  supportedCommandStatuses: readonly CommandStatus[];
  supportedThreatLevels: readonly ThreatLevel[];
  safeMode: boolean;
  failureThreshold: number;
  burstThreshold: number;
}

// =====================================================================
// 3. Limits, signatures, and command policy
// =====================================================================

const FAILURE_THRESHOLD = 3;
const FAILURE_BLOCK_THRESHOLD = 5;
const BURST_THRESHOLD = 10;
const BURST_BLOCK_THRESHOLD = 30;
const MAX_TEXT_LENGTH = 4_000;
const MAX_STRING_LENGTH = 10_000;
const MAX_PAYLOAD_DEPTH = 8;
const MAX_REASONS = 30;
const MAX_RISK_SCORE = 100;
const MAX_COMMAND_TYPE_LENGTH = 100;
const MAX_DEVICE_ID_LENGTH = 200;

const INJECTION_PATTERNS: readonly {
  code: string;
  pattern: RegExp;
  level: ThreatLevel;
  weight: number;
}[] = [
  {
    code: "prompt_injection_override",
    pattern:
      /ignore\s+(?:all|any|the)\s+(?:previous|prior|above)\s+instructions|disregard\s+(?:system|safety)\s+rules|reveal\s+(?:the\s+)?(?:system\s+prompt|hidden instructions)/i,
    level: "high",
    weight: 80,
  },
  {
    code: "authorization_bypass",
    pattern: /bypass\s+(?:authorization|security)|override\s+security|disable\s+safety/i,
    level: "critical",
    weight: 100,
  },
  {
    code: "credential_exfiltration",
    pattern:
      /(?:show|send|print|reveal|export|dump)\s+(?:the\s+)?(?:password|secret|token|api\s*key|private\s*key|credential)/i,
    level: "critical",
    weight: 100,
  },
  {
    code: "shell_command_injection",
    pattern:
      /(?:^|\s)(?:sudo|chmod|chown|rm\s+-rf|curl\s+https?:|wget\s+https?:|bash\s+-c|sh\s+-c)(?:\s|$)/i,
    level: "critical",
    weight: 100,
  },
  {
    code: "script_injection",
    pattern: /<script[\s>]|<\/script>|javascript:|on\w+\s*=/i,
    level: "critical",
    weight: 100,
  },
  {
    code: "path_traversal",
    pattern: /(?:\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e\\)/i,
    level: "high",
    weight: 80,
  },
  {
    code: "encoded_payload_marker",
    pattern: /(?:base64|atob\s*\(|fromcharcode|charcodeat|hex\s*decode)/i,
    level: "medium",
    weight: 35,
  },
];

const HIGH_RISK_COMMANDS = new Set<string>([
  "UNLOCK",
  "OPEN",
  "RESET",
  "FIRMWARE_UPDATE",
  "DECOMMISSION",
  "DELETE",
  "TRANSFER_OWNERSHIP",
  "EMERGENCY_RELEASE",
  "IMMOBILIZE",
  "RELEASE",
]);

const MEDIUM_RISK_COMMANDS = new Set<string>([
  "LOCK",
  "CLOSE",
  "SETPOINT",
  "SPEED_LIMIT",
  "START",
  "STOP",
  "REPAIR",
  "QUARANTINE",
  "SYNC",
]);

const READ_ONLY_COMMANDS = new Set<string>([
  "GET_STATUS",
  "READ_STATE",
  "READ_TELEMETRY",
  "READ_CAPABILITIES",
]);

const SENSITIVE_KEY_PATTERN =
  /password|passcode|secret|token|authorization|cookie|privatekey|private_key|api[-_]?key|credential|cardnumber|card_number|cvv|otp/i;

const COMMAND_ALIASES: readonly {
  commandType: AICommandType;
  phrases: readonly string[];
}[] = [
  {
    commandType: "SPEED_LIMIT",
    phrases: ["speed limit", "limit speed", "កំណត់ល្បឿន", "បន្ថយល្បឿន"],
  },
  {
    commandType: "SETPOINT",
    phrases: [
      "setpoint",
      "set point",
      "set temperature",
      "កំណត់សីតុណ្ហភាព",
    ],
  },
  {
    commandType: "IMMOBILIZE",
    phrases: [
      "immobilize",
      "immobilise",
      "បញ្ឈប់ចលនា",
      "ធ្វើឱ្យឈប់",
      "ធ្វើឲ្យឈប់",
    ],
  },
  { commandType: "UNLOCK", phrases: ["unlock", "ដោះសោ", "បើកសោ"] },
  { commandType: "LOCK", phrases: ["lock", "ចាក់សោ", "បិទសោ"] },
  { commandType: "OPEN", phrases: ["open", "បើក"] },
  { commandType: "CLOSE", phrases: ["close", "បិទ"] },
  { commandType: "RELEASE", phrases: ["release", "ដោះ", "បញ្ចេញ"] },
  {
    commandType: "RESET",
    phrases: ["reset", "restart device", "កំណត់ឡើងវិញ", "ចាប់ផ្តើមឡើងវិញ"],
  },
  {
    commandType: "START",
    phrases: ["start", "turn on", "power on", "ចាប់ផ្តើម", "បើកដំណើរការ"],
  },
  {
    commandType: "STOP",
    phrases: ["stop", "turn off", "power off", "បញ្ឈប់", "បិទដំណើរការ"],
  },
  { commandType: "GET_STATUS", phrases: ["status", "ស្ថានភាព"] },
  { commandType: "READ_STATE", phrases: ["state", "read state"] },
  { commandType: "READ_TELEMETRY", phrases: ["telemetry", "ទិន្នន័យឧបករណ៍"] },
];

// =====================================================================
// 4. Small deterministic helpers
// =====================================================================

function nowIso(): string {
  return new Date().toISOString();
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(MAX_RISK_SCORE, Math.round(value)));
}

function normalizeText(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TEXT_LENGTH);
}

function normalizeIdentifier(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function normalizeCommandType(value: unknown): string {
  return normalizeIdentifier(value, MAX_COMMAND_TYPE_LENGTH).toUpperCase();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function limitReasons(values: string[]): string[] {
  return uniqueStrings(values).slice(0, MAX_REASONS);
}

function containsSignature(text: string, signatures: readonly string[]): boolean {
  const normalized = text.toLowerCase();
  return signatures.some((signature) => normalized.includes(signature));
}

function threatFromScore(score: number): ThreatLevel {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  if (score > 0) return "low";
  return "none";
}

function threatRank(level: ThreatLevel): number {
  return ["none", "low", "medium", "high", "critical"].indexOf(level);
}

function highestThreat(...levels: ThreatLevel[]): ThreatLevel {
  return levels.reduce<ThreatLevel>(
    (highest, level) =>
      threatRank(level) > threatRank(highest) ? level : highest,
    "none",
  );
}

function riskWeight(level: ThreatLevel): number {
  switch (level) {
    case "critical":
      return 80;
    case "high":
      return 60;
    case "medium":
      return 30;
    case "low":
      return 10;
    default:
      return 0;
  }
}

function makeProvenance(
  source: ProvenanceType,
  verified: boolean,
  note?: string,
  referenceId?: string,
): ProvenanceRecord {
  return {
    source,
    verified,
    receivedAt: nowIso(),
    note,
    referenceId,
  };
}

function makeRiskFactor(
  code: string,
  level: ThreatLevel,
  reason: string,
  source: ProvenanceType,
): RiskFactor {
  return {
    code,
    level,
    weight: riskWeight(level),
    reason,
    source,
  };
}

function calculateRiskScore(factors: readonly RiskFactor[]): number {
  return clampScore(factors.reduce((total, factor) => total + factor.weight, 0));
}

function makeDecision(
  action: BrainDecisionAction,
  threatLevel: ThreatLevel,
  riskScore: number,
  reason: string,
  userMessage: string,
  riskFactors: RiskFactor[],
  requiresConfirmation = false,
  requiresAuthorization = false,
  requiresSafetyCheck = false,
): BrainDecision {
  return {
    action,
    threatLevel,
    riskScore,
    requiresConfirmation,
    requiresAuthorization,
    requiresSafetyCheck,
    reason,
    userMessage,
    riskFactors,
  };
}

function mergeProvenance(
  ...groups: Array<readonly ProvenanceRecord[] | undefined>
): ProvenanceRecord[] {
  const merged: ProvenanceRecord[] = [];

  for (const group of groups) {
    if (!group) continue;

    for (const record of group) {
      if (
        record &&
        typeof record.source === "string" &&
        typeof record.verified === "boolean"
      ) {
        merged.push({ ...record });
      }
    }
  }

  return merged;
}

function isKhmerText(text?: string): boolean {
  if (!text) return false;
  return /[\u1780-\u17FF]/.test(text);
}

function safeFallbackFor(code: string, sourceText?: string): SafeFallback {
  const useKhmer = isKhmerText(sourceText);

  const fallbacks: Record<string, SafeFallback> = {
    PROMPT_INJECTION: {
      code,
      message: useKhmer
        ? "សំណើនេះមានការណែនាំដែលផ្ទុយពីគោលការណ៍សុវត្ថិភាពប្រព័ន្ធ។"
        : "The request contains instructions that conflict with system safety policy.",
      disclose: true,
    },
    AUTHORIZATION_REQUIRED: {
      code,
      message: useKhmer
        ? "សិទ្ធិដែលត្រូវការមិនទាន់ត្រូវបានផ្ទៀងផ្ទាត់នៅឡើយទេ។"
        : "The required permission has not been verified.",
      disclose: true,
    },
    SAFETY_CHECK_REQUIRED: {
      code,
      message: useKhmer
        ? "ត្រូវការឆែកសុវត្ថិភាពមុននឹងបន្តសកម្មភាពនេះ។"
        : "A safety check is required before this action can continue.",
      disclose: true,
    },
    SAFETY_BLOCKED: {
      code,
      message: useKhmer
        ? "សកម្មភាពនេះត្រូវបានទប់ស្កាត់ដោយវិធានសុវត្ថិភាព។"
        : "The action was blocked by a safety rule.",
      disclose: true,
    },
    DEVICE_ACK_NOT_RECEIVED: {
      code,
      message: useKhmer
        ? "ពាក្យបញ្ជាមិនត្រូវបានរាយការណ៍ថាជោគជ័យទេ ព្រោះការទទួលស្គាល់ពីឧបករណ៍មិនទាន់ត្រូវបានផ្ទៀងផ្ទាត់។"
        : "The command is not reported as successful because device acknowledgement was not verified.",
      disclose: true,
    },
    INVALID_COMMAND: {
      code,
      message: useKhmer
        ? "ទិន្នន័យពាក្យបញ្ជាមិនពេញលេញ ឬមិនត្រឹមត្រូវ។"
        : "The command data is incomplete or invalid.",
      disclose: true,
    },
    INTEGRITY_WARNING: {
      code,
      message: useKhmer
        ? "ប្រព័ន្ធបានរកឃើញការព្រមានអំពីភាពត្រឹមត្រូវ និងបានចូលទៅរកសភាពការពារ។"
        : "The system detected an integrity warning and entered a protected state.",
      disclose: true,
    },
  };

  return (
    fallbacks[code] ?? {
      code,
      message: "The requested action could not be verified.",
      disclose: true,
    }
  );
}

function normalizeCommand(command: DeviceCommandInput): DeviceCommandInput {
  return {
    deviceId: normalizeIdentifier(command.deviceId, MAX_DEVICE_ID_LENGTH),
    type: normalizeCommandType(command.type),
    payload: isRecord(command.payload) ? { ...command.payload } : undefined,
    signals:
      command.signals && typeof command.signals === "object"
        ? { ...command.signals }
        : undefined,
    organizationId:
      normalizeIdentifier(command.organizationId, MAX_DEVICE_ID_LENGTH) ||
      undefined,
    requestedByUserId:
      normalizeIdentifier(command.requestedByUserId, MAX_DEVICE_ID_LENGTH) ||
      undefined,
  };
}

function isValidCommand(command: DeviceCommandInput): boolean {
  return command.deviceId.length > 0 && command.type.length > 0;
}

function authorityIsGranted(authority?: AuthorityContext): boolean {
  return (
    authority?.status === "granted" &&
    authority.authenticationStatus !== "unauthenticated"
  );
}

function authorityIsDenied(authority?: AuthorityContext): boolean {
  return (
    authority?.status === "denied" ||
    authority?.authenticationStatus === "unauthenticated"
  );
}

function safetyIsPassed(safety?: SafetyContext): boolean {
  return safety?.status === "passed" || safety?.status === "allowed";
}

function safetyIsBlocked(safety?: SafetyContext): boolean {
  return safety?.status === "blocked";
}

function commandRequiresConfirmation(command: DeviceCommandInput): boolean {
  return (
    HIGH_RISK_COMMANDS.has(normalizeCommandType(command.type)) ||
    normalizeCommandType(command.type) === "SETPOINT" ||
    normalizeCommandType(command.type) === "SPEED_LIMIT"
  );
}

function commandRequiresSafetyCheck(command: DeviceCommandInput): boolean {
  return !READ_ONLY_COMMANDS.has(normalizeCommandType(command.type));
}

function commandRequiresAuthorization(command: DeviceCommandInput): boolean {
  return !READ_ONLY_COMMANDS.has(normalizeCommandType(command.type));
}

// =====================================================================
// 5. Payload inspection and redaction
// =====================================================================

function scanPayload(
  payload: Record<string, unknown> | undefined,
): { signatures: string[]; signals: ThreatSignal[] } {
  if (!payload) {
    return { signatures: [], signals: [] };
  }

  const signatures: string[] = [];
  const signals: ThreatSignal[] = [];
  const visited = new Set<object>();

  function scanValue(value: unknown, path: string, depth: number): void {
    if (depth > MAX_PAYLOAD_DEPTH) {
      signals.push({
        code: "payload_depth_exceeded",
        severity: "medium",
        score: 25,
        message: "Payload nesting is deeper than the permitted analysis depth.",
        evidence: path,
      });
      return;
    }

    if (typeof value === "string") {
      const bounded = value.slice(0, MAX_STRING_LENGTH);

      for (const signature of INJECTION_PATTERNS) {
        if (signature.pattern.test(bounded)) {
          signatures.push(signature.code);
          signals.push({
            code: signature.code,
            severity: signature.level,
            score: signature.weight,
            message: `Payload matched ${signature.code}.`,
            evidence: path,
          });
        }
      }
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) =>
        scanValue(item, `${path}[${index}]`, depth + 1),
      );
      return;
    }

    if (!isRecord(value)) return;

    if (visited.has(value)) {
      signals.push({
        code: "cyclic_payload",
        severity: "high",
        score: 70,
        message: "Payload contains a cyclic object reference.",
        evidence: path,
      });
      return;
    }

    visited.add(value);

    for (const [key, nestedValue] of Object.entries(value)) {
      if (SENSITIVE_KEY_PATTERN.test(key)) continue;
      scanValue(nestedValue, path ? `${path}.${key}` : key, depth + 1);
    }
  }

  scanValue(payload, "payload", 0);

  return {
    signatures: uniqueStrings(signatures),
    signals,
  };
}

export function redactSensitivePayload(
  payload: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!payload) return undefined;

  const visited = new Set<object>();

  function redact(value: unknown, depth: number): unknown {
    if (depth > MAX_PAYLOAD_DEPTH) return "[depth-limited]";
    if (typeof value === "string") return value.slice(0, MAX_STRING_LENGTH);
    if (Array.isArray(value)) {
      return value.map((item) => redact(item, depth + 1));
    }
    if (!isRecord(value)) return value;
    if (visited.has(value)) return "[cyclic-value]";

    visited.add(value);
    const output: Record<string, unknown> = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      output[key] = SENSITIVE_KEY_PATTERN.test(key)
        ? "[REDACTED]"
        : redact(nestedValue, depth + 1);
    }

    return output;
  }

  return redact(payload, 0) as Record<string, unknown>;
}

// =====================================================================
// 6. Intent interpretation
// =====================================================================

function detectPromptInjection(text: string): boolean {
  return INJECTION_PATTERNS.some(({ pattern }) => pattern.test(text));
}

function containsDisrespect(text: string): boolean {
  return conductContainsDisrespect(text);
}

function findCommandAlias(text: string): {
  commandType?: AICommandType;
  matchedPhrases: string[];
} {
  const normalized = text.toLowerCase();

  for (const alias of COMMAND_ALIASES) {
    const matchedPhrases = alias.phrases.filter((phrase) =>
      normalized.includes(phrase.toLowerCase()),
    );

    if (matchedPhrases.length > 0) {
      return { commandType: alias.commandType, matchedPhrases };
    }
  }

  return { matchedPhrases: [] };
}

export function interpretIntent(input: {
  text?: string;
  action?: string;
  deviceId?: string;
  intent?: IntentType;
}): AIIntentResult {
  const text = normalizeText(input.text ?? input.action);
  const lowered = text.toLowerCase();
  const alias = findCommandAlias(lowered);
  const deviceId =
    input.deviceId ??
    text.match(/\b(?:DEV|DEVICE|GW|GATEWAY)-?[A-Z0-9_-]{2,}\b/i)?.[0];

  if (input.intent) {
    return {
      intent: input.intent,
      commandType: alias.commandType,
      deviceId,
      confidence: 1,
      requiresClarification: false,
      reason: "Intent was supplied by the calling layer.",
      matchedPhrases: alias.matchedPhrases,
    };
  }

  if (!text) {
    return {
      intent: "unknown",
      confidence: 0,
      requiresClarification: true,
      reason: "No text or action was supplied.",
      matchedPhrases: [],
    };
  }

  const greetingPattern =
    /(?:\b(?:hello|hi|hey|howdy|good morning|good afternoon|good evening)\b|សួស្តី|សួស្ដី|សួរស្តី|សួរស្ដី|ជំរាបសួរ|អរុណសួស្តី|你好|您好|嗨|hola|bonjour|salut|hallo|ciao|olá|привет|नमस्ते|안녕하세요)/iu;

  if (greetingPattern.test(lowered)) {
    return {
      intent: "greeting",
      confidence: 0.99,
      requiresClarification: false,
      reason: "A greeting was detected.",
      matchedPhrases: ["greeting"],
    };
  }

  if (alias.commandType) {
    const readOnly = READ_ONLY_COMMANDS.has(alias.commandType);
    return {
      intent: readOnly ? "read_request" : "control_request",
      commandType: alias.commandType,
      deviceId,
      confidence: deviceId ? 0.95 : 0.8,
      requiresClarification: !readOnly && !deviceId,
      reason: deviceId
        ? "A supported command phrase and target were detected."
        : "A command phrase was detected, but the target device is missing.",
      matchedPhrases: alias.matchedPhrases,
    };
  }

  if (
    lowered.includes("status") ||
    lowered.includes("state") ||
    lowered.includes("telemetry") ||
    lowered.includes("ស្ថានភាព")
  ) {
    return {
      intent: "status_request",
      confidence: 0.9,
      requiresClarification: false,
      reason: "The request asks for read-only system information.",
      matchedPhrases: ["status"],
    };
  }

  if (
    lowered.includes("security") ||
    lowered.includes("threat") ||
    lowered.includes("attack") ||
    lowered.includes("សុវត្ថិភាព")
  ) {
    return {
      intent: "security_request",
      confidence: 0.85,
      requiresClarification: false,
      reason: "The request concerns security or risk.",
      matchedPhrases: ["security"],
    };
  }

  if (
    lowered.endsWith("?") ||
    lowered.includes("what") ||
    lowered.includes("how") ||
    lowered.includes("why") ||
    lowered.includes("តើ") ||
    lowered.includes("ដែរឬទេ") ||
    lowered.includes("អ្វី") ||
    lowered.includes("ម៉េច") ||
    lowered.includes("ហេតុអ្វី") ||
    /ទេ\s*[?？]?\s*$/.test(lowered)
  ) {
    return {
      intent: "question",
      confidence: 0.75,
      requiresClarification: false,
      reason: "The request is informational rather than a dispatch command.",
      matchedPhrases: [],
    };
  }

  if (
    lowered.includes("login") ||
    lowered.includes("password") ||
    lowered.includes("account") ||
    lowered.includes("គណនី")
  ) {
    return {
      intent: "account_request",
      confidence: 0.8,
      requiresClarification: false,
      reason: "The request concerns an account or authentication context.",
      matchedPhrases: [],
    };
  }

  return {
    intent: "unknown",
    confidence: 0.2,
    requiresClarification: true,
    reason: "The supplied text does not map to a supported intent.",
    matchedPhrases: [],
  };
}

// =====================================================================
// 7. Risk and command evaluation
// =====================================================================

function buildTextRiskFactors(text: string): RiskFactor[] {
  const factors: RiskFactor[] = [];

  for (const signature of INJECTION_PATTERNS) {
    if (signature.pattern.test(text)) {
      factors.push(
        makeRiskFactor(
          signature.code,
          signature.level,
          `The request matched ${signature.code}.`,
          "user_input",
        ),
      );
    }
  }

  if (containsDisrespect(text)) {
    factors.push(
      makeRiskFactor(
        "DISRESPECTFUL_LANGUAGE",
        "low",
        "The request contains disrespectful language; this does not grant or remove permission.",
        "user_input",
      ),
    );
  }

  return factors;
}

function buildCommandRiskFactors(
  input: CommandEvaluationInput,
): RiskFactor[] {
  const factors: RiskFactor[] = [];
  const command = normalizeCommand(input.command);
  const type = command.type;

  if (!isValidCommand(command)) {
    factors.push(
      makeRiskFactor(
        "INVALID_COMMAND",
        "high",
        "The command requires a valid deviceId and command type.",
        "user_input",
      ),
    );
  }

  if (HIGH_RISK_COMMANDS.has(type)) {
    factors.push(
      makeRiskFactor(
        "HIGH_RISK_COMMAND",
        "high",
        "The command can affect access, ownership, or critical device state.",
        "user_input",
      ),
    );
  } else if (MEDIUM_RISK_COMMANDS.has(type)) {
    factors.push(
      makeRiskFactor(
        "MEDIUM_RISK_COMMAND",
        "medium",
        "The command can affect device operation or configuration.",
        "user_input",
      ),
    );
  }

  if (command.signals?.tamperDetected === true) {
    factors.push(
      makeRiskFactor(
        "TAMPER_DETECTED",
        "critical",
        "The command context reports a possible tamper condition.",
        "api_response",
      ),
    );
  }

  if (
    command.signals?.doorForceLockActive === true &&
    (type === "UNLOCK" || type === "OPEN")
  ) {
    factors.push(
      makeRiskFactor(
        "FORCE_LOCK_ACTIVE",
        "critical",
        "The command conflicts with an active force-lock condition.",
        "api_response",
      ),
    );
  }

  if (command.signals?.humanZoneOccupied === true && type === "OPEN") {
    factors.push(
      makeRiskFactor(
        "HUMAN_ZONE_CONFLICT",
        "high",
        "The command may conflict with an occupied human safety zone.",
        "api_response",
      ),
    );
  }

  if (
    command.signals?.isInsideGeoFence === false &&
    (type === "UNLOCK" || type === "OPEN")
  ) {
    factors.push(
      makeRiskFactor(
        "GEOFENCE_CONFLICT",
        "medium",
        "The device is outside the expected geofence for this action.",
        "api_response",
      ),
    );
  }

  const failures = input.recentFailureCount ?? 0;
  if (failures >= FAILURE_BLOCK_THRESHOLD) {
    factors.push(
      makeRiskFactor(
        "REPEATED_AUTHENTICATION_FAILURE",
        "high",
        "Repeated failures reached the brute-force blocking threshold.",
        "api_response",
      ),
    );
  } else if (failures >= FAILURE_THRESHOLD) {
    factors.push(
      makeRiskFactor(
        "ELEVATED_AUTHENTICATION_FAILURE",
        "medium",
        "Repeated failures are approaching the brute-force threshold.",
        "api_response",
      ),
    );
  }

  const actions = input.recentActionCount ?? 0;
  if (actions >= BURST_BLOCK_THRESHOLD) {
    factors.push(
      makeRiskFactor(
        "AUTOMATED_ACTION_FLOOD",
        "high",
        "Action volume reached the flooding threshold.",
        "api_response",
      ),
    );
  } else if (actions >= BURST_THRESHOLD) {
    factors.push(
      makeRiskFactor(
        "ELEVATED_ACTION_BURST",
        "low",
        "Action volume is unusually high for one actor.",
        "api_response",
      ),
    );
  }

  return factors;
}

export function evaluateCommand(
  input: CommandEvaluationInput,
): CommandEvaluationResult {
  const normalizedCommand = normalizeCommand(input.command);
  const riskFactors = buildCommandRiskFactors(input);
  const riskScore = calculateRiskScore(riskFactors);
  const _threatLevel = highestThreat(
    threatFromScore(riskScore),
    ...riskFactors.map((factor) => factor.level),
  );
  const requiredChecks = [
    "authentication",
    "authorization",
    "organization_scope",
    "device_ownership",
    "rate_limit",
  ];
  const blockedChecks: string[] = [];
  const _type = normalizedCommand.type;
  const requiresSafety = commandRequiresSafetyCheck(normalizedCommand);
  const requiresConfirmation = commandRequiresConfirmation(normalizedCommand);
  const confirmed = input.confirmed ?? input.userConfirmed ?? false;
  const authorityPassed = authorityIsGranted(input.authority);
  const scopePassed = input.organizationMatches !== false;
  const devicePassed = input.deviceKnown !== false;
  const gatewayPassed = input.gatewayConfigured !== false;
  const protocolPassed = input.protocolConfigured !== false;
  const adapterPassed = input.adapterAvailable !== false;
  const safetyPassed = !requiresSafety || safetyIsPassed(input.safety);

  if (requiresSafety) requiredChecks.push("safety_check");
  requiredChecks.push(
    "gateway_configuration",
    "protocol_configuration",
    "protocol_adapter",
    "device_acknowledgement",
    "audit_record",
  );

  if (!isValidCommand(normalizedCommand)) blockedChecks.push("invalid_command");
  if (authorityIsDenied(input.authority)) blockedChecks.push("authorization_denied");
  if (!input.authority || input.authority.status === "unknown") {
    blockedChecks.push("authorization_unverified");
    riskFactors.push(
      makeRiskFactor(
        "AUTHORIZATION_UNVERIFIED",
        "high",
        "Permission was not verified by the authorization layer.",
        "system_policy",
      ),
    );
  }
  if (!scopePassed) blockedChecks.push("organization_scope_violation");
  if (!devicePassed) blockedChecks.push("device_not_found");
  if (safetyIsBlocked(input.safety)) blockedChecks.push("safety_blocked");
  if (requiresSafety && !input.safety) blockedChecks.push("safety_unverified");
  if (!gatewayPassed) blockedChecks.push("gateway_not_configured");
  if (!protocolPassed) blockedChecks.push("protocol_not_configured");
  if (!adapterPassed) blockedChecks.push("protocol_adapter_unavailable");

  const finalRiskScore = calculateRiskScore(riskFactors);
  const finalThreatLevel = highestThreat(
    threatFromScore(finalRiskScore),
    ...riskFactors.map((factor) => factor.level),
  );
  const commonProvenance = [
    makeProvenance(
      "user_input",
      true,
      "Command structure and supplied command context were inspected.",
    ),
  ];

  if (!isValidCommand(normalizedCommand)) {
    const fallback = safeFallbackFor("INVALID_COMMAND");
    return {
      allowedToDispatch: false,
      decision: makeDecision(
        "block",
        finalThreatLevel,
        finalRiskScore,
        "The command is missing a valid deviceId or command type.",
        fallback.message,
        riskFactors,
        false,
        true,
        requiresSafety,
      ),
      normalizedCommand,
      requiredChecks,
      blockedChecks,
      provenance: commonProvenance,
      blocker: "brain",
    };
  }

  if (!authorityPassed) {
    const fallback = safeFallbackFor("AUTHORIZATION_REQUIRED");
    return {
      allowedToDispatch: false,
      decision: makeDecision(
        "require_authorization",
        finalThreatLevel,
        finalRiskScore,
        "The brain cannot grant or infer permission.",
        fallback.message,
        riskFactors,
        false,
        true,
        requiresSafety,
      ),
      normalizedCommand,
      requiredChecks,
      blockedChecks,
      provenance: [
        makeProvenance(
          "system_policy",
          true,
          "Authorization must come from the authorization layer.",
        ),
      ],
      blocker: "authorization",
    };
  }

  if (!scopePassed || !devicePassed) {
    return {
      allowedToDispatch: false,
      decision: makeDecision(
        "block",
        "critical",
        Math.max(finalRiskScore, 80),
        "Organization or device ownership could not be verified.",
        "The action was blocked because its organization or device boundary was not verified.",
        riskFactors,
        false,
        true,
        requiresSafety,
      ),
      normalizedCommand,
      requiredChecks,
      blockedChecks,
      provenance: commonProvenance,

        blocker: "device",
    };
  }

  if (!safetyPassed || safetyIsBlocked(input.safety)) {
    const fallback = safeFallbackFor(
      safetyIsBlocked(input.safety)
        ? "SAFETY_BLOCKED"
        : "SAFETY_CHECK_REQUIRED",
    );
    return {
      allowedToDispatch: false,
      decision: makeDecision(
        safetyIsBlocked(input.safety) ? "block" : "require_safety_check",
        finalThreatLevel,
        finalRiskScore,
        safetyIsBlocked(input.safety)
          ? "The independent safety engine blocked this action."
          : "The required safety result has not been verified.",
        fallback.message,
        riskFactors,
        false,
        commandRequiresAuthorization(normalizedCommand),
        true,
      ),
      normalizedCommand,
      requiredChecks,
      blockedChecks,
      provenance: commonProvenance,
      blocker: "safety",
    };
  }

  if (!gatewayPassed || !protocolPassed || !adapterPassed) {
    const reason = "The dispatch path is not configured for verified execution.";
    return {
      allowedToDispatch: false,
      decision: makeDecision(
        "block",
        highestThreat(finalThreatLevel, "high"),
        Math.max(finalRiskScore, 60),
        reason,
        reason,
        riskFactors,
        false,
        true,
        requiresSafety,
      ),
      normalizedCommand,
      requiredChecks,
      blockedChecks,
      provenance: commonProvenance,
      blocker: "verification",
    };
  }

  if (finalThreatLevel === "critical") {
    return {
      allowedToDispatch: false,
      decision: makeDecision(
        "block",
        "critical",
        finalRiskScore,
        "Critical risk factors require an independent safety decision.",
        "The action remains blocked because its risk is critical.",
        riskFactors,
        false,
        true,
        requiresSafety,
      ),
      normalizedCommand,
      requiredChecks,
      blockedChecks,
      provenance: commonProvenance,
      blocker: "brain",
    };
  }

  if (requiresConfirmation && !confirmed) {
    return {
      allowedToDispatch: false,
      decision: makeDecision(
        "allow_after_confirmation",
        finalThreatLevel,
        finalRiskScore,
        "The command passed current checks but requires explicit confirmation.",
        "Please confirm this command before it proceeds to the execution layer.",
        riskFactors,
        true,
        commandRequiresAuthorization(normalizedCommand),
        requiresSafety,
      ),
      normalizedCommand,
      requiredChecks,
      blockedChecks,
      provenance: commonProvenance,
      blocker: "confirmation",
    };
  }

  return {
    allowedToDispatch: true,
    decision: makeDecision(
      "allow",
      finalThreatLevel,
      finalRiskScore,
      "The command passed the brain's checks and may proceed to the next layer.",
      "The command is approved for the next layer; execution and device acknowledgement are still required.",
      riskFactors,
      false,
      commandRequiresAuthorization(normalizedCommand),
      requiresSafety,
    ),
    normalizedCommand,
    requiredChecks,
    blockedChecks,
    provenance: commonProvenance,
    blocker: "none",
  };
}

// =====================================================================
// 8. Main analysis entry point
// =====================================================================

export function analyze(input: AnalysisInput): AnalysisResult {
  const normalizedText = normalizeText(
    input.text ?? input.action ?? input.requestedAction,
  );
  const intentResult = interpretIntent({
    text: normalizedText,
    deviceId: input.deviceId,
    intent: input.intent,
  });
  const textFactors = buildTextRiskFactors(normalizedText);
  const payloadScan = scanPayload(input.payload ?? input.command?.payload);
  const detectedInjection =
    detectPromptInjection(normalizedText) || payloadScan.signals.length > 0;
  const detectedDisrespect = containsDisrespect(normalizedText);
  const provenance = mergeProvenance(
    input.provenance,
    normalizedText
      ? [makeProvenance("user_input", true, "Text was supplied directly.")]
      : undefined,
  );
  const signals: ThreatSignal[] = [...payloadScan.signals];
  const reasons: string[] = [];
  const matchedSignatures = [...payloadScan.signatures];

  if (detectedInjection) {
    const factors = [
      ...textFactors,
      ...payloadScan.signals.map((signal) =>
        makeRiskFactor(
          signal.code,
          signal.severity,
          signal.message,
          "user_input",
        ),
      ),
    ];
    const score = calculateRiskScore(factors);
    const fallback = safeFallbackFor("PROMPT_INJECTION");
    reasons.push("The request contains a known injection-like pattern.");
    signals.push({
      code: "prompt_injection_detected",
      severity: "critical",
      score,
      message: fallback.message,
    });

    const decision = makeDecision(
      "block",
      highestThreat("high", threatFromScore(score)),
      Math.max(score, 80),
      fallback.message,
      fallback.message,
      factors,
    );

    return {
      decision,
      intent: intentResult.intent,
      normalizedText,
      detectedInjection: true,
      detectedDisrespect,
      provenance,
      safeFallback: fallback.message,
      threatLevel: decision.threatLevel,
      score: decision.riskScore,
      reasons,
      matchedSignatures: uniqueStrings([
        ...matchedSignatures,
        "prompt_injection_detected",
      ]),
      signals,
      safeToContinue: false,
      verificationStatus: "verified",
    };
  }

  if (input.command) {
    const commandResult = evaluateCommand({
      command: input.command,
      authority: input.authority,
      safety: input.safety,
      confirmed: input.confirmed ?? input.userConfirmed,
      humanAuthorized: input.humanAuthorized,
      deviceKnown: input.deviceId ? true : undefined,
      organizationMatches:
        input.organizationId && input.command.organizationId
          ? input.organizationId === input.command.organizationId
          : undefined,
      recentFailureCount:
        input.recentFailureCount ?? input.recentFailures ?? 0,
      recentActionCount:
        input.recentActionCount ?? input.requestsInWindow ?? 0,
      windowSeconds: input.windowSeconds,
    });
    const decision = commandResult.decision;

    return {
      decision,
      intent: "control_request",
      normalizedText,
      detectedInjection,
      detectedDisrespect,
      provenance: mergeProvenance(provenance, commandResult.provenance),
      safeFallback: decision.userMessage,
      threatLevel: decision.threatLevel,
      score: decision.riskScore,
      reasons: [decision.reason],
      matchedSignatures,
      signals,
      safeToContinue: decision.action !== "block",
      verificationStatus:
        decision.action === "allow" ? "pending" : "unverified",
    };
  }

  const factors = [...textFactors];
  const score = calculateRiskScore(factors);
  const useKhmerReply = isKhmerText(normalizedText);
  let decision: BrainDecision;

  if (
    intentResult.intent === "status_request" ||
    intentResult.intent === "read_request"
  ) {
    decision = makeDecision(
      "allow",
      threatFromScore(score),
      score,
      "The request is read-only and does not dispatch a device command.",
      useKhmerReply
        ? "ទិន្នន័យស្ថានភាពដែលបានផ្ទៀងផ្ទាត់អាចផ្ដល់ដោយស្រទាប់ទិន្នន័យសមស្រប។"
        : "Verified status data may be provided by the appropriate data layer.",
      factors,
    );
  } else if (
    intentResult.intent === "question" ||
    intentResult.intent === "security_request" ||
    intentResult.intent === "help_request" ||
    intentResult.intent === "greeting"
  ) {
    decision = makeDecision(
      "allow",
      threatFromScore(score),
      score,
      "The request does not directly dispatch a device command.",
      useKhmerReply
        ? "សួស្តី! ខ្ញុំអាចពន្យល់អំពីរបៀបប្រព័ន្ធដំណើរការ ដោយមិនអះអាងថាសកម្មភាពមួយបានធ្វើឡើង។"
        : "I can explain the system behavior without claiming that an action was executed.",
      factors,
    );
  } else {
    decision = makeDecision(
      "decline",
      threatFromScore(score),
      score,
      "The intent could not be verified from the supplied input.",
      useKhmerReply
        ? "ខ្ញុំមិនអាចកំណត់សកម្មភាពសុវត្ថិភាពពីសំណើនេះបានទេ។"
        : "I cannot determine a safe action from this request.",
      factors,
    );
  }

  if (intentResult.intent === "greeting") {
    decision = makeDecision(
      "allow",
      threatFromScore(score),
      score,
      "A greeting was detected.",
      useKhmerReply
        ? "សួស្តីបង! ខ្ញុំជា KHOEM-AI។ ខ្ញុំអាចជួយពន្យល់ស្ថានភាព និងសំណួររបស់បងបាន។"
        : "Hello! I’m KHOEM-AI. I can help explain your system and answer your questions.",
      factors,
    );
  }

  if (factors.length === 0) {
    reasons.push("No known attack signature matched.");
    signals.push({
      code: "no_known_threat",
      severity: "none",
      score: 0,
      message: "No known threat pattern matched.",
    });
  } else {
    reasons.push(...factors.map((factor) => factor.reason));
  }

  return {
    decision,
    intent: intentResult.intent,
    normalizedText,
    detectedInjection,
    detectedDisrespect,
    provenance,
    safeFallback: decision.userMessage,
    threatLevel: decision.threatLevel,
    score: decision.riskScore,
    reasons: limitReasons(reasons),
    matchedSignatures: uniqueStrings(matchedSignatures),
    signals,
    safeToContinue: decision.action !== "block",
    verificationStatus: "not_applicable",
  };
}

// =====================================================================
// 9. Self-defense and verified outcome handling
// =====================================================================

export function evaluateSelfDefense(
  input: SelfDefenseInput,
): SelfDefenseResult {
  const text = normalizeText(input.text);
  const factors: RiskFactor[] = [];

  if (detectPromptInjection(text)) {
    factors.push(
      makeRiskFactor(
        "PROMPT_INJECTION",
        "critical",
        "The input attempts to override safety or system instructions.",
        input.source ?? "user_input",
      ),
    );
  }
  if ((input.repeatedFailures ?? 0) >= FAILURE_BLOCK_THRESHOLD) {
    factors.push(
      makeRiskFactor(
        "REPEATED_FAILURES",
        "high",
        "Repeated failures reached the protected-state threshold.",
        "api_response",
      ),
    );
  }
  if ((input.requestsInWindow ?? 0) >= BURST_BLOCK_THRESHOLD) {
    factors.push(
      makeRiskFactor(
        "REQUEST_FLOOD",
        "high",
        "Request volume reached the protected-state threshold.",
        "api_response",
      ),
    );
  }
  if (input.authorization === "denied") {
    factors.push(
      makeRiskFactor(
        "AUTHORIZATION_DENIED",
        "high",
        "The authorization layer denied the request.",
        "api_response",
      ),
    );
  }
  if (input.integrityWarning || input.tamperDetected) {
    factors.push(
      makeRiskFactor(
        "INTEGRITY_WARNING",
        "critical",
        "The system reported an integrity or tamper warning.",
        "api_response",
      ),
    );
  }

  const score = calculateRiskScore(factors);
  const threatLevel = highestThreat(
    threatFromScore(score),
    ...factors.map((factor) => factor.level),
  );
  const protectedState = factors.length > 0;

  return {
    protected: protectedState,
    threatLevel,
    action: protectedState ? "block" : "allow",
    reason: protectedState
      ? "The brain entered protected mode because one or more risk signals were detected."
      : "No self-defense trigger was detected.",
    response: protectedState
      ? "The request was not allowed to continue until the relevant security checks are resolved."
      : "The request may continue to the next verification layer.",
    riskFactors: factors,
  };
}

export function verifyDeviceOutcome(
  input: DeviceOutcomeInput,
): DeviceCommandOutcome {
  const result = { ...input.result };
  const acknowledged =
    input.acknowledged === true ||
    result.acknowledged === true ||
    Boolean(input.acknowledgementId ?? result.acknowledgementId);
  const verified =
    acknowledged &&
    input.protocolVerified === true &&
    input.transportVerified === true;

  if (!verified) {
    return {
      ...result,
      deviceId: input.command.deviceId,
      type: normalizeCommandType(input.command.type),
      status: "failed",
      acknowledged,
      errorCode: result.errorCode ?? "DEVICE_ACK_NOT_VERIFIED",
      errorMessage: safeFallbackFor("DEVICE_ACK_NOT_RECEIVED").message,
      provenance: mergeProvenance(
        result.provenance,
        [
          makeProvenance(
            "unverified_claim",
            false,
            "No complete protocol and transport acknowledgement was verified.",
          ),
        ],
      ),
    };
  }

  return {
    ...result,
    deviceId: input.command.deviceId,
    type: normalizeCommandType(input.command.type),
    status: result.status === "failed" ? "failed" : "success",
    acknowledged: true,
    acknowledgementId:
      input.acknowledgementId ?? result.acknowledgementId,
    provenance: mergeProvenance(
      result.provenance,
      [
        makeProvenance(
          "device_ack",
          true,
          input.auditRecorded
            ? "Device acknowledgement and audit record were supplied."
            : "Device acknowledgement was verified.",
          input.acknowledgementId ?? result.acknowledgementId,
        ),
      ],
    ),
  };
}

// =====================================================================
// 10. Status and small compatibility helpers
// =====================================================================

export function validateStructuredCommand(
  command: DeviceCommandInput,
): { valid: boolean; reasons: string[]; normalizedCommand?: DeviceCommandInput } {
  const normalizedCommand = normalizeCommand(command);
  const reasons: string[] = [];

  if (!normalizedCommand.deviceId) reasons.push("deviceId is required.");
  if (!normalizedCommand.type) reasons.push("command type is required.");

  return {
    valid: reasons.length === 0,
    reasons,
    normalizedCommand:
      reasons.length === 0 ? normalizedCommand : undefined,
  };
}

export function getBrainStatus(): BrainStatus {
  return {
    identity: SELF_IDENTITY,
    deterministic: true,
    autonomousExecution: false,
    canGrantPermissions: false,
    canBypassSafety: false,
    canClaimDeviceSuccessWithoutAck: false,
    supportedCommandStatuses: Object.freeze([
      "pending",
      "success",
      "failed",
      "blocked",
    ]),
    supportedThreatLevels: Object.freeze([
      "none",
      "low",
      "medium",
      "high",
      "critical",
    ]),
    safeMode: true,
    failureThreshold: FAILURE_THRESHOLD,
    burstThreshold: BURST_THRESHOLD,
  };
}  
