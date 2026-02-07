import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, type ClaimWithOdds, type Position } from "../api";
import StakingWidget from "../components/StakingWidget";
import BeliefGraph from "../components/BeliefGraph";
import { ClaimDetailSkeleton } from "../components/LoadingSkeletons";
import "./ClaimDetail.css";

export default function ClaimDetail() {
  const { id } = useParams<{ id: string }>();
  const [claim, setClaim] = useState<ClaimWithOdds | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!id) return;
    Promise.all([api.getClaim(id), api.getPositions()]).then(([c, allPos]) => {
      setClaim(c);
      setPositions(allPos.filter((p) => p.claim_id === id));
      setLoading(false);
    });
  };

  useEffect(load, [id]);

  if (loading || !claim) {
    return (
      <div className="page">
        <ClaimDetailSkeleton />
      </div>
    );
  }

  const yesPositions = positions.filter((p) => p.side === "yes");
  const noPositions = positions.filter((p) => p.side === "no");

  const statusLabel =
    claim.status === "active"
      ? "active"
      : claim.status === "resolved_yes"
        ? "resolved-yes"
        : "resolved-no";

  return (
    <div className="page">
      <Link to="/" className="back-link">&larr; Back to Feed</Link>

      <div className="detail-layout">
        <div className="detail-main">
          <div className="card detail-card">
            <div className="detail-header">
              <span className="badge badge-category">{claim.category}</span>
              <span className={`badge badge-${statusLabel}`}>
                {claim.status === "active" ? "Active" : claim.status === "resolved_yes" ? "Resolved Yes" : "Resolved No"}
              </span>
            </div>

            <h1 className="detail-title">{claim.title}</h1>
            <p className="detail-description">{claim.description}</p>

            <div className="detail-odds-section">
              <div className="detail-odds-header">
                <span className="text-green font-bold text-xl">{claim.yes_percentage}%</span>
                <span className="text-muted font-semibold">vs</span>
                <span className="text-red font-bold text-xl">{claim.no_percentage}%</span>
              </div>
              <div className="odds-bar" style={{ height: 12, borderRadius: 6 }}>
                <div className="odds-bar-yes" style={{ width: `${claim.yes_percentage}%` }} />
                <div className="odds-bar-no" style={{ width: `${claim.no_percentage}%` }} />
              </div>
            </div>
          </div>

          <BeliefGraph positions={positions} />

          <div className="card detail-card" style={{ marginTop: 24 }}>

            <div className="detail-meta">
              <div className="meta-item">
                <span className="meta-value">{claim.position_count}</span>
                <span className="meta-label">Positions</span>
              </div>
              <div className="meta-item">
                <span className="meta-value">{claim.total_staked}</span>
                <span className="meta-label">Points Staked</span>
              </div>
              <div className="meta-item">
                <span className="meta-value">
                  {new Date(claim.created_at).toLocaleDateString()}
                </span>
                <span className="meta-label">Created</span>
              </div>
            </div>
          </div>

          <div className="positions-section">
            <div className="positions-columns">
              <div>
                <h3 className="positions-heading text-green">Believers ({yesPositions.length})</h3>
                {yesPositions.map((p) => (
                  <div key={p.id} className="position-row card">
                    <Link to={`/user/${p.username}`} className="position-user">
                      <div className="position-avatar">{p.username[0].toUpperCase()}</div>
                      <span>{p.username}</span>
                    </Link>
                    <div className="position-details">
                      <span className="text-green font-semibold">{p.stake} pts</span>
                      <span className="text-muted">{Math.round(p.confidence * 100)}% conf</span>
                    </div>
                  </div>
                ))}
                {yesPositions.length === 0 && (
                  <p className="text-muted" style={{ padding: 16, fontSize: 13 }}>No believers yet</p>
                )}
              </div>
              <div>
                <h3 className="positions-heading text-red">Skeptics ({noPositions.length})</h3>
                {noPositions.map((p) => (
                  <div key={p.id} className="position-row card">
                    <Link to={`/user/${p.username}`} className="position-user">
                      <div className="position-avatar">{p.username[0].toUpperCase()}</div>
                      <span>{p.username}</span>
                    </Link>
                    <div className="position-details">
                      <span className="text-red font-semibold">{p.stake} pts</span>
                      <span className="text-muted">{Math.round(p.confidence * 100)}% conf</span>
                    </div>
                  </div>
                ))}
                {noPositions.length === 0 && (
                  <p className="text-muted" style={{ padding: 16, fontSize: 13 }}>No skeptics yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="detail-sidebar">
          {claim.status === "active" && (
            <StakingWidget claimId={claim.id} onSuccess={load} />
          )}
          {claim.status !== "active" && (
            <div className="card resolved-card">
              <h3 style={{ marginBottom: 8 }}>Claim Resolved</h3>
              <p className="text-secondary" style={{ fontSize: 14 }}>
                This claim was resolved as{" "}
                <strong className={claim.status === "resolved_yes" ? "text-green" : "text-red"}>
                  {claim.status === "resolved_yes" ? "True" : "False"}
                </strong>{" "}
                on {claim.resolved_at ? new Date(claim.resolved_at).toLocaleDateString() : "N/A"}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
