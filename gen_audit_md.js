const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scratch/joined_audit_filtered.json', 'utf-8'));
let md = '# Time Sensitive Questions Audit\n\n| ID | Quiz Title | Question |\n|---|---|---|\n';
data.forEach(q => {
  const safeQ = q.question.replace(/\n/g, ' ').replace(/\|/g, '\\|');
  md += `| ${q.id} | ${q.quiz_title} | ${safeQ} |\n`;
});
fs.writeFileSync('C:\\Users\\bhave\\.gemini\\antigravity\\brain\\4268ea40-8193-4174-834a-9f325105f337\\time_sensitive_audit.md', md);
console.log('Done');
