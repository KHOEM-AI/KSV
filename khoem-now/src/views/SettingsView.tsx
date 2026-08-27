import { useState } from 'react';
import { Settings2, Bell, Shield, Globe, Palette, Database, Save } from 'lucide-react';
import { Panel, SectionHeader, Toggle, Badge } from '@/components/ui';

export function SettingsView() {
  const [settings, setSettings] = useState({
    autoUpdate: true,
    offlineMode: true,
    safetyOverride: false,
    auditLog: true,
    emailAlerts: true,
    smsAlerts: false,
    twoFactor: true,
    zeroPlaintext: true,
  });

  const toggle = (key: keyof typeof settings) => setSettings((s) => ({ ...s, [key]: !s[key] }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* General */}
        <Panel className="p-5 animate-fade-in">
          <SectionHeader title="Platform" subtitle="Core platform behavior" icon={<Settings2 size={18} />} />
          <div className="space-y-4">
            {[
              { key: 'autoUpdate' as const, label: 'Automatic firmware updates', desc: 'Push OTA updates to eligible devices' },
              { key: 'offlineMode' as const, label: 'Edge offline mode', desc: 'Allow gateways to operate without cloud' },
              { key: 'auditLog' as const, label: 'Immutable audit logging', desc: 'Cryptographically chain all events' },
            ].map((s) => (
              <div key={s.key} className="flex items-center justify-between rounded-xl border border-ink-700/50 bg-ink-900/40 p-3">
                <div><p className="text-sm font-medium text-ink-100">{s.label}</p><p className="text-xs text-ink-400">{s.desc}</p></div>
                <Toggle checked={settings[s.key]} onChange={() => toggle(s.key)} />
              </div>
            ))}
          </div>
        </Panel>

        {/* Security */}
        <Panel className="p-5 animate-fade-in">
          <SectionHeader title="Security" subtitle="Authentication and access policies" icon={<Shield size={18} />} />
          <div className="space-y-4">
            {[
              { key: 'twoFactor' as const, label: 'Require 2FA for all admins', desc: 'Enforce MFA on admin and operator roles' },
              { key: 'zeroPlaintext' as const, label: 'Zero-plaintext password policy', desc: 'Argon2id hashing, no plaintext storage' },
              { key: 'safetyOverride' as const, label: 'Allow safety rule override', desc: 'Let engineers temporarily disable rules' },
            ].map((s) => (
              <div key={s.key} className="flex items-center justify-between rounded-xl border border-ink-700/50 bg-ink-900/40 p-3">
                <div><p className="text-sm font-medium text-ink-100">{s.label}</p><p className="text-xs text-ink-400">{s.desc}</p></div>
                <Toggle checked={settings[s.key]} onChange={() => toggle(s.key)} />
              </div>
            ))}
          </div>
        </Panel>

        {/* Notifications */}
        <Panel className="p-5 animate-fade-in">
          <SectionHeader title="Notifications" subtitle="Alert delivery channels" icon={<Bell size={18} />} />
          <div className="space-y-4">
            {[
              { key: 'emailAlerts' as const, label: 'Email alerts', desc: 'Send critical alerts to admin emails' },
              { key: 'smsAlerts' as const, label: 'SMS alerts', desc: 'Send critical alerts via SMS gateway' },
            ].map((s) => (
              <div key={s.key} className="flex items-center justify-between rounded-xl border border-ink-700/50 bg-ink-900/40 p-3">
                <div><p className="text-sm font-medium text-ink-100">{s.label}</p><p className="text-xs text-ink-400">{s.desc}</p></div>
                <Toggle checked={settings[s.key]} onChange={() => toggle(s.key)} />
              </div>
            ))}
          </div>
        </Panel>

        {/* International + DB */}
        <Panel className="p-5 animate-fade-in">
          <SectionHeader title="Localization & Data" subtitle="Language and storage preferences" icon={<Globe size={18} />} />
          <div className="space-y-4">
            <div className="rounded-xl border border-ink-700/50 bg-ink-900/40 p-3">
              <label className="label">Default language</label>
              <select className="input">
                <option>English (en-US)</option>
                <option>Deutsch (de-DE)</option>
                <option>日本語 (ja-JP)</option>
                <option>한국어 (ko-KR)</option>
                <option>中文 (zh-CN)</option>
                <option>العربية (ar-AE)</option>
              </select>
            </div>
            <div className="rounded-xl border border-ink-700/50 bg-ink-900/40 p-3">
              <label className="label">Default timezone</label>
              <select className="input">
                <option>Auto (detect from browser)</option>
                <option>Europe/Berlin (+02:00)</option>
                <option>Asia/Singapore (+08:00)</option>
                <option>Asia/Tokyo (+09:00)</option>
                <option>America/New_York (-04:00)</option>
              </select>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-ink-700/50 bg-ink-900/40 p-3">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-ink-400" />
                <span className="text-sm text-ink-100">Database backup</span>
              </div>
              <Badge variant="success">Auto · 6h interval</Badge>
            </div>
          </div>
        </Panel>
      </div>

      {/* Save bar */}
      <div className="flex items-center justify-between rounded-2xl border border-ink-700 bg-ink-850/80 p-4">
        <p className="text-sm text-ink-400">Changes apply across all sites and gateways.</p>
        <button className="btn-primary"><Save size={16} /> Save changes</button>
      </div>
    </div>
  );
}
