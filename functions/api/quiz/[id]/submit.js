import { authenticate } from '../../../utils/auth.js';
import { rebuildQuizInternal } from '../../../utils/rebuild.js';

export async function onRequestPost(context) {
  const { request, env, params } = context;
  const quizId = parseInt(params.id, 10);

  if (isNaN(quizId)) {
    return Response.json({ error: 'Invalid Quiz ID' }, { status: 400 });
  }

  // ═══════════════════════════════════════════
  // 1. AUTHENTICATE
  // ═══════════════════════════════════════════
  const user = await authenticate(request, env);
  if (!user) {
    return Response.json({ error: 'Login required' }, { status: 401 });
  }

  // ═══════════════════════════════════════════
  // 2. PARSE REQUEST
  // ═══════════════════════════════════════════
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { version, answers, timeTaken } = body;

  if (!answers || typeof answers !== 'object' || Object.keys(answers).length === 0) {
    return Response.json({ error: 'No answers provided' }, { status: 400 });
  }

  // ═══════════════════════════════════════════
  // 3. FETCH QUIZ METADATA (tiny D1 read)
  // ═══════════════════════════════════════════
  const quiz = await env.DB.prepare(`
    SELECT
      q.id, q.version, q.is_premium, q.is_published,
      q.total_questions, q.topic_id,
      t.subject_id,
      q.subtopic_id
    FROM quizzes q
    JOIN topics t ON q.topic_id = t.id
    WHERE q.id = ? AND q.is_published = 1
  `).bind(quizId).first();

  if (!quiz) {
    return Response.json({ error: 'Quiz not found' }, { status: 404 });
  }

  // Version check: reject stale submissions
  if (version !== quiz.version) {
    return Response.json({
      error: 'Quiz was updated. Please reload and try again.',
      code: 'VERSION_MISMATCH'
    }, { status: 409 });
  }

  // ═══════════════════════════════════════════
  // 4. CHECK ACCESS (premium gate)
  // ═══════════════════════════════════════════
  if (quiz.is_premium) {
    const hasAccess = await checkPremiumAccess(env, user.id, quizId);
    if (!hasAccess) {
      return Response.json({
        error: 'Premium quiz. Upgrade to attempt.',
        code: 'PAYMENT_REQUIRED'
      }, { status: 402 });
    }
  }

  // ═══════════════════════════════════════════
  // 5. FETCH PRIVATE ANSWERS FROM KV
  // ═══════════════════════════════════════════
  const privateKey = `quiz:private:v${quiz.version}:${quizId}`;
  let privateRaw = env.QUIZ_KV ? await env.QUIZ_KV.get(privateKey) : null;
  let privateData;

  if (!privateRaw) {
    // KV miss → rebuild from D1 (fallback)
    const rebuilt = await rebuildQuizInternal(env, quizId);
    if (rebuilt.error) {
      return Response.json({ error: 'Answer key missing' }, { status: 500 });
    }
    privateData = rebuilt.privatePayload;
  } else {
    privateData = JSON.parse(privateRaw);
  }

  // ═══════════════════════════════════════════
  // 6. SCORE SERVER-SIDE
  // ═══════════════════════════════════════════
  let correct = 0;
  let wrong = 0;
  let skipped = 0;

  const results = privateData.answers.map(a => {
    const userAnswer = answers[String(a.id)];
    const isSkipped = userAnswer === undefined || userAnswer === null;
    const isCorrect = !isSkipped && userAnswer === a.correctOption;

    if (isCorrect) correct++;
    else if (isSkipped) skipped++;
    else wrong++;

    return {
      questionId:    a.id,
      order:         a.order,
      userAnswer:    isSkipped ? null : userAnswer,
      correctOption: a.correctOption,
      isCorrect,
      isSkipped,
      explanation:   a.explanation,
      explanationHi: a.explanationHi
    };
  });

  const total = results.length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  // CGPSC marking: +1 correct, -1/3 wrong
  const marks = correct - (wrong * 0.33);
  const maxMarks = total;

  // ═══════════════════════════════════════════
  // 7. SAVE ATTEMPT
  // ═══════════════════════════════════════════
  await env.DB.prepare(`
    INSERT INTO quiz_attempts
      (user_id, quiz_id, subject_id, topic_id, subtopic_id,
       score, total, accuracy, time_taken,
       marks, max_marks, wrong, skipped, answers_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    user.id,
    quizId,
    quiz.subject_id,
    quiz.topic_id,
    quiz.subtopic_id,
    correct,
    total,
    accuracy,
    timeTaken || 0,
    Math.round(marks * 100) / 100,
    maxMarks,
    wrong,
    skipped,
    JSON.stringify(answers)
  ).run();

  // ═══════════════════════════════════════════
  // 8. UPDATE SPACED REPETITION (wrong_questions)
  // ═══════════════════════════════════════════
  const wrongQuestions = results.filter(r => !r.isCorrect && !r.isSkipped);
  const correctQuestions = results.filter(r => r.isCorrect);

  for (const w of wrongQuestions) {
    await env.DB.prepare(`
      INSERT INTO wrong_questions (user_id, question_id, quiz_id, next_revision, interval_days)
      VALUES (?, ?, ?, datetime('now', '+1 day'), 1)
      ON CONFLICT(user_id, question_id) DO UPDATE SET
        wrong_count   = wrong_count + 1,
        last_wrong_at = CURRENT_TIMESTAMP,
        interval_days = 1,
        ease_factor   = MAX(1.3, ease_factor - 0.2),
        next_revision = datetime('now', '+1 day')
    `).bind(user.id, w.questionId, quizId).run();
  }

  for (const c of correctQuestions) {
    await env.DB.prepare(`
      UPDATE wrong_questions
      SET
        interval_days = MIN(interval_days * CAST(ease_factor AS INTEGER), 90),
        ease_factor   = MIN(ease_factor + 0.1, 3.0),
        next_revision = datetime('now', '+' || CAST(interval_days AS TEXT) || ' days')
      WHERE user_id = ? AND question_id = ?
    `).bind(user.id, c.questionId).run();
  }

  // ═══════════════════════════════════════════
  // 9. UPDATE PROFILE STATS
  // ═══════════════════════════════════════════
  await env.DB.prepare(`
    UPDATE profiles SET
      total_attempts = total_attempts + 1,
      total_score    = total_score + ?,
      avg_accuracy   = CAST(
        (total_score + ?) * 100.0 /
        NULLIF((SELECT SUM(total) FROM quiz_attempts WHERE user_id = ?), 0)
        AS INTEGER
      ),
      last_seen_at   = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(correct, correct, user.id, user.id).run();

  // ═══════════════════════════════════════════
  // 10. RETURN RESULTS
  // ═══════════════════════════════════════════
  return Response.json({
    quizId,
    score:    correct,
    total,
    wrong,
    skipped,
    accuracy,
    marks:    Math.round(marks * 100) / 100,
    maxMarks,
    timeTaken: timeTaken || 0,
    results
  });
}

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────

async function checkPremiumAccess(env, userId, quizId) {
  // Check subscription tier first
  const profile = await env.DB.prepare(
    `SELECT tier, tier_expiry FROM profiles WHERE id = ?`
  ).bind(userId).first();

  if (profile?.tier === 'premium') {
    if (!profile.tier_expiry) return true;  // lifetime
    if (new Date(profile.tier_expiry) > new Date()) return true;  // active
  }

  // Check per-quiz purchase
  const purchase = await env.DB.prepare(
    `SELECT id FROM purchases WHERE user_id = ? AND quiz_id = ?`
  ).bind(userId, quizId).first();

  return !!purchase;
}
