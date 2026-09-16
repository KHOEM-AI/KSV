import { readFileSync, writeFileSync } from "fs";
const path = "src/App.tsx";
const content = readFileSync(path, "utf8");

function replaceOnce(str, old, next, label) {
  const count = str.split(old).length - 1;
  if (count !== 1) { console.error(`ERROR (${label}): expected 1, found ${count}`); process.exit(1); }
  return str.split(old).join(next);
}

let updated = content;
updated = replaceOnce(updated, `import { AIChatOverlay } from '@/components/AIChatOverlay';`, `import { AIWelcomeBanner } from '@/components/AIWelcomeBanner';`, "import");
updated = replaceOnce(updated, `<div className="px-5 pb-3"><ProjectSwitcher /></div>`, `<div className="px-5 pb-3"><ProjectSwitcher onOpenAIChat={() => setIsAIChatOpen(true)} /></div>`, "ProjectSwitcher");
updated = replaceOnce(updated, `<main className="bg-grid min-h-[calc(100vh-61px)] p-4 sm:p-6">`, `<main className={\`bg-grid min-h-[calc(100vh-61px)] p-4 sm:p-6 transition-[padding] \${isAIChatOpen ? 'sm:pr-[380px]' : ''}\`}>`, "main padding");
updated = replaceOnce(updated, `<AIChatOverlay open={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />`, `<AIWelcomeBanner open={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />`, "panel render");

writeFileSync(path, updated, "utf8");
console.log("App.tsx updated: now uses AIWelcomeBanner (merged panel) instead of AIChatOverlay, with dashboard padding when open.");
