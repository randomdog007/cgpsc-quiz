const fs = require('fs');
const { execSync } = require('child_process');

const dataFile = process.argv[2];
if (!dataFile) {
  console.error("Usage: node insert_quiz.js <data_file.json>");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

// 1. Insert the Quiz
console.log(`Inserting Quiz: ${data.quiz.title}`);
const insertQuizSql = `
  INSERT INTO quizzes (topic_id, title, title_hi, description, description_hi, difficulty, total_questions, time_limit_mins, is_previous_year, is_published, is_premium)
  VALUES (${data.quiz.topic_id}, '${data.quiz.title.replace(/'/g, "''")}', '${data.quiz.title_hi.replace(/'/g, "''")}', '${data.quiz.description.replace(/'/g, "''")}', '${data.quiz.description_hi.replace(/'/g, "''")}', '${data.quiz.difficulty}', ${data.quiz.total_questions}, ${data.quiz.time_limit_mins}, ${data.quiz.is_previous_year ? 1 : 0}, 1, 0)
  RETURNING id;
`;

try {
  const quizResultJson = execSync(`npx.cmd wrangler d1 execute cgpsc_quiz_db --remote --command "${insertQuizSql.replace(/\n/g, " ")}" --json`, { encoding: 'utf-8' });
  const quizResult = JSON.parse(quizResultJson);
  const quizId = quizResult[0].results[0].id;
  console.log(`Quiz inserted with ID: ${quizId}`);

  // 2. Insert the Questions
  console.log(`Inserting ${data.questions.length} questions...`);
  for (let i = 0; i < data.questions.length; i++) {
    const q = data.questions[i];
    const insertQuestionSql = `
      INSERT INTO questions (quiz_id, topic_id, sort_order, question, question_hi, option_a, option_b, option_c, option_d, option_a_hi, option_b_hi, option_c_hi, option_d_hi, correct_option, explanation, explanation_hi)
      VALUES (${quizId}, ${data.quiz.topic_id}, ${i + 1}, 
        '${q.question.replace(/'/g, "''")}', 
        '${q.question_hi.replace(/'/g, "''")}', 
        '${q.option_a.replace(/'/g, "''")}', 
        '${q.option_b.replace(/'/g, "''")}', 
        '${q.option_c.replace(/'/g, "''")}', 
        '${q.option_d.replace(/'/g, "''")}', 
        '${q.option_a_hi.replace(/'/g, "''")}', 
        '${q.option_b_hi.replace(/'/g, "''")}', 
        '${q.option_c_hi.replace(/'/g, "''")}', 
        '${q.option_d_hi.replace(/'/g, "''")}', 
        ${q.correct_option}, 
        '${q.explanation.replace(/'/g, "''")}', 
        '${q.explanation_hi.replace(/'/g, "''")}'
      );
    `;
    
    execSync(`npx.cmd wrangler d1 execute cgpsc_quiz_db --remote --command "${insertQuestionSql.replace(/\n/g, " ")}"`, { encoding: 'utf-8' });
    console.log(`Inserted question ${i + 1}/${data.questions.length}`);
  }
  
  console.log("All done!");
} catch (e) {
  console.error("Error executing D1 command:", e.message);
  if (e.stdout) console.log(e.stdout.toString());
  if (e.stderr) console.error(e.stderr.toString());
}
