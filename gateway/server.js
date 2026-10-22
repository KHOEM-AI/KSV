import express from "express";
import { registry, local } from "./registry.js";
import fs from "node:fs";
const ALLOW = new Set(fs.existsSync("./allow-read.txt") ? fs.readFileSync("./allow-read.txt","utf8").split("\n").filter(Boolean) : []);

const app = express();
app.use(express.json({ limit: "20mb" }));




// ===== Public chat -> AI /api/chat (localhost, rate limit) =====
const chatHits = new Map();
app.use("/api/chat", (req, res, next) => {
  const o = req.get("origin") || "";
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o)) res.set("Access-Control-Allow-Origin", o);
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
app.post("/api/chat", (req, res) => {
  const now = Date.now(), a = (chatHits.get(req.ip) || []).filter(t => now - t < 60000);
  if (a.length >= 20) return res.status(429).json({ error: "ច្រើនពេក សូមរង់ចាំ" });
  a.push(now); chatHits.set(req.ip, a);
  const { messages, honorific, sessionId } = req.body || {};
  forward(local.ai + "/api/chat", { method: "POST", body: { messages, honorific, sessionId } }, res);
});

// ===== Public read-only (ឥតត្រូវ token): qr, nominatim, osrm =====
const PUBLIC = new Set(["qr","nominatim","osrm"]);
const hits = new Map();
app.use("/api", (req,res,next)=>{
  const name = req.path.split("/")[1];
  if (!PUBLIC.has(name) || req.method !== "GET") return next();
  const o = req.get("origin") || "";
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o)) res.set("Access-Control-Allow-Origin", o);
  const now = Date.now(), k = req.ip, a = (hits.get(k)||[]).filter(t=>now-t<60000);
  if (a.length >= 60) return res.status(429).json({error:"ច្រើនពេក"});
  a.push(now); hits.set(k,a);
  const api = registry[name];
  const qs = new URLSearchParams(req.query).toString();
  const rest = req.path.split("/").slice(2).join("/");
  forward(api.target + rest + (qs ? "?" + qs : ""), req, res, api.extraHeaders || {});
});

// ===== ការពារ៖ token + allowlist =====
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN || "";
const SAFE = [
  { test: (r) => r.startsWith("ai/") && ALLOW.has(r.slice(2)) },
  /^ai\/api\/(health|models|status|chat)$/,
  /^khoem\/(health|languages|knowledge|translate)$/,
];
const DANGEROUS = /(kill|resume|approvals|execute|control)/i;
app.use("/api", (req, res, next) => {
  if (req.path === "/" ) return next();
  if (!GATEWAY_TOKEN) return res.status(503).json({ error: "GATEWAY_TOKEN មិនទាន់កំណត់" });
  if (req.get("x-gateway-token") !== GATEWAY_TOKEN) return res.status(401).json({ error: "unauthorized" });
  if (req.path.startsWith("/local/")) {
    const rest = req.path.replace(/^\/local\//, "").replace(/\/+$/, "");
    if (DANGEROUS.test(rest) || !SAFE.some((r) => r.test(rest)))
      return res.status(403).json({ error: "path មិនត្រូវបានអនុញ្ញាត" });
  }
  next();
});

app.get("/api", (_req, res) => res.json({ external: Object.keys(registry), local: Object.keys(local) }));

async function forward(url, req, res, extra = {}) {
  try {
    const headers = { "Content-Type": "application/json", ...extra };
    const hasBody = !["GET", "HEAD"].includes(req.method);
    const r = await fetch(url, { method: req.method, headers, body: hasBody ? JSON.stringify(req.body) : undefined });
    res.status(r.status).set("Content-Type", r.headers.get("content-type") || "application/json").send(await r.text());
  } catch (e) { res.status(502).json({ error: String(e) }); }
}

// API ផ្ទាល់ខ្លួន៖ /api/local/<name>/<path...>
app.all("/api/local/:name/*path", (req, res) => {
  const base = local[req.params.name];
  if (!base) return res.status(404).json({ error: "មិនមាន" });
  const qs = new URLSearchParams(req.query).toString();
  forward(base + "/" + [].concat(req.params.path).join("/") + (qs ? "?" + qs : ""), req, res);
});

// API ខាងក្រៅ៖ /api/<name>
app.all("/api/:name", (req, res) => {
  const api = registry[req.params.name];
  if (!api) return res.status(404).json({ error: "API មិនមាន" });
  const qs = new URLSearchParams(req.query).toString();
  const extra = { ...(api.extraHeaders || {}) };
  if (api.keyEnv && process.env[api.keyEnv]) extra["x-api-key"] = process.env[api.keyEnv];
  forward(api.target + (qs ? "?" + qs : ""), req, res, extra);
});

app.listen(process.env.PORT || 4000, "127.0.0.1", () => console.log("KSV gateway រត់"));
