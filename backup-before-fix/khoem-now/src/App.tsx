import { useState } from 'react';
import { Menu, X, Search, Bell, ChevronDown, Shield } from 'lucide-react';
import { navGroups, viewMeta, type ViewId } from '@/components/nav';
import { stats } from '@/data/domain';
import { DashboardView } from '@/views/DashboardView';
import { DevicesView } from '@/views/DevicesView';
import { ControlsView } from '@/views/ControlsView';
import { ProtocolsView } from '@/views/ProtocolsView';
import { GatewayView } from '@/views/GatewayView';
import { SecurityView } from '@/views/SecurityView';
import { SafetyView } from '@/views/SafetyView';
import { AuditView } from '@/views/AuditView';
import { OrganizationView } from '@/views/OrganizationView';
import { InternationalView } from '@/views/InternationalView';
import { CertificatesView } from '@/views/CertificatesView';
import { SettingsView } from '@/views/SettingsView';

const views: Record<ViewId, () => JSX.Element> = {
  dashboard: DashboardView,
  devices: DevicesView,
  controls: ControlsView,
  protocols: ProtocolsView,
  gateway: GatewayView,
  security: SecurityView,
  safety: SafetyView,
  audit: AuditView,
  organization: OrganizationView,
  international: InternationalView,
  certificates: CertificatesView,
  settings: SettingsView,
};

export default function App() {
  const [active, setActive] = useState<ViewId>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  const ActiveView = views[active];
  const meta = viewMeta[active];

  return (
    <div className="min-h-screen bg-ink-950">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-ink-700/70 bg-ink-900/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-ink-700/70 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 shadow-glow-sm">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">KSV Universal</h1>
              <p className="text-[10px] text-ink-400 uppercase tracking-wider">Secure Control Platform</p>
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="text-ink-400 hover:text-white lg:hidden">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-ink-500">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActive(item.id); setMobileOpen(false); }}
                    className={`nav-item w-full text-left ${active === item.id ? 'nav-item-active' : ''}`}
                  >
                    <span className={active === item.id ? 'text-brand-400' : ''}>{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-danger-500/20 px-1.5 py-0.5 text-[10px] font-bold text-danger-400">{item.badge}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer status */}
        <div className="border-t border-ink-700/70 p-4">
          <div className="rounded-xl border border-ink-700/50 bg-ink-850/60 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-400">System status</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-success-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-success-500 opacity-75 animate-pulse-ring" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success-500" />
                </span>
                Operational
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-ink-400">
              <span>{stats.onlineDevices.toLocaleString()} devices online</span>
              <span>{stats.uptimeDays}d uptime</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-ink-700/70 bg-ink-950/80 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileOpen(true)} className="text-ink-400 hover:text-white lg:hidden">
                <Menu size={22} />
              </button>
              <div>
                <h2 className="text-base font-semibold text-white">{meta.title}</h2>
                <p className="hidden text-xs text-ink-400 sm:block">{meta.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  className="w-56 rounded-xl border border-ink-700 bg-ink-850/60 py-2 pl-9 pr-3 text-sm text-ink-100 placeholder:text-ink-400 transition-all focus:w-72 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="Search…"
                />
              </div>

              {/* Notifications */}
              <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-ink-700 bg-ink-850/60 text-ink-400 transition-colors hover:text-white">
                <Bell size={17} />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger-500 text-[9px] font-bold text-white">{stats.openAlerts}</span>
              </button>

              {/* User */}
              <button className="flex items-center gap-2 rounded-xl border border-ink-700 bg-ink-850/60 py-1.5 pl-1.5 pr-2 transition-colors hover:border-ink-600">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-xs font-bold text-white">CS</div>
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-semibold text-white">Carlos Silva</p>
                  <p className="text-[10px] text-ink-400">Org Owner</p>
                </div>
                <ChevronDown size={14} className="text-ink-400" />
              </button>
            </div>
          </div>
        </header>

        {/* View content */}
        <main className="bg-grid min-h-[calc(100vh-61px)] p-4 sm:p-6">
          <div key={active} className="animate-fade-in">
            <ActiveView />
          </div>
        </main>
      </div>
    </div>
  );
}
