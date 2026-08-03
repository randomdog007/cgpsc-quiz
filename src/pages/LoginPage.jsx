import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { supabase } from "../supabase";
import Spinner from "../components/ui/Spinner";

export default function LoginPage() {
  const { user, t, dark } = useAppContext();
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const signIn = async () => {
    try {
      setSigningIn(true);
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
      if (error) throw error;
      // auth state change will be picked up by AppContext
    } catch (err) {
      console.error(err);
      setSigningIn(false);
      alert("Failed to sign in. Please try again.");
    }
  };

  const css = ``;

  const C = dark
    ? { text: "#ededed" }
    : { text: "#111111" };

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: "var(--bg)", color: "var(--text)" }}>
      <style>{css}</style>
      <div style={{ maxWidth: 400, width: "100%", animation: "fadeUp 0.5s ease" }}>
        
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="mono" style={{ width: 72, height: 72, background: "var(--blue)", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 26, margin: "0 auto 16px", boxShadow: "0 8px 24px color-mix(in srgb, var(--blue) 35%, transparent)", fontFamily: "var(--disp)" }}>CG</div>
          <h1 className="greet" style={{ marginBottom: 4 }}>{t.appName}</h1>
          <p className="eyebrow" style={{ letterSpacing: "2px" }}>State Civil Services Portal</p>
        </div>
        
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 28, flexWrap: "wrap" }}>
          {[
            ["Paper 1", "General Studies", "var(--blue)", "var(--blue-soft)"], 
            ["Paper 2", "CSAT Aptitude", "var(--teal)", "var(--teal-soft)"]
          ].map(([p, d, c, bg]) => (
            <div key={p} style={{ background: bg, border: `1px solid color-mix(in srgb, ${c} 20%, transparent)`, borderRadius: "var(--r-sm)", padding: "10px 16px", textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: c }}>{p}</div>
              <div style={{ fontSize: 11, color: c, marginTop: 3, opacity: 0.8, fontWeight: 600 }}>{d}</div>
            </div>
          ))}
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 32 }}>
          {[["20", "Subjects"], ["83", "Topics"], ["2", "Papers"]].map(([n, l]) => (
            <div key={l} className="card-h" style={{ padding: "16px 8px", textAlign: "center", borderRadius: "var(--r-md)" }}>
              <div style={{ fontWeight: 800, fontSize: 22, color: "var(--ink)", fontFamily: "var(--disp)", lineHeight: 1.1 }}>{n}</div>
              <div className="eyebrow" style={{ marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
        
        <div className="card-h" style={{ padding: 32, borderRadius: "var(--r-lg)" }}>
          <p style={{ color: "var(--ink)", fontSize: 15, marginBottom: 24, textAlign: "center", fontWeight: 600, lineHeight: 1.5 }}>{t.signInMsg}</p>
          
          {signingIn ? (
            <div style={{ textAlign: "center", padding: "14px 0" }}>
              <Spinner text={t.signingIn} C={C} fallbackText={t.loading} />
            </div>
          ) : (
            <button onClick={signIn} className="btn-secondary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "14px", fontSize: 15, fontWeight: 700 }}>
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#EA4335" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z"/></svg>
              GOOGLE {t.signInGoogle}
            </button>
          )}
          
          <p style={{ textAlign: "center", fontSize: 11, color: "var(--muted)", marginTop: 20, lineHeight: 1.5, fontWeight: 500 }}>
            By signing in you agree to use this portal for CGPSC exam preparation only.
          </p>
        </div>
        
      </div>
    </div>
  );
}
