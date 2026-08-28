import { useState } from 'react';
import { Search, Cpu, Filter, Download } from 'lucide-react';
import { Panel, SectionHeader, Badge, StatusDot, ProgressBar } from '@/components/ui';
import { devices, capabilityRegistry, type DeviceStatus } from '@/data/domain';
import { useLanguage } from '@/i18n/LanguageContext';

// ======================================================================
// KSV — Devices View (Domain #1, part 2: Language)
//
// Category labels, filter labels, table headers, and status text all
// come from t('key') now. `filter` state itself still stores the raw
// English id ('all' | 'online' | ...) — that is data, used for
// matching in the filter() call — only the *displayed* label is
// translated, via devices.filter.<id>.
// ======================================================================

const statusVariant: Record<DeviceStatus, 'success' | 'warning' | 'neutral' | 'brand'> = {
  online: 'success',
  warning: 'warning',
  offline: 'neutral',
  maintenance: 'brand',
};

const categoryKey: Record<string, string> = {
  access: 'view.devices.category.access',
  climate: 'view.devices.category.climate',
  industrial: 'view.devices.category.industrial',
  vehicle: 'view.devices.category.vehicle',
  sensor: 'view.devices.category.sensor',
  network: 'view.devices.category.network',
};

const filterKey: Record<string, string> = {
  all: 'view.devices.filter.all',
  online: 'view.devices.filter.online',
  warning: 'view.devices.filter.warning',
  maintenance: 'view.devices.filter.maintenance',
  offline: 'view.devices.filter.offline',
};

const statusKey: Record<DeviceStatus, string> = {
  online: 'view.devices.status.online',
  warning: 'view.devices.status.warning',
  offline: 'view.devices.status.offline',
  maintenance: 'view.devices.status.maintenance',
};

export function DevicesView() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const filtered = devices.filter((d) => {
    const matchesQuery = d.name.toLowerCase().includes(query.toLowerCase()) || d.id.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'all' || d.status === filter;
    return matchesQuery && matchesFilter;
  });

  const filters = ['all', 'online', 'warning', 'maintenance', 'offline'];

  return (
    <div className="space-y-6">
      {/* Capability registry summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {capabilityRegistry.map((c) => (
          <Panel key={c.name} hover className="p-3">
            <p className="text-xs text-ink-400">{c.name}</p>
            <p className="mt-1 text-lg font-bold text-white tabular-nums">{c.devices.toLocaleString()}</p>
          </Panel>
        ))}
      </div>

      {/* Device table */}
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

        {/* Search + filters */}
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
                {t(filterKey[f])}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700 text-left text-xs uppercase tracking-wider text-ink-400">
                <th className="pb-3 pr-4 font-semibold">{t('view.devices.table.device')}</th>
                <th className="pb-3 pr-4 font-semibold">{t('view.devices.table.category')}</th>
                <th className="pb-3 pr-4 font-semibold">{t('view.devices.table.protocol')}</th>
                <th className="pb-3 pr-4 font-semibold">{t('view.devices.table.location')}</th>
                <th className="pb-3 pr-4 font-semibold">{t('view.devices.table.signal')}</th>
                <th className="pb-3 pr-4 font-semibold">{t('view.devices.table.firmware')}</th>
                <th className="pb-3 pr-4 font-semibold">{t('view.devices.table.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800">
              {filtered.map((d) => (
                <tr key={d.id} className="group transition-colors hover:bg-ink-800/40">
                  <td className="py-3 pr-4">
                    <div className="font-medium text-ink-100">{d.name}</div>
                    <div className="text-xs text-ink-400">{d.id}</div>
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant="neutral">{t(categoryKey[d.category])}</Badge>
                  </td>
                  <td className="py-3 pr-4 text-ink-300">{d.protocol}</td>
                  <td className="py-3 pr-4">
                    <div className="text-ink-200">{d.site}</div>
                    <div className="text-xs text-ink-400">{d.building} · {d.floor}</div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16"><ProgressBar value={d.signal} size="sm" color={d.signal > 70 ? 'success' : d.signal > 40 ? 'warning' : 'danger'} /></div>
                      <span className="text-xs text-ink-400 tabular-nums">{d.signal}%</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-ink-300 font-mono text-xs">v{d.firmware}</td>
                  <td className="py-3 pr-4">
                    <Badge variant={statusVariant[d.status]}>
                      <StatusDot status={d.status} /> {t(statusKey[d.status])}
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
      </Panel>
    </div>
  );
}
