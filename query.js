const { execSync } = require('child_process');
try {
  const result = execSync('npx wrangler d1 execute cgpsc_quiz_db --remote --json --command="SELECT id, title, topic_id FROM quizzes WHERE title LIKE \'%Kakatiya%\' OR title LIKE \'%Kaktiya%\' OR title LIKE \'%Suba%\' OR title LIKE \'%Protectorate%\' OR title LIKE \'%Zilhedari%\' OR title LIKE \'%Maratha Revenue%\'"');
  console.log(result.toString());
} catch (e) {
  console.error(e.stdout ? e.stdout.toString() : e.message);
}
