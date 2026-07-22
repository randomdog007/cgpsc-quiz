import { rebuildQuizInternal } from '../../utils/rebuild.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  // ── Auth: protect this endpoint ──
  const authHeader = request.headers.get('x-admin-key');
  if (authHeader !== env.ADMIN_SECRET) {
    return new Response('Forbidden', { status: 403 });
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
    rebuilt: results.filter(r => !r.error).length,
    results
  });
}
