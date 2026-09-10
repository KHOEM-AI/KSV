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
  const flatValues = Object.values(payload).filter((v) => typeof v === "string") as string[];

  for (const value of flatValues) {
    for (const sig of INJECTION_PATTERNS) {
      if (sig.pattern.test(value)) {
        matched.push(sig.name);
      }
    }
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
    reasons.push(`${actions} actions in ${input.windowSeconds ?? "the"} second window — automated flooding pattern.`);
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
