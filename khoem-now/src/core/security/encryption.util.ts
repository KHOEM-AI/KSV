/**
 * KSV — Encryption Utilities
 * Location in project: src/core/security/encryption.util.ts
 *
 * Purpose (per KSV Security Design, sections 5 & 20-21):
 *   - Password Privacy: KSV administrators must NEVER be able to view a
 *     user's raw password — not in dashboard, logs, API, or database.
 *   - Security Core: sensitive fields at rest must be encrypted, not stored
 *     as plain text.
 *
 * This file provides two DISTINCT tools — do not mix them up:
 *   1. Password hashing (one-way, for login credentials) → bcrypt
 *   2. Field encryption (two-way, for data KSV must read back later,
 *      e.g. device serial numbers, API keys stored per-organization) → AES-256-GCM
 */

import bcrypt from "bcrypt";
import crypto from "crypto";

// ============================================================
// 1. PASSWORD HASHING (one-way — never decrypt, only compare)
// ============================================================

const BCRYPT_SALT_ROUNDS = 12; // higher = slower to brute-force, but slower logins too

/**
 * Hashes a plaintext password for storage.
 * The result is safe to store in the database — it cannot be reversed
 * back into the original password (this is by design).
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, BCRYPT_SALT_ROUNDS);
}

/**
 * Compares a login attempt's plaintext password against the stored hash.
 * Returns true only on exact match. Never logs either value.
 */
export async function verifyPassword(
  plainPassword: string,
  storedHash: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, storedHash);
}

// ============================================================
// 2. FIELD ENCRYPTION (two-way — AES-256-GCM, for data KSV must read back)
// ============================================================

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // recommended IV length for GCM
const AUTH_TAG_LENGTH = 16;

// Master key must come from a dedicated secret manager / .env — never
// hardcoded, never committed to git, and rotated periodically per the
// Key & Secret Management policy (section 21).
const RAW_KEY = process.env.FIELD_ENCRYPTION_KEY;

if (!RAW_KEY || RAW_KEY.length !== 64) {
  // Expecting a 32-byte key expressed as a 64-char hex string.
  // Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  throw new Error(
    "FIELD_ENCRYPTION_KEY must be set as a 64-character hex string (32 bytes). " +
      "Refusing to start without it (Fail Securely principle)."
  );
}

const ENCRYPTION_KEY = Buffer.from(RAW_KEY, "hex");

/**
 * Encrypts a sensitive string field (e.g. a device serial number, an
 * OAuth refresh token) for storage. Returns a single string safe to
 * store in a database column: "iv:authTag:ciphertext" (all hex-encoded).
 */
export function encryptField(plainText: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [iv.toString("hex"), authTag.toString("hex"), encrypted.toString("hex")].join(
    ":"
  );
}

/**
 * Decrypts a value produced by encryptField(). Throws if the value has
 * been tampered with (GCM auth tag mismatch) — treat any thrown error
 * here as a potential integrity/security incident, not a normal error.
 */
export function decryptField(storedValue: string): string {
  const [ivHex, authTagHex, cipherTextHex] = storedValue.split(":");

  if (!ivHex || !authTagHex || !cipherTextHex) {
    throw new Error("Malformed encrypted value — expected 'iv:authTag:ciphertext'.");
  }

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const cipherText = Buffer.from(cipherTextHex, "hex");

  if (authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error("Invalid auth tag length — value may be corrupted or tampered with.");
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(cipherText),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

// ============================================================
// 3. RANDOM TOKEN GENERATION (for OTPs, session tokens, API keys)
// ============================================================

/**
 * Generates a cryptographically secure random token (hex string).
 * Use for: session tokens, password-reset tokens, API keys.
 * Do NOT use Math.random() anywhere in KSV for security-sensitive values.
 */
export function generateSecureToken(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString("hex");
}

/**
 * Generates a numeric OTP code (e.g. for account recovery / MFA).
 * Length defaults to 6 digits per KSV Account Recovery spec (section 6).
 */
export function generateOtp(length = 6): string {
  const digits = "0123456789";
  let otp = "";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[bytes[i] % digits.length];
  }
  return otp;
}
