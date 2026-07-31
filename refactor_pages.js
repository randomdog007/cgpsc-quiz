const fs = require('fs');
const files = [
  'src/pages/SubjectPage.jsx',
  'src/pages/TopicPage.jsx',
  'src/pages/QuizPage.jsx',
  'src/pages/ResultPage.jsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  code = code.replace(/C\.bg/g, '"var(--paper)"');
  code = code.replace(/C\.card/g, '"var(--surface)"');
  code = code.replace(/C\.border/g, '"var(--line)"');
  code = code.replace(/C\.text/g, '"var(--ink)"');
  code = code.replace(/C\.muted/g, '"var(--muted)"');
  code = code.replace(/C\.inp/g, '"var(--surface-2)"');
  code = code.replace(/C\.acc/g, '"var(--blue)"');
  code = code.replace(/C\.ok/g, '"var(--teal)"');
  code = code.replace(/C\.err/g, '"var(--crimson)"');
  code = code.replace(/C\.shadow/g, '"var(--shadow)"');

  fs.writeFileSync(file, code);
  console.log(`${file} refactored.`);
});
