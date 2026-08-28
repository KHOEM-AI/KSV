// src/views/InternationalView.tsx
import { useEffect, useMemo, useState } from 'react';
import { Search, Globe2, Clock, Star } from 'lucide-react';
import { COUNTRIES, getLocalTime, getLocalDateTime, getUtcOffset, type Country } from '@/data/countries';
import { useLanguage } from '@/i18n/LanguageContext';

// ======================================================================
// KSV — International View (Domain #1: Global & International)
//
// Rule this screen enforces:
//   Country ≠ Language ≠ Time Zone.
//   Every country card shows THAT country's own real local time,
//   read live from the IANA Time Zone Database — never a single
//   "world time" forced on every user.
// ======================================================================

function useTick(intervalMs = 1000) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}

function isDaytime(timezone: string): boolean {
  const hour = Number(
    new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: 'numeric', hour12: false }).format(new Date())
  );
  return hour >= 6 && hour < 18;
}

function CountryCard({ country, pinned, onTogglePin }: { country: Country; pinned: boolean; onTogglePin: () => void }) {
  const { t } = useLanguage();
  useTick(1000);
  const day = isDaytime(country.timezone);

  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 hover:bg-white/[0.05] transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${day ? 'bg-emerald-400' : 'bg-indigo-400'}`}
          title={day ? t('intl.daytime') : t('intl.nighttime')}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-slate-100 truncate">{country.name}</p>
            <span className="text-xs text-slate-500">{country.code}</span>
          </div>
          <p className="text-xs text-slate-500 truncate">{country.timezone}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right">
          <p className="font-mono text-lg text-slate-100 tabular-nums">{getLocalTime(country.timezone)}</p>
          <p className="text-xs text-slate-500">UTC{getUtcOffset(country.timezone)}</p>
        </div>
        <button
          onClick={onTogglePin}
          aria-label={pinned ? t('intl.unpin', { name: country.name }) : t('intl.pin', { name: country.name })}
          className={`p-1.5 rounded-md transition-colors ${pinned ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'}`}
        >
          <Star size={16} fill={pinned ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
}

export function InternationalView() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [pinned, setPinned] = useState<string[]>(() => {
    // Default pins: a small, geographically spread starter set.
    return ['KH', 'US', 'GB', 'JP'];
  });
  const [selected, setSelected] = useState<string>('KH');

  useTick(1000);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.dialCode.includes(q)
    );
  }, [query]);

  const pinnedCountries = useMemo(
    () => pinned.map((code) => COUNTRIES.find((c) => c.code === code)).filter(Boolean) as Country[],
    [pinned]
  );

  const selectedCountry = COUNTRIES.find((c) => c.code === selected) ?? COUNTRIES[0];

  function togglePin(code: string) {
    setPinned((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  return (
    <div className="min-h-screen bg-ink-950 text-slate-100 p-6 space-y-6">
      <header className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
          <Globe2 size={22} />
        </div>
        <div>
          <h1 className="text-xl font-semibold">{t('intl.title')}</h1>
          <p className="text-sm text-slate-500">
            {t('intl.subtitle', { count: COUNTRIES.length })}
          </p>
        </div>
      </header>

      {/* Featured: selected country, large live clock */}
      <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-sky-500/10 to-transparent p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-slate-400">{selectedCountry.name}</p>
            <p className="font-mono text-4xl font-semibold tabular-nums mt-1">
              {getLocalTime(selectedCountry.timezone)}
            </p>
            <p className="text-sm text-slate-500 mt-1">{getLocalDateTime(selectedCountry.timezone)}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 text-slate-400 justify-end">
              <Clock size={14} />
              <span className="text-sm">UTC{getUtcOffset(selectedCountry.timezone)}</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">{selectedCountry.timezone}</p>
            <p className="text-xs text-slate-600">{t('intl.dialCode')} {selectedCountry.dialCode}</p>
          </div>
        </div>
      </div>

      {/* Pinned countries — each keeps its own real local time, independently */}
      {pinnedCountries.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-slate-400 mb-2">{t('common.pinned')}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {pinnedCountries.map((c) => (
              <button key={c.code} className="text-left" onClick={() => setSelected(c.code)}>
                <CountryCard country={c} pinned onTogglePin={() => togglePin(c.code)} />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Full directory */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('intl.search')}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-sky-500/50"
            />
          </div>
          <span className="text-xs text-slate-500 shrink-0">{filtered.length} {t('common.results')}</span>
        </div>

        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {filtered.map((c) => (
            <button key={c.code} className="w-full text-left" onClick={() => setSelected(c.code)}>
              <CountryCard country={c} pinned={pinned.includes(c.code)} onTogglePin={() => togglePin(c.code)} />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
