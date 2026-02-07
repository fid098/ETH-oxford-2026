import React, { useState } from 'react';
import './MarketAnalytics.css';

// --- ICONS ---
const IconTrendingUp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
);

const IconZap = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
);

export default function MarketAnalytics() {
  const [stats] = useState({
    tvl: 3540,
    sentiment: 72 
  });

  return (
    <div className="page">
      <h1 className="feed-title" style={{ marginBottom: 8 }}>Market Insights</h1>
      <p className="text-secondary" style={{ marginBottom: 24 }}>
        Global oracle data and platform health.
      </p>

      <div className="analytics-grid">
        
        {/* Total Value Locked */}
        <div className="card col-span-2" style={{ padding: '24px' }}>
          <div className="analytics-card-header">
            <div>
              <span className="analytics-label">Total Value Locked</span>
              <div className="analytics-big-val">
                {stats.tvl.toLocaleString()} <span style={{ fontSize: '16px', color: '#2fd07a' }}>PTS</span>
              </div>
            </div>
            <div style={{ color: '#2fd07a', opacity: 0.8 }}><IconTrendingUp /></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '40px' }}>
             {[40, 70, 45, 90, 65, 80, 95].map((h, i) => (
               <div key={i} style={{ flex: 1, background: '#2fd07a33', height: `${h}%`, borderRadius: '2px' }} />
             ))}
          </div>
        </div>

        {/* Sentiment Gauge */}
        <div className="card" style={{ padding: '24px', background: '#0f172a', color: 'white', borderColor: 'transparent' }}>
          <div className="analytics-card-header">
            <span className="analytics-label" style={{ color: '#94a3b8' }}>Sentiment</span>
            <IconZap />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{stats.sentiment}% Bullish</div>
          <div className="sentiment-bar-bg">
            <div className="sentiment-bar-fill" style={{ width: `${stats.sentiment}%` }} />
          </div>
        </div>

        {/* System Activity */}
        <div className="card col-span-2" style={{ padding: '24px' }}>
          <span className="analytics-label" style={{ display: 'block', marginBottom: '16px' }}>System Activity</span>
          <div className="activity-item">
            <span style={{ color: 'var(--text-muted)' }}>Alice staked 200 pts on "Vite 7.0"</span>
            <span style={{ color: '#2fd07a', fontWeight: 700 }}>VIEW</span>
          </div>
          <div className="activity-item" style={{ opacity: 0.6 }}>
            <span style={{ color: 'var(--text-muted)' }}>Market "ETH High" resolved</span>
            <span style={{ fontWeight: 700 }}>CLOSED</span>
          </div>
        </div>

        {/* CTA Card */}
        <div className="card col-span-2" style={{ 
          padding: '24px', 
          background: 'linear-gradient(135deg, #2fd07a, #1f9d55)', 
          color: 'white',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Start Earning</h3>
          <p style={{ fontSize: '13px', marginBottom: '16px', opacity: 0.9 }}>
            Predict market outcomes and earn reputation across the network.
          </p>
          <button className="btn-primary" style={{ background: 'white', color: '#1f9d55', border: 'none', width: 'fit-content' }}>
            CREATE NEW CLAIM
          </button>
        </div>

      </div>
    </div>
  );
}