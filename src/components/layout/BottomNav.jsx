const ITEMS = [
  ["home",      "🏠", "HOME"],
  ["analytics", "📊", "STATS"],
  ["bookmarks", "🔖", "SAVED"],
  ["profile",   "👤", "PROFILE"],
];

export default function BottomNav({ tab, C, onNavigate }) {
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200, background: C.hdr, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-around", padding: "10px 0", boxShadow: "0 -4px 12px rgba(0,0,0,0.03)" }}>
      {ITEMS.map(([id, icon, label]) => (
        <button key={id} onClick={() => onNavigate(id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: tab === id ? 1 : 0.6, transition: "all 0.2s" }}>
          <span style={{ fontSize: 20, color: tab === id ? C.acc : C.muted }}>{icon}</span>
          <span style={{ fontSize: 10, color: tab === id ? C.acc : C.muted, fontWeight: tab === id ? 600 : 500 }}>{label}</span>
        </button>
      ))}
    </div>
  );
}