import { useEffect, useState } from "react";
import { api, type ClaimWithOdds, type Position } from "../api";
import ClaimCard from "../components/ClaimCard";
import "./Feed.css";

type SortMode = "trending" | "recent" | "ending";
type FilterStatus = "all" | "active" | "resolved";

export default function Feed() {
  const [claims, setClaims] = useState<ClaimWithOdds[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [sort, setSort] = useState<SortMode>("trending");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getClaims(), api.getPositions()]).then(([c, p]) => {
      setClaims(c);
      setPositions(p);
      setLoading(false);
    });
  }, []);

  const filtered = claims.filter((c) => {
    if (filter === "active") return c.status === "active";
    if (filter === "resolved") return c.status !== "active";
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "trending") return b.position_count - a.position_count;
    if (sort === "recent")
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return a.total_staked - b.total_staked;
  });

  return (
    <div className="page">
      <div className="feed-header">
        <div>
          <h1 className="feed-title">Active Beliefs</h1>
          <p className="text-secondary mt-1">
            Stake your reputation on what you believe is true
          </p>
        </div>
        <div className="feed-stats">
          <div className="feed-stat-item">
            <span className="feed-stat-value">{claims.filter((c) => c.status === "active").length}</span>
            <span className="feed-stat-label">Active</span>
          </div>
          <div className="feed-stat-item">
            <span className="feed-stat-value">{claims.reduce((s, c) => s + c.total_staked, 0)}</span>
            <span className="feed-stat-label">Pts Staked</span>
          </div>
        </div>
      </div>

      <div className="feed-controls">
        <div className="filter-tabs">
          {(["all", "active", "resolved"] as FilterStatus[]).map((f) => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="sort-tabs">
          {(["trending", "recent", "ending"] as SortMode[]).map((s) => (
            <button
              key={s}
              className={`sort-tab ${sort === s ? "active" : ""}`}
              onClick={() => setSort(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="feed-loading">Loading claims...</div>
      ) : (
        <div className="feed-grid">
          {sorted.map((claim) => (
            <ClaimCard key={claim.id} claim={claim} positions={positions.filter((p) => p.claim_id === claim.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
