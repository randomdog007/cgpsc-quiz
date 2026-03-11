import Header from "../components/layout/Header";
import BottomNav from "../components/layout/BottomNav";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import ErrorBanner from "../components/ui/ErrorBanner";

export default function TopicPage(props) {
  const { ms, css, C, t, selectedTopic, dataLoading, dataError, onClearError, onBack, onHome, onTabNavigate, tab, headerProps, lang, search, setSearch, diff, setDiff, prevYear, setPrevYear, mockMode, setMockMode, quizzes, filteredQuizzes, diffClr, onStartQuiz } = props;
  return (
    <div style={ms}>
      <style>{css}</style>
      <Header back onBack={onBack} onHome={onHome} C={C} t={t} lang={lang} {...headerProps} />
      <ErrorBanner msg={dataError} C={C} onClose={onClearError} />
      <div style={{ padding: "20px 16px", animation: "fadeUp 0.3s ease", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}><div style={{ fontSize: 11, color: C.acc, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginBottom: 4 }}>Topic Overview</div><div style={{ fontWeight: 700, fontSize: 20, color: C.text, letterSpacing: "-0.5px" }}>{lang === "hi" && selectedTopic?.name_hi ? selectedTopic.name_hi : selectedTopic?.name}</div></div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.search} style={{ flex: 1, minWidth: 140, background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 12px", color: C.text, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
          {["All", "Easy", "Medium", "Hard"].map((d) => <button key={d} onClick={() => setDiff(d)} style={{ background: diff === d ? C.acc : C.card, border: `1px solid ${diff === d ? C.acc : C.border}`, color: diff === d ? "#fff" : C.text, borderRadius: 6, padding: "8px 12px", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>{d === "All" ? t.allDifficulty : d}</button>)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, background: C.card, padding: 12, borderRadius: 8, border: `1px solid ${C.border}` }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}><input type="checkbox" checked={prevYear} onChange={(e) => setPrevYear(e.target.checked)} /><span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{t.previousYear}</span></label>
          <div style={{ width: 1, height: 20, background: C.border }} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}><input type="checkbox" checked={mockMode} onChange={(e) => setMockMode(e.target.checked)} /><span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{t.mockMode}</span></label>
        </div>
        {dataLoading ? <Spinner C={C} fallbackText={t.loading} /> : quizzes.length === 0 ? <EmptyState icon="Paper" title={t.noQuizzes} desc={`${t.noQuizzesDesc} ${selectedTopic?.id}`} C={C} /> : filteredQuizzes.length === 0 ? <EmptyState icon="Search" title={t.filterNoMatch} desc="Adjust your filters to see more results" C={C} /> : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{filteredQuizzes.map((quiz) => <div key={quiz.id} className="card-h" onClick={() => onStartQuiz(quiz)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, boxShadow: "0 6px 16px rgba(15,23,42,0.04)" }}><div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}><div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 15, color: C.text, marginBottom: 4 }}>{lang === "hi" && quiz.title_hi ? quiz.title_hi : quiz.title}</div>{(lang === "hi" && quiz.description_hi ? quiz.description_hi : quiz.description) && <div style={{ fontSize: 12, color: C.muted, marginBottom: 8, lineHeight: 1.4 }}>{lang === "hi" && quiz.description_hi ? quiz.description_hi : quiz.description}</div>}<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><span style={{ fontSize: 11, color: C.muted, background: C.inp, padding: "2px 8px", borderRadius: 4, border: `1px solid ${C.border}` }}>{quiz.total_questions || 20} Qs</span><span style={{ fontSize: 11, color: diffClr(quiz.difficulty), background: `${diffClr(quiz.difficulty)}15`, padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>{quiz.difficulty || "Medium"}</span>{quiz.is_previous_year && <span style={{ fontSize: 11, color: "#0ea5e9", background: "#0ea5e915", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>PYQ</span>}</div></div><button style={{ background: C.acc, color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer", flexShrink: 0 }}>{t.startQuiz}</button></div></div>)}</div>}
      </div>
      <BottomNav tab={tab} C={C} onNavigate={onTabNavigate} />
    </div>
  );
}