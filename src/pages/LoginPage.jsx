import Spinner from "../components/ui/Spinner";

export default function LoginPage({ dark, css, C, t, signingIn, signIn }) {
  return (
    <div style={{ minHeight: "100vh", background: dark ? "#0f172a" : "#f1f5f9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Manrope','Noto Sans Devanagari',sans-serif" }}>
      <style>{css}</style>
      <div style={{ maxWidth: 400, width: "100%", animation: "fadeUp 0.5s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, background: "linear-gradient(135deg,#2563eb,#1d4ed8)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 22, margin: "0 auto 14px", boxShadow: "0 8px 24px rgba(37,99,235,0.35)" }}>CG</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4, letterSpacing: "-0.5px" }}>{t.appName}</h1>
          <p style={{ color: C.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: "2px", fontWeight: 600 }}>State Civil Services Portal</p>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24, flexWrap: "wrap" }}>
          {[["Paper 1", "General Studies + CG", "#2563eb"], ["Paper 2", "CSAT Aptitude", "#0f766e"]].map(([p, d, c]) => (
            <div key={p} style={{ background: `${c}12`, border: `1px solid ${c}33`, borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: c }}>{p}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{d}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 24 }}>
          {[["20", "Subjects"], ["83", "Topics"], ["2", "Papers"]].map(([n, l]) => (
            <div key={l} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 8px", textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: C.text }}>{n}</div>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 500, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.5px" }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 28, boxShadow: "0 10px 40px rgba(0,0,0,0.06)" }}>
          <p style={{ color: C.text, fontSize: 14, marginBottom: 20, textAlign: "center", fontWeight: 500, lineHeight: 1.5 }}>{t.signInMsg}</p>
          {signingIn ? <div style={{ textAlign: "center", padding: "12px 0" }}><Spinner text={t.signingIn} C={C} fallbackText={t.loading} /></div> : <button onClick={signIn} style={{ width: "100%", background: "#fff", border: "1.5px solid #dadce0", borderRadius: 8, padding: "13px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#3c4043", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>GOOGLE {t.signInGoogle}</button>}
          <p style={{ textAlign: "center", fontSize: 11, color: C.muted, marginTop: 16, lineHeight: 1.5 }}>By signing in you agree to use this portal for CGPSC exam preparation only.</p>
        </div>
      </div>
    </div>
  );
}
