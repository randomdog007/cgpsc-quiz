import Header from "../components/layout/Header";
import BottomNav from "../components/layout/BottomNav";

export default function ResultPage(props) {
  const { ms, css, C, t, score, questions, lang, selectedQuiz, mockMode, timeTaken, fmt, onRetry, onMoreQuizzes, onAnalytics, onBack, onHome, onTabNavigate, tab, headerProps } = props;
  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;
  const lbl = pct >= 80 ? t.excellent : pct >= 60 ? t.goodJob : pct >= 40 ? t.keepPracticing : t.needStudy;
  return (
    <div style={ms}>
      <style>{css}</style>
      <Header back onBack={onBack} onHome={onHome} C={C} t={t} lang={lang} {...headerProps} />
      <div style={{ padding: "32px 16px", textAlign: "center", animation: "fadeUp 0.4s ease", maxWidth: 600, margin: "0 auto" }}>
        <div style={{ fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginBottom: 8 }}>Assessment Complete</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 8, letterSpacing: "-0.5px" }}>{lbl}</h2>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>{lang === "hi" && selectedQuiz?.title_hi ? selectedQuiz.title_hi : selectedQuiz?.title}</p>
        {mockMode && <div style={{ display: "inline-block", fontSize: 12, background: C.inp, color: C.text, padding: "4px 12px", borderRadius: 4, fontWeight: 600, border: `1px solid ${C.border}`, marginBottom: 24 }}>{t.mockMode}</div>}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, marginBottom: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}><div style={{ fontSize: 48, fontWeight: 700, color: pct >= 60 ? C.ok : C.err, lineHeight: 1, marginBottom: 8 }}>{pct}%</div><div style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>{t.accuracy}</div><div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginTop: 32, paddingTop: 24, borderTop: `1px solid ${C.border}` }}><div><div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{score}/{questions.length}</div><div style={{ fontSize: 11, color: C.muted, marginTop: 4, textTransform: "uppercase" }}>{t.score}</div></div><div><div style={{ fontSize: 20, fontWeight: 700, color: C.err }}>{questions.length - score}</div><div style={{ fontSize: 11, color: C.muted, marginTop: 4, textTransform: "uppercase" }}>{t.wrong}</div></div><div><div style={{ fontSize: 18, fontWeight: 600, color: C.text, fontFamily: "monospace" }}>{fmt(timeTaken)}</div><div style={{ fontSize: 11, color: C.muted, marginTop: 4, textTransform: "uppercase" }}>{t.timeTaken}</div></div></div></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}><button onClick={onRetry} style={{ background: C.acc, border: "none", borderRadius: 6, padding: "14px", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", width: "100%" }}>{t.retry}</button><div style={{ display: "flex", gap: 12 }}><button onClick={onMoreQuizzes} style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: "12px", color: C.text, fontWeight: 500, fontSize: 14, cursor: "pointer" }}>{t.moreQuizzes}</button><button onClick={onAnalytics} style={{ flex: 1, background: C.inp, border: `1px solid ${C.border}`, borderRadius: 6, padding: "12px", color: C.text, fontWeight: 500, fontSize: 14, cursor: "pointer" }}>{t.analytics}</button></div></div>
      </div>
      <BottomNav tab={tab} C={C} onNavigate={onTabNavigate} />
    </div>
  );
}
