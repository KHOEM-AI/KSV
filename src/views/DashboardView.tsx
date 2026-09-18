import { useState, useEffect } from 'react';
import {
  Cpu, ShieldAlert, Globe2, Activity, AlertTriangle,
  Server, Radio, Network,
} from 'lucide-react';
import { Panel, SectionHeader, StatCard, Sparkline, Donut, ProgressBar, Badge, StatusDot } from '@/components/ui';
import { getDashboardFull, type DashboardFullResponse } from '@/lib/api';
import { useLanguage } from '@/i18n/LanguageContext';

export function DashboardView() {
  const { t } = useLanguage();
  const [data, setData] = useState<DashboardFullResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardFull()
      .then(setData)
      .catch((err) => console.error('Failed to load dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-16 text-center text-ink-400">Loading dashboard…</div>;
  }

  if (!data) {
    return <div className="py-16 text-center text-red-400">Dashboard unavailable.</div>;
  }

  const { stats, traffic, alertTrend, openAlerts, avgLatencyMs, uptimeDays, topSites, recentDevices, recentSafetyRules, protocols, gateways } = data;

  const onlinePct = stats.totalDevices > 0 ? Math.round((stats.onlineDevices / stats.totalDevices) * 100) : 0;
  const offlineCount = Math.max(0, stats.totalDevices - stats.onlineDevices - stats.warningDevices);
  const donutSegments = [
    { value: stats.onlineDevices, color: '#10b981', label: t('dashboard.health.online') },
    { value: stats.warningDevices, color: '#f59e0b', label: t('dashboard.health.warning') },
    { value: offlineCount, color: '#3a4666', label: t('dashboard.health.offline') },
  ];
  const gatewaysOnline = gateways.filter((g) => g.status === 'online').length;

  return (
    <div className="space-y-6">
      {/* Stat row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="group relative overflow-hidden rounded-2xl">
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-500/10 blur-2xl transition-all duration-500 group-hover:bg-brand-500/20" />
          <StatCard label={t('dashboard.stat.connectedDevices')} value={stats.totalDevices.toLocaleString()} icon={<Cpu size={20} />} trend={t('dashboard.trend.devicesUp')} trendUp accent="brand" />
        </div>
        <div className="group relative overflow-hidden rounded-2xl">
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-warning-500/10 blur-2xl transition-all duration-500 group-hover:bg-warning-500/20" />
          <StatCard label={t('dashboard.stat.activeSafetyRules')} value={stats.safetyRules} icon={<ShieldAlert size={20} />} trend={t('dashboard.trend.rulesNew')} trendUp accent="warning" />
        </div>
        <div className="group relative overflow-hidden rounded-2xl">
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-success-500/10 blur-2xl transition-all duration-500 group-hover:bg-success-500/20" />
          <StatCard label={t('dashboard.stat.edgeGateways')} value={stats.gateways} unit={t('dashboard.stat.online')} icon={<Server size={20} />} trend={t('dashboard.trend.gatewayOffline')} trendUp={false} accent="success" />
        </div>
        <div className="group relative overflow-hidden rounded-2xl">
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent-500/10 blur-2xl transition-all duration-500 group-hover:bg-accent-500/20" />
          <StatCard label={t('dashboard.stat.countriesDeployed')} value={stats.countriesDeployed} unit="/ 195" icon={<Globe2 size={20} />} trend={t('dashboard.trend.countriesAdded')} trendUp accent="accent" />
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Traffic chart */}
        <Panel className="p-5 lg:col-span-2 animate-fade-in">
          <SectionHeader
            title={t('dashboard.traffic.title')}
            subtitle={t('dashboard.traffic.subtitle')}
            icon={<Activity size={18} />}
            action={<Badge variant="success">{t('dashboard.traffic.live')}</Badge>}
          />
          <div className="relative">
            <Sparkline data={traffic} height={180} color="#2a9dff" />
            <div className="mt-3 flex items-center justify-between text-xs text-ink-400">
              <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-ink-400">{t('dashboard.traffic.peakThroughput')}</p>
              <p className="text-lg font-semibold text-white">{t('dashboard.traffic.cmdPerMin', { count: 0 })}</p>
            </div>
            <div>
              <p className="text-xs text-ink-400">{t('dashboard.traffic.avgLatency')}</p>
              <p className="text-lg font-semibold text-white">{t('dashboard.traffic.ms', { count: avgLatencyMs })}</p>
            </div>
            <div>
              <p className="text-xs text-ink-400">{t('dashboard.traffic.uptime')}</p>
              <p className="text-lg font-semibold text-success-400">{t('dashboard.traffic.days', { count: uptimeDays })}</p>
            </div>
          </div>
        </Panel>

        {/* Device health donut */}
        <Panel className="p-5 animate-fade-in">
          <SectionHeader title={t('dashboard.health.title')} subtitle={t('dashboard.health.subtitle')} icon={<Cpu size={18} />} />
          <div className="flex flex-col items-center gap-4">
            <Donut segments={donutSegments} centerLabel={`${onlinePct}%`} centerSub={t('dashboard.stat.online')} />
            <div className="w-full space-y-2">
              {donutSegments.map((s) => (
                <div key={s.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="text-ink-300">{s.label}</span>
                  </span>
                  <span className="font-semibold text-white tabular-nums">{s.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel className="p-5 animate-fade-in">
          <SectionHeader title={t('dashboard.alerts.title')} subtitle={t('dashboard.alerts.subtitle')} icon={<AlertTriangle size={18} />} />
          <Sparkline data={alertTrend} height={120} color="#f59e0b" />
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{openAlerts}</p>
              <p className="text-xs text-ink-400">{t('dashboard.alerts.openAlerts')}</p>
            </div>
            <Badge variant="warning">{t('dashboard.alerts.critical', { count: 0 })}</Badge>
          </div>
        </Panel>

        <Panel className="p-5 lg:col-span-2 animate-fade-in">
          <SectionHeader
            title={t('dashboard.sites.title')}
            subtitle={t('dashboard.sites.subtitle')}
            icon={<Server size={18} />}
            action={<button className="text-xs font-medium text-brand-400 hover:text-brand-300">{t('dashboard.sites.viewAll')}</button>}
          />
          <div className="space-y-4">
            {topSites.map((site) => (
              <div key={site.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-ink-200">{site.name}</span>
                  <span className="text-ink-400 tabular-nums">{t('dashboard.sites.devicesAndLoad', { count: site.devices.toLocaleString(), load: site.load })}</span>
                </div>
                <ProgressBar value={site.load} color={site.load > 85 ? 'danger' : site.load > 70 ? 'warning' : 'success'} />
              </div>
            ))}
            {topSites.length === 0 && (
              <div className="py-6 text-center text-ink-400">No sites yet.</div>
            )}
          </div>
        </Panel>
      </div>

      {/* Third row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel className="p-5 animate-fade-in">
          <SectionHeader title={t('dashboard.recentDevices.title')} icon={<Cpu size={18} />} />
          <div className="space-y-3">
            {recentDevices.map((d) => (
              <div key={d._id} className="flex items-center justify-between rounded-lg border border-ink-700/50 bg-ink-900/40 px-3 py-2.5 transition-colors hover:border-ink-600">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-100">{d.name}</p>
                  <p className="text-xs text-ink-400">{d.deviceCode}</p>
                </div>
                <StatusDot status={d.status as 'online' | 'offline' | 'warning' | 'maintenance'} />
              </div>
            ))}
            {recentDevices.length === 0 && (
              <div className="py-6 text-center text-ink-400">No devices yet.</div>
            )}
          </div>
        </Panel>

        <Panel className="p-5 animate-fade-in">
          <SectionHeader title={t('dashboard.safetyRules.title')} icon={<ShieldAlert size={18} />} />
          <div className="space-y-3">
            {recentSafetyRules.map((r) => (
              <div key={r._id} className="flex items-center justify-between rounded-lg border border-ink-700/50 bg-ink-900/40 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-100">{r.name}</p>
                  <p className="text-xs text-ink-400">{r.category ?? '—'} · {r.triggerCount ?? 0}</p>
                </div>
                <Badge variant={r.severity === 'critical' ? 'danger' : r.severity === 'high' ? 'warning' : 'neutral'}>
                  {r.severity}
                </Badge>
              </div>
            ))}
            {recentSafetyRules.length === 0 && (
              <div className="py-6 text-center text-ink-400">No rules yet.</div>
            )}
          </div>
        </Panel>

        <Panel className="p-5 animate-fade-in">
          <SectionHeader title={t('dashboard.protocols.title')} icon={<Radio size={18} />} />
          <div className="space-y-3">
            {protocols.map((p) => (
              <div key={p._id} className="flex items-center justify-between rounded-lg border border-ink-700/50 bg-ink-900/40 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-100">{p.name}</p>
                  <p className="text-xs text-ink-400">{p.code}{p.securityType ? ` · ${p.securityType}` : ''}</p>
                </div>
                <StatusDot status="active" />
              </div>
            ))}
            {protocols.length === 0 && (
              <div className="py-6 text-center text-ink-400">No protocols yet.</div>
            )}
          </div>
        </Panel>
      </div>

      {/* Gateway strip */}
      <Panel className="p-5 animate-fade-in">
        <SectionHeader
          title={t('dashboard.gateway.title')}
          subtitle={t('dashboard.gateway.subtitle')}
          icon={<Network size={18} />}
          action={<Badge variant="brand">{t('dashboard.gateway.onlineBadge', { online: gatewaysOnline, total: gateways.length })}</Badge>}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {gateways.map((g) => (
            <div key={g._id} className="rounded-xl border border-ink-700/50 bg-ink-900/40 p-4 transition-all hover:border-ink-600">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink-100">{g.name}</span>
                <StatusDot status={(g.status ?? 'offline') as 'online' | 'offline' | 'degraded' | 'maintenance' | 'updating'} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-ink-400">{t('dashboard.gateway.cpu')}</p>
                  <p className="text-sm font-semibold text-white tabular-nums">{g.cpuUsage ?? 0}%</p>
                </div>
                <div>
                  <p className="text-xs text-ink-400">{t('dashboard.gateway.mem')}</p>
                  <p className="text-sm font-semibold text-white tabular-nums">{g.memUsage ?? 0}%</p>
                </div>
                <div>
                  <p className="text-xs text-ink-400">{t('dashboard.gateway.devices')}</p>
                  <p className="text-sm font-semibold text-white tabular-nums">{g.deviceCount ?? 0}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-ink-400">
                <span>{g.ipAddress ?? '—'}</span>
                <span>{g.lastPingAt ? new Date(g.lastPingAt).toLocaleString() : '—'}</span>
              </div>
            </div>
          ))}
          {gateways.length === 0 && (
            <div className="col-span-full py-6 text-center text-ink-400">No gateways yet.</div>
          )}
        </div>
      </Panel>
    </div>
  );
}
