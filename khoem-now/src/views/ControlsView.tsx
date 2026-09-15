// src/views/ControlsView.tsx
import { useState, useEffect, useCallback } from 'react';
import {
  Lock, Unlock, Thermometer, Power, Settings2, Eye, EyeOff,
  RotateCcw, Snowflake, Wind, Gauge, Activity, ToggleLeft,
} from 'lucide-react';
import { Panel, SectionHeader, Toggle, Badge, ProgressBar, StatusDot } from '@/components/ui';
import { devices } from '@/data/domain';
import { useLanguage } from '@/i18n/LanguageContext';
import { dispatchCommand, listRecentCommands, type RecentCommandEntry } from '@/lib/api';

interface ControlState {
  [key: string]: { on: boolean; value?: number };
}

// Maps each UI control key to the real device it commands, so every
// toggle/slider dispatches a real, audited command instead of only
// flipping local state.
const DEVICE_IDS: Record<string, string> = {
  'vault-lock': 'DEV-04821',
  'hvac-temp': 'DEV-04822',
  'press-estop': 'DEV-04823',
  'robot-speed': 'DEV-04828',
  'east-barrier': 'DEV-04826',
  'cold-storage': 'DEV-04830',
};

export function ControlsView() {
  const { t } = useLanguage();
  const [controls, setControls] = useState<ControlState>({
    'vault-lock': { on: false },
    'hvac-temp': { on: true, value: 21 },
    'press-estop': { on: false },
    'robot-speed': { on: true, value: 45 },
    'east-barrier': { on: false },
    'cold-storage': { on: true, value: -22 },
  });

  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [recentCommands, setRecentCommands] = useState<RecentCommandEntry[]>([]);
  const [logLoading, setLogLoading] = useState(true);
  const [logError, setLogError] = useState('');

  const loadRecentCommands = useCallback(async () => {
    setLogLoading(true);
    setLogError('');
    try {
      const { commands } = await listRecentCommands(10);
      setRecentCommands(commands);
    } catch (err) {
      console.error('Failed to load recent commands:', err);
      setLogError(t('view.controls.logLoadFailed'));
    } finally {
      setLogLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadRecentCommands();
  }, [loadRecentCommands]);

  // Fires a real command, flips local UI state only on success, and
  // refreshes the activity feed so the log reflects what actually happened
  // — never fabricated from the click alone.
  const sendCommand = async (key: string, type: string, payload?: Record<string, unknown>) => {
    setPending((p) => ({ ...p, [key]: true }));
    setErrors((e) => ({ ...e, [key]: '' }));
    try {
      await dispatchCommand({ deviceId: DEVICE_IDS[key], type, payload });
      return true;
    } catch (err) {
      console.error(`Failed to send ${type} to ${key}:`, err);
      const message = err instanceof Error ? err.message : String(err);
      setErrors((e) => ({ ...e, [key]: message }));
      return false;
    } finally {
      setPending((p) => ({ ...p, [key]: false }));
      loadRecentCommands();
    }
  };

  const toggle = async (key: string) => {
    const nextOn = !controls[key].on;
    let type: string;
    if (key === 'vault-lock') type = nextOn ? 'LOCK' : 'UNLOCK';
    else if (key === 'press-estop') type = nextOn ? 'ESTOP_ENGAGE' : 'RESET';
    else if (key === 'east-barrier') type = nextOn ? 'OPEN' : 'CLOSE';
    else type = nextOn ? 'POWER_ON' : 'POWER_OFF';

    const ok = await sendCommand(key, type);
    if (ok) setControls((c) => ({ ...c, [key]: { ...c[key], on: nextOn } }));
  };

  // Sliders update local state immediately for a responsive feel, but only
  // dispatch the command once the user releases — not on every tick.
  const setValue = (key: string, value: number) => setControls((c) => ({ ...c, [key]: { ...c[key], value } }));

  const commitValue = async (key: string, commandType: string) => {
    const value = controls[key].value;
    await sendCommand(key, commandType, { value });
  };

  return (
    <div className="space-y-6">
      {/* Control panels */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Vault Door */}
        <Panel className="p-5 animate-fade-in">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
                {controls['vault-lock'].on ? <Lock size={20} /> : <Unlock size={20} />}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{t('view.controls.vaultDoor.name')}</h3>
                <p className="text-xs text-ink-400">DEV-04821 · {t('view.controls.vaultDoor.site')}</p>
              </div>
            </div>
            <StatusDot status="online" />
          </div>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className={`flex h-28 w-28 items-center justify-center rounded-full border-2 transition-all duration-500 ${
              controls['vault-lock'].on ? 'border-success-500/40 bg-success-500/10' : 'border-danger-500/40 bg-danger-500/10'
            }`}>
              {controls['vault-lock'].on
                ? <Lock size={40} className="text-success-400" />
                : <Unlock size={40} className="text-danger-400" />}
            </div>
            <p className={`text-sm font-semibold ${controls['vault-lock'].on ? 'text-success-400' : 'text-danger-400'}`}>
              {controls['vault-lock'].on ? t('view.controls.secured') : t('view.controls.unlocked')}
            </p>
          </div>
          <button
            onClick={() => toggle('vault-lock')}
            
            className={`btn w-full disabled:opacity-50 ${controls['vault-lock'].on ? 'btn-danger' : 'btn-primary'}`}
          >
            {controls['vault-lock'].on ? <Unlock size={16} /> : <Lock size={16} />}
            {controls['vault-lock'].on ? t('view.controls.unlock') : t('view.controls.lock')}
          </button>
          {errors['vault-lock'] && <p className="mt-2 text-xs text-danger-400">{errors['vault-lock']}</p>}
        </Panel>

        {/* HVAC */}
        <Panel className="p-5 animate-fade-in">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/10 text-accent-400">
                <Thermometer size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{t('view.controls.hvac.name')}</h3>
                <p className="text-xs text-ink-400">DEV-04822 · {t('view.controls.hvac.site')}</p>
              </div>
            </div>
            <Toggle checked={controls['hvac-temp'].on} onChange={() => toggle('hvac-temp')}  />
          </div>
          <div className="py-4">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-xs text-ink-400">{t('view.controls.setpoint')}</span>
              <span className="text-2xl font-bold text-white tabular-nums">{controls['hvac-temp'].value}°C</span>
            </div>
            <input
              type="range" min={16} max={30} step={0.5}
              value={controls['hvac-temp'].value}
              onChange={(e) => setValue('hvac-temp', parseFloat(e.target.value))}
              onMouseUp={() => commitValue('hvac-temp', 'SETPOINT')}
              onTouchEnd={() => commitValue('hvac-temp', 'SETPOINT')}
              disabled={!controls['hvac-temp'].on || pending['hvac-temp']}
              className="w-full accent-accent-500"
            />
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-ink-900/50 p-2">
                <Wind size={14} className="mx-auto text-ink-400" />
                <p className="mt-1 text-xs text-ink-400">{t('view.controls.fan')}</p>
                <p className="text-sm font-semibold text-white">72%</p>
              </div>
              <div className="rounded-lg bg-ink-900/50 p-2">
                <Snowflake size={14} className="mx-auto text-ink-400" />
                <p className="mt-1 text-xs text-ink-400">{t('view.controls.mode')}</p>
                <p className="text-sm font-semibold text-white">{t('view.controls.cool')}</p>
              </div>
              <div className="rounded-lg bg-ink-900/50 p-2">
                <Activity size={14} className="mx-auto text-ink-400" />
                <p className="mt-1 text-xs text-ink-400">{t('view.controls.filter')}</p>
                <p className="text-sm font-semibold text-warning-400">86%</p>
              </div>
            </div>
            {errors['hvac-temp'] && <p className="mt-2 text-xs text-danger-400">{errors['hvac-temp']}</p>}
          </div>
        </Panel>

        {/* Press E-Stop */}
        <Panel className="p-5 animate-fade-in">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger-500/10 text-danger-400">
                <Power size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{t('view.controls.pressEstop.name')}</h3>
                <p className="text-xs text-ink-400">DEV-04823 · {t('view.controls.pressEstop.site')}</p>
              </div>
            </div>
            <StatusDot status="online" />
          </div>
          <div className="flex flex-col items-center gap-4 py-4">
            <button
              onClick={() => toggle('press-estop')}
              
              className={`flex h-28 w-28 items-center justify-center rounded-full border-4 font-bold transition-all duration-300 active:scale-95 disabled:opacity-50 ${
                controls['press-estop'].on
                  ? 'border-danger-500 bg-danger-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)]'
                  : 'border-danger-500/30 bg-danger-500/10 text-danger-400 hover:border-danger-500/60'
              }`}
            >
              <div className="text-center">
                <Power size={32} className="mx-auto" />
                <span className="mt-1 block text-xs">{t('view.controls.estop')}</span>
              </div>
            </button>
            <p className={`text-sm font-semibold ${controls['press-estop'].on ? 'text-danger-400' : 'text-ink-400'}`}>
              {controls['press-estop'].on ? t('view.controls.lineHalted') : t('view.controls.pressOperational')}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => toggle('press-estop')}  className="btn-ghost flex-1 text-xs disabled:opacity-50">
              <RotateCcw size={14} /> {t('view.controls.reset')}
            </button>
          </div>
          {errors['press-estop'] && <p className="mt-2 text-xs text-danger-400">{errors['press-estop']}</p>}
        </Panel>

        {/* Robot speed */}
        <Panel className="p-5 animate-fade-in">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-500/10 text-warning-400">
                <Gauge size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{t('view.controls.robotArm.name')}</h3>
                <p className="text-xs text-ink-400">DEV-04828 · {t('view.controls.robotArm.site')}</p>
              </div>
            </div>
            <Toggle checked={controls['robot-speed'].on} onChange={() => toggle('robot-speed')}  />
          </div>
          <div className="py-4">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-xs text-ink-400">{t('view.controls.speedLimit')}</span>
              <span className="text-2xl font-bold text-white tabular-nums">{controls['robot-speed'].value}%</span>
            </div>
            <input
              type="range" min={0} max={100} step={5}
              value={controls['robot-speed'].value}
              onChange={(e) => setValue('robot-speed', parseInt(e.target.value))}
              onMouseUp={() => commitValue('robot-speed', 'SPEED_LIMIT')}
              onTouchEnd={() => commitValue('robot-speed', 'SPEED_LIMIT')}
              disabled={!controls['robot-speed'].on || pending['robot-speed']}
              className="w-full accent-warning-500"
            />
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-400">{t('view.controls.humanZoneOverride')}</span>
                <Badge variant="warning">{t('view.controls.active')}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-400">{t('view.controls.collisionDetection')}</span>
                <Badge variant="success">{t('view.controls.enabled')}</Badge>
              </div>
            </div>
            {errors['robot-speed'] && <p className="mt-2 text-xs text-danger-400">{errors['robot-speed']}</p>}
          </div>
        </Panel>

        {/* East Gate Barrier */}
        <Panel className="p-5 animate-fade-in">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
                {controls['east-barrier'].on ? <Unlock size={20} /> : <Lock size={20} />}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{t('view.controls.eastGate.name')}</h3>
                <p className="text-xs text-ink-400">DEV-04826 · {t('view.controls.eastGate.site')}</p>
              </div>
            </div>
            <Badge variant="brand">{t('view.controls.maintenance')}</Badge>
          </div>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className={`flex h-28 w-28 items-center justify-center rounded-2xl border-2 transition-all ${
              controls['east-barrier'].on ? 'border-success-500/40 bg-success-500/10' : 'border-ink-600 bg-ink-800'
            }`}>
              {controls['east-barrier'].on
                ? <Unlock size={40} className="text-success-400" />
                : <Lock size={40} className="text-ink-400" />}
            </div>
            <p className="text-sm font-semibold text-ink-300">{controls['east-barrier'].on ? t('view.controls.barrierOpen') : t('view.controls.barrierClosed')}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => toggle('east-barrier')}  className="btn-ghost flex-1 text-xs disabled:opacity-50">
              {controls['east-barrier'].on ? t('view.controls.close') : t('view.controls.open')}
            </button>
            <button className="btn-ghost text-xs"><Settings2 size={14} /></button>
          </div>
          {errors['east-barrier'] && <p className="mt-2 text-xs text-danger-400">{errors['east-barrier']}</p>}
        </Panel>

        {/* Cold storage */}
        <Panel className="p-5 animate-fade-in">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/10 text-accent-400">
                <Snowflake size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{t('view.controls.coldStorage.name')}</h3>
                <p className="text-xs text-ink-400">DEV-04830 · {t('view.controls.coldStorage.site')}</p>
              </div>
            </div>
            <Toggle checked={controls['cold-storage'].on} onChange={() => toggle('cold-storage')}  />
          </div>
          <div className="py-4">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-xs text-ink-400">{t('view.controls.targetTemp')}</span>
              <span className="text-2xl font-bold text-white tabular-nums">{controls['cold-storage'].value}°C</span>
            </div>
            <input
              type="range" min={-30} max={0} step={1}
              value={controls['cold-storage'].value}
              onChange={(e) => setValue('cold-storage', parseInt(e.target.value))}
              onMouseUp={() => commitValue('cold-storage', 'SETPOINT')}
              onTouchEnd={() => commitValue('cold-storage', 'SETPOINT')}
              disabled={!controls['cold-storage'].on || pending['cold-storage']}
              className="w-full accent-accent-500"
            />
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-xs text-ink-400"><span>{t('view.controls.current')}</span><span>-20°C</span></div>
              <ProgressBar value={67} color="accent" size="sm" />
            </div>
            {errors['cold-storage'] && <p className="mt-2 text-xs text-danger-400">{errors['cold-storage']}</p>}
          </div>
        </Panel>
      </div>

      {/* Active control log — real data from /api/commands/recent */}
      <Panel className="p-5 animate-fade-in">
        <SectionHeader title={t('view.controls.logTitle')} subtitle={t('view.controls.logSubtitle')} icon={<Activity size={18} />} />
        <div className="space-y-2">
          {logLoading && <p className="text-xs text-ink-400">{t('view.controls.logLoading')}</p>}
          {!logLoading && logError && <p className="text-xs text-danger-400">{logError}</p>}
          {!logLoading && !logError && recentCommands.length === 0 && (
            <p className="text-xs text-ink-400">{t('view.controls.logEmpty')}</p>
          )}
          {!logLoading && !logError && recentCommands.map((cmd) => {
            const deviceName = typeof cmd.deviceId === 'object' ? cmd.deviceId.name : cmd.deviceId;
            const userLabel = cmd.userId ? (typeof cmd.userId === 'object' ? cmd.userId.email : cmd.userId) : 'safety-engine';
            const time = new Date(cmd.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            return (
              <div key={cmd._id} className="flex items-center justify-between rounded-lg border border-ink-700/50 bg-ink-900/40 px-3 py-2.5 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-ink-400">{time}</span>
                  <span className="text-ink-200">{deviceName}</span>
                  <Badge variant={cmd.status === 'blocked' ? 'danger' : cmd.status === 'failed' ? 'warning' : 'brand'}>{cmd.type}</Badge>
                </div>
                <span className="text-xs text-ink-400">{userLabel}</span>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
