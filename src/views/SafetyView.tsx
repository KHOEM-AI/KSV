// src/views/SafetyView.tsx
import { useState, useEffect } from 'react';
import { ShieldAlert, Clock, Lock, Zap, Activity, Users, Thermometer, GitBranch, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Panel, Badge, Toggle, StatusDot } from '@/components/ui';
import { listSafetyRules, enableSafetyRule, disableSafetyRule } from '@/lib/api';
import type { SafetyRule } from '../../API/safety';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatTimeAgo } from '@/i18n/timeAgo';

const typeIcon: Record<string, typeof ShieldAlert> = {
  operating_hours: Clock,
  interlock: Lock,
  rate_limit: Zap,
  value_range: Activity,
  sequence_requirement: GitBranch,
  human_presence: Users,
  environmental_condition: Thermometer,
  emergency_override: AlertTriangle,
  dependency_check: ShieldCheck,
};

const severityVariant: Record<string, 'danger' | 'warning' | 'neutral' | 'brand'> = {
  critical: 'danger',
  high: 'warning',
  medium: 'brand',
  low: 'neutral',
};

export function SafetyView() {
  const { t, language } = useLanguage();
  const [rules, setRules] = useState<SafetyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    listSafetyRules()
      .then((res) => setRules(res.rules ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load safety rules'))
      .finally(() => setLoading(false));
  }, []);

  const toggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await disableSafetyRule(ruleId);
      } else {
        await enableSafetyRule(ruleId);
      }
      setRules((rs) => rs.map((r) => (r.ruleId === ruleId ? { ...r, isActive: !isActive } : r)));
    } catch {
      // Ignore toggle failure — UI will refresh next load.
    }
  };

  const enabledCount = rules.filter((r) => r.isActive).length;
  const totalTriggers = rules.reduce((s, r) => s + (r.triggeredCount ?? 0), 0);
  const criticalCount = rules.filter((r) => r.severity === 'critical').length;

  const types = ['all', ...Array.from(new Set(rules.map((r) => r.type)))];
  const filtered = rules.filter((r) => typeFilter === 'all' || r.type === typeFilter);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-500/10 text-success-400"><ShieldAlert size={20} /></div>
            <div><p className="text-2xl font-bold text-white">{enabledCount}/{rules.length}</p><p className="text-xs text-ink-400">{t('view.safety.stat.rulesActive')}</p></div>
          </div>
        </Panel>
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-500/10 text-warning-400"><Zap size={20} /></div>
            <div><p className="text-2xl font-bold text-white">{totalTriggers}</p><p className="text-xs text-ink-400">{t('view.safety.stat.totalTriggers')}</p></div>
          </div>
        </Panel>
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-danger-500/10 text-danger-400"><ShieldAlert size={20} /></div>
            <div><p className="text-2xl font-bold text-white">{criticalCount}</p><p className="text-xs text-ink-400">{t('view.safety.stat.criticalRules')}</p></div>
          </div>
        </Panel>
      </div>

      {/* Type filters */}
      <div className="flex flex-wrap gap-2">
        {types.map((s) => (
          <button
            key={s}
            onClick={() => setTypeFilter(s)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              typeFilter === s ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 'border border-ink-700 text-ink-400 hover:text-ink-200'
            }`}
          >
            {s === 'all' ? 'All' : s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Loading / error */}
      {loading && <div className="py-12 text-center text-ink-400">Loading safety rules…</div>}
      {error && <div className="py-12 text-center text-red-400">Error: {error}</div>}

      {/* Rules grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((r) => {
            const Icon = typeIcon[r.type] ?? ShieldAlert;
            return (
              <Panel key={r.ruleId} hover className="p-5 animate-fade-in">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-800 text-brand-400">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{r.name}</h3>
                      <p className="text-xs text-ink-400">{r.type.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <Toggle checked={r.isActive} onChange={() => toggleRule(r.ruleId, r.isActive)} />
                </div>

                <div className="mt-4 rounded-xl border border-ink-700/50 bg-ink-900/40 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Description</p>
                  <p className="mt-0.5 text-sm text-ink-200">{r.description}</p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={severityVariant[r.severity] ?? 'neutral'}>{r.severity}</Badge>
                    <span className="text-xs text-ink-400">{r.triggeredCount ?? 0} triggers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.isActive ? (
                      <StatusDot status="online" label={t('view.safety.active')} />
                    ) : (
                      <span className="text-xs text-ink-400">{t('view.safety.disabled')}</span>
                    )}
                    {r.lastTriggeredAt && <span className="text-xs text-ink-400">· {formatTimeAgo(r.lastTriggeredAt, language)}</span>}
                  </div>
                </div>
              </Panel>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-ink-400">No safety rules found.</div>
          )}
        </div>
      )}
    </div>
  );
}
