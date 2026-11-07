import { useState } from 'react';
import { AirConditionerPanel } from '@/components/AirConditionerPanel';
import { FanPanel } from '@/components/FanPanel';
import { LightPanel } from '@/components/LightPanel';
import { PlugPanel } from '@/components/PlugPanel';
import { TvPanel } from '@/components/TvPanel';
import { FridgePanel } from '@/components/FridgePanel';
import { WasherPanel } from '@/components/WasherPanel';
import { OnOffPanel } from '@/components/OnOffPanel';
import { SecuredPanel, SECURED_TILES } from '@/components/SecuredPanel';
import { ReadOnlyPanel, READONLY_TILES } from '@/components/ReadOnlyPanel';
import { AddDevicePanel } from '@/components/AddDevicePanel';

const SRC = '/general-devices-control.jpg?v=2';
const W = 1079, H = 880, PAD = 2;
type Span = [number, number];
const L: Span[] = [[139, 215], [220, 294], [301, 372], [377, 449], [453, 527], [532, 602]];
const R: Span[] = [[619, 690], [696, 766], [770, 838], [844, 913], [917, 988], [994, 1065]];
const Y: Span[] = [[316, 396], [437, 522], [556, 644], [683, 764]];

const GROUPS: { title: string; side: Span[]; row: number; items: string[] }[] = [
  { title: '1. Smart Home & Household', side: L, row: 0, items: ['Smart TV', 'Air Conditioner', 'Refrigerator', 'Washing Machine', 'Smart Light', 'Smart Plug'] },
  { title: '2. Security & Safety', side: R, row: 0, items: ['Smart Alarm', 'CCTV Camera', 'Smart Lock', 'Smoke Detector', 'Fire Detector', 'Access Control'] },
  { title: '3. Industrial & Commercial', side: L, row: 1, items: ['Conveyor System', 'CNC Machine', '3D Printer', 'Industrial Robot', 'PLC Controller', 'Sensor Module'] },
  { title: '4. Energy & Environment', side: R, row: 1, items: ['Solar Panel', 'Battery Storage', 'EV Charger', 'Smart Meter', 'Wind Turbine', 'Water Pump'] },
  { title: '5. Network, IT & Communication', side: L, row: 2, items: ['Wi-Fi Router', 'Network Switch', 'Firewall', 'Server', 'NAS Storage', 'IP Camera'] },
  { title: '6. Transport, Agriculture & Medical', side: R, row: 2, items: ['Drone', 'Electric Vehicle', 'Traffic Camera', 'Farm Tractor', 'Medical Monitor', 'Laboratory Analyzer'] },
  { title: '7. Daily Life & Office', side: L, row: 3, items: ['Smart Fan', 'Smart TV Box', 'Projector', 'Printer', 'Scanner', 'Smart Speaker'] },
  { title: '8. Smart City & Infrastructure', side: R, row: 3, items: ['Street Light', 'Parking Barrier', 'Smart Traffic Light', 'Environmental Sensor', 'Digital Signage', 'Smart Bin'] },
];

const PANELS: Record<string, string> = {
  'CCTV Camera': 'cctv',
  'IP Camera': 'ipcam',
  'Digital Signage': 'signage',
  'Street Light': 'streetlight',
  'Water Pump': 'pump',
  'EV Charger': 'evcharger',
  'Sensor Module': 'sensor',
  'Environmental Sensor': 'envsensor',
  'Solar Panel': 'solar',
  'Battery Storage': 'battery',
  'Wind Turbine': 'wind',
  'Air Conditioner': 'ac',
  'Smart Fan': 'fan',
  'Smart Light': 'light',
  'Smart Plug': 'plug',
  'Smart TV': 'tv',
  'Refrigerator': 'fridge',
  'Washing Machine': 'washer',
  'Projector': 'projector',
  'Printer': 'printer',
  'Smart TV Box': 'tvbox',
  'Scanner': 'scanner',
  'Smart Speaker': 'speaker',
};

export function DeviceCategoryGrid() {
  const [open, setOpen] = useState<string | null>(null);
  const [secured, setSecured] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [readonly, setReadonly] = useState<string | null>(null);
  return (
    <div>
      {open === 'ac' && <AirConditionerPanel onClose={() => setOpen(null)} />}
      {open === 'fan' && <FanPanel onClose={() => setOpen(null)} />}
      {open === 'light' && <LightPanel onClose={() => setOpen(null)} />}
      {open === 'plug' && <PlugPanel onClose={() => setOpen(null)} />}
      {open === 'tv' && <TvPanel onClose={() => setOpen(null)} />}
      {open === 'fridge' && <FridgePanel onClose={() => setOpen(null)} />}
      {open === 'washer' && <WasherPanel onClose={() => setOpen(null)} />}
      {open === 'projector' && <OnOffPanel id="projector-1" name="ម៉ាស៊ីនបញ្ចាំងរូប" label="Projector" onClose={() => setOpen(null)} />}
      {open === 'printer' && <OnOffPanel id="printer-1" name="ម៉ាស៊ីនបោះពុម្ព" label="Printer" onClose={() => setOpen(null)} />}
            {open === 'tvbox' && <OnOffPanel id="tvbox-1" name="ប្រអប់ទូរទស្សន៍" label="Smart TV Box" onClose={() => setOpen(null)} />}
      {open === 'scanner' && <OnOffPanel id="scanner-1" name="ម៉ាស៊ីនស្កេន" label="Scanner" onClose={() => setOpen(null)} />}
      {open === 'speaker' && <OnOffPanel id="speaker-1" name="ឧបករណ៍ភ្លេង" label="Smart Speaker" onClose={() => setOpen(null)} />}
      {open === 'cctv' && <OnOffPanel id="cctv-1" name="កាមេរ៉ាសុវត្ថិភាព CCTV" label="CCTV Camera" onClose={() => setOpen(null)} />}
      {open === 'ipcam' && <OnOffPanel id="ipcam-1" name="កាមេរ៉ា IP" label="IP Camera" onClose={() => setOpen(null)} />}
      {open === 'signage' && <OnOffPanel id="signage-1" name="ផ្ទាំងផ្សាយឌីជីថល" label="Digital Signage" onClose={() => setOpen(null)} />}
      {open === 'streetlight' && <OnOffPanel id="streetlight-1" name="ភ្លើងផ្លូវ" label="Street Light" onClose={() => setOpen(null)} />}
      {open === 'pump' && <OnOffPanel id="pump-1" name="ម៉ាស៊ីនបូមទឹក" label="Water Pump" onClose={() => setOpen(null)} />}
      {open === 'evcharger' && <OnOffPanel id="evcharger-1" name="ឧបករណ៍សាកឡានអគ្គិសនី" label="EV Charger" onClose={() => setOpen(null)} />}
      {open === 'sensor' && <OnOffPanel id="sensor-1" name="ម៉ូឌុលសេនស័រ" label="Sensor Module" onClose={() => setOpen(null)} />}
      {open === 'envsensor' && <OnOffPanel id="envsensor-1" name="សេនស័របរិស្ថាន" label="Environmental Sensor" onClose={() => setOpen(null)} />}
      {open === 'solar' && <OnOffPanel id="solar-1" name="បន្ទះសូឡា" label="Solar Panel" onClose={() => setOpen(null)} />}
      {open === 'battery' && <OnOffPanel id="battery-1" name="ឧបករណ៍ផ្ទុកថ្ម" label="Battery Storage" onClose={() => setOpen(null)} />}
      {open === 'wind' && <OnOffPanel id="wind-1" name="ទួរប៊ីនខ្យល់" label="Wind Turbine" onClose={() => setOpen(null)} />}
      {secured && SECURED_TILES[secured] && <SecuredPanel tile={SECURED_TILES[secured]} onClose={() => setSecured(null)} />}
      {addOpen && <AddDevicePanel onClose={() => setAddOpen(false)} />}
      {readonly && READONLY_TILES[readonly] && <ReadOnlyPanel tile={READONLY_TILES[readonly]} onClose={() => setReadonly(null)} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <h3 style={{ color: 'var(--heading)', fontSize: 18, fontWeight: 700, margin: 0 }}>General Devices Control</h3>
        <button type="button" onClick={() => setAddOpen(true)} style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(45,212,191,0.5)', background: '#0b1220', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>+ បន្ថែមឧបករណ៍</button>
      </div>
      <div className="ksv-legend" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginBottom: 12, fontSize: 12, color: 'rgb(var(--ink-300))' }}>
        {[['#22c55e', 'ចុចបញ្ជាបាន · Control'], ['#f59e0b', 'ត្រូវបញ្ជាក់មុនបញ្ជា · Confirm first'], ['#38bdf8', 'មើលតែប៉ុណ្ណោះ · View only']].map(([c, label]) => (
          <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <i style={{ width: 12, height: 12, borderRadius: 4, border: '2px solid ' + c, display: 'inline-block' }} />
            {label}
          </span>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {GROUPS.map((g) => (
          <section key={g.title} style={{ borderRadius: 14, border: '1px solid var(--tile-border)', background: 'var(--tile-bg)', padding: 12 }}>
            <div style={{ color: 'var(--tile-title)', fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{g.title}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: 8 }}>
              {g.items.map((name, i) => {
                const [xa, xb] = g.side[i];
                const [ya, yb] = Y[g.row];
                const x = xa - PAD, y = ya - PAD, w = xb - xa + PAD * 2, h = yb - ya + PAD * 2;
                const pic = (
                  <div
                    role="img"
                    aria-label={name}
                    style={{
                      width: '100%',
                      aspectRatio: `${w} / ${h}`,
                      borderRadius: 10,
                      backgroundImage: `url(${SRC})`,
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: `${(W / w) * 100}% auto`,
                      backgroundPosition: `${(x / (W - w)) * 100}% ${(y / (H - h)) * 100}%`,
                    }}
                  />
                );
                if (READONLY_TILES[name]) {
                  return (
                    <button key={name} type="button" onClick={() => setReadonly(name)} title={name} style={{ padding: 0, border: '2px solid #38bdf8', borderRadius: 12, background: 'none', cursor: 'pointer', display: 'block', width: '100%' }}>
                      {pic}
                    </button>
                  );
                }
                const sec = SECURED_TILES[name];
                if (sec) {
                  return (
                    <button key={name} type="button" onClick={() => setSecured(name)} title={name} style={{ padding: 0, border: '2px solid #f59e0b', borderRadius: 12, background: 'none', cursor: 'pointer', display: 'block', width: '100%' }}>
                      {pic}
                    </button>
                  );
                }
                const panelKey = PANELS[name] ?? null;
                if (panelKey) {
                  return (
                    <button key={name} type="button" onClick={() => setOpen(panelKey)} title={name} style={{ padding: 0, border: '2px solid #22c55e', borderRadius: 12, background: 'none', cursor: 'pointer', display: 'block', width: '100%' }}>
                      {pic}
                    </button>
                  );
                }
                return <div key={name} title={`${name} · មើលតែប៉ុណ្ណោះ (មិនទាន់ភ្ជាប់ការបញ្ជា)`} style={{ opacity: 0.5 }}>{pic}</div>;
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
