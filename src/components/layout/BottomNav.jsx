const ITEMS = [
  ["home",      "🏠", "HOME"],
  ["revision",  "🧠", "REVISION"],
  ["analytics", "📊", "STATS"],
  ["bookmarks", "🔖", "SAVED"],
  ["profile",   "👤", "PROFILE"],
];

export default function BottomNav({ tab, C, onNavigate }) {
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ width: "100%", maxWidth: 600, background: `${C.hdr}`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-around", padding: "12px 16px 24px", pointerEvents: "auto" }}>
        {ITEMS.map(([id, icon, label]) => (
          <button key={id} onClick={() => onNavigate(id)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: "8px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)", borderRadius: 12 }} onMouseOver={e => e.currentTarget.style.background = tab !== id ? C.inp : 'transparent'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
            <span style={{ fontSize: 22, color: tab === id ? C.acc : C.muted, transform: tab === id ? 'scale(1.1)' : 'scale(1)', transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}>{icon}</span>
            <span style={{ fontSize: 10, color: tab === id ? C.acc : C.muted, fontWeight: tab === id ? 700 : 500, opacity: tab === id ? 1 : 0.7 }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}