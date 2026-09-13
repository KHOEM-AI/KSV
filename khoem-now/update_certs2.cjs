const fs = require('fs');
let content = fs.readFileSync('src/data/domain.ts', 'utf8');

const realData = {
  'CC-GPX6LLCC': ['Python Intermediate', '2026-08-13'],
  'CC-4LH8JFHT': ['Critical Thinking - AI Era Practice', '2026-08-13'],
  'CC-CAZPORAO': ['C# Intermediate', '2026-08-04'],
  'CC-OP1HINXS': ['Introduction to C', '2026-08-13'],
  'CC-2SCXNBZ6': ['Introduction to Java', '2026-08-11'],
  'CC-8VRSVYY8': ['Java Intermediate', '2026-08-15'],
  'CC-S072WEWW': ['TypeScript for Beginners: Code in the AI Era', '2026-08-11'],
  'CC-OFASKCAF': ['Introduction to JavaScript', '2026-05-06'],
  'CC-2M47YBCR': ['Machine Learning for Beginners', '2026-05-01'],
  'CC-ZTIH8SKI': ['Growth Mindset in the Age of AI', '2026-05-01'],
  'CC-SI4N5SIB': ['AI-Powered Product & UX', '2026-05-01'],
  'CC-JAJVCQCJ': ['Visualize Your Data', '2026-05-02'],
  'CC-SUEHSLUF': ['Bias Detection and Mitigation in AI Systems', '2026-05-01'],
  'CC-GT2PAJTL': ['Introduction to LLMs', '2026-04-28'],
  'CC-WKCFVLYI': ['SEO with AI', '2026-05-01'],
  'CC-SI2WZX43': ['Think Creatively with AI', '2026-04-27'],
  'CC-SUOWGF8T': ['Data Literacy with AI', '2026-04-28'],
  'CC-ZYSDAZM8': ['Write with AI', '2026-04-29'],
  'CC-DJ9YJOG5': ['Research with AI', '2026-05-02'],
  'CC-CCYNOT2R': ['AI-Powered A/B Testing', '2026-04-28'],
  'CC-DBRL4YLD': ['Critical Thinking in the Age of AI', '2026-04-30'],
  'CC-I4TIACOI': ['Ethical AI Foundations', '2026-04-28'],
  'CC-UYFGANZQ': ['Brainstorm with AI', '2026-05-01'],
  'CC-SCJHQBG0': ['Project Planning with AI', '2026-05-02'],
  'CC-7ABADG4R': ['Prompt Engineering', '2026-04-29'],
  'CC-033EXHKA': ['Social Media Marketing with AI', '2026-05-01'],
  'CC-CRBRNFSO': ['Agentic Workflows', '2026-05-01'],
};

let updated = 0;
for (const [code, [title, issued]] of Object.entries(realData)) {
  const regex = new RegExp(`(\\{ id: '[^']+', title: ')[^']*(', issuer: '[^']+', holder: '[^']+', issued: ')[^']*(', expires: ')[^']*(', category: '[^']+', verified: true, url: '[^']*${code}[^']*' \\})`);
  if (regex.test(content)) {
    content = content.replace(regex, `$1${title}$2${issued}$3N/A$4`);
    updated++;
  }
}

fs.writeFileSync('src/data/domain.ts', content);
console.log(`Updated ${updated}/${Object.keys(realData).length} certificates`);
