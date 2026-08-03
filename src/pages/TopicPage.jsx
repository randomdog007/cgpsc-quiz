import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import Header from "../components/layout/Header";
import BottomNav from "../components/layout/BottomNav";
import Sidebar from "../components/layout/Sidebar";
import Avatar from "../components/ui/Avatar";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import ErrorBanner from "../components/ui/ErrorBanner";

export default function TopicPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, setLang, dark, setDark, t, topics, quizzes: allQuizzes, profile, dataLoading, dataError, history } = useAppContext();
  
  const selectedTopic = topics.find(topic => String(topic.id) === String(id));
  const quizzes = allQuizzes.filter(q => String(q.topic_id) === String(id));
  
  const [search, setSearch] = useState("");
  const [mockMode, setMockMode] = useState(true);
  
  const filteredQuizzes = quizzes.filter(q => (
    search === "" || 
    (q.title && q.title.toLowerCase().includes(search.toLowerCase())) || 
    (q.title_hi && q.title_hi.includes(search))
  ));
  
  const toggleLang = () => setLang(l => l === "en" ? "hi" : "en");
  const toggleDark = () => setDark(d => !d);
  const headerProps = { toggleLang, toggleDark, lang, dark };
  
  const onBack = () => navigate(-1);
  const onHome = () => navigate("/");
  const onTabNavigate = () => navigate("/");
  const onStartQuiz = (q) => navigate(`/quiz/${q.id}`);
  const onClearError = () => {};
  const unfinishedQuizId = null;

  const C = dark
    ? { bg:"#000000", card:"#0a0a0a", border:"#222222", text:"#ededed", muted:"#888888", hdr:"rgba(0,0,0,0.75)", acc:"#3388FF", acc2:"#1c66d8", ok:"#14b8a6", err:"#ef4444", inp:"#111111", shadow:"0 4px 12px rgba(255,255,255,0.03)" }
    : { bg:"#fafafa", card:"#ffffff", border:"#eaeaea", text:"#111111", muted:"#666666", hdr:"rgba(255,255,255,0.85)", acc:"#0055FF", acc2:"#0044CC", ok:"#059669", err:"#e11d48", inp:"#f5f5f5", shadow:"0 2px 8px rgba(0,0,0,0.04)" };

  const ms  = { minHeight:"100vh", background: C.bg, color: C.text, paddingBottom: 80 };
  const css = ``;
  const topicName = lang === "hi" && selectedTopic?.name_hi ? selectedTopic.name_hi : selectedTopic?.name;
  
  // Calculate stats
  const totalQuizzes = quizzes.length;
  const attemptedQuizzes = quizzes.filter(q => history?.find(h => String(h.quiz_id) === String(q.id)));
  const completedCount = attemptedQuizzes.length;
  const progressPct = totalQuizzes > 0 ? Math.round((completedCount / totalQuizzes) * 100) : 0;
  
  const accuracies = attemptedQuizzes.map(q => history.find(h => String(h.quiz_id) === String(q.id))?.accuracy || 0);
  const avgAccuracy = accuracies.length > 0 ? Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length) : 0;
  


  return (
    <div style={ms} className="app-layout">
      <style>{css}</style>
      <Sidebar activeTab="subjects" onNavigate={onTabNavigate} t={t} lang={lang} />
      
      <div className="main-area">
        <div className="mobile-only">
          <Header back onBack={onBack} onHome={onHome} C={C} t={t} lang={lang} titleOverride={topicName} {...headerProps} />
        </div>
        <ErrorBanner msg={dataError} C={C} onClose={onClearError} />

        <div className="container container--wide" style={{ animation: "fadeUp 0.3s var(--ease)", paddingTop: 32, paddingBottom: 100 }}>
          
          {/* DESKTOP TOP HEADER */}
          <div className="desktop-flex" style={{ alignItems: "center", justifyContent: "space-between", marginBottom: 24, display: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={onBack} className="glass" style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--line-2)", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink)", padding: 0 }}>
                <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)" }}>
                <span style={{ cursor: "pointer" }} onClick={() => onTabNavigate("home")}>Subjects</span> 
                <span style={{ margin: "0 8px" }}>›</span>
                <span style={{ color: "var(--ink)" }}>{topicName}</span>
              </div>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => window.open('https://t.me/cgpscquiz', '_blank')} className="glass" style={{ width: 44, height: 44, borderRadius: "50%", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink)", padding: 0 }}>
                <svg style={{ width: 22, height: 22, fill: "currentColor" }} viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.33-.01-.98-.19-1.46-.35-.59-.19-1.05-.29-1.01-.61.02-.17.29-.36.81-.57 3.17-1.38 5.28-2.29 6.33-2.73 3-.1.26-1.5.46-1.5.38 0 .18.06.32.18.42.14.1.33.27.32.73z"/></svg>
              </button>
              <button onClick={toggleLang} className="glass" style={{ width: 44, height: 44, borderRadius: "50%", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink)", fontWeight: 700, fontSize: 16, padding: 0 }}>{lang === "en" ? "हिं" : "EN"}</button>
              <button onClick={toggleDark} className="glass" style={{ width: 44, height: 44, borderRadius: "50%", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink)", fontSize: 20, padding: 0 }}>{dark ? "☀️" : "🌙"}</button>
              <Avatar url={profile?.pic || profile?.avatar} size={44} />
            </div>
          </div>

          {/* DESKTOP HERO */}
          <div className="desktop-flex" style={{ display: "none", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
            
            <div style={{ display: "flex", gap: 24, flex: 1, paddingRight: 40 }}>
              <div style={{ width: 100, height: 100, borderRadius: "50%", background: "color-mix(in srgb, var(--teal) 15%, transparent)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--teal)", flexShrink: 0 }}>
                <svg style={{ width: 50, height: 50 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8h14"/><path d="M7 8v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V8"/><path d="M12 2v2"/><path d="M9.5 4h5a1.5 1.5 0 0 1 1.5 1.5v.5H8v-.5A1.5 1.5 0 0 1 9.5 4z"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--teal)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Topic Overview</div>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.5px", margin: "0 0 12px 0", lineHeight: 1.2 }}>{topicName}</h1>
                <div style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.5 }}>
                  {lang === "hi" 
                    ? (selectedTopic?.description_hi || `इस विषय (${topicName}) के अंतर्गत सभी महत्वपूर्ण प्रश्नोत्तरी और मॉड्यूल देखें। अपनी तैयारी का परीक्षण करें।`)
                    : (selectedTopic?.description || `Explore key questions, concepts, and detailed modules for ${topicName}.`)}
                </div>
              </div>
            </div>

            {/* Progress Card */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 16, padding: 24, display: "flex", width: 340, boxShadow: "0 4px 12px rgba(0,0,0,0.03)", flexShrink: 0 }}>
              <div style={{ position: "relative", width: 80, height: 80, marginRight: 20 }}>
                <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%" }}>
                  <circle cx="18" cy="18" r="16" fill="none" stroke="var(--line-2)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="var(--teal)" strokeWidth="3" strokeDasharray={`${progressPct}, 100`} strokeLinecap="round" transform="rotate(-90 18 18)" />
                </svg>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "var(--teal)" }}>
                  {progressPct}%
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--teal)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>Your Progress</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{completedCount} / {totalQuizzes} quizzes completed</div>
              </div>
            </div>

          </div>

          <h1 className="greet mobile-only" style={{ marginBottom: 20, marginTop: 0 }}>
            <small>{t.topicOverview || "Topic Overview"}</small>
            {topicName}
          </h1>

          {/* 4-Column Stats Row */}
          <div className="desktop-flex" style={{ display: "none", gap: 16, marginBottom: 32 }}>
            
            <div style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 16, padding: "20px", display: "flex", alignItems: "flex-start", gap: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
               <div style={{ width: 44, height: 44, borderRadius: 12, background: "color-mix(in srgb, var(--teal) 10%, transparent)", color: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                 <svg style={{ width: 22, height: 22 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
               </div>
               <div>
                 <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Total Quizzes</div>
                 <div style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", margin: "4px 0" }}>{totalQuizzes}</div>
                 <div style={{ fontSize: 12, color: "var(--muted)" }}>Across all modules</div>
               </div>
            </div>

            <div style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 16, padding: "20px", display: "flex", alignItems: "flex-start", gap: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
               <div style={{ width: 44, height: 44, borderRadius: 12, background: "color-mix(in srgb, var(--teal) 10%, transparent)", color: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                 <svg style={{ width: 22, height: 22 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
               </div>
               <div>
                 <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Completed</div>
                 <div style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", margin: "4px 0" }}>{completedCount}</div>
                 <div style={{ fontSize: 12, color: "var(--muted)" }}>Keep it up!</div>
               </div>
            </div>

            <div style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 16, padding: "20px", display: "flex", alignItems: "flex-start", gap: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
               <div style={{ width: 44, height: 44, borderRadius: 12, background: "color-mix(in srgb, var(--teal) 10%, transparent)", color: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                 <svg style={{ width: 22, height: 22 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
               </div>
               <div>
                 <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Average Accuracy</div>
                 <div style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", margin: "4px 0" }}>{avgAccuracy}%</div>
                 <div style={{ fontSize: 12, color: "var(--muted)" }}>Great progress!</div>
               </div>
            </div>



          </div>
          
          {/* Search & Exam Mode Row */}
          <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
            
            {/* Styled Search Bar */}
            <div style={{ flex: 1, minWidth: 260, position: "relative" }}>
              <svg style={{ position: "absolute", left: 16, top: 18, width: 20, height: 20, color: "var(--muted)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input 
                value={search} onChange={(e) => setSearch(e.target.value)} 
                placeholder={t.search || "Search quizzes in this topic..."} 
                className="input-clean" 
                style={{ width: "100%", padding: "16px 16px 16px 48px", marginBottom: 0, borderRadius: 12, fontSize: 15 }} 
              />
            </div>
            
            {/* Desktop compact mode switch */}
            <div 
              onClick={() => setMockMode(!mockMode)}
              style={{ background: "var(--surface)", border: `1px solid var(--line-2)`, borderRadius: 12, padding: "12px 20px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer", transition: "all 0.2s", height: 56, flexShrink: 0 }}
            >
              <div style={{ width: 32, height: 32, background: mockMode ? "color-mix(in srgb, var(--crimson) 15%, transparent)" : "var(--line-2)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, color: mockMode ? "var(--crimson)" : "var(--muted)", transition: "all 0.3s" }}>
                {mockMode ? "⏱️" : "📖"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
                  {t.mockMode || "Exam Mode"}
                  
                  {/* iOS Style Toggle */}
                  <div style={{ width: 36, height: 20, background: mockMode ? "var(--teal)" : "var(--line-2)", borderRadius: 10, position: "relative", transition: "all 0.3s", marginLeft: 16 }}>
                    <div style={{ width: 16, height: 16, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, left: mockMode ? 18 : 2, transition: "all 0.3s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
                  </div>

                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                  {mockMode ? "Strict timer, no answers." : "Instant answers shown."}
                </div>
              </div>
            </div>

          </div>

          {dataLoading ? <Spinner C={C} fallbackText={t.loading} /> : quizzes.length === 0 ? <EmptyState icon="📄" title={t.noQuizzes} desc={t.noQuizzesDesc} C={C} /> : filteredQuizzes.length === 0 ? <EmptyState icon="🔍" title="No matches" desc={t.filterNoMatch} C={C} /> : 
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filteredQuizzes.map((q, idx) => {
              const hist = history?.find(h => String(h.quiz_id) === String(q.id));
              const isUnf = String(unfinishedQuizId) === String(q.id);
              const name = lang === "hi" && q.name_hi ? q.name_hi : (q.name || q.title || "Quiz");
              
              // Unlock all quizzes as requested by user
              const isLocked = false;
              
              const accuracy = hist?.accuracy || 0;
              const attempted = hist?.total_attempted || 0;
              const totalQ = q.total_questions || 10;
              const progressRatio = attempted / totalQ;
              
              return (
                <div key={q.id} onClick={() => onStartQuiz(q)} style={{ 
                  display: "flex", alignItems: "center", padding: "16px 20px", background: "var(--surface)", 
                  borderRadius: 16, border: "1px solid var(--line-2)", 
                  opacity: isLocked ? 0.6 : 1, transition: "all 0.2s", cursor: "pointer"
                }} className="topic-module-row">
                  
                  {/* Left Graphic - Just number */}
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "color-mix(in srgb, var(--teal) 10%, transparent)", color: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, flexShrink: 0 }}>
                    {idx + 1}
                  </div>
                  
                  {/* Content */}
                  <div style={{ marginLeft: 16, flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", marginBottom: 8, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span>{name}</span>
                      {isUnf && <span style={{ background: "color-mix(in srgb, var(--teal) 15%, transparent)", color: "var(--teal)", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>In Progress</span>}
                      {!hist && !isUnf && !isLocked && <span style={{ background: "color-mix(in srgb, var(--crimson) 15%, transparent)", color: "var(--crimson)", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>New</span>}
                      {isLocked && <span style={{ background: "var(--line-2)", color: "var(--muted)", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>Locked</span>}
                    </div>
                    
                    {/* Meta Row */}
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12, fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {q.time_limit_mins ? `${q.time_limit_mins} min` : "No limit"}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        {totalQ} Qs
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                        {hist ? `${accuracy}% Accuracy` : "-- Accuracy"}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Actions Desktop */}
                  <div className="desktop-flex" style={{ display: "none", alignItems: "center", gap: 40, width: 340, flexShrink: 0, justifyContent: "flex-end", paddingLeft: 24, borderLeft: "1px solid var(--line-2)" }}>
                    
                    {isLocked ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--muted)", fontSize: 13, fontWeight: 600, paddingRight: 16 }}>
                        <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        Complete previous<br/>topic to unlock
                      </div>
                    ) : (
                      <>
                        {/* Linear Progress */}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)", marginBottom: 6 }}>{hist ? accuracy : 0}%</div>
                          <div style={{ height: 6, background: "var(--line-2)", borderRadius: 3, marginBottom: 8, overflow: "hidden" }}>
                            <div style={{ width: `${progressRatio * 100}%`, height: "100%", background: "var(--teal)", borderRadius: 3 }} />
                          </div>
                          <div style={{ fontSize: 11, color: "var(--muted)" }}>{attempted} / {totalQ} attempted</div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 120 }}>
                          {isUnf ? (
                            <>
                              <button onClick={() => onStartQuiz(q)} className="btn-primary" style={{ background: "color-mix(in srgb, var(--teal) 15%, transparent)", color: "var(--teal)", padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, border: "none" }}>Continue ›</button>
                              <button onClick={() => onStartQuiz(q)} className="btn-secondary" style={{ background: "transparent", color: "var(--teal)", border: "1px solid color-mix(in srgb, var(--teal) 30%, transparent)", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                                <svg style={{ width: 12, height: 12 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                                Restart
                              </button>
                            </>
                          ) : hist ? (
                            <>
                              <button onClick={() => onStartQuiz(q)} className="btn-primary" style={{ background: "color-mix(in srgb, var(--teal) 15%, transparent)", color: "var(--teal)", padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, border: "none" }}>Review ›</button>
                              <button onClick={() => onStartQuiz(q)} className="btn-secondary" style={{ background: "transparent", color: "var(--teal)", border: "1px solid color-mix(in srgb, var(--teal) 30%, transparent)", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                                <svg style={{ width: 12, height: 12 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                                Retake
                              </button>
                            </>
                          ) : (
                            <button onClick={() => onStartQuiz(q)} className="btn-primary" style={{ background: "var(--teal)", color: "#fff", padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, border: "none" }}>Start Quiz ›</button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Mobile Simple Arrow */}
                  <div className="mobile-only" style={{ marginLeft: 16, color: "var(--muted)" }}>
                    <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </div>

                </div>
              );
            })}
          </div>
          }
        </div>
      </div>
      <BottomNav tab={tab} onNavigate={onTabNavigate} profile={profile} />
    </div>
  );
}
