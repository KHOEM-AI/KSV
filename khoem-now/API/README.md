# KSV Global Holdings - API & Data Architecture Rules

## Frontend & Backend Wiring
* **Frontend Wiring:** `src/views/SettingsView.tsx` → `src/lib/api.ts` → `/api/settings`
* **Test Account:** `admin@ksv.local` / `Admin123!` (Role: Owner, Org: KSV Global Holdings)

> ⚠️ **សំខាន់ណាស់សម្រាប់ការអភិវឌ្ឍន៍បន្ត — កុំបំបែកផ្លូវនេះ**

Repository នេះធ្លាប់មាន organization ២ ខុសគ្នា ក្នុង database តែមួយ (KSV Demo Org និង KSV Global Holdings) បង្កឡើងដោយ session អភិវឌ្ឍន៍ផ្សេងគ្នាដែលមិនបានសម្របសម្រួលគ្នា។ លទ្ធផលគឺ user login បាន ប៉ុន្តែ Settings/Devices/Audit មិនឃើញគ្នា ព្រោះខុស organizationId។ បញ្ហានេះត្រូវបានកែរួច (`fix-admin-org.ts`) ប៉ុន្តែ អាចកើតឡើងម្តងទៀត ប្រសិនបើ endpoint ថ្មីមិនប្រើ pattern ដូចគ្នា។

## ច្បាប់ចាំបាច់សម្រាប់ endpoint ថ្មីៗទាំងអស់
1. ត្រូវប្រើ `req.user.organizationId` ជានិច្ចសម្រាប់ scope ទិន្នន័យ organization-level (មិនមែន hardcode ឈ្មោះ org ដូច `seed-devices.ts` ធ្លាប់ធ្វើ)
2. កុំបង្កើត organization ថ្មីនៅក្នុង seed script ដោយមិនឆែកមុនថាមាន org ណាមួយប្រើស្រាប់ក្នុង `.env`/test account
3. មុននឹង commit endpoint ថ្មី សូម verify ដោយ curl ជាមួយ `admin@ksv.local` token ថាទិន្នន័យត្រឡប់មកត្រូវនឹង organization `6a9e7ea3176a7202190df575`
4. បើ session ថ្មីត្រូវការ seed data បន្ថែម សូមប្រើ `Organization.findOne({ _id: "6a9e7ea3176a7202190df575" })` មិនមែន `findOne({ name: "..." })` ព្រោះឈ្មោះអាចប្រែប្រួល

*ហេតុអ្វីសំខាន់:* ការជួសជុល "ដើរខុសផ្លូវ" បន្ទាប់ពី feature ជាច្រើនត្រូវបានសាងសង់ ពិបាកជាងការចាំគោលការណ៍នេះតាំងពីដើម ។ Session ណាមួយដែលបន្ថែម domain ថ្មី (device, audit, security ។ល។) ត្រូវអាន section នេះជាមុន។

## Seed Scripts Summary
* `scripts/seed-admin-user.mjs` — បង្កើត user ដំបូង
* `scripts/seed-org-for-admin.mjs` — ភ្ជាប់ org ទៅ user (កំណែចាស់ — បង្កើត org ថ្មីរាល់ដង ប្រុងប្រយ័ត្ន)
* `seed-devices.ts` — Seed devices ចូល "KSV Global Holdings"
* `fix-admin-org.ts` — Utility ភ្ជាប់ admin ទៅ org ត្រឹមត្រូវ (ប្រើក្នុងករណីមាន org ច្រើនកន្លែងច្រឡំ)

*កែប្រែចុងក្រោយ:* 2026-09-09 — Login → Settings → Devices → Audit verified ភ្ជាប់គ្នាលើ organization តែមួយ
