import React, { useState } from 'react';

export default function RevisionResults({ results, lang, onLoadMore, onDone, beforeMastered, totalTracked }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!results) return null;

  const total = (results.correctCount || 0) + (results.wrongCount || 0) + (results.skippedCount || 0);
  const remaining = results.remaining || 0;

  // Mastery delta
  const masteredNow = totalTracked?.mastered || 0;
  const masteredBefore = beforeMastered || masteredNow;
  const newlyMastered = Math.max(0, masteredNow - masteredBefore);

  const reviewItems = results.results || [];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px', animation: 'fadeUp 0.4s ease' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes popIn { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>

      {/* ── Session Header ── */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 60, marginBottom: 8, animation: 'popIn 0.5s ease' }}>🎉</div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)', margin: '0 0 6px' }}>Revision Complete</h2>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--muted)' }}>
          {total} Question{total !== 1 ? 's' : ''} Reviewed
        </div>
      </div>

      {/* ── Score Card (Memory Score Delta) ── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 20, padding: '32px 20px', marginBottom: 20, textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Memory Score</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: 'var(--muted)' }}>{masteredBefore}</div>
          <div style={{ fontSize: 24, color: 'var(--line-3)' }}>→</div>
          <div style={{ fontSize: 40, fontWeight: 900, color: 'var(--ink)' }}>{masteredNow}</div>
        </div>
        {newlyMastered > 0 ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.12)', color: '#10b981', padding: '6px 12px', borderRadius: 12, fontSize: 16, fontWeight: 800 }}>
            <span>📈</span> +{newlyMastered}
          </div>
        ) : (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--line-2)', color: 'var(--muted)', padding: '6px 12px', borderRadius: 12, fontSize: 15, fontWeight: 700 }}>
            No Change
          </div>
        )}
      </div>

      {/* ── Remaining Questions ── */}
      <div style={{ textAlign: 'center', marginBottom: 28, fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>
        Questions Remaining: <span style={{ color: remaining > 0 ? '#f59e0b' : '#10b981', fontWeight: 800 }}>{remaining}</span>
      </div>

      {/* ── Action Buttons ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {remaining > 0 ? (
          <button onClick={onLoadMore} style={{
            width: '100%', padding: '16px 20px', borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
            color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(14,165,233,0.3)',
            transition: 'transform 0.2s'
          }}>
            Continue Learning →
          </button>
        ) : (
          <button onClick={onDone} style={{
            width: '100%', padding: '16px 20px', borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(16,185,129,0.25)',
            transition: 'transform 0.2s'
          }}>
            See Progress →
          </button>
        )}
        
        {remaining > 0 && (
          <button onClick={onDone} style={{
            width: '100%', padding: '16px 20px', borderRadius: 14, border: '1px solid var(--line-3)',
            background: 'var(--surface)', color: 'var(--ink)', fontSize: 16, fontWeight: 700, cursor: 'pointer',
            transition: 'background 0.2s'
          }}>
            See Progress
          </button>
        )}
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
