#!/usr/bin/env bash
# KSV: ai [run|stop|restart]  = KHOEM_AI (:8790) + AI (:8787, UI :5175) + KSV gateway (:4000)
#   + KI API (:5001) + MI-K 3D (:5176)
LAUNCHER="$HOME/KHOEM_AI/KHOEM_AI/ai.sh"
GW="$HOME/KSV/gateway"
export AI_DIR="${AI_DIR:-$HOME/ai-project/AI}"

stop_gw() { pkill -f "$GW/server.js" 2>/dev/null; }

IQPID="$HOME/.iqai.pid"
stop_iqai() {
  [ -f "$IQPID" ] && kill "$(cat "$IQPID")" 2>/dev/null
  rm -f "$IQPID"
  # also any IQ-AI started another way (it would keep the port and the new one would die silently)
  pkill -f "node --env-file=.env src/server/server.mjs" 2>/dev/null
  return 0
}
start_iqai() {
  stop_iqai
  TF="$HOME/.iqai-token"
  if [ ! -s "$TF" ]; then head -c 24 /dev/urandom | od -An -tx1 | tr -d ' \n' > "$TF"; chmod 600 "$TF"; fi
  export IQAI_TOKEN="$(cat "$TF")"
  ( cd "$HOME/IQ-AI" && PORT=8799 exec node --env-file=.env src/server/server.mjs >"$HOME/iqai.log" 2>&1 ) &
  echo $! > "$IQPID"
  local up=0
  for _ in $(seq 1 20); do
    curl -s -o /dev/null -m 2 http://127.0.0.1:8799/ && { up=1; break; }
    sleep 1
  done
  if [ "$up" = 1 ]; then echo "  ✔ IQ-AI media    :8799"; else echo "  ✘ IQ-AI media not ready (log: ~/iqai.log)"; fi
}

KIPID="$HOME/.ki-api.pid"
stop_ki() { [ -f "$KIPID" ] && kill "$(cat "$KIPID")" 2>/dev/null; rm -f "$KIPID"; pkill -f "$HOME/KI/" 2>/dev/null; }
start_ki() {
  stop_ki
  [ -f "$HOME/KI/src/server.mjs" ] || { echo "  x KI API: ~/KI/src/server.mjs not found"; return; }
  ( cd "$HOME/KI" && PORT=5001 exec node "$HOME/KI/src/server.mjs" >"$HOME/ki-api.log" 2>&1 ) &
  echo $! > "$KIPID"
  echo "  ✔ KI API         :5001"
}
EIPID="$HOME/.ei-t.pid"
stop_eit() { [ -f "$EIPID" ] && kill "$(cat "$EIPID")" 2>/dev/null; rm -f "$EIPID"; }
start_eit() {
  if curl -fs -m 2 http://127.0.0.1:3100/health >/dev/null 2>&1; then
    echo "  ✔ EI-T API       :3100 (already running)"; return
  fi
  stop_eit
  [ -d "$HOME/EI-T" ] || { echo "  x EI-T API: ~/EI-T not found"; return; }
  ( cd "$HOME/EI-T" && PORT=3100 exec node src/server.mjs >"$HOME/ei-t.log" 2>&1 ) &
  echo $! > "$EIPID"
  echo "  ✔ EI-T API       :3100"
}
# --- phone torch bridge (begin) ---
TORCHPID="$HOME/.phone-torch.pid"
stop_torch() { [ -f "$TORCHPID" ] && kill "$(cat "$TORCHPID")" 2>/dev/null; rm -f "$TORCHPID"; }
start_torch() {
  stop_torch
  [ -f "$GW/tools/phone-torch.mjs" ] || { echo "  x phone torch: tools/phone-torch.mjs not found"; return; }
  command -v termux-torch >/dev/null || { echo "  x phone torch: termux-torch not found"; return; }
  ( cd "$GW" && PORT=9300 exec node tools/phone-torch.mjs >"$HOME/phone-torch.log" 2>&1 ) &
  echo $! > "$TORCHPID"
  echo "  ✔ phone torch    :9300"
}
# --- phone torch bridge (end) ---
# --- phone bridge (begin) ---
PHONEPID="$HOME/.phone-bridge.pid"
stop_phone() { [ -f "$PHONEPID" ] && kill "$(cat "$PHONEPID")" 2>/dev/null; rm -f "$PHONEPID"; }
start_phone() {
  stop_phone
  [ -f "$GW/tools/phone-bridge.mjs" ] || { echo "  x phone bridge: tools/phone-bridge.mjs not found"; return; }
  command -v termux-battery-status >/dev/null || { echo "  x phone bridge: termux-api not found"; return; }
  ( cd "$GW" && PORT=9301 exec node tools/phone-bridge.mjs >"$HOME/phone-bridge.log" 2>&1 ) &
  echo $! > "$PHONEPID"
  echo "  ✔ phone bridge   :9301"
}
# --- phone bridge (end) ---
# --- KSV UI/API (begin) --------------------------------------------------
# KSV web app (khoem-now): API :3000 (needs .env) + UI :5173. Logs: ~/ksv-api.log ~/ksv-ui.log
KSV_DIR="${KSV_DIR:-$HOME/KSV/khoem-now}"
KSVAPI_PID="$HOME/.ksv-api.pid"
KSVUI_PID="$HOME/.ksv-ui.pid"
stop_ksv() {
  for f in "$KSVAPI_PID" "$KSVUI_PID"; do
    [ -f "$f" ] && kill "$(cat "$f")" 2>/dev/null
    rm -f "$f"
  done
}
start_ksv() {
  [ -d "$KSV_DIR/node_modules" ] || { echo "  x KSV UI/API: run 'npm install' in $KSV_DIR first"; return; }
  local api=0 ui=0
  if curl -s -o /dev/null -m 2 http://127.0.0.1:3000/; then
    api=1
  elif [ -f "$KSV_DIR/.env" ]; then
    ( cd "$KSV_DIR" && exec node --env-file=.env --experimental-strip-types src/server.ts >"$HOME/ksv-api.log" 2>&1 ) &
    echo $! > "$KSVAPI_PID"
  else
    echo "  x KSV API: $KSV_DIR/.env not found"
    api=2
  fi
  if curl -s -o /dev/null -m 2 http://127.0.0.1:5173/; then
    ui=1
  else
    ( cd "$KSV_DIR" && exec node node_modules/vite/bin/vite.js >"$HOME/ksv-ui.log" 2>&1 ) &
    echo $! > "$KSVUI_PID"
  fi
  for _ in $(seq 1 25); do
    [ "$api" = 0 ] && curl -s -o /dev/null -m 2 http://127.0.0.1:3000/ && api=1
    [ "$ui" = 0 ] && curl -s -o /dev/null -m 2 http://127.0.0.1:5173/ && ui=1
    [ "$api" != 0 ] && [ "$ui" != 0 ] && break
    sleep 1
  done
  [ "$api" = 1 ] && echo "  ✔ KSV API        :3000"
  [ "$api" = 0 ] && echo "  ✘ KSV API not ready (log: ~/ksv-api.log)"
  [ "$ui" = 1 ] && echo "  ✔ KSV UI         :5173"
  [ "$ui" = 0 ] && echo "  ✘ KSV UI not ready (log: ~/ksv-ui.log)"
}
# --- KSV UI/API (end) ----------------------------------------------------
# --- MI-K VISION 3D (begin) ----------------------------------------------
# MI-K 3D studio (~/MI-K-VISION-3D): UI :5176 (never 5173 - that port is the KSV UI). Log: ~/mik-3d.log
MIK_DIR="${MIK_DIR:-$HOME/MI-K-VISION-3D}"
MIK_PORT="${MIK_PORT:-5176}"
MIKPID="$HOME/.mik-3d.pid"
stop_mik() {
  [ -f "$MIKPID" ] && kill "$(cat "$MIKPID")" 2>/dev/null
  rm -f "$MIKPID"
  pkill -f "vite.js.*--port $MIK_PORT" 2>/dev/null
}
start_mik() {
  [ -d "$MIK_DIR/node_modules" ] || { echo "  x MI-K 3D: run 'npm install' in $MIK_DIR first"; return; }
  if curl -s -o /dev/null -m 2 "http://127.0.0.1:$MIK_PORT/"; then
    echo "  ✔ MI-K 3D        :$MIK_PORT (already running)"; return
  fi
  ( cd "$MIK_DIR" && exec node node_modules/vite/bin/vite.js --host "${MIK_HOST:-127.0.0.1}" --port "$MIK_PORT" --strictPort >"$HOME/mik-3d.log" 2>&1 ) &
  echo $! > "$MIKPID"
  for _ in $(seq 1 25); do
    curl -s -o /dev/null -m 2 "http://127.0.0.1:$MIK_PORT/" && { echo "  ✔ MI-K 3D        :$MIK_PORT"; return; }
    sleep 1
  done
  echo "  ✘ MI-K 3D not ready (log: ~/mik-3d.log)"
}
# --- MI-K VISION 3D (end) ------------------------------------------------
CAI_SH="$HOME/CAI/ai.sh"
start_cai() { [ -f "$CAI_SH" ] && bash "$CAI_SH" start; }
# stop_cai also stops the KSV UI/API, so every existing stop path covers them
stop_cai() { [ -f "$CAI_SH" ] && bash "$CAI_SH" stop >/dev/null 2>&1; stop_ksv; stop_mik; }
# --- ai status (begin) ---------------------------------------------------
# One line per service: answers? (any HTTP code = the process is up; 401/403 only mean "needs a token"),
# then which branch / commit is running and whether there is uncommitted work.
svc() {
  local code
  code=$(curl -s -m 3 -o /dev/null -w '%{http_code}' "http://127.0.0.1:$2${3:-/}" 2>/dev/null)
  if [ "$code" = "000" ] || [ -z "$code" ]; then
    printf '  ✘ %-14s :%-5s not running\n' "$1" "$2"
  else
    printf '  ✔ %-14s :%-5s HTTP %s\n' "$1" "$2" "$code"
  fi
}
ai_status() {
  echo "services:"
  svc "IQ-AI media" 8799
  svc "KI API" 5001
  svc "EI-T API" 3100 /health
  svc "phone torch" 9300
  svc "phone bridge" 9301
  svc "CAI scan" 5180 /cai-scan.html
  svc "CAI share" 5181
  svc "KSV API" 3000
  svc "KSV UI" 5173
  svc "MI-K 3D" 5176
  svc "KHOEM_AI API" 8790
  svc "CIDC API" 8800
  svc "CIDC UI" 5190
  svc "AI backend" 8787 /api/status
  svc "KSV gateway" 4000
  svc "AI UI" 5175
  echo "code (branch @ commit, uncommitted files):"
  local d
  for d in "$HOME/IQ-AI" "$HOME/ai-project/AI" "$HOME/KSV" "$HOME/MI-K-VISION-3D"; do
    if git -C "$d" rev-parse --git-dir >/dev/null 2>&1; then
      printf '  %-22s %s @ %s, %s uncommitted\n' "~/${d#"$HOME"/}" \
        "$(git -C "$d" rev-parse --abbrev-ref HEAD 2>/dev/null)" "$(git -C "$d" log -1 --format=%h 2>/dev/null)" \
        "$(git -C "$d" status --porcelain 2>/dev/null | wc -l | tr -d ' ')"
    fi
  done
}
# --- ai status (end) -----------------------------------------------------
case "${1:-run}" in
  status)  ai_status ;;
  stop)    stop_gw; stop_iqai; stop_ki; stop_eit; stop_torch; stop_phone; stop_cai; bash "$LAUNCHER" stop ;;
  restart) stop_gw; stop_iqai; stop_ki; stop_eit; stop_torch; stop_phone; stop_cai; bash "$LAUNCHER" stop; exec bash "$0" run ;;
  run)
    stop_gw
    start_iqai
    start_ki
    start_eit
    start_torch
    start_phone
    start_cai
    start_ksv
    start_mik
    bash "$LAUNCHER" run &
    LPID=$!
    for _ in $(seq 1 90); do
      curl -fsS -o /dev/null -m 2 http://127.0.0.1:8787/api/status 2>/dev/null && break
      sleep 1
    done
    ( cd "$GW" && set -a && . ./.env && set +a && PORT=4000 exec node "$GW/server.js" ) &
    GPID=$!
    echo "  ✔ KSV gateway    :4000"
    echo "  → AI http://localhost:5175   MI-K 3D http://localhost:5176"
    trap 'stop_iqai; stop_ki; stop_eit; stop_torch; stop_phone; stop_cai; kill $GPID 2>/dev/null; kill $LPID 2>/dev/null; wait 2>/dev/null; exit' INT TERM
    wait $LPID
    kill $GPID 2>/dev/null
    stop_iqai
    stop_ki
    stop_eit
    stop_torch
    stop_phone
    stop_cai
    ;;
  *) echo "usage: ai [run|stop|restart|status]"; exit 1 ;;
esac
