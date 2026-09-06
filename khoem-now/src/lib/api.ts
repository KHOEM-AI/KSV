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
