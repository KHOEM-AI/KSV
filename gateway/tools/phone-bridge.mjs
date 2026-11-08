// Copyright (c) 2026 @KHOEM-AI. All rights reserved.
// Bridge: gateway http adapter -> this phone (Termux:API). Localhost only.
// Allowed: GET_STATUS (battery), VIBRATE, SPEAK, NOTIFY (fixed phrases only). No shell, no free text.
import http from 'node:http';
import { execFile } from 'node:child_process';

const PORT = Number(process.env.PORT || 9301);
const DRY = process.env.KSV_PHONE_DRY === '1';
const COOLDOWN_MS = 1000;
const PHRASES = { hello: 'Hello from KSV', test: 'KSV test', alert: 'KSV alert' };
let last = 0;

const run = (cmd, args) =>
  DRY
    ? Promise.resolve(cmd === 'termux-battery-status'
        ? JSON.stringify({ percentage: 50, temperature: 30, status: 'DISCHARGING', plugged: 'UNPLUGGED' })
        : '')
    : new Promise((ok, no) => execFile(cmd, args, { timeout: 5000 }, (e, out) => (e ? no(e) : ok(String(out)))));

http.createServer((req, res) => {
  const send = (code, obj) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); };
  if (req.method !== 'POST' || req.url !== '/command') return send(404, { ok: false });
  let body = '';
  req.on('data', (c) => { body += c; if (body.length > 1024) req.destroy(); });
  req.on('end', async () => {
    let msg;
    try { msg = JSON.parse(body); } catch { return send(400, { ok: false, error: 'bad json' }); }
    const cmd = msg && msg.command;
    const p = (msg && msg.params) || {};
    try {
      if (cmd === 'GET_STATUS') {
        const b = JSON.parse(await run('termux-battery-status', []));
        return send(200, { ok: true, device: 'phone', state: {
          batteryPercent: Number(b.percentage),
          batteryTemp: Number(b.temperature),
          charging: b.plugged !== 'UNPLUGGED',
          batteryStatus: String(b.status),
        } });
      }
      if (cmd !== 'VIBRATE' && cmd !== 'SPEAK' && cmd !== 'NOTIFY') return send(400, { ok: false, error: 'command not allowed' });
      let args;
      if (cmd === 'VIBRATE') {
        const ms = p.durationMs === undefined ? 500 : p.durationMs;
        if (!Number.isInteger(ms) || ms < 100 || ms > 2000) return send(400, { ok: false, error: 'durationMs 100..2000' });
        args = ['termux-vibrate', ['-d', String(ms)]];
      } else {
        const text = Object.prototype.hasOwnProperty.call(PHRASES, p.value) ? PHRASES[p.value] : null;
        if (!text) return send(400, { ok: false, error: 'value not allowed' });
        args = cmd === 'SPEAK'
          ? ['termux-tts-speak', [text]]
          : ['termux-notification', ['--title', 'KSV', '--content', text]];
      }
      const now = Date.now();
      if (now - last < COOLDOWN_MS) return send(429, { ok: false, error: 'too fast' });
      last = now;
      await run(args[0], args[1]);
      console.log(new Date().toISOString(), cmd);
      send(200, { ok: true, device: 'phone', state: { lastAction: cmd.toLowerCase() } });
    } catch (e) { send(502, { ok: false, error: String(e) }); }
  });
}).listen(PORT, '127.0.0.1', () => console.log(`phone bridge on 127.0.0.1:${PORT}`));
