import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import Header from "../components/layout/Header";
import BottomNav from "../components/layout/BottomNav";
import Avatar from "../components/ui/Avatar";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import ErrorBanner from "../components/ui/ErrorBanner";
import LeaderboardView from "../components/LeaderboardView";

export default function MainPage({
  ms, css, C, t, tab, lang, dark, dataError, onClearError, onHome, onTabNavigate,
  headerProps, userAvatar, userPic, userName, profile, subjects, history, dataLoading, openSubject,
  bookmarks, bmLoading, toggleBM, signOut, toggleDark, toggleLang, user, userEmail, onAdmin, onRevision, supabase, onStartQuiz
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [revStats, setRevStats] = useState(null);

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
    <div style={ms}>
      <style>{css}</style>
      <Header onHome={onHome} C={C} t={t} lang={lang} dark={dark} {...headerProps} />
      <ErrorBanner msg={dataError} C={C} onClose={onClearError} />

      {/* ── HOME ── */}
      {tab === "home" && (
        <div style={{ animation: "fadeUp 0.3s ease" }}>
          <div style={{ padding: "40px 16px 24px", borderBottom: `1px solid ${C.border}`, background: C.bg }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, maxWidth: 800, margin: "0 auto" }}>
              <Avatar ini={userAvatar} size={56} pic={userPic} color={C.acc} borderColor={C.border} />
              <div>
                <div style={{ fontSize: 13, color: C.muted, fontWeight: 500, letterSpacing: "0.2px", marginBottom: 2 }}>Welcome back</div>
                <div style={{ fontWeight: 700, fontSize: 22, color: C.text, letterSpacing: "-0.5px" }}>{userName}</div>
              </div>
            </div>
          </div>
          <div style={{ padding: "32px 16px", maxWidth: 800, margin: "0 auto" }}>

            {/* ── Daily Revision Badge ── */}
            {revStats && revStats.dueToday > 0 && (
              <div onClick={onRevision} style={{ background: `linear-gradient(135deg, ${C.acc}, #3b82f6)`, borderRadius: 16, padding: "20px 24px", marginBottom: 32, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: `0 8px 24px ${C.acc}44`, color: "#fff", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = "translateY(-4px)"} onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 24 }}>📝</span>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>Today's Revision</h3>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, opacity: 0.9 }}>
                    You have {revStats.dueToday} question{revStats.dueToday > 1 ? 's' : ''} due for review.
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 12, padding: "10px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>Streak</span>
                  <span style={{ fontSize: 20, fontWeight: 800 }}>🔥 {revStats.streak?.current || 0}</span>
                </div>
              </div>
            )}
            {revStats && revStats.dueToday === 0 && (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "16px 20px", marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 24 }}>🎉</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>All caught up!</div>
                    <div style={{ fontSize: 12, color: C.muted }}>No revisions due today.</div>
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.ok, background: `${C.ok}15`, padding: "6px 12px", borderRadius: 8 }}>
                  🔥 Streak: {revStats.streak?.current || 0}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 32 }}>
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Search Quiz..." 
                className="input-clean"
                style={{ marginBottom: 20, fontSize: 15, padding: "16px 20px" }}
              />
              
              {searchQuery && (
                <div style={{ marginBottom: 28, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, boxShadow: C.shadow, animation: "fadeUp 0.2s ease" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>Search Results</div>
                  {searchLoading ? <Spinner C={C} /> : searchResults.length === 0 ? <div style={{ fontSize: 14, color: C.muted, textAlign: "center", padding: "20px 0" }}>No quizzes found.</div> : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {searchResults.map(q => (
                        <div key={q.id} onClick={() => onStartQuiz(q)} style={{ padding: 14, background: C.inp, borderRadius: 8, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.2s" }} onMouseOver={e => {e.currentTarget.style.background = C.border}} onMouseOut={e => {e.currentTarget.style.background = C.inp}}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 15, color: C.text }}>{lang === "hi" && q.title_hi ? q.title_hi : q.title}</div>
                            <div style={{ fontSize: 12, color: C.muted, marginTop: 6, fontWeight: 500 }}>{q.total_questions} Questions • {q.time_limit_mins} Mins</div>
                          </div>
                          <div style={{ color: C.text, fontSize: 12, fontWeight: 600, background: C.card, padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}` }}>Start →</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <h2 style={{ fontSize: 13, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "1px" }}>{t.chooseSubject}</h2>
            </div>
            {dataLoading ? <Spinner C={C} fallbackText={t.loading} /> : subjects.length === 0 ? (
              <EmptyState icon="📚" title={t.noSubjects} desc={t.noSubjectsDesc} C={C} />
            ) : (() => {
              const groups = subjects.reduce((acc, sub) => {
                const paper = sub.paper || "Other";
                if (!acc[paper]) acc[paper] = [];
                acc[paper].push(sub);
                return acc;
              }, {});
              const order = ["Indian GS", "Chhattisgarh GS", "Current Affairs", "CSAT", "Other"];
              const sortedPapers = Object.keys(groups).sort((a, b) => {
                const idxA = order.indexOf(a);
                const idxB = order.indexOf(b);
                if (idxA === -1 && idxB === -1) return a.localeCompare(b);
                if (idxA === -1) return 1;
                if (idxB === -1) return -1;
                return idxA - idxB;
              });
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                  {sortedPapers.map(paper => (
                    <div key={paper}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>{paper}</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>
                        {groups[paper].map((sub) => (
                          <div key={sub.id} className="card-h" onClick={() => openSubject(sub)}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.inp}, ${C.card})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 12, border: `1px solid ${C.border}`, boxShadow: `0 2px 6px rgba(0,0,0,0.04)` }}>{sub.icon || "📖"}</div>
                            <div style={{ fontWeight: 600, fontSize: 15, color: C.text, lineHeight: 1.3, letterSpacing: "-0.2px" }}>{lang === "hi" && sub.name_hi ? sub.name_hi : sub.name}</div>
                            <div style={{ fontSize: 12, color: C.acc, fontWeight: 700, marginTop: 10 }}>Explore →</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

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
          <div style={{ padding: "24px 16px", animation: "fadeUp 0.3s ease", maxWidth: 800, margin: "0 auto" }}>
            
            {/* Level & XP Banner */}
            {profile && (
              <div style={{ background: `linear-gradient(135deg, ${C.card}, ${C.inp})`, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px", marginBottom: 24, boxShadow: C.shadow, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.acc, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, boxShadow: `0 4px 12px ${C.acc}66` }}>
                  {Math.floor((profile.total_score || 0) / 100) + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>
                    {(profile.total_score || 0) < 100 ? "Aspirant" : (profile.total_score || 0) < 500 ? "Scholar" : "Officer"} Rank
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 6 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: C.text, lineHeight: 1 }}>{profile.total_score || 0} <span style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>XP</span></span>
                    <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Next Level: {((Math.floor((profile.total_score || 0) / 100) + 1) * 100)} XP</span>
                  </div>
                  <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${((profile.total_score || 0) % 100)}%`, height: "100%", background: C.acc, borderRadius: 3 }} />
                  </div>
                </div>
              </div>
            )}

            <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 20, letterSpacing: "-0.5px" }}>{t.performanceOverview}</h2>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 24 }}>
                {[
                  ["📝", totalTests, "Quizzes", C.acc],
                  ["🎯", avgAccuracy + "%", "Overall Acc.", avgAccuracy >= 60 ? C.ok : C.err],
                  ["🔥", profile?.current_streak || 0, "Day Streak", "#f97316"],
                  ["👑", profile?.best_streak || 0, "Best Streak", "#fbbf24"],
                  ["⏱️", `${totalMins}m`, "Time Spent", "#8b5cf6"],
                  ["🏆", Math.max(...history.map(h => h.score || 0), 0), "Best Score", C.ok]
                ].map(([icon, val, lbl, clr]) => (
                  <div key={lbl} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 12px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8 }}>
                    <div style={{ fontSize: 24 }}>{icon}</div>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: clr, lineHeight: 1 }}>{val}</div>
                      <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{lbl}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Trend Chart */}
              {trendData.length > 1 && (
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 24 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 16 }}>Accuracy Trend</h3>
                  <div style={{ height: 200, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData.slice(-10)} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                        <XAxis dataKey="date" stroke={C.muted} fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke={C.muted} fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.text }} />
                        <Line type="monotone" dataKey="accuracy" stroke={C.acc} strokeWidth={3} dot={{ r: 4, fill: C.acc, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Category Breakdown */}
              {categoryData.length > 0 && (
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 24 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 16 }}>Category Breakdown</h3>
                  <div style={{ height: Math.max(200, categoryData.length * 40), width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} stroke={C.muted} fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="name" stroke={C.text} fontSize={11} tickLine={false} axisLine={false} width={80} />
                        <Tooltip cursor={{ fill: `${C.border}55` }} contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.text }} />
                        <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.accuracy >= 60 ? C.ok : (entry.accuracy >= 40 ? C.acc : C.err)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 16 }}>Recent Activity</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {recent.map((a, i) => {
                    const quizTitle = (lang === "hi" && a.quizzes?.title_hi) ? a.quizzes.title_hi : (a.quizzes?.title || "Quiz");
                    const topicTitle = (lang === "hi" && a.topics?.name_hi) ? a.topics.name_hi : (a.topics?.name || "");
                    const title = topicTitle ? `${topicTitle} • ${quizTitle}` : quizTitle;
                    const acc   = a.accuracy ?? (a.total > 0 ? Math.round((a.score / a.total) * 100) : 0);
                    return (
                      <div key={a.id ?? i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < recent.length - 1 ? `1px solid ${C.border}` : "none" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: acc >= 60 ? `${C.ok}15` : `${C.err}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{acc >= 60 ? "✅" : "📌"}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
                          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{dateStr(a.created_at)} · {a.score ?? 0}/{a.total ?? 0} correct · ⏱ {fmt(a.time_taken)}</div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: acc >= 60 ? C.ok : C.err }}>{acc}%</div>
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
          const label = (lang === "hi" && q._subjectName_hi) ? q._subjectName_hi : (q._subjectName || "Other");
          if (!grouped[key]) grouped[key] = { label, questions: [] };
          grouped[key].questions.push(q);
        });
        const groups = Object.values(grouped);
        const letters = ["A", "B", "C", "D"];

        return (
          <div style={{ padding: "24px 16px", animation: "fadeUp 0.3s ease", maxWidth: 800, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: "-0.5px" }}>{t.savedQuestions}</h2>
              <span style={{ fontSize: 12, color: C.muted, background: C.card, padding: "4px 10px", borderRadius: 12, border: `1px solid ${C.border}` }}>{bookmarks.length} saved</span>
            </div>

            {/* Sync indicator */}
            <div style={{ background: `${C.ok}0D`, border: `1px solid ${C.ok}30`, borderRadius: 8, padding: "10px 14px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 15 }}>{bmLoading ? "⏳" : "☁️"}</span>
              <span style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{bmLoading ? "Loading saved questions…" : "Saved questions sync to your account and are available across devices."}</span>
            </div>

            {bookmarks.length === 0 ? (
              <EmptyState icon="🔖" title={t.noBookmarks} desc={t.noBookmarksDesc} C={C} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                {groups.map(({ label, questions }) => (
                  <div key={label}>
                    {/* Subject header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, paddingBottom: 10, borderBottom: `2px solid ${C.acc}40` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.acc, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.acc, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</span>
                      </div>
                      <span style={{ fontSize: 11, color: C.muted, background: C.inp, padding: "3px 10px", borderRadius: 10, border: `1px solid ${C.border}` }}>
                        {questions.length} question{questions.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Questions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {questions.map((q, qi) => {
                        const qText = lang === "hi" && q.question_hi ? q.question_hi : q.question;
                        const opts  = lang === "hi" && q.options_hi  ? q.options_hi  : q.options;
                        return (
                          <div key={q.id ?? qi} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>

                            {/* Topic badge */}
                            {q._topicName && (
                              <div style={{ marginBottom: 10 }}>
                                <span style={{ fontSize: 11, color: C.muted, background: C.inp, border: `1px solid ${C.border}`, borderRadius: 4, padding: "2px 8px" }}>
                                  {lang === "hi" && q._topicName_hi ? q._topicName_hi : q._topicName}
                                </span>
                              </div>
                            )}

                            {/* Question */}
                            <p style={{ fontSize: 14, color: C.text, lineHeight: 1.65, marginBottom: 14, fontWeight: 500 }}>{qText}</p>

                            {/* Options with correct answer highlighted */}
                            {opts && (
                              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                                {opts.map((opt, idx) => {
                                  const isCorrect = q.correct === idx;
                                  return (
                                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 6, background: isCorrect ? `${C.ok}12` : C.inp, border: `1px solid ${isCorrect ? C.ok : C.border}`, transition: "all 0.15s" }}>
                                      <span style={{ width: 22, height: 22, borderRadius: 4, flexShrink: 0, background: isCorrect ? C.ok : C.card, border: `1px solid ${isCorrect ? C.ok : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: isCorrect ? "#fff" : C.muted }}>
                                        {letters[idx]}
                                      </span>
                                      <span style={{ fontSize: 13, color: isCorrect ? C.ok : C.text, fontWeight: isCorrect ? 600 : 400, lineHeight: 1.4, flex: 1 }}>{opt}</span>
                                      {isCorrect && <span style={{ fontSize: 13, flexShrink: 0 }}>✓</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Explanation */}
                            {(q.explanation || q.explanation_hi) && (
                              <div style={{ background: `${C.ok}0D`, border: `1px solid ${C.ok}30`, borderRadius: 6, padding: "10px 12px", marginBottom: 14 }}>
                                <div style={{ fontSize: 10, color: C.ok, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 5 }}>Explanation</div>
                                <p style={{ fontSize: 12, color: C.text, lineHeight: 1.65, margin: 0 }}>
                                  {lang === "hi" && q.explanation_hi ? q.explanation_hi : q.explanation}
                                </p>
                              </div>
                            )}

                            <button
                              onClick={() => toggleBM(q)}
                              style={{ background: "none", border: `1px solid ${C.err}44`, color: C.err, borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                            >
                              Remove
                            </button>
                          </div>
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
        <div style={{ padding: "24px 16px", animation: "fadeUp 0.3s ease", maxWidth: 600, margin: "0 auto" }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 28, marginBottom: 16, textAlign: "center" }}>
            <Avatar ini={userAvatar} size={80} pic={userPic} color={C.acc} borderColor={C.border} />
            <div style={{ fontWeight: 700, fontSize: 20, color: C.text, letterSpacing: "-0.5px", marginTop: 12 }}>{userName}</div>
            <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>{userEmail}</div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={toggleDark} style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, color: C.text, borderRadius: 8, padding: "14px", cursor: "pointer" }}>{dark ? "Disable Dark" : "Enable Dark"}</button>
            <button onClick={toggleLang} style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, color: C.text, borderRadius: 8, padding: "14px", cursor: "pointer" }}>{lang === "en" ? "Hindi" : "English"}</button>
          </div>
          {(userEmail === 'randomdog007@gmail.com' || userEmail === 'preview@cgpsc.com' || userEmail?.includes('admin')) && (
            <button onClick={onAdmin} style={{ width: "100%", marginTop: 12, background: C.acc, border: `none`, color: "#fff", borderRadius: 8, padding: "14px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Admin Panel</button>
          )}
          <button onClick={signOut} style={{ width: "100%", marginTop: 12, background: C.card, border: `1px solid ${C.err}44`, color: C.err, borderRadius: 8, padding: "14px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Sign Out</button>
        </div>
      )}

      <BottomNav tab={tab} C={C} onNavigate={onTabNavigate} />
    </div>
  );
}