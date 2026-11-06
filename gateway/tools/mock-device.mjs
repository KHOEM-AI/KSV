// Copyright (c) 2026 @KHOEM-AI. All rights reserved.
// Fake LAN device for testing the gateway http adapter. Binds to localhost only.
import http from 'node:http';

const PORT = Number(process.env.PORT || 9100);
const state = { power: false };

http.createServer((req, res) => {
  if (req.method !== 'POST' || req.url !== '/command') { res.writeHead(404).end(); return; }
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    let msg = {};
    try { msg = JSON.parse(body); } catch { /* ignore */ }
    if (msg.command === 'ON') state.power = true;
    if (msg.command === 'OFF') state.power = false;
    console.log(new Date().toISOString(), msg.command, JSON.stringify(msg.params ?? {}));
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, device: 'mock', state }));
  });
}).listen(PORT, '127.0.0.1', () => console.log(`mock device on 127.0.0.1:${PORT}`));
