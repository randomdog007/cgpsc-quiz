import { authenticate } from "../../utils/auth.js";

function profileValues(user) {
  return [user.id, user.email || null, user.email?.split("@")[0] || "Aspirant"];
}

export async function onRequestGet({ request, env }) {
  const user = await authenticate(request, env);
  if (!user) return Response.json({ error: "Login required" }, { status: 401 });
  await env.cgpsc_quiz_db.prepare(`
    INSERT INTO profiles (id, email, full_name) VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET email = excluded.email, last_seen_at = CURRENT_TIMESTAMP
  `).bind(...profileValues(user)).run();
  const data = await env.cgpsc_quiz_db.prepare("SELECT * FROM profiles WHERE id = ?").bind(user.id).first();
  return Response.json({ data });
}

export async function onRequestPatch({ request, env }) {
  const user = await authenticate(request, env);
  if (!user) return Response.json({ error: "Login required" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const allowed = ["preferred_lang", "dark_mode"];
  const fields = allowed.filter((key) => Object.hasOwn(body || {}, key));
  if (!fields.length) return Response.json({ error: "No editable profile fields" }, { status: 400 });
  const assignments = fields.map((key) => `${key} = ?`).join(", ");
  await env.cgpsc_quiz_db.prepare(`UPDATE profiles SET ${assignments}, last_seen_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(...fields.map((key) => key === "dark_mode" ? Number(Boolean(body[key])) : body[key]), user.id).run();
  const data = await env.cgpsc_quiz_db.prepare("SELECT * FROM profiles WHERE id = ?").bind(user.id).first();
  return Response.json({ data });
}
