/**
 * KSV - Rate Limiter Middleware
 * Location in project: src/core/security/rate-limiter.ts
 *
 * Purpose (per KSV Security Core, section 20):
 *   Rate limiting, Abuse prevention - one of the defense-in-depth layers.
 *   No single mechanism is sufficient on its own, but this stops the
 *   cheapest and most common attack: brute-forcing logins or hammering
 *   device-command endpoints.
 *
 * This is an in-memory limiter (simple, no extra infra required).
 * NOTE: in-memory means limits reset if the server restarts, and don't
 * share state across multiple server instances. For production at scale
 * behind multiple instances, swap the store for Redis - the interface
 * below (RateLimitStore) is designed so that swap doesn't touch the
 * middleware logic.
 */

import type { Request, Response, NextFunction } from "express";

// ============================================================
// Store abstraction (swap for Redis later without touching callers)
// ============================================================

interface RateLimitRecord {
  count: number;
  resetAt: number; // epoch ms
}

interface RateLimitStore {
  get(key: string): RateLimitRecord | undefined;
  set(key: string, record: RateLimitRecord): void;
}

class InMemoryStore implements RateLimitStore {
  private map = new Map<string, RateLimitRecord>();

  get(key: string): RateLimitRecord | undefined {
    return this.map.get(key);
  }

  set(key: string, record: RateLimitRecord): void {
    this.map.set(key, record);
  }
}

const defaultStore = new InMemoryStore();

// Periodically clear expired entries so the Map doesn't grow forever.
setInterval(() => {
  const now = Date.now();
  // @ts-expect-error - accessing private map for cleanup; fine within this file
  for (const [key, record] of defaultStore["map"].entries()) {
    if (record.resetAt < now) {
      // @ts-expect-error - same as above
      defaultStore["map"].delete(key);
    }
  }
}, 60_000).unref?.(); // unref so this timer never keeps the process alive

// ============================================================
// Config
// ============================================================

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900_000); // 15 min default
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 100);

export interface RateLimiterOptions {
  windowMs?: number;
  max?: number;
  /** Custom key function - defaults to IP address. Use userId for per-user limits. */
  keyFn?: (req: Request) => string;
  message?: string;
  store?: RateLimitStore;
}

// ============================================================
// Middleware factory
// ============================================================

/**
 * General-purpose rate limiter. Usage:
 *   router.use(rateLimiter()); // global default (100 req / 15 min per IP)
 *
 * For sensitive endpoints, use a stricter instance:
 *   router.post("/auth/login", rateLimiter({ windowMs: 15*60*1000, max: 5 }), loginController);
 */
export function rateLimiter(options: RateLimiterOptions = {}) {
  const windowMs = options.windowMs ?? WINDOW_MS;
  const max = options.max ?? MAX_REQUESTS;
  const store = options.store ?? defaultStore;
  const keyFn = options.keyFn ?? ((req: Request) => req.ip ?? "unknown");
  const message = options.message ?? "Too many requests. Please try again later.";

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyFn(req);
    const now = Date.now();
    const existing = store.get(key);

    if (!existing || existing.resetAt < now) {
      // First request in a new window
      store.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (existing.count >= max) {
      const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfterSeconds));
      res.status(429).json({
        error: "RATE_LIMITED",
        message,
        retryAfterSeconds,
      });
      return;
    }

    existing.count += 1;
    store.set(key, existing);
    next();
  };
}

// ============================================================
// Pre-configured limiters for common KSV endpoints
// ============================================================

/**
 * Strict limiter for login/auth endpoints - the highest-value target
 * for brute-force attacks (per section 4: "Failed-login protection,
 * Brute-force protection").
 */
export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: "Too many login attempts. Please try again in 15 minutes.",
});

/**
 * Limiter for OTP request endpoints (account recovery, MFA) - prevents
 * OTP-spam and SMS/email-bombing.
 */
export const otpRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: "Too many verification code requests. Please try again later.",
});

/**
 * Limiter for device command endpoints - prevents a compromised or
 * buggy client from hammering physical devices with commands.
 * Keyed by authenticated user, not IP, since multiple legitimate users
 * may share an office/NAT IP.
 */
export const deviceCommandRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  keyFn: (req: Request) => req.user?.id ?? req.ip ?? "unknown",
  message: "Too many device commands. Please slow down.",
});
