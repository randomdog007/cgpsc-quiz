const { execSync } = require('child_process');

try {
  const sql = "SELECT id, subject_id, name FROM topics WHERE subject_id IN (12, 30) ORDER BY subject_id, id;";
  const res = execSync(`npx.cmd wrangler d1 execute cgpsc_quiz_db --remote --command "${sql}" --json`, { encoding: 'utf-8' });
  const data = JSON.parse(res);
  console.log(JSON.stringify(data[0].results, null, 2));
} catch (e) {
  console.error(e);
}
