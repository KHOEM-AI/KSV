import { useState } from 'react';
import { Settings2, Bell, Shield, Globe, Database, Save } from 'lucide-react';
import { Panel, SectionHeader, Toggle, Badge } from '@/components/ui';
import { useLanguage } from '@/i18n/LanguageContext';

export function SettingsView() {
  const { t } = useLanguage();
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

  const platformSettings = [
    { key: 'autoUpdate' as const, label: t('view.settings.autoUpdate.label'), desc: t('view.settings.autoUpdate.desc') },
    { key: 'offlineMode' as const, label: t('view.settings.offlineMode.label'), desc: t('view.settings.offlineMode.desc') },
    { key: 'auditLog' as const, label: t('view.settings.auditLog.label'), desc: t('view.settings.auditLog.desc') },
  ];

  const securitySettings = [
    { key: 'twoFactor' as const, label: t('view.settings.twoFactor.label'), desc: t('view.settings.twoFactor.desc') },
    { key: 'zeroPlaintext' as const, label: t('view.settings.zeroPlaintext.label'), desc: t('view.settings.zeroPlaintext.desc') },
    { key: 'safetyOverride' as const, label: t('view.settings.safetyOverride.label'), desc: t('view.settings.safetyOverride.desc') },
  ];

  const notificationSettings = [
    { key: 'emailAlerts' as const, label: t('view.settings.emailAlerts.label'), desc: t('view.settings.emailAlerts.desc') },
    { key: 'smsAlerts' as const, label: t('view.settings.smsAlerts.label'), desc: t('view.settings.smsAlerts.desc') },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* General */}
        <Panel className="p-5 animate-fade-in">
          <SectionHeader title={t('view.settings.platform.title')} subtitle={t('view.settings.platform.subtitle')} icon={<Settings2 size={18} />} />
          <div className="space-y-4">
            {platformSettings.map((s) => (
              <div key={s.key} className="flex items-center justify-between rounded-xl border border-ink-700/50 bg-ink-900/40 p-3">
                <div><p className="text-sm font-medium text-ink-100">{s.label}</p><p className="text-xs text-ink-400">{s.desc}</p></div>
                <Toggle checked={settings[s.key]} onChange={() => toggle(s.key)} />
              </div>
            ))}
          </div>
        </Panel>

        {/* Security */}
        <Panel className="p-5 animate-fade-in">
          <SectionHeader title={t('view.settings.security.title')} subtitle={t('view.settings.security.subtitle')} icon={<Shield size={18} />} />
          <div className="space-y-4">
            {securitySettings.map((s) => (
              <div key={s.key} className="flex items-center justify-between rounded-xl border border-ink-700/50 bg-ink-900/40 p-3">
                <div><p className="text-sm font-medium text-ink-100">{s.label}</p><p className="text-xs text-ink-400">{s.desc}</p></div>
                <Toggle checked={settings[s.key]} onChange={() => toggle(s.key)} />
              </div>
            ))}
          </div>
        </Panel>

        {/* Notifications */}
        <Panel className="p-5 animate-fade-in">
          <SectionHeader title={t('view.settings.notifications.title')} subtitle={t('view.settings.notifications.subtitle')} icon={<Bell size={18} />} />
          <div className="space-y-4">
            {notificationSettings.map((s) => (
              <div key={s.key} className="flex items-center justify-between rounded-xl border border-ink-700/50 bg-ink-900/40 p-3">
                <div><p className="text-sm font-medium text-ink-100">{s.label}</p><p className="text-xs text-ink-400">{s.desc}</p></div>
                <Toggle checked={settings[s.key]} onChange={() => toggle(s.key)} />
              </div>
            ))}
          </div>
        </Panel>

        {/* International + DB */}
        <Panel className="p-5 animate-fade-in">
          <SectionHeader title={t('view.settings.localization.title')} subtitle={t('view.settings.localization.subtitle')} icon={<Globe size={18} />} />
          <div className="space-y-4">
            <div className="rounded-xl border border-ink-700/50 bg-ink-900/40 p-3">
              <label className="label">{t('view.settings.defaultLanguage')}</label>
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
              <label className="label">{t('view.settings.defaultTimezone')}</label>
              <select className="input">
                <option>{t('view.settings.timezoneAuto')}</option>
                <option>Europe/Berlin (+02:00)</option>
                <option>Asia/Singapore (+08:00)</option>
                <option>Asia/Tokyo (+09:00)</option>
                <option>America/New_York (-04:00)</option>
              </select>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-ink-700/50 bg-ink-900/40 p-3">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-ink-400" />
                <span className="text-sm text-ink-100">{t('view.settings.databaseBackup')}</span>
              </div>
              <Badge variant="success">{t('view.settings.backupInterval', { hours: 6 })}</Badge>
            </div>
          </div>
        </Panel>
      </div>

      {/* Save bar */}
      <div className="flex items-center justify-between rounded-2xl border border-ink-700 bg-ink-850/80 p-4">
        <p className="text-sm text-ink-400">{t('view.settings.saveBar.note')}</p>
        <button className="btn-primary"><Save size={16} /> {t('view.settings.saveBar.save')}</button>
      </div>
    </div>
  );
}
