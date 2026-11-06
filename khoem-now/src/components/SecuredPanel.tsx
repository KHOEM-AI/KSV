import { useEffect, useState } from 'react';
import { ensureDevice, getDevice, sendCommand, type KsvDevice } from '@/lib/ksvDevices';

type Tone = 'green' | 'red' | 'amber' | 'slate';
interface Btn { command: string; label: string; tone: Tone; confirm?: string }
interface Group {
  type: string;
  note: string;
  status: (st: Record<string, unknown>) => { text: string; ok: boolean | null };
  buttons: Btn[];
}
export interface SecuredTile { group: string; id: string; name: string; label: string }

const TONES: Record<Tone, string> = { green: '#16a34a', red: '#dc2626', amber: '#d97706', slate: '#334155' };
export const UNKNOWN = 'មិនទាន់មានស្ថានភាព';

const GROUPS: Record<string, Group> = {
  lock: {
    type: 'lock',
    note: 'ដោះសោអាចអនុញ្ញាតឱ្យមនុស្សចូល។ ត្រូវបញ្ជាក់ជាមុន។',
    status: (st) => (st.locked === undefined ? { text: UNKNOWN, ok: null } : st.locked === true ? { text: 'បានចាក់សោ', ok: true } : { text: 'បានដោះសោ', ok: false }),
    buttons: [
      { command: 'LOCK', label: 'ចាក់សោ LOCK', tone: 'green' },
      { command: 'UNLOCK', label: 'ដោះសោ UNLOCK', tone: 'amber', confirm: 'តើអ្នកប្រាកដថាចង់ដោះសោមែនទេ?' },
    ],
  },
  barrier: {
    type: 'barrier',
    note: 'មុនលើកបារ៉ែ ត្រូវប្រាកដថាគ្មានមនុស្ស ឬយានយន្តនៅក្រោមបារ៉ែ។',
    status: (st) => (st.locked === undefined ? { text: UNKNOWN, ok: null } : st.locked === true ? { text: 'បារ៉ែទម្លាក់ (បិទ)', ok: true } : { text: 'បារ៉ែលើក (បើក)', ok: false }),
    buttons: [
      { command: 'LOCK', label: 'ទម្លាក់បារ៉ែ (បិទ)', tone: 'green' },
      { command: 'UNLOCK', label: 'លើកបារ៉ែ (បើក)', tone: 'amber', confirm: 'តើគ្មានមនុស្ស ឬយានយន្តនៅក្រោមបារ៉ែទេ? ចង់លើកបារ៉ែមែនទេ?' },
    ],
  },
  alarm: {
    type: 'alarm',
    note: 'ការបិទប្រព័ន្ធរោទិ៍ធ្វើឱ្យអស់ការការពារ។ ត្រូវបញ្ជាក់ជាមុន។',
    status: (st) => (st.power === undefined ? { text: UNKNOWN, ok: null } : st.power === true ? { text: 'ប្រព័ន្ធរោទិ៍ដំណើរការ', ok: true } : { text: 'ប្រព័ន្ធរោទិ៍បិទ', ok: false }),
    buttons: [
      { command: 'ON', label: 'បើកប្រព័ន្ធរោទិ៍ ON', tone: 'green' },
      { command: 'OFF', label: 'បិទប្រព័ន្ធរោទិ៍ OFF', tone: 'amber', confirm: 'តើអ្នកប្រាកដថាចង់បិទប្រព័ន្ធរោទិ៍មែនទេ?' },
    ],
  },
  network: {
    type: 'network',
    note: 'ការបិទអាចកាត់ផ្តាច់អ្នកប្រើផ្សេង និងបាត់ទិន្នន័យ។ ត្រូវបញ្ជាក់ជាមុន។',
    status: (st) => (st.power === undefined ? { text: UNKNOWN, ok: null } : st.power === true ? { text: 'កំពុងបើក', ok: true } : { text: 'បិទ', ok: false }),
    buttons: [
      { command: 'ON', label: 'បើក ON', tone: 'green' },
      { command: 'OFF', label: 'បិទ OFF', tone: 'red', confirm: 'ការបិទអាចកាត់ផ្តាច់អ្នកប្រើផ្សេង និងបាត់ទិន្នន័យ។ បន្តមែនទេ?' },
    ],
  },
  machine: {
    type: 'machine',
    note: 'ប៊ូតុង STOP ដំណើរការភ្លាមៗ។ ការចាប់ផ្តើមត្រូវបញ្ជាក់ ហើយត្រូវធានាថាគ្មានអ្នកណានៅជិតម៉ាស៊ីន។',
    status: (st) => (st.running === undefined ? { text: UNKNOWN, ok: null } : st.running === true ? { text: st.paused === true ? 'ផ្អាក' : 'កំពុងដំណើរការ', ok: false } : { text: 'បានបញ្ឈប់', ok: true }),
    buttons: [
      { command: 'STOP', label: 'បញ្ឈប់ STOP', tone: 'red' },
      { command: 'START', label: 'ចាប់ផ្តើម START', tone: 'amber', confirm: 'តើតំបន់ម៉ាស៊ីនស្អាត ហើយគ្មានអ្នកណានៅជិតឬទេ? ចង់ចាប់ផ្តើមមែនទេ?' },
    ],
  },
};

export const SECURED_TILES: Record<string, SecuredTile> = {
  'Smart Lock': { group: 'lock', id: 'smartlock-1', name: 'សោឆ្លាតវៃ', label: 'Smart Lock' },
  'Access Control': { group: 'lock', id: 'access-1', name: 'ប្រព័ន្ធត្រួតពិនិត្យការចូល', label: 'Access Control' },
  'Smart Alarm': { group: 'alarm', id: 'alarm-1', name: 'ប្រព័ន្ធរោទិ៍', label: 'Smart Alarm' },
  'Parking Barrier': { group: 'barrier', id: 'barrier-1', name: 'បារ៉ែចូលចតរថយន្ត', label: 'Parking Barrier' },
  'Wi-Fi Router': { group: 'network', id: 'router-1', name: 'រ៉ោតទ័រ Wi-Fi', label: 'Wi-Fi Router' },
  'Network Switch': { group: 'network', id: 'switch-1', name: 'ស្វីតបណ្តាញ', label: 'Network Switch' },
  'Firewall': { group: 'network', id: 'firewall-1', name: 'Firewall', label: 'Firewall' },
  'Server': { group: 'network', id: 'server-1', name: 'ម៉ាស៊ីនបម្រើ', label: 'Server' },
  'NAS Storage': { group: 'network', id: 'nas-1', name: 'ឧបករណ៍ផ្ទុក NAS', label: 'NAS Storage' },
  'CNC Machine': { group: 'machine', id: 'cnc-1', name: 'ម៉ាស៊ីន CNC', label: 'CNC Machine' },
  'Industrial Robot': { group: 'machine', id: 'robot-1', name: 'រ៉ូបូតឧស្សាហកម្ម', label: 'Industrial Robot' },
  'Conveyor System': { group: 'machine', id: 'conveyor-1', name: 'ខ្សែក្រវ៉ាត់ដឹកជញ្ជូន', label: 'Conveyor System' },
  'PLC Controller': { group: 'machine', id: 'plc-1', name: 'ឧបករណ៍បញ្ជា PLC', label: 'PLC Controller' },
  '3D Printer': { group: 'machine', id: 'printer3d-1', name: 'ម៉ាស៊ីនបោះពុម្ព 3D', label: '3D Printer' },
  'Drone': { group: 'machine', id: 'drone-1', name: 'ដ្រូន', label: 'Drone' },
  'Farm Tractor': { group: 'machine', id: 'tractor-1', name: 'ត្រាក់ទ័រកសិកម្ម', label: 'Farm Tractor' },
};

export function SecuredPanel({ tile, onClose }: { tile: SecuredTile; onClose: () => void }) {
  const g = GROUPS[tile.group];
  const [dev, setDev] = useState<KsvDevice | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ask, setAsk] = useState<Btn | null>(null);

  useEffect(() => {
    ensureDevice(tile.id, tile.name, g.type)
      .then(setDev)
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : String(e)));
  }, [tile.id, tile.name, g.type]);

  const run = async (b: Btn, confirmed: boolean) => {
    setBusy(true);
    setErr(null);
    try {
      await sendCommand(tile.id, b.command, {}, confirmed);
      setDev(await getDevice(tile.id));
      setAsk(null);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const press = (b: Btn) => {
    if (b.confirm) setAsk(b);
    else void run(b, false);
  };

  const st = dev?.state ?? {};
  const s = g.status(st);
  const ready = !!dev && !busy && !ask;
  const color = s.ok === null ? '#94a3b8' : s.ok ? '#4ade80' : '#fbbf24';

  return (
    <div
      role="dialog"
      aria-label={tile.label}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ width: 'min(420px, 100%)', background: '#0b1220', border: '1px solid rgba(245,158,11,0.6)', borderRadius: 16, padding: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: 0 }}>{tile.name}</h3>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>

        {dev?.adapter === 'sim' && (
          <p style={{ color: '#fbbf24', fontSize: 12, margin: '0 0 10px' }}>
            របៀបសាកល្បង (simulation): មិនទាន់ភ្ជាប់{tile.name}ពិតទេ
          </p>
        )}

        <p style={{ fontSize: 26, fontWeight: 800, margin: '8px 0 10px', color }}>
          {dev ? s.text : 'កំពុងផ្ទុក…'}
        </p>
        <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 14px' }}>{g.note}</p>

        {ask ? (
          <div style={{ border: '1px solid #f59e0b', borderRadius: 12, padding: 14, background: 'rgba(245,158,11,0.08)' }}>
            <p style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>{ask.confirm}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" disabled={busy} onClick={() => setAsk(null)} style={btn('slate')}>បោះបង់</button>
              <button type="button" disabled={busy} onClick={() => void run(ask, true)} style={btn('amber')}>បញ្ជាក់ និងអនុវត្ត</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {g.buttons.map((b) => (
              <button key={b.command} type="button" disabled={!ready} onClick={() => press(b)} style={btn(b.tone)}>
                {b.label}{b.confirm ? ' ⚠' : ''}
              </button>
            ))}
          </div>
        )}

        {err && <p style={{ color: '#f87171', fontSize: 13, marginTop: 12 }}>{err}</p>}
      </div>
    </div>
  );
}

function btn(tone: Tone): React.CSSProperties {
  return {
    flex: 1,
    padding: '13px 10px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.15)',
    background: TONES[tone],
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
  };
}
