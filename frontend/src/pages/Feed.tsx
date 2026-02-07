import { useEffect, useMemo, useState } from "react";
import { api, type ClaimWithOdds, type Position } from "../api";
import ClaimCard from "../components/ClaimCard";
import CreateClaimModal from "../components/CreateClaimModal";
import { FeedSkeleton } from "../components/LoadingSkeletons";
import { toast } from "../components/Toast";
import "./Feed.css";

type SortMode = "trending" | "recent" | "ending";
type FilterStatus = "all" | "active" | "resolved";

export default function Feed() {
  const [claims, setClaims] = useState<ClaimWithOdds[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [sort, setSort] = useState<SortMode>("trending");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    setLoading(true);
    const [claimsResult, positionsResult] = await Promise.allSettled([
      api.getClaims(),
      api.getPositions(),
    ]);

    if (claimsResult.status === "fulfilled") {
      setClaims(claimsResult.value);
    } else {
      toast(claimsResult.reason?.message ?? "Failed to load claims", "error");
    }

    if (positionsResult.status === "fulfilled") {
      setPositions(positionsResult.value);
    } else {
      setPositions([]);
      toast(positionsResult.reason?.message ?? "Failed to load positions", "error");
    }

    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const categories = useMemo(() => {
    const unique = new Set(claims.map((c) => c.category));
    return ["all", ...Array.from(unique).sort()];
  }, [claims]);

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = claims.filter((c) => {
    if (filter === "active") return c.status === "active";
    if (filter === "resolved") return c.status !== "active";
    return true;
  }).filter((c) => {
    if (category !== "all" && c.category !== category) return false;
    if (!normalizedQuery) return true;
    return (
      c.title.toLowerCase().includes(normalizedQuery) ||
      c.description.toLowerCase().includes(normalizedQuery)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "trending") return b.position_count - a.position_count;
    if (sort === "recent")
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    // "ending" = oldest claims first (closest to resolution)
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return (
    <div className="page">
      <div className="feed-header">
        <div>
          <h1 className="feed-title">Active Beliefs</h1>
          <p className="text-secondary mt-1">
            Stake your reputation on what you believe is true
          </p>
          <button className="btn btn-green mt-3" onClick={() => setShowCreate(true)}>
            + New Claim
          </button>
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
        <div className="feed-controls-row">
          <div className="feed-search">
            <input
              type="text"
              placeholder="Search claims..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="feed-category">
            <span className="feed-category-label">Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All categories" : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="feed-controls-row">
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
      </div>

      {loading ? (
        <FeedSkeleton />
      ) : (
        <div className="feed-grid">
          {sorted.length === 0 ? (
            <div className="feed-empty">No claims match your filters.</div>
          ) : (
            sorted.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} positions={positions.filter((p) => p.claim_id === claim.id)} />
            ))
          )}
        </div>
      )}

      <CreateClaimModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={load} />
    </div>
  );
}
