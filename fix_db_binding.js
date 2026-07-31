const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else {
      if (fullPath.endsWith('.js')) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

const files = walk('functions');
let changedCount = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('env.DB')) {
    const newContent = content.replace(/env\.DB/g, 'env.cgpsc_quiz_db');
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated ${file}`);
    changedCount++;
  }
}

console.log(`Changed ${changedCount} files.`);
