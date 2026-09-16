const fs = require('fs');
const path = 'src/i18n/translations.ts';
let content = fs.readFileSync(path, 'utf8');

const marker = "const km: Dict = {\n";
const count = content.split(marker).length - 1;
if (count !== 1) {
  console.error(`ABORT: marker found ${count} times (expected 1).`);
  process.exit(1);
}

const block =
  "  'view.audit.loading': 'កំពុងផ្ទុកកំណត់ត្រាសវនកម្ម…',\n" +
  "  'view.audit.loadFailed': 'មិនអាចផ្ទុកកំណត់ត្រាសវនកម្មបានទេ។',\n";

content = content.replace(marker, marker + block);
fs.writeFileSync(path, content, 'utf8');
console.log('Done. Khmer (km) is now 100% complete.');
