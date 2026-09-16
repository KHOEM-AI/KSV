# i18n Progress — Map View Translation

## គោលដៅ
បន្ថែម `nav.map` និង 12 key `view.map.*` ទៅគ្រប់ភាសាទាំង 29 ក្នុង `translations.ts`។
Key ទាំងអស់ត្រូវការសម្រាប់ទំព័រ Map View (`src/views/MapView.tsx`, `src/components/nav_v1.tsx`)។

## របៀបធ្វើការងារនេះ (សម្រាប់បន្តភាសាថ្មី)
1. រកលេខបន្ទាត់ `nav.devices` ក្នុងភាសាគោលដៅ:
   `grep -n "'nav.devices': '<translated text>'" src/i18n/translations.ts`
2. បន្ថែម `nav.map` បន្ទាប់ពី `nav.devices`:
   `sed -i "<line>a\\  'nav.map': '<translation>',"  src/i18n/translations.ts`
3. រកលេខបន្ទាត់ចុងក្រោយ (key `intl.nighttime`) និង `};` របស់ block នោះ
4. បញ្ចូល 12 key `view.map.*` មុន `};` ដោយប្រើ `sed -i "<line>a\\..."`
5. ត្រួតពិនិត្យ: `npx tsc --noEmit --skipLibCheck 2>&1 | grep -i translations` (ត្រូវទទេ = ជោគជ័យ)
6. `git add -A && git commit -m "..." && git push origin main`

## Key ទាំង 13 ដែលត្រូវបញ្ចូលរាល់ភាសា
## ភាសាដែលធ្វើរួចហើយ ✅ (19/29)
- [x] en — English
- [x] km — Khmer (ភាសាខ្មែរ)
- [x] zh — Chinese (中文)
- [x] ja — Japanese (日本語)
- [x] th — Thai (ไทย)
- [x] ko — Korean (한국어)
- [x] fr — French (Français)
- [x] es — Spanish (Español)
- [x] vi — Vietnamese (Tiếng Việt)
- [x] ar — Arabic (العربية)
- [x] de — German (Deutsch)
- [x] it — Italian (Italiano)
- [x] ru — Russian (Русский)
- [x] pt — Portuguese (Português)
- [x] hi — Hindi (हिन्दी)
- [x] id — Indonesian (Bahasa Indonesia)
- [x] tr — Turkish (Türkçe)
- [x] nl — Dutch (Nederlands)
- [x] pl — Polish (Polski)

## ភាសានៅសល់ ⏳ (10/29)
- [ ] sv — Swedish (Svenska)
- [ ] bn — Bengali (বাংলা)
- [ ] ur — Urdu (اردو)
- [ ] ms — Malay (Bahasa Melayu)
- [ ] tl — Filipino (Filipino)
- [ ] my — Burmese (မြန်မာ)
- [ ] lo — Lao (ລາວ)
- [ ] el — Greek (Ελληνικά)
- [ ] he — Hebrew (עברית)
- [ ] uk — Ukrainian (Українська)
- [ ] cs — Czech (Čeština)

## ចំណាំសំខាន់
- `filter.critical` key មិនប្រើក្នុងកូដទេ — កុំបញ្ចូល (បានពិនិត្យតាម `grep -rn "filter.critical" src/`)
- Folder `src/i18n/locales/*.txt` មានឯកសារខ្លះខុសភាសា (ឧ. `en.txt` ជា Spanish, `km.txt` ជា Korean) — កុំទុកចិត្តលើ folder នេះ ត្រូវផ្ទៀងផ្ទាត់ដោយផ្ទាល់ជានិច្ច
- Fallback ចូល English ដោយស្វ័យប្រវត្តិសម្រាប់ key ខ្វះ (មើល `translate()` function ចុងឯកសារ `translations.ts`)
