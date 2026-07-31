import { rebuildQuizInternal } from '../../utils/rebuild.js';
import { authenticate } from '../../utils/auth.js';

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const isPractice = url.searchParams.get('mode') === 'practice';
  const quizId = parseInt(params.id, 10);

  if (isNaN(quizId)) {
    return new Response('Invalid Quiz ID', { status: 400 });
  }

  if (isPractice) {
    const user = await authenticate(request, env);
    if (!user) {
      return Response.json({ error: 'Auth required for practice mode' }, { status: 401 });
    }
  }

  // 1. Tiny D1 lookup: just id + version
  const quiz = await env.cgpsc_quiz_db.prepare(
    `SELECT id, version, is_premium FROM quizzes WHERE id = ? AND is_published = 1`
  ).bind(quizId).first();

  if (!quiz) return new Response('Not found', { status: 404 });

  // 2. Try KV (versioned key)
  const v = quiz.version || 1;
  const publicCacheKey = `quiz:public:v${v}:${quiz.id}`;
  const privateCacheKey = `quiz:private:v${v}:${quiz.id}`;
  
  let publicPayload = null;
  let privatePayload = null;

  if (env.QUIZ_KV) {
    const cachedPublic = await env.QUIZ_KV.get(publicCacheKey);
    if (cachedPublic) publicPayload = JSON.parse(cachedPublic);
    
    if (isPractice) {
      const cachedPrivate = await env.QUIZ_KV.get(privateCacheKey);
      if (cachedPrivate) privatePayload = JSON.parse(cachedPrivate);
    }
  }

  // 3. KV miss (or no KV bound) → rebuild on the fly, store, return
  if (!publicPayload || (isPractice && !privatePayload)) {
    const res = await rebuildQuizInternal(env, quiz.id);
    if (res.error) {
      return Response.json({ error: res.error }, { status: 404 });
    }
    publicPayload = res.publicPayload;
    privatePayload = res.privatePayload;
  }

  let finalPayload = publicPayload;
  
  if (isPractice && privatePayload) {
    // Combine them
    finalPayload = { ...publicPayload };
    finalPayload.questions = finalPayload.questions.map(q => {
      const ans = privatePayload.answers.find(a => a.id === q.id);
      if (ans) {
        return {
          ...q,
          correct: ans.correctOption - 1, // Convert from 1-indexed to 0-indexed for frontend
          explanation: ans.explanation,
          explanationHi: ans.explanationHi
        };
      }
      return q;
    });
  }

  return new Response(JSON.stringify(finalPayload), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': isPractice ? 'private, no-store' : 'public, max-age=86400',
      'X-Cache': (env.QUIZ_KV && publicPayload) ? 'HIT' : 'MISS'
    }
  });
}
