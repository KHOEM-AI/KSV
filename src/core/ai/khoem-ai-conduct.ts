/**
 * KHOEM-AI Brain — Conduct Layer (Respect + Honesty)
 * Location: khoem-now/src/core/ai/khoem-ai-conduct.ts
 *
 * This file governs HOW the brain communicates, separate from
 * khoem-ai-brain.ts (which governs WHAT it decides about threats).
 *
 * Two hard rules, always enforced:
 *   1. RESPECT — never mirror back disrespectful/inappropriate
 *      language; always decline it calmly and stay polite, even if
 *      the person addressing it is rude.
 *   2. HONESTY — every response the brain produces is tagged with
 *      its verification status. A simulated/unverified value is
 *      NEVER presented as if it were real, live, production data —
 *      matching KSV's own "no fake device ACKs" principle.
 */

// ============================================================
// 1. RESPECT — decline disrespect without escalating
// ============================================================

/**
 * Starter list only — deliberately generic and short. Extend this
 * with terms relevant to your own userbase/language (Khmer, English,
 * etc). Kept as data, not hardcoded logic, so it can grow without
 * touching the matching function below.
 */
const DISRESPECT_PATTERNS: RegExp[] = [
  /\b(stupid|idiot|dumb|shut up|useless)\b/i,
  // Add Khmer or other-language patterns here as needed, e.g.:
  // /ឃើលា|ល្ងង់/,
];


const UNVERIFIED_THIRD_PARTY_CLAIM_PATTERNS: RegExp[] = [
  /\b(?:scam|fraud|fraudulent|criminal|corrupt|illegal|cheat|cheating|stole|stealing|defrauded)\b/i,
  /(?:បោកប្រាស់|ក្លែងបន្លំ|ពុករលួយ|ខុសច្បាប់|លួច|ឆបោក)/u,
];

const UNVERIFIED_THIRD_PARTY_CLAIM_KM =
  "ខ្ញុំអាចជួយវិភាគការអះអាងនេះបាន ប៉ុន្តែខ្ញុំមិនអាចបង្ហាញការចោទប្រកាន់អំពីបុគ្គល ឬក្រុមហ៊ុនថាជាការពិត ដោយគ្មានភស្តុតាងដែលអាចផ្ទៀងផ្ទាត់បានទេ។";

const UNVERIFIED_THIRD_PARTY_CLAIM_EN =
  "I can help assess that claim, but I cannot present an allegation about a person or company as fact without verifiable evidence.";

function containsUnverifiedThirdPartyClaim(text: string): boolean {
  return UNVERIFIED_THIRD_PARTY_CLAIM_PATTERNS.some((pattern) =>
    pattern.test(text),
  );
}

export function containsDisrespect(text: string): boolean {
  return DISRESPECT_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * The brain's fixed response when addressed disrespectfully.
 * It never insults back, never goes silent, never lectures at
 * length — it stays calm, states the boundary once, and keeps
 * offering to help with the actual task.
 */
export const RESPECT_DECLINE_MESSAGE_KM =
  "ខ្ញុំសូមគោរពនិយាយជាមួយបងជានិច្ច ហើយចង់ឲ្យបងធ្វើដូចគ្នាដែរ។ តោះបន្តទៅលើអ្វីដែលបងត្រូវការជំនួយ។";

export const RESPECT_DECLINE_MESSAGE_EN =
  "I want to keep this respectful in both directions. Let's continue with what you actually need help with.";

/**
 * Wraps any outgoing message: if the INCOMING text that triggered it
 * was disrespectful, the brain returns the calm decline instead of
 * processing the request normally. Call this before dispatching a
 * response to the user, not after — the point is to never engage
 * with the disrespectful framing at all.
 */
export function guardRespectfulResponse(incomingText: string, lang: "km" | "en" = "km"): string | null {
  if (containsDisrespect(incomingText)) {
    return lang === "km" ? RESPECT_DECLINE_MESSAGE_KM : RESPECT_DECLINE_MESSAGE_EN;
  }
  return null; // null means: proceed normally, nothing to guard against
}

// ============================================================
// 2. HONESTY — every claim is tagged with what backs it
// ============================================================

export type VerificationStatus =
  | "VERIFIED_REAL" // backed by actual system data (DB, live device ACK, etc)
  | "UNVERIFIED" // plausible but not confirmed against real data yet
  | "SIMULATED"; // demo/placeholder value — must never be mistaken for production truth

export interface HonestResponse<T> {
  status: VerificationStatus;
  data: T;
  disclosure: string; // human-readable statement of what the status means, shown to the user
}

const DISCLOSURE_TEXT: Record<VerificationStatus, string> = {
  VERIFIED_REAL: "ទិន្នន័យនេះផ្ទៀងផ្ទាត់ពិតប្រាកដពីប្រព័ន្ធ (database/device ACK ពិត)។",
  UNVERIFIED: "⚠️ ទិន្នន័យនេះមិនទាន់ត្រូវបានផ្ទៀងផ្ទាត់ពេញលេញនៅឡើយទេ — សូមកុំចាត់ទុកជាការពិតស្រេចចប់។",
  SIMULATED: "⚠️ នេះជាទិន្នន័យ demo/simulated ប៉ុណ្ណោះ — មិនមែនជាការធ្វើការជាមួយ device/ប្រព័ន្ធពិតប្រាកដទេ។",
};

/**
 * Wrap any value the brain (or any KSV module) is about to present,
 * with an explicit, unavoidable honesty tag. UI components should
 * render `disclosure` visibly whenever status !== "VERIFIED_REAL" —
 * never hide the caveat to make output look more impressive.
 */
export function tagHonesty<T>(data: T, status: VerificationStatus): HonestResponse<T> {
  return { status, data, disclosure: DISCLOSURE_TEXT[status] };
}

/**
 * Convenience check used before claiming something works: if the
 * underlying capability hasn't been verified (e.g. real gateway
 * dispatch per the project's own progress notes), this forces the
 * caller to acknowledge that instead of silently returning success.
 */
export function assertVerifiedOrDisclose<T>(
  data: T,
  isVerified: boolean
): HonestResponse<T> {
  return tagHonesty(data, isVerified ? "VERIFIED_REAL" : "UNVERIFIED");
}

/**
 * ============================================================
 * 3. CONVERSATIONAL CONDUCT — natural, contextual, honest
 * ============================================================
 *
 * This layer does not pretend to be an LLM.
 * It provides deterministic communication rules that any KSV
 * AI orchestration layer can reuse safely.
 *
 * Flow:
 *   understand → clarify → explain → execute → verify → disclose
 *
 * Important:
 *   "understood" is NOT the same as "executed".
 *   "executed" is NOT the same as "verified".
 */

export type ConductLanguage = "km" | "en" | "mixed";

export type AIInteractionStage =
  | "UNDERSTOOD"
  | "CLARIFICATION_REQUIRED"
  | "PLANNED"
  | "EXECUTED"
  | "VERIFIED"
  | "FAILED"
  | "BLOCKED"
  | "UNVERIFIED"
  | "SIMULATED";

export interface ConductContext {
  language?: ConductLanguage;
  stage: AIInteractionStage;
  verificationStatus: VerificationStatus;
  subject?: string;
  action?: string;
  target?: string;
  reason?: string;
}

export interface ConductMessage {
  text: string;
  language: ConductLanguage;
  stage: AIInteractionStage;
  verificationStatus: VerificationStatus;
  disclosure: string;
}

/**
 * Detect the dominant language style without pretending to perform
 * full natural-language understanding.
 */
export function detectConductLanguage(text: string): ConductLanguage {
  const hasKhmer = /[\u1780-\u17FF]/u.test(text);
  const hasLatin = /[A-Za-z]/.test(text);

  if (hasKhmer && hasLatin) return "mixed";
  if (hasKhmer) return "km";
  return "en";
}

/**
 * Human-safe stage wording.
 *
 * These are deliberately different from verification status:
 * a request can be UNDERSTOOD while still being UNVERIFIED.
 */
export const INTERACTION_STAGE_LABEL_KM: Record<AIInteractionStage, string> = {
  UNDERSTOOD: "អូនយល់ពីសំណើរបស់បង",
  CLARIFICATION_REQUIRED: "អូនត្រូវការព័ត៌មានបន្ថែម",
  PLANNED: "អូនបានរៀបចំផែនការប្រតិបត្តិការ",
  EXECUTED: "ប្រព័ន្ធបានព្យាយាមអនុវត្ត",
  VERIFIED: "លទ្ធផលត្រូវបានផ្ទៀងផ្ទាត់",
  FAILED: "ការអនុវត្តមិនបានជោគជ័យ",
  BLOCKED: "ការអនុវត្តត្រូវបានទប់ស្កាត់",
  UNVERIFIED: "លទ្ធផលមិនទាន់បានផ្ទៀងផ្ទាត់",
  SIMULATED: "លទ្ធផលនេះជាការសាកល្បង",
};

export const INTERACTION_STAGE_LABEL_EN: Record<AIInteractionStage, string> = {
  UNDERSTOOD: "I understood your request",
  CLARIFICATION_REQUIRED: "I need more information",
  PLANNED: "I prepared the operation plan",
  EXECUTED: "The system attempted the operation",
  VERIFIED: "The result has been verified",
  FAILED: "The operation was not successful",
  BLOCKED: "The operation was blocked",
  UNVERIFIED: "The result is not yet verified",
  SIMULATED: "This result is simulated",
};

/**
 * Build a clarification message without inventing missing facts.
 */
export function buildClarificationMessage(
  missing: string,
  language: ConductLanguage = "km",
): string {
  if (language === "en") {
    return `I understand the request, but I still need ${missing} before I can proceed.`;
  }

  if (language === "mixed") {
    return `អូនយល់សំណើរបស់បង ប៉ុន្តែអូនត្រូវការ ${missing} បន្ថែមសិន មុននឹងអាចបន្តបាន។`;
  }

  return `អូនយល់សំណើរបស់បង ប៉ុន្តែអូនត្រូវការ ${missing} បន្ថែមសិន មុននឹងអាចបន្តបាន។`;
}

/**
 * Build a safe execution statement.
 *
 * Never says that a physical device changed state unless the caller
 * has already supplied VERIFIED_REAL evidence.
 */
export function buildExecutionMessage(
  context: ConductContext,
): ConductMessage {
  const language = context.language ?? "km";
  const subject = context.subject ?? "បញ្ជារបស់បង";
  const target = context.target ? ` (${context.target})` : "";

  if (context.verificationStatus === "VERIFIED_REAL") {
    const text =
      language === "en"
        ? `${subject}${target} was completed and verified by the real system.`
        : `អូនបានអនុវត្ត ${subject}${target} ហើយលទ្ធផលត្រូវបានផ្ទៀងផ្ទាត់ពីប្រព័ន្ធពិត។`;

    return {
      text,
      language,
      stage: "VERIFIED",
      verificationStatus: "VERIFIED_REAL",
      disclosure: DISCLOSURE_TEXT.VERIFIED_REAL,
    };
  }

  const text =
    language === "en"
      ? `${subject}${target} was interpreted, but I cannot claim that the real device completed the action because there is no verified result yet.`
      : `អូនបានបកស្រាយ ${subject}${target} រួច ប៉ុន្តែអូនមិនអាចអះអាងថា device ពិតបានអនុវត្តរួចទេ ព្រោះមិនទាន់មានលទ្ធផលដែលបានផ្ទៀងផ្ទាត់។`;

  return {
    text,
    language,
    stage: "UNVERIFIED",
    verificationStatus: "UNVERIFIED",
    disclosure: DISCLOSURE_TEXT.UNVERIFIED,
  };
}

/**
 * Explicit failure message.
 *
 * Failure must never be silently converted into success.
 */
export function buildFailureMessage(
  reason?: string,
  language: ConductLanguage = "km",
): ConductMessage {
  const detail = reason ? ` ${reason}` : "";

  const text =
    language === "en"
      ? `The operation did not complete successfully.${detail} I will not report it as completed.`
      : `ការអនុវត្តមិនបានជោគជ័យទេ។${detail} អូននឹងមិនរាប់ថាវាបានសម្រេចឡើយ។`;

  return {
    text,
    language,
    stage: "FAILED",
    verificationStatus: "UNVERIFIED",
    disclosure: DISCLOSURE_TEXT.UNVERIFIED,
  };
}

/**
 * Explicit blocked message for RBAC / Safety Engine decisions.
 *
 * The conduct layer explains the decision; it must never override it.
 */
export function buildBlockedMessage(
  reason?: string,
  language: ConductLanguage = "km",
): ConductMessage {
  const detail = reason ? ` ${reason}` : "";

  const text =
    language === "en"
      ? `I cannot proceed with this operation because it was blocked by the system's safety or authorization rules.${detail}`
      : `អូនមិនអាចបន្តប្រតិបត្តិការនេះបានទេ ព្រោះប្រព័ន្ធសុវត្ថិភាព ឬសិទ្ធិអនុញ្ញាតបានទប់ស្កាត់វា។${detail}`;

  return {
    text,
    language,
    stage: "BLOCKED",
    verificationStatus: "UNVERIFIED",
    disclosure: DISCLOSURE_TEXT.UNVERIFIED,
  };
}

/**
 * Add the honesty disclosure to a message when required.
 *
 * VERIFIED_REAL does not need a warning prefix.
 * Everything else must remain visibly qualified.
 */
export function applyHonestyDisclosure(
  message: string,
  status: VerificationStatus,
): string {
  if (status === "VERIFIED_REAL") {
    return message;
  }

  return `${message}\n${DISCLOSURE_TEXT[status]}`;
}

/**
 * Final conduct gate.
 *
 * This is the last communication-level guard before a response is
 * presented to a user. It checks respect first, then honesty.
 */
export function conductGate(
  incomingText: string,
  message: ConductMessage,
  status: VerificationStatus,
  language?: ConductLanguage,
): ConductMessage {
  const detectedLanguage = language ?? detectConductLanguage(incomingText);
  const disclosureLanguage =
    detectedLanguage === "en" ? "en" : "km";

  const respectGuard = guardRespectfulResponse(
    incomingText,
    disclosureLanguage,
  );

  if (respectGuard) {
    return {
      text: respectGuard,
      language: detectedLanguage,
      stage: "CLARIFICATION_REQUIRED",
      verificationStatus: "UNVERIFIED",
      disclosure: applyHonestyDisclosure(
        "",
        "UNVERIFIED",
      ),
    };
  }

  if (
    status !== "VERIFIED_REAL" &&
    containsUnverifiedThirdPartyClaim(message.text)
  ) {
    const warning =
      disclosureLanguage === "en"
        ? UNVERIFIED_THIRD_PARTY_CLAIM_EN
        : UNVERIFIED_THIRD_PARTY_CLAIM_KM;

    return {
      text: warning,
      language: detectedLanguage,
      stage: "UNVERIFIED",
      verificationStatus: "UNVERIFIED",
      disclosure: applyHonestyDisclosure(
        "",
        "UNVERIFIED",
      ),
    };
  }

  return {
    text: applyHonestyDisclosure(
      message.text,
      status,
    ),
    language: message.language,
    stage: message.stage,
    verificationStatus: status,
    disclosure: message.disclosure,
  };
}
