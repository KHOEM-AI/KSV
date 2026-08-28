// src/views/ControlsView.tsx
import { useState } from 'react';
import {
  Lock, Unlock, Thermometer, Power, Settings2, Eye, EyeOff,
  RotateCcw, Snowflake, Wind, Gauge, Activity, ToggleLeft,
} from 'lucide-react';
import { Panel, SectionHeader, Toggle, Badge, ProgressBar, StatusDot } from '@/components/ui';
import { devices } from '@/data/domain';
import { useLanguage } from '@/i18n/LanguageContext';

interface ControlState {
  [key: string]: { on: boolean; value?: number };
}

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

  const toggle = (key: string) => setControls((c) => ({ ...c, [key]: { ...c[key], on: !c[key].on } }));
  const setValue = (key: string, value: number) => setControls((c) => ({ ...c, [key]: { ...c[key], value } }));

  const controlLog = [
    { time: '14:32:11', deviceKey: 'view.controls.log.vaultDoor', cmd: 'UNLOCK', user: 'a.muller@ksv.io' },
    { time: '14:28:44', deviceKey: 'view.controls.log.robotArm', cmd: 'SPEED_LIMIT 25%', user: 'safety-engine' },
    { time: '14:15:02', deviceKey: 'view.controls.log.hvac', cmd: 'SETPOINT 21°C', user: 'm.lin@ksv.io' },
    { time: '14:02:19', deviceKey: 'view.controls.log.pressLine', cmd: 'RESET', user: 'j.park@ksv.io' },
    { time: '13:48:55', deviceKey: 'view.controls.log.eastGate', cmd: 'OPEN', user: 'c.silva@ksv.io' },
  ];

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
            className={`btn w-full ${controls['vault-lock'].on ? 'btn-danger' : 'btn-primary'}`}
          >
            {controls['vault-lock'].on ? <Unlock size={16} /> : <Lock size={16} />}
            {controls['vault-lock'].on ? t('view.controls.unlock') : t('view.controls.lock')}
          </button>
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
            <Toggle checked={controls['hvac-temp'].on} onChange={() => toggle('hvac-temp')} />
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
              disabled={!controls['hvac-temp'].on}
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
              className={`flex h-28 w-28 items-center justify-center rounded-full border-4 font-bold transition-all duration-300 active:scale-95 ${
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
            <button onClick={() => toggle('press-estop')} className="btn-ghost flex-1 text-xs">
              <RotateCcw size={14} /> {t('view.controls.reset')}
            </button>
          </div>
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
            <Toggle checked={controls['robot-speed'].on} onChange={() => toggle('robot-speed')} />
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
              disabled={!controls['robot-speed'].on}
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
            <button onClick={() => toggle('east-barrier')} className="btn-ghost flex-1 text-xs">
              {controls['east-barrier'].on ? t('view.controls.close') : t('view.controls.open')}
            </button>
            <button className="btn-ghost text-xs"><Settings2 size={14} /></button>
          </div>
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
            <Toggle checked={controls['cold-storage'].on} onChange={() => toggle('cold-storage')} />
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
              disabled={!controls['cold-storage'].on}
              className="w-full accent-accent-500"
            />
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-xs text-ink-400"><span>{t('view.controls.current')}</span><span>-20°C</span></div>
              <ProgressBar value={67} color="accent" size="sm" />
            </div>
          </div>
        </Panel>
      </div>

      {/* Active control log */}
      <Panel className="p-5 animate-fade-in">
        <SectionHeader title={t('view.controls.logTitle')} subtitle={t('view.controls.logSubtitle')} icon={<Activity size={18} />} />
        <div className="space-y-2">
          {controlLog.map((log, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-ink-700/50 bg-ink-900/40 px-3 py-2.5 text-sm">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-ink-400">{log.time}</span>
                <span className="text-ink-200">{t(log.deviceKey)}</span>
                <Badge variant="brand">{log.cmd}</Badge>
              </div>
              <span className="text-xs text-ink-400">{log.user}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
