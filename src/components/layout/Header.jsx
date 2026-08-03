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
    <>
    <header className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0, overflow: "hidden" }}>
        {back && (
          <button onClick={onBack} className="iconbtn touch-target active-state" aria-label={t.back} style={{ flexShrink: 0 }}>
            <svg className="ic"><use href="#ic-back"></use></svg>
          </button>
        )}
        {!back && (
          <div className="brand" onClick={onHome} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div className="mono">CG</div>
            {!titleOverride && (
              <div className="brand-t">
                <b style={{ color: "var(--ink)" }}>{t.appName}</b>
                <small style={{ color: "var(--muted)" }}>{subtitleOverride || t.tagline}</small>
              </div>
            )}
          </div>
        )}
        {titleOverride && (
          <div style={{ 
            fontSize: 16, 
            fontWeight: 700, 
            color: "var(--ink)", 
            whiteSpace: "nowrap", 
            overflow: "hidden", 
            textOverflow: "ellipsis", 
            textAlign: "left",
            flex: 1,
            minWidth: 0
          }}>
            {titleOverride}
          </div>
        )}
      </div>
      <div className="topbar-r">
        {screen === "quiz" && !dataLoading && (
          <div className="timer" data-urgent={timer < 120 ? "true" : "false"} style={{ background: timer < 120 ? "color-mix(in srgb, var(--crimson) 15%, transparent)" : "color-mix(in srgb, var(--blue) 15%, transparent)", color: timer < 120 ? "var(--crimson)" : "var(--blue)", border: `1px solid ${timer < 120 ? "color-mix(in srgb, var(--crimson) 25%, transparent)" : "color-mix(in srgb, var(--blue) 25%, transparent)"}`, borderRadius: 6, padding: "4px 10px", fontWeight: 600, fontSize: 14, fontFamily: "monospace" }}>
            {fmt(timer)}
          </div>
        )}
        <div className="social hide-on-mobile" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <a href="https://t.me/dailyprepnotes" target="_blank" rel="noopener noreferrer" className="iconbtn touch-target active-state" style={{ color: '#0088cc' }}>
            <svg viewBox="0 0 24 24" className="ic" fill="currentColor"><path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/></svg>
          </a>
          <a href="https://www.instagram.com/daily_prep_notes" target="_blank" rel="noopener noreferrer" className="iconbtn touch-target active-state" style={{ color: '#e1306c' }}>
            <svg viewBox="0 0 24 24" className="ic" fill="currentColor"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Zm4.75-9.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"/></svg>
          </a>
        </div>
        <button onClick={toggleLang} className="lang-pill touch-target active-state" aria-pressed={lang === "hi" ? "true" : "false"}>
          {lang === "en" ? "हिं" : "EN"}
        </button>
        <button onClick={toggleDark} className="iconbtn touch-target active-state">
          <svg className="ic"><use href={dark ? "#ic-sun" : "#ic-moon"}></use></svg>
        </button>
      </div>
    </header>
    <div className="topbar-progress"><i id="prepLine"></i></div>
    </>
  );
}