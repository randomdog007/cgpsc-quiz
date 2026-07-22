-- 0005_question_bank.sql
-- Remove subtopics and add topic_id to questions

DROP TABLE IF EXISTS subtopics;

-- D1 / SQLite ALTER TABLE support is limited, so we add the column if it doesn't exist.
-- (SQLite supports ADD COLUMN)
ALTER TABLE questions ADD COLUMN topic_id INTEGER;

-- We don't drop subtopic_id from quizzes because SQLite doesn't support DROP COLUMN natively well in all versions, 
-- but it's safe to just ignore it. 
