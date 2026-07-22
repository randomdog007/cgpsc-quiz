import { authenticate } from "../../utils/auth.js";
import { rebuildQuizInternal } from "../../utils/rebuild.js";

async function requireAdmin(request, env) {
  const user = await authenticate(request, env);
  const allowedEmails = (env.ADMIN_EMAILS || "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
  return user && allowedEmails.includes((user.email || "").toLowerCase()) ? user : null;
}

export async function onRequestGet({ request, env }) {
  if (!await requireAdmin(request, env)) return Response.json({ error: "Admin access required" }, { status: 403 });
  const [topics, quizzes] = await Promise.all([
    env.cgpsc_quiz_db.prepare("SELECT id, subject_id, name, name_hi FROM topics ORDER BY sort_order, id").all(),
    env.cgpsc_quiz_db.prepare("SELECT id, topic_id, title FROM quizzes ORDER BY id DESC LIMIT 100").all(),
  ]);
  return Response.json({ topics: topics.results, quizzes: quizzes.results });
}

export async function onRequestPost({ request, env }) {
  if (!await requireAdmin(request, env)) return Response.json({ error: "Admin access required" }, { status: 403 });
  const { kind, data, rows } = await request.json().catch(() => ({}));

  if (kind === "quiz") {
    const topicId = Number(data?.topic_id);
    if (!Number.isInteger(topicId) || !data?.title) return Response.json({ error: "Topic and title are required" }, { status: 400 });
    const result = await env.cgpsc_quiz_db.prepare(`
      INSERT INTO quizzes (topic_id, title, title_hi, description, description_hi, difficulty,
        total_questions, time_limit_mins, is_previous_year, is_premium, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 1)
    `).bind(topicId, data.title.trim(), data.title_hi || null, data.description || null, data.description_hi || null,
      data.difficulty || "Medium", Number(data.total_questions) || 10, Number(data.time_limit_mins) || 15,
      Number(Boolean(data.is_premium))).run();
    return Response.json({ id: result.meta.last_row_id });
  }

  if (kind === "questions") {
    const questions = Array.isArray(rows) ? rows : [data];
    if (!questions.length) return Response.json({ error: "No questions provided" }, { status: 400 });
    const statements = [];
    const affectedQuizIds = new Set();
    for (const question of questions) {
      const quizId = question.quiz_id ? Number(question.quiz_id) : null;
      const topicId = question.topic_id ? Number(question.topic_id) : null;
      if (!topicId || !question.question || !question.option_a || !question.option_b || !question.option_c || !question.option_d || ![1, 2, 3, 4].includes(Number(question.correct_option))) {
        return Response.json({ error: "Each question needs a topic, four options, and a valid correct option" }, { status: 400 });
      }
      if (quizId) affectedQuizIds.add(quizId);
      statements.push(env.cgpsc_quiz_db.prepare(`
        INSERT INTO questions (quiz_id, topic_id, sort_order, question, question_hi,
          option_a, option_b, option_c, option_d, option_a_hi, option_b_hi, option_c_hi, option_d_hi,
          correct_option, explanation, explanation_hi)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(quizId, topicId, Number(question.sort_order) || 1, question.question, question.question_hi || null,
        question.option_a, question.option_b, question.option_c, question.option_d,
        question.option_a_hi || null, question.option_b_hi || null, question.option_c_hi || null, question.option_d_hi || null,
        Number(question.correct_option), question.explanation || null, question.explanation_hi || null));
    }
    await env.cgpsc_quiz_db.batch(statements);
    for (const quizId of affectedQuizIds) {
      await env.cgpsc_quiz_db.prepare("UPDATE quizzes SET version = version + 1 WHERE id = ?").bind(quizId).run();
      await rebuildQuizInternal(env, quizId);
    }
    return Response.json({ inserted: questions.length });
  }

  return Response.json({ error: "Unknown content type" }, { status: 400 });
}
