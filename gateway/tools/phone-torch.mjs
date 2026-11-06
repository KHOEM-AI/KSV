// Copyright (c) 2026 @KHOEM-AI. All rights reserved.
// Bridge: gateway http adapter -> this phone's flashlight (Termux:API). ON/OFF only.
// Localhost only. A flashlight cannot cause harm, so this one is LIVE by default.
import http from 'node:http';
import { execFile } from 'node:child_process';

const PORT = Number(process.env.PORT || 9300);
const state = { power: false };

const torch = (arg) =>
  new Promise((ok, no) => execFile('termux-torch', [arg], { timeout: 5000 }, (e) => (e ? no(e) : ok())));

http.createServer((req, res) => {
  const send = (code, obj) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); };
  if (req.method !== 'POST' || req.url !== '/command') return send(404, { ok: false });
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', async () => {
    let msg = {};
    try { msg = JSON.parse(body); } catch { return send(400, { ok: false, error: 'bad json' }); }
    if (msg.command !== 'ON' && msg.command !== 'OFF') return send(400, { ok: false, error: 'only ON/OFF allowed' });
    try {
      await torch(msg.command === 'ON' ? 'on' : 'off');
      state.power = msg.command === 'ON';
      console.log(new Date().toISOString(), msg.command);
      send(200, { ok: true, device: 'phone-torch', state });
    } catch (e) { send(502, { ok: false, error: String(e) }); }
  });
}).listen(PORT, '127.0.0.1', () => console.log(`phone torch bridge on 127.0.0.1:${PORT}`));
