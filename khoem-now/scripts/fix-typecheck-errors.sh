from pathlib import Path
p = Path("src/core/security/rate-limiter.ts")
s = p.read_text()
s = s.replace('  // @ts-expect-error - accessing private map for cleanup; fine within this file\n', '')
s = s.replace('    // @ts-expect-error - same as above\n', '')
p.write_text(s)
print("rate-limiter.ts fixed")
PY

echo "=== Fix 2: server.ts user.userId -> user.id (5 errors) ==="
sed -i 's/user\.userId/user.id/g' src/server.ts

echo "=== Fix 3: src/lib/api.ts DeviceProtocol not exported from API/protocol.ts ==="
python3 - <<'PY'
from pathlib import Path
p = Path("API/protocol.ts")
s = p.read_text()
old = "import type { DeviceProtocol } from './device';"
new = "import type { DeviceProtocol } from './device';\nexport type { DeviceProtocol };"
if old in s and new not in s:
    s = s.replace(old, new, 1)
    p.write_text(s)
    print("API/protocol.ts fixed - now re-exports DeviceProtocol")
else:
    print("SKIPPED - pattern not found or already fixed, check manually")
PY

echo "=== Fix 4: LoginView.tsx res.token possibly undefined ==="
python3 - <<'PY'
from pathlib import Path
p = Path("src/views/LoginView.tsx")
s = p.read_text()
old = "localStorage.setItem('ksv_access_token', res.token.accessToken);"
new = "if (res.token) {\n        localStorage.setItem('ksv_access_token', res.token.accessToken);\n      }"
if old in s:
    s = s.replace(old, new, 1)
    p.write_text(s)
    print("LoginView.tsx fixed")
else:
    print("SKIPPED - exact line not found, check manually")
PY

echo "=== Fix 5: MapView.tsx missing leaflet package ==="
npm install leaflet @types/leaflet --save

echo "=== Fix 6: translations.ts replaceAll (needs ES2021 lib) ==="
python3 - <<'PY'
from pathlib import Path
import json
p = Path("tsconfig.app.json")
data = json.loads(p.read_text())
opts = data.setdefault("compilerOptions", {})
opts["target"] = "ES2021"
libs = opts.get("lib", [])
if not any("2021" in l or "2022" in l or "2023" in l for l in libs):
    opts["lib"] = ["ES2021", "DOM", "DOM.Iterable"]
p.write_text(json.dumps(data, indent=2))
print("tsconfig.app.json updated to target ES2021")
PY
