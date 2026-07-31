export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const subjectId = Number(url.searchParams.get("subjectId"));
  if (!Number.isInteger(subjectId)) return Response.json({ error: "Invalid subjectId" }, { status: 400 });

  try {
    const { results } = await env.cgpsc_quiz_db.prepare(
      "SELECT t.id as topic_id, COUNT(q.id) as count FROM topics t LEFT JOIN quizzes q ON t.id = q.topic_id AND q.is_published = 1 WHERE t.subject_id = ? GROUP BY t.id"
    ).bind(subjectId).all();

    return Response.json({ data: results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
