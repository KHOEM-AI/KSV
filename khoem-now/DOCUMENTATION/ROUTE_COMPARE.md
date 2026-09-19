# Route Compare 2026-09-20 00:57

## server.ts: total per method
      9 app.delete
     49 app.get
     19 app.post
      8 app.put

## server.ts: routes grouped by first path segment
      2 /vocabulary
      2 /security
      2 /devices
      2 /commands
      2 /certificates
      2 /auth
      1 /version
      1 /health
      1 /dashboard

## server.ts: prefix used
     15 /api

## API/ contract: entries per domain (path: lines)
9 maintenance-ticketing
9 integration-webhook
9 geolocation-map
9 billing-subscription
8 reporting-export
8 pairing
8 ai-orchestration
7 analytics-telemetry
6 notification-push
6 file-storage
0 security
0 safety
0 protocol
0 organization
0 notification
0 international
0 identity
0 gateway
0 discovery
0 device
0 command
0 automation
0 authorization
0 authentication
0 audit
0 administration
0 account-recovery

## API/ sample path format

## other files registering routes
src/core/auth/rbac.policy.ts
src/core/security/rate-limiter.ts
src/modules/command/routes/command.routes.ts
src/modules/communication/gateway/routes/gateway.routes.ts
src/modules/communication/protocol/routes/protocol.routes.ts
src/modules/device/routes/device.routes.ts
src/modules/discovery/routes/discovery.routes.ts
src/modules/identity/routes/identity.routes.ts
src/modules/organization/routes/organization.routes.ts
src/modules/safety/routes/safety.routes.ts

## server.ts imports from modules/core
10:import { interpretIntent } from "./core/ai/khoem-ai-brain.ts";
16:import { authenticate } from "./core/auth/auth.middleware.ts";
17:import { requirePermission, requireMinRole } from "./core/auth/rbac.policy.ts";
18:import { deviceCommandRateLimiter, authRateLimiter } from "./core/security/rate-limiter.ts";
19:import { evaluateSafetyForDevice } from "./core/safety/safety.engine.ts";
20:import { auditDeviceCommand } from "./core/security/audit.log.ts";
21:import { DefaultGatewayDispatcher } from "./core/gateway/gateway.dispatcher.ts";
23:import { applyDispatchResult } from "./core/gateway/command.lifecycle.ts";
24:import { evaluateSelfDefense } from "./core/ai/khoem-ai-brain.ts";
25:import { generateSecureToken } from "./core/security/encryption.util.ts";
30:import { GLOBAL_195_VOCABULARY_30K as GLOBAL_195_VOCABULARY } from "./core/ai/patterns/global-195-vocabulary.ts";
31:import { guardRespectfulResponse } from "./core/ai/khoem-ai-conduct.ts";

## which server does package.json run
7:    "dev": "vite",
8:    "server": "node --env-file=.env --experimental-strip-types src/server.ts",
9:    "build": "vite build",
