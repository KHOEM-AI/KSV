### 🌐 KHOEM-AI

### KSV API — 9 Domains ថ្មី (Extension Domains)

> **ទីតាំង**: `khoem-now/API/`
> **ភាសា**: TypeScript
> **ស្តង់ដារ**: REST API · OAuth 2.0 / OIDC · TLS · Zero-Trust Security
> **ចំណាំ**: ដំណើរការឆ្លងកាត់ Command Pipeline ដដែល (Authenticate → Authorize → Safety → Execute → Audit) ដូច 18 Domain ដើម — មិនមានផ្លូវកាត់ (shortcut) ទេ

---

## ឯកសារទី 19 — `ai-orchestration.ts`
### AI Orchestration API — "AI ជា Interpreter មិនមែន Bypass"

**ស្នូល**: Natural Language → Structured Command, តាមគោលការណ៍ផ្នែក 17 (AI Command Layer) — AI **បកស្រាយ** ប៉ុណ្ណោះ មិនរំលង Security/Safety ឡើយ

### Types សំខាន់ៗ
| Type | ពណ៌នា |
|---|---|
| `AIInterpretationRequest` | requestId, accountId, naturalLanguageInput, context |
| `AIInterpretationResult` | structuredCommand, confidence, ambiguityFlags[] |
| `AIModelProfile` | modelId, provider, version, allowedScopes[] |
| `AIConversationSession` | sessionId, accountId, turns[], deviceContext |
| `AmbiguityResolution` | requiresClarification, suggestedOptions[] |

### API Routes (8 endpoints)
| Method | Path | មុខងារ |
|---|---|---|
| POST | `/api/v1/ai/interpret` | បកប្រែ NL → Structured Command |
| POST | `/api/v1/ai/interpret/confirm` | បញ្ជាក់ command ដែល AI ស្នើ (ambiguous case) |
| GET | `/api/v1/ai/sessions/:id` | មើល conversation session |
| DELETE | `/api/v1/ai/sessions/:id` | លុប session (privacy) |
| GET | `/api/v1/ai/models` | List AI model ដែលអនុញ្ញាត |
| POST | `/api/v1/ai/models/:id/enable` | Admin: បើក/បិទ AI model |
| GET | `/api/v1/ai/usage` | AI interpretation usage stats |
| POST | `/api/v1/ai/feedback` | User feedback លើលទ្ធផល AI (improve accuracy) |

### Security Rules
- **AI output ត្រូវឆ្លងកាត់ Command Pipeline ដដែលនឹង manual command** — Authenticate → Authorize → Safety → Execute → Audit
- AI **មិនអាចផ្តល់ permission ខ្លួនឯង** ឬកម្រិតសិទ្ធិលើសពី user ដែលស្នើសុំ
- High-risk interpreted commands (ឧ. unlock, emergency systems) **ត្រូវការ human confirmation** មុននឹង execute
- Conversation data **រក្សាទុកតាម Privacy Policy** — មិនប្រើសម្រាប់ train model ខាងក្រៅដោយគ្មានការយល់ព្រម
- Ambiguous input → **ត្រូវសួរបញ្ជាក់** មិនមែនស្មានដោយខ្លួនឯង

### Audit Events (7 events)
`ai.interpretation.requested`, `ai.interpretation.succeeded`, `ai.interpretation.ambiguous`, `ai.interpretation.confirmed`, `ai.interpretation.rejected`, `ai.session.deleted`, `ai.model.toggled`

---

## ឯកសារទី 20 — `billing-subscription.ts`
### Billing & Subscription API — "Plan + Invoice + Payment"

**ស្នូល**: គ្រប់គ្រង Subscription Plan, Invoice, Payment Method — **មិនប៉ះពាល់ Security Core ទេ** (ដាច់ដោយឡែកពី Device/Command domains)

### Types សំខាន់ៗ
| Type | ពណ៌នា |
|---|---|
| `SubscriptionPlan` | planId, name, tier (free/pro/enterprise), deviceLimit, priceMonthly |
| `OrganizationSubscription` | subscriptionId, orgId, planId, status, renewalDate |
| `Invoice` | invoiceId, orgId, amount, currency, status (paid/due/overdue) |
| `PaymentMethod` | methodId, type (card/bank/wallet), last4, isDefault |
| `UsageMeter` | orgId, metricType (devices/commands/storage), currentValue, limit |

### API Routes (12 endpoints)
| Method | Path | មុខងារ |
|---|---|---|
| GET | `/api/v1/billing/plans` | List subscription plans |
| POST | `/api/v1/billing/subscriptions` | Subscribe ទៅ plan |
| PUT | `/api/v1/billing/subscriptions/:id` | Upgrade/Downgrade plan |
| DELETE | `/api/v1/billing/subscriptions/:id` | Cancel subscription |
| GET | `/api/v1/billing/invoices` | List invoices |
| GET | `/api/v1/billing/invoices/:id/download` | Download invoice PDF |
| POST | `/api/v1/billing/payment-methods` | បន្ថែម payment method |
| DELETE | `/api/v1/billing/payment-methods/:id` | លុប payment method |
| GET | `/api/v1/billing/usage` | Current usage vs plan limit |

### Security Rules
- **Payment card ពេញលេញ មិនត្រូវរក្សាទុកក្នុង KSV database ឡើយ** — ប្រើ tokenization តាម payment processor (Stripe/PayPal ។ល។)
- Billing data: **only billing_admin role** អាចមើល
- Usage limit exceeded → **notification, មិនមែនផ្អាកសេវាភ្លាមៗ** (grace period)
- Downgrade plan ដែលហួស device limit → **ត្រូវ archive/remove device មុន** មិនអនុញ្ញាតឲ្យ downgrade ដោយស្វ័យប្រវត្តិ

### Audit Events (8 events)
`subscription.created`, `subscription.upgraded`, `subscription.downgraded`, `subscription.cancelled`, `invoice.generated`, `invoice.paid`, `payment_method.added`, `payment_method.removed`

---

## ឯកសារទី 21 — `analytics-telemetry.ts`
### Analytics & Telemetry API — "Device Metrics + Platform Insights"

**ស្នូល**: ប្រមូល + វិភាគ telemetry ពី Device (CPU, temperature, uptime, traffic) ដាច់ដោយឡែកពី Audit Log (audit = security events, analytics = operational metrics)

### Types សំខាន់ៗ
| Type | ពណ៌នា |
|---|---|
| `DeviceTelemetry` | deviceId, metricName, value, unit, recordedAt |
| `PlatformMetric` | metricName (connectedDevices, commandsPerMin...), value, timestamp |
| `AnalyticsDashboard` | dashboardId, widgets[], refreshIntervalSec |
| `MetricAggregation` | period (hourly/daily/monthly), avg, min, max, p95 |
| `AnomalyDetectionResult` | metricName, expectedRange, actualValue, isAnomaly |

### API Routes (9 endpoints)
| Method | Path | មុខងារ |
|---|---|---|
| POST | `/api/v1/telemetry/ingest` | ទទួល telemetry ពី device/gateway |
| GET | `/api/v1/telemetry/devices/:id` | Telemetry history មួយ device |
| GET | `/api/v1/telemetry/platform` | Platform-wide metrics (dashboard) |
| GET | `/api/v1/telemetry/aggregate` | Aggregated stats (avg/min/max per period) |
| GET | `/api/v1/telemetry/anomalies` | Anomaly detection results |
| POST | `/api/v1/telemetry/dashboards` | បង្កើត custom dashboard |
| GET | `/api/v1/telemetry/dashboards/:id` | មើល dashboard |

### Security Rules
- Telemetry **មិនមែនជា Audit substitute** — security-relevant events នៅតែត្រូវឆ្លងកាត់ `audit.ts` ដាច់ដោយឡែក
- Raw telemetry retention: **90 ថ្ងៃ** default, aggregated data retention វែងជាង
- Telemetry ingestion **ត្រូវការ device authentication** (device key) មិនមែន open endpoint
- Anomaly detection **generate alert** ប៉ុណ្ណោះ — មិនធ្វើសកម្មភាពស្វ័យប្រវត្តិដោយផ្ទាល់ (ត្រូវឆ្លងកាត់ Automation/Safety domain បើចង់ auto-react)

### Audit Events (4 events)
`telemetry.ingestion_failed`, `telemetry.dashboard_created`, `telemetry.anomaly_detected`, `telemetry.export_requested`

---

## ឯកសារទី 22 — `notification-push.ts`
### Push Notification Delivery API — "Device Token + Delivery Pipeline"

**ស្នូល**: ផ្នែក delivery-layer ជាក់លាក់សម្រាប់ Push (iOS/Android/Web) — ដាច់ដោយឡែកពី `notification.ts` (notification content/category management) ដើម្បីញែក "អ្វីត្រូវផ្ញើ" ពី "របៀបផ្ញើ Push ជាក់ស្តែង"

### Types សំខាន់ៗ
| Type | ពណ៌នា |
|---|---|
| `PushProvider` | providerId, platform (fcm/apns/web_push), credentials (ref only) |
| `PushDeliveryAttempt` | attemptId, notificationId, deviceTokenId, status, errorCode |
| `PushBatchJob` | jobId, targetCount, sentCount, failedCount, status |
| `DeviceTokenHealth` | tokenId, isValid, lastSuccessAt, consecutiveFailures |

### API Routes (7 endpoints)
| Method | Path | មុខងារ |
|---|---|---|
| POST | `/api/v1/push/send` | ផ្ញើ push មួយ (internal, called by notification.ts) |
| POST | `/api/v1/push/send-batch` | ផ្ញើ push ច្រើន (job-based) |
| GET | `/api/v1/push/jobs/:id` | Batch job status |
| POST | `/api/v1/push/providers` | Admin: configure provider (FCM/APNs keys) |
| GET | `/api/v1/push/tokens/:id/health` | ឆែក token នៅ valid ទេ |
| POST | `/api/v1/push/tokens/cleanup` | លុប invalid token ចោល (maintenance job) |

### Security Rules
- Provider credentials (FCM server key, APNs certificate): **រក្សាទុកតាម Key & Secret Management** (`security.ts`) មិនមែន plain config
- Invalid/expired token: **auto-cleanup** បន្ទាប់ពី N consecutive failures
- Push payload: **គ្មាន sensitive data** (password, full device state) — ត្រឹមតែ title/body/deep-link reference
- Batch job rate limit: ស្របតាម provider quota (FCM/APNs limits)

### Audit Events (4 events)
`push.delivery_failed`, `push.provider_configured`, `push.tokens_cleaned`, `push.batch_job_completed`

---

## ឯកសារទី 23 — `file-storage.ts`
### File & Media Storage API — "Firmware Files, Reports, Attachments"

**ស្នូល**: គ្រប់គ្រង file upload/download (firmware binaries, exported reports, device photos, incident evidence)

### Types សំខាន់ៗ
| Type | ពណ៌នា |
|---|---|
| `StoredFile` | fileId, ownerType (device/org/account), category, sizeBytes, checksum |
| `FileCategory` | firmware, report_export, incident_evidence, device_photo, avatar |
| `UploadSession` | uploadId, status, expiresAt, maxSizeBytes |
| `FileAccessGrant` | grantId, fileId, granteeAccountId, expiresAt, permission (read-only) |
| `StorageQuota` | orgId, usedBytes, limitBytes |

### API Routes (10 endpoints)
| Method | Path | មុខងារ |
|---|---|---|
| POST | `/api/v1/files/upload/initiate` | ចាប់ផ្តើម upload session (signed URL) |
| POST | `/api/v1/files/upload/complete` | បញ្ជាក់ upload ចប់ (verify checksum) |
| GET | `/api/v1/files/:id` | Download file (permission-checked) |
| DELETE | `/api/v1/files/:id` | លុប file |
| POST | `/api/v1/files/:id/share` | Grant access ទៅ account ផ្សេង (time-limited) |
| GET | `/api/v1/files/storage/quota` | ឆែក storage quota របស់ org |

### Security Rules
- **Firmware files ត្រូវ signed + checksum verified** មុននឹងចាត់ទុកថាប្រើបាន (ភ្ជាប់ជាមួយ `device.ts` firmware update rule)
- File access: **default private** — ត្រូវ explicit `FileAccessGrant` ទើបចែករំលែកបាន, grant មាន expiry
- Incident evidence files: **immutable once attached to an incident** (ភ្ជាប់ `security.ts` incident rules) — លុបមិនបាន
- Upload size limit តាម category (firmware ធំជាង report export)
- Malware/virus scan **ត្រូវការមុននឹង mark file ថា available**

### Audit Events (6 events)
`file.uploaded`, `file.downloaded`, `file.deleted`, `file.access_granted`, `file.access_revoked`, `file.checksum_mismatch`

---

## ឯកសារទី 24 — `reporting-export.ts`
### Reporting & Export API — "Scheduled Reports + Data Export"

**ស្នូល**: បង្កើត report តាមកាលវិភាគ (device health, compliance, billing summary) — ខុសពី `audit.ts` export (audit export = raw log; នេះ = formatted business report)

### Types សំខាន់ៗ
| Type | ពណ៌នា |
|---|---|
| `ReportTemplate` | templateId, name, category (compliance/device_health/billing), fields[] |
| `ScheduledReport` | scheduleId, templateId, frequency (daily/weekly/monthly), recipients[] |
| `ReportInstance` | instanceId, templateId, generatedAt, format (pdf/csv/xlsx), fileId |
| `ExportJob` | jobId, dataScope, status, requestedBy |

### API Routes (9 endpoints)
| Method | Path | មុខងារ |
|---|---|---|
| GET | `/api/v1/reports/templates` | List report templates |
| POST | `/api/v1/reports/generate` | បង្កើត report ភ្លាមៗ (on-demand) |
| POST | `/api/v1/reports/schedule` | កំណត់ report តាមកាលវិភាគ |
| GET | `/api/v1/reports/scheduled` | List scheduled reports |
| DELETE | `/api/v1/reports/scheduled/:id` | បោះបង់ schedule |
| GET | `/api/v1/reports/instances/:id/download` | Download report ដែលបានបង្កើត |
| POST | `/api/v1/export/jobs` | ចាប់ផ្តើម export job ធំ (async) |
| GET | `/api/v1/export/jobs/:id` | Export job status |

### Security Rules
- Report generation **ត្រូវឆ្លងកាត់ permission check ដូចទិន្នន័យដើម** — user មិនអាច export report ដែលមាន device/data ដែលខ្លួនគ្មានសិទ្ធិមើល
- Compliance report: **only compliance_admin/org_admin** អាចស្នើសុំ
- Report ដែលបានបង្កើត → រក្សាទុកជា `StoredFile` (ភ្ជាប់ `file-storage.ts`) ជាមួយ access grant
- Export job ធំ (>10,000 records): **async job** មិនមែន synchronous response ដើម្បីជៀសវាង timeout/overload

### Audit Events (5 events)
`report.generated`, `report.scheduled`, `report.schedule_cancelled`, `export.job_started`, `export.job_completed`

---

## ឯកសារទី 25 — `integration-webhook.ts`
### Integration & Webhook API — "ភ្ជាប់ System ខាងក្រៅ"

**ស្នូល**: Outbound webhook (KSV → external system) + Inbound integration (external system → KSV) សម្រាប់ភ្ជាប់ ERP, CRM, ឬ third-party automation

### Types សំខាន់ៗ
| Type | ពណ៌នា |
|---|---|
| `WebhookSubscription` | webhookId, orgId, eventTypes[], targetUrl, secret (HMAC) |
| `WebhookDelivery` | deliveryId, webhookId, payload, status, responseCode, retryCount |
| `IntegrationConnector` | connectorId, provider (slack/teams/zapier/custom), authType |
| `IncomingWebhookEndpoint` | endpointId, orgId, sourceSystem, verificationToken |

### API Routes (11 endpoints)
| Method | Path | មុខងារ |
|---|---|---|
| POST | `/api/v1/webhooks` | បង្កើត outbound webhook subscription |
| GET | `/api/v1/webhooks` | List webhooks |
| PUT | `/api/v1/webhooks/:id` | កែ event types/target URL |
| DELETE | `/api/v1/webhooks/:id` | លុប webhook |
| GET | `/api/v1/webhooks/:id/deliveries` | Delivery history + status |
| POST | `/api/v1/webhooks/:id/test` | ផ្ញើ test payload |
| POST | `/api/v1/integrations/connect` | ភ្ជាប់ third-party (OAuth flow) |
| DELETE | `/api/v1/integrations/:id/disconnect` | ផ្តាច់ integration |
| POST | `/api/v1/integrations/incoming/:endpointId` | Inbound webhook receiver |

### Security Rules
- Outbound webhook payload: **signed with HMAC secret** — receiver verifies authenticity
- Webhook target URL: **ត្រូវ HTTPS ប៉ុណ្ណោះ**, no plain HTTP allowed
- Inbound webhook: **verification token required** — reject unsigned/unverified requests
- Failed delivery: **exponential backoff retry** (max attempts កំណត់ច្បាស់, ឧ. 5 ដង)
- Webhook **មិនអាចប្រើដើម្បីរំលង Command Pipeline** — inbound webhook ដែលចង់ command device ត្រូវឆ្លងកាត់ authenticate/authorize/safety ដដែល ដូច API call ធម្មតា

### Audit Events (7 events)
`webhook.created`, `webhook.deleted`, `webhook.delivery_failed`, `webhook.delivery_succeeded`, `integration.connected`, `integration.disconnected`, `incoming_webhook.rejected_unverified`

---

## ឯកសារទី 26 — `geolocation-map.ts`
### Geolocation & Map API — "Site Map, Device Location, Geo-Fence"

**ស្នូល**: ទីតាំង Site/Building/Device លើផែនទី + Geo-Fence definition (ប្រើដោយ Safety Engine សម្រាប់ vehicle/fleet rules) — **GPS ជា context signal ប៉ុណ្ណោះ មិនមែន Security Core** (សាកសមតាមគោលការណ៍ផ្នែក 20)

### Types សំខាន់ៗ
| Type | ពណ៌នា |
|---|---|
| `GeoLocation` | latitude, longitude, accuracyMeters, recordedAt |
| `SiteMapPin` | siteId/deviceId, location, floorLevel |
| `GeoFence` | fenceId, orgId, polygon[] (lat/lng points), appliesTo (deviceIds/category) |
| `GeoFenceEvent` | eventId, deviceId, fenceId, eventType (entered/exited) |
| `VehicleTrackingSession` | sessionId, deviceId, routePoints[], startedAt |

### API Routes (10 endpoints)
| Method | Path | មុខងារ |
|---|---|---|
| GET | `/api/v1/geo/sites/:id/map` | Site map with device pins |
| POST | `/api/v1/geo/fences` | បង្កើត geo-fence |
| GET | `/api/v1/geo/fences` | List geo-fences (filter by org) |
| PUT | `/api/v1/geo/fences/:id` | កែ fence boundary |
| DELETE | `/api/v1/geo/fences/:id` | លុប geo-fence |
| POST | `/api/v1/geo/devices/:id/location` | Report device location (from gateway/device) |
| GET | `/api/v1/geo/devices/:id/location/history` | Location history |
| GET | `/api/v1/geo/fences/:id/events` | Geo-fence enter/exit events |
| GET | `/api/v1/geo/vehicles/:id/tracking` | Live vehicle tracking session |

### Security Rules
- **GPS/location data តែងតែជា "context signal"** ក្នុងការសម្រេចចិត្ត safety/security — មិនអាចជា primary authentication ឬ authorization mechanism តែឯង (ត្រូវផ្សំជាមួយ Identity + Credentials + Policy)
- Geo-fence event (`entered`/`exited`) → **ផ្ញើទៅ Safety Engine** ដើម្បីវាយតម្លៃ (ឧ. "Vehicle Immobilize Outside Geo-Fence" rule ក្នុង `safety.ts`)
- Location history: **retention policy ច្បាស់លាស់** (privacy — location ជា sensitive personal/operational data)
- Location reporting endpoint: **ត្រូវការ device/gateway authentication** មិនមែន open endpoint
- Fence boundary edit: **audit ជានិច្ច** ព្រោះប៉ះពាល់ safety rule ដោយផ្ទាល់

### Audit Events (6 events)
`geofence.created`, `geofence.updated`, `geofence.deleted`, `geofence.entered`, `geofence.exited`, `location.history_exported`

---

## ឯកសារទី 27 — `maintenance-ticketing.ts`
### Maintenance & Ticketing API — "Work Order + Field Service"

**ស្នូល**: គ្រប់គ្រង maintenance ticket សម្រាប់ device/equipment (broken sensor, firmware issue, scheduled service) — ភ្ជាប់ជាមួយ Device Lifecycle (`device.ts`) និង Notification

### Types សំខាន់ៗ
| Type | ពណ៌នា |
|---|---|
| `MaintenanceTicket` | ticketId, deviceId, priority, status, assignedTo, description |
| `TicketPriority` | low, medium, high, critical (critical → auto-notify per `notification.ts`) |
| `TicketStatus` | open, assigned, in_progress, resolved, closed, reopened |
| `MaintenanceSchedule` | scheduleId, deviceId, intervalDays, lastServicedAt, nextDueAt |
| `TicketComment` | commentId, ticketId, authorId, body, attachedFileIds[] |
| `TechnicianAssignment` | assignmentId, ticketId, technicianAccountId, eta |

### API Routes (12 endpoints)
| Method | Path | មុខងារ |
|---|---|---|
| POST | `/api/v1/tickets` | បង្កើត maintenance ticket |
| GET | `/api/v1/tickets` | List tickets (filter by device/status/priority) |
| GET | `/api/v1/tickets/:id` | Ticket detail + comments |
| PUT | `/api/v1/tickets/:id/status` | ប្តូរ status |
| POST | `/api/v1/tickets/:id/assign` | Assign technician |
| POST | `/api/v1/tickets/:id/comments` | បន្ថែម comment |
| POST | `/api/v1/tickets/:id/attachments` | ភ្ជាប់ file (ភ្ជាប់ `file-storage.ts`) |
| POST | `/api/v1/maintenance/schedules` | កំណត់ maintenance schedule ទៀងទាត់ |
| GET | `/api/v1/maintenance/schedules/due` | Devices ដែលដល់ពេលថែទាំ |

### Security Rules
- Ticket ចំពោះ device មួយ **ត្រូវការសិទ្ធិមើល device នោះ** ជាមុនសិន (permission check ដដែលនឹង device access)
- Critical priority ticket → **auto-notify managers** (ភ្ជាប់ `notification.ts` category `device_alert`)
- Device ដែលមាន **open critical ticket** → Safety Engine អាចរឹតបន្តឹង command មួយចំនួន (ឧ. ហាមប្រើ Robot Arm ដែលមាន ticket "sensor malfunction")
- Technician assignment: **ត្រូវការ role ត្រឹមត្រូវ** (operator/manager level ឡើងទៅ) មិនមែន viewer

### Audit Events (7 events)
`ticket.created`, `ticket.status_changed`, `ticket.assigned`, `ticket.resolved`, `ticket.reopened`, `maintenance_schedule.created`, `maintenance_schedule.overdue`

---

## ផ្ទាំងសង្ខេប — 9 Domains ថ្មី

| Domain | Endpoints | Audit Events |
|---|---|---|
| AI Orchestration | 8 | 7 |
| Billing & Subscription | 12 | 8 |
| Analytics & Telemetry | 9 | 4 |
| Push Notification Delivery | 7 | 4 |
| File & Media Storage | 10 | 6 |
| Reporting & Export | 9 | 5 |
| Integration & Webhook | 11 | 7 |
| Geolocation & Map | 10 | 6 |
| Maintenance & Ticketing | 12 | 7 |
| **សរុបថ្មី** | **88** | **54** |

**សរុបរួម (18 domain ចាស់ + 9 domain ថ្មី) ≈ 279 REST Endpoints, ≈ 250 Audit Events**

---

## របៀបភ្ជាប់ចូល `index.ts`

```typescript
// បន្ថែមទៅ khoem-now/API/index.ts
export * from './ai-orchestration';
export * from './billing-subscription';
export * from './analytics-telemetry';
export * from './notification-push';
export * from './file-storage';
export * from './reporting-export';
export * from './integration-webhook';
export * from './geolocation-map';
export * from './maintenance-ticketing';

export const KSV_API_ROUTE_REGISTRY = {
  // ... 17 domains ដើម
  aiOrchestration: AI_ORCHESTRATION_ROUTES,
  billingSubscription: BILLING_ROUTES,
  analyticsTelemetry: TELEMETRY_ROUTES,
  notificationPush: PUSH_ROUTES,
  fileStorage: FILE_STORAGE_ROUTES,
  reportingExport: REPORTING_ROUTES,
  integrationWebhook: WEBHOOK_ROUTES,
  geolocationMap: GEO_ROUTES,
  maintenanceTicketing: TICKETING_ROUTES,
};
```

---

*ឯកសារនេះបន្ថែម 9 Extension Domains ទៅលើ KSV Universal Secure Control Platform*
*ទីតាំង: `khoem-now/API/` — ត្រូវ merge ចូល `index.ts` ដើម*


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


# 🌐 KHOEM-AI — KSV API

## KSV Universal Secure Control Platform — API Layer ពេញលេញ

> **ទីតាំង**: `khoem-now/API/`
> **ភាសា**: TypeScript
> **ស្តង់ដារ**: REST API · OAuth 2.0 / OIDC · TLS · Zero-Trust Security
> **គោលការណ៍ស្នូល**: Identity First · Authorization First · Security First · Safety First (ដាច់ដោយឡែកពី Security) · Privacy First · Discovery ≠ Authorized

---

## 📊 សរុបចំនួន

| | ចំនួន |
|---|---|
| **Domain files សរុប** | 27 (18 ដើម + 9 ថ្មី) |
| **REST Endpoints សរុប** | ≈ 279 |
| **Audit Events សរុប** | ≈ 250 |
| **Command Pipeline steps** | 9 (Parse → Audit) |

---

## 📁 បញ្ជីឯកសារទាំង 27 (តាមលំដាប់ភ្ជាប់ប្រព័ន្ធ)

### ក្រុមទី 1 — Identity & Access (5 files)
| # | ឯកសារ | Endpoints | ស្នូល |
|---|---|---|---|
| 1 | `identity.ts` | 8 | KSV Account + Identity Provider linking |
| 2 | `authentication.ts` | 14 | Login, Session, MFA, Token |
| 3 | `account-recovery.ts` | 11 | Forgot password → OTP → New password |
| 4 | `authorization.ts` | 12 | Policy-Based Access Control (Who+What+Where+When) |
| 5 | `pairing.ts`* | 8 | Device pairing → Ownership creation (*ឆែកភាពស្ទួនជាមួយ discovery.ts*) |

### ក្រុមទី 2 — Organization & Device (4 files)
| # | ឯកសារ | Endpoints | ស្នូល |
|---|---|---|---|
| 6 | `organization.ts` | 26 | Company → Site → Building → Room → Device |
| 7 | `device.ts` | 14 | Device Identity + Capability + Lifecycle |
| 8 | `discovery.ts` | 11 | Scan/Find device (Discovery ≠ Permission) |
| 9 | `protocol.ts` | 8 | Bluetooth/Wi-Fi/MQTT/IR/Zigbee/CAN adapter layer |

### ក្រុមទី 3 — Command & Control (4 files)
| # | ឯកសារ | Endpoints | ស្នូល |
|---|---|---|---|
| 10 | `gateway.ts` | 14 | Cloud ↔ Edge Gateway ↔ Local Device bridge |
| 11 | `command.ts` | 6 | Command Pipeline ពេញលេញ (9 ជំហាន) |
| 12 | `safety.ts` | 11 | Safety Engine ដាច់ដោយឡែកពី Security |
| 13 | `automation.ts` | 14 | IF-THEN Rules + Scenes |

### ក្រុមទី 4 — Security & Compliance (4 files)
| # | ឯកសារ | Endpoints | ស្នូល |
|---|---|---|---|
| 14 | `security.ts` | 13 | Key/Secret Management + Threat Detection |
| 15 | `audit.ts` | 10 | Immutable Who/What/When log |
| 16 | `notification.ts` | 11 | Alert category & preference management |
| 17 | `international.ts` | 7 | 195 Country + Language + Timezone |

### ក្រុមទី 5 — Administration (1 file)
| # | ឯកសារ | Endpoints | ស្នូល |
|---|---|---|---|
| 18 | `administration.ts` | 11 | Admin Console (Least Privilege, no user-secret access) |

### ក្រុមទី 6 — Extension Domains ថ្មី (9 files)
| # | ឯកសារ | Endpoints | ស្នូល |
|---|---|---|---|
| 19 | `ai-orchestration.ts` | 8 | Natural Language → Structured Command (AI = interpreter ប៉ុណ្ណោះ) |
| 20 | `billing-subscription.ts` | 12 | Plan + Invoice + Payment (ដាច់ពី Security Core) |
| 21 | `analytics-telemetry.ts` | 9 | Device/Platform operational metrics |
| 22 | `notification-push.ts` | 7 | Push delivery layer (FCM/APNs/Web Push) |
| 23 | `file-storage.ts` | 10 | Firmware/Report/Evidence file management |
| 24 | `reporting-export.ts` | 9 | Scheduled business reports + bulk export |
| 25 | `integration-webhook.ts` | 11 | Outbound webhook + inbound integration receiver |
| 26 | `geolocation-map.ts` | 10 | Site map + Geo-fence (GPS = context signal only) |
| 27 | `maintenance-ticketing.ts` | 12 | Work order / field-service tickets |

---

## 🔗 របៀបភ្ជាប់គ្នារវាង Domain (Dependency Map)

```
identity.ts ──┬─→ authentication.ts ──→ authorization.ts
              └─→ account-recovery.ts

organization.ts ──→ device.ts ──┬─→ discovery.ts ──→ pairing.ts
                                 ├─→ protocol.ts ──→ gateway.ts
                                 └─→ command.ts ──┬─→ safety.ts
                                                   ├─→ automation.ts
                                                   └─→ audit.ts

security.ts ──→ (key management ប្រើដោយ auth.ts, file-storage.ts, notification-push.ts, integration-webhook.ts)

ai-orchestration.ts ──→ command.ts (AI output ចូល pipeline ដដែល)
geolocation-map.ts ──→ safety.ts (geo-fence event ត្រូវការវាយតម្លៃ safety)
maintenance-ticketing.ts ──→ device.ts + notification.ts + file-storage.ts
reporting-export.ts ──→ file-storage.ts (report ត្រូវរក្សាទុកជា file)
billing-subscription.ts ──→ (ឯករាជ្យ — មិនប៉ះ Security Core)
analytics-telemetry.ts ──→ (ឯករាជ្យពី audit.ts — operational មិនមែន security log)
```

**គោលការណ៍សំខាន់មួយដដែលៗ**៖ គ្រប់ domain ដែលអាចប៉ះពាល់ device ណាមួយ (command, automation, ai-orchestration, integration-webhook, maintenance-ticketing) **សុទ្ធតែត្រូវឆ្លងកាត់ Command Pipeline ដដែល** —
```
Authenticate → Authorize → Device Capability → Safety → Execute → Audit
```
គ្មាន domain ណាមួយមានផ្លូវកាត់ (shortcut) ទេ។

---

## 🛠️ ការប្រើប្រាស់ជាក់ស្តែង (Real Implementation Status)

| ស្រទាប់ | ស្ថានភាព |
|---|---|
| **Types + Route definitions** (27 files ខាងលើ) | ✅ សរសេររួច — ជា spec/reference layer |
| **Security core ជាក់ស្តែង** (`src/core/`) | ✅ auth.middleware.ts, rbac.policy.ts, encryption.util.ts, audit.log.ts, rate-limiter.ts |
| **Safety Engine ជាក់ស្តែង** (`src/core/safety/`) | ✅ safety.engine.ts (4 rule evaluators built-in) |
| **Database models** (`src/infrastructure/database/`) | ✅ models.ts (Mongoose — User, Device, Command, Organization ។ល។) |
| **Command route ជាក់ស្តែង** (`src/modules/command/`) | ✅ command.routes.ts (ភ្ជាប់ auth+rbac+safety+audit ចូលគ្នា) |
| **Route ជាក់ស្តែងសម្រាប់ 26 domain ដទៃ** | ⏳ មិនទាន់ — មានតែ Types/spec, មិនទាន់មាន Express route ពិតប្រាកដ |
| **Frontend API client** (`src/lib/api.ts`) | ⏳ មិនទាន់ — `ControlsView.tsx` មិនទាន់ហៅ endpoint ពិត |

**សេចក្តីសង្ខេប**៖ ២៧ ឯកសារខាងលើគឺជា **ផែនទី/blueprint ពេញលេញ** នៃ API ទាំងមូល។ ក្នុងចំណោមនោះ មានតែ **Security core + Safety Engine + Command route** ប៉ុណ្ណោះដែលក្លាយជាកូដ **ដំណើរការពិតប្រាកដ** រួចហើយ។ ២៦ domain ដទៃទៀត (Identity, Device, Organization ។ល។) នៅសល់ជាជំហានបន្ទាប់ត្រូវប្តូរពី "Types spec" ទៅជា "Express route ពិត" ដូច `command.routes.ts`។

---

## 📌 ចំណុចត្រូវប្រយ័ត្ន (Known Issues)

- **`pairing.ts` vs `discovery.ts`**: ឯកសារ blueprint ចាស់ចែងថា pairing merge ចូល discovery — ត្រូវផ្ទៀងផ្ទាត់ថាតើ `pairing.ts` ជា file ស្ទួន ឬការសម្រេចចិត្តថ្មីញែកចេញ
- **`ActionType`** ស្ទួនឈ្មោះរវាង `authorization.ts` និង `automation.ts` — មិនទាន់ប៉ះពាល់ ព្រោះមិនទាន់ import រួមគ្នា ប៉ុន្តែត្រូវប្រយ័ត្នពេលភ្ជាប់
- Command Pipeline ជាក់ស្តែងឥឡូវអនុវត្តតែ 6 ជំហាន (Authenticate→Authorize→RateLimit→Safety→Execute→Audit) — ខ្វះ **Capability check** (ជំហានទី 4 ក្នុង spec 9-ជំហាន) និង **Human Confirmation** (ជំហានទី 6 សម្រាប់ high-risk commands)

---

*ឯកសារនេះជា Master Index នៃ KSV API — ត្រូវធ្វើបច្ចុប្បន្នភាពរាល់ពេលមាន domain ថ្មី ឬផ្លាស់ប្តូររចនាសម្ព័ន្ធ*
*ទីតាំង: `khoem-now/API/README.md`*
