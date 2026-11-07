import { useState } from 'react';
import { CatalogPanel } from '@/components/CatalogPanel';
import { EXTRA_DEVICES, EXTRA_IMAGE, type ExtraDevice } from '@/components/extraDevices';

/**
 * The extra picture (sections 9–13: electronics, lighting, vehicles, kitchen/audio, doors/gates/outdoor).
 * Every tile has a green border and opens the catalog-driven control panel.
 */
export function ExtraDeviceGrid() {
  const [open, setOpen] = useState<ExtraDevice | null>(null);
  const { width: W, height: H } = EXTRA_IMAGE;
  return (
    <div style={{ marginTop: 20 }}>
      {open && <CatalogPanel deviceId={open.id} label={open.name} type={open.type} onClose={() => setOpen(null)} />}
      <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 12 }}>More Devices</h3>
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: W,
          aspectRatio: `${W} / ${H}`,
          backgroundImage: `url(${EXTRA_IMAGE.src})`,
          backgroundSize: '100% 100%',
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        {EXTRA_DEVICES.map((d) => (
          <button
            key={d.id}
            type="button"
            aria-label={d.name}
            title={d.name}
            onClick={() => setOpen(d)}
            style={{
              position: 'absolute',
              left: `${(d.x / W) * 100}%`,
              top: `${(d.y / H) * 100}%`,
              width: `${(d.w / W) * 100}%`,
              height: `${(d.h / H) * 100}%`,
              background: 'transparent',
              border: '2px solid rgba(34,197,94,0.85)',
              borderRadius: 10,
              padding: 0,
              cursor: 'pointer',
            }}
          />
        ))}
      </div>
    </div>
  );
}
