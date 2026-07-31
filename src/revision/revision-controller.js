import { fetchDueQuestions, submitRevision, fetchRevisionStats } from '../api/revision';

export function createRevisionController(onUpdate, supabase) {
  let state = {
    phase: 'idle',
    dueCount: 0,
    questions: [],
    currentIndex: 0,
    answers: {},
    selectedOption: null,
    results: null,
    stats: null,
    lang: 'en',
    isSubmitting: false,
    error: null,
    beforeMastered: 0,     // mastery count before session started
    sessionResults: null,  // accumulated per-question results for review
  };

  function setState(partial) {
    state = { ...state, ...partial };
    onUpdate(state);
  }

  async function getToken() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token;
    } catch (e) {
      return null;
    }
  }

  // ──────────────────────────────────────
  // ACTIONS
  // ──────────────────────────────────────

  async function loadStats() {
    try {
      const token = await getToken();
      if (!token) return;
      const stats = await fetchRevisionStats(token);
      setState({ stats, dueCount: stats.dueToday || 0 });
    } catch (e) {
      setState({ error: e.message });
    }
  }

  async function startSession(limit = 20) {
    setState({ phase: 'loading', error: null });
    try {
      const token = await getToken();
      const data = await fetchDueQuestions(token, limit);

      if (!data.questions || data.questions.length === 0) {
        setState({ phase: 'idle', error: 'No questions are due for revision today.' });
        return;
      }

      setState({
        phase: 'answering',
        questions: data.questions,
        dueCount: data.dueCount || 0,
        currentIndex: 0,
        answers: {},
        selectedOption: null,
        results: null,
        sessionResults: [],
        beforeMastered: state.stats?.mastered || 0,
      });
    } catch (e) {
      setState({ phase: 'idle', error: e.message });
    }
  }

  function selectOption(optionIndex) {
    if (state.phase !== 'answering') return;
    if (state.selectedOption !== null) return; // already answered
    setState({ selectedOption: optionIndex });
  }

  // Called when user picks confidence and clicks Next / Finish
  function confirmAnswer(confidence = 2) {
    const q = state.questions[state.currentIndex];
    if (!q) return;

    const answerValue = state.selectedOption !== null ? state.selectedOption + 1 : null; // 1-indexed or null for skip

    // Record answer
    state.answers = { ...state.answers, [q.questionId]: { answer: answerValue, confidence } };

    // Background submit
    submitSingle(q.questionId, answerValue, confidence);

    next();
  }

  function skipQuestion() {
    const q = state.questions[state.currentIndex];
    if (q) {
      state.answers = { ...state.answers, [q.questionId]: { answer: null, confidence: 1 } };
      submitSingle(q.questionId, null, 1);
    }
    next();
  }

  async function submitSingle(questionId, answer, confidence) {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await submitRevision(token, { [questionId]: { answer, confidence } });

      if (res) {
        // Accumulate aggregated results
        const cur = state.results || {
          correctCount: 0, wrongCount: 0, skippedCount: 0,
          totalAttempted: 0, xpGained: 0, streakMaintained: false,
          results: [], remaining: 0
        };

        const updated = {
          correctCount: cur.correctCount + (res.correctCount || 0),
          wrongCount: cur.wrongCount + (res.wrongCount || 0),
          skippedCount: cur.skippedCount + (res.skippedCount || 0),
          totalAttempted: cur.totalAttempted + (res.totalAttempted || 0),
          xpGained: cur.xpGained + (res.xpGained || 0),
          streakMaintained: cur.streakMaintained || res.streakMaintained,
          results: [...(cur.results || []), ...(res.results || [])],
          remaining: res.remaining ?? cur.remaining,
        };

        setState({ results: updated });
      }
    } catch (e) {
      console.error('Failed to submit individual answer:', e);
    }
  }

  function next() {
    const nextIndex = state.currentIndex + 1;

    if (nextIndex < state.questions.length) {
      setState({
        currentIndex: nextIndex,
        selectedOption: null,
        phase: 'answering',
      });
    } else {
      // Session done — refresh stats then show results
      setState({ phase: 'results' });
      loadStats();
    }
  }

  function toggleLang() {
    setState({ lang: state.lang === 'en' ? 'hi' : 'en' });
  }

  async function loadMore() {
    await startSession(20);
  }

  function reset() {
    setState({
      phase: 'idle',
      questions: [],
      currentIndex: 0,
      answers: {},
      selectedOption: null,
      results: null,
      sessionResults: [],
    });
  }

  return {
    getState: () => state,
    loadStats,
    startSession,
    selectOption,
    confirmAnswer,
    skipQuestion,
    next,
    toggleLang,
    loadMore,
    reset,
  };
}
