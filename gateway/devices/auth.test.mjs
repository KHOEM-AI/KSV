// រត់៖ cd gateway && node --test devices/auth.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { createRequire } from "node:module";

process.env.KSV_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "ksv-auth-test-"));
delete process.env.KSV_ALLOW_REAL;
const SECRET = "test-secret-" + Date.now();
process.env.JWT_ACCESS_SECRET = SECRET;

const jwt = createRequire(new URL("../../khoem-now/package.json", import.meta.url))("jsonwebtoken");
const { ksvAuth } = await import("./auth.js");
const svc = await import("./service.js");

const sign = (role, secret = SECRET) => jwt.sign(role ? { sub: "u1", role } : { sub: "u1" }, secret, { expiresIn: 60 });

function run(method, p, { token, body } = {}) {
  const out = { next: false };
  const req = {
    method,
    path: p,
    body,
    get: (h) => (h.toLowerCase() === "authorization" && token ? "Bearer " + token : ""),
  };
  const res = {
    status(c) { out.status = c; return this; },
    json(b) { out.body = b; return this; },
  };
  ksvAuth(req, res, () => { out.next = true; });
  return out;
}

for (const [id, type] of [["plug-t", "generic"], ["lock-t", "lock"], ["net-t", "network"]]) {
  assert.equal(svc.register({ id, name: id, type, adapter: "sim" }).status, 201, id);
}

test("គ្មាន token / token ខុស / secret ខុស / គ្មាន role → 401", () => {
  assert.equal(run("GET", "/devices").status, 401);
  assert.equal(run("GET", "/devices", { token: "garbage" }).status, 401);
  assert.equal(run("GET", "/devices", { token: sign("Owner", "other-secret") }).status, 401);
  assert.equal(run("GET", "/devices", { token: sign(null) }).status, 401);
  assert.equal(run("GET", "/devices").next, false);
});

test("gateway មិនមាន JWT_ACCESS_SECRET → 503 (បិទទ្វារ មិនបើកចំហ)", () => {
  const keep = process.env.JWT_ACCESS_SECRET;
  delete process.env.JWT_ACCESS_SECRET;
  try {
    const r = run("GET", "/devices", { token: sign("Owner") });
    assert.equal(r.status, 503);
    assert.equal(r.next, false);
  } finally {
    process.env.JWT_ACCESS_SECRET = keep;
  }
});

test("Viewer មើលបាន តែបញ្ជាមិនបាន", () => {
  const t = sign("Viewer");
  assert.equal(run("GET", "/devices", { token: t }).next, true);
  assert.equal(run("POST", "/devices/plug-t/command", { token: t, body: { command: "ON" } }).status, 403);
  assert.equal(run("POST", "/devices/lock-t/command", { token: t, body: { command: "GET_STATUS" } }).next, true);
});

test("Controller បញ្ជាធម្មតាបាន តែ UNLOCK ត្រូវ Operator+", () => {
  const c = sign("Controller");
  assert.equal(run("POST", "/devices/plug-t/command", { token: c, body: { command: "ON" } }).next, true);
  assert.equal(run("POST", "/devices/lock-t/command", { token: c, body: { command: "UNLOCK" } }).status, 403);
  assert.equal(run("POST", "/devices/lock-t/command", { token: sign("Operator"), body: { command: "UNLOCK" } }).next, true);
});

test("network OFF (ត្រូវបញ្ជាក់) ត្រូវ Operator+", () => {
  assert.equal(run("POST", "/devices/net-t/command", { token: sign("Controller"), body: { command: "OFF" } }).status, 403);
  assert.equal(run("POST", "/devices/net-t/command", { token: sign("Operator"), body: { command: "OFF" } }).next, true);
});

test("ចុះឈ្មោះ និងរាយការណ៍ state ត្រូវ Manager+", () => {
  const body = { id: "x-t", name: "x", type: "generic" };
  assert.equal(run("POST", "/devices", { token: sign("Operator"), body }).status, 403);
  assert.equal(run("POST", "/devices", { token: sign("Manager"), body }).next, true);
  assert.equal(run("POST", "/devices/plug-t/state", { token: sign("Operator"), body: { power: true } }).status, 403);
});

test("role មិនស្គាល់ → 403", () => {
  assert.equal(run("GET", "/devices", { token: sign("Hacker") }).status, 403);
});

test("http adapter៖ ទទួល state សាមញ្ញ តែមិនទទួល speedKmh ឬ object", async () => {
  const server = http.createServer((req, res) => {
    req.resume();
    req.on("end", () => {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true, state: { power: true, brightness: 50, speedKmh: 99, nested: { a: 1 } } }));
    });
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  try {
    const endpoint = `http://127.0.0.1:${server.address().port}`;
    assert.equal(svc.register({ id: "light-http-t", name: "l", type: "light", adapter: "http", endpoint }).status, 201);
    const r = await svc.command("light-http-t", { command: "ON" });
    assert.equal(r.status, 200);
    const st = svc.device("light-http-t").body.state;
    assert.equal(st.power, true);
    assert.equal(st.brightness, 50);
    assert.equal(st.speedKmh, undefined);
    assert.equal(st.nested, undefined);
  } finally {
    server.closeAllConnections?.();
    server.close();
  }
});
