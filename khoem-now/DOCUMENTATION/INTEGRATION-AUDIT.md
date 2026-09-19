
## Update 2026-09-20 (client vs server)
- `npm run server` runs src/server.ts (monolithic, 85 route calls, 63 unique paths, 0 imports from src/modules).
- src/modules + src/routes/index.ts + src/server/server.ts form a SECOND, unused server stack (not run by any npm script).
- Client contract (src/lib/api.ts): 227 unique paths. About 190 have NO matching server route (full list: DOCUMENTATION/CLIENT_SERVER_COMPARE.md).
- Server routes not called by client: POST /certificates, /vocabulary*, /health, /version, POST /users, /audit/logs, /protocols, /notifications, /discovery/devices, /international/languages, /safety/events, billing invoice download.
- FIXED: 11 routes (ai/*, gateways) were under /api/v1 while client uses /api. Now all /api. Backup: archive/backup-20260920/. constants.ts API_BASE_URL aligned to /api.
- OPEN: KhoemAIPanel.tsx fetches /api/v1/ai-brain/recent-decisions; no such route exists on server.
- OPEN: `tsc -p tsconfig.app.json` = 39 errors, tsconfig.node.json = 0. (`tsc -p .` checks nothing: files=[])
- Fully missing on server: recovery, admin, telemetry ingest, push, files, reports/export, webhooks/integrations, geo, tickets/maintenance, pairing, automation (only GET rules), authz (only check), most of auth (MFA/sessions/refresh/logout/oauth), security keys/encrypt/decrypt, device-groups/firmware/quarantine, gateway status/sync.

## Update 2026-09-20 (tsc fixes)
- tsc app errors 39 -> re-check below. Fixes: req.params / req.user.organizationId casts in src/modules controllers, AIWelcomeBanner language cast, error-handler import path in src/app/app.ts, bcrypt -> bcryptjs, JWT secret casts, src/server/server.ts db import path.
- Backups: archive/backup-20260920/
- NOTE: src/modules stack is NOT run by npm run server; fixes only keep it compilable.

## Result 2026-09-20 (after fixes)
- `tsc -p tsconfig.app.json`: 0 errors. Server restarted, prefix unified to /api (verified by curl).
- Next: implement missing routes in src/server.ts following API/*.ts contracts (see CLIENT_SERVER_COMPARE.md).

## Update 2026-09-20 (auth routes added to src/server.ts)
- Added (block KSV-AUTH-SESSIONS): POST /api/auth/token/refresh (rotating refresh + reuse detection), POST /api/auth/logout, GET /api/auth/sessions, DELETE /api/auth/sessions/:sessionId.
- Verified by curl: sessions 401, logout 401, refresh 400 (empty body), revoke 401 (no token).
- Still missing in auth: MFA (enroll/confirm/verify/disable/challenge/methods), login/oauth.
- SECURITY TODO: MQTT uses public broker test.mosquitto.org -> move to private broker + auth + TLS.
- Backup: archive/backup-20260920/server-before-auth.ts

## Update 2026-09-20 (safety routes)
- Added (block KSV-SAFETY-ROUTES in src/server.ts): POST/GET/PUT/DELETE /api/safety/rules[/:ruleId], POST /api/safety/rules/:ruleId/enable|disable, GET /api/safety/events/:eventId, GET/POST /api/safety/emergency-stop, POST /api/safety/emergency-stop/release (Manager+).
- Guard KSV-ESTOP-GUARD in the device command route: active emergency stop => 423 EMERGENCY_STOP_ACTIVE, Command saved as blocked, audit BLOCKED.
- Verified end-to-end on test device (DEV-5004): activate 201, command 423, duplicate 409, release 200, active stops 0.
- Only one dispatch path exists (gatewayDispatcher.dispatch in the command route); no other publish() in core/ or infrastructure/.
- Rule schema is minimal (name, category, severity, isEnabled, triggerCount); contract fields (conditions/actions/description) are NOT persisted yet.
- Not yet implemented: POST /safety/check, /safety/devices, /safety/devices/:deviceId.
- Still open: AI interpret/confirm path must be checked to ensure it goes through the command route guard; MFA, pairing, automation routes; MQTT on public broker test.mosquitto.org.
