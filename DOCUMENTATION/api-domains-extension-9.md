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
