// src/views/ProtocolsView.tsx
import { useState, useEffect } from 'react';
import { Radio, Lock, Zap } from 'lucide-react';
import { Panel, SectionHeader, Badge, StatusDot } from '@/components/ui';
import { capabilityRegistry } from '@/data/domain';
import { listProtocolAdapters } from '@/lib/api';
import type { ProtocolAdapter } from '../../API/protocol';
import { useLanguage } from '@/i18n/LanguageContext';

// Protocol status codes → translation keys (badge text)
const statusKey: Record<string, string> = {
  active: 'view.protocols.status.active',
  inactive: 'view.protocols.status.offline',
  error: 'view.protocols.status.degraded',
  updating: 'view.protocols.status.degraded',
};

export function ProtocolsView() {
  const { t } = useLanguage();
  const [adapters, setAdapters] = useState<ProtocolAdapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listProtocolAdapters()
      .then((res) => setAdapters(res.adapters ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load adapters'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Protocol adapters */}
        <div className="lg:col-span-2 space-y-4">
          <Panel className="p-5 animate-fade-in">
            <SectionHeader
              title={t('view.protocols.abstractionTitle')}
              subtitle={t('view.protocols.abstractionSubtitle')}
              icon={<Radio size={18} />}
            />

            {loading && <div className="py-12 text-center text-ink-400">Loading adapters…</div>}
            {error && <div className="py-12 text-center text-red-400">Error: {error}</div>}

            {!loading && !error && (
              <div className="space-y-3">
                {adapters.map((p) => (
                  <div key={p.adapterId} className="rounded-xl border border-ink-700/60 bg-ink-900/40 p-4 transition-all hover:border-ink-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
                          <Radio size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                          <p className="text-xs text-ink-400">{p.protocol} · v{p.version}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={p.status === 'active' ? 'success' : 'warning'}>
                          {statusKey[p.status] ? t(statusKey[p.status]) : p.status}
                        </Badge>
                        <StatusDot status={p.status} />
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-ink-400">{t('dashboard.gateway.devices')}</span>
                          <span className="text-white tabular-nums">{p.currentDeviceCount.toLocaleString()}</span>
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-ink-400">{t('view.protocols.encryptionTitle')}</span>
                          <span className="text-white">{p.isSecureChannel ? 'Secure' : 'Open'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {adapters.length === 0 && (
                  <div className="py-8 text-center text-ink-400">No adapters found.</div>
                )}
              </div>
            )}
          </Panel>
        </div>

        {/* Side: capability registry */}
        <div className="space-y-4">
          <Panel className="p-5 animate-fade-in">
            <SectionHeader title={t('view.protocols.encryptionTitle')} icon={<Lock size={18} />} />
            <div className="py-4 text-center text-xs text-ink-400">
              Encryption data is derived from live adapter status.
            </div>
          </Panel>

          <Panel className="p-5 animate-fade-in">
            <SectionHeader title={t('view.protocols.capabilityRegistryTitle')} icon={<Zap size={18} />} />
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
