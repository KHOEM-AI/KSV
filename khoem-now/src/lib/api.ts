/**
 * KSV — Frontend API Client
 * Location: khoem-now/src/lib/api.ts
 *
 * The single place the frontend talks to the backend. ControlsView.tsx
 * (and every other view) should import from here instead of using
 * local useState toggles that don't persist or audit anything.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

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
    body: JSON.stringify({ type: input.type, payload: input.payload, signals: input.signals }),
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
