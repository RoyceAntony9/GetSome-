import React from 'react';
import { Target, Search, Sliders, Layers, Sparkles, Database, Settings } from 'lucide-react';

export type ActiveTab = 'pipeline' | 'icp_builder' | 'campaigns' | 'settings';

interface TopNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenDiscovery: () => void;
  onResetSeed: () => void;
  activeJobsCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenDiscovery,
  onResetSeed,
  activeJobsCount,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur sticky top-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('pipeline');
          }}
          className="text-lg font-bold tracking-tight text-white flex items-center gap-2.5 whitespace-nowrap"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-sky-500 flex items-center justify-center text-white font-mono font-bold text-sm shadow-sm">
            S
          </div>
          <span>Stratum Intelligence</span>
        </a>
        <span className="text-xs text-slate-500 font-mono hidden lg:inline">
          B2B Prospect Research & Hyperpersonalized Outreach
        </span>
      </div>

      {/* Zone 2: Clean single-line navigation links */}
      <nav className="flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => onSelectTab('pipeline')}
          className={`flex items-center gap-2 hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'pipeline' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Prospect Pipeline</span>
        </button>

        <button
          onClick={() => onSelectTab('icp_builder')}
          className={`flex items-center gap-2 hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'icp_builder' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          <Target className="w-4 h-4" />
          <span>ICP Target Profiles</span>
        </button>

        <button
          onClick={() => onSelectTab('campaigns')}
          className={`flex items-center gap-2 hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'campaigns' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Campaigns</span>
        </button>

        <button
          onClick={() => onSelectTab('settings')}
          className={`flex items-center gap-2 hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'settings' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>AI Engine & Setup</span>
        </button>
      </nav>

      {/* Zone 3: Primary action button + quick trigger */}
      <div className="flex items-center gap-3 shrink-0">
        {activeJobsCount > 0 && (
          <div className="text-xs text-cyan-400 font-mono tabular-nums flex items-center gap-1.5 bg-cyan-950/60 border border-cyan-800/80 px-2.5 py-1 rounded">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>{activeJobsCount} research in flight</span>
          </div>
        )}

        <button
          onClick={onOpenDiscovery}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm shadow-cyan-500/20"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Launch Discovery</span>
        </button>
      </div>
    </header>
  );
};
