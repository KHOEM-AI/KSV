import { useEffect, useState } from 'react';
import { listTypes, listDevices, registerDevice, setDeviceDisabled, type KsvDevice, type KsvTypeInfo } from '@/lib/ksvDevices';

const field: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.15)',
  background: '#111a2e',
  color: '#fff',
  fontSize: 14,
  boxSizing: 'border-box',
};
const lbl: React.CSSProperties = { color: '#94a3b8', fontSize: 12, margin: '10px 0 4px', display: 'block' };

export function AddDevicePanel({ onClose }: { onClose: () => void }) {
  const [types, setTypes] = useState<KsvTypeInfo[]>([]);
  const [devs, setDevs] = useState<KsvDevice[]>([]);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('generic');
  const [adapter, setAdapter] = useState('http');
  const [endpoint, setEndpoint] = useState('http://192.168.');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const reload = async () => {
    try {
      setDevs(await listDevices());
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  useEffect(() => {
    listTypes().then(setTypes).catch((e: unknown) => setErr(e instanceof Error ? e.message : String(e)));
    void reload();
  }, []);

  const submit = async () => {
    setBusy(true);
    setErr(null);
    setOk(null);
    try {
      await registerDevice({
        id: id.trim(),
        name: name.trim(),
        type,
        adapter,
        ...(adapter === 'http' ? { endpoint: endpoint.trim() } : {}),
        ...(adapter === 'mqtt' && code.trim() ? { deviceCode: code.trim() } : {}),
      });
      setOk(`បានចុះឈ្មោះ ${id.trim()}`);
      setId('');
      setName('');
      await reload();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (d: KsvDevice) => {
    setErr(null);
    try {
      await setDeviceDisabled(d.id, !d.disabled);
      await reload();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Add device"
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ width: 'min(460px, 100%)', maxHeight: '90vh', overflowY: 'auto', background: '#0b1220', border: '1px solid rgba(45,212,191,0.5)', borderRadius: 16, padding: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: 0 }}>បន្ថែមឧបករណ៍</h3>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>

        <label style={lbl}>id (a-z 0-9 _ -)</label>
        <input style={field} value={id} onChange={(e) => setId(e.target.value)} placeholder="plug-kitchen" />
        <label style={lbl}>ឈ្មោះ</label>
        <input style={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="ដោតភ្លើងផ្ទះបាយ" />
        <label style={lbl}>ប្រភេទ</label>
        <select style={field} value={type} onChange={(e) => setType(e.target.value)}>
          {types.map((t) => (
            <option key={t.type} value={t.type}>{t.type} · {t.km}</option>
          ))}
        </select>
        <label style={lbl}>adapter</label>
        <select style={field} value={adapter} onChange={(e) => setAdapter(e.target.value)}>
          <option value="http">http (ឧបករណ៍ក្នុង LAN)</option>
          <option value="mqtt">mqtt</option>
          <option value="sim">sim (សាកល្បង)</option>
        </select>
        {adapter === 'http' && (
          <>
            <label style={lbl}>endpoint (LAN ប៉ុណ្ណោះ)</label>
            <input style={field} value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="http://192.168.1.50" />
          </>
        )}
        {adapter === 'mqtt' && (
          <>
            <label style={lbl}>deviceCode (ទទេ = ប្រើ id)</label>
            <input style={field} value={code} onChange={(e) => setCode(e.target.value)} />
          </>
        )}

        <button
          type="button"
          disabled={busy || !id.trim() || !name.trim()}
          onClick={() => void submit()}
          style={{ width: '100%', marginTop: 14, padding: '12px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
        >
          ចុះឈ្មោះឧបករណ៍
        </button>
        {ok && <p style={{ color: '#4ade80', fontSize: 13, marginTop: 10 }}>{ok}</p>}
        {err && <p style={{ color: '#f87171', fontSize: 13, marginTop: 10 }}>{err}</p>}

        <p style={{ color: '#94a3b8', fontSize: 12, margin: '18px 0 6px' }}>ឧបករណ៍ដែលបានចុះឈ្មោះ ({devs.length})</p>
        {devs.map((d) => (
          <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ color: d.disabled ? '#64748b' : '#fff', fontSize: 13 }}>
              {d.name}
              <div style={{ color: '#64748b', fontSize: 11 }}>{d.id} · {d.type} · {d.adapter}</div>
            </div>
            <button
              type="button"
              onClick={() => void toggle(d)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: d.disabled ? '#16a34a' : '#334155', color: '#fff', fontSize: 12, cursor: 'pointer' }}
            >
              {d.disabled ? 'បើកដំណើរការ' : 'បិទដំណើរការ'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
