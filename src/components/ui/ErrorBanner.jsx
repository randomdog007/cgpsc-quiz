export default function ErrorBanner({ msg, C, onClose }) {
  if (!msg) return null;

  return (
    <div
      style={{
        background: `${C.err}11`,
        borderLeft: `4px solid ${C.err}`,
        padding: "12px 16px",
        margin: "16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: "0 8px 8px 0",
      }}
    >
      <span style={{ color: C.err, fontSize: 13, fontWeight: 500 }}>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: C.err, cursor: "pointer", fontSize: 18, lineHeight: 1 }}>
        x
      </button>
    </div>
  );
}
