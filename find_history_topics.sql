SELECT t.id, t.name, t.name_hi, s.name as subject_name 
FROM topics t 
JOIN subjects s ON t.subject_id = s.id 
WHERE s.name LIKE '%History of Chhattisgarh%' OR t.name LIKE '%History%';
