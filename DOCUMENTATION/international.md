# International System

**Domain:** `INTERNATIONAL/` · **API domain:** International API

## Purpose
Makes KSV usable across roughly 195 countries and territories, without hard-coding assumptions that only fit one region.

## Core Principle
> Country ≠ Language ≠ Time Zone

These are three independent settings. A single country can have multiple official languages and span multiple time zones; a language is spoken across many countries.

## Responsibilities
- Country registry (with country codes)
- Language registry
- Time zone registry
- Date format per locale
- Number format per locale
- Measurement units where relevant (metric/imperial)
- Regional settings
- Localization / translation management

## Language System
- Users select an interface language independent of their country or device settings.
- Language content is kept separate from application logic — adding a new language should never require touching business logic, only translation content.

## Time Handling
- KSV maintains one consistent internal time standard (e.g. UTC) for all events, commands, and audit records.
- Users view times converted to their selected local time zone.
- This consistency matters most for security logs, scheduled automation, and industrial systems where exact sequencing matters.

## Beyond Translation: Compliance
Supporting 195 countries is not just 195 sets of translated UI strings — it also means 195 potentially different regulatory environments. This includes privacy laws, data protection rules, data residency requirements, consent rules, data retention limits, and industry-specific regulations. These compliance concerns are tracked separately (see `administration.md` and the platform's legal/compliance documentation), but the International domain is what exposes country context to the rest of the system.

## Related
- `notification.md` — notifications are localized using this system
- `administration.md` — regional/compliance configuration built on top of country data
- 
