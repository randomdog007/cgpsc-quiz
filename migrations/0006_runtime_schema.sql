-- Fields used by the server-side quiz scoring endpoint.
ALTER TABLE quiz_attempts ADD COLUMN marks REAL;
ALTER TABLE quiz_attempts ADD COLUMN max_marks REAL;
ALTER TABLE quiz_attempts ADD COLUMN wrong INTEGER NOT NULL DEFAULT 0;
ALTER TABLE quiz_attempts ADD COLUMN skipped INTEGER NOT NULL DEFAULT 0;
