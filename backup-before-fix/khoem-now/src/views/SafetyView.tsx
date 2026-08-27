import { useState } from 'react';
import { ShieldAlert, DoorClosed, Car, Factory, Zap } from 'lucide-react';
import { Panel, SectionHeader, Badge, Toggle, StatusDot } from '@/components/ui';
import { safetyRules, type SafetyRule } from '@/data/domain';

const scopeIcon: Record<string, typeof DoorClosed> = {
  door: DoorClosed,
  vehicle: Car,
  industrial: Factory,
};

const severityVariant: Record<string, 'danger' | 'warning' | 'neutral' | 'brand'> = {
  critical: 'danger',
  high: 'warning',
  medium: 'brand',
  low: 'neutral',
};

export function SafetyView() {
  const [rules, setRules] = useState<SafetyRule[]>(safetyRules);
  const [scopeFilter, setScopeFilter] = useState<string>('all');

  const toggleRule = (id: string) =>
    setRules((rs) => rs.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));

  const scopes = ['all', 'door', 'vehicle', 'industrial'];
  const filtered = rules.filter((r) => scopeFilter === 'all' || r.scope === scopeFilter);
  const enabledCount = rules.filter((r) => r.enabled).length;
  const totalTriggers = rules.reduce((s, r) => s + r.triggered, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-500/10 text-success-400"><ShieldAlert size={20} /></div>
            <div><p className="text-2xl font-bold text-white">{enabledCount}/{rules.length}</p><p className="text-xs text-ink-400">Rules active</p></div>
          </div>
        </Panel>
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-500/10 text-warning-400"><Zap size={20} /></div>
            <div><p className="text-2xl font-bold text-white">{totalTriggers}</p><p className="text-xs text-ink-400">Total triggers (30d)</p></div>
          </div>
        </Panel>
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-danger-500/10 text-danger-400"><ShieldAlert size={20} /></div>
            <div><p className="text-2xl font-bold text-white">4</p><p className="text-xs text-ink-400">Critical rules</p></div>
          </div>
        </Panel>
      </div>

      {/* Scope filters */}
      <div className="flex flex-wrap gap-2">
        {scopes.map((s) => (
          <button
            key={s}
            onClick={() => setScopeFilter(s)}
            className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition-all ${
              scopeFilter === s ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 'border border-ink-700 text-ink-400 hover:text-ink-200'
            }`}
          >
            {s === 'all' ? 'All scopes' : s}
          </button>
        ))}
      </div>

      {/* Rules grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((r) => {
          const Icon = scopeIcon[r.scope] ?? ShieldAlert;
          return (
            <Panel key={r.id} hover className="p-5 animate-fade-in">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-800 text-brand-400">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{r.name}</h3>
                    <p className="text-xs text-ink-400">{r.id} · {r.scope}</p>
                  </div>
                </div>
                <Toggle checked={r.enabled} onChange={() => toggleRule(r.id)} />
              </div>

              <div className="mt-4 space-y-2.5 rounded-xl border border-ink-700/50 bg-ink-900/40 p-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Condition</p>
                  <p className="mt-0.5 text-sm text-ink-200">{r.condition}</p>
                </div>
                <div className="divider" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Action</p>
                  <p className="mt-0.5 text-sm text-ink-200">{r.action}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={severityVariant[r.severity]}>{r.severity}</Badge>
                  <span className="text-xs text-ink-400">Triggered {r.triggered}×</span>
                </div>
                <div className="flex items-center gap-2">
                  {r.enabled ? <StatusDot status="online" label="Active" /> : <span className="text-xs text-ink-400">Disabled</span>}
                  {r.lastTriggered && <span className="text-xs text-ink-400">· {r.lastTriggered}</span>}
                </div>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
