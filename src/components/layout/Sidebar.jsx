import React, { useState, useEffect } from 'react';

export default function Sidebar({ activeTab, onNavigate, t, lang }) {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isDesktop) return null;

  const links = [
    { id: 'home', icon: 'ic-home', label: t.home || 'Dashboard' },
    { id: 'quizzes', icon: 'ic-check', label: 'Quizzes' },
    { id: 'bookmarks', icon: 'ic-bookmark', label: t.bookmarks || 'Bookmarks' },
    { id: 'analytics', icon: 'ic-chart', label: t.stats || 'Stats' },
    { id: 'history', icon: 'ic-clock', label: 'History' },
    { id: 'leaderboard', icon: 'ic-cup', label: t.rank || 'Rank' },
    { id: 'revision', icon: 'ic-book', label: 'Revision' },
    { id: 'profile', icon: 'ic-user', label: 'Settings' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo" onClick={() => onNavigate('home')}>
        <div className="ico">CG</div>
        <div>
          <div className="text">CGPSC Quiz</div>
          <div className="sub">by Daily Prep Notes</div>
        </div>
      </div>
      
      <div className="sidebar-nav">
        {links.map(link => (
          <div 
            key={link.id} 
            className="sidebar-link" 
            data-active={activeTab === link.id}
            onClick={() => onNavigate(link.id)}
          >
            <svg style={{ width: 20, height: 20, fill: 'currentColor' }}><use href={`#${link.icon}`}></use></svg>
            <span>{link.label}</span>
          </div>
        ))}
      </div>
      
      <div className="hover-raise active-state" style={{ marginTop: 'auto', background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)', padding: 20, borderRadius: 16, border: '1px solid var(--line-2)', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 90, height: 90, background: '#f59e0b', opacity: 0.15, borderRadius: '50%', filter: 'blur(20px)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 24, lineHeight: 1 }}>🔥</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: '-0.3px' }}>Daily Streak</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Active now</div>
          </div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>Today's Goal</span>
            <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800 }}>In Progress</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
            <div style={{ height: '100%', background: '#f59e0b', width: '33%', borderRadius: 2 }}></div>
          </div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', marginTop: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
          Keep Practicing <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
      </div>
    </div>
  );
}
