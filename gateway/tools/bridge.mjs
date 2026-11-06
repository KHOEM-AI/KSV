// Copyright (c) 2026 @KHOEM-AI. All rights reserved.
// Bridge: gateway http adapter -> real LAN switch (Tasmota / Shelly). ON/OFF only.
// Listens on localhost only. Defaults to DRY_RUN (logs, sends nothing).
import http from 'node:http';

const KIND = process.env.DEVICE_KIND || '';
const TARGET = process.env.TARGET_IP || '';
const PORT = Number(process.env.PORT || 9200);
const DRY = process.env.DRY_RUN !== '0';

const isPrivate = (h) => /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h);
if (!isPrivate(TARGET)) { console.error('TARGET_IP ត្រូវជា IP ក្នុង LAN'); process.exit(1); }

const MAP = {
  tasmota: { ON: `http://${TARGET}/cm?cmnd=Power%20On`, OFF: `http://${TARGET}/cm?cmnd=Power%20Off` },
  shelly1: { ON: `http://${TARGET}/relay/0?turn=on`, OFF: `http://${TARGET}/relay/0?turn=off` },
  shelly2: { ON: `http://${TARGET}/rpc/Switch.Set?id=0&on=true`, OFF: `http://${TARGET}/rpc/Switch.Set?id=0&on=false` },
}[KIND];
if (!MAP) { console.error('DEVICE_KIND ត្រូវជា tasmota | shelly1 | shelly2'); process.exit(1); }

http.createServer((req, res) => {
  const send = (code, obj) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); };
  if (req.method !== 'POST' || req.url !== '/command') return send(404, { ok: false });
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', async () => {
    let msg = {};
    try { msg = JSON.parse(body); } catch { return send(400, { ok: false, error: 'bad json' }); }
    const url = MAP[msg.command];
    if (!url) return send(400, { ok: false, error: 'only ON/OFF allowed' });
    console.log(new Date().toISOString(), msg.command, DRY ? '(dry-run)' : url);
    if (DRY) return send(200, { ok: true, dryRun: true });
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(3000) });
      send(r.ok ? 200 : 502, { ok: r.ok, status: r.status });
    } catch (e) { send(502, { ok: false, error: String(e) }); }
  });
}).listen(PORT, '127.0.0.1', () => console.log(`bridge ${KIND} -> ${TARGET} (${DRY ? 'DRY_RUN' : 'LIVE'}) on 127.0.0.1:${PORT}`));
