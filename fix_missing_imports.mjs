import { readFileSync, writeFileSync } from "fs";

const path = "src/App.tsx";
const content = readFileSync(path, "utf8");

const old = `import { Menu, X, Search, Bell, ChevronDown, Shield } from 'lucide-react';`;
const count = content.split(old).length - 1;
if (count !== 1) { console.error("ERROR: expected 1, found " + count); process.exit(1); }
const new1 = `import { Menu, X, Search, Bell, ChevronDown, Shield, Sparkles } from 'lucide-react';
import { AIChatOverlay } from '@/components/AIChatOverlay';`;

const updated = content.replace(old, new1);
writeFileSync(path, updated, "utf8");
console.log("Added missing imports (Sparkles, AIChatOverlay).");
