const fs = require('fs');
const { execSync } = require('child_process');

try {
  console.log("Fetching subjects...");
  const subsJson = execSync('npx.cmd wrangler d1 execute cgpsc_quiz_db --remote --command "SELECT id, name FROM subjects ORDER BY id;" --json', { encoding: 'utf-8' });
  const subs = JSON.parse(subsJson);

  console.log("Fetching topics...");
  const topsJson = execSync('npx.cmd wrangler d1 execute cgpsc_quiz_db --remote --command "SELECT id, subject_id, name FROM topics ORDER BY subject_id, id;" --json', { encoding: 'utf-8' });
  const tops = JSON.parse(topsJson);

  console.log("Fetching quizzes...");
  const quizzesJson = execSync('npx.cmd wrangler d1 execute cgpsc_quiz_db --remote --command "SELECT id, topic_id, title FROM quizzes ORDER BY topic_id, id;" --json', { encoding: 'utf-8' });
  const quizzes = JSON.parse(quizzesJson);

  let out = '# CGPSC Quiz App Schema & Content\n\n';
  out += 'This document outlines the entire structure of the app: Subjects, Topics, and the Quizzes within them.\n\n';
  
  subs[0].results.forEach(s => {
    out += `## 📚 ${s.name} (Subject ID: ${s.id})\n`;
    
    const subjectTopics = tops[0].results.filter(t => t.subject_id === s.id);
    if (subjectTopics.length === 0) {
      out += `  *(No topics currently)*\n\n`;
      return;
    }
    
    subjectTopics.forEach(t => {
      out += `  ### 📖 ${t.name} (Topic ID: ${t.id})\n`;
      
      const topicQuizzes = quizzes[0].results.filter(q => q.topic_id === t.id);
      if (topicQuizzes.length === 0) {
        out += `    - *(No quizzes currently)*\n`;
      } else {
        topicQuizzes.forEach(q => {
          out += `    - 📝 **${q.title}** (Quiz ID: ${q.id})\n`;
        });
      }
      out += '\n';
    });
    out += '\n';
  });

  fs.writeFileSync('scratch/app_schema_content.md', out, 'utf-8');
  console.log('Successfully wrote to scratch/app_schema_content.md');
} catch (e) {
  console.error(e.message);
}
