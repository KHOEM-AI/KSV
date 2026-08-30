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
│   └── KSV.ts
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

cd ~/KSV/khoem-now
cat >> README.md << 'MDEOF'

---

### ✅ ថ្ងៃទី 29 សីហា 2026 (យប់) — Root Cause Fix, API Domain Audit, Git Safety Incident

**បញ្ហាធំបំផុតដែលរកឃើញ — Root Cause នៃ "ចុចទំព័រខុស" / build ខូច:**
ថត (folder) ត្រួតគ្នាច្រើនស្រទាប់ ដែលកើតឡើងពី AI ផ្សេងៗ (Termux, bolt.new) កែក្នុងពេលដំណាលគ្នាដោយមិន sync៖
- `khoem-now/khoem-now/` (i18n/components ត្រូវការស្រាប់ ជាប់ក្នុង folder ត្រួតគ្នា)
- `App.tsx` ត្រួតគ្នា ៣ file (`App.tsx`, `App_ksv.tsx`, `App_1.tsx`)
- `nav.tsx` ដាក់ខុសទីតាំង (root ជំនួស `src/components/`)

**ការកែសម្រួលរចនាសម្ព័ន្ធ (Cleanup):**
1. រួម i18n/components/data/views ដែលជាប់ក្នុង folder ត្រួតគ្នា ចូល `src/` ត្រឹមត្រូវ
2. ជំនួស `src/App.tsx` (កំណែខុស/template) ដោយកំណែពិត (191 lines មាន i18n ពេញលេញ)
3. លុប `App_ksv.tsx`, `nav.tsx` (root), `src/package.json` ស្ទួន
4. កែ `main.tsx` ឱ្យ wrap `<App />` ដោយ `<LanguageProvider>` (កាលពីមុនខ្វះ → app crash ពេល load)
5. កែ `InternationalView.tsx`: `export default` → named export (`export function InternationalView`) ឱ្យស៊ីគ្នានឹង views ១១ ទៀត
6. Rename `DOCUMENTATION/authorization.md` → `authentication.md` (ខ្លឹមសារពិតជា Authentication តែដាក់ខុសឈ្មោះ) + ផ្លាស់ទី `authorization.md` (root) ចូល `DOCUMENTATION/`

**API/ Domain Audit (ឆែកទាំង 13 file ម្តងមួយៗ):**
account-recovery, authentication, authorization, automation, command, device, discovery, gateway, identity, protocol, safety — ✅ ស្អាតទាំងអស់, logic/security rules ត្រឹមត្រូវ។
- `international.ts` — ខ្វះ `ROUTES`/`Handlers`/`SecurityRules`/`AuditEvent` (មានតែ types+functions) → **បានបន្ថែមរួច**
- `organization.ts` — ខ្វះ `ORGANIZATION_SECURITY_RULES` ទាំងស្រុង → **បានបន្ថែមរួច** (ONLY_OWNER_CAN_DELETE_ORG, MINIMUM_ONE_OWNER_REQUIRED, CANNOT_ASSIGN_ROLE_ABOVE_OWN ។ល។)
- កត់ចំណាំ: `ActionType` ស្ទួនឈ្មោះរវាង `authorization.ts` និង `automation.ts` (មិនទាន់ប៉ះពាល់ ព្រោះមិនទាន់ import ជាមួយគ្នា — ប្រយ័ត្នពេលបង្កើត file ថ្មីត្រូវការទាំងពីរ)

**⚠️ Git Safety Incident — មេរៀនសំខាន់សម្រាប់ AI/Developer ក្រោយ:**
- ពាក្យបញ្ជា `cp -r khoem-now khoem-now-backup-...` ដែលរត់ពី **ខាងក្នុង** `khoem-now/` ខ្លួនឯង បង្កើត backup folder ដែលមាន `node_modules` ពេញ **នៅខាងក្នុង git repo** → `git add -A` ចាប់យកចូល commit ដោយចៃដន្យ (រាប់ពាន់ file!)
- **មេរៀន**: កុំដែល `cp -r` project folder ទៅជា backup **នៅខាងក្នុងខ្លួនឯង**។ បើត្រូវការ backup សូមធ្វើនៅ **ក្រៅ** project root ទាំងស្រុង (ឧ. `~/backups/`) ឬប្រើ `git stash`/`git branch` ជំនួស
- **មេរៀនទី ២**: `git status` ត្រូវពិនិត្យជានិច្ចមុន `git add -A` — កុំទុកចិត្តលើ `-A` ដោយងងឹតងងុល
- **មេរៀនទី ៣**: AI ២-៣ កន្លែងកែក្នុងពេលដំណាលគ្នា (Termux + bolt.new) នាំឱ្យ `git push` ត្រូវ `rejected` ជានិច្ច — ត្រូវ `git pull --no-rebase` ជានិច្ចមុន push

**ឧបករណ៍ថ្មី — `ksv.sh` (shortcut script):**
បង្កើតទុកនៅ `~/KSV/khoem-now/ksv.sh` ជាមួយ alias `ksv` ក្នុង `~/.bashrc`៖
- `ksv pull` — ទាញកូដចុងក្រោយ
- `ksv build` — `npm install && npm run build`
- `ksv dev` — `npm install && npm run dev`
- `ksv push` — add + commit (សួរសារ) + push
- `ksv status` — `git status` + `git log --oneline -5`

**Commits ថ្ងៃនេះ:**
- `docs: complete API domain audit, add missing security rules and route definitions to organization.ts and international.ts`
- Merge commit ជាមួយ `khoem-now/API/README.md` (ពី AI ផ្សេង) — គ្មាន conflict

**ស្ថានភាពចុងក្រោយ:** GitHub `KHOEM-AI/KSV` main branch sync ១០០%, build ជោគជ័យ (1589 modules, 0 error), `node_modules` មិនជាប់ក្នុង repo ទៀត។
MDEOF

git add README.md
git commit -m "docs: log session summary — root cause fix, API audit, git safety lessons"
git pull origin main --no-rebase
git push origin main

# KSV — Controls View: Wiring Audit & Vehicle Control Gap

**Location this doc should live in:** `khoem-now/DOCUMENTATION/controls-wiring-audit.md`
**Date:** 29 August 2026
**Scope:** `src/views/ControlsView.tsx` — what's real, what's missing, what to build next.

---

## 1. Current State: Everything Is a UI Mockup

The Controls page currently renders **6 static control cards**, all using hardcoded
mock data with no real backend connection:

| Card | Device | Category | Wired to backend? |
|---|---|---|---|
| North Vault Door | DEV-04821 | Access (door) | ❌ No |
| Cleanroom HVAC | DEV-04822 | Climate | ❌ No |
| Press Line 7 E-Stop | DEV-04823 | Industrial | ❌ No |
| Robot Arm RA-04 | DEV-04828 | Industrial | ❌ No |
| East Gate Barrier | DEV-04826 | Access | ❌ No |
| Cold Storage Monitor | DEV-04830 | Climate | ❌ No |

Every button (`Lock`, `Open`, `Reset`), toggle switch, and slider on this page is
currently **decorative** — clicking them does not call an API, does not create a
`Command` document, and does not appear in `AuditLog`.

---

## 2. Gap Found: No Vehicle Control Card

The **Device Registry** (Devices page) lists a 7th device that has **no
corresponding card here**:

```
Fleet Van KR-2291
DEV-04824 · Vehicle · Bluetooth · Seoul Depot
Status: offline
```

This is a real gap, not a mock-data omission — the KSV design spec (Device
Categories, section 28) explicitly includes **Vehicle: Car, EV, Fleet, Authorized
vehicle systems** as a first-class category, same tier as Access/Climate/Industrial.
Right now the Controls page has zero UI for it.

**What a Vehicle control card needs, per the KSV command flow** (`User Command →
Authentication → Authorization → Device Capability → Safety Policy → Execute →
Result → Audit`):

- **Immobilize / Release** toggle (maps to `SafetyRule`: "Vehicle Immobilize Outside
  Geo-Fence" — already defined in the Safety Rules list seen on the Dashboard)
- **Geo-fence status** indicator (inside/outside authorized zone)
- **Lock/Unlock doors** control
- **Connection status** — this device is currently `offline`/Bluetooth, so the card
  should show a clear offline state rather than enabled controls that would fail

---

## 3. What "Real Wiring" Requires

To make any control card (vehicle or otherwise) actually functional, each button
needs to call through the security stack already built in `src/core/`:

```
Button onClick
  → POST /api/v1/commands  { deviceId, type, payload }
  → authenticate            (src/core/auth/auth.middleware.ts)
  → requirePermission       (src/core/auth/rbac.policy.ts)     e.g. "device:command"
  → deviceCommandRateLimiter (src/core/security/rate-limiter.ts)
  → [Safety check — not yet built, see section 4]
  → Command.create()        (src/infrastructure/database/models.ts)
  → auditDeviceCommand()    (src/core/security/audit.log.ts)
  → response back to UI (success/failed/blocked)
```

None of this wiring exists yet on the frontend side — `ControlsView.tsx` has no
`fetch`/`axios` calls, and there is no `commands` API route file in the backend
(`API/command.ts` exists as a **spec/type file** per the blueprint, but no Express
route currently calls it from this UI).

---

## 4. Missing Piece: Safety Engine

The KSV design (section 19, "Safety Engine") requires a safety check **separate
from and after** the authorization check:

```
User Authorized ✓ → Security Check ✓ → Safety Check ✗ → COMMAND BLOCKED
```

This is especially relevant for the Vehicle card — "Vehicle Immobilize Outside
Geo-Fence" is a safety rule, not just a permission check. **No safety-engine file
exists yet in `src/core/`** (only auth, rbac, encryption, audit, rate-limiter).
This should be built before wiring the Vehicle card's Immobilize control for real,
otherwise a command could physically stop a vehicle without the geo-fence check
that's supposed to gate it.

---

## 5. Recommended Build Order

1. **`src/core/safety/safety.engine.ts`** — evaluates `SafetyRule` records against
   a command before execution; returns `ALLOWED` or `BLOCKED` + reason
2. **Backend command route** — `POST /api/v1/devices/:id/commands` wired through
   `authenticate` → `requirePermission("device:command")` → safety engine →
   `Command.create()` → `auditDeviceCommand()`
3. **Frontend API client** — a small `src/lib/api.ts` wrapper so `ControlsView.tsx`
   can call the real endpoint instead of local state
4. **Vehicle control card** — new component in `ControlsView.tsx` for
   `Fleet Van KR-2291`, including the offline-state handling described in section 2
5. **Wire the existing 6 cards** to the same real endpoint, replacing their local
   `useState` toggles with actual command dispatch + response handling

---

## 6. Summary

- All 6 existing control cards: **UI only, not connected**
- Vehicle/Fleet category: **entire card missing**, not just unwired
- Root blocker: **no Safety Engine file yet** — build this before wiring anything
  that can physically move/stop equipment (vehicles, robot arms, doors)
- Everything downstream (auth, RBAC, encryption, audit, rate-limiting) is already
  built and ready to receive real command calls once the above pieces exist


[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-s6rw1asx)

បានបង។ ខ្ញុំបានមើល Blueprint របស់បង + Dashboard រូបទី 1 + Control Dashboard រូបទី 2 + ចំណុចដែលយើងវិភាគមុននេះ ហើយ។
សំខាន់៖ ខ្ញុំមិនលុបចំណុចចាស់របស់បងទេ។
របៀបដែលសុវត្ថិភាពបំផុតគឺ រក្សា Sections 0–42 និង Folder Structure ដើមទាំងអស់ ហើយបន្ថែមផ្នែកខាងក្រោមជា Enterprise/Fleet Control Addendum។ ដូច្នេះថ្ងៃក្រោយ AI/Developer មើល README នេះ នឹងដឹងថា អ្វីមានរួច + អ្វីត្រូវបន្ថែម ហើយមិនចាំបាច់ស្មានឡើងវិញ។
អាច Copy ដុំខាងក្រោម ដាក់បន្តនៅចុង README.md បានតែម្តង៖
# KSV — UNIVERSAL SECURE CONTROL PLATFORM
## ENTERPRISE FLEET / DEVICE MONITORING & CONTROL ADDENDUM
### Append-Only Specification — DO NOT DELETE EXISTING ARCHITECTURE

> IMPORTANT:
> This section is an ADDITION to the existing KSV Master Architecture.
> Do NOT remove, rename, overwrite, or simplify Sections 0–42.
> Existing Identity, Authentication, Authorization, Security, Safety,
> Device, Gateway, Protocol, Audit, Organization, International,
> Database, API and Infrastructure architecture remain authoritative.

---

# 43. Enterprise Fleet Monitoring Dashboard

KSV Dashboard ត្រូវគាំទ្រការតាមដាន Device/Fleet ពីមួយឧបករណ៍ទៅរាប់ពាន់/រាប់លានឧបករណ៍។

Dashboard មិនមែនសម្រាប់តែបង្ហាញលេខទេ។
វាត្រូវអាច:

- Monitor
- Search
- Filter
- Investigate
- Diagnose
- Control
- Alert
- Analyze
- Audit
- Report
- Recover

## 43.1 Dashboard Main Structure
KSV │ ├── Top Header │   ├── Hamburger / Navigation │   ├── Global Search │   ├── Country │   ├── Language │   ├── Time Zone │   ├── Notifications │   └── User / Account │ ├── Sidebar / Navigation │   ├── Dashboard │   ├── Devices │   ├── Fleet │   ├── Map │   ├── Alerts │   ├── Commands │   ├── Automation │   ├── Gateway │   ├── Protocols │   ├── Security │   ├── Audit │   ├── Organization │   ├── Reports │   ├── Administration │   └── Settings │ └── Main Workspace ├── KPI Cards ├── Fleet Health ├── Interactive GIS Map ├── Traffic / Performance ├── Alerts ├── Site Utilization ├── Device Health ├── Recent Devices ├── Live Control Activity └── Custom Widgets

> Hamburger menu / three-line menu may remain collapsed by default
> on mobile/small screens.
>
> Navigation should NOT consume the main dashboard space when closed.

---

# 44. Interactive GIS / Geo-Location Map

KSV ត្រូវមាន Interactive World Map សម្រាប់ Fleet Monitoring។

អាចប្រើ:

- Leaflet
- MapLibre
- Mapbox
- Google Maps
- OpenStreetMap-compatible providers

Map Provider ត្រូវអាចប្តូរបានតាម deployment។

## 44.1 Map Data

Map អាចបង្ហាញ:

- Country
- Region
- Organization
- Site
- Building
- Room
- Gateway
- Device
- Vehicle
- Sensor
- Industrial equipment

## 44.2 Marker Status
GREEN  = NORMAL / ONLINE YELLOW = WARNING RED    = CRITICAL GRAY   = OFFLINE BLUE   = MAINTENANCE

Marker មិនត្រូវជំនួស Authorization ទេ។

Map អាចបង្ហាញទីតាំងបាន
ប៉ុន្តែការចូលទៅកាន់ Device Control ត្រូវឆ្លង:

Authentication
→ Authorization
→ Ownership
→ Safety
→ Command Engine

## 44.3 Map Interaction

ចុច Marker:
Device ├── Device ID ├── Name ├── Site ├── Status ├── Last Seen ├── Connection ├── Health ├── Gateway ├── Firmware ├── Alerts └── Authorized Actions

បន្ថែម:

- Zoom
- Pan
- Cluster
- Search location
- Region filter
- Site filter
- Status filter
- Device type filter
- Gateway filter
- Alert filter
- Last-seen filter

---

# 45. Fleet Overview & KPI System

Dashboard ត្រូវមាន Real-Time KPI។

ឧទាហរណ៍:
TOTAL DEVICES ONLINE WARNING CRITICAL OFFLINE MAINTENANCE UNKNOWN ACTIVE GATEWAYS ACTIVE ALERTS COMMANDS / MIN NETWORK LATENCY UPTIME

KPI ត្រូវបែងចែកតាម:

- Organization
- Country
- Region
- Site
- Building
- Device Type
- Gateway
- Protocol

---

# 46. Device Health Monitoring

Device Health មិនត្រូវមានតែ Online/Offline។

ត្រូវអាចតាមដាន:

- CPU
- Memory
- Storage
- Temperature
- Battery
- Signal
- Network latency
- Packet loss
- Connection uptime
- Firmware
- Hardware state
- Sensor health
- Gateway health
- Last heartbeat
- Last successful command
- Last error

## Health Score

ឧទាហរណ៍:
93% = HEALTHY 70–92% = WARNING <70% = CRITICAL

Threshold ត្រូវអាចកំណត់តាម Device Type / Organization Policy។

---

# 47. Real-Time Telemetry

KSV ត្រូវគាំទ្រ Real-Time Telemetry។
DEVICE ↓ GATEWAY / PROTOCOL ↓ TELEMETRY INGESTION ↓ PROCESSING ↓ DATABASE / TIME-SERIES STORAGE ↓ DASHBOARD

Telemetry អាចមាន:

- Temperature
- Humidity
- Voltage
- Current
- Power
- RPM
- Speed
- Pressure
- Battery
- Network
- Sensor values
- Machine state
- Door state
- HVAC state
- Robot state

Real-time updates អាចប្រើ:

- WebSocket
- Server-Sent Events
- MQTT
- Event streaming

---

# 48. Alert & Incident Management

Notification System ដែលមានក្នុង Section 29
ត្រូវពង្រីកទៅជា Full Alert Management។

## Alert Lifecycle
DETECTED ↓ CLASSIFIED ↓ ALERT ↓ ACKNOWLEDGED ↓ INVESTIGATING ↓ RESOLVED ↓ CLOSED

Alert ត្រូវមាន:

- Alert ID
- Severity
- Source
- Device
- Site
- Time
- Condition
- Current value
- Threshold
- Assigned user/team
- Acknowledged by
- Resolved by
- Resolution time
- Audit record

## Severity
INFO WARNING ERROR CRITICAL EMERGENCY

---

# 49. Alert Threshold & Policy Engine

Admin/authorized user អាចកំណត់:
IF CPU > 90% → WARNING
IF CPU > 98% → CRITICAL
IF DEVICE OFFLINE > 5 MIN → WARNING
IF DEVICE OFFLINE > 30 MIN → CRITICAL
IF LATENCY > 500ms → WARNING
IF LATENCY > 1000ms → CRITICAL

Threshold ត្រូវអាចកំណត់តាម:

- Device
- Device Type
- Site
- Organization
- Region
- Gateway
- Time schedule

---

# 50. Multi-Channel Notification & Escalation

Critical Alert អាចផ្ញើតាម:

- KSV App
- Push Notification
- Email
- SMS
- Telegram Bot
- Slack
- Webhook
- Other enterprise notification providers

## Escalation
Critical Alert ↓ Operator ↓ No response ↓ Manager ↓ No response ↓ Administrator ↓ Emergency Policy

ត្រូវមាន:

- Retry
- Delivery status
- Rate limiting
- Deduplication
- Escalation timeout
- Notification audit

Secrets របស់ Telegram/Slack/Email/SMS
មិនត្រូវបង្ហាញក្នុង Dashboard ឡើយ។

---

# 51. Advanced Search & Filtering

Global Search ត្រូវស្វែងរកបាន:

- Device ID
- Serial Number
- Device Name
- Manufacturer
- Model
- Gateway
- Organization
- Site
- Region
- Country
- Protocol
- Status
- Firmware
- Alert
- User
- Command ID

Advanced filters:
Status Device Type Protocol Country Region Organization Site Gateway Firmware Health Alert Severity Last Seen Maintenance State

ត្រូវគាំទ្រ:

- Saved Filters
- Saved Views
- Reset Filters
- Multi-filter
- Sorting
- Pagination
- Server-side filtering

---

# 52. Bulk Device Operations

KSV ត្រូវអាចជ្រើស Device ច្រើន។

ឧទាហរណ៍:
[✓] Device A [✓] Device B [✓] Device C
Bulk Action: ├── Restart ├── Firmware Update ├── Configuration Push ├── Maintenance Mode ├── Sync ├── Disable └── Other Authorized Actions

## Bulk Security Rule

Bulk Action មិនមានន័យថា bypass authorization ទេ។
User ↓ Authentication ↓ Bulk Authorization ↓ Per-Device Permission Check ↓ Safety Check ↓ Approval (if required) ↓ Execute ↓ Audit

បើ Device មួយមិនមានសិទ្ធិ:
AUTHORIZED DEVICES → EXECUTE UNAUTHORIZED DEVICES → BLOCK

មិនត្រូវ execute លើទាំងអស់ដោយស្វ័យប្រវត្តិទេ។

---

# 53. Remote Diagnostic Console

KSV ត្រូវមាន Secure Diagnostic Console។

អាចគាំទ្រ:

- Device Logs
- Gateway Logs
- MQTT diagnostics
- Health diagnostics
- Network diagnostics
- Command history
- Error information

សម្រាប់ Engineer/Admin ដែលមានសិទ្ធិ។

## Security

Web Terminal មិនត្រូវបើក unrestricted shell ដោយ default ទេ។

ត្រូវមាន:

- Strong Authentication
- MFA
- Role Permission
- Device Permission
- Session Timeout
- Command Allowlist
- Approval for dangerous commands
- Full Audit
- Session recording where legally appropriate
- Rate limiting
- Emergency revoke

Dangerous command:
REQUEST ↓ AUTH ↓ AUTHORIZATION ↓ SAFETY ↓ APPROVAL ↓ EXECUTION

---

# 54. Live Command / Control Activity

Dashboard ត្រូវបង្ហាញ Live Control Activity។

ឧទាហរណ៍:
14:32:11 North Vault Door UNLOCK Operator SUCCESS
14:28:44 Robot Arm RA-04 SPEED_LIMIT 25% Operator SUCCESS
14:15:02 Cleanroom HVAC SETPOINT 21°C Operator SUCCESS

រាល់ Control Action ត្រូវមាន:

- User
- Device
- Command
- Time
- Source
- Result
- Authorization decision
- Audit ID

---

# 55. Historical Analytics

Dashboard ត្រូវគាំទ្រ Time Range:
Last 1 Hour Last 24 Hours Last 7 Days Last 30 Days Last 90 Days Last 1 Year Custom Range

អាចវិភាគ:

- Uptime
- Downtime
- Alerts
- Latency
- Traffic
- Device health
- Energy
- Commands
- Failures
- Response time
- Site performance

ត្រូវអាចប្រៀបធៀប:
Site A vs Site B Device A vs Device B Current Period vs Previous Period

---

# 56. Reports & Data Export

KSV ត្រូវអាច Generate:

- PDF
- CSV
- Excel/XLSX
- JSON (for technical/API use)

Report ប្រភេទ:

- Fleet Report
- Device Health Report
- Security Report
- Audit Report
- Alert Report
- Uptime Report
- Performance Report
- Maintenance Report
- Command Report
- Organization Report

Export ត្រូវឆ្លង Permission និង Data Privacy Policy។

---

# 57. Dashboard Customization

User អាច:

- Drag & Drop widgets
- Resize widgets
- Hide widgets
- Show widgets
- Save layout
- Reset layout
- Save personal dashboard
- Save organization dashboard

Widget អាចមាន:
KPI MAP ALERTS DEVICE HEALTH TRAFFIC UPTIME COMMAND ACTIVITY SITE LOAD RECENT DEVICES GATEWAYS SECURITY EVENTS TELEMETRY

Layout ត្រូវរក្សាទុកតាម User / Organization។

---

# 58. Responsive Enterprise UI

Dashboard ត្រូវគាំទ្រ:

- Desktop
- Tablet
- Mobile

## Mobile

Sidebar ត្រូវបើកតាម:
☰

ហើយបិទវិញបាន។

Main Dashboard មិនត្រូវត្រូវបាន sidebar កាន់កាប់កន្លែងជានិច្ចទេ។

## Desktop

អាចប្រើ:
Sidebar + Main Dashboard + Optional Right Detail Panel

## Important UI Rule

Map អាចជាផ្នែកសំខាន់មួយនៅក្នុង Main Dashboard
និងអាចមាន Full Map View ដាច់ដោយឡែក។

មិនត្រូវបង្ខំឱ្យ Map បង្ហាញជានិច្ច
ប្រសិនបើវាធ្វើឱ្យ Device Control cards តូចពេក។

---

# 59. Device Detail Page

ចុច Device ពី:

- Dashboard
- Map
- Device List
- Alert
- Search

→ បើក Device Detail។
DEVICE DETAIL ├── Overview ├── Status ├── Location ├── Health ├── Telemetry ├── Capabilities ├── Commands ├── Logs ├── Alerts ├── Firmware ├── Gateway ├── Permissions ├── Automation ├── Audit └── Maintenance

Control buttons ត្រូវបង្ហាញតែ Action
ដែល User មាន Permission និង Device Capability ប៉ុណ្ណោះ។

---

# 60. Fleet / Site Hierarchy

Dashboard ត្រូវគាំទ្រ:
Organization ↓ Country ↓ Region ↓ Site ↓ Building ↓ Floor ↓ Room / Zone ↓ Gateway ↓ Device

ការមើល Dashboard អាច Scope តាម hierarchy។

ឧទាហរណ៍:
All Organization ↓ Cambodia ↓ Phnom Penh ↓ Factory A ↓ Building 1 ↓ Production Zone

---

# 61. Maintenance Management

Device ត្រូវអាចមាន:

- Maintenance status
- Maintenance schedule
- Technician
- Maintenance window
- Service history
- Parts/service notes
- Firmware maintenance
- Preventive maintenance
- Emergency maintenance

Status:
NORMAL MAINTENANCE SCHEDULED DEGRADED FAILED RETIRED

Maintenance mode ត្រូវកត់ Audit។

---

# 62. Gateway Monitoring

Gateway ត្រូវតាមដាន:

- Gateway ID
- Location
- Online status
- CPU
- Memory
- Storage
- Network
- Connected devices
- Protocol adapters
- Last heartbeat
- Security state
- Firmware
Cloud ↓ Gateway ├── MQTT ├── Wi-Fi ├── Bluetooth ├── IR └── Local Devices

Gateway មិនត្រូវ bypass Authorization ឡើយ។

---

# 63. Protocol Health Monitoring

ត្រូវអាចមើល:
MQTT HTTP HTTPS WebSocket Bluetooth Wi-Fi IR Gateway Protocols Manufacturer APIs

Metrics:

- Connected
- Disconnected
- Latency
- Error rate
- Packet/message rate
- Authentication failures
- Reconnect count

---

# 64. Security Dashboard

Security Dashboard ត្រូវបង្ហាញ:

- Active sessions
- Failed logins
- Suspicious login
- Permission changes
- Device trust
- Key/certificate status
- Security alerts
- Blocked commands
- Rate-limit events
- Account lockouts
- Incident status

Security event:
DETECT ↓ ALERT ↓ BLOCK ↓ INVESTIGATE ↓ RECOVER

---

# 65. RBAC + ABAC Integration

RBAC ដែលមានក្នុង Section 5
ត្រូវភ្ជាប់ជាមួយ Attribute-Based Rules។

Example:
Role = Operator AND Device = Factory A AND Time = 08:00–17:00 AND Location = Factory A AND Device State = Safe

→ Allow

បើមិនគ្រប់ conditions:

→ Deny

---

# 66. Approval Workflow

Action ដែលមានហានិភ័យខ្ពស់អាចត្រូវការអនុម័ត។
Operator ↓ Request Command ↓ Safety Check ↓ Approval Required ↓ Manager Approval ↓ Execution ↓ Audit

អាចប្រើសម្រាប់:

- Industrial machine
- Robot
- Door access
- Vehicle
- Firmware update
- Mass reboot
- Configuration change
- Emergency action

---

# 67. AI-Assisted Monitoring

AI អាចជួយ:

- Summarize alerts
- Detect anomalies
- Explain device health
- Suggest diagnosis
- Summarize logs
- Predict maintenance
- Recommend safe actions

ប៉ុន្តែ:
AI ↓ Interpretation / Recommendation ↓ Authorization ↓ Safety ↓ Command Engine ↓ Execution

AI មិនអាច:

- Bypass authentication
- Bypass authorization
- Bypass safety
- Reveal secrets
- Reveal passwords
- Execute unrestricted commands

---

# 68. Anomaly Detection

KSV អាចរកឃើញ abnormal behavior:

- Unusual traffic
- Unusual login
- Unusual command
- Unusual device movement
- Unusual temperature
- Unusual latency
- Repeated failure
- Sudden fleet degradation

Flow:
Telemetry / Events ↓ Detection Engine ↓ Anomaly Score ↓ Alert ↓ Investigation

---

# 69. Data Retention & Time-Series Strategy

Telemetry និង Logs មិនគួររក្សាទុកដោយគ្មាន policy។

ត្រូវកំណត់:

- Retention
- Archive
- Aggregation
- Deletion
- Legal hold
- Regional requirements

ឧទាហរណ៍:
Real-time data ↓ Hot storage ↓ Aggregated historical data ↓ Cold archive ↓ Deletion according to policy

---

# 70. Reliability & Real-Time Failure Handling

បើ Cloud / Network / Gateway ខូច:
Cloud Failure ↓ Gateway Detects Failure ↓ Local Policy ↓ Safe Operation ↓ Queue Events ↓ Reconnect ↓ Synchronize ↓ Audit

Critical Safety commands ត្រូវមាន Safe Fallback។

---

# 71. Emergency Control Center

Emergency Dashboard ត្រូវអាច:

- View critical incidents
- Suspend commands
- Revoke sessions
- Revoke device access
- Disable compromised gateway
- Lock organization
- Trigger emergency notification
- Preserve evidence
- Restore trusted configuration

Emergency action ត្រូវមាន:

- Strong authentication
- Authorization
- Audit
- Confirmation
- Safety policy

---

# 72. Enterprise Dashboard Navigation

Main navigation:
☰ │ ├── Dashboard ├── Fleet ├── Devices ├── Map ├── Alerts ├── Commands ├── Automation ├── Gateways ├── Protocols ├── Reports ├── Security ├── Audit ├── Organizations ├── Administration └── Settings

Mobile:
Navigation → Hamburger menu.

Desktop:
Sidebar can remain visible or collapsed.

---

# 73. Existing UI Preservation Rule

Existing KSV UI work must NOT be discarded.

Existing concepts include:

- Dashboard KPI cards
- Device health chart
- Alert chart
- Site utilization
- Recent devices
- Device control cards
- Live control activity
- Header
- Country selector
- Language selector
- Timezone clock
- Notification indicator
- Sidebar / hamburger navigation
- Dark enterprise UI
- Device status indicators

These should be ENHANCED, not replaced unnecessarily.

---

# 74. Existing Device Control Concepts

Existing device controls such as:
North Vault Door Cleanroom HVAC Press Line 7 E-Stop Robot Arm RA-04 East Gate Barrier Cold Storage Monitor

are UI/demo device examples.

They represent different capability classes:
ACCESS CONTROL HVAC EMERGENCY CONTROL ROBOTICS BARRIER / GATE COLD STORAGE

Future implementation must connect them to:

Device Identity
→ Capability
→ Permission
→ Safety
→ Protocol
→ Command
→ Audit

Do not hard-code UI buttons as unrestricted device commands.

---

# 75. Enterprise Dashboard Final Model

KSV Dashboard should evolve from:
STATIC DASHBOARD

to:
REAL-TIME + GEOLOCATION + DEVICE INTELLIGENCE + FLEET MANAGEMENT + ALERT MANAGEMENT + SECURE CONTROL + AI ASSISTANCE + ANALYTICS + AUDIT + SAFETY

---

# 76. Additional Project Folder Structure

Existing folders MUST remain.

Only add missing domains where necessary:

khoem-now/
│
├── API/
├── APP/
├── AUTH/
├── SECURITY/
├── DEVICES/
├── GATEWAY/
├── PROTOCOLS/
├── COMMAND/
├── AUTOMATION/
├── SAFETY/
├── USERS/
├── ORGANIZATION/
├── INTERNATIONAL/
├── AUDIT/
├── NOTIFICATION/
├── DATABASE/
├── CONFIG/
├── TESTS/
├── DOCUMENTATION/
│
├── DASHBOARD/
│   ├── widgets/
│   ├── fleet/
│   ├── map/
│   ├── alerts/
│   ├── analytics/
│   ├── reports/
│   └── layouts/
│
├── TELEMETRY/
│   ├── ingestion/
│   ├── processing/
│   └── storage/
│
├── MONITORING/
│   ├── health/
│   ├── metrics/
│   ├── uptime/
│   └── anomaly/
│
├── INCIDENT/
│   ├── alerts/
│   ├── escalation/
│   ├── response/
│   └── emergency/
│
└── REPORTS/
    ├── pdf/
    ├── csv/
    ├── excel/
    └── templates/

> These are additions only.
> Do not delete existing folders simply because a new domain is introduced.

---

# 77. Frontend View Additions

Existing Views remain.

Additional Views may include:
src/views/ ├── DashboardView.tsx ├── FleetView.tsx ├── MapView.tsx ├── AlertsView.tsx ├── AnalyticsView.tsx ├── ReportsView.tsx ├── DeviceDetailView.tsx ├── TelemetryView.tsx ├── MaintenanceView.tsx ├── IncidentView.tsx └── EmergencyView.tsx

Before creating duplicates:

1. Search existing files.
2. Reuse existing component.
3. Check translations.ts.
4. Check routing.
5. Check API domain.
6. Avoid App.tsx duplication.
7. Avoid nested project roots.

---

# 78. Translation / i18n Rule

All new Dashboard UI labels must use the existing i18n system.

DO NOT hard-code UI language.

Example:
t("view.dashboard.fleetHealth") t("view.dashboard.activeAlerts") t("view.dashboard.deviceHealth") t("view.dashboard.map") t("view.dashboard.analytics")

Before adding keys:
grep -o "t('[^']*')"  | sort -u

Then verify against:
src/i18n/translations.ts

Device names, event codes, IDs and technical identifiers remain data,
unless localization is explicitly required.

---

# 79. API Additions

Existing API domains remain.

Potential new domains:
API/ ├── fleet.ts ├── telemetry.ts ├── monitoring.ts ├── alerts.ts ├── incidents.ts ├── reports.ts ├── analytics.ts └── maintenance.ts

Every endpoint must follow:
Authentication → Authorization → Validation → Safety (when applicable) → Business Logic → Audit → Response

---

# 80. Database Additions

Existing domain-separated database architecture remains.

Additional entities may include:
fleet_sites device_health device_telemetry device_metrics alerts alert_rules alert_notifications alert_escalations incidents maintenance_records device_locations gateway_health dashboard_layouts saved_filters reports report_jobs anomaly_events

Do NOT put all dashboard data into one giant table.

---

# 81. Final Enterprise Feature Checklist

## Existing Core Architecture

- [x] Global Platform
- [x] Identity
- [x] Authentication
- [x] Recovery
- [x] Authorization
- [x] Organization
- [x] Device Identity
- [x] Device Capability
- [x] Discovery
- [x] Pairing
- [x] Ownership
- [x] Protocol Layer
- [x] Gateway
- [x] Command Engine
- [x] AI Command Layer
- [x] Safety Engine
- [x] Security Core
- [x] Key Management
- [x] Security Monitoring
- [x] Audit
- [x] Incident Response
- [x] Offline Operation
- [x] Device Lifecycle
- [x] Firmware Update
- [x] Device Categories
- [x] International
- [x] Privacy
- [x] Legal / Compliance
- [x] Notification
- [x] Dashboard
- [x] Administration
- [x] API Architecture
- [x] Automation
- [x] Database
- [x] Reliability
- [x] Backup / DR
- [x] Testing
- [x] Security Testing
- [x] Engineering Governance
- [x] Emergency Architecture
- [x] Security Rule

## Enterprise/Fleet Additions

- [ ] Interactive GIS Map
- [ ] Color-Coded Device Markers
- [ ] Fleet KPI
- [ ] Real-Time Telemetry
- [ ] Device Health Monitoring
- [ ] Gateway Health
- [ ] Protocol Health
- [ ] Advanced Search
- [ ] Advanced Filtering
- [ ] Saved Filters
- [ ] Bulk Operations
- [ ] Secure Diagnostic Console
- [ ] Live Command Activity
- [ ] Alert Lifecycle
- [ ] Alert Threshold Engine
- [ ] Multi-Channel Notifications
- [ ] Alert Escalation
- [ ] Historical Analytics
- [ ] Custom Time Range
- [ ] PDF Export
- [ ] CSV Export
- [ ] Excel Export
- [ ] Dashboard Drag & Drop
- [ ] Custom Widgets
- [ ] Device Detail
- [ ] Fleet/Site Hierarchy
- [ ] Maintenance Management
- [ ] Approval Workflow
- [ ] AI Anomaly Detection
- [ ] AI Monitoring Assistant
- [ ] Emergency Control Center
- [ ] Real-Time Failure Handling

---

# 82. FINAL KSV ARCHITECTURE PRINCIPLE

KSV is not merely:
Smart Home Dashboard

and not merely:
Fleet Monitoring Dashboard

It is:
UNIVERSAL SECURE CONTROL PLATFORM

covering:
USER ↓ IDENTITY ↓ AUTHENTICATION ↓ AUTHORIZATION ↓ OWNERSHIP / ORGANIZATION ↓ DEVICE IDENTITY ↓ CAPABILITY ↓ DISCOVERY / PAIRING ↓ PROTOCOL ↓ GATEWAY ↓ COMMAND ↓ SAFETY ↓ DEVICE ↓ TELEMETRY ↓ MONITORING ↓ ALERT ↓ AUDIT ↓ INCIDENT RESPONSE ↓ RECOVERY

AI is an intelligence layer.

Dashboard is a presentation/control layer.

Gateway is a connectivity layer.

Protocol is a communication layer.

Authorization is the permission boundary.

Safety is an independent protection boundary.

Audit is the accountability layer.

No layer may silently bypass another critical security or safety layer.

---

# 83. DO NOT DELETE / DO NOT DUPLICATE RULE

For all future AI/Developer work:

1. Do NOT delete existing architecture without explicit approval.
2. Do NOT create another project root.
3. Do NOT create `khoem-now/khoem-now/`.
4. Do NOT create duplicate `App.tsx`.
5. Do NOT create duplicate `package.json`.
6. Do NOT create duplicate navigation systems.
7. Do NOT overwrite existing i18n.
8. Check `translations.ts` before adding translation keys.
9. Check existing views/components before creating new ones.
10. Check `git status` before `git add -A`.
11. Never place backups inside the Git repository.
12. Pull/synchronize before pushing when another development environment may have changed the repository.
13. Never expose passwords or secrets in UI/logs/audit.
14. Never allow AI to bypass Authorization or Safety.
15. Never treat Device Discovery as Device Permission.
16. Never allow Gateway to bypass Security.
17. Every important command must be auditable.
18. Dangerous commands require additional safety/approval controls.
19. Preserve existing working features while adding new capabilities.
20. Build incrementally from the existing architecture instead of rebuilding the entire project unnecessarily.

---

# 84. IMPLEMENTATION PRIORITY

Do NOT start by creating hundreds of API endpoints.

Recommended order:

PHASE 1 — FOUNDATION
1. Identity
2. Authentication
3. Authorization
4. Device Identity
5. Device Capability
6. Organization / Ownership

PHASE 2 — CONTROL
7. Protocol
8. Gateway
9. Command Engine
10. Safety Engine
11. Audit

PHASE 3 — MONITORING
12. Device Health
13. Telemetry
14. Real-Time Events
15. Fleet Dashboard
16. GIS Map

PHASE 4 — ALERTS
17. Alert Rules
18. Notifications
19. Escalation
20. Incident Management

PHASE 5 — ENTERPRISE
21. Bulk Operations
22. Remote Diagnostics
23. Historical Analytics
24. Reports / Export
25. Dashboard Customization
26. Maintenance

PHASE 6 — INTELLIGENCE
27. AI Monitoring
28. Anomaly Detection
29. Predictive Maintenance
30. AI-assisted Investigation

PHASE 7 — HARDENING
31. Security Testing
32. Load Testing
33. Failure Testing
34. Recovery Testing
35. Penetration Testing
36. Disaster Recovery Testing

---

# 85. MASTER STATUS

The KSV project is considered:

ARCHITECTURE / REQUIREMENTS FIRST.

The existing Sections 0–42 remain the foundation.

Sections 43–85 define the missing Enterprise Fleet Monitoring,
Control, GIS, Telemetry, Alert, Analytics, Reporting, Diagnostic,
Customization and operational capabilities.

Nothing from the original architecture is intentionally removed.

The goal is:
ONE PROJECT ROOT ONE ARCHITECTURE ONE SECURITY MODEL ONE AUTHORIZATION MODEL ONE DEVICE MODEL ONE COMMAND MODEL ONE AUDIT MODEL ONE DASHBOARD SYSTEM ONE KSV PLATFORM

with multiple domains underneath:
KSV/khoem-now/

Final principle:

> BUILD ON THE EXISTING FOUNDATION.
> DO NOT REBUILD OR DELETE WORKING SYSTEMS WITHOUT A VERIFIED REASON.
> SECURITY FIRST.
> SAFETY FIRST.
> AUTHORIZATION FIRST.
> AUDIT EVERYTHING IMPORTANT.
> PRESERVE EXISTING WORK.
ចំណុចដែលខ្ញុំមើលឃើញថា “ខ្វះ” ពីអត្ថបទដើមរបស់បង
ជាក់ស្តែង អត្ថបទដើមរបស់បងរឹងមាំខ្លាំងខាង Architecture/Security រួចហើយ។ ចំណុចដែលមិនទាន់មានជាក់លាក់គ្រប់គ្រាន់ គឺខាង Operational Dashboard ដែលរូបទាំងពីរបានបង្ហាញ៖
🌍 GIS Map / Location intelligence
📡 Real-time Telemetry
❤️ Device/Gateway Health
🚨 Alert lifecycle + escalation
🔎 Advanced Search/Filter
☑️ Bulk Operations
🖥️ Secure Remote Diagnostic
📊 Historical Analytics
📄 PDF/CSV/Excel Reports
🧩 Drag & Drop Dashboard
🔧 Maintenance Management
👥 Approval Workflow
🤖 AI anomaly detection
🆘 Emergency Control Center
📡 Gateway/Protocol health
📍 Device detail + Fleet/Site hierarchy
ហើយចំណុច Map ដែលបងសួរមុននេះ — ខ្ញុំយល់ថា “គួរថែម”។ ប៉ុន្តែមិនចាំបាច់យក Map មកបាំង Dashboard ទាំងមូលទេ។ យកជា Map Widget នៅ Main Dashboard + Full Map View ដាច់ដោយឡែក គឺស្អាត និង Enterprise ជាង។
ដូច្នេះ កុំលុប Dashboard ចាស់របស់បង។ រូបទី 1 គឺ Monitoring/Analytics ហើយរូបទី 2 គឺ Control/Operations។ គំនិតល្អបំផុតគឺឱ្យ KSV មាន ពីរផ្នែកដែលភ្ជាប់គ្នា មិនមែនបង្ខំវាឱ្យក្លាយជាទំព័រតែមួយទេ៖
Monitoring → Map → Device → Control → Safety → Audit
នេះជាទម្រង់ដែលខ្ញុំចង់ឱ្យបងរក្សាទុកសម្រាប់ Developer/AI ថ្ងៃក្រោយ ដើម្បីកុំឱ្យគេមក “ចាប់ផ្តើមសាងសង់ពីសូន្យ” ម្តងទៀត។

================================================================================
MASTER REPOSITORY (ទំព័រមេ)
================================================================================
#1  | KHOEM_AI
URL | https://github.com/KHOEM-AI/KHOEM_AI.git

================================================================================
SUB-REPOSITORIES (ទំព័ររង)
================================================================================
#2  | AI
URL | https://github.com/KHOEM-AI/AI.git
--------------------------------------------------------------------------------
#3  | KI
URL | https://github.com/KHOEM-AI/KI.git
--------------------------------------------------------------------------------
#4  | MI-K
URL | https://github.com/KHOEM-AI/MI-K.git
--------------------------------------------------------------------------------
#5  | EI-T
URL | https://github.com/KHOEM-AI/EI-T.git
--------------------------------------------------------------------------------
#6  | KEI
URL | https://github.com/KHOEM-AI/KEI.git
--------------------------------------------------------------------------------
#7  | IQ-AI
URL | https://github.com/KHOEM-AI/IQ-AI.git
--------------------------------------------------------------------------------
#8  | CAI
URL | https://github.com/KHOEM-AI/CAI.git
--------------------------------------------------------------------------------
#9  | KSV
URL | https://github.com/KHOEM-AI/KSV.git
--------------------------------------------------------------------------------
#10 | khoem-now
URL | https://github.com/KHOEM-AI/khoem-now.git
================================================================================
