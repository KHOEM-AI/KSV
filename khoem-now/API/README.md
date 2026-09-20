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
2. ✅ ពិនិត្យរួច (2026-09-20)៖ AI `interpret/confirm` ត្រឹមតែកត់ត្រា មិនបញ្ជាឧបករណ៍ទេ។ `dispatch` មានតែ ៣ កន្លែង (command route, scenes, automation engine) ហើយទាំងអស់ឆ្លង e-stop + Safety Engine។ `node scripts/check-command-paths.mjs` ការពារកុំឱ្យមានផ្លូវថ្មីដោយគ្មាន guard
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


## Lock & Sign-in System — 2026-09-20 (English)

Scope: every lock, password and sign-in step in the web app (khoem-now). Read-only inspection; only what was actually read is listed as verified. Technical audit with findings: `DOCUMENTATION/auth-and-locks-audit.md`.

### 1. Order of screens (src/App.tsx)
1. Not signed in (no `ksv_access_token` in localStorage): Login screen. From there the user can switch to Register.
2. Register: pick one of the 9 sign-up buttons (see section 6), then fill the Register form.
3. Signed in: **AppLockScreen** (hold to unlock) -> **LocationGate** -> **FinalLockScreen** (face scan or pattern) -> the app.

The three lock states are plain React state and start as "locked", so every page load or refresh shows all three locks again. The token in localStorage is kept.

### 2. Lock 1 - Hold to unlock (highest priority)
- What the user sees: title "KSV Secured", the text "Hold the button to confirm you're a human before entering the platform.", and a big button "Hold to unlock".
- How to use: press and hold the button until the bar fills (default 10 seconds, `holdMs` in AppLockScreen). While holding it shows "{percent}% · {seconds}s left". Releasing early resets the progress to 0. Keyboard: hold Space or Enter. When complete it shows "Unlocked ✓" and continues.
- Where it is used: AppLockScreen (10 s) and the Change Password card in Settings (10 s, dark 3D style, hint "Hold for 10 seconds to change your password").
- Component: `src/components/HoldToUnlock.tsx`. Props: `durationMs`, `label`, `doneLabel`, `disabled`, `variant` ("light" | "dark"), `hint`, `height`, `fontSize`, `onComplete`.
- Important: this is a UI-only "human presence" gate. It makes no server call and protects nothing by itself.

### 3. Lock 2 - Location gate
`src/components/LocationGate.tsx` asks the browser for the device location (`navigator.geolocation.getCurrentPosition`) and continues when it succeeds.
Not verified: only a search of this file was read. What happens when permission is denied or geolocation is unavailable, and whether the location is sent to the server (`POST /api/auth/location` exists), is unknown.

### 4. Lock 3 - Final Lock: face scan or pattern (highest priority)
Files: `src/components/FinalLockScreen.tsx`, `src/components/PatternLock.tsx`, `src/lib/finalLock.ts`.

**First time (no pattern saved):** draw a new pattern on the 3x3 pad (at least 4 dots), then draw it again to confirm. Then, if the phone supports it, the app asks "Turn on face scan?" (Enable / Skip).

**Every later unlock:**
- Face scan enabled: the "Scan face" button is shown and the pad is hidden. A successful scan unlocks immediately, no pattern needed. If the scan fails or is cancelled, the message "Face scan failed. Please draw your pattern" appears and the pattern pad is shown. The link "Use pattern instead" shows the pad at any time.
- Face scan not enabled: the pattern pad is shown. After a correct pattern, if the phone supports face scan and it is not enabled, the app offers "Turn on face scan?" again. "Skip" is remembered only for the current browser session (sessionStorage `ksv.faceOfferSkipped.v1.<userId>`), so the offer returns in the next session.

**Limits:** 5 wrong patterns lock the pad for 60 seconds. A wrong try shows "Wrong pattern".

**Forgot pattern?** Clears the saved pattern, the failure counter and the saved face credential id, then signs the user out locally (tokens removed, all gates reset, Login shown). It does not call `/api/auth/logout`, so the server session (refresh token) stays valid until it expires.

**How it works:** the pattern is stored as a salted PBKDF2-SHA256 hash (150,000 iterations), never as raw dots. Face scan uses the phone's own WebAuthn platform authenticator (`userVerification: required`); KSV never sees or stores a face image. The phone decides whether it asks for face, fingerprint or screen lock; the web page cannot force "face only". Pattern and face need a secure context (HTTPS or localhost).

**Storage:** localStorage `ksv.finalLock.v1.<userId>` (pattern hash, credential id, failure counter, lock time). `<userId>` comes from `getCurrentUser()` in `src/lib/auth.ts` (localStorage `ksv_current_user`), or the text `local` when there is no user. Verified by a search of src/: `saveSession()` is defined in `src/lib/auth.ts` but is never called, so `ksv_current_user` is never written and `getCurrentUser()` returns null. The Final Lock user id is therefore always the text `local`: every account used on the same browser shares one pattern and one face credential.

**Important:** this is a LOCAL gate. Face results are not verified by a server, and clearing site data resets the pattern, the counter and the lock. It protects against someone picking up a phone that is already signed in. It does not replace the account password or MFA.

Not verified: face scan enrollment and unlock have not been confirmed on a real phone yet.

### 5. Account sign-in and passwords
- **Login** (`src/views/LoginView.tsx`): email + password. If the account has MFA, a second step asks for the 6-digit code ("Enter the code from your authenticator app" or "Enter the code sent to <masked destination>"); wrong codes show the remaining attempts.
- **Register** (`src/views/RegisterView.tsx`): first name, last name, organization name, email, password, confirm password. The client requires a password of at least 6 characters with letter/number/symbol checks (exact rule not read) and a matching confirmation. The server repeats these checks.
- **Change password** (Settings > Security, `ChangePasswordCard.tsx`): hold the button (10 s), then enter the current password, the new password (at least 12 characters in the UI) and a confirmation. The new password must differ from the current one (UI check). The card is meant to call `POST /api/auth/password/change`; the wiring in SettingsView was not read.
- **MFA (server):** TOTP with an authenticator app, or an OTP by SMS or email. Endpoints: `/api/auth/mfa/enroll`, `/enroll/confirm`, `/disable`, `/verify`. TOTP is verified with otplib. SMS/email delivery was not inspected.
- **Account recovery (server):** `/api/recovery/initiate` -> `/otp/verify` -> `/password/reset` (and `/cancel`). The OTP is stored as an HMAC with an expiry and an attempt limit; a reset signs out all sessions of that user. No email/SMS provider is configured: outside development the code is not delivered, and in development it is printed in the server console.
- **Server rules that are verified:** passwords are hashed with bcrypt (cost 12); access token 15 minutes and refresh token 7 days by default (separate secrets); auth routes are limited to 5 requests per 15 minutes (in memory); protected routes use `authenticate`, which checks only the JWT.

### 6. The 9 sign-up programs (Google, Facebook, TikTok, Apple, Microsoft, GitHub, X, LinkedIn, PayPal)
`src/components/ProviderSelectScreen.tsx` shows a "Sign up with" screen with these 9 buttons before the Register form.

**Current state: they are placeholders.** Choosing one only moves to the Register form: App.tsx ignores the chosen value (`onSelect={() => setProviderChosen(true)}`), RegisterView does not receive it, and the register request sends only email, password, first name, last name and organization name. There is no OAuth, no account check, and nothing is stored about the choice. The Login screen has no provider buttons. Server-side provider handling was not checked.

Do not describe these buttons as working social login until OAuth is really implemented.

### 7. Do / Next / Do not
**Do**
- Keep the order Login -> Hold to unlock -> Location -> Final Lock. Any new lock must fail closed (deny when unsure).
- Treat the client locks as convenience gates. Real security is the server: bcrypt, JWT, MFA, rate limits, RBAC.
- Test on the phone at `localhost:5173` (localhost counts as a secure context).
- Record only what was actually read or tested; mark the rest "not verified".

**Next (suggested, not done)**
1. Test face scan on the phone: enable it after a correct pattern, then unlock with "Scan face".
2. Decide about the 9 provider buttons: implement real OAuth (and pass the provider to register) or remove them / label them "coming soon".
3. Make `authenticate` check the session (or shorten the access token), because a token stays valid after logout or password change until it expires.
4. Password change: enforce the 12-character rule on the server, add a rate limit, and revoke other sessions.
5. Token refresh: verified by a search of src/ that nothing stores the refresh token (LoginView and RegisterView save only the access token), so the web app cannot use `/api/auth/token/refresh`. What the app does when the 15-minute access token expires was not verified (see `src/lib/api.ts`). Decide: store the refresh token and refresh silently, or accept a new login.
6. Call `saveSession` (or write `ksv_current_user`) at login and register, so the Final Lock user id is the real account id and accounts on one device do not share a pattern.
7. Fix or remove the "Argon2id" text in Settings (the code uses bcrypt).
8. Configure an email/SMS provider for recovery and MFA codes.

**Do not**
- Do not remove or reorder a lock without recording it here.
- Do not present a feature as done if it was only discussed or not pushed.
- Do not put secrets or `.env` values in this file.
- Do not call the provider buttons working sign-in.
