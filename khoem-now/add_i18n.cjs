const fs = require('fs');
const path = 'src/i18n/translations.ts';
let content = fs.readFileSync(path, 'utf8');

const inserts = {
  ja: "  'dashboard.stat.connectedDevices': '接続デバイス',\n  'dashboard.stat.activeSafetyRules': 'アクティブな安全ルール',\n  'dashboard.stat.edgeGateways': 'エッジゲートウェイ',\n  'dashboard.stat.online': 'オンライン',\n  'dashboard.stat.countriesDeployed': '導入国数',\n",
  zh: "  'dashboard.stat.connectedDevices': '已连接设备',\n  'dashboard.stat.activeSafetyRules': '有效安全规则',\n  'dashboard.stat.edgeGateways': '边缘网关',\n  'dashboard.stat.online': '在线',\n  'dashboard.stat.countriesDeployed': '已部署国家',\n",
  th: "  'dashboard.stat.connectedDevices': 'อุปกรณ์ที่เชื่อมต่อ',\n  'dashboard.stat.activeSafetyRules': 'กฎความปลอดภัยที่ใช้งานอยู่',\n  'dashboard.stat.edgeGateways': 'เกตเวย์เอดจ์',\n  'dashboard.stat.online': 'ออนไลน์',\n  'dashboard.stat.countriesDeployed': 'ประเทศที่ใช้งาน',\n",
  ko: "  'dashboard.stat.connectedDevices': '연결된 장치',\n  'dashboard.stat.activeSafetyRules': '활성 안전 규칙',\n  'dashboard.stat.edgeGateways': '엣지 게이트웨이',\n  'dashboard.stat.online': '온라인',\n  'dashboard.stat.countriesDeployed': '배포된 국가',\n",
  fr: "  'dashboard.stat.connectedDevices': 'Appareils connectés',\n  'dashboard.stat.activeSafetyRules': 'Règles de sécurité actives',\n  'dashboard.stat.edgeGateways': 'Passerelles Edge',\n  'dashboard.stat.online': 'en ligne',\n  'dashboard.stat.countriesDeployed': 'Pays déployés',\n",
  es: "  'dashboard.stat.connectedDevices': 'Dispositivos conectados',\n  'dashboard.stat.activeSafetyRules': 'Reglas de seguridad activas',\n  'dashboard.stat.edgeGateways': 'Puertas de enlace Edge',\n  'dashboard.stat.online': 'en línea',\n  'dashboard.stat.countriesDeployed': 'Países desplegados',\n",
  vi: "  'dashboard.stat.connectedDevices': 'Thiết bị đã kết nối',\n  'dashboard.stat.activeSafetyRules': 'Quy tắc an toàn đang hoạt động',\n  'dashboard.stat.edgeGateways': 'Cổng Edge',\n  'dashboard.stat.online': 'trực tuyến',\n  'dashboard.stat.countriesDeployed': 'Quốc gia đã triển khai',\n",
  ar: "  'dashboard.stat.connectedDevices': 'الأجهزة المتصلة',\n  'dashboard.stat.activeSafetyRules': 'قواعد السلامة النشطة',\n  'dashboard.stat.edgeGateways': 'بوابات الحافة',\n  'dashboard.stat.online': 'متصل',\n  'dashboard.stat.countriesDeployed': 'الدول التي تم النشر فيها',\n",
};

for (const [code, block] of Object.entries(inserts)) {
  const marker = `const ${code}: Dict = {\n`;
  const count = content.split(marker).length - 1;
  if (count !== 1) {
    console.error(`ABORT: marker for "${code}" found ${count} times (expected 1). No changes written.`);
    process.exit(1);
  }
}

for (const [code, block] of Object.entries(inserts)) {
  const marker = `const ${code}: Dict = {\n`;
  content = content.replace(marker, marker + block);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Done. Inserted dashboard.stat.* keys into 8 languages.');
