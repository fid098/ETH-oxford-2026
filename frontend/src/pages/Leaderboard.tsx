import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type UserProfile } from "../api";
import { LeaderboardSkeleton } from "../components/LoadingSkeletons";
import { toast } from "../components/Toast";
import "./Leaderboard.css";

export default function Leaderboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadLeaderboard = () => {
    setLoading(true);
    setLoadError(null);
    api.getUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    }).catch((err) => {
      const msg = err instanceof Error ? err.message : "Failed to load leaderboard";
      setLoadError(msg);
      toast(msg, "error");
      setLoading(false);
    });
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const sorted = [...users].sort((a, b) => {
    if (a.accuracy === null && b.accuracy === null) return b.points - a.points;
    if (a.accuracy === null) return 1;
    if (b.accuracy === null) return -1;
    return b.accuracy - a.accuracy;
  });

  return (
    <div className="page">
      <h1 className="feed-title" style={{ marginBottom: 8 }}>Leaderboard</h1>
      <p className="text-secondary" style={{ marginBottom: 24 }}>
        Top predictors ranked by accuracy
      </p>

      {loading ? (
        <LeaderboardSkeleton />
      ) : loadError ? (
        <div className="error-state card">
          <div className="error-state-icon">!</div>
          <h3 className="error-state-title">Failed to load leaderboard</h3>
          <p className="error-state-msg">{loadError}</p>
          <button className="btn btn-green" onClick={loadLeaderboard}>Retry</button>
        </div>
      ) : sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">{"\uD83C\uDFC6"}</div>
          <h3 className="empty-state-title">No predictors yet</h3>
          <p className="empty-state-msg">The leaderboard will populate once users start taking positions on claims.</p>
        </div>
      ) : (
        <div className="leaderboard-list">
          {sorted.map((user, i) => (
            <Link to={`/user/${user.username}`} key={user.username} className="lb-row card card-clickable">
              <div className="lb-rank">
                {i < 3 ? (
                  <span className={`lb-medal medal-${i}`}>{i + 1}</span>
                ) : (
                  <span className="lb-rank-num">{i + 1}</span>
                )}
              </div>
              <div className="lb-avatar">{user.username[0].toUpperCase()}</div>
              <div className="lb-info">
                <span className="lb-name">{user.display_name}</span>
                <span className="lb-username">@{user.username}</span>
              </div>
              <div className="lb-stats">
                <div className="lb-stat">
                  <span className={`lb-stat-val ${user.accuracy !== null && user.accuracy >= 60 ? "text-green" : user.accuracy !== null ? "text-red" : "text-muted"}`}>
                    {user.accuracy !== null ? `${user.accuracy}%` : "N/A"}
                  </span>
                  <span className="lb-stat-label">Accuracy</span>
                </div>
                <div className="lb-stat">
                  <span className="lb-stat-val text-accent">{user.points.toLocaleString()}</span>
                  <span className="lb-stat-label">Points</span>
                </div>
                <div className="lb-stat">
                  <span className="lb-stat-val">{user.total_resolved}</span>
                  <span className="lb-stat-label">Resolved</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
