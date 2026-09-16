# =============================================================
# KSV — Build & Verification Script (PowerShell)
# Location: khoem-now/scripts/build.ps1
#
# Mirrors the verification sequence already used on the project:
#   1. npm run typecheck   — must PASS before anything else
#   2. git diff --check    — no whitespace/conflict-marker issues
#   3. npm run build       — production build must succeed
#
# Engineering principle (per KSV progress log):
#   "Real -> Verifiable -> Usable -> Extensible -> Monetizable"
# This script exists so that principle is enforced automatically,
# not just remembered by whoever is at the keyboard.
# =============================================================

$ErrorActionPreference = "Stop"

function Write-Step($msg) {
    Write-Host ""
    Write-Host "=== $msg ===" -ForegroundColor Cyan
}

function Fail($msg) {
    Write-Host ""
    Write-Host "BUILD FAILED: $msg" -ForegroundColor Red
    exit 1
}

# Always run from the project root (khoem-now/), regardless of where
# the script was invoked from.
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
Set-Location $projectRoot

Write-Step "1/4 Install dependencies"
npm install
if ($LASTEXITCODE -ne 0) { Fail "npm install failed" }

Write-Step "2/4 Typecheck (tsc --noEmit)"
npm run typecheck
if ($LASTEXITCODE -ne 0) {
    Fail "Typecheck did not PASS. Fix the reported errors before building. Per project rule: do NOT rewrite architecture to silence errors — fix only what's broken."
}
Write-Host "Typecheck: PASS" -ForegroundColor Green

Write-Step "3/4 Git diff sanity check"
git diff --check
if ($LASTEXITCODE -ne 0) {
    Fail "git diff --check found whitespace errors or leftover conflict markers (<<<<<<<, =======, >>>>>>>)."
}
Write-Host "Git diff check: PASS" -ForegroundColor Green

Write-Step "4/4 Production build"
npm run build
if ($LASTEXITCODE -ne 0) { Fail "npm run build failed" }
Write-Host "Build: PASS" -ForegroundColor Green

Write-Step "Summary"
Write-Host "Typecheck : PASS" -ForegroundColor Green
Write-Host "Diff check: PASS" -ForegroundColor Green
Write-Host "Build     : PASS" -ForegroundColor Green
Write-Host ""
Write-Host "Reminder: a passing build does NOT mean physical devices are" -ForegroundColor Yellow
Write-Host "connected. Gateway/Protocol dispatch still fails closed until" -ForegroundColor Yellow
Write-Host "a real transport adapter is configured and verified." -ForegroundColor Yellow
