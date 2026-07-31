DELETE FROM questions WHERE quiz_id IN (
    SELECT id FROM quizzes WHERE title IN ('Gupta Period & Coinage')
);

DELETE FROM quizzes WHERE title IN ('Gupta Period & Coinage');
