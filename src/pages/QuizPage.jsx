import React, { useMemo } from 'react';
import Header from "../components/layout/Header";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import ErrorBanner from "../components/ui/ErrorBanner";

export default function QuizPage(props) {
  const {
    ms, css, C, t, dataLoading, dataError, onClearError, onBack, onHome,
    headerProps, questions, currentQ, answers, lang, mockMode, showExp,
    selectAnswer, clearAnswer, nextQ, skipQ, setCurrentQ, setShowExp,
    toggleBM, isBM, selectedQuiz,
  } = props;

  const q = questions[currentQ];
  const answered = answers[currentQ] !== undefined;

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

  // Live marks — only shown in practice mode
  const correct   = questions.filter((_, i) => answers[i] !== undefined && answers[i] === questions[i]?.correct).length;
  const wrong     = questions.filter((_, i) => answers[i] !== undefined && answers[i] !== questions[i]?.correct).length;
  const liveMarks = parseFloat(((correct * 2) - (wrong * 0.66)).toFixed(2));

  const dotColor = (i) => {
    if (answers[i] === undefined) return i === currentQ ? C.border : C.card;
    if (mockMode) return C.acc; // exam mode: just show "attempted" in accent, no right/wrong
    return answers[i] === questions[i]?.correct ? C.ok : C.err;
  };

  return (
    <div style={{ ...ms, height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column", paddingBottom: 0 }}>
      <style>{css}</style>
      <Header back onBack={onBack} onHome={onHome} C={C} t={t} lang={lang} {...headerProps} />
      <ErrorBanner msg={dataError} C={C} onClose={onClearError} />

      {dataLoading ? (
        <Spinner text="Loading Assessment..." C={C} fallbackText={t.loading} />
      ) : questions.length === 0 ? (
        <EmptyState icon="📄" title={t.noQuestions} desc={`${t.noQuestionsDesc} ${selectedQuiz?.id}`} C={C} />
      ) : (
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 16px 80px", maxWidth: 720, margin: "0 auto", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>

            {/* Header row */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "center" }}>
              <span style={{ fontSize: 14, color: C.text, fontWeight: 700, letterSpacing: "-0.2px" }}>
                Question {currentQ + 1} <span style={{ color: C.muted, fontWeight: 500 }}>of {questions.length}</span>
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Marking scheme hint */}
                <span style={{ fontSize: 11, color: C.muted, background: C.inp, padding: "4px 8px", borderRadius: 6, fontWeight: 600 }}>
                  +2 / −0.66
                </span>
                {/* Live marks — ONLY in practice mode */}
                {!mockMode && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: liveMarks >= 0 ? C.ok : C.err, background: `${liveMarks >= 0 ? C.ok : C.err}15`, padding: "4px 10px", borderRadius: 6 }}>
                    {liveMarks >= 0 ? "+" : ""}{liveMarks} pts
                  </span>
                )}
                {/* Exam mode: show answered count instead */}
                {mockMode && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.muted, background: C.card, padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}` }}>
                    {Object.keys(answers).length}/{questions.length} answered
                  </span>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 6, background: C.border, borderRadius: 3, marginBottom: 32, overflow: "hidden" }}>
              <div style={{ width: `${((currentQ + 1) / questions.length) * 100}%`, height: "100%", background: C.acc, borderRadius: 3, transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }} />
            </div>

            {/* Question card */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "24px 20px", marginBottom: 24, boxShadow: C.shadow, flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <p style={{ fontSize: 16, lineHeight: 1.6, color: C.text, fontWeight: 600, marginRight: 16, letterSpacing: "-0.2px", whiteSpace: "pre-wrap" }}>{qTxt}</p>
                <button
                  onClick={() => q && toggleBM(q)}
                  style={{ background: isBM(q) ? `${C.acc}15` : "transparent", border: `1px solid ${isBM(q) ? C.acc : C.border}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13, color: isBM(q) ? C.acc : C.muted, fontWeight: 600, flexShrink: 0, transition: "all 0.2s" }}
                >
                  {isBM(q) ? "★ Saved" : "☆ Save"}
                </button>
              </div>

              {/* Options */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {opts?.map((opt, idx) => {
                const isSel  = answers[currentQ] === idx;
                const isOk   = q?.correct === idx;
                let bg = C.inp, border = C.border, tc = C.text;
                if (answered && !mockMode) {
                  if (isOk)       { bg = `${C.ok}11`;  border = C.ok;  }
                  else if (isSel) { bg = `${C.err}11`; border = C.err; }
                } else if (isSel && mockMode) {
                  // exam mode: show selection in accent only, no reveal
                  bg = `${C.acc}11`; border = C.acc; tc = C.acc;
                }
                const letterBg    = answered && !mockMode && isOk  ? C.ok
                                  : answered && !mockMode && isSel ? C.err
                                  : isSel && mockMode              ? C.acc
                                  : C.card;
                const letterColor = (answered && !mockMode && (isOk || isSel)) || (isSel && mockMode) ? "#fff" : C.muted;
                return (
                  <button key={idx} onClick={() => selectAnswer(idx)} className={`opt ${isSel ? 'selected' : ''}`}
                    style={{ background: bg, border: `1px solid ${border}`, color: tc }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <span style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0, background: letterBg, border: `1px solid ${answered && !mockMode ? (isOk ? C.ok : isSel ? C.err : 'transparent') : isSel && mockMode ? 'transparent' : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: letterColor }}>
                        {["A","B","C","D"][idx]}
                      </span>
                      <span style={{ lineHeight: 1.5, fontSize: 14, whiteSpace: "pre-wrap" }}>{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation — practice mode only */}
          {showExp && !mockMode && (
            <div style={{ background: `${C.ok}11`, border: `1px solid ${C.ok}33`, borderRadius: 12, padding: "20px 24px", marginBottom: 24, animation: "fadeUp 0.3s ease", boxShadow: `0 4px 12px ${C.ok}11` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ color: C.ok, fontSize: 18 }}>💡</span>
                <span style={{ fontSize: 13, color: C.ok, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>{t.explanation}</span>
              </div>
              <p style={{ color: C.text, fontSize: 15, lineHeight: 1.6, opacity: 0.9, whiteSpace: "pre-wrap" }}>{lang === "hi" && q?.explanation_hi ? q.explanation_hi : q?.explanation}</p>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            {/* Skip — only when not yet answered */}
            {!answered && (
              <button onClick={skipQ} className="btn-secondary" style={{ flex: 1, padding: "16px", fontSize: 15 }}>
                {currentQ < questions.length - 1 ? "Skip Question →" : "Skip & Submit"}
              </button>
            )}
            {/* Next / Submit / Clear — after answering */}
            {answered && (
              <>
                <button onClick={clearAnswer} className="btn-secondary" style={{ flex: 1, padding: "16px", fontSize: 15, border: `1px solid ${C.err}88`, color: C.err, background: `${C.err}11` }}>
                  Clear
                </button>
                <button onClick={nextQ} className="btn-primary" style={{ flex: 2, padding: "18px", fontSize: 16, borderRadius: 12 }}>
                  {currentQ < questions.length - 1 ? t.nextQuestion : t.finishQuiz}
                </button>
              </>
            )}
          </div>

          {/* Question navigator dots */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 32, justifyContent: "center", paddingTop: 32, borderTop: `1px solid ${C.border}` }}>
            {questions.map((_, i) => (
              <div key={i} onClick={() => { setCurrentQ(i); setShowExp(!mockMode && answers[i] !== undefined); }}
                style={{ width: 32, height: 32, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: answers[i] !== undefined ? "#fff" : C.muted, background: dotColor(i), border: `1px solid ${i === currentQ ? C.text : answers[i] !== undefined ? "transparent" : C.border}`, transition: "all 0.2s" }}>
                {i + 1}
              </div>
            ))}
          </div>

          {/* Marking scheme legend */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 20, paddingTop: 16 }}>
            {[["✓ Correct", "+2", C.ok], ["✗ Wrong", "−0.66", C.err], ["— Skipped", "0", C.muted]].map(([lbl, val, clr]) => (
              <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: clr }}>{val}</span>
                <span style={{ fontSize: 12, color: C.muted }}>{lbl}</span>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}