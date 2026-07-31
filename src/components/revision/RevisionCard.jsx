import React, { useState, useEffect } from 'react';

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

export default function RevisionCard({ question, index, total, selected, lang, onSelect, onConfirm, onSkip, onToggleLang }) {
  const [confidence, setConfidence] = useState(null);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    setConfidence(null);
    setAnimKey(k => k + 1);
  }, [index]);

  if (!question) return null;

  const fmt = (s) => s ? s.replace(/\\n/g, '\n').replace(/\/n/g, '\n') : '';

  const text = fmt(lang === 'hi' && question.textHi ? question.textHi : question.text);
  const options = ['a', 'b', 'c', 'd'].map(k => fmt(lang === 'hi' && question.optionsHi?.[k] ? question.optionsHi[k] : question.options?.[k] || ''));

  const answered = selected !== null;
  const correctIndex = question.correctOption - 1; // 0-based
  const explanation = fmt(lang === 'hi' && question.explanationHi ? question.explanationHi : (question.explanation || ''));

  const progress = (index + 1) / total;
  const daysAgo = question.lastReviewedAt
    ? Math.round((Date.now() - new Date(question.lastReviewedAt).getTime()) / 86400000)
    : null;

  const handleConfidence = (c) => {
    setConfidence(c);
    onConfirm(c);
  };

  return (
    <div key={animKey} style={{ maxWidth: 560, margin: '0 auto', width: '100%', boxSizing: 'border-box', animation: 'slideIn 0.25s ease' }}>
      <style>{`
        @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:none} }
        @keyframes popIn { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
      `}</style>

      {/* ── Progress Bar ── */}
      <div style={{ height: 4, background: 'var(--line-2)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ height: '100%', width: `${progress * 100}%`, background: 'linear-gradient(90deg, #0ea5e9, #8b5cf6)', transition: 'width 0.4s ease', borderRadius: '0 4px 4px 0' }} />
      </div>

      <div style={{ padding: '16px 16px 24px' }}>
        {/* ── Top Bar ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', padding: '4px 10px', borderRadius: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '1px' }}>Q {index + 1} / {total}</span>
            </div>
            {question.wrongCount > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '4px 8px', borderRadius: 8 }}>
                ⚠️ Missed {question.wrongCount}×
              </span>
            )}
          </div>
        </div>

        {/* ── Memory Context Badge ── */}
        {(daysAgo !== null || question.interval) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {daysAgo !== null && (
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 8, padding: '3px 8px' }}>
                🕐 Last seen {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}
              </span>
            )}
            {question.interval > 0 && (
              <span style={{ fontSize: 11, fontWeight: 600, color: '#0ea5e9', background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 8, padding: '3px 8px' }}>
                📅 {question.interval}d interval
              </span>
            )}
          </div>
        )}

        {/* ── Question Text ── */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 16, padding: '20px 20px', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: 0 }}>
            {text}
          </p>
        </div>

        {/* ── Options ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: answered ? 16 : 20 }}>
          {options.map((opt, i) => {
            if (!opt) return null;
            const isSelected = selected === i;
            const isCorrect = i === correctIndex;

            let bg = 'var(--surface)';
            let border = 'var(--line-2)';
            let color = 'var(--ink)';
            let letterBg = 'var(--line-2)';
            let letterColor = 'var(--muted)';
            let icon = null;

            if (answered) {
              if (isCorrect) {
                bg = 'rgba(16,185,129,0.06)'; border = '#10b981'; color = '#065f46';
                letterBg = '#10b981'; letterColor = '#fff'; icon = '✓';
              } else if (isSelected) {
                bg = 'rgba(239,68,68,0.06)'; border = '#ef4444'; color = '#7f1d1d';
                letterBg = '#ef4444'; letterColor = '#fff'; icon = '✗';
              } else {
                color = 'var(--muted)'; border = 'transparent'; bg = 'transparent';
              }
            } else if (isSelected) {
              bg = 'rgba(14,165,233,0.06)'; border = '#0ea5e9'; color = 'var(--ink)';
              letterBg = '#0ea5e9'; letterColor = '#fff';
            }

            return (
              <button
                key={i}
                onClick={() => !answered && onSelect(i)}
                disabled={answered}
                style={{
                  padding: '14px 16px', textAlign: 'left', borderRadius: 12, fontSize: 14,
                  cursor: answered ? 'default' : 'pointer',
                  border: `2px solid ${border}`,
                  background: bg,
                  display: 'flex', alignItems: 'center', gap: 12,
                  transition: 'all 0.2s',
                  transform: answered && isCorrect ? 'scale(1.01)' : 'scale(1)',
                }}
              >
                <span style={{ width: 28, height: 28, borderRadius: 8, background: letterBg, color: letterColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0, transition: 'all 0.2s' }}>
                  {icon || OPTION_KEYS[i]}
                </span>
                <span style={{ color, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{opt}</span>
              </button>
            );
          })}
        </div>

        {/* ── Explanation (immediate) ── */}
        {answered && explanation && (
          <div style={{ marginBottom: 16, padding: '14px 16px', background: 'rgba(14,165,233,0.04)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 12, animation: 'fadeUp 0.3s ease' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>💡 Explanation</div>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: 0 }}>{explanation}</p>
          </div>
        )}

        {/* ── Confidence Rating (after answering) ── */}
        {answered && (
          <div style={{ marginBottom: 16, animation: 'popIn 0.3s ease' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 10, textAlign: 'center' }}>How well did you know this?</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { label: '😅 Just guessed', value: 1, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: '#ef4444' },
                { label: '🙂 Got it', value: 2, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: '#f59e0b' },
                { label: '💪 Nailed it!', value: 3, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: '#10b981' },
              ].map(({ label, value, color, bg, border }) => (
                <button
                  key={value}
                  onClick={() => handleConfidence(value)}
                  style={{
                    flex: 1, padding: '10px 6px', border: `2px solid ${confidence === value ? border : 'var(--line-2)'}`,
                    borderRadius: 12, background: confidence === value ? bg : 'var(--surface)',
                    color: confidence === value ? color : 'var(--muted)',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                    transform: confidence === value ? 'scale(1.04)' : 'scale(1)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div style={{ display: 'flex', gap: 10 }}>
          {!answered ? (
            <>
              <button
                onClick={onSkip}
                style={{ flex: 1, padding: '15px 20px', borderRadius: 12, background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--line-2)', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Skip →
              </button>
            </>
          ) : (
            <button
              onClick={() => handleConfidence(confidence || 2)}
              style={{
                flex: 1, padding: '15px 20px', borderRadius: 12,
                background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
                color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 6px 16px rgba(14,165,233,0.3)', transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseOut={e => e.currentTarget.style.transform = ''}
            >
              {index === total - 1 ? 'Finish Session →' : 'Next Question →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
