import React, { useState } from 'react';
import { Campaign, ICPProfile, ChannelType, SeniorityLevel } from '../types/index';
import { INDUSTRY_PRESETS, ALL_SUB_INDUSTRIES } from '../constants/industries';
import {
  Sliders,
  Plus,
  Play,
  Pause,
  Save,
  Trash2,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Layers,
  ChevronDown,
  X,
} from 'lucide-react';

interface CampaignManagerProps {
  campaigns: Campaign[];
  icps: ICPProfile[];
  onSaveCampaign: (campaign: Campaign) => Promise<void>;
  onDeleteCampaign: (id: string) => Promise<void>;
  onDuplicateCampaign?: (id: string) => Promise<void>;
  onSelectCampaignForDiscovery: (campaignId: string) => void;
}

export const CampaignManager: React.FC<CampaignManagerProps> = ({
  campaigns,
  icps,
  onSaveCampaign,
  onDeleteCampaign,
  onDuplicateCampaign,
  onSelectCampaignForDiscovery,
}) => {
  const [selectedCampId, setSelectedCampId] = useState<string>(campaigns[0]?.id || 'new');
  const [formData, setFormData] = useState<Campaign>(() => {
    return (
      campaigns[0] || {
        id: `camp_${Date.now()}`,
        name: 'Enterprise FinTech Infrastructure Q4',
        icpId: icps[0]?.id || '',
        objective: 'Partner with enterprise technology leaders to audit real-time streaming throughput.',
        offeringProposition: 'High-throughput real-time distributed streaming pipeline optimization and sub-10ms transactional verification.',
        targetGeography: ['United States', 'United Kingdom'],
        targetIndustries: ['Finance and Fintech', 'Technology and SaaS'],
        targetSubIndustries: ['Payments and financial infrastructure', 'Enterprise software and SaaS'],
        customIndustries: [],
        targetRoles: ['VP of Engineering', 'CTO', 'Head of Infrastructure'],
        seniorities: ['C-Level', 'VP', 'Head'],
        departments: ['Engineering', 'Platform Infrastructure'],
        exclusions: ['Crypto gambling', 'Micro-lenders'],
        buyingSignals: ['Hiring distributed systems leadership', 'Recent growth funding'],
        employeeCountMin: 100,
        employeeCountMax: 3000,
        tonePreference: 'Direct & Technical',
        channels: ['linkedin_connect', 'email'],
        maxDiscoveryVolume: 25,
        researchDepth: 'deep_investigative',
        qualificationThreshold: 70,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [customIndustryInput, setCustomIndustryInput] = useState('');
  const [activeIndustryCategory, setActiveIndustryCategory] = useState<string>(INDUSTRY_PRESETS[0].id);

  const handleSelectCampaign = (id: string) => {
    setSelectedCampId(id);
    if (id === 'new') {
      setFormData({
        id: `camp_${Date.now()}`,
        name: 'New Strategic Outreach Campaign',
        icpId: icps[0]?.id || '',
        objective: 'Discover and qualify decision-makers for emerging market commercialization.',
        offeringProposition: 'Enterprise technology commercialization and infrastructure modernization.',
        targetGeography: ['United States', 'Europe'],
        targetIndustries: ['Technology and SaaS'],
        targetSubIndustries: ['Enterprise software and SaaS'],
        customIndustries: [],
        targetRoles: ['VP of Engineering', 'CTO', 'Director of Technology'],
        seniorities: ['C-Level', 'VP', 'Director'],
        departments: ['Engineering', 'Technology'],
        exclusions: [],
        buyingSignals: ['Active cloud migration', 'Expanding platform teams'],
        employeeCountMin: 50,
        employeeCountMax: 2000,
        tonePreference: 'Direct & Technical',
        channels: ['linkedin_connect', 'email'],
        maxDiscoveryVolume: 20,
        researchDepth: 'deep_investigative',
        qualificationThreshold: 70,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      const found = campaigns.find(c => c.id === id);
      if (found) setFormData({ ...found });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveCampaign(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDuplicate = async () => {
    if (onDuplicateCampaign && formData.id && formData.id !== 'new') {
      await onDuplicateCampaign(formData.id);
    } else {
      const duplicated: Campaign = {
        ...formData,
        id: `camp_${Date.now()}`,
        name: `${formData.name} (Copy)`,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await onSaveCampaign(duplicated);
      setSelectedCampId(duplicated.id);
      setFormData(duplicated);
    }
  };

  const toggleIndustryPreset = (industryName: string) => {
    const list = formData.targetIndustries || [];
    const exists = list.includes(industryName);
    const updated = exists ? list.filter(i => i !== industryName) : [...list, industryName];
    setFormData({ ...formData, targetIndustries: updated });
  };

  const toggleSubIndustry = (sub: string) => {
    const list = formData.targetSubIndustries || [];
    const exists = list.includes(sub);
    const updated = exists ? list.filter(s => s !== sub) : [...list, sub];
    setFormData({ ...formData, targetSubIndustries: updated });
  };

  const addCustomIndustry = () => {
    if (!customIndustryInput.trim()) return;
    const tag = customIndustryInput.trim();
    const list = formData.customIndustries || [];
    if (!list.includes(tag)) {
      setFormData({ ...formData, customIndustries: [...list, tag] });
    }
    setCustomIndustryInput('');
  };

  const removeCustomIndustry = (tag: string) => {
    const list = formData.customIndustries || [];
    setFormData({ ...formData, customIndustries: list.filter(t => t !== tag) });
  };

  const toggleChannel = (ch: ChannelType) => {
    const exists = formData.channels.includes(ch);
    const updated = exists
      ? formData.channels.filter(c => c !== ch)
      : [...formData.channels, ch];
    setFormData({ ...formData, channels: updated });
  };

  const toggleSeniority = (s: SeniorityLevel) => {
    const list = formData.seniorities || ['C-Level', 'VP'];
    const exists = list.includes(s);
    const updated = exists ? list.filter(x => x !== s) : [...list, s];
    setFormData({ ...formData, seniorities: updated });
  };

  const currentCategoryObj = INDUSTRY_PRESETS.find(c => c.id === activeIndustryCategory) || INDUSTRY_PRESETS[0];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Campaign Management & Industry Coverage
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Configure multi-industry targeting across 12 B2B presets, custom niche definitions, qualification thresholds, and multi-channel parameters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleSelectCampaign('new')}
            className="px-4 py-2 rounded-xl bg-[#d4f34a] hover:bg-[#c4e33d] text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </button>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Campaign List */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3 h-fit">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Campaigns ({campaigns.length})
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Select to Edit</span>
          </div>

          <div className="space-y-2">
            {campaigns.map((c) => {
              const isSelected = c.id === selectedCampId;
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectCampaign(c.id)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200/60 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs truncate max-w-[130px]">{c.name}</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        c.status === 'active'
                          ? isSelected ? 'bg-[#d4f34a] text-slate-950' : 'bg-emerald-100 text-emerald-800'
                          : c.status === 'paused'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className={`text-[11px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {c.targetIndustries?.slice(0, 2).join(', ') || 'All Industries'}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-200/40">
                    <span>Threshold: {c.qualificationThreshold}%</span>
                    <span>Max: {c.maxDiscoveryVolume}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 3 Columns: Campaign Form & Industry Selector */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
            {/* Header controls for active campaign */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Editing Campaign Configuration
                </span>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Campaign Name"
                  className="text-lg font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Status Toggle (Active / Paused) */}
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      status: formData.status === 'active' ? 'paused' : 'active',
                    })
                  }
                  className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors border ${
                    formData.status === 'active'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  {formData.status === 'active' ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  {formData.status === 'active' ? 'Active' : 'Paused'}
                </button>

                <button
                  type="button"
                  onClick={handleDuplicate}
                  title="Duplicate Campaign"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>

                {campaigns.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onDeleteCampaign(formData.id)}
                    title="Delete Campaign"
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onSelectCampaignForDiscovery(formData.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#d4f34a]" />
                  Launch Discovery
                </button>
              </div>
            </div>

            {/* Campaign Core Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Target ICP Profile:
                </label>
                <select
                  value={formData.icpId}
                  onChange={(e) => setFormData({ ...formData, icpId: e.target.value })}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {icps.map((icp) => (
                    <option key={icp.id} value={icp.id}>
                      {icp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Messaging Tone Preference:
                </label>
                <select
                  value={formData.tonePreference}
                  onChange={(e) => setFormData({ ...formData, tonePreference: e.target.value as any })}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Direct & Technical">Direct & Technical</option>
                  <option value="Strategic & Executive">Strategic & Executive</option>
                  <option value="Consultative & Inquisitive">Consultative & Inquisitive</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Campaign Strategic Objective:
                </label>
                <input
                  type="text"
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  placeholder="e.g. Partner with FinTech engineering leadership to audit latency & settlement pipelines"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Offering Value Proposition:
                </label>
                <input
                  type="text"
                  value={formData.offeringProposition}
                  onChange={(e) => setFormData({ ...formData, offeringProposition: e.target.value })}
                  placeholder="Specific value proposition woven into cold emails and talking points"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* EXPANDED 12 INDUSTRY PRESETS & SUB-INDUSTRIES */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Expanded B2B Industry Presets (12 Major Sectors)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Select target categories, sub-industries, or add custom niche tags.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                  {(formData.targetIndustries || []).length} Categories Selected
                </span>
              </div>

              {/* Major Industry Category Pills */}
              <div className="flex flex-wrap gap-2">
                {INDUSTRY_PRESETS.map((cat) => {
                  const isSelected = (formData.targetIndustries || []).includes(cat.name);
                  const isCurrentView = activeIndustryCategory === cat.id;

                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => {
                        setActiveIndustryCategory(cat.id);
                        toggleIndustryPreset(cat.name);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      } ${isCurrentView ? 'ring-2 ring-slate-900/20' : ''}`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* Sub-industries for Active Category */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                  Sub-industries in {currentCategoryObj.name}:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {currentCategoryObj.subIndustries.map((sub) => {
                    const isChecked = (formData.targetSubIndustries || []).includes(sub);
                    return (
                      <label
                        key={sub}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs cursor-pointer border transition-all ${
                          isChecked
                            ? 'bg-white border-slate-900 font-semibold text-slate-900 shadow-xs'
                            : 'bg-white/60 hover:bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSubIndustry(sub)}
                          className="rounded text-slate-900 focus:ring-slate-900"
                        />
                        <span className="truncate">{sub}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Custom Industries / Niches */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Custom Industry / Niche Tags:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customIndustryInput}
                    onChange={(e) => setCustomIndustryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomIndustry();
                      }
                    }}
                    placeholder="Type custom niche (e.g. 'Dual-Use Drone Autonomy', 'Sub-second Ad Bidding') and press Add"
                    className="flex-1 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <button
                    type="button"
                    onClick={addCustomIndustry}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
                  >
                    Add Niche
                  </button>
                </div>

                {/* Render custom industry pills */}
                {(formData.customIndustries || []).length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {formData.customIndustries?.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4f34a]/30 border border-[#d4f34a] text-slate-900 text-xs font-semibold"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeCustomIndustry(tag)}
                          className="hover:text-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Target Decision-Maker Personas */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">
                Decision-Maker Roles & Seniority
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Seniority Levels:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['C-Level', 'VP', 'Director', 'Head', 'Manager'] as SeniorityLevel[]).map((sen) => {
                      const isSelected = (formData.seniorities || ['C-Level', 'VP']).includes(sen);
                      return (
                        <button
                          type="button"
                          key={sen}
                          onClick={() => toggleSeniority(sen)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {sen}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Qualification Minimum Threshold:
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={50}
                      max={95}
                      value={formData.qualificationThreshold}
                      onChange={(e) =>
                        setFormData({ ...formData, qualificationThreshold: Number(e.target.value) })
                      }
                      className="flex-1 accent-slate-900"
                    />
                    <span className="font-bold text-sm text-slate-900 w-12 text-right">
                      {formData.qualificationThreshold}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Save & Status Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                {savedSuccess && (
                  <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Campaign configuration saved!
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <Save className="w-4 h-4 text-[#d4f34a]" />
                Save Campaign Configuration
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
