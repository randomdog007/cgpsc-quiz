const { execSync } = require('child_process');
const fs = require('fs');

async function main() {
  const inputFile = process.argv[2];
  if (!inputFile) {
    console.error("Please provide input json file");
    process.exit(1);
  }

  const rawData = fs.readFileSync(inputFile, 'utf-8');
  const quizzes = JSON.parse(rawData);

  let sqlStatements = [];

  for (let qData of quizzes) {
    const qz = qData.quiz;
    const title = qz.title.replace(/'/g, "''");
    const title_hi = qz.title_hi ? qz.title_hi.replace(/'/g, "''") : title;
    const desc = qz.description.replace(/'/g, "''");
    const desc_hi = qz.description_hi ? qz.description_hi.replace(/'/g, "''") : desc;

    // insert quiz
    const insertQuizSql = `INSERT INTO quizzes (topic_id, title, title_hi, description, description_hi, difficulty, total_questions, time_limit_mins, is_previous_year, is_premium, is_published, version) VALUES (${qz.topic_id}, '${title}', '${title_hi}', '${desc}', '${desc_hi}', '${qz.difficulty}', ${qz.total_questions}, ${qz.time_limit_mins}, ${qz.is_previous_year ? 1 : 0}, 0, 1, 1);`;
    
    // We can't get the generated ID easily in a batch script unless we query it. 
    // Wait, D1 execute via wrangler is isolated. 
    // We can do it by matching the title.
    
    sqlStatements.push(insertQuizSql);
    
    // BUT we need the quiz_id for the questions!
    // Since this is SQLite, we can use a subquery for the quiz_id based on the title.
    // e.g. (SELECT id FROM quizzes WHERE title = '${title}' ORDER BY id DESC LIMIT 1)
    
    for (let i = 0; i < qData.questions.length; i++) {
      const q = qData.questions[i];
      const qText = q.question.replace(/'/g, "''");
      const qHi = q.question_hi.replace(/'/g, "''");
      const oA = q.option_a.replace(/'/g, "''");
      const oB = q.option_b.replace(/'/g, "''");
      const oC = q.option_c.replace(/'/g, "''");
      const oD = q.option_d.replace(/'/g, "''");
      const oA_hi = q.option_a_hi.replace(/'/g, "''");
      const oB_hi = q.option_b_hi.replace(/'/g, "''");
      const oC_hi = q.option_c_hi.replace(/'/g, "''");
      const oD_hi = q.option_d_hi.replace(/'/g, "''");
      const exp = q.explanation.replace(/'/g, "''");
      const exp_hi = q.explanation_hi.replace(/'/g, "''");

      const insertQ = `INSERT INTO questions (quiz_id, topic_id, sort_order, question, question_hi, option_a, option_b, option_c, option_d, option_a_hi, option_b_hi, option_c_hi, option_d_hi, correct_option, explanation, explanation_hi) VALUES ((SELECT id FROM quizzes WHERE title = '${title}' ORDER BY id DESC LIMIT 1), ${qz.topic_id}, ${i+1}, '${qText}', '${qHi}', '${oA}', '${oB}', '${oC}', '${oD}', '${oA_hi}', '${oB_hi}', '${oC_hi}', '${oD_hi}', ${q.correct_option}, '${exp}', '${exp_hi}');`;
      
      sqlStatements.push(insertQ);
    }
  }

  const outSql = 'temp_insert.sql';
  fs.writeFileSync(outSql, sqlStatements.join('\n'));
  console.log(`Generated ${sqlStatements.length} SQL statements. Executing via wrangler...`);

  try {
    const output = execSync('cmd /c npx wrangler d1 execute cgpsc_quiz_db --file temp_insert.sql --remote', { encoding: 'utf-8' });
    console.log(output);
    console.log("Success!");
  } catch (err) {
    console.error("Error executing SQL:", err.stdout, err.stderr);
  }
}

main();
