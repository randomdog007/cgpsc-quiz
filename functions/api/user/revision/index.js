import { authenticate } from '../../../utils/auth.js';

export async function onRequestGet(context) {
  const { request, env } = context;

  const user = await authenticate(request, env);
  if (!user) {
    return Response.json({ error: 'Login required' }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit')) || 20, 50);

  // ── Fetch due questions ──
  const { results: dueQuestions } = await env.DB.prepare(`
    SELECT
      wq.question_id,
      wq.quiz_id,
      wq.wrong_count,
      wq.interval_days,
      wq.ease_factor,
      q.question,
      q.question_hi,
      q.option_a, q.option_b, q.option_c, q.option_d,
      q.option_a_hi, q.option_b_hi, q.option_c_hi, q.option_d_hi,
      q.topic_id,
      t.name    AS topic_name,
      t.name_hi AS topic_name_hi,
      s.name    AS subject_name,
      s.name_hi AS subject_name_hi
    FROM wrong_questions wq
    JOIN questions q ON wq.question_id = q.id
    JOIN topics t    ON q.topic_id = t.id
    JOIN subjects s  ON t.subject_id = s.id
    WHERE wq.user_id = ?
      AND wq.next_revision <= datetime('now')
    ORDER BY wq.wrong_count DESC, wq.last_wrong_at ASC
    LIMIT ?
  `).bind(user.id, limit).all();

  // ── Get total due count (for badge/counter) ──
  const countResult = await env.DB.prepare(`
    SELECT COUNT(*) as due_count
    FROM wrong_questions
    WHERE user_id = ? AND next_revision <= datetime('now')
  `).bind(user.id).first();

  // ── Get streak info ──
  const profile = await env.DB.prepare(`
    SELECT current_streak, best_streak, last_seen_at
    FROM profiles WHERE id = ?
  `).bind(user.id).first();

  // ── Build response (NO answers, NO explanations) ──
  const questions = dueQuestions.map(q => ({
    questionId:  q.question_id,
    quizId:      q.quiz_id,
    wrongCount:  q.wrong_count,
    intervalDays: q.interval_days,
    text:        q.question,
    textHi:      q.question_hi,
    options: {
      a: q.option_a,
      b: q.option_b,
      c: q.option_c,
      d: q.option_d
    },
    optionsHi: {
      a: q.option_a_hi,
      b: q.option_b_hi,
      c: q.option_c_hi,
      d: q.option_d_hi
    },
    subject:     q.subject_name,
    subjectHi:   q.subject_name_hi,
    topic:       q.topic_name,
    topicHi:     q.topic_name_hi
  }));

  return Response.json({
    dueCount:   countResult?.due_count || 0,
    showing:    questions.length,
    questions,
    streak: {
      current: profile?.current_streak || 0,
      best:    profile?.best_streak || 0
    }
  });
}
