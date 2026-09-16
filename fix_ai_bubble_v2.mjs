import { readFileSync, writeFileSync } from "fs";

const path = "src/components/AIWelcomeBanner.tsx";
let content = readFileSync(path, "utf8");

function replaceOnce(str, oldStr, newStr, label) {
  const count = str.split(oldStr).length - 1;
  if (count !== 1) {
    console.error(`ERROR: "${label}" found ${count} times (expected 1). Aborting.`);
    process.exit(1);
  }
  return str.replace(oldStr, newStr);
}

// 1. Increase background opacity from /10 to /40 (base color kept, +30%)
content = replaceOnce(
  content,
  `"bg-sky-500/10 text-sky-100 border border-sky-500/30"`,
  `"bg-sky-500/40 text-sky-50 border border-sky-500/50"`,
  "bubble color"
);

// 2. Truncate long AI text so it doesn't overflow the bubble
content = replaceOnce(
  content,
  `                >
                  {m.text}
                </div>`,
  `                >
                  {m.text.length > 240 ? \`\${m.text.slice(0, 240)}…\` : m.text}
                </div>`,
  "message text render"
);

writeFileSync(path, content, "utf8");
console.log("Fixed successfully.");
