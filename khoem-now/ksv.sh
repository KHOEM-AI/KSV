#!/bin/bash
cd ~/KSV/khoem-now || exit 1
case "$1" in
  pull) git pull origin main ;;
  build) npm install && npm run build ;;
  dev) npm install && npm run dev ;;
  push)
    git add -A
    read -p "សរសេរសារពន្យល់ការកែ (commit message): " msg
    git commit -m "$msg"
    git push origin main
    ;;
  status) git status && git log --oneline -5 ;;
  *) echo "ប្រើ: ./ksv.sh pull | build | dev | push | status" ;;
esac
