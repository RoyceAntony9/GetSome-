import React, { useState } from 'react';
import { ICPProfile, SeniorityLevel } from '../types/index';
import { Target, Plus, Trash2, Save, Sparkles, Check, AlertCircle, Sliders } from 'lucide-react';

interface ICPBuilderProps {
  icps: ICPProfile[];
  onSaveICP: (icp: ICPProfile) => Promise<void>;
  onDeleteICP: (id: string) => Promise<void>;
}

export const ICPBuilder: React.FC<ICPBuilderProps> = ({ icps, onSaveICP, onDeleteICP }) => {
  const [selectedIcpId, setSelectedIcpId] = useState<string>(icps[0]?.id || 'new');
  const [formData, setFormData] = useState<ICPProfile>(() => {
    return (
      icps[0] || {
        id: `icp_${Date.now()}`,
        name: 'Enterprise FinTech & Infrastructure',
        description: 'B2B FinTech, payments, and distributed banking platform leaders.',
        targetIndustries: ['FinTech', 'B2B SaaS', 'Financial Services'],
        companySizeMin: 100,
        companySizeMax: 2000,
        targetGeographies: ['United States', 'Europe'],
        businessModels: ['B2B SaaS', 'Enterprise'],
        techStackKeywords: ['PostgreSQL', 'Kubernetes', 'Kafka', 'Go'],
        targetRoles: ['VP of Engineering', 'CTO', 'Head of AI'],
        seniorityLevels: ['C-Level', 'VP'],
        requiredConditions: ['Mission-critical high-throughput operational software'],
        preferredAttributes: ['Actively expanding engineering or AI teams'],
        exclusionCriteria: ['Crypto gambling', 'Micro-lending'],
        positiveBuyingSignals: [{ signal: 'Hiring engineering leadership', weight: 20 }],
        negativeBuyingSignals: [{ signal: 'Staff contraction', weight: -30 }],
        minScoreThreshold: 70,
        weights: {
          icpFit: 35,
          decisionMakerRelevance: 30,
          buyingSignalStrength: 15,
          evidenceQuality: 10,
          recency: 10,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSelectICP = (id: string) => {
    setSelectedIcpId(id);
    if (id === 'new') {
      setFormData({
        id: `icp_${Date.now()}`,
        name: 'New Custom ICP Targeting Profile',
        description: 'Targeting profile for high-value B2B prospects.',
        targetIndustries: ['Enterprise Software and SaaS'],
        companySizeMin: 50,
        companySizeMax: 1000,
        targetGeographies: ['United States'],
        businessModels: ['B2B SaaS'],
        techStackKeywords: ['PostgreSQL', 'AWS'],
        targetRoles: ['VP of Engineering', 'CTO'],
        seniorityLevels: ['C-Level', 'VP'],
        requiredConditions: ['Dedicated engineering organization'],
        preferredAttributes: ['Expanding technical teams'],
        exclusionCriteria: [],
        positiveBuyingSignals: [{ signal: 'Recent growth funding', weight: 20 }],
        negativeBuyingSignals: [{ signal: 'Downsizing', weight: -30 }],
        minScoreThreshold: 70,
        weights: {
          icpFit: 35,
          decisionMakerRelevance: 30,
          buyingSignalStrength: 15,
          evidenceQuality: 10,
          recency: 10,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      const found = icps.find(i => i.id === id);
      if (found) setFormData({ ...found });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveICP(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const updateListField = (field: keyof ICPProfile, rawVal: string) => {
    const list = rawVal.split(',').map(s => s.trim()).filter(Boolean);
    setFormData({ ...formData, [field]: list });
  };

  const toggleSeniority = (lvl: SeniorityLevel) => {
    const exists = formData.seniorityLevels.includes(lvl);
    const updated = exists
      ? formData.seniorityLevels.filter(s => s !== lvl)
      : [...formData.seniorityLevels, lvl];
    setFormData({ ...formData, seniorityLevels: updated });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Ideal Customer Profile (ICP) Builder
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Configure multi-dimensional qualification logic, mandatory conditions, exclusion criteria, and mathematical scoring weights.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedIcpId}
            onChange={(e) => handleSelectICP(e.target.value)}
            className="text-xs font-semibold p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            {icps.map(i => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
            <option value="new">+ Create New Profile</option>
          </select>

          <button
            onClick={() => handleSelectICP('new')}
            className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-[#d4f34a] hover:bg-[#c4e33d] rounded-xl transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            New ICP
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Info */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Profile Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs font-bold p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Minimum Qualification Threshold: {formData.minScoreThreshold}%
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="50"
                  max="90"
                  value={formData.minScoreThreshold}
                  onChange={(e) => setFormData({ ...formData, minScoreThreshold: Number(e.target.value) })}
                  className="w-full accent-slate-900"
                />
                <span className="text-xs font-bold text-slate-900 w-10 text-right">
                  {formData.minScoreThreshold}%
                </span>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Description & Scope</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Firmographic & Technographic Filters */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Firmographics & Technographics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Target Industries (comma-separated):
              </label>
              <input
                type="text"
                value={formData.targetIndustries.join(', ')}
                onChange={(e) => updateListField('targetIndustries', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Target Geographies (comma-separated):
              </label>
              <input
                type="text"
                value={formData.targetGeographies.join(', ')}
                onChange={(e) => updateListField('targetGeographies', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Company Employee Count (Min - Max):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.companySizeMin}
                  onChange={(e) => setFormData({ ...formData, companySizeMin: Number(e.target.value) })}
                  className="w-1/2 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  placeholder="Min"
                />
                <span className="text-slate-400 text-xs">to</span>
                <input
                  type="number"
                  value={formData.companySizeMax}
                  onChange={(e) => setFormData({ ...formData, companySizeMax: Number(e.target.value) })}
                  className="w-1/2 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  placeholder="Max"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Tech Stack Keywords (comma-separated):
              </label>
              <input
                type="text"
                value={formData.techStackKeywords.join(', ')}
                onChange={(e) => updateListField('techStackKeywords', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Roles & Exclusions */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Decision-Maker Roles & Strict Exclusions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Target Roles (comma-separated):
              </label>
              <input
                type="text"
                value={formData.targetRoles.join(', ')}
                onChange={(e) => updateListField('targetRoles', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Strict Exclusion Criteria (Disqualifiers):
              </label>
              <input
                type="text"
                value={formData.exclusionCriteria.join(', ')}
                onChange={(e) => updateListField('exclusionCriteria', e.target.value)}
                placeholder="e.g. Crypto gambling, Micro-lenders, Staff under 50"
                className="w-full text-xs p-2.5 rounded-xl bg-rose-50/50 border border-rose-200 text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Allowed Seniority Levels:
              </label>
              <div className="flex flex-wrap gap-2">
                {(['C-Level', 'VP', 'Director', 'Head', 'Manager', 'Lead'] as SeniorityLevel[]).map((lvl) => {
                  const isSelected = formData.seniorityLevels.includes(lvl);
                  return (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => toggleSeniority(lvl)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/80">
          <div className="text-xs text-slate-500">
            {savedSuccess && (
              <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                ICP Profile Saved!
              </span>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Save className="w-4 h-4 text-[#d4f34a]" />
            Save ICP Profile
          </button>
        </div>
      </form>
    </div>
  );
};
