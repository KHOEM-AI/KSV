const fs = require('fs');
const path = 'src/i18n/translations.ts';
let content = fs.readFileSync(path, 'utf8');

const marker = "const th: Dict = {
";
const count = content.split(marker).length - 1;
if (count !== 1) {
  console.error(`ABORT: marker found ${count} times (expected 1).`);
  process.exit(1);
}

const block =
  "  'aiChat.emptyState': 'เริ่มบทสนทนากับ KHOEM-AI',
" +
  "  'aiChat.placeholder': 'พิมพ์คำสั่งหรือคำถาม…',
" +
  "  'view.audit.loading': 'กำลังโหลดเส้นทางตรวจสอบ…',
" +
  "  'view.audit.loadFailed': 'ไม่สามารถโหลดเส้นทางตรวจสอบได้',
" +
  "  'view.controls.logLoading': 'กำลังโหลดกิจกรรมล่าสุด…',
" +
  "  'view.controls.logEmpty': 'ยังไม่มีคำสั่งที่ส่ง',
" +
  "  'view.controls.logLoadFailed': 'ไม่สามารถโหลดกิจกรรมล่าสุดได้',
" +
  "  'view.security.authMethods.title': 'วิธีการตรวจสอบสิทธิ์',
" +
  "  'view.security.authMethods.sessions': 'เซสชัน',
" +
  "  'aiChat.subtitle': 'ผู้ช่วยของคุณ',
";

content = content.replace(marker, marker + block);
fs.writeFileSync(path, content, 'utf8');
console.log('Done. Thai (th) is now 100% complete.');
