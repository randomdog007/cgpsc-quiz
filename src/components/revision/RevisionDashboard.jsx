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
function RingProgress({ value, size = 120, stroke = 10, color = '#0ea5e9', bg = 'var(--line-2)', label, sublabel }) {
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
        {label && <div style={{ fontSize: size > 90 ? 22 : 16, fontWeight: 800, color: 'var(--ink)', lineHeight: 1 }}>{label}</div>}
        {sublabel && <div style={{ fontSize: size > 90 ? 11 : 9, fontWeight: 600, color: 'var(--muted)', textAlign: 'center' }}>{sublabel}</div>}
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
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{subject}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {urgency && (
            <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.12)', padding: '2px 7px', borderRadius: 10 }}>
              {due} due
            </span>
          )}
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>{mastery}%</span>
        </div>
      </div>
      <div style={{ height: 6, background: 'var(--line-2)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${mastery}%`, background: color, borderRadius: 3, transition: 'width 1.2s ease' }} />
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{total} questions tracked</div>
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
        {recentMistakes.map((q, i) => (
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
    <div style={{ animation: 'fadeUp 0.3s ease' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes flamePulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15) rotate(-5deg)} }
      `}</style>

      {/* ── Hero: Memory Score ── */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f2744 100%)',
          padding: '28px 20px 24px',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 24,
          maxWidth: 560,
          margin: '0 auto',
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.15)'
        }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(14,165,233,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(139,92,246,0.06)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto' }}>
          {/* Title + streak */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4 }}>Daily Revision</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>Your Memory Score</div>
            </div>
            {streak > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 20, padding: '4px 10px' }}>
                <span style={{ fontSize: 20, animation: 'flamePulse 1.5s ease-in-out infinite' }}>🔥</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>{streak}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#f59e0b' }}>day streak</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '4px 10px' }}>
                <span style={{ fontSize: 16 }}>⚡</span>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Start streak</div>
              </div>
            )}
          </div>

          {/* Score Ring + Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <RingProgress value={readiness} size={110} stroke={10} color={readColor} bg="rgba(255,255,255,0.1)" label={<AnimatedNumber value={readiness} />} sublabel={readLabel} />
            
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 16 }}>
                Estimated recall under exam conditions. Revise daily to push this higher.
              </p>
              
              {/* Mini stats */}
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '8px 12px' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#34d399' }}><AnimatedNumber value={mastered} /></div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Mastered</div>
                </div>
                <div style={{ flex: 1, background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, padding: '8px 12px' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#38bdf8' }}><AnimatedNumber value={learning} /></div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Learning</div>
                </div>
                <div style={{ flex: 1, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '8px 12px' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#f87171' }}><AnimatedNumber value={atRisk} /></div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>At Risk</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mastery progress bar */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Overall Progress</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>{total} questions tracked</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', display: 'flex' }}>
                <div style={{ width: `${masteredPct}%`, background: '#10b981', transition: 'width 1.2s ease' }} />
                <div style={{ width: `${learningPct}%`, background: '#0ea5e9', transition: 'width 1.2s ease' }} />
                <div style={{ flex: 1, background: 'rgba(239,68,68,0.4)' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
              {[['#10b981','Mastered',masteredPct], ['#0ea5e9','Learning',learningPct], ['rgba(239,68,68,0.6)','Needs work',100-masteredPct-learningPct]].map(([c,l,p]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{l} {p}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* ── Today's Mission ── */}
      <div style={{ padding: '20px 16px', maxWidth: 560, margin: '0 auto' }}>
        
        {due > 0 ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 16, overflow: 'hidden', marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(14,165,233,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>📅</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>Today's Mission</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>{due} question{due !== 1 ? 's' : ''} scheduled for today</div>
              </div>
              <div style={{ marginLeft: 'auto', background: '#0ea5e9', color: '#fff', padding: '4px 10px', borderRadius: 10, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{due}</div>
            </div>
            
            {atRisk > 0 && (
              <div style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.04)', borderBottom: '1px solid var(--line-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>⚠️</span>
                <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 600 }}>{atRisk} question{atRisk !== 1 ? 's' : ''} fading fast — review today to prevent forgetting</span>
              </div>
            )}
            
            <div style={{ padding: '16px 20px' }}>
              <button
                onClick={onStart}
                style={{
                  width: '100%', padding: '16px 20px', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
                  color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: '0 8px 24px rgba(14,165,233,0.3)',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = ''}
              >
                <span style={{ fontSize: 20 }}>🚀</span>
                Start Revision Session
                <span style={{ fontSize: 14, opacity: 0.85 }}>· {Math.min(due, 20)} Qs</span>
              </button>
              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 10, fontWeight: 500 }}>
                ~{Math.round(Math.min(due, 20) * 0.5)} mins · Spaced Repetition scheduling
              </p>
            </div>
          </div>
        ) : (
          <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(14,165,233,0.06))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16, padding: '24px 20px', marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>All caught up!</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
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

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 12, padding: 4 }}>
          {[['overview','📊 Overview'], ['subjects','📚 Subjects'], ['hardest','💪 Hardest']].map(([id, label]) => (
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
            <div style={{ background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 16, padding: '18px 20px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>🧠 How Your Revision Works</div>
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
          </div>
        )}

        {/* ── Subjects Tab ── */}
        {tab === 'subjects' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 16, padding: '18px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>📚 Subject-wise Mastery</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 18 }}>Bar shows mastery level · Amber badge = questions due now</div>
            {bySubject.length > 0 ? bySubject.map((s, i) => (
              <SubjectBar key={s.subject} subject={s.subject} total={s.total} due={s.due} avgEase={s.avgEase} index={i} />
            )) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: 14 }}>No subject data yet</div>
            )}
          </div>
        )}

        {/* ── Hardest Tab ── */}
        {tab === 'hardest' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 16, padding: '18px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>💪 Your Toughest Questions</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 18 }}>Questions you've missed the most — focus here for maximum gain</div>
            {hardest.length > 0 ? hardest.map((h, i) => (
              <div key={h.questionId} style={{ padding: '12px 0', borderBottom: i < hardest.length - 1 ? '1px solid var(--line-2)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                    {h.wrongCount}x
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.5, marginBottom: 4, whiteSpace: 'pre-wrap' }}>
                      {h.text ? h.text.replace(/\\n/g, '\n') : ''}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{h.subject} · {h.topic}</div>
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: 14 }}>No data yet — take some quizzes first!</div>
            )}
          </div>
        )}

        <div style={{ height: 80 }} />
      </div>
    </div>
  );
}
