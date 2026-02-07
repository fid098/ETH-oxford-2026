import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, type UserProfile as UserProfileType } from "../api";
import "./UserProfile.css";

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    api.getUser(username).then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, [username]);

  if (loading || !user) {
    return <div className="page feed-loading">Loading...</div>;
  }

  const categories = Object.entries(user.category_stats);

  return (
    <div className="page">
      <Link to="/" className="back-link">&larr; Back to Feed</Link>

      <div className="profile-header card">
        <div className="profile-avatar-lg">
          {user.username[0].toUpperCase()}
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{user.display_name}</h1>
          <span className="profile-username">@{user.username}</span>
        </div>
        <div className="profile-top-stats">
          <div className="profile-stat-card">
            <span className="profile-stat-number text-blue">
              {user.points.toLocaleString()}
            </span>
            <span className="profile-stat-desc">Points</span>
          </div>
          <div className="profile-stat-card">
            <span className={`profile-stat-number ${user.accuracy !== null && user.accuracy >= 60 ? "text-green" : user.accuracy !== null ? "text-red" : "text-muted"}`}>
              {user.accuracy !== null ? `${user.accuracy}%` : "N/A"}
            </span>
            <span className="profile-stat-desc">Accuracy</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-number">
              {user.total_resolved}
            </span>
            <span className="profile-stat-desc">Resolved</span>
          </div>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="profile-section">
          <h2 className="section-title">Category Breakdown</h2>
          <div className="category-grid">
            {categories.map(([cat, stats]) => (
              <div key={cat} className="category-card card">
                <div className="category-header">
                  <span className="badge badge-category">{cat}</span>
                  <span className={`category-accuracy ${stats.accuracy >= 60 ? "text-green" : "text-red"}`}>
                    {stats.accuracy}%
                  </span>
                </div>
                <div className="category-bar-bg">
                  <div
                    className="category-bar-fill"
                    style={{
                      width: `${stats.accuracy}%`,
                      background: stats.accuracy >= 60
                        ? "linear-gradient(90deg, #22c55e, #4ade80)"
                        : "linear-gradient(90deg, #ef4444, #f87171)",
                    }}
                  />
                </div>
                <span className="text-muted" style={{ fontSize: 12 }}>
                  {stats.correct}/{stats.total} correct
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="profile-section">
        <h2 className="section-title">
          Active Positions ({user.active_positions.length})
        </h2>
        {user.active_positions.length === 0 ? (
          <p className="text-muted">No active positions</p>
        ) : (
          <div className="positions-list">
            {user.active_positions.map((p) => (
              <Link to={`/claim/${p.claim_id}`} key={p.id} className="profile-position card card-clickable">
                <div className="profile-pos-left">
                  <span className={`profile-pos-side ${p.side === "yes" ? "text-green" : "text-red"}`}>
                    {p.side === "yes" ? "TRUE" : "FALSE"}
                  </span>
                  <span className="text-secondary">{p.claim_id}</span>
                </div>
                <div className="profile-pos-right">
                  <span className="font-semibold">{p.stake} pts</span>
                  <span className="text-muted">{Math.round(p.confidence * 100)}% conf</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="profile-section">
        <h2 className="section-title">
          Resolved Positions ({user.resolved_positions.length})
        </h2>
        {user.resolved_positions.length === 0 ? (
          <p className="text-muted">No resolved positions yet</p>
        ) : (
          <div className="positions-list">
            {user.resolved_positions.map((p) => (
              <Link to={`/claim/${p.claim_id}`} key={p.id} className="profile-position card card-clickable">
                <div className="profile-pos-left">
                  <span className={`profile-pos-side ${p.side === "yes" ? "text-green" : "text-red"}`}>
                    {p.side === "yes" ? "TRUE" : "FALSE"}
                  </span>
                  <span className="text-secondary">{p.claim_id}</span>
                </div>
                <div className="profile-pos-right">
                  <span className="font-semibold">{p.stake} pts</span>
                  <span className="text-muted">{Math.round(p.confidence * 100)}% conf</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
