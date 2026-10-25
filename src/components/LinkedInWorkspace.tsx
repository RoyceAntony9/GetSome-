import React, { useState } from 'react';
import {
  Linkedin,
  Copy,
  Check,
  Edit3,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { Prospect, LinkedInObservationAlternative, LinkedInTemplateVersion } from '../types/index';
import { CANONICAL_LINKEDIN_TEMPLATE, assembleLinkedInMessage } from '../constants/linkedinTemplate';

interface LinkedInWorkspaceProps {
  prospects: Prospect[];
  onUpdateProspect: (updated: Prospect) => void;
  onRefreshAll: () => Promise<void>;
}

export const LinkedInWorkspace: React.FC<LinkedInWorkspaceProps> = ({
  prospects,
  onUpdateProspect,
  onRefreshAll,
}) => {
  const [selectedProspectId, setSelectedProspectId] = useState<string>(
    prospects.find(p => p.qualification?.isQualified)?.id || prospects[0]?.id || ''
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editedObservation, setEditedObservation] = useState<string>('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showTemplateSettings, setShowTemplateSettings] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<LinkedInTemplateVersion>(CANONICAL_LINKEDIN_TEMPLATE);

  const qualifiedProspects = prospects.filter(p => p.qualification?.isQualified || p.manualOverride?.isOverridden);
  const activeProspect = prospects.find(p => p.id === selectedProspectId) || qualifiedProspects[0] || prospects[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSelectOption = async (optionId: string) => {
    if (!activeProspect) return;
    try {
      const res = await fetch(`/api/prospects/${activeProspect.id}/linkedin/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId }),
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdateProspect(updated);
      }
    } catch (err) {
      console.error('Failed to select option:', err);
    }
  };

  const handleSaveEditedObservation = async (optionId: string) => {
    if (!activeProspect) return;
    try {
      const res = await fetch(`/api/prospects/${activeProspect.id}/linkedin/option/${optionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ observation: editedObservation }),
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdateProspect(updated);
        setEditingOptionId(null);
      }
    } catch (err) {
      console.error('Failed to save edited observation:', err);
    }
  };

  const handleRegenerateObservations = async () => {
    if (!activeProspect) return;
    setIsRegenerating(true);
    try {
      const res = await fetch(`/api/prospects/${activeProspect.id}/linkedin/generate`, {
        method: 'POST',
      });
      if (res.ok) {
        await onRefreshAll();
      }
    } catch (err) {
      console.error('Failed to regenerate LinkedIn options:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Linkedin className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              LinkedIn First-Touch Outreach
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Strictly enforces your canonical inquisitive message template while generating 3 genuinely distinct factual observation angles (Direct, Strategic, Distinctive) backed by verified evidence.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowTemplateSettings(!showTemplateSettings)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            Template Settings
          </button>
          <button
            onClick={handleRegenerateObservations}
            disabled={isRegenerating || !activeProspect}
            className="px-3.5 py-2 rounded-xl bg-[#d4f34a] hover:bg-[#c4e33d] text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            Regenerate 3 Angles
          </button>
        </div>
      </div>

      {/* Template Settings Drawer / Panel */}
      {showTemplateSettings && (
        <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 shadow-md border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#d4f34a]">Canonical Spec</span>
              <h3 className="font-bold text-white text-base">LinkedIn Connection Template Configuration</h3>
            </div>
            <button
              onClick={() => setShowTemplateSettings(false)}
              className="text-slate-400 hover:text-white text-xs font-semibold"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <span className="font-bold text-slate-300">Preserved Fixed Text & Themes:</span>
              <ul className="space-y-1.5 text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Salutation: <code className="text-white">Hi [First Name],</code></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Lead: <code className="text-white">I noticed your work at the intersection of</code></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Closing Theme 1: <strong className="text-white">technology commercialization</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Closing Theme 2: <strong className="text-white">strategic partnerships</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Closing Theme 3: <strong className="text-white">driving growth in emerging markets</strong></span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <span className="font-bold text-slate-300">Live Personalization Preview:</span>
              <div className="mt-2 p-3 bg-slate-900 rounded-xl border border-slate-700/80 font-mono text-[11px] leading-relaxed text-slate-200">
                {assembleLinkedInMessage(
                  activeProspect ? activeProspect.name.split(' ')[0] : 'Elena',
                  'defence innovation, emerging technology, and government acquisition',
                  currentTemplate
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Only the personalized professional observation dynamically changes based on verified research.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main 2-column layout: Prospect Selector on left, 3-Option Comparison on right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Prospect List */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3 h-fit">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Decision Makers ({qualifiedProspects.length})
            </span>
            <span className="text-[10px] font-semibold text-slate-400">Click to Inspect</span>
          </div>

          <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1">
            {qualifiedProspects.map((p) => {
              const isSelected = p.id === (activeProspect?.id);
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProspectId(p.id)}
                  className={`w-full text-left p-3 rounded-2xl transition-all border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200/60 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs truncate max-w-[130px]">
                      {p.name}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected
                          ? 'bg-[#d4f34a] text-slate-950'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {p.fitScore}%
                    </span>
                  </div>
                  <p className={`text-[11px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {p.role}
                  </p>
                  <p className={`text-[10px] truncate ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                    {p.company}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 3 Columns: 3-Option Canonical Message Comparison */}
        <div className="lg:col-span-3 space-y-5">
          {activeProspect ? (
            <>
              {/* Prospect Context Header */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 font-bold text-sky-800 flex items-center justify-center text-base">
                    {activeProspect.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{activeProspect.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#d4f34a] text-slate-950 font-bold">
                        {activeProspect.fitScore}% Fit
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {activeProspect.role} at <strong className="text-slate-700">{activeProspect.company}</strong> ({activeProspect.companyData?.industry})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={activeProspect.linkedinUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-sky-600" />
                    Open LinkedIn Profile
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>

              {/* 3 Complete Messages Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {(activeProspect.linkedinObservations || []).map((opt) => {
                  const isSelected = activeProspect.selectedLinkedInOption === opt.id || opt.isSelected;
                  const isCopied = copiedId === opt.id;
                  const isEditing = editingOptionId === opt.id;

                  return (
                    <div
                      key={opt.id}
                      className={`rounded-3xl p-5 flex flex-col justify-between transition-all border ${
                        isSelected
                          ? 'bg-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
                          : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-[0_2px_12px_rgba(0,0,0,0.02)]'
                      }`}
                    >
                      <div>
                        {/* Option Tag & Status */}
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            opt.optionType.includes('Direct')
                              ? 'bg-slate-100 text-slate-800'
                              : opt.optionType.includes('Strategic')
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {opt.optionType}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-slate-900 bg-[#d4f34a] px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-slate-900" />
                              Selected
                            </span>
                          )}
                        </div>

                        {/* Complete Message Box */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-slate-800 text-xs leading-relaxed space-y-2">
                          <p>
                            <span className="text-slate-500 font-medium">Hi {activeProspect.name.split(' ')[0]},</span>{' '}
                            <span className="text-slate-500 font-medium">I noticed your work at the intersection of</span>{' '}
                            <strong className="text-slate-950 bg-[#d4f34a]/30 px-1 py-0.5 rounded font-bold">
                              {opt.observation}
                            </strong>.{' '}
                            <span className="text-slate-500 font-medium">
                              I’d love to connect and exchange ideas on technology commercialization, strategic partnerships, and driving growth in emerging markets.
                            </span>
                          </p>
                        </div>

                        {/* Character budget & limit validation */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
                          <span>Connection Request Limit</span>
                          <span className={opt.completeMessage.length <= 300 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-bold'}>
                            {opt.completeMessage.length} / 300 chars
                          </span>
                        </div>

                        {/* Supporting Evidence Provenance */}
                        <div className="mt-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-[11px] space-y-1">
                          <span className="font-semibold text-slate-700 block text-[10px] uppercase tracking-wider">
                            Supporting Research Grounding:
                          </span>
                          <p className="text-slate-600 italic">
                            "{opt.supportingEvidence}"
                          </p>
                          {opt.sourcesUsed?.[0] && (
                            <a
                              href={opt.sourcesUsed[0].url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sky-600 hover:underline flex items-center gap-1 text-[10px] mt-1 truncate"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              {opt.sourcesUsed[0].title}
                            </a>
                          )}
                        </div>

                        {/* Inline Observation Editor */}
                        {isEditing && (
                          <div className="mt-3 space-y-2 p-3 bg-slate-100 rounded-xl">
                            <label className="text-[10px] font-bold uppercase text-slate-700">
                              Edit Observation (Intersection of):
                            </label>
                            <input
                              type="text"
                              value={editedObservation}
                              onChange={(e) => setEditedObservation(e.target.value)}
                              className="w-full text-xs p-2 rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
                            />
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => setEditingOptionId(null)}
                                className="px-2 py-1 text-slate-600 text-[10px] font-semibold"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEditedObservation(opt.id)}
                                className="px-2.5 py-1 bg-slate-900 text-white rounded text-[10px] font-semibold"
                              >
                                Apply Changes
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(opt.completeMessage, opt.id)}
                            className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#d4f34a]" />
                                Copied to Clipboard!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Copy Message
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setEditingOptionId(opt.id);
                              setEditedObservation(opt.observation);
                            }}
                            title="Edit personalized observation"
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {!isSelected && (
                          <button
                            onClick={() => handleSelectOption(opt.id)}
                            className="w-full py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-[11px] font-semibold transition-colors"
                          >
                            Select this Angle
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
              <Linkedin className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-base">No Qualified Prospects Selected</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Run an autonomous research cycle or launch discovery to populate qualified prospects for LinkedIn connection outreach.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
