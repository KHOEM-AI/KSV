import { useState, useEffect } from 'react';
import { Settings2, Bell, Shield, Globe, Database, Save } from 'lucide-react';
import { Panel, SectionHeader, Toggle, Badge } from '@/components/ui';
import { useLanguage } from '@/i18n/LanguageContext';
import { getSettings, updateSettings, type KSVSettings } from '@/lib/api';

type ToggleKey = 'autoUpdate' | 'offlineMode' | 'auditLog' | 'twoFactor' | 'zeroPlaintext' | 'safetyOverride' | 'emailAlerts' | 'smsAlerts';

export function SettingsView() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<KSVSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings()
      .then((res) => setSettings(res.settings))
      .catch((err) => setError(err.message || t('view.settings.loadFailed')))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key: ToggleKey) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: !settings[key] });
    setSaved(false);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setError(null);
    try {
      const res = await updateSettings(settings);
      setSettings(res.settings);
      setSaved(true);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-5 text-sm text-ink-400">Loading settings...</div>;
  }

  if (!settings) {
    return <div className="p-5 text-sm text-red-400">{error || t('view.settings.loadFailed')}</div>;
  }

  const platformSettings: { key: ToggleKey; label: string; desc: string }[] = [
    { key: 'autoUpdate', label: t('view.settings.autoUpdate.label'), desc: t('view.settings.autoUpdate.desc') },
    { key: 'offlineMode', label: t('view.settings.offlineMode.label'), desc: t('view.settings.offlineMode.desc') },
    { key: 'auditLog', label: t('view.settings.auditLog.label'), desc: t('view.settings.auditLog.desc') },
  ];

  const securitySettings: { key: ToggleKey; label: string; desc: string }[] = [
    { key: 'twoFactor', label: t('view.settings.twoFactor.label'), desc: t('view.settings.twoFactor.desc') },
    { key: 'zeroPlaintext', label: t('view.settings.zeroPlaintext.label'), desc: t('view.settings.zeroPlaintext.desc') },
    { key: 'safetyOverride', label: t('view.settings.safetyOverride.label'), desc: t('view.settings.safetyOverride.desc') },
  ];

  const notificationSettings: { key: ToggleKey; label: string; desc: string }[] = [
    { key: 'emailAlerts', label: t('view.settings.emailAlerts.label'), desc: t('view.settings.emailAlerts.desc') },
    { key: 'smsAlerts', label: t('view.settings.smsAlerts.label'), desc: t('view.settings.smsAlerts.desc') },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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

        <Panel className="p-5 animate-fade-in">
          <SectionHeader title={t('view.settings.localization.title')} subtitle={t('view.settings.localization.subtitle')} icon={<Globe size={18} />} />
          <div className="space-y-4">
            <div className="rounded-xl border border-ink-700/50 bg-ink-900/40 p-3">
              <label className="label">{t('view.settings.defaultLanguage')}</label>
              <select
                className="input"
                value={settings.defaultLanguage}
                onChange={(e) => { setSettings({ ...settings, defaultLanguage: e.target.value }); setSaved(false); }}
              >
                <option value="en-US">English (en-US)</option>
                <option value="de-DE">Deutsch (de-DE)</option>
                <option value="ja-JP">\u65e5\u672c\u8a9e (ja-JP)</option>
                <option value="ko-KR">\ud55c\uad6d\uc5b4 (ko-KR)</option>
                <option value="zh-CN">\u4e2d\u6587 (zh-CN)</option>
                <option value="ar-AE">\u0627\u0644\u0639\u0631\u0628\u064a\u0629 (ar-AE)</option>
              </select>
            </div>
            <div className="rounded-xl border border-ink-700/50 bg-ink-900/40 p-3">
              <label className="label">{t('view.settings.defaultTimezone')}</label>
              <select
                className="input"
                value={settings.defaultTimezone}
                onChange={(e) => { setSettings({ ...settings, defaultTimezone: e.target.value }); setSaved(false); }}
              >
                <option value="Auto">{t('view.settings.timezoneAuto')}</option>
                <option value="Europe/Berlin">Europe/Berlin (+02:00)</option>
                <option value="Asia/Singapore">Asia/Singapore (+08:00)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (+09:00)</option>
                <option value="America/New_York">America/New_York (-04:00)</option>
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

      <div className="flex items-center justify-between rounded-2xl border border-ink-700 bg-ink-850/80 p-4">
        <p className="text-sm text-ink-400">
          {error ? <span className="text-red-400">{error}</span> : saved ? 'Saved.' : t('view.settings.saveBar.note')}
        </p>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? 'Saving...' : t('view.settings.saveBar.save')}
        </button>
      </div>
    </div>
  );
}
