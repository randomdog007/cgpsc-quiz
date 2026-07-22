INSERT INTO profiles (id, full_name, email, total_score, total_attempts, avg_accuracy) 
SELECT user_id, 'Aspirant', '', SUM(score), COUNT(*), AVG(accuracy) 
FROM quiz_attempts 
WHERE user_id NOT IN (SELECT id FROM profiles) 
GROUP BY user_id;

UPDATE profiles 
SET 
  total_score = (SELECT IFNULL(SUM(score), 0) FROM quiz_attempts WHERE user_id = profiles.id),
  total_attempts = (SELECT COUNT(*) FROM quiz_attempts WHERE user_id = profiles.id),
  avg_accuracy = (SELECT IFNULL(AVG(accuracy), 0) FROM quiz_attempts WHERE user_id = profiles.id);
