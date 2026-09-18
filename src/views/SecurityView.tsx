import { ShieldCheck, KeyRound, Fingerprint, AlertTriangle } from 'lucide-react';
import { Panel, SectionHeader, Badge, ProgressBar, Donut } from '@/components/ui';
import { useLanguage } from '@/i18n/LanguageContext';
import { useEffect, useState } from 'react';
import {
  getThreats,
  getIncidents,
  getSessions,
  type ThreatEntry,
  type IncidentEntry,
  type SecuritySessionEntry,
} from '@/lib/api';

// Static illustrative policies (UI content, not domain data).
const policies = [
  { key: 'zeroPlaintext', nameKey: 'view.security.policy.zeroPlaintext', pct: 100 },
  { key: 'oauthOidc', nameKey: 'view.security.policy.oauthOidc', pct: 100 },
  { key: 'otpRecovery', nameKey: 'view.security.policy.otpRecovery', pct: 100 },
  { key: 'sessionAudit', nameKey: 'view.security.policy.sessionAudit', pct: 100 },
  { key: 'forceMfaAdmins', nameKey: 'view.security.policy.forceMfaAdmins', pct: 100 },
  { key: 'ipAllowlist', nameKey: 'view.security.policy.ipAllowlist', pct: 72 },
];

export function SecurityView() {
  const { t } = useLanguage();
  const [threats, setThreats] = useState<ThreatEntry[]>([]);
  const [incidents, setIncidents] = useState<IncidentEntry[]>([]);
  const [sessions, setSessions] = useState<SecuritySessionEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getThreats(),
      getIncidents(),
      getSessions().catch(() => ({ sessions: [] as SecuritySessionEntry[], total: 0 })),
    ])
      .then(([th, inc, sess]) => {
        setThreats(th.threats ?? []);
        setIncidents(inc.incidents ?? []);
        setSessions(sess.sessions ?? []);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Failed to load security data'));
  }, []);

  const activeSessions = sessions.length;

  // Auth method distribution — derived from real session userAgent data.
  const detectMethod = (ua: string): string => {
    const s = ua.toLowerCase();
    if (s.includes('edg')) return 'Edge';
    if (s.includes('chrome')) return 'Chrome';
    if (s.includes('safari')) return 'Safari';
    if (s.includes('firefox')) return 'Firefox';
    if (s === '') return 'Unknown';
    return 'Other';
  };
  const methodCounts: Record<string, number> = {};
  for (const sess of sessions) {
    const m = detectMethod(sess.userAgent);
    methodCounts[m] = (methodCounts[m] ?? 0) + 1;
  }
  const methodColors: Record<string, string> = {
    Chrome: '#2a9dff',
    Edge: '#22d3ee',
    Safari: '#10b981',
    Firefox: '#f59e0b',
    Other: '#8b5cf6',
    Unknown: '#3a4666',
  };
  const authMethods = Object.entries(methodCounts).map(([label, value]) => ({
    label,
    value,
    color: methodColors[label] ?? '#3a4666',
  }));

  return (
    <div className="space-y-6">
      {/* Security posture */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-500/10 text-success-400"><ShieldCheck size={20} /></div>
            <div>
              <p className="text-2xl font-bold text-white">{incidents.length === 0 ? 'A+' : 'B'}</p>
              <p className="text-xs text-ink-400">{t('view.security.stat.grade')}</p>
            </div>
          </div>
        </Panel>
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400"><KeyRound size={20} /></div>
            <div><p className="text-2xl font-bold text-white">{activeSessions}</p><p className="text-xs text-ink-400">{t('view.security.stat.activeSessions')}</p></div>
          </div>
        </Panel>
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/10 text-accent-400"><Fingerprint size={20} /></div>
            <div><p className="text-2xl font-bold text-white">{threats.length}</p><p className="text-xs text-ink-400">Threats</p></div>
          </div>
        </Panel>
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-500/10 text-warning-400"><AlertTriangle size={20} /></div>
            <div><p className="text-2xl font-bold text-white">{incidents.length}</p><p className="text-xs text-ink-400">Incidents</p></div>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sessions */}
        <Panel className="p-5 lg:col-span-2 animate-fade-in">
          <SectionHeader title={t('view.security.sessions.title')} subtitle={t('view.security.sessions.subtitle')} icon={<KeyRound size={18} />} />
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-700 text-left text-xs uppercase tracking-wider text-ink-400">
                  <th className="pb-3 pr-4 font-semibold">{t('view.security.table.user')}</th>
                  <th className="pb-3 pr-4 font-semibold">{t('view.security.table.location')}</th>
                  <th className="pb-3 pr-4 font-semibold">Client</th>
                  <th className="pb-3 pr-4 font-semibold">{t('view.security.table.lastActive')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800">
                {sessions.map((s) => (
                  <tr key={s.sessionId} className="transition-colors hover:bg-ink-800/40">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-ink-100">{s.user}</div>
                      <div className="text-xs text-ink-400">{s.role}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="text-ink-200">{s.ip || '—'}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="text-xs text-ink-300 truncate max-w-[180px]">{s.userAgent || '—'}</div>
                    </td>
                    <td className="py-3 pr-4 text-ink-300">
                      {new Date(s.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {sessions.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-ink-400">No active sessions.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* Auth methods + policies */}
        <div className="space-y-4">
          <Panel className="p-5 animate-fade-in">
            <SectionHeader title="Clients" icon={<Fingerprint size={18} />} />
            <div className="flex flex-col items-center gap-4">
              <Donut segments={authMethods} centerLabel={`${sessions.length}`} centerSub="sessions" size={130} />
              <div className="w-full space-y-2">
                {authMethods.map((m) => (
                  <div key={m.label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />
                      <span className="text-ink-300">{m.label}</span>
                    </span>
                    <span className="font-semibold text-white tabular-nums">{m.value}</span>
                  </div>
                ))}
                {authMethods.length === 0 && (
                  <div className="py-4 text-center text-ink-400 text-xs">No session data.</div>
                )}
              </div>
            </div>
          </Panel>

          <Panel className="p-5 animate-fade-in">
            <SectionHeader title={t('view.security.policies.title')} icon={<ShieldCheck size={18} />} />
            <div className="space-y-3">
              {policies.map((p) => (
                <div key={p.key}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-ink-200">{t(p.nameKey)}</span>
                    <Badge variant={p.pct === 100 ? 'success' : 'warning'}>
                      {p.pct === 100 ? t('view.security.status.enforced') : t('view.security.status.partial')}
                    </Badge>
                  </div>
                  <ProgressBar value={p.pct} size="sm" color={p.pct === 100 ? 'success' : 'warning'} />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <Panel className="p-5 animate-fade-in">
        <SectionHeader title="Threats & Incidents" subtitle="Live from /api/security" icon={<AlertTriangle size={18} />} />
        {loadError && <p className="text-sm text-danger-400 mb-3">{loadError}</p>}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-ink-400">Threats ({threats.length})</p>
            {threats.length === 0 ? (
              <p className="text-sm text-ink-400">No threats detected.</p>
            ) : (
              <ul className="space-y-2">
                {threats.map((th) => (
                  <li key={th._id} className="rounded-lg bg-ink-800/40 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-ink-100">{th.type}</span>
                      <Badge variant={th.severity === 'critical' || th.severity === 'high' ? 'warning' : 'brand'}>{th.severity}</Badge>
                    </div>
                    <p className="mt-1 text-ink-300">{th.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-ink-400">Incidents ({incidents.length})</p>
            {incidents.length === 0 ? (
              <p className="text-sm text-ink-400">No incidents.</p>
            ) : (
              <ul className="space-y-2">
                {incidents.map((inc) => (
                  <li key={inc._id} className="rounded-lg bg-ink-800/40 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-ink-100">{inc.title}</span>
                      <Badge variant="warning">{inc.status}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}
