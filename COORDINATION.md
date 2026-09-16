# ⚠️ COORDINATION NOTICE — READ BEFORE EDITING

Multiple Claude sessions are working on this repo in parallel and causing
merge conflicts (uncommitted UI experiments, backup files, git pull failures).

RULE FOR ANY NEW SESSION:
1. Before making changes, run `git status` first.
2. If there are uncommitted changes not yours, DO NOT delete or overwrite them.
3. Commit your own work with a clear message immediately — do not leave
   large uncommitted change sets sitting in the working tree.
4. Do not use `.backup` / `.auth-backup` loose files in the repo root or
   src/ — use git history (git log, git diff) instead of manual backup files.
5. Before touching src/server.ts, check for /api/authz/check and
   /api/settings — these are verified working, do not remove them.
