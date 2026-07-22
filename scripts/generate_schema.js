const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../export/_schema.json');
const outputPath = path.join(__dirname, '../migrations/0001_initial_schema.sql');

const schemaData = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

let sql = `-- Migration: Initial Schema
-- Generated from Supabase export

`;

let questionsTableGenerated = false;

for (const [tableName, columns] of Object.entries(schemaData)) {
  const isQuestionTable = tableName.startsWith('q_');
  
  if (isQuestionTable) {
    if (!questionsTableGenerated) {
      sql += `CREATE TABLE IF NOT EXISTS questions (\n`;
      const columnDefs = [];
      
      for (const col of columns) {
        let type = 'TEXT';
        const originalType = col.data_type.toLowerCase();
        
        if (originalType.includes('int')) type = 'INTEGER';
        else if (originalType.includes('bool')) type = 'INTEGER';
        else if (originalType.includes('timestamp') || originalType.includes('date')) type = 'TEXT';
        else if (originalType.includes('uuid') || originalType.includes('json')) type = 'TEXT';

        let def = `  ${col.column_name} ${type}`;
        
        if (col.column_name === 'id') {
          def += ' PRIMARY KEY AUTOINCREMENT'; // Will let SQLite auto-assign for all merged questions to avoid collisions
        } else {
          if (col.is_nullable === 'NO') def += ' NOT NULL';
          if (col.column_default !== null) {
            let defVal = col.column_default;
            if (defVal.includes('now()') || defVal.includes('CURRENT_TIMESTAMP')) def += ' DEFAULT CURRENT_TIMESTAMP';
            else if (defVal === 'false') def += ' DEFAULT 0';
            else if (defVal === 'true') def += ' DEFAULT 1';
            else if (defVal === "'google'::text") def += " DEFAULT 'google'";
            else if (defVal === "'en'::text") def += " DEFAULT 'en'";
            else if (!defVal.includes('nextval') && !defVal.includes('uuid_generate') && !defVal.includes('::')) def += ` DEFAULT ${defVal}`;
          }
        }
        columnDefs.push(def);
      }
      
      sql += columnDefs.join(',\n');
      sql += '\n);\n\n';
      questionsTableGenerated = true;
    }
    continue; // skip generating individual q_ tables
  }

  sql += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
  const columnDefs = [];
  
  for (const col of columns) {
    let type = 'TEXT';
    const originalType = col.data_type.toLowerCase();
    
    if (originalType.includes('int')) type = 'INTEGER';
    else if (originalType.includes('bool')) type = 'INTEGER';
    else if (originalType.includes('timestamp') || originalType.includes('date')) type = 'TEXT';
    else if (originalType.includes('uuid') || originalType.includes('json')) type = 'TEXT';

    let def = `  ${col.column_name} ${type}`;
    
    if (col.column_name === 'id') {
      if (type === 'INTEGER') def += ' PRIMARY KEY AUTOINCREMENT';
      else def += ' PRIMARY KEY';
    } else {
      if (col.is_nullable === 'NO') def += ' NOT NULL';
      if (col.column_default !== null) {
        let defVal = col.column_default;
        if (defVal.includes('now()') || defVal.includes('CURRENT_TIMESTAMP')) def += ' DEFAULT CURRENT_TIMESTAMP';
        else if (defVal === 'false') def += ' DEFAULT 0';
        else if (defVal === 'true') def += ' DEFAULT 1';
        else if (defVal === "'google'::text") def += " DEFAULT 'google'";
        else if (defVal === "'en'::text") def += " DEFAULT 'en'";
        else if (!defVal.includes('nextval') && !defVal.includes('uuid_generate') && !defVal.includes('::')) def += ` DEFAULT ${defVal}`;
      }
    }
    columnDefs.push(def);
  }

  if (tableName === 'quizzes') {
    columnDefs.push('  is_premium INTEGER DEFAULT 0');
  }

  sql += columnDefs.join(',\n');
  sql += '\n);\n\n';
}

sql += `-- Custom Tables added for D1 Migration
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  quiz_id INTEGER,
  purchased_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`;

fs.writeFileSync(outputPath, sql);
console.log(`Successfully generated ${outputPath}`);
