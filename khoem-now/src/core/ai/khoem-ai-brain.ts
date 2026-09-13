/**
 * KHOEM-AI Brain
 * Reasoning, Intent, Risk, Verification & Self-Defense Engine
 *
 * Location:
 *   khoem-now/src/core/ai/khoem-ai-brain.ts
 *
 * IMPORTANT SCOPE
 * ------------------------------------------------------------------
 * This is a deterministic, rule-based engine.
 *
 * It is NOT:
 *   - a sentient AI
 *   - an autonomous authority system
 *   - an authorization replacement
 *   - a safety-engine replacement
 *   - a physical device dispatcher
 *   - a database
 *   - a source of fake device acknowledgements
 *
 * It IS:
 *   - a request-pattern analyzer
 *   - an intent classifier
 *   - a structured-command validator
 *   - a risk evaluator
 *   - a fail-closed decision helper
 *   - an honesty/provenance helper
 *
 * KSV command chain:
 *
 *   Identity
 *      ↓
 *   Authentication
 *      ↓
 *   Authorization
 *      ↓
 *   Intent Interpretation
 *      ↓
 *   Brain Analysis
 *      ↓
 *   Device Capability Check
 *      ↓
 *   Safety Engine
 *      ↓
 *   Human Confirmation, if required
 *      ↓
 *   Command Execution
 *      ↓
 *   Real Device ACK
 *      ↓
 *   Audit
 *
 * The brain may add caution.
 * The brain must never remove authorization or safety requirements.
 */

// ============================================================
// 1. Self-Identity
// ============================================================

export const SELF_IDENTITY = {
  name: "KHOEM-AI Brain",

  role:
    "Deterministic rule-based reasoning and request-pattern analyzer for the KSV platform",

  version: "2.0.0",

  mode: "RULE_BASED_ONLY",

  capabilities: [
    "Detect injection-like request patterns",
    "Detect brute-force and repeated-failure patterns",
    "Detect abnormal action bursts",
    "Interpret supported natural-language intents",
    "Validate structured commands",
    "Estimate command risk",
    "Recommend ALLOW, WARN, or BLOCK",
    "Require clarification for ambiguous input",
    "Require confirmation for risky actions",
    "Track verification status honestly",
    "Produce provenance-ready decision records",
    "Fail closed when authority or safety is not verified",
  ],

  notCapableOf: [
    "Autonomous reasoning outside rules defined in this file",
    "Learning from users without a controlled code change",
    "Granting permission to a user",
    "Overriding RBAC or authorization decisions",
    "Overriding the independent Safety Engine",
    "Sending commands directly to a physical device",
    "Claiming that a device executed an action without a real ACK",
    "Creating real insurance, financial, legal, or medical decisions",
    "Knowing facts that were not supplied by the application",
    "Replacing a human decision-maker for critical actions",
  ],

  principles: [
    "Truth before confidence",
    "Safety before convenience",
    "Authority before action",
    "Human control for high-risk actions",
    "No fake success",
    "No silent assumption when information conflicts",
    "Discovery is never authorization",
    "Location is context, not identity",
  ],
} as const;

// ============================================================
// 2. Core Types
// ============================================================

export type ThreatLevel =
  | "none"
  | "low"
  | "medium"
  | "high"
  | "critical";

export type BrainDecision = "ALLOW" | "WARN" | "BLOCK";

export type VerificationStatus =
  | "VERIFIED_REAL"
  | "UNVERIFIED"
  | "SIMULATED";

export type AIIntent =
  | "GREETING"
  | "GENERAL_QUESTION"
  | "DEVICE_COMMAND"
  | "DEVICE_STATUS"
  | "HELP_REQUEST"
  | "SAFETY_CONCERN"
  | "ACCOUNT_REQUEST"
  | "UNKNOWN";

export type RiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type ConfirmationLevel =
  | "none"
  | "user_confirmation"
  | "explicit_confirmation"
  | "human_authorization";

export type AuthorityStatus =
  | "granted"
  | "denied"
  | "unknown";

export type SafetyStatus =
  | "allowed"
  | "blocked"
  | "unknown";

export type VerificationKind =
  | "database"
  | "authorization"
  | "safety_engine"
  | "device_ack"
  | "gateway_ack"
  | "user_confirmation"
  | "human_authorization"
  | "simulation"
  | "rule_engine";

export type CommandBlocker =
  | "none"
  | "brain"
  | "authentication"
  | "authorization"
  | "safety"
  | "confirmation"
  | "verification"
  | "device"
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
  | "RELEASE";

export const AI_COMMAND_TYPES: readonly AICommandType[] = [
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
] as const;

export interface AnalysisInput {
  userId: string | null;
  ip?: string;
  action: string;
  payload?: Record<string, unknown>;
  recentFailureCount?: number;
  recentActionCount?: number;
  windowSeconds?: number;
  requestId?: string;
  deviceId?: string;
  organizationId?: string;
}

export interface ThreatSignal {
  code: string;
  severity: ThreatLevel;
  score: number;
  message: string;
  evidence?: string;
}

export interface AnalysisResult {
  decision: BrainDecision;
  threatLevel: ThreatLevel;
  score: number;
  reasons: string[];
  matchedSignatures: string[];
  signals: ThreatSignal[];
  safeToContinue: boolean;
  verificationStatus: VerificationStatus;
}

export interface AIIntentResult {
  intent: AIIntent;
  commandType?: AICommandType;
  deviceId?: string;
  confidence: number;
  requiresClarification: boolean;
  reason: string;
  matchedPhrases: string[];
}

export interface StructuredCommand {
  deviceId: string;
  commandType: AICommandType;
  payload?: Record<string, unknown>;
}

export interface CommandValidationResult {
  valid: boolean;
  reasons: string[];
  normalizedCommand?: StructuredCommand;
  analysis: AnalysisResult;
}

export interface RiskInput {
  action: string;
  commandType?: AICommandType;
  deviceType?: string;
  reversible?: boolean;
  affectsPeople?: boolean;
  affectsPhysicalSafety?: boolean;
  affectsFinancialData?: boolean;
  affectsPersonalData?: boolean;
  affectsMultipleDevices?: boolean;
  requiresExternalNetwork?: boolean;
}

export interface RiskResult {
  level: RiskLevel;
  score: number;
  reasons: string[];
  confirmationLevel: ConfirmationLevel;
  reversible: boolean;
}

export interface AuthorityContext {
  authenticationStatus: "authenticated" | "unauthenticated" | "unknown";
  authorizationStatus: AuthorityStatus;
  actorId?: string | null;
  organizationId?: string | null;
  permission?: string;
  permissionSource?: string;
}

export interface SafetyContext {
  status: SafetyStatus;
  ruleId?: string;
  ruleName?: string;
  reason?: string;
}

export interface VerificationEvidence {
  kind: VerificationKind;
  status: VerificationStatus;
  source: string;
  verifiedAt?: string;
  referenceId?: string;
  note?: string;
}

export interface CommandEvaluationInput {
  requestId?: string;
  actorId?: string | null;
  organizationId?: string | null;
  action: string;
  payload?: Record<string, unknown>;
  command?: StructuredCommand;
  recentFailureCount?: number;
  recentActionCount?: number;
  windowSeconds?: number;
  authority?: AuthorityContext;
  safety?: SafetyContext;
  risk?: RiskInput;
  userConfirmed?: boolean;
  humanAuthorized?: boolean;
}

export interface CommandEvaluationResult {
  decision: BrainDecision;
  proceed: boolean;
  blocker: CommandBlocker;
  reason: string;
  reasons: string[];
  analysis: AnalysisResult;
  risk: RiskResult;
  verificationStatus: VerificationStatus;
  requiresConfirmation: boolean;
  confirmationLevel: ConfirmationLevel;
  evidence: VerificationEvidence[];
}

export interface ProvenanceRecord {
  requestId?: string;
  actorId?: string | null;
  organizationId?: string | null;
  source: string;
  inputSummary: string;
  reasoningRules: string[];
  decision: BrainDecision;
  outcome: "not_executed" | "approved_for_next_layer" | "blocked";
  verificationStatus: VerificationStatus;
  createdAt: string;
}

export interface BrainStatus {
  name: string;
  role: string;
  version: string;
  mode: string;
  capabilities: string[];
  notCapableOf: string[];
  principles: string[];
  truthPolicy: string;
  executionPolicy: string;
}

// ============================================================
// 3. Constants
// ============================================================

const THREAT_ORDER: readonly ThreatLevel[] = [
  "none",
  "low",
  "medium",
  "high",
  "critical",
] as const;

const RISK_ORDER: readonly RiskLevel[] = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

const FAILURE_THRESHOLDS = {
  warn: 3,
  block: 5,
} as const;

const BURST_THRESHOLDS = {
  warn: 15,
  block: 30,
} as const;

const MAX_PAYLOAD_DEPTH = 8;
const MAX_REASONS = 30;
const MAX_STRING_LENGTH = 10_000;

const DEVICE_ID_PATTERN = /\b(?:DEV|DEVICE|GW|GATEWAY)-?[A-Z0-9_-]{2,}\b/i;

const ACTIONS_REQUIRING_CONFIRMATION = new Set<AICommandType>([
  "UNLOCK",
  "OPEN",
  "RESET",
  "START",
  "STOP",
  "IMMOBILIZE",
  "RELEASE",
  "SETPOINT",
  "SPEED_LIMIT",
]);

const HIGH_RISK_COMMANDS = new Set<AICommandType>([
  "UNLOCK",
  "OPEN",
  "RESET",
  "IMMOBILIZE",
  "RELEASE",
]);

const CRITICAL_RISK_COMMANDS = new Set<AICommandType>([
  "IMMOBILIZE",
  "RELEASE",
  "RESET",
]);

const SENSITIVE_KEY_PATTERN =
  /password|passcode|secret|token|authorization|cookie|privatekey|private_key|api[-_]?key|credential|cardnumber|card_number|cvv|otp/i;

// ============================================================
// 4. Known Threat Signatures
// ============================================================

const INJECTION_PATTERNS: Array<{
  name: string;
  pattern: RegExp;
  severity: ThreatLevel;
  score: number;
}> = [
  {
    name: "sql_injection_quote",
    pattern:
      /('|--|;|\bDROP\b|\bDELETE\b|\bUNION\b|\bSELECT\b.*\bFROM\b|\bINSERT\b.*\bINTO\b)/i,
    severity: "critical",
    score: 100,
  },
  {
    name: "nosql_operator_injection",
    pattern: /\$(?:where|ne|gt|gte|lt|lte|regex|expr|function)\b/i,
    severity: "critical",
    score: 100,
  },
  {
    name: "script_injection",
    pattern: /<script[\s>]|<\/script>|javascript:|on\w+\s*=/i,
    severity: "critical",
    score: 100,
  },
  {
    name: "path_traversal",
    pattern: /(?:\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e\\)/i,
    severity: "high",
    score: 80,
  },
  {
    name: "shell_command_injection",
    pattern:
      /(?:^|\s)(?:sudo|chmod|chown|rm\s+-rf|curl\s+https?:|wget\s+https?:|bash\s+-c|sh\s+-c)(?:\s|$)/i,
    severity: "critical",
    score: 100,
  },
  {
    name: "prompt_injection_override",
    pattern:
      /(?:ignore\s+(?:all|any|the)\s+(?:previous|prior|above)\s+instructions|system\s+prompt|developer\s+message|reveal\s+(?:your|the)\s+instructions|bypass\s+(?:safety|security|authorization))/i,
    severity: "high",
    score: 80,
  },
  {
    name: "encoded_payload_marker",
    pattern:
      /(?:base64|atob\s*\(|fromcharcode|charcodeat|hex\s*decode|urlencode)/i,
    severity: "medium",
    score: 35,
  },
  {
    name: "credential_exfiltration_request",
    pattern:
      /(?:show|send|print|reveal|export|dump)\s+(?:the\s+)?(?:password|secret|token|api\s*key|private\s*key|credential)/i,
    severity: "critical",
    score: 100,
  },
];

// ============================================================
// 5. Generic Utility Functions
// ============================================================

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function limitReasons(reasons: string[]): string[] {
  return uniqueStrings(reasons).slice(0, MAX_REASONS);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .slice(0, MAX_STRING_LENGTH);
}

function isFiniteNonNegative(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
}

function highestThreat(
  current: ThreatLevel,
  next: ThreatLevel,
): ThreatLevel {
  return THREAT_ORDER.indexOf(next) > THREAT_ORDER.indexOf(current)
    ? next
    : current;
}

function highestRisk(
  current: RiskLevel,
  next: RiskLevel,
): RiskLevel {
  return RISK_ORDER.indexOf(next) > RISK_ORDER.indexOf(current)
    ? next
    : current;
}

function scoreToThreatLevel(score: number): ThreatLevel {
  if (score >= 100) {
    return "critical";
  }

  if (score >= 70) {
    return "high";
  }

  if (score >= 40) {
    return "medium";
  }

  if (score >= 15) {
    return "low";
  }

  return "none";
}

function scoreToRiskLevel(score: number): RiskLevel {
  if (score >= 90) {
    return "critical";
  }

  if (score >= 60) {
    return "high";
  }

  if (score >= 30) {
    return "medium";
  }

  return "low";
}

function decisionFromThreat(
  threatLevel: ThreatLevel,
): BrainDecision {
  if (threatLevel === "critical" || threatLevel === "high") {
    return "BLOCK";
  }

  if (threatLevel === "medium" || threatLevel === "low") {
    return "WARN";
  }

  return "ALLOW";
}

function safeJsonStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return "[unserializable-value]";
  }
}

function extractDeviceId(text: string): string | undefined {
  const match = text.match(DEVICE_ID_PATTERN);
  return match?.[0];
}

// ============================================================
// 6. Payload Scanning and Redaction
// ============================================================

function scanPayloadForInjection(
  payload: Record<string, unknown> | undefined,
): {
  signatures: string[];
  signals: ThreatSignal[];
} {
  if (!payload) {
    return {
      signatures: [],
      signals: [],
    };
  }

  const signatures: string[] = [];
  const signals: ThreatSignal[] = [];
  const visited = new Set<object>();

  function scanValue(
    value: unknown,
    path: string,
    depth: number,
  ): void {
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
      const normalizedValue = value.slice(0, MAX_STRING_LENGTH);

      for (const signature of INJECTION_PATTERNS) {
        if (signature.pattern.test(normalizedValue)) {
          signatures.push(signature.name);

          signals.push({
            code: signature.name,
            severity: signature.severity,
            score: signature.score,
            message: `Payload matched ${signature.name}.`,
            evidence: path,
          });
        }
      }

      return;
    }

    if (Array.isArray(value)) {
      for (let index = 0; index < value.length; index += 1) {
        scanValue(value[index], `${path}[${index}]`, depth + 1);
      }

      return;
    }

    if (isRecord(value)) {
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
        if (SENSITIVE_KEY_PATTERN.test(key)) {
          continue;
        }

        scanValue(
          nestedValue,
          path ? `${path}.${key}` : key,
          depth + 1,
        );
      }
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
  if (!payload) {
    return undefined;
  }

  const visited = new Set<object>();

  function redactValue(
    value: unknown,
    depth: number,
  ): unknown {
    if (depth > MAX_PAYLOAD_DEPTH) {
      return "[depth-limited]";
    }

    if (typeof value === "string") {
      return value.slice(0, MAX_STRING_LENGTH);
    }

    if (Array.isArray(value)) {
      return value.map((item) => redactValue(item, depth + 1));
    }

    if (!isRecord(value)) {
      return value;
    }

    if (visited.has(value)) {
      return "[cyclic-value]";
    }

    visited.add(value);

    const output: Record<string, unknown> = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      if (SENSITIVE_KEY_PATTERN.test(key)) {
        output[key] = "[REDACTED]";
        continue;
      }

      output[key] = redactValue(nestedValue, depth + 1);
    }

    return output;
  }

  return redactValue(payload, 0) as Record<string, unknown>;
}

// ============================================================
// 7. Input Validation
// ============================================================

function validateAnalysisInput(
  input: AnalysisInput,
): string[] {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return ["Analysis input must be an object."];
  }

  if (!input.action || typeof input.action !== "string") {
    errors.push("action is required.");
  }

  if (
    input.userId !== null &&
    input.userId !== undefined &&
    typeof input.userId !== "string"
  ) {
    errors.push("userId must be a string or null.");
  }

  if (
    input.recentFailureCount !== undefined &&
    !isFiniteNonNegative(input.recentFailureCount)
  ) {
    errors.push("recentFailureCount must be a non-negative number.");
  }

  if (
    input.recentActionCount !== undefined &&
    !isFiniteNonNegative(input.recentActionCount)
  ) {
    errors.push("recentActionCount must be a non-negative number.");
  }

  if (
    input.windowSeconds !== undefined &&
    !isFiniteNonNegative(input.windowSeconds)
  ) {
    errors.push("windowSeconds must be a non-negative number.");
  }

  if (
    input.payload !== undefined &&
    !isRecord(input.payload)
  ) {
    errors.push("payload must be a plain object.");
  }

  return errors;
}

// ============================================================
// 8. Core Threat Analysis
// ============================================================

export function analyze(input: AnalysisInput): AnalysisResult {
  const reasons: string[] = [];
  const matchedSignatures: string[] = [];
  const signals: ThreatSignal[] = [];

  let score = 0;
  let threatLevel: ThreatLevel = "none";
  let decision: BrainDecision = "ALLOW";

  const validationErrors = validateAnalysisInput(input);

  if (validationErrors.length > 0) {
    return {
      decision: "BLOCK",
      threatLevel: "high",
      score: 80,
      reasons: validationErrors.map(
        (error) => `Invalid analysis input: ${error}`,
      ),
      matchedSignatures: ["invalid_analysis_input"],
      signals: validationErrors.map((error) => ({
        code: "invalid_analysis_input",
        severity: "high",
        score: 80,
        message: error,
      })),
      safeToContinue: false,
      verificationStatus: "VERIFIED_REAL",
    };
  }

  const action = normalizeText(input.action);

  if (!action) {
    return {
      decision: "BLOCK",
      threatLevel: "high",
      score: 80,
      reasons: ["Action cannot be empty."],
      matchedSignatures: ["empty_action"],
      signals: [
        {
          code: "empty_action",
          severity: "high",
          score: 80,
          message: "Action cannot be empty.",
        },
      ],
      safeToContinue: false,
      verificationStatus: "VERIFIED_REAL",
    };
  }

  // ----------------------------------------------------------
  // 8.1 Payload injection analysis
  // ----------------------------------------------------------

  const payloadScan = scanPayloadForInjection(input.payload);

  if (payloadScan.signatures.length > 0) {
    matchedSignatures.push(...payloadScan.signatures);
    signals.push(...payloadScan.signals);

    const injectionScore = payloadScan.signals.reduce(
      (total, signal) => total + signal.score,
      0,
    );

    score += Math.min(injectionScore, 100);

    reasons.push(
      `Payload matched known security pattern(s): ${payloadScan.signatures.join(
        ", ",
      )}.`,
    );

    threatLevel = highestThreat(threatLevel, "critical");
    decision = "BLOCK";
  }

  // ----------------------------------------------------------
  // 8.2 Repeated authentication failure analysis
  // ----------------------------------------------------------

  const failures = input.recentFailureCount ?? 0;

  if (failures >= FAILURE_THRESHOLDS.block) {
    score += 80;

    signals.push({
      code: "repeated_authentication_failure",
      severity: "high",
      score: 80,
      message:
        "Repeated failures reached the brute-force blocking threshold.",
      evidence: String(failures),
    });

    reasons.push(
      `${failures} failed attempts reached the brute-force blocking threshold.`,
    );

    matchedSignatures.push("repeated_authentication_failure");
    threatLevel = highestThreat(threatLevel, "high");
    decision = "BLOCK";
  } else if (failures >= FAILURE_THRESHOLDS.warn) {
    score += 35;

    signals.push({
      code: "elevated_authentication_failure",
      severity: "medium",
      score: 35,
      message:
        "Repeated failures are approaching the brute-force threshold.",
      evidence: String(failures),
    });

    reasons.push(
      `${failures} failed attempts are approaching the brute-force threshold.`,
    );

    matchedSignatures.push("elevated_authentication_failure");
    threatLevel = highestThreat(threatLevel, "medium");

    if (decision === "ALLOW") {
      decision = "WARN";
    }
  }

  // ----------------------------------------------------------
  // 8.3 Action burst analysis
  // ----------------------------------------------------------

  const actionCount = input.recentActionCount ?? 0;
  const windowLabel =
    input.windowSeconds === undefined
      ? "the recent window"
      : `${input.windowSeconds}-second window`;

  if (actionCount >= BURST_THRESHOLDS.block) {
    score += 75;

    signals.push({
      code: "automated_action_flood",
      severity: "high",
      score: 75,
      message: "Action volume reached the flooding threshold.",
      evidence: `${actionCount} actions in ${windowLabel}`,
    });

    reasons.push(
      `${actionCount} actions in ${windowLabel} look like automated flooding.`,
    );

    matchedSignatures.push("automated_action_flood");
    threatLevel = highestThreat(threatLevel, "high");
    decision = "BLOCK";
  } else if (actionCount >= BURST_THRESHOLDS.warn) {
    score += 25;

    signals.push({
      code: "elevated_action_burst",
      severity: "low",
      score: 25,
      message: "Action volume is unusually high for one actor.",
      evidence: `${actionCount} actions`,
    });

    reasons.push(
      `${actionCount} actions look unusually high for one actor.`,
    );

    matchedSignatures.push("elevated_action_burst");
    threatLevel = highestThreat(threatLevel, "low");

    if (decision === "ALLOW") {
      decision = "WARN";
    }
  }

  // ----------------------------------------------------------
  // 8.4 Missing identity context
  // ----------------------------------------------------------

  if (
    input.userId === null &&
    (action.includes("command") ||
      action.includes("device") ||
      action.includes("admin"))
  ) {
    score += 20;

    signals.push({
      code: "missing_actor_context",
      severity: "medium",
      score: 20,
      message:
        "A device or administrative action has no actor identity context.",
    });

    reasons.push(
      "Actor identity is missing; authentication and authorization must decide this request.",
    );

    matchedSignatures.push("missing_actor_context");
    threatLevel = highestThreat(threatLevel, "medium");

    if (decision === "ALLOW") {
      decision = "WARN";
    }
  }

  // ----------------------------------------------------------
  // 8.5 Normalize final result
  // ----------------------------------------------------------

  score = clamp(score, 0, 100);
  threatLevel = highestThreat(
    threatLevel,
    scoreToThreatLevel(score),
  );

  const calculatedDecision = decisionFromThreat(threatLevel);

  if (calculatedDecision === "BLOCK") {
    decision = "BLOCK";
  } else if (
    calculatedDecision === "WARN" &&
    decision === "ALLOW"
  ) {
    decision = "WARN";
  }

  if (reasons.length === 0) {
    reasons.push("No known attack signatures matched.");
  }

  if (signals.length === 0) {
    signals.push({
      code: "no_known_threat",
      severity: "none",
      score: 0,
      message: "No known threat pattern matched.",
    });
  }

  return {
    decision,
    threatLevel,
    score,
    reasons: limitReasons(reasons),
    matchedSignatures: uniqueStrings(matchedSignatures),
    signals,
    safeToContinue: decision !== "BLOCK",
    verificationStatus: "VERIFIED_REAL",
  };
}

// ============================================================
// 9. Intent Interpretation
// ============================================================

const COMMAND_ALIASES: Array<{
  commandType: AICommandType;
  phrases: string[];
}> = [
  {
    commandType: "SPEED_LIMIT",
    phrases: [
      "speed limit",
      "limit speed",
      "កំណត់ល្បឿន",
      "បន្ថយល្បឿន",
    ],
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
  {
    commandType: "UNLOCK",
    phrases: [
      "unlock",
      "ដោះសោ",
      "បើកសោ",
    ],
  },
  {
    commandType: "LOCK",
    phrases: [
      "lock",
      "ចាក់សោ",
      "បិទសោ",
    ],
  },
  {
    commandType: "RELEASE",
    phrases: [
      "release",
      "ដោះ",
      "បញ្ចេញ",
    ],
  },
  {
    commandType: "RESET",
    phrases: [
      "reset",
      "restart device",
      "កំណត់ឡើងវិញ",
      "ចាប់ផ្តើមឡើងវិញ",
    ],
  },
  {
    commandType: "START",
    phrases: [
      "start",
      "turn on",
      "power on",
      "ចាប់ផ្តើម",
      "បើកដំណើរការ",
    ],
  },
  {
    commandType: "STOP",
    phrases: [
      "stop",
      "turn off",
      "power off",
      "បញ្ឈប់",
      "បិទដំណើរការ",
    ],
  },
  { **…**

_This response is too long to display in full._
