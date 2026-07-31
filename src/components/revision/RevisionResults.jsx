import React, { useEffect, useState } from 'react';

// ── Animated counter ─────────────────────────────────────────────────────
function AnimNum({ to, duration = 900 }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setV(Math.round(p * p * to));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    // eslint-disable-next-line
  }, [to]);
  return <>{v}</>;
}

export default function RevisionResults({ results, lang, onLoadMore, onDone, beforeMastered, totalTracked }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!results) return null;

  const correct = results.correctCount || 0;
  const wrong = results.wrongCount || 0;
  const skipped = results.skippedCount || 0;
  const total = correct + wrong + skipped;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const xp = results.xpGained || 0;
  const remaining = results.remaining || 0;

  // Mastery delta
  const masteredNow = totalTracked?.mastered || 0;
  const masteredBefore = beforeMastered || masteredNow;
  const newlyMastered = Math.max(0, masteredNow - masteredBefore);

  // Session rating
  const rating = accuracy >= 80 ? { icon: '🏆', label: 'Excellent!', color: '#10b981', bg: 'rgba(16,185,129,0.08)' }
    : accuracy >= 60 ? { icon: '👏', label: 'Well done!', color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)' }
    : accuracy >= 40 ? { icon: '💪', label: 'Keep going!', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' }
    : { icon: '📚', label: 'Practice more!', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' };

  const reviewItems = results.results || [];

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px', animation: 'fadeUp 0.4s ease' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes popIn { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>

      {/* ── Session Header ── */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 60, marginBottom: 8, animation: 'popIn 0.5s ease' }}>{rating.icon}</div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)', margin: '0 0 6px' }}>Session Complete!</h2>
        <div style={{ fontSize: 15, fontWeight: 600, color: rating.color, background: rating.bg, display: 'inline-block', padding: '6px 20px', borderRadius: 20 }}>
          {rating.label}
        </div>
      </div>

      {/* ── Score Card ── */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 20, padding: '24px 20px', marginBottom: 20, color: '#fff' }}>
        {/* Big accuracy */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8 }}>Session Accuracy</div>
          <div style={{ fontSize: 56, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
            <AnimNum to={accuracy} />
            <span style={{ fontSize: 28, color: 'rgba(255,255,255,0.5)' }}>%</span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { value: correct, label: 'Correct', color: '#34d399', bg: 'rgba(16,185,129,0.15)', icon: '✓' },
            { value: wrong, label: 'Wrong', color: '#f87171', bg: 'rgba(239,68,68,0.15)', icon: '✗' },
            { value: skipped, label: 'Skipped', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)', icon: '→' },
          ].map(({ value, label, color, bg, icon }) => (
            <div key={label} style={{ flex: 1, background: bg, borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color }}><AnimNum to={value} /></div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 600, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* XP + newly mastered */}
        {(xp > 0 || newlyMastered > 0) && (
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            {xp > 0 && (
              <div style={{ flex: 1, background: 'rgba(245,158,11,0.15)', borderRadius: 12, padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fbbf24' }}>+{xp}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>XP Gained</div>
              </div>
            )}
            {newlyMastered > 0 && (
              <div style={{ flex: 1, background: 'rgba(139,92,246,0.15)', borderRadius: 12, padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#a78bfa' }}>+{newlyMastered}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>Newly Mastered</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Remaining ── */}
      {remaining > 0 ? (
        <div style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 14, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 24, flexShrink: 0 }}>📋</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{remaining} more questions due today</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Keep going to maximize your memory score!</div>
          </div>
        </div>
      ) : (
        <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 14, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 24, flexShrink: 0 }}>🎉</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>All caught up for today!</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Come back tomorrow for your next scheduled review.</div>
          </div>
        </div>
      )}

      {/* ── Action Buttons ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {remaining > 0 && (
          <button onClick={onLoadMore} style={{
            flex: 1, padding: '15px 20px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
            color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 6px 16px rgba(14,165,233,0.25)'
          }}>
            Continue →
          </button>
        )}
        <button onClick={onDone} style={{
          flex: 1, padding: '15px 20px', borderRadius: 12, border: '1px solid var(--line-2)',
          background: 'var(--surface)', color: 'var(--ink)', fontSize: 15, fontWeight: 700, cursor: 'pointer'
        }}>
          Dashboard
        </button>
      </div>

      {/* ── Question Review ── */}
      {reviewItems.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 16, overflow: 'hidden' }}>
          <button
            onClick={() => setShowDetails(d => !d)}
            style={{ width: '100%', padding: '16px 20px', background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>📖 Review Answers ({reviewItems.length})</span>
            <span style={{ fontSize: 20, color: 'var(--muted)', transform: showDetails ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
          </button>

          {showDetails && (
            <div style={{ borderTop: '1px solid var(--line-2)' }}>
              {reviewItems.map((res, i) => {
                const isCorrect = res.isCorrect;
                const expText = lang === 'hi' && res.explanationHi ? res.explanationHi : res.explanation;
                const fmt = s => s ? s.replace(/\\n/g, '\n').replace(/\/n/g, '\n') : '';
                return (
                  <div key={i} style={{ padding: '16px 20px', borderBottom: i < reviewItems.length - 1 ? '1px solid var(--line-2)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: isCorrect ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
                        {isCorrect ? '✓' : '✗'}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: isCorrect ? '#10b981' : '#ef4444' }}>
                        {isCorrect ? 'Correct' : 'Wrong'}
                      </span>
                      <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: 'var(--muted)', background: 'var(--line-2)', padding: '2px 8px', borderRadius: 8 }}>
                        Next in {res.newInterval}d
                      </span>
                    </div>
                    {expText && (
                      <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                        {fmt(expText)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div style={{ height: 40 }} />
    </div>
  );
}
