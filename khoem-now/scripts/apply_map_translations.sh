#!/bin/bash
# ដំណើរការនៅ ~/KSV/khoem-now — ត្រូវមាន folder i18n_map_keys/ (10 file .txt) នៅ folder ជាមួយគ្នា
# ដាក់ view.map.* + nav.map key ចូល translations.ts សម្រាប់ភាសាទាំង 10
set -e

FILE="src/i18n/translations.ts"
KEYS_DIR="./i18n_map_keys"

if [ ! -f "$FILE" ]; then
  echo "រកមិនឃើញ $FILE — សូមប្រាកដថារត់ពី ~/KSV/khoem-now"
  exit 1
fi

for lang in en km ja zh th ko fr es vi ar; do
  keyfile="$KEYS_DIR/$lang.txt"
  if [ ! -f "$keyfile" ]; then
    echo "⚠️  រកមិនឃើញ $keyfile — skip $lang"
    continue
  fi

  # ត្រូវពិនិត្យថា block នេះមានក្នុង translations.ts ដែរឬអត់ជាមុន
  if ! grep -q "^const ${lang}: Dict = {" "$FILE"; then
    echo "⚠️  រកមិនឃើញ 'const ${lang}: Dict = {' ក្នុង translations.ts — skip $lang (ត្រូវពិនិត្យដោយដៃ)"
    continue
  fi

  # ត្រូវពិនិត្យថាមិនទាន់មាន key នេះស្រាប់ (កុំបញ្ចូលស្ទួន)
  if grep -q "'view.map.title'" "$FILE" && awk "/^const ${lang}: Dict = {/,/^};/" "$FILE" | grep -q "'view.map.title'"; then
    echo "ℹ️  $lang មាន view.map.title ស្រាប់ហើយ — skip"
    continue
  fi

  sed -i "/^const ${lang}: Dict = {/r ${keyfile}" "$FILE"
  echo "✅ បញ្ចូល key ចូល '$lang' ស្រេច"
done

echo ""
echo "=== ត្រួតពិនិត្យលទ្ធផល ==="
grep -c "'nav.map'" "$FILE"
