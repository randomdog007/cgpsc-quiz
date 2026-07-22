export async function onRequestGet({ request, env }) {
  const subjectId = Number(new URL(request.url).searchParams.get("subjectId"));
  if (!Number.isInteger(subjectId)) return Response.json({ error: "Invalid subjectId" }, { status: 400 });
  const { results } = await env.cgpsc_quiz_db.prepare(
    "SELECT id, subject_id, name, name_hi, sort_order FROM topics WHERE subject_id = ? ORDER BY sort_order, id"
  ).bind(subjectId).all();
  return Response.json({ data: results });
}
