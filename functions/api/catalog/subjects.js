export async function onRequestGet({ env }) {
  const { results } = await env.cgpsc_quiz_db.prepare(
    "SELECT id, paper, icon, name, name_hi, sort_order FROM subjects ORDER BY sort_order, id"
  ).all();
  return Response.json({ data: results });
}
