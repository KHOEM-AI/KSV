const fs = require('fs');
let content = fs.readFileSync('src/data/domain.ts', 'utf8');

// Real data from certificate images: code -> [title, issuedDate (YYYY-MM-DD)]
const realData = {
  'CC-4WMNT8MZ': ['Coding Foundations', '2026-07-31'],
  'CC-T1WYSOHU': ['Introduction to SQL', '2026-08-09'],
  'CC-I6OFSBAU': ['Tech for Everyone', '2026-08-12'],
  'CC-AYYCWFZD': ['Python Developer', '2026-08-02'],
  'CC-FYISPG0F': ['Vibe Coding', '2026-05-09'],
  'CC-AXMQ8X3Q': ['Angular', '2026-05-08'],
  'CC-OU33MLMF': ['JavaScript Intermediate', '2026-05-12'],
  'CC-K47BIVEI': ['Front-end for Beginners', '2026-05-18'],
  'CC-AREK9EJE': ['Introduction to Python', '2026-05-27'],
  'CC-6ZXHTBFA': ['Introduction to C#', '2026-05-31'],
  'CC-IGJZ5ICG': ['C++ Intermediate', '2026-08-16'],
  'CC-NIHNI6RW': ['C Intermediate', '2026-08-16'],
  'CC-PKZFLGAF': ['SQL Intermediate', '2026-08-16'],
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
console.log(`Updated ${updated}/${Object.keys(realData).length} certificates with real data`);
