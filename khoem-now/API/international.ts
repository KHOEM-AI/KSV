// API/international.ts
//
// KSV — International Module
// Handles country / language / time-zone resolution for a request or
// a device, following the KSV principle:
//
//   Country ≠ Language ≠ Time Zone
//
// and:
//
//   "The user's clock always shows the time zone the user is
//    physically in RIGHT NOW — not the time zone of the account,
//    the server, or wherever the app was first installed."
//
// Example: a KSV account created in Cambodia (Asia/Phnom_Penh) that
// later opens the app while physically in Japan should see times in
// Asia/Tokyo, not Asia/Phnom_Penh. The account's "home" country and
// the device's "current" time zone are two different pieces of data
// and must never be collapsed into one.

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface CountryRecord {
  code: string; // ISO 3166-1 alpha-2, e.g. "KH"
  name: string;
  defaultLanguage: string; // ISO 639-1, e.g. "km"
  defaultTimeZone: string; // IANA time zone, e.g. "Asia/Phnom_Penh"
}

export interface ResolvedLocaleContext {
  /** IANA time zone actually used to render times for this request/device. */
  timeZone: string;
  /** How the time zone was determined — useful for debugging/audit. */
  source: "device" | "header" | "country-default" | "fallback";
  /** Best-guess country code, if any signal provided one. Informational only. */
  countryCode?: string;
  /** Best-guess language code, if any signal provided one. Informational only. */
  languageCode?: string;
}

// ─────────────────────────────────────────────────────────────
// Core rule: never assume country === time zone === language.
// A country can have several time zones (e.g. US, Russia) and a
// country's "default" time zone is only ever a fallback of last
// resort — the device's own time zone always wins when available.
// ─────────────────────────────────────────────────────────────

const IANA_TIME_ZONE_PATTERN = /^[A-Za-z]+\/[A-Za-z0-9_+-]+(\/[A-Za-z0-9_+-]+)?$/;

export function isValidIanaTimeZone(timeZone: string | undefined | null): timeZone is string {
  if (!timeZone) return false;
  if (!IANA_TIME_ZONE_PATTERN.test(timeZone)) return false;
  try {
    // Intl throws RangeError for an unknown zone name.
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Detects the time zone of the CURRENT device/browser.
 * This is the strongest signal — it reflects where the user
 * physically is right now, regardless of their account's country.
 *
 * Client-side usage only (browser / React Native / mobile webview).
 * On the server this will not exist — use resolveLocaleContext()
 * with a client-supplied time zone instead.
 */
export function detectDeviceTimeZone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return isValidIanaTimeZone(tz) ? tz : null;
  } catch {
    return null;
  }
}

/**
 * Resolves which time zone should be used to render times for this
 * request, following a strict priority order:
 *
 *   1. Explicit device/client time zone (most trustworthy — "where
 *      the user actually is right now")
 *   2. Time zone sent via request header (e.g. mobile app sends
 *      `X-Time-Zone: Asia/Tokyo` alongside each request)
 *   3. The country's defaultTimeZone, purely as a fallback when no
 *      device signal is available (e.g. very first server-rendered
 *      response before the client has reported anything)
 *   4. UTC, as the absolute last resort
 *
 * IMPORTANT: this function never assumes the account's registered
 * country tells you the user's current time zone. Country is used
 * only as a last-resort fallback, never as the primary signal.
 */
export function resolveLocaleContext(input: {
  deviceTimeZone?: string | null;
  headerTimeZone?: string | null;
  countryCode?: string | null;
  languageCode?: string | null;
  countries: CountryRecord[];
}): ResolvedLocaleContext {
  const { deviceTimeZone, headerTimeZone, countryCode, languageCode, countries } = input;

  if (isValidIanaTimeZone(deviceTimeZone)) {
    return {
      timeZone: deviceTimeZone,
      source: "device",
      countryCode: countryCode ?? undefined,
      languageCode: languageCode ?? undefined,
    };
  }

  if (isValidIanaTimeZone(headerTimeZone)) {
    return {
      timeZone: headerTimeZone,
      source: "header",
      countryCode: countryCode ?? undefined,
      languageCode: languageCode ?? undefined,
    };
  }

  const country = countryCode
    ? countries.find((c) => c.code.toUpperCase() === countryCode.toUpperCase())
    : undefined;

  if (country && isValidIanaTimeZone(country.defaultTimeZone)) {
    return {
      timeZone: country.defaultTimeZone,
      source: "country-default",
      countryCode: country.code,
      languageCode: languageCode ?? country.defaultLanguage,
    };
  }

  return {
    timeZone: "UTC",
    source: "fallback",
    countryCode: countryCode ?? undefined,
    languageCode: languageCode ?? undefined,
  };
}

// ─────────────────────────────────────────────────────────────
// Storage vs. display
//
// Rule: the database / audit log / event stream ALWAYS stores UTC.
// Only the presentation layer (API response formatting, UI) converts
// to the resolved local time zone. This keeps security/audit
// timelines consistent across every country, device, and time zone.
// ─────────────────────────────────────────────────────────────

/** Returns the current instant as an ISO-8601 UTC string, for storage. */
export function nowAsUtcIso(): string {
  return new Date().toISOString();
}

/**
 * Formats a UTC timestamp (as stored in the database) into the
 * given time zone for display. Never mutates what is stored —
 * this is a read-time / render-time conversion only.
 */
export function formatInTimeZone(
  utcIsoTimestamp: string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
  }
): string {
  const zone = isValidIanaTimeZone(timeZone) ? timeZone : "UTC";
  const date = new Date(utcIsoTimestamp);
  return new Intl.DateTimeFormat(undefined, { ...options, timeZone: zone }).format(date);
}

/**
 * Convenience wrapper: resolve the user's current time zone AND
 * format a UTC timestamp in one call. Typical use in an API
 * response formatter or UI layer.
 */
export function toUserLocalTime(
  utcIsoTimestamp: string,
  localeContext: ResolvedLocaleContext,
  options?: Intl.DateTimeFormatOptions
): string {
  return formatInTimeZone(utcIsoTimestamp, localeContext.timeZone, options);
}
