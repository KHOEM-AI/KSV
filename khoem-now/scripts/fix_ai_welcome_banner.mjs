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

content = replaceOnce(
  content,
  `import { analyze } from "../core/ai/khoem-ai-brain";`,
  `import { interpretIntent } from "../core/ai/khoem-ai-brain";`,
  "import line"
);

content = replaceOnce(
  content,
  `const result = analyze({ text });`,
  `const result = interpretIntent({ text });`,
  "analyze call"
);

content = replaceOnce(
  content,
  `text: result.safeFallback,`,
  `text: result.reason,`,
  "safeFallback usage"
);

writeFileSync(path, content, "utf8");
console.log("Fixed successfully.");
