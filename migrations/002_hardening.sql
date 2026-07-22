-- ============================================
-- Migration 002: Security + Speed + Scale
-- Run: npx wrangler d1 execute cgpsc_quiz_db --remote --file=./migrations/002_hardening.sql
-- ============================================

-- 1. Version column for cache invalidation
ALTER TABLE quizzes ADD COLUMN version INTEGER NOT NULL DEFAULT 1;

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_topic ON quizzes(topic_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_published ON quizzes(is_published, is_premium);
CREATE INDEX IF NOT EXISTS idx_quizzes_prevyear ON quizzes(is_previous_year);
CREATE INDEX IF NOT EXISTS idx_questions_quiz ON questions(quiz_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON quiz_attempts(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_topics_subject ON topics(subject_id, sort_order);

-- 3. Store user answers in attempts
ALTER TABLE quiz_attempts ADD COLUMN answers_json TEXT;

-- 4. Payments table
CREATE TABLE IF NOT EXISTS payments (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id             TEXT NOT NULL,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_order_id   TEXT,
  razorpay_signature  TEXT,
  amount_paise        INTEGER NOT NULL,
  currency            TEXT DEFAULT 'INR',
  status              TEXT DEFAULT 'pending',
  plan_type           TEXT DEFAULT 'subscription',
  plan_duration_days  INTEGER,
  quiz_id             INTEGER,
  created_at          TEXT DEFAULT CURRENT_TIMESTAMP,
  verified_at         TEXT
);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay ON payments(razorpay_payment_id);

-- 5. Subscription tier on profiles
ALTER TABLE profiles ADD COLUMN tier TEXT NOT NULL DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN tier_expiry TEXT;

-- 6. Spaced repetition
CREATE TABLE IF NOT EXISTS wrong_questions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       TEXT NOT NULL,
  question_id   INTEGER NOT NULL,
  quiz_id       INTEGER,
  wrong_count   INTEGER DEFAULT 1,
  last_wrong_at TEXT DEFAULT CURRENT_TIMESTAMP,
  next_revision TEXT,
  ease_factor   REAL DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  UNIQUE(user_id, question_id)
);
CREATE INDEX IF NOT EXISTS idx_wrong_user ON wrong_questions(user_id, next_revision);

-- 7. Fix saved_questions (remove answer data)
CREATE TABLE IF NOT EXISTS saved_questions_new (
  id            TEXT PRIMARY KEY,
  user_id       TEXT,
  question_id   INTEGER NOT NULL,
  quiz_id       INTEGER,
  subject_id    INTEGER,
  topic_id      INTEGER,
  created_at    TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO saved_questions_new (id, user_id, question_id, subject_id, created_at)
  SELECT id, user_id, question_id, subject_id, created_at
  FROM saved_questions;

DROP TABLE saved_questions;
ALTER TABLE saved_questions_new RENAME TO saved_questions;
CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_questions(user_id);
