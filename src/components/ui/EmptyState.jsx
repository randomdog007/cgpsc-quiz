export default function EmptyState({ icon, title, desc, C }) {
  return (
    <div style={{ textAlign: "center", padding: "64px 32px", background: `linear-gradient(to bottom, ${C.card}, ${C.inp})`, borderRadius: 16, border: `1.5px dashed ${C.border}`, boxShadow: `inset 0 2px 4px rgba(255,255,255,0.05)` }}>
      <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.8, filter: "grayscale(20%)" }}>{icon}</div>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 8, fontSize: 16, letterSpacing: "-0.2px" }}>{title}</div>
      <div style={{ color: C.muted, fontSize: 14, lineHeight: 1.5, maxWidth: 280, margin: "0 auto" }}>{desc}</div>
    </div>
  );
}
