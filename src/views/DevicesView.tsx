import { useState, useEffect } from 'react';
import { Search, Cpu, Download } from 'lucide-react';
import { Panel, SectionHeader, Badge, StatusDot } from '@/components/ui';
import { capabilityRegistry } from '@/data/domain';
import { useLanguage } from '@/i18n/LanguageContext';
import { listDevices } from '@/lib/api';

type DeviceStatus = 'online' | 'offline' | 'pairing' | 'error' | 'maintenance' | 'decommissioned';

interface ApiDevice {
  deviceId: string;
  name: string;
  type: string;
  status: DeviceStatus;
  firmwareVersion?: string;
  lastSeenAt?: string;
  serialNumber?: string;
}

const statusVariant: Partial<Record<DeviceStatus, 'success' | 'warning' | 'neutral' | 'brand'>> = {
  online: 'success',
  offline: 'neutral',
  pairing: 'warning',
  error: 'brand',
  maintenance: 'brand',
  decommissioned: 'neutral',
};

const filterKey: Record<string, string> = {
  all: 'view.devices.filter.all',
  online: 'view.devices.filter.online',
  pairing: 'view.devices.filter.pairing',
  error: 'view.devices.filter.error',
  maintenance: 'view.devices.filter.maintenance',
  offline: 'view.devices.filter.offline',
  decommissioned: 'view.devices.filter.decommissioned',
};

const statusKey: Partial<Record<DeviceStatus, string>> = {
  online: 'view.devices.status.online',
  offline: 'view.devices.status.offline',
  pairing: 'view.devices.status.pairing',
  error: 'view.devices.status.error',
  maintenance: 'view.devices.status.maintenance',
  decommissioned: 'view.devices.status.decommissioned',
};

export function DevicesView() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [devices, setDevices] = useState<ApiDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listDevices()
      .then((res) => setDevices(res.devices ?? []))
      .catch((err) => setError(err.message ?? t('view.devices.loadFailed')))
      .finally(() => setLoading(false));
  }, [t]);

  const filtered = devices.filter((d) => {
    const matchesQuery =
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      (d.serialNumber ?? d.deviceId).toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'all' || d.status === filter;
    return matchesQuery && matchesFilter;
  });

  const filters = ['all', 'online', 'pairing', 'error', 'maintenance', 'offline', 'decommissioned'];

  return (
    <div className="space-y-6">
      {/* Capability registry summary — still mock, no backend endpoint yet */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {capabilityRegistry.map((c) => (
          <Panel key={c.name} hover className="p-3">
            <p className="text-xs text-ink-400">{c.name}</p>
            <p className="mt-1 text-lg font-bold text-white tabular-nums">{c.devices.toLocaleString()}</p>
          </Panel>
        ))}
      </div>

      <Panel className="p-5 animate-fade-in">
        <SectionHeader
          title={t('view.devices.registryTitle')}
          subtitle={`${devices.length.toLocaleString()} ${t('view.devices.acrossAllSites')}`}
          icon={<Cpu size={18} />}
          action={
            <div className="flex gap-2">
              <button className="btn-ghost text-xs"><Download size={14} /> {t('view.devices.export')}</button>
            </div>
          }
        />

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              className="input pl-9"
              placeholder={t('view.devices.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-2 text-xs font-medium capitalize transition-colors ${
                  filter === f ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 'border border-ink-700 text-ink-400 hover:text-ink-200'
                }`}
              >
                {filterKey[f] ? t(filterKey[f]) : f}
              </button>
            ))}
          </div>
        </div>

        {loading && <div className="py-12 text-center text-ink-400">Loading devices…</div>}
        {error && <div className="py-12 text-center text-red-400">Error: {error}</div>}

        {!loading && !error && (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-700 text-left text-xs uppercase tracking-wider text-ink-400">
                  <th className="pb-3 pr-4 font-semibold">{t('view.devices.table.device')}</th>
                  <th className="pb-3 pr-4 font-semibold">{t('view.devices.table.category')}</th>
                  <th className="pb-3 pr-4 font-semibold">{t('view.devices.table.firmware')}</th>
                  <th className="pb-3 pr-4 font-semibold">{t('view.devices.table.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800">
                {filtered.map((d) => (
                  <tr key={d.deviceId} className="group transition-colors hover:bg-ink-800/40">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-ink-100">{d.name}</div>
                      <div className="text-xs text-ink-400">{d.serialNumber ?? d.deviceId}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant="neutral">{d.type}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-ink-300 font-mono text-xs">
                      {d.firmwareVersion ? `v${d.firmwareVersion}` : '—'}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={statusVariant[d.status] ?? 'neutral'}>
                        <StatusDot status={d.status} /> {statusKey[d.status] ? t(statusKey[d.status]!) : d.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-ink-400">{t('view.devices.noMatch')}</div>
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}
