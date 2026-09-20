# KSV API — Implementation Status

## Verified End-to-End (2026-09-09) - Login to Settings to Devices to Audit

This section is verified by real curl commands, not just claims. The chain below works on a single organization (KSV Global Holdings, id 6a9e7ea3176a7202190df575):

1. Login -> receive JWT via POST /api/auth/login/password
2. GET /api/settings -> organization-level settings
3. GET /api/devices -> 10 seeded devices
4. GET /api/audit/events -> works, returns empty array (no events yet)

Frontend wiring: src/views/SettingsView.tsx calls src/lib/api.ts which calls /api/settings for real (no more local useState only).

Test account: admin@ksv.local / Admin123! (role: Owner, org: KSV Global Holdings)

## IMPORTANT for continued development - do not break this path

This repo once had two different organizations in the same database (KSV Demo Org and KSV Global Holdings) created by different dev sessions that were not coordinated. Result: user could log in, but Settings/Devices/Audit did not see each other because organizationId did not match. This was fixed (fix-admin-org.ts) but can happen again if new endpoints do not follow the same pattern.

Required rules for all new endpoints:
1. Always use req.user.organizationId to scope organization-level data (do not hardcode an org name like seed-devices.ts used to do)
2. Do not create a new organization in a seed script without first checking if one already exists for the test account
3. Before committing a new endpoint, verify with curl using the admin@ksv.local token that data matches organization 6a9e7ea3176a7202190df575
4. If a new session needs more seed data, use Organization.findOne with the exact _id, not findOne by name, since names can change

Why this matters: fixing a broken path after many features are built is harder than following this rule from the start. Any session adding a new domain (device, audit, security, etc) should read this section first.

## Seed Scripts

- scripts/seed-admin-user.mjs - creates the first user
- scripts/seed-org-for-admin.mjs - links an org to that user (older version, creates a new org each time, be careful)
- seed-devices.ts - seeds devices into KSV Global Holdings
- fix-admin-org.ts - utility to relink admin to the correct org if orgs get fragmented

Last updated: 2026-09-09 - Login to Settings to Devices to Audit verified connected on a single organization


## Update 2026-09-12 — seed-devices.ts made safe (upsert, not delete+insert)

`seed-devices.ts` previously used `Device.deleteMany()` before `insertMany()`.
This meant running the script again would wipe ALL devices in the org first,
including any added later outside this seed list — dangerous if run by
mistake.

Fixed to use `updateOne(..., { upsert: true })` per device, matched by
`deviceCode` + `organizationId`. Running the script again now:
- Creates devices that don't exist yet
- Updates devices that already match by deviceCode
- Never deletes anything

Verified: ran twice in a row, device count stayed at 20 both times
(0 created, 20 updated on the second run — no data loss).

<!-- KSV-AUDIT-2026-09-20-B -->
### Client/Server gap (2026-09-20)
- Client calls 227 paths; server (src/server.ts) implements 63. Prefix unified to /api.
- Details: ../DOCUMENTATION/INTEGRATION-AUDIT.md, ../DOCUMENTATION/CLIENT_SERVER_COMPARE.md

<!-- KSV-README-2026-09-20 -->
## ស្ថានភាពការងារ (2026-09-20)

### អ្វីដែលបានធ្វើហើយ (verified)
| ការងារ | លទ្ធផល |
|---|---|
| Audit ឯកសារ | 19 "folder" ក្នុងផែនការ គឺជា logical domain ក្នុង `API/*.ts` (27 domain + `index.ts`) មិនមែន directory ពិតទេ |
| ផ្ទៀងផ្ទាត់ client ↔ server | client កំណត់ 227 path, server មាន 63 (ខ្វះ ~190) |
| Prefix | រួមមក `/api` តែមួយ (ពី `/api` និង `/api/v1` ចម្រុះ) |
| TypeScript | `tsc -p tsconfig.app.json` ពី 39 error → **0** |
| Auth routes | `POST /api/auth/token/refresh` (rotating + reuse detection), `POST /api/auth/logout`, `GET /api/auth/sessions`, `DELETE /api/auth/sessions/:sessionId` |
| Safety routes | rules CRUD, enable/disable, `GET /api/safety/events/:eventId`, `GET/POST /api/safety/emergency-stop`, `POST /api/safety/emergency-stop/release` |
| Emergency-stop guard | command route ត្រូវរារាំង (**423**) ពេល stop សកម្ម, កត់ Command `blocked` និង audit |

### លទ្ធផល test emergency-stop (device សាកល្បង DEV-5004)
- activate → 201
- command ពេល stop សកម្ម → **423** `EMERGENCY_STOP_ACTIVE` (មិន dispatch)
- stop ស្ទួន → 409
- release (Manager ឡើងទៅ) → 200
- ចុងក្រោយ active stops = 0

### របៀបដំណើរការ
- Backend: `npm run server` (រត់ `src/server.ts` ដោយ `--experimental-strip-types`, port 3000)
- Frontend: `npm run dev` (Vite, localhost:5173)
- Type check: `npx tsc --noEmit -p tsconfig.app.json` (កុំប្រើ `-p .` ព្រោះ `files: []` មិនពិនិត្យអ្វី)

### ចំណាំសំខាន់ៗ
- ផ្លូវ command មានតែមួយ (`gatewayDispatcher.dispatch` ក្នុង command route) ដែល guard ទាំងអស់ត្រូវនៅមុនវា
- `src/modules/*`, `src/routes/index.ts`, `src/server/server.ts` ជា server stack ទីពីរដែល **មិនត្រូវបានប្រើ** ដោយ `npm run server`
- Rule schema តូច (`name`, `category`, `severity`, `isEnabled`, `triggerCount`) ហើយ field ក្នុង contract (conditions/actions/description) មិនទាន់ត្រូវបានរក្សាទុក
- Backup មុនកែ: `archive/backup-20260920/`

### ⚠️ សុវត្ថិភាព (ត្រូវធ្វើមុនប្រើជាមួយ device ពិត)
1. MQTT ភ្ជាប់ `test.mosquitto.org` (broker សាធារណៈ) ត្រូវប្តូរទៅ broker ផ្ទាល់ខ្លួន + username/password + TLS
2. ត្រូវពិនិត្យថា AI `interpret/confirm` មិនរំលង emergency-stop guard
3. កុំសរសេរពាក្យសម្ងាត់ក្នុង command line (នៅសល់ក្នុង history)

### នៅសល់ត្រូវធ្វើ (⚠️ SUPERSEDED — see the English status section at the end of this file)
- MFA (enroll/confirm/verify/disable/challenge/methods) និង `login/oauth`
- Pairing, Automation (rules/scenes), `safety/check`, `safety/devices`
- Domain ផ្សេងៗ (recovery, admin, telemetry, push, files, reports, webhooks, geo, tickets ...) ដែល client ហៅតែ server មិនទាន់មាន
- បញ្ហា `KhoemAIPanel.tsx` ហៅ `/api/v1/ai-brain/recent-decisions` ដែលមិនមាននៅ server

ឯកសារលម្អិត: `../DOCUMENTATION/INTEGRATION-AUDIT.md`, `../DOCUMENTATION/CLIENT_SERVER_COMPARE.md`

---

## Implementation Status — 2026-09-20 (English)

> This section supersedes the older "remaining work" list above. Khmer translation to follow.

### Implemented and verified (routes respond `401` without a token; server boots clean; `tsc` = 0 errors)

| Domain | What exists | Notes |
|---|---|---|
| Auth / MFA | TOTP MFA (enroll, confirm, disable, verify), 2-step login challenge | `otplib` v13 (functional API) |
| Registration | `POST /api/auth/register`, creates Organization + `OrgAdmin` user | Never creates `Owner` (platform superuser) |
| Client gates | Hold-to-unlock App Lock, Provider select (UI only, no real OAuth), Location Gate | `POST /api/auth/location` stores `lastKnownLocation` |
| Pairing | `PairingSession` model; start / get / verify-owner / confirm / cancel; list paired; unpair | Proof stored as SHA-256 only, timing-safe compare, 5 attempts, 10 min TTL |
| Automation rules | CRUD + enable/disable | Rules start **disabled**. Execution engine exists (time-based only, **off by default**, see below) |
| Scenes | CRUD + activate | Every action goes through e-stop guard → Safety Engine → dispatch → audit. `bypassSafety` is rejected |
| Safety | `POST /api/safety/check` (dry-run), `GET /api/safety/devices`, device `criticality` | Dry-run creates no command and dispatches nothing |

### Device criticality (safety policy)

`Device.criticality` is one of `life_support | clinical | robot_mobile | facility | consumer` (default `facility`).
The Safety Engine evaluates it **before** any database rule, so it cannot be disabled by editing rules:

- `life_support` devices are **read-only** in KSV (`READ_STATUS`, `GET_STATUS`, `READ_TELEMETRY`, `PING` only). All control commands are blocked.
- `life_support` devices cannot be added to scenes.
- Unknown criticality values are blocked (fail closed).

### Automation execution engine (2026-09-20)

- File: `src/core/automation/automation.engine.ts`. Time triggers only: `{ type: "time_of_day", time: "HH:MM", daysOfWeek?, timezone? }` (legacy `{ type: "time", value: "HH:MM" }` also accepted).
- **Off by default.** Set `AUTOMATION_ENGINE=on` in `.env` to start it (tick every 30 s).
- An automated command gets no extra privilege: e-stop guard → criticality / Safety Engine → gateway dispatch → audit (audit `userId` is `null`). `life_support` devices never run. No bypass.
- Each rule runs at most once per matching minute (atomic claim via `lastRunKey`). Missed minutes are not caught up. An invalid timezone never runs (fail closed).

### Known limitations (do not ignore)

1. MQTT still connects to the public `test.mosquitto.org` broker. Move to a private broker with credentials + TLS before any real device.
2. Pairing `verify-owner` compares user-supplied proof only. Verification against the physical device (PIN / QR / certificate) needs the Gateway / Protocol adapter.
3. Scene activation is partial-success: blocked actions do not stop the remaining actions (results are reported per action).
4. `authRateLimiter` is in-memory (resets on restart).
5. `ActionType` is declared in both `API/authorization.ts` and `API/automation.ts`; avoid importing both in one file.
6. Duplicate server stack in `src/modules/*`, `src/routes/index.ts`, `src/server/server.ts` is **not** used by `npm run server`.

### Remaining work

- Automation engine: extend beyond time triggers (sensor, device state, location); not yet tested against a real device
- Real OAuth (needs Client ID/Secret per provider)
- Domains still missing on the server: recovery, admin, telemetry, push, files, reports, webhooks, geo, tickets
- `KhoemAIPanel.tsx` calls `/api/v1/ai-brain/recent-decisions`, which is not implemented server-side
- Healthcare / robotics integrations (see `DOCUMENTATION/healthcare-robotics.md`)
