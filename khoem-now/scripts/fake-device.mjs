/**
 * KSV — a fake device for testing the whole chain without hardware.
 * Listens on 127.0.0.1 and answers POST /command like a real Wi-Fi device would.
 *
 *   npm run fake:device           (default port 8899, or FAKE_DEVICE_PORT / DEVICE_HTTP_PORT)
 *
 * Every command that reaches it is printed. The answer says "simulated": true — nothing real is switched.
 */
import http from 'node:http';

const PORT = Number(process.env.FAKE_DEVICE_PORT || process.env.DEVICE_HTTP_PORT || 8899);
const MAX_BODY = 16 * 1024;

const server = http.createServer((req, res) => {
  const send = (status, body) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  };

  if (req.method === 'GET' && req.url === '/') return send(200, { fakeDevice: true, simulated: true });
  if (req.method !== 'POST' || req.url !== '/command') return send(404, { ok: false, error: 'NOT_FOUND' });

  let raw = '';
  req.on('data', (chunk) => {
    raw += chunk;
    if (raw.length > MAX_BODY) req.destroy();
  });
  req.on('end', () => {
    let body;
    try {
      body = JSON.parse(raw || '{}');
    } catch {
      return send(400, { ok: false, error: 'BAD_JSON' });
    }
    if (typeof body.command !== 'string') return send(400, { ok: false, error: 'COMMAND_REQUIRED' });
    console.log(`${new Date().toLocaleTimeString()}  ${body.command}  ${JSON.stringify(body.params ?? {})}`);
    send(200, { ok: true, simulated: true, received: { command: body.command, params: body.params ?? {} } });
  });
});

server.listen(PORT, '127.0.0.1', () => console.log(`Fake device listening on http://127.0.0.1:${PORT}  (Ctrl+C to stop)`));
