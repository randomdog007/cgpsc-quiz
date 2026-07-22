const fs = require('fs');

let content = fs.readFileSync('functions/api/[table].js', 'utf8');

const ALLOWED_COLUMNS = `
const ALLOWED_COLUMNS = {
  profiles: ['id', 'email', 'full_name', 'total_score', 'total_attempts', 'current_streak', 'best_streak', 'avg_accuracy', 'preferred_lang', 'dark_mode', 'last_seen_at', 'created_at', 'avatar_url', 'provider'],
  subjects: ['id', 'name', 'name_hi', 'paper', 'sort_order'],
  topics: ['id', 'subject_id', 'name', 'name_hi', 'sort_order'],
  quizzes: ['id', 'topic_id', 'title', 'title_hi', 'difficulty', 'total_questions', 'time_limit_mins', 'is_previous_year', 'is_premium', 'is_published', 'version', 'created_at'],
  questions: ['id', 'quiz_id', 'sort_order', 'question', 'question_hi', 'option_a', 'option_b', 'option_c', 'option_d', 'option_a_hi', 'option_b_hi', 'option_c_hi', 'option_d_hi', 'correct_option', 'explanation', 'explanation_hi', 'topic_id'],
  quiz_attempts: ['id', 'user_id', 'quiz_id', 'subject_id', 'topic_id', 'score', 'total', 'accuracy', 'time_taken', 'marks', 'max_marks', 'wrong', 'skipped', 'answers_json', 'created_at'],
  saved_questions: ['id', 'user_id', 'question_id', 'quiz_id', 'created_at'],
  purchases: ['id', 'user_id', 'quiz_id', 'created_at'],
  wrong_questions: ['id', 'user_id', 'question_id', 'quiz_id', 'wrong_count', 'ease_factor', 'interval_days', 'last_wrong_at', 'next_revision'],
  users: ['id', 'email'],
  user_rank: ['user_id']
};
`;

// Insert ALLOWED_COLUMNS at the top
content = content.replace('export async function onRequest(context) {', ALLOWED_COLUMNS + '\nexport async function onRequest(context) {');

// Fix limit to 200
content = content.replace(
  "const limit = url.searchParams.get('limit');\n      if (limit && !isNaN(parseInt(limit))) {\n        query += ` LIMIT ${parseInt(limit)}`;\n      }",
  "const limit = url.searchParams.get('limit');\n      if (limit && !isNaN(parseInt(limit))) {\n        query += ` LIMIT ${Math.min(parseInt(limit), 200)}`;\n      }"
);
content = content.replace(
  "if (limit && !isNaN(parseInt(limit))) {\n          query += ` LIMIT ${parseInt(limit)}`;\n        }",
  "if (limit && !isNaN(parseInt(limit))) {\n          query += ` LIMIT ${Math.min(parseInt(limit), 200)}`;\n        }"
);
content = content.replace(
  "if (limit) query += ` LIMIT ${parseInt(limit)}`;",
  "if (limit) query += ` LIMIT ${Math.min(parseInt(limit), 200)}`;"
);

// Add auth check function
const AUTH_CHECK = `
      if (!context.data || !context.data.user) {
        return new Response(JSON.stringify({ error: { message: "Authentication required" } }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      }
`;

// Add auth check to POST
content = content.replace(
  "else if (method === 'POST') {\n      const body = await request.json();",
  "else if (method === 'POST') {\n" + AUTH_CHECK + "      const body = await request.json();"
);

// Add auth check to PATCH
content = content.replace(
  "else if (method === 'PATCH') {\n      const body = await request.json();",
  "else if (method === 'PATCH') {\n" + AUTH_CHECK + "      const body = await request.json();"
);

// Add auth check to DELETE
content = content.replace(
  "else if (method === 'DELETE') {\n      let queryParams = [];",
  "else if (method === 'DELETE') {\n" + AUTH_CHECK + "      let queryParams = [];"
);

// Add whereClauses empty check for PATCH
content = content.replace(
  "const setClause = keys.map(k => `${k} = ?`).join(', ');\n      const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClauses.join(' AND ')}`;",
  "if (whereClauses.length === 0) return new Response(JSON.stringify({ error: { message: 'At least one filter required for PATCH' } }), { status: 400 });\n      const setClause = keys.map(k => `${k} = ?`).join(', ');\n      const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClauses.join(' AND ')}`;"
);

// Add whereClauses empty check for DELETE
content = content.replace(
  "const query = `DELETE FROM ${table} WHERE ${whereClauses.join(' AND ')}`;",
  "if (whereClauses.length === 0) return new Response(JSON.stringify({ error: { message: 'At least one filter required for DELETE' } }), { status: 400 });\n      const query = `DELETE FROM ${table} WHERE ${whereClauses.join(' AND ')}`;"
);

// Filter allowed columns in GET
content = content.replace(
  `url.searchParams.forEach((value, key) => {
        if (key.startsWith('eq_')) {
          whereClauses.push(\`\${key.substring(3)} = ?\`);
          queryParams.push(value);
        } else if (key.startsWith('ilike_')) {
          whereClauses.push(\`\${key.substring(6)} LIKE ?\`);
          queryParams.push(\`%\${value}%\`);
        }
      });`,
  `url.searchParams.forEach((value, key) => {
        if (key.startsWith('eq_')) {
          const col = key.substring(3);
          if (ALLOWED_COLUMNS[table] && ALLOWED_COLUMNS[table].includes(col)) {
            whereClauses.push(\`\${col} = ?\`);
            queryParams.push(value);
          }
        } else if (key.startsWith('ilike_')) {
          const col = key.substring(6);
          if (ALLOWED_COLUMNS[table] && ALLOWED_COLUMNS[table].includes(col)) {
            whereClauses.push(\`\${col} LIKE ?\`);
            queryParams.push(\`%\${value}%\`);
          }
        }
      });`
);

// Filter allowed columns in PATCH
content = content.replace(
  `url.searchParams.forEach((value, key) => {
        if (key.startsWith('eq_')) {
          whereClauses.push(\`\${key.substring(3)} = ?\`);
          queryParams.push(value);
        }
      });`,
  `url.searchParams.forEach((value, key) => {
        if (key.startsWith('eq_')) {
          const col = key.substring(3);
          if (ALLOWED_COLUMNS[table] && ALLOWED_COLUMNS[table].includes(col)) {
            whereClauses.push(\`\${col} = ?\`);
            queryParams.push(value);
          }
        }
      });`
);

// Filter allowed columns in DELETE
content = content.replace(
  `url.searchParams.forEach((value, key) => {
        if (key.startsWith('eq_')) {
          whereClauses.push(\`\${key.substring(3)} = ?\`);
          queryParams.push(value);
        }
      });`,
  `url.searchParams.forEach((value, key) => {
        if (key.startsWith('eq_')) {
          const col = key.substring(3);
          if (ALLOWED_COLUMNS[table] && ALLOWED_COLUMNS[table].includes(col)) {
            whereClauses.push(\`\${col} = ?\`);
            queryParams.push(value);
          }
        }
      });`
);

// Use JWT user for quiz_attempts POST
content = content.replace(
  "// Update profile stats if inserting a quiz attempt\n      if (success && table === 'quiz_attempts' && body.user_id) {",
  "// Update profile stats if inserting a quiz attempt\n      if (success && table === 'quiz_attempts' && (body.user_id || context.data.user?.id)) {\n        body.user_id = body.user_id || context.data.user?.id;"
);
// wait, the insertion happens before this. We need to overwrite body.user_id BEFORE the insertion.
content = content.replace(
  "else if (method === 'POST') {\n" + AUTH_CHECK + "      const body = await request.json();",
  "else if (method === 'POST') {\n" + AUTH_CHECK + "      const body = await request.json();\n      if (table === 'quiz_attempts' && !Array.isArray(body)) {\n        body.user_id = context.data.user.id || context.data.user.user_id;\n      }"
);

// Method not allowed
content = content.replace(
  "} catch (err) {",
  "} else {\n      return new Response(JSON.stringify({ error: { message: 'Method not allowed' } }), { status: 405 });\n    }\n\n  } catch (err) {"
);

fs.writeFileSync('functions/api/[table].js', content, 'utf8');
console.log('done');
