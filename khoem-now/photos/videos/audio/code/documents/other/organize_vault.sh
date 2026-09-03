#!/bin/bash
# =============================================================
# Organize Vault - រៀបចំឯកសារចាស់ចូលថតត្រឹមត្រូវតាមប្រភេទ
# Run: bash organize_vault.sh /path/to/your/vault
# =============================================================

VAULT="${1:-$HOME/AI_369_Vault}"

if [ ! -d "$VAULT" ]; then
  echo "រកមិនឃើញថត: $VAULT"
  echo "ប្រើ: bash organize_vault.sh /path/to/vault"
  exit 1
fi

echo "កំពុងរៀបចំ: $VAULT"

# បង្កើតថតតាមប្រភេទ
mkdir -p "$VAULT/photos"
mkdir -p "$VAULT/videos"
mkdir -p "$VAULT/audio"
mkdir -p "$VAULT/code"
mkdir -p "$VAULT/documents"
mkdir -p "$VAULT/other"

cd "$VAULT" || exit 1

# ផ្លាស់ទីរូបថត
find . -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.webp" \) -exec mv {} photos/ \; 2>/dev/null

# ផ្លាស់ទីវីដេអូ
find . -maxdepth 1 -type f \( -iname "*.mp4" -o -iname "*.mov" -o -iname "*.avi" -o -iname "*.mkv" \) -exec mv {} videos/ \; 2>/dev/null

# ផ្លាស់ទីសំឡេង
find . -maxdepth 1 -type f \( -iname "*.mp3" -o -iname "*.wav" -o -iname "*.m4a" -o -iname "*.ogg" \) -exec mv {} audio/ \; 2>/dev/null

# ផ្លាស់ទីកូដ
find . -maxdepth 1 -type f \( -iname "*.py" -o -iname "*.js" -o -iname "*.ts" -o -iname "*.sh" -o -iname "*.json" -o -iname "*.html" \) -exec mv {} code/ \; 2>/dev/null

# ផ្លាស់ទីឯកសារ
find . -maxdepth 1 -type f \( -iname "*.txt" -o -iname "*.md" -o -iname "*.pdf" -o -iname "*.doc*" \) -exec mv {} documents/ \; 2>/dev/null

# អ្វីៗនៅសល់ទៅ other/
find . -maxdepth 1 -type f -exec mv {} other/ \; 2>/dev/null

echo ""
echo "រួចរាល់! សេចក្តីសង្ខេប:"
echo "  photos:    $(ls photos 2>/dev/null | wc -l) files"
echo "  videos:    $(ls videos 2>/dev/null | wc -l) files"
echo "  audio:     $(ls audio 2>/dev/null | wc -l) files"
echo "  code:      $(ls code 2>/dev/null | wc -l) files"
echo "  documents: $(ls documents 2>/dev/null | wc -l) files"
echo "  other:     $(ls other 2>/dev/null | wc -l) files"


