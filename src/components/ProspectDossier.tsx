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
  Bot,
  Linkedin,
  Mail,
  Edit3,
} from 'lucide-react';
import { assembleLinkedInMessage } from '../constants/linkedinTemplate';

interface ProspectDossierProps {
  prospect: Prospect;
  icp?: ICPProfile;
  campaign?: Campaign;
  onBack: () => void;
  onOpenDraftReview: () => void;
  onRunResearch: () => void;
  onConsultCopilot?: () => void;
  onUpdateProspect?: (updated: Prospect) => void;
  showToast?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ProspectDossier: React.FC<ProspectDossierProps> = ({
  prospect,
  icp,
  campaign,
  onBack,
  onOpenDraftReview,
  onRunResearch,
  onConsultCopilot,
  onUpdateProspect,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'fit' | 'linkedin' | 'gmail' | 'company' | 'person' | 'signals' | 'claims' | 'timeline'>('fit');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedOptionId, setCopiedOptionId] = useState<string | null>(null);
  const [isSavingGmail, setIsSavingGmail] = useState(false);
  const [isOverriding, setIsOverriding] = useState(false);
  const [overrideNote, setOverrideNote] = useState('');

  const comp = prospect.companyData;
  const person = prospect.personData;
  const qual = prospect.qualification;

  const copyDossierSummary = () => {
    const text = `PROSPECT INTELLIGENCE BRIEF
Name: ${prospect.name} (${prospect.role})
Company: ${prospect.company} (${prospect.domain})
ICP Fit Score: ${prospect.fitScore}/100
Core Buying Signal: ${prospect.signals?.[0]?.description || 'N/A'}
Why Contact: ${person?.whyThisPerson || qual?.summaryExplanation || 'High ICP match'}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyOption = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOptionId(id);
    setTimeout(() => setCopiedOptionId(null), 2000);
  };

  const handleManualOverride = async (enable: boolean) => {
    try {
      const res = await fetch(`/api/prospects/${prospect.id}/override-qualification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isOverridden: enable,
          note: overrideNote || 'Manually qualified by operator',
          overriddenScore: 85,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        if (onUpdateProspect) onUpdateProspect(updated);
        setIsOverriding(false);
        if (showToast) showToast(`Qualification override ${enable ? 'applied' : 'removed'}.`, 'success');
      }
    } catch (err: any) {
      if (showToast) showToast(err.message, 'error');
    }
  };

  const handleSaveToGmail = async () => {
    if (!prospect.gmailDraft) return;
    setIsSavingGmail(true);
    try {
      const res = await fetch(`/api/prospects/${prospect.id}/gmail/save-to-account`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (onUpdateProspect) onUpdateProspect(data.prospect);
        if (showToast) showToast('Saved draft directly to your Gmail account Drafts!', 'success');
      } else {
        throw new Error(data.error || 'Failed to save to Gmail.');
      }
    } catch (err: any) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setIsSavingGmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Back to Pipeline"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>{prospect.name}</span>
                {prospect.verified && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" title="Verified Identity" />
                )}
              </h1>
              <span className="text-slate-400">·</span>
              <span className="text-sm font-semibold text-slate-700">{prospect.role}</span>
              <span className="text-slate-400">at</span>
              <a
                href={`https://${prospect.domain}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-bold text-sky-600 hover:underline flex items-center gap-1"
              >
                {prospect.company}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {comp?.headquarters || prospect.location} • {comp?.industry} • {prospect.email}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={copyDossierSummary}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedLink ? 'Copied Brief' : 'Copy Brief'}
          </button>

          {onConsultCopilot && (
            <button
              onClick={onConsultCopilot}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Bot className="w-3.5 h-3.5 text-sky-600" />
              Ask Copilot
            </button>
          )}

          <button
            onClick={onRunResearch}
            className="px-4 py-2 rounded-xl bg-[#d4f34a] hover:bg-[#c4e33d] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Re-run 6-Stage Investigation
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200/80 shadow-xs flex items-center gap-1 overflow-x-auto text-xs font-semibold text-slate-600">
        <button
          onClick={() => setActiveTab('fit')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'fit' ? 'bg-slate-900 text-white shadow-xs' : 'hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          ICP Fit & Qualification ({prospect.fitScore}%)
        </button>

        <button
          onClick={() => setActiveTab('linkedin')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'linkedin' ? 'bg-slate-900 text-white shadow-xs' : 'hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Linkedin className="w-3.5 h-3.5 text-sky-500" />
          LinkedIn 3-Option Angles
        </button>

        <button
          onClick={() => setActiveTab('gmail')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'gmail' ? 'bg-slate-900 text-white shadow-xs' : 'hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-emerald-500" />
          Gmail Draft
          {prospect.gmailDraft?.status === 'saved_to_gmail' && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('company')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'company' ? 'bg-slate-900 text-white shadow-xs' : 'hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Company Context
        </button>

        <button
          onClick={() => setActiveTab('person')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'person' ? 'bg-slate-900 text-white shadow-xs' : 'hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Executive Scope
        </button>

        <button
          onClick={() => setActiveTab('signals')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'signals' ? 'bg-slate-900 text-white shadow-xs' : 'hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Buying Signals ({prospect.signals?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'claims' ? 'bg-slate-900 text-white shadow-xs' : 'hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Verified Evidence ({prospect.claims?.length || 0})
        </button>
      </div>

      {/* Tab 1: Transparent Qualification & Fit */}
      {activeTab === 'fit' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Algorithmic Qualification Breakdown
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-3xl font-extrabold text-slate-900">{prospect.fitScore}/100</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    qual?.isQualified
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {qual?.isQualified ? 'Meets ICP Qualification Threshold' : 'Below Qualification Threshold'}
                  </span>
                </div>
              </div>

              {/* Manual Override Control */}
              <div>
                {prospect.manualOverride?.isOverridden ? (
                  <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-2xl">
                    <ShieldCheck className="w-4 h-4 text-purple-700" />
                    <span className="text-xs font-bold text-purple-900">Manually Approved</span>
                    <button
                      onClick={() => handleManualOverride(false)}
                      className="ml-2 text-[11px] text-purple-700 underline font-semibold hover:text-purple-900"
                    >
                      Revert
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsOverriding(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Manual Override
                  </button>
                )}
              </div>
            </div>

            {/* Override Input Modal Box */}
            {isOverriding && (
              <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-3">
                <span className="text-xs font-bold text-purple-950 block">
                  Confirm Manual Qualification Override:
                </span>
                <p className="text-[11px] text-purple-800">
                  Allows outreach drafting even if the algorithmic criteria were previously disqualified.
                </p>
                <input
                  type="text"
                  value={overrideNote}
                  onChange={(e) => setOverrideNote(e.target.value)}
                  placeholder="Reason for manual override (e.g. strategic account target, referral)"
                  className="w-full text-xs p-2 rounded-xl bg-white border border-purple-300 focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsOverriding(false)}
                    className="px-3 py-1 text-slate-600 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleManualOverride(true)}
                    className="px-3 py-1.5 bg-purple-900 text-white rounded-xl text-xs font-bold"
                  >
                    Confirm Override
                  </button>
                </div>
              </div>
            )}

            {/* 5-Dimension Score Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: 'ICP Structural Fit', score: qual?.dimensionScores?.icpFit || 85 },
                { label: 'Role Authority', score: qual?.dimensionScores?.decisionMakerRelevance || 80 },
                { label: 'Buying Signals', score: qual?.dimensionScores?.buyingSignalStrength || 75 },
                { label: 'Evidence Provenance', score: qual?.dimensionScores?.evidenceQuality || 90 },
                { label: 'Recency Vector', score: qual?.dimensionScores?.recency || 85 },
              ].map((dim) => (
                <div key={dim.label} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">{dim.label}</span>
                  <div className="flex items-baseline justify-between mt-1 mb-2">
                    <span className="text-lg font-bold text-slate-900">{dim.score}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-slate-900 rounded-full" style={{ width: `${dim.score}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Criteria Evaluation Checklist */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Individual Criteria Corroboration:
              </h4>
              <div className="space-y-2">
                {qual?.criteriaEvaluation?.map((c, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{c.criterion}</span>
                        <span className="text-[10px] uppercase font-semibold text-slate-400">({c.category})</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{c.evidenceNotes}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === 'satisfied'
                        ? 'bg-emerald-100 text-emerald-800'
                        : c.status === 'uncertain'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: LinkedIn Canonical 3-Options */}
      {activeTab === 'linkedin' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">LinkedIn Canonical First-Touch Angles</h3>
              <p className="text-xs text-slate-500">
                Preserves fixed wording and closing themes while generating 3 distinct factual observations.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#d4f34a] text-slate-950 font-bold">
              Canonical Spec
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(prospect.linkedinObservations || []).map((opt) => {
              const isSelected = prospect.selectedLinkedInOption === opt.id || opt.isSelected;
              const isCopied = copiedOptionId === opt.id;

              return (
                <div
                  key={opt.id}
                  className={`rounded-2xl p-5 border flex flex-col justify-between ${
                    isSelected ? 'bg-white border-slate-900 shadow-sm ring-2 ring-slate-900/10' : 'bg-slate-50/50 border-slate-200'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{opt.optionType}</span>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-slate-900 bg-[#d4f34a] px-2 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed">
                      <p>
                        <span className="text-slate-500">Hi {prospect.name.split(' ')[0]}, I noticed your work at the intersection of</span>{' '}
                        <strong className="text-slate-950 bg-[#d4f34a]/30 px-1 py-0.5 rounded">
                          {opt.observation}
                        </strong>.{' '}
                        <span className="text-slate-500">
                          I’d love to connect and exchange ideas on technology commercialization, strategic partnerships, and driving growth in emerging markets.
                        </span>
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-500 italic">
                      "{opt.supportingEvidence}"
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {opt.completeMessage.length}/300 chars
                    </span>
                    <button
                      onClick={() => handleCopyOption(opt.completeMessage, opt.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-[#d4f34a]" /> : <Copy className="w-3.5 h-3.5" />}
                      {isCopied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Gmail Draft */}
      {activeTab === 'gmail' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Gmail First-Touch Email Draft</h3>
              <p className="text-xs text-slate-500">
                Created directly in your authentic Gmail account Drafts folder. Never auto-sent.
              </p>
            </div>
            {prospect.gmailDraft?.status === 'saved_to_gmail' ? (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Saved in Gmail
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                Local Draft
              </span>
            )}
          </div>

          {prospect.gmailDraft ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Subject:</span>
                <p className="text-sm font-bold text-slate-900">{prospect.gmailDraft.subject}</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Message Body:</span>
                <pre className="text-xs font-sans whitespace-pre-wrap text-slate-800 leading-relaxed">
                  {prospect.gmailDraft.body}
                </pre>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                {prospect.gmailDraft.status === 'saved_to_gmail' ? (
                  <a
                    href={prospect.gmailDraft.webUrl || 'https://mail.google.com/mail/u/0/#drafts'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-[#d4f34a] font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open in Gmail
                  </a>
                ) : (
                  <button
                    onClick={handleSaveToGmail}
                    disabled={isSavingGmail}
                    className="px-5 py-2.5 rounded-xl bg-[#d4f34a] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-[#c4e33d] transition-all disabled:opacity-50"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {isSavingGmail ? 'Saving to Gmail...' : 'Save Draft to Gmail Account'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No email draft generated yet.</p>
          )}
        </div>
      )}

      {/* Tab 4: Company Context */}
      {activeTab === 'company' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
          <h3 className="font-bold text-slate-900 text-base">Company Intelligence & Operations</h3>
          <p className="text-xs text-slate-700 leading-relaxed">{comp?.whatTheyDo}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="font-bold text-slate-900 block">Strategic Priorities:</span>
              <ul className="space-y-1 text-slate-600 list-disc list-inside">
                {comp?.strategicPriorities?.map((sp, idx) => (
                  <li key={idx}>{sp}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="font-bold text-slate-900 block">Known Tech Stack:</span>
              <div className="flex flex-wrap gap-1.5">
                {comp?.knownTechStack?.map((t, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-mono text-[11px] font-semibold text-slate-700">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Executive Scope */}
      {activeTab === 'person' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Executive Purview & Problem Ownership</h3>
          <p className="text-xs text-slate-700 leading-relaxed">{person?.publicBio}</p>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
            <span className="font-bold text-slate-900 block">Problem Ownership:</span>
            <p className="text-slate-600">{person?.problemOwnership}</p>
          </div>
        </div>
      )}

      {/* Tab 6: Buying Signals */}
      {activeTab === 'signals' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Corroborated Buying Signals</h3>
          <div className="space-y-3">
            {prospect.signals?.map((s) => (
              <div key={s.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{s.description}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#d4f34a] text-slate-950 uppercase">
                    {s.type}
                  </span>
                </div>
                <p className="text-slate-600 italic">{s.evidence}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Verified Claims */}
      {activeTab === 'claims' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Structured Claims & Source Citations</h3>
          <div className="space-y-3">
            {prospect.claims?.map((c) => (
              <div key={c.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">"{c.claim}"</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                    {c.claimType}
                  </span>
                </div>
                <p className="text-slate-600 italic">{c.excerpt}</p>
                {c.sourceUrl && (
                  <a
                    href={c.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-600 hover:underline flex items-center gap-1 text-[11px] pt-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Source: {c.sourceTitle || c.publisher || c.sourceUrl}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
