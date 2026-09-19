# Client vs Server 2026-09-20 01:10

## base URLs
src/lib/api.ts:10:const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
src/lib/api.ts:21:  const res = await fetch(`${API_BASE}${path}`, {
src/lib/api.ts:1533:  const res = await fetch(`${API_BASE}/billing/invoices/${invoiceId}/download`, {
src/lib/api.ts:1663:  const res = await fetch(`${API_BASE}/files/${fileId}`, {
src/lib/api.ts:1725:  const res = await fetch(`${API_BASE}/reports/instances/${instanceId}/download`, {
src/lib/constants.ts:10:export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

server routes: 63 | client paths: 227 | /api/v1 on server: 11

## server routes under /api/v1 (client base is /api)
  POST /api/v1/gateways
  GET /api/v1/gateways
  GET /api/v1/gateways/:gatewayId
  POST /api/v1/ai/interpret
  GET /api/v1/ai/sessions/:id
  DELETE /api/v1/ai/sessions/:id
  POST /api/v1/ai/interpret/confirm
  GET /api/v1/ai/models
  POST /api/v1/ai/models/:id/enable
  GET /api/v1/ai/usage
  POST /api/v1/ai/feedback

## client calls with NO matching server route
  /auth/login/oauth
  /auth/mfa/verify
  /auth/token/refresh
  /auth/logout
  /auth/sessions
  /auth/sessions/${sessionId}
  /auth/mfa/enroll
  /auth/mfa/enroll/confirm
  /auth/mfa/disable
  /identity/identities
  /identity/identities/link
  /identity/identities/${req.identityId}
  /identity/identities/${req.identityId}/verify
  /authz/check/batch
  /authz/permissions
  /authz/permissions/${req.permissionId}
  /authz/my-permissions
  /authz/my-permissions/${resourceType}/${resourceId}
  /authz/approvals/pending
  /authz/approvals/${req.pendingActionId}
  /authz/owner/${resourceType}/${resourceId}/transfer
  /devices/${deviceId}/capabilities
  /devices/${req.deviceId}/firmware/update
  /devices/${deviceId}/firmware/rollback
  /devices/${req.deviceId}/quarantine
  /devices/${deviceId}/quarantine/release
  /devices/${req.deviceId}/decommission
  /device-groups
  /device-groups/${groupId}/devices
  /device-groups/${groupId}/devices/${deviceId}
  /safety/check
  /safety/rules/${ruleId}
  /safety/rules/${ruleId}/enable
  /safety/rules/${ruleId}/disable
  /safety/devices/${deviceId}
  /safety/devices
  /safety/emergency-stop
  /safety/emergency-stop/release
  /safety/events/${eventId}
  /audit/events/${auditId}
  /audit/export
  /audit/export/${exportId}
  /audit/compliance-report
  /audit/devices/${deviceId}
  /audit/accounts/${accountId}
  /audit/orgs/${orgId}
  /discovery/start
  /discovery/${discoveryJobId}/stop
  /discovery/devices/${discoveryId}
  /discovery/devices/${req.discoveryId}/verify
  /pairing/initiate
  /pairing/${pairingSessionId}
  /pairing/${req.pairingSessionId}/complete
  /pairing/${pairingSessionId}/cancel
  /devices/${req.deviceId}/unpair
  /devices/${deviceId}/repair
  /gateways/${gatewayId}/status
  /gateways/${req.gatewayId}/sync
  /gateways/${gatewayId}/sync/queue
  /gateways/${req.gatewayId}/command
  /gateways/${req.gatewayId}/firmware/update
  /gateways/${gatewayId}/offline-policy
  /gateways/${gatewayId}/devices
  /protocols/adapters/${adapterId}
  /protocols/connections/${connectionId}
  /protocols/connections/test
  /protocols/connections/${connectionId}/disconnect
  /protocols/connections/${connectionId}/reconnect
  /protocols/manufacturers
  /protocols/manufacturers/${manufacturerId}
  /protocols/${protocol}/config/${deviceId}
  /organizations/${orgId}/members/invite
  /security/keys
  /security/keys/${keyId}
  /security/keys/${req.keyId}/rotate
  /security/keys/${req.keyId}/revoke
  /security/encrypt
  /security/decrypt
  /security/threats/${detectionId}
  /security/threats/${req.detectionId}/false-positive
  /security/incidents/${incidentId}
  /security/incidents/${req.incidentId}/actions
  /security/incidents/${incidentId}/resolve
  /security/rate-limit/${accountId}
  /notifications/send
  /notifications/send-bulk
  /notifications/${notificationId}
  /notifications/${req.notificationId}/read
  /notifications/read-all
  /notifications/preferences
  /notifications/push-tokens
  /notifications/push-tokens/${tokenId}
  /automation/rules/${ruleId}
  /automation/rules/${ruleId}/enable
  /automation/rules/${ruleId}/disable
  /automation/rules/${req.ruleId}/test
  /automation/scenes
  /automation/scenes/${sceneId}
  /automation/scenes/${req.sceneId}/activate
  /automation/logs/${logId}
  /recovery/initiate
  /recovery/otp/resend
  /recovery/otp/verify
  /recovery/provider/verify
  /recovery/backup-code/verify
  /recovery/password/reset
  /recovery/cancel
  /recovery/backup-codes/generate
  /recovery/backup-codes/status
  /recovery/backup-codes/revoke
  /international/countries/${code}
  /international/resolve-locale
  /international/account/locale
  /admin/roles/grant
  /admin/roles/revoke
  /admin/roles
  /admin/accounts/${accountId}
  /admin/accounts/${req.targetAccountId}/suspend
  /admin/accounts/${accountId}/reinstate
  /admin/accounts/${req.targetAccountId}/impersonate
  /admin/organizations/${orgId}/suspend
  /admin/system/health
  /admin/system/stats
  /admin/feature-flags
  /admin/feature-flags/${req.flagKey}
  /telemetry/ingest
  /telemetry/platform
  /telemetry/aggregate?metricName=${metricName}&period=${period}
  /telemetry/anomalies
  /telemetry/dashboards
  /telemetry/dashboards/${dashboardId}
  /push/send
  /push/send-batch
  /push/jobs/${jobId}
  /push/providers
  /push/tokens/${tokenId}/health
  /push/tokens/cleanup
  /files/upload/initiate
  /files/upload/complete
  /files/${fileId}
  /files/${fileId}/share
  /files/storage/quota
  /reports/templates
  /reports/generate
  /reports/schedule
  /reports/scheduled
  /reports/scheduled/${scheduleId}
  /export/jobs
  /export/jobs/${jobId}
  /webhooks
  /webhooks/${webhookId}
  /webhooks/${webhookId}/deliveries
  /webhooks/${webhookId}/test
  /integrations/connect
  /integrations/${connectorId}/disconnect
  /geo/sites/${siteId}/map
  /geo/fences
  /geo/fences/${fenceId}
  /geo/devices/${deviceId}/location
  /geo/devices/${deviceId}/location/history
  /geo/fences/${fenceId}/events
  /geo/vehicles/${deviceId}/tracking
  /tickets
  /tickets/${ticketId}
  /tickets/${ticketId}/status
  /tickets/${ticketId}/assign
  /tickets/${ticketId}/comments
  /tickets/${ticketId}/attachments
  /maintenance/schedules
  /maintenance/schedules/due
  /pairing/sessions
  /pairing/sessions/${sessionId}
  /pairing/sessions/${sessionId}/verify-owner
  /pairing/sessions/${sessionId}/confirm
  /pairing/devices
  /pairing/devices/${req.deviceId}/unpair
  /pairing/devices/${deviceId}/transfer

## server routes NOT called by client
  POST /api/certificates
  GET /api/vocabulary
  GET /api/vocabulary/:language
  GET /api/health
  GET /api/version
  POST /api/users
  GET /api/audit/logs
  GET /api/protocols
  GET /api/notifications
  GET /api/discovery/devices
  GET /api/international/languages
  GET /api/safety/events
  GET /api/billing/invoices/:id/download

## server [security] + rest of inventory
[security] 4
  POST /api/security/threats
  GET /api/security/threats
  GET /api/security/sessions
  GET /api/security/incidents

[settings] 2
  GET /api/settings
  PUT /api/settings

[telemetry] 1
  GET /api/telemetry/devices/:id

[users] 1
  POST /api/users

[version] 1
  GET /api/version

[vocabulary] 2
  GET /api/vocabulary
  GET /api/vocabulary/:language

## API/device.ts contract format

## tsc errors count
app:  39
node: 0
