import Header from "../components/layout/Header";
import BottomNav from "../components/layout/BottomNav";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import ErrorBanner from "../components/ui/ErrorBanner";

export default function SubjectPage(props) {
  const { ms, css, C, t, topics, selectedSubject, dataLoading, dataError, onClearError, onBack, onOpenTopic, onHome, onTabNavigate, tab, headerProps, lang } = props;
  return (
    <div style={ms}>
      <style>{css}</style>
      <Header back onBack={onBack} onHome={onHome} C={C} t={t} lang={lang} {...headerProps} />
      <ErrorBanner msg={dataError} C={C} onClose={onClearError} />
      <div style={{ padding: "20px 16px", animation: "fadeUp 0.3s ease", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginBottom: 4 }}>Subject Module</div>
          <div style={{ fontWeight: 700, fontSize: 22, color: C.text, letterSpacing: "-0.5px", marginBottom: 6 }}>{lang === "hi" && selectedSubject?.name_hi ? selectedSubject.name_hi : selectedSubject?.name}</div>
        </div>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.chooseTopic}</h2>
        {dataLoading ? <Spinner C={C} fallbackText={t.loading} /> : topics.length === 0 ? <EmptyState icon="Folder" title={t.noTopics} desc={`${t.noTopicsDesc} ${selectedSubject?.id}`} C={C} /> : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{topics.map((topic, idx) => <div key={topic.id} className="card-h" onClick={() => onOpenTopic(topic)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}><div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}><div style={{ width: 32, height: 32, borderRadius: 6, background: C.inp, color: C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, border: `1px solid ${C.border}` }}>{String(idx + 1).padStart(2, "0")}</div><div><div style={{ fontWeight: 600, fontSize: 15, color: C.text }}>{lang === "hi" && topic.name_hi ? topic.name_hi : topic.name}</div></div></div><span style={{ color: C.muted, fontSize: 18 }}>→</span></div>)}</div>}
      </div>
      <BottomNav tab={tab} C={C} onNavigate={onTabNavigate} />
    </div>
  );
}