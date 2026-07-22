import { authenticate } from "../../utils/auth.js";

export async function onRequestGet({ request, env }) {
  const user = await authenticate(request, env);
  if (!user) return Response.json({ error: "Login required" }, { status: 401 });
  const { results } = await env.cgpsc_quiz_db.prepare(`
    SELECT b.question_id, b.created_at, q.question, q.question_hi,
           q.option_a, q.option_b, q.option_c, q.option_d,
           q.option_a_hi, q.option_b_hi, q.option_c_hi, q.option_d_hi,
           q.topic_id, t.name AS topic_name, t.name_hi AS topic_name_hi,
           s.id AS subject_id, s.name AS subject_name, s.name_hi AS subject_name_hi
    FROM saved_questions b JOIN questions q ON q.id = b.question_id
    LEFT JOIN topics t ON t.id = q.topic_id LEFT JOIN subjects s ON s.id = t.subject_id
    WHERE b.user_id = ? ORDER BY b.created_at DESC
  `).bind(user.id).all();
  return Response.json({ data: results });
}

export async function onRequestPost({ request, env }) {
  const user = await authenticate(request, env);
  if (!user) return Response.json({ error: "Login required" }, { status: 401 });
  const questionId = Number((await request.json().catch(() => ({}))).questionId);
  if (!Number.isInteger(questionId)) return Response.json({ error: "Invalid questionId" }, { status: 400 });
  const exists = await env.cgpsc_quiz_db.prepare("SELECT id FROM questions WHERE id = ?").bind(questionId).first();
  if (!exists) return Response.json({ error: "Question not found" }, { status: 404 });
  await env.cgpsc_quiz_db.prepare(`INSERT OR IGNORE INTO saved_questions (id, user_id, question_id) VALUES (?, ?, ?)`)
    .bind(`${user.id}:${questionId}`, user.id, questionId).run();
  return Response.json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  const user = await authenticate(request, env);
  if (!user) return Response.json({ error: "Login required" }, { status: 401 });
  const questionId = Number(new URL(request.url).searchParams.get("questionId"));
  if (!Number.isInteger(questionId)) return Response.json({ error: "Invalid questionId" }, { status: 400 });
  await env.cgpsc_quiz_db.prepare("DELETE FROM saved_questions WHERE user_id = ? AND question_id = ?")
    .bind(user.id, questionId).run();
  return Response.json({ ok: true });
}
