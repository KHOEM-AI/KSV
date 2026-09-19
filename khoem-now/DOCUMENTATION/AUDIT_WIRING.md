# KSV Wiring Audit
Generated: 2026-09-20 00:49

## 1. API domain files: exports / imported by src / doc exists
| File | Exports | Used in src | Doc |
|---|---|---|---|
| account-recovery | 21 | 1 | yes |
| administration | 19 | 1 | yes |
| ai-orchestration | 11 | 1 | NO |
| analytics-telemetry | 8 | 1 | NO |
| audit | 13 | 1 | yes |
| authentication | 30 | 1 | yes |
| authorization | 21 | 1 | yes |
| automation | 21 | 1 | yes |
| billing-subscription | 12 | 1 | NO |
| command | 22 | 1 | yes |
| device | 22 | 2 | yes |
| discovery | 23 | 2 | yes |
| file-storage | 8 | 1 | NO |
| gateway | 19 | 4 | yes |
| geolocation-map | 11 | 1 | NO |
| identity | 21 | 2 | yes |
| integration-webhook | 9 | 1 | NO |
| international | 12 | 1 | yes |
| maintenance-ticketing | 9 | 1 | NO |
| notification-push | 9 | 1 | NO |
| notification | 20 | 1 | yes |
| organization | 25 | 3 | yes |
| pairing | 9 | 1 | yes |
| protocol | 23 | 4 | yes |
| reporting-export | 10 | 1 | NO |
| safety | 21 | 3 | yes |
| security | 26 | 2 | yes |

## 2. index.ts re-exports
3:// Central export point for all API domains under khoem-now/API/
17:export * from './identity';
18:export * from './authentication';
19:export * from './account-recovery';
20:export * from './authorization';
21:export * from './organization';
22:export * from './device';
23:export * from './discovery';        // includes Pairing
24:export * from './protocol';
25:export * from './gateway';
26:export * from './command';
27:export * from './safety';
28:export * from './automation';
29:export * from './security';
30:export * from './audit';
31:export * from './notification';
32:export * from './international';
33:export * from './administration';
34:export * from './ai-orchestration';
35:export * from './billing-subscription';
36:export * from './analytics-telemetry';
37:export * from './notification-push';
38:export * from './file-storage';
39:export * from './reporting-export';
40:export * from './integration-webhook';
41:export * from './geolocation-map';
42:export * from './maintenance-ticketing';
49:import { IDENTITY_ROUTES } from './identity';
50:import { AUTHENTICATION_ROUTES } from './authentication';
51:import { ACCOUNT_RECOVERY_ROUTES } from './account-recovery';
52:import { AUTHORIZATION_ROUTES } from './authorization';
53:import { ORGANIZATION_ROUTES } from './organization';
54:import { DEVICE_ROUTES } from './device';
55:import { DISCOVERY_ROUTES } from './discovery';
56:import { PROTOCOL_ROUTES } from './protocol';
57:import { GATEWAY_ROUTES } from './gateway';
58:import { COMMAND_ROUTES } from './command';
59:import { SAFETY_ROUTES } from './safety';
60:import { AUTOMATION_ROUTES } from './automation';
61:import { SECURITY_ROUTES } from './security';
62:import { AUDIT_ROUTES } from './audit';
63:import { NOTIFICATION_ROUTES } from './notification';
64:import { INTERNATIONAL_ROUTES } from './international';
65:import { ADMINISTRATION_ROUTES } from './administration';
66:import { AI_ORCHESTRATION_ROUTES } from './ai-orchestration';
67:import { BILLING_ROUTES } from './billing-subscription';
68:import { TELEMETRY_ROUTES } from './analytics-telemetry';
69:import { PUSH_ROUTES } from './notification-push';
70:import { FILE_STORAGE_ROUTES } from './file-storage';
71:import { REPORTING_ROUTES } from './reporting-export';
72:import { WEBHOOK_ROUTES } from './integration-webhook';
73:import { GEO_ROUTES } from './geolocation-map';
74:import { TICKETING_ROUTES } from './maintenance-ticketing';
76:export const KSV_API_ROUTE_REGISTRY = {
110:export const KSV_API_DOMAIN_FILES = [
134:  { domain: 'Reporting & Export', file: 'reporting-export.ts' },

## 3. API files NOT re-exported in index.ts

## 4. src structure
- src/App.tsx
- src/app/app.ts
- src/components/AIChatOverlay.tsx
- src/components/AIWelcomeBanner.tsx
- src/components/CountryClock.tsx
- src/components/DoorControlCard.tsx
- src/components/KSVSection.tsx
- src/components/KhoemAIPanel.tsx
- src/components/LanguageSelector.tsx
- src/components/ProjectSwitcher.tsx
- src/components/nav.tsx
- src/components/ui.tsx
- src/core/ai/khoem-ai-brain.ts
- src/core/ai/khoem-ai-conduct.ts
- src/core/ai/khoem-ai-llm.ts
- src/core/ai/patterns/disrespect-vocabulary.ts
- src/core/ai/patterns/global-195-vocabulary.ts
- src/core/auth/auth.middleware.ts
- src/core/auth/authorization.engine.ts
- src/core/auth/authorization.service.ts
- src/core/auth/rbac.policy.ts
- src/core/gateway/command.lifecycle.ts
- src/core/gateway/gateway.dispatcher.ts
- src/core/gateway/gateway.dispatcher.types.ts
- src/core/gateway/gateway.types.ts
- src/core/logger/request-logger.ts
- src/core/protocol/protocol.registry.ts
- src/core/protocol/protocol.types.ts
- src/core/safety/safety.engine.ts
- src/core/security/audit.log.ts
- src/core/security/encryption.util.ts
- src/core/security/rate-limiter.ts
- src/data/countries.ts
- src/data/domain.ts
- src/hooks/useDeviceCommand.ts
- src/i18n/LanguageContext.tsx
- src/i18n/timeAgo.ts
- src/i18n/translations.ts
- src/infrastructure/database/connection.ts
- src/infrastructure/database/models.ts
- src/infrastructure/mqtt/client.ts
- src/ksv.ts
- src/lib/api.ts
- src/lib/auth.ts
- src/lib/constants.ts
- src/lib/formatters.ts
- src/lib/websocket.ts
- src/main.tsx
- src/middleware/error-handler.ts
- src/modules/command/command.routes.ts
- src/modules/command/controllers/command.controller.ts
- src/modules/command/dto/command.dto.ts
- src/modules/command/index.ts
- src/modules/command/models/command.model.ts
- src/modules/command/repositories/command.repository.ts
- src/modules/command/routes/command.routes.ts
- src/modules/command/services/command.service.ts
- src/modules/communication/gateway/controllers/gateway.controller.ts
- src/modules/communication/gateway/dto/gateway.dto.ts
- src/modules/communication/gateway/index.ts
- src/modules/communication/gateway/models/gateway.model.ts
- src/modules/communication/gateway/repositories/gateway.repository.ts
- src/modules/communication/gateway/routes/gateway.routes.ts
- src/modules/communication/gateway/services/gateway.service.ts
- src/modules/communication/index.ts
- src/modules/communication/protocol/controllers/protocol.controller.ts
- src/modules/communication/protocol/dto/protocol.dto.ts
- src/modules/communication/protocol/index.ts
- src/modules/communication/protocol/models/protocol.model.ts
- src/modules/communication/protocol/repositories/protocol.repository.ts
- src/modules/communication/protocol/routes/protocol.routes.ts
- src/modules/communication/protocol/services/protocol.service.ts
- src/modules/device/controllers/device.controller.ts
- src/modules/device/dto/device.dto.ts
- src/modules/device/index.ts
- src/modules/device/models/device.model.ts
- src/modules/device/repositories/device.repository.ts
- src/modules/device/routes/device.routes.ts
- src/modules/device/services/device.service.ts
- src/modules/discovery/controllers/discovery.controller.ts
- src/modules/discovery/dto/discovery.dto.ts
- src/modules/discovery/index.ts
- src/modules/discovery/models/discovery.model.ts
- src/modules/discovery/repositories/discovery.repository.ts
- src/modules/discovery/routes/discovery.routes.ts
- src/modules/discovery/services/discovery.service.ts
- src/modules/identity/controllers/identity.controller.ts
- src/modules/identity/dto/identity.dto.ts
- src/modules/identity/index.ts
- src/modules/identity/models/identity.model.ts
- src/modules/identity/repositories/identity.repository.ts
- src/modules/identity/routes/identity.routes.ts
- src/modules/identity/services/identity.service.ts
- src/modules/organization/controllers/organization.controller.ts
- src/modules/organization/dto/organization.dto.ts
- src/modules/organization/index.ts
- src/modules/organization/models/organization.model.ts
- src/modules/organization/repositories/organization.repository.ts
- src/modules/organization/routes/organization.routes.ts
- src/modules/organization/services/organization.service.ts
- src/modules/safety/controllers/safety.controller.ts
- src/modules/safety/dto/safety.dto.ts
- src/modules/safety/index.ts
- src/modules/safety/models/safety.model.ts
- src/modules/safety/repositories/safety.repository.ts
- src/modules/safety/routes/safety.routes.ts
- src/modules/safety/services/safety.service.ts
- src/routes/index.ts
- src/server.ts
- src/server/server.ts
- src/views/AuditView.tsx
- src/views/CertificatesView.tsx
- src/views/ControlsView.tsx
- src/views/DashboardView.tsx
- src/views/DevicesView.tsx
- src/views/GatewayView.tsx
- src/views/InternationalView.tsx
- src/views/LoginView.tsx
- src/views/MapView.tsx
- src/views/OrganizationView.tsx
- src/views/ProtocolsView.tsx
- src/views/SafetyView.tsx
- src/views/SecurityView.tsx
- src/views/SettingsView.tsx
- src/vite-env.d.ts

## 5. src files importing from API
- src/lib/api.ts:166:} from "../../API/authentication";
- src/lib/api.ts:255:} from "../../API/identity";
- src/lib/api.ts:316:} from "../../API/authorization";
- src/lib/api.ts:401:} from "../../API/device";
- src/lib/api.ts:511:} from "../../API/safety";
- src/lib/api.ts:603:} from "../../API/audit";
- src/lib/api.ts:666:} from "../../API/discovery";
- src/lib/api.ts:748:} from "../../API/gateway";
- src/lib/api.ts:839:} from "../../API/protocol";
- src/lib/api.ts:911:} from "../../API/organization";
- src/lib/api.ts:1028:} from "../../API/security";
- src/lib/api.ts:1113:} from "../../API/notification";
- src/lib/api.ts:1179:} from "../../API/automation";
- src/lib/api.ts:1264:} from "../../API/account-recovery";
- src/lib/api.ts:1330:} from "../../API/international";
- src/lib/api.ts:1381:} from "../../API/administration";
- src/lib/api.ts:1456:} from "../../API/ai-orchestration";
- src/lib/api.ts:1503:} from "../../API/billing-subscription";
- src/lib/api.ts:1564:} from "../../API/analytics-telemetry";
- src/lib/api.ts:1609:} from "../../API/notification-push";
- src/lib/api.ts:1645:} from "../../API/file-storage";
- src/lib/api.ts:1695:} from "../../API/reporting-export";
- src/lib/api.ts:1751:} from "../../API/integration-webhook";
- src/lib/api.ts:1806:} from "../../API/geolocation-map";
- src/lib/api.ts:1864:} from "../../API/maintenance-ticketing";
- src/lib/api.ts:1935:} from "../../API/pairing";
- src/views/GatewayView.tsx:6:import type { KSVGateway } from '../../API/gateway';
- src/views/OrganizationView.tsx:6:import type { KSVOrganization, KSVSite, KSVBuilding, KSVOrgMember } from '../../API/organization';
- src/views/ProtocolsView.tsx:7:import type { ProtocolAdapter } from '../../API/protocol';
- src/views/SafetyView.tsx:6:import type { SafetyRule } from '../../API/safety';

## 6. Backend HTTP calls in src (fetch/axios)
- src/components/KhoemAIPanel.tsx:85:        const response = await fetch("/api/v1/ai-brain/recent-decisions");
- src/components/ProjectSwitcher.tsx:4:  { url: 'http://localhost:5176', text: 'TV AI KHOEM-AI' },
- src/components/ProjectSwitcher.tsx:5:  { url: 'http://localhost:5174', text: 'Scan Overview & Count', sub: 'CAI' },
- src/lib/api.ts:10:const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
- src/lib/api.ts:21:  const res = await fetch(`${API_BASE}${path}`, {
- src/lib/api.ts:1533:  const res = await fetch(`${API_BASE}/billing/invoices/${invoiceId}/download`, {
- src/lib/api.ts:1663:  const res = await fetch(`${API_BASE}/files/${fileId}`, {
- src/lib/api.ts:1725:  const res = await fetch(`${API_BASE}/reports/instances/${instanceId}/download`, {
- src/lib/constants.ts:10:export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
- src/lib/websocket.ts:20:  const base = import.meta.env.VITE_WS_URL || "ws://localhost:3000/ws";

## 7. TODO / stub / mock markers in API

## 8. TypeScript check
npm warn Unknown user config "auto-install-peers". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown user config "strict-peer-dependencies". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
