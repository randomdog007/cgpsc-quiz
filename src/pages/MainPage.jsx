import Header from "../components/layout/Header";
import BottomNav from "../components/layout/BottomNav";
import Avatar from "../components/ui/Avatar";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import ErrorBanner from "../components/ui/ErrorBanner";

export default function MainPage(props) {
  const { ms, css, C, t, tab, lang, dark, dataError, onClearError, onHome, onTabNavigate, headerProps, userAvatar, userPic, userName, profile, subjects, history, dataLoading, openSubject, fetchLeaderboard, lbLoading, leaderboard, bookmarks, toggleBM, signOut, toggleDark, toggleLang, user, userEmail } = props;
  return (
    <div style={ms}>
      <style>{css}</style>
      <Header onHome={onHome} C={C} t={t} lang={lang} dark={dark} {...headerProps} />
      <ErrorBanner msg={dataError} C={C} onClose={onClearError} />
      {tab === "home" && <div style={{ animation: "fadeUp 0.3s ease" }}><div style={{ padding: "24px 16px", background: `linear-gradient(180deg, ${C.hdr}, ${C.inp})`, borderBottom: `1px solid ${C.border}` }}><div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}><Avatar ini={userAvatar} size={48} pic={userPic} color={C.acc} borderColor={C.border} /><div><div style={{ fontSize: 12, color: C.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>Welcome back,</div><div style={{ fontWeight: 700, fontSize: 18, color: C.text, letterSpacing: "-0.5px" }}>{userName}</div></div></div><div className="glass" style={{ background: `linear-gradient(135deg, ${C.acc}, ${C.acc2})`, borderRadius: 14, padding: "22px", color: "#fff", boxShadow: "0 16px 35px rgba(37,99,235,0.28)", animation: "popIn .28s ease" }}><div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{t.prepareSmarter}</div><div style={{ fontSize: 13, opacity: 0.9, fontWeight: 400 }}>{t.scoreHigher}</div></div></div><div style={{ padding: "24px 16px", maxWidth: 800, margin: "0 auto" }}><div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12, marginBottom: 28 }}>{[[subjects.length, t.subjects], [83, t.topics], [profile?.total_attempts ?? history.length, "My Tests"]].map(([n, l]) => <div key={l} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "16px 8px", textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{n}</div><div style={{ fontSize: 11, color: C.muted, fontWeight: 500, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{l}</div></div>)}</div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><h2 style={{ fontSize: 14, fontWeight: 600, color: C.text, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.chooseSubject}</h2></div>{dataLoading ? <Spinner C={C} fallbackText={t.loading} /> : subjects.length === 0 ? <EmptyState icon="Books" title={t.noSubjects} desc={t.noSubjectsDesc} C={C} /> : (() => { const grouped = {}; subjects.forEach((sub) => { const p = sub.paper || "General"; if (!grouped[p]) grouped[p] = []; grouped[p].push(sub); }); return Object.entries(grouped).map(([paperName, subs]) => <div key={paperName} style={{ marginBottom: 28 }}><div style={{ fontSize: 11, fontWeight: 700, color: C.acc, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, padding: "4px 0", borderBottom: `1px solid ${C.border}` }}>{paperName}</div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 12 }}>{subs.map((sub) => <div key={sub.id} className="card-h" onClick={() => openSubject(sub)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}><div style={{ width: 36, height: 36, borderRadius: 8, background: C.inp, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 10, border: `1px solid ${C.border}` }}>{sub.icon || "SUB"}</div><div style={{ fontWeight: 600, fontSize: 13, color: C.text, lineHeight: 1.4 }}>{lang === "hi" && sub.name_hi ? sub.name_hi : sub.name}</div></div>)}</div></div>); })()}</div></div>}
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
        const fmt     = (s) => s != null ? `${String(Math.floor(s / 60)).padStart(2,"00")}:${String(s % 60).padStart(2,"00")}` : "—";
        const dateStr = (iso) => { try { return new Date(iso).toLocaleDateString("en-IN", { day:"numeric", month:"short" }); } catch { return ""; } };
        return (
          <div style={{ padding: "24px 16px", animation: "fadeUp 0.3s ease", maxWidth: 800, margin: "0 auto" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 20, letterSpacing: "-0.5px" }}>{t.performanceOverview}</h2>
            {history.length === 0
              ? <EmptyState icon="📊" title={t.noHistory} desc={t.noHistoryDesc} C={C} />
              : <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 24 }}>
                    {[["🎯", avgAccuracy + "%", "Avg Accuracy", avgAccuracy >= 60 ? C.ok : C.err],["📝", totalTests, "Tests Taken", C.acc],["✅", totalCorrect, "Correct Ans", C.ok],["🏅", bestScore + "%", "Best Score", C.acc]].map(([icon, val, lbl, clr]) => (
                      <div key={lbl} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "18px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ fontSize: 24 }}>{icon}</div>
                        <div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: clr, lineHeight: 1 }}>{val}</div>
                          <div style={{ fontSize: 11, color: C.muted, fontWeight: 500, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.5px" }}>{lbl}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Overall Accuracy</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: avgAccuracy >= 60 ? C.ok : C.err }}>{avgAccuracy}%</span>
                    </div>
                    <div style={{ height: 10, background: C.border, borderRadius: 6, overflow: "hidden" }}>
                      <div style={{ width: `${avgAccuracy}%`, height: "100%", background: `linear-gradient(90deg, ${avgAccuracy >= 60 ? C.ok : C.err}, ${C.acc})`, borderRadius: 6, transition: "width 1s ease" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: C.muted }}>{totalCorrect} correct of {totalQ} questions</span>
                      <span style={{ fontSize: 11, color: C.muted }}>{totalQ - totalCorrect} incorrect</span>
                    </div>
                  </div>
                  {subjectRows.length > 0 && (
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 24 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 16 }}>Subject-wise Breakdown</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {subjectRows.map(({ name, attempts, acc }) => (
                          <div key={name}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                              <span style={{ fontSize: 13, color: C.text, fontWeight: 500, flex: 1, marginRight: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
                              <span style={{ fontSize: 12, color: C.muted, marginRight: 12, flexShrink: 0 }}>{attempts} test{attempts !== 1 ? "s" : ""}</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: acc >= 60 ? C.ok : C.err, flexShrink: 0 }}>{acc}%</span>
                            </div>
                            <div style={{ height: 6, background: C.border, borderRadius: 4, overflow: "hidden" }}>
                              <div style={{ width: `${acc}%`, height: "100%", background: acc >= 60 ? C.ok : C.err, borderRadius: 4, transition: "width 0.8s ease" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 16 }}>Recent Activity</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {recent.map((a, i) => {
                        const title = (lang === "hi" && a.quizzes?.title_hi) ? a.quizzes.title_hi : (a.quizzes?.title || "Quiz");
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
                </>
            }
          </div>
        );
      })()}
      {tab === "leaderboard" && <div style={{ padding: "24px 16px", animation: "fadeUp 0.3s ease", maxWidth: 800, margin: "0 auto" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: "-0.5px" }}>{t.leaderboard}</h2><button onClick={fetchLeaderboard} style={{ background: C.inp, border: `1px solid ${C.border}`, color: C.muted, borderRadius: 6, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>Refresh</button></div>{lbLoading ? <Spinner C={C} fallbackText={t.loading} /> : leaderboard.length === 0 ? <EmptyState icon="Rank" title="No Rankings Yet" desc="Complete a quiz to appear on the leaderboard" C={C} /> : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{leaderboard.map((p) => <div key={p.user_id} style={{ background: p.user_id === user?.id ? `${C.acc}0D` : C.card, border: `1px solid ${p.user_id === user?.id ? C.acc : C.border}`, borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}><Avatar ini={(p.display_name || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)} size={38} pic={p.avatar_url} color={C.acc} borderColor={C.border} /><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{p.display_name || "Anonymous"}</div><div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{p.total_attempts} tests � {p.total_score} pts</div></div><div style={{ textAlign: "right", flexShrink: 0 }}><div style={{ fontWeight: 700, fontSize: 18, color: p.avg_accuracy >= 60 ? C.ok : C.err }}>{p.avg_accuracy}%</div><div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase" }}>accuracy</div></div></div>)}</div>}</div>}
      {tab === "bookmarks" && <div style={{ padding: "24px 16px", animation: "fadeUp 0.3s ease", maxWidth: 800, margin: "0 auto" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}><h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: "-0.5px" }}>{t.savedQuestions}</h2><span style={{ fontSize: 12, color: C.muted, background: C.card, padding: "4px 10px", borderRadius: 12, border: `1px solid ${C.border}` }}>{bookmarks.length} Saved</span></div>{bookmarks.length === 0 ? <EmptyState icon="Save" title={t.noBookmarks} desc={t.noBookmarksDesc} C={C} /> : <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{bookmarks.map((q) => <div key={q.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 20 }}><p style={{ fontSize: 15, color: C.text, lineHeight: 1.6, marginBottom: 16, fontWeight: 500 }}>{lang === "hi" && q.question_hi ? q.question_hi : q.question}</p><button onClick={() => toggleBM(q)} style={{ background: C.inp, border: `1px solid ${C.border}`, color: C.err, borderRadius: 4, padding: "6px 12px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Remove Bookmark</button></div>)}</div>}</div>}
      {tab === "profile" && <div style={{ padding: "24px 16px", animation: "fadeUp 0.3s ease", maxWidth: 600, margin: "0 auto" }}><div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 28, marginBottom: 16, textAlign: "center" }}><Avatar ini={userAvatar} size={80} pic={userPic} color={C.acc} borderColor={C.border} /><div style={{ fontWeight: 700, fontSize: 20, color: C.text, letterSpacing: "-0.5px", marginTop: 12 }}>{userName}</div><div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>{userEmail}</div></div><div style={{ display: "flex", gap: 12 }}><button onClick={toggleDark} style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, color: C.text, borderRadius: 8, padding: "14px", cursor: "pointer" }}>{dark ? "Disable Dark" : "Enable Dark"}</button><button onClick={toggleLang} style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, color: C.text, borderRadius: 8, padding: "14px", cursor: "pointer" }}>{lang === "en" ? "Hindi" : "English"}</button></div><button onClick={signOut} style={{ width: "100%", marginTop: 16, background: C.card, border: `1px solid ${C.err}44`, color: C.err, borderRadius: 8, padding: "14px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Sign Out</button></div>}
      <BottomNav tab={tab} C={C} onNavigate={onTabNavigate} />
    </div>
  );
}