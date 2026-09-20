# Authentication & Lock Audit (khoem-now)

Date: 2026-09-20. Read-only inspection. Nothing was changed by this audit.
Only what was actually read is listed as verified. Secrets and .env values were never read or recorded (env var names only).

## 1. Gate order in the app (src/App.tsx)
Provider select / Register -> Login -> AppLockScreen (hold to unlock) -> LocationGate -> FinalLockScreen (pattern, optional face scan) -> app.
Verified from grep of imports/state (lines ~222-274), not read in full.

## 2. Client-side locks
| Lock | Files | What it does | State lives in | Verified |
|---|---|---|---|---|
| Hold to unlock | HoldToUnlock.tsx (used by AppLockScreen, ChangePasswordCard) | Press and hold for N ms. Pure UI gate. ChangePasswordCard default is 10 s | React state | Component read in full |
| Final lock pattern | PatternLock.tsx, FinalLockScreen.tsx, lib/finalLock.ts | 3x3 pad, min 4 dots. PBKDF2-SHA256, 150,000 iterations, per-user salt. 5 wrong tries = 60 s lockout | localStorage `ksv.finalLock.v1.<userId>` | Most of finalLock.ts read (lines ~90-120 not seen) |
| Face scan | lib/finalLock.ts | WebAuthn platform authenticator, userVerification required. Stores only a credential id. The phone decides whether it uses face or fingerprint | localStorage (same key) | Read |
| Face offer skip flag | FinalLockScreen.tsx | Remembers "Skip" so the offer is not repeated | localStorage `ksv.faceOfferSkipped.v1.<userId>` | Read |
| Location gate | LocationGate.tsx | Not inspected. Server has POST /api/auth/location | unknown | No |
| AppLockScreen | AppLockScreen.tsx | Wraps HoldToUnlock. Rest not inspected | React state | Partly |

Flow of the final lock: face success skips the pattern; face failure/cancel shows the pattern pad. After a correct pattern, if face is supported and not enabled and not skipped, the app offers "Turn on face scan?".

Limits (stated in finalLock.ts header and confirmed in code): these are LOCAL gates. The fail counter and lock timer live in localStorage, so clearing site data resets them. They protect against someone picking up an already logged-in phone. They do not replace server authentication.

## 3. Tokens on the client
src/lib/auth.ts stores access token, refresh token and user object in localStorage. LoginView.tsx and RegisterView.tsx also write `ksv_access_token`. Anything that can run JavaScript on the page (XSS) could read them.

## 4. Server auth endpoints (src/server.ts)
| Route | Protection |
|---|---|
| POST /api/auth/register | authRateLimiter |
| POST /api/auth/login/password | authRateLimiter |
| POST /api/auth/token/refresh | authRateLimiter |
| POST /api/auth/logout | authenticate |
| GET /api/auth/sessions, DELETE /api/auth/sessions/:sessionId | authenticate |
| POST /api/auth/password/change | authenticate only (no rate limiter) |
| POST /api/auth/location | authenticate |
| POST /api/auth/mfa/enroll, /enroll/confirm, /disable | authenticate |
| POST /api/auth/mfa/verify | authRateLimiter |
| POST /api/recovery/initiate, /otp/verify, /password/reset, /cancel | authRateLimiter |

## 5. Verified mechanics
- Password hashing: bcryptjs, cost 12 (register, change, reset, and helper in core/security/encryption.util.ts). No argon2 anywhere in src.
- JWT: access default 15m, refresh default 7d, separate secrets (JWT_ACCESS_SECRET, JWT_REFRESH_SECRET).
- Login: bcrypt.compare. If mfaEnabled, returns mfa_required with a 5-minute challenge. TOTP verified with otplib. TOTP secret saved through encMfa and read with readMfaSecret.
- Register: rejects passwords shorter than 6 and applies letter/number/symbol checks (lines ~715-728, exact rule not read).
- Recovery: OTP stored as an HMAC, attempts limited, expiry enforced, then a one-time 64-char recovery token. Reset deletes all sessions of that user.
- Rate limiter: authRateLimiter = 5 requests per 15 minutes. Store is in memory (resets on server restart). Key function not read.
- authenticate middleware: requires Bearer token, jwt.verify, fails closed with 401.

## 6. Findings (need a decision, nothing fixed yet)
1. Password change does not revoke other sessions (response says sessionRevoked: false), while recovery reset does.
2. Password change does not validate new password strength on the server (UI asks for 12+ characters, register only 6+) and does not reject new == current (UI does).
3. /api/auth/password/change has no rate limiter, only authenticate.
4. Settings UI text mentions Argon2id but the code uses bcrypt. Fix the text or migrate.
5. authenticate appears to check only the JWT. No sessionId/revoked check was found by grep, so an access token may still work after logout until it expires (up to 15 min). Inference, confirm by reading auth.middleware.ts fully.
6. Two auth implementations exist: server.ts and modules/identity/services/identity.service.ts (both use bcrypt and sign JWTs). Confirm which is live and document or remove the other.
7. Recovery OTP is not delivered in production until an email/SMS provider is configured. In non-production the OTP is printed to the server console.
8. Tokens are kept in localStorage.
9. In-memory rate limiting resets on restart and is not shared across instances.

## 7. Not yet inspected
AppLockScreen internals, LocationGate behavior, LoginView/RegisterView logic, lib/auth.ts beyond storage keys, rest of auth.middleware.ts, identity.service.ts usage, SMS/email MFA delivery, RBAC files (rbac.policy.ts, authorization.*), finalLock.ts lines ~90-120.
