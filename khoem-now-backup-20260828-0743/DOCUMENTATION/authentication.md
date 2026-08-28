# Authentication

**Domain:** `AUTH/` · **API domain:** Authentication API

## Purpose
Answers: *"Who is currently logging in, and can we trust it's really them?"*

Authentication is separate from Authorization. Authentication proves identity; it does not decide what that identity is allowed to do.

## Responsibilities
- Password-based login
- Secure password hashing (never store or transmit plaintext)
- Multi-factor authentication (MFA)
- Email verification
- Phone verification
- One-time codes (OTP)
- Session management
- Refresh tokens
- Login history
- Failed-login protection / brute-force protection
- Suspicious-login detection
- Device/session revocation

## Password Privacy Rule
No administrator, dashboard, API response, log file, or support tool may ever expose a user's original password. This applies even to KSV's own platform administrators.

## Session Model
- A session is created after successful authentication.
- Sessions are individually revocable — a user or admin can end one session without affecting others.
- Refresh tokens allow session renewal without re-entering credentials, but are themselves revocable and expirable.

## Failure Handling
- Repeated failed attempts trigger rate limiting and eventually temporary lockout.
- Suspicious login patterns (new device, new location, unusual time) should be flagged for step-up verification (MFA) or notification to the user.

## Out of Scope for This Domain
- Deciding *what* an authenticated user can do → see `authorization.md`
- Recovering a forgotten password → see `account-recovery.md`
- Linking external identity providers (Google, Facebook, etc.) → see `identity.md`
