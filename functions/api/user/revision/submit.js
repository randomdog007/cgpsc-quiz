import { authenticate } from '../../../utils/auth.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  const user = await authenticate(request, env);
  if (!user) {
    return Response.json({ error: 'Login required' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { answers } = body;

  if (!answers || Object.keys(answers).length === 0) {
    return Response.json({ error: 'No answers provided' }, { status: 400 });
  }

  const questionIds = Object.keys(answers).map(Number);

  // ── Fetch correct answers from DB (server-side only) ──
  const placeholders = questionIds.map(() => '?').join(',');
  const { results: correctAnswers } = await env.cgpsc_quiz_db.prepare(`
    SELECT id, correct_option, explanation, explanation_hi
    FROM questions
    WHERE id IN (${placeholders})
  `).bind(...questionIds).all();

  const answerMap = {};
  for (const a of correctAnswers) {
    answerMap[a.id] = a;
  }

  // ── Fetch current spaced repetition state ──
  const { results: wrStates } = await env.cgpsc_quiz_db.prepare(`
    SELECT question_id, wrong_count, ease_factor, interval_days
    FROM wrong_questions
    WHERE user_id = ? AND question_id IN (${placeholders})
  `).bind(user.id, ...questionIds).all();

  const stateMap = {};
  for (const s of wrStates) {
    stateMap[s.question_id] = s;
  }

  // ── Process each answer through SM-2 ──
  const results = [];
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  for (const [qIdStr, userAnswer] of Object.entries(answers)) {
    const qId = Number(qIdStr);
    const correct = answerMap[qId];
    const state = stateMap[qId] || { wrong_count: 0, ease_factor: 2.5, interval_days: 1 };

    if (!correct) continue;

    const isSkipped = userAnswer === null || userAnswer === undefined;
    const isCorrect = !isSkipped && userAnswer === correct.correct_option;

    if (isCorrect) correctCount++;
    else if (isSkipped) skippedCount++;
    else wrongCount++;

    // ── SM-2 Algorithm ──
    let newEase = state.ease_factor;
    let newInterval = state.interval_days;

    if (isCorrect) {
      // Correct: push further out
      newEase = Math.min(state.ease_factor + 0.1, 3.0);
      newInterval = Math.min(
        Math.round(state.interval_days * newEase),
        90  // cap at 90 days
      );
    } else {
      // Wrong or skipped: reset to 0 days for testing
      newEase = Math.max(state.ease_factor - 0.2, 1.3);
      newInterval = 0;
    }

    // ── Update wrong_questions ──
    await env.cgpsc_quiz_db.prepare(`
      UPDATE wrong_questions SET
        wrong_count   = CASE WHEN ? = 0 THEN wrong_count + 1 ELSE wrong_count END,
        ease_factor   = ?,
        interval_days = ?,
        next_revision = datetime('now', '+' || ? || ' days'),
        last_wrong_at = CASE WHEN ? = 0 THEN CURRENT_TIMESTAMP ELSE last_wrong_at END
      WHERE user_id = ? AND question_id = ?
    `).bind(
      isCorrect ? 1 : 0,   // increment wrong_count only if wrong
      newEase,
      newInterval,
      newInterval,
      isCorrect ? 1 : 0,
      user.id,
      qId
    ).run();

    results.push({
      questionId:    qId,
      userAnswer:    isSkipped ? null : userAnswer,
      correctOption: correct.correct_option,
      isCorrect,
      isSkipped,
      explanation:   correct.explanation,      // revealed after attempt
      explanationHi: correct.explanation_hi,
      newInterval,                              // "Next revision in 5 days"
      newEase: Math.round(newEase * 10) / 10
    });
  }

  // ── Update streak ──
  await updateStreak(env, user.id);

  // ── Get remaining due count ──
  const remaining = await env.cgpsc_quiz_db.prepare(`
    SELECT COUNT(*) as cnt
    FROM wrong_questions
    WHERE user_id = ? AND next_revision <= datetime('now')
  `).bind(user.id).first();

  return Response.json({
    correct:   correctCount,
    wrong:     wrongCount,
    skipped:   skippedCount,
    total:     results.length,
    remaining: remaining?.cnt || 0,
    results
  });
}

// ──────────────────────────────────────────────
// Streak Logic
// ──────────────────────────────────────────────
async function updateStreak(env, userId) {
  const profile = await env.cgpsc_quiz_db.prepare(
    `SELECT current_streak, best_streak, last_seen_at FROM profiles WHERE id = ?`
  ).bind(userId).first();

  if (!profile) return;

  const lastSeen = profile.last_seen_at ? new Date(profile.last_seen_at) : null;
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now - 86400000).toISOString().slice(0, 10);
  const lastSeenDay = lastSeen ? lastSeen.toISOString().slice(0, 10) : null;

  let newStreak = profile.current_streak || 0;

  if (lastSeenDay === today) {
    // Already revised today. No change.
    return;
  } else if (lastSeenDay === yesterday) {
    // Consecutive day. Increment.
    newStreak += 1;
  } else {
    // Missed a day (or first time). Reset.
    newStreak = 1;
  }

  const newBest = Math.max(newStreak, profile.best_streak || 0);

  await env.cgpsc_quiz_db.prepare(`
    UPDATE profiles SET
      current_streak = ?,
      best_streak    = ?,
      last_seen_at   = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(newStreak, newBest, userId).run();
}
