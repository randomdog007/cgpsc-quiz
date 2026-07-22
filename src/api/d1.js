import { getIdToken } from "../firebase";

async function request(path, options = {}) {
  const token = await getIdToken();
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body) headers.set("Content-Type", "application/json");

  const response = await fetch(path, { ...options, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body;
}

const query = (params) => new URLSearchParams(params).toString();

export const d1 = {
  subjects: () => request("/api/catalog/subjects"),
  topics: (subjectId) => request(`/api/catalog/topics?${query({ subjectId })}`),
  quizzes: (topicId) => request(`/api/catalog/quizzes?${query({ topicId })}`),
  quiz: (quizId) => request(`/api/quiz/${quizId}`),
  submitQuiz: (quizId, payload) => request(`/api/quiz/${quizId}/submit`, {
    method: "POST", body: JSON.stringify(payload),
  }),
  profile: () => request("/api/user/profile"),
  updateProfile: (changes) => request("/api/user/profile", {
    method: "PATCH", body: JSON.stringify(changes),
  }),
  history: () => request("/api/user/history"),
  bookmarks: () => request("/api/user/bookmarks"),
  addBookmark: (questionId) => request("/api/user/bookmarks", {
    method: "POST", body: JSON.stringify({ questionId }),
  }),
  removeBookmark: (questionId) => request(`/api/user/bookmarks?${query({ questionId })}`, {
    method: "DELETE",
  }),
  admin: (payload) => request("/api/admin/content", {
    method: "POST", body: JSON.stringify(payload),
  }),
  adminContent: () => request("/api/admin/content"),
};
