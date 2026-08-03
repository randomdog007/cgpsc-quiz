const ITEMS = [
  { id: "home",        icon: "#ic-home", label: "Home" },
  { id: "revision",    icon: "#ic-rev",  label: "Revise" },
  { id: "leaderboard", icon: "#ic-rank", label: "Rank" },
  { id: "analytics",   icon: "#ic-chart",label: "Stats" },
  { id: "bookmarks",   icon: "#ic-save", label: "Saved" },
  { id: "profile",     icon: "#ic-user", label: "Profile" },
];

import { useNavigate } from "react-router-dom";

export default function BottomNav({ tab, onNavigate, profile }) {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @media (max-width: 400px) {
          .tabbar-item span:not(.rank-badge) {
            font-size: 8px;
            letter-spacing: 0;
          }
        }
        @media (max-width: 360px) {
          .tabbar-item span:not(.rank-badge) {
            display: none;
          }
        }
      `}</style>
      <nav className="tabbar" role="navigation" aria-label="Main navigation">
        {ITEMS.map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => {
              if (id === 'revision') navigate('/revision');
              else onNavigate(id);
            }}
            className={`tabbar-item touch-target active-state${tab === id ? " active" : ""}`}
            aria-current={tab === id ? "page" : undefined}
          >
            <svg className="ic"><use href={icon}></use></svg>
            <span>{label}</span>
            {id === "leaderboard" && profile?.rank && profile.rank !== "-" && (
              <span className="rank-badge" style={{ position: "absolute", top: 4, right: "calc(50% - 22px)", background: "var(--blue)", color: "#fff", fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 8, lineHeight: 1.5 }}>#{profile.rank}</span>
            )}
          </button>
        ))}
      </nav>
    </>
  );
}