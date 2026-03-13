import Header from "../components/layout/Header";
import BottomNav from "../components/layout/BottomNav";

export default function ResultPage(props) {
  const {
    ms, css, C, t, score, marksScored, questions, lang, selectedQuiz,
    mockMode, timeTaken, fmt, answers, onRetry, onMoreQuizzes,
    onAnalytics, onBack, onHome, onTabNavigate, tab, headerProps,
  } = props;

  const total    = questions.length;
  const correct  = score;
  const wrong    = questions.filter((q, i) => answers[i] !== undefined && answers[i] !== q.correct).length;
  const skipped  = total - correct - wrong;
  const maxMarks = total * 2;
  const marks    = marksScored ?? parseFloat(((correct * 2) - (wrong * 0.66)).toFixed(2));
  const marksPct = maxMarks > 0 ? Math.round((marks / maxMarks) * 100) : 0;
  const pct      = total ? Math.round((correct / total) * 100) : 0;
  const lbl      = pct >= 80 ? t.excellent : pct >= 60 ? t.goodJob : pct >= 40 ? t.keepPracticing : t.needStudy;

  return (
    <div style={ms}>
      <style>{css}</style>
      <Header back onBack={onBack} onHome={onHome} C={C} t={t} lang={lang} {...headerProps} />

      <div style={{ padding: "32px 16px", maxWidth: 600, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginBottom: 8 }}>Assessment Complete</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 8, letterSpacing: "-0.5px" }}>{lbl}</h2>
          <p style={{ color: C.muted, fontSize: 14, marginBottom: 0 }}>{lang === "hi" && selectedQuiz?.title_hi ? selectedQuiz.title_hi : selectedQuiz?.title}</p>
          {mockMode && <div style={{ display: "inline-block", marginTop: 12, fontSize: 12, background: C.inp, color: C.text, padding: "4px 12px", borderRadius: 4, fontWeight: 600, border: `1px solid ${C.border}` }}>{t.mockMode}</div>}
        </div>

        {/* ── Marks card ── */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "28px 24px", marginBottom: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>

          {/* Big marks number */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 52, fontWeight: 800, color: marks >= 0 ? C.ok : C.err, lineHeight: 1, marginBottom: 4 }}>
              {marks >= 0 ? "+" : ""}{marks}
            </div>
            <div style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>
              out of {maxMarks} marks
            </div>
            {/* Marks progress bar */}
            <div style={{ height: 8, background: C.border, borderRadius: 4, overflow: "hidden", marginTop: 14, marginBottom: 4 }}>
              <div style={{ width: `${Math.max(0, Math.min(100, marksPct))}%`, height: "100%", background: marks >= 0 ? C.ok : C.err, borderRadius: 4, transition: "width 1s ease" }} />
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>{marksPct}% of maximum marks</div>
          </div>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
            {[
              { val: correct,  lbl: "Correct",  sub: "+2 each",    clr: C.ok   },
              { val: wrong,    lbl: "Wrong",     sub: "−0.66 each", clr: C.err  },
              { val: skipped,  lbl: "Skipped",   sub: "0 marks",    clr: C.muted},
              { val: fmt(timeTaken), lbl: "Time", sub: "taken",     clr: C.text },
            ].map(({ val, lbl: sl, sub, clr }) => (
              <div key={sl} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: clr, fontFamily: sl === "Time" ? "monospace" : "inherit" }}>{val}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 3, fontWeight: 600 }}>{sl}</div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Accuracy card ── */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 20px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Accuracy</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: pct >= 60 ? C.ok : C.err }}>{pct}%</span>
          </div>
          <div style={{ height: 8, background: C.border, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: pct >= 60 ? C.ok : C.err, borderRadius: 4, transition: "width 1s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 11, color: C.muted }}>{correct}/{total} correct</span>
            <span style={{ fontSize: 11, color: C.muted }}>{pct >= 60 ? "✓ Pass" : "✗ Below pass mark"}</span>
          </div>
        </div>

        {/* ── Actions ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={onRetry}
            style={{ background: C.acc, border: "none", borderRadius: 6, padding: "14px", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", width: "100%" }}>
            {t.retry}
          </button>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={onMoreQuizzes}
              style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: "12px", color: C.text, fontWeight: 500, fontSize: 14, cursor: "pointer" }}>
              {t.moreQuizzes}
            </button>
            <button onClick={onAnalytics}
              style={{ flex: 1, background: C.inp, border: `1px solid ${C.border}`, borderRadius: 6, padding: "12px", color: C.text, fontWeight: 500, fontSize: 14, cursor: "pointer" }}>
              {t.analytics}
            </button>
          </div>
        </div>
      </div>

      <BottomNav tab={tab} C={C} onNavigate={onTabNavigate} />
    </div>
  );
}