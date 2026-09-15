// src/i18n/timeAgo.ts
// Parses English "relative time" strings from domain.ts sample data
// (e.g. "2m ago", "1h ago", "3d ago") and re-renders them in the
// active UI language using the time.* translation keys.
import { translate, type LanguageCode } from './translations';

const UNIT_MAP: Record<string, string> = {
  s: 'time.secondsAgo',
  m: 'time.minutesAgo',
  h: 'time.hoursAgo',
  d: 'time.daysAgo',
  w: 'time.weeksAgo',
};

export function formatTimeAgo(raw: string, lang: LanguageCode): string {
  const match = raw.match(/^(\d+)([smhdw])\s*ago$/i);
  if (!match) return raw; // not a recognized pattern — show as-is
  const [, count, unit] = match;
  const key = UNIT_MAP[unit.toLowerCase()];
  if (!key) return raw;
  return translate(lang, key, { count });
}
