// src/lib/finalLock.ts
// Helpers for the 4th (final) lock: hand-drawn pattern + face scan.
//
// Face scan uses WebAuthn with the phone's own biometric check
// (userVerification: "required"). KSV never sees or stores a face image.
// Pattern is stored as a salted PBKDF2 hash, never as the raw dots.
//
// NOTE: this version is a LOCAL gate (data lives in localStorage on this device).
// Like AppLockScreen, it protects against someone picking up an already
// logged-in phone. It is not a replacement for password/MFA.

export const MIN_PATTERN_DOTS = 4;

const PBKDF2_ITERATIONS = 150_000;
const MAX_FAILS = 5;
const LOCK_MS = 60_000;

type StoredPattern = { salt: string; hash: string; iterations: number };

type StoredState = {
  pattern?: StoredPattern;
  credentialId?: string;
  fails: number;
  lockedUntil: number;
};

const storageKey = (userId: string) => `ksv.finalLock.v1.${userId}`;

function load(userId: string): StoredState {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (raw) return { fails: 0, lockedUntil: 0, ...JSON.parse(raw) };
  } catch {
    /* ignore corrupted / unavailable storage */
  }
  return { fails: 0, lockedUntil: 0 };
}

function save(userId: string, state: StoredState) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

// ---------- base64url helpers ----------

function toB64(input: ArrayBuffer | Uint8Array): string {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64(str: string): Uint8Array<ArrayBuffer> {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ---------- pattern ----------

async function hashPattern(
  pattern: number[],
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error("secure-context-required");
  const keyMaterial = await subtle.importKey(
    "raw",
    new TextEncoder().encode(pattern.join("-")),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    keyMaterial,
    256,
  );
  return toB64(bits);
}

export function hasPattern(userId: string): boolean {
  return !!load(userId).pattern;
}

/** `pattern` = dot numbers 1..9 in the order they were drawn. */
export async function savePattern(userId: string, pattern: number[]): Promise<void> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await hashPattern(pattern, salt, PBKDF2_ITERATIONS);
  const s = load(userId);
  save(userId, {
    ...s,
    pattern: { salt: toB64(salt), hash, iterations: PBKDF2_ITERATIONS },
    fails: 0,
    lockedUntil: 0,
  });
}

export async function verifyPattern(
  userId: string,
  pattern: number[],
): Promise<"ok" | "wrong" | "locked"> {
  const s = load(userId);
  if (s.lockedUntil > Date.now()) return "locked";
  if (!s.pattern || pattern.length < MIN_PATTERN_DOTS) return "wrong";

  const hash = await hashPattern(pattern, fromB64(s.pattern.salt), s.pattern.iterations);
  if (safeEqual(hash, s.pattern.hash)) {
    save(userId, { ...s, fails: 0, lockedUntil: 0 });
    return "ok";
  }

  const fails = s.fails + 1;
  if (fails >= MAX_FAILS) {
    save(userId, { ...s, fails: 0, lockedUntil: Date.now() + LOCK_MS });
    return "locked";
  }
  save(userId, { ...s, fails });
  return "wrong";
}

export function getLockRemainingMs(userId: string): number {
  return Math.max(0, load(userId).lockedUntil - Date.now());
}

export function clearFinalLock(userId: string): void {
  try {
    localStorage.removeItem(storageKey(userId));
  } catch {
    /* ignore */
  }
}

// ---------- face (WebAuthn platform authenticator) ----------

export async function isFaceSupported(): Promise<boolean> {
  try {
    return (
      !!window.PublicKeyCredential &&
      (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
    );
  } catch {
    return false;
  }
}

export function hasFace(userId: string): boolean {
  return !!load(userId).credentialId;
}

export async function enrollFace(userId: string): Promise<boolean> {
  try {
    const cred = (await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: "KSV" },
        user: {
          id: new TextEncoder().encode(userId).slice(0, 64),
          name: userId,
          displayName: "KSV",
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "discouraged",
        },
        timeout: 60_000,
        attestation: "none",
      },
    })) as PublicKeyCredential | null;

    if (!cred) return false;
    save(userId, { ...load(userId), credentialId: toB64(cred.rawId) });
    return true;
  } catch {
    return false; // cancelled, unsupported, or not a secure context
  }
}

export async function verifyFace(userId: string): Promise<boolean> {
  const id = load(userId).credentialId;
  if (!id) return false;
  try {
    const res = await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [{ type: "public-key", id: fromB64(id), transports: ["internal"] }],
        userVerification: "required",
        timeout: 60_000,
      },
    });
    return res !== null;
  } catch {
    return false; // face did not match, cancelled, or unavailable
  }
}
