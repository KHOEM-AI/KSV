#!/usr/bin/env bash
# KSV: ai [run|stop|restart]  = KHOEM_AI (:8790) + AI (:8787, UI :5175) + KSV gateway (:4000)
LAUNCHER="$HOME/KHOEM_AI/KHOEM_AI/ai.sh"
GW="$HOME/KSV/gateway"
export AI_DIR="${AI_DIR:-$HOME/ai-project/AI}"

stop_gw() { pkill -f "$GW/server.js" 2>/dev/null; }

IQPID="$HOME/.iqai.pid"
stop_iqai() { [ -f "$IQPID" ] && kill "$(cat "$IQPID")" 2>/dev/null; rm -f "$IQPID"; }
start_iqai() {
  stop_iqai
  TF="$HOME/.iqai-token"
  if [ ! -s "$TF" ]; then head -c 24 /dev/urandom | od -An -tx1 | tr -d ' \n' > "$TF"; chmod 600 "$TF"; fi
  export IQAI_TOKEN="$(cat "$TF")"
  ( cd "$HOME/IQ-AI" && PORT=8799 exec node src/server/server.mjs >"$HOME/iqai.log" 2>&1 ) &
  echo $! > "$IQPID"
  echo "  ✔ IQ-AI media    :8799"
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
CAI_SH="$HOME/CAI/ai.sh"
start_cai() { [ -f "$CAI_SH" ] && bash "$CAI_SH" start; }
# stop_cai also stops the KSV UI/API, so every existing stop path covers them
stop_cai() { [ -f "$CAI_SH" ] && bash "$CAI_SH" stop >/dev/null 2>&1; stop_ksv; }
case "${1:-run}" in
  stop)    stop_gw; stop_iqai; stop_ki; stop_eit; stop_cai; bash "$LAUNCHER" stop ;;
  restart) stop_gw; stop_iqai; stop_ki; stop_eit; stop_cai; bash "$LAUNCHER" stop; exec bash "$0" run ;;
  run)
    stop_gw
    start_iqai
    start_ki
    start_eit
    start_cai
    start_ksv
    bash "$LAUNCHER" run &
    LPID=$!
    for _ in $(seq 1 90); do
      curl -fsS -o /dev/null -m 2 http://127.0.0.1:8787/api/status 2>/dev/null && break
      sleep 1
    done
    ( cd "$GW" && set -a && . ./.env && set +a && PORT=4000 exec node "$GW/server.js" ) &
    GPID=$!
    echo "  ✔ KSV gateway    :4000"
    trap 'stop_iqai; stop_ki; stop_eit; stop_cai; kill $GPID 2>/dev/null; kill $LPID 2>/dev/null; wait 2>/dev/null; exit' INT TERM
    wait $LPID
    kill $GPID 2>/dev/null
    stop_iqai
    stop_ki
    stop_eit
    stop_cai
    ;;
  *) echo "usage: ai [run|stop|restart]"; exit 1 ;;
esac
