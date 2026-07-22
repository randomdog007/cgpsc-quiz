import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { parseArgs } from 'util';

const { values } = parseArgs({
  options: {
    'quiz-id': { type: 'string' },
    all: { type: 'boolean' },
    env: { type: 'string', default: 'remote' },
  },
});

const isRemote = values.env !== 'local';
const envFlag = isRemote ? '--remote' : '--local';

// Helper to run wrangler D1 and parse JSON
function queryD1(sql) {
  // Escape double quotes for powershell/cmd execution
  const escapedSql = sql.replace(/"/g, '""');
  const cmd = `npx.cmd wrangler d1 execute cgpsc_quiz_db ${envFlag} --command="${escapedSql}" --json`;
  
  try {
    const output = execSync(cmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
    const parsed = JSON.parse(output);
    return parsed[0].results; // Wrangler returns an array of result objects
  } catch (e) {
    console.error("D1 Query failed:", e.message);
    process.exit(1);
  }
}

async function processQuiz(quizId) {
  console.log(`\nFetching data for Quiz ID: ${quizId}...`);
  
  // 1. Fetch Quiz Metadata
  const quizzes = queryD1(`SELECT * FROM quizzes WHERE id = ${quizId}`);
  if (!quizzes.length) {
    console.error(`Quiz ${quizId} not found.`);
    return;
  }
  const quiz = quizzes[0];

  // 2. Fetch Questions
  const questions = queryD1(`SELECT * FROM questions WHERE quiz_id = ${quizId} ORDER BY sort_order ASC, id ASC`);
  
  if (!questions.length) {
    console.log(`No questions found for Quiz ${quizId}, skipping KV generation.`);
    return;
  }

  // 3. Build Public Payload (No answers/explanations)
  const publicQuestions = questions.map(q => ({
    id: q.id,
    quiz_id: q.quiz_id,
    topic_id: q.topic_id,
    sort_order: q.sort_order,
    question: q.question,
    question_hi: q.question_hi,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    option_a_hi: q.option_a_hi,
    option_b_hi: q.option_b_hi,
    option_c_hi: q.option_c_hi,
    option_d_hi: q.option_d_hi
  }));

  const publicPayload = {
    quiz_metadata: quiz,
    questions: publicQuestions
  };

  // 4. Build Private Payload (Answers & Explanations)
  const answersPayload = {};
  questions.forEach(q => {
    answersPayload[q.id] = {
      correct_option: q.correct_option,
      explanation: q.explanation,
      explanation_hi: q.explanation_hi
    };
  });

  // KV Keys Format: 
  // Public Data: quiz:public:<version>:<quiz_id>
  // Private Data: quiz:answers:<version>:<quiz_id>
  const version = quiz.version || 1;
  const publicKvKey = `quiz:public:v${version}:${quizId}`;
  const answersKvKey = `quiz:answers:v${version}:${quizId}`;

  console.log(`Writing KV blobs for Quiz ${quizId} (v${version})`);
  
  // Prepare bulk upload file format for Wrangler KV
  const bulkData = [
    {
      key: publicKvKey,
      value: JSON.stringify(publicPayload)
    },
    {
      key: answersKvKey,
      value: JSON.stringify(answersPayload)
    }
  ];

  const tempFileName = `kv_bulk_${quizId}_${Date.now()}.json`;
  writeFileSync(tempFileName, JSON.stringify(bulkData, null, 2));

  try {
    console.log(`Pushing to Cloudflare KV...`);
    // Note: Assuming the KV binding name is QUIZ_KV. Update if needed.
    // If running locally, you might want to use --local
    const kvEnvFlag = isRemote ? '' : '--local';
    const kvCmd = `npx.cmd wrangler kv bulk put ${tempFileName} --binding=QUIZ_KV ${kvEnvFlag}`;
    
    execSync(kvCmd, { stdio: 'inherit' });
    console.log(`✅ Successfully published Quiz ${quizId} to KV.`);
  } catch (e) {
    console.error(`❌ Failed to push Quiz ${quizId} to KV.`);
  } finally {
    // Cleanup temp bulk file
    unlinkSync(tempFileName);
  }
}

async function run() {
  if (values['quiz-id']) {
    await processQuiz(values['quiz-id']);
  } else if (values.all) {
    console.log("Fetching all published quizzes...");
    const allQuizzes = queryD1(`SELECT id FROM quizzes WHERE is_published = 1`);
    for (const row of allQuizzes) {
      await processQuiz(row.id);
    }
  } else {
    console.log("Usage:");
    console.log("  node build-quiz-kv.mjs --quiz-id=42");
    console.log("  node build-quiz-kv.mjs --all");
    process.exit(1);
  }
}

run();
