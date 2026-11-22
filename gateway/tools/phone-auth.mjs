import { timingSafeEqual } from 'node:crypto';

// Shared by the phone bridges. 200 = allowed, 401 = wrong or missing token, 503 = no token configured (fail closed).
export function authStatus(req) {
  const t = process.env.PHONE_BRIDGE_TOKEN || '';
  if (!t) return 503;
  const a = Buffer.from(String(req.headers['x-phone-token'] ?? ''));
  const b = Buffer.from(t);
  return a.length === b.length && timingSafeEqual(a, b) ? 200 : 401;
}
