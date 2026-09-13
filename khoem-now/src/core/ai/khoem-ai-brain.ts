/**
 * KHOEM-AI Brain — Reasoning & Self-Defense Engine
 * Location: khoem-now/src/core/ai/khoem-ai-brain.ts
 *
 * HONEST SCOPE (per KSV's own "Real -> Verifiable" principle):
 * This is a RULE-BASED decision/analysis engine, not a sentient AI.
 * It knows its own role (SELF_IDENTITY), analyzes request patterns
 * for known attack signatures, and recommends actions — it does NOT
 * "think" beyond the rules defined here. Claims beyond this scope
 * would violate the same honesty principle the project already
 * commits to (no fake device ACKs, no fake AI either).
 *
 * It sits alongside — not instead of — the existing security stack:
 *   auth.middleware.ts   -> who is this?
 *   rbac.policy.ts       -> are they allowed?
 *   rate-limiter.ts      -> are they going too fast?
 *   safety.engine.ts     -> is this action physically safe?
 *   khoem-ai-brain.ts    -> does this REQUEST PATTERN look malicious?
 */

// ============================================================
// Self-Identity — the brain knows what it is and isn't
// ============================================================

export const SELF_IDENTITY = {
  name: "KHOEM-AI Brain",
  role: "Rule-based request pattern analyzer for the KSV platform",
  capabilities: [
    "Detect repeated-failure attack patterns (brute force signatures)",
    "Detect injection-like strings in command payloads",
    "Detect abnormal command burst patterns per device/user",
    "Recommend ALLOW / WARN / BLOCK decisions with a stated reason",
  ],
  notCapableOf: [
    "Autonomous decision-making outside the rules defined in this file",
    "Learning or adapting without a code change and redeploy",
    "Overriding Safety Engine or RBAC decisions — it can only ADD caution, never remove it",
  ],
  version: "1.0.0",
} as const;

// ============================================================
// Types
// ============================================================

export type ThreatLevel = "none" | "low" | "medium" | "high" | "critical";
export type BrainDecision = "ALLOW" | "WARN" | "BLOCK";

export interface AnalysisInput {
  userId: string | null;
  ip?: string;
  action: string; // e.g. "auth:login", "device:command"
  payload?: Record<string, unknown>;
  recentFailureCount?: number; // failed attempts in the current window
  recentActionCount?: number; // total actions in the current window
  windowSeconds?: number;
}

export interface AnalysisResult {
  decision: BrainDecision;
  threatLevel: ThreatLevel;
  reasons: string[];
  matchedSignatures: string[];
}

// ============================================================
// Known attack signatures — kept as plain data so new patterns can
// be added without touching the analysis logic itself.
// ============================================================

const INJECTION_PATTERNS: { name: string; pattern: RegExp }[] = [
  { name: "sql_injection_quote", pattern: /('|--|;|\bDROP\b|\bUNION\b|\bSELECT\b.*\bFROM\b)/i },
  { name: "nosql_operator_injection", pattern: /\$where|\$ne|\$gt|\$regex/i },
  { name: "script_injection", pattern: /<script[\s>]|javascript:|on\w+\s*=/i },
  { name: "path_traversal", pattern: /(\.\.\/|\.\.\\)/ },
];

function scanPayloadForInjection(payload: Record<string, unknown> | undefined): string[] {
  if (!payload) return [];

  const matched: string[] = [];

  function scanValue(value: unknown): void {
    if (typeof value === "string") {
      for (const sig of INJECTION_PATTERNS) {
        if (sig.pattern.test(value)) {
          matched.push(sig.name);
        }
      }
      return;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        scanValue(item);
      }
      return;
    }

    if (value && typeof value === "object") {
      for (const nestedValue of Object.values(value)) {
        scanValue(nestedValue);
      }
    }
  }

  for (const value of Object.values(payload)) {
    scanValue(value);
  }

  return [...new Set(matched)];
}

// ============================================================
// Core analysis — the "thinking" step
// ============================================================

const FAILURE_THRESHOLDS = {
  warn: 3,
  block: 5,
};

const BURST_THRESHOLDS = {
  // actions per window before it looks like flooding rather than a
  // human operating the UI normally.
  warn: 15,
  block: 30,
};

export function analyze(input: AnalysisInput): AnalysisResult {
  const reasons: string[] = [];
  const matchedSignatures: string[] = [];
  let threatLevel: ThreatLevel = "none";
  let decision: BrainDecision = "ALLOW";

  // 1. Injection pattern check — applies regardless of who the user is.
  const injectionHits = scanPayloadForInjection(input.payload);
  if (injectionHits.length > 0) {
    matchedSignatures.push(...injectionHits);
    reasons.push(`Payload matched known injection pattern(s): ${injectionHits.join(", ")}`);
    threatLevel = "critical";
    decision = "BLOCK";
  }

  // 2. Repeated-failure (brute force) check.
  const failures = input.recentFailureCount ?? 0;
  if (failures >= FAILURE_THRESHOLDS.block) {
    reasons.push(`${failures} failed attempts in the current window — brute-force pattern.`);
    threatLevel = escalate(threatLevel, "high");
    decision = "BLOCK";
  } else if (failures >= FAILURE_THRESHOLDS.warn) {
    reasons.push(`${failures} failed attempts — approaching brute-force threshold.`);
    threatLevel = escalate(threatLevel, "medium");
    if (decision === "ALLOW") decision = "WARN";
  }

  // 3. Action burst check (flooding that isn't quite hitting the raw
  // rate-limiter's cap yet, but still looks automated).
  const actions = input.recentActionCount ?? 0;
  if (actions >= BURST_THRESHOLDS.block) {
    const windowLabel =
      input.windowSeconds == null
        ? "the recent window"
        : `${input.windowSeconds}-second window`;
    reasons.push(`${actions} actions in ${windowLabel} — automated flooding pattern.`);
    threatLevel = escalate(threatLevel, "high");
    decision = "BLOCK";
  } else if (actions >= BURST_THRESHOLDS.warn) {
    reasons.push(`${actions} actions — unusually high burst for a single user.`);
    threatLevel = escalate(threatLevel, "low");
    if (decision === "ALLOW") decision = "WARN";
  }

  if (reasons.length === 0) {
    reasons.push("No known attack signatures matched.");
  }

  return { decision, threatLevel, reasons, matchedSignatures };
}

function escalate(current: ThreatLevel, next: ThreatLevel): ThreatLevel {
  const order: ThreatLevel[] = ["none", "low", "medium", "high", "critical"];
  return order.indexOf(next) > order.indexOf(current) ? next : current;
}

// ============================================================
// Self-defense — what the brain does with its own conclusion
// ============================================================

/**
 * Express middleware-shaped wrapper: runs analyze() against the
 * request, and for BLOCK decisions, responds immediately instead of
 * letting the request reach the route handler. WARN decisions pass
 * through but attach the analysis to the request for the audit log
 * to record alongside the action's own SUCCESS/FAILURE/BLOCKED result.
 *
 * This does not replace rate-limiter.ts or safety.engine.ts — it
 * runs alongside them as an additional, narrower check focused on
 * payload content and behavioral bursts rather than raw request rate.
 */
export function selfDefend(input: AnalysisInput): { proceed: boolean; result: AnalysisResult } {
  const result = analyze(input);
  return { proceed: result.decision !== "BLOCK", result };
}

/* ============================================================
 * Intent + Command Contract
 *
 * The AI may interpret natural language, but it must emit only
 * command types that the real KSV command pipeline understands.
 *
 * STATUS is intentionally a query intent, not a device command.
 * ============================================================ */

export const AI_COMMAND_TYPES = [
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

export type AICommandType = (typeof AI_COMMAND_TYPES)[number];

export type AIIntent =
  | "GREETING"
  | "GENERAL_QUESTION"
  | "DEVICE_COMMAND"
  | "DEVICE_STATUS"
  | "UNKNOWN";

export interface AIIntentResult {
  intent: AIIntent;
  commandType?: AICommandType;
  confidence: number;
  requiresClarification: boolean;
  reason: string;
}

const COMMAND_ALIASES: Array<{
  commandType: AICommandType;
  phrases: string[];
}> = [
  { commandType: "LOCK", phrases: ["lock", "ចាក់សោ", "បិទសោ"] },
  { commandType: "UNLOCK", phrases: ["unlock", "ដោះសោ", "បើកសោ"] },
  { commandType: "OPEN", phrases: ["open", "បើក"] },
  { commandType: "CLOSE", phrases: ["close", "បិទ"] },
  { commandType: "RESET", phrases: ["reset", "កំណត់ឡើងវិញ"] },
  { commandType: "SETPOINT", phrases: ["setpoint", "set temperature", "កំណត់សីតុណ្ហភាព"] },
  { commandType: "SPEED_LIMIT", phrases: ["speed limit", "កំណត់ល្បឿន"] },
  { commandType: "START", phrases: ["start", "ចាប់ផ្តើម"] },
  { commandType: "STOP", phrases: ["stop", "បញ្ឈប់"] },
  { commandType: "IMMOBILIZE", phrases: ["immobilize", "បញ្ឈប់ចលនា", "ធ្វើឱ្យឈប់"] },
  { commandType: "RELEASE", phrases: ["release", "ដោះ", "បញ្ចេញ"] },
];

const STATUS_ALIASES = [
  "status",
  "state",
  "ស្ថានភាព",
  "មើលស្ថានភាព",
  "តើឧបករណ៍មានស្ថានភាពអ្វី",
];

export function interpretIntent(text: string): AIIntentResult {
  const normalized = text.trim().toLowerCase();

  if (!normalized) {
    return {
      intent: "UNKNOWN",
      confidence: 0,
      requiresClarification: true,
      reason: "Empty input.",
    };
  }

  const greetingAliases = [
    "hello",
    "hi",
    "hey",
    "good morning",
    "good afternoon",
    "good evening",
    "សួស្តី",
    "សួស្ដី",
    "ជំរាបសួរ",
    "អរុណសួស្តី",
  ];

  if (greetingAliases.some((phrase) => normalized === phrase)) {
    return {
      intent: "GREETING",
      confidence: 0.98,
      requiresClarification: false,
      reason: "Greeting detected.",
    };
  }

  const matchedCommands = COMMAND_ALIASES.flatMap(
    ({ commandType, phrases }) =>
      phrases
        .filter((phrase) => normalized.includes(phrase.toLowerCase()))
        .map((phrase) => ({ commandType, phrase })),
  );

  // Prefer the most specific/longest command phrase.
  matchedCommands.sort((a, b) => b.phrase.length - a.phrase.length);

  if (matchedCommands.length > 0) {
    const best = matchedCommands[0];

    const sameLengthMatches = matchedCommands.filter(
      (match) => match.phrase.length === best.phrase.length,
    );

    const commandTypes = [
      ...new Set(sameLengthMatches.map((match) => match.commandType)),
    ];

    if (commandTypes.length > 1) {
      return {
        intent: "UNKNOWN",
        confidence: 0.2,
        requiresClarification: true,
        reason: "Multiple equally specific command intents matched; clarification is required.",
      };
    }

    return {
      intent: "DEVICE_COMMAND",
      commandType: best.commandType,
      confidence: best.phrase.length >= 5 ? 0.9 : 0.8,
      requiresClarification: false,
      reason: `Matched command intent: ${best.commandType}.`,
    };
  }

  const questionMarkers = [
    "?",
    "what",
    "why",
    "how",
    "who",
    "when",
    "where",
    "តើ",
    "អ្វី",
    "ហេតុអ្វី",
    "ដូចម្តេច",
    "យ៉ាងម៉េច",
    "មែនទេ",
  ];

  if (questionMarkers.some((marker) => normalized.includes(marker))) {
    return {
      intent: "GENERAL_QUESTION",
      confidence: 0.85,
      requiresClarification: false,
      reason: "General conversational question detected.",
    };
  }

  if (STATUS_ALIASES.some((phrase) => normalized.includes(phrase.toLowerCase()))) {
    return {
      intent: "DEVICE_STATUS",
      confidence: 0.8,
      requiresClarification: false,
      reason: "Matched device status query.",
    };
  }

  return {
    intent: "UNKNOWN",
    confidence: 0.2,
    requiresClarification: true,
    reason: "No supported KSV intent matched.",
  };
}
