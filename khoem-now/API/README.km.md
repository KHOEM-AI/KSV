# KSV API — ស្ថានភាពការងារ (ខ្មែរ)

> ជាការបកប្រែនៃផ្នែក "Implementation Status — 2026-09-20 (English)" ក្នុង `API/README.md` និង `DOCUMENTATION/healthcare-robotics.md`។
> **កំណែអង់គ្លេសជាឯកសារផ្លូវការ។** បើមានភាពខុសគ្នា សូមយកកំណែអង់គ្លេសជាគោល។ ពាក្យបច្ចេកទេសទុកជាអង់គ្លេស។

## ស្ថានភាពការងារ 2026-09-20

### បានធ្វើ និងផ្ទៀងផ្ទាត់ហើយ
(route ឆ្លើយ `401` ពេលគ្មាន token · server ចាប់ផ្តើមស្អាត · `tsc` = 0 error)

| Domain | អ្វីដែលមាន | ចំណាំ |
|---|---|---|
| Auth / MFA | TOTP MFA (enroll, confirm, disable, verify), login ២ ជំហាន | `otplib` v13 (functional API) |
| Registration | `POST /api/auth/register` បង្កើត Organization + user តួនាទី `OrgAdmin` | មិនដែលបង្កើត `Owner` (platform superuser) |
| Client gates | App Lock (សង្កត់ដើម្បីដោះសោ), ជ្រើស Provider (UI ប៉ុណ្ណោះ មិនមែន OAuth ពិត), Location Gate | `POST /api/auth/location` រក្សា `lastKnownLocation` |
| Pairing | model `PairingSession`; start / get / verify-owner / confirm / cancel; បញ្ជី device ដែល pair; unpair | proof រក្សាជា SHA-256 ប៉ុណ្ណោះ, ប្រៀបធៀបបែប timing-safe, ព្យាយាមបាន ៥ ដង, ផុតកំណត់ ១០ នាទី |
| Automation rules | CRUD + enable/disable | rule ចាប់ផ្តើមជា **disabled** |
| Automation engine | ដំណើរការ rule តាមម៉ោង | **បិទជាលំនាំដើម** (មើលខាងក្រោម) |
| Scenes | CRUD + activate | រាល់ action ឆ្លង e-stop guard → Safety Engine → dispatch → audit។ `bypassSafety` ត្រូវបានបដិសេធ |
| Safety | `POST /api/safety/check` (dry-run), `GET /api/safety/devices`, `criticality` របស់ device | dry-run មិនបង្កើត command ហើយមិនបញ្ជូនទៅ device |

### Device criticality (គោលនយោបាយសុវត្ថិភាព)

`Device.criticality` ជាមួយក្នុងចំណោម `life_support | clinical | robot_mobile | facility | consumer` (លំនាំដើម `facility`)។
Safety Engine ពិនិត្យវា **មុន** ច្បាប់ក្នុង database ដូច្នេះមិនអាចបិទដោយកែ rule បានទេ៖

- device `life_support` ជា **read-only** ក្នុង KSV (អនុញ្ញាតតែ `READ_STATUS`, `GET_STATUS`, `READ_TELEMETRY`, `PING`)។ command បញ្ជាទាំងអស់ត្រូវបាន block
- device `life_support` មិនអាចដាក់ក្នុង scene ឬ automation បានទេ
- តម្លៃ criticality ដែលមិនស្គាល់ត្រូវបាន block (fail closed)

### Automation engine (2026-09-20)

- ឯកសារ៖ `src/core/automation/automation.engine.ts`។ គាំទ្រតែ trigger តាមម៉ោង៖ `{ type: "time_of_day", time: "HH:MM", daysOfWeek?, timezone? }` (ទម្រង់ចាស់ `{ type: "time", value: "HH:MM" }` ក៏ទទួលដែរ)
- **បិទជាលំនាំដើម។** ដាក់ `AUTOMATION_ENGINE=on` ក្នុង `.env` ដើម្បីបើក (ពិនិត្យរាល់ ៣០ វិនាទី)
- command ស្វ័យប្រវត្តិ **មិនមានសិទ្ធិលើសពីធម្មតា**៖ e-stop guard → criticality / Safety Engine → gateway dispatch → audit (audit `userId` ជា `null`)។ `life_support` មិនដំណើរការ។ គ្មាន bypass
- rule មួយដំណើរការយ៉ាងច្រើនម្តងក្នុងមួយនាទី (claim បែប atomic តាម `lastRunKey`)។ នាទីដែលខកខាន (server ដាច់) មិនត្រូវបានដំណើរការជំនួសទេ។ timezone មិនត្រឹមត្រូវ មិនដំណើរការ (fail closed)
- លទ្ធផលសាកល្បង (device DEV-5004)៖ ផ្លូវ claim → guard → dispatch → audit ដំណើរការ តែ command បរាជ័យ `PROTOCOL_NOT_CONFIGURED` ព្រោះ device សាកល្បងគ្មាន protocol។ **ផ្លូវជោគជ័យ (ACK ពី device) មិនទាន់ត្រូវបានសាកល្បង**។ script៖ `scripts/engine-smoke-test.ts`

### ដែនកំណត់ដែលត្រូវដឹង (កុំមើលរំលង)

1. MQTT នៅតែភ្ជាប់ `test.mosquitto.org` (broker សាធារណៈ)។ ត្រូវប្តូរទៅ broker ផ្ទាល់ខ្លួន + username/password + TLS មុនប្រើជាមួយ device ពិត
2. `verify-owner` របស់ Pairing ប្រៀបធៀបតែ proof ដែល user បញ្ចូល។ ការផ្ទៀងផ្ទាត់ជាមួយ device ពិត (PIN / QR / certificate) ត្រូវការ Gateway / Protocol adapter
3. Scene activation ជា partial-success៖ action ដែលត្រូវ block មិនបញ្ឈប់ action ដែលនៅសល់ (លទ្ធផលរាយការណ៍ម្តងមួយ action)
4. `authRateLimiter` នៅក្នុង memory (ត្រូវ reset ពេល restart)
5. `ActionType` ត្រូវបានប្រកាសទាំងក្នុង `API/authorization.ts` និង `API/automation.ts`។ កុំ import ទាំងពីរក្នុង file តែមួយ
6. server stack ស្ទួនក្នុង `src/modules/*`, `src/routes/index.ts`, `src/server/server.ts` **មិនត្រូវបានប្រើ** ដោយ `npm run server`

### នៅសល់ត្រូវធ្វើ

- ពង្រីក Automation engine លើសពី trigger តាមម៉ោង (sensor, device state, location) ហើយសាកល្បងជាមួយ device ដែលមាន protocol
- OAuth ពិត (ត្រូវការ Client ID/Secret ក្នុងមួយ provider)
- Domain ដែលខ្វះលើ server៖ recovery, admin, telemetry, push, files, reports, webhooks, geo, tickets
- `KhoemAIPanel.tsx` ហៅ `/api/v1/ai-brain/recent-decisions` ដែលមិនទាន់មានលើ server
- ការតភ្ជាប់ Healthcare / Robotics (មើល `DOCUMENTATION/healthcare-robotics.md`)

---

## គំរូសុវត្ថិភាព Healthcare និង Robotics (សង្ខេប)

ស្ថានភាព៖ ឯកសារការរចនា។ មានតែគោលនយោបាយ `criticality` ប៉ុណ្ណោះដែលបានអនុវត្ត។

**គោលការណ៍៖** ការរកឃើញមិនមែនជាការអនុញ្ញាត ហើយការអនុញ្ញាតក៏មិនមែនជាសុវត្ថិភាពដែរ។ ក្នុងវិស័យសុខាភិបាល ការបញ្ជាខុសអាចធ្វើឱ្យបាត់បង់ជីវិត។

| កម្រិត (`criticality`) | ឧទាហរណ៍ | របៀបដែល KSV ដោះស្រាយ |
|---|---|---|
| `life_support` | ventilator, ប្រព័ន្ធអុកស៊ីសែន, infusion pump | **Read-only។** តាមដាន និង alarm ប៉ុណ្ណោះ។ គ្មានការបញ្ជាពីចម្ងាយ |
| `clinical` | គ្រែអ្នកជំងឺ, ឧបករណ៍បន្ទប់ពិនិត្យ | បញ្ជាបានតែជាមួយតួនាទី clinician + ភ្ជាប់ជាមួយអ្នកជំងឺច្បាស់លាស់ + បញ្ជាក់ដោយមនុស្សទី ២ (គ្រោងទុក) |
| `robot_mobile` | robot ដឹកជញ្ជូន រុញរទេះ សម្អាត | កិច្ចការកម្រិតខ្ពស់ប៉ុណ្ណោះ; តំបន់/geofence ត្រូវបានបង្ខំដោយ Safety Engine (គ្រោងទុក) |
| `facility` | ភ្លើង, HVAC, ទ្វារ, ជណ្តើរយន្ត, ចំណតរថយន្ត | លំហូរ permission + safety ធម្មតា |
| `consumer` | ឧបករណ៍ប្រើក្នុងផ្ទះ | លំហូរ permission + safety ធម្មតា |

ការបញ្ជា life-support ពីចម្ងាយ មិនត្រូវឆ្លងកាត់ផ្លូវ command ទូទៅទេ។ បើចាំបាច់នៅថ្ងៃក្រោយ ត្រូវប្រើ integration ដែលក្រុមហ៊ុនផលិតបានបញ្ជាក់ និងមានវិញ្ញាបនបត្រ (ឧ. HL7 FHIR, IEEE 11073) ជាមួយការពិនិត្យផ្នែកវេជ្ជសាស្ត្រ និងច្បាប់។ ស្តង់ដារពាក់ព័ន្ធមាន FDA, CE, ISO 13485, IEC 62304។ KSV មិនទាន់មានវិញ្ញាបនបត្រទាំងនេះទេ។

**លក្ខខណ្ឌមុនបញ្ជាឧបករណ៍ព្យាបាល៖**
1. អត្តសញ្ញាណដែលមានឈ្មោះ និងផ្ទៀងផ្ទាត់ ជាមួយតួនាទី clinician (least privilege; គ្មានគណនីរួម)
2. ការភ្ជាប់ច្បាស់លាស់រវាងអ្នកប្រតិបត្តិ និងអ្នកជំងឺ/ទ្រព្យសម្បត្តិ
3. ការបញ្ជាក់ដោយមនុស្សទី ២ សម្រាប់សកម្មភាពហានិភ័យខ្ពស់
4. សុវត្ថិភាព local/offline៖ Cloud ឬ network ដាច់ មិនត្រូវរំខានអុកស៊ីសែន ឬ life support
5. Audit ពេញលេញ (អ្នកណា, អ្វី, device ណា, ពេលណា, លទ្ធផល) ហើយមិនដាក់ secret ឬទិន្នន័យអ្នកជំងឺក្នុង log
6. ទិន្នន័យអ្នកជំងឺ (PHI) ត្រូវការពារតាមច្បាប់ (ឧ. HIPAA, PDPA) មុនរក្សាទុក
7. Automation, AI ឬអ្នកជំងឺខ្លួនឯង មិនត្រូវអាចបិទ ឬកែ life-support បានឡើយ

**Robot ជា device៖** robot ជាប្រភេទ device ថ្មីក្នុងប្រព័ន្ធ Device / Capability ដដែល មិនមែនប្រព័ន្ធថ្មីទេ។ robot នីមួយៗមាន identity និងសិទ្ធិតូចបំផុតរបស់ខ្លួន (មិនមែនសិទ្ធិ admin)។ KSV ផ្ញើតែកិច្ចការកម្រិតខ្ពស់ (ឧ. "ដឹកថ្នាំ order #12 ទៅបន្ទប់ 5") មិនបញ្ជាចលនាផ្ទាល់ពី Cloud ទេ។ emergency stop និងការជៀសការបុកត្រូវនៅលើ robot ផ្ទាល់។ ការដឹកថ្នាំត្រូវផ្ទៀងផ្ទាត់ order + អ្នកជំងឺ + មនុស្សបញ្ជាក់ពេលប្រគល់ ហើយ audit ទាំងអស់។ Protocol adapter (ឧ. ROS 2, VDA5050, MQTT) ស្ថិតក្នុង Protocol Layer។

**កន្លែងចាប់ផ្តើមដែលហានិភ័យទាប៖** តាមដានតែមើល (កម្រិត/សម្ពាធអុកស៊ីសែន, ស្ថានភាព device, battery, alarm) · ជូនដំណឹងបុគ្គលិក (អុកស៊ីសែនជិតអស់, device offline) · ប្រព័ន្ធអគារ (ភ្លើង, HVAC, ទ្វារ, access control, ជណ្តើរយន្ត, ចំណត) · ការថែទាំ (ticket, ប្រវត្តិជួសជុល, ផុតកំណត់ calibration, asset tracking) · Audit និងរបាយការណ៍អនុលោមភាព។
