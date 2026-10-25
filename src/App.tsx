import React, { useState, useEffect, useCallback } from 'react';
import {
  Prospect,
  ICPProfile,
  Campaign,
  ResearchJob,
  AISettings,
} from './types/index';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { PipelineView } from './components/PipelineView';
import { ProspectDossier } from './components/ProspectDossier';
import { LinkedInWorkspace } from './components/LinkedInWorkspace';
import { GmailDraftsView } from './components/GmailDraftsView';
import { CampaignManager } from './components/CampaignManager';
import { ICPBuilder } from './components/ICPBuilder';
import { ChatCopilot } from './components/ChatCopilot';
import { IntegrationsView } from './components/IntegrationsView';
import { DiscoveryModal } from './components/DiscoveryModal';
import {
  Search,
  Bell,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [icps, setIcps] = useState<ICPProfile[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [jobs, setJobs] = useState<ResearchJob[]>([]);
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [stats, setStats] = useState<any>({
    totalProspects: 0,
    underResearch: 0,
    qualified: 0,
    highPriority: 0,
    readyForOutreach: 0,
    draftsAwaitingReview: 0,
    approvedDrafts: 0,
    gmailDraftsCount: 0,
    gmailSavedCount: 0,
    linkedinPreparedCount: 0,
    sentOutreach: 0,
    activeJobs: 0,
    campaignsCount: 0,
    campaignsActiveCount: 0,
    icpsCount: 0,
    gmailConnected: false,
    gmailEmail: '',
  });

  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAllData = useCallback(async () => {
    try {
      const [pRes, iRes, cRes, jRes, sRes, stRes] = await Promise.all([
        fetch('/api/prospects').then(r => r.json()),
        fetch('/api/icps').then(r => r.json()),
        fetch('/api/campaigns').then(r => r.json()),
        fetch('/api/jobs').then(r => r.json()),
        fetch('/api/settings').then(r => r.json()),
        fetch('/api/stats').then(r => r.json()),
      ]);

      setProspects(pRes || []);
      setIcps(iRes || []);
      setCampaigns(cRes || []);
      setJobs(jRes || []);
      setSettings(sRes || null);
      if (stRes) setStats(stRes);

      // Keep active view refreshed if selecting a prospect
      if (selectedProspect) {
        const refreshed = (pRes || []).find((p: Prospect) => p.id === selectedProspect.id);
        if (refreshed) setSelectedProspect(refreshed);
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProspect?.id]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Poll for background research jobs if any are active
  useEffect(() => {
    const hasActiveJob = jobs.some(j => j.status === 'running' || j.status === 'queued');
    if (!hasActiveJob) return;

    const interval = setInterval(() => {
      Promise.all([
        fetch('/api/jobs').then(r => r.json()),
        fetch('/api/prospects').then(r => r.json()),
        fetch('/api/stats').then(r => r.json()),
      ])
        .then(([updatedJobs, updatedProspects, updatedStats]) => {
          setJobs(updatedJobs || []);
          setProspects(updatedProspects || []);
          if (updatedStats) setStats(updatedStats);
          if (selectedProspect) {
            const refreshed = (updatedProspects || []).find((p: Prospect) => p.id === selectedProspect.id);
            if (refreshed) setSelectedProspect(refreshed);
          }
        })
        .catch(console.error);
    }, 2500);

    return () => clearInterval(interval);
  }, [jobs, selectedProspect?.id]);

  const handleRunResearch = async (prospectId: string) => {
    showToast('Starting 6-stage investigation pipeline...', 'info');
    try {
      const res = await fetch(`/api/research/run/${prospectId}`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        showToast(`Research complete for ${updated.name}! Fit score: ${updated.fitScore}%`, 'success');
        await loadAllData();
      }
    } catch (err: any) {
      showToast(`Research failed: ${err.message}`, 'error');
    }
  };

  const handleResumeJob = async (jobId: string) => {
    showToast('Resuming interrupted research job...', 'info');
    try {
      const res = await fetch(`/api/research/resume/${jobId}`, { method: 'POST' });
      if (res.ok) {
        showToast('Research resumed successfully.', 'success');
        await loadAllData();
      }
    } catch (err: any) {
      showToast(`Resume failed: ${err.message}`, 'error');
    }
  };

  const handleRunDiscovery = async (params: any): Promise<number> => {
    const res = await fetch('/api/discovery/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    await loadAllData();
    showToast(`Discovered ${data.count} new verified decision-maker(s).`, 'success');
    return data.count || 0;
  };

  const handleSaveCampaign = async (campaign: Campaign) => {
    const isNew = !campaigns.some(c => c.id === campaign.id);
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? '/api/campaigns' : `/api/campaigns/${campaign.id}`;

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaign),
    });
    await loadAllData();
    showToast(`Campaign "${campaign.name}" saved successfully.`, 'success');
  };

  const handleDeleteCampaign = async (id: string) => {
    await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
    await loadAllData();
    showToast('Campaign deleted.', 'info');
  };

  const handleDuplicateCampaign = async (id: string) => {
    await fetch(`/api/campaigns/${id}/duplicate`, { method: 'POST' });
    await loadAllData();
    showToast('Campaign duplicated.', 'success');
  };

  const handleSaveICP = async (icp: ICPProfile) => {
    const isNew = !icps.some(i => i.id === icp.id);
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? '/api/icps' : `/api/icps/${icp.id}`;

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(icp),
    });
    await loadAllData();
    showToast(`ICP Profile "${icp.name}" updated.`, 'success');
  };

  const handleDeleteICP = async (id: string) => {
    await fetch(`/api/icps/${id}`, { method: 'DELETE' });
    await loadAllData();
    showToast('ICP Profile deleted.', 'info');
  };

  const handleSaveSettings = async (newSettings: Partial<AISettings>) => {
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    });
    await loadAllData();
    showToast('AI Settings updated.', 'success');
  };

  const handleResetSeedData = async () => {
    await fetch('/api/db/seed', { method: 'POST' });
    setSelectedProspect(null);
    await loadAllData();
    showToast('Database reset to clean verified B2B dataset.', 'info');
  };

  const handleExportApproved = (format: 'csv' | 'json') => {
    window.open(`/api/outreach/export?format=${format}&includeAll=true`, '_blank');
  };

  const getPageTitle = () => {
    if (selectedProspect) return 'Prospect Intelligence Dossier';
    switch (activeTab) {
      case 'overview': return 'Overview Dashboard';
      case 'pipeline': return 'Prospect Pipeline';
      case 'campaigns': return 'Campaign Management';
      case 'icp_builder': return 'ICP Target Profiles';
      case 'linkedin': return 'LinkedIn Canonical Outreach';
      case 'gmail': return 'Gmail Email Drafts';
      case 'copilot': return 'Copilot Intel [Live Search]';
      case 'settings': return 'Integrations & AI Architecture';
      default: return 'GetSome';
    }
  };

  const getPageSubtitle = () => {
    if (selectedProspect) return `Deep technical and commercial intelligence for ${selectedProspect.name} (${selectedProspect.company})`;
    switch (activeTab) {
      case 'overview': return 'See all your B2B prospect intelligence and outreach activities here';
      case 'pipeline': return 'Verified enterprise decision-makers across target industry verticals';
      case 'campaigns': return 'Configure targeting rules across 12 major sectors and 60+ sub-industry presets';
      case 'icp_builder': return 'Define multi-criteria qualification algorithms, firmographics, and disqualifiers';
      case 'linkedin': return 'Canonical inquisitive connection requests with 3 distinct evidence-backed observations';
      case 'gmail': return 'Save personalized emails directly into your authentic Gmail account Drafts folder';
      case 'copilot': return 'Real-time corporate intelligence grounded in live Google Search results';
      case 'settings': return 'Google Workspace OAuth status, Gemini models, and telemetry settings';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex text-slate-800 antialiased font-sans">
      {/* Persistent Left Sidebar (Desktop) */}
      <div className="hidden lg:block">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setSelectedProspect(null);
          }}
          stats={stats}
          gmailConnected={Boolean(stats.gmailConnected)}
          onOpenDiscovery={() => setIsDiscoveryOpen(true)}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative z-10 w-72 bg-white h-full shadow-2xl flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-slate-100">
              <span className="font-bold text-slate-900 text-base">GetSome Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar
                activeTab={activeTab}
                onSelectTab={(tab) => {
                  setActiveTab(tab);
                  setSelectedProspect(null);
                  setMobileMenuOpen(false);
                }}
                stats={stats}
                gmailConnected={Boolean(stats.gmailConnected)}
                onOpenDiscovery={() => {
                  setIsDiscoveryOpen(true);
                  setMobileMenuOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        {/* Top Header matching reference screenshot */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 sticky top-0 z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {getPageTitle()}
                </h1>
                {stats.activeJobs > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {stats.activeJobs} Researching
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
                {getPageSubtitle()}
              </p>
            </div>
          </div>

          {/* Right Header Controls matching reference */}
          <div className="flex items-center gap-3">
            {/* Quick search input */}
            <div className="relative hidden md:block">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search prospects..."
                onFocus={() => {
                  if (activeTab !== 'pipeline') {
                    setActiveTab('pipeline');
                    setSelectedProspect(null);
                  }
                }}
                className="w-48 text-xs pl-8 pr-3 py-2 rounded-full bg-slate-100 border border-transparent focus:bg-white focus:border-slate-300 focus:outline-none transition-all"
              />
            </div>

            {/* Notification bell */}
            <button
              onClick={() => showToast('All autonomous research pipelines operating normally.', 'info')}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {stats.readyForOutreach > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#d4f34a] absolute top-1.5 right-1.5 ring-2 ring-white" />
              )}
            </button>

            {/* User Profile Pill matching reference */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center ring-1 ring-slate-300">
                PR
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-[10px] text-slate-400 block leading-none">Welcome back</span>
                <span className="text-xs font-bold text-slate-900 leading-tight">Percy Royce</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Detailed Prospect Dossier View */}
          {selectedProspect ? (
            <ProspectDossier
              prospect={selectedProspect}
              icp={icps.find(i => i.id === selectedProspect.icpId)}
              campaign={campaigns.find(c => c.id === selectedProspect.campaignId)}
              onBack={() => setSelectedProspect(null)}
              onOpenDraftReview={() => {
                setActiveTab('linkedin');
                setSelectedProspect(null);
              }}
              onRunResearch={() => handleRunResearch(selectedProspect.id)}
              onConsultCopilot={() => {
                setActiveTab('copilot');
              }}
              onUpdateProspect={(updated) => {
                setSelectedProspect(updated);
                setProspects(prev => prev.map(p => p.id === updated.id ? updated : p));
              }}
              showToast={showToast}
            />
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewDashboard
                  stats={stats}
                  prospects={prospects}
                  campaigns={campaigns}
                  icps={icps}
                  onSelectProspect={(p) => setSelectedProspect(p)}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onOpenDiscovery={() => setIsDiscoveryOpen(true)}
                />
              )}

              {activeTab === 'pipeline' && (
                <PipelineView
                  prospects={prospects}
                  icps={icps}
                  campaigns={campaigns}
                  jobs={jobs}
                  onSelectProspect={(p) => setSelectedProspect(p)}
                  onOpenDraftReview={(p) => {
                    setSelectedProspect(p);
                  }}
                  onRunResearch={handleRunResearch}
                  onResumeJob={handleResumeJob}
                  onLaunchDiscovery={() => setIsDiscoveryOpen(true)}
                  onExportApproved={handleExportApproved}
                />
              )}

              {activeTab === 'linkedin' && (
                <LinkedInWorkspace
                  prospects={prospects}
                  onUpdateProspect={(updated) => {
                    setProspects(prev => prev.map(p => p.id === updated.id ? updated : p));
                  }}
                  onRefreshAll={loadAllData}
                />
              )}

              {activeTab === 'gmail' && (
                <GmailDraftsView
                  prospects={prospects}
                  gmailConnected={Boolean(stats.gmailConnected)}
                  gmailEmail={stats.gmailEmail}
                  onUpdateProspect={(updated) => {
                    setProspects(prev => prev.map(p => p.id === updated.id ? updated : p));
                  }}
                  onRefreshAll={loadAllData}
                  showToast={showToast}
                />
              )}

              {activeTab === 'campaigns' && (
                <CampaignManager
                  campaigns={campaigns}
                  icps={icps}
                  onSaveCampaign={handleSaveCampaign}
                  onDeleteCampaign={handleDeleteCampaign}
                  onDuplicateCampaign={handleDuplicateCampaign}
                  onSelectCampaignForDiscovery={(cId) => {
                    setIsDiscoveryOpen(true);
                  }}
                />
              )}

              {activeTab === 'icp_builder' && (
                <ICPBuilder
                  icps={icps}
                  onSaveICP={handleSaveICP}
                  onDeleteICP={handleDeleteICP}
                />
              )}

              {activeTab === 'copilot' && (
                <ChatCopilot
                  prospects={prospects}
                  initialProspectId={selectedProspect?.id}
                />
              )}

              {activeTab === 'settings' && (
                <IntegrationsView
                  settings={settings || {
                    activeProvider: 'gemini',
                    geminiModel: 'gemini-3.8-flash',
                    ollamaEndpoint: '',
                    ollamaModel: '',
                    taskModels: {
                      queryGeneration: 'gemini-3.1-flash-lite',
                      reasoningAndQual: 'gemini-3.8-flash',
                      outreachWriting: 'gemini-3.8-flash',
                    },
                    researchDepth: 'deep_investigative',
                    rateLimitPerMinute: 60,
                    usage: {
                      promptTokens: 45200,
                      completionTokens: 19800,
                      totalRuns: 38,
                      estimatedCostUsd: 0.089,
                    },
                  }}
                  gmailConnected={Boolean(stats.gmailConnected)}
                  gmailEmail={stats.gmailEmail}
                  onSaveSettings={handleSaveSettings}
                  onResetSeedData={handleResetSeedData}
                  onRefreshAll={loadAllData}
                  showToast={showToast}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Discovery Modal */}
      {isDiscoveryOpen && (
        <DiscoveryModal
          campaigns={campaigns}
          icps={icps}
          onClose={() => setIsDiscoveryOpen(false)}
          onRunDiscovery={handleRunDiscovery}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 animate-fade-in text-xs font-semibold">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#d4f34a] shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;
