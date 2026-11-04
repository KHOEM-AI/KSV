import { useEffect, useState } from 'react';
import { ensureDevice, getDevice, sendCommand, type KsvDevice } from '@/lib/ksvDevices';

const ID = 'fan-1';
const SPEEDS = [1, 2, 3];

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

export function FanPanel({ onClose }: { onClose: () => void }) {
  const [dev, setDev] = useState<KsvDevice | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    ensureDevice(ID, 'កង្ហារ', 'fan')
      .then(setDev)
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : String(e)));
  }, []);

  const run = async (command: string, params: Record<string, unknown> = {}) => {
    setBusy(true);
    setErr(null);
    try {
      await sendCommand(ID, command, params);
      setDev(await getDevice(ID));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const st = dev?.state ?? {};
  const on = st.power === true;
  const speed = typeof st.speed === 'number' ? st.speed : 1;
  const swing = st.oscillation === 'on';
  const ready = !!dev && !busy;

  return (
    <div
      role="dialog"
      aria-label="Smart Fan"
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ width: 'min(420px, 100%)', background: '#0b1220', border: '1px solid rgba(45,212,191,0.5)', borderRadius: 16, padding: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: 0 }}>កង្ហារ</h3>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>

        {dev?.adapter === 'sim' && (
          <p style={{ color: '#fbbf24', fontSize: 12, margin: '0 0 12px' }}>
            របៀបសាកល្បង (simulation): មិនទាន់ភ្ជាប់កង្ហារពិតទេ
          </p>
        )}

        <p style={{ fontSize: 28, fontWeight: 800, margin: '8px 0 14px', color: on ? '#4ade80' : '#94a3b8' }}>
          {dev ? (on ? 'កំពុងបើក' : 'បិទ') : 'កំពុងផ្ទុក…'}
        </p>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <button type="button" disabled={!ready} onClick={() => run('ON')} style={btn('#16a34a', on)}>បើក ON</button>
          <button type="button" disabled={!ready} onClick={() => run('OFF')} style={btn('#dc2626', !on)}>បិទ OFF</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {SPEEDS.map((n) => (
            <button key={n} type="button" disabled={!ready} onClick={() => run('SET_SPEED', { value: n })} style={btn('#0ea5e9', speed === n)}>
              ល្បឿន {n}
            </button>
          ))}
        </div>

        <button type="button" disabled={!ready} onClick={() => run('SET_OSCILLATION', { value: swing ? 'off' : 'on' })} style={{ ...btn('#7c3aed', swing), width: '100%', flex: 'none' }}>
          បក់ទៅមក: {swing ? 'បើក' : 'បិទ'}
        </button>

        {err && <p style={{ color: '#f87171', fontSize: 13, marginTop: 12 }}>{err}</p>}
      </div>
    </div>
  );
}
