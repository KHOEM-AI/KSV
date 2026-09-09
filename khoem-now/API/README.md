# KSV API — Implementation Status

ថតនេះមាន file ជាច្រើនដែលពិពណ៌នា API របស់ KSV Universal Secure Control Platform។ ឯកសារនេះកត់ត្រាថាតើផ្នែកណាដែល **ដំណើរការជាក់ស្តែង** ហើយផ្នែកណានៅតែជា **spec/blueprint** ប៉ុណ្ណោះ។

## ✅ ដំណើរការជាក់ស្តែង (verified ដោយ curl)

| Endpoint | Method | ស្ថានភាព |
|---|---|---|
| `/api/auth/login/password` | POST | ✅ verified — ត្រឡប់ JWT token ត្រឹមត្រូវ |
| `/api/settings` | GET/PUT | ✅ verified — organization-level, MongoDB |
| `/api/certificates` | GET/POST | ✅ verified |
| `/api/users` | POST | ✅ implemented (Owner only) |
| `/api/devices/:id/commands` | POST | ✅ implemented |

**Frontend wiring**: `src/views/SettingsView.tsx` → `src/lib/api.ts` → `/api/settings` ពិតប្រាកដ

## ⏳ Spec ប៉ុណ្ណោះ

File ភាគច្រើនក្នុងថតនេះមានតែ `interface`/`type`/route string constant — មិនទាន់ mount ចូល `server.ts` ទេ។

## Seed Scripts

- `scripts/seed-admin-user.mjs`
- `scripts/seed-org-for-admin.mjs`

---
*កែប្រែចុងក្រោយ: 2026-09-08*
