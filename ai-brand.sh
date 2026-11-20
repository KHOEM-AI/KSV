#!/usr/bin/env bash
# KHOEM-AI brand guard: the name "KHOEM-AI" must stay in the app, and the logo must not change by accident.
#   bash ~/KSV/ai-brand.sh            check (exit 0 = all fine, 1 = something changed)
#   bash ~/KSV/ai-brand.sh --approve  record the CURRENT logo as the approved one (run once, and again only when you
#                                     change the logo on purpose). It refuses to approve while the name is missing.
# Read-only: it never edits a project file.
UI="${UI_DIR:-$HOME/ai-project/AI}"
LOCK="${BRAND_LOCK:-$HOME/KSV/brand.lock}"
NAME="KHOEM-AI"
TEXTS=("$UI/index.html" "$UI/src/App.tsx")
LOGOS=("$UI/public/logo.png")
FAIL=0
ok()  { printf '  ✔ %s\n' "$1"; }
bad() { printf '  ✘ %s\n' "$1"; FAIL=1; }
short() { printf '~/%s' "${1#"$HOME"/}"; }

echo "brand ($NAME):"
for f in "${TEXTS[@]}"; do
  if [ ! -f "$f" ]; then bad "$(short "$f") not found"
  elif grep -q "$NAME" "$f"; then ok "name \"$NAME\" in $(short "$f")"
  else bad "name \"$NAME\" is MISSING from $(short "$f")"
  fi
done
for f in "${LOGOS[@]}"; do
  if [ ! -f "$f" ]; then bad "logo $(short "$f") not found"; continue; fi
  sum=$(sha256sum "$f" | cut -d' ' -f1)
  if [ "${1:-}" = "--approve" ]; then
    [ "$FAIL" = 0 ] || { echo "  ✘ not approving: fix the name first"; exit 1; }
    mkdir -p "$(dirname "$LOCK")"
    { grep -v " $f\$" "$LOCK" 2>/dev/null; echo "$sum  $f"; } > "$LOCK.tmp" && mv "$LOCK.tmp" "$LOCK"
    ok "logo approved: $(short "$f") (${sum:0:12})"
    continue
  fi
  want=$(grep " $f\$" "$LOCK" 2>/dev/null | cut -d' ' -f1)
  if [ -z "$want" ]; then
    printf '  ! logo %s not approved yet: run  bash ~/KSV/ai-brand.sh --approve\n' "$(short "$f")"
  elif [ "$want" = "$sum" ]; then ok "logo unchanged: $(short "$f")"
  else bad "logo CHANGED: $(short "$f") (approved ${want:0:12}, now ${sum:0:12}) - if on purpose: bash ~/KSV/ai-brand.sh --approve"
  fi
done
[ "$FAIL" = 0 ] && echo "BRAND OK" || echo "BRAND CHANGED"
exit "$FAIL"
