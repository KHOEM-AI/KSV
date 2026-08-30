##### 🌐 KHOEM-AI

### KSV API — ឯកសារពណ៌នា 18 Domains ពេញលេញ

> **ទីតាំង**: `khoem-now/API/`
> **ភាសា**: TypeScript
> **ស្តង់ដារ**: REST API · OAuth 2.0 / OIDC · TLS · Zero-Trust Security

---

## គោលការណ៍ស្នូល (Core Principles)

| # | គោលការណ៍ |
|---|---|
| 1 | **Identity First** — ស្គាល់អ្នកប្រើប្រាស់ជាមុន |
| 2 | **Authorization First** — ពិនិត្យការអនុញ្ញាតមុនគ្រប់ Action |
| 3 | **Security First** — ការពារគ្រប់ស្រទាប់ |
| 4 | **Safety First** — Safety Engine ដាច់ដោយឡែកពី Security |
| 5 | **Privacy First** — Password/Secret មិនត្រូវបង្ហាញ |
| 6 | **Control Only With Permission** — Discover ≠ Authorized |

---

## ឯកសារទី 1 — `identity.ts`
### Identity API — "អ្នកណា?"

**ស្នូល**: គ្រប់គ្រង KSV Account + Identity Provider ដែលភ្ជាប់ (Google, Facebook, TikTok...)

### Types សំខាន់ៗ
| Type | ពណ៌នា |
|---|---|
| `KSVAccount` | គណនីស្នូល — displayName, status, identities |
| `KSVIdentity` | Identity Provider link — provider, email/phone, verificationStatus |
| `IdentityProvider` | email, phone, google, facebook, tiktok, apple, microsoft |
| `AccountStatus` | active, suspended, deleted, pending_verification |

### API Routes (8 endpoints)
| Method | Path | មុខងារ |
|---|---|---|
| GET | `/api/v1/identity/account` | ទាញ Account ខ្លួនឯង |
| PUT | `/api/v1/identity/account` | កែ displayName, language, timezone |
| DELETE | `/api/v1/identity/account` | លុប Account (grace period 30 ថ្ងៃ) |
| POST | `/api/v1/identity/identities/link` | ភ្ជាប់ Provider ថ្មី (OAuth token) |
| DELETE | `/api/v1/identity/identities/:id` | លុប Provider link |
| POST | `/api/v1/identity/identities/:id/verify` | Verify email/phone |
| GET | `/api/v1/identity/lookup/email/:email` | Admin: ស្វែងរកតាម email |
| POST | `/api/v1/identity/account/suspend` | Admin: Suspend account |

### Security Rules
- **KSV មិនរក្សាទុក external password ឡើយ** — ប្រើ OAuth 2.0 / OpenID Connect
- Admin មិនអាចមើល password ឬ OAuth token របស់ User
- Account ត្រូវការ verified identity ≥ 1 — មិនអាចលុប identity ចុងក្រោយ
- Account deletion: grace period **30 ថ្ងៃ** មុនលុបពិតប្រាកដ

### Audit Events (9 events)
`account.viewed`, `account.updated`, `account.suspended`, `account.deletion_scheduled`, `provider.linked`, `provider.unlinked`, `provider.verified`, `provider.verification_failed` ។ល។

---

## ឯកសារទី 2 — `authentication.ts`
### Authentication API — "ពិតជាអ្នកណានោះឬ?"

**ស្នូល**: Login, Session, MFA, Token, Brute-Force Protection

### Types សំខាន់ៗ
| Type | ពណ៌នា |
|---|---|
| `KSVSession` | sessionId, accountId, ipAddress, userAgent, status |
| `KSVToken` | accessToken (15min), refreshToken (7 days) |
| `MFAChallenge` | challengeId, method, maskedDestination |
| `MFAMethod` | totp, sms_otp, email_otp, hardware_key |
| `LoginResult` | success, mfa_required, failed, account_suspended |

### API Routes (14 endpoints)
| Method | Path | មុខងារ |
|---|---|---|
| POST | `/api/v1/auth/login/password` | Login ដោយ email+password |
| POST | `/api/v1/auth/login/oauth` | Login ដោយ OAuth provider |
| POST | `/api/v1/auth/mfa/verify` | ផ្ទៀងផ្ទាត់ MFA code |
| POST | `/api/v1/auth/mfa/enroll` | ចុះឈ្មោះ MFA method ថ្មី |
| POST | `/api/v1/auth/token/refresh` | បន្ត access token |
| GET | `/api/v1/auth/sessions` | មើល session ទាំងអស់ |
| DELETE | `/api/v1/auth/sessions/:id` | Revoke session ជាក់លាក់ |
| POST | `/api/v1/auth/logout` | Logout (ឬ revoke sessions ទាំងអស់) |
| POST | `/api/v1/auth/password/change` | ផ្លាស់ password |
| POST | `/api/v1/auth/admin/revoke-all/:id` | Admin: Revoke sessions ទាំងអស់ |

### Security Rules
- Password: **hash ជា bcrypt/argon2** — មិនរក្សាទុក plain text
- OTP: **expire 10 នាទី**, single-use, max attempts 5
- Access token: **15 នាទី** | Refresh token: **7 ថ្ងៃ**
- Failed login: **5 ครั้ง → lock 15 នាទី**
- Password change: **revoke sessions ផ្សេងទាំងអស់** ភ្លាម

### Audit Events (16 events)
`login.success`, `login.failed`, `mfa.verified`, `mfa.failed`, `session.revoked`, `password.changed`, `account.locked` ។ល។

---

## ឯកសារទី 3 — `account-recovery.ts`
### Account Recovery API — "ភ្លេច Password?"

**ស្នូល**: Recovery flow ដែលបង្កើត password ថ្មី — **មិនបង្ហាញ password ចាស់ឡើយ**

### Recovery Flow
```
Initiate → OTP Sent (masked) → Verify OTP → Recovery Token → Reset Password → Revoke All Sessions
```

### Types សំខាន់ៗ
| Type | ពណ៌នា |
|---|---|
| `RecoverySession` | sessionId, method, status, maskedDestination, attemptsUsed |
| `RecoveryMethod` | email, phone, identity_provider, backup_code |
| `RecoveryStatus` | pending, otp_sent, otp_verified, completed, expired |
| `BackupCode` | codeIndex, isUsed, usedAt |

### API Routes (11 endpoints)
| Method | Path | មុខងារ |
|---|---|---|
| POST | `/api/v1/recovery/initiate` | ចាប់ផ្តើម recovery |
| POST | `/api/v1/recovery/otp/resend` | ផ្ញើ OTP ម្តងទៀត |
| POST | `/api/v1/recovery/otp/verify` | ផ្ទៀងផ្ទាត់ OTP |
| POST | `/api/v1/recovery/provider/verify` | Recovery ដោយ OAuth |
| POST | `/api/v1/recovery/backup-code/verify` | Recovery ដោយ Backup Code |
| POST | `/api/v1/recovery/password/reset` | Reset password ថ្មី |
| POST | `/api/v1/recovery/cancel` | លុបចោល recovery session |
| POST | `/api/v1/recovery/backup-codes/generate` | បង្កើត Backup Codes ថ្មី |
| GET | `/api/v1/recovery/backup-codes/status` | ពិនិត្យ Backup Code នៅសល់ |

### Security Rules
- OTP: **10 នាទី**, single-use, max 5 attempts
- Rate limit: **3 recovery/IP/hour** — ការពារ brute-force
- Recovery token (ក្រោយ OTP verified): **15 នាទី**
- **Account enumeration prevented** — response ដូចគ្នា ទោះ email មាន ឬមិនមាន
- Backup codes: **hash ជា secure format** — plain text seen once only
- **Password ចាស់ មិនបង្ហាញ ជាដាច់ខាត**

### Audit Events (13 events)
`recovery.initiated`, `otp_verified`, `otp_failed`, `password_reset`, `sessions_revoked`, `backup_codes_generated` ។ល។

---

## ឯកសារទី 4 — `authorization.ts`
### Authorization API — "អ្នកមានសិទ្ធិធ្វើអ្វី?"

**ស្នូល**: Policy-Based Access Control — WHO + WHAT + WHICH device + WHERE + WHEN + CONDITIONS

### Types សំខាន់ៗ
| Type | ពណ៌នា |
|---|---|
| `KSVPermission` | permissionId, accountId, resourceType, actions, level, conditions |
| `PermissionLevel` | owner, super_admin, org_admin, manager, operator, controller, viewer, guest, temporary |
| `PermissionConditions` | timeFrom, timeTo, daysOfWeek, locationRestriction, requiresApproval |
| `ResourceType` | device, device_group, organization, site, building, room, gateway |
| `ActionType` | read, write, control, pair, unpair, manage_permissions, delete, emergency_stop |

### API Routes (12 endpoints)
| Method | Path | មុខងារ |
|---|---|---|
| POST | `/api/v1/authz/check` | ពិនិត្យ permission (internal) |
| POST | `/api/v1/authz/check/batch` | ពិនិត្យ permissions ច្រើន |
| POST | `/api/v1/authz/permissions` | Grant permission |
| DELETE | `/api/v1/authz/permissions/:id` | Revoke permission |
| GET | `/api/v1/authz/my-permissions` | permission ខ្លួនឯង |
| GET | `/api/v1/authz/approvals/pending` | Action ដែលរង់ចាំ Approve |
| POST | `/api/v1/authz/approvals/:id` | Approve/Reject action |
| POST | `/api/v1/authz/owner/:type/:id/transfer` | ផ្ទេរ ownership |

### Security Rules
- **គ្មាន Implicit Permission** — Login ≠ Permission
- User GrantPermission ≤ ระดับ ខ្លួនឯង — Operator មិនអាច Grant Owner
- **GPS គ្រាន់តែជា secondary context** — មិនមែន primary security control
- Revoked permissions effective **ភ្លាម** — cached result ត្រូវ invalidate
- Permission expiry: **auto-rejected** ពេល expires

### Audit Events (10 events)
`permission.check.allowed`, `permission.check.denied`, `permission.granted`, `permission.revoked`, `approval.approved`, `ownership.transferred` ។ល។

---

## ឯកសារទី 5 — `organization.ts`
### Organization API — "ក្រុមហ៊ុន + Structure"

**ស្នូល**: Company → Site → Building → Room → Devices → Users → Roles

### Types សំខាន់ៗ
| Type | ពណ៌នា |
|---|---|
| `KSVOrganization` | orgId, name, type, countryCode, timezone, memberCount, deviceCount |
| `KSVSite` | siteId, orgId, name, type (factory/office/warehouse...) |
| `KSVBuilding` | buildingId, siteId, floorCount, roomCount |
| `KSVRoom` | roomId, buildingId, floor, deviceCount |
| `KSVOrgMember` | memberId, accountId, role, joinedAt |
| `OrgType` | personal, family, company, government, ngo |
| `MemberRole` | owner, admin, manager, operator, viewer, guest |

### API Routes (26 endpoints)
- **Organizations**: Create, List, Get, Update, Delete (5)
- **Sites**: CRUD operations (5)
- **Buildings**: CRUD operations (5)
- **Rooms**: CRUD operations (5)
- **Members**: Invite, List, Get, UpdateRole, Remove (5)
- **Policies**: Create, List, Get, Update, Delete (5)

### ឧទាហរណ៍ Structure
```
Company A
 ├── Phnom Penh Factory (Site)
 │    ├── Main Building
 │    │    ├── Machine Room (Room) → Devices
 │    │    └── Control Room (Room) → Devices
 │    └── Warehouse
 └── Bangkok Branch (Site)
```

### Audit Events (17 events)
`org.created`, `site.created`, `building.created`, `member.invited`, `member.role_changed`, `policy.updated` ។ល។

---

## ឯកសារទី 6 — `device.ts`
### Device API — "ឧបករណ៍ + Capability"

**ស្នូល**: Device Identity, Capability, Ownership, Lifecycle — KSV ដឹងថា Device អាចធ្វើអ្វី

### Types សំខាន់ៗ
| Type | ពណ៌នា |
|---|---|
| `KSVDevice` | deviceId, name, manufacturer, model, protocol[], status, capabilities[] |
| `DeviceCapability` | name, type (toggle/range/enum), minValue, maxValue, isSafetyRelevant |
| `DeviceCategory` | home, building, vehicle, industrial, warehouse, energy |
| `DeviceType` | light, fan, ac, tv, door, elevator, motor, pump, robot, solar... (25+) |
| `DeviceProtocol` | bluetooth, wifi, mqtt, http_api, infrared, zigbee, lorawan, modbus |
| `DeviceLifecycleStage` | discovered, verified, paired, active, updated, suspended, revoked, removed |

### API Routes (14 endpoints)
| Method | Path | មុខងារ |
|---|---|---|
| POST | `/api/v1/devices` | Register device |
| GET | `/api/v1/devices` | List devices (filter by org/site/type) |
| GET | `/api/v1/devices/:id/state` | State ពិតប្រាកដ |
| GET | `/api/v1/devices/:id/capabilities` | Capability list |
| POST | `/api/v1/devices/:id/firmware/update` | Update firmware (signed) |
| POST | `/api/v1/devices/:id/quarantine` | Quarantine (Admin) |
| POST | `/api/v1/devices/:id/decommission` | Retire device |

### Device Categories
```
Home:       Light, Fan, AC, TV, Speaker, Smart Lock, Gate
Building:   Door, Elevator, Camera, Access Control, HVAC
Vehicle:    Car, EV, Fleet, Bus
Industrial: Motor, Pump, PLC, Robot, Conveyor
Warehouse:  Scanner, Shelf Sensor, Automation
Energy:     Solar Inverter, Battery, Meter
```

### Security Rules
- Firmware: **cryptographically signed** — unsigned update rejected
- Quarantined device: **zero commands** until admin releases
- Safety-relevant capability → **Safety Engine must also approve**

---

## ឯកសារទី 7 — `discovery.ts` (includes Pairing)
### Discovery & Pairing API — "ស្វែងរក + តភ្ជាប់"

**ស្នូល**: Scan → Verify → Pair → Secure Connection

> **ច្បាប់ចំបង**: Discovery ≠ Permission. Found ≠ Authorized.

### Types សំខាន់ៗ
| Type | ពណ៌នា |
|---|---|
| `DiscoveredDevice` | discoveryId, method, protocol, status (unverified) |
| `PairingSession` | pairingSessionId, method, status, verificationData |
| `DiscoveryMethod` | bluetooth, wifi, local_network, qr, nfc, gateway, cloud_api |
| `PairingMethod` | pin, qr, nfc, push_button, certificate, owner_approval |
| `PairingStatus` | pending, owner_verifying, pairing, paired, failed, expired |

### Pairing Flow
```
SCAN → DEVICE FOUND → IDENTITY VERIFIED → OWNER VERIFIED →
PAIRING → PERMISSION → SECURE CONNECTION → READY
```

### API Routes (11 endpoints)
| Method | Path | មុខងារ |
|---|---|---|
| POST | `/api/v1/discovery/start` | ចាប់ផ្តើម scan |
| GET | `/api/v1/discovery/devices` | List found devices (unverified) |
| POST | `/api/v1/discovery/devices/:id/verify` | Verify device identity |
| POST | `/api/v1/pairing/initiate` | ចាប់ផ្តើម pairing |
| POST | `/api/v1/pairing/:id/complete` | Complete pairing |
| POST | `/api/v1/pairing/:id/cancel` | លុបចោល pairing |
| POST | `/api/v1/devices/:id/unpair` | Unpair device |

### Security Rules
- Advertised device name: **NOT trusted** — may be spoofed
- Discovery session: **expire 300 seconds**
- Pairing session: **expire 120 seconds**
- **Cryptographic verification required** before accepting any pairing

---

## ឯកសារទី 8 — `command.ts`
### Command API — "ចេញ Command ដល់ Device"

**ស្នូល**: Command Pipeline ពេញលេញ — **គ្មាន shortcut**

### Command Pipeline (9 ជំហាន)
```
1. PARSE         → Validate structure
2. AUTHENTICATE  → Verify session valid
3. AUTHORIZE     → Check permission
4. CAPABILITY    → Device supports this?
5. SAFETY        → Safety Engine approval
6. CONFIRM       → Human confirmation (high-risk)
7. EXECUTE       → Send to device
8. COLLECT RESULT → Device feedback
9. AUDIT         → Log everything
```

### Types សំខាន់ៗ
| Type | ពណ៌នា |
|---|---|
| `KSVCommand` | commandId, deviceId, capability, value, status, source |
| `CommandStatus` | pending, executing, success, rejected_auth, rejected_safety, timeout |
| `CommandSource` | user_app, automation, ai_layer, api, gateway_local, admin |
| `CommandResult` | success, returnedValue, errorCode |

### API Routes (6 endpoints)
| Method | Path | មុខងារ |
|---|---|---|
| POST | `/api/v1/commands` | ចេញ command |
| POST | `/api/v1/commands/batch` | ចេញ commands ច្រើន |
| GET | `/api/v1/commands/:id` | Command status |
| POST | `/api/v1/commands/:id/cancel` | Cancel command |
| GET | `/api/v1/commands/history` | Command history |
| POST | `/api/v1/commands/emergency-stop` | Emergency stop |

### Security Rules
- AI-layer commands: **same pipeline** — not trusted more than user
- Emergency Stop: **cannot be blocked** by automation
- All commands: **audited** including rejected ones
- Timeout default: **30 seconds**

---

## ឯកសារទី 9 — `gateway.ts`
### Gateway API — "Edge Controller"

**ស្នូល**: KSV Cloud ↔ Gateway ↔ Local Devices — Bridge (NOT security bypass)

### Types សំខាន់ៗ
| Type | ពណ៌នា |
|---|---|
| `KSVGateway` | gatewayId, name, type, status, supportedProtocols[], connectedDeviceCount |
| `GatewayMode` | cloud_connected, local_only, hybrid |
| `GatewayType` | home, building, industrial, vehicle, portable |
| `GatewayHeartbeat` | timestamp, cpuUsage, memUsage, connectedDeviceCount |
| `OfflinePolicyConfig` | allowLocalControl, allowedCapabilities, syncOnReconnect |

### API Routes (14 endpoints)
| Method | Path | មុខងារ |
|---|---|---|
| POST | `/api/v1/gateways` | Register gateway |
| GET | `/api/v1/gateways/:id/status` | Status + connected devices |
| POST | `/api/v1/gateways/:id/heartbeat` | Gateway → Cloud heartbeat |
| POST | `/api/v1/gateways/:id/sync` | Sync on reconnect |
| GET | `/api/v1/gateways/:id/sync/queue` | Pending commands |
| PUT | `/api/v1/gateways/:id/offline-policy` | Offline behavior config |

### Offline Architecture
```
Cloud available: Cloud → Gateway → Device
Cloud down:      Gateway (offline policy) → Device
Reconnect:       Gateway sync → Cloud (state reconciliation)
```

### Security Rules
- Provisioning token: **single-use**, expire 30 minutes
- Firmware: **must be signed** before applying
- Cloud down → **offline policy** applies (not open access)
- Gateway: **cannot override** cloud permissions

---

## ឯកសារទី 10 — `protocol.ts`
### Protocol API — "Universal Protocol Layer"

**ស្នូល**: Protocol Abstraction — Device Type → Manufacturer → Protocol → Command

### Supported Protocols
| Protocol | ប្រើសម្រាប់ |
|---|---|
| Bluetooth / BLE | Smart Home, Wearables |
| Wi-Fi / HTTPS | Most smart devices |
| MQTT | IoT sensors, Industrial |
| Infrared | TV, AC, Legacy devices |
| Zigbee / Z-Wave | Smart Home mesh |
| LoRaWAN | Long-range IoT |
| Modbus | Industrial machines |
| BACnet | Building automation |
| CAN Bus | Vehicle systems |

### Types សំខាន់ៗ
| Type | ពណ៌នា |
|---|---|
| `ProtocolAdapter` | adapterId, protocol, supportedManufacturers, isSecureChannel |
| `ProtocolConnection` | connectionId, deviceId, state, latencyMs, encryptionEnabled |
| `ManufacturerProfile` | name, protocols[], authType, requiresCloudAccount |

### Protocol Abstraction Flow
```
KSV Command → Protocol Adapter → Bluetooth/Wi-Fi/MQTT/IR → Device
```

### API Routes (8 endpoints)
`LIST_ADAPTERS`, `GET_ADAPTER`, `LIST_CONNECTIONS`, `TEST_CONNECTION`, `DISCONNECT`, `RECONNECT`, `LIST_MANUFACTURERS`, `UPDATE_PROTOCOL_CONFIG`

---

## ឯកសារទី 11 — `safety.ts`
### Safety API — "Safety Engine (ដាច់ចាក Security)"

**ស្នូល**: Safety ≠ Security — Permission ✓ + Security ✓ + Safety ✗ = COMMAND BLOCKED

### Types សំខាន់ៗ
| Type | ពណ៌នា |
|---|---|
| `SafetyRule` | ruleId, type, severity, conditions, action, deviceIds |
| `SafetyRuleType` | operating_hours, interlock, rate_limit, value_range, emergency_override |
| `SafetyRuleSeverity` | critical, high, medium, low |
| `SafetyState` | normal, warning, alert, emergency, lockdown |
| `SafetyCondition` | timeFrom, timeTo, interlockDeviceId, maxValue, temperatureMax |
| `SafetyAction` | block, warn, require_confirmation, emergency_stop, alert_admin |

### ឧទាហរណ៍ Safety Rules
```
Rule: Motor A can only run 8AM-5PM weekdays
Rule: Gate cannot open if Fire Alarm is active (interlock)
Rule: Temperature > 80°C → block all heating commands
Rule: Max 10 commands/minute per device
Rule: Robot must E-Stop if human detected in zone
```

### API Routes (11 endpoints)
| Method | Path | មុខងារ |
|---|---|---|
| POST | `/api/v1/safety/check` | Safety check (internal) |
| POST | `/api/v1/safety/rules` | Create safety rule |
| GET | `/api/v1/safety/devices/:id` | Device safety status |
| POST | `/api/v1/safety/emergency-stop` | Emergency stop |
| POST | `/api/v1/safety/emergency-stop/release` | Release (requires verification) |
| GET | `/api/v1/safety/events` | Safety events |

### Security Rules
- Safety Engine: **independent from Security** — authorization alone is insufficient
- Emergency Stop: **cannot be overridden** by automation or AI
- Industrial rules: **require manager permission** to modify
- Emergency release: **requires explicit safety verification** checklist

---

## ឯកសារទី 12 — `automation.ts`
### Automation API — "IF Condition THEN Action"

**ស្នូល**: Rules + Scenes — **ឆ្លងតាម Permission + Safety pipeline ដូចគ្នា**

### Trigger Types
| Trigger | ឧទាហរណ៍ |
|---|---|
| `schedule` | ចាំពេល 6:00AM ជារៀងរាល់ថ្ងៃ |
| `device_state` | TV ដើរ → បើ AC |
| `sensor_value` | Temperature > 30°C → Fan ON |
| `time_of_day` | 10PM → Lock all doors |
| `sunrise_sunset` | Sunrise + 30min → Open blinds |
| `device_offline` | Camera offline → Alert admin |
| `safety_event` | E-Stop → Notify all managers |

### Types សំខាន់ៗ
| Type | ពណ៌នា |
|---|---|
| `AutomationRule` | ruleId, trigger, conditions[], conditionLogic, actions[] |
| `AutomationScene` | sceneId, name, actions[] (ចុចតែ​ម្តង → ស្រែក actions ច្រើន) |
| `AutomationLog` | logId, conditionsMet, actionsExecuted, actionsFailed |
| `ConditionOperator` | eq, ne, gt, gte, lt, lte, between, in |

### API Routes (14 endpoints)
Rules: Create, List, Get, Update, Delete, Enable, Disable, Test (8)
Scenes: Create, List, Get, Update, Delete, Activate (6)

### Security Rules
- `bypassSafety` field is **always forced to false** — cannot be set true
- Automation **inherits owner's permissions** — cannot exceed creator's level
- Automation rules: **same command pipeline** as manual commands

---

## ឯកសារទី 13 — `security.ts`
### Security API — "Key Management + Threat Detection"

**ស្នូល**: Encrypt, Key/Secret lifecycle, Monitoring, Incident Response

> **ច្បាប់ចំបង**: "No single credential/account/API/admin/device has unlimited platform control"

### Types សំខាន់ៗ
| Type | ពណ៌នា |
|---|---|
| `ManagedKey` | keyId, type, status, expiresAt, rotationIntervalDays (metadata only) |
| `KeyType` | api_key, device_key, certificate, oauth_secret, encryption_key |
| `ThreatDetection` | detectionId, type, severity, accountId, autoActionTaken |
| `ThreatType` | brute_force, suspicious_login, abnormal_command, account_takeover |
| `SecurityIncident` | incidentId, status, affectedAccountIds, affectedDeviceIds |
| `IncidentAction` | type (disable_account, revoke_session, rotate_key, isolate_device...) |

### API Routes (13 endpoints)
| Method | Path | មុខងារ |
|---|---|---|
| POST | `/api/v1/security/keys` | Create key (secret shown ONCE) |
| POST | `/api/v1/security/keys/:id/rotate` | Rotate key |
| POST | `/api/v1/security/keys/:id/revoke` | Revoke key |
| POST | `/api/v1/security/encrypt` | Encrypt data |
| POST | `/api/v1/security/decrypt` | Decrypt data |
| GET | `/api/v1/security/threats` | Threat list |
| POST | `/api/v1/security/incidents` | Create incident |
| POST | `/api/v1/security/incidents/:id/actions` | Take incident action |

### Security Rules
- **Raw secret shown EXACTLY ONCE at creation** — never retrievable again
- Encryption at rest for all secrets
- Minimum TLS 1.2 for all traffic
- Critical incident: **auto alert** admins
- Threat review SLA: **4 hours**

---

## ឯកសារទី 14 — `audit.ts`
### Audit API — "Who did What, When, Authorized?"

**ស្នូល**: Activity logging, Compliance records — **Password/Secret NEVER in logs**

### Types សំខាន់ៗ
| Type | ពណ៌នា |
|---|---|
| `AuditRecord` | auditId, category, eventType, actorId, targetId, result, ipAddress |
| `AuditCategory` | identity, auth, authorization, device, command, safety, security... |
| `AuditResult` | success, failure, denied, error, pending |
| `ComplianceReport` | period, eventsByCategory, securityIncidentCount, deniedAccessCount |

### AuditRecord Structure
```
WHO:        actorAccountId + actorType
WHAT:       eventType + action (human-readable)
WHICH:      targetType + targetId
WHEN:       occurredAt (ISO 8601 UTC)
WHERE:      ipAddress + sessionId + orgId
AUTHORIZED: result (success/denied/failure)
CONTEXT:    metadata (NO passwords, NO tokens, NO secrets)
```

### API Routes (10 endpoints)
| Method | Path | មុខងារ |
|---|---|---|
| POST | `/api/v1/audit/events` | Record event (internal only) |
| GET | `/api/v1/audit/events` | Query log |
| POST | `/api/v1/audit/export` | Export (CSV/JSON/PDF) |
| POST | `/api/v1/audit/compliance-report` | Compliance report |
| GET | `/api/v1/audit/devices/:id` | Device audit trail |
| GET | `/api/v1/audit/accounts/:id` | Account audit trail |

### Security Rules
- **Passwords/tokens NEVER in audit log** — handler strips/rejects secret fields
- **Immutable** — no update or delete endpoint exists
- Retention: minimum **365 ថ្ងៃ**
- Every export is **self-audited** (who exported, why)

---

## ឯកសារទី 15 — `notification.ts`
### Notification API — "App / Email / SMS / Push"

**ស្នូល**: Alerts ប្រភេទទាំងអស់ + User Preferences + Push Token management

### Notification Categories
| Category | ត្រូវ Alert |
|---|---|
| `security_alert` | Suspicious login, key compromised |
| `login_alert` | New login from new device/location |
| `device_alert` | Device error, unauthorized access |
| `permission_change` | Someone changed your permission |
| `device_offline` | Device went offline |
| `emergency_alert` | Emergency stop activated |
| `safety_event` | Safety rule triggered |
| `account_recovery` | Password reset attempted |

### Types សំខាន់ៗ
| Type | ពណ៌នា |
|---|---|
| `KSVNotification` | notificationId, category, priority, title, body, status per channel |
| `NotificationPreferences` | categoryPreferences, quietHours |
| `PushDeviceToken` | tokenId, platform (ios/android/web), token |

### API Routes (11 endpoints)
| Method | Path | មុខងារ |
|---|---|---|
| POST | `/api/v1/notifications/send` | Send notification |
| POST | `/api/v1/notifications/send-bulk` | Bulk send |
| GET | `/api/v1/notifications` | Inbox |
| POST | `/api/v1/notifications/read-all` | Mark all read |
| PUT | `/api/v1/notifications/preferences` | Update preferences |
| POST | `/api/v1/notifications/push-tokens` | Register push token |

### Rules
- **Critical alerts bypass quiet hours and user opt-outs**
- **Security alerts cannot be fully disabled**
- Default expiry: **90 ថ្ងៃ** (auto-clean)
- Bulk rate limit: **1,000/minute**

---

## ឯកសារទី 16 — `international.ts`
### International API — "195 ប្រទេស + ភាសា + Timezone"

**ស្នូល**: Country ≠ Language ≠ Timezone — independent dimensions

### Types សំខាន់ៗ
| Type | ពណ៌នា |
|---|---|
| `Country` | countryCode (ISO 3166), name, callingCode, supportedLanguages[], supportedTimezones[] |
| `Language` | languageCode (ISO 639-1), nativeName, isRTL, translationCoveragePercent |
| `TimeZone` | timezoneId (IANA), utcOffsetMinutes, observesDST |
| `RegionalSettings` | countryCode, languageCode, timezoneId, dateFormat, measurementSystem |

### Selection Flow
```
User selects:
  Language 🌐 (km, en, th, zh, ja, ko...)
      ↓
  Country 🌍 (KH, TH, JP, US... 195 total)
      ↓
  Time Zone 🕐 (Asia/Phnom_Penh, Asia/Bangkok...)
```

### API Routes (7 endpoints)
| Method | Path | មុខងារ |
|---|---|---|
| GET | `/api/v1/international/countries` | List 195 countries |
| GET | `/api/v1/international/languages` | List supported languages |
| GET | `/api/v1/international/timezones` | List timezones (filter by country) |
| GET | `/api/v1/international/my-settings` | User regional settings |
| PUT | `/api/v1/international/my-settings` | Update settings |
| GET | `/api/v1/international/translations/:lang` | UI translations |
| POST | `/api/v1/international/convert-time` | UTC ↔ local time |

### Design Rules
- **Country ≠ Language ≠ Timezone** — never conflate
- All internal timestamps: **UTC only** — local time is display-only
- Translation system: **separated from code** — adding language ≠ redeployment
- Fallback language: **"en"** when translation key missing

---

## ឯកសារទី 17 — `administration.ts`
### Administration API — "Admin Console (Least Privilege)"

**ស្នូល**: Admin manages State + Operations — **Admin NEVER sees user secrets**

### Admin Roles (Scoped — not unlimited)
| Role | អ្វីដែលអាចធ្វើ |
|---|---|
| `super_admin` | Grant/Revoke admin roles, platform config |
| `security_admin` | Threats, incidents, key management |
| `support_admin` | Account lookup, impersonation (limited) |
| `billing_admin` | Subscription, billing data |
| `compliance_admin` | Audit export, compliance reports |

### Types សំខាន់ៗ
| Type | ពណ៌នា |
|---|---|
| `AdminUser` | adminId, accountId, roles[], mfaRequired: true |
| `SystemHealthReport` | status, services[], activeIncidentCount |
| `PlatformStatistics` | totalAccounts, totalDevices, commandsLast24h... |
| `FeatureFlag` | flagKey, isEnabled, rolloutPercent, targetOrgIds |

### API Routes (11 endpoints)
| Method | Path | មុខងារ |
|---|---|---|
| POST | `/api/v1/admin/roles/grant` | Grant admin role (super_admin only) |
| GET | `/api/v1/admin/accounts/search` | Search accounts |
| POST | `/api/v1/admin/accounts/:id/suspend` | Suspend account |
| POST | `/api/v1/admin/accounts/:id/impersonate` | Support impersonation (limited) |
| GET | `/api/v1/admin/system/health` | System health |
| GET | `/api/v1/admin/system/stats` | Platform statistics |
| PUT | `/api/v1/admin/feature-flags/:key` | Feature flag toggle |

### Security Rules
- **Admin NEVER sees user passwords, MFA secrets, OAuth tokens**
- **MFA mandatory** for all admin accounts — no exceptions
- Only `super_admin` manages admin roles
- Impersonation: **time-limited (30 min), fully audited, disclosed to user afterward**
- Roles are **scoped** — security_admin ≠ access to billing data

---

## ឯកសារទី 18 — `index.ts`
### API Index — "ផ្ចង់ Domains ទាំង 18 ចូលគ្នា"

**ស្នូល**: Central export + Route Registry + Domain File Map

### ខ្លឹមសារ
```typescript
// re-exports all 17 domain files
export * from './identity';
export * from './authentication';
// ... (17 files)

// Combined route registry
export const KSV_API_ROUTE_REGISTRY = {
  identity: IDENTITY_ROUTES,
  authentication: AUTHENTICATION_ROUTES,
  // ... (17 domains)
}

// Domain file map (18 domains → 17 files, pairing merged into discovery)
export const KSV_API_DOMAIN_FILES = [...]
```

### ការ​បញ្ចូល​​​​​​​​ Pairing ក្នុង discovery.ts
Discovery + Pairing ជាដំណើរការបន្ត (Scan → Verify → Pair → Ready) — ខ្ញុំបញ្ចូលពីររួមមួយ ដើម្បីកុំ split flow ដូចគ្នាចេញជា 2 files ផ្សេក។

---

## ផ្ទាំងសង្ខេប — Routes ទាំងអស់

| Domain | Endpoints |
|---|---|
| Identity | 8 |
| Authentication | 14 |
| Account Recovery | 11 |
| Authorization | 12 |
| Organization | 26 |
| Device | 14 |
| Discovery + Pairing | 11 |
| Protocol | 8 |
| Gateway | 14 |
| Command | 6 |
| Safety | 11 |
| Automation | 14 |
| Security | 13 |
| Audit | 10 |
| Notification | 11 |
| International | 7 |
| Administration | 11 |
| **សរុប** | **≈ 191 REST Endpoints** |

---

## Audit Events ទាំងអស់

ឯកសារ | Audit Events
---|---
identity | 9
authentication | 16
account-recovery | 13
authorization | 10
organization | 17
device | 14
discovery | 13
protocol | 6
gateway | 13
command | 13
safety | 14
automation | 13
security | 12
audit | 4
notification | 7
international | 3
administration | 9
**សរុប** | **≈ 196 Audit Events**

---

*ឯកសារនេះបញ្ចប់ ការពណ៌នា API 18 Domains នៃ KSV Universal Secure Control Platform*
*ទីតាំង: `khoem-now/API/` — ភ្ជាប់ Central export ដោយ `index.ts`*
