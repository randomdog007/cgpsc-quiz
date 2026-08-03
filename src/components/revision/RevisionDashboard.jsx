import React, { useEffect, useState } from 'react';

// ── Animated Number ─────────────────────────────────────────────────────────
function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = null;
    const from = display;
    const to = value;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * ease));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{display}</>;
}

// ── Ring Progress ─────────────────────────────────────────────────────────
function RingProgress({ value, size = 120, stroke = 10, color = '#0ea5e9', bg = 'var(--line-2)', label, sublabel, textColor = 'var(--ink)', subTextColor = 'var(--muted)' }) {
  const r = (size / 2) - (stroke / 2);
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * Math.min(100, Math.max(0, value)) / 100);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        {label && <div style={{ fontSize: size > 90 ? 22 : 16, fontWeight: 800, color: textColor, lineHeight: 1 }}>{label}</div>}
        {sublabel && <div style={{ fontSize: size > 90 ? 11 : 9, fontWeight: 600, color: subTextColor, textAlign: 'center' }}>{sublabel}</div>}
      </div>
    </div>
  );
}

// ── Activity Dots ─────────────────────────────────────────────────────────
function ActivityHeatmap({ activity }) {
  const today = new Date();
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  const map = {};
  (activity || []).forEach(a => { map[a.day] = a.revised; });
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
      {days.map((day, i) => {
        const count = map[day] || 0;
        const intensity = count === 0 ? 0 : count <= 5 ? 1 : count <= 15 ? 2 : 3;
        const colors = ['var(--line-2)', 'rgba(14,165,233,0.3)', 'rgba(14,165,233,0.6)', '#0ea5e9'];
        const isToday = day === today.toISOString().slice(0, 10);
        return (
          <div key={day} title={`${day}: ${count} revised`} style={{
            flex: 1, height: intensity === 0 ? 14 : 14 + intensity * 8,
            background: colors[intensity],
            borderRadius: 4,
            border: isToday ? '2px solid #0ea5e9' : 'none',
            transition: 'all 0.3s',
            minHeight: 14,
            boxSizing: 'border-box'
          }} />
        );
      })}
    </div>
  );
}

// ── Subject Bar ───────────────────────────────────────────────────────────
function SubjectBar({ subject, total, due, avgEase, index }) {
  const mastery = total > 0 ? Math.max(0, Math.min(100, Math.round(((avgEase || 2.5) / 3) * 100))) : 0;
  const urgency = due > 0;
  const colors = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];
  const color = colors[index % colors.length];
  
  const blocks = Math.round(mastery / 10);
  const blockStr = '█'.repeat(blocks) + '░'.repeat(10 - blocks);
  
  return (
    <div style={{ padding: '16px 0', borderBottom: '1px solid var(--line-2)' }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>{subject}</div>
      <div style={{ fontSize: 14, color: color, letterSpacing: '2px', marginBottom: 8, textShadow: `0 0 8px ${color}40` }}>{blockStr}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--ink)' }}>{mastery}%</div>
        {urgency && (
          <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '4px 10px', borderRadius: 10 }}>
            {due} Due
          </div>
        )}
      </div>
    </div>
  );
}

// ── Onboarding State ──────────────────────────────────────────────────────
function OnboardingGuide() {
  const steps = [
    { icon: '📝', label: 'Take any quiz', desc: 'Wrong answers are automatically captured' },
    { icon: '🧠', label: 'Questions come here', desc: 'Spaced Repetition schedules them intelligently' },
    { icon: '🔁', label: 'Revise daily', desc: 'Each correct answer extends the review interval' },
    { icon: '🏆', label: 'Build mastery', desc: 'Questions graduate to "Mastered" status' },
  ];
  return (
    <div style={{ padding: '24px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>Your Smart Revision Engine</h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 340, margin: '0 auto' }}>
          Answer quizzes and wrong answers automatically enter your revision cycle using <strong>Spaced Repetition</strong> — the science-backed method used by top exam toppers.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 14 }}>
            <div style={{ fontSize: 28, flexShrink: 0, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--line-2)', borderRadius: 12 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{s.label}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{s.desc}</div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: 18 }}>→</div>
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: '16px', background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(139,92,246,0.08))', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 16, textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>🚀 Ready to start?</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Go to <strong>Subjects → Take a quiz</strong>. Wrong answers will appear here automatically.</div>
      </div>
    </div>
  );
}


// ── Main Dashboard ────────────────────────────────────────────────────────
export default function RevisionDashboard({ stats, dueCount, onStart }) {
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (window.AliveKit?.refresh) window.AliveKit.refresh();
  }, []);

  if (!stats) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--line-2)', borderTopColor: '#0ea5e9', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ fontSize: 14, color: 'var(--muted)' }}>Loading your revision data...</div>
    </div>
  );

  const total = stats.totalTracked || 0;
  const mastered = stats.mastered || 0;
  const learning = stats.learning || 0;
  const due = dueCount || 0;
  const atRisk = (stats.pendingByInterval || []).filter(x => x.interval <= 1).reduce((a, x) => a + x.count, 0);

  // Show onboarding if no questions tracked
  if (total === 0) return <OnboardingGuide />;

  // Memory Score: weighted formula
  const masteredPct = total > 0 ? Math.round((mastered / total) * 100) : 0;
  const learningPct = total > 0 ? Math.round((learning / total) * 100) : 0;
  const readiness = Math.min(100, Math.round(
    (mastered * 1.0 + learning * 0.4 + (total - mastered - learning) * 0.05) / Math.max(total, 1) * 100
  ));

  const streak = stats.streak?.current || 0;
  const bestStreak = stats.streak?.longest || streak;
  const bySubject = stats.bySubject || [];
  const activity = stats.activity || [];
  const hardest = stats.hardest || [];

  // Color for readiness
  const readColor = readiness >= 70 ? '#10b981' : readiness >= 40 ? '#f59e0b' : '#ef4444';
  const readLabel = readiness >= 70 ? 'Strong' : readiness >= 40 ? 'Building' : 'Needs work';

  return (
    <div className="container--responsive" style={{ animation: 'fadeUp 0.3s ease', paddingTop: 20 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes flamePulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15) rotate(-5deg)} }
      `}</style>

      {/* ── Top Grid: Hero Memory Score + Today's Mission (Side by Side on Desktop) ── */}
      <div className="revision-desktop-hero" style={{ marginBottom: 24 }}>
        
        {/* ── Hero: Memory Score ── */}
        <div>
          <div style={{ 
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f2744 100%)',
            padding: '24px 20px',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 24,
            height: '100%',
            boxSizing: 'border-box',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between'
          }}>
          {/* Background decoration */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(14,165,233,0.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(139,92,246,0.06)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', width: '100%' }}>
            {/* Title */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 2 }}>Daily Revision</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>Your Memory Score</div>
            </div>

            {/* Score Ring + Stats */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <RingProgress value={readiness} size={94} stroke={8} color={readColor} bg="rgba(255,255,255,0.1)" label={<AnimatedNumber value={readiness} />} sublabel={readLabel} textColor="#fff" subTextColor="rgba(255,255,255,0.7)" />
              
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, marginBottom: 12 }}>
                  Your memory score has increased <strong style={{ color: '#34d399' }}>+6%</strong> this week.
                </p>
                
                {/* Mini stats */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#34d399' }}><AnimatedNumber value={mastered} /></div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase' }}>Mastered</div>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, padding: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#38bdf8' }}><AnimatedNumber value={learning} /></div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase' }}>Learning</div>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#f87171' }}><AnimatedNumber value={atRisk} /></div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase' }}>At Risk</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mastery progress bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Overall Progress</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>{total} questions tracked</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', display: 'flex' }}>
                  <div style={{ width: `${masteredPct}%`, background: '#10b981', transition: 'width 1.2s ease' }} />
                  <div style={{ width: `${learningPct}%`, background: '#0ea5e9', transition: 'width 1.2s ease' }} />
                  <div style={{ flex: 1, background: 'rgba(239,68,68,0.4)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* ── Today's Mission ── */}
        <div>
          {due > 0 ? (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 24, padding: '24px 20px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Today's Revision</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--ink)', lineHeight: 1, marginBottom: 8 }}>{due} Questions Due</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, marginBottom: 16 }}>Estimated Time: ~{Math.round(Math.min(due, 20) * 0.5)} minutes</div>
                
                <div style={{ width: '100%', height: 1, background: 'var(--line-2)', marginBottom: 16 }} />
                
                {atRisk > 0 ? (
                  <div style={{ fontSize: 14, color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                    <span>⚠️</span> {atRisk} question{atRisk !== 1 ? 's are' : ' is'} at risk of being forgotten.
                  </div>
                ) : (
                  <div style={{ fontSize: 14, color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                    <span>✅</span> You are on track with all questions.
                  </div>
                )}
              </div>
              
              <div>
                <button
                  onClick={onStart}
                  style={{
                    width: '100%', padding: '16px 24px', borderRadius: 16, border: 'none',
                    background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
                    color: '#fff', fontSize: 17, fontWeight: 800, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                    boxShadow: '0 8px 24px rgba(14,165,233,0.3)',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={e => e.currentTarget.style.transform = ''}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>🚀</span> Start Revision
                  </div>
                  {streak > 0 && (
                    <div style={{ fontSize: 11, background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span>🔥</span> {streak}-Day Streak
                    </div>
                  )}
                </button>
                
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14 }}>
                  <span style={{ color: '#0ea5e9' }}>Spaced Repetition:</span> 1 → 2 → 4 → 8 → 16 Days
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(14,165,233,0.06))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 24, padding: '24px 20px', textAlign: 'center', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>All caught up!</div>
              <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 320 }}>
                No revision due right now. Take more quizzes or come back later — your next questions will appear here automatically.
              </div>
              {streak > 0 && (
                <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 20, padding: '8px 16px' }}>
                  <span style={{ fontSize: 20 }}>🔥</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>{streak}-day streak! Best: {bestStreak}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

        {/* ── Tabs ── */}
        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 12, padding: 4 }}>
          {[['overview','📊 Overview'], ['subjects','📚 Subjects'], ['hardest','⚠️ Risk']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, padding: '8px 4px', border: 'none', borderRadius: 9, cursor: 'pointer',
              background: tab === id ? '#0ea5e9' : 'transparent',
              color: tab === id ? '#fff' : 'var(--muted)',
              fontSize: 12, fontWeight: 700, transition: 'all 0.2s'
            }}>{label}</button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {tab === 'overview' && (
          <div>
            {/* Activity heatmap */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 16, padding: '18px 20px', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>📈 Revision Activity (14 days)</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>Each bar = questions revised that day</div>
              <ActivityHeatmap activity={activity} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>14 days ago</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>Today</span>
              </div>
            </div>

            {/* How SRS works explainer */}
            <details style={{ background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 16, padding: '16px', cursor: 'pointer' }}>
              <summary style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', listStyle: 'none', outline: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>🧠</span> How Spaced Repetition Works</div>
                <span style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 600 }}>Learn More ▼</span>
              </summary>
              <div style={{ marginTop: 16, borderTop: '1px solid var(--line-2)', paddingTop: 16 }}>
                {[
                  { icon: '🔴', label: 'At Risk', count: atRisk, desc: 'Overdue — revise today or you\'ll forget', color: '#ef4444' },
                  { icon: '🟡', label: 'Learning', count: learning, desc: 'Getting better — appearing more often', color: '#f59e0b' },
                  { icon: '🟢', label: 'Mastered', count: mastered, desc: 'Reviewed correctly 4+ times in a row', color: '#10b981' },
                ].map(({ icon, label, count, desc, color }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--line-2)' }}>
                    <div style={{ fontSize: 20, flexShrink: 0 }}>{icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color, background: `${color}18`, padding: '2px 8px', borderRadius: 8 }}>{count}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{desc}</div>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(14,165,233,0.05)', borderRadius: 10, border: '1px solid rgba(14,165,233,0.15)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0ea5e9' }}>💡 Spaced Repetition</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 }}>
                    Correct answers double your review interval (1→2→4→8→16 days). Wrong answers reset it. This is how you build long-term exam memory.
                  </div>
                </div>
              </div>
            </details>
          </div>
        )}

        {/* ── Subjects Tab ── */}
        {tab === 'subjects' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 16, padding: '18px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>📚 Subject-wise Mastery</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 18 }}>Focus on subjects with high "Due" counts first.</div>
            {bySubject.length > 0 ? bySubject.map((s, i) => (
              <SubjectBar key={s.subject} subject={s.subject} total={s.total} due={s.due} avgEase={s.avgEase} index={i} />
            )) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: 14 }}>No subject data yet</div>
            )}
          </div>
        )}

        {/* ── Hardest Tab (Risk) ── */}
        {tab === 'hardest' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 16, padding: '18px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>⚠️ Highest Forget Risk</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 18 }}>Topics with the most questions at risk of being forgotten.</div>
            {(() => {
              const riskByTopic = Object.values(hardest.reduce((acc, q) => {
                if (!acc[q.topic]) acc[q.topic] = { topic: q.topic || 'General', subject: q.subject, count: 0, wrongCount: 0 };
                acc[q.topic].count++;
                acc[q.topic].wrongCount += q.wrongCount;
                return acc;
              }, {})).sort((a, b) => b.wrongCount - a.wrongCount).slice(0, 10);
              
              return riskByTopic.length > 0 ? riskByTopic.map((t, i) => (
                <div key={t.topic} style={{ padding: '16px 0', borderBottom: i < riskByTopic.length - 1 ? '1px solid var(--line-2)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--muted)', width: 24, flexShrink: 0 }}>{i + 1}.</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>{t.topic}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>{t.count} Question{t.count !== 1 && 's'}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: 8 }}>At Risk</span>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: 14 }}>No data yet — take some quizzes first!</div>
              );
            })()}
          </div>
        )}

        <div style={{ height: 80 }} />
    </div>
  );
}
