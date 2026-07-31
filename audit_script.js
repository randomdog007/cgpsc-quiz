const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log('Fetching questions from D1...');
  const res = execSync('npx.cmd wrangler d1 execute cgpsc_quiz_db --remote --command="SELECT id, quiz_id, question, correct_option, explanation, option_a, option_b, option_c, option_d FROM questions;" --json', { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
  
  const parsed = JSON.parse(res);
  const rows = parsed[0].results;
  
  const timeSensitiveKeywords = [
    /rank/i, /report/i, /index/i, /survey/i, /according to/i, /data/i,
    /production/i, /largest/i, /highest/i, /lowest/i, /smallest/i,
    /census/i, /estimate/i, /projected/i, /current/i, /recent/i,
    /top/i, /bottom/i, /status/i
  ];

  const matchedQuestions = [];

  for (const row of rows) {
    if (!row.question) continue;
    const textToSearch = `${row.question} ${row.explanation} ${row.option_a} ${row.option_b} ${row.option_c} ${row.option_d}`;
    
    if (timeSensitiveKeywords.some(regex => regex.test(textToSearch))) {
      matchedQuestions.push({
        id: row.id,
        quiz_id: row.quiz_id,
        question: row.question,
        options: [row.option_a, row.option_b, row.option_c, row.option_d],
        correct: row.correct_option,
        explanation: row.explanation
      });
    }
  }

  console.log(`Found ${matchedQuestions.length} time-sensitive questions out of ${rows.length}.`);
  fs.writeFileSync('C:\\Users\\bhave\\.gemini\\antigravity\\brain\\4268ea40-8193-4174-834a-9f325105f337\\scratch\\audit_questions.js', JSON.stringify(matchedQuestions, null, 2));
  console.log('Saved to scratch/audit_questions.js');
} catch (e) {
  console.error(e);
}
