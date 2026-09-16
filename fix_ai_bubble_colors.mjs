import { readFileSync, writeFileSync } from "fs";

const path = "src/components/AIWelcomeBanner.tsx";
let content = readFileSync(path, "utf8");

const oldStr = `m.role === "user" ? "ml-auto bg-sky-500 text-white" : "bg-sky-50 text-slate-700 border border-sky-100"`;
const count = content.split(oldStr).length - 1;
if (count !== 1) {
  console.error(`ERROR: found ${count} times (expected 1). Aborting.`);
  process.exit(1);
}

const newStr = `m.role === "user" ? "ml-auto bg-sky-500 text-white" : "bg-sky-500/10 text-sky-100 border border-sky-500/30"`;
content = content.replace(oldStr, newStr);

writeFileSync(path, content, "utf8");
console.log("Fixed successfully.");
