import { useEffect, useState } from 'react';
import { ensureDevice, getDevice, sendCommand, type KsvDevice } from '@/lib/ksvDevices';

const ID = 'tv-1';
const VOLUME_CONFIRM_ABOVE = 85;
const VOLUME_STEP = 5;
const INPUTS: { key: string; km: string }[] = [
  { key: 'antenna', km: 'អង់តែន' },
  { key: 'hdmi1', km: 'HDMI 1' },
  { key: 'hdmi2', km: 'HDMI 2' },
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

export function TvPanel({ onClose }: { onClose: () => void }) {
  const [dev, setDev] = useState<KsvDevice | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    ensureDevice(ID, 'ទូរទស្សន៍', 'tv')
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
  const volume = typeof st.volume === 'number' ? st.volume : 20;
  const muted = st.muted === true;
  const channel = typeof st.channel === 'number' ? st.channel : 1;
  const input = typeof st.input === 'string' ? st.input : 'hdmi1';
  const ready = !!dev && !busy;

  return (
    <div
      role="dialog"
      aria-label="Smart TV"
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ width: 'min(420px, 100%)', background: '#0b1220', border: '1px solid rgba(45,212,191,0.5)', borderRadius: 16, padding: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: 0 }}>ទូរទស្សន៍</h3>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>

        {dev?.adapter === 'sim' && (
          <p style={{ color: '#fbbf24', fontSize: 12, margin: '0 0 12px' }}>
            របៀបសាកល្បង (simulation): មិនទាន់ភ្ជាប់ទូរទស្សន៍ពិតទេ
          </p>
        )}

        <p style={{ fontSize: 28, fontWeight: 800, margin: '8px 0 14px', color: on ? '#4ade80' : '#94a3b8' }}>
          {dev ? (on ? 'កំពុងបើក' : 'បិទ') : 'កំពុងផ្ទុក…'}
        </p>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <button type="button" disabled={!ready} onClick={() => run('ON')} style={btn('#16a34a', on)}>បើក ON</button>
          <button type="button" disabled={!ready} onClick={() => run('OFF')} style={btn('#dc2626', !on)}>បិទ OFF</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <button type="button" disabled={!ready || volume <= 0} onClick={() => run('SET_VOLUME', { value: Math.max(0, volume - VOLUME_STEP) })} style={btn('#334155')}>−</button>
          <div style={{ flex: 2, textAlign: 'center', color: '#fff', fontSize: 22, fontWeight: 700 }}>សំឡេង {volume}%</div>
          <button type="button" disabled={!ready || volume >= VOLUME_CONFIRM_ABOVE} onClick={() => run('SET_VOLUME', { value: Math.min(VOLUME_CONFIRM_ABOVE, volume + VOLUME_STEP) })} style={btn('#334155')}>+</button>
        </div>

        <button type="button" disabled={!ready} onClick={() => run(muted ? 'UNMUTE' : 'MUTE')} style={{ ...btn('#7c3aed', muted), width: '100%', flex: 'none', marginBottom: 12 }}>
          បិទសំឡេង: {muted ? 'បើក' : 'បិទ'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <button type="button" disabled={!ready || channel <= 1} onClick={() => run('SET_CHANNEL', { value: channel - 1 })} style={btn('#334155')}>−</button>
          <div style={{ flex: 2, textAlign: 'center', color: '#fff', fontSize: 22, fontWeight: 700 }}>ឆានែល {channel}</div>
          <button type="button" disabled={!ready || channel >= 999} onClick={() => run('SET_CHANNEL', { value: channel + 1 })} style={btn('#334155')}>+</button>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {INPUTS.map((i) => (
            <button key={i.key} type="button" disabled={!ready} onClick={() => run('SET_INPUT', { value: i.key })} style={btn('#0ea5e9', input === i.key)}>
              {i.km}
            </button>
          ))}
        </div>

        {err && <p style={{ color: '#f87171', fontSize: 13, marginTop: 12 }}>{err}</p>}
      </div>
    </div>
  );
}
