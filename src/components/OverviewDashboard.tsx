import React, { useState } from 'react';
import {
  Users,
  Target,
  Mail,
  Linkedin,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';
import { Prospect, Campaign, ICPProfile } from '../types/index';

interface OverviewDashboardProps {
  stats: {
    totalProspects: number;
    underResearch: number;
    qualified: number;
    highPriority: number;
    readyForOutreach: number;
    draftsAwaitingReview: number;
    approvedDrafts: number;
    gmailDraftsCount: number;
    gmailSavedCount: number;
    linkedinPreparedCount: number;
    sentOutreach: number;
    activeJobs: number;
    campaignsCount: number;
    campaignsActiveCount: number;
    icpsCount: number;
    gmailConnected?: boolean;
    gmailEmail?: string;
  };
  prospects: Prospect[];
  campaigns: Campaign[];
  icps: ICPProfile[];
  onSelectProspect: (prospect: Prospect) => void;
  onNavigateTab: (tab: any) => void;
  onOpenDiscovery: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  stats,
  prospects,
  campaigns,
  icps,
  onSelectProspect,
  onNavigateTab,
  onOpenDiscovery,
}) => {
  const [chartPeriod, setChartPeriod] = useState<'monthly' | 'weekly'>('monthly');

  // Compute metrics
  const qualificationRate = stats.totalProspects > 0
    ? Math.round((stats.qualified / stats.totalProspects) * 100)
    : 0;

  // Monthly discovery mock data for visualization inspired by reference chart
  const monthlyData = [
    { label: 'May', blueHeight: 35, limeHeight: 70, value: 42 },
    { label: 'Jun', blueHeight: 65, limeHeight: 90, value: 78, active: true },
    { label: 'Jul', blueHeight: 25, limeHeight: 45, value: 34 },
    { label: 'Aug', blueHeight: 60, limeHeight: 80, value: 65 },
    { label: 'Sep', blueHeight: 75, limeHeight: 95, value: 89 },
  ];

  const recentProspects = prospects.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 4 Top Metric Cards (Interpreting screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Vibrant Bright Lime Accent Card */}
        <div className="bg-[#d4f34a] rounded-3xl p-6 text-slate-950 flex flex-col justify-between shadow-sm border border-[#c4e33d] relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-slate-950" />
            </div>
            <button
              onClick={() => onNavigateTab('pipeline')}
              className="w-10 h-10 rounded-full bg-white/70 hover:bg-white flex items-center justify-center transition-transform group-hover:scale-105"
            >
              <ArrowUpRight className="w-5 h-5 text-slate-900" />
            </button>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight mb-1 text-slate-950">
              {stats.qualified}
            </div>
            <p className="text-xs font-semibold text-slate-800">
              Qualified Decision-Makers
            </p>
            <p className="text-[11px] text-slate-700/80 mt-1">
              {qualificationRate}% ICP match rate across active campaigns
            </p>
          </div>
        </div>

        {/* Card 2: White Card with ICP Fit */}
        <div className="bg-white rounded-3xl p-6 text-slate-900 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-200/80 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-slate-700" />
            </div>
            <button
              onClick={() => onNavigateTab('icp_builder')}
              className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-transform group-hover:scale-105 border border-slate-200"
            >
              <ArrowUpRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {qualificationRate}%
              </span>
              <span className="text-xs text-slate-400 font-medium">
                threshold: 70%
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-600">
              Active ICP Alignment
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Grounded in {stats.totalProspects} investigated accounts
            </p>
          </div>
        </div>

        {/* Card 3: White Card with Ready for Outreach */}
        <div className="bg-white rounded-3xl p-6 text-slate-900 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-200/80 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <Linkedin className="w-5 h-5 text-sky-600" />
            </div>
            <button
              onClick={() => onNavigateTab('linkedin')}
              className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-transform group-hover:scale-105 border border-slate-200"
            >
              <ArrowUpRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {stats.readyForOutreach}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold">
                +{stats.linkedinPreparedCount} Prepared
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-600">
              LinkedIn Canonical Outreach
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              3 personalized observation options per prospect
            </p>
          </div>
        </div>

        {/* Card 4: White Card with Gmail Drafts */}
        <div className="bg-white rounded-3xl p-6 text-slate-900 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-200/80 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-emerald-600" />
            </div>
            <button
              onClick={() => onNavigateTab('gmail')}
              className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-transform group-hover:scale-105 border border-slate-200"
            >
              <ArrowUpRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {stats.gmailDraftsCount}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                {stats.gmailSavedCount} Saved to Gmail
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-600">
              Gmail Email Drafts
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              100% Drafts-Only (Never auto-sent)
            </p>
          </div>
        </div>
      </div>

      {/* Middle Analytical Row (Inspired by Reference: Statistics + Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Pipeline Statistics & Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Prospect Discovery & Qualification</h3>
                <p className="text-xs text-slate-400">Monthly throughput of corroborated prospects</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-medium">
                <button
                  onClick={() => setChartPeriod('monthly')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    chartPeriod === 'monthly'
                      ? 'bg-white text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setChartPeriod('weekly')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    chartPeriod === 'weekly'
                      ? 'bg-white text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Weekly
                </button>
              </div>
            </div>
          </div>

          {/* Metric Sub-headers */}
          <div className="grid grid-cols-2 gap-4 pb-6 mb-6 border-b border-slate-100">
            <div>
              <span className="text-xs text-slate-400 font-medium">Discovered Accounts</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold text-slate-900">
                  {stats.totalProspects}
                </span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +14.2%
                </span>
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium">Qualified Decision-Makers</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold text-slate-900">
                  {stats.qualified}
                </span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +8.5%
                </span>
              </div>
            </div>
          </div>

          {/* Visual Dual-Bar Chart matching reference screenshot */}
          <div className="h-56 flex items-end justify-between px-4 pt-4 gap-6">
            {monthlyData.map((col, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative">
                {col.active && (
                  <div className="absolute -top-7 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-bold shadow-md flex items-center gap-1 z-10">
                    <span>{col.value} leads</span>
                  </div>
                )}
                <div className="w-full flex items-end justify-center gap-2 h-44">
                  {/* Soft Blue Bar (Discovered) */}
                  <div
                    style={{ height: `${col.blueHeight}%` }}
                    className="w-4 sm:w-6 bg-sky-200 hover:bg-sky-300 rounded-t-lg transition-all"
                  />
                  {/* Lime Green Bar (Qualified) */}
                  <div
                    style={{ height: `${col.limeHeight}%` }}
                    className="w-4 sm:w-6 bg-[#d4f34a] hover:bg-[#c4e33d] rounded-t-lg transition-all shadow-xs"
                  />
                </div>
                <span className="text-xs font-medium text-slate-500 mt-3">{col.label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-sky-200" />
              <span>Accounts Researched</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#d4f34a]" />
              <span>Qualified for Outreach</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Distribution & Target Progress */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base">Pipeline Distribution</h3>
              <span className="text-xs text-slate-400 font-medium">All Campaigns</span>
            </div>

            {/* Overlapping Circles graphic inspired by reference */}
            <div className="relative h-44 flex items-center justify-center my-2">
              {/* Large Lime Circle */}
              <div className="w-32 h-32 rounded-full bg-[#d4f34a] flex flex-col items-center justify-center text-slate-950 font-bold shadow-sm z-10 -mr-6">
                <span className="text-2xl leading-none">{stats.qualified}</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-800 font-semibold mt-1">Qualified</span>
              </div>

              {/* Overlapping Blue Circle */}
              <div className="w-28 h-28 rounded-full bg-sky-200 flex flex-col items-center justify-center text-slate-900 font-bold shadow-sm -ml-4 z-5">
                <span className="text-xl leading-none">{stats.readyForOutreach}</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-700 font-semibold mt-1">Ready</span>
              </div>

              {/* Smaller White/Grey Accent Circle */}
              <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-700 font-bold absolute -bottom-1 z-20 shadow-xs">
                <span className="text-xs leading-none">{stats.gmailDraftsCount}</span>
                <span className="text-[8px] uppercase tracking-wider text-slate-500 font-semibold">Drafts</span>
              </div>
            </div>

            {/* Target Progress Bars */}
            <div className="space-y-3 mt-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Enterprise SaaS / Fintech</span>
                  <span className="font-bold">92%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-[#d4f34a] rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Healthcare & Clinical IT</span>
                  <span className="font-bold">78%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-sky-400 rounded-full" style={{ width: '78%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Defence & Advanced Tech</span>
                  <span className="font-bold">64%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: '64%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('campaigns')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
            >
              Configure Target Presets
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Operational Table: Recent Discoveries & Outreach Queue */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Investigated Prospects</h3>
            <p className="text-xs text-slate-500">
              Verified decision-makers ready for LinkedIn connection requests and Gmail draft reviews.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenDiscovery}
              className="px-3.5 py-2 rounded-xl bg-[#d4f34a] hover:bg-[#c4e33d] text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Find More Prospects
            </button>
            <button
              onClick={() => onNavigateTab('pipeline')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-all"
            >
              View All ({prospects.length})
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Prospect Cards Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Decision Maker</th>
                <th className="py-3 px-3">Company & Industry</th>
                <th className="py-3 px-3">Fit Score</th>
                <th className="py-3 px-3">LinkedIn Canonical Observation</th>
                <th className="py-3 px-3">Gmail Draft</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentProspects.map((prospect) => {
                const liOption = prospect.linkedinObservations?.[0];
                return (
                  <tr
                    key={prospect.id}
                    onClick={() => onSelectProspect(prospect)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-xs">
                          {prospect.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {prospect.name}
                          </p>
                          <p className="text-[11px] text-slate-500">{prospect.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-slate-800">{prospect.company}</p>
                      <p className="text-[11px] text-slate-400">{prospect.companyData?.industry}</p>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          prospect.fitScore >= 80
                            ? 'bg-[#d4f34a] text-slate-950'
                            : prospect.fitScore >= 70
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {prospect.fitScore}%
                        </span>
                        {prospect.qualification?.isQualified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      {liOption ? (
                        <p className="text-slate-600 line-clamp-1 text-[11px]">
                          <span className="font-semibold text-slate-800">
                            {liOption.optionType.split(' — ')[1] || 'Direct'}:
                          </span>{' '}
                          "{liOption.observation}"
                        </p>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Pending qualification</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {prospect.gmailDraft?.status === 'saved_to_gmail' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Saved to Gmail
                        </span>
                      ) : prospect.gmailDraft ? (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold w-fit block">
                          Draft Ready
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProspect(prospect);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                      >
                        Inspect Dossier
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
