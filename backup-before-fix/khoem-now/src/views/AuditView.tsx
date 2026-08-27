import { useState } from 'react';
import { ScrollText, Search, Filter } from 'lucide-react';
import { Panel, SectionHeader, Badge, StatusDot } from '@/components/ui';
import { auditEvents } from '@/data/domain';

const resultVariant: Record<string, 'success' | 'danger' | 'warning'> = {
  success: 'success',
  denied: 'danger',
  error: 'warning',
};

const categoryColor: Record<string, string> = {
  auth: 'text-brand-400',
  device: 'text-accent-400',
  safety: 'text-warning-400',
  admin: 'text-success-400',
  network: 'text-ink-300',
};

export function AuditView() {
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  const cats = ['all', 'auth', 'device', 'safety', 'admin', 'network'];
  const filtered = auditEvents.filter((e) => {
    const q = query.toLowerCase();
    const matchesQuery = e.actor.toLowerCase().includes(q) || e.action.toLowerCase().includes(q) || e.target.toLowerCase().includes(q);
    const matchesCat = catFilter === 'all' || e.category === catFilter;
    return matchesQuery && matchesCat;
  });

  return (
    <div className="space-y-6">
      <Panel className="p-5 animate-fade-in">
        <SectionHeader
          title="Immutable Audit Trail"
          subtitle="Cryptographically chained event log — all platform activity"
          icon={<ScrollText size={18} />}
          action={<Badge variant="success">Chain verified</Badge>}
        />

        {/* Search + filter */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              className="input pl-9"
              placeholder="Search by actor, action, or target…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                className={`rounded-lg px-3 py-2 text-xs font-medium capitalize transition-colors ${
                  catFilter === c ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 'border border-ink-700 text-ink-400 hover:text-ink-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="relative space-y-1">
          {filtered.map((e, i) => (
            <div key={e.id} className="group relative flex gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-ink-800/40">
              {/* timeline rail */}
              <div className="flex flex-col items-center">
                <div className={`mt-1 h-2.5 w-2.5 rounded-full ring-2 ring-ink-850 ${
                  e.result === 'success' ? 'bg-success-500' : e.result === 'denied' ? 'bg-danger-500' : 'bg-warning-500'
                }`} />
                {i < filtered.length - 1 && <div className="w-px flex-1 bg-ink-700" />}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`font-mono text-xs font-semibold ${categoryColor[e.category]}`}>{e.action}</span>
                  <Badge variant={resultVariant[e.result]}>{e.result}</Badge>
                  <span className="text-xs text-ink-400">· {e.category}</span>
                </div>
                <p className="mt-1 text-sm text-ink-100">
                  <span className="text-ink-200">{e.target}</span>
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-400">
                  <span>{e.actor}</span>
                  <span className="font-mono">{e.ip}</span>
                  <span>{e.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && <div className="py-12 text-center text-ink-400">No events match your filters.</div>}
      </Panel>
    </div>
  );
}
