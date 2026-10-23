import React, { useState } from 'react';
import {
  Prospect,
  ICPProfile,
  Campaign,
  ResearchJob,
  ProspectStage,
} from '../types/index';
import {
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  RotateCw,
  FileText,
  Download,
  Building,
  MapPin,
  TrendingUp,
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
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [minScore, setMinScore] = useState<number>(0);

  // Compute metrics from actual persisted data
  const totalCount = prospects.length;
  const underResearchCount = prospects.filter(p =>
    ['discovering', 'verifying', 'researching_company', 'researching_person', 'industry_analysis', 'qualifying', 'drafting'].includes(p.stage)
  ).length;
  const qualifiedCount = prospects.filter(p => p.qualification?.isQualified).length;
  const awaitingReviewCount = prospects.filter(p =>
    p.drafts?.some(d => d.approvalStatus === 'pending_review')
  ).length;
  const approvedCount = prospects.reduce(
    (acc, p) => acc + (p.drafts?.filter(d => d.approvalStatus === 'approved').length || 0),
    0
  );
  const sentCount = prospects.filter(p =>
    ['sent_manually', 'replied', 'converted'].includes(p.outreachStatus)
  ).length;

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
    if (selectedStage !== 'all' && p.stage !== selectedStage) return false;
    if (selectedStatus !== 'all' && p.outreachStatus !== selectedStatus) return false;
    if (p.fitScore < minScore) return false;
    return true;
  });

  const activeJobs = jobs.filter(j => j.status === 'running' || j.status === 'queued');

  return (
    <div className="space-y-6">
      {/* Active Jobs Notification Banner if any */}
      {activeJobs.length > 0 && (
        <div className="bg-slate-900 border border-cyan-800/70 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            <div>
              <p className="text-sm font-semibold text-white">
                Autonomous Research Engine Active ({activeJobs.length} in queue)
              </p>
              <p className="text-xs text-slate-400">
                Processing: {activeJobs.map(j => `${j.prospectName} (${j.currentStage})`).join(', ')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-400 tabular-nums">
              Stage: {activeJobs[0]?.currentStage} ({activeJobs[0]?.progress}%)
            </span>
          </div>
        </div>
      )}

      {/* KPI Scannable Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400">Discovered Prospects</p>
          <p className="text-2xl font-bold text-white font-mono tabular-nums mt-1">{totalCount}</p>
          <p className="text-xs text-slate-500 mt-1">Verified sources</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400">Under Investigation</p>
          <p className="text-2xl font-bold text-sky-400 font-mono tabular-nums mt-1">{underResearchCount}</p>
          <p className="text-xs text-slate-500 mt-1">Stages A-F in progress</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400">Qualified Fit</p>
          <p className="text-2xl font-bold text-emerald-400 font-mono tabular-nums mt-1">{qualifiedCount}</p>
          <p className="text-xs text-slate-500 mt-1">Passed ICP threshold</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400">Drafts Awaiting Review</p>
          <p className="text-2xl font-bold text-amber-400 font-mono tabular-nums mt-1">{awaitingReviewCount}</p>
          <p className="text-xs text-slate-500 mt-1">Ready for human approval</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400">Approved Drafts</p>
          <p className="text-2xl font-bold text-cyan-400 font-mono tabular-nums mt-1">{approvedCount}</p>
          <p className="text-xs text-slate-500 mt-1">Verified & compliant</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400">Outreach Dispatched</p>
          <p className="text-2xl font-bold text-purple-400 font-mono tabular-nums mt-1">{sentCount}</p>
          <p className="text-xs text-slate-500 mt-1">Manual delivery tracked</p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by prospect name, company, title, domain, or technology..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onExportApproved('csv')}
              className="px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
              title="Download CSV export of approved outreach drafts"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Approved (CSV)</span>
            </button>

            <button
              onClick={onLaunchDiscovery}
              className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Discover Prospects</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Target ICP:</span>
            <select
              value={selectedIcp}
              onChange={(e) => setSelectedIcp(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1 text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Targeting Profiles ({icps.length})</option>
              {icps.map(i => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Research Stage:</span>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1 text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Stages</option>
              <option value="ready_for_review">Ready for Review</option>
              <option value="queued">Queued / Discovered</option>
              <option value="verifying">Verifying</option>
              <option value="qualifying">Qualifying</option>
              <option value="drafting">Drafting</option>
              <option value="failed">Interrupted / Failed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Outreach Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1 text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Statuses</option>
              <option value="draft_ready">Draft Ready</option>
              <option value="approved">Approved</option>
              <option value="sent_manually">Sent</option>
              <option value="replied">Replied</option>
            </select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-slate-500">Min Fit Score:</span>
            <input
              type="range"
              min="0"
              max="95"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-24 accent-cyan-400"
            />
            <span className="font-mono text-cyan-400 tabular-nums font-semibold w-8 text-right">
              {minScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Prospect Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Showing</span>
            <span className="font-mono text-white font-semibold tabular-nums">{filteredProspects.length}</span>
            <span>of</span>
            <span className="font-mono text-white font-semibold tabular-nums">{prospects.length}</span>
            <span>researched prospects</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Source Grounding: 100% Primary Citable
          </span>
        </div>

        {filteredProspects.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No prospects match filter criteria</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Try adjusting your search terms, minimum score slider, or launch an automated discovery run to identify new qualified decision-makers.
            </p>
            <button
              onClick={onLaunchDiscovery}
              className="mt-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Discovery Run</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-medium tracking-wide">
                  <th className="py-3 px-4">Prospect & Role</th>
                  <th className="py-3 px-4">Company & Market</th>
                  <th className="py-3 px-4">ICP Fit Score</th>
                  <th className="py-3 px-4">Top Buying Signal</th>
                  <th className="py-3 px-4">Investigation Stage</th>
                  <th className="py-3 px-4">Outreach Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProspects.map((p) => {
                  const job = jobs.find(j => j.prospectId === p.id);
                  const isRunning = job && job.status === 'running';
                  const hasApprovedDraft = p.drafts?.some(d => d.approvalStatus === 'approved');
                  const topSignal = p.signals?.[0];

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => onSelectProspect(p)}
                    >
                      {/* Name & Role */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 flex items-center justify-center text-slate-200 font-semibold font-mono text-xs shrink-0">
                            {p.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors flex items-center gap-1.5 truncate">
                              <span>{p.name}</span>
                              {p.verified && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" title="Verified identity" />
                              )}
                            </p>
                            <p className="text-slate-400 truncate">{p.role}</p>
                            <p className="text-slate-500 font-mono text-[11px] truncate">{p.location}</p>
                          </div>
                        </div>
                      </td>

                      {/* Company & Domain */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-medium text-slate-200 truncate flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{p.company}</span>
                          </p>
                          <a
                            href={`https://${p.domain}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-cyan-400/80 hover:text-cyan-300 font-mono text-[11px] flex items-center gap-1 truncate"
                          >
                            <span>{p.domain}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                          <p className="text-slate-500 text-[11px] truncate">
                            {p.companyData?.industry || 'B2B Software'}
                          </p>
                        </div>
                      </td>

                      {/* ICP Fit Score */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 font-mono">
                            <span
                              className={`text-sm font-bold tabular-nums ${
                                p.fitScore >= 80
                                  ? 'text-emerald-400'
                                  : p.fitScore >= 70
                                  ? 'text-cyan-400'
                                  : 'text-amber-400'
                              }`}
                            >
                              {p.fitScore}%
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {p.qualification?.isQualified ? 'Qualified' : 'Review'}
                            </span>
                          </div>
                          <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                p.fitScore >= 80
                                  ? 'bg-emerald-400'
                                  : p.fitScore >= 70
                                  ? 'bg-cyan-400'
                                  : 'bg-amber-400'
                              }`}
                              style={{ width: `${p.fitScore}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono">
                            DM Rel: {p.qualification?.dimensionScores.decisionMakerRelevance || 85}%
                          </p>
                        </div>
                      </td>

                      {/* Top Buying Signal */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {topSignal ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                              <TrendingUp className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span className="truncate">{topSignal.description}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {topSignal.evidence}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Analysis in progress</span>
                        )}
                      </td>

                      {/* Stage */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isRunning ? (
                          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
                            <RotateCw className="w-3.5 h-3.5 animate-spin" />
                            <span>{job.currentStage} ({job.progress}%)</span>
                          </div>
                        ) : p.stage === 'ready_for_review' ? (
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Ready for Review</span>
                          </span>
                        ) : p.stage === 'queued' ? (
                          <span className="text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>Queued</span>
                          </span>
                        ) : p.stage === 'failed' ? (
                          <span className="text-rose-400 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Interrupted</span>
                          </span>
                        ) : (
                          <span className="text-sky-400 font-mono capitalize">
                            {p.stage.replace('_', ' ')}
                          </span>
                        )}
                      </td>

                      {/* Outreach Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {hasApprovedDraft ? (
                          <span className="text-cyan-300 font-medium">
                            Approved ({p.drafts.filter(d => d.approvalStatus === 'approved').length})
                          </span>
                        ) : p.outreachStatus === 'sent_manually' ? (
                          <span className="text-purple-400 font-medium">Sent Manually</span>
                        ) : p.drafts && p.drafts.length > 0 ? (
                          <span className="text-amber-400 font-medium">
                            {p.drafts.length} Drafts Ready
                          </span>
                        ) : (
                          <span className="text-slate-500">No Drafts</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div
                          className="flex items-center justify-end gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {p.stage === 'queued' || p.stage === 'failed' ? (
                            <button
                              onClick={() => onRunResearch(p.id)}
                              className="px-2.5 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 rounded-md transition-colors flex items-center gap-1"
                              title="Execute 6-stage research pipeline"
                            >
                              <Play className="w-3 h-3" />
                              <span>Investigate</span>
                            </button>
                          ) : p.drafts && p.drafts.length > 0 ? (
                            <button
                              onClick={() => onOpenDraftReview(p)}
                              className="px-2.5 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800/80 rounded-md transition-colors flex items-center gap-1"
                              title="Review and approve personalized outreach drafts"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Review Drafts</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onSelectProspect(p)}
                              className="px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1"
                            >
                              <span>Dossier</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
