import React, { useState, useEffect, useCallback } from 'react';
import BottomNav from "../components/layout/BottomNav";
import Header from "../components/layout/Header";
import Spinner from "../components/ui/Spinner";
import { createRevisionController } from '../revision/revision-controller';

import RevisionDashboard from '../components/revision/RevisionDashboard';
import RevisionCard from '../components/revision/RevisionCard';
import RevisionFeedback from '../components/revision/RevisionFeedback';
import RevisionResults from '../components/revision/RevisionResults';

export default function RevisionPage({ ms, css, C, t, onBack, onHome, supabase, onTabNavigate, tab }) {
  const [state, setState] = useState(null);

  const controller = useCallback(
    createRevisionController(setState, supabase),
    [supabase]
  );

  useEffect(() => {
    controller.loadStats();
    // eslint-disable-next-line
  }, []);

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
        return <Spinner text="Fetching questions..." C={C} />;

      case 'answering':
        return (
          <RevisionCard
            question={state.questions[state.currentIndex]}
            index={state.currentIndex}
            total={state.questions.length}
            selected={state.selectedOption}
            lang={state.lang}
            onSelect={controller.selectOption}
            onConfirm={controller.confirmAnswer}
            onSkip={controller.skipQuestion}
            onToggleLang={controller.toggleLang}
          />
        );

      case 'feedback':
        return (
          <RevisionFeedback
            question={state.questions[state.currentIndex]}
            userAnswer={state.answers[state.questions[state.currentIndex]?.questionId]}
            lang={state.lang}
            onNext={controller.next}
            isLast={state.currentIndex === state.questions.length - 1}
          />
        );

      case 'results':
        return (
          <RevisionResults
            results={state.results}
            lang={state.lang}
            onLoadMore={controller.loadMore}
            onDone={controller.reset}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={{ ...ms, height: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{css}</style>
      <Header back onBack={onBack} onHome={onHome} C={C} t={t} titleOverride="Daily Revision" />
      
      {state.error && (
        <div style={{ background: "#fef2f2", color: "#ef4444", padding: 16, textAlign: "center", borderBottom: "1px solid #fee2e2" }}>
          {state.error}
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto" }}>
        {renderPhase()}
      </div>
      <BottomNav tab={tab} C={C} onNavigate={onTabNavigate} />
    </div>
  );
}
