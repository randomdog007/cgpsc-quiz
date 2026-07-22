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
        background: `${C.hdr}cc`,
        backdropFilter: "blur(12px)",
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
        <a href="https://t.me/dailyprepnotes" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, color: '#0088cc', background: '#0088cc15', textDecoration: 'none', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/></svg>
        </a>
        <a href="https://www.instagram.com/daily_prep_notes" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, color: '#e1306c', background: '#e1306c15', textDecoration: 'none', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Zm4.75-9.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"/></svg>
        </a>
        <button onClick={toggleLang} style={{ background: C.inp, border: `1px solid ${C.border}`, color: C.text, padding: "4px 8px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>{lang === "en" ? "हिं" : "EN"}</button>
        <button onClick={toggleDark} style={{ background: C.inp, border: `1px solid ${C.border}`, color: C.text, padding: "4px 8px", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>{dark ? "☀️" : "🌙"}</button>
      </div>
    </header>
  );
}