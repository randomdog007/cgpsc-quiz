const { execSync } = require('child_process');

try {
    const query = "SELECT id, question, correct_option FROM questions WHERE question LIKE '%largest producer%' OR question LIKE '%leading producer%'";
    
    const result = execSync(`npx.cmd wrangler d1 execute cgpsc-quiz-db --remote --command="${query}" --json`, {
        cwd: "c:\\Users\\bhave\\cgpsc-quiz",
        encoding: 'utf8'
    });
    
    const parsed = JSON.parse(result);
    for (const r of parsed[0].results) {
        if (!r.question.includes('Bureau') && !r.question.includes('Economic Survey')) {
            console.log(r.id, r.question);
        }
    }
} catch (e) {
    console.error("Error:", e.message);
}
