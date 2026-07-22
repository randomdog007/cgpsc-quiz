import { rebuildQuizInternal } from '../../../utils/rebuild.js';

export async function onRequestPost(context) {
  const { request, env, params } = context;

  // ── Auth: protect this endpoint ──
  const authHeader = request.headers.get('x-admin-key');
  if (authHeader !== env.ADMIN_SECRET) {
    return new Response('Forbidden', { status: 403 });
  }

  const quizId = parseInt(params.id, 10);
  if (isNaN(quizId)) {
    return Response.json({ error: 'Invalid Quiz ID' }, { status: 400 });
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
