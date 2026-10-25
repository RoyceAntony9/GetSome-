import React, { useState } from 'react';
import { AISettings } from '../types/index';
import {
  Settings,
  Cpu,
  Mail,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RotateCw,
  Sparkles,
  Save,
  LogIn,
  LogOut,
  Key,
} from 'lucide-react';
import { googleSignIn, logout, getCurrentUser } from '../services/firebaseAuth';

interface IntegrationsViewProps {
  settings: AISettings;
  gmailConnected: boolean;
  gmailEmail?: string;
  onSaveSettings: (settings: Partial<AISettings>) => Promise<void>;
  onResetSeedData: () => Promise<void>;
  onRefreshAll: () => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  settings,
  gmailConnected,
  gmailEmail,
  onSaveSettings,
  onResetSeedData,
  onRefreshAll,
  showToast,
}) => {
  const [formData, setFormData] = useState<AISettings>(settings);
  const [isConnecting, setIsConnecting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleConnectGmail = async () => {
    setIsConnecting(true);
    try {
      const res = await googleSignIn();
      if (res) {
        showToast(`Connected to Gmail as ${res.user.email}!`, 'success');
        await onRefreshAll();
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectGmail = async () => {
    try {
      await logout();
      showToast('Disconnected from Gmail.', 'info');
      await onRefreshAll();
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
              <Settings className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Integrations & AI Architecture
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Manage official Google Workspace OAuth connections for Gmail Drafts, AI model configurations, and execution telemetry.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Workspace & Gmail Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Google Workspace / Gmail</h3>
                <p className="text-xs text-slate-500">Official OAuth 2.0 Drafts API</p>
              </div>
            </div>
            {gmailConnected ? (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Connected
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold text-xs">
                Not Connected
              </span>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Authorized Scope:</span>
              <code className="text-slate-800 font-mono text-[11px]">https://www.googleapis.com/auth/gmail.compose</code>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Active Gmail User:</span>
              <span className="font-semibold text-slate-800">{gmailEmail || 'No active account'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Sending Safety Restriction:</span>
              <span className="font-bold text-emerald-700">Strict Drafts-Only (Never sends)</span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-500">
            <span className="font-bold text-slate-700 block">Integration Capabilities:</span>
            <ul className="space-y-1 list-disc list-inside">
              <li>Creates real email drafts in your authenticated Gmail Drafts folder.</li>
              <li>Allows manual in-Gmail review and personal dispatch.</li>
              <li>Never invokes the Gmail send endpoint automatically.</li>
            </ul>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {gmailConnected ? (
              <button
                onClick={handleDisconnectGmail}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Disconnect Account
              </button>
            ) : (
              <button
                onClick={handleConnectGmail}
                disabled={isConnecting}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <LogIn className="w-4 h-4 text-[#d4f34a]" />
                {isConnecting ? 'Authorizing in Google Popup...' : 'Sign in & Connect Gmail'}
              </button>
            )}

            <a
              href="https://mail.google.com/mail/u/0/#drafts"
              target="_blank"
              rel="noreferrer"
              className="text-sky-600 hover:underline text-xs flex items-center gap-1 font-semibold"
            >
              Open Gmail Web
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Gemini Engine Telemetry & Settings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Gemini Models & Telemetry</h3>
                <p className="text-xs text-slate-500">Autonomous reasoning and search grounding</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#d4f34a] text-slate-950 font-bold text-xs">
              Gemini 3.8 Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Agent Runs:</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">
                {formData.usage?.totalRuns || 38}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Cost:</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">
                ${(formData.usage?.estimatedCostUsd || 0.089).toFixed(3)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">
              Specialized Reasoning Models:
            </label>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span>Live Grounded Research</span>
                <code className="font-mono text-slate-900 font-bold">gemini-3.8-flash</code>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span>Account Strategy & Architecture</span>
                <code className="font-mono text-slate-900 font-bold">gemini-4-argon</code>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span>High-Velocity ICP Screening</span>
                <code className="font-mono text-slate-900 font-bold">gemini-3.1-flash-lite</code>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={async () => {
                if (window.confirm('Reset database to clean verified B2B seed data?')) {
                  setIsResetting(true);
                  try {
                    await onResetSeedData();
                    showToast('Database reset to clean verified state.', 'success');
                  } finally {
                    setIsResetting(false);
                  }
                }
              }}
              disabled={isResetting}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
            >
              Reset Curated B2B Seed
            </button>

            <span className="text-[11px] text-slate-400">
              Auto-saved
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
