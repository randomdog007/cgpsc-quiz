import { useState } from "react";
import Header from "../components/layout/Header";
import BottomNav from "../components/layout/BottomNav";

export default function ResultPage(props) {
  const {
    ms, css, C, t, score, marksScored, questions, lang, selectedQuiz,
    mockMode, timeTaken, fmt, answers, onRetry, onMoreQuizzes,
    onAnalytics, onBack, onHome, onTabNavigate, tab, headerProps,
  } = props;

  const [reviewFilter, setReviewFilter] = useState("all"); // all | correct | wrong | skipped

  const total    = questions.length;
  const correct  = score;
  const wrong    = questions.filter((q, i) => answers[i] !== undefined && answers[i] !== q.correct).length;
  const skipped  = total - correct - wrong;
  const maxMarks = total * 2;
  const marks    = marksScored ?? parseFloat(((correct * 2) - (wrong * 0.66)).toFixed(2));
  const marksPct = maxMarks > 0 ? Math.round((marks / maxMarks) * 100) : 0;
  const pct      = total ? Math.round((correct / total) * 100) : 0;
  const lbl      = pct >= 80 ? t.excellent : pct >= 60 ? t.goodJob : pct >= 40 ? t.keepPracticing : t.needStudy;

  // Build filtered review list
  const reviewQuestions = questions.map((q, i) => {
    const userAns = answers[i];
    const status  = userAns === undefined ? "skipped"
                  : userAns === q.correct  ? "correct"
                  : "wrong";
    return { q, i, userAns, status };
  }).filter(({ status }) => reviewFilter === "all" || status === reviewFilter);

  const filterBtns = [
    { key: "all",     label: "All",     count: total,   clr: C.text  },
    { key: "correct", label: "Correct", count: correct, clr: C.ok    },
    { key: "wrong",   label: "Wrong",   count: wrong,   clr: C.err   },
    { key: "skipped", label: "Skipped", count: skipped, clr: C.muted },
  ];

  const letters = ["A", "B", "C", "D"];

  return (
    <div style={ms}>
      <style>{css}</style>
      <Header back onBack={onBack} onHome={onHome} C={C} t={t} lang={lang} {...headerProps} />

      <div style={{ padding: "24px 16px", maxWidth: 700, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>

        {/* ── Title ── */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginBottom: 6 }}>Assessment Complete</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 6, letterSpacing: "-0.5px" }}>{lbl}</h2>
          <p style={{ color: C.muted, fontSize: 13 }}>{lang === "hi" && selectedQuiz?.title_hi ? selectedQuiz.title_hi : selectedQuiz?.title}</p>
          {mockMode && <div style={{ display: "inline-block", marginTop: 8, fontSize: 12, background: C.inp, color: C.text, padding: "4px 12px", borderRadius: 4, fontWeight: 600, border: `1px solid ${C.border}` }}>{t.mockMode}</div>}
        </div>

        {/* ── Marks card ── */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "24px 20px", marginBottom: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 50, fontWeight: 800, color: marks >= 0 ? C.ok : C.err, lineHeight: 1, marginBottom: 4 }}>
              {marks >= 0 ? "+" : ""}{marks}
            </div>
            <div style={{ fontSize: 13, color: C.muted }}>out of {maxMarks} marks</div>
            <div style={{ height: 8, background: C.border, borderRadius: 4, overflow: "hidden", marginTop: 12, marginBottom: 4 }}>
              <div style={{ width: `${Math.max(0, Math.min(100, marksPct))}%`, height: "100%", background: marks >= 0 ? C.ok : C.err, borderRadius: 4, transition: "width 1s ease" }} />
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>{marksPct}% of maximum marks</div>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, paddingTop: 18, borderTop: `1px solid ${C.border}` }}>
            {[
              { val: correct,        lbl: "Correct",  sub: "+2 each",   clr: C.ok    },
              { val: wrong,          lbl: "Wrong",    sub: "−0.66 each", clr: C.err   },
              { val: skipped,        lbl: "Skipped",  sub: "0 marks",   clr: C.muted  },
              { val: fmt(timeTaken), lbl: "Time",     sub: "taken",     clr: C.text, mono: true },
            ].map(({ val, lbl: sl, sub, clr, mono }) => (
              <div key={sl} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: clr, fontFamily: mono ? "monospace" : "inherit" }}>{val}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 3, fontWeight: 600 }}>{sl}</div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Accuracy bar ── */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Accuracy</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: pct >= 60 ? C.ok : C.err }}>{pct}%</span>
          </div>
          <div style={{ height: 7, background: C.border, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: pct >= 60 ? C.ok : C.err, borderRadius: 4, transition: "width 1s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
            <span style={{ fontSize: 11, color: C.muted }}>{correct}/{total} correct</span>
            <span style={{ fontSize: 11, color: pct >= 60 ? C.ok : C.err }}>{pct >= 60 ? "✓ Pass" : "✗ Below pass mark"}</span>
          </div>
        </div>

        {/* ── Actions ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
          <button onClick={onRetry} style={{ background: C.acc, border: "none", borderRadius: 6, padding: "13px", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            {t.retry}
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onMoreQuizzes} style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: "11px", color: C.text, fontWeight: 500, fontSize: 13, cursor: "pointer" }}>
              {t.moreQuizzes}
            </button>
            <button onClick={onAnalytics} style={{ flex: 1, background: C.inp, border: `1px solid ${C.border}`, borderRadius: 6, padding: "11px", color: C.text, fontWeight: 500, fontSize: 13, cursor: "pointer" }}>
              {t.analytics}
            </button>
          </div>
        </div>

        {/* ── Question Review ── */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 14, letterSpacing: "-0.3px" }}>
            Question Review
          </h3>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {filterBtns.map(({ key, label, count, clr }) => (
              <button key={key} onClick={() => setReviewFilter(key)}
                style={{ background: reviewFilter === key ? C.acc : C.card, border: `1px solid ${reviewFilter === key ? C.acc : C.border}`, borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600, color: reviewFilter === key ? "#fff" : clr, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                {label}
                <span style={{ background: reviewFilter === key ? "rgba(255,255,255,0.25)" : C.inp, borderRadius: 10, padding: "1px 6px", fontSize: 11 }}>{count}</span>
              </button>
            ))}
          </div>

          {/* Review cards */}
          {reviewQuestions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: C.muted, fontSize: 14 }}>No questions in this category.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {reviewQuestions.map(({ q, i, userAns, status }) => {
                const qText  = lang === "hi" && q.question_hi ? q.question_hi : q.question;
                const opts   = lang === "hi" && q.options_hi  ? q.options_hi  : q.options;
                const expTxt = lang === "hi" && q.explanation_hi ? q.explanation_hi : q.explanation;
                const statusColor = status === "correct" ? C.ok : status === "wrong" ? C.err : C.muted;
                const statusIcon  = status === "correct" ? "✓" : status === "wrong" ? "✗" : "—";
                const statusLabel = status === "correct" ? "+2 pts" : status === "wrong" ? "−0.66 pts" : "0 pts";

                return (
                  <div key={i} style={{ background: C.card, border: `1px solid ${status === "correct" ? C.ok + "44" : status === "wrong" ? C.err + "44" : C.border}`, borderRadius: 10, padding: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>

                    {/* Q number + status badge */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Q{i + 1}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: statusColor, background: statusColor + "15", border: `1px solid ${statusColor}44`, borderRadius: 4, padding: "2px 8px" }}>
                          {statusIcon} {statusLabel}
                        </span>
                      </div>
                    </div>

                    {/* Question text */}
                    <p style={{ fontSize: 14, color: C.text, lineHeight: 1.65, fontWeight: 500, marginBottom: 14 }}>{qText}</p>

                    {/* Options */}
                    {opts && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 }}>
                        {opts.map((opt, idx) => {
                          const isCorrect = q.correct === idx;
                          const isUser    = userAns === idx;
                          const isSkipped = userAns === undefined;
                          let bg = C.inp, border = C.border, textColor = C.text;
                          if (isCorrect) { bg = `${C.ok}12`; border = C.ok; textColor = C.ok; }
                          else if (isUser && !isCorrect) { bg = `${C.err}12`; border = C.err; textColor = C.err; }

                          return (
                            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 6, background: bg, border: `1px solid ${border}` }}>
                              <span style={{ width: 22, height: 22, borderRadius: 4, flexShrink: 0, background: isCorrect ? C.ok : isUser && !isCorrect ? C.err : C.card, border: `1px solid ${isCorrect ? C.ok : isUser ? C.err : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: (isCorrect || (isUser && !isCorrect)) ? "#fff" : C.muted }}>
                                {letters[idx]}
                              </span>
                              <span style={{ fontSize: 13, color: textColor, fontWeight: isCorrect ? 600 : 400, lineHeight: 1.4, flex: 1 }}>{opt}</span>
                              {isCorrect && <span style={{ fontSize: 12, color: C.ok, fontWeight: 700, flexShrink: 0 }}>✓ Correct</span>}
                              {isUser && !isCorrect && <span style={{ fontSize: 12, color: C.err, fontWeight: 700, flexShrink: 0 }}>Your answer</span>}
                              {isSkipped && isCorrect && <span style={{ fontSize: 12, color: C.ok, fontWeight: 700, flexShrink: 0 }}>✓ Answer</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Explanation */}
                    {expTxt && (
                      <div style={{ background: `${C.ok}0D`, border: `1px solid ${C.ok}30`, borderRadius: 6, padding: "10px 12px" }}>
                        <div style={{ fontSize: 10, color: C.ok, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 5 }}>Explanation</div>
                        <p style={{ fontSize: 13, color: C.text, lineHeight: 1.65, margin: 0 }}>{expTxt}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
      <BottomNav tab={tab} C={C} onNavigate={onTabNavigate} />
    </div>
  );
}