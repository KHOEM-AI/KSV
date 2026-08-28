import { Network, Cpu, MemoryStick, Wifi, WifiOff, RefreshCw, Globe } from 'lucide-react';
import { Panel, SectionHeader, Badge, StatusDot, ProgressBar } from '@/components/ui';
import { gateways } from '@/data/domain';

export function GatewayView() {
  const online = gateways.filter((g) => g.mode === 'online').length;
  const degraded = gateways.filter((g) => g.mode === 'degraded').length;
  const offline = gateways.filter((g) => g.mode === 'offline').length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-500/10 text-success-400"><Wifi size={20} /></div>
            <div><p className="text-2xl font-bold text-white">{online}</p><p className="text-xs text-ink-400">Online</p></div>
          </div>
        </Panel>
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-500/10 text-warning-400"><RefreshCw size={20} /></div>
            <div><p className="text-2xl font-bold text-white">{degraded}</p><p className="text-xs text-ink-400">Degraded</p></div>
          </div>
        </Panel>
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-700 text-ink-400"><WifiOff size={20} /></div>
            <div><p className="text-2xl font-bold text-white">{offline}</p><p className="text-xs text-ink-400">Offline</p></div>
          </div>
        </Panel>
      </div>

      {/* Gateway cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {gateways.map((g) => (
          <Panel key={g.id} hover className="p-5 animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
                  <Network size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{g.name}</h3>
                  <p className="text-xs text-ink-400">{g.ip}</p>
                </div>
              </div>
              <StatusDot status={g.mode === 'online' ? 'online' : g.mode === 'degraded' ? 'warning' : 'offline'} />
            </div>

            <div className="space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-ink-400"><Cpu size={12} /> CPU</span>
                  <span className="text-white tabular-nums">{g.cpu}%</span>
                </div>
                <ProgressBar value={g.cpu} size="sm" color={g.cpu > 75 ? 'danger' : g.cpu > 50 ? 'warning' : 'success'} />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-ink-400"><MemoryStick size={12} /> Memory</span>
                  <span className="text-white tabular-nums">{g.memory}%</span>
                </div>
                <ProgressBar value={g.memory} size="sm" color={g.memory > 75 ? 'danger' : g.memory > 50 ? 'warning' : 'success'} />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-ink-700/50 pt-3 text-xs">
              <div>
                <p className="text-ink-400">Firmware</p>
                <p className="font-mono text-ink-200">v{g.firmware}</p>
              </div>
              <div>
                <p className="text-ink-400">Devices</p>
                <p className="text-right font-semibold text-white tabular-nums">{g.devices}</p>
              </div>
              <div>
                <p className="text-ink-400">Last sync</p>
                <p className="text-right text-ink-200">{g.lastSync}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Badge variant={g.mode === 'offline' ? 'warning' : 'success'}>
                {g.mode === 'offline' ? <><Globe size={10} /> Offline mode</> : <><Wifi size={10} /> Connected</>}
              </Badge>
              {g.mode === 'degraded' && <Badge variant="warning">Reconnecting</Badge>}
            </div>
          </Panel>
        ))}
      </div>

      {/* Discovery */}
      <Panel className="p-5 animate-fade-in">
        <SectionHeader title="Local Network Discovery" subtitle="mDNS / UDP broadcast scan for edge devices" icon={<Globe size={18} />} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { ip: '10.20.1.4', name: 'Frankfurt Edge Controller', proto: 'MQTT', port: 8883 },
            { ip: '10.20.1.55', name: 'Badge Reader B2-A', proto: 'Zigbee', port: 5683 },
            { ip: '10.30.2.4', name: 'Singapore Edge Controller', proto: 'MQTT', port: 8883 },
            { ip: '10.30.2.18', name: 'Air Sensor Rooftop', proto: 'BLE', port: 0 },
          ].map((d) => (
            <div key={d.ip} className="rounded-lg border border-ink-700/50 bg-ink-900/40 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-ink-300">{d.ip}</span>
                <StatusDot status="online" />
              </div>
              <p className="mt-1 text-sm text-ink-100">{d.name}</p>
              <p className="text-xs text-ink-400">{d.proto}{d.port > 0 && `:${d.port}`}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
