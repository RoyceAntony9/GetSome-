import React, { useState } from 'react';
import {
  Prospect,
  ICPProfile,
  Campaign,
} from '../types/index';
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Building,
  MapPin,
  Calendar,
  FileText,
  TrendingUp,
  ShieldCheck,
  User,
  Globe,
  Layers,
  Sparkles,
  RotateCw,
  Clock,
  Send,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';

interface ProspectDossierProps {
  prospect: Prospect;
  icp?: ICPProfile;
  campaign?: Campaign;
  onBack: () => void;
  onOpenDraftReview: () => void;
  onRunResearch: () => void;
}

export const ProspectDossier: React.FC<ProspectDossierProps> = ({
  prospect,
  icp,
  campaign,
  onBack,
  onOpenDraftReview,
  onRunResearch,
}) => {
  const [activeTab, setActiveTab] = useState<'fit' | 'company' | 'person' | 'market' | 'signals' | 'claims' | 'timeline'>('fit');
  const [copiedLink, setCopiedLink] = useState(false);

  const comp = prospect.companyData;
  const person = prospect.personData;
  const qual = prospect.qualification;

  const copyDossierSummary = () => {
    const text = `PROSPECT INTELLIGENCE BRIEF
Name: ${prospect.name} (${prospect.role})
Company: ${prospect.company} (${prospect.domain})
ICP Fit Score: ${prospect.fitScore}/100
Core Buying Signal: ${prospect.signals[0]?.description || 'N/A'}
Why Contact: ${person.whyThisPerson || qual.summaryExplanation}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Back to Pipeline"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{prospect.name}</span>
                {prospect.verified && (
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" title="Verified Professional Identity" />
                )}
              </h1>
              <span className="text-slate-500">·</span>
              <span className="text-sm font-medium text-slate-300">{prospect.role}</span>
              <span className="text-slate-500">at</span>
              <a
                href={`https://${prospect.domain}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>{prospect.company}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>{prospect.location || 'United States'}</span>
              </span>
              <span>·</span>
              <span>Seniority: {person.seniority || 'VP'}</span>
              <span>·</span>
              <span>Discovered: {new Date(prospect.discoveryTimestamp).toLocaleDateString()}</span>
              <span>·</span>
              <a
                href={prospect.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
              >
                <Globe className="w-3 h-3" />
                <span>Public Profile</span>
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={copyDossierSummary}
            className="px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied Brief' : 'Copy Brief'}</span>
          </button>

          <button
            onClick={onRunResearch}
            className="px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            title="Re-run 6-stage investigation pipeline"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Re-Investigate</span>
          </button>

          <button
            onClick={onOpenDraftReview}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm shadow-cyan-500/20"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>
              Outreach Drafts ({prospect.drafts?.length || 0})
            </span>
          </button>
        </div>
      </div>

      {/* Primary Intelligence Workspace Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center gap-1 p-1.5 bg-slate-950/80 border-b border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('fit')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'fit'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>01. Fit & Scoring ({prospect.fitScore}%)</span>
          </button>

          <button
            onClick={() => setActiveTab('company')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'company'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-sky-400" />
            <span>02. Company Intelligence</span>
          </button>

          <button
            onClick={() => setActiveTab('person')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'person'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>03. Executive Influence</span>
          </button>

          <button
            onClick={() => setActiveTab('market')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'market'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>04. Market & Industry</span>
          </button>

          <button
            onClick={() => setActiveTab('signals')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'signals'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>05. Buying Signals ({prospect.signals?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('claims')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'claims'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span>06. Claims & Sources ({prospect.claims?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Activity Log</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6">
          {/* TAB 1: Qualification & Transparent Scoring */}
          {activeTab === 'fit' && (
            <div className="space-y-6">
              {/* Executive Summary Card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      Qualification Synthesis
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs font-mono text-cyan-400">
                      Evaluated against ICP: {icp?.name || 'Enterprise FinTech'}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
                      qual.isQualified
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                        : 'bg-amber-950 text-amber-300 border border-amber-800/80'
                    }`}
                  >
                    {qual.isQualified ? 'Target Fit Qualified' : 'Requires User Review'}
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {qual.summaryExplanation}
                </p>
                {qual.riskFactors && qual.riskFactors.length > 0 && (
                  <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded-lg text-xs text-rose-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <div>
                      <p className="font-semibold">Identified Risk / Deviation Factors:</p>
                      <ul className="list-disc pl-4 mt-1 space-y-0.5">
                        {qual.riskFactors.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Multi-Dimensional Scoring Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">ICP Fit</span>
                    <span className="font-mono text-cyan-400 font-bold tabular-nums">
                      {qual.dimensionScores.icpFit}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${qual.dimensionScores.icpFit}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-500">Weight: 35%</p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">DM Relevance</span>
                    <span className="font-mono text-emerald-400 font-bold tabular-nums">
                      {qual.dimensionScores.decisionMakerRelevance}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${qual.dimensionScores.decisionMakerRelevance}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-500">Weight: 30%</p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Buying Signals</span>
                    <span className="font-mono text-amber-400 font-bold tabular-nums">
                      {qual.dimensionScores.buyingSignalStrength}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${qual.dimensionScores.buyingSignalStrength}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-500">Weight: 15%</p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Evidence Quality</span>
                    <span className="font-mono text-purple-400 font-bold tabular-nums">
                      {qual.dimensionScores.evidenceQuality}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 rounded-full" style={{ width: `${qual.dimensionScores.evidenceQuality}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-500">Weight: 10%</p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Data Recency</span>
                    <span className="font-mono text-sky-400 font-bold tabular-nums">
                      {qual.dimensionScores.recency}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-400 rounded-full" style={{ width: `${qual.dimensionScores.recency}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-500">Weight: 10%</p>
                </div>
              </div>

              {/* Detailed Criterion-by-Criterion Evaluation Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Criterion Evaluation Breakdown</h3>
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-4 font-medium">Configured ICP Criterion</th>
                        <th className="py-2.5 px-4 font-medium">Type</th>
                        <th className="py-2.5 px-4 font-medium">Status</th>
                        <th className="py-2.5 px-4 font-medium">Evidence & Audit Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                      {qual.criteriaEvaluation.map((c, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="py-3 px-4 font-medium text-slate-200">
                            {c.criterion}
                          </td>
                          <td className="py-3 px-4 text-slate-400 capitalize">
                            {c.category}
                          </td>
                          <td className="py-3 px-4">
                            {c.status === 'satisfied' ? (
                              <span className="text-emerald-400 font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Satisfied</span>
                              </span>
                            ) : c.status === 'uncertain' ? (
                              <span className="text-amber-400 flex items-center gap-1">
                                <HelpCircle className="w-3.5 h-3.5" />
                                <span>Uncertain</span>
                              </span>
                            ) : c.status === 'contradicted' ? (
                              <span className="text-rose-400 font-medium flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Contradicted</span>
                              </span>
                            ) : (
                              <span className="text-slate-500 italic">Unresearched</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            <p>{c.evidenceNotes}</p>
                            {c.sourceCitation && (
                              <a
                                href={c.sourceCitation}
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan-400/90 hover:text-cyan-300 font-mono text-[11px] flex items-center gap-1 mt-1 truncate"
                              >
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                <span className="truncate">{c.sourceCitation}</span>
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Company Intelligence (Stage B) */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-2">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  What They Actually Do
                </span>
                <p className="text-sm text-slate-200 leading-relaxed font-sans">
                  {comp.whatTheyDo}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Products & Core Services
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {comp.productsAndServices?.map((p, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Target Customers & Business Model
                  </h4>
                  <p className="text-xs text-cyan-400 font-mono font-medium">{comp.businessModel}</p>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {comp.targetCustomers?.map((c, i) => (
                      <li key={i}>· {c}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Current Strategic Priorities
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {comp.strategicPriorities?.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Operational Bottlenecks & Challenges
                  </h4>
                  <ul className="space-y-1.5 text-xs text-amber-300/90">
                    {comp.operationalChallenges?.map((o, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Tech Stack & Competitors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Verified Technology Stack
                  </h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {comp.knownTechStack?.map((t, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-slate-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Direct Market Alternatives
                  </h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {comp.competitors?.map((c, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-400">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Solution Fit Hypothesis */}
              <div className="p-4 bg-cyan-950/30 border border-cyan-800/60 rounded-xl space-y-2">
                <h4 className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                  Hypothesized Offering Fit & Value Translation
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {comp.offeringBenefitFit}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Person-Level Intelligence (Stage C) */}
          {activeTab === 'person' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{person.fullName}</h3>
                    <p className="text-xs text-slate-400">{person.currentRole} · {person.department}</p>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2.5 py-1 rounded">
                    Seniority: {person.seniority}
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-sans">
                  {person.publicBio}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Scope of Influence & Responsibilities
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {person.responsibilities?.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Why This Specific Executive (Problem Ownership)
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {person.whyThisPerson}
                  </p>
                  <p className="text-xs text-cyan-400/90 pt-1">
                    Problem ownership: {person.problemOwnership}
                  </p>
                </div>
              </div>

              {/* Public Talks & Publications */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Publicly Available Talks, Articles & Interviews
                </h4>
                {person.publicContentAndTalks && person.publicContentAndTalks.length > 0 ? (
                  <div className="space-y-3">
                    {person.publicContentAndTalks.map((t, i) => (
                      <div key={i} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-semibold text-white flex items-center gap-2">
                            <span>{t.title}</span>
                            <span className="text-[11px] font-mono text-cyan-400">({t.type})</span>
                          </h5>
                          {t.date && <span className="text-[11px] text-slate-500 font-mono">{t.date}</span>}
                        </div>
                        <blockquote className="text-xs text-slate-300 italic border-l-2 border-cyan-500/60 pl-3 py-0.5">
                          "{t.excerpt}"
                        </blockquote>
                        {t.url && (
                          <a
                            href={t.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-cyan-400/80 hover:text-cyan-300 font-mono flex items-center gap-1"
                          >
                            <span>Source link</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No public keynotes retrieved yet.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Market Dynamics (Stage D) */}
          {activeTab === 'market' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-2">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Operating Industry Context: {prospect.industryData?.industry}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {prospect.industryData?.implicationsForRole}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Macro Industry Trends
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {prospect.industryData?.keyTrends?.map((t, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1 shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Competitive Pressures
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {prospect.industryData?.competitivePressures?.map((t, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Regulatory / Tech Mandates
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {prospect.industryData?.regulatoryOrTechShifts?.map((t, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1 shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Buying Signals (Stage E) */}
          {activeTab === 'signals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Evidence-Grounded Buying Triggers</h3>
                <span className="text-xs text-slate-500 font-mono">
                  {prospect.signals?.length || 0} active signals documented
                </span>
              </div>

              {prospect.signals?.map((s) => (
                <div key={s.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-semibold text-white uppercase tracking-wider">
                        {s.type.replace('_', ' ')}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs text-slate-400 font-mono">{s.date}</span>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
                      Confidence: {s.confidence}
                    </span>
                  </div>

                  <p className="text-sm text-slate-100 font-medium">{s.description}</p>
                  <p className="text-xs text-slate-400">
                    <span className="text-slate-500">Corroborated Evidence: </span>
                    {s.evidence}
                  </p>
                  <p className="text-xs text-cyan-300/90">
                    <span className="text-slate-500">Relevance to Our Offering: </span>
                    {s.relevanceToOffering}
                  </p>

                  {s.sourceUrl && (
                    <a
                      href={s.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-cyan-400/90 hover:text-cyan-300 font-mono flex items-center gap-1 pt-1"
                    >
                      <span>Primary Source Reference</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: Evidence Claims Catalog (Stage F) */}
          {activeTab === 'claims' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Structured Factual Claims with Source Provenance</h3>
                  <p className="text-xs text-slate-400">
                    Every material statement in the dossier links back to an verifiable public artifact.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {prospect.claims?.length || 0} claims cataloged
                </span>
              </div>

              <div className="space-y-3">
                {prospect.claims?.map((c) => (
                  <div key={c.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase font-semibold ${
                            c.claimType === 'fact'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {c.claimType}
                        </span>
                        <span className="text-slate-400 font-medium">{c.publisher}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-500 font-mono">Published: {c.publishedDate}</span>
                      </div>
                      <span className="font-mono text-cyan-400 text-[11px]">
                        Confidence: {c.confidence}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-100">{c.claim}</p>

                    <blockquote className="text-xs text-slate-400 italic bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                      "{c.excerpt}"
                    </blockquote>

                    <div className="flex flex-col md:flex-row md:items-center justify-between text-xs pt-1 gap-2">
                      <p className="text-slate-400">
                        <span className="text-slate-500">Outreach application: </span>
                        {c.potentialOutreachApplication}
                      </p>
                      <a
                        href={c.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 shrink-0"
                      >
                        <span>{c.sourceTitle || 'View Source'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: Activity Log */}
          {activeTab === 'timeline' && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Prospect Audit & Action Timeline</h3>
              <div className="space-y-2">
                {prospect.activityLog?.map((log, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg text-xs">
                    <span className="text-slate-500 font-mono shrink-0 pt-0.5">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{log.action}</span>
                        <span className="text-slate-500 text-[11px]">· by {log.actor}</span>
                      </div>
                      <p className="text-slate-400">{log.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
