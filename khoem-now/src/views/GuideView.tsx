import { Panel } from '@/components/ui';
import { useLanguage } from '@/i18n/LanguageContext';

const SECTIONS: { title: string; items: string[] }[] = [
  { title: 'guide.start.title', items: ['guide.start.1', 'guide.start.2', 'guide.start.3'] },
  { title: 'guide.tiles.title', items: ['guide.tiles.1', 'guide.tiles.2', 'guide.tiles.3'] },
  { title: 'guide.confirm.title', items: ['guide.confirm.1', 'guide.confirm.2', 'guide.confirm.3'] },
  { title: 'guide.live.title', items: ['guide.live.1', 'guide.live.2', 'guide.live.3'] },
  { title: 'guide.connect.title', items: ['guide.connect.1', 'guide.connect.2', 'guide.connect.3'] },
  { title: 'guide.remote.title', items: ['guide.remote.1', 'guide.remote.2', 'guide.remote.3'] },
  { title: 'guide.ac.title', items: ['guide.ac.1', 'guide.ac.2', 'guide.ac.3'] },
  { title: 'guide.fan.title', items: ['guide.fan.1', 'guide.fan.2', 'guide.fan.3'] },
  { title: 'guide.light.title', items: ['guide.light.1', 'guide.light.2', 'guide.light.3'] },
  { title: 'guide.plug.title', items: ['guide.plug.1', 'guide.plug.2'] },
  { title: 'guide.tv.title', items: ['guide.tv.1', 'guide.tv.2', 'guide.tv.3', 'guide.tv.4'] },
  { title: 'guide.fridge.title', items: ['guide.fridge.1', 'guide.fridge.2', 'guide.fridge.3'] },
  { title: 'guide.washer.title', items: ['guide.washer.1', 'guide.washer.2', 'guide.washer.3'] },
  { title: 'guide.projector.title', items: ['guide.projector.1'] },
  { title: 'guide.printer.title', items: ['guide.printer.1'] },
  { title: 'guide.camera.title', items: ['guide.camera.1', 'guide.camera.2'] },
  { title: 'guide.outdoor.title', items: ['guide.outdoor.1', 'guide.outdoor.2'] },
  { title: 'guide.sensor.title', items: ['guide.sensor.1', 'guide.sensor.2'] },
  { title: 'guide.readonly.title', items: ['guide.readonly.1', 'guide.readonly.2'] },
  { title: 'guide.ev.title', items: ['guide.ev.1', 'guide.ev.2'] },
  { title: 'guide.more.title', items: ['guide.more.1', 'guide.more.2', 'guide.more.3'] },
  { title: 'guide.add.title', items: ['guide.add.1', 'guide.add.2', 'guide.add.3', 'guide.add.4', 'guide.add.5', 'guide.add.6'] },
  { title: 'guide.allowreal.title', items: ['guide.allowreal.1', 'guide.allowreal.2', 'guide.allowreal.3'] },
];

export function GuideView() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <Panel className="p-5">
        <h2 style={{ color: 'var(--heading)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{t('guide.intro.title')}</h2>
        <p style={{ color: 'rgb(var(--ink-300))', fontSize: 15, lineHeight: 1.7 }}>{t('guide.intro.text')}</p>
      </Panel>
      {SECTIONS.map((sec) => (
        <Panel key={sec.title} className="p-5">
          <h3 style={{ color: 'var(--tile-title)', fontSize: 17, fontWeight: 700, marginBottom: 10, borderLeft: '4px solid var(--tile-title)', paddingLeft: 10 }}>{t(sec.title)}</h3>
          <ul style={{ margin: 0, paddingLeft: 20, color: 'rgb(var(--ink-200))', fontSize: 15, lineHeight: 1.7 }}>
            {sec.items.map((k) => (
              <li key={k} style={{ marginBottom: 6 }}>{t(k)}</li>
            ))}
          </ul>
        </Panel>
      ))}
    </div>
  );
}
