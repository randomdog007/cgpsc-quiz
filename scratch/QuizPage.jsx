import React, { useMemo, useState, useRef, useEffect } from 'react';
import { tapOrigin, setScore, pillChanged, initQuiz } from '../alive.js';
import Header from "../components/layout/Header";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import ErrorBanner from "../components/ui/ErrorBanner";

export default function QuizPage(props) {
  const {
    ms, css, C, t, dataLoading, dataError, onClearError, onBack, onHome,
    headerProps, questions, currentQ, answers, lang, mockMode, showExp,
    selectAnswer, clearAnswer, nextQ, skipQ, setCurrentQ, setShowExp,
    toggleBM, isBM, selectedQuiz, timer, fmt
  } = props;

  const q = questions[currentQ];
  const answered = answers[currentQ] !== undefined;

  const [visited, setVisited] = useState(new Set([currentQ]));
  const [review, setReview] = useState(new Set());

  useEffect(() => {
    setVisited(prev => {
      const next = new Set(prev);
      next.add(currentQ);
      return next;
    });
  }, [currentQ]);

  const toggleReview = (idx) => {
    setReview(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

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
    const arr = lang === 'en' ? q.options : (q.options_hi || q.options);
    return arr.map(formatText);
  }, [q, lang]);

  // Live marks
  const correct = questions.filter((_, i) => answers[i] !== undefined && answers[i] === questions[i]?.correct).length;
  const wrong = questions.filter((_, i) => answers[i] !== undefined && answers[i] !== questions[i]?.correct).length;
  const liveMarks = parseFloat(((correct * 2) - (wrong * 0.66)).toFixed(2));

  // Alive animations state
  const [animDir, setAnimDir] = useState(1);
  const prevQRef = useRef(currentQ);
  useEffect(() => {
    setAnimDir(currentQ > prevQRef.current ? 1 : -1);
    prevQRef.current = currentQ;
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
    if (rootRef.current) initQuiz(rootRef.current);
  }, [currentQ]);

  const pillState = (i) => {
    if (i === currentQ) return "current";
    if (answers[i] !== undefined) {
      return "answered";
    }
    if (review.has(i)) return "review";
    if (visited.has(i)) return "not-answered";
    return "not-visited";
  };

  const answeredCount = Object.keys(answers).length;
  const notAnsweredCount = visited.size - answeredCount; // Approximate, accurately it's visited but not answered
  const notAnsweredExact = Array.from(visited).filter(i => answers[i] === undefined).length;
  
  return (
    <div className="quiz-root" style={{ ...ms, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", backgroundColor: "#f8f9fa" }}>
      <style>{`
        body { padding-bottom: 0 !important; background-color: #f8f9fa; }
        .quiz-root * { box-sizing: border-box; }
        .q-layout { display: flex; flex: 1; min-height: 0; overflow: hidden; padding: 24px; gap: 24px; max-width: 1400px; margin: 0 auto; width: 100%; }
        .q-left { flex: 1; min-width: 0; display: flex; flexDirection: column; overflow-y: auto; padding-bottom: 120px; }
        .q-right { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; padding-bottom: 120px; }
        @media (max-width: 1024px) {
          .q-layout { flex-direction: column; padding: 16px; gap: 16px; }
          .q-right { width: 100%; }
        }
        
        /* Custom UI */
        .q-card-ui { background: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 20px; border: 1px solid #eaeaea; }
        .q-option { display: flex; align-items: center; padding: 16px; border-radius: 8px; border: 1px solid #e0e0e0; cursor: pointer; transition: all 0.2s; margin-bottom: 12px; }
        .q-option:hover { border-color: #b0b0b0; background: #fafafa; }
        .q-option.selected { border-color: #1a7a3b; background: #eaf5ec; }
        .q-option.wrong { border-color: #d32f2f; background: #fdeaea; }
        .q-letter { width: 32px; height: 32px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; background: #f0f0f0; color: #555; margin-right: 16px; }
        .q-option.selected .q-letter { background: #1a7a3b; color: #fff; }
        .q-option.wrong .q-letter { background: #d32f2f; color: #fff; }
        .q-radio { width: 24px; height: 24px; border-radius: 50%; border: 2px solid #ccc; margin-left: auto; display: flex; align-items: center; justify-content: center; }
        .q-option.selected .q-radio { border-color: #1a7a3b; background: #1a7a3b; }
        .q-option.wrong .q-radio { border-color: #d32f2f; background: #d32f2f; }
        
        .nav-bot { position: fixed; bottom: 0; left: 0; right: 0; background: #ffffff; border-top: 1px solid #eaeaea; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 -4px 12px rgba(0,0,0,0.05); z-index: 100; }
        .nav-btn { padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .btn-prev { border: 1px solid #1a7a3b; color: #1a7a3b; background: transparent; }
        .btn-prev:hover { background: #f0f7f2; }
        .btn-prev:disabled { border-color: #ccc; color: #aaa; cursor: not-allowed; }
        .btn-next { background: #1a7a3b; color: #ffffff; border: none; }
        .btn-next:hover { background: #145e2d; }
        
        .pill-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
        .palette-pill { aspect-ratio: 1; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 15px; cursor: pointer; border: 1px solid transparent; transition: all 0.1s; position: relative; }
        
        /* Pill States */
        .palette-pill[data-state="not-visited"] { background: #f0f0f0; color: #777; }
        .palette-pill[data-state="not-answered"] { background: #ffffff; border-color: #ccc; color: #333; }
        .palette-pill[data-state="answered"] { background: #eaf5ec; color: #1a7a3b; border-color: #1a7a3b; }
        .palette-pill[data-state="review"] { background: #fef0e5; color: #e67e22; border-color: #e67e22; }
        .palette-pill[data-state="current"] { border: 2px solid #1a7a3b; transform: scale(1.1); font-weight: 800; }
        
        .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #555; }
        .legend-dot { width: 12px; height: 12px; border-radius: 50%; }
        
        .bot-pills { display: flex; gap: 8px; }
        .bot-pill { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; cursor: pointer; }
      `}</style>

      {/* Header */}
      <header style={{ background: "#ffffff", padding: "12px 24px", borderBottom: "1px solid #eaeaea", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={onBack} style={{ background: "transparent", border: "1px solid #e0e0e0", borderRadius: 8, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, background: "#eaf5ec", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#1a7a3b" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#222" }}>{selectedQuiz?.name || "Quiz"}</div>
              <div style={{ fontSize: 12, color: "#777", marginTop: 2 }}>{selectedQuiz?.topic?.name || "Topic"}</div>
            </div>
          </div>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button style={{ border: "1px solid #1a7a3b", background: "#f0f7f2", color: "#1a7a3b", borderRadius: 6, padding: "8px 16px", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }} onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            Save & Exit
          </button>
        </div>
      </header>

      <ErrorBanner msg={dataError} C={C} onClose={onClearError} />

      {dataLoading ? (
        <Spinner text="Loading Assessment..." C={C} fallbackText={t.loading} />
      ) : questions.length === 0 ? (
        <EmptyState icon="📄" title={t.noQuestions} desc={`${t.noQuestionsDesc} ${selectedQuiz?.id}`} C={C} />
      ) : (
        <div className="q-layout" ref={rootRef}>
          {/* LEFT COLUMN */}
          <div className="q-left">
            
            {/* Progress Card */}
            <div className="q-card-ui" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 24, flex: 1 }}>
                {/* Circular progress */}
                <div style={{ position: "relative", width: 72, height: 72 }}>
                  <svg width="72" height="72" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="3" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1a7a3b" strokeWidth="3" strokeDasharray={`${(answeredCount / questions.length) * 100}, 100`} />
                  </svg>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#111" }}>
                    {Math.round((answeredCount / questions.length) * 100)}%
                  </div>
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#222" }}>Question {currentQ + 1} of {questions.length}</div>
                  <div style={{ fontSize: 13, color: "#777", marginTop: 4, marginBottom: 12 }}>{answeredCount}/{questions.length} answered</div>
                  <div style={{ height: 6, background: "#eee", borderRadius: 3, width: "100%", maxWidth: 300 }}>
                    <div style={{ height: "100%", background: "#1a7a3b", borderRadius: 3, width: `${(answeredCount / questions.length) * 100}%`, transition: "width 0.3s" }}></div>
                  </div>
                </div>
              </div>
              
              <div style={{ background: "#eaf5ec", padding: "12px 16px", borderRadius: 8, textAlign: "center" }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: "#1a7a3b" }}>+2 / -0.66</div>
                <div style={{ fontSize: 11, color: "#555", marginTop: 4, fontWeight: 600, textTransform: "uppercase" }}>Marks</div>
              </div>
            </div>

            {/* Question Card */}
            <div className="q-card-ui" style={{ padding: "32px", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <p style={{ fontSize: 17, lineHeight: 1.6, color: "#222", fontWeight: 600, margin: 0, whiteSpace: "pre-wrap", maxWidth: "85%" }}>
                  {qTxt}
                </p>
                <button 
                  onClick={() => toggleReview(currentQ)}
                  style={{ background: review.has(currentQ) ? "#fef0e5" : "transparent", border: `1px solid ${review.has(currentQ) ? "#e67e22" : "#e0e0e0"}`, borderRadius: 6, padding: "8px 12px", cursor: "pointer", fontSize: 13, color: review.has(currentQ) ? "#e67e22" : "#555", fontWeight: 700, display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={review.has(currentQ) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  Review
                </button>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column" }}>
                {opts?.map((opt, idx) => {
                  const isSel = answers[currentQ] === idx;
                  const isOk = q?.correct === idx;
                  
                  let optClass = "q-option";
                  if (isSel) optClass += " selected";
                  
                  // In non-mock mode, show correct/wrong immediately
                  if (answered && !mockMode) {
                    if (isOk) optClass = "q-option selected"; // force green for correct
                    else if (isSel && !isOk) optClass = "q-option wrong";
                  }

                  return (
                    <div role="button" tabIndex={0} key={idx} onClick={() => selectAnswer(idx)} className={optClass}>
                      <div className="q-letter">{["A","B","C","D"][idx]}</div>
                      <div style={{ fontSize: 15, color: "#333", fontWeight: 500 }}>{opt}</div>
                      <div className="q-radio">
                        {(isSel || (answered && !mockMode && isOk)) && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Explanation — practice mode only */}
            {showExp && !mockMode && (
              <div style={{ background: "#eaf5ec", border: `1px solid #c3e6cb`, borderRadius: 12, padding: "20px 24px", marginTop: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ color: "#1a7a3b", fontSize: 18 }}>💡</span>
                  <span style={{ fontSize: 13, color: "#1a7a3b", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>{t.explanation || "Explanation"}</span>
                </div>
                <p style={{ color: "#222", fontSize: 15, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{lang === "hi" && q?.explanation_hi ? q.explanation_hi : q?.explanation}</p>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN */}
          <div className="q-right">
            
            {/* Question Palette */}
            <div className="q-card-ui" style={{ padding: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#222", marginBottom: 16 }}>Question Palette</div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <div className="legend-item">
                  <div className="legend-dot" style={{ background: "#eaf5ec", border: "1px solid #1a7a3b" }}></div>
                  Answered
                </div>
                <div className="legend-item">
                  <div className="legend-dot" style={{ background: "#fef0e5", border: "1px solid #e67e22" }}></div>
                  Review
                </div>
                <div className="legend-item">
                  <div className="legend-dot" style={{ background: "#ffffff", border: "1px solid #ccc" }}></div>
                  Not Answered
                </div>
                <div className="legend-item">
                  <div className="legend-dot" style={{ background: "#f0f0f0" }}></div>
                  Not Visited
                </div>
              </div>
              
              <div className="pill-grid">
                {questions.map((_, i) => (
                  <div key={i} className="palette-pill" data-state={pillState(i)} onClick={() => setCurrentQ(i)}>
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz Overview */}
            <div className="q-card-ui" style={{ padding: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#222", marginBottom: 16 }}>Quiz Overview</div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: "#555" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Total Questions</div>
                  <div style={{ fontWeight: 700, color: "#111" }}>{questions.length}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Answered</div>
                  <div style={{ fontWeight: 700, color: "#111" }}>{answeredCount}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg> Not Answered</div>
                  <div style={{ fontWeight: 700, color: "#111" }}>{notAnsweredExact}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg> Marked for Review</div>
                  <div style={{ fontWeight: 700, color: "#111" }}>{review.size}</div>
                </div>
              </div>
            </div>

            {/* Time Left */}
            <div className="q-card-ui" style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, color: "#555", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Time Left
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: timer < 120 ? "#d32f2f" : "#111", fontFamily: "monospace" }}>
                  {fmt ? fmt(timer) : "00:00"}
                </div>
              </div>
              <div style={{ position: "relative", width: 40, height: 40 }}>
                <svg width="40" height="40" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="4" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={timer < 120 ? "#d32f2f" : "#1a7a3b"} strokeWidth="4" strokeDasharray={`${(timer / (selectedQuiz?.time_limit_mins * 60 || 1200)) * 100}, 100`} />
                </svg>
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* Bottom Navigator */}
      {!dataLoading && questions.length > 0 && (
        <div className="nav-bot">
          <button className="nav-btn btn-prev" disabled={currentQ === 0} onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            Previous
          </button>
          
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#888", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 8 }}>Navigator</div>
            <div className="bot-pills">
              {/* Show only surrounding pills on mobile, or scrollable */}
              {questions.map((_, i) => {
                // Show a small window around currentQ to not overflow
                if (Math.abs(i - currentQ) > 4) return null;
                const state = pillState(i);
                return (
                  <div key={i} className="palette-pill bot-pill" data-state={state} onClick={() => setCurrentQ(i)}>
                    {i + 1}
                    {state === "answered" && (
                      <div style={{ position: "absolute", bottom: 2, right: 2, color: "#1a7a3b" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: "#999", marginTop: 8 }}>Swipe or click on question number to navigate</div>
          </div>
          
          {currentQ < questions.length - 1 ? (
            <button className="nav-btn btn-next" onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}>
              Next
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          ) : (
            <button className="nav-btn btn-next" onClick={nextQ} style={{ background: "#d32f2f" }}>
              Submit
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
