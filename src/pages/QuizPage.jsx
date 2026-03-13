import Header from "../components/layout/Header";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import ErrorBanner from "../components/ui/ErrorBanner";

export default function QuizPage(props) {
  const {
    ms, css, C, t, dataLoading, dataError, onClearError, onBack, onHome,
    headerProps, questions, currentQ, answers, lang, mockMode, showExp,
    selectAnswer, nextQ, skipQ, setCurrentQ, setShowExp,
    toggleBM, isBM, selectedQuiz,
  } = props;

  const q        = questions[currentQ];
  const answered = answers[currentQ] !== undefined;
  const opts     = lang === "hi" && q?.options_hi ? q.options_hi : q?.options;
  const qTxt     = lang === "hi" && q?.question_hi ? q.question_hi : q?.question;

  // Live marks tally
  const correct    = questions.filter((_, i) => answers[i] !== undefined && answers[i] === questions[i]?.correct).length;
  const wrong      = questions.filter((_, i) => answers[i] !== undefined && answers[i] !== questions[i]?.correct).length;
  const liveMarks  = parseFloat(((correct * 2) - (wrong * 0.66)).toFixed(2));

  const dotColor = (i) => {
    if (answers[i] === undefined) return i === currentQ ? C.border : C.card;
    if (mockMode) return C.acc;
    return answers[i] === questions[i]?.correct ? C.ok : C.err;
  };

  return (
    <div style={ms}>
      <style>{css}</style>
      <Header back onBack={onBack} onHome={onHome} C={C} t={t} lang={lang} {...headerProps} />
      <ErrorBanner msg={dataError} C={C} onClose={onClearError} />

      {dataLoading ? (
        <Spinner text="Loading Assessment..." C={C} fallbackText={t.loading} />
      ) : questions.length === 0 ? (
        <EmptyState icon="📄" title={t.noQuestions} desc={`${t.noQuestionsDesc} ${selectedQuiz?.id}`} C={C} />
      ) : (
        <div style={{ padding: "20px 16px", maxWidth: 800, margin: "0 auto" }}>

          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>
              Q. {currentQ + 1} <span style={{ color: C.muted, fontWeight: 400 }}>/ {questions.length}</span>
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10, color: C.muted, background: C.card, padding: "2px 8px", borderRadius: 4, border: `1px solid ${C.border}` }}>
                +2 / −0.66 / 0
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: liveMarks >= 0 ? C.ok : C.err, background: C.card, padding: "3px 10px", borderRadius: 4, border: `1px solid ${liveMarks >= 0 ? C.ok : C.err}44` }}>
                {liveMarks >= 0 ? "+" : ""}{liveMarks} pts
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, background: C.border, borderRadius: 2, marginBottom: 24, overflow: "hidden" }}>
            <div style={{ width: `${((currentQ + 1) / questions.length) * 100}%`, height: "100%", background: C.acc, borderRadius: 2, transition: "width 0.3s" }} />
          </div>

          {/* Question card */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 24, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: C.text, fontWeight: 500, marginRight: 16 }}>{qTxt}</p>
              <button
                onClick={() => q && toggleBM(q)}
                style={{ background: "none", border: `1px solid ${isBM(q) ? C.acc : C.border}`, borderRadius: 4, padding: "4px 8px", cursor: "pointer", fontSize: 12, color: isBM(q) ? C.acc : C.muted, fontWeight: 500, flexShrink: 0 }}
              >
                {isBM(q) ? "Saved" : "Save"}
              </button>
            </div>

            {/* Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {opts?.map((opt, idx) => {
                const isSel  = answers[currentQ] === idx;
                const isOk   = q?.correct === idx;
                let bg = C.inp, border = C.border, tc = C.text;
                if (answered && !mockMode) {
                  if (isOk)       { bg = `${C.ok}11`;  border = C.ok;  }
                  else if (isSel) { bg = `${C.err}11`; border = C.err; }
                } else if (isSel && mockMode) {
                  bg = `${C.acc}11`; border = C.acc; tc = C.acc;
                }
                const letterBg    = answered && !mockMode && isOk  ? C.ok
                                  : answered && !mockMode && isSel ? C.err
                                  : isSel && mockMode              ? C.acc
                                  : C.card;
                const letterColor = (answered && !mockMode && (isOk || isSel)) || (isSel && mockMode) ? "#fff" : C.muted;
                return (
                  <button key={idx} onClick={() => selectAnswer(idx)} disabled={answered} className="opt"
                    style={{ background: bg, border: `1px solid ${border}`, borderRadius: 6, padding: "14px 16px", color: tc, fontSize: 14, display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ width: 24, height: 24, borderRadius: 4, flexShrink: 0, background: letterBg, border: `1px solid ${answered && !mockMode ? (isOk ? C.ok : isSel ? C.err : C.border) : isSel && mockMode ? C.acc : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 12, color: letterColor }}>
                      {["A","B","C","D"][idx]}
                    </span>
                    <span style={{ lineHeight: 1.4 }}>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation */}
          {showExp && !mockMode && (
            <div style={{ background: `${C.ok}11`, border: `1px solid ${C.ok}44`, borderRadius: 8, padding: 16, marginBottom: 16, animation: "fadeUp 0.3s ease" }}>
              <div style={{ fontSize: 11, color: C.ok, fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.explanation}</div>
              <p style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>{lang === "hi" && q?.explanation_hi ? q.explanation_hi : q?.explanation}</p>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            {!answered && (
              <button onClick={skipQ}
                style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: "14px", color: C.muted, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                {currentQ < questions.length - 1 ? "Skip →" : "Skip & Finish"}
              </button>
            )}
            {answered && (
              <button onClick={nextQ}
                style={{ flex: 1, background: C.acc, border: "none", borderRadius: 6, padding: "16px", color: "#fff", fontWeight: 600, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 12px rgba(37,99,235,0.2)" }}>
                {currentQ < questions.length - 1 ? t.nextQuestion : t.finishQuiz}
              </button>
            )}
          </div>

          {/* Question navigator */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 24, justifyContent: "center", paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
            {questions.map((_, i) => (
              <div key={i} onClick={() => { setCurrentQ(i); setShowExp(!mockMode && answers[i] !== undefined); }}
                style={{ width: 30, height: 30, borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, color: answers[i] !== undefined ? "#fff" : C.muted, background: dotColor(i), border: `1px solid ${i === currentQ ? C.text : answers[i] !== undefined ? "transparent" : C.border}` }}>
                {i + 1}
              </div>
            ))}
          </div>

          {/* Marking scheme legend */}
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
            {[["✓ Correct", "+2", C.ok], ["✗ Wrong", "−0.66", C.err], ["— Skipped", "0", C.muted]].map(([lbl, val, clr]) => (
              <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: clr }}>{val}</span>
                <span style={{ fontSize: 11, color: C.muted }}>{lbl}</span>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}