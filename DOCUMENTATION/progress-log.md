---

## 📋 Progress Log — Language & i18n System

> កំណត់ត្រានេះសម្រាប់ជួយ AI/Developer ជំនួយការនាពេលអនាគត ឲ្យដឹងថាអ្វីខ្លះបានធ្វើរួច ជៀសវាងកែខុសពីប្រព័ន្ធដែលមានស្រាប់។

### ✅ ថ្ងៃទី 29 សីហា 2026 — Bug Fixes & i18n Verification

**បញ្ហារកឃើញ និងដោះស្រាយ:**
1. Merge conflict រវាង `khoem-now/src/App.tsx` និង `ksv.ts` — ដោះស្រាយដោយ `git pull --no-rebase` + resolve conflict
2. បន្ថែម `CountryClock` component (`src/components/CountryClock.tsx`) — ជ្រើសរើសប្រទេស + បង្ហាញម៉ោងតាម timezone ក្នុង header
3. តភ្ជាប់ Sidebar labels (`nav.tsx`) ចូល `t()` translation system ក្នុង `App.tsx` — កែ `.label`/`.title`/`.subtitle` → `t(.labelKey)`/`t(.titleKey)`/`t(.subtitleKey)`
4. **DevicesView.tsx bug**: Key mismatch រវាងកូដ (`devices.registry.title`) និង `translations.ts` (`view.devices.registryTitle`) — កូដប្រើ dot-notation ខុសពី camelCase ដែលមានស្រាប់។ បានកែ key ឲ្យត្រូវគ្នា + បន្ថែម `view.devices.status.*` (online/warning/offline/maintenance) ដែលខ្វះទាំងស្រុងក្នុង `translations.ts`

**ការផ្ទៀងផ្ទាត់ (Verified 100% correct, no changes needed):**
- ✅ DashboardView.tsx
- ✅ ControlsView.tsx
- ✅ ProtocolsView.tsx
- ✅ GatewayView.tsx
- ✅ SecurityView.tsx
- ✅ OrganizationView.tsx
- ✅ CertificatesView.tsx
- ✅ SettingsView.tsx
- ✅ AuditView.tsx
- ✅ SafetyView.tsx
- ✅ InternationalView.tsx (គាំទ្រ 11 ភាសា: km, en, ja, zh, th, ko, fr, es, vi, ar)

**គោលការណ៍សំខាន់សម្រាប់ការងារបន្ត:**
- Key naming convention **មិនស្មើគ្នា** រវាង view — មួយចំនួនប្រើ `view.xxx.yyy` (dot), មួយចំនួនប្រើ `view.xxx.yyyKey` (camelCase)។ **តែងឆែក `translations.ts` ជាមុន** មុននឹងសន្មតទម្រង់ key ណាមួយ
- មុននឹងកែ view ណាមួយ ប្រើ `grep -o "t('[^']*')" <file> | sort -u` ដើម្បីទាញ key ទាំងអស់ រួច `grep` ប្រៀបធៀបជាមួយ `translations.ts`
- ឈ្មោះឧបករណ៍ (device names), rule names, event codes (UNLOCK, LOGIN_ATTEMPT ។ល។) **មិនត្រូវបកប្រែ** ព្រោះជាទិន្នន័យ មិនមែនអត្ថបទ UI

**Commits ថ្ងៃនេះ:**
- `feat: add country/timezone clock selector to header`
- `feat: connect sidebar/header labels to translation system`
- `fix: correct devices view translation key mismatches`

---
