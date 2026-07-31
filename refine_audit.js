const fs = require('fs');
const questions = JSON.parse(fs.readFileSync('C:\\Users\\bhave\\.gemini\\antigravity\\brain\\4268ea40-8193-4174-834a-9f325105f337\\scratch\\audit_questions.js', 'utf-8'));

const timeSensitiveKeywords = [
  /rank.*(index|report|list|global)/i,
  /(index|survekshan|survey).*(rank|score|position)/i,
  /(according to|as per).*(report|survey|census|data|index|202\d)/i,
  /(current|latest|recent).*(data|report|rank|position|estimate)/i,
  /(production|producer).*(rank|largest|highest|top|leading)/i,
  /what is the rank of/i,
  /ranked.*in/i,
  /global.*index/i,
  /human development/i,
  /swachh survekshan/i,
  /forest cover report/i,
  /tiger census/i
];

const excludeHistorical = /in (15\d\d|16\d\d|17\d\d|18\d\d|19\d\d|200\d|201[0-5])/i;

const filtered = questions.filter(q => {
  const text = `${q.question} ${q.explanation} ${q.options.join(' ')}`;
  // Exclude purely historical questions even if they match some keywords
  if (excludeHistorical.test(text) && !/202\d/.test(text) && !/(current|latest|recent)/i.test(text)) {
    return false;
  }
  return timeSensitiveKeywords.some(regex => regex.test(text));
});

console.log(`Refined to ${filtered.length} questions.`);
fs.writeFileSync('C:\\Users\\bhave\\.gemini\\antigravity\\brain\\4268ea40-8193-4174-834a-9f325105f337\\scratch\\audit_questions_refined.js', JSON.stringify(filtered, null, 2));
