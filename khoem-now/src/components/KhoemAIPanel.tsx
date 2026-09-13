/**
 * KHOEM-AI Brain — Dashboard Panel
 * Location: khoem-now/src/components/KhoemAIPanel.tsx
 *
 * UI surface for the real KHOEM-AI Brain identity, conduct rules,
 * verification honesty, and recent security decisions.
 *
 * Important:
 * - This panel does not invent AI results.
 * - This panel does not claim physical device execution.
 * - Backend decision history is optional; if unavailable, the panel
 *   remains useful and honestly shows the local Brain identity.
 */

import { useEffect, useState } from "react";
import { SELF_IDENTITY } from "../core/ai/khoem-ai-brain";
import {
  INTERACTION_STAGE_LABEL_KM,
  type AIInteractionStage,
  type VerificationStatus,
} from "../core/ai/khoem-ai-conduct";

interface RecentDecision {
  id: string;
  action: string;
  decision: "ALLOW" | "WARN" | "BLOCK";
  threatLevel: "none" | "low" | "medium" | "high" | "critical";
  reasons: string[];
  timestamp: string;
}

const threatColor: Record<RecentDecision["threatLevel"], string> = {
  none: "text-ink-400",
  low: "text-blue-400",
  medium: "text-warning-400",
  high: "text-danger-400",
  critical: "text-danger-500",
};

const decisionBadge: Record<RecentDecision["decision"], string> = {
  ALLOW: "bg-success-500/15 text-success-400 border-success-500/30",
  WARN: "bg-warning-500/15 text-warning-400 border-warning-500/30",
  BLOCK: "bg-danger-500/15 text-danger-400 border-danger-500/30",
};

const verificationBadge: Record<VerificationStatus, string> = {
  VERIFIED_REAL:
    "bg-success-500/15 text-success-400 border-success-500/30",
  UNVERIFIED:
    "bg-warning-500/15 text-warning-400 border-warning-500/30",
  SIMULATED:
    "bg-danger-500/15 text-danger-400 border-danger-500/30",
};

const verificationText: Record<VerificationStatus, string> = {
  VERIFIED_REAL: "VERIFIED REAL",
  UNVERIFIED: "UNVERIFIED",
  SIMULATED: "SIMULATED",
};

const DEFAULT_STAGE: AIInteractionStage = "UNDERSTOOD";

function formatDecisionTime(timestamp: string): string {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date.toLocaleString();
}

export function KhoemAIPanel() {
  const [decisions, setDecisions] = useState<RecentDecision[]>([]);
  const [decisionsLoading, setDecisionsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadRecentDecisions() {
      try {
        const response = await fetch("/api/v1/ai-brain/recent-decisions");

        if (!response.ok) {
          if (!cancelled) {
            setDecisions([]);
          }
          return;
        }

        const data = await response.json();

        if (!cancelled) {
          setDecisions(Array.isArray(data?.decisions) ? data.decisions : []);
        }
      } catch {
        if (!cancelled) {
          setDecisions([]);
        }
      } finally {
        if (!cancelled) {
          setDecisionsLoading(false);
        }
      }
    }

    loadRecentDecisions();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentStage = DEFAULT_STAGE;

  return (
    <section
      aria-label="KHOEM-AI Brain"
      className="rounded-2xl border border-ink-700/70 bg-ink-900/60 p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-success-400"
            />
            <p className="text-sm font-semibold text-white">
              {SELF_IDENTITY.name}
            </p>
          </div>

          <p className="mt-1 text-xs leading-5 text-ink-400">
            {SELF_IDENTITY.role}
          </p>
        </div>

        <span className="w-fit rounded-full border border-ink-600 px-2.5 py-1 text-[10px] font-semibold text-ink-300">
          Brain v{SELF_IDENTITY.version}
        </span>
      </div>

      {/* Identity / truth boundary */}
      <div className="mt-4 rounded-xl border border-ink-700/60 bg-ink-950/40 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-success-500/30 bg-success-500/10 px-2 py-1 text-[10px] font-semibold text-success-400">
            RULE-BASED
          </span>

          <span className="rounded-full border border-warning-500/30 bg-warning-500/10 px-2 py-1 text-[10px] font-semibold text-warning-400">
            HONEST EXECUTION
          </span>

          <span
            className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${verificationBadge.UNVERIFIED}`}
          >
            {verificationText.UNVERIFIED}
          </span>
        </div>

        <p className="mt-2 text-[11px] leading-5 text-ink-300">
          KHOEM-AI អាចវិភាគសំណើ និងសញ្ញាសុវត្ថិភាពតាម rules ដែលបានកំណត់។
          វាមិនអះអាងថា device បានអនុវត្តទេ លុះត្រាតែមានលទ្ធផលពិតដែលបានផ្ទៀងផ្ទាត់។
        </p>
      </div>

      {/* Conduct state */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-ink-700/60 bg-ink-950/30 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">
            Conduct Layer
          </p>

          <p className="mt-1 text-xs font-medium text-white">
            {INTERACTION_STAGE_LABEL_KM[currentStage]}
          </p>

          <p className="mt-1 text-[11px] leading-5 text-ink-400">
            Respect → Honesty → Clarify → Execute → Verify
          </p>
        </div>

        <div className="rounded-xl border border-ink-700/60 bg-ink-950/30 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">
            Verification
          </p>

          <p className="mt-1 text-xs font-medium text-warning-400">
            លទ្ធផលដែលគ្មាន verification = មិនរាប់ថាសម្រេច
          </p>

          <p className="mt-1 text-[11px] leading-5 text-ink-400">
            Real device ACK ឬ real system evidence ត្រូវមាន មុននឹងប្រកាសថា
            action បានជោគជ័យ។
          </p>
        </div>
      </div>

      {/* Capabilities */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-success-400">
            អាចធ្វើបាន
          </p>

          <ul className="mt-2 space-y-1.5">
            {SELF_IDENTITY.capabilities.map((capability) => (
              <li
                key={capability}
                className="text-[11px] leading-5 text-ink-300"
              >
                <span className="mr-1 text-success-400">✓</span>
                {capability}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-warning-400">
            ដែនកំណត់សំខាន់
          </p>

          <ul className="mt-2 space-y-1.5">
            {SELF_IDENTITY.notCapableOf.map((limitation) => (
              <li
                key={limitation}
                className="text-[11px] leading-5 text-ink-400"
              >
                <span className="mr-1 text-warning-400">!</span>
                {limitation}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent security decisions */}
      <div className="mt-5 border-t border-ink-700/70 pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-ink-200">
            សេចក្តីសម្រេចសុវត្ថិភាពថ្មីៗ
          </p>

          {!decisionsLoading && (
            <span className="text-[10px] text-ink-500">
              {decisions.length} records
            </span>
          )}
        </div>

        {decisionsLoading ? (
          <p className="mt-2 text-xs text-ink-500">
            កំពុងពិនិត្យ decision history...
          </p>
        ) : decisions.length === 0 ? (
          <div className="mt-2 rounded-lg border border-ink-700/50 bg-ink-950/30 p-3">
            <p className="text-xs text-ink-400">
              មិនទាន់មាន decision history ពី backend ទេ។
            </p>
            <p className="mt-1 text-[10px] leading-5 text-ink-600">
              អូនមិនបង្កើត fake decision ដើម្បីបំពេញ UI ទេ។
            </p>
          </div>
        ) : (
          <div className="mt-2 space-y-2">
            {decisions.map((decision) => (
              <article
                key={decision.id}
                className="rounded-lg border border-ink-700/50 bg-ink-850/40 p-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-ink-200">
                    {decision.action}
                  </span>

                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${decisionBadge[decision.decision]}`}
                  >
                    {decision.decision}
                  </span>
                </div>

                <p
                  className={`mt-1 text-[11px] ${threatColor[decision.threatLevel]}`}
                >
                  Threat: {decision.threatLevel}
                  {decision.reasons?.[0]
                    ? ` — ${decision.reasons[0]}`
                    : ""}
                </p>

                <p className="mt-1 text-[10px] text-ink-600">
                  {formatDecisionTime(decision.timestamp)}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Safety boundary */}
      <div className="mt-4 rounded-lg border border-warning-500/20 bg-warning-500/5 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-warning-400">
          Safety boundary
        </p>

        <p className="mt-1 text-[11px] leading-5 text-ink-400">
          Brain មិនអាចលុបចោល RBAC ឬ Safety Engine បានទេ។ វាអាចបន្ថែម
          caution ប៉ុណ្ណោះ ហើយការអនុវត្ត device ត្រូវឆ្លងកាត់ command pipeline
          ពិតរបស់ប្រព័ន្ធ។
        </p>
      </div>
    </section>
  );
}
