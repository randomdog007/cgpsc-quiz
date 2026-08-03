export default function Spinner({ text, C = { border: '#ccc', acc: '#3388ff', muted: '#666' }, fallbackText }) {
  return (
    <div style={{ textAlign: "center", padding: 60 }}>
      <div
        style={{
          width: 32,
          height: 32,
          border: `3px solid ${C?.border || '#ccc'}`,
          borderTop: `3px solid ${C?.acc || '#3388ff'}`,
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 12px",
        }}
      />
      <p style={{ color: C?.muted || '#666', fontSize: 14, fontWeight: 500 }}>{text || fallbackText}</p>
    </div>
  );
}
