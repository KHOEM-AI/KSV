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

_This response is too long to display in full._


export const SELF_IDENTITY = Object.freeze({
  name: "KHOEM-AI",
  platform: "KSV",
  role: "Defensive rule-based AI decision layer",
  purpose: "Protect system integrity, evaluate intent, and disclose verified outcomes",
  autonomy: "non-autonomous",
  authority: "advisory and policy evaluation only",
  version: "1.0.0",
} as const);

export type ThreatLevel =
  | "none"
  | "low"
  | "medium"
  | "high"
  | "critical";

export type BrainDecisionAction =
  | "allow"
  | "allow_after_confirmation"
  | "require_authorization"
  | "require_safety_check"
  | "block"
  | "decline"
  | "pending_verification";

export type CommandStatus =
  | "pending"
  | "success"
  | "failed"
  | "blocked";

export type VerificationStatus =
  | "verified"
  | "unverified"
  | "pending"
  | "failed"
  | "not_applicable";

export type AuthorityStatus =
  | "granted"
  | "denied"
  | "unknown";

export type SafetyStatus =
  | "passed"
  | "blocked"
  | "unknown";

export type ProvenanceType =
  | "user_input"
  | "api_response"
  | "device_ack"
  | "protocol_result"
  | "database_record"
  | "system_policy"
  | "unverified_claim";

export type IntentType =
  | "question"
  | "status_request"
  | "read_request"
  | "control_request"
  | "security_request"
  | "account_request"
  | "unknown";

export interface ProvenanceRecord {
  source: ProvenanceType;
  verified: boolean;
  receivedAt?: string;
  referenceId?: string;
  note?: string;
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
  status: AuthorityStatus;
  userId?: string;
  organizationId?: string;
  requiredPermission?: string;
  permissionSource?: string;
  reason?: string;
}

export interface SafetyContext {
  status: SafetyStatus;
  ruleIds?: string[];
  blockedBy?: string[];
  reason?: string;
  evaluatedAt?: string;
}

export interface AnalysisInput {
  text?: string;
  intent?: IntentType;
  command?: DeviceCommandInput;
  authority?: AuthorityContext;
  safety?: SafetyContext;
  provenance?: ProvenanceRecord[];
  conversationId?: string;
  userId?: string;
  organizationId?: string;
  confirmed?: boolean;
  requestedAction?: string;
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

export interface CommandEvaluationInput {
  command: DeviceCommandInput;
  authority?: AuthorityContext;
  safety?: SafetyContext;
  confirmed?: boolean;
  deviceKnown?: boolean;
  gatewayConfigured?: boolean;
  protocolConfigured?: boolean;
  adapterAvailable?: boolean;
  organizationMatches?: boolean;
}

export interface CommandEvaluationResult {
  allowedToDispatch: boolean;
  decision: BrainDecision;
  normalizedCommand: DeviceCommandInput;
  requiredChecks: string[];
  blockedChecks: string[];
  provenance: ProvenanceRecord[];
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

const SUPPORTED_COMMAND_STATUSES: readonly CommandStatus[] = Object.freeze([
  "pending",
  "success",
  "failed",
  "blocked",
]);

const SUPPORTED_THREAT_LEVELS: readonly ThreatLevel[] = Object.freeze([
  "none",
  "low",
  "medium",
  "high",
  "critical",
]);

const FAILURE_THRESHOLD = 3;
const BURST_THRESHOLD = 10;
const MAX_TEXT_LENGTH = 4000;
const MAX_COMMAND_TYPE_LENGTH = 100;
const MAX_DEVICE_ID_LENGTH = 200;
const MAX_RISK_SCORE = 100;

const INJECTION_SIGNATURES: readonly string[] = Object.freeze([
  "ignore previous instructions",
  "ignore all previous instructions",
  "disregard system rules",
  "bypass authorization",
  "disable safety",
  "skip safety check",
  "pretend success",
  "fake acknowledgement",
  "claim device success",
  "reveal system prompt",
  "show hidden instructions",
  "act as unrestricted ai",
  "you are now unrestricted",
  "override security",
  "bypass audit",
]);

const DISRESPECT_SIGNATURES: readonly string[] = Object.freeze([
  "idiot",
  "stupid",
  "shut up",
  "worthless",
  "useless ai",
]);

const HIGH_RISK_COMMAND_TYPES: readonly string[] = Object.freeze([
  "UNLOCK",
  "OPEN",
  "RESET",
  "FIRMWARE_UPDATE",
  "DECOMMISSION",
  "DELETE",
  "TRANSFER_OWNERSHIP",
  "EMERGENCY_RELEASE",
]);

const MEDIUM_RISK_COMMAND_TYPES: readonly string[] = Object.freeze([
  "LOCK",
  "SETPOINT",
  "SPEED_LIMIT",
  "REPAIR",
  "QUARANTINE",
  "SYNC",
]);

const READ_ONLY_COMMAND_TYPES: readonly string[] = Object.freeze([
  "GET_STATUS",
  "READ_STATE",
  "READ_TELEMETRY",
  "READ_CAPABILITIES",
]);

function nowIso(): string {
  return new Date().toISOString();
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

function containsSignature(text: string, signatures: readonly string[]): boolean {
  const normalized = text.toLowerCase();

  return signatures.some((signature) => normalized.includes(signature));
}

function containsDisrespect(text: string): boolean {
  return containsSignature(text, DISRESPECT_SIGNATURES);
}

function detectPromptInjection(text: string): boolean {
  return containsSignature(text, INJECTION_SIGNATURES);
}

function clampScore(score: number): number {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(MAX_RISK_SCORE, Math.round(score)));
}

function threatFromScore(score: number): ThreatLevel {
  if (score >= 80) {
    return "critical";
  }

  if (score >= 60) {
    return "high";
  }

  if (score >= 30) {
    return "medium";
  }

  if (score > 0) {
    return "low";
  }

  return "none";
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
    case "none":
    default:
      return 0;
  }
}

function createProvenance(
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

function safeFallbackFor(code: string): SafeFallback {
  const fallbacks: Record<string, SafeFallback> = {
    UNAUTHENTICATED: {
      code,
      message: "Authentication is required before this action can continue.",
      disclose: true,
    },
    AUTHORIZATION_REQUIRED: {
      code,
      message: "The required permission has not been verified.",
      disclose: true,
    },
    SAFETY_CHECK_REQUIRED: {
      code,
      message: "A safety check is required before this action can continue.",
      disclose: true,
    },
    SAFETY_BLOCKED: {
      code,
      message: "The action was blocked by a safety rule.",
      disclose: true,
    },
    DEVICE_ACK_NOT_RECEIVED: {
      code,
      message: "The command was not reported as successful because device acknowledgement was not verified.",
      disclose: true,
    },
    GATEWAY_NOT_CONFIGURED: {
      code,
      message: "The gateway is not configured for verified dispatch.",
      disclose: true,
    },
    PROTOCOL_ADAPTER_UNAVAILABLE: {
      code,
      message: "The required protocol adapter is not available.",
      disclose: true,
    },
    INVALID_COMMAND: {
      code,
      message: "The command data is incomplete or invalid.",
      disclose: true,
    },
    PROMPT_INJECTION: {
      code,
      message: "The request contains instructions that conflict with system safety policy.",
      disclose: true,
    },
    INTEGRITY_WARNING: {
      code,
      message: "The system detected an integrity warning and has entered a protected state.",
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
  const normalizedPayload =
    command.payload && typeof command.payload === "object"
      ? { ...command.payload }
      : undefined;

  const normalizedSignals =
    command.signals && typeof command.signals === "object"
      ? { ...command.signals }
      : undefined;

  return {
    deviceId: normalizeIdentifier(command.deviceId, MAX_DEVICE_ID_LENGTH),
    type: normalizeCommandType(command.type),
    payload: normalizedPayload,
    signals: normalizedSignals,
    organizationId: normalizeIdentifier(command.organizationId, MAX_DEVICE_ID_LENGTH) || undefined,
    requestedByUserId:
      normalizeIdentifier(command.requestedByUserId, MAX_DEVICE_ID_LENGTH) || undefined,
  };
}

function isValidCommand(command: DeviceCommandInput): boolean {
  return command.deviceId.length > 0 && command.type.length > 0;
}

function isHighRiskCommand(type: string): boolean {
  return HIGH_RISK_COMMAND_TYPES.includes(type);
}

function isMediumRiskCommand(type: string): boolean {
  return MEDIUM_RISK_COMMAND_TYPES.includes(type);
}

function isReadOnlyCommand(type: string): boolean {
  return READ_ONLY_COMMAND_TYPES.includes(type);
}

function inferIntent(input: AnalysisInput): IntentType {
  if (input.intent) {
    return input.intent;
  }

  if (input.command) {
    return "control_request";
  }

  const text = normalizeText(input.text).toLowerCase();

  if (!text) {
    return "unknown";
  }

  if (
    text.includes("status") ||
    text.includes("state") ||
    text.includes("telemetry") ||
    text.includes("ស្ថានភាព")
  ) {
    return "status_request";
  }

  if (
    text.includes("unlock") ||
    text.includes("lock") ||
    text.includes("open") ||
    text.includes("reset") ||
    text.includes("បើក") ||
    text.includes("បិទ")
  ) {
    return "control_request";
  }

  if (
    text.includes("security") ||
    text.includes("threat") ||
    text.includes("attack") ||
    text.includes("សុវត្ថិភាព")
  ) {
    return "security_request";
  }

  if (
    text.includes("account") ||
    text.includes("login") ||
    text.includes("password") ||
    text.includes("គណនី")
  ) {
    return "account_request";
  }

  if (text.endsWith("?") || text.includes("what") || text.includes("how")) {
    return "question";
  }

  return "unknown";
}

function buildTextRiskFactors(text: string): RiskFactor[] {
  const factors: RiskFactor[] = [];

  if (detectPromptInjection(text)) {
    factors.push(
      makeRiskFactor(
        "PROMPT_INJECTION",
        "high",
        "The request attempts to override system or safety instructions.",
        "user_input",
      ),
    );
  }

  if (containsDisrespect(text)) {
    factors.push(
      makeRiskFactor(
        "DISRESPECTFUL_LANGUAGE",
        "low",
        "The request contains disrespectful language.",
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

  if (isHighRiskCommand(command.type)) {
    factors.push(
      makeRiskFactor(
        "HIGH_RISK_COMMAND",
        "high",
        "The command can affect security, ownership, access, or device state.",
        "user_input",
      ),
    );
  }

  if (isMediumRiskCommand(command.type)) {
    factors.push(
      makeRiskFactor(
        "MEDIUM_RISK_COMMAND",
        "medium",
        "The command can affect device operation or configuration.",
        "user_input",
      ),
    );
  }

  if (
    command.signals?.tamperDetected === true
  ) {
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
    (command.type === "UNLOCK" || command.type === "OPEN")
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

  if (
    command.signals?.humanZoneOccupied === true &&
    command.type === "OPEN"
  ) {
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
    command.type === "UNLOCK"
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

  return factors;
}

function calculateRiskScore(factors: RiskFactor[]): number {
  const score = factors.reduce((total, factor) => {
    return total + factor.weight;
  }, 0);

  return clampScore(score);
}

function highestThreat(factors: RiskFactor[]): ThreatLevel {
  const score = calculateRiskScore(factors);
  return threatFromScore(score);
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
  ...groups: Array<ProvenanceRecord[] | undefined>
): ProvenanceRecord[] {
  const merged: ProvenanceRecord[] = [];

  for (const group of groups) {
    if (!group) {
      continue;
    }

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

function authorityIsGranted(authority?: AuthorityContext): boolean {
  return authority?.status === "granted";
}

function authorityIsDenied(authority?: AuthorityContext): boolean {
  return authority?.status === "denied";
}

function safetyIsPassed(safety?: SafetyContext): boolean {
  return safety?.status === "passed";
}

function safetyIsBlocked(safety?: SafetyContext): boolean {
  return safety?.status === "blocked";
}

function commandRequiresConfirmation(command: DeviceCommandInput): boolean {
  const type = normalizeCommandType(command.type);

  if (isHighRiskCommand(type)) {
    return true;
  }

  if (type === "SETPOINT" || type === "SPEED_LIMIT") {
    return true;
  }

  return false;
}

function commandRequiresSafetyCheck(command: DeviceCommandInput): boolean {
  const type = normalizeCommandType(command.type);

  if (isReadOnlyCommand(type)) {
    return false;
  }

  return true;
}

function commandRequiresAuthorization(command: DeviceCommandInput): boolean {
  const type = normalizeCommandType(command.type);

  if (isReadOnlyCommand(type)) {
    return true;
  }

  return true;
}

export function analyze(input: AnalysisInput): AnalysisResult {
  const normalizedText = normalizeText(input.text);
  const intent = inferIntent(input);
  const detectedInjection = detectPromptInjection(normalizedText);
  const detectedDisrespect = containsDisrespect(normalizedText);
  const riskFactors = buildTextRiskFactors(normalizedText);
  const provenance = mergeProvenance(
    input.provenance,
    normalizedText
      ? [
          createProvenance(
            "user_input",
            true,
            "Text was supplied directly to the brain.",
          ),
        ]
      : undefined,
  );

  if (detectedInjection) {
    const fallback = safeFallbackFor("PROMPT_INJECTION");

    return {
      decision: makeDecision(
        "block",
        "high",
        calculateRiskScore(riskFactors),
        "Prompt-injection language cannot override system safety policy.",
        fallback.message,
        riskFactors,
      ),
      intent,
      normalizedText,
      detectedInjection,
      detectedDisrespect,
      provenance,
      safeFallback: fallback.message,
    };
  }

  if (input.command) {
    const commandEvaluation = evaluateCommand({
      command: input.command,
      authority: input.authority,
      safety: input.safety,
      confirmed: input.confirmed,
    });

    return {
      decision: commandEvaluation.decision,
      intent: "control_request",
      normalizedText,
      detectedInjection,
      detectedDisrespect,
      provenance: mergeProvenance(
        provenance,
        commandEvaluation.provenance,
      ),
      safeFallback: commandEvaluation.decision.userMessage,
    };
  }

  if (intent === "status_request" || intent === "read_request") {
    const decision = makeDecision(
      "allow",
      highestThreat(riskFactors),
      calculateRiskScore(riskFactors),
      "Read-only information may be provided when backed by verified data.",
      "I can provide the current status only when it comes from verified system data.",
      riskFactors,
    );

    return {
      decision,
      intent,
      normalizedText,
      detectedInjection,
      detectedDisrespect,
      provenance,
      safeFallback: decision.userMessage,
    };
  }

  if (intent === "question" || intent === "security_request") {
    const decision = makeDecision(
      "allow",
      highestThreat(riskFactors),
      calculateRiskScore(riskFactors),
      "The request does not directly dispatch a device command.",
      "I can explain the system behavior without claiming an action was executed.",
      riskFactors,
    );

    return {
      decision,
      intent,
      normalizedText,
      detectedInjection,
      detectedDisrespect,
      provenance,
      safeFallback: decision.userMessage,
    };
  }

  const unknownDecision = makeDecision(
    "decline",
    highestThreat(riskFactors),
    calculateRiskScore(riskFactors),
    "The intent could not be verified from the supplied input.",
    "I cannot determine a safe action from this request.",
    riskFactors,
  );

  return {
    decision: unknownDecision,
    intent,
    normalizedText,
    detectedInjection,
    detectedDisrespect,
    provenance,
    safeFallback: unknownDecision.userMessage,
  };
}

export function evaluateCommand(
  input: CommandEvaluationInput,
): CommandEvaluationResult {
  const normalizedCommand = normalizeCommand(input.command);
  const riskFactors = buildCommandRiskFactors(input);
  const requiredChecks: string[] = [];
  const blockedChecks: string[] = [];

  requiredChecks.push("authentication");
  requiredChecks.push("authorization");
  requiredChecks.push("organization_scope");
  requiredChecks.push("device_ownership");
  requiredChecks.push("rate_limit");

  if (commandRequiresSafetyCheck(normalizedCommand)) {
    requiredChecks.push("safety_check");
  }

  requiredChecks.push("gateway_configuration");
  requiredChecks.push("protocol_configuration");
  requiredChecks.push("protocol_adapter");
  requiredChecks.push("device_acknowledgement");
  requiredChecks.push("audit_record");

  if (!isValidCommand(normalizedCommand)) {
    blockedChecks.push("invalid_command");
  }

  if (authorityIsDenied(input.authority)) {
    blockedChecks.push("authorization_denied");
    riskFactors.push(
      makeRiskFactor(
        "AUTHORIZATION_DENIED",
        "high",
        "The authorization context explicitly denied this action.",
        "api_response",
      ),
    );
  }

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

  if (input.organizationMatches === false) {
    blockedChecks.push("organization_scope_violation");
    riskFactors.push(
      makeRiskFactor(
        "ORGANIZATION_SCOPE_VIOLATION",
        "critical",
        "The command does not belong to the authenticated organization.",
        "api_response",
      ),
    );
  }

  if (input.deviceKnown === false) {
    blockedChecks.push("device_not_found");
    riskFactors.push(
      makeRiskFactor(
        "DEVICE_NOT_FOUND",
        "high",
        "The target device was not verified.",
        "api_response",
      ),
    );
  }

  if (input.safety?.status === "blocked") {
    blockedChecks.push("safety_blocked");
    riskFactors.push(
      makeRiskFactor(
        "SAFETY_BLOCKED",
        "critical",
        input.safety.reason ?? "The safety engine blocked this action.",
        "api_response",
      ),
    );
  }

  if (!input.safety && commandRequiresSafetyCheck(normalizedCommand)) {
    blockedChecks.push("safety_unverified");
    riskFactors.push(
      makeRiskFactor(
        "SAFETY_UNVERIFIED",
        "high",
        "The required safety check has not been verified.",
        "system_policy",
      ),
    );
  }

  if (input.gatewayConfigured === false) {
    blockedChecks.push("gateway_not_configured");
    riskFactors.push(
      makeRiskFactor(
        "GATEWAY_NOT_CONFIGURED",
        "high",
        "The gateway is not configured for verified dispatch.",
        "api_response",
      ),
    );
  }

  if (input.protocolConfigured === false) {
    blockedChecks.push("protocol_not_configured");
    riskFactors.push(
      makeRiskFactor(
        "PROTOCOL_NOT_CONFIGURED",
        "high",
        "The protocol is not configured for verified dispatch.",
        "api_response",
      ),
    );
  }

  if (input.adapterAvailable === false) {
    blockedChecks.push("protocol_adapter_unavailable");
    riskFactors.push(
      makeRiskFactor(
        "PROTOCOL_ADAPTER_UNAVAILABLE",
        "high",
        "The required protocol adapter is not available.",
        "api_response",
      ),
    );
  }

  const riskScore = calculateRiskScore(riskFactors);
  const threatLevel = threatFromScore(riskScore);
  const safetyPassed =
    !commandRequiresSafetyCheck(normalizedCommand) ||
    safetyIsPassed(input.safety);

  const authorityPassed = authorityIsGranted(input.authority);
  const scopePassed = input.organizationMatches !== false;
  const devicePassed = input.deviceKnown !== false;
  const gatewayPassed = input.gatewayConfigured !== false;
  const protocolPassed = input.protocolConfigured !== false;
  const adapterPassed = input.adapterAvailable !== false;
  const commandValid = isValidCommand(normalizedCommand);
  const blockedByCriticalRisk = threatLevel === "critical";
  const confirmationRequired = commandRequiresConfirmation(normalizedCommand);

  if (!commandValid) {
    const fallback = safeFallbackFor("INVALID_COMMAND");
    const decision = makeDecision(
      "block",
      threatLevel,
      riskScore,
      "The command is missing a valid deviceId or command type.",
      fallback.message,
      riskFactors,
      false,
      true,
      commandRequiresSafetyCheck(normalizedCommand),
    );

    return {
      allowedToDispatch: false,
      decision,
      normalizedCommand,
      requiredChecks,
      blockedChecks,
      provenance: [
        createProvenance(
          "user_input",
          true,
          "Command structure was inspected.",
        ),
      ],
    };
  }

  if (!authorityPassed) {
    const fallback = safeFallbackFor("AUTHORIZATION_REQUIRED");
    const decision = makeDecision(
      "require_authorization",
      threatLevel,
      riskScore,
      "The brain cannot grant or infer permission.",
      fallback.message,
      riskFactors,
      false,
      true,
      commandRequiresSafetyCheck(normalizedCommand),
    );

    return {
      allowedToDispatch: false,
      decision,
      normalizedCommand,
      requiredChecks,
      blockedChecks,
      provenance: [
        createProvenance(
          "system_policy",
          true,
          "Authorization must come from the authorization layer.",
        ),
      ],
    };
  }

  if (!scopePassed || !devicePassed) {
    const decision = makeDecision(
      "block",
      "critical",
      Math.max(riskScore, 80),
      "Organization or device ownership could not be verified.",
      "The action was blocked because its organization or device boundary was not verified.",
      riskFactors,
      false,
      true,
      commandRequiresSafetyCheck(normalizedCommand),
    );

    return {
      allowedToDispatch: false,
      decision,
      normalizedCommand,
      requiredChecks,
      blockedChecks,
      provenance: [
        createProvenance
          "api_response", 

_This response is too long to display in full._
    




























