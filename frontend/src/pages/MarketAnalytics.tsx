import React, { useState } from 'react';

// --- CUSTOM SVG COMPONENTS (Replaces Lucide) ---

const IconTrendingUp = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);

const IconPieChart = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

const IconZap = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconActivity = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

// --- MAIN COMPONENT ---

export default function MarketAnalytics() {
  const [stats] = useState({
    tvl: 3540,
    activeClaims: 9,
    sentiment: 72 
  });

  return (
    <div className="p-8 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Market Insights</h1>
        <p className="text-gray-500">Global oracle data and platform health.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Cell 1: Global TVL */}
        <div className="md:col-span-2 bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-gray-400 tracking-widest uppercase">Total Value Locked</p>
              <h2 className="text-5xl font-black text-gray-900 mt-2 tracking-tight">
                {stats.tvl.toLocaleString()} <span className="text-xl text-green-500 font-normal">PTS</span>
              </h2>
            </div>
            <div className="bg-green-50 p-4 rounded-2xl">
              <IconTrendingUp className="text-green-600 w-8 h-8" />
            </div>
          </div>
          <div className="w-full h-16 bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent rounded-lg mt-4 flex items-end px-2 gap-1">
            {[40, 70, 45, 90, 65, 80, 95].map((h, i) => (
              <div key={i} className="bg-green-500/40 w-full rounded-t-sm" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>

        {/* Cell 2: Sentiment Gauge */}
        <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] flex flex-col justify-between shadow-xl">
          <div className="flex justify-between items-center">
            <IconZap className="text-yellow-400 w-6 h-6" />
            <span className="text-[10px] font-mono text-gray-500 bg-gray-800 px-2 py-1 rounded">LIVE_PULSE</span>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Sentiment</p>
            <h3 className="text-3xl font-bold">{stats.sentiment}% Bullish</h3>
            <div className="w-full bg-gray-800 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-yellow-400 h-full transition-all duration-1000" style={{ width: `${stats.sentiment}%` }}></div>
            </div>
          </div>
        </div>

        {/* Cell 3: Category Distribution */}
        <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <IconPieChart className="text-blue-500 w-5 h-5" />
            <span className="font-bold text-gray-800">Categories</span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-sm items-center">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-gray-600">Science</span></div>
              <span className="font-mono font-bold">45%</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div><span className="text-gray-600">Crypto</span></div>
              <span className="font-mono font-bold">35%</span>
            </div>
          </div>
        </div>

        {/* Cell 4: Velocity Feed */}
        <div className="md:col-span-2 bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <IconActivity className="text-orange-500 w-5 h-5" />
            <span className="font-bold text-gray-800">System Activity</span>
          </div>
          <div className="space-y-3">
             <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs flex justify-between items-center">
                <span className="text-gray-500 italic">Alice staked 200 pts on "Vite 7.0 Release"</span>
                <span className="text-green-600 font-bold underline">VIEW</span>
             </div>
             <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs flex justify-between items-center opacity-60">
                <span className="text-gray-500 italic">Market "ETH High" was resolved by Oracle</span>
                <span className="text-blue-600 font-bold">CLOSED</span>
             </div>
          </div>
        </div>

        {/* Cell 5: Quick CTA */}
        <div className="md:col-span-2 bg-green-600 text-white p-8 rounded-[2.5rem] shadow-lg flex flex-col justify-center items-start overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <IconTrendingUp className="w-40 h-40 rotate-12" />
          </div>
          <h4 className="text-2xl font-bold mb-2 z-10">Start Earning</h4>
          <p className="text-green-100 text-sm mb-6 max-w-sm z-10">Use your predictive power to resolve claims and earn reputation across the ETH Oxford network.</p>
          <button className="bg-white text-green-700 px-8 py-3 rounded-2xl font-black text-sm hover:scale-105 transition-transform z-10">
            CREATE NEW CLAIM
          </button>
        </div>

      </div>
    </div>
  );
}