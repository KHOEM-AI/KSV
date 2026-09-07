/**
 * KSV — Frontend API Client
 * Location: khoem-now/src/lib/api.ts
 *
 * The single place the frontend talks to the backend. ControlsView.tsx
 * (and every other view) should import from here instead of using
 * local useState toggles that don't persist or audit anything.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

function getAccessToken(): string | null {
  // Wherever the app stores the JWT after login — adjust if your
  // auth flow keeps it somewhere else (context, cookie, etc).
  return localStorage.getItem("ksv_access_token");
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    // Surface the backend's error shape (SAFETY_BLOCKED, RATE_LIMITED, etc.)
    // so the UI can show a real, specific message instead of "something
    // went wrong".
    throw new ApiError(res.status, body?.error ?? "UNKNOWN_ERROR", body?.message ?? res.statusText, body);
  }

  return body as T;
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// ============================================================
// Command endpoints — mirrors command.routes.ts exactly
// ============================================================

export interface DispatchCommandInput {
  deviceId: string;
  type: string; // "UNLOCK", "LOCK", "SETPOINT", "SPEED_LIMIT", "RESET", "OPEN", ...
  payload?: Record<string, unknown>;
  signals?: {
    isInsideGeoFence?: boolean;
    humanZoneOccupied?: boolean;
    tamperDetected?: boolean;
    currentSpeed?: number;
    doorForceLockActive?: boolean;
  };
}

export interface DispatchCommandResult {
  commandId: string;
  deviceId: string;
  type: string;
  status: "pending";
}

export async function dispatchCommand(input: DispatchCommandInput): Promise<DispatchCommandResult> {
  return apiFetch<DispatchCommandResult>(`/devices/${input.deviceId}/commands`, {
    method: "POST",
    body: JSON.stringify({ commandType: input.type, payload: input.payload, signals: input.signals }),
  });
}

export interface CommandHistoryEntry {
  _id: string;
  deviceId: string;
  userId: string;
  type: string;
  status: string;
  createdAt: string;
}

export async function getDeviceCommandHistory(deviceId: string, limit = 10): Promise<{ commands: CommandHistoryEntry[] }> {
  return apiFetch(`/devices/${deviceId}/commands?limit=${limit}`);
}

export async function getCommandStatus(commandId: string): Promise<CommandHistoryEntry> {
  return apiFetch(`/commands/${commandId}`);
}

export interface RecentCommandEntry {
  _id: string;
  deviceId: { _id: string; name: string } | string;
  userId: { _id: string; email: string } | string | null;
  type: string;
  status: string;
  createdAt: string;
}

export async function listRecentCommands(limit = 10): Promise<{ commands: RecentCommandEntry[] }> {
  return apiFetch(`/commands/recent?limit=${limit}`);
}

// ============================================================
// Authentication endpoints — mirrors API/authentication.ts exactly
// ============================================================

import type {
  PasswordLoginRequest,
  OAuthLoginRequest,
  LoginResponse,
  MFAVerifyRequest,
  MFAVerifyResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  LogoutResponse,
  ListSessionsResponse,
  MFAEnrollRequest,
  MFAEnrollResponse,
  MFAConfirmEnrollRequest,
  MFADisableRequest,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from "../../API/authentication";

export async function loginWithPassword(req: PasswordLoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>(`/auth/login/password`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function loginWithOAuth(req: OAuthLoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>(`/auth/login/oauth`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function verifyMFA(req: MFAVerifyRequest): Promise<MFAVerifyResponse> {
  return apiFetch<MFAVerifyResponse>(`/auth/mfa/verify`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function refreshAuthToken(req: RefreshTokenRequest): Promise<RefreshTokenResponse> {
  return apiFetch<RefreshTokenResponse>(`/auth/token/refresh`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function logout(req: LogoutRequest): Promise<LogoutResponse> {
  return apiFetch<LogoutResponse>(`/auth/logout`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function listSessions(): Promise<ListSessionsResponse> {
  return apiFetch<ListSessionsResponse>(`/auth/sessions`);
}

export async function revokeSession(sessionId: string): Promise<{ success: boolean }> {
  return apiFetch(`/auth/sessions/${sessionId}`, { method: "DELETE" });
}

export async function enrollMFA(req: MFAEnrollRequest): Promise<MFAEnrollResponse> {
  return apiFetch<MFAEnrollResponse>(`/auth/mfa/enroll`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function confirmMFAEnroll(req: MFAConfirmEnrollRequest): Promise<{ success: boolean; message: string }> {
  return apiFetch(`/auth/mfa/enroll/confirm`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function disableMFA(req: MFADisableRequest): Promise<{ success: boolean }> {
  return apiFetch(`/auth/mfa/disable`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function changePassword(req: ChangePasswordRequest): Promise<ChangePasswordResponse> {
  return apiFetch<ChangePasswordResponse>(`/auth/password/change`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

// ============================================================
// Identity endpoints — mirrors API/identity.ts exactly
// ============================================================

import type {
  GetAccountResponse,
  UpdateAccountRequest,
  UpdateAccountResponse,
  LinkIdentityRequest,
  LinkIdentityResponse,
  UnlinkIdentityRequest,
  UnlinkIdentityResponse,
  VerifyIdentityRequest,
  VerifyIdentityResponse,
  DeleteAccountRequest,
  DeleteAccountResponse,
} from "../../API/identity";

export async function getAccount(): Promise<GetAccountResponse> {
  return apiFetch<GetAccountResponse>(`/identity/account`);
}

export async function updateAccount(req: UpdateAccountRequest): Promise<UpdateAccountResponse> {
  return apiFetch<UpdateAccountResponse>(`/identity/account`, {
    method: "PUT",
    body: JSON.stringify(req),
  });
}

export async function deleteAccount(req: DeleteAccountRequest): Promise<DeleteAccountResponse> {
  return apiFetch<DeleteAccountResponse>(`/identity/account`, {
    method: "DELETE",
    body: JSON.stringify(req),
  });
}

export async function listIdentities(): Promise<{ identities: import("../../API/identity").KSVIdentity[] }> {
  return apiFetch(`/identity/identities`);
}

export async function linkIdentity(req: LinkIdentityRequest): Promise<LinkIdentityResponse> {
  return apiFetch<LinkIdentityResponse>(`/identity/identities/link`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function unlinkIdentity(req: UnlinkIdentityRequest): Promise<UnlinkIdentityResponse> {
  return apiFetch<UnlinkIdentityResponse>(`/identity/identities/${req.identityId}`, {
    method: "DELETE",
    body: JSON.stringify(req),
  });
}

export async function verifyIdentity(req: VerifyIdentityRequest): Promise<VerifyIdentityResponse> {
  return apiFetch<VerifyIdentityResponse>(`/identity/identities/${req.identityId}/verify`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

// ============================================================
// Authorization endpoints — mirrors API/authorization.ts exactly
// ============================================================

import type {
  PermissionCheckInput,
  PermissionCheckResult,
  GrantPermissionRequest,
  GrantPermissionResponse,
  RevokePermissionRequest,
  RevokePermissionResponse,
  ListPermissionsRequest,
  ListPermissionsResponse,
  ApproveActionRequest,
  PendingApproval,
  ResourceType,
} from "../../API/authorization";

export async function checkPermission(req: PermissionCheckInput): Promise<PermissionCheckResult> {
  return apiFetch<PermissionCheckResult>(`/authz/check`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function checkPermissionsBatch(reqs: PermissionCheckInput[]): Promise<PermissionCheckResult[]> {
  return apiFetch<PermissionCheckResult[]>(`/authz/check/batch`, {
    method: "POST",
    body: JSON.stringify(reqs),
  });
}

export async function grantPermission(req: GrantPermissionRequest): Promise<GrantPermissionResponse> {
  return apiFetch<GrantPermissionResponse>(`/authz/permissions`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function revokePermission(req: RevokePermissionRequest): Promise<RevokePermissionResponse> {
  return apiFetch<RevokePermissionResponse>(`/authz/permissions/${req.permissionId}`, {
    method: "DELETE",
    body: JSON.stringify(req),
  });
}

export async function listPermissions(req: ListPermissionsRequest = {}): Promise<ListPermissionsResponse> {
  const params = new URLSearchParams(req as Record<string, string>).toString();
  return apiFetch<ListPermissionsResponse>(`/authz/permissions${params ? `?${params}` : ""}`);
}

export async function getMyPermissions(): Promise<ListPermissionsResponse> {
  return apiFetch<ListPermissionsResponse>(`/authz/my-permissions`);
}

export async function getMyPermissionsForResource(
  resourceType: ResourceType,
  resourceId: string
): Promise<ListPermissionsResponse> {
  return apiFetch<ListPermissionsResponse>(`/authz/my-permissions/${resourceType}/${resourceId}`);
}

export async function listPendingApprovals(): Promise<PendingApproval[]> {
  return apiFetch<PendingApproval[]>(`/authz/approvals/pending`);
}

export async function approveAction(req: ApproveActionRequest): Promise<{ success: boolean; message: string }> {
  return apiFetch(`/authz/approvals/${req.pendingActionId}`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function transferOwnership(
  resourceType: ResourceType,
  resourceId: string,
  newOwnerAccountId: string,
  confirmPhrase: string
): Promise<{ success: boolean; message: string }> {
  return apiFetch(`/authz/owner/${resourceType}/${resourceId}/transfer`, {
    method: "POST",
    body: JSON.stringify({ newOwnerAccountId, confirmPhrase }),
  });
}

// ============================================================
// Device endpoints — mirrors API/device.ts exactly
// ============================================================

import type {
  RegisterDeviceRequest,
  UpdateDeviceRequest,
  ListDevicesRequest,
  ListDevicesResponse,
  GetDeviceStateResponse,
  UpdateFirmwareRequest,
  UpdateFirmwareResponse,
  QuarantineDeviceRequest,
  DecommissionDeviceRequest,
  KSVDevice,
  DeviceCapability,
} from "../../API/device";

export async function registerDevice(req: RegisterDeviceRequest): Promise<KSVDevice> {
  return apiFetch<KSVDevice>(`/devices`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function listDevices(req: ListDevicesRequest = {}): Promise<ListDevicesResponse> {
  const params = new URLSearchParams(req as Record<string, string>).toString();
  return apiFetch<ListDevicesResponse>(`/devices${params ? `?${params}` : ""}`);
}

export async function getDevice(deviceId: string): Promise<KSVDevice> {
  return apiFetch<KSVDevice>(`/devices/${deviceId}`);
}

export async function updateDevice(deviceId: string, req: UpdateDeviceRequest): Promise<KSVDevice> {
  return apiFetch<KSVDevice>(`/devices/${deviceId}`, {
    method: "PUT",
    body: JSON.stringify(req),
  });
}

export async function deleteDevice(deviceId: string): Promise<{ success: boolean }> {
  return apiFetch(`/devices/${deviceId}`, { method: "DELETE" });
}

export async function getDeviceState(deviceId: string): Promise<GetDeviceStateResponse> {
  return apiFetch<GetDeviceStateResponse>(`/devices/${deviceId}/state`);
}

export async function listDeviceCapabilities(deviceId: string): Promise<DeviceCapability[]> {
  return apiFetch<DeviceCapability[]>(`/devices/${deviceId}/capabilities`);
}

export async function updateFirmware(req: UpdateFirmwareRequest): Promise<UpdateFirmwareResponse> {
  return apiFetch<UpdateFirmwareResponse>(`/devices/${req.deviceId}/firmware/update`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function rollbackFirmware(deviceId: string, targetVersion: string): Promise<{ success: boolean }> {
  return apiFetch(`/devices/${deviceId}/firmware/rollback`, {
    method: "POST",
    body: JSON.stringify({ targetVersion }),
  });
}

export async function quarantineDevice(req: QuarantineDeviceRequest): Promise<{ success: boolean }> {
  return apiFetch(`/devices/${req.deviceId}/quarantine`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function releaseQuarantine(deviceId: string, reason: string): Promise<{ success: boolean }> {
  return apiFetch(`/devices/${deviceId}/quarantine/release`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export async function decommissionDevice(req: DecommissionDeviceRequest): Promise<{ success: boolean }> {
  return apiFetch(`/devices/${req.deviceId}/decommission`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function listDeviceGroups(): Promise<{ groups: unknown[] }> {
  return apiFetch(`/device-groups`);
}

export async function createDeviceGroup(name: string, deviceIds: string[] = []): Promise<{ groupId: string }> {
  return apiFetch(`/device-groups`, {
    method: "POST",
    body: JSON.stringify({ name, deviceIds }),
  });
}

export async function addToDeviceGroup(groupId: string, deviceId: string): Promise<{ success: boolean }> {
  return apiFetch(`/device-groups/${groupId}/devices`, {
    method: "POST",
    body: JSON.stringify({ deviceId }),
  });
}

export async function removeFromDeviceGroup(groupId: string, deviceId: string): Promise<{ success: boolean }> {
  return apiFetch(`/device-groups/${groupId}/devices/${deviceId}`, { method: "DELETE" });
}

// ============================================================
// Safety endpoints — mirrors API/safety.ts exactly
// ============================================================

import type {
  SafetyCheckRequest,
  SafetyCheckResponse,
  CreateSafetyRuleRequest,
  UpdateSafetyRuleRequest,
  EmergencyStopRequest,
  EmergencyStopResponse,
  ReleaseEmergencyStopRequest,
  ListSafetyEventsRequest,
  SafetyRule,
  SafetyEvent,
  DeviceSafetyStatus,
} from "../../API/safety";

export async function checkSafety(req: SafetyCheckRequest): Promise<SafetyCheckResponse> {
  return apiFetch<SafetyCheckResponse>(`/safety/check`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function createSafetyRule(req: CreateSafetyRuleRequest): Promise<SafetyRule> {
  return apiFetch<SafetyRule>(`/safety/rules`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function listSafetyRules(orgId?: string): Promise<SafetyRule[]> {
  return apiFetch<SafetyRule[]>(`/safety/rules${orgId ? `?orgId=${orgId}` : ""}`);
}

export async function getSafetyRule(ruleId: string): Promise<SafetyRule> {
  return apiFetch<SafetyRule>(`/safety/rules/${ruleId}`);
}

export async function updateSafetyRule(ruleId: string, req: UpdateSafetyRuleRequest): Promise<SafetyRule> {
  return apiFetch<SafetyRule>(`/safety/rules/${ruleId}`, {
    method: "PUT",
    body: JSON.stringify(req),
  });
}

export async function deleteSafetyRule(ruleId: string): Promise<{ success: boolean }> {
  return apiFetch(`/safety/rules/${ruleId}`, { method: "DELETE" });
}

export async function enableSafetyRule(ruleId: string): Promise<{ success: boolean }> {
  return apiFetch(`/safety/rules/${ruleId}/enable`, { method: "POST" });
}

export async function disableSafetyRule(ruleId: string): Promise<{ success: boolean }> {
  return apiFetch(`/safety/rules/${ruleId}/disable`, { method: "POST" });
}

export async function getDeviceSafetyStatus(deviceId: string): Promise<DeviceSafetyStatus> {
  return apiFetch<DeviceSafetyStatus>(`/safety/devices/${deviceId}`);
}

export async function listDeviceSafetyStatuses(): Promise<DeviceSafetyStatus[]> {
  return apiFetch<DeviceSafetyStatus[]>(`/safety/devices`);
}

export async function emergencyStop(req: EmergencyStopRequest): Promise<EmergencyStopResponse> {
  return apiFetch<EmergencyStopResponse>(`/safety/emergency-stop`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function releaseEmergencyStop(
  req: ReleaseEmergencyStopRequest
): Promise<{ success: boolean; releasedDeviceCount: number }> {
  return apiFetch(`/safety/emergency-stop/release`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function listSafetyEvents(req: ListSafetyEventsRequest = {}): Promise<{ events: SafetyEvent[]; total: number }> {
  const params = new URLSearchParams(req as Record<string, string>).toString();
  return apiFetch(`/safety/events${params ? `?${params}` : ""}`);
}

export async function getSafetyEvent(eventId: string): Promise<SafetyEvent> {
  return apiFetch<SafetyEvent>(`/safety/events/${eventId}`);
}

// ============================================================
// Audit endpoints — mirrors API/audit.ts exactly
// ============================================================

import type {
  AuditQuery,
  AuditQueryResponse,
  AuditRecord,
  AuditExportRequest,
  AuditExportResponse,
  ComplianceReportRequest,
  ComplianceReport,
} from "../../API/audit";

export async function queryAuditLog(query: AuditQuery = {}): Promise<AuditQueryResponse> {
  const params = new URLSearchParams(query as Record<string, string>).toString();
  return apiFetch<AuditQueryResponse>(`/audit/events${params ? `?${params}` : ""}`);
}

export async function getAuditRecord(auditId: string): Promise<AuditRecord> {
  return apiFetch<AuditRecord>(`/audit/events/${auditId}`);
}

export async function exportAuditLog(req: AuditExportRequest): Promise<AuditExportResponse> {
  return apiFetch<AuditExportResponse>(`/audit/export`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function getExportStatus(exportId: string): Promise<AuditExportResponse> {
  return apiFetch<AuditExportResponse>(`/audit/export/${exportId}`);
}

export async function generateComplianceReport(req: ComplianceReportRequest): Promise<ComplianceReport> {
  return apiFetch<ComplianceReport>(`/audit/compliance-report`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function listComplianceReports(orgId?: string): Promise<ComplianceReport[]> {
  return apiFetch<ComplianceReport[]>(`/audit/compliance-report${orgId ? `?orgId=${orgId}` : ""}`);
}

export async function getDeviceAuditTrail(deviceId: string): Promise<AuditRecord[]> {
  return apiFetch<AuditRecord[]>(`/audit/devices/${deviceId}`);
}

export async function getAccountAuditTrail(accountId: string): Promise<AuditRecord[]> {
  return apiFetch<AuditRecord[]>(`/audit/accounts/${accountId}`);
}

export async function getOrgAuditTrail(orgId: string): Promise<AuditRecord[]> {
  return apiFetch<AuditRecord[]>(`/audit/orgs/${orgId}`);
}

// ============================================================
// Discovery & Pairing endpoints — mirrors API/discovery.ts exactly
// ============================================================

import type {
  StartDiscoveryRequest,
  StartDiscoveryResponse,
  ListDiscoveredDevicesRequest,
  ListDiscoveredDevicesResponse,
  VerifyDiscoveredDeviceRequest,
  VerifyDiscoveredDeviceResponse,
  InitiatePairingRequest,
  InitiatePairingResponse,
  CompletePairingRequest,
  CompletePairingResponse,
  UnpairDeviceRequest,
  UnpairDeviceResponse,
  PairingSession,
} from "../../API/discovery";

export async function startDiscovery(req: StartDiscoveryRequest): Promise<StartDiscoveryResponse> {
  return apiFetch<StartDiscoveryResponse>(`/discovery/start`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function stopDiscovery(discoveryJobId: string): Promise<{ success: boolean }> {
  return apiFetch(`/discovery/${discoveryJobId}/stop`, { method: "POST" });
}

export async function listDiscoveredDevices(req: ListDiscoveredDevicesRequest = {}): Promise<ListDiscoveredDevicesResponse> {
  const params = new URLSearchParams(req as Record<string, string>).toString();
  return apiFetch<ListDiscoveredDevicesResponse>(`/discovery/devices${params ? `?${params}` : ""}`);
}

export async function getDiscoveredDevice(discoveryId: string): Promise<import("../../API/discovery").DiscoveredDevice> {
  return apiFetch(`/discovery/devices/${discoveryId}`);
}

export async function verifyDiscoveredDevice(req: VerifyDiscoveredDeviceRequest): Promise<VerifyDiscoveredDeviceResponse> {
  return apiFetch<VerifyDiscoveredDeviceResponse>(`/discovery/devices/${req.discoveryId}/verify`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function dismissDiscoveredDevice(discoveryId: string): Promise<{ success: boolean }> {
  return apiFetch(`/discovery/devices/${discoveryId}`, { method: "DELETE" });
}

export async function initiatePairing(req: InitiatePairingRequest): Promise<InitiatePairingResponse> {
  return apiFetch<InitiatePairingResponse>(`/pairing/initiate`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function getPairingStatus(pairingSessionId: string): Promise<PairingSession> {
  return apiFetch<PairingSession>(`/pairing/${pairingSessionId}`);
}

export async function completePairing(req: CompletePairingRequest): Promise<CompletePairingResponse> {
  return apiFetch<CompletePairingResponse>(`/pairing/${req.pairingSessionId}/complete`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function cancelPairing(pairingSessionId: string): Promise<{ success: boolean }> {
  return apiFetch(`/pairing/${pairingSessionId}/cancel`, { method: "POST" });
}

export async function unpairDevice(req: UnpairDeviceRequest): Promise<UnpairDeviceResponse> {
  return apiFetch<UnpairDeviceResponse>(`/devices/${req.deviceId}/unpair`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function repairDevice(deviceId: string): Promise<{ success: boolean }> {
  return apiFetch(`/devices/${deviceId}/repair`, { method: "POST" });
}

// ============================================================
// Gateway endpoints — mirrors API/gateway.ts exactly
// ============================================================

import type {
  RegisterGatewayRequest,
  RegisterGatewayResponse,
  UpdateGatewayRequest,
  GatewayStatusResponse,
  UpdateGatewayFirmwareRequest,
  LocalCommandRequest,
  SyncQueueResponse,
  GatewaySyncRequest,
  GatewaySyncResponse,
  OfflinePolicyConfig,
  KSVGateway,
} from "../../API/gateway";

export async function registerGateway(req: RegisterGatewayRequest): Promise<RegisterGatewayResponse> {
  return apiFetch<RegisterGatewayResponse>(`/gateways`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function listGateways(orgId?: string): Promise<KSVGateway[]> {
  return apiFetch<KSVGateway[]>(`/gateways${orgId ? `?orgId=${orgId}` : ""}`);
}

export async function getGateway(gatewayId: string): Promise<KSVGateway> {
  return apiFetch<KSVGateway>(`/gateways/${gatewayId}`);
}

export async function updateGateway(gatewayId: string, req: UpdateGatewayRequest): Promise<KSVGateway> {
  return apiFetch<KSVGateway>(`/gateways/${gatewayId}`, {
    method: "PUT",
    body: JSON.stringify(req),
  });
}

export async function deleteGateway(gatewayId: string): Promise<{ success: boolean }> {
  return apiFetch(`/gateways/${gatewayId}`, { method: "DELETE" });
}

export async function getGatewayStatus(gatewayId: string): Promise<GatewayStatusResponse> {
  return apiFetch<GatewayStatusResponse>(`/gateways/${gatewayId}/status`);
}

export async function syncGateway(req: GatewaySyncRequest): Promise<GatewaySyncResponse> {
  return apiFetch<GatewaySyncResponse>(`/gateways/${req.gatewayId}/sync`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function getSyncQueue(gatewayId: string): Promise<SyncQueueResponse> {
  return apiFetch<SyncQueueResponse>(`/gateways/${gatewayId}/sync/queue`);
}

export async function sendLocalCommand(req: LocalCommandRequest): Promise<{ commandId: string; queued: boolean }> {
  return apiFetch(`/gateways/${req.gatewayId}/command`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function updateGatewayFirmware(req: UpdateGatewayFirmwareRequest): Promise<{ success: boolean; jobId: string }> {
  return apiFetch(`/gateways/${req.gatewayId}/firmware/update`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function getOfflinePolicy(gatewayId: string): Promise<OfflinePolicyConfig> {
  return apiFetch<OfflinePolicyConfig>(`/gateways/${gatewayId}/offline-policy`);
}

export async function updateOfflinePolicy(gatewayId: string, req: OfflinePolicyConfig): Promise<{ success: boolean }> {
  return apiFetch(`/gateways/${gatewayId}/offline-policy`, {
    method: "PUT",
    body: JSON.stringify(req),
  });
}

export async function listGatewayDevices(gatewayId: string): Promise<{ devices: unknown[] }> {
  return apiFetch(`/gateways/${gatewayId}/devices`);
}

// ============================================================
// Protocol endpoints — mirrors API/protocol.ts exactly
// ============================================================

import type {
  ListAdaptersResponse,
  GetConnectionsRequest,
  GetConnectionsResponse,
  TestConnectionRequest,
  TestConnectionResponse,
  ListManufacturersResponse,
  ProtocolAdapter,
  ProtocolConnection,
  ManufacturerProfile,
  DeviceProtocol,
} from "../../API/protocol";

export async function listProtocolAdapters(): Promise<ListAdaptersResponse> {
  return apiFetch<ListAdaptersResponse>(`/protocols/adapters`);
}

export async function getProtocolAdapter(adapterId: string): Promise<ProtocolAdapter> {
  return apiFetch<ProtocolAdapter>(`/protocols/adapters/${adapterId}`);
}

export async function listProtocolConnections(req: GetConnectionsRequest = {}): Promise<GetConnectionsResponse> {
  const params = new URLSearchParams(req as Record<string, string>).toString();
  return apiFetch<GetConnectionsResponse>(`/protocols/connections${params ? `?${params}` : ""}`);
}

export async function getProtocolConnection(connectionId: string): Promise<ProtocolConnection> {
  return apiFetch<ProtocolConnection>(`/protocols/connections/${connectionId}`);
}

export async function testProtocolConnection(req: TestConnectionRequest): Promise<TestConnectionResponse> {
  return apiFetch<TestConnectionResponse>(`/protocols/connections/test`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function disconnectProtocol(connectionId: string): Promise<{ success: boolean }> {
  return apiFetch(`/protocols/connections/${connectionId}/disconnect`, { method: "POST" });
}

export async function reconnectProtocol(connectionId: string): Promise<{ success: boolean; connectionId: string }> {
  return apiFetch(`/protocols/connections/${connectionId}/reconnect`, { method: "POST" });
}

export async function listManufacturers(): Promise<ListManufacturersResponse> {
  return apiFetch<ListManufacturersResponse>(`/protocols/manufacturers`);
}

export async function getManufacturer(manufacturerId: string): Promise<ManufacturerProfile> {
  return apiFetch<ManufacturerProfile>(`/protocols/manufacturers/${manufacturerId}`);
}

export async function getProtocolConfig(protocol: DeviceProtocol, deviceId: string): Promise<unknown> {
  return apiFetch(`/protocols/${protocol}/config/${deviceId}`);
}

export async function updateProtocolConfig(protocol: DeviceProtocol, deviceId: string, config: unknown): Promise<{ success: boolean }> {
  return apiFetch(`/protocols/${protocol}/config/${deviceId}`, {
    method: "PUT",
    body: JSON.stringify(config),
  });
}

// ============================================================
// Organization endpoints — mirrors API/organization.ts exactly
// ============================================================

import type {
  CreateOrgRequest,
  UpdateOrgRequest,
  CreateSiteRequest,
  CreateBuildingRequest,
  CreateRoomRequest,
  InviteMemberRequest,
  InviteMemberResponse,
  UpdateMemberRoleRequest,
  RemoveMemberRequest,
  KSVOrganization,
  KSVSite,
  KSVBuilding,
  KSVRoom,
  KSVOrgMember,
} from "../../API/organization";

export async function createOrg(req: CreateOrgRequest): Promise<KSVOrganization> {
  return apiFetch<KSVOrganization>(`/orgs`, { method: "POST", body: JSON.stringify(req) });
}

export async function listMyOrgs(): Promise<KSVOrganization[]> {
  return apiFetch<KSVOrganization[]>(`/orgs`);
}

export async function getOrg(orgId: string): Promise<KSVOrganization> {
  return apiFetch<KSVOrganization>(`/orgs/${orgId}`);
}

export async function updateOrg(orgId: string, req: UpdateOrgRequest): Promise<KSVOrganization> {
  return apiFetch<KSVOrganization>(`/orgs/${orgId}`, { method: "PUT", body: JSON.stringify(req) });
}

export async function deleteOrg(orgId: string, confirmPhrase: string): Promise<{ success: boolean }> {
  return apiFetch(`/orgs/${orgId}`, { method: "DELETE", body: JSON.stringify({ confirmPhrase }) });
}

export async function createSite(orgId: string, req: CreateSiteRequest): Promise<KSVSite> {
  return apiFetch<KSVSite>(`/orgs/${orgId}/sites`, { method: "POST", body: JSON.stringify(req) });
}

export async function listSites(orgId: string): Promise<KSVSite[]> {
  return apiFetch<KSVSite[]>(`/orgs/${orgId}/sites`);
}

export async function getSite(orgId: string, siteId: string): Promise<KSVSite> {
  return apiFetch<KSVSite>(`/orgs/${orgId}/sites/${siteId}`);
}

export async function updateSite(orgId: string, siteId: string, req: CreateSiteRequest): Promise<KSVSite> {
  return apiFetch<KSVSite>(`/orgs/${orgId}/sites/${siteId}`, { method: "PUT", body: JSON.stringify(req) });
}

export async function deleteSite(orgId: string, siteId: string): Promise<{ success: boolean }> {
  return apiFetch(`/orgs/${orgId}/sites/${siteId}`, { method: "DELETE" });
}

export async function createBuilding(orgId: string, siteId: string, req: CreateBuildingRequest): Promise<KSVBuilding> {
  return apiFetch<KSVBuilding>(`/orgs/${orgId}/sites/${siteId}/buildings`, { method: "POST", body: JSON.stringify(req) });
}

export async function listBuildings(orgId: string, siteId: string): Promise<KSVBuilding[]> {
  return apiFetch<KSVBuilding[]>(`/orgs/${orgId}/sites/${siteId}/buildings`);
}

export async function updateBuilding(orgId: string, siteId: string, buildingId: string, req: CreateBuildingRequest): Promise<KSVBuilding> {
  return apiFetch<KSVBuilding>(`/orgs/${orgId}/sites/${siteId}/buildings/${buildingId}`, { method: "PUT", body: JSON.stringify(req) });
}

export async function deleteBuilding(orgId: string, siteId: string, buildingId: string): Promise<{ success: boolean }> {
  return apiFetch(`/orgs/${orgId}/sites/${siteId}/buildings/${buildingId}`, { method: "DELETE" });
}

export async function createRoom(orgId: string, siteId: string, buildingId: string, req: CreateRoomRequest): Promise<KSVRoom> {
  return apiFetch<KSVRoom>(`/orgs/${orgId}/sites/${siteId}/buildings/${buildingId}/rooms`, { method: "POST", body: JSON.stringify(req) });
}

export async function listRooms(orgId: string, siteId: string, buildingId: string): Promise<KSVRoom[]> {
  return apiFetch<KSVRoom[]>(`/orgs/${orgId}/sites/${siteId}/buildings/${buildingId}/rooms`);
}

export async function updateRoom(orgId: string, siteId: string, buildingId: string, roomId: string, req: CreateRoomRequest): Promise<KSVRoom> {
  return apiFetch<KSVRoom>(`/orgs/${orgId}/sites/${siteId}/buildings/${buildingId}/rooms/${roomId}`, { method: "PUT", body: JSON.stringify(req) });
}

export async function deleteRoom(orgId: string, siteId: string, buildingId: string, roomId: string): Promise<{ success: boolean }> {
  return apiFetch(`/orgs/${orgId}/sites/${siteId}/buildings/${buildingId}/rooms/${roomId}`, { method: "DELETE" });
}

export async function inviteMember(orgId: string, req: InviteMemberRequest): Promise<InviteMemberResponse> {
  return apiFetch<InviteMemberResponse>(`/orgs/${orgId}/members/invite`, { method: "POST", body: JSON.stringify(req) });
}

export async function listMembers(orgId: string): Promise<KSVOrgMember[]> {
  return apiFetch<KSVOrgMember[]>(`/orgs/${orgId}/members`);
}

export async function getMember(orgId: string, memberId: string): Promise<KSVOrgMember> {
  return apiFetch<KSVOrgMember>(`/orgs/${orgId}/members/${memberId}`);
}

export async function updateMemberRole(orgId: string, req: UpdateMemberRoleRequest): Promise<KSVOrgMember> {
  return apiFetch<KSVOrgMember>(`/orgs/${orgId}/members/${req.memberId}/role`, { method: "PUT", body: JSON.stringify(req) });
}

export async function removeMember(orgId: string, req: RemoveMemberRequest): Promise<{ success: boolean }> {
  return apiFetch(`/orgs/${orgId}/members/${req.memberId}`, { method: "DELETE", body: JSON.stringify(req) });
}

// ============================================================
// Security endpoints — mirrors API/security.ts exactly
// ============================================================

import type {
  CreateKeyRequest,
  CreateKeyResponse,
  ListKeysRequest,
  ListKeysResponse,
  RotateKeyRequest,
  RevokeKeyRequest,
  EncryptDataRequest,
  EncryptDataResponse,
  DecryptDataRequest,
  ListThreatsRequest,
  MarkFalsePositiveRequest,
  CreateIncidentRequest,
  TakeIncidentActionRequest,
  ManagedKey,
  ThreatDetection,
  SecurityIncident,
  IncidentStatus,
  IncidentAction,
} from "../../API/security";

export async function createSecurityKey(req: CreateKeyRequest): Promise<CreateKeyResponse> {
  return apiFetch<CreateKeyResponse>(`/security/keys`, { method: "POST", body: JSON.stringify(req) });
}

export async function listSecurityKeys(req: ListKeysRequest = {}): Promise<ListKeysResponse> {
  const params = new URLSearchParams(req as Record<string, string>).toString();
  return apiFetch<ListKeysResponse>(`/security/keys${params ? `?${params}` : ""}`);
}

export async function getKeyMetadata(keyId: string): Promise<ManagedKey> {
  return apiFetch<ManagedKey>(`/security/keys/${keyId}`);
}

export async function rotateKey(req: RotateKeyRequest): Promise<{ success: boolean; newKeyId: string }> {
  return apiFetch(`/security/keys/${req.keyId}/rotate`, { method: "POST", body: JSON.stringify(req) });
}

export async function revokeKey(req: RevokeKeyRequest): Promise<{ success: boolean; affectedCount: number }> {
  return apiFetch(`/security/keys/${req.keyId}/revoke`, { method: "POST", body: JSON.stringify(req) });
}

export async function encryptData(req: EncryptDataRequest): Promise<EncryptDataResponse> {
  return apiFetch<EncryptDataResponse>(`/security/encrypt`, { method: "POST", body: JSON.stringify(req) });
}

export async function decryptData(req: DecryptDataRequest): Promise<{ plaintext: string }> {
  return apiFetch(`/security/decrypt`, { method: "POST", body: JSON.stringify(req) });
}

export async function listThreats(req: ListThreatsRequest = {}): Promise<{ threats: ThreatDetection[]; total: number }> {
  const params = new URLSearchParams(req as Record<string, string>).toString();
  return apiFetch(`/security/threats${params ? `?${params}` : ""}`);
}

export async function getThreat(detectionId: string): Promise<ThreatDetection> {
  return apiFetch<ThreatDetection>(`/security/threats/${detectionId}`);
}

export async function markFalsePositive(req: MarkFalsePositiveRequest): Promise<{ success: boolean }> {
  return apiFetch(`/security/threats/${req.detectionId}/false-positive`, { method: "POST", body: JSON.stringify(req) });
}

export async function createIncident(req: CreateIncidentRequest): Promise<SecurityIncident> {
  return apiFetch<SecurityIncident>(`/security/incidents`, { method: "POST", body: JSON.stringify(req) });
}

export async function listIncidents(status?: IncidentStatus): Promise<SecurityIncident[]> {
  return apiFetch<SecurityIncident[]>(`/security/incidents${status ? `?status=${status}` : ""}`);
}

export async function getIncident(incidentId: string): Promise<SecurityIncident> {
  return apiFetch<SecurityIncident>(`/security/incidents/${incidentId}`);
}

export async function takeIncidentAction(req: TakeIncidentActionRequest): Promise<IncidentAction> {
  return apiFetch<IncidentAction>(`/security/incidents/${req.incidentId}/actions`, { method: "POST", body: JSON.stringify(req) });
}

export async function resolveIncident(incidentId: string, summary: string): Promise<{ success: boolean }> {
  return apiFetch(`/security/incidents/${incidentId}/resolve`, { method: "POST", body: JSON.stringify({ summary }) });
}

export async function getRateLimitStatus(accountId: string): Promise<{ remaining: number; resetAt: string; limit: number }> {
  return apiFetch(`/security/rate-limit/${accountId}`);
}

// ============================================================
// Notification endpoints — mirrors API/notification.ts exactly
// ============================================================

import type {
  SendNotificationRequest,
  SendBulkNotificationRequest,
  SendBulkNotificationResponse,
  ListNotificationsRequest,
  ListNotificationsResponse,
  MarkReadRequest,
  MarkAllReadRequest,
  UpdatePreferencesRequest,
  RegisterPushTokenRequest,
  KSVNotification,
  NotificationPreferences,
  PushDeviceToken,
} from "../../API/notification";

export async function sendNotification(req: SendNotificationRequest): Promise<{ notificationId: string; queued: boolean }> {
  return apiFetch(`/notifications/send`, { method: "POST", body: JSON.stringify(req) });
}

export async function sendBulkNotification(req: SendBulkNotificationRequest): Promise<SendBulkNotificationResponse> {
  return apiFetch<SendBulkNotificationResponse>(`/notifications/send-bulk`, { method: "POST", body: JSON.stringify(req) });
}

export async function listNotifications(req: ListNotificationsRequest = {}): Promise<ListNotificationsResponse> {
  const params = new URLSearchParams(req as Record<string, string>).toString();
  return apiFetch<ListNotificationsResponse>(`/notifications${params ? `?${params}` : ""}`);
}

export async function getNotification(notificationId: string): Promise<KSVNotification> {
  return apiFetch<KSVNotification>(`/notifications/${notificationId}`);
}

export async function markNotificationRead(req: MarkReadRequest): Promise<{ success: boolean }> {
  return apiFetch(`/notifications/${req.notificationId}/read`, { method: "POST" });
}

export async function markAllNotificationsRead(req: MarkAllReadRequest = {}): Promise<{ success: boolean; markedCount: number }> {
  return apiFetch(`/notifications/read-all`, { method: "POST", body: JSON.stringify(req) });
}

export async function deleteNotification(notificationId: string): Promise<{ success: boolean }> {
  return apiFetch(`/notifications/${notificationId}`, { method: "DELETE" });
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  return apiFetch<NotificationPreferences>(`/notifications/preferences`);
}

export async function updateNotificationPreferences(req: UpdatePreferencesRequest): Promise<NotificationPreferences> {
  return apiFetch<NotificationPreferences>(`/notifications/preferences`, { method: "PUT", body: JSON.stringify(req) });
}

export async function registerPushToken(req: RegisterPushTokenRequest): Promise<PushDeviceToken> {
  return apiFetch<PushDeviceToken>(`/notifications/push-tokens`, { method: "POST", body: JSON.stringify(req) });
}

export async function listPushTokens(): Promise<PushDeviceToken[]> {
  return apiFetch<PushDeviceToken[]>(`/notifications/push-tokens`);
}

export async function removePushToken(tokenId: string): Promise<{ success: boolean }> {
  return apiFetch(`/notifications/push-tokens/${tokenId}`, { method: "DELETE" });
}

// ============================================================
// Automation endpoints — mirrors API/automation.ts exactly
// ============================================================

import type {
  CreateRuleRequest,
  UpdateRuleRequest,
  TestRuleRequest,
  TestRuleResponse,
  CreateSceneRequest,
  ActivateSceneRequest,
  ListAutomationLogsRequest,
  AutomationRule,
  AutomationScene,
  AutomationLog,
} from "../../API/automation";

export async function createAutomationRule(req: CreateRuleRequest): Promise<AutomationRule> {
  return apiFetch<AutomationRule>(`/automation/rules`, { method: "POST", body: JSON.stringify(req) });
}

export async function listAutomationRules(orgId?: string): Promise<AutomationRule[]> {
  return apiFetch<AutomationRule[]>(`/automation/rules${orgId ? `?orgId=${orgId}` : ""}`);
}

export async function getAutomationRule(ruleId: string): Promise<AutomationRule> {
  return apiFetch<AutomationRule>(`/automation/rules/${ruleId}`);
}

export async function updateAutomationRule(ruleId: string, req: UpdateRuleRequest): Promise<AutomationRule> {
  return apiFetch<AutomationRule>(`/automation/rules/${ruleId}`, { method: "PUT", body: JSON.stringify(req) });
}

export async function deleteAutomationRule(ruleId: string): Promise<{ success: boolean }> {
  return apiFetch(`/automation/rules/${ruleId}`, { method: "DELETE" });
}

export async function enableAutomationRule(ruleId: string): Promise<{ success: boolean }> {
  return apiFetch(`/automation/rules/${ruleId}/enable`, { method: "POST" });
}

export async function disableAutomationRule(ruleId: string): Promise<{ success: boolean }> {
  return apiFetch(`/automation/rules/${ruleId}/disable`, { method: "POST" });
}

export async function testAutomationRule(req: TestRuleRequest): Promise<TestRuleResponse> {
  return apiFetch<TestRuleResponse>(`/automation/rules/${req.ruleId}/test`, { method: "POST", body: JSON.stringify(req) });
}

export async function createScene(req: CreateSceneRequest): Promise<AutomationScene> {
  return apiFetch<AutomationScene>(`/automation/scenes`, { method: "POST", body: JSON.stringify(req) });
}

export async function listScenes(orgId?: string): Promise<AutomationScene[]> {
  return apiFetch<AutomationScene[]>(`/automation/scenes${orgId ? `?orgId=${orgId}` : ""}`);
}

export async function getScene(sceneId: string): Promise<AutomationScene> {
  return apiFetch<AutomationScene>(`/automation/scenes/${sceneId}`);
}

export async function updateScene(sceneId: string, req: CreateSceneRequest): Promise<AutomationScene> {
  return apiFetch<AutomationScene>(`/automation/scenes/${sceneId}`, { method: "PUT", body: JSON.stringify(req) });
}

export async function deleteScene(sceneId: string): Promise<{ success: boolean }> {
  return apiFetch(`/automation/scenes/${sceneId}`, { method: "DELETE" });
}

export async function activateScene(req: ActivateSceneRequest): Promise<{ success: boolean; commandsIssued: number }> {
  return apiFetch(`/automation/scenes/${req.sceneId}/activate`, { method: "POST", body: JSON.stringify(req) });
}

export async function listAutomationLogs(req: ListAutomationLogsRequest = {}): Promise<{ logs: AutomationLog[]; total: number }> {
  const params = new URLSearchParams(req as Record<string, string>).toString();
  return apiFetch(`/automation/logs${params ? `?${params}` : ""}`);
}

export async function getAutomationLog(logId: string): Promise<AutomationLog> {
  return apiFetch<AutomationLog>(`/automation/logs/${logId}`);
}

// ============================================================
// Account Recovery endpoints — mirrors API/account-recovery.ts exactly
// ============================================================

import type {
  InitiateRecoveryRequest,
  InitiateRecoveryResponse,
  ResendOTPRequest,
  ResendOTPResponse,
  VerifyRecoveryOTPRequest,
  VerifyRecoveryOTPResponse,
  VerifyRecoveryOAuthRequest,
  UseBackupCodeRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
  CancelRecoveryRequest,
  GenerateBackupCodesResponse,
  BackupCodeStatusResponse,
} from "../../API/account-recovery";

export async function initiateRecovery(req: InitiateRecoveryRequest): Promise<InitiateRecoveryResponse> {
  return apiFetch<InitiateRecoveryResponse>(`/recovery/initiate`, { method: "POST", body: JSON.stringify(req) });
}

export async function resendRecoveryOTP(req: ResendOTPRequest): Promise<ResendOTPResponse> {
  return apiFetch<ResendOTPResponse>(`/recovery/otp/resend`, { method: "POST", body: JSON.stringify(req) });
}

export async function verifyRecoveryOTP(req: VerifyRecoveryOTPRequest): Promise<VerifyRecoveryOTPResponse> {
  return apiFetch<VerifyRecoveryOTPResponse>(`/recovery/otp/verify`, { method: "POST", body: JSON.stringify(req) });
}

export async function verifyRecoveryOAuth(req: VerifyRecoveryOAuthRequest): Promise<VerifyRecoveryOTPResponse> {
  return apiFetch<VerifyRecoveryOTPResponse>(`/recovery/provider/verify`, { method: "POST", body: JSON.stringify(req) });
}

export async function useBackupCode(req: UseBackupCodeRequest): Promise<VerifyRecoveryOTPResponse> {
  return apiFetch<VerifyRecoveryOTPResponse>(`/recovery/backup-code/verify`, { method: "POST", body: JSON.stringify(req) });
}

export async function resetPassword(req: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  return apiFetch<ResetPasswordResponse>(`/recovery/password/reset`, { method: "POST", body: JSON.stringify(req) });
}

export async function cancelRecovery(req: CancelRecoveryRequest): Promise<{ success: boolean }> {
  return apiFetch(`/recovery/cancel`, { method: "POST", body: JSON.stringify(req) });
}

export async function generateBackupCodes(): Promise<GenerateBackupCodesResponse> {
  return apiFetch<GenerateBackupCodesResponse>(`/recovery/backup-codes/generate`, { method: "POST" });
}

export async function getBackupCodeStatus(): Promise<BackupCodeStatusResponse> {
  return apiFetch<BackupCodeStatusResponse>(`/recovery/backup-codes/status`);
}

export async function revokeBackupCodes(): Promise<{ success: boolean }> {
  return apiFetch(`/recovery/backup-codes/revoke`, { method: "POST" });
}

// ============================================================
// International endpoints — mirrors API/international.ts exactly
// ============================================================

import type {
  CountryRecord,
  ResolvedLocaleContext,
} from "../../API/international";

export async function listCountries(): Promise<CountryRecord[]> {
  return apiFetch<CountryRecord[]>(`/international/countries`);
}

export async function getCountry(code: string): Promise<CountryRecord> {
  return apiFetch<CountryRecord>(`/international/countries/${code}`);
}

export async function resolveLocale(input: {
  deviceTimeZone?: string | null;
  headerTimeZone?: string | null;
  countryCode?: string | null;
  languageCode?: string | null;
}): Promise<ResolvedLocaleContext> {
  return apiFetch<ResolvedLocaleContext>(`/international/resolve-locale`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateAccountLocale(req: {
  preferredCountry?: string;
  preferredLanguage?: string;
  preferredTimeZone?: string;
}): Promise<{ success: boolean }> {
  return apiFetch(`/international/account/locale`, {
    method: "PUT",
    body: JSON.stringify(req),
  });
}

// ============================================================
// Administration endpoints — mirrors API/administration.ts exactly
// ============================================================

import type {
  GrantAdminRoleRequest,
  RevokeAdminRoleRequest,
  SuspendAccountAdminRequest,
  SearchAccountsRequest,
  SearchAccountsResponse,
  UpdateFeatureFlagRequest,
  ImpersonateSessionRequest,
  ImpersonateSessionResponse,
  AdminUser,
  SystemHealthReport,
  PlatformStatistics,
  FeatureFlag,
  AdminActionLog,
} from "../../API/administration";

export async function grantAdminRole(req: GrantAdminRoleRequest): Promise<AdminUser> {
  return apiFetch<AdminUser>(`/admin/roles/grant`, { method: "POST", body: JSON.stringify(req) });
}

export async function revokeAdminRole(req: RevokeAdminRoleRequest): Promise<{ success: boolean }> {
  return apiFetch(`/admin/roles/revoke`, { method: "POST", body: JSON.stringify(req) });
}

export async function listAdmins(): Promise<AdminUser[]> {
  return apiFetch<AdminUser[]>(`/admin/roles`);
}

export async function searchAccounts(req: SearchAccountsRequest = {}): Promise<SearchAccountsResponse> {
  const params = new URLSearchParams(req as Record<string, string>).toString();
  return apiFetch<SearchAccountsResponse>(`/admin/accounts/search${params ? `?${params}` : ""}`);
}

export async function getAccountDetail(accountId: string): Promise<SearchAccountsResponse["accounts"][0]> {
  return apiFetch(`/admin/accounts/${accountId}`);
}

export async function suspendAccountAdmin(req: SuspendAccountAdminRequest): Promise<{ success: boolean }> {
  return apiFetch(`/admin/accounts/${req.targetAccountId}/suspend`, { method: "POST", body: JSON.stringify(req) });
}

export async function reinstateAccount(accountId: string, reason: string): Promise<{ success: boolean }> {
  return apiFetch(`/admin/accounts/${accountId}/reinstate`, { method: "POST", body: JSON.stringify({ reason }) });
}

export async function impersonateSession(req: ImpersonateSessionRequest): Promise<ImpersonateSessionResponse> {
  return apiFetch<ImpersonateSessionResponse>(`/admin/accounts/${req.targetAccountId}/impersonate`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function suspendOrganizationAdmin(orgId: string, reason: string): Promise<{ success: boolean }> {
  return apiFetch(`/admin/organizations/${orgId}/suspend`, { method: "POST", body: JSON.stringify({ reason }) });
}

export async function getSystemHealth(): Promise<SystemHealthReport> {
  return apiFetch<SystemHealthReport>(`/admin/system/health`);
}

export async function getPlatformStats(): Promise<PlatformStatistics> {
  return apiFetch<PlatformStatistics>(`/admin/system/stats`);
}

export async function listFeatureFlags(): Promise<FeatureFlag[]> {
  return apiFetch<FeatureFlag[]>(`/admin/feature-flags`);
}

export async function updateFeatureFlag(req: UpdateFeatureFlagRequest): Promise<FeatureFlag> {
  return apiFetch<FeatureFlag>(`/admin/feature-flags/${req.flagKey}`, { method: "PUT", body: JSON.stringify(req) });
}

export async function listAdminActions(fromTime?: string, toTime?: string): Promise<AdminActionLog[]> {
  const params = new URLSearchParams();
  if (fromTime) params.set("fromTime", fromTime);
  if (toTime) params.set("toTime", toTime);
  const qs = params.toString();
  return apiFetch<AdminActionLog[]>(`/admin/actions${qs ? `?${qs}` : ""}`);
}

// ============================================================
// AI Orchestration endpoints — mirrors API/ai-orchestration.ts exactly
// ============================================================

import type {
  AIInterpretationRequest,
  AIInterpretationResult,
  AIConversationSession,
  AIModelProfile,
} from "../../API/ai-orchestration";

export async function interpretCommand(req: AIInterpretationRequest): Promise<AIInterpretationResult> {
  return apiFetch<AIInterpretationResult>(`/ai/interpret`, { method: "POST", body: JSON.stringify(req) });
}

export async function confirmInterpretation(requestId: string, chosenIndex: number): Promise<AIInterpretationResult> {
  return apiFetch<AIInterpretationResult>(`/ai/interpret/confirm`, {
    method: "POST",
    body: JSON.stringify({ requestId, chosenIndex }),
  });
}

export async function getAISession(sessionId: string): Promise<AIConversationSession> {
  return apiFetch<AIConversationSession>(`/ai/sessions/${sessionId}`);
}

export async function deleteAISession(sessionId: string): Promise<{ success: boolean }> {
  return apiFetch(`/ai/sessions/${sessionId}`, { method: "DELETE" });
}

export async function listAIModels(): Promise<AIModelProfile[]> {
  return apiFetch<AIModelProfile[]>(`/ai/models`);
}

export async function toggleAIModel(modelId: string, isEnabled: boolean): Promise<{ success: boolean }> {
  return apiFetch(`/ai/models/${modelId}/enable`, { method: "POST", body: JSON.stringify({ isEnabled }) });
}

export async function getAIUsage(): Promise<unknown> {
  return apiFetch(`/ai/usage`);
}

export async function submitAIFeedback(requestId: string, wasCorrect: boolean, comment?: string): Promise<{ success: boolean }> {
  return apiFetch(`/ai/feedback`, { method: "POST", body: JSON.stringify({ requestId, wasCorrect, comment }) });
}

// ============================================================
// Billing & Subscription endpoints — mirrors API/billing-subscription.ts exactly
// ============================================================

import type {
  SubscriptionPlan,
  OrganizationSubscription,
  Invoice,
  PaymentMethod,
  UsageMeter,
  PlanTier,
} from "../../API/billing-subscription";

export async function listBillingPlans(): Promise<SubscriptionPlan[]> {
  return apiFetch<SubscriptionPlan[]>(`/billing/plans`);
}

export async function createSubscription(planId: string): Promise<OrganizationSubscription> {
  return apiFetch<OrganizationSubscription>(`/billing/subscriptions`, {
    method: "POST",
    body: JSON.stringify({ planId }),
  });
}

export async function updateSubscription(subscriptionId: string, newPlanId: string): Promise<OrganizationSubscription> {
  return apiFetch<OrganizationSubscription>(`/billing/subscriptions/${subscriptionId}`, {
    method: "PUT",
    body: JSON.stringify({ planId: newPlanId }),
  });
}

export async function cancelSubscription(subscriptionId: string): Promise<{ success: boolean }> {
  return apiFetch(`/billing/subscriptions/${subscriptionId}`, { method: "DELETE" });
}

export async function listInvoices(): Promise<Invoice[]> {
  return apiFetch<Invoice[]>(`/billing/invoices`);
}

export async function downloadInvoice(invoiceId: string): Promise<Blob> {
  const token = localStorage.getItem("ksv_access_token");
  const res = await fetch(`${API_BASE}/billing/invoices/${invoiceId}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.blob();
}

export async function addPaymentMethod(type: PaymentMethod["type"], token: string): Promise<PaymentMethod> {
  return apiFetch<PaymentMethod>(`/billing/payment-methods`, {
    method: "POST",
    body: JSON.stringify({ type, token }),
  });
}

export async function removePaymentMethod(methodId: string): Promise<{ success: boolean }> {
  return apiFetch(`/billing/payment-methods/${methodId}`, { method: "DELETE" });
}

export async function getBillingUsage(): Promise<UsageMeter[]> {
  return apiFetch<UsageMeter[]>(`/billing/usage`);
}

// ============================================================
// Analytics & Telemetry endpoints — mirrors API/analytics-telemetry.ts exactly
// ============================================================

import type {
  DeviceTelemetry,
  PlatformMetric,
  MetricAggregation,
  AnomalyDetectionResult,
  AnalyticsDashboard,
} from "../../API/analytics-telemetry";

export async function ingestTelemetry(deviceId: string, metricName: string, value: number, unit: string): Promise<{ success: boolean }> {
  return apiFetch(`/telemetry/ingest`, {
    method: "POST",
    body: JSON.stringify({ deviceId, metricName, value, unit }),
  });
}

export async function getDeviceTelemetryHistory(deviceId: string, limit = 50): Promise<DeviceTelemetry[]> {
  return apiFetch<DeviceTelemetry[]>(`/telemetry/devices/${deviceId}?limit=${limit}`);
}

export async function getPlatformMetrics(): Promise<PlatformMetric[]> {
  return apiFetch<PlatformMetric[]>(`/telemetry/platform`);
}

export async function getMetricAggregate(metricName: string, period: "hourly" | "daily" | "monthly"): Promise<MetricAggregation> {
  return apiFetch<MetricAggregation>(`/telemetry/aggregate?metricName=${metricName}&period=${period}`);
}

export async function getAnomalies(): Promise<AnomalyDetectionResult[]> {
  return apiFetch<AnomalyDetectionResult[]>(`/telemetry/anomalies`);
}

export async function createAnalyticsDashboard(name: string, widgets: AnalyticsDashboard["widgets"]): Promise<AnalyticsDashboard> {
  return apiFetch<AnalyticsDashboard>(`/telemetry/dashboards`, {
    method: "POST",
    body: JSON.stringify({ name, widgets }),
  });
}

export async function getAnalyticsDashboard(dashboardId: string): Promise<AnalyticsDashboard> {
  return apiFetch<AnalyticsDashboard>(`/telemetry/dashboards/${dashboardId}`);
}

// ============================================================
// Push Notification Delivery endpoints — mirrors API/notification-push.ts exactly
// ============================================================

import type {
  PushProvider,
  PushBatchJob,
  DeviceTokenHealth,
  PushPlatform,
} from "../../API/notification-push";

export async function sendPush(deviceTokenId: string, title: string, body: string): Promise<{ success: boolean }> {
  return apiFetch(`/push/send`, { method: "POST", body: JSON.stringify({ deviceTokenId, title, body }) });
}

export async function sendPushBatch(deviceTokenIds: string[], title: string, body: string): Promise<PushBatchJob> {
  return apiFetch<PushBatchJob>(`/push/send-batch`, { method: "POST", body: JSON.stringify({ deviceTokenIds, title, body }) });
}

export async function getPushJob(jobId: string): Promise<PushBatchJob> {
  return apiFetch<PushBatchJob>(`/push/jobs/${jobId}`);
}

export async function configurePushProvider(platform: PushPlatform, credentialsRef: string): Promise<PushProvider> {
  return apiFetch<PushProvider>(`/push/providers`, { method: "POST", body: JSON.stringify({ platform, credentialsRef }) });
}

export async function getTokenHealth(tokenId: string): Promise<DeviceTokenHealth> {
  return apiFetch<DeviceTokenHealth>(`/push/tokens/${tokenId}/health`);
}

export async function cleanupPushTokens(): Promise<{ success: boolean; removedCount: number }> {
  return apiFetch(`/push/tokens/cleanup`, { method: "POST" });
}

// ============================================================
// File & Media Storage endpoints — mirrors API/file-storage.ts exactly
// ============================================================

import type {
  StoredFile,
  UploadSession,
  FileAccessGrant,
  StorageQuota,
  FileCategory,
} from "../../API/file-storage";

export async function initiateUpload(category: FileCategory, sizeBytes: number, ownerType: StoredFile["ownerType"], ownerId: string): Promise<UploadSession> {
  return apiFetch<UploadSession>(`/files/upload/initiate`, {
    method: "POST",
    body: JSON.stringify({ category, sizeBytes, ownerType, ownerId }),
  });
}

export async function completeUpload(uploadId: string, checksum: string): Promise<StoredFile> {
  return apiFetch<StoredFile>(`/files/upload/complete`, {
    method: "POST",
    body: JSON.stringify({ uploadId, checksum }),
  });
}

export async function downloadFile(fileId: string): Promise<Blob> {
  const token = localStorage.getItem("ksv_access_token");
  const res = await fetch(`${API_BASE}/files/${fileId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.blob();
}

export async function deleteFile(fileId: string): Promise<{ success: boolean }> {
  return apiFetch(`/files/${fileId}`, { method: "DELETE" });
}

export async function shareFile(fileId: string, granteeAccountId: string, expiresAt: string): Promise<FileAccessGrant> {
  return apiFetch<FileAccessGrant>(`/files/${fileId}/share`, {
    method: "POST",
    body: JSON.stringify({ granteeAccountId, expiresAt }),
  });
}

export async function getStorageQuota(): Promise<StorageQuota> {
  return apiFetch<StorageQuota>(`/files/storage/quota`);
}
