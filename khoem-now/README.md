# KSV — Migration & Security Progress

## ស្ថានភាពបច្ចុប្បន្ន (Architecture)

KSV កំពុងធ្វើ migration ពី monolith (`src/server.ts`, កំពុងរត់ជាក់ស្តែងឥឡូវ)
ទៅជា modular architecture (`src/modules/**`, `src/app/app.ts`, `src/server/server.ts`).

⚠️ **សំខាន់**: `package.json` script `"server"` នៅតែចង្អុលទៅ `src/server.ts`
(monolith ចាស់)។ Modular path (`src/modules/**`) **មិនទាន់ដំណើរការជាក់ស្តែងទេ**
រហូតដល់ប្តូរ `package.json` ទៅ `src/server/server.ts`។

## ✅ Module ធ្វើរួច (org-scoping + RBAC + Safety)

### `src/modules/command/`
- [x] Repository/Service/Controller/Routes — org-scoped (findByCommandId, listRecent, list)
- [x] កែ field name bug (`req.user.userId` → `req.user.id`, `orgId` → `organizationId`)
- [x] បិទ client-supplied `orgId` privilege escalation (ពី query string)
- [x] បន្ថែម `requirePermission` RBAC (device:read / device:command)
- [x] ភ្ជាប់ Safety Engine ចូល `dispatch()` — លែង auto-ALLOW គ្រប់ command ទៀត
- [ ] root file ចាស់ `src/modules/command/command.routes.ts` (orphan, មិនប្រើ) — មិនទាន់លុប

### `src/modules/device/`
- [x] Repository — `update`/`delete` ត្រូវការ `orgId` match
- [x] Service — `getById`/`update`/`delete`/`list`/`getMapDevices` ទទួល orgId ពី caller
- [x] Controller — កែ field name bug, បិទ client-supplied `orgId` ក្នុង `register()`
- [x] Routes — បន្ថែម `requirePermission` (device:read / device:pair / device:manage)

## 🔲 Module មិនទាន់ audit (ប្រហែលមាន pattern ដូចគ្នា)

- [x] `src/modules/discovery/` — org-scoping + RBAC ធ្វើរួច
- [x] `src/modules/identity/` — field name, updateProfile allow-list, JWT secret, token claims (sub/role/organizationId) ធ្វើរួច; នៅសល់៖ requirePermission សម្រាប់ /me និងភ្ជាប់ organizationId ជាមួយ organization module
- [ ] `src/modules/organization/`
- [ ] `src/modules/safety/`
- [ ] `src/modules/communication/gateway/`
- [ ] `src/modules/communication/protocol/`

## 🔲 ការងារធំមិនទាន់ធ្វើ

- [ ] ប្តូរ `package.json` `"server"` script ទៅ `src/server/server.ts` (ដាក់ modular ដំណើរការជាក់ស្តែង)
- [ ] ធ្វើ integration test ប្រៀបធៀប monolith vs modular មុននឹងប្តូរ
- [ ] លុប orphan/duplicate files (command.routes.ts root)
- [ ] Cloud AI (Claude) feature ក្នុង KSV — code សរសេររួច (`khoem-ai-llm.ts`) ប៉ុន្តែ block ដោយគ្មាន API credit ($5-10 minimum)

## ចំណាំសម្រាប់ AI/developer ក្រោយ

កំណត់ត្រា pattern bug ដែលរកឃើញម្តងហើយម្តងទៀត — ពេល audit module ថ្មី សូមពិនិត្យ ៤ ចំណុចនេះជានិច្ច៖
1. Repository method ណាមួយ query ដោយ `_id`/`deviceId`/`commandId` តែឯង គ្មាន `organizationId` filter?
2. `orgId` មកពី `req.query`/`req.body` (client-supplied) ជំនួសឱ្យ `req.user.organizationId`?
3. Controller ប្រើ `req.user?.userId`/`orgId` (field name ខុស) ជំនួស `req.user!.id`/`organizationId`?
4. Route មានតែ `authenticate` គ្មាន `requirePermission`?
