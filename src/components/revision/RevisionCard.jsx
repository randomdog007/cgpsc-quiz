import React from 'react';

export default function RevisionCard({ question, index, total, selected, lang, onSelect, onConfirm, onSkip, onToggleLang }) {
  if (!question) return null;

  const formatText = (str) => {
    if (!str) return '';
    return str.replace(/\\n/g, '\n').replace(/\/n/g, '\n');
  };

  const text = formatText(lang === 'hi' && question.textHi ? question.textHi : question.text);
  const options = [question.options?.a, question.options?.b, question.options?.c, question.options?.d].map(formatText);
  const optionsHi = [question.optionsHi?.a, question.optionsHi?.b, question.optionsHi?.c, question.optionsHi?.d].map(formatText);

  return (
    <div style={{ padding: "24px 16px", maxWidth: 600, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#64748b" }}>Question {index + 1} of {total}</span>
        <button onClick={onToggleLang} style={{ background: "none", border: "1px solid #cbd5e1", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>
          {lang === 'en' ? 'हिं' : 'EN'}
        </button>
      </div>

      <div style={{ background: "#fff", padding: 24, borderRadius: 16, border: "1px solid #e2e8f0", marginBottom: 24 }}>
        <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 24, whiteSpace: "pre-wrap" }}>{text}</p>
        
        {question.wrongCount > 0 && (
          <div style={{ display: "inline-block", background: "#fef2f2", color: "#ef4444", padding: "4px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600, marginBottom: 16 }}>
            ⚠️ You've missed this {question.wrongCount}×
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {options.map((opt, i) => {
            const optText = lang === 'hi' && optionsHi[i] ? optionsHi[i] : opt;
            const isSelected = selected === i;
            return (
              <button 
                key={i} 
                onClick={() => onSelect(i)}
                style={{
                  padding: 16, textAlign: "left", borderRadius: 12, fontSize: 14, cursor: "pointer",
                  border: `2px solid ${isSelected ? "#3b82f6" : "#e2e8f0"}`,
                  background: isSelected ? "#eff6ff" : "#fff",
                  display: "flex", alignItems: "center", gap: 12
                }}
              >
                <span style={{ fontWeight: 600, color: isSelected ? "#3b82f6" : "#64748b" }}>{["A","B","C","D"][i]}</span>
                <span style={{ color: isSelected ? "#1e40af" : "#334155", whiteSpace: "pre-wrap" }}>{optText}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={onSkip} style={{ flex: 1, padding: 16, borderRadius: 12, background: "#f1f5f9", color: "#475569", border: "none", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
          Skip
        </button>
        <button onClick={onConfirm} disabled={selected === null} style={{ flex: 2, padding: 16, borderRadius: 12, background: selected !== null ? "#3b82f6" : "#94a3b8", color: "#fff", border: "none", fontSize: 16, fontWeight: 600, cursor: selected !== null ? "pointer" : "not-allowed" }}>
          Confirm
        </button>
      </div>

    </div>
  );
}
