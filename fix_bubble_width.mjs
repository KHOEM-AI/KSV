import { readFileSync, writeFileSync } from "fs";

const path = "src/components/AIWelcomeBanner.tsx";
let content = readFileSync(path, "utf8");

const oldStr = `className={\`rounded-xl px-4 py-2 text-sm max-w-[85%] \${`;
const count = content.split(oldStr).length - 1;
if (count !== 1) {
  console.error(`ERROR: found ${count} times (expected 1). Aborting.`);
  process.exit(1);
}

const newStr = `className={\`rounded-xl px-4 py-2 text-sm max-w-[85%] w-fit \${`;
content = content.replace(oldStr, newStr);

writeFileSync(path, content, "utf8");
console.log("Fixed successfully.");
