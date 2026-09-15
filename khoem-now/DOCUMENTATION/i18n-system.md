# Internationalization (i18n) System

**Domain:** `INTERNATIONAL/` · **Related code:** `src/translations.ts`, `src/App.tsx` (`t()` helper), all `src/views/*View.tsx` files

## Purpose
Describes how UI text is translated across the KSV interface, and the conventions that keep the system consistent as new views and languages are added. This is a reference document, not a source of code — see `translations.ts` for the actual key/value data.

## Supported Languages
Currently 11 languages are supported: Khmer (km), English (en), Japanese (ja), Chinese (zh), Thai (th), Korean (ko), French (fr), Spanish (es), Vietnamese (vi), Arabic (ar).

## How Translation Works
1. UI components call a `t('some.key')` helper instead of hard-coding text.
2. `t()` looks up `'some.key'` inside `translations.ts` for the currently active language.
3. If a key is missing for the active language, the system should have a defined fallback behavior (e.g. fall back to English) — this fallback behavior should be confirmed and documented once decided.

## ⚠️ Key Naming Convention Is Not Yet Uniform
This is the single most important thing to know before touching any view file.

Two different naming styles currently exist side by side in `translations.ts`:
- **Dot-style:** `view.devices.registry.title`
- **CamelCase-style:** `view.devices.registryTitle`

A view file written with the wrong style for an existing key will silently fail to translate (this exact bug was found and fixed in `DevicesView.tsx` — see `progress-log.md`).

**Rule going forward:** Always check `translations.ts` for the existing key style used by that view *before* writing or editing `t()` calls. Do not assume a convention.

## Recommended Verification Workflow
Before editing any view file, pull every translation key it currently references and diff them against what actually exists in `translations.ts`:

```
grep -o "t('[^']*')" <ViewFile>.tsx | sort -u
```
Compare that list against the corresponding section in `translations.ts` to catch any mismatch before it ships.

## What Should Never Be Translated
- Device names
- Rule names
- Event/status codes (e.g. `UNLOCK`, `LOGIN_ATTEMPT`, `ONLINE`)

These are data values, not UI copy, and translating them would break comparisons and logs elsewhere in the system.

## View Coverage Status
As of the last verification pass (see `progress-log.md` for the dated entry), these views were confirmed fully wired to `t()` with no key mismatches:

DashboardView · ControlsView · ProtocolsView · GatewayView · SecurityView · OrganizationView · CertificatesView · SettingsView · AuditView · SafetyView · InternationalView

`DevicesView` required a fix (key mismatch + missing `view.devices.status.*` keys) — already resolved.

> This list should be updated whenever a new view is added or re-verified — see `progress-log.md` for the running history of changes, rather than duplicating status here.

## Country / Timezone Clock
A `CountryClock` component (`src/components/CountryClock.tsx`) lets the user pick a country and shows the current time in that country's timezone in the header. This is a display feature layered on top of the International domain's country/timezone data (see `international.md`) — it does not itself drive which UI language is shown.

## Related
- `international.md` — the broader country/language/timezone data model
- `progress-log.md` — dated history of specific i18n fixes and additions
