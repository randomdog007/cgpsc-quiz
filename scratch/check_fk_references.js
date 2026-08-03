const { execSync } = require('child_process');

try {
  const t12 = "SELECT count(*) as count FROM quizzes WHERE topic_id IN (1112, 1113, 1114, 1115, 1116, 1117, 1118);";
  const r1 = execSync(`npx.cmd wrangler d1 execute cgpsc_quiz_db --remote --command "${t12}" --json`, { encoding: 'utf-8' });
  console.log("Quizzes count:", JSON.parse(r1)[0].results);

  const tProg = "SELECT count(*) as count FROM user_progress WHERE topic_id IN (1112, 1113, 1114, 1115, 1116, 1117, 1118);";
  const r2 = execSync(`npx.cmd wrangler d1 execute cgpsc_quiz_db --remote --command "${tProg}" --json`, { encoding: 'utf-8' });
  console.log("User progress count:", JSON.parse(r2)[0].results);

  const tBm = "SELECT count(*) as count FROM bookmarks WHERE topic_id IN (1112, 1113, 1114, 1115, 1116, 1117, 1118);";
  const r3 = execSync(`npx.cmd wrangler d1 execute cgpsc_quiz_db --remote --command "${tBm}" --json`, { encoding: 'utf-8' });
  console.log("Bookmarks count:", JSON.parse(r3)[0].results);
} catch (e) {
  console.error(e);
}
