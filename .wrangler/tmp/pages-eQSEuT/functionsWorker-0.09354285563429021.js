var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// utils/auth.js
var GOOGLE_JWKS_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";
var cachedKeys = null;
var cachedKeysAt = 0;
var KEY_TTL_MS = 60 * 60 * 1e3;
async function getGooglePublicKeys() {
  const now = Date.now();
  if (cachedKeys && now - cachedKeysAt < KEY_TTL_MS) return cachedKeys;
  const res = await fetch(GOOGLE_JWKS_URL);
  const { keys } = await res.json();
  cachedKeys = keys;
  cachedKeysAt = now;
  return keys;
}
__name(getGooglePublicKeys, "getGooglePublicKeys");
function base64urlToArrayBuffer(b64url) {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}
__name(base64urlToArrayBuffer, "base64urlToArrayBuffer");
async function importRSAPublicKey(jwk) {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
}
__name(importRSAPublicKey, "importRSAPublicKey");
function decodeBase64urlJson(str) {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(b64));
}
__name(decodeBase64urlJson, "decodeBase64urlJson");
async function authenticate(request, env) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  let header, payload;
  try {
    header = decodeBase64urlJson(parts[0]);
    payload = decodeBase64urlJson(parts[1]);
  } catch {
    return null;
  }
  const now = Math.floor(Date.now() / 1e3);
  if (!payload.exp || payload.exp < now) return null;
  if (payload.iat && payload.iat > now + 300) return null;
  if (now - payload.iat > 3600) return null;
  const projectId = env.FIREBASE_PROJECT_ID;
  if (projectId) {
    if (payload.aud !== projectId) {
      console.warn("Token audience mismatch", payload.aud, "!=", projectId);
      return null;
    }
    if (payload.iss !== "https://securetoken.google.com/" + projectId) {
      console.warn("Token issuer mismatch", payload.iss);
      return null;
    }
  }
  try {
    const keys = await getGooglePublicKeys();
    const jwk = keys.find((k) => k.kid === header.kid);
    if (!jwk) {
      console.warn("No matching JWK for kid:", header.kid);
      return null;
    }
    const publicKey = await importRSAPublicKey(jwk);
    const signingInput = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const signature = base64urlToArrayBuffer(parts[2]);
    const valid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      publicKey,
      signature,
      signingInput
    );
    if (!valid) {
      console.warn("Firebase token signature invalid");
      return null;
    }
  } catch (e) {
    console.error("Firebase token verification error:", e.message);
    return null;
  }
  return { id: payload.sub, email: payload.email };
}
__name(authenticate, "authenticate");

// api/user/revision/stats.js
async function onRequestGet(context) {
  const { request, env } = context;
  try {
    const user = await authenticate(request, env);
    if (!user) {
      return Response.json({ error: "Login required" }, { status: 401 });
    }
    const stats = await env.cgpsc_quiz_db.prepare(`
    SELECT
      COUNT(*)                                          AS total_tracked,
      SUM(CASE WHEN next_revision <= datetime('now')
               THEN 1 ELSE 0 END)                      AS due_today,
        SUM(CASE WHEN interval_days >= 30
                 THEN 1 ELSE 0 END)                      AS mastered,
        SUM(CASE WHEN interval_days >= 7 AND interval_days < 30
                 THEN 1 ELSE 0 END)                      AS reviewing,
        SUM(CASE WHEN interval_days < 7
                 THEN 1 ELSE 0 END)                      AS learning,
        SUM(wrong_count)                                  AS total_wrongs,
      AVG(ease_factor)                                  AS avg_ease,
      MAX(wrong_count)                                  AS hardest_wrong_count
    FROM wrong_questions
    WHERE user_id = ?
  `).bind(user.id).first();
    const { results: hardest } = await env.cgpsc_quiz_db.prepare(`
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
    const { results: bySubject } = await env.cgpsc_quiz_db.prepare(`
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
    const { results: activity } = await env.cgpsc_quiz_db.prepare(`
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
      totalTracked: stats?.total_tracked || 0,
      dueToday: stats?.due_today || 0,
      mastered: stats?.mastered || 0,
      reviewing: stats?.reviewing || 0,
      learning: stats?.learning || 0,
      totalWrongs: stats?.total_wrongs || 0,
      avgEase: stats?.avg_ease ? Math.round(stats.avg_ease * 10) / 10 : 0,
      hardest: hardest.map((h) => ({
        questionId: h.question_id,
        wrongCount: h.wrong_count,
        interval: h.interval_days,
        text: h.question,
        textHi: h.question_hi,
        topic: h.topic_name,
        subject: h.subject_name
      })),
      bySubject: bySubject.map((s) => ({
        subject: s.subject_name,
        subjectHi: s.subject_name_hi,
        total: s.question_count,
        due: s.due_count,
        avgEase: Math.round((s.avg_ease || 0) * 10) / 10
      })),
      activity: activity.map((a) => ({
        day: a.day,
        revised: a.revised_count
      }))
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
__name(onRequestGet, "onRequestGet");

// api/user/revision/submit.js
async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const user = await authenticate(request, env);
    if (!user) {
      return Response.json({ error: "Login required" }, { status: 401 });
    }
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const { answers } = body;
    if (!answers || Object.keys(answers).length === 0) {
      return Response.json({ error: "No answers provided" }, { status: 400 });
    }
    const questionIds = Object.keys(answers).map(Number);
    const placeholders = questionIds.map(() => "?").join(",");
    const { results: correctAnswers } = await env.cgpsc_quiz_db.prepare(`
    SELECT id, correct_option, explanation, explanation_hi
    FROM questions
    WHERE id IN (${placeholders})
  `).bind(...questionIds).all();
    const answerMap = {};
    for (const a of correctAnswers) {
      answerMap[a.id] = a;
    }
    const { results: wrStates } = await env.cgpsc_quiz_db.prepare(`
    SELECT question_id, wrong_count, ease_factor, interval_days
    FROM wrong_questions
    WHERE user_id = ? AND question_id IN (${placeholders})
  `).bind(user.id, ...questionIds).all();
    const stateMap = {};
    for (const s of wrStates) {
      stateMap[s.question_id] = s;
    }
    const results = [];
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;
    const updateStmts = [];
    for (const [qIdStr, userAnswer] of Object.entries(answers)) {
      const qId = Number(qIdStr);
      const correct = answerMap[qId];
      const state = stateMap[qId] || { wrong_count: 0, ease_factor: 2.5, interval_days: 1 };
      if (!correct) continue;
      const isSkipped = userAnswer === null || userAnswer === void 0;
      const isCorrect = !isSkipped && userAnswer === correct.correct_option;
      if (isCorrect) correctCount++;
      else if (isSkipped) skippedCount++;
      else wrongCount++;
      let newEase = state.ease_factor;
      let newInterval = state.interval_days;
      if (isCorrect) {
        newEase = Math.min(state.ease_factor + 0.1, 3);
        newInterval = Math.min(
          Math.round(state.interval_days * newEase),
          90
          // cap at 90 days
        );
      } else if (isSkipped) {
      } else {
        newEase = Math.max(state.ease_factor - 0.2, 1.3);
        newInterval = 1;
      }
      updateStmts.push(
        env.cgpsc_quiz_db.prepare(`
        UPDATE wrong_questions SET
          wrong_count   = CASE WHEN ? = 0 THEN wrong_count + 1 ELSE wrong_count END,
          ease_factor   = ?,
          interval_days = ?,
          next_revision = datetime('now', '+' || ? || ' days'),
          last_wrong_at = CASE WHEN ? = 0 THEN CURRENT_TIMESTAMP ELSE last_wrong_at END
        WHERE user_id = ? AND question_id = ?
      `).bind(
          isCorrect ? 1 : 0,
          // increment wrong_count only if wrong
          newEase,
          newInterval,
          newInterval,
          isCorrect ? 1 : 0,
          user.id,
          qId
        )
      );
      results.push({
        questionId: qId,
        userAnswer: isSkipped ? null : userAnswer,
        correctOption: correct.correct_option,
        isCorrect,
        isSkipped,
        explanation: correct.explanation,
        // revealed after attempt
        explanationHi: correct.explanation_hi,
        newInterval,
        // "Next revision in 5 days"
        newEase: Math.round(newEase * 10) / 10
      });
    }
    if (updateStmts.length > 0) {
      await env.cgpsc_quiz_db.batch(updateStmts);
    }
    if (Object.values(answers).some((v) => v !== null)) {
      await updateStreak(env, user.id);
    }
    const remaining = await env.cgpsc_quiz_db.prepare(`
    SELECT COUNT(*) as cnt
    FROM wrong_questions
    WHERE user_id = ? AND next_revision <= datetime('now')
  `).bind(user.id).first();
    return Response.json({
      correct: correctCount,
      wrong: wrongCount,
      skipped: skippedCount,
      total: results.length,
      remaining: remaining?.cnt || 0,
      results
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
__name(onRequestPost, "onRequestPost");
async function updateStreak(env, userId) {
  const profile = await env.cgpsc_quiz_db.prepare(
    `SELECT current_streak, best_streak, last_seen_at FROM profiles WHERE id = ?`
  ).bind(userId).first();
  if (!profile) return;
  const lastSeen = profile.last_seen_at ? new Date(profile.last_seen_at) : null;
  const now = /* @__PURE__ */ new Date();
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now - 864e5).toISOString().slice(0, 10);
  const lastSeenDay = lastSeen ? lastSeen.toISOString().slice(0, 10) : null;
  let newStreak = profile.current_streak || 0;
  if (lastSeenDay === today) {
    return;
  } else if (lastSeenDay === yesterday) {
    newStreak += 1;
  } else {
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
__name(updateStreak, "updateStreak");

// utils/rebuild.js
async function rebuildQuizInternal(env, quizId) {
  const quiz = await env.cgpsc_quiz_db.prepare(`
    SELECT
      q.id, q.version, q.title, q.title_hi,
      q.description, q.description_hi,
      q.difficulty, q.total_questions, q.time_limit_mins,
      q.is_previous_year, q.is_premium, q.is_published,
      t.name   AS topic_name,
      t.name_hi AS topic_name_hi,
      s.name   AS subject_name,
      s.name_hi AS subject_name_hi,
      s.paper  AS paper
    FROM quizzes q
    JOIN topics t   ON q.topic_id = t.id
    JOIN subjects s ON t.subject_id = s.id
    WHERE q.id = ?
  `).bind(quizId).first();
  if (!quiz) {
    return { error: "Quiz not found" };
  }
  const { results: questions } = await env.cgpsc_quiz_db.prepare(`
    SELECT
      id, sort_order,
      question, question_hi,
      option_a, option_b, option_c, option_d,
      option_a_hi, option_b_hi, option_c_hi, option_d_hi,
      correct_option,
      explanation, explanation_hi
    FROM questions
    WHERE quiz_id = ?
    ORDER BY sort_order
  `).bind(quizId).all();
  if (!questions || questions.length === 0) {
    return { error: "No questions found" };
  }
  const publicPayload = {
    quizId: quiz.id,
    version: quiz.version ?? 1,
    title: quiz.title,
    titleHi: quiz.title_hi,
    description: quiz.description,
    descriptionHi: quiz.description_hi,
    subject: quiz.subject_name,
    subjectHi: quiz.subject_name_hi,
    topic: quiz.topic_name,
    topicHi: quiz.topic_name_hi,
    paper: quiz.paper,
    difficulty: quiz.difficulty,
    isPremium: !!quiz.is_premium,
    isPrevYear: !!quiz.is_previous_year,
    totalQuestions: quiz.total_questions,
    timeLimitMins: quiz.time_limit_mins,
    questions: questions.map((q) => ({
      id: q.id,
      order: q.sort_order,
      text: q.question,
      textHi: q.question_hi,
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
      }
    }))
  };
  const privatePayload = {
    quizId: quiz.id,
    version: quiz.version ?? 1,
    answers: questions.map((q) => ({
      id: q.id,
      order: q.sort_order,
      correctOption: q.correct_option,
      explanation: q.explanation,
      explanationHi: q.explanation_hi
    }))
  };
  const v = quiz.version ?? 1;
  const ttl = 604800;
  if (env.QUIZ_KV) {
    try {
      await Promise.all([
        env.QUIZ_KV.put(
          `quiz:public:v${v}:${quizId}`,
          JSON.stringify(publicPayload),
          { expirationTtl: ttl }
        ),
        env.QUIZ_KV.put(
          `quiz:private:v${v}:${quizId}`,
          JSON.stringify(privatePayload),
          { expirationTtl: ttl }
        )
      ]);
    } catch (kvErr) {
      console.error("KV Error:", kvErr);
    }
  } else {
    console.warn("QUIZ_KV binding not found, skipped pushing to KV.");
  }
  return {
    success: true,
    quizId,
    version: v,
    questions: questions.length,
    publicPayload,
    keys: [
      `quiz:public:v${v}:${quizId}`,
      `quiz:private:v${v}:${quizId}`
    ]
  };
}
__name(rebuildQuizInternal, "rebuildQuizInternal");

// api/admin/rebuild/[id].js
async function onRequestPost2(context) {
  const { request, env, params } = context;
  const authHeader = request.headers.get("x-admin-key");
  if (authHeader !== env.ADMIN_SECRET) {
    return new Response("Forbidden", { status: 403 });
  }
  const quizId = parseInt(params.id, 10);
  if (isNaN(quizId)) {
    return Response.json({ error: "Invalid Quiz ID" }, { status: 400 });
  }
  const res = await rebuildQuizInternal(env, quizId);
  if (res.error) {
    return Response.json({ error: res.error }, { status: 404 });
  }
  return Response.json({
    success: true,
    quizId: res.quizId,
    version: res.version,
    questions: res.questions,
    keys: res.keys
  });
}
__name(onRequestPost2, "onRequestPost");

// api/quiz/[id]/submit.js
async function onRequestPost3(context) {
  const { request, env, params } = context;
  const quizId = parseInt(params.id, 10);
  if (isNaN(quizId)) {
    return Response.json({ error: "Invalid Quiz ID" }, { status: 400 });
  }
  const user = await authenticate(request, env);
  if (!user) {
    return Response.json({ error: "Login required" }, { status: 401 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { version, answers, timeTaken } = body;
  if (!answers || typeof answers !== "object" || Object.keys(answers).length === 0) {
    return Response.json({ error: "No answers provided" }, { status: 400 });
  }
  try {
    const quiz = await env.cgpsc_quiz_db.prepare(`
      SELECT
        q.id, q.version, q.is_premium, q.is_published,
        q.total_questions, q.topic_id,
        t.subject_id
      FROM quizzes q
      JOIN topics t ON q.topic_id = t.id
      WHERE q.id = ? AND q.is_published = 1
    `).bind(quizId).first();
    if (!quiz) {
      return Response.json({ error: "Quiz not found" }, { status: 404 });
    }
    if (version !== void 0 && parseInt(version, 10) !== quiz.version) {
      return Response.json({
        error: "Quiz was updated. Please reload and try again.",
        code: "VERSION_MISMATCH"
      }, { status: 409 });
    }
    if (quiz.is_premium) {
      const hasAccess = await checkPremiumAccess(env, user.id, quizId);
      if (!hasAccess) {
        return Response.json({
          error: "Premium quiz. Upgrade to attempt.",
          code: "PAYMENT_REQUIRED"
        }, { status: 402 });
      }
    }
    const privateKey = `quiz:private:v${quiz.version || 1}:${quizId}`;
    let privateRaw = env.QUIZ_KV ? await env.QUIZ_KV.get(privateKey) : null;
    let privateData;
    if (!privateRaw) {
      const rebuilt = await rebuildQuizInternal(env, quizId);
      if (rebuilt.error) {
        return Response.json({ error: "Answer key missing. Please try again." }, { status: 500 });
      }
      privateData = rebuilt.privatePayload;
    } else {
      privateData = JSON.parse(privateRaw);
    }
    if (!privateData || !privateData.answers || privateData.answers.length === 0) {
      return Response.json({ error: "Quiz has no questions." }, { status: 404 });
    }
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    const results = privateData.answers.map((a) => {
      const userAnswer = answers[String(a.id)];
      const isSkipped = userAnswer === void 0 || userAnswer === null;
      const isCorrect = !isSkipped && parseInt(userAnswer, 10) === a.correctOption;
      if (isCorrect) correct++;
      else if (isSkipped) skipped++;
      else wrong++;
      return {
        questionId: a.id,
        order: a.order,
        userAnswer: isSkipped ? null : parseInt(userAnswer, 10),
        correctOption: a.correctOption,
        isCorrect,
        isSkipped,
        explanation: a.explanation,
        explanationHi: a.explanationHi
      };
    });
    const total = results.length;
    const accuracy = total > 0 ? Math.round(correct / total * 100) : 0;
    const marks = correct - wrong * 0.33;
    const maxMarks = total;
    const timeTakenSafe = Math.max(0, parseInt(timeTaken, 10) || 0);
    await env.cgpsc_quiz_db.prepare(`
      INSERT INTO quiz_attempts
        (user_id, quiz_id, subject_id, topic_id,
         score, total, accuracy, time_taken,
         marks, max_marks, wrong, skipped, answers_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      quizId,
      quiz.subject_id,
      quiz.topic_id,
      correct,
      total,
      accuracy,
      timeTakenSafe,
      Math.round(marks * 100) / 100,
      maxMarks,
      wrong,
      skipped,
      JSON.stringify(answers)
    ).run();
    const wrongQuestions = results.filter((r) => !r.isCorrect && !r.isSkipped);
    const correctQuestions = results.filter((r) => r.isCorrect);
    const srStmts = [];
    for (const w of wrongQuestions) {
      const rowId = `${user.id}:${w.questionId}`;
      srStmts.push(
        env.cgpsc_quiz_db.prepare(`
          INSERT INTO wrong_questions (id, user_id, question_id, quiz_id, next_revision, interval_days)
          VALUES (?, ?, ?, ?, datetime('now', '+1 day'), 1)
          ON CONFLICT(user_id, question_id) DO UPDATE SET
            wrong_count   = wrong_count + 1,
            last_wrong_at = CURRENT_TIMESTAMP,
            interval_days = 1,
            ease_factor   = MAX(1.3, ease_factor - 0.2),
            next_revision = datetime('now', '+1 day')
        `).bind(rowId, user.id, w.questionId, quizId)
      );
    }
    for (const c of correctQuestions) {
      srStmts.push(
        env.cgpsc_quiz_db.prepare(`
          UPDATE wrong_questions
          SET
            interval_days = MIN(ROUND(interval_days * ease_factor), 90),
            ease_factor   = MIN(ease_factor + 0.1, 3.0),
            next_revision = datetime('now', '+' || CAST(ROUND(interval_days * ease_factor) AS TEXT) || ' days')
          WHERE user_id = ? AND question_id = ?
        `).bind(user.id, c.questionId)
      );
    }
    if (srStmts.length > 0) {
      try {
        await env.cgpsc_quiz_db.batch(srStmts);
      } catch (srErr) {
        console.error("Spaced repetition update failed:", srErr.message);
      }
    }
    try {
      await env.cgpsc_quiz_db.prepare(`
        UPDATE profiles SET
          total_attempts = total_attempts + 1,
          total_score    = total_score + ?,
          last_seen_at   = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(correct, user.id).run();
    } catch (profileErr) {
      console.error("Profile stats update failed:", profileErr.message);
    }
    return Response.json({
      quizId,
      score: correct,
      total,
      wrong,
      skipped,
      accuracy,
      marks: Math.round(marks * 100) / 100,
      maxMarks,
      timeTaken: timeTakenSafe,
      results
    });
  } catch (err) {
    console.error("Quiz submit error:", err.message, err.stack);
    return Response.json({
      error: `Submission failed: ${err.message}`
    }, { status: 500 });
  }
}
__name(onRequestPost3, "onRequestPost");
async function checkPremiumAccess(env, userId, quizId) {
  try {
    const profile = await env.cgpsc_quiz_db.prepare(
      `SELECT id FROM profiles WHERE id = ?`
    ).bind(userId).first();
    if (!profile) return false;
    const purchase = await env.cgpsc_quiz_db.prepare(
      `SELECT id FROM purchases WHERE user_id = ? AND quiz_id = ?`
    ).bind(userId, quizId).first();
    return !!purchase;
  } catch {
    return false;
  }
}
__name(checkPremiumAccess, "checkPremiumAccess");

// api/admin/rebuild-all.js
async function onRequestPost4(context) {
  const { request, env } = context;
  const authHeader = request.headers.get("x-admin-key");
  if (authHeader !== env.ADMIN_SECRET) {
    return new Response("Forbidden", { status: 403 });
  }
  const { results: quizzes } = await env.cgpsc_quiz_db.prepare(
    `SELECT id FROM quizzes WHERE is_published = 1 ORDER BY id`
  ).all();
  const results = [];
  for (const q of quizzes) {
    const res = await rebuildQuizInternal(env, q.id);
    if (res.success) {
      results.push({
        quizId: res.quizId,
        version: res.version,
        questions: res.questions,
        keys: res.keys
      });
    } else {
      results.push({ quizId: q.id, error: res.error });
    }
  }
  return Response.json({
    rebuilt: results.filter((r) => !r.error).length,
    results
  });
}
__name(onRequestPost4, "onRequestPost");

// api/user/revision/index.js
async function onRequestGet2(context) {
  const { request, env } = context;
  try {
    const user = await authenticate(request, env);
    if (!user) {
      return Response.json({ error: "Login required" }, { status: 401 });
    }
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit")) || 20, 50);
    const { results: dueQuestions } = await env.cgpsc_quiz_db.prepare(`
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
    const countResult = await env.cgpsc_quiz_db.prepare(`
    SELECT COUNT(*) as due_count
    FROM wrong_questions
    WHERE user_id = ? AND next_revision <= datetime('now')
  `).bind(user.id).first();
    const profile = await env.cgpsc_quiz_db.prepare(`
    SELECT current_streak, best_streak, last_seen_at
    FROM profiles WHERE id = ?
  `).bind(user.id).first();
    const questions = dueQuestions.map((q) => ({
      questionId: q.question_id,
      quizId: q.quiz_id,
      wrongCount: q.wrong_count,
      intervalDays: q.interval_days,
      text: q.question,
      textHi: q.question_hi,
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
      subject: q.subject_name,
      subjectHi: q.subject_name_hi,
      topic: q.topic_name,
      topicHi: q.topic_name_hi
    }));
    return Response.json({
      dueCount: countResult?.due_count || 0,
      showing: questions.length,
      questions,
      streak: {
        current: profile?.current_streak || 0,
        best: profile?.best_streak || 0
      }
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
__name(onRequestGet2, "onRequestGet");

// api/quiz/[id].js
async function onRequestGet3(context) {
  const { request, env, params } = context;
  const quizId = parseInt(params.id, 10);
  if (isNaN(quizId)) {
    return new Response("Invalid Quiz ID", { status: 400 });
  }
  const quiz = await env.cgpsc_quiz_db.prepare(
    `SELECT id, version, is_premium FROM quizzes WHERE id = ? AND is_published = 1`
  ).bind(quizId).first();
  if (!quiz) return new Response("Not found", { status: 404 });
  const cacheKey = `quiz:public:v${quiz.version || 1}:${quiz.id}`;
  if (env.QUIZ_KV) {
    const cached = await env.QUIZ_KV.get(cacheKey);
    if (cached) {
      return new Response(cached, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=86400",
          "X-Cache": "HIT"
        }
      });
    }
  }
  const res = await rebuildQuizInternal(env, quiz.id);
  if (res.error) {
    return Response.json({ error: res.error }, { status: 404 });
  }
  return new Response(JSON.stringify(res.publicPayload), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400",
      "X-Cache": "MISS"
    }
  });
}
__name(onRequestGet3, "onRequestGet");

// api/[table].js
async function onRequest(context) {
  const { request, env, params } = context;
  const table = params.table;
  const url = new URL(request.url);
  const method = request.method;
  if (!/^[a-zA-Z0-9_]+$/.test(table)) {
    return new Response(JSON.stringify({ error: { message: "Invalid table name" } }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" }
    });
  }
  const isPremiumLocked = /* @__PURE__ */ __name(async (quizId, env2, context2) => {
    if (!context2.data || !context2.data.user) return true;
    const userId = context2.data.user.user_id;
    const stmt = env2.cgpsc_quiz_db.prepare(`SELECT id FROM purchases WHERE user_id = ? AND quiz_id = ?`).bind(userId, quizId);
    const purchase = await stmt.first();
    return !purchase;
  }, "isPremiumLocked");
  try {
    if (method === "GET") {
      if (table === "user_rank") {
        const userId = url.searchParams.get("eq_user_id");
        if (!userId) return new Response(JSON.stringify({ error: { message: "user_id required" } }), { status: 400 });
        const countResult = await env.cgpsc_quiz_db.prepare(`SELECT COUNT(*) as total FROM profiles`).first();
        const totalUsers = countResult ? countResult.total : 0;
        const query2 = `
          SELECT * FROM (
            SELECT *, RANK() OVER (ORDER BY total_score DESC, total_attempts ASC, id ASC) as rank
            FROM profiles
          ) WHERE id = ?
        `;
        const userRank = await env.cgpsc_quiz_db.prepare(query2).bind(userId).first();
        const rank = userRank ? userRank.rank : 0;
        const percentile = totalUsers > 0 && rank > 0 ? Math.round((totalUsers - rank) / totalUsers * 100) : 0;
        return new Response(JSON.stringify({ data: { user: userRank, totalUsers, percentile, rank }, error: null }), {
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store, no-cache, must-revalidate" }
        });
      }
      const ALLOWED_COLUMNS = {
        profiles: ["id", "email", "full_name", "total_score", "total_attempts", "current_streak", "best_streak", "avg_accuracy", "preferred_lang", "dark_mode", "last_seen_at", "created_at", "avatar_url", "provider"],
        subjects: ["id", "name", "name_hi", "paper", "sort_order"],
        topics: ["id", "subject_id", "name", "name_hi", "sort_order"],
        quizzes: ["id", "topic_id", "title", "title_hi", "difficulty", "total_questions", "time_limit_mins", "is_previous_year", "is_premium", "is_published", "version", "created_at"],
        questions: ["id", "quiz_id", "sort_order", "question", "question_hi", "option_a", "option_b", "option_c", "option_d", "option_a_hi", "option_b_hi", "option_c_hi", "option_d_hi", "correct_option", "explanation", "explanation_hi", "topic_id"],
        quiz_attempts: ["id", "user_id", "quiz_id", "subject_id", "topic_id", "score", "total", "accuracy", "time_taken", "marks", "max_marks", "wrong", "skipped", "answers_json", "created_at"],
        saved_questions: ["id", "user_id", "question_id", "quiz_id", "created_at"],
        purchases: ["id", "user_id", "quiz_id", "created_at"],
        wrong_questions: ["id", "user_id", "question_id", "quiz_id", "wrong_count", "ease_factor", "interval_days", "last_wrong_at", "next_revision"],
        users: ["id", "email"],
        user_rank: ["user_id"]
      };
      let query = `SELECT * FROM ${table}`;
      let queryParams = [];
      let whereClauses = [];
      url.searchParams.forEach((value, key) => {
        if (key.startsWith("eq_")) {
          const colName = key.substring(3);
          if (ALLOWED_COLUMNS[table]?.includes(colName)) {
            whereClauses.push(`${colName} = ?`);
            queryParams.push(value);
          }
        } else if (key.startsWith("ilike_")) {
          const colName = key.substring(6);
          if (ALLOWED_COLUMNS[table]?.includes(colName)) {
            whereClauses.push(`${colName} LIKE ?`);
            queryParams.push(`%${value}%`);
          }
        }
      });
      if (whereClauses.length > 0) {
        query += ` WHERE ` + whereClauses.join(" AND ");
      }
      let orderClause = "";
      const orderParam = url.searchParams.get("order");
      if (orderParam) {
        if (orderParam.includes(".")) {
          const parts = orderParam.split(".");
          const col = parts[0];
          const dir = parts[1].toLowerCase() === "desc" ? "DESC" : "ASC";
          if (/^[a-zA-Z0-9_]+$/.test(col)) {
            orderClause = ` ORDER BY ${col} ${dir}`;
          }
        } else if (/^[a-zA-Z0-9_]+$/.test(orderParam)) {
          orderClause = ` ORDER BY ${orderParam}`;
          if (url.searchParams.get("desc") === "true") {
            orderClause += ` DESC`;
          }
        }
      }
      if (orderClause) {
        query += orderClause;
      }
      const limit = url.searchParams.get("limit");
      if (limit && !isNaN(parseInt(limit))) {
        const limitVal = Math.min(parseInt(limit), 200);
        query += ` LIMIT ${limitVal}`;
      }
      const select = url.searchParams.get("select");
      if (table === "quiz_attempts" && select && select.includes("quizzes(title")) {
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
          const mappedWhere = whereClauses.map((w) => `qa.${w}`);
          query += ` WHERE ` + mappedWhere.join(" AND ");
        }
        if (orderClause) query += orderClause.replace("ORDER BY ", "ORDER BY qa.");
        if (limit) query += ` LIMIT ${parseInt(limit)}`;
      }
      const searchQueryParam = url.searchParams.get("search_query");
      if (table === "quizzes" && searchQueryParam) {
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
          query += ` LIMIT ${parseInt(limit)}`;
        }
      }
      const stmt = env.cgpsc_quiz_db.prepare(query).bind(...queryParams);
      const { results } = await stmt.all();
      let finalResults = results;
      if (table === "quiz_attempts" && select && select.includes("quizzes(title")) {
        finalResults = results.map((row) => {
          const { quiz_title, quiz_title_hi, subject_name, subject_name_hi, topic_name, topic_name_hi, ...rest } = row;
          return {
            ...rest,
            quizzes: { title: quiz_title, title_hi: quiz_title_hi },
            subjects: { name: subject_name, name_hi: subject_name_hi },
            topics: { name: topic_name, name_hi: topic_name_hi }
          };
        });
      }
      if (table === "questions") {
        const quizId = url.searchParams.get("eq_quiz_id");
        if (quizId) {
          const quizStmt = env.cgpsc_quiz_db.prepare(`SELECT is_premium FROM quizzes WHERE id = ?`).bind(quizId);
          const quizResult = await quizStmt.first();
          if (quizResult && quizResult.is_premium === 1 && await isPremiumLocked(quizId, env, context)) {
            return new Response(JSON.stringify({
              data: null,
              error: { message: "This quiz is premium. Please purchase to unlock." }
            }), { headers: { "Content-Type": "application/json" } });
          }
        }
      }
      if (url.searchParams.get("single") === "true") {
        return new Response(JSON.stringify({ data: finalResults[0] || null, error: null }), { headers: { "Content-Type": "application/json", "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } });
      }
      return new Response(JSON.stringify({ data: finalResults, error: null }), { headers: { "Content-Type": "application/json", "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } });
    } else if (method === "POST") {
      if (!context.data?.user) {
        return Response.json({ error: "Authentication required" }, { status: 401 });
      }
      let body = await request.json();
      if (table === "quiz_attempts") {
        const uid = context.data.user.sub || context.data.user.user_id;
        if (Array.isArray(body)) {
          body = body.map((row) => ({ ...row, user_id: uid }));
        } else {
          body.user_id = uid;
        }
      }
      let success = false;
      if (Array.isArray(body)) {
        if (body.length === 0) return new Response(JSON.stringify({ data: null, error: null }), { headers: { "Content-Type": "application/json" } });
        const keys = Object.keys(body[0]);
        const placeholders = keys.map(() => "?").join(", ");
        const stmts = body.map((row) => {
          const values = keys.map((k) => row[k] !== void 0 ? row[k] : null);
          return env.cgpsc_quiz_db.prepare(`INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`).bind(...values);
        });
        const results = await env.cgpsc_quiz_db.batch(stmts);
        success = results.every((r) => r.success);
      } else {
        const keys = Object.keys(body);
        const values = Object.values(body);
        const placeholders = keys.map(() => "?").join(", ");
        const query = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`;
        const result = await env.cgpsc_quiz_db.prepare(query).bind(...values).run();
        success = result.success;
      }
      if (success && table === "quiz_attempts" && body.user_id) {
        const userId = body.user_id;
        const score = body.score || 0;
        const profStmt = env.cgpsc_quiz_db.prepare(`SELECT total_score, total_attempts, current_streak, best_streak, last_seen_at FROM profiles WHERE id = ?`).bind(userId);
        const profile = await profStmt.first();
        if (profile) {
          const now = /* @__PURE__ */ new Date();
          let currentStreak = profile.current_streak || 0;
          let bestStreak = profile.best_streak || 0;
          if (profile.last_seen_at) {
            const lastSeenDate = new Date(profile.last_seen_at);
            const diffHours = (now - lastSeenDate) / (1e3 * 60 * 60);
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
      return new Response(JSON.stringify({ data: null, error: success ? null : { message: "Insert failed" } }), { headers: { "Content-Type": "application/json", "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } });
    } else if (method === "PATCH") {
      if (!context.data?.user) {
        return Response.json({ error: "Authentication required" }, { status: 401 });
      }
      const body = await request.json();
      const keys = Object.keys(body);
      const values = Object.values(body);
      let queryParams = [...values];
      let whereClauses = [];
      url.searchParams.forEach((value, key) => {
        if (key.startsWith("eq_")) {
          whereClauses.push(`${key.substring(3)} = ?`);
          queryParams.push(value);
        }
      });
      if (whereClauses.length === 0) {
        return Response.json({ error: "At least one filter required for PATCH" }, { status: 400 });
      }
      const setClause = keys.map((k) => `${k} = ?`).join(", ");
      const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClauses.join(" AND ")}`;
      const { success } = await env.cgpsc_quiz_db.prepare(query).bind(...queryParams).run();
      return new Response(JSON.stringify({ data: null, error: success ? null : { message: "Update failed" } }), { headers: { "Content-Type": "application/json", "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } });
    } else if (method === "DELETE") {
      if (!context.data?.user) {
        return Response.json({ error: "Authentication required" }, { status: 401 });
      }
      let queryParams = [];
      let whereClauses = [];
      url.searchParams.forEach((value, key) => {
        if (key.startsWith("eq_")) {
          whereClauses.push(`${key.substring(3)} = ?`);
          queryParams.push(value);
        }
      });
      if (whereClauses.length === 0) {
        return Response.json({ error: "At least one filter required for DELETE" }, { status: 400 });
      }
      const query = `DELETE FROM ${table} WHERE ${whereClauses.join(" AND ")}`;
      const { success } = await env.cgpsc_quiz_db.prepare(query).bind(...queryParams).run();
      return new Response(JSON.stringify({ data: null, error: success ? null : { message: "Delete failed" } }), { headers: { "Content-Type": "application/json", "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } });
    }
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  } catch (err) {
    return new Response(JSON.stringify({ error: { message: err.message } }), { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } });
  }
}
__name(onRequest, "onRequest");

// api/_middleware.js
async function onRequest2(context) {
  const { request, env, next } = context;
  const user = await authenticate(request, env);
  if (user) {
    context.data = context.data || {};
    context.data.user = user;
    try {
      const stmt = env.cgpsc_quiz_db.prepare(`
        INSERT INTO users (id, email) VALUES (?, ?)
        ON CONFLICT(id) DO UPDATE SET email=excluded.email
      `).bind(user.id, user.email);
      context.waitUntil(stmt.run());
    } catch (dbErr) {
      console.error("D1 User Insert Error:", dbErr);
    }
  }
  return await next();
}
__name(onRequest2, "onRequest");

// ../.wrangler/tmp/pages-eQSEuT/functionsRoutes-0.5752251924226607.mjs
var routes = [
  {
    routePath: "/api/user/revision/stats",
    mountPath: "/api/user/revision",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/user/revision/submit",
    mountPath: "/api/user/revision",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/admin/rebuild/:id",
    mountPath: "/api/admin/rebuild",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/quiz/:id/submit",
    mountPath: "/api/quiz/:id",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/admin/rebuild-all",
    mountPath: "/api/admin",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/api/user/revision",
    mountPath: "/api/user/revision",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/quiz/:id",
    mountPath: "/api/quiz",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/api/:table",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/api",
    mountPath: "/api",
    method: "",
    middlewares: [onRequest2],
    modules: []
  }
];

// ../node_modules/wrangler/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
