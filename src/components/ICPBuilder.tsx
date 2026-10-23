import React, { useState } from 'react';
import { ICPProfile, SeniorityLevel } from '../types/index';
import { Target, Plus, Trash2, Save, Sparkles, Check, AlertCircle } from 'lucide-react';

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
        name: 'New Ideal Customer Profile',
        description: '',
        targetIndustries: ['FinTech', 'B2B SaaS'],
        companySizeMin: 100,
        companySizeMax: 2000,
        targetGeographies: ['United States', 'Europe'],
        businessModels: ['B2B SaaS', 'Enterprise'],
        techStackKeywords: ['PostgreSQL', 'Kubernetes'],
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

  // Switch ICP
  const handleSelectICP = (id: string) => {
    setSelectedIcpId(id);
    if (id === 'new') {
      setFormData({
        id: `icp_${Date.now()}`,
        name: 'New Custom ICP Targeting Profile',
        description: 'Targeting profile for high-value B2B prospects.',
        targetIndustries: ['B2B SaaS'],
        companySizeMin: 50,
        companySizeMax: 1000,
        targetGeographies: ['United States'],
        businessModels: ['B2B SaaS'],
        techStackKeywords: ['Cloud', 'PostgreSQL'],
        targetRoles: ['VP of Engineering', 'CTO'],
        seniorityLevels: ['C-Level', 'VP'],
        requiredConditions: ['B2B cloud infrastructure'],
        preferredAttributes: ['Active hiring for technology roles'],
        exclusionCriteria: ['Consumer retail'],
        positiveBuyingSignals: [{ signal: 'Series A/B funding', weight: 20 }],
        negativeBuyingSignals: [{ signal: 'Layoffs', weight: -20 }],
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

  // Helper list mutators
  const updateListField = (field: 'targetIndustries' | 'targetGeographies' | 'targetRoles' | 'requiredConditions' | 'preferredAttributes' | 'exclusionCriteria' | 'techStackKeywords', rawVal: string) => {
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

  const addPositiveSignal = () => {
    setFormData({
      ...formData,
      positiveBuyingSignals: [...formData.positiveBuyingSignals, { signal: 'New strategic partnership', weight: 15 }],
    });
  };

  const removePositiveSignal = (index: number) => {
    setFormData({
      ...formData,
      positiveBuyingSignals: formData.positiveBuyingSignals.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            <span>Ideal Customer Profile (ICP) Configuration Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Define multi-dimensional qualification logic, mandatory requirements, positive/negative signals, and scoring weights.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedIcpId}
            onChange={(e) => handleSelectICP(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
          >
            {icps.map(i => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
            <option value="new">+ Create New Profile</option>
          </select>

          <button
            onClick={() => handleSelectICP('new')}
            className="px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Profile</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Basic Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Profile Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Minimum Qualification Threshold (%)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="50"
                  max="90"
                  step="1"
                  value={formData.minScoreThreshold}
                  onChange={(e) => setFormData({ ...formData, minScoreThreshold: Number(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
                <span className="font-mono text-cyan-400 font-bold text-sm tabular-nums w-10 text-right">
                  {formData.minScoreThreshold}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Targeting Objective & Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              placeholder="Describe the company archetype and technological characteristics..."
            />
          </div>
        </div>

        {/* Company & Contact Attributes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Attributes */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-xs">
              01. Target Company Attributes
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Target Industries (Comma-separated)</label>
              <input
                type="text"
                value={formData.targetIndustries.join(', ')}
                onChange={(e) => updateListField('targetIndustries', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                placeholder="FinTech, Payments, Banking IT..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Min Employees</label>
                <input
                  type="number"
                  value={formData.companySizeMin}
                  onChange={(e) => setFormData({ ...formData, companySizeMin: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Max Employees</label>
                <input
                  type="number"
                  value={formData.companySizeMax}
                  onChange={(e) => setFormData({ ...formData, companySizeMax: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Operating Geographies (Comma-separated)</label>
              <input
                type="text"
                value={formData.targetGeographies.join(', ')}
                onChange={(e) => updateListField('targetGeographies', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                placeholder="United States, United Kingdom, Europe..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tech Stack Keywords (Verifiable)</label>
              <input
                type="text"
                value={formData.techStackKeywords.join(', ')}
                onChange={(e) => updateListField('techStackKeywords', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                placeholder="PostgreSQL, Kafka, Kubernetes, AWS..."
              />
            </div>
          </div>

          {/* Contact Attributes */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-xs">
              02. Target Executive Persona
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Target Roles & Titles (Comma-separated)</label>
              <input
                type="text"
                value={formData.targetRoles.join(', ')}
                onChange={(e) => updateListField('targetRoles', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                placeholder="VP of Engineering, CTO, Head of AI Platform..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Target Seniority Levels</label>
              <div className="flex flex-wrap gap-2">
                {(['C-Level', 'VP', 'Director', 'Head', 'Manager'] as SeniorityLevel[]).map((lvl) => {
                  const active = formData.seniorityLevels.includes(lvl);
                  return (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => toggleSeniority(lvl)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        active
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Required Conditions (Must-Have Conditions)</label>
              <textarea
                rows={2}
                value={formData.requiredConditions.join(', ')}
                onChange={(e) => updateListField('requiredConditions', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200"
                placeholder="Must operate mission-critical payment or transaction streaming pipelines..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Exclusion Criteria (Dealbreakers)</label>
              <input
                type="text"
                value={formData.exclusionCriteria.join(', ')}
                onChange={(e) => updateListField('exclusionCriteria', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-rose-300"
                placeholder="Crypto gambling, predatory micro-lending, consumer retail..."
              />
            </div>
          </div>
        </div>

        {/* Buying Signals & Scoring Weights */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-xs">
              03. Buying Signals & Transparent Weighting
            </h3>
            <button
              type="button"
              onClick={addPositiveSignal}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              <Plus className="w-3 h-3" />
              <span>Add Signal</span>
            </button>
          </div>

          <div className="space-y-2">
            {formData.positiveBuyingSignals.map((sig, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={sig.signal}
                  onChange={(e) => {
                    const copy = [...formData.positiveBuyingSignals];
                    copy[idx].signal = e.target.value;
                    setFormData({ ...formData, positiveBuyingSignals: copy });
                  }}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  placeholder="Buying signal description..."
                />
                <input
                  type="number"
                  value={sig.weight}
                  onChange={(e) => {
                    const copy = [...formData.positiveBuyingSignals];
                    copy[idx].weight = Number(e.target.value);
                    setFormData({ ...formData, positiveBuyingSignals: copy });
                  }}
                  className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-cyan-400 font-mono text-center"
                  title="Weight points"
                />
                <button
                  type="button"
                  onClick={() => removePositiveSignal(idx)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800/80">
            <h4 className="text-xs font-semibold text-slate-300 mb-3">Scoring Dimension Weights (Sum = 100)</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">ICP Fit ({formData.weights.icpFit}%)</label>
                <input
                  type="number"
                  value={formData.weights.icpFit}
                  onChange={(e) => setFormData({ ...formData, weights: { ...formData.weights, icpFit: Number(e.target.value) } })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">DM Relevance ({formData.weights.decisionMakerRelevance}%)</label>
                <input
                  type="number"
                  value={formData.weights.decisionMakerRelevance}
                  onChange={(e) => setFormData({ ...formData, weights: { ...formData.weights, decisionMakerRelevance: Number(e.target.value) } })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Signals ({formData.weights.buyingSignalStrength}%)</label>
                <input
                  type="number"
                  value={formData.weights.buyingSignalStrength}
                  onChange={(e) => setFormData({ ...formData, weights: { ...formData.weights, buyingSignalStrength: Number(e.target.value) } })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Evidence ({formData.weights.evidenceQuality}%)</label>
                <input
                  type="number"
                  value={formData.weights.evidenceQuality}
                  onChange={(e) => setFormData({ ...formData, weights: { ...formData.weights, evidenceQuality: Number(e.target.value) } })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Recency ({formData.weights.recency}%)</label>
                <input
                  type="number"
                  value={formData.weights.recency}
                  onChange={(e) => setFormData({ ...formData, weights: { ...formData.weights, recency: Number(e.target.value) } })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
          {selectedIcpId !== 'new' && icps.length > 1 ? (
            <button
              type="button"
              onClick={() => onDeleteICP(formData.id)}
              className="px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-900/60 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ICP Profile</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>ICP Profile Saved Successfully</span>
              </span>
            )}
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-cyan-500/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Targeting Profile</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
