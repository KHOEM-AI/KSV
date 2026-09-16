#!/bin/bash
# =============================================================
# KSV — Build & Verification Script (Bash / Termux)
# Location: khoem-now/scripts/build.sh
#
# Bash equivalent of build.ps1 — same 3-step verification:
#   1. npm run typecheck
#   2. git diff --check
#   3. npm run build
# =============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

step() { echo ""; echo "=== $1 ==="; }
fail() { echo ""; echo "BUILD FAILED: $1"; exit 1; }

step "1/4 Install dependencies"
npm install || fail "npm install failed"

step "2/4 Typecheck (tsc --noEmit)"
npm run typecheck || fail "Typecheck did not PASS. Fix reported errors — do NOT rewrite architecture to silence them."
echo "Typecheck: PASS"

step "3/4 Git diff sanity check"
git diff --check || fail "git diff --check found whitespace errors or leftover conflict markers."
echo "Git diff check: PASS"

step "4/4 Production build"
npm run build || fail "npm run build failed"
echo "Build: PASS"

step "Summary"
echo "Typecheck : PASS"
echo "Diff check: PASS"
echo "Build     : PASS"
echo ""
echo "Reminder: a passing build does NOT mean physical devices are"
echo "connected. Gateway/Protocol dispatch still fails closed until"
echo "a real transport adapter is configured and verified."
