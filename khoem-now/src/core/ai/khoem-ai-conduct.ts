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
