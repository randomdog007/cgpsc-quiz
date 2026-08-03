const { execSync } = require('child_process');

try {
  const sql = "SELECT MAX(id) as max_id FROM topics;";
  const res = execSync(`npx.cmd wrangler d1 execute cgpsc_quiz_db --remote --command "${sql}" --json`, { encoding: 'utf-8' });
  console.log("Max Topic ID:", JSON.parse(res)[0].results);
} catch (e) {
  console.error(e);
}
