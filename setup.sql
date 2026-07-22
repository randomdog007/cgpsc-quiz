CREATE TABLE IF NOT EXISTS wrong_questions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  quiz_id TEXT NOT NULL,
  wrong_count INTEGER DEFAULT 1,
  ease_factor REAL DEFAULT 2.5,
  interval_days REAL DEFAULT 1.0,
  last_wrong_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  next_revision DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, question_id)
);
