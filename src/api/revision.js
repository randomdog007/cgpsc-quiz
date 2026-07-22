// src/api/revision.js

const API_BASE = '/api/user/revision';

// ── Fetch due questions ──
export async function fetchDueQuestions(token, limit = 20) {
  const res = await fetch(`${API_BASE}?limit=${limit}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to load revision');
  return res.json();
}

// ── Submit answers ──
export async function submitRevision(token, answers) {
  const res = await fetch(`${API_BASE}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ answers })
  });
  if (!res.ok) throw new Error('Failed to submit');
  return res.json();
}

// ── Fetch stats ──
export async function fetchRevisionStats(token) {
  const res = await fetch(`${API_BASE}/stats`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to load stats');
  return res.json();
}
