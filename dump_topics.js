const fs = require('fs');
const { execSync } = require('child_process');

try {
  console.log("Fetching subjects...");
  const subsJson = execSync('npx.cmd wrangler d1 execute cgpsc_quiz_db --remote --command "SELECT id, name FROM subjects ORDER BY id;" --json', { encoding: 'utf-8' });
  const subs = JSON.parse(subsJson);

  console.log("Fetching topics...");
  const topsJson = execSync('npx.cmd wrangler d1 execute cgpsc_quiz_db --remote --command "SELECT id, subject_id, name FROM topics ORDER BY subject_id, id;" --json', { encoding: 'utf-8' });
  const tops = JSON.parse(topsJson);

  let out = '# CGPSC Subjects & Topics\n\n';
  subs[0].results.forEach(s => {
    out += `## ${s.name} (ID: ${s.id})\n`;
    tops[0].results.filter(t => t.subject_id === s.id).forEach(t => {
      out += `- ${t.name} (ID: ${t.id})\n`;
    });
    out += '\n';
  });

  fs.writeFileSync('C:\\Users\\bhave\\.gemini\\antigravity\\brain\\4268ea40-8193-4174-834a-9f325105f337\\subjects_and_topics.md', out);
  console.log('Successfully wrote to subjects_and_topics.md');
} catch (e) {
  console.error(e);
}
