import React, { useState } from 'react';
import { Campaign, ICPProfile, ChannelType } from '../types/index';
import { Sliders, Plus, Play, Pause, Save, Trash2, Check, ArrowRight } from 'lucide-react';

interface CampaignManagerProps {
  campaigns: Campaign[];
  icps: ICPProfile[];
  onSaveCampaign: (campaign: Campaign) => Promise<void>;
  onDeleteCampaign: (id: string) => Promise<void>;
  onSelectCampaignForDiscovery: (campaignId: string) => void;
}

export const CampaignManager: React.FC<CampaignManagerProps> = ({
  campaigns,
  icps,
  onSaveCampaign,
  onDeleteCampaign,
  onSelectCampaignForDiscovery,
}) => {
  const [selectedCampId, setSelectedCampId] = useState<string>(campaigns[0]?.id || 'new');
  const [formData, setFormData] = useState<Campaign>(() => {
    return (
      campaigns[0] || {
        id: `camp_${Date.now()}`,
        name: 'New Growth Outreach Campaign',
        icpId: icps[0]?.id || 'icp_fintech_enterprise',
        objective: 'Engage technology leaders on core infrastructure modernization.',
        offeringProposition: 'High-throughput real-time streaming pipeline optimization and zero-downtime database scaling.',
        targetGeography: ['United States'],
        targetIndustries: ['FinTech', 'SaaS'],
        targetRoles: ['VP of Engineering', 'CTO'],
        exclusions: ['Micro-lenders'],
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

  const handleSelectCampaign = (id: string) => {
    setSelectedCampId(id);
    if (id === 'new') {
      setFormData({
        id: `camp_${Date.now()}`,
        name: 'New B2B Targeted Campaign',
        icpId: icps[0]?.id || '',
        objective: 'Target enterprise decision-makers with evidence-backed outreach.',
        offeringProposition: 'Enterprise AI & cloud modernization.',
        targetGeography: ['United States', 'Europe'],
        targetIndustries: ['Enterprise Software'],
        targetRoles: ['VP of Engineering', 'CTO'],
        exclusions: [],
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

  const toggleChannel = (ch: ChannelType) => {
    const exists = formData.channels.includes(ch);
    const updated = exists
      ? formData.channels.filter(c => c !== ch)
      : [...formData.channels, ch];
    setFormData({ ...formData, channels: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <span>Outreach Campaign Workspace</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure targeting goals, specific value propositions, messaging tones, and channel boundaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCampId}
            onChange={(e) => handleSelectCampaign(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
          >
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            <option value="new">+ Create New Campaign</option>
          </select>

          <button
            onClick={() => handleSelectCampaign('new')}
            className="px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Campaign Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Linked ICP Target Profile</label>
              <select
                value={formData.icpId}
                onChange={(e) => setFormData({ ...formData, icpId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {icps.map(i => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Strategic Campaign Objective</label>
            <textarea
              rows={2}
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              placeholder="e.g. Partner with engineering leaders navigating migration from batch reconciliation to sub-second streaming ledgers..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-cyan-400">
              Configured Offering & Value Proposition (The core solution to position)
            </label>
            <textarea
              rows={2}
              value={formData.offeringProposition}
              onChange={(e) => setFormData({ ...formData, offeringProposition: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
              placeholder="e.g. Adaptive streaming verification layer that eliminates Kafka partition skew under traffic spikes..."
              required
            />
          </div>
        </div>

        {/* Messaging Tone & Channel Constraints */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-xs">
              Executive Tone & Voice Preference
            </h3>

            <div className="space-y-2">
              {[
                {
                  id: 'Direct & Technical',
                  desc: 'Peer-to-peer engineering tone. Directly addresses architecture trade-offs without marketing fluff.',
                },
                {
                  id: 'Strategic & Executive',
                  desc: 'High-level business and operational outcome focus tailored for C-Suite executives.',
                },
                {
                  id: 'Consultative & Inquisitive',
                  desc: 'Asks insightful questions about their published challenges, fostering genuine dialogue.',
                },
              ].map((tone) => (
                <label
                  key={tone.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.tonePreference === tone.id
                      ? 'bg-cyan-500/10 border-cyan-500/50 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="tone"
                    checked={formData.tonePreference === tone.id}
                    onChange={() => setFormData({ ...formData, tonePreference: tone.id as any })}
                    className="mt-0.5 accent-cyan-400"
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{tone.id}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{tone.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-xs">
              Authorized Outreach Channels
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'linkedin_connect', label: 'LinkedIn Connection', note: 'Strictly <= 300 chars' },
                { id: 'linkedin_inmail', label: 'LinkedIn InMail', note: 'Structured business inquiry' },
                { id: 'email', label: 'Cold Email', note: 'Subject + Body' },
                { id: 'followup', label: 'Contextual Follow-Up', note: 'Value-additive update' },
              ].map((ch) => {
                const active = formData.channels.includes(ch.id as ChannelType);
                return (
                  <button
                    type="button"
                    key={ch.id}
                    onClick={() => toggleChannel(ch.id as ChannelType)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      active
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <p className="text-xs font-semibold">{ch.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{ch.note}</p>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Max Discovery Volume</label>
                <input
                  type="number"
                  value={formData.maxDiscoveryVolume}
                  onChange={(e) => setFormData({ ...formData, maxDiscoveryVolume: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Research Depth</label>
                <select
                  value={formData.researchDepth}
                  onChange={(e) => setFormData({ ...formData, researchDepth: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="deep_investigative">Deep Investigative (Stages A-F)</option>
                  <option value="standard">Standard Brief</option>
                  <option value="rapid">Rapid Screening</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
          {selectedCampId !== 'new' && campaigns.length > 1 ? (
            <button
              type="button"
              onClick={() => onDeleteCampaign(formData.id)}
              className="px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-900/60 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Campaign</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onSelectCampaignForDiscovery(formData.id)}
              className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Run Discovery with this Campaign</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {savedSuccess && (
              <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>Campaign Saved</span>
              </span>
            )}
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-cyan-500/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Campaign</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
