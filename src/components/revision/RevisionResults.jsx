import React from 'react';

export default function RevisionResults({ results, lang, onLoadMore, onDone }) {
  if (!results) return null;

  return (
    <div style={{ padding: "32px 16px", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Session Complete!</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16 }}>
          <div style={{ background: "#ecfdf5", color: "#10b981", padding: "12px 24px", borderRadius: 12, fontWeight: 700 }}>
            <div style={{ fontSize: 24 }}>{results.correct}</div>
            <div style={{ fontSize: 12, textTransform: "uppercase" }}>Correct</div>
          </div>
          <div style={{ background: "#fef2f2", color: "#ef4444", padding: "12px 24px", borderRadius: 12, fontWeight: 700 }}>
            <div style={{ fontSize: 24 }}>{results.wrong}</div>
            <div style={{ fontSize: 12, textTransform: "uppercase" }}>Wrong</div>
          </div>
        </div>
        
        {results.remaining > 0 ? (
          <p style={{ marginTop: 16, color: "#64748b", fontWeight: 600 }}>You still have {results.remaining} questions due today.</p>
        ) : (
          <p style={{ marginTop: 16, color: "#10b981", fontWeight: 600 }}>🎉 You're all caught up for today!</p>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
        {results.results?.map((res, i) => {
          const isCorrect = res.isCorrect;
          return (
            <div key={i} style={{ background: "#fff", padding: 20, borderRadius: 16, border: `1px solid ${isCorrect ? "#10b981" : "#ef4444"}`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontWeight: 700, color: isCorrect ? "#10b981" : "#ef4444" }}>
                  {isCorrect ? "✅ Correct" : "❌ Wrong"}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b", background: "#f1f5f9", padding: "4px 8px", borderRadius: 6 }}>
                  Next revision in {res.newInterval} day(s)
                </span>
              </div>
              <p style={{ fontSize: 14, color: "#334155", marginBottom: 12, whiteSpace: "pre-wrap" }}>
                <strong>Explanation:</strong><br />
                {(() => {
                  const rawExp = lang === 'hi' && res.explanationHi ? res.explanationHi : res.explanation;
                  return rawExp ? rawExp.replace(/\\n/g, '\n').replace(/\/n/g, '\n') : '';
                })()}
              </p>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        {results.remaining > 0 && (
          <button onClick={onLoadMore} style={{ flex: 1, padding: 16, background: "#3b82f6", color: "#fff", border: "none", borderRadius: 12, fontWeight: 600, fontSize: 16, cursor: "pointer" }}>
            Continue Revision
          </button>
        )}
        <button onClick={onDone} style={{ flex: 1, padding: 16, background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 12, fontWeight: 600, fontSize: 16, cursor: "pointer" }}>
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
