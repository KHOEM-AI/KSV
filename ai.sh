#!/usr/bin/env bash
# KHOEM-AI launcher (one file).  ai [run|stop|restart|status|check|brand [--approve]|audit]
#   run/stop/restart = KHOEM_AI (:8790) + AI (:8787, UI :5175) + KSV gateway (:4000) + KI API (:5001) + MI-K 3D (:5176) + others
#   status = one line per service      check = API test (set AI_CHECK_WAIT=30 to retry ~60s)
#   brand  = KHOEM-AI name/logo guard  audit = read-only list of what is installed/running/pushed
LAUNCHER="$HOME/KHOEM_AI/KHOEM_AI/ai.sh"
GW="$HOME/KSV/gateway"
export AI_DIR="${AI_DIR:-$HOME/ai-project/AI}"

# token for the phone bridges (outside git, chmod 600); the gateway and both bridges inherit it
PBT_FILE="$HOME/.phone-bridge-token"
if [ ! -s "$PBT_FILE" ]; then head -c 24 /dev/urandom | od -An -tx1 | tr -d ' \n' > "$PBT_FILE"; chmod 600 "$PBT_FILE"; fi
export PHONE_BRIDGE_TOKEN="$(cat "$PBT_FILE")"

stop_gw() { pkill -f "$GW/server.js" 2>/dev/null; }

IQPID="$HOME/.iqai.pid"
stop_iqai() {
  [ -f "$IQPID" ] && kill "$(cat "$IQPID")" 2>/dev/null
  rm -f "$IQPID"
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

# KHOEM-AI: local FerretDB + SQLite
FDB_BIN="${FDB_BIN:-$HOME/go/bin/ferretdb}"
DB_DIR="${KSV_DB_DIR:-$HOME/KHOEM-AI}"
DBPID="$HOME/.ferretdb.pid"

stop_db() {
  if [ -f "$DBPID" ]; then
    kill "$(cat "$DBPID")" 2>/dev/null || true
    rm -f "$DBPID"
  fi
}

start_db() {
  [ -x "$FDB_BIN" ] || {
    echo "  x KHOEM-AI: FerretDB binary not found"
    return 1
  }

  if (echo > /dev/tcp/127.0.0.1/27017) 2>/dev/null; then
    echo "  ✔ KHOEM-AI     :27017 (already running)"
    return 0
  fi

  mkdir -p "$DB_DIR" || return 1
  chmod 700 "$DB_DIR"

  GOMAXPROCS=2 "$FDB_BIN" \
    --handler=sqlite \
    --sqlite-url="file:$DB_DIR/" \
    --listen-addr=127.0.0.1:27017 \
    --debug-addr=127.0.0.1:8088 \
    --telemetry=disable \
    > "$HOME/ferretdb.log" 2>&1 &

  echo $! > "$DBPID"

  for _ in $(seq 1 15); do
    if (echo > /dev/tcp/127.0.0.1/27017) 2>/dev/null; then
      echo "  ✔ KHOEM-AI     :27017"
      return 0
    fi
    sleep 1
  done

  echo "  x KHOEM-AI not ready; see ~/ferretdb.log"
  return 1
}

# MI-K 3D studio (~/MI-K-VISION-3D): UI :5176 (never 5173). Log: ~/mik-3d.log
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
CAI_SH="$HOME/CAI/ai.sh"
start_cai() { [ -f "$CAI_SH" ] && bash "$CAI_SH" start; }
# stop_cai also stops the KSV UI/API and MI-K, so every stop path covers them
stop_cai() { [ -f "$CAI_SH" ] && bash "$CAI_SH" stop >/dev/null 2>&1; stop_ksv; stop_mik; stop_db; }

# ===== ai status =====
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
  svc "KSV database" 8088 /debug/readyz
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

# ===== ai check (read-only API test) =====
CK_OK=0; CK_BAD=0; CK_WARN=0
cchk() { # name expected url [curl args...]   (optional=1 in CK_OPT -> warning only)
  local n="$1" want="$2" url="$3"; shift 3
  local got i
  for i in $(seq 1 "${AI_CHECK_WAIT:-1}"); do
    got=$(curl -s -m 4 -o /dev/null -w '%{http_code}' "$@" "$url" 2>/dev/null)
    [ "$got" = "$want" ] && break
    sleep 2
  done
  if [ "$got" = "$want" ]; then printf '  ✔ %-34s %s\n' "$n" "$got"; CK_OK=$((CK_OK+1))
  elif [ "${CK_OPT:-0}" = 1 ]; then printf '  ⚠ %-34s got %s, want %s (optional)\n' "$n" "$got" "$want"; CK_WARN=$((CK_WARN+1))
  else printf '  ✘ %-34s got %s, want %s\n' "$n" "$got" "$want"; CK_BAD=$((CK_BAD+1)); fi
}
# Like cchk, for KI routes that need x-ki-token. The token is read from ~/KI/.env and given to curl through a
# config file descriptor, so it never appears on a command line (ps) and is never printed.
kchk() { # name expected path   (CK_OPT=1 -> warning only)
  local n="$1" want="$2" path="$3" tok got i
  tok=$(grep -m1 '^KI_API_TOKEN=' "$HOME/KI/.env" 2>/dev/null | cut -d= -f2-)
  if [ -z "$tok" ]; then printf '  ⚠ %-34s skipped (no KI_API_TOKEN in ~/KI/.env)\n' "$n"; CK_WARN=$((CK_WARN+1)); return; fi
  for i in $(seq 1 "${AI_CHECK_WAIT:-1}"); do
    got=$(curl -s -m 6 -o /dev/null -w '%{http_code}' -K <(printf 'header = "x-ki-token: %s"\n' "$tok") "http://127.0.0.1:5001$path" 2>/dev/null)
    [ "$got" = "$want" ] && break
    sleep 2
  done
  if [ "$got" = "$want" ]; then printf '  ✔ %-34s %s\n' "$n" "$got"; CK_OK=$((CK_OK+1))
  elif [ "${CK_OPT:-0}" = 1 ]; then printf '  ⚠ %-34s got %s, want %s (optional)\n' "$n" "$got" "$want"; CK_WARN=$((CK_WARN+1))
  else printf '  ✘ %-34s got %s, want %s\n' "$n" "$got" "$want"; CK_BAD=$((CK_BAD+1)); fi
}
ai_check() {
  CK_OK=0; CK_BAD=0; CK_WARN=0
  echo "KI (token required):"
  cchk "KI healthz (open)"            200 http://127.0.0.1:5001/api/healthz
  cchk "KI scans, no token"           401 http://127.0.0.1:5001/api/scans
  echo "Proxies (token added server-side):"
  cchk "AI  /ki colors"               200 http://127.0.0.1:5175/ki/api/colors
  cchk "AI  /ki registry/apis"        200 http://127.0.0.1:5175/ki/api/registry/apis
  cchk "AI  /ki scans"                200 http://127.0.0.1:5175/ki/api/scans
  cchk "MI-K /ki scans"               200 http://127.0.0.1:5176/ki/api/scans
  cchk "MI-K /ki registry/apis (blk)" 403 http://127.0.0.1:5176/ki/api/registry/apis
  cchk "CAI /ki scans"                200 http://127.0.0.1:5180/ki/api/scans
  cchk "CAI /ki colors (blocked)"     403 http://127.0.0.1:5180/ki/api/colors
  echo "Other services:"
  cchk "KHOEM_AI health"              200 http://127.0.0.1:8790/health
  cchk "AI backend status"            200 http://127.0.0.1:8787/api/status
  cchk "EI-T health"                  200 http://127.0.0.1:3100/health
  cchk "KSV gateway (needs token)"    401 http://127.0.0.1:4000/api/chat
  cchk "CIDC health"                  200 http://127.0.0.1:8800/api/cidc/health
  CK_OPT=1 cchk "KSV API health"      200 http://127.0.0.1:3000/api/health
  cchk "CIDC UI"                      200 http://127.0.0.1:5190/
  echo "KI /v1 and /gw (token from ~/KI/.env):"
  cchk "KI /v1, no token"             401 http://127.0.0.1:5001/v1
  cchk "KI /gw, no token"             401 http://127.0.0.1:5001/gw
  kchk "KI /v1 index"                 200 /v1
  kchk "KI /v1/system"                200 /v1/system
  kchk "KI /gw service list"          200 /gw
  kchk "KI /v1/ksv"                   200 /v1/ksv
  echo "Through the KI gateway (warning only: needs each module's key in ~/KI/.env):"
  CK_OPT=1 kchk "gw ai health"        200 /gw/ai/api/health
  CK_OPT=1 kchk "gw lang health"      200 /gw/lang/health
  CK_OPT=1 kchk "gw ei-t health"      200 /gw/ei-t/health
  CK_OPT=1 kchk "gw cidc health"      200 /gw/cidc/health
  CK_OPT=1 kchk "gw iqai health"      200 /gw/iqai/health
  echo
  echo "ok=$CK_OK  bad=$CK_BAD  warn=$CK_WARN"
  [ "$CK_BAD" = 0 ]
}

# ===== ai brand [--approve] (name KHOEM-AI must stay; logo must not change by accident) =====
ai_brand() {
  local UI="${UI_DIR:-$HOME/ai-project/AI}" LOCK="${BRAND_LOCK:-$HOME/KSV/brand.lock}" NAME="KHOEM-AI" FAIL=0 f sum want
  local TEXTS=("$UI/index.html" "$UI/src/App.tsx") LOGOS=("$UI/public/logo.png")
  _bs() { printf '~/%s' "${1#"$HOME"/}"; }
  echo "brand ($NAME):"
  for f in "${TEXTS[@]}"; do
    if [ ! -f "$f" ]; then printf '  ✘ %s not found\n' "$(_bs "$f")"; FAIL=1
    elif grep -q "$NAME" "$f"; then printf '  ✔ name "%s" in %s\n' "$NAME" "$(_bs "$f")"
    else printf '  ✘ name "%s" is MISSING from %s\n' "$NAME" "$(_bs "$f")"; FAIL=1; fi
  done
  for f in "${LOGOS[@]}"; do
    if [ ! -f "$f" ]; then printf '  ✘ logo %s not found\n' "$(_bs "$f")"; FAIL=1; continue; fi
    sum=$(sha256sum "$f" | cut -d' ' -f1)
    if [ "${1:-}" = "--approve" ]; then
      [ "$FAIL" = 0 ] || { echo "  ✘ not approving: fix the name first"; return 1; }
      mkdir -p "$(dirname "$LOCK")"
      { grep -v " $f\$" "$LOCK" 2>/dev/null; echo "$sum  $f"; } > "$LOCK.tmp" && mv "$LOCK.tmp" "$LOCK"
      printf '  ✔ logo approved: %s (%s)\n' "$(_bs "$f")" "${sum:0:12}"
      continue
    fi
    want=$(grep " $f\$" "$LOCK" 2>/dev/null | cut -d' ' -f1)
    if [ -z "$want" ]; then printf '  ! logo %s not approved yet: run  ai brand --approve\n' "$(_bs "$f")"
    elif [ "$want" = "$sum" ]; then printf '  ✔ logo unchanged: %s\n' "$(_bs "$f")"
    else printf '  ✘ logo CHANGED: %s (approved %s, now %s) - if on purpose: ai brand --approve\n' "$(_bs "$f")" "${want:0:12}" "${sum:0:12}"; FAIL=1; fi
  done
  [ "$FAIL" = 0 ] && echo "BRAND OK" || echo "BRAND CHANGED"
  return "$FAIL"
}

# ===== ai audit (read-only: what is installed, running, pushed) =====
AU_OK=0; AU_BAD=0
achk() { # label hint command...
  local label="$1" hint="$2"; shift 2
  if "$@" >/dev/null 2>&1; then printf '  ✔ %s\n' "$label"; AU_OK=$((AU_OK+1))
  else printf '  ✘ %s   → %s\n' "$label" "$hint"; AU_BAD=$((AU_BAD+1)); fi
}
au_has()  { grep -q -- "$2" "$1" 2>/dev/null; }
au_file() { [ -f "$1" ]; }
au_http() { local code; code=$(curl -s -m 4 -o /dev/null -w '%{http_code}' ${3:+-X "$3"} -H "Authorization: Bearer $(cat "$HOME/.iqai-token" 2>/dev/null)" "http://127.0.0.1:8799$1" 2>/dev/null); [ "$code" = "$2" ]; }
ai_audit() {
  local IQ="$HOME/IQ-AI" UI="$HOME/ai-project/AI" KSV="$HOME/KSV" MIK="$HOME/MI-K-VISION-3D" d up
  AU_OK=0; AU_BAD=0
  c16() { [ "$(ls "$UI/public/vehicles"/*.png 2>/dev/null | wc -l)" -eq 16 ]; }
  k3()  { [ "$(grep -c 'createKaraokeGeometry(THREE, item.shape' "$MIK/src/components/Studio3D.tsx" 2>/dev/null)" = 3 ]; }
  echo "IQ-AI server (~/IQ-AI)"
  achk "slideshow route + module"        "bash iqai-slideshow-patch.sh"   au_file "$IQ/src/server/routes/videoSlideshow.mjs"
  achk "story route + module"            "bash iqai-story-patch.sh"       au_file "$IQ/src/video/story.mjs"
  achk "jobs queue (merged from main)"   "git merge origin/iqai-jobs-phase1" au_file "$IQ/src/jobs/jobManager.mjs"
  achk "merge videos route"              "git merge origin/iqai-jobs-phase1" au_file "$IQ/src/server/routes/videoMerge.mjs"
  achk "story is a job (video.story)"    "bash iqai-story-job-patch.sh"   au_has "$IQ/src/jobs/handlers.mjs" "video.story"
  achk "narrated story (voice)"          "bash iqai-story-voice-patch.sh" au_has "$IQ/src/jobs/handlers.mjs" "buildNarrationTrack"
  achk "TTS engine switched on (.env)"   "add IQAI_TTS=edge to ~/IQ-AI/.env" au_has "$IQ/.env" "IQAI_TTS=edge"
  achk "running: GET /videos/story = 200" "ai restart"                   au_http /api/v1/videos/story 200
  achk "running: GET /jobs = 200"        "ai restart"                     au_http /api/v1/jobs 200
  achk "running: merge route answers (400)" "ai restart"                  au_http /api/v1/videos/merge 400 POST
  echo "UI (~/ai-project/AI)"
  achk "Slideshow tab"                   "bash ui-slideshow-patch.sh"     au_file "$UI/src/components/SlideshowTab.tsx"
  achk "Story tab (runs as a job)"       "bash ui-story-job-patch.sh"     au_has "$UI/src/components/StoryTab.tsx" "iqaiStartJob"
  achk "Story projects (save/open)"      "bash ui-story-projects-patch.sh" au_has "$UI/src/components/StoryTab.tsx" "storyProjects"
  achk "Story narration voices"          "bash ui-story-voice-patch.sh"   au_has "$UI/src/components/StoryTab.tsx" "iqaiVoices"
  achk "Create panel shows Story + Finish" "bash ui-story-patch2.sh / ui-finish-patch.sh" sh -c "grep -q StoryTab '$UI/src/components/CreatePanel.tsx' && grep -q FinishTab '$UI/src/components/CreatePanel.tsx'"
  achk "Finish tab (mix + subtitles)"    "bash ui-finish-patch.sh"        au_file "$UI/src/components/FinishTab.tsx"
  achk "3D vehicle viewer files"         "bash ui-cars-patch.sh"          au_file "$UI/src/components/ModelViewer.tsx"
  achk "16 vehicle pictures"             "copy khoem-ai-cars.zip to Downloads, rerun ui-cars-patch.sh" c16
  achk "3D Studio has the Cars button"   "bash ui-cars-wire-patch.sh"     au_has "$UI/src/components/ThreeDStudio.tsx" "ModelViewer"
  achk "brand: name in index.html"       "restore KHOEM-AI"               au_has "$UI/index.html" "KHOEM-AI"
  achk "brand: logo file present"        "restore public/logo.png"        au_file "$UI/public/logo.png"
  echo "ai command (~/KSV)"
  achk "ai status"                       "restore ai.sh"                  au_has "$KSV/ai.sh" "ai_status()"
  achk "ai check / ai brand / ai audit"  "restore ai.sh"                  au_has "$KSV/ai.sh" "ai_brand()"
  achk "brand logo approved"             "ai brand --approve"             au_has "$KSV/brand.lock" "logo.png"
  echo "MI-K-VISION-3D"
  achk "karaoke in HTML export (3 calls)" "bash patch-karaoke.sh"         k3
  echo "git (branch, uncommitted files, commits not pushed)"
  for d in "$IQ" "$UI" "$KSV" "$MIK"; do
    if git -C "$d" rev-parse --git-dir >/dev/null 2>&1; then
      up=$(git -C "$d" rev-list --count '@{u}..HEAD' 2>/dev/null || echo '?')
      printf '  %-22s %-24s uncommitted %-3s unpushed %s\n' "~/${d#"$HOME"/}" "$(git -C "$d" rev-parse --abbrev-ref HEAD 2>/dev/null)" \
        "$(git -C "$d" status --porcelain 2>/dev/null | wc -l | tr -d ' ')" "$up"
    fi
  done
  echo
  echo "done: $AU_OK ok, $AU_BAD to do"
}

case "${1:-run}" in
  status)  ai_status ;;
  check)   ai_check ;;
  brand)   ai_brand "${2:-}" ;;
  audit)   ai_audit ;;
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
    start_db
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
  *) echo "usage: ai [run|stop|restart|status|check|brand [--approve]|audit]"; exit 1 ;;
esac
