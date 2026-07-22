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
    error: null
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
      setState({
        phase: 'answering',
        questions: data.questions || [],
        dueCount: data.dueCount || 0,
        currentIndex: 0,
        answers: {},
        selectedOption: null,
        results: null
      });
    } catch (e) {
      setState({ phase: 'idle', error: e.message });
    }
  }

  function selectOption(optionNumber) {
    if (state.phase !== 'answering') return;
    setState({ selectedOption: optionNumber });
  }

  function confirmAnswer() {
    const q = state.questions[state.currentIndex];
    if (!q) return;

    const newAnswers = {
      ...state.answers,
      [q.questionId]: state.selectedOption + 1 // Add 1 because selectedOption is 0-3, DB expects 1-4
    };

    setState({
      answers: newAnswers,
      phase: 'feedback'
    });
  }

  function skipQuestion() {
    const q = state.questions[state.currentIndex];
    const newAnswers = {
      ...state.answers,
      [q.questionId]: null
    };
    setState({ answers: newAnswers, phase: 'feedback' });
  }

  function next() {
    const nextIndex = state.currentIndex + 1;

    if (nextIndex < state.questions.length) {
      setState({
        currentIndex: nextIndex,
        selectedOption: null,
        phase: 'answering'
      });
    } else {
      submitAll();
    }
  }

  async function submitAll() {
    setState({ isSubmitting: true });
    try {
      const token = await getToken();
      const results = await submitRevision(token, state.answers);
      setState({
        phase: 'results',
        results,
        isSubmitting: false
      });
    } catch (e) {
      setState({ isSubmitting: false, error: e.message });
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
      results: null
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
    submitAll,
    toggleLang,
    loadMore,
    reset
  };
}
