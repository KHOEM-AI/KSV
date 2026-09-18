const fs = require('fs');
const path = 'src/i18n/translations.ts';
let content = fs.readFileSync(path, 'utf8');

const inserts = {
  en: "  'aiChat.emptyState': 'Start a conversation with KHOEM-AI',\n  'aiChat.placeholder': 'Type a command or question…',\n",
  km: "  'aiChat.emptyState': 'ចាប់ផ្តើមសន្ទនាជាមួយ KHOEM-AI',\n  'aiChat.placeholder': 'វាយពាក្យបញ្ជា ឬសំណួរ…',\n",
};

for (const [code, block] of Object.entries(inserts)) {
  const marker = `const ${code}: Dict = {\n`;
  const count = content.split(marker).length - 1;
  if (count !== 1) {
    console.error(`ABORT: marker for "${code}" found ${count} times.`);
    process.exit(1);
  }
}

for (const [code, block] of Object.entries(inserts)) {
  const marker = `const ${code}: Dict = {\n`;
  content = content.replace(marker, marker + block);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Done. Inserted aiChat.* keys into en + km.');
