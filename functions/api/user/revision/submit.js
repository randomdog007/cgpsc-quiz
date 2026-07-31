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
  const stmts = [];

  for (const [qIdStr, answerPayload] of Object.entries(answers)) {
    const qId = Number(qIdStr);
    const correct = answerMap[qId];
    const state = stateMap[qId] || { wrong_count: 0, ease_factor: 2.5, interval_days: 1 };

    if (!correct) continue;

    // Support both old format (plain number) and new format ({ answer, confidence })
    const userAnswer = (answerPayload !== null && typeof answerPayload === 'object')
      ? answerPayload.answer
      : answerPayload;
    const confidence = (answerPayload !== null && typeof answerPayload === 'object' && answerPayload.confidence)
      ? Number(answerPayload.confidence)
      : 2; // default: 'got it'

    const isSkipped = userAnswer === null || userAnswer === undefined;
    const isCorrect = !isSkipped && Number(userAnswer) === Number(correct.correct_option);

    if (isCorrect) correctCount++;
    else if (isSkipped) skippedCount++;
    else wrongCount++;

    // ── SM-2 Algorithm ──
    let newEase = state.ease_factor;
    let newInterval = state.interval_days;

    // Confidence multiplier: 1=guessed(0.6x), 2=got it(1.0x), 3=nailed it(1.3x)
    const confidenceMultiplier = confidence === 1 ? 0.6 : confidence === 3 ? 1.3 : 1.0;

    if (isCorrect) {
      // Correct: push further out, adjusted by confidence
      const easeBoost = confidence === 3 ? 0.15 : confidence === 1 ? 0.0 : 0.1;
      newEase = Math.min(state.ease_factor + easeBoost, 3.0);
      if (state.interval_days === 0) {
        newInterval = confidence === 3 ? 2 : 1;
      } else if (state.interval_days === 1) {
        newInterval = confidence === 3 ? 4 : 3;
      } else {
        newInterval = Math.min(
          Math.round(state.interval_days * newEase * confidenceMultiplier),
          90  // cap at 90 days
        );
      }
    } else if (isSkipped) {
      // Skipped: gently shorten interval but don't reset
      newInterval = Math.max(1, Math.floor(state.interval_days * 0.7));
    } else {
      // Wrong: reset, ease penalty depends on confidence (if they guessed, penalty is lighter)
      const easePenalty = confidence === 1 ? 0.1 : 0.2;
      newEase = Math.max(state.ease_factor - easePenalty, 1.3);
      newInterval = 0;
    }

    // ── Update wrong_questions ──
    stmts.push(env.cgpsc_quiz_db.prepare(`
      UPDATE wrong_questions SET
        wrong_count   = CASE WHEN ? = 0 THEN wrong_count + 1 ELSE wrong_count END,
        ease_factor   = ?,
        interval_days = ?,
        next_revision = datetime('now', '+' || ? || ' days'),
        last_wrong_at = CASE WHEN ? = 0 THEN CURRENT_TIMESTAMP ELSE last_wrong_at END
      WHERE user_id = ? AND question_id = ?
    `).bind(
      (isCorrect || isSkipped) ? 1 : 0,
      newEase,
      newInterval,
      newInterval,
      (isCorrect || isSkipped) ? 1 : 0,
      user.id,
      qId
    ));

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
  
  if (stmts.length > 0) {
    try {
      await env.cgpsc_quiz_db.batch(stmts);
    } catch (e) {
      return Response.json({ error: 'Failed to update database' }, { status: 500 });
    }
  }

  // ── Update streak ──
  if (correctCount > 0 || wrongCount > 0) {
    await updateStreak(env, user.id);
  }

  // ── Get remaining due count ──
  const remaining = await env.cgpsc_quiz_db.prepare(`
    SELECT COUNT(*) as cnt
    FROM wrong_questions
    WHERE user_id = ? AND next_revision <= datetime('now')
  `).bind(user.id).first();

  return Response.json({
    correctCount,
    wrongCount,
    skippedCount,
    totalAttempted: results.length,
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
