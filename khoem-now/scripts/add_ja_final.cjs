const fs = require('fs');
const path = 'src/i18n/translations.ts';
let content = fs.readFileSync(path, 'utf8');

const marker = "const ja: Dict = {\n";
const count = content.split(marker).length - 1;
if (count !== 1) {
  console.error(`ABORT: marker found ${count} times (expected 1).`);
  process.exit(1);
}

const block =
  "  'aiChat.emptyState': 'KHOEM-AIとの会話を始めましょう',\n" +
  "  'aiChat.placeholder': 'コマンドや質問を入力…',\n" +
  "  'aiChat.subtitle': 'あなたのアシスタント',\n" +
  "  'view.audit.loading': '監査証跡を読み込み中…',\n" +
  "  'view.audit.loadFailed': '監査証跡を読み込めませんでした。',\n" +
  "  'view.controls.logLoading': '最近のアクティビティを読み込み中…',\n" +
  "  'view.controls.logEmpty': 'まだコマンドは送信されていません。',\n" +
  "  'view.controls.logLoadFailed': '最近のアクティビティを読み込めませんでした。',\n";

content = content.replace(marker, marker + block);
fs.writeFileSync(path, content, 'utf8');
console.log('Done. Japanese (ja) is now 100% complete.');
