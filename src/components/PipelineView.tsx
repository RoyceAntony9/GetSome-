import React, { useState } from 'react';
import {
  Prospect,
  ICPProfile,
  Campaign,
  ResearchJob,
  ProspectStage,
  UnifiedProspectStatus,
} from '../types/index';
import {
  Search,
  Filter,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  RotateCw,
  Download,
  Building,
  MapPin,
  TrendingUp,
  SlidersHorizontal,
  Linkedin,
  Mail,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface PipelineViewProps {
  prospects: Prospect[];
  icps: ICPProfile[];
  campaigns: Campaign[];
  jobs: ResearchJob[];
  onSelectProspect: (prospect: Prospect) => void;
  onOpenDraftReview: (prospect: Prospect) => void;
  onRunResearch: (prospectId: string) => void;
  onResumeJob: (jobId: string) => void;
  onLaunchDiscovery: () => void;
  onExportApproved: (format: 'csv' | 'json') => void;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  prospects,
  icps,
  campaigns,
  jobs,
  onSelectProspect,
  onOpenDraftReview,
  onRunResearch,
  onResumeJob,
  onLaunchDiscovery,
  onExportApproved,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIcp, setSelectedIcp] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [minScore, setMinScore] = useState<number>(0);

  const activeJobs = jobs.filter(j => j.status === 'running' || j.status === 'queued');

  const filteredProspects = prospects.filter(p => {
    if (search) {
      const q = search.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.company.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.domain.toLowerCase().includes(q) ||
        p.companyData?.industry?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedIcp !== 'all' && p.icpId !== selectedIcp) return false;
    if (selectedStatus !== 'all' && (p.unifiedStatus !== selectedStatus && p.stage !== selectedStatus)) return false;
    if (p.fitScore < minScore) return false;
    return true;
  });

  const getStatusBadge = (p: Prospect) => {
    if (p.manualOverride?.isOverridden) {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-bold flex items-center gap-1 w-fit">
          <ShieldCheck className="w-3 h-3 text-purple-700" />
          Override Approved
        </span>
      );
    }

    if (p.unifiedStatus === 'manually_sent' || p.outreachStatus === 'sent_manually') {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-[#d4f34a] text-[10px] font-bold flex items-center gap-1 w-fit">
          <CheckCircle2 className="w-3 h-3 text-[#d4f34a]" />
          Manually Sent
        </span>
      );
    }

    if (p.gmailDraft?.status === 'saved_to_gmail') {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 w-fit">
          <Mail className="w-3 h-3 text-emerald-600" />
          In Gmail Drafts
        </span>
      );
    }

    if (p.unifiedStatus === 'ready_for_outreach' || p.stage === 'ready_for_review') {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-[#d4f34a] text-slate-950 text-[10px] font-bold flex items-center gap-1 w-fit">
          <Sparkles className="w-3 h-3 text-slate-950" />
          Ready for Outreach
        </span>
      );
    }

    if (p.stage === 'rejected' || p.unifiedStatus === 'rejected') {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-semibold w-fit">
          Disqualified
        </span>
      );
    }

    if (['verifying', 'researching_company', 'researching_person', 'industry_analysis', 'qualifying', 'drafting'].includes(p.stage)) {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-semibold flex items-center gap-1 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          {p.stage.replace('_', ' ')}
        </span>
      );
    }

    return (
      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold w-fit">
        {p.unifiedStatus || p.stage}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Active Jobs Banner */}
      {activeJobs.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-sky-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                Autonomous Deep Research in Progress ({activeJobs.length} active)
              </p>
              <p className="text-[11px] text-slate-500">
                Gathering primary source evidence, tech stack fingerprints, and qualification scoring.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-xl">
            Stage: {activeJobs[0].currentStage} ({activeJobs[0].progress}%)
          </span>
        </div>
      )}

      {/* Main Container Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
        {/* Top Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Prospect Pipeline & Deep Dossiers
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredProspects.length} verified B2B decision-makers across target sectors.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onExportApproved('csv')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>

            <button
              onClick={onLaunchDiscovery}
              className="px-4 py-2 rounded-xl bg-[#d4f34a] hover:bg-[#c4e33d] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Discover Prospects
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search executive, company, domain..."
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* ICP Selector */}
          <div>
            <select
              value={selectedIcp}
              onChange={(e) => setSelectedIcp(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="all">All ICP Target Profiles</option>
              {icps.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="all">All Workflow States</option>
              <option value="ready_for_outreach">Ready for Outreach</option>
              <option value="email_draft_saved_to_gmail">In Gmail Drafts</option>
              <option value="linkedin_message_prepared">LinkedIn Prepared</option>
              <option value="manually_sent">Manually Sent</option>
              <option value="rejected">Disqualified</option>
            </select>
          </div>

          {/* Min Score Slider */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">Min Score:</span>
            <input
              type="range"
              min={0}
              max={95}
              step={5}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full accent-slate-900"
            />
            <span className="text-xs font-bold text-slate-900 w-8 text-right">{minScore}%</span>
          </div>
        </div>

        {/* Prospect Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Decision Maker</th>
                <th className="py-3 px-3">Organization & Domain</th>
                <th className="py-3 px-3">ICP Fit Score</th>
                <th className="py-3 px-3">Primary Evidence Citation</th>
                <th className="py-3 px-3">Workflow State</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProspects.map((prospect) => {
                const claim = prospect.claims?.[0];
                return (
                  <tr
                    key={prospect.id}
                    onClick={() => onSelectProspect(prospect)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    {/* Executive */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-xs shadow-xs">
                          {prospect.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {prospect.name}
                          </p>
                          <p className="text-[11px] text-slate-500">{prospect.role}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{prospect.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-slate-800">{prospect.company}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{prospect.domain}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium inline-block mt-0.5">
                        {prospect.companyData?.industry || 'B2B Software'}
                      </span>
                    </td>

                    {/* Fit Score */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                            prospect.fitScore >= 80
                              ? 'bg-[#d4f34a] text-slate-950'
                              : prospect.fitScore >= 70
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {prospect.fitScore}%
                        </span>
                        {prospect.qualification?.isQualified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                      </div>
                    </td>

                    {/* Primary Evidence Citation */}
                    <td className="py-3.5 px-3 max-w-sm">
                      {claim ? (
                        <div>
                          <p className="text-[11px] text-slate-700 italic line-clamp-1">
                            "{claim.claim}"
                          </p>
                          {claim.sourceUrl && (
                            <a
                              href={claim.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[10px] text-sky-600 hover:underline flex items-center gap-1 mt-0.5 truncate"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              {claim.sourceTitle || claim.publisher || prospect.company}
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Unresearched entity</span>
                      )}
                    </td>

                    {/* State */}
                    <td className="py-3.5 px-3">
                      {getStatusBadge(prospect)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProspect(prospect);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition-colors"
                        >
                          Dossier
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRunResearch(prospect.id);
                          }}
                          title="Run 6-stage deep investigation"
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
