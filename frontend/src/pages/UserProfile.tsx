import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, type UserProfile as UserProfileType, type ClaimWithOdds } from "../api";
import { ProfileSkeleton } from "../components/LoadingSkeletons";
import { toast } from "../components/Toast";
import "./UserProfile.css";

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<UserProfileType | null>(null);
  const [claims, setClaims] = useState<ClaimWithOdds[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadProfile = () => {
    if (!username) return;
    setLoading(true);
    setLoadError(null);
    Promise.all([api.getUser(username), api.getClaims()]).then(([u, c]) => {
      setUser(u);
      setClaims(c);
      setLoading(false);
    }).catch((err) => {
      const msg = err instanceof Error ? err.message : "Failed to load profile";
      setLoadError(msg);
      toast(msg, "error");
      setLoading(false);
    });
  };

  useEffect(() => {
    loadProfile();
  }, [username]);

  const claimById = useMemo(() => {
    const map = new Map<string, ClaimWithOdds>();
    for (const claim of claims) {
      map.set(claim.id, claim);
    }
    return map;
  }, [claims]);

  if (loading) {
    return (
      <div className="page">
        <ProfileSkeleton />
      </div>
    );
  }

  if (loadError || !user) {
    return (
      <div className="page">
        <Link to="/" className="back-link">&larr; Back to Feed</Link>
        <div className="error-state card">
          <div className="error-state-icon">!</div>
          <h3 className="error-state-title">Failed to load profile</h3>
          <p className="error-state-msg">{loadError ?? "User not found"}</p>
          <button className="btn btn-green" onClick={loadProfile}>Retry</button>
        </div>
      </div>
    );
  }

  const categories = Object.entries(user.category_stats);
  const myClaims = claims.filter((claim) => claim.created_by === user.username);

  const calibrationBuckets = [
    { min: 0.5, max: 0.59, label: "50-59%" },
    { min: 0.6, max: 0.69, label: "60-69%" },
    { min: 0.7, max: 0.79, label: "70-79%" },
    { min: 0.8, max: 0.89, label: "80-89%" },
    { min: 0.9, max: 0.99, label: "90-99%" },
  ];

  const calibrationData = calibrationBuckets.map((bucket) => {
    const resolved = user.resolved_positions
      .map((p) => {
        const claim = claimById.get(p.claim_id);
        if (!claim || claim.status === "active") return null;
        const resolvedSide = claim.status === "resolved_yes" ? "yes" : "no";
        const correct = p.side === resolvedSide;
        return { confidence: p.confidence, correct };
      })
      .filter((p): p is { confidence: number; correct: boolean } => Boolean(p))
      .filter((p) => p.confidence >= bucket.min && p.confidence <= bucket.max);

    const total = resolved.length;
    const correctCount = resolved.filter((p) => p.correct).length;
    const accuracy = total ? Math.round((correctCount / total) * 100) : 0;
    const avgConfidence = total
      ? Math.round((resolved.reduce((s, p) => s + p.confidence, 0) / total) * 100)
      : Math.round(((bucket.min + bucket.max) / 2) * 100);

    return {
      ...bucket,
      total,
      accuracy,
      avgConfidence,
    };
  });

  const hasCalibration = calibrationData.some((d) => d.total > 0);

  const handleDeleteClaim = async (claimId: string) => {
    if (!window.confirm("Delete this claim? This cannot be undone.")) return;
    setDeletingId(claimId);
    try {
      await api.deleteClaim(claimId, user.username);
      setClaims((prev) => prev.filter((c) => c.id !== claimId));
      toast("Claim deleted", "success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete claim";
      toast(message, "error");
    } finally {
      setDeletingId(null);
    }
  };

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
          {user.wallet_address && (
            <div className="profile-wallet-row">
              <span className="profile-wallet-addr" title={user.wallet_address}>
                {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
              </span>
            </div>
          )}
        </div>
        <div className="profile-top-stats">
          <div className="profile-stat-card">
            <span className="profile-stat-number text-accent">
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
                        ? "linear-gradient(90deg, #1f9d55, #67d18f)"
                        : "linear-gradient(90deg, #0f6b3f, #1f8a52)",
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
        <h2 className="section-title">Confidence Calibration</h2>
        {hasCalibration ? (
          <div className="calibration-chart card">
            <div className="calibration-legend">
              <span className="calibration-legend-item">
                <span className="calibration-dot" />
                Actual accuracy
              </span>
              <span className="calibration-legend-item">
                <span className="calibration-marker-dot" />
                Avg confidence
              </span>
            </div>
            <div className="calibration-rows">
              {calibrationData.map((bucket) => (
                <div key={bucket.label} className={`calibration-row ${bucket.total === 0 ? "is-empty" : ""}`}>
                  <span className="calibration-label">{bucket.label}</span>
                  <div className="calibration-track">
                    <div className="calibration-fill" style={{ width: `${bucket.accuracy}%` }} />
                    {bucket.total > 0 && (
                      <span className="calibration-marker" style={{ left: `${bucket.avgConfidence}%` }} />
                    )}
                  </div>
                  <span className="calibration-meta">
                    {bucket.total === 0
                      ? "No data"
                      : `${bucket.accuracy}% actual - ${bucket.avgConfidence}% conf - ${bucket.total} bets`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card">
            <p className="text-muted">Not enough resolved positions to calibrate yet.</p>
          </div>
        )}
      </div>

      <div className="profile-section">
        <h2 className="section-title">
          Claims Created ({myClaims.length})
        </h2>
        {myClaims.length === 0 ? (
          <p className="text-muted">No claims created yet</p>
        ) : (
          <div className="created-claims">
            {myClaims.map((claim) => {
              const canDelete = claim.position_count === 0;
              return (
                <div key={claim.id} className="created-claim card">
                  <div className="created-claim-main">
                    <div>
                      <h3 className="created-claim-title">{claim.title}</h3>
                      <div className="created-claim-meta text-secondary">
                        <span className="badge badge-category">{claim.category}</span>
                        <span className="created-claim-status">
                          {claim.status === "active" ? "Active" : claim.status === "resolved_yes" ? "Resolved Yes" : "Resolved No"}
                        </span>
                        <span>{new Date(claim.created_at).toLocaleDateString()}</span>
                        <span>{claim.position_count} positions</span>
                      </div>
                    </div>
                    <div className="created-claim-actions">
                      <Link to={`/claim/${claim.id}`} className="btn btn-outline">
                        View
                      </Link>
                      <button
                        className="btn btn-red"
                        disabled={!canDelete || deletingId === claim.id}
                        onClick={() => handleDeleteClaim(claim.id)}
                        title={canDelete ? "Delete claim" : "Cannot delete a claim with positions"}
                      >
                        {deletingId === claim.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                  {!canDelete && (
                    <div className="created-claim-note text-muted">
                      Claims with positions cannot be deleted.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

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
                  <div className="profile-pos-claim">
                    <span className="profile-pos-title">
                      {claimById.get(p.claim_id)?.title ?? p.claim_id}
                    </span>
                    <span className="profile-pos-meta text-secondary">
                      {claimById.get(p.claim_id)?.category ?? "Unknown category"} - {p.claim_id}
                    </span>
                    {p.reasoning && (
                      <span className="profile-pos-reasoning">{p.reasoning}</span>
                    )}
                  </div>
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
                  <div className="profile-pos-claim">
                    <span className="profile-pos-title">
                      {claimById.get(p.claim_id)?.title ?? p.claim_id}
                    </span>
                    <span className="profile-pos-meta text-secondary">
                      {claimById.get(p.claim_id)?.category ?? "Unknown category"} - {p.claim_id}
                    </span>
                    {p.reasoning && (
                      <span className="profile-pos-reasoning">{p.reasoning}</span>
                    )}
                  </div>
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

      {user.wallet_address && (
        <div className="profile-section">
          <h2 className="section-title">On-chain Activity</h2>
          <div className="card onchain-placeholder">
            <div className="onchain-icon">&#9830;</div>
            <p className="onchain-text">
              On-chain transaction history and token holdings for{" "}
              <span className="onchain-addr">{user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}</span>{" "}
              will appear here once integrated.
            </p>
            <span className="badge badge-category">Coming soon</span>
          </div>
        </div>
      )}
    </div>
  );
}
