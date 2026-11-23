#!/usr/bin/env bash
# Read-only audit: which of the pieces built in this chat are installed, running and pushed.
# Changes nothing. Run: bash ~/storage/downloads/ai-audit.sh   -> paste the output.
IQ="$HOME/IQ-AI"; UI="${UI_DIR:-$HOME/ai-project/AI}"; KSV="$HOME/KSV"; MIK="$HOME/MI-K-VISION-3D"
OK=0; BAD=0
chk() {  # chk "label" "fix hint" command...
  local label="$1" hint="$2"; shift 2
  if "$@" >/dev/null 2>&1; then printf '  ✔ %s\n' "$label"; OK=$((OK+1))
  else printf '  ✘ %s   → %s\n' "$label" "$hint"; BAD=$((BAD+1)); fi
}
has()  { grep -q -- "$2" "$1" 2>/dev/null; }          # has FILE TEXT
file() { [ -f "$1" ]; }
count16() { [ "$(ls "$UI/public/vehicles"/*.png 2>/dev/null | wc -l)" -eq 16 ]; }
karaoke3() { [ "$(grep -c 'createKaraokeGeometry(THREE, item.shape' "$MIK/src/components/Studio3D.tsx" 2>/dev/null)" = 3 ]; }
http() { local code; code=$(curl -s -m 4 -o /dev/null -w '%{http_code}' ${3:+-X "$3"} -H "Authorization: Bearer $(cat "$HOME/.iqai-token" 2>/dev/null)" "http://127.0.0.1:8799$1" 2>/dev/null); [ "$code" = "$2" ]; }

echo "IQ-AI server (~/IQ-AI)"
chk "slideshow route + module"        "bash iqai-slideshow-patch.sh"   file "$IQ/src/server/routes/videoSlideshow.mjs"
chk "story route + module"            "bash iqai-story-patch.sh"       file "$IQ/src/video/story.mjs"
chk "jobs queue (merged from main)"   "git merge origin/iqai-jobs-phase1" file "$IQ/src/jobs/jobManager.mjs"
chk "merge videos route"              "git merge origin/iqai-jobs-phase1" file "$IQ/src/server/routes/videoMerge.mjs"
chk "story is a job (video.story)"    "bash iqai-story-job-patch.sh"   has "$IQ/src/jobs/handlers.mjs" "video.story"
chk "narrated story (voice)"          "bash iqai-story-voice-patch.sh" has "$IQ/src/jobs/handlers.mjs" "buildNarrationTrack"
chk "TTS engine switched on (.env)"   "add IQAI_TTS=edge to ~/IQ-AI/.env" has "$IQ/.env" "IQAI_TTS=edge"
chk "running: GET /videos/story = 200" "ai restart"                   http /api/v1/videos/story 200
chk "running: GET /jobs = 200"        "ai restart"                     http /api/v1/jobs 200
chk "running: merge route answers (400 = needs ids)" "ai restart"      http /api/v1/videos/merge 400 POST

echo "UI (~/ai-project/AI)"
chk "Slideshow tab"                   "bash ui-slideshow-patch.sh"     file "$UI/src/components/SlideshowTab.tsx"
chk "Story tab (runs as a job)"       "bash ui-story-job-patch.sh"     has "$UI/src/components/StoryTab.tsx" "iqaiStartJob"
chk "Story projects (save/open)"      "bash ui-story-projects-patch.sh" has "$UI/src/components/StoryTab.tsx" "storyProjects"
chk "Story narration voices"          "bash ui-story-voice-patch.sh"   has "$UI/src/components/StoryTab.tsx" "iqaiVoices"
chk "Create panel shows Story + Finish" "bash ui-story-patch2.sh / ui-finish-patch.sh" sh -c "grep -q StoryTab '$UI/src/components/CreatePanel.tsx' && grep -q FinishTab '$UI/src/components/CreatePanel.tsx'"
chk "Finish tab (mix + subtitles)"    "bash ui-finish-patch.sh"        file "$UI/src/components/FinishTab.tsx"
chk "3D vehicle viewer files"         "bash ui-cars-patch.sh"          file "$UI/src/components/ModelViewer.tsx"
chk "16 vehicle pictures"             "copy khoem-ai-cars.zip to Downloads, rerun ui-cars-patch.sh" count16
chk "3D Studio has the Cars button"   "bash ui-cars-wire-patch.sh"     has "$UI/src/components/ThreeDStudio.tsx" "ModelViewer"
chk "brand: name in index.html"       "restore KHOEM-AI"               has "$UI/index.html" "KHOEM-AI"
chk "brand: logo file present"        "restore public/logo.png"        file "$UI/public/logo.png"

echo "ai command (~/KSV)"
chk "ai status"                       "bash ai-sh-patch.sh"            has "$KSV/ai.sh" "ai_status()"
chk "ai check script"                 "(made by another session)"      file "$KSV/ai-check.sh"
chk "brand guard script"              "cp ai-brand.sh ~/KSV/ then --approve" file "$KSV/ai-brand.sh"
chk "brand logo approved"             "bash ~/KSV/ai-brand.sh --approve" has "$KSV/brand.lock" "logo.png"
chk "IQ-AI own page started by ai"    "(optional, not done yet)"       has "$KSV/ai.sh" "start_iqui"

echo "MI-K-VISION-3D"
chk "karaoke in HTML export (3 calls)" "bash patch-karaoke.sh"         karaoke3

echo "git (branch, uncommitted files, commits not pushed)"
for d in "$IQ" "$UI" "$KSV" "$MIK"; do
  if git -C "$d" rev-parse --git-dir >/dev/null 2>&1; then
    up=$(git -C "$d" rev-list --count '@{u}..HEAD' 2>/dev/null || echo '?')
    printf '  %-22s %-24s uncommitted %-3s unpushed %s\n' "~/${d#"$HOME"/}" "$(git -C "$d" rev-parse --abbrev-ref HEAD 2>/dev/null)" \
      "$(git -C "$d" status --porcelain 2>/dev/null | wc -l | tr -d ' ')" "$up"
  fi
done
echo
echo "done: $OK ok, $BAD to do"
