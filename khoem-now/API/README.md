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
