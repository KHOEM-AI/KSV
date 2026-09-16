# KSV — Universal Secure Control Platform
## Master Architecture & Requirements Documentation

**Project root:** `khoem-now/`
**Status:** Architecture & Requirements phase (no code yet)
**Document purpose:** Single source of truth for what KSV needs to become before implementation begins.

---

## 0. Core Principles

These are the non-negotiable rules the entire platform is built on:

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

> **Golden rule:** A user may *discover* a device, but discovery never means *authorization*.

> **Golden rule #2:** No single credential, account, API, administrator, device, or security layer should automatically have unlimited control over the entire platform.

---

## 1. Project Folder Structure

```
KSV/
└── khoem-now/          ← single project root, nothing else at this level
    ├── API/             (domain-split API modules)
    ├── APP/              (UI / presentation layer only)
    ├── AUTH/             (identity, login, MFA, recovery)
    ├── SECURITY/         (encryption, keys, sessions, rate limiting)
    ├── DEVICES/          (device identity & capability)
    ├── GATEWAY/          (local/edge bridge for BT, IR, MQTT, LAN)
    ├── PROTOCOLS/        (protocol adapters per communication method)
    ├── COMMAND/          (command validation, execution, results)
    ├── AUTOMATION/       (IF/THEN rules engine)
    ├── SAFETY/           (independent safety engine, separate from security)
    ├── USERS/            (accounts, roles)
    ├── ORGANIZATION/     (company/site/building/room hierarchy)
    ├── INTERNATIONAL/    (country, language, timezone, localization)
    ├── AUDIT/            (audit + security event logging)
    ├── NOTIFICATION/     (alerts across app/email/SMS/push)
    ├── DATABASE/         (schema, split by domain — never one giant table)
    ├── CONFIG/           (platform configuration)
    ├── TESTS/            (unit, integration, security, device compat)
    └── DOCUMENTATION/    (this file and related docs)
```

**Rule:** Everything lives inside `khoem-now/`. Never create a second project root (`KSV/project2`, `KSV/backend2`, etc.). Sub-folders are how we keep it organized as it grows.

---

## 2. API Domain List (`API/`)

The API is split by domain — never one large file:

| # | Domain | Responsibility |
|---|--------|----------------|
| 1 | Identity | who a user is, linked identity providers |
| 2 | Authentication | login, MFA, sessions |
| 3 | Account | account state, profile |
| 4 | Account Recovery | forgot-password / OTP recovery flows |
| 5 | Authorization | permissions, roles, policy checks |
| 6 | Organization | company/site/building/room hierarchy |
| 7 | Device | device identity & metadata |
| 8 | Discovery | scanning for nearby/available devices |
| 9 | Pairing | secure device pairing flow |
| 10 | Protocol | protocol adapter abstraction |
| 11 | Gateway | edge/local bridge management |
| 12 | Command | command validation & execution |
| 13 | Automation | rule-based automation |
| 14 | Safety | safety-policy enforcement |
| 15 | Security | core security services |
| 16 | Audit | audit trail read/write |
| 17 | Notification | alerts and messages |
| 18 | International | country/language/timezone config |
| 19 | Administration | platform admin operations |

*(Progress tracker for this list belongs in a separate build-status file, not here.)*

---

## 3. Identity & Account

- One KSV account can link multiple verified identities: email, phone, Google, Facebook, TikTok, or other supported providers.
- KSV never stores or requires a user's external provider password — only the identity/token via OAuth 2.0 / OpenID Connect.
- **Password privacy rule:** No administrator, dashboard, log, API response, or support tool may ever expose a user's original password.

## 4. Account Recovery

- Recovery via verified email, verified phone, trusted identity provider, or MFA.
- One-time codes (e.g. 6-digit OTP): expire quickly, single-use, limited attempts, brute-force protected.
- Recovery always **creates a new password** — it never reveals the old one.

## 5. Authorization & Ownership

Authentication answers "who are you?" — Authorization answers "what are you allowed to do?" These are always separate systems.

Permission levels: Owner → Super Administrator → Organization Administrator → Manager → Operator → Controller → Viewer → Guest → Temporary.

Authorization should resolve the full question: **who + what + which device + where + when + under what conditions** (policy-based access control, not just role checks).

Command authorization chain:
```
User Identity → Account Status → Device Identity →
Ownership/Delegated Permission → Command Permission →
Safety Rules → Execution
```

## 6. Organization / Enterprise

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

Supports both a single person (Home → Devices) and a full enterprise (Company → Sites → Buildings → Rooms → Devices → Users → Roles).

## 7. Device Identity & Capability

Every device needs: Device ID, manufacturer, model, serial number, type, firmware version, owner, status, security state.

Beyond identity, KSV needs to know what a device can actually **do** — its capability set (e.g. a TV: power, volume, channel, input, display, network) — not just "this is a TV."

## 8. Discovery & Pairing

Discovery methods: Bluetooth, Wi-Fi, local network, QR, NFC, gateway, official cloud/API.

> **Discovery is never authorization.** Finding a device does not grant control.

Pairing flow:
```
Scan → Device Found → Identity Verified → Owner Verified →
Pairing → Permission → Secure Connection → Ready
```

## 9. Device Ownership

Owner types: individual, family, company, factory, warehouse, building, other authorized organization.

Owners can grant, modify, or revoke permission at any time.

## 10. Protocols & Universal Device Architecture

```
Device Type → Manufacturer → Protocol → Authentication → Authorization → Command
```

Supported protocols: Bluetooth, Wi-Fi, HTTPS/APIs, MQTT, Infrared, manufacturer APIs, other authorized local protocols.

KSV never assumes every device speaks the same protocol — a protocol abstraction layer lets new device types plug in without redesigning the platform.

## 11. Gateway / Edge Layer

```
KSV Cloud → KSV Gateway → Local Devices (BT / Wi-Fi / IR / MQTT)
```

Needed for devices that can't reach the cloud directly, and for offline/local control.

## 12. Command Engine

```
User Command → Authentication → Authorization →
Device Capability → Safety Policy → Execute → Result → Audit
```

### AI Command Layer (natural language, optional)
```
Natural Language → AI Interpretation → Structured Command →
Authorization → Safety → Execution
```
AI **interprets** — it never bypasses authorization or safety.

## 13. Automation

```
IF condition THEN action
```
Automation must still pass through the same Permission + Safety checks as manual commands — it never has elevated authority.

## 14. Safety Engine (separate from Security)

For doors, gates, machines, industrial equipment, vehicles, high-power systems.

```
User Authorized ✓ → Security Check ✓ → Safety Check ✗ → COMMAND BLOCKED
```
Having permission does not mean an action is always safe to execute right now.

## 15. Security Core

Layers: encryption, TLS, secrets management, key management, certificates, token/session security, API security, rate limiting, abuse prevention, network segmentation, zero-trust principles, device trust.

Defense-in-depth — no single mechanism is ever considered sufficient alone.

## 16. Key & Secret Management

Kept separate from the application database. Manages API keys, device keys, certificates, encryption keys, OAuth secrets, service credentials — with rotation, expiration, and revocation. Never shown in dashboards or logs.

## 17. Security Monitoring & Incident Response

```
Detect → Alert → Block → Investigate → Recover
```

Watches for: suspicious logins, repeated failures, abnormal commands, permission abuse, account-takeover indicators, device-compromise indicators.

Incident response can: disable accounts, revoke sessions/devices/permissions, rotate keys, isolate affected devices/gateways, force re-authentication, alert admins, preserve evidence.

## 18. Audit System

Every important action logs: user, device, action, time, authorization result, security event, context.

> Passwords and secrets are never written to audit logs.

## 19. Offline & Local Operation

Cloud/internet failure must never turn into a safety hazard. Needs: local control fallback, offline authorization, safe fallback state, reconnection sync — especially critical for doors and industrial equipment.

## 20. Device Lifecycle

```
Discovered → Verified → Paired → Active → Updated →
Suspended → Revoked → Removed
```

## 21. Firmware / Software Updates

Version management, compatibility checks, signed updates, rollback, failed-update recovery, update history.

## 22. International System

- Country, language, and time zone are **three separate settings** — never conflated.
- A country can have multiple languages and multiple time zones.
- Platform target: ~195 countries/territories.
- Language content is separated from application logic so new languages can be added without redesign.

## 23. Privacy & Data Governance

Minimum-access principle: collect only what's needed for legitimate function. Users are told what's collected, why, how long it's kept, and can request deletion/export. 195 countries means 195 regulatory environments — not just 195 translated buttons.

## 24. Notifications

Security alerts, login alerts, device status changes, permission changes, command failures, emergency alerts, recovery notifications — delivered via app, email, SMS, and push.

## 25. Dashboard / Admin Console

**User-facing:** Home, Devices, Rooms, Scenes, Automation, Security, Permissions, Activity, Notifications, Account, Language/Country/Timezone.

**Admin console:** user management, organization management, device management, permission management, security monitoring, audit, system health, incident management, configuration — **without** ever exposing user passwords.

## 26. Reliability, Backup & Disaster Recovery

Load balancing, horizontal scaling, queues, caching, failover, regional infrastructure. Encrypted, verified backups with a tested disaster recovery plan (defined RPO/RTO).

## 27. Testing & Security Verification

Unit, integration, API, device-compatibility, auth, authorization, load, failure, and recovery testing — plus vulnerability scanning, dependency scanning, secure code review, penetration testing, and threat modeling before any high-risk deployment.

## 28. Engineering Governance

Source control, branch protection, code review, CI/CD, secrets protection, dependency management, release/version management, change approval, production access control.

---

## Responsibility Model

| Role | Controls |
|---|---|
| **Platform Owner** | Overall product direction |
| **System Administrator** | Platform operations, account state, security ops |
| **User** | Their own account, password, devices |

- User password → user-controlled secret
- Platform secrets → KSV-controlled secrets
- Device credentials → device/owner-controlled credentials

No single role has unrestricted access to another's secrets.

---

## The 12 Master Domains (top-level grouping)

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

**Build order recommendation:** Do *not* start by building hundreds of API endpoints. Lock down Security Model → Identity → Authorization → Device Model → Protocol Model first — everything else depends on these five.

---

## Final Architecture Flow

```
                         KSV
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
   INTERNATIONAL                       GOVERNANCE
   (country/lang/tz)              (legal/privacy/compliance)
        │
        ▼
   IDENTITY & ACCOUNT
        ▼
   AUTHENTICATION
        ▼
   AUTHORIZATION
        ▼
   ORGANIZATION / OWNERSHIP
        ▼
   DEVICE IDENTITY
        ▼
   DEVICE DISCOVERY / PAIRING
        ▼
   PROTOCOL / GATEWAY LAYER
        ▼
   COMMAND ENGINE
        ├──────────────┐
        ▼              ▼
     SAFETY         AUTOMATION
        └──────┬───────┘
               ▼
          DEVICE CONTROL
               ▼
        AUDIT / MONITORING
               ▼
       INCIDENT / RECOVERY
```

---

*Document status: Architecture reference — no implementation code included by design, per project decision to finalize requirements before writing code.*
