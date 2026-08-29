/**
 * KSV — Authentication Middleware
 * Location in project: src/core/auth/auth.middleware.ts
 *
 * Purpose (per KSV Security Design, sections 4 & 16):
 *   User Command → AUTHENTICATION → Authorization → Device Capability → Safety → Execute
 *
 * This middleware verifies the JWT access token on every protected request,
 * and attaches the authenticated user's identity to the request object.
 * It does NOT check permissions (that is rbac.policy.ts's job) — this file
 * only answers "who is making this request?".
 */

import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// ---- Config -----------------------------------------------------------
// NEVER hardcode secrets. Load from environment (.env, not committed to git).
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;

if (!ACCESS_TOKEN_SECRET) {
  // Fail loudly at startup rather than silently accepting unsigned tokens.
  throw new Error(
    "JWT_ACCESS_SECRET is not set. Refusing to start without it (Fail Securely principle)."
  );
}

// ---- Types --------------------------------------------------------------
export interface AuthenticatedUser {
  id: string;
  role: string; // Owner | SuperAdmin | OrgAdmin | Manager | Operator | Controller | Viewer | Guest
  organizationId?: string;
}

// Extend Express's Request type so controllers get typed access to req.user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// ---- Middleware ---------------------------------------------------------
/**
 * Verifies the Bearer token in the Authorization header.
 * On success: attaches req.user and calls next().
 * On failure: responds 401 immediately (fail closed, never fail open).
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: "UNAUTHENTICATED",
      message: "Missing or malformed Authorization header.",
    });
    return;
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET as string) as JwtPayload;

    if (!decoded.sub || !decoded.role) {
      // Token is validly signed but missing required claims — reject.
      res.status(401).json({
        error: "UNAUTHENTICATED",
        message: "Token payload is missing required claims.",
      });
      return;
    }

    req.user = {
      id: decoded.sub as string,
      role: decoded.role as string,
      organizationId: decoded.organizationId as string | undefined,
    };

    next();
  } catch (err) {
    // Covers: expired token, invalid signature, malformed token.
    // Intentionally vague to the client (don't leak why verification failed).
    res.status(401).json({
      error: "UNAUTHENTICATED",
      message: "Invalid or expired token.",
    });
  }
}

/**
 * Optional variant: allows the request through even without a token,
 * but still attaches req.user if a valid token IS present.
 * Useful for endpoints that behave differently for logged-in vs anonymous users.
 * Use sparingly — most KSV endpoints should use `authenticate`, not this.
 */
export function authenticateOptional(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET as string) as JwtPayload;
    if (decoded.sub && decoded.role) {
      req.user = {
        id: decoded.sub as string,
        role: decoded.role as string,
        organizationId: decoded.organizationId as string | undefined,
      };
    }
  } catch {
    // Silently ignore invalid tokens in the optional path — treat as anonymous.
  }

  next();
}
