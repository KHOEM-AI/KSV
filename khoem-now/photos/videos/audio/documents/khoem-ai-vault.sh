#!/bin/bash
# =============================================================
# KHOEM-AI Vault - រៀបចំថត + ការពារដោយ password
# =============================================================

VAULT="$HOME/KHOEM-AI"

setup() {
  mkdir -p "$VAULT"/{photos,videos,audio,documents,code}
  echo "✅ បង្កើតថត KHOEM-AI រួចរាល់:"
  echo "   $VAULT/photos"
  echo "   $VAULT/videos"
  echo "   $VAULT/audio"
  echo "   $VAULT/documents"
  echo "   $VAULT/code"
}

organize() {
  cd "$VAULT" || exit 1
  find . -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.webp" \) -exec mv {} photos/ \; 2>/dev/null
  find . -maxdepth 1 -type f \( -iname "*.mp4" -o -iname "*.mov" -o -iname "*.mkv" \) -exec mv {} videos/ \; 2>/dev/null
  find . -maxdepth 1 -type f \( -iname "*.mp3" -o -iname "*.wav" -o -iname "*.m4a" \) -exec mv {} audio/ \; 2>/dev/null
  find . -maxdepth 1 -type f \( -iname "*.py" -o -iname "*.js" -o -iname "*.ts" -o -iname "*.sh" -o -iname "*.json" \) -exec mv {} code/ \; 2>/dev/null
  find . -maxdepth 1 -type f \( -iname "*.txt" -o -iname "*.md" -o -iname "*.pdf" \) -exec mv {} documents/ \; 2>/dev/null
  echo "✅ ឯកសារត្រូវបានរៀបចំរួចរាល់"
}

# ការពារ — encrypt ថតទាំងមូលទៅជា .enc file តាមលេខសម្ងាត់
lock() {
  read -srp "🔒 កំណត់ password ការពារ: " pw
  echo ""
  tar -czf - "$VAULT" 2>/dev/null | openssl enc -aes-256-cbc -pbkdf2 -salt -pass pass:"$pw" -out "$HOME/KHOEM-AI.locked"
  echo "✅ ការពាររួចរាល់! ឯកសារ: $HOME/KHOEM-AI.locked"
  echo "⚠️ សូមចាំ password នេះ — បើភ្លេចមិនអាចបើកមកវិញបានទេ!"
}

# ដោះការពារ — decrypt មកវិញ
unlock() {
  read -srp "🔓 វាយ password: " pw
  echo ""
  openssl enc -d -aes-256-cbc -pbkdf2 -salt -pass pass:"$pw" -in "$HOME/KHOEM-AI.locked" | tar -xzf - -C "$HOME"
  echo "✅ ដោះការពាររួច! មើលនៅ: $VAULT"
}

case "$1" in
  setup) setup ;;
  organize) organize ;;
  lock) lock ;;
  unlock) unlock ;;
  *)
    echo "របៀបប្រើ:"
    echo "  bash khoem-ai-vault.sh setup     — បង្កើតថតដំបូង"
    echo "  bash khoem-ai-vault.sh organize  — រៀបចំឯកសារចូលថតត្រឹមត្រូវ"
    echo "  bash khoem-ai-vault.sh lock      — ការពារដោយ password"
    echo "  bash khoem-ai-vault.sh unlock    — ដោះការពារ"
    ;;
esac

