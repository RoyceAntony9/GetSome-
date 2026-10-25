import React from 'react';
import {
  LayoutDashboard,
  Users,
  Sliders,
  Target,
  Linkedin,
  Mail,
  Bot,
  Settings2,
  Sparkles,
  Zap,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export type NavigationTab =
  | 'overview'
  | 'pipeline'
  | 'campaigns'
  | 'icp_builder'
  | 'linkedin'
  | 'gmail'
  | 'settings';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  stats: {
    totalProspects: number;
    qualified: number;
    readyForOutreach: number;
    draftsAwaitingReview: number;
    gmailDraftsCount: number;
    gmailSavedCount: number;
    activeJobs: number;
  };
  gmailConnected: boolean;
  onOpenDiscovery: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  stats,
  gmailConnected,
  onOpenDiscovery,
}) => {
  const navItems = [
    {
      id: 'overview' as NavigationTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'pipeline' as NavigationTab,
      label: 'Prospects',
      icon: Users,
      badge: stats.totalProspects > 0 ? stats.totalProspects : null,
    },
    {
      id: 'campaigns' as NavigationTab,
      label: 'Campaigns',
      icon: Sliders,
      badge: null,
    },
    {
      id: 'icp_builder' as NavigationTab,
      label: 'ICP Profiles',
      icon: Target,
      badge: null,
    },
    {
      id: 'linkedin' as NavigationTab,
      label: 'LinkedIn Outreach',
      icon: Linkedin,
      badge: stats.readyForOutreach > 0 ? stats.readyForOutreach : null,
      badgeColor: 'bg-[#d4f34a] text-slate-900',
    },
    {
      id: 'gmail' as NavigationTab,
      label: 'Email Drafts',
      icon: Mail,
      badge: stats.gmailDraftsCount > 0 ? stats.gmailDraftsCount : null,
      badgeColor: 'bg-sky-100 text-sky-800',
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Integrations & Setup',
      icon: Settings2,
      badge: gmailConnected ? 'Active' : null,
      badgeColor: 'bg-emerald-100 text-emerald-800 text-[10px]',
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-20">
      {/* Top Brand */}
      <div className="p-5">
        <div className="flex items-center gap-3 px-2 py-1 mb-6">
          <div className="w-9 h-9 rounded-xl bg-[#d4f34a] flex items-center justify-center text-slate-950 font-bold text-base shadow-sm ring-1 ring-black/5">
            G
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-lg tracking-tight">GetSome</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">B2B Prospect Intelligence</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#d4f34a]' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Promo / Status Card */}
      <div className="p-4 border-t border-slate-100">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/80 border border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-full bg-[#d4f34a] flex items-center justify-center text-slate-950 shadow-sm">
              <Zap className="w-4 h-4" />
            </div>
            {stats.activeJobs > 0 && (
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {stats.activeJobs} Researching
              </span>
            )}
          </div>
          <h4 className="font-semibold text-slate-900 text-sm">Autonomous Discovery</h4>
          <p className="text-xs text-slate-500 mt-1 mb-3">
            Search verified enterprise prospects across 12 B2B industries.
          </p>
          <button
            onClick={onOpenDiscovery}
            className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-[#d4f34a] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Launch Discovery
          </button>
        </div>

        {/* User Account Bar */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
              PR
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">Percy Royce</p>
              <p className="text-[10px] text-slate-400 truncate max-w-[110px]">percyroyce21@gmail.com</p>
            </div>
          </div>
          <div
            title={gmailConnected ? 'Gmail Connected' : 'Gmail Not Connected'}
            className={`w-2.5 h-2.5 rounded-full ${gmailConnected ? 'bg-emerald-500' : 'bg-slate-300'}`}
          />
        </div>
      </div>
    </aside>
  );
};
