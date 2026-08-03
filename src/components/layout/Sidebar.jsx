import React, { useState, useEffect } from 'react';
import quotes from '../../data/quotes.json';

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

  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  const dailyQuote = quotes[(dayOfYear - 1) % quotes.length] || quotes[0];

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
      
      <div style={{ marginTop: 'auto', background: 'linear-gradient(135deg, rgba(245,158,11,0.05) 0%, rgba(245,158,11,0.1) 100%)', padding: 20, borderRadius: 16, border: '1px solid rgba(245,158,11,0.15)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, left: -20, width: 60, height: 60, background: '#f59e0b', opacity: 0.1, borderRadius: '50%', filter: 'blur(20px)' }} />
        <div style={{ fontSize: 24, marginBottom: 8, color: '#f59e0b', opacity: 0.8, lineHeight: 1 }}>❝</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 12 }}>
          "{dailyQuote.quote}"
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.5px' }}>
          — {dailyQuote.author}
        </div>
      </div>
    </div>
  );
}
