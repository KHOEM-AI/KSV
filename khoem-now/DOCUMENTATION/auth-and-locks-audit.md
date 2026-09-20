# Authentication & Lock Audit (khoem-now)

Date: 2026-09-20. Read-only inspection. Nothing was changed by this audit.
Only what was actually read is listed as verified. Secrets and .env values were never read or recorded (env var names only).

## 1. Gate order in the app (src/App.tsx)
Provider select / Register -> Login -> AppLockScreen (hold to unlock) -> LocationGate -> FinalLockScreen (pattern, optional face scan) -> app.
Verified: imports/state by grep (lines ~222-274) and the gate section (lines ~256-285) read directly. isUnlocked and finalUnlocked start as false in React state, so a page reload asks for the locks again (the token in localStorage is kept). FinalLockScreen gets userId = getLockUser()?.id, falling back to the text local when there is no user. Forgot pattern (onForgot) calls clearLockSession(), resets the gates and sets isAuthenticated to false, which shows the Login screen again (inferred from the Login branch near line 252).

## 2. Client-side locks
| Lock | Files | What it does | State lives in | Verified |
|---|---|---|---|---|
| Hold to unlock | HoldToUnlock.tsx (used by AppLockScreen, ChangePasswordCard) | Press and hold for N ms. Pure UI gate. ChangePasswordCard default is 10 s | React state | Component read in full |
| Final lock pattern | PatternLock.tsx, FinalLockScreen.tsx, lib/finalLock.ts | 3x3 pad, min 4 dots. PBKDF2-SHA256, 150,000 iterations, per-user salt. 5 wrong tries = 60 s lockout | localStorage `ksv.finalLock.v1.<userId>` | Most of finalLock.ts read (lines ~90-120 not seen) |
| Face scan | lib/finalLock.ts | WebAuthn platform authenticator, userVerification required. Stores only a credential id. The phone decides whether it uses face or fingerprint | localStorage (same key) | Read |
| Face offer skip flag | FinalLockScreen.tsx | Remembers "Skip" so the offer is not repeated | localStorage `ksv.faceOfferSkipped.v1.<userId>` | Read |
| Location gate | LocationGate.tsx | Uses navigator.geolocation.getCurrentPosition and calls onGranted() on success. Only a grep of the file was read. No fetch/api call matched, so it looks like a browser-only check. Denied/failed behavior not seen. Whether POST /api/auth/location is called elsewhere was not checked | React state | Partly (grep only) |
| AppLockScreen | AppLockScreen.tsx | Title KSV Secured. Wraps HoldToUnlock (default hold 10 s, shown at zoom 1.25). Pure UI gate, no server call, no stored state | React state | Read in full |

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
5. CONFIRMED by reading authenticate (auth.middleware.ts lines ~56-100): it only verifies the JWT (signature, expiry, sub and role claims present) and sets req.user from the token. There is no database lookup, no session check and no revocation check. So after logout, session delete or password change, an existing access token stays valid until it expires (default 15 min), and a role change or disabled user only takes effect when the token expires. The refresh route was not read.
6. Two auth implementations exist: server.ts and modules/identity/services/identity.service.ts (both use bcrypt and sign JWTs). Confirm which is live and document or remove the other.
7. Recovery OTP is not delivered in production until an email/SMS provider is configured. In non-production the OTP is printed to the server console.
8. Tokens are kept in localStorage.
9. In-memory rate limiting resets on restart and is not shared across instances.
10. lib/auth.ts isLoggedIn() only checks that an access token exists in localStorage, not that it is valid or unexpired. api.ts, App.tsx, LoginView and RegisterView also read or write ksv_access_token directly instead of going through auth.ts, so the token key is handled in several places.
11. RESOLVED: Forgot pattern calls clearFinalLock(userId), which removes the stored pattern, the failure counter and the face credential id, and then onForgot() (clearSession(), gates reset, Login shown). No lockout loop. It does not call /api/auth/logout, so the server refresh token stays valid until it expires. The face-offer skip flag (sessionStorage) is not cleared but only lasts for the browser session.
12. saveSession() in lib/auth.ts is never called, so ksv_current_user is never written and the Final Lock userId is always `local` (all accounts on one browser share one pattern and one face credential). The refresh token is never stored by the web client, so /api/auth/token/refresh is not used by the web app.

## 7. Not yet inspected
LocationGate (full file, denied/failed permission behavior), LoginView/RegisterView full logic, lib/api.ts token refresh handling, the optional-auth variant in auth.middleware.ts (line ~105 onward) and where it is used, identity.service.ts usage, SMS/email MFA delivery, RBAC files (rbac.policy.ts, authorization.*), finalLock.ts lines ~91-119.
