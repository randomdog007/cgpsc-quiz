const { execSync } = require('child_process');

try {
  const sql = "SELECT id, subject_id, name FROM topics WHERE subject_id = 12 ORDER BY id ASC;";
  const res = execSync(`npx.cmd wrangler d1 execute cgpsc_quiz_db --remote --command "${sql}" --json`, { encoding: 'utf-8' });
  console.log("Subject 12 Topics:", JSON.stringify(JSON.parse(res)[0].results, null, 2));
} catch (e) {
  console.error(e);
}
