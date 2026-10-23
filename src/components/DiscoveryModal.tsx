import React, { useState } from 'react';
import { Campaign, ICPProfile } from '../types/index';
import {
  X,
  Sparkles,
  Search,
  Building,
  TrendingUp,
  FileSpreadsheet,
  Target,
  RotateCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface DiscoveryModalProps {
  campaigns: Campaign[];
  icps: ICPProfile[];
  onClose: () => void;
  onRunDiscovery: (params: {
    campaignId: string;
    mode: 'natural_language' | 'icp_driven' | 'company_first' | 'signal_driven' | 'csv_import';
    query?: string;
    targetCompanyDomain?: string;
    targetCompanyName?: string;
    targetSignal?: string;
    csvData?: string;
    limit?: number;
  }) => Promise<number>;
}

export const DiscoveryModal: React.FC<DiscoveryModalProps> = ({
  campaigns,
  icps,
  onClose,
  onRunDiscovery,
}) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaigns[0]?.id || '');
  const [mode, setMode] = useState<'natural_language' | 'icp_driven' | 'company_first' | 'signal_driven' | 'csv_import'>('natural_language');
  const [nlQuery, setNlQuery] = useState('VP of Platform Engineering at enterprise FinTech companies scaling streaming pipelines');
  const [companyDomain, setCompanyDomain] = useState('monetacloud.com');
  const [companyName, setCompanyName] = useState('Moneta Cloud Payments');
  const [signalType, setSignalType] = useState('hiring_distributed_engineers');
  const [csvText, setCsvText] = useState(`name,company,role,domain,email,linkedin
Elena Rostova,NovaTax Cloud,CTO,novataxcloud.io,elena@novataxcloud.io,https://linkedin.com/in/elena-rostova
Devon Patel,Synapse Clinical Health,CTO,synapsehealth.co,devon@synapsehealth.co,https://linkedin.com/in/devon-patel`);
  const [limit, setLimit] = useState<number>(3);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [discoveryResultCount, setDiscoveryResultCount] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const count = await onRunDiscovery({
        campaignId: selectedCampaignId,
        mode,
        query: nlQuery,
        targetCompanyDomain: companyDomain,
        targetCompanyName: companyName,
        targetSignal: signalType,
        csvData: csvText,
        limit,
      });
      setDiscoveryResultCount(count);
      setTimeout(() => {
        onClose();
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Autonomous Prospect Discovery Engine</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Source real decision-makers, verify public footprints, and deduplicate domains.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Linked Campaign */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Target Campaign</label>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Discovery Method Selector Tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Choose Discovery Method</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {[
                { id: 'natural_language', label: 'Natural Language', icon: Search },
                { id: 'icp_driven', label: 'ICP-Driven', icon: Target },
                { id: 'company_first', label: 'Company-First', icon: Building },
                { id: 'signal_driven', label: 'Signal-Driven', icon: TrendingUp },
                { id: 'csv_import', label: 'CSV Lead Import', icon: FileSpreadsheet },
              ].map((m) => {
                const Icon = m.icon;
                const active = mode === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setMode(m.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-colors flex flex-col items-center justify-center gap-1.5 ${
                      active
                        ? 'bg-cyan-500/15 border-cyan-500/60 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-[11px] font-medium whitespace-nowrap">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic mode inputs */}
          {mode === 'natural_language' && (
            <div className="space-y-2 p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
              <label className="text-xs font-semibold text-slate-200">
                Describe the target persona, industry, and challenge in plain English:
              </label>
              <textarea
                rows={3}
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                placeholder="e.g., VP of Engineering at US FinTech companies processing high-volume transactions who recently raised Series B/C..."
              />
              <p className="text-[11px] text-slate-400">
                The AI translates this into multi-faceted search queries across company registries, public executive profiles, and corporate newsrooms.
              </p>
            </div>
          )}

          {mode === 'icp_driven' && (
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <p className="text-xs font-semibold text-cyan-300">ICP Automated Search Generation</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                The discovery engine will automatically derive targeted search vectors from the selected campaign's linked ICP profile (target industries, headcount ranges, required conditions, and executive seniority).
              </p>
            </div>
          )}

          {mode === 'company_first' && (
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <p className="text-xs font-semibold text-slate-200">
                Identify Company and Discover Its Decision-Makers
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Target Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Company Web Domain</label>
                  <input
                    type="text"
                    value={companyDomain}
                    onChange={(e) => setCompanyDomain(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {mode === 'signal_driven' && (
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <label className="text-xs font-semibold text-slate-200">
                Filter by Observable Market Buying Trigger:
              </label>
              <select
                value={signalType}
                onChange={(e) => setSignalType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value="hiring_distributed_engineers">Active Hiring for Distributed / AI Engineers</option>
                <option value="growth_funding">Recent Growth Capital / Series Funding</option>
                <option value="compliance_mandate">Approaching Regulatory Mandate (ViDA, ISO 20022, FHIR)</option>
                <option value="product_expansion">New Geographic or Enterprise Product Launch</option>
              </select>
            </div>
          )}

          {mode === 'csv_import' && (
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200">
                  Paste Raw CSV (Headers: name, company, role, domain, email, linkedin)
                </label>
              </div>
              <textarea
                rows={4}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Max Discovered Prospects:</span>
              <input
                type="number"
                min="1"
                max="10"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono text-center"
              />
            </div>

            <div className="flex items-center gap-2">
              {discoveryResultCount !== null && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Discovered & queued {discoveryResultCount} prospect(s)!</span>
                </span>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-cyan-500/20"
              >
                {isLoading ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{isLoading ? 'Searching & Grounding...' : 'Start Discovery Run'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
