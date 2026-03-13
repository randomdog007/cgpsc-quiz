import Header from "../components/layout/Header";
import BottomNav from "../components/layout/BottomNav";
import Avatar from "../components/ui/Avatar";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import ErrorBanner from "../components/ui/ErrorBanner";

export default function MainPage(props) {
  const {
    ms, css, C, t, tab, lang, dark, dataError, onClearError,
    onHome, onTabNavigate, headerProps, userAvatar, userPic, userName,
    profile, subjects, history, dataLoading, openSubject,
    bookmarks, bmLoading, toggleBM, signOut, toggleDark, toggleLang, userEmail,
  } = props;

  return (
    <div style={ms}>
      <style>{css}</style>
      <Header onHome={onHome} C={C} t={t} lang={lang} dark={dark} {...headerProps} />
      <ErrorBanner msg={dataError} C={C} onClose={onClearError} />

      {/* ── HOME ── */}
      {tab === "home" && (
        <div style={{ animation: "fadeUp 0.3s ease" }}>
          <div style={{ padding: "24px 16px", background: `linear-gradient(180deg, ${C.hdr}, ${C.inp})`, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <Avatar ini={userAvatar} size={48} pic={userPic} color={C.acc} borderColor={C.border} />
              <div>
                <div style={{ fontSize: 12, color: C.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>Welcome back,</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: C.text, letterSpacing: "-0.5px" }}>{userName}</div>
              </div>
            </div>
            <div className="glass" style={{ background: `linear-gradient(135deg, ${C.acc}, ${C.acc2})`, borderRadius: 14, padding: "22px", color: "#fff", boxShadow: "0 16px 35px rgba(37,99,235,0.28)", animation: "popIn .28s ease" }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{t.prepareSmarter}</div>
              <div style={{ fontSize: 13, opacity: 0.9, fontWeight: 400 }}>{t.scoreHigher}</div>
            </div>
          </div>
          <div style={{ padding: "24px 16px", maxWidth: 800, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12, marginBottom: 28 }}>
              {[[subjects.length, t.subjects], [83, t.topics], [profile?.total_attempts ?? history.length, "My Tests"]].map(([n, l]) => (
                <div key={l} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "16px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{n}</div>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 500, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: C.text, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.chooseSubject}</h2>
            </div>
            {dataLoading ? <Spinner C={C} fallbackText={t.loading} /> : subjects.length === 0 ? (
              <EmptyState icon="📚" title={t.noSubjects} desc={t.noSubjectsDesc} C={C} />
            ) : (() => {
              const grouped = {};
              subjects.forEach((sub) => {
                const p = sub.paper || "General";
                if (!grouped[p]) grouped[p] = [];
                grouped[p].push(sub);
              });
              return Object.entries(grouped).map(([paperName, subs]) => (
                <div key={paperName} style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.acc, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, padding: "4px 0", borderBottom: `1px solid ${C.border}` }}>{paperName}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 12 }}>
                    {subs.map((sub) => (
                      <div key={sub.id} className="card-h" onClick={() => openSubject(sub)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: C.inp, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 10, border: `1px solid ${C.border}` }}>{sub.icon || "📖"}</div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: C.text, lineHeight: 1.4 }}>{lang === "hi" && sub.name_hi ? sub.name_hi : sub.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ));
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
            <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 20, letterSpacing: "-0.5px" }}>{t.performanceOverview}</h2>
            {history.length === 0 ? <EmptyState icon="📊" title={t.noHistory} desc={t.noHistoryDesc} C={C} /> : <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 24 }}>
                {[["🎯", avgAccuracy + "%", "Avg Accuracy", avgAccuracy >= 60 ? C.ok : C.err], ["📝", totalTests, "Tests Taken", C.acc], ["✅", totalCorrect, "Correct Ans", C.ok], ["🏅", bestScore + "%", "Best Score", C.acc]].map(([icon, val, lbl, clr]) => (
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
            </>}
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
          <button onClick={signOut} style={{ width: "100%", marginTop: 16, background: C.card, border: `1px solid ${C.err}44`, color: C.err, borderRadius: 8, padding: "14px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Sign Out</button>
        </div>
      )}

      <BottomNav tab={tab} C={C} onNavigate={onTabNavigate} />
    </div>
  );
}