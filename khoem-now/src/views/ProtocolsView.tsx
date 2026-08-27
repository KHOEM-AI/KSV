import { Radio, Lock, Zap } from 'lucide-react';
import { Panel, SectionHeader, Badge, StatusDot, ProgressBar } from '@/components/ui';
import { protocols, capabilityRegistry } from '@/data/domain';

export function ProtocolsView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Protocol adapters */}
        <div className="lg:col-span-2 space-y-4">
          <Panel className="p-5 animate-fade-in">
            <SectionHeader
              title="Protocol Abstraction Layer"
              subtitle="Unified adapter interface across all transport protocols"
              icon={<Radio size={18} />}
            />
            <div className="space-y-3">
              {protocols.map((p) => (
                <div key={p.id} className="rounded-xl border border-ink-700/60 bg-ink-900/40 p-4 transition-all hover:border-ink-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
                        <Radio size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                        <p className="text-xs text-ink-400">{p.id} · {p.encryption}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={p.status === 'active' ? 'success' : 'warning'}>{p.status}</Badge>
                      <StatusDot status={p.status} />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div>
                      <div className="mb-1 flex justify-between text-xs"><span className="text-ink-400">Devices</span><span className="text-white tabular-nums">{p.devices.toLocaleString()}</span></div>
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-xs"><span className="text-ink-400">Latency</span><span className="text-white tabular-nums">{p.latency} ms</span></div>
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-xs"><span className="text-ink-400">Uptime</span><span className="text-white tabular-nums">{p.uptime}%</span></div>
                      <ProgressBar value={p.uptime} size="sm" color={p.uptime > 99.5 ? 'success' : 'warning'} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Side: encryption + capability registry */}
        <div className="space-y-4">
          <Panel className="p-5 animate-fade-in">
            <SectionHeader title="Encryption Standards" icon={<Lock size={18} />} />
            <div className="space-y-3">
              {[
                { standard: 'TLS 1.3', coverage: 100, devices: 3987 },
                { standard: 'WPA3-Enterprise', coverage: 100, devices: 4210 },
                { standard: 'AES-CCM (BLE)', coverage: 98, devices: 1842 },
                { standard: 'AES-128 (Zigbee)', coverage: 100, devices: 2196 },
              ].map((e) => (
                <div key={e.standard}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-ink-200">{e.standard}</span>
                    <span className="text-xs text-ink-400 tabular-nums">{e.devices.toLocaleString()} dev</span>
                  </div>
                  <ProgressBar value={e.coverage} size="sm" color="success" />
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-5 animate-fade-in">
            <SectionHeader title="Capability Registry" icon={<Zap size={18} />} />
            <div className="space-y-2">
              {capabilityRegistry.slice(0, 6).map((c) => (
                <div key={c.name} className="flex items-center justify-between rounded-lg border border-ink-700/50 bg-ink-900/40 px-3 py-2 text-sm">
                  <span className="text-ink-200">{c.name}</span>
                  <span className="text-xs text-ink-400 tabular-nums">{c.devices.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
