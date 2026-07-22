const fs = require('fs');
const path = require('path');

const exportDir = path.join(__dirname, '../export');
const outputDir = path.join(__dirname, '../migrations');
const outputFile = path.join(outputDir, '0002_import_data.sql');

const files = fs.readdirSync(exportDir).filter(f => f.endsWith('.json') && f !== '_schema.json');

let sql = `-- Migration: Import Data\n\n`;

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 1 : 0;
  if (typeof val === 'string') {
    return "'" + val.replace(/'/g, "''") + "'";
  }
  return "'" + JSON.stringify(val).replace(/'/g, "''") + "'";
}

for (const file of files) {
  const originalTableName = path.basename(file, '.json');
  const isQuestionTable = originalTableName.startsWith('q_');
  const targetTableName = isQuestionTable ? 'questions' : originalTableName;
  const filePath = path.join(exportDir, file);
  
  let data;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.trim()) continue;
    data = JSON.parse(content);
  } catch (e) {
    console.error(`Error parsing ${file}:`, e.message);
    continue;
  }
  
  if (!Array.isArray(data) || data.length === 0) continue;

  let columns = Object.keys(data[0]);
  
  // If we are merging into 'questions', let's drop the 'id' column to avoid collisions
  if (isQuestionTable) {
    columns = columns.filter(c => c !== 'id');
  }

  const batchSize = 5;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    sql += `INSERT INTO ${targetTableName} (${columns.join(', ')}) VALUES \n`;
    
    const valueStrings = batch.map(row => {
      const vals = columns.map(col => escapeSql(row[col]));
      return `(${vals.join(', ')})`;
    });
    
    sql += valueStrings.join(',\n') + ';\n\n';
  }
}

fs.writeFileSync(outputFile, sql);
console.log(`Generated ${outputFile} successfully.`);
