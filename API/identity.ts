// =============================================================
// KSV — Identity API
// Domain: Who is this user? One KSV Account → Multiple Identities
// =============================================================

export type IdentityProvider =
  | 'email'
  | 'phone'
  | 'google'
  | 'facebook'
  | 'tiktok'
  | 'apple'
  | 'microsoft'
  | 'custom';

export type AccountStatus = 'active' | 'suspended' | 'deleted' | 'pending_verification';

export type VerificationStatus = 'verified' | 'unverified' | 'pending';

// ---------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------

export interface KSVIdentity {
  identityId: string;
  accountId: string;
  provider: IdentityProvider;
  providerUserId: string;       // ID from the external provider
  email?: string;
  phoneNumber?: string;
  countryCode?: string;
  displayName?: string;
  avatarUrl?: string;
  verificationStatus: VerificationStatus;
  linkedAt: string;             // ISO 8601
  lastUsedAt?: string;
  isPrivate: boolean;           // Provider password is never stored here
}

export interface KSVAccount {
  accountId: string;
  primaryEmail?: string;
  primaryPhone?: string;
  displayName: string;
  avatarUrl?: string;
  status: AccountStatus;
  identities: KSVIdentity[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  preferredLanguage?: string;
  preferredCountry?: string;
  preferredTimeZone?: string;
}

// ---------------------------------------------------------------
// Request / Response Shapes
// ---------------------------------------------------------------

export interface LinkIdentityRequest {
  provider: IdentityProvider;
  providerToken: string;        // OAuth token or verification token from provider
  // KSV NEVER receives the user's external password
}

export interface LinkIdentityResponse {
  success: boolean;
  identity: KSVIdentity;
  message: string;
}

export interface UnlinkIdentityRequest {
  identityId: string;
  confirmAccountId: string;
}

export interface UnlinkIdentityResponse {
  success: boolean;
  removedIdentityId: string;
  remainingIdentities: number;
  message: string;
}

export interface GetAccountResponse {
  account: KSVAccount;
}

export interface UpdateAccountRequest {
  displayName?: string;
  avatarUrl?: string;
  preferredLanguage?: string;
  preferredCountry?: string;
  preferredTimeZone?: string;
}

export interface UpdateAccountResponse {
  success: boolean;
  account: KSVAccount;
}

export interface VerifyIdentityRequest {
  identityId: string;
  verificationCode: string;     // OTP or token
}

export interface VerifyIdentityResponse {
  success: boolean;
  verificationStatus: VerificationStatus;
  message: string;
}

export interface SuspendAccountRequest {
  reason: string;
  adminId: string;
}

export interface DeleteAccountRequest {
  confirmPhrase: string;        // User must type a confirm phrase
  reason?: string;
}

export interface DeleteAccountResponse {
  success: boolean;
  scheduledDeletionAt: string;  // Data is not deleted instantly — grace period
  message: string;
}

// ---------------------------------------------------------------
// API Route Definitions
// ---------------------------------------------------------------

export const IDENTITY_ROUTES = {
  // Account
  GET_ACCOUNT:             'GET  /api/v1/identity/account',
  UPDATE_ACCOUNT:          'PUT  /api/v1/identity/account',
  DELETE_ACCOUNT:          'DELETE /api/v1/identity/account',
  SUSPEND_ACCOUNT:         'POST /api/v1/identity/account/suspend',    // Admin only

  // Linked identities
  LIST_IDENTITIES:         'GET  /api/v1/identity/identities',
  LINK_IDENTITY:           'POST /api/v1/identity/identities/link',
  UNLINK_IDENTITY:         'DELETE /api/v1/identity/identities/:identityId',
  VERIFY_IDENTITY:         'POST /api/v1/identity/identities/:identityId/verify',

  // Lookup (Admin / internal only)
  LOOKUP_BY_EMAIL:         'GET  /api/v1/identity/lookup/email/:email',
  LOOKUP_BY_PHONE:         'GET  /api/v1/identity/lookup/phone/:phone',
  LOOKUP_BY_PROVIDER:      'GET  /api/v1/identity/lookup/provider/:provider/:providerUserId',
} as const;

// ---------------------------------------------------------------
// Handler Interfaces (to be implemented by the backend service)
// ---------------------------------------------------------------

export interface IdentityAPIHandlers {
  /**
   * Returns the full account object for the authenticated user.
   * Never returns passwords or provider secrets.
   */
  getAccount(accountId: string): Promise<GetAccountResponse>;

  /**
   * Updates non-sensitive profile fields.
   */
  updateAccount(
    accountId: string,
    req: UpdateAccountRequest
  ): Promise<UpdateAccountResponse>;

  /**
   * Links a new identity provider to an existing KSV account.
   * Uses OAuth/OIDC — KSV never receives the external password.
   */
  linkIdentity(
    accountId: string,
    req: LinkIdentityRequest
  ): Promise<LinkIdentityResponse>;

  /**
   * Removes an identity provider link.
   * Requires at least one identity to remain — cannot unlink the last one.
   */
  unlinkIdentity(
    accountId: string,
    req: UnlinkIdentityRequest
  ): Promise<UnlinkIdentityResponse>;

  /**
   * Sends / re-sends verification to the identity (email or phone OTP).
   */
  verifyIdentity(
    accountId: string,
    req: VerifyIdentityRequest
  ): Promise<VerifyIdentityResponse>;

  /**
   * Schedules account deletion. Data is retained for a grace period
   * (e.g. 30 days) before permanent removal.
   */
  deleteAccount(
    accountId: string,
    req: DeleteAccountRequest
  ): Promise<DeleteAccountResponse>;

  /**
   * Admin-only: suspends an account.
   * Suspended accounts cannot log in or issue commands.
   */
  suspendAccount(
    targetAccountId: string,
    req: SuspendAccountRequest,
    adminAccountId: string
  ): Promise<{ success: boolean; message: string }>;
}

// ---------------------------------------------------------------
// Security Rules (enforced at every handler)
// ---------------------------------------------------------------

export const IDENTITY_SECURITY_RULES = {
  /**
   * KSV NEVER stores external passwords.
   * Provider authentication uses OAuth 2.0 / OpenID Connect tokens only.
   */
  NO_EXTERNAL_PASSWORD_STORAGE: true,

  /**
   * Admins can suspend or delete accounts but CANNOT read
   * user passwords, external tokens, or linked provider secrets.
   */
  ADMIN_CANNOT_READ_USER_SECRETS: true,

  /**
   * An account must always retain at least one verified identity.
   * Unlinking the last identity is rejected.
   */
  MINIMUM_ONE_VERIFIED_IDENTITY: true,

  /**
   * Account deletion is not immediate.
   * A grace period (e.g. 30 days) allows the user to cancel.
   */
  DELETION_GRACE_PERIOD_DAYS: 30,

  /**
   * Identity verification codes (OTP) expire after this many minutes.
   */
  VERIFICATION_OTP_EXPIRY_MINUTES: 10,
} as const;

// ---------------------------------------------------------------
// Audit Events produced by this domain
// ---------------------------------------------------------------

export type IdentityAuditEvent =
  | 'identity.account.viewed'
  | 'identity.account.updated'
  | 'identity.account.suspended'
  | 'identity.account.deletion_scheduled'
  | 'identity.account.deletion_cancelled'
  | 'identity.provider.linked'
  | 'identity.provider.unlinked'
  | 'identity.provider.verified'
  | 'identity.provider.verification_failed';
