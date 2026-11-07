import { useState, useEffect } from 'react';
import { countries, type Country } from '@/ksv';

export default function CountryClock() {
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const defaultIndex = countries.findIndex((c) => c.tz === userTz);
  const [selected, setSelected] = useState<Country>(
    countries[defaultIndex >= 0 ? defaultIndex : 0]
  );
  const [time, setTime] = useState('');

  useEffect(() => {
    function updateTime() {
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: selected.tz,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
        setTime(formatter.format(new Date()));
      } catch {
        setTime('N/A');
      }
    }
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [selected]);

  return (
    <div className="flex min-w-0 max-w-[11rem] items-center gap-2 rounded-xl border border-ink-700 bg-ink-850/60 px-3 py-1.5 text-sm text-ink-100 sm:max-w-none">
      <select
        className="min-w-0 flex-1 truncate bg-transparent text-xs text-ink-100 focus:outline-none"
        value={countries.indexOf(selected)}
        onChange={(e) => setSelected(countries[parseInt(e.target.value, 10)])}
      >
        {countries.map((c, i) => (
          <option key={c.name} value={i} className="bg-ink-900">
            {c.flag} {c.native} ({c.name})
          </option>
        ))}
      </select>
      <span className="shrink-0 font-mono text-xs text-brand-400">{time}</span>
    </div>
  );
}
