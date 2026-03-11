export default function Header({
  back = false,
  onBack,
  titleOverride,
  subtitleOverride,
  onHome,
  screen,
  dataLoading,
  timer,
  fmt,
  toggleLang,
  toggleDark,
  lang,
  dark,
  C,
  t,
}) {
  return (
    <header
      style={{
        background: C.hdr,
        borderBottom: `1px solid ${C.border}`,
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 60,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {back ? (
          <button onClick={onBack} style={{ background: C.inp, border: `1px solid ${C.border}`, color: C.text, padding: "6px 12px", borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            {t.back}
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={onHome}>
            <div style={{ width: 28, height: 28, background: C.acc, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>CG</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.text, letterSpacing: "-0.5px" }}>{titleOverride || t.appName}</div>
              <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>{subtitleOverride || t.tagline}</div>
            </div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {screen === "quiz" && !dataLoading && (
          <div style={{ background: timer < 120 ? `${C.err}15` : `${C.acc}15`, color: timer < 120 ? C.err : C.acc, border: `1px solid ${timer < 120 ? C.err : C.acc}44`, borderRadius: 6, padding: "4px 10px", fontWeight: 600, fontSize: 14, fontFamily: "monospace" }}>
            {fmt(timer)}
          </div>
        )}
        <button onClick={toggleLang} style={{ background: C.inp, border: `1px solid ${C.border}`, color: C.text, padding: "4px 8px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>{lang === "en" ? "हिं" : "EN"}</button>
        <button onClick={toggleDark} style={{ background: C.inp, border: `1px solid ${C.border}`, color: C.text, padding: "4px 8px", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>{dark ? "☀️" : "🌙"}</button>
      </div>
    </header>
  );
}