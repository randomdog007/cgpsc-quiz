import { useState, useRef, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { initResults } from "../alive.js";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import BottomNav from "../components/layout/BottomNav";

export default function ResultPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { user, profile, lang, setLang, dark, setDark, t, quizzes, topics } = useAppContext();
  
  // Extract state passed from QuizPage
  const { score, answers = {}, timeTaken = 0, questions = [] } = location.state || {};
  
  const selectedQuiz = quizzes.find(q => String(q.id) === String(id));
  const mockMode = true; // usually mockMode is true unless it's practice mode
  
  const toggleLang = () => setLang(l => l === "en" ? "hi" : "en");
  const toggleDark = () => setDark(d => !d);
  const headerProps = { toggleLang, toggleDark, lang, dark };
  
  const onRetry = () => navigate(`/quiz/${id}`);
  const onMoreQuizzes = () => navigate(`/topic/${selectedQuiz?.topic_id}`);
  const onBack = () => navigate(`/topic/${selectedQuiz?.topic_id}`);
  const onHome = () => navigate("/");
  const onTabNavigate = () => navigate("/");
  const tab = "home";

  const C = dark
    ? { bg:"#000000", card:"#0a0a0a", border:"#222222", text:"#ededed", muted:"#888888", hdr:"rgba(0,0,0,0.75)", acc:"#3388FF", acc2:"#1c66d8", ok:"#14b8a6", err:"#ef4444", inp:"#111111", shadow:"0 4px 12px rgba(255,255,255,0.03)" }
    : { bg:"#fafafa", card:"#ffffff", border:"#eaeaea", text:"#111111", muted:"#666666", hdr:"rgba(255,255,255,0.85)", acc:"#0055FF", acc2:"#0044CC", ok:"#059669", err:"#e11d48", inp:"#f5f5f5", shadow:"0 2px 8px rgba(0,0,0,0.04)" };

  const ms  = { minHeight:"100vh", background: C.bg, color: C.text, paddingBottom: 80 };
  const css = ``;

  const [reviewFilter, setReviewFilter] = useState("all");
  const rootRef = useRef(null);

  useEffect(() => {
    if (rootRef.current) {
      initResults(rootRef.current);
    }
  }, []);

  // Helper to resolve correct index consistently (0-indexed 0..3)
  const getCorrectIdx = (q) => {
    if (!q) return -1;
    // 1. Explicit 1-based properties from DB or API (highest priority)
    if (typeof q.correct_option === "number" && q.correct_option >= 1 && q.correct_option <= 4) return q.correct_option - 1;
    if (typeof q.correctOption === "number" && q.correctOption >= 1 && q.correctOption <= 4) return q.correctOption - 1;
    
    // 2. Numeric `correct` property
    if (typeof q.correct === "number") {
      if (q.correct >= 0 && q.correct <= 3) return q.correct;
      if (q.correct === 4) return 3;
    }
    
    // 3. String representations
    if (typeof q.correct === "string") {
      const s = q.correct.trim().toLowerCase();
      if (s === "1" || s === "a" || s === "option_a") return 0;
      if (s === "2" || s === "b" || s === "option_b") return 1;
      if (s === "3" || s === "c" || s === "option_c") return 2;
      if (s === "4" || s === "d" || s === "option_d") return 3;
      if (s === "0") return 0;
    }
    return -1;
  };

  // Helper to extract options list
  const getQuestionOpts = (q, lang) => {
    if (lang === "hi" && q.options_hi && Array.isArray(q.options_hi) && q.options_hi.length > 0) return q.options_hi;
    if (q.options && Array.isArray(q.options) && q.options.length > 0) return q.options;
    if (lang === "hi" && (q.option_a_hi || q.option_b_hi)) {
      return [q.option_a_hi, q.option_b_hi, q.option_c_hi, q.option_d_hi].filter(Boolean);
    }
    return [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean);
  };

  // Helper to get user answer safely
  const getUserAns = (idx) => {
    if (answers[idx] !== undefined && answers[idx] !== null) return answers[idx];
    if (answers[String(idx)] !== undefined && answers[String(idx)] !== null) return answers[String(idx)];
    return undefined;
  };

  // --- 1. PERFORMANCE ENGINE ---
  const total = questions.length;
  const maxScore = total * 2;
  const attemptedIndices = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== null).map(Number);
  const attemptedCount = attemptedIndices.length;
  const correctCount = questions.filter((q, i) => {
    const userAns = getUserAns(i);
    return userAns !== undefined && userAns !== null && userAns === getCorrectIdx(q);
  }).length; 
  const wrongCount = attemptedCount - correctCount;
  const skippedCount = total - attemptedCount;

  // Mathematically sound metrics
  const rawScore = parseFloat(((correctCount * 2) - (wrongCount * 0.66)).toFixed(2));
  const scorePercentage = maxScore > 0 ? Math.max(0, Math.round((rawScore / maxScore) * 100)) : 0;
  const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
  const completion = total > 0 ? Math.round((attemptedCount / total) * 100) : 0;
  const avgTime = attemptedCount > 0 ? (timeTaken / attemptedCount) : 0; 
  const negativeImpact = parseFloat((wrongCount * 0.66).toFixed(2));

  // Guess Index
  const isGuessing = avgTime < 4 && accuracy < 40 && attemptedCount > 0;

  // Performance Index (0-100 Gauge Score)
  // Integrates Score %, Attempted Accuracy, and Completion % so partial attempts are not falsely rated as "Master".
  let masteryScore = 0;
  if (attemptedCount > 0 && total > 0) {
    // 55% weight to actual Score %, 30% weight to Accuracy on attempted questions, 15% weight to Completion %
    masteryScore = Math.round((scorePercentage * 0.55) + (accuracy * 0.30) + (completion * 0.15));
    masteryScore = Math.min(100, Math.max(0, masteryScore));
  }

  // Topic Strength & Consistency
  const quizTopic = (lang === "hi" ? selectedQuiz?.topic_name_hi : selectedQuiz?.topic_name) || (lang === "hi" ? selectedQuiz?.title_hi : selectedQuiz?.title) || "Mixed Topics";
  let topicPerformance = "🟡 Moderate";
  let topicColor = "var(--amber)";
  
  if (completion < 30) {
    topicPerformance = "🟡 Incomplete Attempt";
    topicColor = "var(--amber)";
  } else if (scorePercentage >= 70 || (accuracy >= 80 && completion >= 70)) {
    topicPerformance = "🟢 Strong";
    topicColor = "var(--teal)";
  } else if (scorePercentage >= 50 || accuracy >= 60) {
    topicPerformance = "🟡 Moderate";
    topicColor = "var(--amber)";
  } else {
    topicPerformance = "🔴 Weak";
    topicColor = "var(--crimson)";
  }

  // Level classification
  let level = "🟡 Needs Practice";
  let levelColor = "var(--yellow)";
  if (completion < 30) {
    level = "🟠 Incomplete Attempt";
    levelColor = "var(--orange)";
  } else if (masteryScore >= 88) {
    level = "🟣 Master";
    levelColor = "var(--purple)";
  } else if (masteryScore >= 72) {
    level = "🔵 Strong";
    levelColor = "var(--blue)";
  } else if (masteryScore >= 58) {
    level = "🟢 Good";
    levelColor = "var(--teal)";
  } else if (masteryScore >= 40) {
    level = "🟠 Improving";
    levelColor = "var(--orange)";
  } else {
    level = "🔴 High Priority";
    levelColor = "var(--crimson)";
  }

  // --- 2. NEXT ACTION ENGINE ---
  let nextAction = "";
  let aiCoach = "";
  let primaryActionFn = onRetry;

  if (attemptedCount === 0) {
    nextAction = "Start Quiz";
    aiCoach = "You didn't attempt any questions. Let's start practice!";
    primaryActionFn = onRetry;
  } else if (completion < 40) {
    nextAction = "Complete Full Quiz";
    aiCoach = `You completed only ${completion}% of the quiz (${attemptedCount}/${total} attempted). Finish the full test to get an accurate evaluation!`;
    primaryActionFn = onRetry;
  } else if (scorePercentage >= 75 && accuracy >= 75) {
    nextAction = "Challenge Me";
    aiCoach = "Excellent work! You have strong mastery over this topic.";
    primaryActionFn = onMoreQuizzes; 
  } else if (scorePercentage >= 50 || accuracy >= 60) {
    nextAction = "Practice Weak Topics";
    aiCoach = `Good effort! You scored ${rawScore}/${maxScore}. Review your missed questions below to boost your score.`;
    primaryActionFn = onRetry;
  } else {
    nextAction = "Review Mistakes First";
    aiCoach = "Don't worry, mistakes are how you learn. Review them carefully below before trying again.";
    primaryActionFn = () => { setReviewFilter("wrong"); document.getElementById('review-section')?.scrollIntoView({ behavior: 'smooth' }); };
  }

  if (isGuessing) {
    nextAction = "Study Notes";
    aiCoach = "It looks like you might be rushing or guessing. Take your time to study the material first.";
    primaryActionFn = onBack; 
  }

  // --- 3. UI PREP ---
  const reviewQuestions = questions.map((q, i) => {
    const userAns = getUserAns(i);
    const correctIdx = getCorrectIdx(q);
    const status  = (userAns === undefined || userAns === null) ? "skipped"
                  : userAns === correctIdx  ? "correct"
                  : "wrong";
    return { q, i, userAns, correctIdx, status };
  }).filter(({ status }) => reviewFilter === "all" || status === reviewFilter);

  const filterBtns = [
    { key: "all",     label: t.all || "All",     count: total,   clr: "var(--ink)"  },
    { key: "correct", label: t.correct || "Correct", count: correctCount, clr: "var(--teal)"    },
    { key: "wrong",   label: t.wrong || "Wrong",   count: wrongCount,   clr: "var(--crimson)"   },
    { key: "skipped", label: t.skipped || "Skipped", count: skippedCount, clr: "var(--muted)" },
  ];

  const letters = ["A", "B", "C", "D"];

  return (
    <div style={ms} className="app-layout">
      <style>{css}</style>
      <Sidebar activeTab="home" onNavigate={onTabNavigate} t={t} lang={lang} />
      
      <div className="main-area">
        <div className="mobile-only">
          <Header back onBack={onBack} onHome={onHome} C={C} t={t} lang={lang} titleOverride={t.results || "Results"} {...headerProps} />
        </div>

        <div className="quiz-root" ref={rootRef} style={{ paddingBottom: 100, animation: "fadeUp 0.4s var(--ease)", width: "100%" }}>
          <div className="container container--narrow container--responsive" style={{ paddingTop: 32 }}>
            
            {/* DESKTOP TOP HEADER */}
            <div className="desktop-flex" style={{ alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={onBack} className="glass touch-target active-state" style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid var(--line-2)", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink)", padding: 0 }}>
                  <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>
                  {t.results || "Results"}
                </div>
              </div>
            </div>

            {/* ── NEW LEARNING DASHBOARD ── */}
            
            {/* Header: Celebration */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 16px", borderRadius: 999, background: "var(--teal-soft)", color: "var(--teal)", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
                ✓ Quiz Completed 🎉
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: "var(--ink)", margin: "0 0 8px 0", letterSpacing: "-0.5px" }}>
                {lang === "hi" && selectedQuiz?.title_hi ? selectedQuiz.title_hi : selectedQuiz?.title}
              </h2>
              {mockMode && <div style={{ display: "inline-block", fontSize: 11, background: "var(--surface)", color: "var(--ink)", padding: "4px 12px", borderRadius: 6, fontWeight: 700, border: `1px solid var(--line)`, textTransform: "uppercase", letterSpacing: "1px" }}>{t.mockMode}</div>}
            </div>

            <div className="mobile-stack desktop-grid-side-main">
              {/* SIDE: STATS & ACTIONS */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", margin: "0 auto", marginBottom: 32, position: "sticky", top: 80, alignSelf: "start" }}>
              
              {/* 1. Mastery Score Widget */}
              <div style={{ padding: 20, background: "var(--surface)", borderRadius: 20, border: "1px solid var(--line)", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>Level</div>
                  <div style={{ fontSize: 18, color: levelColor, fontWeight: 800, marginBottom: 16 }}>{level}</div>
                  
                  <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>Today's Score</div>
                  <div style={{ fontSize: 24, color: "var(--ink)", fontWeight: 800 }}>
                    {rawScore > 0 ? "+" : ""}{rawScore} <span style={{ fontSize: 16, color: "var(--muted)", fontWeight: 600 }}>/ {total * 2}</span>
                  </div>
                </div>
                
                {/* Dial */}
                <div style={{ width: 100, height: 100, position: "relative", flexShrink: 0 }}>
                  <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--line-2)" strokeWidth="10" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="url(#masteryGrad)" strokeWidth="10" strokeDasharray="264" strokeDashoffset={264 - (masteryScore/100 * 264)} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.5s ease" }} />
                    <defs>
                      <linearGradient id="masteryGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="var(--blue)" />
                        <stop offset="100%" stopColor="var(--teal)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)" }}>{masteryScore}</span>
                  </div>
                </div>
              </div>

              {/* Core Metrics */}
              <div className="grid-responsive-2" style={{ gap: 10 }}>
                {[
                  { lbl: "Accuracy", val: `${accuracy}%`, bg: "var(--surface)", clr: "var(--ink)" },
                  { lbl: "Speed", val: `${avgTime.toFixed(1)}s`, bg: "var(--surface)", clr: "var(--ink)" },
                  { lbl: "Completion", val: `${completion}%`, bg: "var(--surface)", clr: "var(--ink)" },
                  { lbl: "Marks Lost", val: `-${negativeImpact}`, bg: "var(--crimson-soft)", clr: "var(--crimson)" }
                ].map((m, i) => (
                  <div key={i} style={{ background: m.bg, border: "1px solid var(--line)", borderRadius: 16, padding: "16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: m.clr, marginBottom: 4 }}>{m.val}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", textAlign: "center" }}>{m.lbl}</div>
                  </div>
                ))}
              </div>

              {/* Performance Summary (Topics) */}
              <div style={{ padding: 20, background: "var(--surface)", borderRadius: 20, border: "1px solid var(--line)" }}>
                <h4 style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, margin: 0 }}>Performance Summary</h4>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: "var(--surface-2)", borderRadius: 12, marginTop: 16 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{quizTopic}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: topicColor }}>{topicPerformance}</span>
                </div>
              </div>

              {/* AI Coach */}
              <div style={{ padding: 20, background: "var(--blue-soft)", borderRadius: 20, border: "1px solid color-mix(in srgb, var(--blue) 20%, transparent)", display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ fontSize: 24 }}>🧠</div>
                <div style={{ fontSize: 15, color: "var(--blue)", fontWeight: 600, lineHeight: 1.5 }}>
                  "{aiCoach}"
                </div>
              </div>

              {/* Dynamic Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                <div style={{ textAlign: "center", fontSize: 12, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>Recommended Next Step</div>
                
                <button onClick={primaryActionFn} className="btn-primary touch-target active-state" style={{ padding: "16px", fontSize: 16, borderRadius: 16, background: "var(--ink)", color: "var(--paper)", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", width: "100%", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  {nextAction}
                </button>

                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  {nextAction !== "Review Mistakes First" && wrongCount > 0 && (
                    <button onClick={() => { setReviewFilter("wrong"); document.getElementById('review-section')?.scrollIntoView({ behavior: 'smooth' }); }} className="btn-secondary touch-target active-state" style={{ flex: 1, padding: "14px", fontSize: 14, borderRadius: 12, background: "var(--surface)", border: "1px solid var(--line-2)" }}>
                      Review Mistakes
                    </button>
                  )}
                  {nextAction !== "Challenge Me" && (
                    <button onClick={onMoreQuizzes} className="btn-secondary touch-target active-state" style={{ flex: 1, padding: "14px", fontSize: 14, borderRadius: 12, background: "var(--surface)", border: "1px solid var(--line-2)" }}>
                      More Quizzes
                    </button>
                  )}
                  {nextAction !== "Practice Weak Topics" && (
                    <button onClick={onRetry} className="btn-secondary touch-target active-state" style={{ flex: 1, padding: "14px", fontSize: 14, borderRadius: 12, background: "var(--surface)", border: "1px solid var(--line-2)" }}>
                      Retry
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* ── MAIN: Question Review ── */}
            <div id="review-section" style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, borderBottom: "1px solid var(--line)", paddingBottom: 16 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.5px" }}>
              {t.answerReview || "Detailed Question Review"}
            </h3>
          </div>

          {/* Pill Filter Tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap", background: "var(--line-2)", padding: 6, borderRadius: 999, width: "fit-content" }}>
            {filterBtns.map(({ key, label, count, clr }) => {
              const isActive = reviewFilter === key;
              return (
                <button key={key} onClick={() => setReviewFilter(key)} className="touch-target active-state"
                  style={{ background: isActive ? "var(--surface)" : "transparent", border: "none", borderRadius: 999, padding: "8px 16px", fontSize: 13, fontWeight: 700, color: isActive ? "var(--ink)" : "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.06)" : "none" }}>
                  {label}
                  <span style={{ background: isActive ? colorMix(clr, 18) : "transparent", borderRadius: 12, padding: "2px 8px", fontSize: 12, color: isActive ? clr : "var(--muted)", fontWeight: 800 }}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Review cards */}
          {reviewQuestions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", background: "var(--surface)", borderRadius: 16, border: "1px dashed var(--line)" }}>
              <svg style={{ margin: "0 auto 12px", color: "var(--line)" }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
              <div style={{ color: "var(--faint)", fontSize: 15, fontWeight: 600 }}>{t.noQsCategory || "No questions in this category."}</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {reviewQuestions.map(({ q, i, userAns, correctIdx, status }) => {
                const qText  = lang === "hi" && q.question_hi ? q.question_hi : q.question;
                const opts   = getQuestionOpts(q, lang);
                const expTxt = lang === "hi" && q.explanation_hi ? q.explanation_hi : q.explanation;
                
                const isCorrect = status === "correct";
                const isWrong = status === "wrong";

                const statusColor = isCorrect ? "var(--teal)" : isWrong ? "var(--crimson)" : "var(--muted)";
                const statusBg = isCorrect ? "var(--teal-soft)" : isWrong ? "var(--crimson-soft)" : "var(--line-2)";
                const statusLabel = isCorrect ? "✓ Correct (+2.0)" : isWrong ? "✗ Incorrect (-0.66)" : "— Skipped (0.00)";

                return (
                  <div key={i} className="res-q card-h" data-status={status} style={{ padding: "24px 20px", borderLeft: `4px solid ${statusColor}`, borderRadius: 16, background: "var(--surface)", border: "1px solid var(--line)" }}>

                    {/* Q number + status badge */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Question {i + 1} of {total}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, background: statusBg, color: statusColor, padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 800 }}>
                        {statusLabel}
                      </div>
                    </div>

                    {/* Question text */}
                    <p style={{ fontSize: 16, color: "var(--ink)", lineHeight: 1.6, fontWeight: 600, marginBottom: 20 }}>{qText}</p>

                    {/* Options */}
                    {opts && opts.length > 0 && (
                      <div className="opts" style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                        {opts.map((opt, idx) => {
                          const isOptCorrect = correctIdx === idx;
                          const isOptUser    = userAns === idx;
                          
                          let bg = "var(--surface)";
                          let border = "var(--line)";
                          let color = "var(--ink)";
                          let pillBg = "var(--line-2)";
                          let pillColor = "var(--ink)";
                          let statusTag = null;

                          if (isOptCorrect) {
                            bg = "var(--teal-soft)";
                            border = "var(--teal)";
                            color = "var(--teal)";
                            pillBg = "var(--teal)";
                            pillColor = "#fff";
                            statusTag = (
                              <span style={{ fontSize: 11, fontWeight: 800, color: "var(--teal)", background: "color-mix(in srgb, var(--teal) 15%, transparent)", padding: "3px 8px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                Correct Answer
                              </span>
                            );
                          } else if (isOptUser && !isOptCorrect) {
                            bg = "var(--crimson-soft)";
                            border = "var(--crimson)";
                            color = "var(--crimson)";
                            pillBg = "var(--crimson)";
                            pillColor = "#fff";
                            statusTag = (
                              <span style={{ fontSize: 11, fontWeight: 800, color: "var(--crimson)", background: "color-mix(in srgb, var(--crimson) 15%, transparent)", padding: "3px 8px", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                Your Answer
                              </span>
                            );
                          }

                          return (
                            <div key={idx} style={{ position: "relative", display: "grid", gridTemplateColumns: "32px 1fr auto", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 14, background: bg, border: `1.5px solid ${border}`, transition: "transform 0.2s" }}>
                              <span style={{ width: 28, height: 28, borderRadius: 8, background: pillBg, color: pillColor, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                                {letters[idx]}
                              </span>
                              <span style={{ color: color, fontSize: 15, fontWeight: isOptCorrect || isOptUser ? 700 : 500, lineHeight: 1.5 }}>{opt}</span>
                              <div style={{ flexShrink: 0 }}>{statusTag}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Explanation */}
                    {expTxt && (
                      <div style={{ background: "var(--surface-2)", borderRadius: 12, padding: "16px 20px", border: "1px solid var(--line)", position: "relative", marginTop: 12 }}>
                        <div style={{ position: "absolute", top: -10, left: 24, background: "var(--surface)", border: "1px solid var(--line)", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 800, color: "var(--blue)", textTransform: "uppercase", letterSpacing: "1px" }}>
                          {t.explanation || "Explanation"}
                        </div>
                        <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6, marginTop: 8 }}>{expTxt}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

          </div> {/* END DESKTOP GRID */}
        </div>
      </div>
        <BottomNav tab={tab} C={C} onNavigate={onTabNavigate} profile={profile} />
      </div>
    </div>
  );
}

function colorMix(color, percent) {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}