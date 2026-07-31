const fs = require('fs');

const path = 'C:/Users/bhave/.gemini/antigravity/brain/4268ea40-8193-4174-834a-9f325105f337/scratch/audit_questions.js';
const questions = JSON.parse(fs.readFileSync(path, 'utf8'));

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str === 'number') return str;
  return "'" + str.replace(/'/g, "''") + "'";
}

const BATCH_SIZE = 700;
let batchNum = 1;

for (let i = 0; i < questions.length; i += BATCH_SIZE) {
  const batch = questions.slice(i, i + BATCH_SIZE);
  let sql = `-- DATA AUDIT & UPDATES BATCH ${batchNum}\n\n`;
  
  batch.forEach(q => {
    const optA = q.options && q.options[0] ? escapeSql(q.options[0]) : 'NULL';
    const optB = q.options && q.options[1] ? escapeSql(q.options[1]) : 'NULL';
    const optC = q.options && q.options[2] ? escapeSql(q.options[2]) : 'NULL';
    const optD = q.options && q.options[3] ? escapeSql(q.options[3]) : 'NULL';
    
    sql += `UPDATE questions SET `;
    sql += `question = ${escapeSql(q.question)}, `;
    sql += `option_a = ${optA}, `;
    sql += `option_b = ${optB}, `;
    sql += `option_c = ${optC}, `;
    sql += `option_d = ${optD}, `;
    sql += `correct_option = ${q.correct}, `;
    sql += `explanation = ${escapeSql(q.explanation)} `;
    sql += `WHERE id = ${q.id};\n\n`;
  });
  
  fs.writeFileSync(`C:/Users/bhave/.gemini/antigravity/brain/4268ea40-8193-4174-834a-9f325105f337/scratch/audit_updates_batch${batchNum}.sql`, sql, 'utf8');
  console.log(`Generated audit_updates_batch${batchNum}.sql with ${batch.length} UPDATE statements.`);
  batchNum++;
}
