# KH — សេចក្តីណែនាំសម្រាប់ AI/Developer បន្ត (KSV Backend)
កាលបរិច្ឆេទ: ៣១ សីហា ២០២៦

## ⚠️ ច្បាប់សំខាន់បំផុត
1. **ថ្ងៃនេះកែតែ ២ ទំព័រ/project: KSV និង CAI ប៉ុណ្ណោះ** — កុំប៉ះ AI, KI project ដទៃ
2. **កុំកែពីរផ្នែកក្នុងពេលដំណាលគ្នា** (Termux + bolt.new) ដោយមិន `git pull` មុន
3. Server terminal (`npm run server`) **ត្រូវទុករត់ជាប់ ១ terminal ដាច់ដោយឡែក** កុំចុច Ctrl+C ចោល
4. **កុំបង្ហាញ/ចម្លងមាតិកា `.env` ជាទាំងមូល** — សុំតែ `grep "^KEY="` ដើម្បីមើលឈ្មោះ key ប៉ុណ្ណោះ

## ស្ថានភាពបច្ចុប្បន្ន — KSV Backend
- Express + MongoDB (Mongoose) — `src/server.ts`
- Database ភ្ជាប់ជោគជ័យ (`DATABASE_URL` ក្នុង `.env`)
- Server រត់លើ **port 3000** (`.env`: `PORT=3000`)
- `~/.bashrc` ធ្លាប់មាន `export PORT=5000` ២ដង ដែលបណ្តាលឱ្យ port ខុស — **បានលុបរួច**
- `bcryptjs` import ត្រឹមត្រូវរួច (មិនមែន `bcrypt`)
- Models: User, Session, Organization, Site, Device, Discovery, Command, AutomationRule,
  Gateway, Protocol, SafetyRule, SafetyLog, DeviceLog, Event, AuditLog, Country, Language,
  **Certificate** (បន្ថែមដោយយើង)

## បញ្ហាកំពុងដោះស្រាយ — "Chicken-egg" User Bootstrap
- `/api/users` (POST) ត្រូវការ `authenticate` + `requireMinRole("Owner")`
- មានន័យថា **ត្រូវការ Owner ស្រាប់ ដើម្បីបង្កើត Owner ដំបូង** — មិនអាចប្រើ API ធម្មតាបានទេ
- ដំណោះស្រាយ៖ សរសេរ **bootstrap script** ដាច់ដោយឡែក ដែលភ្ជាប់ MongoDB ដោយផ្ទាល់ (រំលង Express/auth) សម្រាប់បង្កើត user ដំបូងម្តងគត់

## ជំហានបន្ទាប់ (តាមលំដាប់)
1. សរសេរ `scripts/bootstrap-owner.mjs` — ភ្ជាប់ Mongoose ដោយផ្ទាល់ (import bcryptjs) បង្កើត User role "Owner" ដំបូង
2. Login ជា Owner នោះ ដើម្បីទទួល JWT token
3. ប្រើ token នោះហៅ `/api/certificates` (POST) បញ្ចូល certificate ៧១ (៤៧+២៤) ពិតរបស់ Khoem Soksivutha

## របៀបរត់ Server (Termux)
Terminal A (ទុករត់ជាប់):
cd ~/KSV/khoem-now
cat > KH.md << 'MDEOF'
# KH — សេចក្តីណែនាំសម្រាប់ AI/Developer បន្ត (KSV Backend)
កាលបរិច្ឆេទ: ៣១ សីហា ២០២៦

## ⚠️ ច្បាប់សំខាន់បំផុត
1. **ថ្ងៃនេះកែតែ ២ ទំព័រ/project: KSV និង CAI ប៉ុណ្ណោះ** — កុំប៉ះ AI, KI project ដទៃ
2. **កុំកែពីរផ្នែកក្នុងពេលដំណាលគ្នា** (Termux + bolt.new) ដោយមិន `git pull` មុន
3. Server terminal (`npm run server`) **ត្រូវទុករត់ជាប់ ១ terminal ដាច់ដោយឡែក** កុំចុច Ctrl+C ចោល
4. **កុំបង្ហាញ/ចម្លងមាតិកា `.env` ជាទាំងមូល** — សុំតែ `grep "^KEY="` ដើម្បីមើលឈ្មោះ key ប៉ុណ្ណោះ

## ស្ថានភាពបច្ចុប្បន្ន — KSV Backend
- Express + MongoDB (Mongoose) — `src/server.ts`
- Database ភ្ជាប់ជោគជ័យ (`DATABASE_URL` ក្នុង `.env`)
- Server រត់លើ **port 3000** (`.env`: `PORT=3000`)
- `~/.bashrc` ធ្លាប់មាន `export PORT=5000` ២ដង ដែលបណ្តាលឱ្យ port ខុស — **បានលុបរួច**
- Models: User, Session, Organization, Site, Device, Discovery, Command, AutomationRule,
  Gateway, Protocol, SafetyRule, SafetyLog, DeviceLog, Event, AuditLog, Country, Language,
  **Certificate** (បន្ថែមដោយយើង)

## បញ្ហាកំពុងដោះស្រាយ — "Chicken-egg" User Bootstrap
- `/api/users` (POST) ត្រូវការ `authenticate` + `requireMinRole("Owner")`
- មានន័យថា **ត្រូវការ Owner ស្រាប់ ដើម្បីបង្កើត Owner ដំបូង** — មិនអាចប្រើ API ធម្មតាបានទេ
- ដំណោះស្រាយ៖ សរសេរ **bootstrap script** ដាច់ដោយឡែក ដែលភ្ជាប់ MongoDB ដោយផ្ទាល់ (រំលង Express/auth) សម្រាប់បង្កើត user ដំបូងម្តងគត់
- **កំពុងឆែក**: `package.json` មាន `bcryptjs` (មិនមែន `bcrypt`) ប៉ុន្តែ `server.ts` សរសេរ `bcrypt.hash(...)` — ត្រូវឆែក `grep -n "bcrypt" src/server.ts` ថាតើ importត្រឹមត្រូវឬអត់ មុននឹងបន្ត

## ជំហានបន្ទាប់ (តាមលំដាប់)
1. ឆែក `import bcrypt` ក្នុង `src/server.ts` — កែឱ្យត្រូវនឹង `bcryptjs` ប្រសិនបើខុស
2. សរសេរ `scripts/bootstrap-owner.mjs` — ភ្ជាប់ Mongoose ដោយផ្ទាល់ បង្កើត User role "Owner" ដំបូង
3. Login ជា Owner នោះ ដើម្បីទទួល JWT token
4. ប្រើ token នោះហៅ `/api/certificates` (POST) បញ្ចូល certificate ៧១ (៤៧+២៤) ពិតរបស់ Khoem Soksivutha

## របៀបរត់ Server (Termux)
Terminal A (ទុករត់ជាប់):
Terminal B (សម្រាប់ពាក្យបញ្ជាផ្សេង, `curl`, `sed` ។ល។):
## Repo ពាក់ព័ន្ធ
- KSV: https://github.com/KHOEM-AI/KSV.git (project កំពុងកែថ្ងៃនេះ)
- CAI: (project ទីពីរដែលបងចង់កែថ្ងៃនេះ — មិនទាន់ចាប់ផ្តើម)
