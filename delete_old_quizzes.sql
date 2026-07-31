DELETE FROM questions WHERE quiz_id IN (
    SELECT id FROM quizzes WHERE title IN (
        'Pre-Historic & Ancient Chhattisgarh',
        'Pre-Historic Period & Sites',
        'Ramayana & Mahabharata Era of Chhattisgarh',
        'Mauryan & Satavahana Period of Chhattisgarh',
        'Vakataka Period & Inscriptions'
    )
);

DELETE FROM quizzes WHERE title IN (
    'Pre-Historic & Ancient Chhattisgarh',
    'Pre-Historic Period & Sites',
    'Ramayana & Mahabharata Era of Chhattisgarh',
    'Mauryan & Satavahana Period of Chhattisgarh',
    'Vakataka Period & Inscriptions'
);
