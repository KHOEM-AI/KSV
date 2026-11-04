import { useEffect, useState } from 'react';
import { ensureDevice, getDevice, sendCommand, type KsvDevice } from '@/lib/ksvDevices';

const ID = 'fridge-1';
const MODES: { key: string; km: string }[] = [
  { key: 'normal', km: 'ធម្មតា' },
  { key: 'eco', km: 'សន្សំ' },
  { key: 'turbo_cool', km: 'ត្រជាក់ខ្លាំង' },
  { key: 'vacation', km: 'វិស្សមកាល' },
];

const btn = (bg: string, active = true): React.CSSProperties => ({
  flex: 1,
  padding: '12px 10px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.15)',
  background: active ? bg : '#1e293b',
  color: '#fff',
  fontWeight: 700,
  fontSize: 15,
  cursor: 'pointer',
});

export function FridgePanel({ onClose }: { onClose: () => void }) {
  const [dev, setDev] = useState<KsvDevice | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    ensureDevice(ID, 'ទូទឹកកក', 'fridge')
      .then(setDev)
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : String(e)));
  }, []);

  const run = async (command: string, params: Record<string, unknown> = {}, confirmed = false) => {
    setBusy(true);
    setErr(null);
    try {
      await sendCommand(ID, command, params, confirmed);
      setDev(await getDevice(ID));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const turnOff = () => {
    if (window.confirm('បិទទូទឹកកក? អាហារអាចខូច។')) run('OFF', {}, true);
  };

  const st = dev?.state ?? {};
  const on = st.power === true;
  const temp = typeof st.temperature === 'number' ? st.temperature : 4;
  const freezer = typeof st.freezerTemperature === 'number' ? st.freezerTemperature : -18;
  const mode = typeof st.mode === 'string' ? st.mode : 'normal';
  const ready = !!dev && !busy;

  return (
    <div
      role="dialog"
      aria-label="Refrigerator"
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ width: 'min(420px, 100%)', background: '#0b1220', border: '1px solid rgba(45,212,191,0.5)', borderRadius: 16, padding: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: 0 }}>ទូទឹកកក</h3>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>

        {dev?.adapter === 'sim' && (
          <p style={{ color: '#fbbf24', fontSize: 12, margin: '0 0 12px' }}>
            របៀបសាកល្បង (simulation): មិនទាន់ភ្ជាប់ទូទឹកកកពិតទេ
          </p>
        )}

        <p style={{ fontSize: 28, fontWeight: 800, margin: '8px 0 14px', color: on ? '#4ade80' : '#94a3b8' }}>
          {dev ? (on ? 'កំពុងបើក' : 'បិទ') : 'កំពុងផ្ទុក…'}
        </p>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <button type="button" disabled={!ready} onClick={() => run('ON')} style={btn('#16a34a', on)}>បើក ON</button>
          <button type="button" disabled={!ready} onClick={turnOff} style={btn('#dc2626', !on)}>បិទ OFF</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <button type="button" disabled={!ready || temp <= 1} onClick={() => run('SET_TEMPERATURE', { value: temp - 1 })} style={btn('#334155')}>−</button>
          <div style={{ flex: 2, textAlign: 'center', color: '#fff', fontSize: 20, fontWeight: 700 }}>ទូទឹកកក {temp}°C</div>
          <button type="button" disabled={!ready || temp >= 8} onClick={() => run('SET_TEMPERATURE', { value: temp + 1 })} style={btn('#334155')}>+</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <button type="button" disabled={!ready || freezer <= -24} onClick={() => run('SET_FREEZER_TEMPERATURE', { value: freezer - 1 })} style={btn('#334155')}>−</button>
          <div style={{ flex: 2, textAlign: 'center', color: '#fff', fontSize: 20, fontWeight: 700 }}>កកកំណក {freezer}°C</div>
          <button type="button" disabled={!ready || freezer >= -14} onClick={() => run('SET_FREEZER_TEMPERATURE', { value: freezer + 1 })} style={btn('#334155')}>+</button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {MODES.map((m) => (
            <button key={m.key} type="button" disabled={!ready} onClick={() => run('SET_MODE', { value: m.key })} style={{ ...btn('#0ea5e9', mode === m.key), flex: '1 1 40%', fontSize: 13 }}>
              {m.km}
            </button>
          ))}
        </div>

        {err && <p style={{ color: '#f87171', fontSize: 13, marginTop: 12 }}>{err}</p>}
      </div>
    </div>
  );
}
