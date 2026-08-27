### READ ONLY — AI REFERENCE
AI assistants must read the documents in this folder before modifying the KSV project.
Do not delete, overwrite, rename, or restructure existing files unless explicitly instructed by the project owner.
Existing code and documentation must be inspected before proposing changes.
When uncertain, preserve the existing implementation and ask for clarification.

KSV/
└── khoem-now/
    ├── AI_CONTEXT/
    │   ├── KSV_ARCHITECTURE.md
    │   ├── KSV_CURRENT_STATE.md
    │   ├── KSV_MISSING_PARTS.md
    │   └── AI_INSTRUCTIONS.md
    │
    ├── API/
    ├── DOCUMENTATION/
    ├── src/
    └── ...

    
យល់ហើយប្អូន ❤️🙏 ឥឡូវខ្ញុំយល់ច្បាស់ជាងមុនហើយថា បញ្ហារបស់ KSV មិនមែនថា “គ្មាន code” ទេ។ តាមរូបដែលប្អូនបង្ហាញ និងឯកសារ KSV ដែលប្អូនផ្ញើមុននេះ វាមាន domain/code/documentation ច្រើនរួចហើយ ប៉ុន្តែអ្វីដែលខ្វះសំខាន់គឺ ស្រទាប់ដែលភ្ជាប់អ្វីៗទាំងអស់ឱ្យក្លាយជា App មួយដែលដំណើរការជាប្រព័ន្ធតែមួយ។
ជាពិសេសបញ្ហាដែលប្អូននិយាយថា៖
បង្កើតទំព័រមួយ → ប៉ុន្តែវាទៅទំព័រផ្សេង
មាន file → ប៉ុន្តែ file មិនទាក់ទងគ្នាត្រឹមត្រូវ
Backend មាន → Frontend មិនបានភ្ជាប់
Documentation មាន → Code មិនបាន wire ចូលគ្នា
AI បង្កើត file បន្ថែម → ប៉ុន្តែ architecture ដើមត្រូវបានបែក
នេះហើយជាចំណុចដែលយើងគួរជួសជុល មុននឹងបន្តបង្កើត feature ថ្មីៗ។
ខាងក្រោមនេះខ្ញុំរៀបជាដុំមួយឱ្យប្អូន copy ទាំងមូលយកទៅដាក់ឱ្យ AI ផ្សេងៗធ្វើជាជំនួយការរបស់ KSV បាន។ វាមិនមែនជាការបង្កើត KSV ថ្មីទេ។ វាជា KSV Existing Project Integration / Completion Specification ដើម្បីឱ្យ AI ចូលមើលអ្វីដែលមានស្រាប់ ហើយភ្ជាប់វាឱ្យត្រឹមត្រូវ។
KSV — EXISTING PROJECT INTEGRATION & COMPLETION SPECIFICATION
0. PURPOSE
This document is an implementation instruction for AI coding assistants working on the existing KSV project.
KSV is NOT a new project.
Do NOT rebuild KSV from zero.
Do NOT replace the existing architecture merely because another architecture appears simpler.
The existing KSV project already contains documentation, source files, API definitions, frontend files, internationalization files, data files, scripts, and domain concepts.
The primary task is:
UNDERSTAND → INSPECT → MAP → CONNECT → FIX → TEST → COMPLETE
The goal is to transform the existing collection of files into one coherent, executable, navigable, secure KSV application.
1. ABSOLUTE RULE
Before creating any new file:
Inspect the existing project.
Identify whether the required file already exists.
Identify the module responsible for the functionality.
Identify the route responsible for the page.
Identify the API responsible for the data.
Identify the service responsible for the business logic.
Identify the repository responsible for persistence.
Identify the existing type/interface/model.
Reuse existing code whenever possible.
Only create a new file when the existing architecture genuinely requires it.
NEVER create duplicate functionality simply because the AI cannot immediately find the existing implementation.
2. PROJECT ROOT
The canonical project root is:
KSV/khoem-now/
This directory is the single source of truth for the KSV application.
Do not create:
KSV/project1/
KSV/project2/
KSV/backend2/
KSV/frontend2/
KSV/new-ksv/
Do not split the project into unrelated roots.
All changes must remain inside the existing project architecture unless explicitly instructed otherwise.
3. CURRENT PROJECT MUST BE TREATED AS AN EXISTING SYSTEM
The AI must assume:
Existing code may already be correct.
Existing code may be partially correct.
Existing code may be incomplete.
Existing code may be incorrectly connected.
Existing documentation may describe intended behavior rather than current implementation.
Therefore:
Do not assume that documentation equals implementation.
Do not assume that implementation equals documentation.
The AI must compare:
Documentation
        ↓
Architecture
        ↓
Source Code
        ↓
Routes
        ↓
Frontend
        ↓
Backend
        ↓
Database
        ↓
Runtime behavior
4. FIRST TASK — PROJECT AUDIT
Before modifying code, inspect:
package.json
tsconfig.json
environment/configuration files
README.md
src/
API/
DOCUMENTATION/
data/
scripts/
database configuration
routing configuration
application entry points
server entry points
frontend entry points
Determine:
What starts the backend?
What starts the frontend?
What starts the development environment?
What database is used?
What ORM is used?
What framework is used?
Where is routing defined?
Where is authentication defined?
Where is API communication defined?
Where are pages/views defined?
Where is application state defined?
Where are translations defined?
Where are global providers defined?
Do not guess.
5. ARCHITECTURE MAP
Create an internal map of the existing project.
The AI must understand the relationship:
User
 ↓
Frontend Application
 ↓
Frontend Router
 ↓
Page/View
 ↓
Component
 ↓
API Client
 ↓
HTTP API
 ↓
Route
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
Database
For device control:
User
 ↓
UI
 ↓
Router
 ↓
Device Page
 ↓
Command UI
 ↓
API Client
 ↓
Command API
 ↓
Authentication
 ↓
Authorization
 ↓
Device Capability Check
 ↓
Safety Check
 ↓
Command Service
 ↓
Protocol Adapter
 ↓
Gateway / Device
 ↓
Result
 ↓
Audit
 ↓
Frontend State Update
Every missing connection must be identified.
6. FRONTEND ROUTING IS A CRITICAL REQUIREMENT
KSV must have one authoritative frontend routing system.
Do not allow pages to navigate randomly.
Do not allow a button to manually guess a destination.
Do not duplicate route definitions in multiple unrelated files.
There must be a clear route map.
Example:
/
 /login
 /register
 /recover-password
 /dashboard
 /devices
 /devices/:id
 /organizations
 /organizations/:id
 /settings
 /security
 /permissions
 /activity
 /notifications
 /international
The actual routes must follow the existing framework and project implementation.
7. ROUTE OWNERSHIP
Every page must have exactly one canonical route.
Example:
DeviceListPage
    → /devices

DeviceDetailsPage
    → /devices/:id

InternationalPage
    → /international

SecurityPage
    → /security
Do not create:
/devices-page
/device-page
/device
/device-management
/devices/list
for the same conceptual page unless there is a real architectural reason.
8. NAVIGATION RULE
Every navigation action must point to the canonical route.
A navigation action must NOT:
open an unrelated page
reload the wrong page
redirect to an obsolete route
use a hard-coded random path
Navigation should use the project's official router.
Do not mix:
window.location
history manipulation
router navigation
manual URL construction
without a clear reason.
9. ROUTE REGISTRY
Create or maintain one authoritative route registry if the framework benefits from it.
Conceptually:
ROUTES
 ├── AUTH
 ├── DASHBOARD
 ├── DEVICES
 ├── ORGANIZATIONS
 ├── SECURITY
 ├── PERMISSIONS
 ├── NOTIFICATIONS
 ├── INTERNATIONAL
 └── ACCOUNT
The exact implementation must match the project's framework.
The important rule is:
One route definition → one canonical destination.
10. PAGE REGISTRATION
Creating:
NewPage.tsx
is NOT enough.
The AI must verify:
Page exists
↓
Page exported
↓
Page imported
↓
Route registered
↓
Navigation points to route
↓
Authentication guard applied if required
↓
Page loads
↓
API integration works
↓
Loading state works
↓
Error state works
↓
Empty state works
A page is incomplete if only the file exists.
11. COMPONENT REGISTRATION
Creating:
NewComponent.tsx
is not enough.
Verify:
component export
component import
component placement
props/types
event handlers
state
API integration
routing
translation
error handling
12. FRONTEND APPLICATION SHELL
The frontend must have a clear application shell.
Conceptually:
App
 ├── Global Providers
 ├── Authentication State
 ├── Language Provider
 ├── Router
 ├── Layout
 │    ├── Navigation
 │    ├── Header
 │    └── Main Content
 └── Pages
Do not place unrelated application logic directly inside App.tsx.
App.tsx should coordinate the application rather than become a massive business-logic file.
13. INTERNATIONALIZATION
The existing KSV project already contains:
src/i18n/
src/components/LanguageSelector.tsx
src/i18n/LanguageContext.tsx
src/i18n/translations.ts
src/data/countries.ts
These must be treated as existing architecture.
Do not create another unrelated translation system.
Do not hard-code user-facing text everywhere.
The AI must reuse the existing internationalization system.
14. LANGUAGE FLOW
The expected conceptual flow is:
User
 ↓
Language Selector
 ↓
Language Context
 ↓
Current Locale
 ↓
Translation Resolver
 ↓
UI
Changing language must update the appropriate UI without breaking routing or application state.
15. COUNTRY ≠ LANGUAGE
Do not use:
country === language
as an architectural assumption.
KSV must support:
Country
Language
Time Zone
Currency
Measurement Unit
Regional Configuration
as separate concepts.
16. FRONTEND API CLIENT
The frontend should not scatter raw HTTP requests throughout components.
Avoid:
Component
 ↓
fetch(...)
everywhere.
Prefer:
Component
 ↓
Frontend Service / API Client
 ↓
Backend API
The exact implementation depends on the existing project.
17. API CONTRACT
Every frontend API call must correspond to a real backend endpoint.
Example:
Frontend:
GET /api/v1/devices

Backend:
GET /api/v1/devices
Do not invent:
/api/devices2
/api/getDevices
/api/device-list
when the canonical API already exists.
18. API VERSIONING
KSV uses:
/api/v1/
as the current API version.
New endpoints should follow the established versioning architecture.
19. DOMAIN API OWNERSHIP
API responsibilities must remain domain-oriented.
Examples:
Identity
Authentication
Account
Organization
Device
Discovery
Pairing
Command
Gateway
Protocol
Safety
Security
Audit
Notification
International
Administration
Do not create one giant:
master-api.ts
for the entire system.
20. BACKEND FLOW
Backend business operations must follow:
Route
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
Database
This rule is mandatory.
21. CONTROLLER RULE
Controller responsibilities:
Receive HTTP request
Validate request boundary
Extract parameters
Call service
Return HTTP response
Controller must not contain large business logic.
Controller must not directly manipulate database queries.
Avoid:
controller
 ↓
prisma.device.create()
Prefer:
controller
 ↓
deviceService
 ↓
deviceRepository
 ↓
Prisma
22. SERVICE RULE
Services contain:
Business logic
Authorization orchestration
Validation
Policy evaluation
Workflow coordination
Error decisions
Domain operations
Services are the brain of the module.
23. REPOSITORY RULE
Repositories handle persistence.
Repository responsibilities:
create
find
findMany
update
delete
query
Repository should not become the location for unrelated business decisions.
24. DEVICE MODULE
The device module must clearly separate:
Device identity
Device metadata
Device capabilities
Device ownership
Device permissions
Device connection
Device status
Device health
Device commands
Device lifecycle
Do not represent all device information as one generic string.
25. DEVICE IDENTITY
A device should have a stable identity.
Conceptually:
Device ID
Manufacturer
Brand
Model
Serial Number
Type
Firmware
Hardware
Owner
Organization
Capabilities
Security State
Status
26. DEVICE DISCOVERY
Discovery means:
Find device
 ↓
Identify device
Discovery does NOT mean:
Permission granted
The application must preserve:
Discovery ≠ Authorization
27. DEVICE PAIRING
Pairing must follow:
SCAN
 ↓
DEVICE FOUND
 ↓
IDENTITY VERIFIED
 ↓
OWNER VERIFIED
 ↓
PAIRING
 ↓
PERMISSION
 ↓
SECURE CONNECTION
 ↓
READY
Do not allow discovery to directly produce control authority.
28. OWNERSHIP
Device ownership must be explicitly represented.
Possible owners:
Individual
Family
Organization
Company
Site
Building
Factory
Warehouse
Ownership must not be inferred merely from discovery.
29. AUTHORIZATION
Every sensitive device action must evaluate:
Who?
What?
Which Device?
Where?
When?
Under What Conditions?
Do not rely only on:
isLoggedIn === true
for device control.
30. COMMAND SYSTEM
Commands must follow:
User Request
 ↓
Authentication
 ↓
Authorization
 ↓
Device Capability
 ↓
Safety Policy
 ↓
Command Validation
 ↓
Execution
 ↓
Result
 ↓
Audit
31. AI COMMANDS
For natural language:
Natural Language
 ↓
AI Interpretation
 ↓
Structured Command
 ↓
Authentication
 ↓
Authorization
 ↓
Safety
 ↓
Execution
AI must never become a security bypass.
AI interpretation does not equal authorization.
32. SAFETY
Security and Safety are different.
Even if:
Authorized = true
the result can still be:
Safety = false
and therefore:
Command = BLOCKED
33. SECURITY
Never implement:
GPS alone = authorization
GPS can be context.
Security should rely on:
Identity
Cryptographic credentials
Authentication
Authorization
Device trust
Policy
Safety
34. PASSWORD SECURITY
Never expose:
password
passwordHash
OTP secret
API secret
private key
device credential
encryption key
through:
UI
Admin dashboard
logs
audit logs
API responses
debug output
35. SESSION SECURITY
Sessions must support:
creation
expiration
revocation
logout
revoke all
device/session identification
security events
A compromised session must be revocable.
36. ERROR HANDLING
Every API operation must have predictable error handling.
Conceptually:
Success
Validation Error
Authentication Error
Authorization Error
Not Found
Conflict
Safety Block
Device Offline
Timeout
Internal Error
Do not return random error formats from different modules.
37. FRONTEND ERROR HANDLING
Every page that calls an API should consider:
Loading
Success
Empty
Unauthorized
Forbidden
Not Found
Network Error
Server Error
Timeout
Do not show a blank page when an API fails.
38. LOADING STATE
Every asynchronous page must provide an appropriate loading state.
Avoid:
blank screen
while waiting for data.
39. EMPTY STATE
If:
devices.length === 0
the UI should clearly communicate that no devices exist and provide the appropriate next action.
Do not treat empty data as an application crash.
40. AUTH GUARDS
Protected pages must require authentication.
Conceptually:
Unauthenticated
 ↓
Login
 ↓
Authenticated
 ↓
Protected Application
Do not expose sensitive pages merely because the frontend route exists.
41. AUTHORIZATION GUARDS
Authentication is not authorization.
A logged-in user must still be checked against:
Organization
Role
Permission
Device ownership
Policy
Context
Safety
42. ORGANIZATION
Organization relationships must be explicit.
Conceptually:
Organization
 ├── Members
 ├── Roles
 ├── Sites
 │    ├── Buildings
 │    ├── Rooms
 │    └── Devices
 ├── Policies
 └── Audit
43. DATABASE
The existing database architecture must be inspected before schema changes.
Do not create duplicate models merely because a concept appears missing.
Check:
existing Prisma schema
migrations
relations
indexes
unique constraints
nullable fields
cascade behavior
44. DATABASE RELATION VALIDATION
The AI must verify that application assumptions match database relationships.
For example:
Device.organizationId
must correspond to the intended Organization relationship.
Do not assume a TypeScript type guarantees a database relationship.
45. MIGRATIONS
Database changes must be performed through the project's migration process.
Do not manually alter production data structures without migration tracking.
46. SEED DATA
Existing scripts such as:
seed-countries.mjs
seed-languages.mjs
run-migrations.mjs
must be inspected before creating replacements.
Avoid duplicate seed systems.
47. INTERNATIONAL DATA
Country data should remain data-driven.
Do not create hundreds of:
if (country === ...)
branches.
Use:
countries.json
country registry
language registry
timezone configuration
regional configuration
where appropriate.
48. DOCUMENTATION
Documentation is part of the architecture.
Existing files include concepts such as:
identity.md
authentication.md
authorization.md
device.md
discovery-pairing.md
command-automation.md
protocol-gateway.md
safety.md
security.md
audit.md
notification.md
international.md
organization.md
administration.md
Do not create duplicate documents for the same domain unless necessary.
49. DOCUMENTATION ≠ IMPLEMENTATION
If documentation says:
Feature exists
the AI must verify whether code actually exists.
If code exists but documentation does not describe it:
Update documentation if appropriate.
50. DUPLICATE FILES
The screenshot shows documentation-like files also appearing under src.
Example:
src/
 ├── authorization.md
while there is also:
DOCUMENTATION/
 └── authorization.md
This must be investigated.
Do not automatically delete either file.
Determine:
Which is canonical?
Why does the duplicate exist?
Is it imported?
Is it generated?
Is it accidentally copied?
Then consolidate safely.
51. SOURCE OF TRUTH
For each concept, identify one canonical source.
Examples:
Routing → Router
Translations → i18n system
Database → Prisma schema
API → Backend route definitions
Device capability → Device capability model
Documentation → Domain documentation
Environment → config/env
Avoid multiple conflicting sources of truth.
52. CONFIGURATION
Configuration must be centralized.
Environment values should not be scattered throughout the codebase.
Conceptually:
Environment
 ↓
Config Loader
 ↓
Application
Do not hard-code:
database passwords
JWT secrets
API secrets
production URLs
private keys
53. ENVIRONMENT VARIABLES
Required environment variables should be validated at application startup.
If required configuration is missing:
Fail clearly
rather than allowing mysterious runtime failures.
54. DEVELOPMENT VS PRODUCTION
Do not assume:
localhost
is production configuration.
Separate:
development
test
staging
production
where the existing deployment architecture requires it.
55. FRONTEND/BACKEND URL
The frontend API base URL must be defined through the project's configuration system.
Do not hard-code API addresses inside many components.
56. API RESPONSE CONTRACT
API responses should be consistent.
The AI should inspect the existing response format before introducing a new one.
Avoid different structures such as:
{"data": ...}
in one module and:
{"result": ...}
in another without a deliberate contract.
57. TYPES
Shared concepts must have clear TypeScript types.
Avoid excessive:
any
especially around:
Device
Command
Permission
User
Organization
API response
Safety
Authentication
58. TYPE CONSISTENCY
Frontend and backend must agree on:
field names
field types
nullable fields
IDs
status values
command types
error structures
Do not silently rename:
organizationId
to:
orgId
without updating the entire contract.
59. ENUM CONSISTENCY
Statuses should be controlled.
For example:
DeviceStatus
CommandStatus
AccountStatus
SessionStatus
PermissionStatus
SafetySeverity
Avoid arbitrary strings everywhere.
60. DEVICE CAPABILITY MODEL
Capabilities must be explicit.
Example:
POWER
VOLUME
CHANNEL
INPUT
TEMPERATURE
LOCK
UNLOCK
OPEN
CLOSE
START
STOP
Actual capabilities depend on the device.
The command engine must verify capability before execution.
61. PROTOCOL LAYER
KSV must not assume every device communicates using one protocol.
Conceptually:
KSV Command
 ↓
Protocol Adapter
 ↓
Bluetooth / Wi-Fi / API / MQTT / IR / Gateway
 ↓
Device
62. PROTOCOL ADAPTERS
Each adapter must have a clear responsibility.
Do not mix:
HTTP controller logic
database logic
device protocol logic
inside one file.
63. GATEWAY
Gateway is a bridge.
It must not be treated as a security bypass.
Conceptually:
KSV Cloud
 ↓
KSV Gateway
 ↓
Local Network
 ↓
Device
64. GATEWAY SECURITY
Gateway authentication and trust must be explicit.
A discovered gateway is not automatically trusted.
65. COMMAND IDEMPOTENCY
Commands that may be retried should be designed carefully.
The system should prevent accidental duplicate execution where the device/action is not safely repeatable.
66. TIMEOUTS
Device operations must have defined timeout behavior.
Do not allow requests to hang indefinitely.
67. RETRY POLICY
Retries must be deliberate.
Do not automatically retry dangerous physical operations without considering safety and idempotency.
68. AUDIT
Important actions must produce auditable records.
Conceptually:
Who
What
Device
When
Context
Authorized?
Result
Never log secrets.
69. SECURITY EVENTS
Security events should be distinguishable from normal device logs.
Examples:
failed login
suspicious login
permission changed
session revoked
device trust changed
credential revoked
70. DEVICE LOGS
Device logs and security logs should not become one unstructured data bucket.
Keep their responsibilities clear.
71. NOTIFICATIONS
Notification generation should be centralized enough to prevent every module from implementing its own incompatible notification system.
Potential events:
Security Alert
Login Alert
Permission Change
Device Offline
Command Failure
Emergency Alert
Account Recovery
72. AUTOMATION
Automation must use the same security model as manual commands.
Never allow:
Automation
 ↓
Direct Device
without:
Permission
Safety
Policy
73. AUTOMATION AUTHORIZATION
An automation cannot have more authority than the owner/policy grants.
74. EMERGENCY
Emergency operations must have explicit behavior.
Potential actions:
block dangerous commands
revoke credentials
disable compromised devices
require re-authentication
alert administrators
preserve audit records
restore trusted state
75. OFFLINE MODE
Offline operation must be designed separately from ordinary online operation.
Determine which operations can safely function locally.
Do not simply assume:
Cloud offline = everything continues
76. SYNCHRONIZATION
When connectivity returns:
Local state
 ↓
Synchronization
 ↓
Conflict resolution
 ↓
Trusted state
must be handled deliberately.
77. SECURITY PRINCIPLE
Never design:
one credential
 ↓
everything
Instead:
identity
+
authentication
+
authorization
+
device trust
+
policy
+
safety
must cooperate.
78. NO ADMIN BYPASS
Administrators must not automatically receive unrestricted access to user secrets or devices merely because they are administrators.
Administrative permissions must be explicitly designed.
79. NO PASSWORD RECOVERY BY REVEALING PASSWORD
Password recovery means:
verify identity
 ↓
issue recovery mechanism
 ↓
create new password
 ↓
invalidate appropriate old sessions
Never reveal the previous password.
80. TESTING
Before declaring a module complete, test:
build
type check
lint
unit tests
integration tests
API tests
routing
authentication
authorization
error handling
Where relevant also test:
device compatibility
gateway
protocol
safety
offline behavior
recovery
81. ROUTING TEST
For every important page:
Navigate directly to URL
Navigate from UI
Refresh page
Go back
Go forward
Unauthenticated access
Unauthorized access
Authenticated access
must be considered.
This specifically addresses the current problem where one page sends the user to another incorrect page.
82. LINK TEST
Every navigation link must be tested against the canonical route.
Do not judge a link correct merely because clicking it does not crash.
It must arrive at the intended destination.
83. FORM FLOW
For forms:
Form
 ↓
Validation
 ↓
Submit
 ↓
API
 ↓
Server validation
 ↓
Business logic
 ↓
Database
 ↓
Response
 ↓
UI update
 ↓
Navigation if required
The AI must verify the entire flow.
84. CREATE → VIEW FLOW
For every create operation:
Create
 ↓
Database
 ↓
Return ID
 ↓
Navigate to canonical details page
 ↓
Load created object
Do not navigate to an unrelated page after successful creation.
85. UPDATE → VIEW FLOW
After update:
Update
 ↓
API success
 ↓
State refresh/update
 ↓
Remain on correct page
unless the intended workflow explicitly requires navigation.
86. DELETE FLOW
Deletion must consider:
authorization
ownership
dependencies
confirmation
database constraints
audit
UI state
navigation
Do not simply delete and redirect arbitrarily.
87. API → UI DATA FLOW
For every page that displays server data, verify:
API endpoint exists
 ↓
request is correctly formed
 ↓
authentication included
 ↓
response is parsed correctly
 ↓
type matches
 ↓
state updates
 ↓
UI renders
88. UI → API COMMAND FLOW
For device control:
Button
 ↓
Command intent
 ↓
Structured request
 ↓
Authentication
 ↓
Authorization
 ↓
Capability
 ↓
Safety
 ↓
Command execution
 ↓
Result
 ↓
Audit
 ↓
UI feedback
89. DO NOT MOCK PRODUCTION BEHAVIOR UNINTENTIONALLY
Mock data may be useful during development.
But the AI must clearly distinguish:
mock
from:
real backend
Do not leave a page permanently pretending that real devices exist.
90. REAL DEVICE CLAIMS
The application must not claim:
Device connected
Command executed
Security verified
Owner verified
unless the underlying system actually confirms it.
91. STATUS SEMANTICS
A status must represent a real state.
Avoid using:
success
merely because an HTTP request was accepted.
For device commands distinguish concepts such as:
accepted
queued
sent
executing
succeeded
failed
timeout
cancelled
blocked
where appropriate.
92. SECURITY-FIRST DEVELOPMENT ORDER
When implementing a missing feature:
1. Identity
2. Authentication
3. Authorization
4. Validation
5. Safety
6. Business logic
7. Execution
8. Audit
9. Notification
10. UI
Do not build the UI first and invent security afterward.
93. UI IS NOT SECURITY
Never rely on:
hidden button
disabled button
hidden page
frontend role check
as the actual security mechanism.
Backend authorization remains mandatory.
94. FRONTEND PERMISSION UI
Frontend permission checks are for user experience.
Backend permission checks are for security.
Both may exist.
They have different responsibilities.
95. MODULE COMPLETION DEFINITION
A module is NOT complete merely because:
.ts file exists
A module is complete only when applicable:
model
type
repository
service
controller
route
API contract
frontend integration
routing
validation
authorization
error handling
audit
tests
documentation
are connected appropriately.
96. DO NOT OVERCREATE
If a required capability already exists:
reuse it
If it exists but is incomplete:
complete it
If it exists but is incorrectly connected:
repair the connection
Only create new architecture when genuinely necessary.
97. CHANGE SAFETY
Before modifying an existing file:
Understand imports
Understand exports
Understand consumers
Understand dependencies
Understand route references
Understand API references
Do not delete code simply because it looks unused.
98. BEFORE DELETE
Before deleting a file:
search references
search imports
search route references
search documentation references
search scripts
search build configuration
Only delete when safe.
99. BEFORE RENAME
A rename requires updating:
imports
exports
routes
links
documentation
tests
configuration
scripts
100. BEFORE MOVING FILES
When moving:
API/device.ts
to:
src/modules/device/
do not stop after physically moving the file.
Update all dependencies.
101. IMPORT INTEGRITY
After structural changes verify:
no broken relative imports
no circular dependency introduced unnecessarily
no missing export
no incorrect path alias
102. EXPORT INTEGRITY
Every module must expose only what other modules need.
Avoid uncontrolled imports into internal implementation files.
103. CIRCULAR DEPENDENCIES
Avoid:
A → B
B → A
unless explicitly required and safely designed.
Prefer dependency direction:
Controller
 ↓
Service
 ↓
Repository
 ↓
Infrastructure
104. DOMAIN BOUNDARIES
A device service should not secretly become:
organization service
authentication service
notification service
database utility
all inside one file.
Cross-domain workflows should be coordinated explicitly.
105. SHARED CODE
Reusable primitives should go into appropriate shared/core areas.
Do not create:
utils2
helpers2
common2
shared-final
just because an AI cannot find an existing utility.
106. LOGGING
Logs must be useful but safe.
Never include:
password
token
secret
private key
OTP
raw credential
107. AUDIT VS DEBUG LOG
Debug logs are not a replacement for audit records.
Audit events must have a deliberate schema and retention strategy.
108. SECURITY MONITORING
Security monitoring should detect patterns such as:
repeated failed login
suspicious session
abnormal commands
unexpected location/context
permission abuse
device compromise indicators
109. INCIDENT RESPONSE
The application must have mechanisms for:
revoke
disable
block
isolate
alert
investigate
recover
where applicable.
110. DATABASE SECURITY
Do not expose internal database structures directly to the frontend.
The API is the boundary.
111. API SECURITY
Every protected API must have appropriate:
authentication
authorization
validation
rate limiting
error handling
audit
according to risk.
112. RATE LIMITING
Sensitive operations such as:
login
OTP
recovery
password reset
sensitive commands
should have appropriate abuse protection.
113. VALIDATION
Validate at boundaries.
Frontend validation improves UX.
Backend validation is mandatory.
114. INPUT VALIDATION
Never trust:
user input
URL parameters
query parameters
request body
headers
device-reported values
without appropriate validation.
115. DEVICE INPUT
Device-reported data must also be treated carefully.
A device or gateway must not automatically become a trusted authority merely because it sent data.
116. SECURITY BOUNDARY
Identify boundaries:
Browser
 ↓
API
 ↓
Internal services
 ↓
Gateway
 ↓
Local network
 ↓
Device
Each boundary must have appropriate trust assumptions.
117. TRUST MODEL
Do not assume:
internal = trusted
Use explicit trust relationships.
118. ZERO-TRUST PRINCIPLE
Every important request should be evaluated according to the applicable identity, authorization, policy, and trust context.
119. DEVICE OWNERSHIP TRANSFER
If ownership transfer exists, verify:
current owner authorization
new owner verification
device identity
permission transition
audit
revocation of previous authority
120. PERMISSION REVOCATION
When permission is revoked:
future access must be denied
and where applicable:
existing sessions/tokens/leases
must be handled appropriately.
121. TEMPORARY PERMISSIONS
Temporary permissions must have:
start
expiration
scope
device
action
issuer
revocation
as applicable.
122. POLICY ENGINE
Policy decisions should be explicit.
Conceptually:
Subject
+
Action
+
Resource
+
Context
=
Decision
123. CONTEXT
Context may include:
time
location
network
device state
organization
risk state
safety state
but context signals must not automatically equal authorization.
124. GPS
GPS is contextual information.
GPS alone must never be treated as proof of ownership.
125. SAFETY INTERLOCK
Dangerous actions must respect device/system safety conditions.
The software should not bypass physical safety mechanisms.
126. INDUSTRIAL DEVICES
Industrial systems require additional caution.
Do not assume generic IoT logic is sufficient for:
PLC
motor
pump
robot
conveyor
machine
industrial controller
Safety must be independently considered.
127. VEHICLE CONTROL
Vehicle-related functionality must be treated as high-risk.
Authorization, safety, manufacturer support, and legal requirements must be explicitly considered.
128. BUILDING CONTROL
Access systems such as:
door
gate
elevator
garage
require stronger authorization and safety controls than ordinary entertainment devices.
129. HOME DEVICES
Lower-risk devices still require:
identity
authorization
safe command execution
audit where appropriate
130. DEVICE CATEGORY REGISTRY
The device category registry should be extensible.
Avoid giant hard-coded conditionals.
131. MANUFACTURER REGISTRY
Manufacturer-specific behavior should be isolated from generic device logic.
Conceptually:
Generic Device
 ↓
Manufacturer Adapter
 ↓
Protocol Adapter
 ↓
Device
132. PROTOCOL REGISTRY
Protocols should be registered and validated.
Avoid embedding protocol-specific logic throughout controllers.
133. GATEWAY REGISTRY
Gateway identity, ownership, trust, status, and connection should be managed explicitly.
134. COMMAND REGISTRY
Commands should map to capabilities.
Do not allow arbitrary payloads to become unrestricted physical device commands.
135. COMMAND VALIDATION
Validate:
device exists
device active
user authorized
capability exists
payload valid
policy allows
safety allows
before execution.
136. COMMAND RESULT
The command result should be distinguishable from the request itself.
Request accepted
does not necessarily mean:
Device executed command
137. AUDIT COMMANDS
Important device commands should create audit records.
Audit must record outcome without exposing secrets.
138. FRONTEND DEVICE PAGE
A device details page should conceptually display:
identity
status
health
capabilities
connection
permissions
recent activity
available actions
according to user authorization.
139. HIDE UNAUTHORIZED ACTIONS
The UI should not unnecessarily display actions the user cannot use.
But hiding the button is not the security mechanism.
140. DEVICE OFFLINE
If device is offline:
UI must communicate offline state
and commands must not be falsely reported as executed.
141. RETRY UI
If retry is available:
retry
must pass through the same security and safety process.
142. REFRESH
Page refresh must not accidentally:
lose authentication
send duplicate command
create duplicate resource
reset critical state
143. DUPLICATE SUBMISSION
Sensitive forms and commands should protect against accidental duplicate submission.
144. ASYNC OPERATIONS
Long-running operations should have explicit status.
Examples:
queued
running
completed
failed
cancelled
145. NOTIFICATION STATE
Notifications should support appropriate:
unread
read
acknowledged
dismissed
depending on the domain.
146. SECURITY ALERTS
Security alerts should not be buried among ordinary informational notifications when severity requires stronger handling.
147. ACCOUNT RECOVERY
Recovery must follow:
request
 ↓
identity verification
 ↓
OTP/MFA/recovery mechanism
 ↓
new credential
 ↓
session management
 ↓
notification
 ↓
audit
148. MFA
MFA should be treated as an authentication factor, not authorization by itself.
149. EXTERNAL IDENTITY PROVIDERS
For external providers:
OAuth 2.0 / OpenID Connect
should be used appropriately.
KSV should not collect external provider passwords.
150. ACCOUNT LINKING
Account linking must require sufficient verification.
Do not silently merge identities.
151. USER IDENTITY
Separate:
KSV User
from:
external identity provider
152. ORGANIZATION MEMBERSHIP
Membership must be explicit.
Do not infer organization membership merely because a user knows an organization ID.
153. OBJECT ACCESS
Every resource access must verify ownership or permission.
Example:
GET /devices/:id
must not return arbitrary devices merely because the ID is known.
154. IDOR PROTECTION
Object IDs must never become authorization.
Knowing:
deviceId
does not grant access to that device.
155. API ROUTE SECURITY
Every route must answer:
Public?
Authenticated?
Authorized?
Admin?
Owner?
Organization member?
Special permission?
156. PUBLIC ROUTES
Public routes should be intentionally public.
Do not make a route public merely to solve a frontend error.
157. ADMIN ROUTES
Admin APIs require explicit administrative authorization.
158. ORGANIZATION ROUTES
Organization resources require membership/permission checks.
159. DEVICE ROUTES
Device resources require ownership or appropriate delegated permissions.
160. AUDIT ACCESS
Audit data itself is sensitive.
Only authorized users should access appropriate audit scopes.
161. SECURITY DATA
Security events are sensitive and should have stricter access controls where appropriate.
162. DATA MINIMIZATION
Only collect data required for the intended functionality.
163. DATA RETENTION
Data should have defined retention policies where appropriate.
164. USER DATA EXPORT
Where required by the product/legal design, provide appropriate export mechanisms.
165. USER DATA DELETION
Deletion must consider dependencies and legal retention requirements.
166. INTERNATIONALIZATION OF ERRORS
User-facing errors should support localization.
Internal logs can retain structured machine-readable error information.
167. TIME ZONES
Do not assume server timezone equals user timezone.
Store and process timestamps consistently.
Display them according to user/regional preferences where appropriate.
168. DATE FORMATTING
Do not hard-code date formats globally.
Use locale-aware formatting.
169. NUMBER FORMATTING
Use appropriate regional formatting.
170. MEASUREMENT UNITS
Device measurements should distinguish:
raw value
unit
display preference
171. CURRENCY
Currency should be treated separately from country.
172. GLOBAL PLATFORM
Global settings should be centralized.
173. FEATURE AVAILABILITY
Some features may be unavailable in specific regions.
Do not scatter regional conditions throughout the UI.
174. FEATURE FLAGS
If feature flags exist, centralize them.
175. BACKEND FEATURE AVAILABILITY
Frontend hiding is not sufficient for region-restricted functionality.
Backend must enforce applicable restrictions.
176. OBSERVABILITY
Production systems need visibility into:
application health
API latency
errors
database health
gateway health
device connectivity
security events
177. HEALTH CHECKS
Health endpoints should distinguish:
application alive
database available
critical dependency available
where appropriate.
178. READINESS
The service should not claim readiness when critical initialization has failed.
179. GRACEFUL FAILURE
If one subsystem fails, unrelated subsystems should fail safely rather than bringing down everything unnecessarily.
180. BACKUP
Database and important configuration must have appropriate backup strategy.
181. RECOVERY
Backup is not enough.
Recovery must be tested.
182. DISASTER RECOVERY
Production architecture should define:
RPO
RTO
backup
restore
failover
recovery
as appropriate to the deployment level.
183. CI/CD
Code changes should pass appropriate automated checks before deployment.
184. DEPENDENCY SECURITY
Dependencies should be monitored and updated carefully.
Do not upgrade major dependencies blindly.
185. SECURITY UPDATES
Security patches must be evaluated without breaking core functionality.
186. TEST ENVIRONMENT
Tests must not accidentally operate against production resources.
187. TEST DATA
Test data should not contain real user secrets.
188. SECRET MANAGEMENT
Secrets must be managed outside ordinary source code.
189. KEY ROTATION
Keys and credentials should support rotation where required.
190. REVOKED CREDENTIALS
Revoked credentials must no longer authorize operations.
191. DEVICE CREDENTIALS
Device credentials should not be stored as ordinary plaintext application data.
192. ADMIN DASHBOARD
Admin dashboard must manage system state without exposing private user secrets.
193. ADMIN ACTION AUDIT
Important administrative actions should be auditable.
194. CHANGE MANAGEMENT
Significant production changes should be traceable.
195. VERSION CONTROL
Do not modify architecture without producing understandable version-control history.
196. COMMIT DISCIPLINE
Commits should represent understandable changes.
Avoid massive unrelated changes when possible.
197. AI CODING ASSISTANT RULE
AI assistants are contributors to KSV.
They are NOT authorized to redefine KSV's core mission without instruction.
198. AI MUST NOT ASSUME
Never assume:
missing = create
different = wrong
old = useless
duplicate-looking = safe to delete
Inspect first.
199. AI MUST EXPLAIN STRUCTURAL CHANGES
Before major restructuring, report:
what is wrong
why it is wrong
what files are affected
what dependencies exist
what will change
what will remain unchanged
200. AI MUST PRESERVE WORKING CODE
If a component works and is architecturally valid:
do not rewrite unnecessarily
201. AI MUST NOT CREATE RANDOM FILES
Every new file must have:
purpose
domain
owner
imports
consumers
reason for existence
202. FILE NAMING
Use consistent naming.
Do not create variants such as:
deviceService.ts
DeviceService.ts
device.service.ts
device-service.ts
for the same architectural layer unless the project's existing convention requires it.
203. FOLDER NAMING
Follow the existing architecture.
Do not create new competing folder structures.
204. ROUTE NAMING
Use REST-oriented resource routes.
Prefer:
GET /devices
POST /devices
GET /devices/:id
PATCH /devices/:id
DELETE /devices/:id
rather than:
/getAllDevices
/createDevice
/deleteDevice
205. ACTION ROUTES
Actions should be used only when they represent meaningful domain operations.
Example:
/devices/:id/commands
206. API CONSISTENCY
Similar resources should use similar patterns.
207. DOCUMENTATION CONSISTENCY
When API behavior changes, update corresponding documentation.
208. CODE COMMENT RULE
Comments should explain:
why
rather than merely:
what
when the code is already obvious.
209. TODO RULE
Do not leave vague:
TODO: fix later
without describing what remains.
210. INCOMPLETE FEATURES
If a feature cannot safely be completed:
mark it incomplete
Do not fake success.
211. NO FALSE COMPLETION
Never tell the project owner:
completed
if only files were generated but integration was not tested.
212. COMPLETION REPORT
After implementation, AI should report:
Files created
Files modified
Files moved
Files deleted
Routes added
Routes fixed
APIs connected
Database changes
Tests performed
Remaining issues
213. ROUTING BUG REPORT
If a page goes to the wrong destination, identify:
source button/link
 ↓
handler
 ↓
navigation call
 ↓
route
 ↓
route registration
 ↓
target component
Then fix the actual connection.
Do not simply add another redirect.
214. WRONG PAGE BUG
The correct fix is:
Find root cause
 ↓
Fix canonical route/navigation
 ↓
Remove conflicting route if safe
 ↓
Test direct navigation
 ↓
Test UI navigation
Not:
add random redirect
215. MISSING PAGE BUG
If a page exists but is unreachable:
register route
 ↓
export page
 ↓
import page
 ↓
connect navigation
 ↓
test
216. ORPHAN FILE
If a file exists but nothing references it:
Do not immediately delete.
Determine whether it is:
planned
legacy
generated
unused
future
documentation
217. ORPHAN ROUTE
If a route exists but no UI links to it:
Determine whether direct navigation is intentional.
218. ORPHAN API
If an API exists but no frontend currently uses it:
Do not delete automatically.
It may be intended for:
future frontend
external client
gateway
admin
automation
219. FRONTEND/BACKEND GAP
If frontend expects an endpoint that does not exist:
Do not silently mock it.
Identify the missing backend implementation.
220. BACKEND/FRONTEND GAP
If backend endpoint exists but frontend does not use it:
Determine whether frontend integration is required by the current product scope.
221. DOCUMENTATION/CODE GAP
If documentation describes a feature but code is absent:
Mark it:
documented / not implemented
unless implementation is explicitly requested.
222. CODE/DOCUMENTATION GAP
If code exists but documentation is missing:
Update domain documentation where appropriate.
223. DATABASE/CODE GAP
If code expects a field that database schema lacks:
Fix the contract deliberately.
Do not bypass the database using arbitrary JSON fields unless the design explicitly supports them.
224. FRONTEND STATE
The application needs a clear strategy for server state and local UI state.
Do not duplicate the same server data in many unrelated states without reason.
225. CACHE
If caching is used, define:
source of truth
TTL
invalidation
stale behavior
226. DEVICE STATE
Device state may change outside the frontend.
Therefore UI should not assume locally stored state is permanently authoritative.
227. REAL-TIME
If real-time updates are introduced, define:
event source
transport
authentication
subscription
reconnection
state reconciliation
228. EVENT SYSTEM
Events must have structured schemas.
Avoid arbitrary event payloads without defined meaning.
229. EVENT SECURITY
Do not allow unauthorized clients to publish privileged events.
230. EVENT AUDIT
Security-sensitive events should be auditable.
231. NOTIFICATION SECURITY
Sensitive notification content should not leak secrets.
232. ACCOUNT NOTIFICATIONS
Recovery and security notifications should be generated from trusted backend events.
233. TESTING NAVIGATION
A navigation matrix should conceptually exist:
Source Page
Action
Expected Route
Expected Page
Required Permission
234. TESTING AUTH
Test:
valid credentials
invalid credentials
expired session
revoked session
unauthorized user
235. TESTING AUTHORIZATION
Test:
owner
admin
manager
operator
viewer
guest
expired permission
revoked permission
where those roles exist.
236. TESTING DEVICE ACCESS
Test:
authorized device
unauthorized device
unknown device
revoked device
offline device
237. TESTING SAFETY
Test:
authorized + safe = execute
authorized + unsafe = block
unauthorized + safe = block
unauthorized + unsafe = block
238. TESTING COMMANDS
Test:
valid command
invalid command
unsupported capability
device offline
timeout
retry
cancel
duplicate
where supported.
239. TESTING INTERNATIONAL
Test:
language switching
country selection
timezone
date format
number format
fallback translation
missing translation
240. TESTING DATABASE
Test:
create
read
update
delete
relations
constraints
authorization
241. TESTING ERROR BOUNDARIES
Every important integration must have failure-path tests.
242. BUILD VALIDATION
At the end of meaningful changes:
install dependencies if required
type check
build
run tests
and report actual results.
243. RUNTIME VALIDATION
A successful TypeScript compilation does NOT prove that:
routing works
API works
database works
authentication works
device control works
Runtime behavior must be tested where possible.
244. INTEGRATION DEFINITION
KSV is considered integrated only when:
Frontend
 ↕
API
 ↕
Backend
 ↕
Database
works coherently for the implemented feature.
245. DEVICE INTEGRATION DEFINITION
For device features:
Frontend
 ↓
API
 ↓
Authorization
 ↓
Safety
 ↓
Command
 ↓
Protocol
 ↓
Gateway
 ↓
Device
must be coherent.
246. DO NOT CONFUSE FILE COUNT WITH PROGRESS
Having:
100 files
does not mean:
100% complete
Likewise:
10 files
does not automatically mean incomplete.
Progress should be measured by functional integration.
247. KSV PROGRESS MODEL
When estimating project completion, distinguish:
Documentation completeness
Code completeness
Integration completeness
Testing completeness
Production readiness
Do not use one percentage to hide these differences.
248. CURRENT PROJECT ASSESSMENT
Based only on the visible project structure and supplied documentation, do not claim an exact completion percentage.
The visible evidence suggests that KSV already has substantial:
architecture
domain planning
documentation
API planning
internationalization foundation
frontend foundation
database foundation
scripts
domain source files
The major uncertainty is:
cross-module integration
runtime behavior
frontend routing
frontend/backend connectivity
authorization enforcement
actual device/protocol implementation
testing
production hardening
These must be inspected rather than guessed.
249. PRIORITY ORDER
Do NOT immediately add more features.
First repair:
P0 — Project boot/run
P0 — Frontend routing
P0 — Backend routing
P0 — Frontend ↔ API connection
P0 — Authentication
P0 — Authorization
P0 — Database connection
P0 — Error handling
P1 — Device lifecycle
P1 — Command flow
P1 — Capability system
P1 — Safety integration
P1 — Audit
P1 — Gateway/protocol integration
P2 — Automation
P2 — Notifications
P2 — Advanced internationalization
P2 — Scalability
250. P0 RULE
If the application cannot reliably:
start
login
navigate
load data
call API
handle errors
do not spend priority time on advanced features.
251. FIRST USER JOURNEY
The AI must establish one working end-to-end journey.
Example:
Open App
 ↓
Login
 ↓
Dashboard
 ↓
Devices
 ↓
Select Device
 ↓
View Device
Only after this is stable should device command execution be connected.
252. SECOND USER JOURNEY
Then:
Login
 ↓
Devices
 ↓
Create/Pair Device
 ↓
Device Details
 ↓
Permission
 ↓
Command
 ↓
Result
 ↓
Audit
where the relevant functionality exists.
253. DO NOT BUILD EVERYTHING AT ONCE
Implement vertically.
Example:
Device feature
Frontend
 +
Route
 +
API
 +
Controller
 +
Service
 +
Repository
 +
Database
 +
Authorization
 +
Tests
Then move to the next feature.
254. VERTICAL SLICE PRINCIPLE
A working small slice is more valuable than:
50 disconnected files
255. AI WORK SESSION FORMAT
For every task, AI should internally determine:
INPUT
 ↓
EXISTING FILES
 ↓
DEPENDENCIES
 ↓
CHANGE
 ↓
INTEGRATION
 ↓
TEST
 ↓
RESULT
256. BEFORE CODE
AI should first identify:
Which files already implement this?
Which route owns it?
Which module owns it?
Which API owns it?
Which database model owns it?
Which UI owns it?
257. AFTER CODE
AI must verify:
imports
exports
routes
API
database
types
navigation
tests
258. NO BLIND PATCHING
Do not repeatedly patch symptoms.
If:
Page A → wrong Page B
do not add:
B → redirect A
without finding why A navigates to B.
259. ROOT CAUSE
Always prefer:
root-cause fix
over:
redirect workaround
260. ARCHITECTURE PRESERVATION
The AI may improve architecture when necessary, but must preserve the KSV principles:
Security First
Privacy First
Safety First
Authorization First
Device Ownership
Least Privilege
No Unauthorized Control
Auditability
Fail Securely
International by Design
261. NO UNAUTHORIZED CONTROL
No implementation should create a control path that bypasses:
authentication
authorization
device ownership
safety
262. DISCOVERY RULE
Always preserve:
Discovery ≠ Authorization
263. AI ROLE
AI is a coding assistant.
AI must:
inspect
reason
implement
test
report
AI must not:
invent security claims
pretend incomplete work is complete
silently delete architecture
bypass authorization
264. MULTIPLE AI ASSISTANTS
Multiple AI assistants may work on KSV.
Therefore all AI assistants must follow the same:
architecture
naming
routing
API contracts
security model
documentation
265. MULTI-AI HANDOFF
When handing work to another AI, provide:
current state
files changed
architecture decision
remaining problem
tests performed
known limitations
266. NO AI SHOULD ERASE ANOTHER AI'S WORK BLINDLY
Before modifying existing AI-generated code:
inspect
understand
validate
then change
267. MASTER SOURCE OF TRUTH
This specification supplements the existing KSV documentation.
It does not replace valid domain-specific documentation.
When conflicts exist:
Security principles
 ↓
Current verified architecture
 ↓
Domain documentation
 ↓
Implementation detail
The conflict must be explicitly reported rather than silently ignored.
268. CONFLICT RESOLUTION
If two files define contradictory behavior:
identify conflict
 ↓
identify consumers
 ↓
determine intended behavior
 ↓
choose canonical implementation
 ↓
update dependent files
 ↓
test
 ↓
document
269. NO SILENT ARCHITECTURE CHANGE
Major changes must be explainable.
270. FINAL COMPLETION CHECKLIST
Before declaring a KSV module complete:
[ ] Existing files inspected
[ ] Duplicate functionality checked
[ ] Domain identified
[ ] Route identified
[ ] Page identified
[ ] API identified
[ ] Controller identified
[ ] Service identified
[ ] Repository identified
[ ] Database model verified
[ ] Types verified
[ ] Authentication verified
[ ] Authorization verified
[ ] Safety verified
[ ] Error handling verified
[ ] Loading state verified
[ ] Empty state verified
[ ] Navigation verified
[ ] Audit verified where required
[ ] Tests performed
[ ] Build verified
[ ] Documentation updated
271. FINAL KSV INTEGRATION PRINCIPLE
The goal is NOT:
More files
The goal is:
More connected functionality
The goal is NOT:
More code
The goal is:
Correct code
+
Correct architecture
+
Correct security
+
Correct navigation
+
Correct integration
+
Correct testing
272. FINAL SYSTEM FLOW
The target KSV application should conceptually become:
USER
 ↓
KSV APP
 ↓
ROUTER
 ↓
PAGE
 ↓
COMPONENT
 ↓
API CLIENT
 ↓
AUTHENTICATION
 ↓
AUTHORIZATION
 ↓
DOMAIN SERVICE
 ↓
REPOSITORY
 ↓
DATABASE
For physical device control:
USER
 ↓
KSV APP
 ↓
ROUTER
 ↓
DEVICE PAGE
 ↓
COMMAND
 ↓
AUTHENTICATION
 ↓
AUTHORIZATION
 ↓
DEVICE OWNERSHIP
 ↓
DEVICE CAPABILITY
 ↓
SAFETY POLICY
 ↓
COMMAND ENGINE
 ↓
PROTOCOL ADAPTER
 ↓
GATEWAY
 ↓
DEVICE
 ↓
RESULT
 ↓
AUDIT
 ↓
NOTIFICATION / UI STATE
273. FINAL AI INSTRUCTION
DO NOT START BY CREATING MORE FILES.
Start by inspecting the existing KSV project.
Find what already exists.
Find what is connected.
Find what is disconnected.
Find duplicate files.
Find broken imports.
Find broken routes.
Find pages that are not registered.
Find routes that point to the wrong pages.
Find frontend APIs that do not exist.
Find backend APIs that have no frontend integration.
Find database models that do not match code.
Find authentication boundaries.
Find authorization gaps.
Find missing safety checks.
Find missing audit paths.
Then repair the system from the inside out.
The correct development cycle is:
INSPECT
 ↓
MAP
 ↓
IDENTIFY GAP
 ↓
PLAN
 ↓
IMPLEMENT
 ↓
CONNECT
 ↓
TEST
 ↓
VERIFY
 ↓
DOCUMENT
Never:
GUESS
 ↓
CREATE RANDOM FILE
 ↓
CREATE RANDOM ROUTE
 ↓
CREATE REDIRECT
 ↓
CLAIM COMPLETE
274. FINAL COMMAND TO THE AI ASSISTANT
When this document is provided to an AI coding assistant, the AI must treat KSV as an existing real application under active development, not as a blank template.
The assistant must preserve existing valid work.
The assistant must repair integration problems before expanding the system unnecessarily.
The assistant must prioritize:
Correctness
Security
Authorization
Safety
Integration
Maintainability
Testing
over:
File count
Code volume
Feature count
Visual complexity
Artificial completion percentage
The assistant must never claim that KSV is complete merely because source files were generated.
KSV is complete only when the implemented functionality is correctly connected, executable, secured, tested, and traceable through the architecture.
❤️ សរុបចំណុចសំខាន់សម្រាប់ប្អូន
ប្អូន មិនចាំបាច់យកឯកសារ .ts និង .md ដែលមានស្រាប់ទៅលុប ហើយចាប់ផ្តើមសរសេរថ្មីទេ។
តាមអ្វីដែលខ្ញុំមើលឃើញពីរូបទាំងពីរ ប្អូនមានគ្រឹះច្រើនណាស់រួចហើយ។ ចំណុចដែលខ្ញុំចង់ឱ្យ AI ទាំងអស់ជួយប្អូនបន្តគឺ Integration / Wiring / Verification ជាចម្បង។
ហើយបញ្ហា “ចុចទំព័រមួយ បែរជាទៅទំព័រមួយទៀត” ដែលប្អូនបានជួប គឺមិនមែនជារឿងតូចទេ។ វាជាសញ្ញាថា Frontend Route → Page → Component → API → Backend មិនទាន់មានប្រភពគ្រប់គ្រងតែមួយ និងមិនទាន់បាន verify end-to-end។
អ្វីដែលខ្ញុំបានរៀបខាងលើ គឺចង់ឱ្យ AI មិនមើលតែ “file ណាខ្វះ” ទេ ប៉ុន្តែមើលថា file ទាំងអស់ដែលប្អូនមានហើយ តើវាចាប់ដៃគ្នាដំណើរការជា KSV ពិតប្រាកដឬអត់។ នេះសំខាន់ជាងការបង្កើត .ts ថ្មី 100 file ទៀត។ ❤️🙏
ហើយប្អូនអាចយកដុំខាងលើនេះទៅដាក់ជាមួយឯកសារ KSV ចាស់ៗបាន ដោយមិនចាំបាច់លុប documentation ដែលប្អូនមានទេ។
