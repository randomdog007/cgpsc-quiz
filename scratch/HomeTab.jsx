        return (
          <div className="container container--wide dashboard-grid" style={{ animation: "fadeUp 0.3s ease", paddingTop: 32 }}>
            
            {/* LEFT COLUMN */}
            <div>
              {/* DESKTOP INLINE HEADER */}
              <div className="desktop-flex" style={{ alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <svg style={{ width: 20, height: 20, fill: "var(--muted)" }}><use href="#ic-clock"></use></svg>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>{dateString}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button onClick={() => window.open('https://t.me/cgpscquiz', '_blank')} className="glass" style={{ width: 36, height: 36, borderRadius: "50%", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink)", padding: 0 }}>
                    <svg style={{ width: 18, height: 18, fill: "currentColor" }} viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.33-.01-.98-.19-1.46-.35-.59-.19-1.05-.29-1.01-.61.02-.17.29-.36.81-.57 3.17-1.38 5.28-2.29 6.33-2.73 3-.1.26-1.5.46-1.5.38 0 .18.06.32.18.42.14.1.33.27.32.73z"/></svg>
                  </button>
                  <button onClick={toggleLang} className="glass" style={{ width: 36, height: 36, borderRadius: "50%", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink)", fontWeight: 700, fontSize: 13, padding: 0 }}>{lang === "en" ? "हिं" : "EN"}</button>
                  <button onClick={toggleDark} className="glass" style={{ width: 36, height: 36, borderRadius: "50%", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink)", fontSize: 16, padding: 0 }}>{dark ? "☀️" : "🌙"}</button>
                  <Avatar url={userPic || userAvatar} size={36} />
                </div>
              </div>

              {/* MOBILE GREETING */}
              <h1 className="greet mobile-only" style={{ marginTop: 0 }}>
                <small>{dateString}</small>
                {greeting}, {userName}. 👋
              </h1>

              {/* DESKTOP GREETING */}
              <div className="desktop-only" style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--ink)", letterSpacing: "-1px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                  {greeting}, {userName}. <span>👋</span>
                </h1>
                <div style={{ fontSize: 15, color: "var(--muted)", fontWeight: 500 }}>Let's continue your success streak today!</div>
              </div>
              
              {/* Promo Banner / Today's Revision */}
              <div className="promo-banner" style={{ backgroundImage: "url(/img/revision_banner.jpg)", marginBottom: 32, cursor: "pointer", position: "relative", overflow: "hidden" }} onClick={onRevision}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(15, 28, 22, 0.95) 0%, rgba(15, 28, 22, 0.4) 100%)", zIndex: 1 }}></div>
                <div style={{ position: "relative", zIndex: 2 }}>
                  <div style={{ width: 48, height: 48, background: "#fff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#0f1c16", marginBottom: 24 }}>
                    <svg style={{ width: 24, height: 24 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M12 5l-7 7M12 5l7 7" transform="rotate(90 12 12)"/></svg>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{t.todaysRevision || "Today's Revision"}</div>
                  <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 24 }}>{revStats ? revStats.dueToday : 0} {t.dueForReview2 || "questions due"} • Streak: {streakCount}</div>
                  <button style={{ background: "#2e7a52", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 600, fontSize: 14, display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>Start Revision →</button>
                </div>
              </div>

              {/* Continue Rail */}
              {history.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Continue where you left off</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--teal)", cursor: "pointer", textDecoration: "underline" }} onClick={() => onTabNavigate("history")}>View All</div>
                  </div>
                  <div className="rail">
                    {history.slice(0,4).map((h, i) => (
                      <div key={i} className="cont" onClick={() => onStartQuiz({id: h.quiz_id, title: h.quiz_title}, true)} style={{ cursor: "pointer", minWidth: 200, padding: 16, border: "1px solid var(--line-2)", background: "var(--surface)", borderRadius: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "80%" }}>{lang === 'hi' && h.subjects?.name_hi ? h.subjects.name_hi : (h.subjects?.name || "Subject")}</div>
                          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--teal-soft)", color: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg style={{ width: 12, height: 12 }} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--ink)" }}>{lang === 'hi' && h.quiz_title_hi ? h.quiz_title_hi : (h.quiz_title || "Quiz")}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                          <span>Score: {h.score}/{h.total}</span>
                          <span>Acc: {h.accuracy}%</span>
                        </div>
                        <div style={{ height: 4, background: "var(--line-2)", borderRadius: 2, marginTop: 4 }}>
                          <div style={{ height: "100%", background: "var(--teal)", width: `${h.accuracy}%`, borderRadius: 2 }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Bar */}
              <div style={{ marginTop: 32, marginBottom: 32, display: "flex", gap: 12 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <svg style={{ position: "absolute", left: 16, top: 16, width: 18, height: 18, fill: "var(--muted)" }}><use href="#ic-search"></use></svg>
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder={t.search || "Search assessments, topics or subjects..."} 
                    className="input-clean"
                    style={{ fontSize: 14, padding: "16px 16px 16px 44px", width: "100%", borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface)" }}
                  />
                  {searchQuery && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 8, background: "var(--surface)", border: `1px solid var(--line)`, borderRadius: 12, padding: 16, boxShadow: "var(--shadow-lg)", zIndex: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>{t.searchResults || "Search Results"}</div>
                      {searchLoading ? <Spinner C={C} /> : searchResults.length === 0 ? <div style={{ fontSize: 14, color: "var(--muted)", textAlign: "center", padding: "20px 0" }}>{t.noQuizzesFound || "No quizzes found."}</div> : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {searchResults.map(q => (
                            <div key={q.id} onClick={() => onStartQuiz(q)} style={{ padding: 12, background: "var(--surface-2)", borderRadius: 8, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 15 }}>{lang === "hi" && q.title_hi ? q.title_hi : q.title}</div>
                                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{q.total_questions} Qs</div>
                              </div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--blue)" }}>Start →</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button className="glass desktop-only" style={{ width: 50, height: 50, borderRadius: 12, border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--teal)" }}>
                   <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
                </button>
              </div>

              {/* Subject Grid */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px" }}>{t.subjects || "Subjects"}</h2>
              </div>
              
              {dataLoading ? <Spinner C={C} /> : subjects.length === 0 ? (
                <EmptyState icon="📚" title={t.noSubjects} desc={t.noSubjectsDesc} C={C} />
              ) : (() => {
                const groups = subjects.reduce((acc, sub) => {
                  const paper = sub.paper || "Other";
                  if (paper === "CSAT") return acc;
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
                  <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                    {sortedPapers.map(paper => (
                      <div key={paper}>
                        <h3 className="mobile-only" style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 14 }}>
                          {lang === 'hi' ? (paper === 'Indian GS' ? 'भारतीय सामान्य अध्ययन' : paper === 'Chhattisgarh GS' ? 'छत्तीसगढ़ सामान्य अध्ययन' : paper === 'Current Affairs' ? 'समसामयिकी' : paper === 'Other' ? 'अन्य' : paper) : paper}
                        </h3>
                        <div className="subjgrid">
                          {/* We inject the parent paper name as the first card in desktop, or just render subjects normally. Let's render subjects normally. */}
                          {groups[paper].map((sub) => {
                            const subHistory = history.filter(h => String(h.subject_id) === String(sub.id));
                            const accAvg = subHistory.length > 0 ? Math.round(subHistory.reduce((s, h) => s + (h.accuracy || 0), 0) / subHistory.length) : 0;
                            return (
                              <div key={sub.id} className="subj" onClick={() => openSubject(sub)} style={{ cursor: "pointer", background: "var(--surface)", border: "1px solid var(--line-2)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                                <div className="ico" style={{ background: "var(--blue-soft)", color: "var(--blue)" }}><svg className="ic"><use href="#ic-book"></use></svg></div>
                                <div>
                                  <div className="nm" style={{ fontSize: 14 }}>{lang === "hi" && sub.name_hi ? sub.name_hi : sub.name}</div>
                                  <div className="meta">{accAvg > 0 ? `${accAvg}% acc` : "Not started"}</div>
                                </div>
                                {accAvg > 0 && (
                                  <div className="arc">
                                    <svg className="ring" viewBox="0 0 36 36" style={{ width: 42, height: 42 }}><circle className="bg" cx="18" cy="18" r="15.9" fill="none" stroke="var(--line-2)" strokeWidth="3" /><circle className="fg" cx="18" cy="18" r="15.9" fill="none" stroke="var(--blue)" strokeWidth="3" strokeDasharray={`${accAvg}, 100`} strokeLinecap="round" transform="rotate(-90 18 18)" /></svg>
                                  </div>
                                )}
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

            {/* RIGHT COLUMN */}
            <div className="widget-col desktop-only">
              <div className="widget">
                <h4>Your Activity</h4>
                <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 12 }}>
                  {['W','T','F','S','S','M','T'].map((day, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 4, background: activity7[i] ? `rgba(46, 122, 82, ${0.2 + (activity7[i]*0.2)})` : "var(--line-2)" }}></div>
                      <div style={{ fontSize: 10, color: "var(--faint)", fontWeight: 600 }}>{day}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="widget">
                <h4>Your Rank</h4>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--teal-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--teal)" }}>
                    <svg style={{ width: 28, height: 28 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>Unranked</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>0 pts • 0% accuracy</div>
                  </div>
                  <svg style={{ width: 24, height: 24, color: "var(--line)", fill: "var(--surface)" }} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 2l3 6 7 1-5 5 1.5 7.5L12 18l-6.5 3.5L7 14l-5-5 7-1 3-6z"/></svg>
                </div>
                <div style={{ height: 6, background: "var(--line-2)", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
                  <div style={{ width: "0%", height: "100%", background: "var(--teal)" }}></div>
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>Attempt quizzes to earn points & climb the leaderboard!</div>
              </div>

              <div className="widget">
                <h4>Daily Goal</h4>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink)" }}>
                      <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>0 / 10 quizzes</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Let's hit your daily goal!</div>
                    </div>
                  </div>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", border: "4px solid var(--line-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>
                    0%
                  </div>
                </div>
              </div>

              <div className="promo-banner" style={{ backgroundImage: "url(/img/motivation_banner.jpg)", padding: 24, minHeight: 180, justifyContent: "flex-end", position: "relative" }}>
                 <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(15,28,22,0.95) 0%, rgba(15,28,22,0) 100%)", borderRadius: 16, zIndex: 1 }}></div>
                 <div style={{ position: "relative", zIndex: 2 }}>
                   <div style={{ fontSize: 32, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: -8, letterSpacing: -2 }}>"</div>
                   <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", lineHeight: 1.4 }}>Discipline today,<br/>Success tomorrow.</div>
                 </div>
              </div>
            </div>
          </div>
        );
