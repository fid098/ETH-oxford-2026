import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type UserProfile } from "../api";
import { LeaderboardSkeleton } from "../components/LoadingSkeletons";
import { toast } from "../components/Toast";
import "./Leaderboard.css";

export default function Leaderboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    }).catch((err) => {
      toast(err instanceof Error ? err.message : "Failed to load leaderboard", "error");
      setLoading(false);
    });
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
