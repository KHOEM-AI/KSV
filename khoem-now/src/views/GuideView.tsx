import { Panel } from '@/components/ui';
import { useLanguage } from '@/i18n/LanguageContext';

const SECTIONS: { title: string; items: string[] }[] = [
  { title: 'guide.start.title', items: ['guide.start.1', 'guide.start.2', 'guide.start.3'] },
  { title: 'guide.ac.title', items: ['guide.ac.1', 'guide.ac.2', 'guide.ac.3'] },
  { title: 'guide.fan.title', items: ['guide.fan.1', 'guide.fan.2', 'guide.fan.3'] },
  { title: 'guide.light.title', items: ['guide.light.1', 'guide.light.2', 'guide.light.3'] },
  { title: 'guide.plug.title', items: ['guide.plug.1', 'guide.plug.2'] },
  { title: 'guide.tv.title', items: ['guide.tv.1', 'guide.tv.2', 'guide.tv.3', 'guide.tv.4'] },
  { title: 'guide.fridge.title', items: ['guide.fridge.1', 'guide.fridge.2', 'guide.fridge.3'] },
  { title: 'guide.washer.title', items: ['guide.washer.1', 'guide.washer.2', 'guide.washer.3'] },
  { title: 'guide.projector.title', items: ['guide.projector.1'] },
  { title: 'guide.printer.title', items: ['guide.printer.1'] },
  { title: 'guide.sim.title', items: ['guide.sim.1', 'guide.sim.2'] },
  { title: 'guide.real.title', items: ['guide.real.1', 'guide.real.2', 'guide.real.3'] },
  { title: 'guide.safety.title', items: ['guide.safety.1', 'guide.safety.2', 'guide.safety.3', 'guide.safety.4'] },
  { title: 'guide.trouble.title', items: ['guide.trouble.1', 'guide.trouble.2', 'guide.trouble.3'] },
];

export function GuideView() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <Panel className="p-5">
        <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{t('guide.intro.title')}</h2>
        <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7 }}>{t('guide.intro.text')}</p>
      </Panel>
      {SECTIONS.map((sec) => (
        <Panel key={sec.title} className="p-5">
          <h3 style={{ color: '#5eead4', fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{t(sec.title)}</h3>
          <ul style={{ margin: 0, paddingLeft: 20, color: '#cbd5e1', fontSize: 15, lineHeight: 1.7 }}>
            {sec.items.map((k) => (
              <li key={k} style={{ marginBottom: 6 }}>{t(k)}</li>
            ))}
          </ul>
        </Panel>
      ))}
    </div>
  );
}
