const fs = require('fs');
const path = require('path');

const translationsPath = path.join(__dirname, 'src/i18n/translations.ts');
let content = fs.readFileSync(translationsPath, 'utf8');

const missingKeys = {
  'aiChat.emptyState': 'เริ่มบทสนทนากับ KHOEM-AI',
  'aiChat.placeholder': 'พิมพ์คำสั่งหรือคำถาม…',
  'view.audit.loading': 'กำลังโหลดเส้นทางตรวจสอบ…',
  'view.audit.loadFailed': 'ไม่สามารถโหลดเส้นทางตรวจสอบได้',
  'view.controls.logLoading': 'กำลังโหลดกิจกรรมล่าสุด…',
  'view.controls.logEmpty': 'ยังไม่มีคำสั่งที่ส่ง',
  'view.controls.logLoadFailed': 'ไม่สามารถโหลดกิจกรรมล่าสุดได้',
  'view.security.authMethods.title': 'วิธีการตรวจสอบสิทธิ์',
  'view.security.authMethods.sessions': 'เซสชัน',
  'aiChat.subtitle': 'ผู้ช่วยของคุณ'
};

const marker = "th: {";
const insertionPoint = content.indexOf(marker);

if (insertionPoint === -1) {
  console.error('Cannot find Thai (th) section');
  process.exit(1);
}

const insertPosition = insertionPoint + marker.length;
const before = content.slice(0, insertPosition);
const after = content.slice(insertPosition);

const thBlock = Object.entries(missingKeys)
  .map(([key, value]) => "  '" + key + "': '" + value + "'")
  .join(',
');

content = before + '
' + thBlock + ',
' + after;

fs.writeFileSync(translationsPath, content, 'utf8');
console.log('Done. Thai (th) is now 100% complete.');
