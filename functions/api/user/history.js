import { authenticate } from "../../utils/auth.js";

export async function onRequestGet({ request, env }) {
  const user = await authenticate(request, env);
  if (!user) return Response.json({ error: "Login required" }, { status: 401 });
  const { results } = await env.cgpsc_quiz_db.prepare(`
    SELECT a.*, q.title, q.title_hi, s.name AS subject_name, s.name_hi AS subject_name_hi,
           t.name AS topic_name, t.name_hi AS topic_name_hi
    FROM quiz_attempts a
    LEFT JOIN quizzes q ON q.id = a.quiz_id
    LEFT JOIN subjects s ON s.id = a.subject_id
    LEFT JOIN topics t ON t.id = a.topic_id
    WHERE a.user_id = ? ORDER BY a.created_at DESC LIMIT 100
  `).bind(user.id).all();
  return Response.json({ data: results });
}
