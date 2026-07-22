import React from 'react';

export default function RevisionDashboard({ stats, dueCount, onStart }) {
  if (!stats) return <p>Loading stats...</p>;

  return (
    <div style={{ padding: "32px 16px", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ background: "#f8fafc", padding: 24, borderRadius: 16, marginBottom: 24, border: "1px solid #e2e8f0" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px 0" }}>📝 Today's Revision</h2>
        <p style={{ margin: "0 0 16px 0", color: "#64748b" }}>You have {dueCount} questions due today.</p>
        
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1, background: "#fff", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Mastered</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#10b981" }}>{stats.mastered || 0}</div>
          </div>
          <div style={{ flex: 1, background: "#fff", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Learning</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#f59e0b" }}>{stats.learning || 0}</div>
          </div>
          <div style={{ flex: 1, background: "#fff", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Streak</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#f97316" }}>🔥 {stats.streak?.current || 0}</div>
          </div>
        </div>

        <button 
          onClick={onStart}
          disabled={dueCount === 0}
          style={{ 
            width: "100%", padding: 16, background: dueCount > 0 ? "#3b82f6" : "#cbd5e1", 
            color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600,
            cursor: dueCount > 0 ? "pointer" : "default"
          }}
        >
          {dueCount > 0 ? `Start Revision (${dueCount})` : "All Caught Up!"}
        </button>
      </div>
    </div>
  );
}
