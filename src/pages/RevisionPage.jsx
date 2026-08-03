import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { supabase } from "../supabase";
import BottomNav from "../components/layout/BottomNav";
import Header from "../components/layout/Header";
import Spinner from "../components/ui/Spinner";
import { createRevisionController } from '../revision/revision-controller';

import RevisionDashboard from '../components/revision/RevisionDashboard';
import RevisionCard from '../components/revision/RevisionCard';
import RevisionResults from '../components/revision/RevisionResults';

export default function RevisionPage() {
  const { lang, setLang, dark, setDark, t, profile } = useAppContext();
  const navigate = useNavigate();
  
  const toggleLang = () => setLang(l => l === "en" ? "hi" : "en");
  const toggleDark = () => setDark(d => !d);
  const headerProps = { toggleLang, toggleDark, lang, dark };
  
  const onBack = () => navigate(-1);
  const onHome = () => navigate("/");
  const onTabNavigate = () => navigate("/");
  const tab = "revision";

  const C = dark
    ? { bg:"#000000", card:"#0a0a0a", border:"#222222", text:"#ededed", muted:"#888888", hdr:"rgba(0,0,0,0.75)", acc:"#3388FF", acc2:"#1c66d8", ok:"#14b8a6", err:"#ef4444", inp:"#111111", shadow:"0 4px 12px rgba(255,255,255,0.03)" }
    : { bg:"#fafafa", card:"#ffffff", border:"#eaeaea", text:"#111111", muted:"#666666", hdr:"rgba(255,255,255,0.85)", acc:"#0055FF", acc2:"#0044CC", ok:"#059669", err:"#e11d48", inp:"#f5f5f5", shadow:"0 2px 8px rgba(0,0,0,0.04)" };

  const ms  = { minHeight:"100vh", background: C.bg, color: C.text, paddingBottom: 80 };
  const css = ``;
  const [state, setState] = useState(null);

  const controller = useMemo(
    () => createRevisionController(setState, supabase),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [supabase]
  );

  useEffect(() => {
    controller.loadStats();
    // eslint-disable-next-line
  }, []);

  // Re-fetch live stats whenever the user returns to the idle/dashboard phase
  useEffect(() => {
    if (state && state.phase === 'idle') {
      controller.loadStats();
    }
    // eslint-disable-next-line
  }, [state?.phase]);

  if (!state) {
    return (
      <div style={ms}>
        <style>{css}</style>
        <Header back onBack={onBack} onHome={onHome} C={C} t={t} titleOverride="Daily Revision" />
        <Spinner text="Loading..." C={C} />
      </div>
    );
  }

  const renderPhase = () => {
    switch (state.phase) {
      case 'idle':
        return (
          <RevisionDashboard
            stats={state.stats}
            dueCount={state.dueCount}
            onStart={() => controller.startSession(20)}
          />
        );

      case 'loading':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 240, gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', border: '4px solid var(--line-2)', borderTopColor: '#0ea5e9', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 600 }}>Fetching your questions...</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        );

      case 'answering':
        return (
          <RevisionCard
            question={state.questions[state.currentIndex]}
            index={state.currentIndex}
            total={state.questions.length}
            selected={state.selectedOption}
            lang={lang}
            onSelect={controller.selectOption}
            onConfirm={controller.confirmAnswer}
            onSkip={controller.skipQuestion}
            onToggleLang={headerProps?.toggleLang || controller.toggleLang}
          />
        );

      // No separate 'feedback' phase — RevisionCard shows answer immediately

      case 'results':
        return (
          <RevisionResults
            results={state.results}
            lang={lang}
            onLoadMore={controller.loadMore}
            onDone={controller.reset}
            beforeMastered={state.beforeMastered}
            totalTracked={state.stats}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ ...ms, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{css}</style>

      {/* Header — explicitly passing headerProps so theme/language buttons work */}
      <Header back onBack={onBack} onHome={onHome} C={C} t={t} titleOverride="Daily Revision" {...headerProps} />

      {state.error && (
        <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid #fee2e2', fontSize: 14, fontWeight: 600 }}>
          {state.error}
          <button onClick={() => controller.reset()} style={{ marginLeft: 12, textDecoration: 'underline', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 14 }}>Dismiss</button>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {renderPhase()}
      </div>

      <BottomNav tab={tab} C={C} onNavigate={onTabNavigate} profile={profile} />
    </div>
  );
}
