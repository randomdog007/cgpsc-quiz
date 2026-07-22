import Header from "../components/layout/Header";
import BottomNav from "../components/layout/BottomNav";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import ErrorBanner from "../components/ui/ErrorBanner";

export default function TopicPage(props) {
  const {
    ms, css, C, t, selectedTopic, dataLoading, dataError, onClearError,
    onBack, onHome, headerProps, quizzes, filteredQuizzes, search, setSearch,
    mockMode, setMockMode, onStartQuiz, lang, tab, onTabNavigate, history, unfinishedQuizId
  } = props;
  return (
    <div style={ms}>
      <style>{css}</style>
      <Header back onBack={onBack} onHome={onHome} C={C} t={t} lang={lang} {...headerProps} />
      <ErrorBanner msg={dataError} C={C} onClose={onClearError} />
      <div style={{ padding: "32px 16px 80px", animation: "fadeUp 0.3s ease", maxWidth: 720, margin: "0 auto" }}>
        <div style={{ background: `linear-gradient(135deg, ${C.card}, ${C.inp})`, border: `1px solid ${C.border}`, borderRadius: 16, padding: "24px 20px", marginBottom: 24, boxShadow: C.shadow }}>
          <div style={{ fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginBottom: 8 }}>Topic Overview</div>
          <div style={{ fontWeight: 700, fontSize: 26, color: C.text, letterSpacing: "-0.5px" }}>{lang === "hi" && selectedTopic?.name_hi ? selectedTopic.name_hi : selectedTopic?.name}</div>
        </div>
        
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.search} className="input-clean" style={{ flex: 1, minWidth: 140, marginBottom: 0 }} />
        </div>
        
        {/* Prominent Exam Mode Banner */}
        <div 
          onClick={() => setMockMode(!mockMode)}
          style={{ background: mockMode ? `${C.err}15` : C.card, border: `1px solid ${mockMode ? C.err : C.border}`, borderRadius: 16, padding: "20px", marginBottom: 32, display: "flex", alignItems: "flex-start", gap: 16, cursor: "pointer", transition: "all 0.3s", boxShadow: mockMode ? `0 4px 16px ${C.err}33` : C.shadow }}
        >
          <div style={{ fontSize: 24, background: mockMode ? C.err : C.inp, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, flexShrink: 0, color: mockMode ? "#fff" : C.muted, transition: "all 0.3s" }}>
            {mockMode ? "⏱️" : "📖"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: mockMode ? C.err : C.text }}>Exam Mode</div>
              <div style={{ width: 44, height: 24, background: mockMode ? C.err : C.inp, borderRadius: 12, position: "relative", transition: "all 0.3s" }}>
                <div style={{ width: 20, height: 20, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, left: mockMode ? 22 : 2, transition: "all 0.3s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
              </div>
            </div>
            <div style={{ fontSize: 13, color: mockMode ? C.err : C.muted, lineHeight: 1.5, opacity: 0.9 }}>
              {mockMode ? "Strict timer, no instant answers. Mimics real exam conditions. Recommended for practice." : "Instant answers and explanations shown immediately. Good for casual learning."}
            </div>
          </div>
        </div>

        {dataLoading ? <Spinner C={C} fallbackText={t.loading} /> : quizzes.length === 0 ? <EmptyState icon="📄" title={t.noQuizzes} desc={t.noQuizzesDesc} C={C} /> : filteredQuizzes.length === 0 ? <EmptyState icon="🔍" title="No matches" desc={t.filterNoMatch} C={C} /> : 
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredQuizzes.map((q) => {
            // Find if user attempted this quiz
            const prevAttempt = history?.find(h => h.quiz_id === q.id);
            const accuracy = prevAttempt ? (prevAttempt.accuracy ?? (prevAttempt.total > 0 ? Math.round((prevAttempt.score / prevAttempt.total) * 100) : 0)) : null;

            return (
            <div key={q.id} className="card-h" onClick={() => onStartQuiz(q)} style={{ background: C.card, border: `1px solid ${prevAttempt ? C.acc + '66' : C.border}`, borderRadius: 16, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 16, color: C.text, marginBottom: 8, letterSpacing: "-0.2px" }}>
                  {lang === "hi" && q.title_hi ? q.title_hi : q.title}
                </div>
                {(lang === "hi" && q.description_hi ? q.description_hi : q.description) && (
                  <div style={{ fontSize: 13, color: C.muted, marginBottom: 12, lineHeight: 1.4 }}>
                    {lang === "hi" && q.description_hi ? q.description_hi : q.description}
                  </div>
                )}
                <div style={{ fontSize: 12, color: C.muted, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}>⏱️ {q.time_limit_mins}m</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}>📝 {q.total_questions} Qs</span>
                  {prevAttempt && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: accuracy >= 60 ? C.ok : C.err, fontWeight: 700, background: accuracy >= 60 ? `${C.ok}15` : `${C.err}15`, padding: "2px 8px", borderRadius: 6 }}>
                      {accuracy}% {t.score}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {unfinishedQuizId === q.id ? (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); onStartQuiz(q, false); }} className="btn-secondary" style={{ padding: "8px 12px", border: `1px solid ${C.err}88`, color: C.err, background: `${C.err}11`, fontSize: 13, fontWeight: 600 }}>
                      Restart
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onStartQuiz(q, true); }} className="btn-primary" style={{ padding: "8px 12px", background: C.acc, color: "#fff", border: "none", boxShadow: C.shadow, fontSize: 13, fontWeight: 600, borderRadius: 8 }}>
                      Resume
                    </button>
                  </>
                ) : (
                  <button className="btn-primary" style={{ padding: "10px 16px", background: prevAttempt ? C.card : C.acc, color: prevAttempt ? C.acc : "#fff", border: prevAttempt ? `1px solid ${C.acc}` : "none", boxShadow: prevAttempt ? "none" : C.shadow }}>
                    {prevAttempt ? "Retake" : t.startQuiz}
                  </button>
                )}
              </div>
            </div>
            );
          })}
        </div>
        }
      </div>
      <BottomNav tab={tab} C={C} onNavigate={onTabNavigate} />
    </div>
  );
}