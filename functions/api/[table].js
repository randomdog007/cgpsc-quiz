
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

export async function onRequest(context) {
  const { request, env, params } = context;
  const table = params.table;
  const url = new URL(request.url);
  const method = request.method;

  if (!/^[a-zA-Z0-9_]+$/.test(table)) {
    return new Response(JSON.stringify({ error: { message: "Invalid table name" } }), { 
      status: 400, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } 
    });
  }

  // Premium Check Stub for quizzes table
  // A real implementation would verify auth token, check purchases table, etc.
  const isPremiumLocked = async (quizId, env, context) => {
    // If not logged in, it's definitely locked
    if (!context.data || !context.data.user) return true;
    
    // Check if the user has purchased this quiz
    const userId = context.data.user.user_id;
    const stmt = env.cgpsc_quiz_db.prepare(`SELECT id FROM purchases WHERE user_id = ? AND quiz_id = ?`).bind(userId, quizId);
    const purchase = await stmt.first();
    
    // If no purchase found, it is locked.
    return !purchase;
  };

  try {
    if (method === 'GET') {
      if (table === 'user_rank') {
        const userId = url.searchParams.get('eq_user_id');
        if (!userId) return new Response(JSON.stringify({ error: { message: "user_id required" } }), { status: 400 });
        
        const countResult = await env.cgpsc_quiz_db.prepare(`SELECT COUNT(*) as total FROM profiles`).first();
        const totalUsers = countResult ? countResult.total : 0;
        
        const query = `
          SELECT * FROM (
            SELECT *, RANK() OVER (ORDER BY total_score DESC, total_attempts ASC, id ASC) as rank
            FROM profiles
          ) WHERE id = ?
        `;
        const userRank = await env.cgpsc_quiz_db.prepare(query).bind(userId).first();
        
        const rank = userRank ? userRank.rank : 0;
        const percentile = totalUsers > 0 && rank > 0 ? Math.round(((totalUsers - rank) / totalUsers) * 100) : 0;
        
        return new Response(JSON.stringify({ data: { user: userRank, totalUsers, percentile, rank }, error: null }), { 
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store, no-cache, must-revalidate' } 
        });
      }

      let query = `SELECT * FROM ${table}`;
      let queryParams = [];
      let whereClauses = [];

      url.searchParams.forEach((value, key) => {
        if (key.startsWith('eq_')) {
          const col = key.substring(3);
          if (ALLOWED_COLUMNS[table] && ALLOWED_COLUMNS[table].includes(col)) {
            whereClauses.push(`${col} = ?`);
            queryParams.push(value);
          }
        } else if (key.startsWith('ilike_')) {
          const col = key.substring(6);
          if (ALLOWED_COLUMNS[table] && ALLOWED_COLUMNS[table].includes(col)) {
            whereClauses.push(`${col} LIKE ?`);
            queryParams.push(`%${value}%`);
          }
        }
      });

      if (whereClauses.length > 0) {
        query += ` WHERE ` + whereClauses.join(' AND ');
      }

      let orderClause = '';
      const orderParam = url.searchParams.get('order');
      if (orderParam) {
        if (orderParam.includes('.')) {
          const parts = orderParam.split('.');
          const col = parts[0];
          const dir = parts[1].toLowerCase() === 'desc' ? 'DESC' : 'ASC';
          if (/^[a-zA-Z0-9_]+$/.test(col)) {
            orderClause = ` ORDER BY ${col} ${dir}`;
          }
        } else if (/^[a-zA-Z0-9_]+$/.test(orderParam)) {
          orderClause = ` ORDER BY ${orderParam}`;
          if (url.searchParams.get('desc') === 'true') {
            orderClause += ` DESC`;
          }
        }
      }

      if (orderClause) {
        query += orderClause;
      }

      const limit = url.searchParams.get('limit');
      if (limit && !isNaN(parseInt(limit))) {
        query += ` LIMIT ${Math.min(parseInt(limit), 200)}`;
      }

      const select = url.searchParams.get('select');
      
      // Special case: Supabase nested select for quiz_attempts
      if (table === 'quiz_attempts' && select && select.includes('quizzes(title')) {
        query = `
          SELECT qa.*, 
            q.title AS quiz_title, q.title_hi AS quiz_title_hi,
            s.name AS subject_name, s.name_hi AS subject_name_hi,
            t.name AS topic_name, t.name_hi AS topic_name_hi
          FROM quiz_attempts qa
          LEFT JOIN quizzes q ON qa.quiz_id = q.id
          LEFT JOIN subjects s ON qa.subject_id = s.id
          LEFT JOIN topics t ON qa.topic_id = t.id
        `;
        if (whereClauses.length > 0) {
           const mappedWhere = whereClauses.map(w => `qa.${w}`);
           query += ` WHERE ` + mappedWhere.join(' AND ');
        }
        if (orderClause) query += orderClause.replace('ORDER BY ', 'ORDER BY qa.');
        if (limit) query += ` LIMIT ${Math.min(parseInt(limit), 200)}`;
      }

      const searchQueryParam = url.searchParams.get('search_query');
      if (table === 'quizzes' && searchQueryParam) {
        query = `
          SELECT q.* 
          FROM quizzes q
          LEFT JOIN topics t ON q.topic_id = t.id
          WHERE q.title LIKE ? 
             OR q.title_hi LIKE ? 
             OR q.description LIKE ? 
             OR q.description_hi LIKE ? 
             OR t.name LIKE ? 
             OR t.name_hi LIKE ?
          ORDER BY 
            CASE 
              WHEN q.title = ? OR q.title_hi = ? THEN 1
              WHEN q.title LIKE ? OR q.title_hi LIKE ? THEN 2
              ELSE 3 
            END ASC
        `;
        const p = `%${searchQueryParam}%`;
        const exact = searchQueryParam;
        const exactPrefix = `${searchQueryParam}%`;
        queryParams = [p, p, p, p, p, p, exact, exact, exactPrefix, exactPrefix];
        if (limit && !isNaN(parseInt(limit))) {
          query += ` LIMIT ${Math.min(parseInt(limit), 200)}`;
        }
      }

      const stmt = env.cgpsc_quiz_db.prepare(query).bind(...queryParams);
      const { results } = await stmt.all();

      let finalResults = results;
      if (table === 'quiz_attempts' && select && select.includes('quizzes(title')) {
        finalResults = results.map(row => {
          const { quiz_title, quiz_title_hi, subject_name, subject_name_hi, topic_name, topic_name_hi, ...rest } = row;
          return {
            ...rest,
            quizzes: { title: quiz_title, title_hi: quiz_title_hi },
            subjects: { name: subject_name, name_hi: subject_name_hi },
            topics: { name: topic_name, name_hi: topic_name_hi }
          };
        });
      }

      // Premium Mock: if table is questions, check if quiz is premium.
      if (table === 'questions') {
        const quizId = url.searchParams.get('eq_quiz_id');
        if (quizId) {
          const quizStmt = env.cgpsc_quiz_db.prepare(`SELECT is_premium FROM quizzes WHERE id = ?`).bind(quizId);
          const quizResult = await quizStmt.first();
          if (quizResult && quizResult.is_premium === 1 && (await isPremiumLocked(quizId, env, context))) {
            // Return locked placeholder
            return new Response(JSON.stringify({ 
              data: null, 
              error: { message: "This quiz is premium. Please purchase to unlock." }
            }), { headers: { 'Content-Type': 'application/json' } });
          }
        }
      }

      if (url.searchParams.get('single') === 'true') {
        return new Response(JSON.stringify({ data: finalResults[0] || null, error: null }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } });
      }
      return new Response(JSON.stringify({ data: finalResults, error: null }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } });
    } 
    
    else if (method === 'POST') {

      if (!context.data || !context.data.user) {
        return new Response(JSON.stringify({ error: { message: "Authentication required" } }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      }
      const body = await request.json();
      if (table === 'quiz_attempts' && !Array.isArray(body)) {
        body.user_id = context.data.user.id || context.data.user.user_id;
      }
      let success = false;
      
      if (Array.isArray(body)) {
        if (body.length === 0) return new Response(JSON.stringify({ data: null, error: null }), { headers: { 'Content-Type': 'application/json' } });
        
        const keys = Object.keys(body[0]);
        const placeholders = keys.map(() => '?').join(', ');
        const stmts = body.map(row => {
          const values = keys.map(k => row[k] !== undefined ? row[k] : null);
          return env.cgpsc_quiz_db.prepare(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`).bind(...values);
        });
        
        const results = await env.cgpsc_quiz_db.batch(stmts);
        success = results.every(r => r.success);
      } else {
        const keys = Object.keys(body);
        const values = Object.values(body);
        
        const placeholders = keys.map(() => '?').join(', ');
        const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
        
        const result = await env.cgpsc_quiz_db.prepare(query).bind(...values).run();
        success = result.success;
      }
      
      // Update profile stats if inserting a quiz attempt
      if (success && table === 'quiz_attempts' && (body.user_id || context.data.user?.id)) {
        body.user_id = body.user_id || context.data.user?.id;
        const userId = body.user_id;
        const score = body.score || 0;
        
        // Fetch current profile
        const profStmt = env.cgpsc_quiz_db.prepare(`SELECT total_score, total_attempts, current_streak, best_streak, last_seen_at FROM profiles WHERE id = ?`).bind(userId);
        const profile = await profStmt.first();
        
        if (profile) {
          const now = new Date();
          let currentStreak = profile.current_streak || 0;
          let bestStreak = profile.best_streak || 0;
          
          if (profile.last_seen_at) {
            const lastSeenDate = new Date(profile.last_seen_at);
            const diffHours = (now - lastSeenDate) / (1000 * 60 * 60);
            
            if (diffHours > 24 && diffHours < 48) {
              currentStreak += 1;
            } else if (diffHours >= 48) {
              currentStreak = 1;
            } else if (currentStreak === 0) {
              currentStreak = 1;
            }
          } else {
            currentStreak = 1;
          }
          
          if (currentStreak > bestStreak) bestStreak = currentStreak;
          
          const newTotalScore = (profile.total_score || 0) + score;
          const newTotalAttempts = (profile.total_attempts || 0) + 1;
          
          await env.cgpsc_quiz_db.prepare(`
            UPDATE profiles 
            SET total_score = ?, total_attempts = ?, current_streak = ?, best_streak = ?, last_seen_at = ?
            WHERE id = ?
          `).bind(newTotalScore, newTotalAttempts, currentStreak, bestStreak, now.toISOString(), userId).run();
        }
      }
      
      return new Response(JSON.stringify({ data: null, error: success ? null : { message: "Insert failed" } }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } });
    }

    else if (method === 'PATCH') {

      if (!context.data || !context.data.user) {
        return new Response(JSON.stringify({ error: { message: "Authentication required" } }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      }
      const body = await request.json();
      const keys = Object.keys(body);
      const values = Object.values(body);

      let queryParams = [...values];
      let whereClauses = [];
      url.searchParams.forEach((value, key) => {
        if (key.startsWith('eq_')) {
          const col = key.substring(3);
          if (ALLOWED_COLUMNS[table] && ALLOWED_COLUMNS[table].includes(col)) {
            whereClauses.push(`${col} = ?`);
            queryParams.push(value);
          }
        }
      });

      if (whereClauses.length === 0) return new Response(JSON.stringify({ error: { message: 'At least one filter required for PATCH' } }), { status: 400 });
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClauses.join(' AND ')}`;

      const { success } = await env.cgpsc_quiz_db.prepare(query).bind(...queryParams).run();
      return new Response(JSON.stringify({ data: null, error: success ? null : { message: "Update failed" } }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } });
    }

    else if (method === 'DELETE') {

      if (!context.data || !context.data.user) {
        return new Response(JSON.stringify({ error: { message: "Authentication required" } }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      }
      let queryParams = [];
      let whereClauses = [];
      url.searchParams.forEach((value, key) => {
        if (key.startsWith('eq_')) {
          const col = key.substring(3);
          if (ALLOWED_COLUMNS[table] && ALLOWED_COLUMNS[table].includes(col)) {
            whereClauses.push(`${col} = ?`);
            queryParams.push(value);
          }
        }
      });

      if (whereClauses.length === 0) return new Response(JSON.stringify({ error: { message: 'At least one filter required for DELETE' } }), { status: 400 });
      const query = `DELETE FROM ${table} WHERE ${whereClauses.join(' AND ')}`;
      const { success } = await env.cgpsc_quiz_db.prepare(query).bind(...queryParams).run();
      return new Response(JSON.stringify({ data: null, error: success ? null : { message: "Delete failed" } }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } });
    }

  } else {
      return new Response(JSON.stringify({ error: { message: 'Method not allowed' } }), { status: 405 });
    }

  } catch (err) {
    return new Response(JSON.stringify({ error: { message: err.message } }), { status: 500, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } });
  }
}
