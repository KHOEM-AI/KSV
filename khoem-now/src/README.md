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
