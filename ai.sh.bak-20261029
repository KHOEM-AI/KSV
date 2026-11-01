#!/usr/bin/env bash
# KSV: ai [run|stop|restart]  = KHOEM_AI (:8790) + AI (:8787, UI :5175) + KSV gateway (:4000)
LAUNCHER="$HOME/KHOEM_AI/KHOEM_AI/ai.sh"
GW="$HOME/KSV/gateway"
export AI_DIR="${AI_DIR:-$HOME/ai-project/AI}"

stop_gw() { pkill -f "$GW/server.js" 2>/dev/null; pkill -f "node server.js" 2>/dev/null; }

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
  command -v pnpm >/dev/null || { echo "  x KI API: pnpm not found"; return; }
  ( cd "$HOME/KI" && PORT=5001 exec pnpm --filter @workspace/api-server run dev >"$HOME/ki-api.log" 2>&1 ) &
  echo $! > "$KIPID"
  echo "  ✔ KI API         :5001"
}
case "${1:-run}" in
  stop)    stop_gw; stop_iqai; stop_ki; bash "$LAUNCHER" stop ;;
  restart) stop_gw; stop_iqai; stop_ki; bash "$LAUNCHER" stop; exec bash "$0" run ;;
  run)
    stop_gw
    start_iqai
    start_ki
    bash "$LAUNCHER" run &
    LPID=$!
    for _ in $(seq 1 90); do
      curl -fsS -o /dev/null -m 2 http://127.0.0.1:8787/api/status 2>/dev/null && break
      sleep 1
    done
    ( cd "$GW" && set -a && . ./.env && set +a && PORT=4000 exec node server.js ) &
    GPID=$!
    echo "  ✔ KSV gateway    :4000"
    trap 'stop_iqai; stop_ki; kill $GPID 2>/dev/null; kill $LPID 2>/dev/null; wait 2>/dev/null; exit' INT TERM
    wait $LPID
    kill $GPID 2>/dev/null
    stop_iqai
    stop_ki
    ;;
  *) echo "usage: ai [run|stop|restart]"; exit 1 ;;
esac
