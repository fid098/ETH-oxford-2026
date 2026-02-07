import type { CSSProperties } from "react";
import "./LoadingSkeletons.css";

type SkeletonProps = {
  className?: string;
  style?: CSSProperties;
};

function SkeletonBlock({ className = "", style }: SkeletonProps) {
  return <div className={`skeleton ${className}`} style={style} />;
}

export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="feed-skeleton">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card skeleton-card">
          <div className="skeleton-row">
            <SkeletonBlock className="skeleton-pill" style={{ width: 90 }} />
            <SkeletonBlock className="skeleton-pill" style={{ width: 110 }} />
            <SkeletonBlock className="skeleton-line" style={{ width: 60 }} />
          </div>
          <SkeletonBlock className="skeleton-title" />
          <SkeletonBlock className="skeleton-chart" />
          <div className="skeleton-row">
            <SkeletonBlock className="skeleton-line" style={{ width: 90 }} />
            <SkeletonBlock className="skeleton-line" style={{ width: 90 }} />
          </div>
          <SkeletonBlock className="skeleton-bar" />
          <div className="skeleton-row">
            <SkeletonBlock className="skeleton-line" style={{ width: 120 }} />
            <SkeletonBlock className="skeleton-line" style={{ width: 120 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LeaderboardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="leaderboard-skeleton">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card skeleton-card skeleton-row-lg">
          <SkeletonBlock className="skeleton-circle" />
          <div className="skeleton-col">
            <SkeletonBlock className="skeleton-line" style={{ width: 160 }} />
            <SkeletonBlock className="skeleton-line" style={{ width: 120 }} />
          </div>
          <div className="skeleton-col skeleton-stats">
            <SkeletonBlock className="skeleton-line" style={{ width: 70 }} />
            <SkeletonBlock className="skeleton-line" style={{ width: 70 }} />
          </div>
          <div className="skeleton-col skeleton-stats">
            <SkeletonBlock className="skeleton-line" style={{ width: 70 }} />
            <SkeletonBlock className="skeleton-line" style={{ width: 70 }} />
          </div>
          <div className="skeleton-col skeleton-stats">
            <SkeletonBlock className="skeleton-line" style={{ width: 70 }} />
            <SkeletonBlock className="skeleton-line" style={{ width: 70 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ClaimDetailSkeleton() {
  return (
    <div className="claim-detail-skeleton">
      <div className="skeleton-row">
        <SkeletonBlock className="skeleton-line" style={{ width: 120 }} />
      </div>
      <div className="detail-layout">
        <div>
          <div className="card skeleton-card">
            <div className="skeleton-row">
              <SkeletonBlock className="skeleton-pill" style={{ width: 90 }} />
              <SkeletonBlock className="skeleton-pill" style={{ width: 120 }} />
            </div>
            <SkeletonBlock className="skeleton-title" />
            <SkeletonBlock className="skeleton-line" style={{ width: "92%" }} />
            <SkeletonBlock className="skeleton-line" style={{ width: "82%" }} />
            <div className="skeleton-row">
              <SkeletonBlock className="skeleton-line" style={{ width: 80 }} />
              <SkeletonBlock className="skeleton-line" style={{ width: 80 }} />
            </div>
            <SkeletonBlock className="skeleton-bar" />
          </div>
          <div className="card skeleton-card" style={{ marginTop: 24 }}>
            <SkeletonBlock className="skeleton-chart" style={{ height: 220 }} />
          </div>
          <div className="card skeleton-card" style={{ marginTop: 24 }}>
            <div className="skeleton-row">
              <SkeletonBlock className="skeleton-line" style={{ width: 90 }} />
              <SkeletonBlock className="skeleton-line" style={{ width: 90 }} />
              <SkeletonBlock className="skeleton-line" style={{ width: 90 }} />
            </div>
          </div>
        </div>
        <div>
          <div className="card skeleton-card">
            <SkeletonBlock className="skeleton-title" style={{ width: 140 }} />
            <SkeletonBlock className="skeleton-line" style={{ width: "90%" }} />
            <SkeletonBlock className="skeleton-line" style={{ width: "80%" }} />
            <SkeletonBlock className="skeleton-line" style={{ width: "70%" }} />
            <SkeletonBlock className="skeleton-bar" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="profile-skeleton">
      <div className="card skeleton-card">
        <div className="skeleton-row">
          <SkeletonBlock className="skeleton-circle" style={{ width: 72, height: 72 }} />
          <div className="skeleton-col">
            <SkeletonBlock className="skeleton-line" style={{ width: 180 }} />
            <SkeletonBlock className="skeleton-line" style={{ width: 120 }} />
          </div>
          <div className="skeleton-row" style={{ marginLeft: "auto" }}>
            <SkeletonBlock className="skeleton-stat" />
            <SkeletonBlock className="skeleton-stat" />
            <SkeletonBlock className="skeleton-stat" />
          </div>
        </div>
      </div>

      <div className="card skeleton-card" style={{ marginTop: 24 }}>
        <SkeletonBlock className="skeleton-title" style={{ width: 200 }} />
        <div className="skeleton-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-card-mini">
              <SkeletonBlock className="skeleton-line" style={{ width: 90 }} />
              <SkeletonBlock className="skeleton-line" style={{ width: 70 }} />
              <SkeletonBlock className="skeleton-bar" />
            </div>
          ))}
        </div>
      </div>

      <div className="card skeleton-card" style={{ marginTop: 24 }}>
        <SkeletonBlock className="skeleton-title" style={{ width: 220 }} />
        <div className="skeleton-stack">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton-row">
              <SkeletonBlock className="skeleton-circle" style={{ width: 32, height: 32 }} />
              <SkeletonBlock className="skeleton-line" style={{ width: "60%" }} />
              <SkeletonBlock className="skeleton-line" style={{ width: 80 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
