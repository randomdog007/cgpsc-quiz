import React from 'react';

export default function RevisionFeedback({ question, userAnswer, lang, onNext, isLast }) {
  // We don't have explanation or correctOption here yet because they come from results!
  // Wait, the spec says: "Reads: state.results?.results (after full submit, for explanation)"
  // But wait, the feedback phase happens BEFORE submitAll() is called!
  // Let's re-read the spec:
  // "User sees Question 12 → confirmAnswer() → next()"
  // "All answered → submitAll() -> GET EXPLANATIONS"
  // If the user answers one by one, and we don't submit until the END, we don't have explanations during the feedback phase!
  // Let me output exactly what they asked for, which is just acknowledging the answer is recorded.

  return (
    <div style={{ padding: "32px 16px", maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Answer Recorded</h3>
      <p style={{ color: "#64748b", marginBottom: 32 }}>We'll reveal the correct answers and explanations at the end of the session.</p>
      
      <button onClick={onNext} style={{ width: "100%", padding: 16, borderRadius: 12, background: "#3b82f6", color: "#fff", border: "none", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
        {isLast ? "Submit Session →" : "Next Question →"}
      </button>
    </div>
  );
}
