import { useEffect, useState } from 'react';
import { ensureDevice, getDevice, sendCommand, type KsvDevice } from '@/lib/ksvDevices';

const ID = 'washer-1';
const PROGRAMS: { key: string; km: string }[] = [
  { key: 'cotton', km: 'កប្បាស' },
  { key: 'synthetic', km: 'សំយោគ' },
  { key: 'delicate', km: 'ស្រាល' },
  { key: 'quick', km: 'រហ័ស' },
  { key: 'eco', km: 'សន្សំ' },
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

export function WasherPanel({ onClose }: { onClose: () => void }) {
  const [dev, setDev] = useState<KsvDevice | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [program, setProgram] = useState('cotton');

  useEffect(() => {
    ensureDevice(ID, 'ម៉ាស៊ីនបោកគក់', 'washer')
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

  const start = () => {
    if (window.confirm('ចាប់ផ្តើមបោកគក់?')) run('START', { program }, true);
  };

  const st = dev?.state ?? {};
  const running = st.running === true;
  const paused = st.paused === true;
  const ready = !!dev && !busy;

  return (
    <div
      role="dialog"
      aria-label="Washing Machine"
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ width: 'min(420px, 100%)', background: '#0b1220', border: '1px solid rgba(45,212,191,0.5)', borderRadius: 16, padding: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: 0 }}>ម៉ាស៊ីនបោកគក់</h3>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>

        {dev?.adapter === 'sim' && (
          <p style={{ color: '#fbbf24', fontSize: 12, margin: '0 0 12px' }}>
            របៀបសាកល្បង (simulation): មិនទាន់ភ្ជាប់ម៉ាស៊ីនបោកគក់ពិតទេ
          </p>
        )}

        <p style={{ fontSize: 28, fontWeight: 800, margin: '8px 0 14px', color: running && !paused ? '#4ade80' : '#94a3b8' }}>
          {dev ? (running ? (paused ? 'ផ្អាក' : 'កំពុងបោក') : 'ឈប់') : 'កំពុងផ្ទុក…'}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {PROGRAMS.map((p) => (
            <button key={p.key} type="button" disabled={!ready} onClick={() => setProgram(p.key)} style={{ ...btn('#0ea5e9', program === p.key), flex: '1 1 30%', fontSize: 13 }}>
              {p.km}
            </button>
          ))}
        </div>

        <button type="button" disabled={!ready} onClick={start} style={{ ...btn('#16a34a'), width: '100%', flex: 'none', marginBottom: 10 }}>
          ចាប់ផ្តើម START
        </button>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" disabled={!ready || !running || paused} onClick={() => run('PAUSE')} style={btn('#7c3aed')}>ផ្អាក</button>
          <button type="button" disabled={!ready || !running || !paused} onClick={() => run('RESUME')} style={btn('#0ea5e9')}>បន្ត</button>
          <button type="button" disabled={!ready || !running} onClick={() => run('STOP')} style={btn('#dc2626')}>ឈប់</button>
        </div>

        {err && <p style={{ color: '#f87171', fontSize: 13, marginTop: 12 }}>{err}</p>}
      </div>
    </div>
  );
}
