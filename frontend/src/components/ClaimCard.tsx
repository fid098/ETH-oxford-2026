import { Link } from "react-router-dom";
import type { ClaimWithOdds, Position } from "../api";
import BeliefGraph from "./BeliefGraph";
import "./ClaimCard.css";

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function statusBadge(status: string) {
  if (status === "active") return <span className="badge badge-active">Active</span>;
  if (status === "resolved_yes")
    return <span className="badge badge-resolved-yes">Resolved Yes</span>;
  return <span className="badge badge-resolved-no">Resolved No</span>;
}

function UserStack({ positions, side }: { positions: Position[]; side: "yes" | "no" }) {
  const filtered = positions.filter((p) => p.side === side);
  const label = side === "yes" ? "Believers" : "Skeptics";
  const color = side === "yes" ? "text-green" : "text-red";

  return (
    <div className="card-users-col">
      <span className={`card-users-label ${color}`}>{label}</span>
      {filtered.length === 0 && (
        <span className="card-users-empty">None yet</span>
      )}
      {filtered.slice(0, 3).map((p) => (
        <div key={p.id} className="card-user-row">
          <div className="card-user-avatar">{p.username[0].toUpperCase()}</div>
          <div className="card-user-info">
            <span className="card-user-name">{p.username}</span>
            <span className="card-user-meta">
              {p.stake} pts &middot; {Math.round(p.confidence * 100)}%
            </span>
          </div>
        </div>
      ))}
      {filtered.length > 3 && (
        <span className="card-users-more">+{filtered.length - 3} more</span>
      )}
    </div>
  );
}

export default function ClaimCard({ claim, positions }: { claim: ClaimWithOdds; positions: Position[] }) {
  return (
    <div className="claim-card-wrapper">
      <UserStack positions={positions} side="yes" />

      <Link to={`/claim/${claim.id}`} className="claim-card card card-clickable">
        <div className="claim-card-header">
          <span className="badge badge-category">{claim.category}</span>
          {statusBadge(claim.status)}
          <span className="claim-card-time">{timeAgo(claim.created_at)}</span>
        </div>

        <h3 className="claim-card-title">{claim.title}</h3>

        <BeliefGraph positions={positions} mini />

        <div className="claim-card-odds">
          <div className="odds-labels">
            <span className="text-green font-semibold">{claim.yes_percentage}% True</span>
            <span className="text-red font-semibold">{claim.no_percentage}% False</span>
          </div>
          <div className="odds-bar">
            <div className="odds-bar-yes" style={{ width: `${claim.yes_percentage}%` }} />
            <div className="odds-bar-no" style={{ width: `${claim.no_percentage}%` }} />
          </div>
        </div>

        <div className="claim-card-footer">
          <span className="text-muted">
            {claim.position_count} position{claim.position_count !== 1 ? "s" : ""}
          </span>
          <span className="text-muted">{claim.total_staked} pts staked</span>
        </div>
      </Link>

      <UserStack positions={positions} side="no" />
    </div>
  );
}
