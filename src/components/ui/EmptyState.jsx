export default function EmptyState({ icon, title, desc, C }) {
  return (
    <div style={{ textAlign: "center", padding: 48, background: C.card, borderRadius: 8, border: `1px dashed ${C.border}` }}>
      <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.6 }}>{icon}</div>
      <div style={{ fontWeight: 600, color: C.text, marginBottom: 4, fontSize: 15 }}>{title}</div>
      <div style={{ color: C.muted, fontSize: 13 }}>{desc}</div>
    </div>
  );
}
