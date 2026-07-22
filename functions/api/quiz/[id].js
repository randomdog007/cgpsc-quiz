import { rebuildQuizInternal } from '../../utils/rebuild.js';

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const quizId = parseInt(params.id, 10);

  if (isNaN(quizId)) {
    return new Response('Invalid Quiz ID', { status: 400 });
  }

  // 1. Tiny D1 lookup: just id + version
  const quiz = await env.DB.prepare(
    `SELECT id, version, is_premium FROM quizzes WHERE id = ? AND is_published = 1`
  ).bind(quizId).first();

  if (!quiz) return new Response('Not found', { status: 404 });

  // 2. Try KV (versioned key)
  const cacheKey = `quiz:public:v${quiz.version || 1}:${quiz.id}`;
  
  if (env.QUIZ_KV) {
    const cached = await env.QUIZ_KV.get(cacheKey);
    if (cached) {
      return new Response(cached, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=86400',
          'X-Cache': 'HIT'
        }
      });
    }
  }

  // 3. KV miss (or no KV bound) → rebuild on the fly, store, return
  const res = await rebuildQuizInternal(env, quiz.id);
  
  if (res.error) {
    return Response.json({ error: res.error }, { status: 404 });
  }

  return new Response(JSON.stringify(res.publicPayload), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400',
      'X-Cache': 'MISS'
    }
  });
}
