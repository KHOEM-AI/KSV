/**
 * KHOEM-AI Brain — Dashboard Panel
 * Location: khoem-now/src/components/KhoemAIPanel.tsx
 *
 * Displays what khoem-ai-brain.ts actually is (self-identity + scope
 * limits, shown honestly) plus recent analysis decisions pulled from
 * the audit log. Add this panel to DashboardView.tsx or SecurityView.tsx.
 */

import { useEffect, useState } from "react";

interface BrainStatus {
  name: string;
  role: string;
  capabilities: string[];
  notCapableOf: string[];
  version: string;
}

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

export function KhoemAIPanel() {
  const [status, setStatus] = useState<BrainStatus | null>(null);
  const [decisions, setDecisions] = useState<RecentDecision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Adjust the endpoint to wherever you expose SELF_IDENTITY +
    // recent analyze() results from the backend. This component
    // renders whatever the API returns — it doesn't invent data.
    async function load() {
      try {
        const [statusRes, decisionsRes] = await Promise.all([
          fetch("/api/v1/ai-brain/status").then((r) => r.json()),
          fetch("/api/v1/ai-brain/recent-decisions").then((r) => r.json()),
        ]);
        setStatus(statusRes);
        setDecisions(decisionsRes.decisions ?? []);
      } catch {
        // No backend route wired yet — show the panel in an honest
        // "not connected" state rather than fake data.
        setStatus(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-ink-700/70 bg-ink-900/60 p-5">
        <p className="text-sm text-ink-400">កំពុងផ្ទុក KHOEM-AI Brain...</p>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="rounded-2xl border border-ink-700/70 bg-ink-900/60 p-5">
        <p className="text-sm font-semibold text-white">KHOEM-AI Brain</p>
        <p className="mt-2 text-xs text-ink-400">
          មិនទាន់ភ្ជាប់ backend route (/api/v1/ai-brain/status) ទេ — សូមភ្ជាប់ khoem-ai-brain.ts ចូល server ជាមុនសិន។
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink-700/70 bg-ink-900/60 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">{status.name}</p>
          <p className="text-xs text-ink-400">{status.role}</p>
        </div>
        <span className="rounded-full border border-ink-600 px-2 py-0.5 text-[10px] text-ink-400">
          v{status.version}
        </span>
      </div>

      {/* Honest scope — what it can and can't do, always visible */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-success-400">អាចធ្វើបាន</p>
          <ul className="mt-1 space-y-1">
            {status.capabilities.map((c) => (
              <li key={c} className="text-[11px] text-ink-300">• {c}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">មិនអាចធ្វើបាន</p>
          <ul className="mt-1 space-y-1">
            {status.notCapableOf.map((c) => (
              <li key={c} className="text-[11px] text-ink-500">• {c}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent decisions */}
      <div className="mt-5 border-t border-ink-700/70 pt-4">
        <p className="mb-2 text-xs font-semibold text-ink-300">សេចក្តីសម្រេចថ្មីៗ</p>
        {decisions.length === 0 ? (
          <p className="text-xs text-ink-500">មិនទាន់មានទិន្នន័យ</p>
        ) : (
          <div className="space-y-2">
            {decisions.map((d) => (
              <div key={d.id} className="rounded-lg border border-ink-700/50 bg-ink-850/40 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink-200">{d.action}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${decisionBadge[d.decision]}`}>
                    {d.decision}
                  </span>
                </div>
                <p className={`mt-1 text-[11px] ${threatColor[d.threatLevel]}`}>
                  Threat: {d.threatLevel} — {d.reasons[0]}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
