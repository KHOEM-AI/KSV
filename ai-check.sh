#!/usr/bin/env bash
# KHOEM-AI API check: read-only. Usage: bash ~/KSV/ai-check.sh
ok=0; bad=0
chk() { # name expected url [curl args...]
  local n="$1" want="$2" url="$3"; shift 3
  local got i
  for i in $(seq 1 "${AI_CHECK_WAIT:-1}"); do
    got=$(curl -s -m 4 -o /dev/null -w '%{http_code}' "$@" "$url" 2>/dev/null)
    [ "$got" = "$want" ] && break
    sleep 2
  done
  if [ "$got" = "$want" ]; then printf '  ✔ %-34s %s\n' "$n" "$got"; ok=$((ok+1))
  else printf '  ✘ %-34s got %s, want %s\n' "$n" "$got" "$want"; bad=$((bad+1)); fi
}
echo "KI (token required):"
chk "KI healthz (open)"            200 http://127.0.0.1:5001/api/healthz
chk "KI scans, no token"           401 http://127.0.0.1:5001/api/scans
echo "Proxies (token added server-side):"
chk "AI  /ki colors"               200 http://127.0.0.1:5175/ki/api/colors
chk "AI  /ki registry/apis"        200 http://127.0.0.1:5175/ki/api/registry/apis
chk "AI  /ki scans"                 200 http://127.0.0.1:5175/ki/api/scans
chk "AI  /ki registry/x (blocked)"  403 http://127.0.0.1:5175/ki/api/registry/../scans/x
chk "MI-K /ki scans"               200 http://127.0.0.1:5176/ki/api/scans
chk "MI-K /ki registry/apis (blk)" 403 http://127.0.0.1:5176/ki/api/registry/apis
chk "CAI /ki scans"                200 http://127.0.0.1:5180/ki/api/scans
chk "CAI /ki colors (blocked)"     403 http://127.0.0.1:5180/ki/api/colors
echo "Other services:"
chk "KHOEM_AI health"              200 http://127.0.0.1:8790/health
chk "AI backend status"            200 http://127.0.0.1:8787/api/status
chk "EI-T health"                  200 http://127.0.0.1:3100/health
chk "KSV API health"               200 http://127.0.0.1:3000/api/health
chk "KSV gateway (needs token)"    401 http://127.0.0.1:4000/api/chat
chk "CIDC health"                  200 http://127.0.0.1:8800/api/cidc/health
echo
echo "ok=$ok  bad=$bad"
[ "$bad" = 0 ]
