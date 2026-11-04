import { Panel } from '@/components/ui';
import { useLanguage } from '@/i18n/LanguageContext';

const SECTIONS: { title: string; items: string[] }[] = [
  { title: 'guide.start.title', items: ['guide.start.1', 'guide.start.2', 'guide.start.3'] },
  { title: 'guide.ac.title', items: ['guide.ac.1', 'guide.ac.2', 'guide.ac.3'] },
  { title: 'guide.fan.title', items: ['guide.fan.1', 'guide.fan.2', 'guide.fan.3'] },
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
