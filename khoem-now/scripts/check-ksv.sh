
#!/bin/bash
# =============================================================
# KSV - Project Health Check Script
# Location: khoem-now/check-ksv.sh
#
# Run this anytime to see the current state of the project:
# file locations, which scripts exist, dependencies installed,
# and whether .env is set up correctly (without printing secrets).
# =============================================================

echo "=================================================="
echo "  KSV Project Health Check"
echo "=================================================="

echo ""
echo "--- 1. Current directory ---"
pwd

echo ""
echo "--- 2. Security files (src/core/) ---"
for f in \
  "src/core/auth/auth.middleware.ts" \
  "src/core/auth/rbac.policy.ts" \
  "src/core/security/encryption.util.ts" \
  "src/core/security/audit.log.ts" \
  "src/core/security/rate-limiter.ts"
do
  if [ -f "$f" ]; then
    lines=$(wc -l < "$f")
    echo "  [OK]      $f  ($lines lines)"
  else
    echo "  [MISSING] $f"
  fi
done

echo ""
echo "--- 3. Database files (src/infrastructure/database/) ---"
for f in \
  "src/infrastructure/database/connection.ts" \
  "src/infrastructure/database/models.ts"
do
  if [ -f "$f" ]; then
    lines=$(wc -l < "$f")
    echo "  [OK]      $f  ($lines lines)"
  else
    echo "  [MISSING] $f"
  fi
done

echo ""
echo "--- 4. Checking for misplaced files ---"
if [ -f "src/infrastructure/database/audit.log.ts" ]; then
  echo "  [WARNING] audit.log.ts found in database/ - should be in core/security/ only!"
fi

echo ""
echo "--- 5. Scripts folder contents ---"
if [ -d "scripts" ]; then
  for f in scripts/*.mjs; do
    if [ -f "$f" ]; then
      echo ""
      echo "  ### $f ###"
      cat "$f"
      echo ""
      echo "  --- end of $f ---"
    fi
  done
else
  echo "  [MISSING] scripts/ folder not found"
fi

echo ""
echo "--- 6. Key dependencies installed? ---"
for pkg in mongoose @prisma/client prisma bcrypt jsonwebtoken express; do
  if [ -d "node_modules/$pkg" ]; then
    version=$(node -p "require('./node_modules/$pkg/package.json').version" 2>/dev/null)
    echo "  [OK]      $pkg@$version"
  else
    echo "  [MISSING] $pkg (not installed)"
  fi
done

echo ""
echo "--- 7. .env file check (values hidden for safety) ---"
if [ -f ".env" ]; then
  echo "  [OK] .env exists with $(wc -l < .env) lines"
  echo "  Keys present:"
  grep -oE '^[A-Z_]+=' .env | sed 's/=$/  [set]/'
else
  echo "  [MISSING] .env file not found"
fi

echo ""
echo "--- 8. Is .env safely git-ignored? ---"
if git check-ignore -q .env 2>/dev/null; then
  echo "  [SAFE] .env is git-ignored"
else
  echo "  [DANGER] .env is NOT git-ignored - it could be committed!"
fi

echo ""
echo "--- 9. Git status (uncommitted changes) ---"
git status --short

echo ""
echo "=================================================="
echo "  Health check complete"
echo "=================================================="
