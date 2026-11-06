import { useEffect, useState } from 'react';
import { ensureDevice, getDevice, sendCommand, type KsvDevice } from '@/lib/ksvDevices';
import { UNKNOWN } from '@/components/SecuredPanel';

export interface ReadOnlyTile { id: string; name: string; label: string }

export const READONLY_TILES: Record<string, ReadOnlyTile> = {
  'Smoke Detector': { id: 'smoke-1', name: 'ឧបករណ៍ចាប់ផ្សែង', label: 'Smoke Detector' },
  'Fire Detector': { id: 'fire-1', name: 'ឧបករណ៍ចាប់ភ្លើង', label: 'Fire Detector' },
  'Medical Monitor': { id: 'medmon-1', name: 'ម៉ូនីទ័រពេទ្យ', label: 'Medical Monitor' },
  'Laboratory Analyzer': { id: 'lab-1', name: 'ឧបករណ៍វិភាគមន្ទីរពិសោធន៍', label: 'Laboratory Analyzer' },
  'Smart Meter': { id: 'meter-1', name: 'ម៉ែត្រឆ្លាតវៃ', label: 'Smart Meter' },
  'Smart Bin': { id: 'bin-1', name: 'ធុងសំរាមឆ្លាតវៃ', label: 'Smart Bin' },
  'Traffic Camera': { id: 'trafficcam-1', name: 'កាមេរ៉ាចរាចរណ៍', label: 'Traffic Camera' },
  'Smart Traffic Light': { id: 'trafficlight-1', name: 'ភ្លើងចរាចរណ៍ឆ្លាតវៃ', label: 'Smart Traffic Light' },
};

export function ReadOnlyPanel({ tile, onClose }: { tile: ReadOnlyTile; onClose: () => void }) {
  const [dev, setDev] = useState<KsvDevice | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    ensureDevice(tile.id, tile.name, 'sensor')
      .then(setDev)
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : String(e)));
  }, [tile.id, tile.name]);

  const refresh = async () => {
    setBusy(true);
    setErr(null);
    try {
      await sendCommand(tile.id, 'GET_STATUS');
      setDev(await getDevice(tile.id));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const rows = Object.entries(dev?.state ?? {}).filter(([k]) => k !== 'lastCommand');

  return (
    <div
      role="dialog"
      aria-label={tile.label}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ width: 'min(420px, 100%)', background: '#0b1220', border: '1px solid rgba(56,189,248,0.6)', borderRadius: 16, padding: 20 }}
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

        <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 12px' }}>មើលស្ថានភាពតែប៉ុណ្ណោះ។ គ្មានការបញ្ជាពីចម្ងាយ។</p>

        {!dev ? (
          <p style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>កំពុងផ្ទុក…</p>
        ) : rows.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: 22, fontWeight: 800, margin: '8px 0 14px' }}>{UNKNOWN}</p>
        ) : (
          <div style={{ margin: '8px 0 14px' }}>
            {rows.map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: 15, padding: '4px 0' }}>
                <span style={{ color: '#94a3b8' }}>{k}</span>
                <span style={{ fontWeight: 700 }}>{String(v)}</span>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          disabled={!dev || busy}
          onClick={() => void refresh()}
          style={{ width: '100%', padding: '12px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: '#334155', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
        >
          ផ្ទុកស្ថានភាពឡើងវិញ
        </button>

        {err && <p style={{ color: '#f87171', fontSize: 13, marginTop: 12 }}>{err}</p>}
      </div>
    </div>
  );
}
