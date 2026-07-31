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
      
      <div style={{ marginTop: 'auto', background: '#1c2f25', padding: 20, borderRadius: 16, position: 'relative', overflow: 'hidden' }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: '#fff' }}>Stay Consistent, Crack It!</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4, maxWidth: '80%' }}>Daily practice leads to success.</div>
        <svg style={{ position: 'absolute', right: -10, bottom: -10, width: 64, height: 64, opacity: 0.8 }} viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="6"></circle>
          <circle cx="12" cy="12" r="2"></circle>
          <path d="M12 2v2"></path>
          <path d="M12 20v2"></path>
          <path d="M22 12h-2"></path>
          <path d="M4 12H2"></path>
          <path d="M19 5l-2.5 2.5"></path>
        </svg>
      </div>
    </div>
  );
}
