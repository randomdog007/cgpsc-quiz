UPDATE quizzes 
SET title = REPLACE(title, 'Modern Indian History: ', '') 
WHERE title LIKE 'Modern Indian History: %';

UPDATE quizzes 
SET title = REPLACE(title, 'Modern Indian History - ', '') 
WHERE title LIKE 'Modern Indian History - %';

UPDATE quizzes 
SET title = REPLACE(title, 'Modern Indian History ', '') 
WHERE title LIKE 'Modern Indian History %';
