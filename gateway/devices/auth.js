// KSV — ផ្ទៀងផ្ទាត់ JWT អ្នកប្រើ + សិទ្ធិតាមតួនាទី សម្រាប់ /api/ksv
// ROLE_RANK ឆ្លុះពី khoem-now/src/core/auth/rbac.policy.ts (ត្រូវកែទាំងពីរកន្លែងបើប្តូរ)
import { createRequire } from "node:module";
import { DEVICE_TYPES } from "./catalog.js";
import { audit, getDevice } from "./store.js";

const RANK = { Guest: 0, Viewer: 1, Controller: 2, Operator: 3, Manager: 4, OrgAdmin: 5, SuperAdmin: 6, Owner: 7 };
const req2 = createRequire(new URL("../../khoem-now/package.json", import.meta.url));
let jwt = null;
const loadJwt = () => (jwt ??= req2("jsonwebtoken"));

function needed(req) {
  const parts = req.path.split("/").filter(Boolean);
  if (req.method === "GET") return RANK.Viewer;
  if (parts[0] === "devices" && parts[2] === "command") {
    const d = getDevice(parts[1]);
    const def = d && DEVICE_TYPES[d.type]?.commands[String(req.body?.command || "").toUpperCase()];
    if (!def) return RANK.Controller;
    if (def.readOnly) return RANK.Viewer;
    if (def.confirm || def.confirmIf) return RANK.Operator;
    return RANK.Controller;
  }
  return RANK.Manager; // ចុះឈ្មោះ, disable/enable, state
}

export function ksvAuth(req, res, next) {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) return res.status(503).json({ error: "AUTH_NOT_CONFIGURED", message: "JWT_ACCESS_SECRET មិនទាន់កំណត់ក្នុង gateway/.env" });
  const h = req.get("authorization") || "";
  if (!h.startsWith("Bearer ")) return res.status(401).json({ error: "UNAUTHENTICATED", message: "ត្រូវចូលគណនីសិន" });
  let p;
  try {
    p = loadJwt().verify(h.slice(7).trim(), secret);
  } catch {
    return res.status(401).json({ error: "UNAUTHENTICATED", message: "សម័យចូលផុតកំណត់ ឬមិនត្រឹមត្រូវ សូមចូលគណនីម្តងទៀត" });
  }
  if (!p || typeof p !== "object" || !p.sub || !p.role) {
    return res.status(401).json({ error: "UNAUTHENTICATED", message: "token មិនពេញលេញ" });
  }
  const have = RANK[p.role];
  const need = needed(req);
  if (have === undefined || have < need) {
    audit({ event: "auth.denied", userId: p.sub, role: p.role, method: req.method, path: req.path });
    return res.status(403).json({ error: "FORBIDDEN", message: "តួនាទីរបស់អ្នកមិនមានសិទ្ធិធ្វើសកម្មភាពនេះ" });
  }
  req.user = { id: p.sub, role: p.role };
  next();
}
