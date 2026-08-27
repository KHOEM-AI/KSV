// =============================================================
// KSV — Authentication API
// Domain: "Is this really the user?" — Session, MFA, OTP
// =============================================================

export type MFAMethod = 'totp' | 'sms_otp' | 'email_otp' | 'hardware_key';
export type LoginMethod = 'password' | 'google' | 'facebook' | 'tiktok' | 'apple' | 'microsoft';
export type SessionStatus = 'active' | 'expired' | 'revoked';
export type LoginResult = 'success' | 'mfa_required' | 'failed' | 'account_suspended' | 'account_deleted';

// ---------------------------------------------------------------
// Session Types
// ---------------------------------------------------------------

export interface KSVSession {
  sessionId: string;
  accountId: string;
  deviceFingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  expiresAt: string;
  lastActivityAt: string;
  status: SessionStatus;
  mfaVerified: boolean;
  loginMethod: LoginMethod;
  countryCode?: string;
}

export interface KSVToken {
  accessToken: string;          // Short-lived (e.g. 15 minutes)
  refreshToken: string;         // Longer-lived (e.g. 7 days) — stored securely
  expiresIn: number;            // Seconds
  tokenType: 'Bearer';
}

export interface MFAChallenge {
  challengeId: string;
  method: MFAMethod;
  expiresAt: string;
  maskedDestination?: string;   // e.g. "+855 *** *** 123" — never full number
}

// ---------------------------------------------------------------
// Request / Response Shapes
// ---------------------------------------------------------------

export interface PasswordLoginRequest {
  email?: string;
  phone?: string;
  countryCode?: string;
  password: string;             // Sent over TLS; hashed server-side; never stored plain
}

export interface OAuthLoginRequest {
  provider: 'google' | 'facebook' | 'tiktok' | 'apple' | 'microsoft';
  providerToken: string;        // ID token from provider — KSV validates it
  // KSV NEVER receives the external account password
}

export interface LoginResponse {
  result: LoginResult;
  session?: KSVSession;
  token?: KSVToken;
  mfaChallenge?: MFAChallenge;  // Present if MFA is required
  message: string;
}

export interface MFAVerifyRequest {
  challengeId: string;
  code: string;                 // 6-digit OTP or TOTP code
}

export interface MFAVerifyResponse {
  success: boolean;
  token?: KSVToken;
  session?: KSVSession;
  attemptsRemaining?: number;
  message: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: KSVToken;
  session: KSVSession;
}

export interface LogoutRequest {
  sessionId?: string;           // If omitted, logs out current session only
  allSessions?: boolean;        // If true, revokes ALL sessions for this account
}

export interface LogoutResponse {
  success: boolean;
  revokedSessionCount: number;
  message: string;
}

export interface ListSessionsResponse {
  sessions: KSVSession[];
}

export interface RevokeSessionRequest {
  sessionId: string;
}

export interface MFAEnrollRequest {
  method: MFAMethod;
  phoneNumber?: string;         // For SMS OTP
  email?: string;               // For email OTP
}

export interface MFAEnrollResponse {
  success: boolean;
  method: MFAMethod;
  totpSecret?: string;          // Only for TOTP — show QR to user, then discard
  confirmationRequired: boolean;
  message: string;
}

export interface MFAConfirmEnrollRequest {
  method: MFAMethod;
  verificationCode: string;
}

export interface MFADisableRequest {
  method: MFAMethod;
  confirmCode: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  // Both sent over TLS; stored as secure hash only
}

export interface ChangePasswordResponse {
  success: boolean;
  sessionRevoked: boolean;      // Other sessions are revoked after password change
  message: string;
}

// ---------------------------------------------------------------
// Failed Login Tracking (Brute-Force Protection)
// ---------------------------------------------------------------

export interface LoginAttemptRecord {
  attemptId: string;
  accountId?: string;
  ipAddress: string;
  loginMethod: LoginMethod;
  result: 'success' | 'failed' | 'mfa_failed' | 'account_locked';
  attemptedAt: string;
  userAgent?: string;
}

export interface AccountLockStatus {
  isLocked: boolean;
  lockedUntil?: string;
  failedAttempts: number;
  maxAttempts: number;
}

// ---------------------------------------------------------------
// API Route Definitions
// ---------------------------------------------------------------

export const AUTHENTICATION_ROUTES = {
  // Login
  LOGIN_PASSWORD:          'POST /api/v1/auth/login/password',
  LOGIN_OAUTH:             'POST /api/v1/auth/login/oauth',

  // MFA
  MFA_CHALLENGE:           'GET  /api/v1/auth/mfa/challenge/:challengeId',
  MFA_VERIFY:              'POST /api/v1/auth/mfa/verify',
  MFA_ENROLL:              'POST /api/v1/auth/mfa/enroll',
  MFA_CONFIRM_ENROLL:      'POST /api/v1/auth/mfa/enroll/confirm',
  MFA_DISABLE:             'POST /api/v1/auth/mfa/disable',
  MFA_LIST:                'GET  /api/v1/auth/mfa/methods',

  // Tokens
  REFRESH_TOKEN:           'POST /api/v1/auth/token/refresh',

  // Sessions
  LIST_SESSIONS:           'GET  /api/v1/auth/sessions',
  REVOKE_SESSION:          'DELETE /api/v1/auth/sessions/:sessionId',
  LOGOUT:                  'POST /api/v1/auth/logout',

  // Password
  CHANGE_PASSWORD:         'POST /api/v1/auth/password/change',

  // Admin / Security
  LOCK_STATUS:             'GET  /api/v1/auth/lock-status/:accountId',      // Admin only
  UNLOCK_ACCOUNT:          'POST /api/v1/auth/unlock/:accountId',           // Admin only
  ADMIN_REVOKE_ALL:        'POST /api/v1/auth/admin/revoke-all/:accountId', // Admin only
} as const;

// ---------------------------------------------------------------
// Handler Interfaces
// ---------------------------------------------------------------

export interface AuthenticationAPIHandlers {
  /**
   * Authenticate with email/phone + password.
   * Password is verified server-side; never returned or logged.
   */
  loginWithPassword(req: PasswordLoginRequest): Promise<LoginResponse>;

  /**
   * Authenticate via OAuth/OIDC provider token.
   * KSV validates the token with the provider; does not handle external passwords.
   */
  loginWithOAuth(req: OAuthLoginRequest): Promise<LoginResponse>;

  /**
   * Complete MFA challenge after initial login.
   */
  verifyMFA(req: MFAVerifyRequest): Promise<MFAVerifyResponse>;

  /**
   * Exchange refresh token for a new access token.
   */
  refreshToken(req: RefreshTokenRequest): Promise<RefreshTokenResponse>;

  /**
   * Revoke one or all sessions for the current user.
   */
  logout(accountId: string, req: LogoutRequest): Promise<LogoutResponse>;

  /**
   * List all active sessions for the current user.
   */
  listSessions(accountId: string): Promise<ListSessionsResponse>;

  /**
   * Revoke a specific session by ID.
   */
  revokeSession(accountId: string, sessionId: string): Promise<{ success: boolean }>;

  /**
   * Enroll a new MFA method.
   */
  enrollMFA(accountId: string, req: MFAEnrollRequest): Promise<MFAEnrollResponse>;

  /**
   * Confirm MFA enrollment with a verification code.
   */
  confirmMFAEnroll(
    accountId: string,
    req: MFAConfirmEnrollRequest
  ): Promise<{ success: boolean; message: string }>;

  /**
   * Disable an MFA method.
   */
  disableMFA(accountId: string, req: MFADisableRequest): Promise<{ success: boolean }>;

  /**
   * Change the user's password.
   * After a password change, all other sessions are revoked for security.
   */
  changePassword(
    accountId: string,
    req: ChangePasswordRequest
  ): Promise<ChangePasswordResponse>;

  /**
   * Admin: check if an account is locked due to failed attempts.
   */
  getLockStatus(targetAccountId: string): Promise<AccountLockStatus>;

  /**
   * Admin: unlock a locked account.
   */
  unlockAccount(
    targetAccountId: string,
    adminAccountId: string,
    reason: string
  ): Promise<{ success: boolean }>;

  /**
   * Admin: revoke all sessions for an account (emergency use).
   */
  adminRevokeAll(
    targetAccountId: string,
    adminAccountId: string,
    reason: string
  ): Promise<{ revokedCount: number }>;
}

// ---------------------------------------------------------------
// Security Rules
// ---------------------------------------------------------------

export const AUTHENTICATION_SECURITY_RULES = {
  /** Passwords are never stored in plain text. Use bcrypt/argon2. */
  PASSWORDS_HASHED_ONLY: true,

  /** Passwords are never returned in any API response or log. */
  PASSWORDS_NEVER_RETURNED: true,

  /** MFA OTPs expire after this many minutes. */
  OTP_EXPIRY_MINUTES: 10,

  /** OTP codes are single-use. A used code cannot be replayed. */
  OTP_SINGLE_USE: true,

  /** Maximum failed login attempts before temporary lockout. */
  MAX_FAILED_ATTEMPTS: 5,

  /** Lockout duration in minutes after exceeding failed attempts. */
  LOCKOUT_DURATION_MINUTES: 15,

  /** Access tokens expire after this many minutes. */
  ACCESS_TOKEN_EXPIRY_MINUTES: 15,

  /** Refresh tokens expire after this many days. */
  REFRESH_TOKEN_EXPIRY_DAYS: 7,

  /** After a password change, all other sessions are revoked. */
  REVOKE_SESSIONS_ON_PASSWORD_CHANGE: true,

  /** OAuth tokens from providers are validated — never trusted blindly. */
  VALIDATE_OAUTH_TOKENS_WITH_PROVIDER: true,
} as const;

// ---------------------------------------------------------------
// Audit Events
// ---------------------------------------------------------------

export type AuthenticationAuditEvent =
  | 'auth.login.success'
  | 'auth.login.failed'
  | 'auth.login.account_suspended'
  | 'auth.mfa.challenge_issued'
  | 'auth.mfa.verified'
  | 'auth.mfa.failed'
  | 'auth.mfa.enrolled'
  | 'auth.mfa.disabled'
  | 'auth.token.refreshed'
  | 'auth.session.revoked'
  | 'auth.session.all_revoked'
  | 'auth.logout'
  | 'auth.password.changed'
  | 'auth.account.locked'
  | 'auth.account.unlocked'
  | 'auth.admin.emergency_revoke';
