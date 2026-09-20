// Regression guard: every path that sends a command to a device must sit behind
// the emergency-stop guard AND the Safety Engine. Fails (exit 1) if a new
// dispatch/publish path appears without them.
//   Run: node scripts/check-command-paths.mjs
import fs from "node:fs";
import path from "node:path";

const IGNORED = ["src/modules", "src/routes", "src/server/"]; // unused second stack (see API/README.md)
const PUBLISH_ALLOWED = ["src/infrastructure/mqtt/", "src/core/gateway/"];
const EXPECTED_DISPATCH_SITES = 3; // command route, scene activate, automation engine
const LOOKBACK = 150;

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name).split(path.sep).join("/");
    if (e.isDirectory()) walk(p);
    else if (p.endsWith(".ts") && !IGNORED.some((i) => p.startsWith(i))) files.push(p);
  }
})("src");

const problems = [];
let dispatchSites = 0;

for (const f of files) {
  const lines = fs.readFileSync(f, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (/\.dispatch\(/.test(line) && !/^\s*(\/\/|\*)/.test(line)) {
      dispatchSites++;
      const before = lines.slice(Math.max(0, i - LOOKBACK), i).join("\n");
      if (!/evaluateSafetyForDevice/.test(before)) problems.push(`${f}:${i + 1} dispatch without evaluateSafetyForDevice in the ${LOOKBACK} lines before it`);
      if (!/emergencystop/i.test(before)) problems.push(`${f}:${i + 1} dispatch without an emergency-stop check in the ${LOOKBACK} lines before it`);
    }
    if (/\.publish\(/.test(line) && !/^\s*(\/\/|\*)/.test(line) && !PUBLISH_ALLOWED.some((a) => f.startsWith(a))) {
      problems.push(`${f}:${i + 1} direct .publish( outside the gateway/mqtt layer`);
    }
  });
}

if (dispatchSites !== EXPECTED_DISPATCH_SITES) {
  problems.push(`expected ${EXPECTED_DISPATCH_SITES} dispatch sites, found ${dispatchSites} (new path added or scan broken) — review, then update EXPECTED_DISPATCH_SITES`);
}

console.log(`scanned ${files.length} files, dispatch sites: ${dispatchSites}`);
if (problems.length) {
  console.error("FAIL:\n - " + problems.join("\n - "));
  process.exit(1);
}
console.log("OK: every command path is behind the e-stop guard + Safety Engine");
