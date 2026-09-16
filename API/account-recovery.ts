// =============================================================
// KSV — Account Recovery API
// Domain: Forgot password, OTP, Identity-based recovery
// RULE: Recovery creates a NEW password — never reveals the old one
// =============================================================

export type RecoveryMethod = 'email' | 'phone' | 'identity_provider' | 'backup_code';
export type RecoveryStatus = 'pending' | 'otp_sent' | 'otp_verified' | 'completed' | 'expired' | 'cancelled';

// ---------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------

export interface RecoverySession {
  recoverySessionId: string;
  accountId?: string;           // May be unknown at start
  method: RecoveryMethod;
  status: RecoveryStatus;
  maskedDestination?: string;   // e.g. "k***@gmail.com" or "+855 *** 123"
  initiatedAt: string;
  expiresAt: string;
  attemptsUsed: number;
  maxAttempts: number;
  ipAddress?: string;
}

export interface BackupCode {
  codeIndex: number;
  isUsed: boolean;
  usedAt?: string;
}

// ---------------------------------------------------------------
// Request / Response Shapes
// ---------------------------------------------------------------

export interface InitiateRecoveryRequest {
  method: RecoveryMethod;
  email?: string;
  phone?: string;
  countryCode?: string;
  provider?: 'google' | 'facebook' | 'tiktok' | 'apple';
}

export interface InitiateRecoveryResponse {
  recoverySessionId: string;
  method: RecoveryMethod;
  maskedDestination?: string;
  expiresAt: string;
  message: string;
  // NEVER includes: account ID, any password, any secret
}

export interface VerifyRecoveryOTPRequest {
  recoverySessionId: string;
  otp: string;                  // 6-digit code — single use, time-limited
}

export interface VerifyRecoveryOTPResponse {
  success: boolean;
  recoveryToken?: string;       // Short-lived token to authorize password reset
  attemptsRemaining?: number;
  expiresAt?: string;
  message: string;
}

export interface VerifyRecoveryOAuthRequest {
  recoverySessionId: string;
  provider: string;
  providerToken: string;        // Token from provider — KSV validates with provider
}

export interface ResetPasswordRequest {
  recoveryToken: string;        // From VerifyRecoveryOTPResponse
  newPassword: string;          // Sent over TLS; hashed server-side; never stored plain
  confirmNewPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  allSessionsRevoked: boolean;  // All existing sessions are revoked after reset
  message: string;
  // NEVER reveals old password
}

export interface ResendOTPRequest {
  recoverySessionId: string;
}

export interface ResendOTPResponse {
  success: boolean;
  maskedDestination: string;
  newExpiresAt: string;
  message: string;
}

export interface CancelRecoveryRequest {
  recoverySessionId: string;
}

export interface GenerateBackupCodesResponse {
  codes: string[];              // Show ONCE — user must store them securely
  generatedAt: string;
  totalCodes: number;
}

export interface UseBackupCodeRequest {
  recoverySessionId: string;
  backupCode: string;
}

export interface BackupCodeStatusResponse {
  totalCodes: number;
  usedCodes: number;
  remainingCodes: number;
  codes: BackupCode[];
}

// ---------------------------------------------------------------
// API Route Definitions
// ---------------------------------------------------------------

export const ACCOUNT_RECOVERY_ROUTES = {
  // Recovery initiation
  INITIATE_RECOVERY:       'POST /api/v1/recovery/initiate',
  RESEND_OTP:              'POST /api/v1/recovery/otp/resend',

  // OTP / Provider verification
  VERIFY_OTP:              'POST /api/v1/recovery/otp/verify',
  VERIFY_PROVIDER:         'POST /api/v1/recovery/provider/verify',
  USE_BACKUP_CODE:         'POST /api/v1/recovery/backup-code/verify',

  // Password reset (requires valid recovery token)
  RESET_PASSWORD:          'POST /api/v1/recovery/password/reset',

  // Cancel
  CANCEL_RECOVERY:         'POST /api/v1/recovery/cancel',

  // Backup codes (authenticated user)
  GENERATE_BACKUP_CODES:   'POST /api/v1/recovery/backup-codes/generate',
  BACKUP_CODE_STATUS:      'GET  /api/v1/recovery/backup-codes/status',
  REVOKE_BACKUP_CODES:     'POST /api/v1/recovery/backup-codes/revoke',
} as const;

// ---------------------------------------------------------------
// Handler Interfaces
// ---------------------------------------------------------------

export interface AccountRecoveryAPIHandlers {
  /**
   * Begin recovery flow. Sends OTP to email or phone (masked).
   * Does NOT confirm whether an account exists for that email/phone
   * (prevents account enumeration).
   */
  initiateRecovery(
    req: InitiateRecoveryRequest,
    ipAddress: string
  ): Promise<InitiateRecoveryResponse>;

  /**
   * Re-send OTP for an active recovery session.
   * Subject to rate limiting.
   */
  resendOTP(req: ResendOTPRequest): Promise<ResendOTPResponse>;

  /**
   * Verify a 6-digit OTP code.
   * Code is single-use and time-limited.
   * Returns a short-lived recovery token on success.
   */
  verifyRecoveryOTP(req: VerifyRecoveryOTPRequest): Promise<VerifyRecoveryOTPResponse>;

  /**
   * Verify recovery via an OAuth/OIDC provider token.
   * KSV validates the token with the provider.
   */
  verifyRecoveryOAuth(
    req: VerifyRecoveryOAuthRequest
  ): Promise<VerifyRecoveryOTPResponse>;

  /**
   * Verify recovery using a one-time backup code.
   */
  useBackupCode(req: UseBackupCodeRequest): Promise<VerifyRecoveryOTPResponse>;

  /**
   * Reset the password using a valid recovery token.
   * After reset, ALL existing sessions are revoked.
   * The old password is NEVER returned or logged.
   */
  resetPassword(req: ResetPasswordRequest): Promise<ResetPasswordResponse>;

  /**
   * Cancel an in-progress recovery session.
   */
  cancelRecovery(req: CancelRecoveryRequest): Promise<{ success: boolean }>;

  /**
   * Generate a new set of backup codes (authenticated user only).
   * Previous codes are revoked.
   * Codes are shown ONCE — KSV stores only hashes.
   */
  generateBackupCodes(accountId: string): Promise<GenerateBackupCodesResponse>;

  /**
   * Get the status of backup codes (how many remain).
   * Does NOT return the code values themselves.
   */
  getBackupCodeStatus(accountId: string): Promise<BackupCodeStatusResponse>;

  /**
   * Revoke all backup codes (authenticated user only).
   */
  revokeBackupCodes(accountId: string): Promise<{ success: boolean }>;
}

// ---------------------------------------------------------------
// Security Rules
// ---------------------------------------------------------------

export const ACCOUNT_RECOVERY_SECURITY_RULES = {
  /** OTP codes expire after this many minutes. */
  OTP_EXPIRY_MINUTES: 10,

  /** OTP codes are single-use. */
  OTP_SINGLE_USE: true,

  /** Maximum OTP verification attempts per recovery session. */
  MAX_OTP_ATTEMPTS: 5,

  /** Maximum recovery sessions per IP per hour. */
  RATE_LIMIT_PER_IP_PER_HOUR: 3,

  /** Recovery token (after OTP verified) expires after this many minutes. */
  RECOVERY_TOKEN_EXPIRY_MINUTES: 15,

  /**
   * After password reset, ALL sessions are revoked.
   * This forces re-login on all devices.
   */
  REVOKE_ALL_SESSIONS_AFTER_RESET: true,

  /**
   * The old password is NEVER revealed — not in response, not in logs.
   * Recovery only creates a NEW password.
   */
  OLD_PASSWORD_NEVER_REVEALED: true,

  /**
   * Account existence is NOT confirmed from an email/phone lookup.
   * The API always returns the same response to prevent account enumeration.
   */
  PREVENT_ACCOUNT_ENUMERATION: true,

  /** Backup codes are stored as hashes — plain codes are never saved. */
  BACKUP_CODES_HASHED_ONLY: true,

  /** Number of backup codes generated per set. */
  BACKUP_CODE_COUNT: 10,
} as const;

// ---------------------------------------------------------------
// Audit Events
// ---------------------------------------------------------------

export type AccountRecoveryAuditEvent =
  | 'recovery.initiated'
  | 'recovery.otp_sent'
  | 'recovery.otp_verified'
  | 'recovery.otp_failed'
  | 'recovery.otp_expired'
  | 'recovery.provider_verified'
  | 'recovery.backup_code_used'
  | 'recovery.password_reset'
  | 'recovery.sessions_revoked'
  | 'recovery.cancelled'
  | 'recovery.backup_codes_generated'
  | 'recovery.backup_codes_revoked'
  | 'recovery.rate_limit_exceeded';

