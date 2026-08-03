const { execSync } = require('child_process');

try {
  const sql = "SELECT id, title, topic_id FROM quizzes WHERE topic_id IN (SELECT id FROM topics WHERE subject_id IN (12, 30));";
  const res = execSync(`npx.cmd wrangler d1 execute cgpsc_quiz_db --remote --command "${sql}" --json`, { encoding: 'utf-8' });
  const data = JSON.parse(res);
  console.log("Quizzes:", JSON.stringify(data[0].results, null, 2));
} catch (e) {
  console.error(e);
}
