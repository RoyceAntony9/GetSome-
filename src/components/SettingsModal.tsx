import React, { useState } from 'react';
import { AISettings } from '../types/index';
import { Settings, Cpu, HardDrive, Zap, DollarSign, Database, RotateCw, Check, Sparkles, X } from 'lucide-react';

interface SettingsModalProps {
  settings: AISettings;
  onSaveSettings: (settings: Partial<AISettings>) => Promise<void>;
  onResetSeedData: () => Promise<void>;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
  onResetSeedData,
  onClose,
}) => {
  const [formData, setFormData] = useState<AISettings>(settings);
  const [saved, setSaved] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = async () => {
    if (confirm('Reset database to clean verified B2B seed data?')) {
      setIsResetting(true);
      try {
        await onResetSeedData();
        setResetDone(true);
        setTimeout(() => setResetDone(false), 2500);
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-cyan-400" />
              <span>AI Provider & Model Management</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Provider-independent configuration supporting hosted Gemini APIs, local Ollama, and task specialization.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Active Provider Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Active Inference Provider</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, activeProvider: 'gemini' })}
                className={`p-3.5 rounded-xl border text-left transition-colors flex items-start gap-3 ${
                  formData.activeProvider === 'gemini'
                    ? 'bg-cyan-500/15 border-cyan-500/60 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-white">Google Gemini API (Official SDK)</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Utilizes @google/genai with server-side GEMINI_API_KEY. Native structured JSON support.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, activeProvider: 'ollama' })}
                className={`p-3.5 rounded-xl border text-left transition-colors flex items-start gap-3 ${
                  formData.activeProvider === 'ollama'
                    ? 'bg-cyan-500/15 border-cyan-500/60 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <HardDrive className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-white">Local Ollama Model Server</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Connects to self-hosted Ollama endpoint for private on-premise execution.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Model selection */}
          {formData.activeProvider === 'gemini' ? (
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Default Gemini Model</label>
                <select
                  value={formData.geminiModel}
                  onChange={(e) => setFormData({ ...formData, geminiModel: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="gemini-2.5-flash">gemini-2.5-flash (Fast, low-latency, balanced)</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro (Deep analytical reasoning & synthesis)</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Ollama HTTP Endpoint</label>
                <input
                  type="text"
                  value={formData.ollamaEndpoint}
                  onChange={(e) => setFormData({ ...formData, ollamaEndpoint: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  placeholder="http://localhost:11434"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Ollama Model Tag</label>
                <input
                  type="text"
                  value={formData.ollamaModel}
                  onChange={(e) => setFormData({ ...formData, ollamaModel: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  placeholder="llama3:8b"
                />
              </div>
            </div>
          )}

          {/* Task-Specific Model Specialization */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Task Specialization Architecture
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">1. Query Generation & Extraction</label>
                <input
                  type="text"
                  value={formData.taskModels.queryGeneration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      taskModels: { ...formData.taskModels, queryGeneration: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">2. Qualification Reasoning</label>
                <input
                  type="text"
                  value={formData.taskModels.reasoningAndQual}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      taskModels: { ...formData.taskModels, reasoningAndQual: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">3. Outreach Writing Engine</label>
                <input
                  type="text"
                  value={formData.taskModels.outreachWriting}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      taskModels: { ...formData.taskModels, outreachWriting: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Live Observability & Cost Tracking */}
          <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Token Observability & Estimated Cost</span>
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-400">Total Runs</p>
                <p className="text-sm font-bold text-white font-mono tabular-nums">{formData.usage.totalRuns}</p>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-400">Prompt Tokens</p>
                <p className="text-sm font-bold text-sky-400 font-mono tabular-nums">{formData.usage.promptTokens.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-400">Output Tokens</p>
                <p className="text-sm font-bold text-purple-400 font-mono tabular-nums">{formData.usage.completionTokens.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-400">Estimated Cost</p>
                <p className="text-sm font-bold text-emerald-400 font-mono tabular-nums">${formData.usage.estimatedCostUsd.toFixed(3)}</p>
              </div>
            </div>
          </div>

          {/* Database Reset Action */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
            <div>
              <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset Application Seed Data</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Restores the initial curated enterprise FinTech and HealthTech prospect dossiers.
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              disabled={isResetting}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {isResetting && <RotateCw className="w-3 h-3 animate-spin" />}
              <span>{resetDone ? 'Reset Complete' : 'Reset Seed Data'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 font-mono">
              Port: 3000 · Server: Express + Vite Middleware
            </span>
            <div className="flex items-center gap-2">
              {saved && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Settings Saved</span>
                </span>
              )}
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-cyan-500/20"
              >
                <span>Save AI Configuration</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
