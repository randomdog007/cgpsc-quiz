import React from "react";
import Header from "../components/layout/Header";
import BottomNav from "../components/layout/BottomNav";
import Sidebar from "../components/layout/Sidebar";
import Avatar from "../components/ui/Avatar";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import ErrorBanner from "../components/ui/ErrorBanner";

export default function SubjectPage(props) {
  const { 
    ms, css, C, t, topics, selectedSubject, dataLoading, dataError, 
    onClearError, onBack, onOpenTopic, onHome, onTabNavigate, tab, 
    headerProps, lang, profile, history 
  } = props;
  
  const { toggleLang, toggleDark, dark } = headerProps || {};
  
  // Calculate Progress
  const totalTopics = topics.length || 1; // avoid /0
  let completedTopics = 0;
  topics.forEach(topic => {
    const topicHistory = history?.filter(h => String(h.topic_id) === String(topic.id)) || [];
    const accAvg = topicHistory.length > 0 ? Math.round(topicHistory.reduce((s, h) => s + (h.accuracy || 0), 0) / topicHistory.length) : 0;
    if (accAvg > 0) completedTopics++;
  });
  const progressPercent = Math.round((completedTopics / totalTopics) * 100) || 0;

  const subjectName = lang === "hi" && selectedSubject?.name_hi ? selectedSubject.name_hi : selectedSubject?.name;

  return (
    <div style={ms} className="app-layout">
      <style>{css}</style>
      <Sidebar activeTab="home" onNavigate={onTabNavigate} t={t} lang={lang} />
      
      <div className="main-area">
        <div className="mobile-only">
          <Header back onBack={onBack} onHome={onHome} C={C} t={t} lang={lang} {...headerProps} />
        </div>
        <ErrorBanner msg={dataError} C={C} onClose={onClearError} />

        <div className="container container--wide" style={{ animation: "fadeUp 0.3s var(--ease)", paddingTop: 32, paddingBottom: 100 }}>
          
          {/* DESKTOP TOP HEADER */}
          <div className="desktop-flex" style={{ alignItems: "center", justifyContent: "space-between", marginBottom: 32, display: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={onBack} className="glass" style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink)", padding: 0 }}>
                <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)" }}>
                <span style={{ cursor: "pointer" }} onClick={() => onTabNavigate("home")}>Subjects</span> 
                <span style={{ margin: "0 8px" }}>›</span>
                <span style={{ color: "var(--ink)" }}>{subjectName}</span>
              </div>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => window.open('https://t.me/cgpscquiz', '_blank')} className="glass" style={{ width: 36, height: 36, borderRadius: "50%", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink)", padding: 0 }}>
                <svg style={{ width: 18, height: 18, fill: "currentColor" }} viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.33-.01-.98-.19-1.46-.35-.59-.19-1.05-.29-1.01-.61.02-.17.29-.36.81-.57 3.17-1.38 5.28-2.29 6.33-2.73 3-.1.26-1.5.46-1.5.38 0 .18.06.32.18.42.14.1.33.27.32.73z"/></svg>
              </button>
              <button onClick={toggleLang} className="glass" style={{ width: 36, height: 36, borderRadius: "50%", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink)", fontWeight: 700, fontSize: 13, padding: 0 }}>{lang === "en" ? "हिं" : "EN"}</button>
              <button onClick={toggleDark} className="glass" style={{ width: 36, height: 36, borderRadius: "50%", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink)", fontSize: 16, padding: 0 }}>{dark ? "☀️" : "🌙"}</button>
              <Avatar url={profile?.pic || profile?.avatar} size={36} />
            </div>
          </div>

          {/* MOBILE HERO (Legacy) */}
          <h1 className="greet mobile-only" style={{ marginBottom: 32, marginTop: 0 }}>
            <small>{t.subjectModule || "Subject Module"}</small>
            {subjectName}
          </h1>

          {/* DESKTOP HERO */}
          <div className="desktop-flex" style={{ display: "none", alignItems: "center", justifyContent: "space-between", marginBottom: 40, borderBottom: "1px solid var(--line-2)", paddingBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--line-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--teal)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                <svg style={{ width: 32, height: 32 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <div>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--ink)", letterSpacing: "-1px", margin: 0 }}>{subjectName}</h1>
                <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>Master the concepts of {subjectName}</div>
              </div>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ padding: "16px 24px", borderRadius: 16, border: "1px solid var(--line-2)", background: "var(--surface)", minWidth: 240, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Your Progress</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--teal)", marginBottom: 8 }}>{progressPercent}%</div>
                <div style={{ height: 6, background: "var(--line-2)", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ height: "100%", background: "var(--teal)", width: `${progressPercent}%` }}></div>
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{completedTopics} / {totalTopics} modules completed</div>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--line-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--teal)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
              </div>
            </div>
          </div>
          
          <h2 className="mobile-only" style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "1px" }}>{t.chooseTopic}</h2>
          
          {dataLoading ? <Spinner C={C} fallbackText={t.loading} /> : topics.length === 0 ? <EmptyState icon="Folder" title={t.noTopics} desc={`${t.noTopicsDesc} ${selectedSubject?.id}`} C={C} /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {topics.map((topic, idx) => {
                const topicHistory = history?.filter(h => String(h.topic_id) === String(topic.id)) || [];
                const accAvg = topicHistory.length > 0 ? Math.round(topicHistory.reduce((s, h) => s + (h.accuracy || 0), 0) / topicHistory.length) : 0;
                
                return (
                  <div key={topic.id} onClick={() => onOpenTopic(topic)} style={{ 
                    display: "flex", alignItems: "center", padding: "16px 20px", background: "var(--surface)", 
                    borderRadius: 12, border: "1px solid var(--line-2)", cursor: "pointer", transition: "all 0.2s"
                  }} className="topic-module-row hover-raise">
                    
                    {/* Number Box */}
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(46, 122, 82, 0.1)", color: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                    
                    {/* Content */}
                    <div style={{ marginLeft: 20, flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
                        {lang === "hi" && topic.name_hi ? topic.name_hi : topic.name}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--muted)" }}>
                        {lang === "hi" ? "इस विषय के अंतर्गत सभी महत्वपूर्ण प्रश्न" : "Explore key questions and concepts for this topic"}
                      </div>
                    </div>
                    
                    {/* Status / Pill */}
                    <div className="desktop-flex" style={{ display: "none", alignItems: "center", gap: 16 }}>
                      {accAvg > 0 ? (
                         <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(46, 122, 82, 0.1)", color: "var(--teal)", padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                           <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                           {accAvg}%
                         </div>
                      ) : (
                         <div style={{ background: "rgba(46, 122, 82, 0.1)", color: "var(--teal)", padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                           1 Quiz
                         </div>
                      )}
                      
                      <div style={{ color: "var(--muted)" }}>
                         <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                      </div>
                    </div>
                    
                    {/* Mobile Arrow */}
                    <div className="mobile-only" style={{ marginLeft: 16, color: "var(--muted)" }}>
                      <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <BottomNav tab={tab} onNavigate={onTabNavigate} profile={profile} />
    </div>
  );
}
