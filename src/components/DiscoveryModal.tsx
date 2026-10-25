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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#d4f34a] text-slate-950 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Autonomous Prospect Discovery</h2>
              <p className="text-xs text-slate-500">Discover verified decision-makers matching your ICP.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Campaign Selector */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Target Campaign:</label>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Discovery Mode Selector */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Discovery Strategy:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'natural_language', label: 'Semantic Query', icon: Search },
                { id: 'company_first', label: 'Target Account', icon: Building },
                { id: 'signal_driven', label: 'Buying Signal', icon: TrendingUp },
                { id: 'icp_driven', label: 'ICP Strict Filter', icon: Target },
                { id: 'csv_import', label: 'CSV Ingestion', icon: FileSpreadsheet },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = mode === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setMode(m.id as any)}
                    className={`p-2.5 rounded-xl text-left border flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#d4f34a]' : 'text-slate-500'}`} />
                    <span className="truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode inputs */}
          {mode === 'natural_language' && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">Natural Language Query:</label>
              <textarea
                rows={2}
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          )}

          {mode === 'company_first' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Company Name:</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Domain:</label>
                <input
                  type="text"
                  value={companyDomain}
                  onChange={(e) => setCompanyDomain(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                />
              </div>
            </div>
          )}

          {mode === 'csv_import' && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">Paste CSV Leads:</label>
              <textarea
                rows={4}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full text-xs font-mono p-2.5 rounded-xl bg-slate-50 border border-slate-200"
              />
            </div>
          )}

          {/* Max Volume */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Max Prospects to Discover: {limit}
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full accent-slate-900"
            />
          </div>

          {discoveryResultCount !== null && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Discovered {discoveryResultCount} verified decision-maker(s)!
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-[#d4f34a]" />
                  Searching Verified Records...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#d4f34a]" />
                  Run Discovery
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
