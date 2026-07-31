import { useState, useRef, useEffect } from "react";
import { initResults } from "../alive.js";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import BottomNav from "../components/layout/BottomNav";

export default function ResultPage(props) {
  const {
    ms, css, C, t, score, marksScored, questions, lang, selectedQuiz,
    mockMode, timeTaken, fmt, answers, onRetry, onMoreQuizzes,
    onAnalytics, onBack, onHome, onTabNavigate, tab, headerProps
  } = props;

  const [reviewFilter, setReviewFilter] = useState("all");
  const rootRef = useRef(null);

  useEffect(() => {
    if (rootRef.current) {
      initResults(rootRef.current);
    }
  }, []);

  // --- 1. PERFORMANCE ENGINE ---
  const total = questions.length;
  const attemptedIndices = Object.keys(answers).map(Number);
  const attemptedCount = attemptedIndices.length;
  const correctCount = score; 
  const wrongCount = attemptedCount - correctCount;
  const skippedCount = total - attemptedCount;

  // Mathematically sound metrics
  const rawScore = parseFloat(((correctCount * 2) - (wrongCount * 0.66)).toFixed(2));
  const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
  const completion = total > 0 ? Math.round((attemptedCount / total) * 100) : 0;
  const avgTime = attemptedCount > 0 ? (timeTaken / attemptedCount) : 0; 
  const negativeImpact = parseFloat((wrongCount * 0.66).toFixed(2));

  // Guess Index
  const isGuessing = avgTime < 4 && accuracy < 40 && attemptedCount > 0;

  // Topic Strength & Consistency
  const quizTopic = (lang === "hi" ? selectedQuiz?.topic_name_hi : selectedQuiz?.topic_name) || (lang === "hi" ? selectedQuiz?.title_hi : selectedQuiz?.title) || "Mixed Topics";
  let topicPerformance = "🟡 Average";
  let topicColor = "var(--yellow)";
  if (accuracy >= 70) { topicPerformance = "🟢 Strong"; topicColor = "var(--teal)"; }
  else if (accuracy < 50) { topicPerformance = "🔴 Weak"; topicColor = "var(--crimson)"; }

  // Mastery Score (0-100)
  let speedScore = 0;
  if (avgTime > 0 && avgTime < 15) speedScore = 100;
  else if (avgTime <= 35) speedScore = 80;
  else if (avgTime <= 60) speedScore = 50;
  else speedScore = 20;

  if (attemptedCount === 0) speedScore = 0;

  let topicScore = accuracy; 
  let consistencyScore = 70; 

  let masteryScore = Math.round((accuracy * 0.4) + (speedScore * 0.2) + (topicScore * 0.3) + (consistencyScore * 0.1));
  if (isNaN(masteryScore)) masteryScore = 0;

  // Level classification
  let level = "🟡 Needs Revision";
  let levelColor = "var(--yellow)";
  if (masteryScore >= 90) { level = "🟣 Master"; levelColor = "var(--purple)"; }
  else if (masteryScore >= 80) { level = "🔵 Strong"; levelColor = "var(--blue)"; }
  else if (masteryScore >= 70) { level = "🟢 Good"; levelColor = "var(--teal)"; }
  else if (masteryScore >= 60) { level = "🟠 Improving"; levelColor = "var(--orange)"; }
  else if (masteryScore < 40) { level = "🔴 High Priority"; levelColor = "var(--crimson)"; }

  // Top Mistakes
  const mistakes = questions
    .map((q, i) => ({ q, i }))
    .filter(({ i }) => answers[i] !== undefined && answers[i] !== questions[i].correct)
    .slice(0, 3); 

  // --- 2. NEXT ACTION ENGINE ---
  let nextAction = "";
  let aiCoach = "";
  let primaryActionFn = onRetry;

  if (attemptedCount === 0) {
    nextAction = "Retry Quiz";
    aiCoach = "You didn't attempt any questions. Let's try again!";
    primaryActionFn = onRetry;
  } else if (accuracy >= 85) {
    nextAction = "Challenge Me";
    aiCoach = "Excellent work. You're ready for harder questions.";
    primaryActionFn = onMoreQuizzes; 
  } else if (accuracy >= 60) {
    nextAction = "Practice Weak Topics";
    aiCoach = `You understand the basics, but ${quizTopic} needs some brushing up.`;
    primaryActionFn = onRetry;
  } else {
    nextAction = "Review Mistakes First";
    aiCoach = "Don't worry, mistakes are how you learn. Review them carefully before trying again.";
    primaryActionFn = () => { setReviewFilter("wrong"); document.getElementById('review-section')?.scrollIntoView({ behavior: 'smooth' }); };
  }

  if (isGuessing) {
    nextAction = "Study Notes";
    aiCoach = "It looks like you might be rushing or guessing. Take your time to study the material first.";
    primaryActionFn = onBack; 
  }

  // --- 3. UI PREP ---
  const reviewQuestions = questions.map((q, i) => {
    const userAns = answers[i];
    const status  = userAns === undefined ? "skipped"
                  : userAns === q.correct  ? "correct"
                  : "wrong";
    return { q, i, userAns, status };
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

        <div className="quiz-root" ref={rootRef} style={{ paddingBottom: 100, animation: "fadeUp 0.4s var(--ease)", overflowY: "auto", height: "100%", width: "100%" }}>
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

            <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 500, margin: "0 auto", marginBottom: 32 }}>
              
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

              {/* Top Mistakes */}
              {mistakes.length > 0 && (
                <div style={{ padding: 20, background: "var(--surface)", borderRadius: 20, border: "1px solid var(--line)" }}>
                  <h4 style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, margin: 0 }}>Top Mistakes</h4>
                  <ul style={{ margin: "12px 0 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                    {mistakes.map(({q, i}) => {
                      const txt = lang === "hi" && q.question_hi ? q.question_hi : q.question;
                      return (
                        <li key={i} style={{ fontSize: 14, color: "var(--ink)", fontWeight: 600, display: "flex", alignItems: "flex-start", gap: 8 }}>
                          <span style={{ color: "var(--crimson)" }}>•</span>
                          <span style={{ lineHeight: 1.4 }}>{txt.length > 60 ? txt.slice(0, 60) + '...' : txt}</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

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
                
                <button onClick={primaryActionFn} className="btn-primary touch-target active-state" style={{ padding: "16px", fontSize: 16, borderRadius: 16, background: "var(--ink)", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", width: "100%", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  ★★★★★ {nextAction}
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

            {/* ── Question Review ── */}

        <div id="review-section">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, borderBottom: "1px solid var(--line)", paddingBottom: 16 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.5px" }}>
              {t.answerReview || "Detailed Review"}
            </h3>
          </div>

          {/* Pill Filter Tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap", background: "var(--line-2)", padding: 6, borderRadius: 999, width: "fit-content" }}>
            {filterBtns.map(({ key, label, count, clr }) => {
              const isActive = reviewFilter === key;
              return (
                <button key={key} onClick={() => setReviewFilter(key)} className="touch-target active-state"
                  style={{ background: isActive ? "var(--surface)" : "transparent", border: "none", borderRadius: 999, padding: "6px 12px", fontSize: 12, fontWeight: 700, color: isActive ? "var(--ink)" : "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.06)" : "none" }}>
                  {label}
                  <span style={{ background: isActive ? colorMix(clr, 15) : "transparent", borderRadius: 12, padding: "2px 6px", fontSize: 11, color: isActive ? clr : "var(--muted)", fontWeight: 800 }}>{count}</span>
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
              {reviewQuestions.map(({ q, i, userAns, status }) => {
                const qText  = lang === "hi" && q.question_hi ? q.question_hi : q.question;
                const opts   = lang === "hi" && q.options_hi  ? q.options_hi  : q.options;
                const expTxt = lang === "hi" && q.explanation_hi ? q.explanation_hi : q.explanation;
                
                const isCorrect = status === "correct";
                const isWrong = status === "wrong";

                const statusColor = isCorrect ? "var(--teal)" : isWrong ? "var(--crimson)" : "var(--muted)";
                const statusBg = isCorrect ? "var(--teal-soft)" : isWrong ? "var(--crimson-soft)" : "var(--line-2)";
                const statusLabel = isCorrect ? "+2.00" : isWrong ? "−0.66" : "0.00";

                return (
                  <div key={i} className="res-q card-h" data-status={status} style={{ padding: "24px 20px", borderLeft: `4px solid ${statusColor}` }}>

                    {/* Q number + status badge */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Question {i + 1}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, background: statusBg, color: statusColor, padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                        {isCorrect ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> 
                        : isWrong ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> 
                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"></line></svg>}
                        {statusLabel}
                      </div>
                    </div>

                    {/* Question text */}
                    <p style={{ fontSize: 16, color: "var(--ink)", lineHeight: 1.6, fontWeight: 600, marginBottom: 20 }}>{qText}</p>

                    {/* Options */}
                    {opts && (
                      <div className="opts" style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                        {opts.map((opt, idx) => {
                          const isOptCorrect = q.correct === idx;
                          const isOptUser    = userAns === idx;
                          
                          let bg = "var(--surface)", border = "var(--line)", color = "var(--ink)", icon = null;
                          let pillBg = "var(--line-2)", pillColor = "var(--muted)";

                          if (isOptCorrect) {
                            bg = "var(--teal-soft)"; border = "var(--teal)"; color = "var(--teal)";
                            pillBg = "var(--teal)"; pillColor = "#fff";
                            icon = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>;
                          } else if (isOptUser && !isOptCorrect) {
                            bg = "var(--crimson-soft)"; border = "var(--crimson)"; color = "var(--crimson)";
                            pillBg = "var(--crimson)"; pillColor = "#fff";
                            icon = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--crimson)" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
                          }

                          return (
                            <div key={idx} style={{ position: "relative", display: "grid", gridTemplateColumns: "32px 1fr 24px", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, background: bg, border: `1.5px solid ${border}`, transition: "transform 0.2s" }}>
                              <span style={{ width: 28, height: 28, borderRadius: 8, background: pillBg, color: pillColor, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13 }}>
                                {letters[idx]}
                              </span>
                              <span style={{ color: color, fontSize: 15, fontWeight: isOptCorrect || isOptUser ? 700 : 500, lineHeight: 1.5 }}>{opt}</span>
                              <span>{icon}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Explanation */}
                    {expTxt && (
                      <div style={{ background: "var(--surface-2)", borderRadius: 12, padding: "16px 20px", border: "1px solid var(--line)", position: "relative" }}>
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

          </div>
        </div>
        <BottomNav tab={tab} C={C} onNavigate={onTabNavigate} profile={props.profile} />
      </div>
    </div>
  );
}

function colorMix(color, percent) {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}