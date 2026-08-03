const { execSync } = require('child_process');
const fs = require('fs');

const months = [
  "January 2026",
  "February 2026",
  "March 2026",
  "April 2026",
  "May 2026",
  "June 2026",
  "July 2026",
  "August 2026",
  "September 2026",
  "October 2026",
  "November 2026",
  "December 2026"
];

let sqlStatements = [];
sqlStatements.push("DELETE FROM topics WHERE subject_id = 12;");

// Starting topic ID after 1266
let startId = 1267;
months.forEach((month, idx) => {
  const topicId = startId + idx;
  sqlStatements.push(`INSERT INTO topics (id, subject_id, name) VALUES (${topicId}, 12, '${month}');`);
});

const sqlContent = sqlStatements.join('\n');
fs.writeFileSync('scratch/update_national_ca_topics.sql', sqlContent);
console.log("SQL file generated successfully.");

try {
  const res = execSync(`npx.cmd wrangler d1 execute cgpsc_quiz_db --remote --file scratch/update_national_ca_topics.sql --json`, { encoding: 'utf-8' });
  console.log("D1 Execution Result:", res);
} catch (e) {
  console.error("D1 Execution Error:", e);
}
