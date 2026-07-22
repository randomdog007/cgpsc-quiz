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
      <div style={{ padding: "32px 16px 80px", animation: "fadeUp 0.3s ease", maxWidth: 720, margin: "0 auto" }}>
        <div style={{ background: `linear-gradient(135deg, ${C.card}, ${C.inp})`, border: `1px solid ${C.border}`, borderRadius: 16, padding: "32px 24px", marginBottom: 32, boxShadow: C.shadow }}>
          <div style={{ fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginBottom: 8 }}>Subject Module</div>
          <div style={{ fontWeight: 700, fontSize: 26, color: C.text, letterSpacing: "-0.5px", marginBottom: 6 }}>{lang === "hi" && selectedSubject?.name_hi ? selectedSubject.name_hi : selectedSubject?.name}</div>
        </div>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 16, textTransform: "uppercase", letterSpacing: "1px" }}>{t.chooseTopic}</h2>
        {dataLoading ? <Spinner C={C} fallbackText={t.loading} /> : topics.length === 0 ? <EmptyState icon="Folder" title={t.noTopics} desc={`${t.noTopicsDesc} ${selectedSubject?.id}`} C={C} /> : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{topics.map((topic, idx) => <div key={topic.id} className="card-h" onClick={() => onOpenTopic(topic)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}><div style={{ display: "flex", alignItems: "center", gap: 16 }}><div style={{ width: 40, height: 40, borderRadius: 8, background: C.inp, color: C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, border: `1px solid ${C.border}`, boxShadow: `inset 0 1px 2px rgba(0,0,0,0.03)` }}>{String(idx + 1).padStart(2, "0")}</div><div><div style={{ fontWeight: 600, fontSize: 16, color: C.text, letterSpacing: "-0.2px" }}>{lang === "hi" && topic.name_hi ? topic.name_hi : topic.name}</div></div></div><span style={{ color: C.acc, fontSize: 18, fontWeight: 700 }}>→</span></div>)}</div>}
      </div>
      <BottomNav tab={tab} C={C} onNavigate={onTabNavigate} />
    </div>
  );
}