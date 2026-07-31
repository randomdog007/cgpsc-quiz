import React, { useState, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import Header from "../components/layout/Header";
import BottomNav from "../components/layout/BottomNav";
import Sidebar from "../components/layout/Sidebar";
import Avatar from "../components/ui/Avatar";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import ErrorBanner from "../components/ui/ErrorBanner";
import LeaderboardView from "../components/LeaderboardView";

// ── BookmarkCard: interactive flashcard with reveal-on-demand ───────────────
function BookmarkCard({ q, qi, qText, opts, hasContent, letters, lang, t, toggleBM }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [showExp, setShowExp]   = useState(false);

  const reset = () => { setSelected(null); setRevealed(false); setShowExp(false); };

  const topicLabel = lang === "hi" && q._topicName_hi ? q._topicName_hi : q._topicName;

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      {/* Card Header */}
      <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid var(--line-2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: topicLabel ? 8 : 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.5px", textTransform: "uppercase" }}>Q{qi + 1}</span>
          <div style={{ display: "flex", gap: 8 }}>
            {revealed && <button onClick={reset} style={{ fontSize: 11, color: "var(--muted)", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>↺ Reset</button>}
            <button onClick={() => toggleBM(q)} style={{ fontSize: 11, color: "var(--crimson)", background: "none", border: "1px solid color-mix(in srgb, var(--crimson) 30%, transparent)", borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>🗑 Remove</button>
          </div>
        </div>
        {topicLabel && <span style={{ fontSize: 11, color: "var(--teal)", background: "color-mix(in srgb, var(--teal) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--teal) 20%, transparent)", borderRadius: 4, padding: "2px 8px" }}>{topicLabel}</span>}
      </div>

      {/* Question */}
      <div style={{ padding: "16px 18px" }}>
        {!hasContent ? (
          <div style={{ color: "var(--muted)", fontSize: 13, fontStyle: "italic", padding: "12px 0" }}>Question data unavailable — re-save this bookmark during a quiz.</div>
        ) : (
          <>
            <p style={{ fontSize: 15, color: "var(--ink)", lineHeight: 1.7, marginBottom: 16, fontWeight: 500 }}>{qText}</p>

            {/* Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {opts.map((opt, idx) => {
                const isCorrect = q.correct === idx;
                const isSelected = selected === idx;
                let bg = "var(--surface-2)", border = "var(--line)", color = "var(--ink)";
                let letterBg = "#e8e8e8", letterColor = "#555";
                if (revealed) {
                  if (isCorrect) { bg = "color-mix(in srgb, var(--teal) 12%, transparent)"; border = "var(--teal)"; color = "var(--teal)"; letterBg = "var(--teal)"; letterColor = "#fff"; }
                  else if (isSelected) { bg = "color-mix(in srgb, #d32f2f 10%, transparent)"; border = "#d32f2f"; color = "#d32f2f"; letterBg = "#d32f2f"; letterColor = "#fff"; }
                } else if (isSelected) {
                  bg = "color-mix(in srgb, var(--teal) 8%, transparent)"; border = "var(--teal)"; letterBg = "var(--teal)"; letterColor = "#fff";
                }
                return (
                  <div key={idx}
                    onClick={() => !revealed && setSelected(idx)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 8, background: bg, border: `1.5px solid ${border}`, cursor: revealed ? "default" : "pointer", transition: "all 0.18s" }}
                  >
                    <span style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0, background: letterBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: letterColor, transition: "all 0.18s" }}>{letters[idx]}</span>
                    <span style={{ fontSize: 14, color: color, fontWeight: isCorrect && revealed ? 600 : 400, lineHeight: 1.4, flex: 1, transition: "color 0.18s" }}>{opt}</span>
                    {revealed && isCorrect && <span style={{ fontSize: 16 }}>✅</span>}
                    {revealed && isSelected && !isCorrect && <span style={{ fontSize: 16 }}>❌</span>}
                  </div>
                );
              })}
            </div>

            {/* Action row */}
            {!revealed ? (
              <button
                onClick={() => setRevealed(true)}
                disabled={selected === null}
                style={{ width: "100%", padding: "12px", background: selected !== null ? "var(--teal)" : "var(--surface-2)", color: selected !== null ? "#fff" : "var(--muted)", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: selected !== null ? "pointer" : "not-allowed", transition: "all 0.2s" }}
              >
                {selected === null ? "Select an answer" : "Check Answer →"}
              </button>
            ) : (
              <div>
                <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 10, background: selected === q.correct ? "color-mix(in srgb, var(--teal) 10%, transparent)" : "color-mix(in srgb, #d32f2f 10%, transparent)", border: `1px solid ${selected === q.correct ? "var(--teal)" : "#d32f2f"}`, fontWeight: 700, fontSize: 14, color: selected === q.correct ? "var(--teal)" : "#d32f2f", textAlign: "center" }}>
                  {selected === q.correct ? "🎉 Correct!" : `❌ Correct answer: ${letters[q.correct]}`}
                </div>
                {(q.explanation || q.explanation_hi) && (
                  <div>
                    <button onClick={() => setShowExp(s => !s)} style={{ fontSize: 12, color: "var(--teal)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, marginBottom: 6 }}>
                      {showExp ? "▾ Hide Explanation" : "▸ Show Explanation"}
                    </button>
                    {showExp && (
                      <div style={{ background: "color-mix(in srgb, var(--teal) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--teal) 25%, transparent)", borderRadius: 8, padding: "12px 14px" }}>
                        <p style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.65, margin: 0 }}>{lang === "hi" && q.explanation_hi ? q.explanation_hi : q.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


const MainPage = React.memo(function MainPage({
  ms, css, C, t, tab, lang, dark, dataError, onClearError, onHome, onTabNavigate,
  headerProps, userAvatar, userPic, userName, profile, subjects, history, dataLoading, openSubject,
  bookmarks, bmLoading, toggleBM, signOut, toggleDark, toggleLang, user, userEmail, onAdmin, onRevision, supabase, onStartQuiz
}) {
  const getSubjectIcon = (name) => {
    const n = (name || "").toLowerCase();
    if (n.includes("history") || n.includes("itihas")) return "🏛️";
    if (n.includes("geography") || n.includes("bhugol")) return "🌍";
    if (n.includes("biology") || n.includes("jeev")) return "🧬";
    if (n.includes("physics") || n.includes("bhautiki")) return "⚛️";
    if (n.includes("chemistry") || n.includes("rasayan")) return "🧪";
    if (n.includes("science") || n.includes("vigyan")) return "🔬";
    if (n.includes("math") || n.includes("ganit")) return "📐";
    if (n.includes("aptitude") || n.includes("csat")) return "🧠";
    if (n.includes("reasoning") || n.includes("tarkshakti")) return "🧩";
    if (n.includes("polity") || n.includes("constitution") || n.includes("rajvyavastha")) return "⚖️";
    if (n.includes("panchayat") || n.includes("governance")) return "🏛️";
    if (n.includes("economy") || n.includes("arthashastra") || n.includes("economics")) return "📈";
    if (n.includes("current") || n.includes("samsamayiki")) return "📰";
    if (n.includes("environment") || n.includes("paryavaran") || n.includes("ecology")) return "🌿";
    if (n.includes("art") || n.includes("culture") || n.includes("kala") || n.includes("sanskriti")) return "🎨";
    if (n.includes("sport") || n.includes("khel")) return "🏅";
    if (n.includes("tech") || n.includes("computer") || n.includes("digital")) return "💻";
    if (n.includes("chhattisgarh") || n.includes("cg")) return "🗺️";
    if (n.includes("agriculture") || n.includes("krishi")) return "🌾";
    if (n.includes("philosophy") || n.includes("darshan")) return "🤔";
    if (n.includes("law") || n.includes("kanoon")) return "📜";
    if (n.includes("social") || n.includes("samaj")) return "👥";
    return "📚";
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    if (tab !== "home" || !supabase || !user) return;
    const fetchRank = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        const res = await fetch(`/api/user_rank?eq_user_id=${user.id}`, { headers: { Authorization: `Bearer ${session.access_token}` } });
        if (!res.ok) return;
        const rankRes = await res.json();
        if (rankRes?.data?.user) {
          setUserRank({ rank: rankRes.data.rank, total: rankRes.data.totalUsers, score: rankRes.data.user.total_score || 0 });
        }
      } catch (e) {}
    };
    fetchRank();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, user]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [revStats, setRevStats] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterPaper, setFilterPaper] = useState("All");

  useEffect(() => {
    const fetchRevStats = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        const res = await fetch("/api/user/revision/stats", {
          headers: { "Authorization": `Bearer ${session.access_token}` }
        });
        if (res.ok) setRevStats(await res.json());
      } catch (e) {}
    };
    if (tab === "home") fetchRevStats();
  }, [tab, supabase]);

  // Also re-fetch on mount so returning from RevisionPage always shows fresh count
  useEffect(() => {
    const fetchRevStats = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        const res = await fetch("/api/user/revision/stats", {
          headers: { "Authorization": `Bearer ${session.access_token}` }
        });
        if (res.ok) setRevStats(await res.json());
      } catch (e) {}
    };
    fetchRevStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    if (!searchQuery.trim() || !supabase) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const { data } = await supabase.from("quizzes").select("*").search(searchQuery).limit(20);
        setSearchResults(data || []);
      } catch (e) {
        setSearchResults([]);
      }
      setSearchLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, supabase]);

  return (
    <div style={ms} className="app-layout">
      <style>{css}</style>
      <Sidebar activeTab={tab} onNavigate={onTabNavigate} t={t} lang={lang} />
      
      <div className="main-area">
        <div className="mobile-only">
          <Header onHome={onHome} C={C} t={t} lang={lang} dark={dark} {...headerProps} />
        </div>
        <ErrorBanner msg={dataError} C={C} onClose={onClearError} />

        {/* ── HOME ── */}
        {tab === "home" && (() => {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? (lang === 'hi' ? 'सुप्रभात' : 'Good morning') : hour < 17 ? (lang === 'hi' ? 'शुभ दोपहर' : 'Good afternoon') : (lang === 'hi' ? 'शुभ संध्या' : 'Good evening');
        const dateString = new Intl.DateTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date());
        const streakCount = revStats?.streak?.current || 0;

        const daysAgo = (d) => { const x = new Date(); x.setDate(x.getDate() - d); return x.toLocaleDateString(lang==='hi'?'hi-IN':'en-IN', {weekday:'narrow'}); };

        return (
          <div className="container container--wide container--responsive" style={{ animation: "fadeUp 0.3s ease", paddingTop: 32 }}>
            
            {/* LEFT COLUMN */}
            <div>
              {/* DESKTOP INLINE HEADER & QUICK START */}
              <div className="desktop-flex" style={{ alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                  <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.5px", margin: 0 }}>
                    {greeting}, {userName}. 👋
                  </h1>
                  <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500, marginTop: 4 }}>Let's continue your success streak today!</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button onClick={() => onStartQuiz(null, true)} className="glass active-state" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 999, border: "1px solid var(--line)", background: "var(--surface)", cursor: "pointer", color: "var(--ink)", fontWeight: 700, fontSize: 13 }}>
                    <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg> Quick Start
                  </button>
                  <button onClick={onRevision} className="glass active-state" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 999, border: "1px solid color-mix(in srgb, var(--teal) 30%, transparent)", background: "color-mix(in srgb, var(--teal) 10%, transparent)", cursor: "pointer", color: "var(--teal)", fontWeight: 700, fontSize: 13 }}>
                    🧠 Revision
                  </button>
                  <div style={{ width: 1, height: 24, background: "var(--line-2)", margin: "0 4px" }} />
                  <button onClick={toggleLang} className="glass" style={{ width: 40, height: 40, borderRadius: "50%", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink)", fontWeight: 700, fontSize: 14, padding: 0 }}>{lang === "en" ? "हिं" : "EN"}</button>
                  <button onClick={toggleDark} className="glass" style={{ width: 40, height: 40, borderRadius: "50%", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink)", fontSize: 18, padding: 0 }}>{dark ? "☀️" : "🌙"}</button>
                  <Avatar url={userPic || userAvatar} size={40} />
                </div>
              </div>

              {/* MOBILE GREETING */}
              <h1 className="greet mobile-only" style={{ marginTop: 0, marginBottom: 16 }}>
                <small>{dateString}</small>
                {greeting}, {userName}. 👋
              </h1>

              {/* SEARCH BAR */}
              <div style={{ position: "relative", marginBottom: 24, zIndex: 10 }}>
                <svg style={{ position: "absolute", left: 14, top: 14, width: 16, height: 16, fill: "var(--muted)" }}><use href="#ic-search"></use></svg>
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder={t.search || "Search assessments, topics or subjects..."} 
                  className="input-clean"
                  style={{ fontSize: 14, padding: "14px 14px 14px 40px", width: "100%", borderRadius: 12, border: "1.5px solid var(--line)", background: "var(--surface)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}
                />
                {searchQuery && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 6, background: "var(--surface)", border: `1px solid var(--line)`, borderRadius: 12, padding: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>{t.searchResults || "Search Results"}</div>
                    {searchLoading ? <Spinner C={C} /> : searchResults.length === 0 ? <div style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", padding: "16px 0" }}>{t.noQuizzesFound || "No quizzes found."}</div> : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {searchResults.map(q => (
                          <div key={q.id} onClick={() => onStartQuiz(q)} className="hover-raise active-state" style={{ padding: 12, background: "var(--surface-2)", borderRadius: 8, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14 }}>{lang === "hi" && q.title_hi ? q.title_hi : q.title}</div>
                              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{q.total_questions} Qs</div>
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--blue)" }}>Start →</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* MISSION CONTROL */}
              {(() => {
                const weakestTopic = history.reduce((acc, h) => {
                  if (!acc[h.subject_id]) acc[h.subject_id] = { name: (lang === 'hi' && h.subjects?.name_hi) ? h.subjects.name_hi : h.subjects?.name, score: 0, total: 0 };
                  acc[h.subject_id].score += (h.score || 0);
                  acc[h.subject_id].total += (h.total || 0);
                  return acc;
                }, {});
                let weakest = { name: "None", acc: 100 };
                Object.values(weakestTopic).forEach(t => {
                  const acc = t.total > 0 ? (t.score / t.total) * 100 : 100;
                  if (acc < weakest.acc) weakest = { name: t.name, acc: Math.round(acc) };
                });
                
                const todayQuizzes = history.filter(h => new Date(h.created_at).toDateString() === new Date().toDateString()).length;
                const revDue = revStats?.dueToday > 0;
                let completedTasks = 0;
                if (!revDue) completedTasks++;
                if (todayQuizzes >= 2) completedTasks++;
                const missionProgress = Math.round((completedTasks / 2) * 100);

                return (
                  <>
                    <div style={{ background: "var(--surface)", borderRadius: 20, padding: 24, border: "1px solid var(--line-2)", marginBottom: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 20 }}>🎯</span> Today's Mission</h2>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>{dateString}</span>
                      </div>
                      
                      <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ flex: "1 1 200px", display: "flex", flexDirection: "column", gap: 14 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 22, height: 22, borderRadius: "50%", background: !revDue ? "var(--teal)" : "var(--surface-2)", border: !revDue ? "none" : "1.5px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12 }}>{!revDue ? "✓" : ""}</div>
                            <span style={{ fontSize: 14, fontWeight: 600, color: !revDue ? "var(--muted)" : "var(--ink)", textDecoration: !revDue ? "line-through" : "none" }}>{revDue ? `Revise ${revStats.dueToday} questions` : "Daily revision complete"}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 22, height: 22, borderRadius: "50%", background: todayQuizzes >= 2 ? "var(--teal)" : "var(--surface-2)", border: todayQuizzes >= 2 ? "none" : "1.5px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12 }}>{todayQuizzes >= 2 ? "✓" : ""}</div>
                            <span style={{ fontSize: 14, fontWeight: 600, color: todayQuizzes >= 2 ? "var(--muted)" : "var(--ink)", textDecoration: todayQuizzes >= 2 ? "line-through" : "none" }}>{todayQuizzes >= 2 ? "Quizzes solved" : `Solve 2 quizzes (${todayQuizzes}/2)`}</span>
                          </div>
                        </div>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 2 }}>Completion</div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>{missionProgress}%</div>
                          </div>
                          <div style={{ width: 70, height: 70, position: "relative" }}>
                            <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%" }}>
                              <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--line-2)" strokeWidth="3.5" />
                              <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--blue)" strokeWidth="3.5" strokeDasharray={`${missionProgress}, 100`} strokeLinecap="round" transform="rotate(-90 18 18)" style={{ transition: "stroke-dasharray 1s ease-out" }} />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONABLE HERO CARDS */}
                    <div className="grid-responsive-3" style={{ gap: 12, marginBottom: 32 }}>
                      {/* Daily Goal */}
                      <div className="hover-raise active-state" style={{ background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Daily Goal</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", marginBottom: 12 }}>{todayQuizzes}/5 <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>Quizzes</span></div>
                        </div>
                        <div style={{ height: 4, background: "var(--line-2)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ height: "100%", background: "var(--teal)", width: `${Math.min(100, (todayQuizzes / 5) * 100)}%` }} />
                        </div>
                      </div>

                      {/* Current Streak */}
                      <div className="hover-raise active-state" onClick={onRevision} style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, transparent 100%)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 16, padding: 16, cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Current Streak</div>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                            <span style={{ fontSize: 24, lineHeight: 1 }}>🔥</span>
                            <span style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>{streakCount}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>days</span>
                          </div>
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>{streakCount > 0 ? "Consistency is key" : "Start your streak today!"}</div>
                      </div>

                      {/* Weakest Topic */}
                      <div className="hover-raise active-state" style={{ background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 16, padding: 16, cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Weakest Topic</div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--crimson)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 4 }}>{weakest.name !== "None" ? weakest.name : "Keep Practicing"}</div>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "var(--blue)" }}>Practice →</div>
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Continue Rail */}
              {history.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "1px" }}>Continue Learning</div>
                    <div className="active-state" style={{ fontSize: 12, fontWeight: 700, color: "var(--blue)", cursor: "pointer" }} onClick={() => onTabNavigate("history")}>View All →</div>
                  </div>
                  <div className="rail" style={{ paddingBottom: 8 }}>
                    {history.slice(0,4).map((h, i) => {
                      const acc = h.accuracy || 0;
                      const status = acc < 60 ? "Needs Revision 🔴" : "On Track 🟢";
                      const estTime = Math.max(1, Math.round((h.total || 10) * 0.8)) + " min";
                      return (
                        <div key={i} className="hover-raise active-state" onClick={() => onStartQuiz({id: h.quiz_id, title: h.quiz_title}, true)} style={{ cursor: "pointer", minWidth: 240, padding: 16, border: "1px solid var(--line-2)", background: "var(--surface)", borderRadius: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "70%" }}>{lang === 'hi' && h.subjects?.name_hi ? h.subjects.name_hi : (h.subjects?.name || "Subject")}</div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: acc < 60 ? "var(--crimson)" : "var(--teal)" }}>{status}</div>
                          </div>
                          
                          <div style={{ fontSize: 15, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--ink)" }}>{lang === 'hi' && h.quizzes?.title_hi ? h.quizzes.title_hi : (h.quizzes?.title || "Quiz")}</div>
                          
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>⏱ {estTime}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--blue)" }}>Continue →</span>
                          </div>
                          
                          <div style={{ marginTop: 4 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 600, color: "var(--muted)", marginBottom: 4 }}>
                              <span>Score: {h.score}/{h.total}</span>
                              <span>{acc}%</span>
                            </div>
                            <div style={{ height: 4, background: "var(--line-2)", borderRadius: 2 }}>
                              <div style={{ height: "100%", background: acc < 60 ? "var(--crimson)" : "var(--teal)", width: `${acc}%`, borderRadius: 2 }}></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Analytics Overview Grid */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "1px" }}>Your Stats</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))", gap: 12 }}>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 16, padding: 12, textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>{history.length}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Qs Solved</div>
                  </div>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 16, padding: 12, textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>{history.length > 0 ? Math.round(history.reduce((a,b)=>a+(b.accuracy||0),0)/history.length) : 0}%</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Avg Acc</div>
                  </div>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 16, padding: 12, textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>{revStats?.mastered || 0}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Mastered</div>
                  </div>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 16, padding: 12, textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>{streakCount}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Top Streak</div>
                  </div>
                </div>
              </div>


              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingBottom: 12 }}>
                {["All", "Indian GS", "Chhattisgarh GS", "Current Affairs", "CSAT", "Other"].map(p => (
                  <button
                    key={p}
                    onClick={() => setFilterPaper(p)}
                    className="active-state"
                    style={{
                      padding: "6px 12px",
                      borderRadius: 16,
                      fontSize: 11,
                      fontWeight: 700,
                      border: `1.5px solid ${filterPaper === p ? "var(--teal)" : "var(--line)"}`,
                      background: filterPaper === p ? "var(--teal)" : "var(--surface)",
                      color: filterPaper === p ? "#fff" : "var(--muted)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      whiteSpace: "nowrap",
                      lineHeight: 1.2,
                    }}
                  >
                    {lang === 'hi' ? (p === 'Indian GS' ? 'भारतीय सा. अध्ययन' : p === 'Chhattisgarh GS' ? 'छत्तीसगढ़ सा. अध्ययन' : p === 'Current Affairs' ? 'समसामयिकी' : p === 'Other' ? 'अन्य' : p === 'All' ? 'सभी' : p) : p}
                  </button>
                ))}
              </div>



              {/* Subject Grid */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <h2 style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px" }}>{t.subjects || "Subjects"}</h2>
              </div>
              
              {dataLoading ? <Spinner C={C} /> : subjects.length === 0 ? (
                <EmptyState icon="📚" title={t.noSubjects} desc={t.noSubjectsDesc} C={C} />
              ) : (() => {
                const groups = subjects.reduce((acc, sub) => {
                  const paper = sub.paper || "Other";
                  if (filterPaper === "All" && paper === "CSAT") return acc;
                  if (filterPaper !== "All" && paper !== filterPaper) return acc;
                  if (!acc[paper]) acc[paper] = [];
                  acc[paper].push(sub);
                  return acc;
                }, {});
                const order = ["Indian GS", "Chhattisgarh GS", "Current Affairs", "CSAT", "Other"];
                const sortedPapers = Object.keys(groups).sort((a, b) => {
                  const idxA = order.indexOf(a); const idxB = order.indexOf(b);
                  if (idxA === -1 && idxB === -1) return a.localeCompare(b);
                  if (idxA === -1) return 1; if (idxB === -1) return -1;
                  return idxA - idxB;
                });
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 32 }}>
                    {sortedPapers.map(paper => (
                      <div key={paper}>
                        <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 12 }}>
                          {lang === 'hi' ? (paper === 'Indian GS' ? 'भारतीय सामान्य अध्ययन' : paper === 'Chhattisgarh GS' ? 'छत्तीसगढ़ सामान्य अध्ययन' : paper === 'Current Affairs' ? 'समसामयिकी' : paper === 'Other' ? 'अन्य' : paper) : paper}
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {groups[paper].map((sub) => {
                            const subHistory = history.filter(h => String(h.subject_id) === String(sub.id));
                            const accAvg = subHistory.length > 0 ? Math.round(subHistory.reduce((s, h) => s + (h.accuracy || 0), 0) / subHistory.length) : 0;
                            return (
                              <div key={sub.id} className="hover-raise active-state" onClick={() => openSubject(sub)} style={{ cursor: "pointer", background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 12, padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
                                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "color-mix(in srgb, var(--teal) 10%, transparent)", color: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                                  {getSubjectIcon(sub.name)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lang === "hi" && sub.name_hi ? sub.name_hi : sub.name}</div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: accAvg > 0 ? "var(--teal)" : "var(--muted)" }}>{accAvg > 0 ? `${accAvg}%` : "0%"}</div>
                                  </div>
                                  <div style={{ height: 6, background: "var(--line-2)", borderRadius: 3, overflow: "hidden" }}>
                                    <div style={{ height: "100%", background: accAvg > 0 ? "var(--teal)" : "transparent", width: `${accAvg}%`, borderRadius: 3, transition: "width 1s ease-out" }} />
                                  </div>
                                </div>
                                <div style={{ color: "var(--blue)", fontWeight: 800, fontSize: 14 }}>→</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>


          </div>
        );

      })()}

      {/* ── ANALYTICS ── */}
      {tab === "analytics" && (() => {
        const totalTests   = history.length;
        const avgAccuracy  = totalTests > 0 ? Math.round(history.reduce((s, a) => s + (a.accuracy ?? 0), 0) / totalTests) : 0;
        const bestScore    = totalTests > 0 ? Math.max(...history.map(a => a.accuracy ?? 0)) : 0;
        const totalQ       = history.reduce((s, a) => s + (a.total ?? 0), 0);
        const totalCorrect = history.reduce((s, a) => s + (a.score ?? 0), 0);
        const subjectMap   = {};
        history.forEach(a => {
          const name = (lang === "hi" && a.subjects?.name_hi) ? a.subjects.name_hi : (a.subjects?.name || "Unknown");
          if (!subjectMap[name]) subjectMap[name] = { attempts: 0, correct: 0, total: 0 };
          subjectMap[name].attempts++;
          subjectMap[name].correct += (a.score ?? 0);
          subjectMap[name].total   += (a.total  ?? 0);
        });
        const subjectRows = Object.entries(subjectMap)
          .map(([name, d]) => ({ name, attempts: d.attempts, acc: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0 }))
          .sort((a, b) => b.acc - a.acc);
        const recent  = [...history].slice(0, 8);
        const fmt     = (s) => s != null ? `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}` : "—";
        const dateStr = (iso) => { try { return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" }); } catch { return ""; } };
        return (
          <div className="container--responsive" style={{ padding: "20px 16px", animation: "fadeUp 0.3s ease" }}>
            
            {/* Level & XP Banner */}
            {profile && (
              <div style={{ background: `linear-gradient(135deg, ${"var(--surface)"}, ${"var(--surface-2)"})`, border: `1px solid ${"var(--line)"}`, borderRadius: 12, padding: "16px", marginBottom: 20, boxShadow: "var(--shadow)", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--blue)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, boxShadow: `0 4px 8px ${"var(--blue)"}66` }}>
                  {Math.floor((profile.total_score || 0) / 100) + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 2 }}>
                    {(profile.total_score || 0) < 100 
                      ? (lang === 'hi' ? "उम्मीदवार" : "Aspirant") 
                      : (profile.total_score || 0) < 500 
                        ? (lang === 'hi' ? "विद्वान" : "Scholar") 
                        : (lang === 'hi' ? "अधिकारी" : "Officer")} {t.rank || "Rank"}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 4 }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>{profile.total_score || 0} <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>XP</span></span>
                    <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{t.nextLevel || "Next Level:"} {((Math.floor((profile.total_score || 0) / 100) + 1) * 100)} XP</span>
                  </div>
                  <div style={{ height: 4, background: "var(--line)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${((profile.total_score || 0) % 100)}%`, height: "100%", background: "var(--blue)", borderRadius: 2 }} />
                  </div>
                </div>
              </div>
            )}

            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", marginBottom: 16, letterSpacing: "-0.5px" }}>{t.performanceOverview}</h2>
            {history.length === 0 ? <EmptyState icon="📊" title={t.noHistory} desc={t.noHistoryDesc} C={C} /> : (() => {
              const trendData = [...history].reverse().map((a, i) => ({
                name: `T${i + 1}`,
                accuracy: a.accuracy ?? (a.total > 0 ? Math.round((a.score / a.total) * 100) : 0),
                score: a.score || 0,
                date: new Date(a.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              }));

              const categoryData = subjectRows.filter(s => s.attempts >= 1).map(s => ({
                name: s.name.length > 15 ? s.name.substring(0, 15) + '...' : s.name,
                accuracy: s.acc
              }));
              
              const totalTimeSpent = history.reduce((sum, a) => sum + (a.time_taken || 0), 0);
              const totalMins = Math.floor(totalTimeSpent / 60);
              
              return (
              <>
              <div className="grid-responsive-2" style={{ marginBottom: 20 }}>
                {[
                  ["📝", totalTests, t.quizzesText || "Quizzes", "var(--blue)"],
                  ["🎯", avgAccuracy + "%", t.overallAcc || "Overall Acc.", avgAccuracy >= 60 ? "var(--teal)" : "var(--crimson)"],
                  ["🔥", profile?.current_streak || 0, t.dayStreak || "Day Streak", "#f97316"],
                  ["👑", profile?.best_streak || 0, t.bestStreak || "Best Streak", "#fbbf24"],
                  ["⏱️", `${totalMins}m`, t.timeSpent || "Time Spent", "#8b5cf6"],
                  ["🏆", Math.max(...history.map(h => h.score || 0), 0), t.bestScore || "Best Score", "var(--teal)"]
                ].map(([icon, val, lbl, clr]) => (
                  <div key={lbl} style={{ background: "var(--surface)", border: `1px solid ${"var(--line)"}`, borderRadius: 10, padding: "12px 10px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 6 }}>
                    <div style={{ fontSize: 20 }}>{icon}</div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: clr, lineHeight: 1 }}>{val}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{lbl}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Trend Chart */}
              {trendData.length > 1 && (
                <div style={{ background: "var(--surface)", border: `1px solid ${"var(--line)"}`, borderRadius: 10, padding: 16, marginBottom: 20 }}>
                  <h3 style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>{t.accuracyTrend || "Accuracy Trend"}</h3>
                  <div style={{ height: 160, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData.slice(-10)} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={"var(--line)"} vertical={false} />
                        <XAxis dataKey="date" stroke={"var(--muted)"} fontSize={9} tickLine={false} axisLine={false} />
                        <YAxis stroke={"var(--muted)"} fontSize={9} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <Tooltip contentStyle={{ background: "var(--surface)", border: `1px solid ${"var(--line)"}`, borderRadius: 8, fontSize: 11, color: "var(--ink)" }} />
                        <Line type="monotone" dataKey="accuracy" stroke={"var(--blue)"} strokeWidth={3} dot={{ r: 3, fill: "var(--blue)", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Category Breakdown */}
              {categoryData.length > 0 && (
                <div style={{ background: "var(--surface)", border: `1px solid ${"var(--line)"}`, borderRadius: 10, padding: 16, marginBottom: 20 }}>
                  <h3 style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>{t.categoryBreakdown || "Category Breakdown"}</h3>
                  <div style={{ height: Math.max(160, categoryData.length * 32), width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={"var(--line)"} horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} stroke={"var(--muted)"} fontSize={9} tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="name" stroke={"var(--ink)"} fontSize={10} tickLine={false} axisLine={false} width={80} />
                        <Tooltip cursor={{ fill: `${"var(--line)"}55` }} contentStyle={{ background: "var(--surface)", border: `1px solid ${"var(--line)"}`, borderRadius: 8, fontSize: 11, color: "var(--ink)" }} />
                        <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.accuracy >= 60 ? "var(--teal)" : (entry.accuracy >= 40 ? "var(--blue)" : "var(--crimson)")} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div style={{ background: "var(--surface)", border: `1px solid ${"var(--line)"}`, borderRadius: 10, padding: 16 }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>{t.recentAttempts || "Recent Activity"}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {recent.map((a, i) => {
                    const quizTitle = (lang === "hi" && a.quizzes?.title_hi) ? a.quizzes.title_hi : (a.quizzes?.title || "Quiz");
                    const topicTitle = (lang === "hi" && a.topics?.name_hi) ? a.topics.name_hi : (a.topics?.name || "");
                    const title = topicTitle ? `${topicTitle} • ${quizTitle}` : quizTitle;
                    const acc   = a.accuracy ?? (a.total > 0 ? Math.round((a.score / a.total) * 100) : 0);
                    return (
                      <div key={a.id ?? i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < recent.length - 1 ? `1px solid ${"var(--line)"}` : "none" }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: acc >= 60 ? `${"var(--teal)"}15` : `${"var(--crimson)"}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{acc >= 60 ? "✅" : "📌"}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
                          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>{dateStr(a.created_at)} · {a.score ?? 0}/{a.total ?? 0} correct · ⏱ {fmt(a.time_taken)}</div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: acc >= 60 ? "var(--teal)" : "var(--crimson)" }}>{acc}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>);
            })()}
          </div>
        );
      })()}

      {/* ── SAVED QUESTIONS — subject-grouped, session-only ── */}
      {tab === "bookmarks" && (() => {
        // Group by subject
        const grouped = {};
        bookmarks.forEach(q => {
          const key   = String(q._subjectId ?? "unknown");
          const label = (lang === "hi" && q._subjectName_hi) ? q._subjectName_hi : (q._subjectName || (lang === "hi" ? "अन्य" : "Other"));
          if (!grouped[key]) grouped[key] = { label, questions: [] };
          grouped[key].questions.push(q);
        });
        const groups = Object.values(grouped);
        const letters = ["A", "B", "C", "D"];

        return (
          <div className="container--responsive" style={{ padding: "20px 16px", animation: "fadeUp 0.3s ease" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.5px", marginBottom: 2 }}>📌 {t.savedQuestions || "Saved Questions"}</h2>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>Practice your bookmarked questions anytime</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--teal)", background: "color-mix(in srgb, var(--teal) 12%, transparent)", padding: "4px 12px", borderRadius: 20, border: "1px solid color-mix(in srgb, var(--teal) 25%, transparent)" }}>{bookmarks.length} saved</span>
            </div>

            {bmLoading ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>⏳ Loading saved questions...</div>
            ) : bookmarks.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", background: "var(--surface)", borderRadius: 12, border: "1px dashed var(--line)" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🔖</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", marginBottom: 4 }}>{t.noBookmarks || "No saved questions"}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{t.noBookmarksDesc || "Bookmark questions during a quiz for revision"}</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {groups.map(({ label, questions }) => (
                  <div key={label}>
                    {/* Subject header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, paddingBottom: 8, borderBottom: "2px solid color-mix(in srgb, var(--blue) 30%, transparent)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--blue)" }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--blue)", textTransform: "uppercase", letterSpacing: "1px" }}>{label}</span>
                      </div>
                      <span style={{ fontSize: 10, color: "var(--muted)", background: "var(--surface)", padding: "2px 8px", borderRadius: 8, border: "1px solid var(--line)" }}>
                        {questions.length} {questions.length !== 1 ? (t.questions || "questions") : (t.question || "question")}
                      </span>
                    </div>

                    {/* Question Cards */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {questions.map((q, qi) => {
                        const qText = lang === "hi" && q.question_hi ? q.question_hi : q.question;
                        const opts  = lang === "hi" && q.options_hi  ? q.options_hi  : q.options;
                        const hasContent = qText && opts && opts.length > 0;

                        return (
                          <BookmarkCard
                            key={q.id ?? qi}
                            q={q} qi={qi} qText={qText} opts={opts} hasContent={hasContent}
                            letters={letters} lang={lang} t={t} toggleBM={toggleBM}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* ── LEADERBOARD ── */}
      {tab === "leaderboard" && (
        <LeaderboardView C={C} user={user} />
      )}

      {/* ── PROFILE ── */}
      {tab === "profile" && (
        <div style={{ padding: "20px 16px", animation: "fadeUp 0.3s ease", width: "100%", maxWidth: 600, boxSizing: "border-box", margin: "0 auto" }}>
          <div style={{ background: "var(--surface)", border: `1px solid ${"var(--line)"}`, borderRadius: 12, padding: 24, marginBottom: 12, textAlign: "center" }}>
            <Avatar ini={userAvatar} size={70} pic={userPic} color={"var(--blue)"} borderColor={"var(--line)"} />
            <div style={{ fontWeight: 700, fontSize: 18, color: "var(--ink)", letterSpacing: "-0.5px", marginTop: 10 }}>{userName}</div>
            <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>{userEmail}</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={toggleDark} style={{ flex: 1, background: "var(--surface)", border: `1px solid ${"var(--line)"}`, color: "var(--ink)", borderRadius: 8, padding: "12px", cursor: "pointer" }}>{dark ? (t.disableDark || "Disable Dark") : (t.enableDark || "Enable Dark")}</button>
            <button onClick={toggleLang} style={{ flex: 1, background: "var(--surface)", border: `1px solid ${"var(--line)"}`, color: "var(--ink)", borderRadius: 8, padding: "12px", cursor: "pointer" }}>{lang === "en" ? "Hindi" : "English"}</button>
          </div>
          {(userEmail === 'randomdog007@gmail.com' || userEmail === 'preview@cgpsc.com' || userEmail?.includes('admin')) && (
            <button onClick={onAdmin} style={{ width: "100%", marginTop: 10, background: "var(--blue)", border: `none`, color: "#fff", borderRadius: 8, padding: "12px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>{t.adminPanel || "Admin Panel"}</button>
          )}
          <button onClick={signOut} style={{ width: "100%", marginTop: 10, background: "var(--surface)", border: `1px solid ${"var(--crimson)"}44`, color: "var(--crimson)", borderRadius: 8, padding: "12px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>{t.signOut || "Sign Out"}</button>
        </div>
      )}
      
      {/* ── HISTORY ── */}
      {tab === "history" && (
        <div className="container--responsive" style={{ padding: "20px 16px", animation: "fadeUp 0.3s ease" }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, color: "var(--ink)" }}>Recent History</h1>
          {history?.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", background: "var(--surface)", borderRadius: 12, border: "1px dashed var(--line)", color: "var(--muted)" }}>
              No history found yet. Start taking quizzes!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {history?.slice(0, 50).map((h, i) => (
                <div key={i} onClick={() => onStartQuiz({id: h.quiz_id, title: h.quiz_title}, true)} style={{ cursor: "pointer", padding: 14, background: "var(--surface)", borderRadius: 12, border: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{lang === "hi" && h.quizzes?.title_hi ? h.quizzes.title_hi : (h.quizzes?.title || "Unknown Quiz")}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                      Score: {h.score} | Accuracy: {h.accuracy}% | Attempted: {h.total_attempted}
                    </div>
                  </div>
                  <div style={{ padding: "4px 10px", background: h.accuracy >= 60 ? "color-mix(in srgb, var(--teal) 15%, transparent)" : "color-mix(in srgb, var(--amber) 15%, transparent)", color: h.accuracy >= 60 ? "var(--teal)" : "var(--amber)", borderRadius: 8, fontWeight: 700, fontSize: 11 }}>
                    {h.accuracy}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── QUIZZES ── */}
      {tab === "quizzes" && (
        <div className="container--responsive" style={{ padding: "20px 16px", animation: "fadeUp 0.3s ease" }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, color: "var(--ink)" }}>Browse Quizzes</h1>
          <p style={{ color: "var(--muted)", marginBottom: 20, fontSize: 13 }}>Select a category to view all available quizzes and modules.</p>
          <div className="subjgrid">
            {subjects?.map(sub => (
              <div key={sub.id} onClick={() => openSubject(sub)} style={{ cursor: "pointer", background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }} className="hover-raise">
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "color-mix(in srgb, var(--teal) 12%, transparent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18, lineHeight: 1 }}>
                  {getSubjectIcon(sub.name)}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{lang === "hi" && sub.name_hi ? sub.name_hi : sub.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* ── FALLBACK ── */}
      {!["home", "analytics", "bookmarks", "leaderboard", "profile", "history", "quizzes"].includes(tab) && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--muted)" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🚧</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", marginBottom: 8 }}>Coming Soon</h2>
          <p>We are still building the {tab} section.</p>
        </div>
      )}
      
      </div> {/* END MAIN AREA */}
      <BottomNav tab={tab} C={C} onNavigate={onTabNavigate} profile={profile} />
    </div>
  );
});

export default MainPage;