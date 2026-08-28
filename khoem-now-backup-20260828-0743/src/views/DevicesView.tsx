import { useState } from 'react';
import { Search, Cpu, Filter, Download } from 'lucide-react';
import { Panel, SectionHeader, Badge, StatusDot, ProgressBar } from '@/components/ui';
import { devices, capabilityRegistry, type DeviceStatus } from '@/data/domain';

const statusVariant: Record<DeviceStatus, 'success' | 'warning' | 'neutral' | 'brand'> = {
  online: 'success',
  warning: 'warning',
  offline: 'neutral',
  maintenance: 'brand',
};

const categoryIcon: Record<string, string> = {
  access: 'Access',
  climate: 'Climate',
  industrial: 'Industrial',
  vehicle: 'Vehicle',
  sensor: 'Sensor',
  network: 'Network',
};

export function DevicesView() {
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
          title="Device Registry"
          subtitle={`${devices.length} devices across all sites`}
          icon={<Cpu size={18} />}
          action={
            <div className="flex gap-2">
              <button className="btn-ghost text-xs"><Download size={14} /> Export</button>
            </div>
          }
        />

        {/* Search + filters */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              className="input pl-9"
              placeholder="Search by name or device ID…"
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
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700 text-left text-xs uppercase tracking-wider text-ink-400">
                <th className="pb-3 pr-4 font-semibold">Device</th>
                <th className="pb-3 pr-4 font-semibold">Category</th>
                <th className="pb-3 pr-4 font-semibold">Protocol</th>
                <th className="pb-3 pr-4 font-semibold">Location</th>
                <th className="pb-3 pr-4 font-semibold">Signal</th>
                <th className="pb-3 pr-4 font-semibold">Firmware</th>
                <th className="pb-3 pr-4 font-semibold">Status</th>
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
                    <Badge variant="neutral">{categoryIcon[d.category]}</Badge>
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
                      <StatusDot status={d.status} /> {d.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-ink-400">No devices match your filters.</div>
          )}
        </div>
      </Panel>
    </div>
  );
}
