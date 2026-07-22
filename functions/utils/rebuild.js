export async function rebuildQuizInternal(env, quizId) {
  // 1. Fetch quiz metadata
  const quiz = await env.DB.prepare(`
    SELECT
      q.id, q.version, q.title, q.title_hi,
      q.description, q.description_hi,
      q.difficulty, q.total_questions, q.time_limit_mins,
      q.is_previous_year, q.is_premium, q.is_published,
      t.name   AS topic_name,
      t.name_hi AS topic_name_hi,
      s.name   AS subject_name,
      s.name_hi AS subject_name_hi,
      s.paper  AS paper
    FROM quizzes q
    JOIN topics t   ON q.topic_id = t.id
    JOIN subjects s ON t.subject_id = s.id
    WHERE q.id = ?
  `).bind(quizId).first();

  if (!quiz) {
    return { error: 'Quiz not found' };
  }

  // 2. Fetch all questions
  const { results: questions } = await env.DB.prepare(`
    SELECT
      id, sort_order,
      question, question_hi,
      option_a, option_b, option_c, option_d,
      option_a_hi, option_b_hi, option_c_hi, option_d_hi,
      correct_option,
      explanation, explanation_hi
    FROM questions
    WHERE quiz_id = ?
    ORDER BY sort_order
  `).bind(quizId).all();

  if (!questions || questions.length === 0) {
    return { error: 'No questions found' };
  }

  // 3. Build PUBLIC payload (no answers, no explanations)
  const publicPayload = {
    quizId:     quiz.id,
    version:    quiz.version || 1,
    title:      quiz.title,
    titleHi:    quiz.title_hi,
    description: quiz.description,
    descriptionHi: quiz.description_hi,
    subject:    quiz.subject_name,
    subjectHi:  quiz.subject_name_hi,
    topic:      quiz.topic_name,
    topicHi:    quiz.topic_name_hi,
    paper:      quiz.paper,
    difficulty: quiz.difficulty,
    isPremium:  !!quiz.is_premium,
    isPrevYear: !!quiz.is_previous_year,
    totalQuestions: quiz.total_questions,
    timeLimitMins:  quiz.time_limit_mins,
    questions: questions.map(q => ({
      id:        q.id,
      order:     q.sort_order,
      text:      q.question,
      textHi:    q.question_hi,
      options: {
        a:   q.option_a,
        b:   q.option_b,
        c:   q.option_c,
        d:   q.option_d
      },
      optionsHi: {
        a:   q.option_a_hi,
        b:   q.option_b_hi,
        c:   q.option_c_hi,
        d:   q.option_d_hi
      }
    }))
  };

  // 4. Build PRIVATE payload (answers + explanations ONLY)
  const privatePayload = {
    quizId:  quiz.id,
    version: quiz.version || 1,
    answers: questions.map(q => ({
      id:            q.id,
      order:         q.sort_order,
      correctOption: q.correct_option,
      explanation:   q.explanation,
      explanationHi: q.explanation_hi
    }))
  };

  // 5. Push to KV with versioned keys
  const v = quiz.version || 1;
  const ttl = 604800; // 7 days

  if (env.QUIZ_KV) {
    await Promise.all([
      env.QUIZ_KV.put(
        `quiz:public:v${v}:${quizId}`,
        JSON.stringify(publicPayload),
        { expirationTtl: ttl }
      ),
      env.QUIZ_KV.put(
        `quiz:private:v${v}:${quizId}`,
        JSON.stringify(privatePayload),
        { expirationTtl: ttl }
      )
    ]);
  } else {
    console.warn("QUIZ_KV binding not found, skipped pushing to KV.");
  }

  return {
    success: true,
    quizId,
    version: v,
    questions: questions.length,
    publicPayload,
    privatePayload,
    keys: [
      `quiz:public:v${v}:${quizId}`,
      `quiz:private:v${v}:${quizId}`
    ]
  };
}
