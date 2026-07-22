-- Migration: Initial Schema
-- Generated from Supabase export

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  provider TEXT DEFAULT 'google',
  total_attempts INTEGER NOT NULL DEFAULT 0,
  total_score INTEGER NOT NULL DEFAULT 0,
  avg_accuracy INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  preferred_lang TEXT NOT NULL DEFAULT 'en',
  dark_mode INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER,
  sort_order INTEGER DEFAULT 1,
  question TEXT NOT NULL,
  question_hi TEXT,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  option_a_hi TEXT,
  option_b_hi TEXT,
  option_c_hi TEXT,
  option_d_hi TEXT,
  correct_option INTEGER NOT NULL,
  explanation TEXT,
  explanation_hi TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  quiz_id INTEGER,
  subject_id INTEGER,
  topic_id INTEGER,
  score INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  accuracy INTEGER NOT NULL DEFAULT 0,
  time_taken INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  title_hi TEXT,
  description TEXT,
  description_hi TEXT,
  difficulty TEXT NOT NULL,
  total_questions INTEGER NOT NULL DEFAULT 20,
  time_limit_mins INTEGER NOT NULL DEFAULT 20,
  is_previous_year INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_premium INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS saved_questions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  question_id TEXT NOT NULL,
  question_text TEXT,
  question_text_hi TEXT,
  options TEXT,
  options_hi TEXT,
  correct_option INTEGER,
  explanation TEXT,
  explanation_hi TEXT,
  subject_id TEXT,
  subject_name TEXT,
  subject_name_hi TEXT,
  topic_name TEXT,
  topic_name_hi TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  paper TEXT NOT NULL,
  icon TEXT NOT NULL,
  name TEXT NOT NULL,
  name_hi TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  name_hi TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Custom Tables added for D1 Migration
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  quiz_id INTEGER,
  purchased_at TEXT DEFAULT CURRENT_TIMESTAMP
);
