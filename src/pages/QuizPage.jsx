import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../supabase';
import { setScore } from '../alive.js';
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import ErrorBanner from "../components/ui/ErrorBanner";

const MemoizedSidebarPills = React.memo(({ questions, currentQ, answers, visited, setCurrentQ, closePalette }) => {
  return (
    <div className="pill-grid">
      {questions.map((_, i) => {
        let state = "not-visited";
        if (i === currentQ) state = "current";
        else if (answers[i] !== undefined) state = "answered";
        else if (visited.has(i)) state = "not-answered";

        return (
          <div
            key={i}
            className="palette-pill"
            data-state={state}
            onClick={() => { setCurrentQ(i); if (closePalette) closePalette(); }}
          >
            {i + 1}
          </div>
        );
      })}
    </div>
  );
});

const MemoizedBotPills = React.memo(({ questions, currentQ, answers, visited, setCurrentQ }) => {
  return (
    <div className="bot-pills" style={{ width: "100%" }}>
      {questions.map((_, i) => {
        let state = "not-visited";
        if (i === currentQ) state = "current";
        else if (answers[i] !== undefined) state = "answered";
        else if (visited.has(i)) state = "not-answered";

        return (
          <div key={i} id={`bot-pill-${i}`} className="palette-pill bot-pill" data-state={state} onClick={() => setCurrentQ(i)}>
            {i + 1}
          </div>
        );
      })}
    </div>
  );
});

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile, lang, setLang, dark, setDark, t, quizzes, topics, fetchHistory } = useAppContext();
  
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [questions, setQuestions] = useState([]);
  
  const selectedQuiz = quizzes.find(q => String(q.id) === String(id));
  const selectedTopic = topics.find(t => String(t.id) === String(selectedQuiz?.topic_id));
  
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showExp, setShowExp] = useState(false);
  const [timer, setTimer] = useState(1200);
  const [mockMode, setMockMode] = useState(true);
  
  const onClearError = () => setDataError(null);
  const onBack = () => navigate(-1);
  const toggleBM = () => {};
  const isBM = () => false;
  
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  
  const toggleLang = () => setLang(l => l === "en" ? "hi" : "en");
  const toggleDark = () => setDark(d => !d);
  const headerProps = { toggleLang, toggleDark, lang, dark };
  
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedQuiz) return;
      setDataLoading(true);
      try {
        const { data, error } = await supabase.from('questions').select('*').eq('quiz_id', selectedQuiz.id).order('sort_order', { ascending: true });
        if (error) throw error;
        setQuestions(data || []);
      } catch (err) {
        setDataError(err.message);
      } finally {
        setDataLoading(false);
      }
    };
    fetchQuestions();
  }, [selectedQuiz]);
  
  const selectAnswer = (idx) => {
    setAnswers(prev => ({ ...prev, [currentQ]: idx }));
    if (!mockMode) setShowExp(true);
  };
  
  const clearAnswer = () => {
    setAnswers(prev => {
      const next = { ...prev };
      delete next[currentQ];
      return next;
    });
  };
  
  const nextQ = () => {
    setShowExp(false);
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      finishQuiz();
    }
  };
  
  const skipQ = () => {
    setShowExp(false);
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      finishQuiz();
    }
  };
  
  const finishQuiz = async () => {
    let score = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct_option) score++;
    });
    
    if (!mockMode && user && selectedQuiz) {
      const selectedTopic = topics.find(t => String(t.id) === String(selectedQuiz.topic_id));
      const subjectId = selectedTopic?.subject_id;
      
      const scoreVal = score;
      const totalVal = questions.length;
      const timeSecs = 1200 - timer;
      
      try {
        await supabase.from("quiz_attempts").insert({
          user_id: user.id,
          subject_id: subjectId,
          topic_id: selectedTopic?.id,
          quiz_id: selectedQuiz.id,
          score: scoreVal,
          total: totalVal,
          time_taken: timeSecs,
          accuracy: totalVal > 0 ? Math.round((scoreVal / totalVal) * 100) : 0,
        });
        fetchHistory(user.id);
      } catch (e) {
        console.error("Failed to save attempt", e);
      }
    }

    navigate(`/result/${selectedQuiz?.id}`, { state: { score, answers, timeTaken: 1200 - timer, questions } });
  };
  
  const C = dark
    ? { bg:"#000000", card:"#0a0a0a", border:"#222222", text:"#ededed", muted:"#888888", hdr:"rgba(0,0,0,0.75)", acc:"#3388FF", acc2:"#1c66d8", ok:"#14b8a6", err:"#ef4444", inp:"#111111", shadow:"0 4px 12px rgba(255,255,255,0.03)" }
    : { bg:"#fafafa", card:"#ffffff", border:"#eaeaea", text:"#111111", muted:"#666666", hdr:"rgba(255,255,255,0.85)", acc:"#0055FF", acc2:"#0044CC", ok:"#059669", err:"#e11d48", inp:"#f5f5f5", shadow:"0 2px 8px rgba(0,0,0,0.04)" };

  const ms  = { minHeight:"100vh", background: C.bg, color: C.text, paddingBottom: 80 };

  const quizName = selectedQuiz?.name || selectedQuiz?.title || selectedQuiz?.quiz_title || selectedQuiz?.quizName || "Quiz";
  const topicName = selectedQuiz?.topic?.name || selectedQuiz?.topic_name || selectedTopic?.name || selectedTopic?.title || "Topic";

  const q = questions[currentQ];
  const answered = answers[currentQ] !== undefined;

  const [visited, setVisited] = useState(new Set([currentQ]));
  const [showSidebar, setShowSidebar] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    setVisited(prev => {
      const next = new Set(prev);
      next.add(currentQ);
      return next;
    });
  }, [currentQ]);

  const formatText = (str) => {
    if (!str) return '';
    return str.replace(/\\n/g, '\n').replace(/\/n/g, '\n');
  };

  const qTxt = useMemo(() => {
    if (!q) return "";
    const txt = lang === 'en' ? q.question : (q.question_hi || q.question);
    return formatText(txt);
  }, [q, lang]);

  const opts = useMemo(() => {
    if (!q) return [];
    let arr = lang === 'en' ? q.options : (q.options_hi || q.options);
    if (!Array.isArray(arr) || arr.length === 0) {
      arr = ["A", "B", "C", "D"];
    }
    return arr.map(formatText);
  }, [q, lang]);

  // Live marks
  const correct = questions.filter((_, i) => answers[i] !== undefined && answers[i] === questions[i]?.correct).length;
  const wrong = questions.filter((_, i) => answers[i] !== undefined && answers[i] !== questions[i]?.correct).length;
  const liveMarks = parseFloat(((correct * 2) - (wrong * 0.66)).toFixed(2));


  // Alive animations state
  const prevQRef = useRef(currentQ);
  useEffect(() => {
    prevQRef.current = currentQ;
  }, [currentQ]);

  // Reset explanation visibility whenever the question changes
  useEffect(() => {
    if (setShowExp) setShowExp(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQ]);

  const prevMarksRef = useRef(liveMarks);
  const scoreRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    if (scoreRef.current) {
      setScore(scoreRef.current, liveMarks, prevMarksRef.current);
    }
    prevMarksRef.current = liveMarks;
  }, [liveMarks]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (rootRef.current) {
      rootRef.current.scrollTop = 0;
    }
    // Auto-scroll the desktop bottom navigator pill into view
    const pillEl = document.getElementById(`bot-pill-${currentQ}`);
    if (pillEl) {
      pillEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentQ]);

  // Lock body scroll when palette bottom sheet is open on mobile
  useEffect(() => {
    if (showPalette) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showPalette]);



  const answeredCount = Object.keys(answers).length;
  const notAnsweredExact = Array.from(visited).filter(i => answers[i] === undefined).length;
  const totalRemaining = questions.length - answeredCount;
  const progressPct = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;
  const isUrgent = timer < 120;
  const letters = ["A", "B", "C", "D"];
  
  // Calculate marked questions
  const markedCount = questions.filter(q => isBM && isBM(q.id)).length;

  const openPalette = () => setShowPalette(true);
  const closePalette = () => { setShowPalette(false); setShowSidebar(false); };

  // Keyboard navigation for modal
  useEffect(() => {
    if (!showSubmitModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowSubmitModal(false);
      if (e.key === 'Enter') finishQuiz();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSubmitModal, finishQuiz]);

  const SubmitModal = () => {
    if (!showSubmitModal) return null;
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
      }}>
        <div style={{
          background: 'var(--surface)', width: '100%', maxWidth: 400,
          borderRadius: 24, padding: '32px 24px', boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px' }}>
              Ready to Submit?
            </h2>
            {totalRemaining === 0 ? (
              <div style={{ fontSize: 15, color: '#10b981', fontWeight: 600 }}>
                You have answered all questions.
              </div>
            ) : (
              <div style={{ fontSize: 15, color: 'var(--muted)', fontWeight: 600, lineHeight: 1.5 }}>
                You have answered <span style={{ color: 'var(--ink)', fontWeight: 800 }}>{answeredCount} of {questions.length}</span> questions.
              </div>
            )}
          </div>

          <div style={{ background: 'var(--surface-2)', borderRadius: 16, padding: '16px 20px', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 600 }}>Answered</span>
              <span style={{ fontSize: 15, color: 'var(--teal)', fontWeight: 800 }}>{answeredCount} / {questions.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 600 }}>Remaining</span>
              <span style={{ fontSize: 15, color: totalRemaining > 0 ? '#f59e0b' : 'var(--ink)', fontWeight: 800 }}>{totalRemaining}</span>
            </div>
            {markedCount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 600 }}>Marked</span>
                <span style={{ fontSize: 15, color: 'var(--blue)', fontWeight: 800 }}>{markedCount}</span>
              </div>
            )}
            <div style={{ height: 1, background: 'var(--line)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 600 }}>Time Remaining</span>
              <span style={{ fontSize: 15, color: isUrgent ? 'var(--crimson)' : 'var(--ink)', fontWeight: 800, fontFamily: 'monospace' }}>
                {fmt ? fmt(timer) : "00:00"}
              </span>
            </div>
          </div>

          {totalRemaining > 0 && (
            <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, display: 'flex', gap: 10, alignItems: 'center', marginBottom: 24 }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <span>Unanswered questions will be marked as incorrect.</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button onClick={() => setShowSubmitModal(false)} style={{
              width: '100%', padding: '16px', borderRadius: 14, border: '1.5px solid var(--line-3)',
              background: 'transparent', color: 'var(--ink)', fontSize: 16, fontWeight: 700, cursor: 'pointer'
            }}>
              Continue Quiz
            </button>
            <button onClick={finishQuiz} style={{
              width: '100%', padding: '16px', borderRadius: 14, border: 'none',
              background: 'var(--crimson)', color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 6px 16px color-mix(in srgb, var(--crimson) 30%, transparent)'
            }}>
              Submit Assessment
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="quiz-root" style={{ ...ms, display: "flex", flexDirection: "column", backgroundColor: "var(--paper)" }}>
      <SubmitModal />
      <style>{`
        /* =====================================================
           QUIZ PAGE STYLES — DESKTOP PREMIUM REDESIGN
           Desktop (≥1024px): elegant two-column layout
           Mobile (≤767px): complete bottom-sheet redesign
           ===================================================== */
        html, body { overflow-y: auto !important; height: auto !important; background-color: var(--paper) !important; overflow-x: hidden !important; max-width: 100% !important; width: 100% !important; }
        .quiz-root * { box-sizing: border-box; }
        /* Do NOT set overflow on quiz-root — it breaks position:fixed children (bottom nav).
           Scrolling is handled by html/body instead. */
        .quiz-root { min-height: 100vh; width: 100%; max-width: 100%; overflow-x: hidden; background-color: var(--paper); }

        /* ── Desktop two-column layout ── */
        .q-layout { display: flex; flex: 1; padding: 24px 32px 180px; gap: 32px; max-width: 1600px; margin: 0 auto; width: 100%; align-items: flex-start; scroll-padding-bottom: 200px; box-sizing: border-box; overflow-x: hidden; }
        .q-left { flex: 1; min-width: 0; max-width: 1100px; display: flex; flex-direction: column; }
        .q-right { width: 360px; flex-shrink: 0; display: flex; flex-direction: column; gap: 16px; position: sticky; top: 90px; padding-bottom: 180px; }
        .q-card-ui { background: var(--surface); border-radius: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06); padding: 20px; border: 1px solid var(--line-2); transition: box-shadow 0.3s ease; }
        .q-card-ui:hover { box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08); }

        /* ── Desktop options — premium treatment ── */
        .q-option {
          display: flex; align-items: center; padding: 14px 16px; border-radius: 14px;
          border: 1.5px solid var(--line-2); cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          margin-bottom: 14px; min-height: 56px; background: var(--surface);
          position: relative;
        }
        .q-option:active { transform: scale(0.985); }
        .q-option:hover {
          border-color: color-mix(in srgb, var(--teal) 40%, transparent);
          background: color-mix(in srgb, var(--teal) 4%, var(--surface));
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          transform: translateY(-1px);
        }
        .q-option.selected {
          border-color: var(--teal);
          background: var(--teal-soft);
          border-left: 4px solid var(--teal);
          box-shadow: 0 2px 16px color-mix(in srgb, var(--teal) 15%, transparent);
        }
        .q-option.wrong {
          border-color: var(--crimson);
          background: var(--crimson-soft);
          border-left: 4px solid var(--crimson);
          animation: q-shake 0.4s ease;
        }
        .q-letter {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 14px;
          background: var(--surface-2); color: var(--muted);
          margin-right: 16px; flex-shrink: 0;
          transition: all 0.2s ease;
        }
        .q-option:hover .q-letter { background: color-mix(in srgb, var(--teal) 12%, transparent); color: var(--teal); }
        .q-option.selected .q-letter { background: var(--teal); color: #fff; box-shadow: 0 2px 8px color-mix(in srgb, var(--teal) 30%, transparent); }
        .q-option.wrong .q-letter { background: var(--crimson); color: #fff; }
        .q-radio {
          width: 22px; height: 22px; border-radius: 50%;
          border: 2px solid var(--line-2); margin-left: auto; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .q-option:hover .q-radio { border-color: color-mix(in srgb, var(--teal) 50%, transparent); }
        .q-option.selected .q-radio { border-color: var(--teal); background: var(--teal); transform: scale(1.1); }
        .q-option.wrong .q-radio { border-color: var(--crimson); background: var(--crimson); }

        /* ── Desktop palette pills — premium ── */
        .palette-pill {
          aspect-ratio: 1; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 13px; cursor: pointer;
          border: 1.5px solid transparent;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .palette-pill:hover { transform: translateY(-2px); box-shadow: 0 3px 10px rgba(0,0,0,0.08); }
        .palette-pill[data-state="not-visited"] { background: var(--surface-2); color: var(--muted); border-color: var(--line-2); }
        .palette-pill[data-state="answered"] { background: var(--teal-soft); color: var(--teal); border-color: color-mix(in srgb, var(--teal) 40%, transparent); }
        .palette-pill[data-state="current"] {
          background: var(--blue-soft); color: var(--blue); border-color: var(--blue);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--blue) 20%, transparent), 0 4px 12px color-mix(in srgb, var(--blue) 15%, transparent);
          transform: scale(1.08);
          font-weight: 800;
        }
        .pill-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
        .legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--muted); font-weight: 600; }
        .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

        /* ── Desktop bottom nav — premium frosted glass ── */
        .nav-bot {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
          width: min(calc(100% - 48px), 800px);
          background: color-mix(in srgb, var(--surface) 80%, transparent);
          backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
          box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04);
          border: 1px solid var(--line-2);
          border-radius: 20px;
          padding: 12px 16px;
          display: flex; justify-content: space-between; align-items: center; z-index: 100;
        }
        .bot-pills {
          display: flex; gap: 8px; overflow-x: auto; scroll-behavior: smooth;
          padding: 4px; width: 100%;
          scrollbar-width: none;
          mask-image: linear-gradient(to right, transparent, black 4%, black 96%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 4%, black 96%, transparent);
        }
        .bot-pills::-webkit-scrollbar { display: none; }
        .bot-pill {
          flex: 0 0 auto; width: 38px; height: 38px;
        }
        .nav-bot-inner {
          display: flex; align-items: center; justify-content: space-between;
          max-width: 1440px; width: 100%; padding: 12px 32px; gap: 16px;
        }
        .nav-btn {
          padding: 10px 24px; border-radius: 12px; font-weight: 700; font-size: 14px;
          cursor: pointer; display: flex; align-items: center; gap: 8px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: 0.01em;
        }
        .btn-prev {
          border: 1.5px solid color-mix(in srgb, var(--teal) 35%, transparent);
          color: var(--teal); background: var(--teal-soft);
        }
        .btn-prev:hover { background: color-mix(in srgb, var(--teal) 15%, transparent); transform: translateX(-2px); }
        .btn-prev:disabled { border-color: var(--line-2); color: var(--faint); background: var(--surface-2); cursor: not-allowed; transform: none; }
        .btn-next {
          background: linear-gradient(135deg, var(--teal), color-mix(in srgb, var(--teal) 80%, var(--blue)));
          color: #fff; border: none;
          box-shadow: 0 4px 16px color-mix(in srgb, var(--teal) 35%, transparent);
        }
        .btn-next:hover { box-shadow: 0 6px 24px color-mix(in srgb, var(--teal) 45%, transparent); transform: translateX(2px); }
        .btn-submit {
          background: linear-gradient(135deg, var(--crimson), color-mix(in srgb, var(--crimson) 80%, #ff6b6b));
          color: #fff; border: none;
          box-shadow: 0 4px 16px color-mix(in srgb, var(--crimson) 35%, transparent);
        }
        .btn-submit:hover { box-shadow: 0 6px 24px color-mix(in srgb, var(--crimson) 45%, transparent); transform: translateX(2px); }

        /* ── Progress bar in bottom nav ── */
        .nav-progress { flex: 1; max-width: 480px; display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .nav-progress-bar { width: 100%; height: 6px; background: var(--line-2); border-radius: 4px; overflow: hidden; }
        .nav-progress-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, var(--teal), var(--blue)); transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .nav-progress-text { font-size: 11px; font-weight: 700; color: var(--muted); letter-spacing: 0.3px; }

        /* ── Visibility helpers (default = desktop) ── */
        .hide-on-mobile { /* empty by default, hidden on mobile via media query */ }
        .show-on-mobile { display: none !important; }

        /* =====================================================
           MOBILE QUIZ REDESIGN ≤767px
           ===================================================== */
        @media (max-width: 767px) {
          .hide-on-mobile { display: none !important; }
          .show-on-mobile { display: flex !important; }

          /* Reset layout for mobile — single column, safe bottom padding for fixed nav bar */
          .q-layout { flex-direction: column; padding: 0 0 calc(160px + env(safe-area-inset-bottom, 20px)) !important; gap: 0 !important; }
          .q-left { padding: 0 14px; gap: 10px; max-width: none !important; }

          /* ── Mobile question card ── */
          .q-card-ui {
            background: var(--surface) !important;
            border-radius: 18px !important;
            padding: 14px 16px !important;
            border: 1px solid var(--line) !important;
            box-shadow: 0 4px 24px rgba(0,0,0,0.07) !important;
            margin: 0 !important;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }
          .q-card-ui:hover { box-shadow: 0 4px 24px rgba(0,0,0,0.07) !important; }

          /* ── Mobile options: taller, more breathing room ── */
          .q-option {
            min-height: 56px !important;
            padding: 14px 14px !important;
            border-radius: 14px !important;
            margin-bottom: 10px !important;
            border-width: 1.5px !important;
            border-left-width: 1.5px !important;
            background: var(--surface) !important;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }
          .q-option:active { transform: scale(0.97) !important; }
          .q-option:hover { transform: none !important; box-shadow: none !important; }
          .q-letter {
            width: 36px !important; height: 36px !important;
            border-radius: 10px !important;
            font-size: 14px !important;
            margin-right: 14px !important;
          }
          .q-radio { width: 22px !important; height: 22px !important; }

          /* ── Mobile palette bottom sheet ── */
          .q-right {
            position: fixed !important;
            top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
            width: 100% !important; height: 100% !important;
            background: var(--surface) !important;
            z-index: 500 !important;
            transform: translateY(100%) !important;
            transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1) !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch !important;
            overscroll-behavior-y: contain !important;
            padding: 0 !important;
            flex-direction: column !important;
            border-radius: 24px 24px 0 0 !important;
            border-top: 1px solid var(--line) !important;
            box-shadow: 0 -8px 40px rgba(0,0,0,0.18) !important;
          }
          .q-right.open { transform: translateY(0) !important; }

          /* ── Backdrop for palette ── */
          .q-right-overlay {
            position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
            background: rgba(0,0,0,0.55) !important;
            backdrop-filter: blur(4px) !important; -webkit-backdrop-filter: blur(4px) !important;
            z-index: 499 !important;
            opacity: 0 !important; pointer-events: none !important;
            transition: opacity 0.3s !important;
          }
          .q-right-overlay.open { opacity: 1 !important; pointer-events: auto !important; }

          /* ── Mobile bottom nav ── */
          .nav-bot { padding: 10px 14px !important; padding-bottom: max(10px, env(safe-area-inset-bottom)) !important; }

          /* ── Palette pills on mobile: 6 per row ── */
          .pill-grid { grid-template-columns: repeat(6, 1fr) !important; gap: 7px !important; }
          .palette-pill { font-size: 12px !important; border-radius: 10px !important; }
          .palette-pill:hover { transform: none !important; box-shadow: none !important; }
        }

        /* ── Animations ── */
        @keyframes mq-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes mq-slidein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes mq-popin { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
        @keyframes q-shake { 0%, 100% { transform: translateX(0); } 15%, 45%, 75% { transform: translateX(-4px); } 30%, 60% { transform: translateX(4px); } }
        @keyframes q-glow { 0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--crimson) 30%, transparent); } 50% { box-shadow: 0 0 20px 4px color-mix(in srgb, var(--crimson) 20%, transparent); } }
      `}</style>

      {/* ══════════════════════════════════════════════════
          MOBILE HEADER — sticky, glassy
          ══════════════════════════════════════════════════ */}
      <div className="show-on-mobile" style={{
        position: "sticky", top: 0, zIndex: 100,
        height: 56, padding: "0 14px",
        background: "color-mix(in srgb, var(--surface) 94%, transparent)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--line)",
        display: "flex", alignItems: "center", gap: 10,
        flexShrink: 0,
      }}>
        {/* Back */}
        <button onClick={onBack} style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: "var(--surface-2)", border: "1px solid var(--line)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "var(--ink)",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        {/* Quiz title + counter */}
        <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.2 }}>
            {quizName}
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", marginTop: 1 }}>
            Q {currentQ + 1} of {questions.length}
          </div>
        </div>

        {/* Timer */}
        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          padding: "5px 9px", borderRadius: 8, flexShrink: 0,
          background: isUrgent ? "color-mix(in srgb, var(--crimson) 12%, transparent)" : "var(--surface-2)",
          border: `1px solid ${isUrgent ? "color-mix(in srgb, var(--crimson) 35%, transparent)" : "var(--line)"}`,
          color: isUrgent ? "var(--crimson)" : "var(--ink)",
          fontFamily: "monospace", fontSize: 12, fontWeight: 800,
          animation: isUrgent ? "mq-pulse 1s ease-in-out infinite" : "none",
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {fmt ? fmt(timer) : "00:00"}
        </div>

        {/* Lang toggle */}
        {headerProps && (
          <button onClick={headerProps.toggleLang} style={{
            width: 36, height: 36, borderRadius: 9, flexShrink: 0,
            background: "var(--surface-2)", border: "1px solid var(--line)",
            fontSize: 11, fontWeight: 800, color: "var(--ink)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {headerProps.lang === "en" ? "हिं" : "EN"}
          </button>
        )}

        {/* Palette / grid icon */}
        <button onClick={openPalette} style={{
          width: 36, height: 36, borderRadius: 9, flexShrink: 0,
          background: "var(--blue-soft)", border: "1px solid color-mix(in srgb, var(--blue) 28%, transparent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "var(--blue)",
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
          </svg>
        </button>
      </div>

      {/* ── MOBILE PROGRESS BAR ── */}
      <div className="show-on-mobile" style={{
        height: 3, background: "var(--line-2)",
        position: "sticky", top: 56, zIndex: 99, flexShrink: 0,
      }}>
        <div style={{
          height: "100%", borderRadius: "0 2px 2px 0",
          background: `linear-gradient(90deg, var(--teal), var(--blue))`,
          width: `${progressPct}%`,
          transition: "width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }} />
      </div>

      {/* ══════════════════════════════════════════════════
          DESKTOP HEADER — Premium Glassmorphic
          ══════════════════════════════════════════════════ */}
      <header className="hide-on-mobile" style={{
        position: "sticky", top: 0, zIndex: 110,
        background: "color-mix(in srgb, var(--surface) 88%, transparent)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid var(--line)",
        boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
        display: "flex", justifyContent: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", maxWidth: 1440, padding: "12px 32px", gap: 12 }}>

          {/* Left: Back + Quiz info */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
            <button onClick={onBack} style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: "var(--surface-2)", border: "1.5px solid var(--line-2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--ink)", transition: "all 0.2s",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>

            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: "linear-gradient(135deg, var(--teal-soft), color-mix(in srgb, var(--teal) 15%, transparent))",
              border: "1px solid color-mix(in srgb, var(--teal) 20%, transparent)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "var(--teal)",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "-0.2px" }}>{quizName}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{topicName}</span>
                <span style={{ fontSize: 11, color: "var(--line)", fontWeight: 400 }}>•</span>
                <span style={{ fontSize: 11, color: "var(--teal)", fontWeight: 700 }}>{questions.length} Questions</span>
              </div>
            </div>
          </div>

          {/* Center: Timer with ring */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{ position: "relative", width: 42, height: 42 }}>
              <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--line-2)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.5" fill="none"
                  stroke={isUrgent ? "var(--crimson)" : "var(--teal)"}
                  strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${(timer / (selectedQuiz?.time_limit_mins * 60 || 1200)) * 97.4}, 97.4`}
                  style={{ transition: "stroke-dasharray 1s linear" }}
                />
              </svg>
              <div style={{
                position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isUrgent ? "var(--crimson)" : "var(--teal)"} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
            </div>
            <div>
              <div style={{
                fontSize: 20, fontWeight: 900, fontFamily: "monospace", letterSpacing: "-1px",
                color: isUrgent ? "var(--crimson)" : "var(--ink)",
                animation: isUrgent ? "mq-pulse 1s ease-in-out infinite" : "none",
                lineHeight: 1,
              }}>
                {fmt ? fmt(timer) : "00:00"}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Time Left</div>
            </div>
          </div>

          {/* Right: Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {headerProps && (<>
              <button onClick={headerProps.toggleLang} style={{
                width: 38, height: 38, borderRadius: 10,
                background: "var(--surface-2)", border: "1.5px solid var(--line-2)",
                color: "var(--ink)", fontSize: 13, fontWeight: 800, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}>{headerProps.lang === "en" ? "हिं" : "EN"}</button>
              <button onClick={headerProps.toggleDark} style={{
                width: 38, height: 38, borderRadius: 10,
                background: "var(--surface-2)", border: "1.5px solid var(--line-2)",
                fontSize: 16, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}>{headerProps.dark ? "☀️" : "🌙"}</button>
            </>)}
            <button onClick={onBack} style={{
              marginLeft: 6,
              border: "1.5px solid color-mix(in srgb, var(--teal) 30%, transparent)",
              background: "var(--teal-soft)", color: "var(--teal)",
              borderRadius: 12, padding: "10px 20px",
              fontWeight: 700, fontSize: 13, letterSpacing: "0.01em",
              display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
              transition: "all 0.2s",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Save & Exit
            </button>
          </div>
        </div>
      </header>

      <ErrorBanner msg={dataError} C={C} onClose={onClearError} />

      {dataLoading ? (
        <Spinner text="Loading Assessment..." C={C} fallbackText={t.loading} />
      ) : questions.length === 0 ? (
        <EmptyState icon="📄" title={t.noQuestions} desc={`${t.noQuestionsDesc} ${selectedQuiz?.id}`} C={C} />
      ) : (
        <div className="q-layout" ref={rootRef}>

          {/* ══════════════════════════════════════════════
              MAIN / LEFT COLUMN
              ══════════════════════════════════════════════ */}
          <div className="q-left">

            {/* ── Mobile: Live score strip ── */}
            <div className="show-on-mobile" style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 2px 4px", flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--teal)", fontWeight: 700 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                {correct}
              </div>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>correct</span>
              <div style={{ width: 1, height: 12, background: "var(--line)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--crimson)", fontWeight: 700 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                {wrong}
              </div>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>wrong</span>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: liveMarks >= 0 ? "var(--teal)" : "var(--crimson)", fontFamily: "monospace" }}>
                  {liveMarks >= 0 ? "+" : ""}{liveMarks}
                </span>
                <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>marks</span>
              </div>
            </div>

            {/* ══════════════════════════════════════════
                QUESTION CARD
                ══════════════════════════════════════════ */}
            <div className="q-card-ui" style={{ position: "relative" }}>

              {/* Desktop card header — premium with integrated bookmark */}
              <div className="hide-on-mobile" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid var(--line-2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* Q number chip */}
                  <div style={{
                    padding: "8px 16px", borderRadius: 12,
                    background: "var(--blue-soft)",
                    border: "1.5px solid color-mix(in srgb, var(--blue) 22%, transparent)",
                    display: "flex", alignItems: "baseline", gap: 3,
                  }}>
                    <span style={{ fontSize: 18, fontWeight: 900, color: "var(--blue)" }}>{currentQ + 1}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--blue)", opacity: 0.6 }}>/ {questions.length}</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: "var(--ink)", fontSize: 17, letterSpacing: "-0.2px" }}>Question {currentQ + 1}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{quizName}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {/* Marks badge */}
                  <div style={{
                    fontWeight: 800, color: "var(--teal)", fontSize: 12,
                    background: "var(--teal-soft)",
                    border: "1.5px solid color-mix(in srgb, var(--teal) 22%, transparent)",
                    padding: "7px 14px", borderRadius: 10,
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                    +2 / −0.66
                  </div>
                  {/* Bookmark button */}
                  <button onClick={() => toggleBM(q.id)} style={{
                    width: 40, height: 40, borderRadius: 10, cursor: "pointer",
                    background: isBM(q.id) ? "color-mix(in srgb, var(--amber) 14%, transparent)" : "var(--surface-2)",
                    border: `1.5px solid ${isBM(q.id) ? "color-mix(in srgb, var(--amber) 40%, transparent)" : "var(--line-2)"}`,
                    color: isBM(q.id) ? "var(--amber)" : "var(--muted)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={isBM(q.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  </button>
                </div>
              </div>

              {/* ── Mobile card header ── */}
              <div className="show-on-mobile" style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid var(--line-2)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {/* Q number badge */}
                  <div style={{
                    padding: "4px 10px", borderRadius: 8,
                    background: "var(--blue-soft)",
                    border: "1px solid color-mix(in srgb, var(--blue) 20%, transparent)",
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "var(--blue)" }}>Q {currentQ + 1}</span>
                    <span style={{ fontSize: 11, fontWeight: 500, color: "var(--blue)", opacity: 0.7 }}> / {questions.length}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {/* Marks chip */}
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--teal)", background: "var(--teal-soft)", border: "1px solid color-mix(in srgb, var(--teal) 22%, transparent)", padding: "4px 9px", borderRadius: 7 }}>
                    +2/−0.66
                  </div>
                  {/* Bookmark */}
                  <button onClick={() => toggleBM(q.id)} style={{
                    width: 32, height: 32, borderRadius: 8, cursor: "pointer",
                    background: isBM(q.id) ? "color-mix(in srgb, var(--amber) 14%, transparent)" : "var(--surface-2)",
                    border: `1.5px solid ${isBM(q.id) ? "color-mix(in srgb, var(--amber) 45%, transparent)" : "var(--line)"}`,
                    color: isBM(q.id) ? "var(--amber)" : "var(--muted)",
                    display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill={isBM(q.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  </button>
                </div>
              </div>

              {/* Desktop bookmark — now integrated in card header above */}

              {/* ── Question text ── */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 18, lineHeight: 1.8, color: "var(--ink)", fontWeight: 600, margin: 0, whiteSpace: "pre-wrap", letterSpacing: "-0.1px" }}>
                  {qTxt}
                </p>
              </div>

              {/* ── Options ── */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                {opts?.map((opt, idx) => {
                  const isSel = answers[currentQ] === idx;
                  const isOk = q?.correct === idx;
                  let optClass = "q-option";
                  if (isSel) optClass += " selected";
                  if (answered && !mockMode) {
                    if (isOk) optClass = "q-option selected";
                    else if (isSel && !isOk) optClass = "q-option wrong";
                  }
                  return (
                    <div role="button" tabIndex={0} key={idx} onClick={() => selectAnswer(idx)} className={optClass}>
                      <div className="q-letter">{letters[idx]}</div>
                      <div style={{ fontSize: 15.5, color: "var(--ink)", fontWeight: 500, flex: 1, lineHeight: 1.6 }}>{opt}</div>
                      <div className="q-radio">
                        {(isSel || (answered && !mockMode && isOk)) && (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Explanation (practice mode) ── */}
            {showExp && !mockMode && (
              <div style={{
                background: "color-mix(in srgb, var(--teal) 5%, var(--surface))",
                border: "1.5px solid color-mix(in srgb, var(--teal) 18%, transparent)",
                borderRadius: 16, padding: "22px 24px", marginTop: 16,
                animation: "mq-slidein 0.3s ease",
                boxShadow: "0 2px 12px color-mix(in srgb, var(--teal) 6%, transparent)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid color-mix(in srgb, var(--teal) 12%, transparent)" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "var(--teal-soft)", border: "1px solid color-mix(in srgb, var(--teal) 20%, transparent)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 16 }}>💡</span>
                  </div>
                  <span style={{ fontSize: 13, color: "var(--teal)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px" }}>{t.explanation || "Explanation"}</span>
                </div>
                <p style={{ color: "var(--ink)", fontSize: 15.5, lineHeight: 1.75, margin: 0, whiteSpace: "pre-wrap" }}>
                  {lang === "hi" && q?.explanation_hi ? q.explanation_hi : q?.explanation}
                </p>
              </div>
            )}

            {/* Bottom spacer for mobile nav */}
            <div className="show-on-mobile" style={{ height: 16 }} />
          </div>

          {/* ══════════════════════════════════════════════
              PALETTE OVERLAY (backdrop)
              ══════════════════════════════════════════════ */}
          <div
            className={`q-right-overlay ${showSidebar || showPalette ? 'open' : ''}`}
            onClick={closePalette}
          />

          {/* ══════════════════════════════════════════════
              RIGHT / PALETTE COLUMN
              Desktop: sticky sidebar
              Mobile: full-screen bottom sheet slide-up
              ══════════════════════════════════════════════ */}
          <div className={`q-right ${showSidebar || showPalette ? 'open' : ''}`}>

            {/* ── Mobile palette handle + header ── */}
            <div className="show-on-mobile" style={{ display: "flex", flexDirection: "column", padding: "0 16px" }}>
              {/* Drag handle */}
              <div style={{ width: 36, height: 4, background: "var(--line)", borderRadius: 2, margin: "14px auto 18px", flexShrink: 0 }} />

              {/* Stats row */}
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {[
                  { label: "Answered", value: answeredCount, color: "var(--teal)", bg: "var(--teal-soft)", border: "color-mix(in srgb, var(--teal) 22%, transparent)" },
                  { label: "Remaining", value: questions.length - answeredCount, color: "var(--ink)", bg: "var(--surface-2)", border: "var(--line)" },
                  { label: "Marks", value: `${liveMarks >= 0 ? "+" : ""}${liveMarks}`, color: liveMarks >= 0 ? "var(--teal)" : "var(--crimson)", bg: liveMarks >= 0 ? "var(--teal-soft)" : "var(--crimson-soft)", border: liveMarks >= 0 ? "color-mix(in srgb, var(--teal) 22%, transparent)" : "color-mix(in srgb, var(--crimson) 22%, transparent)", mono: true },
                ].map(({ label, value, color, bg, border, mono }) => (
                  <div key={label} style={{ flex: 1, textAlign: "center", padding: "12px 6px", background: bg, borderRadius: 12, border: `1px solid ${border}` }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1, fontFamily: mono ? "monospace" : "inherit", letterSpacing: mono ? "-0.5px" : "0" }}>{value}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)", marginBottom: 12 }}>Question Navigator</div>
            </div>

            {/* ── Palette card ── */}
            <div className="q-card-ui" style={{ margin: "0 0 16px", background: "var(--surface)", borderRadius: 16, border: "1px solid var(--line-2)", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>

              {/* Desktop title */}
              <div className="hide-on-mobile" style={{ fontWeight: 800, fontSize: 16, color: "var(--ink)", marginBottom: 16, letterSpacing: "-0.2px" }}>Question Palette</div>

              {/* Legend */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
                <div className="legend-item"><div className="legend-dot" style={{ background: "var(--teal-soft)", border: "1.5px solid var(--teal)" }}/><span>Answered</span></div>
                <div className="legend-item"><div className="legend-dot" style={{ background: "var(--blue-soft)", border: "1.5px solid var(--blue)" }}/><span>Current</span></div>
                <div className="legend-item"><div className="legend-dot" style={{ background: "var(--surface-2)", border: "1.5px solid var(--line)" }}/><span>Not visited</span></div>
              </div>
              <MemoizedSidebarPills questions={questions} currentQ={currentQ} answers={answers} visited={visited} setCurrentQ={setCurrentQ} closePalette={closePalette} />
            </div>

            {/* ── Desktop: Quiz overview ── */}
            <div className="q-card-ui hide-on-mobile" style={{ marginBottom: 16, background: "var(--surface)", borderRadius: 16, border: "1px solid var(--line-2)", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: "var(--ink)", marginBottom: 10, letterSpacing: "-0.2px" }}>Quiz Overview</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                {[
                  { label: "Total Questions", value: questions.length, color: "var(--ink)" },
                  { label: "Answered", value: answeredCount, color: "var(--teal)" },
                  { label: "Remaining", value: notAnsweredExact, color: "var(--muted)" },
                  { label: "Live Score", value: `${liveMarks >= 0 ? "+" : ""}${liveMarks}`, color: liveMarks >= 0 ? "var(--teal)" : "var(--crimson)", mono: true },
                ].map(({ label, value, color, mono }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: "1px solid color-mix(in srgb, var(--line-2) 60%, transparent)" }}>
                    <span style={{ color: "var(--muted)", fontWeight: 600 }}>{label}</span>
                    <span style={{ fontWeight: 800, color, fontFamily: mono ? "monospace" : "inherit", fontSize: mono ? 15 : 13 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Desktop: Status Section ── */}
            <div className="q-card-ui hide-on-mobile" style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--line-2)", display: "flex", flexDirection: "column", gap: 12, alignItems: "center", padding: "20px 16px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Current Status</div>
                <div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 600 }}>Answered: <span style={{ color: "var(--teal)", fontWeight: 800 }}>{answeredCount}</span> / {questions.length}</div>
              </div>
              {totalRemaining > 0 ? (
                <div style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600, textAlign: 'center' }}>
                  ⚠️ {totalRemaining} unanswered
                </div>
              ) : (
                <div style={{ fontSize: 13, color: '#10b981', fontWeight: 600, textAlign: 'center' }}>
                  All questions answered!
                </div>
              )}
            </div>

            {/* ── Mobile palette action buttons ── */}
            <div className="show-on-mobile" style={{ display: "flex", flexDirection: "column", gap: 8, padding: "4px 16px", paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}>
              <button
                onClick={closePalette}
                style={{ padding: "15px", background: "var(--surface-2)", color: "var(--ink)", border: "1.5px solid var(--line)", borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
              >
                Continue Quiz
              </button>
              <button
                onClick={() => { closePalette(); setShowSubmitModal(true); }}
                style={{ padding: "15px", background: "transparent", color: "var(--teal)", border: "1.5px solid var(--teal)", borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
              >
                Review & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          DESKTOP BOTTOM NAV — premium, fixed island
          ══════════════════════════════════════════════════ */}
      {!dataLoading && questions.length > 0 && (
        <div className="nav-bot hide-on-mobile">
          <button className="nav-btn btn-prev" disabled={currentQ === 0} onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            <span>Previous</span>
          </button>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, minWidth: 0, maxWidth: "60vw", padding: "0 24px" }}>
            <MemoizedBotPills questions={questions} currentQ={currentQ} answers={answers} visited={visited} setCurrentQ={setCurrentQ} />
          </div>

          <button className="nav-btn btn-next" onClick={() => currentQ < questions.length - 1 ? nextQ() : setShowSubmitModal(true)} style={currentQ === questions.length - 1 ? { background: "var(--teal)", boxShadow: "0 4px 14px color-mix(in srgb, var(--teal) 35%, transparent)" } : {}}>
            <span>{currentQ < questions.length - 1 ? "Next" : "Finish Quiz"}</span>
            {currentQ < questions.length - 1 ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            )}
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MOBILE BOTTOM NAV — premium, fixed
          ══════════════════════════════════════════════════ */}
      {!dataLoading && questions.length > 0 && (
        <div className="show-on-mobile" style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
          background: "color-mix(in srgb, var(--surface) 97%, transparent)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid var(--line)",
          paddingBottom: "max(10px, env(safe-area-inset-bottom))",
          display: "flex", flexDirection: "column",
        }}>

          {/* ── Stats strip ── */}
          <div style={{
            display: "flex", alignItems: "center",
            padding: "8px 14px 6px",
            borderBottom: "1px solid var(--line-2)",
            gap: 0,
          }}>
            {/* Correct */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, flex: 1, justifyContent: "center" }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--teal-soft)",
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span style={{ fontSize: 15, fontWeight: 900, color: "var(--teal)", lineHeight: 1 }}>{correct}</span>
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 18, background: "var(--line)" }} />

            {/* Wrong */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, flex: 1, justifyContent: "center" }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--crimson-soft)",
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--crimson)" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>
              <span style={{ fontSize: 15, fontWeight: 900, color: "var(--crimson)", lineHeight: 1 }}>{wrong}</span>
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 18, background: "var(--line)" }} />

            {/* Marks */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, flex: 1, justifyContent: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: liveMarks >= 0 ? "var(--teal)" : "var(--crimson)", fontFamily: "monospace", letterSpacing: "-0.5px" }}>
                {liveMarks >= 0 ? "+" : ""}{liveMarks}
              </span>
              <span style={{ fontSize: 9, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>marks</span>
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 18, background: "var(--line)" }} />

            {/* Q counter → opens palette */}
            <button onClick={openPalette} style={{
              flex: 1.2, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
              background: "transparent", border: "none", cursor: "pointer", padding: "2px 0",
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2.2" strokeLinecap="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 900, color: "var(--blue)" }}>{currentQ + 1}</span>
              <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>/{questions.length}</span>
            </button>
          </div>

          {/* ── Nav buttons ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px" }}>
            {/* Prev */}
            <button
              disabled={currentQ === 0}
              onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
              style={{
                width: 46, height: 44, borderRadius: 12, flexShrink: 0,
                background: currentQ === 0 ? "var(--surface-2)" : "var(--teal-soft)",
                border: `1.5px solid ${currentQ === 0 ? "var(--line)" : "color-mix(in srgb, var(--teal) 35%, transparent)"}`,
                color: currentQ === 0 ? "var(--faint)" : "var(--teal)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: currentQ === 0 ? "not-allowed" : "pointer",
              }}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>

            {/* Progress bar center */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
              <div style={{ width: "100%", height: 5, background: "var(--line-2)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 4,
                  background: "linear-gradient(90deg, var(--teal), var(--blue))",
                  width: `${progressPct}%`,
                  transition: "width 0.4s ease",
                }} />
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)" }}>
                {answeredCount} of {questions.length} answered
              </div>
            </div>

            {/* Next / Finish */}
            {currentQ < questions.length - 1 ? (
              <button
                onClick={nextQ}
                style={{
                  width: 46, height: 44, borderRadius: 12, flexShrink: 0,
                  background: "var(--teal)", border: "none", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px color-mix(in srgb, var(--teal) 38%, transparent)",
                }}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                style={{
                  height: 44, paddingInline: 16, borderRadius: 12, flexShrink: 0,
                  background: "var(--teal)", border: "none", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", fontSize: 13, fontWeight: 800, gap: 6,
                  boxShadow: "0 4px 14px color-mix(in srgb, var(--teal) 38%, transparent)",
                }}
              >
                Finish Quiz
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

