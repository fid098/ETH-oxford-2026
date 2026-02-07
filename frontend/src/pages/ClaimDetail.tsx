import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, type ClaimWithOdds, type Position } from "../api";
import StakingWidget from "../components/StakingWidget";
import BeliefGraph from "../components/BeliefGraph";
import { ClaimDetailSkeleton } from "../components/LoadingSkeletons";
import { toast } from "../components/Toast";
import "./ClaimDetail.css";

export default function ClaimDetail() {
  const { id } = useParams<{ id: string }>();
  const [claim, setClaim] = useState<ClaimWithOdds | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [oracleStatus, setOracleStatus] = useState<{
    feed: string;
    comparator: ">" | ">=" | "<" | "<=";
    target: number;
    current_value: number;
    updated_at: number;
    would_resolve: boolean;
    resolution_date: string | null;
    network: string;
    rpc: string;
  } | null>(null);
  const [oracleError, setOracleError] = useState<string | null>(null);
  const [oracleChecking, setOracleChecking] = useState(false);

  const load = () => {
    if (!id) return;
    setLoadError(null);
    Promise.all([api.getClaim(id), api.getPositions()]).then(([c, allPos]) => {
      setClaim(c);
      setPositions(allPos.filter((p) => p.claim_id === id));
      setLoading(false);
    }).catch((err) => {
      const msg = err instanceof Error ? err.message : "Failed to load claim";
      setLoadError(msg);
      toast(msg, "error");
      setLoading(false);
    });
  };

  useEffect(load, [id]);

  useEffect(() => {
    if (!claim || claim.resolution_type !== "oracle") return;
    let active = true;
    const fetchOracle = async () => {
      try {
        const data = await api.getOracleStatus(claim.id);
        if (active) {
          setOracleStatus(data);
          setOracleError(null);
        }
      } catch (err: unknown) {
        if (active) {
          setOracleError(err instanceof Error ? err.message : "Failed to load oracle");
        }
      }
    };
    void fetchOracle();
    const interval = window.setInterval(fetchOracle, 30000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [claim?.id, claim?.resolution_type]);

  if (loading) {
    return (
      <div className="page">
        <ClaimDetailSkeleton />
      </div>
    );
  }

  if (loadError || !claim) {
    return (
      <div className="page">
        <Link to="/" className="back-link">&larr; Back to Feed</Link>
        <div className="error-state card">
          <div className="error-state-icon">!</div>
          <h3 className="error-state-title">Failed to load claim</h3>
          <p className="error-state-msg">{loadError ?? "Claim not found"}</p>
          <button className="btn btn-green" onClick={load}>Retry</button>
        </div>
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

  const resolutionType = claim.resolution_type ?? "manual";

  const handleOracleCheck = async () => {
    if (!claim) return;
    setOracleChecking(true);
    try {
      await api.checkOracle(claim.id);
      if (claim.resolution_type === "oracle") {
        const status = await api.getOracleStatus(claim.id);
        setOracleStatus(status);
        setOracleError(null);
      }
      load();
    } catch (err: unknown) {
      setOracleError(err instanceof Error ? err.message : "Failed to check oracle");
    } finally {
      setOracleChecking(false);
    }
  };

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

          {resolutionType === "oracle" && (
            <div className="card detail-card oracle-card" style={{ marginTop: 24 }}>
              <div className="oracle-header">
                <h3>Oracle Resolution</h3>
                <span className="badge badge-category">Chainlink</span>
              </div>
              {oracleError && (
                <div className="oracle-error">
                  <span>{oracleError}</span>
                  <button className="btn btn-outline" style={{ marginLeft: 12, padding: "4px 12px", fontSize: 12 }} onClick={handleOracleCheck}>
                    Retry
                  </button>
                </div>
              )}
              <div className="oracle-grid">
                <div>
                  <span className="oracle-label">Feed</span>
                  <span className="oracle-value">{oracleStatus?.feed ?? "Loading..."}</span>
                </div>
                <div>
                  <span className="oracle-label">Condition</span>
                  <span className="oracle-value">
                    {oracleStatus
                      ? `${oracleStatus.comparator} ${oracleStatus.target}`
                      : "Loading..."}
                  </span>
                </div>
                <div>
                  <span className="oracle-label">Current Value</span>
                  <span className="oracle-value">
                    {oracleStatus
                      ? `$${oracleStatus.current_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : "Loading..."}
                  </span>
                </div>
                <div>
                  <span className="oracle-label">Last Updated</span>
                  <span className="oracle-value">
                    {oracleStatus
                      ? new Date(oracleStatus.updated_at * 1000).toLocaleString()
                      : "Loading..."}
                  </span>
                </div>
                <div>
                  <span className="oracle-label">Will Resolve On</span>
                  <span className="oracle-value">
                    {oracleStatus?.resolution_date
                      ? new Date(oracleStatus.resolution_date).toLocaleString()
                      : claim.resolution_date
                        ? new Date(claim.resolution_date).toLocaleString()
                        : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="oracle-label">Network / RPC</span>
                  <span className="oracle-value">
                    {oracleStatus
                      ? `${oracleStatus.network} (${oracleStatus.rpc})`
                      : "Loading..."}
                  </span>
                </div>
              </div>
              <div className="oracle-actions">
                <span className={`oracle-outcome ${oracleStatus?.would_resolve ? "text-green" : "text-red"}`}>
                  {oracleStatus
                    ? oracleStatus.would_resolve
                      ? "Would resolve TRUE"
                      : "Would resolve FALSE"
                    : "Checking..."}
                </span>
                <button className="btn btn-outline" onClick={handleOracleCheck} disabled={oracleChecking}>
                  {oracleChecking ? "Checking..." : "Check Oracle"}
                </button>
              </div>
            </div>
          )}

          <div className="card detail-card timeline-card" style={{ marginTop: 24 }}>
            <h3 className="timeline-heading">Timeline</h3>
            <div className="timeline">
              <div className="timeline-item timeline-done">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <span className="timeline-label">Created</span>
                  <span className="timeline-date">{new Date(claim.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className={`timeline-item ${claim.position_count > 0 ? "timeline-done" : ""}`}>
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <span className="timeline-label">
                    {claim.position_count > 0
                      ? `${claim.position_count} position${claim.position_count !== 1 ? "s" : ""} taken`
                      : "Awaiting positions"}
                  </span>
                  <span className="timeline-date">{claim.total_staked} pts staked</span>
                </div>
              </div>

              {resolutionType === "oracle" && claim.resolution_date && (
                <div className={`timeline-item ${claim.status !== "active" ? "timeline-done" : ""}`}>
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <span className="timeline-label">Oracle resolution date</span>
                    <span className="timeline-date">{new Date(claim.resolution_date).toLocaleDateString()}</span>
                  </div>
                </div>
              )}

              <div className={`timeline-item ${claim.status !== "active" ? "timeline-done" : "timeline-pending"}`}>
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <span className="timeline-label">
                    {claim.status === "active"
                      ? "Pending resolution"
                      : claim.status === "resolved_yes"
                        ? "Resolved TRUE"
                        : "Resolved FALSE"}
                  </span>
                  <span className="timeline-date">
                    {claim.status !== "active" && claim.resolved_at
                      ? new Date(claim.resolved_at).toLocaleDateString()
                      : resolutionType === "oracle" ? "Via Chainlink oracle" : "Manual"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="positions-section">
            <div className="positions-columns">
              <div>
                <h3 className="positions-heading text-green">Believers ({yesPositions.length})</h3>
                {yesPositions.map((p) => (
                  <div key={p.id} className="position-row card">
                    <div className="position-row-main">
                      <Link to={`/user/${p.username}`} className="position-user">
                        <div className="position-avatar">{p.username[0].toUpperCase()}</div>
                        <span>{p.username}</span>
                      </Link>
                      <div className="position-details">
                        <span className="text-green font-semibold">{p.stake} pts</span>
                        <span className="text-muted">{Math.round(p.confidence * 100)}% conf</span>
                      </div>
                    </div>
                    {p.reasoning && (
                      <p className="position-reasoning">{p.reasoning}</p>
                    )}
                  </div>
                ))}
                {yesPositions.length === 0 && (
                  <div className="card" style={{ padding: 20, textAlign: "center" }}>
                    <p className="text-muted" style={{ fontSize: 13 }}>No believers yet. Be the first to stake on True.</p>
                  </div>
                )}
              </div>
              <div>
                <h3 className="positions-heading text-red">Skeptics ({noPositions.length})</h3>
                {noPositions.map((p) => (
                  <div key={p.id} className="position-row card">
                    <div className="position-row-main">
                      <Link to={`/user/${p.username}`} className="position-user">
                        <div className="position-avatar">{p.username[0].toUpperCase()}</div>
                        <span>{p.username}</span>
                      </Link>
                      <div className="position-details">
                        <span className="text-red font-semibold">{p.stake} pts</span>
                        <span className="text-muted">{Math.round(p.confidence * 100)}% conf</span>
                      </div>
                    </div>
                    {p.reasoning && (
                      <p className="position-reasoning">{p.reasoning}</p>
                    )}
                  </div>
                ))}
                {noPositions.length === 0 && (
                  <div className="card" style={{ padding: 20, textAlign: "center" }}>
                    <p className="text-muted" style={{ fontSize: 13 }}>No skeptics yet. Be the first to stake on False.</p>
                  </div>
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
