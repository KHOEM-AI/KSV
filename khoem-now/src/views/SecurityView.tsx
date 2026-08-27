import { ShieldCheck, KeyRound, Fingerprint, Lock, UserCheck, AlertTriangle } from 'lucide-react';
import { Panel, SectionHeader, Badge, StatusDot, ProgressBar, Donut } from '@/components/ui';
import { sessions } from '@/data/domain';

export function SecurityView() {
  const activeSessions = sessions.filter((s) => s.status === 'active').length;
  const mfaEnabled = sessions.filter((s) => s.mfa).length;
  const mfaPct = Math.round((mfaEnabled / sessions.length) * 100);

  const authMethods = [
    { value: sessions.filter((s) => s.method === 'OAuth 2.0').length, color: '#2a9dff', label: 'OAuth 2.0' },
    { value: sessions.filter((s) => s.method === 'OIDC').length, color: '#22d3ee', label: 'OIDC' },
    { value: sessions.filter((s) => s.method === 'OTP').length, color: '#10b981', label: 'OTP' },
    { value: sessions.filter((s) => s.method === 'Password').length, color: '#f59e0b', label: 'Password' },
  ];

  return (
    <div className="space-y-6">
      {/* Security posture */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-500/10 text-success-400"><ShieldCheck size={20} /></div>
            <div><p className="text-2xl font-bold text-white">A+</p><p className="text-xs text-ink-400">Security grade</p></div>
          </div>
        </Panel>
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400"><UserCheck size={20} /></div>
            <div><p className="text-2xl font-bold text-white">{activeSessions}</p><p className="text-xs text-ink-400">Active sessions</p></div>
          </div>
        </Panel>
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/10 text-accent-400"><Fingerprint size={20} /></div>
            <div><p className="text-2xl font-bold text-white">{mfaPct}%</p><p className="text-xs text-ink-400">MFA coverage</p></div>
          </div>
        </Panel>
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-500/10 text-warning-400"><AlertTriangle size={20} /></div>
            <div><p className="text-2xl font-bold text-white">2</p><p className="text-xs text-ink-400">Denied attempts (24h)</p></div>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sessions */}
        <Panel className="p-5 lg:col-span-2 animate-fade-in">
          <SectionHeader title="Active Sessions" subtitle="Authenticated user sessions across the platform" icon={<KeyRound size={18} />} />
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-700 text-left text-xs uppercase tracking-wider text-ink-400">
                  <th className="pb-3 pr-4 font-semibold">User</th>
                  <th className="pb-3 pr-4 font-semibold">Method</th>
                  <th className="pb-3 pr-4 font-semibold">Location</th>
                  <th className="pb-3 pr-4 font-semibold">MFA</th>
                  <th className="pb-3 pr-4 font-semibold">Last active</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800">
                {sessions.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-ink-800/40">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-ink-100">{s.user}</div>
                      <div className="text-xs text-ink-400">{s.role}</div>
                    </td>
                    <td className="py-3 pr-4"><Badge variant="brand">{s.method}</Badge></td>
                    <td className="py-3 pr-4">
                      <div className="text-ink-200">{s.location}</div>
                      <div className="text-xs text-ink-400 font-mono">{s.ip}</div>
                    </td>
                    <td className="py-3 pr-4">
                      {s.mfa ? <Badge variant="success"><Lock size={10} /> On</Badge> : <Badge variant="warning">Off</Badge>}
                    </td>
                    <td className="py-3 pr-4 text-ink-300">{s.lastActive}</td>
                    <td className="py-3 pr-4"><StatusDot status={s.status} label={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* Auth methods donut + policies */}
        <div className="space-y-4">
          <Panel className="p-5 animate-fade-in">
            <SectionHeader title="Auth Methods" icon={<Fingerprint size={18} />} />
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
              </div>
            </div>
          </Panel>

          <Panel className="p-5 animate-fade-in">
            <SectionHeader title="Security Policies" icon={<ShieldCheck size={18} />} />
            <div className="space-y-3">
              {[
                { name: 'Zero-plaintext password policy', status: 'Enforced', pct: 100 },
                { name: 'OAuth 2.0 / OIDC flow', status: 'Enforced', pct: 100 },
                { name: 'OTP recovery backup', status: 'Enforced', pct: 100 },
                { name: 'Session audit logging', status: 'Enforced', pct: 100 },
                { name: 'Force MFA for admins', status: 'Enforced', pct: 100 },
                { name: 'IP allowlist (prod)', status: 'Partial', pct: 72 },
              ].map((p) => (
                <div key={p.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-ink-200">{p.name}</span>
                    <Badge variant={p.pct === 100 ? 'success' : 'warning'}>{p.status}</Badge>
                  </div>
                  <ProgressBar value={p.pct} size="sm" color={p.pct === 100 ? 'success' : 'warning'} />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
