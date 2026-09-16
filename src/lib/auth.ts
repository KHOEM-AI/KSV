/**
 * KSV — Auth Helpers
 * Location: khoem-now/src/lib/auth.ts
 *
 * Manages the JWT access token on the frontend — stores it after
 * login, reads it for api.ts, and clears it on logout. Pairs with
 * src/core/auth/auth.middleware.ts on the backend.
 */

const ACCESS_TOKEN_KEY = "ksv_access_token";
const REFRESH_TOKEN_KEY = "ksv_refresh_token";
const USER_KEY = "ksv_current_user";

export interface CurrentUser {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export function saveSession(accessToken: string, refreshToken: string, user: CurrentUser): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getCurrentUser(): CurrentUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return getAccessToken() !== null;
}

export function clearSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Checks whether the current user's role meets a minimum level,
 * mirroring the ROLE_RANK table in rbac.policy.ts. Use this to hide/
 * disable UI elements the user has no permission for — the backend
 * check in rbac.policy.ts is still the real enforcement point.
 */
const ROLE_RANK: Record<string, number> = {
  Guest: 0,
  Viewer: 1,
  Controller: 2,
  Operator: 3,
  Manager: 4,
  OrgAdmin: 5,
  SuperAdmin: 6,
  Owner: 7,
};

export function hasMinRole(minRole: string): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return (ROLE_RANK[user.role] ?? -1) >= (ROLE_RANK[minRole] ?? 0);
}
