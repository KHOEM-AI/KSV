# Account Recovery

**Domain:** `AUTH/` · **API domain:** Account Recovery API

## Purpose
Lets a user regain access to their account when they've lost their password or lost access to their authentication method — without ever exposing the old credential.

## Supported Recovery Methods
- Verified email
- Verified phone number
- Trusted linked identity provider (Google, Facebook, etc.)
- Multi-factor authentication
- One-time verification code (e.g. 6-digit OTP)

## Rules
- A recovery code must **expire** after a short period.
- A recovery code is **single-use**.
- Recovery attempts are **rate-limited** to prevent brute-force guessing.
- Recovery **always results in a new password being created** — the system never reveals or reuses the old password.
- All active sessions should be revoked after a successful recovery, forcing re-login everywhere.
- High-risk recovery attempts (e.g. from an unrecognized device or location) should require stronger verification before completing.

## Flow
```
User requests recovery
      ↓
Identity verification (email / phone / provider / MFA)
      ↓
One-time code issued (expires, single-use, rate-limited)
      ↓
Code verified
      ↓
New password created
      ↓
All existing sessions revoked
      ↓
User re-authenticates with new password
```

## Related
- `authentication.md` — normal login flow
- `identity.md` — linked identity providers used for verification
- `security.md` — rate limiting and abuse prevention shared services
