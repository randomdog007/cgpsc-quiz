import { authenticate } from '../utils/auth.js';

export async function onRequest(context) {
  const { request, env, next } = context;
  
  const user = await authenticate(request, env);
  
  if (user) {
    context.data = context.data || {};
    context.data.user = user; // Attach user info for downstream functions

    // Insert/Update user in D1
    // We wrap it in a try/catch so it doesn't fail the request if it already exists or errors
    try {
      const stmt = env.cgpsc_quiz_db.prepare(`
        INSERT INTO users (id, email) VALUES (?, ?)
        ON CONFLICT(id) DO UPDATE SET email=excluded.email
      `).bind(user.id, user.email);
      context.waitUntil(stmt.run()); // Run in background so we don't block the API response
    } catch (dbErr) {
      console.error("D1 User Insert Error:", dbErr);
    }
  }

  // Continue to the intended API endpoint
  return await next();
}
