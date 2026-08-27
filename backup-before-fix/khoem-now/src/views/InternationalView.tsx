import { Globe2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Panel, SectionHeader, Badge, StatusDot } from '@/components/ui';
import { countries } from '@/data/domain';

export function InternationalView() {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400"><Globe2 size={20} /></div>
            <div><p className="text-2xl font-bold text-white">41/195</p><p className="text-xs text-ink-400">Countries deployed</p></div>
          </div>
        </Panel>
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/10 text-accent-400"><Clock size={20} /></div>
            <div><p className="text-2xl font-bold text-white">28</p><p className="text-xs text-ink-400">Timezones supported</p></div>
          </div>
        </Panel>
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-500/10 text-success-400"><CheckCircle2 size={20} /></div>
            <div><p className="text-2xl font-bold text-white">36</p><p className="text-xs text-ink-400">Locales available</p></div>
          </div>
        </Panel>
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-500/10 text-warning-400"><AlertCircle size={20} /></div>
            <div><p className="text-2xl font-bold text-white">2</p><p className="text-xs text-ink-400">Compliance pending</p></div>
          </div>
        </Panel>
      </div>

      {/* Country table */}
      <Panel className="p-5 animate-fade-in">
        <SectionHeader
          title="Country Configuration"
          subtitle="Regional deployment, localization, and compliance status"
          icon={<Globe2 size={18} />}
        />
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700 text-left text-xs uppercase tracking-wider text-ink-400">
                <th className="pb-3 pr-4 font-semibold">Country</th>
                <th className="pb-3 pr-4 font-semibold">Timezone</th>
                <th className="pb-3 pr-4 font-semibold">UTC Offset</th>
                <th className="pb-3 pr-4 font-semibold">Locale</th>
                <th className="pb-3 pr-4 font-semibold">Sites</th>
                <th className="pb-3 pr-4 font-semibold">Devices</th>
                <th className="pb-3 pr-4 font-semibold">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800">
              {countries.map((c) => (
                <tr key={c.code} className="transition-colors hover:bg-ink-800/40">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-9 items-center justify-center rounded border border-ink-700 bg-ink-800 text-xs font-bold text-ink-200">{c.flag}</span>
                      <span className="font-medium text-ink-100">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-ink-300">{c.timezone}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-ink-300">{c.utcOffset}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-ink-300">{c.locale}</td>
                  <td className="py-3 pr-4 text-white tabular-nums">{c.sites}</td>
                  <td className="py-3 pr-4 text-white tabular-nums">{c.devices.toLocaleString()}</td>
                  <td className="py-3 pr-4">
                    {c.compliance === 'verified' ? (
                      <Badge variant="success"><StatusDot status="verified" /> Verified</Badge>
                    ) : c.compliance === 'pending' ? (
                      <Badge variant="warning"><StatusDot status="pending" /> Pending</Badge>
                    ) : (
                      <Badge variant="neutral">N/A</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* World clock */}
      <Panel className="p-5 animate-fade-in">
        <SectionHeader title="World Clock" subtitle="Live time across deployment regions" icon={<Clock size={18} />} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {countries.slice(0, 6).map((c) => {
            const time = new Date().toLocaleTimeString(c.locale, { timeZone: c.timezone, hour: '2-digit', minute: '2-digit', hour12: false });
            return (
              <div key={c.code} className="rounded-xl border border-ink-700/50 bg-ink-900/40 p-4 text-center">
                <p className="text-xs text-ink-400">{c.name}</p>
                <p className="mt-1 text-2xl font-bold text-white tabular-nums">{time}</p>
                <p className="mt-0.5 text-xs text-ink-400 font-mono">{c.utcOffset}</p>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
