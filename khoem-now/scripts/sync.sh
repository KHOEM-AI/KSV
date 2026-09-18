#!/data/data/com.termux/files/usr/bin/bash
# ======================================================================
# KSV — sync.sh
# Automates the steps this project has been doing by hand in Termux:
#   pull latest code -> check the i18n files exist -> install -> run dev
#
# Usage (from anywhere):
#   bash ~/KSV/khoem-now/sync.sh
# ======================================================================

set -e  # stop immediately if any step fails, instead of continuing broken

PROJECT_DIR="$HOME/KSV/khoem-now"
cd "$PROJECT_DIR" || { echo "❌ Project folder not found at $PROJECT_DIR"; exit 1; }

echo "📥 Step 1/4 — Pulling latest code from GitHub..."
git pull

echo ""
echo "🔎 Step 2/4 — Checking that the i18n (language) files exist..."
REQUIRED_FILES=(
  "src/i18n/translations.ts"
  "src/i18n/LanguageContext.tsx"
  "src/components/LanguageSelector.tsx"
  "src/data/countries.ts"
)
MISSING=0
for f in "${REQUIRED_FILES[@]}"; do
  if [ -f "$f" ]; then
    echo "  ✅ $f"
  else
    echo "  ⚠️  MISSING: $f"
    MISSING=1
  fi
done

if [ "$MISSING" -eq 1 ]; then
  echo ""
  echo "⚠️  Some i18n files are missing. Add them (via Bolt or by pasting"
  echo "   the code Claude gave you) before the language switcher will work."
fi

echo ""
echo "📦 Step 3/4 — Installing dependencies..."
npm install

echo ""
echo "🚀 Step 4/4 — Starting dev server..."
echo "   Once it says 'ready', open http://localhost:5173/ in your browser."
npm run dev
