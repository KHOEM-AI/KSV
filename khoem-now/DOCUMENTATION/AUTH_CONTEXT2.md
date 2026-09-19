## models.ts User + Session (23-53)
const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }, // never plain text
    role: { type: String, required: true }, // Owner | SuperAdmin | OrgAdmin | Manager | Operator | Controller | Viewer | Guest
    firstName: String,
    lastName: String,
    isActive: { type: Boolean, default: true },
    mfaEnabled: { type: Boolean, default: false },
    lastLoginAt: Date,
    organizationId: { type: ObjectId, ref: "Organization" },
  },
  { timestamps: true }
);

const sessionSchema = new Schema(
  {
    userId: { type: ObjectId, ref: "User", required: true },
    refreshToken: { type: String, required: true, unique: true }, // store a HASH, not raw value
    ip: String,
    userAgent: String,
    expiresAt: { type: Date, required: true },
    revokedAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// ============================================================
// ORGANIZATION & ENTERPRISE
// ============================================================


## login: session create + response (528-600)
        }
      );

      const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

      const match = refreshExpiresIn.match(/^(\d+)([smhd])$/);

      if (!match) {
        throw new Error(
          "Invalid JWT_REFRESH_EXPIRES_IN format. Use values such as 7d, 24h, 60m."
        );
      }

      const amount = Number(match[1]);
      const unit = match[2];

      const millisecondsPerUnit: Record<string, number> = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
      };

      const expiresAt = new Date(
        now.getTime() + amount * millisecondsPerUnit[unit]
      );

      const session = await Session.create({
        userId: user._id,
        refreshToken: hashRefreshToken(refreshToken),
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        expiresAt,
      });

      user.lastLoginAt = now;
      await user.save();

      res.json({
        result: "success",
        session: {
          sessionId: String(session._id),
          accountId: String(user._id),
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
          createdAt: session.createdAt
            ? new Date(session.createdAt).toISOString()
            : now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          lastActivityAt: now.toISOString(),
          status: "active",
          mfaVerified: !user.mfaEnabled,
          loginMethod: "password",
          countryCode: undefined,
        },
        token: {
          accessToken,
          refreshToken,
          expiresIn: 15 * 60,
          tokenType: "Bearer",
        },
        message: "Login successful.",
      });
    } catch (err) {
      console.error("[AUTH] Password login failed:", err);

      res.status(500).json({
        result: "failed",
        message: "Login failed due to a server error.",
      });
    }
  });


## password/change (422-467)
  // POST /api/auth/password/change
  app.post("/api/auth/password/change", authenticate, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body ?? {};

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          error: "BAD_REQUEST",
          message: "currentPassword and newPassword are required.",
        });
        return;
      }

      const userId = req.user!.id;
      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({ error: "NOT_FOUND", message: "User not found." });
        return;
      }

      const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);

      if (!passwordMatches) {
        res.status(401).json({
          error: "UNAUTHORIZED",
          message: "Current password is incorrect.",
        });
        return;
      }

      user.passwordHash = await bcrypt.hash(newPassword, 12);
      await user.save();

      res.json({
        success: true,
        sessionRevoked: false,
        message: "Password changed successfully.",
      });
    } catch (err) {
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: err instanceof Error ? err.message : "Failed to change password.",
      });
    }
  });

## where routes are registered
33:function hashRefreshToken(token: string): string {
42:async function toKSVOrganization(org: Record<string, unknown>): Promise<Record<string, unknown>> {
69:async function toKSVSite(site: Record<string, unknown>): Promise<Record<string, unknown>> {
92:function mapUserRoleToMemberRole(role: string): string {
102:function toKSVOrgMember(user: Record<string, unknown>): Record<string, unknown> {
124:async function toKSVBuilding(b: Record<string, unknown>): Promise<Record<string, unknown>> {
147:async function toKSVRoom(r: Record<string, unknown>): Promise<Record<string, unknown>> {
162:async function main() {
165:  const app = express();
167:  app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(",") || "*" }));
168:  app.use(express.json());
2519:async function resolveAIDevice(
3183:  app.listen(PORT, () => {

## authenticate rest (50-110)
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
  } catch {
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


## AuditLog schema (270-284) + audit helper
const auditLogSchema = new Schema(
  {
    userId: { type: ObjectId, ref: "User" },
    action: { type: String, required: true }, // e.g. "device:command", "auth:login"
    deviceId: { type: ObjectId, ref: "Device" },
    organizationId: { type: ObjectId, ref: "Organization" },
    result: { type: String, required: true }, // SUCCESS | FAILURE | BLOCKED
    ip: String,
    userAgent: String,
    reason: String,
    details: String, // JSON-stringified, sanitized (secrets redacted)
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

26:export type AuditResult = "SUCCESS" | "FAILURE" | "BLOCKED";
28:export interface AuditEntryInput {
74:export async function recordAuditEntry(entry: AuditEntryInput): Promise<void> {
103:export async function auditLogin(
111:export async function auditDeviceCommand(
131:export async function auditPermissionDenied(
148:export interface AuditQueryOptions {
160:export async function queryAuditLog(options: AuditQueryOptions = {}) {
