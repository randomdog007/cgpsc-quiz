import { authenticate } from '../../../utils/auth.js';

export async function onRequestGet(context) {
  const { request, env } = context;

  const user = await authenticate(request, env);
  if (!user) {
    return Response.json({ error: 'Login required' }, { status: 401 });
  }

  const stats = await env.DB.prepare(`
    SELECT
      COUNT(*)                                          AS total_tracked,
      SUM(CASE WHEN next_revision <= datetime('now')
               THEN 1 ELSE 0 END)                      AS due_today,
      SUM(CASE WHEN interval_days >= 30
               THEN 1 ELSE 0 END)                      AS mastered,
      SUM(CASE WHEN interval_days < 7
               THEN 1 ELSE 0 END)                      AS learning,
      SUM(wrong_count)                                  AS total_wrongs,
      AVG(ease_factor)                                  AS avg_ease,
      MAX(wrong_count)                                  AS hardest_wrong_count
    FROM wrong_questions
    WHERE user_id = ?
  `).bind(user.id).first();

  // ── Hardest questions (most wrong attempts) ──
  const { results: hardest } = await env.DB.prepare(`
    SELECT
      wq.question_id,
      wq.wrong_count,
      wq.interval_days,
      q.question,
      q.question_hi,
      t.name AS topic_name,
      s.name AS subject_name
    FROM wrong_questions wq
    JOIN questions q ON wq.question_id = q.id
    JOIN topics t    ON q.topic_id = t.id
    JOIN subjects s  ON t.subject_id = s.id
    WHERE wq.user_id = ?
    ORDER BY wq.wrong_count DESC
    LIMIT 5
  `).bind(user.id).all();

  // ── Subject-wise breakdown ──
  const { results: bySubject } = await env.DB.prepare(`
    SELECT
      s.name       AS subject_name,
      s.name_hi    AS subject_name_hi,
      COUNT(*)     AS question_count,
      SUM(CASE WHEN wq.next_revision <= datetime('now')
               THEN 1 ELSE 0 END) AS due_count,
      AVG(wq.ease_factor) AS avg_ease
    FROM wrong_questions wq
    JOIN questions q ON wq.question_id = q.id
    JOIN topics t    ON q.topic_id = t.id
    JOIN subjects s  ON t.subject_id = s.id
    WHERE wq.user_id = ?
    GROUP BY s.id
    ORDER BY due_count DESC
  `).bind(user.id).all();

  // ── Revision activity (last 14 days) ──
  const { results: activity } = await env.DB.prepare(`
    SELECT
      date(last_wrong_at) AS day,
      COUNT(*)            AS revised_count
    FROM wrong_questions
    WHERE user_id = ?
      AND last_wrong_at >= datetime('now', '-14 days')
    GROUP BY date(last_wrong_at)
    ORDER BY day
  `).bind(user.id).all();

  return Response.json({
    totalTracked:  stats?.total_tracked || 0,
    dueToday:      stats?.due_today || 0,
    mastered:      stats?.mastered || 0,
    learning:      stats?.learning || 0,
    totalWrongs:   stats?.total_wrongs || 0,
    avgEase:       stats?.avg_ease ? Math.round(stats.avg_ease * 10) / 10 : 0,
    hardest: hardest.map(h => ({
      questionId:  h.question_id,
      wrongCount:  h.wrong_count,
      interval:    h.interval_days,
      text:        h.question,
      textHi:      h.question_hi,
      topic:       h.topic_name,
      subject:     h.subject_name
    })),
    bySubject: bySubject.map(s => ({
      subject:     s.subject_name,
      subjectHi:   s.subject_name_hi,
      total:       s.question_count,
      due:         s.due_count,
      avgEase:     Math.round((s.avg_ease || 0) * 10) / 10
    })),
    activity: activity.map(a => ({
      day:     a.day,
      revised: a.revised_count
    }))
  });
}
