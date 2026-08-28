### 🌐 KSV

# KSV — Universal Secure Control Platform
### Master Architecture & Specification (Pre-Code Blueprint)

> **KSV/khoem-now/** គឺជា Project Root តែមួយគត់សម្រាប់ប្រព័ន្ធទាំងមូល។
> មិនបង្កើត Root ច្រើន (project1, backend2, frontend2 ។ល។) ទេ — គ្រប់ domain ត្រូវរស់នៅជា subfolder ក្នុង `khoem-now/`។

---

## តារាងមាតិកា (Table of Contents)

- [0. Mission & Core Principles](#0-mission--core-principles)
- [1. Global Platform](#1-global-platform)
- [2. Identity System](#2-identity-system)
- [3. Authentication System](#3-authentication-system)
- [4. Account Recovery](#4-account-recovery)
- [5. Authorization System](#5-authorization-system)
- [6. Organization System](#6-organization-system)
- [7. Device Identity](#7-device-identity)
- [8. Device Capability System](#8-device-capability-system)
- [9. Device Discovery](#9-device-discovery)
- [10. Device Pairing](#10-device-pairing)
- [11. Device Ownership](#11-device-ownership)
- [12. Universal Protocol Layer](#12-universal-protocol-layer)
- [13. KSV Gateway / Edge System](#13-ksv-gateway--edge-system)
- [14. Command Engine](#14-command-engine)
- [15. AI Command Layer](#15-ai-command-layer)
- [16. Safety Engine](#16-safety-engine)
- [17. Security Core](#17-security-core)
- [18. Key & Secret Management](#18-key--secret-management)
- [19. Security Monitoring](#19-security-monitoring)
- [20. Audit System](#20-audit-system)
- [21. Incident Response](#21-incident-response)
- [22. Offline & Local Operation](#22-offline--local-operation)
- [23. Device Lifecycle](#23-device-lifecycle)
- [24. Firmware & Software Updates](#24-firmware--software-updates)
- [25. Device Categories](#25-device-categories)
- [26. International System](#26-international-system)
- [27. Privacy & Data Governance](#27-privacy--data-governance)
- [28. Legal & Compliance Layer](#28-legal--compliance-layer)
- [29. Notification System](#29-notification-system)
- [30. Dashboard / User Interface](#30-dashboard--user-interface)
- [31. Administration Console](#31-administration-console)
- [32. API Architecture](#32-api-architecture)
- [33. Automation Engine](#33-automation-engine)
- [34. Data & Database Architecture](#34-data--database-architecture)
- [35. Reliability & Scalability](#35-reliability--scalability)
- [36. Backup & Disaster Recovery](#36-backup--disaster-recovery)
- [37. Testing](#37-testing)
- [38. Security Testing](#38-security-testing)
- [39. Developer / Engineering Governance](#39-developer--engineering-governance)
- [40. Emergency Architecture](#40-emergency-architecture)
- [41. The Most Important Security Rule](#41-the-most-important-security-rule)
- [42. Final Architecture Diagram](#42-final-architecture-diagram)
- [Project Folder Structure](#project-folder-structure)
- [Password & Secret Ownership Model](#password--secret-ownership-model)
- [Certificates](#certificates)

---

## 0. Mission & Core Principles

ច្បាប់មូលដ្ឋានរបស់ប្រព័ន្ធ៖

- Security First
- Privacy First
- Safety First
- Authorization First
- Device Ownership
- Least Privilege
- No Unauthorized Control
- Every Important Action Is Auditable
- Fail Securely
- International by Design

> **គោលការណ៍ស្នូល៖** A user may discover a device, but discovery never means authorization.

---

## 1. Global Platform

ស្រទាប់ខាងលើបំផុត ត្រូវគ្រប់គ្រង៖

- Global platform identity & configuration
- Countries / Regions / Languages / Time zones / Currencies
- Regional settings
- Service availability
- Global policies
- Platform status

---

## 2. Identity System

*"អ្នកណា?"* — ត្រូវមាន៖

- KSV Account / User ID
- Email, Phone, Google, Facebook, TikTok, និង identity providers ផ្សេងទៀត
- Account linking / unlinking
- Identity verification
- Account status, suspension, deletion

> **គោលការណ៍៖** One KSV Account → Multiple Verified Identities

---

## 3. Authentication System

*"តើអ្នកណាកំពុង Login?"* — ត្រូវមាន៖

- Password authentication + secure hashing
- MFA, Email/Phone verification, OTP
- Session management, refresh tokens
- Login history
- Failed-login & brute-force protection
- Suspicious-login detection
- Device/session revocation

---

## 4. Account Recovery

- Forgot password → Email / Phone / Identity-provider recovery
- Six-digit OTP (expires quickly, single-use, limited attempts, brute-force protected)
- New password creation (មិនបង្ហាញ password ចាស់ឡើយ)
- Session revocation after recovery
- High-risk recovery verification

---

## 5. Authorization System

កំណត់ថា៖ **Who can do what, to which device, where, when, and under what conditions?**

កម្រិតសិទ្ធិដែលអាចមាន៖

Owner → Super Administrator → Organization Administrator → Manager → Operator → Controller → Viewer → Guest → Temporary Permission

បន្ថែម៖ permission expiration, revocation, approval workflow។

**Policy-Based Access Control** ឧទាហរណ៍៖ *"Operator អាចបើកម៉ាស៊ីន A បានតែម៉ោង 8AM–5PM និងតែនៅ Factory A"*.

---

## 6. Organization System

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

ត្រូវមាន Organization / Company / Department / Site / Building / Room-Zone / Team / Employee / Organization roles & policies.

---

## 7. Device Identity

- Device ID, Manufacturer, Brand, Model, Serial number
- Device type, Firmware/Hardware version
- Device owner / Organization owner
- Device status, capabilities, security state

---

## 8. Device Capability System

KSV មិនគួរដឹងតែថា *"នេះជា TV"* — ត្រូវដឹងថា *"TV នេះអាចធ្វើអ្វីខ្លះ"*៖

```
TV
 ├── Power
 ├── Volume
 ├── Channel
 ├── Input
 ├── Display
 └── Network
```

---

## 9. Device Discovery

រកឧបករណ៍តាម Bluetooth / Wi-Fi / Local network / QR / NFC / Manufacturer / Cloud / Gateway។

> **Discovery ≠ Permission**

---

## 10. Device Pairing

```
SCAN → DEVICE FOUND → IDENTITY VERIFIED → OWNER VERIFIED
     → PAIRING → PERMISSION → SECURE CONNECTION → READY
```

វិធីផ្ទៀងផ្ទាត់: device codes, QR, PIN, secure pairing, manufacturer credentials, certificates/keys, owner approval.

---

## 11. Device Ownership

ម្ចាស់អាចជា Individual / Family / Company / Building / Warehouse / Factory / Organization ផ្សេងទៀត។

ត្រូវមាន: ownership transfer, permission delegation & revocation។

---

## 12. Universal Protocol Layer

```
KSV Command → Protocol Adapter → Bluetooth / Wi-Fi / API / MQTT / IR → Manufacturer Device
```

Flow ស្តង់ដារ៖ **Device Type → Manufacturer → Protocol → Authentication → Authorization → Command**

---

## 13. KSV Gateway / Edge System

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

Gateway ជាស្ពាន មិនមែនជា Security bypass ទេ។

---

## 14. Command Engine

```
User Command → Authentication → Authorization
             → Device Capability → Safety Policy
             → Execute → Result → Audit
```

---

## 15. AI Command Layer

```
Natural Language → AI Interpretation → Structured Command
                 → Authorization → Safety → Execution
```

> AI មានតួនាទីបកស្រាយ (interpret) មិនមែនជាអ្នករំលង Security ទេ។

---

## 16. Safety Engine

Security ≠ Safety។ សម្រាប់ Door, Machine, Vehicle, Industrial Equipment៖

```
User Authorized ✓ → Security Check ✓ → Safety Check ✗ → COMMAND BLOCKED
```

ត្រូវមាន: operating limits, interlocks, emergency stop, approval requirements, conflict detection។

---

## 17. Security Core

Encryption, TLS, secrets management, key/certificate management, token & session security, API security, rate limiting, abuse prevention, zero-trust, device trust។

---

## 18. Key & Secret Management

គ្រប់គ្រង API keys, device keys, certificates, encryption keys, OAuth secrets — ជាមួយ key rotation, expiration, revocation។

> Password និង Secret មិនគួរបង្ហាញក្នុង Admin Dashboard ឬ Logs ឡើយ។

---

## 19. Security Monitoring

```
Detect → Alert → Block → Investigate → Recover
```

រកឃើញ: suspicious login, repeated failed login, abnormal commands, permission abuse, account/device compromise indicators។

---

## 20. Audit System

កត់ត្រា: User, Device, Action, Time, Authorization, Result, Security Event។

> **Password មិនត្រូវរក្សាទុកក្នុង Audit Log ជាដាច់ខាត។**

---

## 21. Incident Response

Disable account → Revoke session/device/permission → Rotate keys → Block activity → Isolate device/gateway → Alert admins → Preserve evidence → Recover service។

---

## 22. Offline & Local Operation

Cloud failure មិនគួរធ្វើឱ្យប្រព័ន្ធសុវត្ថិភាពក្លាយជាគ្រោះថ្នាក់ ជាពិសេសសម្រាប់ Door និង Industrial។ ត្រូវមាន local control, offline authorization, safe fallback, reconnection sync។

---

## 23. Device Lifecycle

```
Discovered → Verified → Paired → Active → Updated → Suspended → Revoked → Removed
```

---

## 24. Firmware & Software Updates

Version management, compatibility check, signed updates, authorization, rollback, failed-update recovery, update history។

---

## 25. Device Categories

| ប្រភេទ | ឧទាហរណ៍ |
|---|---|
| Home | Light, Fan, AC, TV, Speaker, Fridge, Washing machine, Smart lock |
| Building | Door, Gate, Elevator, Access control, Parking, HVAC, Lighting, Security |
| Vehicle | Car, EV, Fleet, Authorized vehicle systems |
| Industrial | Machine, Motor, Pump, Sensor, Controller, Robot, PLC, Conveyor |
| Warehouse | Door, Scanner, Conveyor, Sensors, Automation equipment |
| Energy | Solar, Inverter, Battery, Meter, Energy controller |

---

## 26. International System

Country registry, country codes, languages, time zones, date/number formats, measurement units, localization, translation management។

> **Country ≠ Language ≠ Time Zone** (ប្រទេសមួយអាចមានភាសា និង timezone ច្រើន)

---

## 27. Privacy & Data Governance

កំណត់: what data collected, why, retention period, who can access, consent, data deletion/export, regional data requirements។

195 countries = 195 regulatory environments — មិនមែនគ្រាន់តែជា 195 ប៊ូតុងភាសាទេ។

---

## 28. Legal & Compliance Layer

Terms of Service, Privacy Policy, Acceptable Use Policy, Device Authorization Agreement, regional compliance — ត្រូវឱ្យអ្នកជំនាញច្បាប់ពិនិត្យតាមប្រទេស/ទីផ្សារ។

---

## 29. Notification System

Security alerts, login alerts, device alerts, permission changes, emergency alerts — តាម App / Email / SMS / Push។

---

## 30. Dashboard / User Interface

Home, Devices, Rooms, Scenes, Automation, Security, Permissions, Activity, Notifications, Account, Language, Country, Time Zone។

---

## 31. Administration Console

Admin គ្រប់គ្រង Platform ប៉ុន្តែ **មិនមានសិទ្ធិមើល User Password**៖ user/organization/device/permission management, security monitoring, audit, system health, configuration។

---

## 32. API Architecture

API បែងជា Domain មិនមែន file ធំតែមួយ៖

```
API
├── Identity        ├── Command
├── Authentication   ├── Automation
├── Account          ├── Safety
├── Authorization     ├── Security
├── Organization      ├── Audit
├── Device            ├── Notification
├── Discovery         ├── International
├── Pairing           └── Administration
├── Protocol
└── Gateway
```

---

## 33. Automation Engine

```
IF condition THEN action
```

(Time-based, Sensor-based, Location-based, Device-state-based, Schedule, Event-based) — Automation ត្រូវឆ្លង Permission + Safety Policy ដូចគ្នា។

---

## 34. Data & Database Architecture

បែងទិន្នន័យតាម domain: Users, Identities, Organizations, Devices, Capabilities, Permissions, Policies, Commands, Events, Audit logs, Security events, Notifications, Countries, Languages, Time zones — កុំដាក់អ្វីៗទាំងអស់ក្នុង table មួយ។

---

## 35. Reliability & Scalability

Load balancing, horizontal scaling, queue systems, caching, database scaling, redundancy, health checks, failover, regional infrastructure។

---

## 36. Backup & Disaster Recovery

Encrypted backups, backup verification, recovery testing, RPO/RTO, multi-region strategy (level Enterprise)។

---

## 37. Testing

Unit, integration, API, device compatibility, authentication, authorization, security, load, failure, recovery, international-settings testing។

---

## 38. Security Testing

Vulnerability scanning, dependency scanning, secure code review, penetration testing, threat modeling, incident simulation, continuous monitoring។

> គោលដៅ: **"Assume breach, minimize impact, detect quickly, recover safely."**

---

## 39. Developer / Engineering Governance

Source-code repository, branch protection, code review, CI/CD, secrets protection, dependency management, release management, versioning, change approval, production access control។

---

## 40. Emergency Architecture

Emergency Control Plane អាច៖ Suspend dangerous commands, revoke compromised credentials, disable compromised devices, lock down organization, require re-auth, trigger alerts, preserve logs, restore trusted config។

---

## 41. The Most Important Security Rule

> **No single credential, account, API, administrator, device, or security layer should automatically have unlimited control over the entire platform.**

មានន័យថា បើចំណុចមួយត្រូវបាន compromise វាមិនគួរបើកផ្លូវទៅគ្រប់អ្វីទាំងអស់។

---

## 42. Final Architecture Diagram

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

### 12 Master Domains (សរុប)

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

> **កំណត់សម្គាល់៖** កុំចាប់ផ្តើមដោយបង្កើត API រាប់រយ Endpoint មុន។ គួរកំណត់ Security Model + Identity + Permission + Device Model + Protocol Model ជាមុន ព្រោះ ៥ ផ្នែកនេះជាគ្រឹះដែល API ទាំងមូលនឹងពឹងផ្អែក។

---

## Project Folder Structure

`KSV/khoem-now/` ជា Project Root តែមួយ — មិនបង្កើត Root ផ្សេងទៀត។

```
KSV/
└── khoem-now/
    ├── API              ← បែងតាម Domain (Identity, Device, Command, Safety...)
    ├── APP              ← Presentation Layer (UI screens) ប៉ុណ្ណោះ
    ├── AUTH              ← Registration, Login, MFA, OTP, Session, Recovery
    ├── SECURITY          ← Encryption, Session Security, Rate Limit, Audit
    ├── DEVICES           ← Device Identity, Capability, Status
    ├── GATEWAY           ← Edge Controller / Local Network Bridge
    ├── PROTOCOLS         ← Bluetooth, Wi-Fi, MQTT, IR Adapters
    ├── COMMAND           ← Command Engine (parse → validate → execute)
    ├── AUTOMATION        ← IF/THEN rules engine
    ├── SAFETY            ← Safety Engine (independent from Security)
    ├── USERS             ← User accounts & profiles
    ├── ORGANIZATION       ← Company → Site → Building → Device hierarchy
    ├── INTERNATIONAL      ← Country / Language / Timezone data & config
    ├── AUDIT              ← Immutable event logging
    ├── NOTIFICATION       ← Email / SMS / Push alerts
    ├── DATABASE           ← Schema, migrations
    ├── CONFIG             ← Environment & platform configuration
    ├── TESTS              ← Unit / integration / security tests
    └── DOCUMENTATION      ← Architecture, API spec, security & permission models
```

**APP** — ជា Presentation Layer ប៉ុណ្ណោះ (UI មិនត្រូវទៅបញ្ជា Device ដោយរំលង Security/API ទេ)៖ Home, Login, Register, Account, Dashboard, Devices, Device Pairing/Scanner, Permissions, Organizations, Automation, Security, Activity, Notifications, Settings, Language/Country/Timezone, Help, Emergency។

---

## Password & Secret Ownership Model

*"ខ្ញុំជាម្ចាស់ Project ប៉ុន្តែមិនមានសិទ្ធិមើល Password អតិថិជន"* — គោលការណ៍នេះបែងចែកជា ៣ ប្រភេទច្បាស់លាស់៖

| ថ្នាក់ | ទទួលខុសត្រូវ |
|---|---|
| **Platform Owner** | ≠ System Administrator ≠ User |
| **User Password** | → User-controlled secret (Admin មិនអាចមើលបានឡើយ) |
| **Platform secrets** | → KSV-controlled secrets (key/certificate management ដាច់ដោយឡែក) |
| **Device credentials** | → Device/owner-controlled credentials |

```
User → Password → Authentication Service → KSV
```

KSV មិនរក្សា ឬបង្ហាញ password ដើមរបស់អតិថិជនឡើយ សូម្បីតែ Administrator។ Forgot Password ត្រូវប្រើ OTP/Recovery Flow ដើម្បីបង្កើត password ថ្មី មិនមែនបង្ហាញ password ចាស់ទេ។

សម្រាប់ Identity Provider ខាងក្រៅ (Google, Apple, Microsoft ។ល។)៖

```
KSV
 │
 ├── Device Control
 ├── Authorization
 ├── Audit
 │
 └── Identity Provider
       └── Authentication
```

KSV ទទួលតែ identity/token ចាំបាច់តាម OAuth 2.0 / OpenID Connect — មិនប្រមូល external password ទេ។ ការទទួលខុសត្រូវផ្លូវច្បាប់កំណត់តាម Terms of Service, Privacy Policy, កិច្ចសន្យា និងច្បាប់ប្រទេស។

---

## Certificates

📜 [មើលវិញ្ញាបនបត្រ Sololearn ទាំងអស់](#) — សរុប **47 certificates**។

<details>
<summary>បញ្ជីវិញ្ញាបនបត្រទាំងអស់ (ចុចដើម្បីពង្រីក)</summary>

| # | Link |
|---|---|
| 1 | https://api2.sololearn.com/v2/certificates/CC-4WMNT8MZ/image/png |
| 2 | https://api2.sololearn.com/v2/certificates/CC-FQXPSLUW/image/png |
| 3 | https://api2.sololearn.com/v2/certificates/CC-T1WYSOHU/image/png |
| 4 | https://api2.sololearn.com/v2/certificates/CC-I6OFSBAU/image/png |
| 5 | https://api2.sololearn.com/v2/certificates/CC-IXX7OEVL/image/png |
| 6 | https://api2.sololearn.com/v2/certificates/CC-AYYCWFZD/image/png |
| 7 | https://api2.sololearn.com/v2/certificates/CC-3LIHOX01/image/png |
| 8 | https://api2.sololearn.com/v2/certificates/CC-HAW7ZIH5/image/png |
| 9 | https://api2.sololearn.com/v2/certificates/CC-U8DL49ZZ/image/png |
| 10 | https://api2.sololearn.com/v2/certificates/CC-SI2WZX43/image/png |
| 11 | https://api2.sololearn.com/v2/certificates/CC-SUOWGF8T/image/png |
| 12 | https://api2.sololearn.com/v2/certificates/CC-I4TIACOI/image/png |
| 13 | https://api2.sololearn.com/v2/certificates/CC-GT2PAJTL/image/png |
| 14 | https://api2.sololearn.com/v2/certificates/CC-CCYNOT2R/image/png |
| 15 | https://api2.sololearn.com/v2/certificates/CC-ZYSDAZM8/image/png |
| 16 | https://api2.sololearn.com/v2/certificates/CC-7ABADG4R/image/png |
| 17 | https://api2.sololearn.com/v2/certificates/CC-DBRL4YLD/image/png |
| 18 | https://api2.sololearn.com/v2/certificates/CC-033EXHKA/image/png |
| 19 | https://api2.sololearn.com/v2/certificates/CC-UYFGANZQ/image/png |
| 20 | https://api2.sololearn.com/v2/certificates/CC-2M47YBCR/image/png |
| 21 | https://api2.sololearn.com/v2/certificates/CC-WKCFVLYI/image/png |
| 22 | https://api2.sololearn.com/v2/certificates/CC-CRBRNFSO/image/png |
| 23 | https://api2.sololearn.com/v2/certificates/CC-SUEHSLUF/image/png |
| 24 | https://api2.sololearn.com/v2/certificates/CC-SI4N5SIB/image/png |
| 25 | https://api2.sololearn.com/v2/certificates/CC-ZTIH8SKI/image/png |
| 26 | https://api2.sololearn.com/v2/certificates/CC-OFASKCAF/image/png |
| 27 | https://api2.sololearn.com/v2/certificates/CC-SCJHQBG0/image/png |
| 28 | https://api2.sololearn.com/v2/certificates/CC-JAJVCQCJ/image/png |
| 29 | https://api2.sololearn.com/v2/certificates/CC-DJ9YJOG5/image/png |
| 30 | https://api2.sololearn.com/v2/certificates/CC-FYISPG0F/image/png |
| 31 | https://api2.sololearn.com/v2/certificates/CC-AXMQ8X3Q/image/png |
| 32 | https://api2.sololearn.com/v2/certificates/CC-OU33MLMF/image/png |
| 33 | https://api2.sololearn.com/v2/certificates/CC-K47BIVEI/image/png |
| 34 | https://api2.sololearn.com/v2/certificates/CC-AREK9EJE/image/png |
| 35 | https://api2.sololearn.com/v2/certificates/CC-6ZXHTBFA/image/png |
| 36 | https://api2.sololearn.com/v2/certificates/CC-ZDBUNAIR/image/png |
| 37 | https://api2.sololearn.com/v2/certificates/CC-2SCXNBZ6/image/png |
| 38 | https://api2.sololearn.com/v2/certificates/CC-CAZPORAO/image/png |
| 39 | https://api2.sololearn.com/v2/certificates/CC-S072WEWW/image/png |
| 40 | https://api2.sololearn.com/v2/certificates/CC-OP1HINXS/image/png |
| 41 | https://api2.sololearn.com/v2/certificates/CC-GPX6LLCC/image/png |
| 42 | https://api2.sololearn.com/v2/certificates/CC-8VRSVYY8/image/png |
| 43 | https://api2.sololearn.com/v2/certificates/CC-IGJZ5ICG/image/png |
| 44 | https://api2.sololearn.com/v2/certificates/CC-NIHNI6RW/image/png |
| 45 | https://api2.sololearn.com/v2/certificates/CC-PKZFLGAF/image/png |
| 46 | https://api2.sololearn.com/v2/certificates/CC-BXKK8SSV/image/png |
| 47 | https://api2.sololearn.com/v2/certificates/CC-L8HOE7QV/image/png |

</details>

---

*ឯកសារនេះជា Blueprint/Specification ដំណាក់កាល "មុនសរសេរកូដ" — គោលដៅគឺបញ្ចប់ Architecture & Requirements ជាមុនសិន មុននឹងចាប់ផ្តើមសាងសង់ API និង Database ជាក់ស្តែង។*

khoem-now/
│
├── .bolt/
│   ├── config.json
│   └── prompt
│
├── API/
│   ├── README.md
│   ├── account-recovery.ts
│   ├── authentication.ts
│   ├── authorization.ts
│   ├── automation.ts
│   ├── command.ts
│   ├── device.ts
│   ├── discovery.ts
│   ├── gateway.ts
│   ├── identity.ts
│   ├── international.ts
│   ├── organization.ts
│   ├── package-lock.json
│   ├── protocol.ts
│   └── safety.ts
│
├── DOCUMENTATION/
│   ├── account-recovery.md
│   ├── administration.md
│   ├── audit.md
│   ├── authentication.md
│   ├── authorization.md
│   ├── command-automation.md
│   ├── device.md
│   ├── discovery-pairing.md
│   ├── identity.md
│   ├── international.md
│   ├── notification.md
│   ├── organization.md
│   ├── protocol-gateway.md
│   ├── safety.md
│   └── security.md
│
├── archive/
│   └── package-lock.json.backup
│
├── data/
│   └── countries.json
│
├── scripts/
│   ├── run-migrations.mjs
│   ├── seed-countries.mjs
│   └── seed-languages.mjs
│
├── src/
│   ├── components/
│   │   ├── LanguageSelector.tsx
│   │   ├── nav.tsx
│   │   └── ui.tsx
│   │
│   ├── data/
│   │   ├── countries.ts
│   │   └── domain.ts
│   │
│   ├── i18n/
│   │   ├── LanguageContext.tsx
│   │   └── translations.ts
│   │
│   ├── views/
│   │   ├── AuditView.tsx
│   │   ├── CertificatesView.tsx
│   │   ├── ControlsView.tsx
│   │   ├── DashboardView.tsx
│   │   ├── DevicesView.tsx
│   │   ├── GatewayView.tsx
│   │   ├── InternationalView.tsx
│   │   ├── OrganizationView.tsx
│   │   ├── ProtocolsView.tsx
│   │   ├── SafetyView.tsx
│   │   ├── SecurityView.tsx
│   │   └── SettingsView.tsx
│   │
│   ├── App.tsx
│   ├── App_1.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── .gitignore
├── AI_INSTRUCTIONS.md
├── README.md
├── eslint.config.js
├── index.html
├── ksv.sh
├── package-lock.json
├── package.json
├── postcss.config.cjs
├── setup_ksv.sh
├── sync.sh
├── tailwind.config.cjs
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts


[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-s6rw1asx)
