import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import Avatar from './ui/Avatar';

export default function LeaderboardView({ C, user }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRankData, setUserRankData] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      // Fetch top 20
      const { data } = await supabase.from('profiles')
        .select('id, full_name, email, avatar_url, total_score, avg_accuracy, current_streak')
        .order('total_score', { ascending: false })
        .limit(20);
        
      if (data) setLeaders(data.filter(p => p.total_score > 0));

      if (user?.id) {
        // Fetch user specific rank using our custom API endpoint
        const res = await fetch(`/api/user_rank?eq_user_id=${user.id}`);
        const rankRes = await res.json();
        if (rankRes?.data) setUserRankData(rankRes.data);
      }
      setLoading(false);
    };
    
    fetchLeaderboard();
  }, [user]);

  const renderRow = (leader, idx, isPinned = false) => {
    const isCurrentUser = user && user.id === leader.id;
    return (
      <div key={isPinned ? 'pinned-user' : leader.id} style={{ display: 'flex', alignItems: 'center', padding: "12px 16px", borderBottom: !isPinned && idx < leaders.length - 1 ? `1px solid var(--line-2)` : 'none', background: isCurrentUser ? `color-mix(in srgb, var(--teal) 10%, transparent)` : (isPinned ? "var(--surface)" : 'transparent'), borderTop: isPinned ? `2px solid color-mix(in srgb, var(--teal) 30%, transparent)` : 'none', position: isPinned ? 'sticky' : 'relative', bottom: isPinned ? 0 : 'auto', zIndex: isPinned ? 10 : 1, boxShadow: isPinned ? '0 -4px 12px rgba(0,0,0,0.05)' : 'none' }}>
        <div style={{ width: 35, fontSize: 15, fontWeight: 700, color: (idx < 3 && !isPinned) ? "var(--teal)" : "var(--muted)" }}>#{idx + 1}</div>
        <Avatar ini={(leader.full_name || leader.email || "A").slice(0,2).toUpperCase()} size={40} pic={leader.avatar_url} color="var(--teal)" borderColor="var(--line-2)" />
        
        <div style={{ marginLeft: 12, flex: 1 }}>
          <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
            {leader.full_name || "Aspirant"}
            {isCurrentUser && <span style={{ fontSize: 10, background: "var(--teal)", color: '#fff', padding: '2px 6px', borderRadius: 10 }}>YOU</span>}
            <span style={{ fontSize: 10, border: `1px solid var(--line-2)`, color: "var(--muted)", padding: '2px 6px', borderRadius: 10 }}>
              {leader.total_score < 100 ? "Aspirant" : leader.total_score < 500 ? "Scholar" : "Officer"}
            </span>
          </div>
          <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>{leader.avg_accuracy}% Accuracy • 🔥 {leader.current_streak} Streak</div>
        </div>
        
        <div style={{ fontWeight: 700, color: "var(--teal)", fontSize: 16 }}>
          {leader.total_score} <span style={{ fontSize: 12, opacity: 0.8 }}>XP</span>
        </div>
      </div>
    );
  };

  const isUserInTop20 = leaders.some(l => l.id === user?.id);

  return (
      <div style={{ padding: "16px", paddingBottom: 100, maxWidth: 600, margin: "0 auto", animation: "fadeUp 0.3s ease" }}>
        
        {/* User Rank Badge (Hero) */}
        {userRankData && userRankData.rank > 0 && (
          <div style={{ background: "var(--surface)", border: `1px solid var(--teal)`, borderRadius: 16, padding: 24, color: "var(--ink)", marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: `0 8px 24px color-mix(in srgb, var(--teal) 15%, transparent)` }}>
            <div>
              <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '1px', color: "var(--muted)", fontWeight: 600, marginBottom: 4 }}>Your Global Rank</div>
              <div style={{ fontSize: 32, fontWeight: 800, display: 'flex', alignItems: 'baseline', gap: 4, color: "var(--teal)" }}>
                #{userRankData.rank} <span style={{ fontSize: 14, fontWeight: 500, color: "var(--muted)" }}>of {userRankData.totalUsers}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--teal)" }}>Top {userRankData.percentile}%</div>
              <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Percentile</div>
            </div>
          </div>
        )}

        {/* Top 3 Podium */}
        {leaders.length >= 3 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 10, margin: '20px 0 40px' }}>
            {/* Rank 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar ini={(leaders[1].full_name || leaders[1].email || "A").slice(0,2).toUpperCase()} size={60} pic={leaders[1].avatar_url} color="#94a3b8" borderColor="#94a3b8" />
              <div style={{ width: 80, height: 80, background: 'linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%)', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'center', color: '#475569', fontWeight: 800, fontSize: 32, paddingTop: 10, marginTop: 8, boxShadow: '0 -4px 12px rgba(0,0,0,0.05)' }}>2</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", marginTop: 4, width: 80, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leaders[1].full_name?.split(' ')[0] || "Aspirant"}</div>
              <div style={{ fontSize: 11, color: "var(--teal)", fontWeight: 700 }}>{leaders[1].total_score} pts</div>
            </div>
            
            {/* Rank 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
              <div style={{ fontSize: 24, marginBottom: -10, zIndex: 3 }}>👑</div>
              <Avatar ini={(leaders[0].full_name || leaders[0].email || "A").slice(0,2).toUpperCase()} size={80} pic={leaders[0].avatar_url} color="#fbbf24" borderColor="#fbbf24" />
              <div style={{ width: 90, height: 110, background: 'linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'center', color: '#b45309', fontWeight: 800, fontSize: 40, paddingTop: 10, marginTop: 8, boxShadow: '0 -4px 16px rgba(0,0,0,0.1)' }}>1</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginTop: 4, width: 90, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leaders[0].full_name?.split(' ')[0] || "Aspirant"}</div>
              <div style={{ fontSize: 12, color: "var(--teal)", fontWeight: 800 }}>{leaders[0].total_score} pts</div>
            </div>

            {/* Rank 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar ini={(leaders[2].full_name || leaders[2].email || "A").slice(0,2).toUpperCase()} size={60} pic={leaders[2].avatar_url} color="#b45309" borderColor="#b45309" />
              <div style={{ width: 80, height: 60, background: 'linear-gradient(180deg, #ffedd5 0%, #fed7aa 100%)', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'center', color: '#9a3412', fontWeight: 800, fontSize: 28, paddingTop: 10, marginTop: 8, boxShadow: '0 -4px 12px rgba(0,0,0,0.05)' }}>3</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", marginTop: 4, width: 80, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leaders[2].full_name?.split(' ')[0] || "Aspirant"}</div>
              <div style={{ fontSize: 11, color: "var(--teal)", fontWeight: 700 }}>{leaders[2].total_score} pts</div>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>Loading...</div>
        ) : (
          <div style={{ background: "var(--surface)", borderRadius: 12, border: `1px solid var(--line-2)`, position: 'relative' }}>
            <div style={{ overflow: 'hidden', borderRadius: 12 }}>
              {leaders.map((leader, i) => renderRow(leader, i))}
            </div>
            
            {/* Pinned User Row */}
            {user && userRankData && userRankData.user && !isUserInTop20 && userRankData.rank > 0 && (
              renderRow(userRankData.user, userRankData.rank - 1, true)
            )}
            
            {leaders.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: "var(--muted)" }}>No scores yet. Take a quiz to be the first!</div>
            )}
          </div>
        )}
      </div>
  );
}
