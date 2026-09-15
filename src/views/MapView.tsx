import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '@/i18n/LanguageContext';

/**
 * MapView.tsx — KSV Interactive GIS / Geo-Location Map (README Section 44)
 *
 * ចំណាំសំខាន់មុននឹង build:
 *   npm install leaflet
 *   npm install -D @types/leaflet
 *
 * Marker color តាម Section 44.2 ក្នុង README:
 *   GREEN = NORMAL/ONLINE, YELLOW = WARNING, RED = CRITICAL,
 *   GRAY = OFFLINE, BLUE = MAINTENANCE
 *
 * Map មិនត្រូវជំនួស Authorization ទេ (Section 44.2) — ចុច marker បង្ហាញតែ
 * ព័ត៌មាន Device Detail ជា read-only; ប៊ូតុង Control ត្រូវទៅ Device Detail
 * page ដែលឆ្លង Auth/Authorization/Safety ដូចធម្មតា (មិនប្រតិបត្តិដោយផ្ទាល់ពី Map ទេ)។
 */

type DeviceStatus = 'online' | 'warning' | 'critical' | 'offline' | 'maintenance';

interface MapDevice {
  id: string;
  name: string;
  category: string;
  site: string;
  lat: number;
  lng: number;
  status: DeviceStatus;
  protocol: string;
}

// TODO: ជំនួសដោយហៅ /api/devices?fields=id,name,lat,lng,status ពិតប្រាកដ
// ពេលមាន backend — ឥឡូវប្រើទិន្នន័យដូច Device Registry (screenshot) ជា placeholder
const MOCK_DEVICES: MapDevice[] = [
  { id: 'DEV-04821', name: 'North Vault Door',      category: 'Access',     site: 'Frankfurt HQ',    lat: 50.1109, lng: 8.6821,   status: 'online',      protocol: 'MQTT' },
  { id: 'DEV-04822', name: 'Cleanroom HVAC Unit 3',  category: 'Climate',    site: 'Taipei Fab',      lat: 25.0330, lng: 121.5654, status: 'warning',     protocol: 'Wi-Fi' },
  { id: 'DEV-04823', name: 'Press Line 7 Interlock', category: 'Industrial', site: 'Stuttgart Plant', lat: 48.7758, lng: 9.1829,   status: 'online',      protocol: 'Zigbee' },
  { id: 'DEV-04824', name: 'Fleet Van KR-2291',      category: 'Vehicle',    site: 'Seoul Depot',     lat: 37.5665, lng: 126.9780, status: 'offline',     protocol: 'Bluetooth' },
  { id: 'DEV-04825', name: 'Rooftop Air Sensor',     category: 'Sensor',     site: 'Frankfurt HQ',    lat: 50.1160, lng: 8.6900,   status: 'online',      protocol: 'LoRaWAN' },
  { id: 'DEV-04826', name: 'East Gate Barrier',      category: 'Access',     site: 'Dubai Logistics', lat: 25.2048, lng: 55.2708,  status: 'maintenance', protocol: 'MQTT' },
  { id: 'DEV-04827', name: 'Core Switch RACK-12',    category: 'Network',    site: 'Singapore DC',    lat: 1.3521,  lng: 103.8198, status: 'online',      protocol: 'Wi-Fi' },
  { id: 'DEV-04828', name: 'Robot Arm RA-04',        category: 'Industrial', site: 'Osaka Factory',   lat: 34.6937, lng: 135.5023, status: 'warning',     protocol: 'MQTT' },
  { id: 'DEV-04829', name: 'Server Room Door',       category: 'Access',     site: 'Singapore DC',    lat: 1.3500,  lng: 103.8200, status: 'online',      protocol: 'Zigbee' },
  { id: 'DEV-04830', name: 'Cold Storage Monitor',   category: 'Climate',    site: 'Rotterdam Port',  lat: 51.9244, lng: 4.4777,   status: 'online',      protocol: 'Wi-Fi' },
];

const STATUS_COLOR: Record<DeviceStatus, string> = {
  online: '#22c55e',
  warning: '#eab308',
  critical: '#ef4444',
  offline: '#6b7280',
  maintenance: '#3b82f6',
};

function makeIcon(status: DeviceStatus): L.DivIcon {
  const color = STATUS_COLOR[status];
  return L.divIcon({
    className: '',
    html: `<div style="
      width:16px;height:16px;border-radius:50%;
      background:${color};
      box-shadow:0 0 0 4px ${color}33, 0 0 8px ${color};
      border:2px solid #0b0d14;
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export function MapView() {
  const { t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | 'all'>('all');
  const [selectedDevice, setSelectedDevice] = useState<MapDevice | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [30, 20],
      zoom: 2,
      minZoom: 2,
      worldCopyJump: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ធ្វើ marker ឡើងវិញរាល់ដង filter ប្តូរ
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const markers: L.Marker[] = [];
    const visible = MOCK_DEVICES.filter(
      (d) => statusFilter === 'all' || d.status === statusFilter
    );

    for (const device of visible) {
      const marker = L.marker([device.lat, device.lng], { icon: makeIcon(device.status) })
        .addTo(map)
        .on('click', () => setSelectedDevice(device));
      markers.push(marker);
    }

    return () => {
      markers.forEach((m) => m.remove());
    };
  }, [statusFilter]);

  const statusCounts = MOCK_DEVICES.reduce<Record<string, number>>((acc, d) => {
    acc[d.status] = (acc[d.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-lg font-semibold text-white">{t('view.map.title')}</h1>
        <p className="text-sm text-ink-400">{t('view.map.subtitle')}</p>
      </div>

      {/* Status filter chips — Section 44.3 (status filter) */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'online', 'warning', 'critical', 'offline', 'maintenance'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              statusFilter === s
                ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300'
                : 'border-white/10 text-ink-400 hover:border-white/30'
            }`}
          >
            {s === 'all' ? t('view.map.filter.all') : t(`view.map.filter.${s}`)}
            {s !== 'all' && (
              <span className="ml-1 opacity-60">({statusCounts[s] ?? 0})</span>
            )}
          </button>
        ))}
      </div>

      <div className="relative">
        <div
          ref={mapContainerRef}
          style={{ height: '420px', width: '100%' }}
          className="overflow-hidden rounded-xl border border-white/10"
        />

        {/* Legend — Section 44.2 */}
        <div className="absolute bottom-3 left-3 z-[1000] rounded-lg bg-[#0b0d14]/90 p-3 text-xs text-white border border-white/10">
          {Object.entries(STATUS_COLOR).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2 py-0.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: color }}
              />
              <span className="capitalize">{t(`view.map.filter.${status}`)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Device detail panel — read-only, click marker → Section 44.3 */}
      {selectedDevice && (
        <div className="rounded-xl border border-white/10 bg-[#151a28] p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">{selectedDevice.name}</h3>
              <p className="text-xs text-ink-400">{selectedDevice.id} · {selectedDevice.site}</p>
            </div>
            <button
              onClick={() => setSelectedDevice(null)}
              className="text-ink-400 hover:text-white"
              aria-label={t('common.close')}
            >
              ✕
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <div className="text-ink-400 text-xs">{t('view.map.detail.category')}</div>
              <div className="text-white">{selectedDevice.category}</div>
            </div>
            <div>
              <div className="text-ink-400 text-xs">{t('view.map.detail.protocol')}</div>
              <div className="text-white">{selectedDevice.protocol}</div>
            </div>
            <div>
              <div className="text-ink-400 text-xs">{t('view.map.detail.status')}</div>
              <div className="text-white capitalize">{selectedDevice.status}</div>
            </div>
            <div>
              <div className="text-ink-400 text-xs">{t('view.map.detail.coords')}</div>
              <div className="text-white">{selectedDevice.lat.toFixed(3)}, {selectedDevice.lng.toFixed(3)}</div>
            </div>
          </div>

          {/* 
            មិនដាក់ប៊ូតុង Control ត្រង់ៗនៅទីនេះទេ (Section 44.2: marker មិនត្រូវ
            ជំនួស Authorization) — ត្រូវ navigate ទៅ Device Detail page ដែលឆ្លង
            Auth → Authorization → Safety ដូចធម្មតា។ ជំនួសដោយ router navigate
            ពិតប្រាកដនៅពេលភ្ជាប់ (ឧ. react-router `navigate(\`/devices/${selectedDevice.id}\`)`)
          */}
          <p className="mt-3 text-xs text-ink-500">{t('view.map.detail.controlNote')}</p>
        </div>
      )}
    </div>
  );
}
