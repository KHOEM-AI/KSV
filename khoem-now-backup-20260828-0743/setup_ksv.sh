#!/data/data/com.termux/files/usr/bin/bash
set -e
cd ~
mkdir -p khoem-now
cd khoem-now

mkdir -p "API"
mkdir -p "APP"
mkdir -p "AUDIT"
mkdir -p "AUTH"
mkdir -p "AUTOMATION"
mkdir -p "COMMAND"
mkdir -p "CONFIG"
mkdir -p "DATABASE"
mkdir -p "DEVICES"
mkdir -p "DOCUMENTATION"
mkdir -p "GATEWAY"
mkdir -p "INTERNATIONAL"
mkdir -p "NOTIFICATION"
mkdir -p "ORGANIZATION"
mkdir -p "PROTOCOLS"
mkdir -p "SAFETY"
mkdir -p "SECURITY"
mkdir -p "TESTS"
mkdir -p "USERS"
mkdir -p "src"
mkdir -p "src/components"

cat << 'KSVEOF' > ".gitignore"
node_modules
dist
.env
*.log
KSVEOF

cat << 'KSVEOF' > "API/README.md"
# API — ច្រកចូល Backend

API មិនគួរជា endpoint ធំមួយឯកសារតែមួយទេ (មិនមែន master-api.ts)។
ត្រូវបែងជា Domain ដើម្បីឱ្យគ្រប់គ្រងបានងាយ ទោះ Project ធំឡើងកម្រិតណាក៏ដោយ។

## Domains
- Identity API
- Authentication API
- Account API
- Authorization API
- Organization API
- Device API
- Discovery API
- Pairing API
- Protocol API
- Gateway API
- Command API
- Automation API
- Safety API
- Security API
- Audit API
- Notification API
- International API
- Administration API
KSVEOF

cat << 'KSVEOF' > "APP/README.md"
# APP — Presentation Layer

ថតនេះផ្ទុកតែផ្នែក UI/ទំព័រដែល User ឃើញប៉ុណ្ណោះ។
UI **មិនត្រូវមានសិទ្ធិ** ហៅទៅបញ្ជា Device ដោយផ្ទាល់ ដោយរំលង Security/API។

## ទំព័រដែលគួរមាន
- Home
- Login / Register
- Account / Profile
- Dashboard
- Devices / Device Details / Device Pairing / Device Scanner
- Permissions
- Organizations
- Automation
- Security
- Activity
- Notifications
- Settings (Language / Country / Time Zone)
- Help
- Emergency

## ឯកសារឧទាហរណ៍
- `../src/App.tsx` — KSV Operations Dashboard (React + Vite, ដំណើរការសាកល្បងបានហើយ)
KSVEOF

cat << 'KSVEOF' > "AUDIT/README.md"
# AUDIT — Security & Activity Logging

រាល់ប្រតិបត្តិការសំខាន់ៗត្រូវកត់ត្រា៖
- WHO (User identity)
- WHAT (Action performed)
- WHICH DEVICE
- WHEN (Time)
- WHERE / Context (Session info)
- AUTHORIZED? (Authorization result)
- RESULT (Command result)

## ច្បាប់សំខាន់
**Password និង Secret មិនត្រូវរក្សាទុកក្នុង Audit Log ជាដាច់ខាត។**

Log ក៏គួរគ្របដណ្តប់៖ Security events, Permission changes,
Device pairing events, Account recovery events, Administrative actions
KSVEOF

cat << 'KSVEOF' > "AUTH/README.md"
# AUTH — អ្នកណា? (Identity & Authentication)

## Registration / Login
- Email, Phone (Country-specific), Google, Facebook, TikTok, Identity Provider ផ្សេងទៀត
- KSV ត្រូវញែក Identity ចេញពី Authentication Provider
- KSV មិនត្រូវការ password ខាងក្រៅរបស់អ្នកប្រើ (ប្រើ OAuth / OpenID Connect)

## Session & MFA
- Multi-Factor Authentication
- Session management, Refresh tokens
- Login history, Failed-login protection, Brute-force protection
- Suspicious-login detection, Device/session revocation

## Password Privacy (ច្បាប់តឹងរឹង)
- Administrator **មិនអាចមើល password ដើម** របស់ User បានទាល់តែសោះ
- Password មិនត្រូវលេចនៅ dashboard, logs, API, database, support tools

## Account Recovery
Flow: Forgot Password → Verify (Email/Phone/Identity Provider/OTP) → New Password
(មិនបង្ហាញ password ចាស់ឡើយ)
- OTP: expire ក្រោមរយៈពេលខ្លី, ប្រើបានតែម្តង, កំណត់ចំនួនព្យាយាម
KSVEOF

cat << 'KSVEOF' > "AUTOMATION/README.md"
# AUTOMATION — Automation Engine

```
IF condition THEN action
```
ឧទាហរណ៍៖ Time-based, Sensor-based, Location-based,
Device-state-based, Schedule, Event-based

**សំខាន់**: Automation ក៏ត្រូវឆ្លង Permission + Safety Policy ដូចគ្នា
ហើយមិនត្រូវមានសិទ្ធិខ្ពស់ជាង Owner Policy ទេ។
KSVEOF

cat << 'KSVEOF' > "COMMAND/README.md"
# COMMAND — Command Engine

```
User Command
 ↓
Authentication
 ↓
Authorization
 ↓
Device Capability
 ↓
Safety Policy
 ↓
Execute
 ↓
Result
 ↓
Audit
```

Components: Command parser, Command validation, Device capability check,
Permission check, Safety check, Command execution, Error handling,
Command timeout, Retry policy

## AI Command Layer (Optional)
```
Natural Language → AI Interpretation → Structured Command →
Authorization → Safety → Execution
```
AI មានតួនាទី **បកស្រាយ** ប៉ុណ្ណោះ មិនមែនអ្នករំលង Security ទេ។
KSVEOF

cat << 'KSVEOF' > "CONFIG/README.md"
# CONFIG — System Configuration

ថតនេះសម្រាប់ការកំណត់ប្រព័ន្ធ/Environment (មិនមែន Secret ពិតប្រាកដ)៖
- Global platform configuration
- Regional settings defaults
- Service availability flags
- Global policies

ចំណាំ: Key/API secrets ពិតប្រាកដមិនត្រូវរក្សាទុកនៅទីនេះទេ — ត្រូវប្រើ
dedicated secret manager (មើល `../SECURITY/README.md`)។
KSVEOF

cat << 'KSVEOF' > "DATABASE/README.md"
# DATABASE — Data Architecture

ត្រូវបែងចែកទិន្នន័យជា domain (កុំដាក់អ្វីៗទាំងអស់ក្នុង Table មួយ)៖

- Users / Identities
- Organizations
- Devices / Device capabilities
- Credentials references (មិនមែន secret ផ្ទាល់)
- Permissions / Policies
- Commands / Events
- Audit logs / Security events
- Notifications
- Countries / Languages / Time zones

**Credential/Secrets** ត្រូវគ្រប់គ្រងដោយ dedicated Key/Secret Management
(មិនដាក់ plain text ក្នុង database ទេ — សូមមើល `../SECURITY/README.md`)
KSVEOF

cat << 'KSVEOF' > "DEVICES/README.md"
# DEVICES — Device Identity & Capability

## Device Identity
Device ID, Manufacturer, Brand, Model, Serial number, Device type,
Firmware/Hardware version, Owner, Organization owner, Status, Security state

## Device Capability System
KSV មិនត្រូវសួរតែថា "នេះជា TV" ប៉ុន្តែត្រូវដឹងថា "TV នេះអាចធ្វើអ្វីខ្លះ"
ឧទាហរណ៍៖ Power / Volume / Channel / Input / Display / Network

## Device Categories (ពង្រីកបានគ្មានដែនកំណត់)
- Home: Light, Fan, AC, TV, Speaker, Refrigerator, Washing machine, Smart lock
- Building: Gate, Garage, Door, Elevator, Access control, Parking, HVAC, Security
- Vehicle: Car, EV, Fleet, Authorized vehicle systems
- Industrial: Machine, Motor, Pump, Sensor, Controller, Robot, PLC, Conveyor
- Warehouse: Door, Scanner, Conveyor, Sensors, Automation equipment
- Energy: Solar, Inverter, Battery, Meter, Energy controller

## Device Ownership
Individual / Family / Company / Factory / Warehouse / Building / Organization
- Ownership transfer, Permission delegation & revocation

## Device Lifecycle
Discovered → Verified → Paired → Active → Updated → Suspended → Revoked → Removed

## Firmware / Update System
Version management, Compatibility check, Signed updates, Rollback,
Update authorization, Failed-update recovery, Update history

## Discovery & Pairing (សំខាន់)
Discovery Engine (Bluetooth/Wi-Fi/Local Network/QR/NFC/Gateway/Cloud)
**Found Device ≠ Authorized Device**

Pairing Flow:
SCAN → DEVICE FOUND → IDENTITY VERIFIED → OWNER VERIFIED →
PAIRING → PERMISSION → SECURE CONNECTION → READY
KSVEOF

cat << 'KSVEOF' > "DOCUMENTATION/ARCHITECTURE.md"
# KSV — Master Architecture

## 12 Master Domains
1. Global & International
2. Identity & Account
3. Authentication & Recovery
4. Authorization & Ownership
5. Organization & Enterprise
6. Device Intelligence
7. Connectivity & Protocols
8. Command & Automation
9. Security & Key Management
10. Safety & Emergency
11. Monitoring, Audit & Recovery
12. Infrastructure, Compliance & Scalability

## Final Architecture Flow
```
                         KSV
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
   INTERNATIONAL                       GOVERNANCE
        │                                   │
 Country / Language / Timezone       Legal / Privacy / Compliance
        │
        ▼
   IDENTITY & ACCOUNT
        │
        ▼
   AUTHENTICATION
        │
        ▼
   AUTHORIZATION
        │
        ▼
   ORGANIZATION / OWNERSHIP
        │
        ▼
   DEVICE IDENTITY
        │
        ▼
   DEVICE DISCOVERY / PAIRING
        │
        ▼
   PROTOCOL / GATEWAY LAYER
        │
        ▼
   COMMAND ENGINE
        │
        ├──────────────┐
        ▼              ▼
     SAFETY         AUTOMATION
        │              │
        └──────┬───────┘
               ▼
          DEVICE CONTROL
               │
               ▼
        AUDIT / MONITORING
               │
               ▼
       INCIDENT / RECOVERY
```

## The Most Important Security Rule
> No single credential, account, API, administrator, device, or security layer
> should automatically have unlimited control over the entire platform.

## Command Flow (Detail)
```
User Command
 ↓
Authentication
 ↓
Authorization
 ↓
Device Capability
 ↓
Safety Policy
 ↓
Execute
 ↓
Result
 ↓
Audit
```

## Password / Secret Separation
- **User Password** → User-controlled secret (KSV/Admin មិនអាចមើលបាន)
- **Platform Secrets** → KSV-controlled secrets (API keys, service credentials)
- **Device Credentials** → Device/Owner-controlled credentials

## Folder Rule
`KSV/khoem-now/` ជា Project Root តែមួយ។ មិនបង្កើត Root ថ្មីទៀត
(project1, backend2, frontend2 ។ល។)។ ការពង្រីកទាំងអស់ធ្វើក្នុង subfolder
តាម Domain ប៉ុណ្ណោះ។
KSVEOF

cat << 'KSVEOF' > "GATEWAY/README.md"
# GATEWAY — Edge System

សម្រាប់ឧបករណ៍ដែលមិនអាចភ្ជាប់ Cloud ដោយផ្ទាល់ (ផ្ទះ, រោងចក្រ, ឃ្លាំង, Local Network)

```
KSV Cloud
     ↓
KSV Gateway
 ├── Bluetooth
 ├── Wi-Fi
 ├── IR
 ├── MQTT
 └── Local Devices
```

Gateway ជា **ស្ពាន** មិនមែនជា Security bypass ទេ។
ត្រូវគាំទ្រ Offline operation + Local security + Reconnection synchronization។
KSVEOF

cat << 'KSVEOF' > "INTERNATIONAL/README.md"
# INTERNATIONAL — Global Platform

KSV ត្រូវប្រតិបត្តិការក្នុងប្រមាណ 195 ប្រទេស។

**ចំណុចសំខាន់**: Country ≠ Language ≠ Time Zone
(ប្រទេសមួយអាចមានភាសាច្រើន និង Time Zone ច្រើន)

## Selection Flow
```
Language 🌐 → Country 🌍 → Time Zone 🕐
```

## ត្រូវមាន
- Country registry / Country codes
- Languages (Khmer, English, Thai, Chinese, Japanese, Korean, ...)
- Time zones (Asia/Phnom_Penh, Asia/Bangkok, Asia/Tokyo, America/New_York, ...)
- Date/Number formats, Measurement units
- Localization & Translation management (បំបែក content ចេញពី application logic)

## Data Governance
195 ប្រទេស = 195 environments ផ្លូវច្បាប់ដែលអាចខុសគ្នា
(Privacy laws, Data residency, Consent, Retention, User deletion, Children's data)
មិនមែនគ្រាន់តែបកប្រែភាសាទេ។
KSVEOF

cat << 'KSVEOF' > "NOTIFICATION/README.md"
# NOTIFICATION — Notification System

## ប្រភេទការជូនដំណឹង
- Security alerts, Login alerts
- Device alerts (offline/online), Permission changes
- Command failures, Emergency alerts
- Account recovery notifications

## Channels
App / Email / SMS / Push notification
KSVEOF

cat << 'KSVEOF' > "ORGANIZATION/README.md"
# ORGANIZATION — Company & Enterprise

```
Organization
 ├── Users
 ├── Roles
 ├── Sites
 │    ├── Buildings
 │    ├── Rooms
 │    └── Devices
 ├── Policies
 └── Audit
```

ធាតុផ្សំ: Organization, Company, Department, Site, Building, Room/Zone,
Team, Employee, Organization roles, Organization policies

នេះធ្វើឱ្យ KSV ប្រើបានទាំង **Personal** (Smart Home) និង **Enterprise/Industrial**។

## Permission Levels
Owner, Super Administrator, Organization Administrator, Manager,
Operator, Controller, Viewer, Guest, Temporary Permission

## Policy-Based Access Control
```
Who + What + Which Device + Where + When + Under What Conditions
```
ឧទាហរណ៍៖ Operator អាចបើកម៉ាស៊ីន A បានតែម៉ោង 8AM–5PM និងតែនៅ Factory A។
KSVEOF

cat << 'KSVEOF' > "PROTOCOLS/README.md"
# PROTOCOLS — Universal Protocol Layer

KSV ត្រូវរៀបជាស្រទាប់ (មិនបង្ខំគ្រប់ឧបករណ៍ឱ្យប្រើ protocol ដូចគ្នា)៖
- Bluetooth
- Wi-Fi / Internet / HTTPS-API
- MQTT
- Infrared
- Local network protocols
- Manufacturer-provided APIs

## Protocol Abstraction
```
Device Type → Manufacturer → Protocol → Authentication → Authorization → Command
```

```
KSV Command
     ↓
Protocol Adapter
     ↓
Bluetooth / Wi-Fi / API / MQTT / IR
     ↓
Manufacturer Device
```

នេះជាអ្វីដែលធ្វើឱ្យ "Universal Control" អាចកើតឡើងបាន ដោយមិនចាំបាច់សរសេរប្រព័ន្ធថ្មី
ជារៀងរាល់ពេលបន្ថែម manufacturer ថ្មី។
KSVEOF

cat << 'KSVEOF' > "README.md"
# KSV — Universal Secure Control Platform

## តើ KSV ជាអ្វី?
KSV ជាប្រព័ន្ធអន្តរជាតិសម្រាប់ត្រួតពិនិត្យ និងបញ្ជាឧបករណ៍អេឡិចត្រូនិកគ្រប់ប្រភេទ
(ផ្ទះឆ្លាតវៃ អគារ រថយន្ត ឃ្លាំង រោងចក្រ) ដោយសុវត្ថិភាព និងមានការអនុញ្ញាតត្រឹមត្រូវ។

KSV **មិនត្រូវបានរចនាឡើងដើម្បីរំលង ចូលដោយខុសច្បាប់ ឬលួចចូលឧបករណ៍** ឡើយ។
វាដំណើរការតែតាមរយៈ interface, protocol, credential, API និងយន្តការផ្គូផ្គង
ដែលម្ចាស់ឧបករណ៍ ឬក្រុមហ៊ុនផលិតបានផ្តល់ ឬអនុញ្ញាតតែប៉ុណ្ណោះ។

## គោលការណ៍ស្នូល (Core Philosophy)
1. Identity First
2. Authorization First
3. Security First
4. Privacy First
5. Safety First
6. Control Only With Permission

> **A user may discover a device, but discovery never means authorization.**

## រចនាសម្ព័ន្ធ Project (Folder Structure)
Root តែមួយ៖ `khoem-now/` — មិនបង្កើត Project Root ផ្សេងទៀត (project1, backend2 ។ល។)
ខាងក្នុងបែងចែកជា Module តាម Domain៖

| Folder | ការទទួលខុសត្រូវ |
|---|---|
| `APP/` | ទំព័រ/អេក្រង់ដែល User ឃើញ (Presentation Layer តែប៉ុណ្ណោះ) |
| `API/` | ច្រកចូល backend បែងជា domain (Identity, Device, Command ។ល។) |
| `AUTH/` | គណនី, Login, MFA, Session, Account Recovery |
| `SECURITY/` | Encryption, Key Management, Security Monitoring, Incident Response |
| `DEVICES/` | អត្តសញ្ញាណ + សមត្ថភាពឧបករណ៍ (Device Identity & Capability) |
| `GATEWAY/` | ស្ពានតភ្ជាប់ឧបករណ៍ Local (Bluetooth/Wi-Fi/IR/MQTT) |
| `PROTOCOLS/` | ស្រទាប់បកប្រែរវាង KSV និងពិធីការនីមួយៗ |
| `COMMAND/` | Command Engine — បកប្រែ ការបញ្ជា → ត្រួតពិនិត្យ → ប្រតិបត្តិ |
| `AUTOMATION/` | ច្បាប់ IF/THEN, schedule, sensor-based automation |
| `SAFETY/` | Safety Engine ដាច់ដោយឡែកពី Security |
| `USERS/` | គណនីអ្នកប្រើប្រាស់ និង Identity |
| `ORGANIZATION/` | ក្រុមហ៊ុន, Site, Building, Team, Role |
| `INTERNATIONAL/` | 195 ប្រទេស, ភាសា, Time Zone, Localization |
| `AUDIT/` | កំណត់ត្រាសកម្មភាពសំខាន់ៗទាំងអស់ |
| `NOTIFICATION/` | ការជូនដំណឹង App/Email/SMS/Push |
| `DATABASE/` | គំរូទិន្នន័យបែងតាម Domain |
| `CONFIG/` | ការកំណត់ប្រព័ន្ធ/Environment |
| `TESTS/` | Unit, Integration, Security, Device-compatibility tests |
| `DOCUMENTATION/` | Architecture, API spec, Security/Permission/Device model |

មើលលម្អិតនីមួយៗនៅក្នុងឯកសារ `README.md` ក្នុងថតនីមួយៗ
និង `DOCUMENTATION/ARCHITECTURE.md` សម្រាប់ Diagram ពេញលេញ។

## ស្ថានភាពបច្ចុប្បន្ន
នេះជា **ដំណាក់កាល Architecture / Documentation** — កំណត់រចនាសម្ព័ន្ធ និងតម្រូវការ
ជាមុនសិន មុននឹងសរសេរ code ផ្នែក Backend/API ពេញលេញ។
ក្នុងថត `APP/` មានឧទាហរណ៍ Dashboard UI ដំបូង (React + Vite) ដែលអាច `npm run dev` បាន។
KSVEOF

cat << 'KSVEOF' > "SAFETY/README.md"
# SAFETY — Safety Engine (ដាច់ដោយឡែកពី Security)

Security ≠ Safety។ សម្រាប់ Door, Machine, Vehicle, Industrial Equipment
ត្រូវមាន Safety Engine ដាច់ដោយឡែក៖

```
User Authorized ✓
        ↓
Security Check ✓
        ↓
Safety Check ✗
        ↓
COMMAND BLOCKED
```

Components: Safety policies, Operating limits, Interlocks,
Emergency stop integration, Approval requirements, Safe-state behavior,
Conflict detection, Human confirmation where required

មានសិទ្ធិប្រើប្រាស់ មិនមានន័យថា គ្រប់ពេលអាចបញ្ជាបានទេ។
KSVEOF

cat << 'KSVEOF' > "SECURITY/README.md"
# SECURITY — បន្ទាយការពារ

## Security Core
Encryption, TLS, Secrets Management, Key/Certificate Management,
Token Security, Session Security, API Security, Rate Limiting,
Abuse Prevention, Zero-trust, Device Trust

## Key & Secret Management
- ដាច់ដោយឡែកពី Application Database
- គ្រប់គ្រង API keys, Device keys, Certificates, OAuth secrets
- Key rotation / expiration / revocation
- Password/Secret មិនបង្ហាញក្នុង Admin Dashboard ឬ Logs

## Security Monitoring
Detect → Alert → Block → Investigate → Recover
- Suspicious login, Repeated failed login, Abnormal commands,
  Permission abuse, Account takeover indicators, Device compromise indicators

## Incident Response
Disable account / Revoke session / Revoke device / Revoke permission /
Rotate keys / Block activity / Isolate device / Alert admin / Preserve evidence

## Security Testing (មុន Deploy)
Vulnerability scanning, Dependency scanning, Secure code review,
Penetration testing, Threat modeling, Incident simulation
KSVEOF

cat << 'KSVEOF' > "TESTS/README.md"
# TESTS — Testing & Verification

មុននឹងនិយាយថា "Ready" ត្រូវមាន Test សម្រាប់៖
- Account / Authentication / Authorization
- Device pairing / Device discovery
- API
- Commands / Safety
- Security (Vulnerability scanning, Penetration testing, Threat modeling)
- Failure recovery
- International settings

គោលដៅមិនមែននិយាយថា "Hack មិនបាន" ទេ — គោលដៅគឺ
**"Assume breach, minimize impact, detect quickly, recover safely."**
KSVEOF

cat << 'KSVEOF' > "USERS/README.md"
# USERS — Identity System

"អ្នកណា?"

- KSV Account, User ID
- Email / Phone identity, Google / Facebook / TikTok identity
- Account linking / unlinking
- Identity verification
- Account status / suspension / deletion

គោលការណ៍៖ **One KSV Account → Multiple Verified Identities**

## Personal Model
```
User → Home → Devices
```
KSVEOF

cat << 'KSVEOF' > "index.html"
<!doctype html>
<html lang="km">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>KSV — Universal Secure Control Platform</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
KSVEOF

cat << 'KSVEOF' > "package.json"
{
  "name": "ksv",
  "version": "1.0.0",
  "description": "KSV Universal Secure Control Platform - International device control platform (Architecture & Documentation stage)",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.383.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.1",
    "typescript": "^5.4.5",
    "vite": "^5.2.0",
    "@vitejs/plugin-react": "^4.2.1",
    "tailwindcss": "^3.4.3",
    "postcss": "^8.4.38",
    "autoprefixer": "^10.4.19"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/KHOEM-AI/KSV.git"
  },
  "license": "ISC",
  "homepage": "https://github.com/KHOEM-AI/KSV#readme"
}
KSVEOF

cat << 'KSVEOF' > "postcss.config.js"
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
KSVEOF

cat << 'KSVEOF' > "src/App.tsx"
import React from 'react';
import { Shield, Activity, Cpu, Globe, Server } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-blue-400">KSV Operations Dashboard</h1>
          <p className="text-xs text-slate-400">Universal Secure Control Platform</p>
        </div>
        <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full border border-emerald-500/20">
          System Active
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <Cpu className="w-4 h-4" />
            <span className="text-xs font-medium">Devices</span>
          </div>
          <p className="text-lg font-bold">12,847</p>
          <span className="text-[10px] text-emerald-400">↑ 2.4%</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-medium">Safety Rules</span>
          </div>
          <p className="text-lg font-bold">342</p>
          <span className="text-[10px] text-emerald-400">↑ 12 new</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <Server className="w-4 h-4" />
            <span className="text-xs font-medium">Gateways</span>
          </div>
          <p className="text-lg font-bold">86 <span className="text-xs text-slate-500 font-normal">/ 87</span></p>
          <span className="text-[10px] text-rose-400">↓ 1 offline</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center gap-2 text-purple-400 mb-1">
            <Globe className="w-4 h-4" />
            <span className="text-xs font-medium">Countries</span>
          </div>
          <p className="text-lg font-bold">41 <span className="text-xs text-slate-500 font-normal">/ 195</span></p>
          <span className="text-[10px] text-emerald-400">↑ 3 added</span>
        </div>
      </div>

      {/* Protocol Health */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl mb-6">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" /> Protocol Health
        </h2>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
            <span>Bluetooth</span>
            <span className="text-emerald-400 font-mono">99.97%</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
            <span>Wi-Fi</span>
            <span className="text-emerald-400 font-mono">99.92%</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span>MQTT</span>
            <span className="text-emerald-400 font-mono">99.99%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
KSVEOF

cat << 'KSVEOF' > "src/index.css"
@tailwind base;
@tailwind components;
@tailwind utilities;
KSVEOF

cat << 'KSVEOF' > "src/main.tsx"
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
KSVEOF

cat << 'KSVEOF' > "tailwind.config.js"
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
KSVEOF

cat << 'KSVEOF' > "tsconfig.json"
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}
KSVEOF

cat << 'KSVEOF' > "vite.config.ts"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
KSVEOF

echo "KSV project structure created successfully at ~/khoem-now"
