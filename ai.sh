#!/usr/bin/env bash
# KSV: ai [run|stop|restart]  = KHOEM_AI (:8790) + AI (:8787, UI :5175) + KSV gateway (:4000)
LAUNCHER="$HOME/KHOEM_AI/KHOEM_AI/ai.sh"
GW="$HOME/KSV/gateway"
export AI_DIR="${AI_DIR:-$HOME/ai-project/AI}"

stop_gw() { pkill -f "$GW/server.js" 2>/dev/null; pkill -f "node server.js" 2>/dev/null; }

case "${1:-run}" in
  stop)    stop_gw; bash "$LAUNCHER" stop ;;
  restart) stop_gw; bash "$LAUNCHER" stop; exec bash "$0" run ;;
  run)
    stop_gw
    bash "$LAUNCHER" run &
    LPID=$!
    for _ in $(seq 1 90); do
      curl -fsS -o /dev/null -m 2 http://127.0.0.1:8787/api/status 2>/dev/null && break
      sleep 1
    done
    ( cd "$GW" && set -a && . ./.env && set +a && PORT=4000 exec node server.js ) &
    GPID=$!
    echo "  ✔ KSV gateway    :4000"
    trap 'kill $GPID 2>/dev/null; kill $LPID 2>/dev/null; wait 2>/dev/null; exit' INT TERM
    wait $LPID
    kill $GPID 2>/dev/null
    ;;
  *) echo "usage: ai [run|stop|restart]"; exit 1 ;;
esac
