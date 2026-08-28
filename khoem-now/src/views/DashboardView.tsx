import {
  Cpu, ShieldCheck, ShieldAlert, Globe2, Activity, Zap, AlertTriangle,
  TrendingUp, Server, Lock, Radio, ChevronRight, ArrowUpRight, Network,
} from 'lucide-react';
import { Panel, SectionHeader, StatCard, Sparkline, Donut, ProgressBar, Badge, StatusDot } from '@/components/ui';
import { stats, trafficData, alertTrend, devices, safetyRules, gateways, protocols } from '@/data/domain';
import { useLanguage } from '@/i18n/LanguageContext';

// ======================================================================
// KSV — Dashboard View (Domain #1, part 2: Language)
//
// Every visible label now comes from t('key') instead of a literal
// string, so this screen follows whatever language is active in
// LanguageContext — the same mechanism as nav.tsx / App.tsx.
// Numbers and IDs from src/data/domain stay as-is (data, not UI text).
// ======================================================================

export function DashboardView() {
  const { t } = useLanguage();

  const onlinePct = Math.round((stats.onlineDevices / stats.totalDevices) * 100);
  const offlineCount = stats.totalDevices - stats.onlineDevices;
  const donutSegments = [
    { value: stats.onlineDevices, color: '#10b981', label: t('dashboard.health.online') },
    { value: 645, color: '#f59e0b', label: t('dashboard.health.warning') },
    { value: offlineCount, color: '#3a4666', label: t('dashboard.health.offline') },
  ];
  const topSites = [
    { name: 'Singapore DC', devices: 2110, load: 82 },
    { name: 'Taipei Fab', devices: 1980, load: 91 },
    { name: 'Frankfurt HQ', devices: 1340, load: 64 },
    { name: 'Stuttgart Plant', devices: 1020, load: 55 },
    { name: 'Seoul Depot', devices: 740, load: 38 },
  ];

  return (
    <div className="space-y-6">
      {/* Stat row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('dashboard.stat.connectedDevices')} value={stats.totalDevices.toLocaleString()} icon={<Cpu size={20} />} trend={t('dashboard.trend.devicesUp')} trendUp accent="brand" />
        <StatCard label={t('dashboard.stat.activeSafetyRules')} value={stats.safetyRules} icon={<ShieldAlert size={20} />} trend={t('dashboard.trend.rulesNew')} trendUp accent="warning" />
        <StatCard label={t('dashboard.stat.edgeGateways')} value={stats.activeGateways} unit={t('dashboard.stat.online')} icon={<Server size={20} />} trend={t('dashboard.trend.gatewayOffline')} trendUp={false} accent="success" />
        <StatCard label={t('dashboard.stat.countriesDeployed')} value={stats.countries} unit="/ 195" icon={<Globe2 size={20} />} trend={t('dashboard.trend.countriesAdded')} trendUp accent="accent" />
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
            <Sparkline data={trafficData} height={180} color="#2a9dff" />
            <div className="mt-3 flex items-center justify-between text-xs text-ink-400">
              <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-ink-400">{t('dashboard.traffic.peakThroughput')}</p>
              <p className="text-lg font-semibold text-white">{t('dashboard.traffic.cmdPerMin', { count: 96 })}</p>
            </div>
            <div>
              <p className="text-xs text-ink-400">{t('dashboard.traffic.avgLatency')}</p>
              <p className="text-lg font-semibold text-white">{t('dashboard.traffic.ms', { count: stats.avgLatency })}</p>
            </div>
            <div>
              <p className="text-xs text-ink-400">{t('dashboard.traffic.uptime')}</p>
              <p className="text-lg font-semibold text-success-400">{t('dashboard.traffic.days', { count: stats.uptimeDays })}</p>
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
        {/* Alert trend */}
        <Panel className="p-5 animate-fade-in">
          <SectionHeader title={t('dashboard.alerts.title')} subtitle={t('dashboard.alerts.subtitle')} icon={<AlertTriangle size={18} />} />
          <Sparkline data={alertTrend} height={120} color="#f59e0b" />
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{stats.openAlerts}</p>
              <p className="text-xs text-ink-400">{t('dashboard.alerts.openAlerts')}</p>
            </div>
            <Badge variant="warning">{t('dashboard.alerts.critical', { count: 3 })}</Badge>
          </div>
        </Panel>

        {/* Top sites */}
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
          </div>
        </Panel>
      </div>

      {/* Third row: recent devices + safety + protocols */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel className="p-5 animate-fade-in">
          <SectionHeader title={t('dashboard.recentDevices.title')} icon={<Cpu size={18} />} />
          <div className="space-y-3">
            {devices.slice(0, 5).map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-lg border border-ink-700/50 bg-ink-900/40 px-3 py-2.5 transition-colors hover:border-ink-600">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-100">{d.name}</p>
                  <p className="text-xs text-ink-400">{d.id} · {d.protocol}</p>
                </div>
                <StatusDot status={d.status} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-5 animate-fade-in">
          <SectionHeader title={t('dashboard.safetyRules.title')} icon={<ShieldAlert size={18} />} />
          <div className="space-y-3">
            {safetyRules.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-ink-700/50 bg-ink-900/40 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-100">{r.name}</p>
                  <p className="text-xs text-ink-400">{t('dashboard.safetyRules.triggered', { scope: r.scope, count: r.triggered })}</p>
                </div>
                <Badge variant={r.severity === 'critical' ? 'danger' : r.severity === 'high' ? 'warning' : 'neutral'}>
                  {r.severity}
                </Badge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-5 animate-fade-in">
          <SectionHeader title={t('dashboard.protocols.title')} icon={<Radio size={18} />} />
          <div className="space-y-3">
            {protocols.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-ink-700/50 bg-ink-900/40 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-100">{p.type}</p>
                  <p className="text-xs text-ink-400">{t('dashboard.protocols.devicesAndLatency', { count: p.devices.toLocaleString(), latency: p.latency })}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-400 tabular-nums">{p.uptime}%</span>
                  <StatusDot status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Gateway strip */}
      <Panel className="p-5 animate-fade-in">
        <SectionHeader
          title={t('dashboard.gateway.title')}
          subtitle={t('dashboard.gateway.subtitle')}
          icon={<Network size={18} />}
          action={<Badge variant="brand">{t('dashboard.gateway.onlineBadge', { online: gateways.filter(g => g.mode === 'online').length, total: gateways.length })}</Badge>}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {gateways.map((g) => (
            <div key={g.id} className="rounded-xl border border-ink-700/50 bg-ink-900/40 p-4 transition-all hover:border-ink-600">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink-100">{g.name}</span>
                <StatusDot status={g.mode === 'online' ? 'online' : g.mode === 'degraded' ? 'warning' : 'offline'} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-ink-400">{t('dashboard.gateway.cpu')}</p>
                  <p className="text-sm font-semibold text-white tabular-nums">{g.cpu}%</p>
                </div>
                <div>
                  <p className="text-xs text-ink-400">{t('dashboard.gateway.mem')}</p>
                  <p className="text-sm font-semibold text-white tabular-nums">{g.memory}%</p>
                </div>
                <div>
                  <p className="text-xs text-ink-400">{t('dashboard.gateway.devices')}</p>
                  <p className="text-sm font-semibold text-white tabular-nums">{g.devices}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-ink-400">
                <span>{g.ip}</span>
                <span>{g.lastSync}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
