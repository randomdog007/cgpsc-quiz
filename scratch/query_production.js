const { execSync } = require('child_process');

try {
    const query = "SELECT id, quiz_id, topic_id, question, correct_option FROM questions WHERE question LIKE '%producer%' OR question LIKE '%production%' OR question_hi LIKE '%उत्पादक%' OR question_hi LIKE '%उत्पादन%' LIMIT 50";
    
    // Using npx wrangler to execute the query
    const result = execSync(`npx.cmd wrangler d1 execute cgpsc-quiz-db --remote --command="${query}" --json`, {
        cwd: "c:\\Users\\bhave\\cgpsc-quiz",
        encoding: 'utf8'
    });
    
    console.log(result);
} catch (e) {
    console.error("Error running query:", e.message);
    if (e.stdout) console.log("Stdout:", e.stdout);
    if (e.stderr) console.error("Stderr:", e.stderr);
}
