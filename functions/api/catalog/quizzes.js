export async function onRequestGet({ request, env }) {
  const topicId = Number(new URL(request.url).searchParams.get("topicId"));
  if (!Number.isInteger(topicId)) return Response.json({ error: "Invalid topicId" }, { status: 400 });
  const { results } = await env.cgpsc_quiz_db.prepare(`
    SELECT id, topic_id, title, title_hi, description, description_hi, difficulty,
           total_questions, time_limit_mins, is_previous_year, is_premium, version
    FROM quizzes WHERE topic_id = ? AND is_published = 1 ORDER BY id
  `).bind(topicId).all();
  return Response.json({ data: results });
}
