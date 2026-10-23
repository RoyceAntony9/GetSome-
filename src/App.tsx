import React, { useState, useEffect, useCallback } from 'react';
import {
  Prospect,
  ICPProfile,
  Campaign,
  ResearchJob,
  AISettings,
  OutreachDraft,
} from './types/index';
import { TopNav, ActiveTab } from './components/TopNav';
import { PipelineView } from './components/PipelineView';
import { ProspectDossier } from './components/ProspectDossier';
import { DraftReviewModal } from './components/DraftReviewModal';
import { ICPBuilder } from './components/ICPBuilder';
import { CampaignManager } from './components/CampaignManager';
import { DiscoveryModal } from './components/DiscoveryModal';
import { SettingsModal } from './components/SettingsModal';
import { RotateCw, CheckCircle2, AlertCircle } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('pipeline');
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [icps, setIcps] = useState<ICPProfile[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [jobs, setJobs] = useState<ResearchJob[]>([]);
  const [settings, setSettings] = useState<AISettings | null>(null);

  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [reviewProspect, setReviewProspect] = useState<Prospect | null>(null);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadAllData = useCallback(async () => {
    try {
      const [pRes, iRes, cRes, jRes, sRes] = await Promise.all([
        fetch('/api/prospects').then(r => r.json()),
        fetch('/api/icps').then(r => r.json()),
        fetch('/api/campaigns').then(r => r.json()),
        fetch('/api/jobs').then(r => r.json()),
        fetch('/api/settings').then(r => r.json()),
      ]);

      setProspects(pRes || []);
      setIcps(iRes || []);
      setCampaigns(cRes || []);
      setJobs(jRes || []);
      setSettings(sRes || null);

      // Keep active view refreshed if selecting a prospect
      if (selectedProspect) {
        const refreshed = (pRes || []).find((p: Prospect) => p.id === selectedProspect.id);
        if (refreshed) setSelectedProspect(refreshed);
      }
      if (reviewProspect) {
        const refreshed = (pRes || []).find((p: Prospect) => p.id === reviewProspect.id);
        if (refreshed) setReviewProspect(refreshed);
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProspect?.id, reviewProspect?.id]);

  useEffect(() => {
    loadAllData();
  }, []);

  // Poll for background research jobs if any are active
  useEffect(() => {
    const hasActiveJob = jobs.some(j => j.status === 'running' || j.status === 'queued');
    if (!hasActiveJob) return;

    const interval = setInterval(() => {
      fetch('/api/jobs')
        .then(r => r.json())
        .then(updatedJobs => {
          setJobs(updatedJobs || []);
          fetch('/api/prospects')
            .then(r => r.json())
            .then(updatedProspects => {
              setProspects(updatedProspects || []);
              if (selectedProspect) {
                const refreshed = updatedProspects.find((p: Prospect) => p.id === selectedProspect.id);
                if (refreshed) setSelectedProspect(refreshed);
              }
            });
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

  const handleUpdateDraft = async (draftId: string, updates: Partial<OutreachDraft>) => {
    const res = await fetch(`/api/outreach/drafts/${draftId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      showToast('Draft updated and validated successfully.', 'success');
      await loadAllData();
    }
  };

  const handleRegenerateDraft = async (draftId: string, customInstruction: string) => {
    const res = await fetch(`/api/outreach/regenerate/${draftId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customInstruction }),
    });
    if (res.ok) {
      showToast('Message revised and re-analyzed.', 'success');
      await loadAllData();
    }
  };

  const handleMarkSentManually = async (prospectId: string) => {
    const res = await fetch(`/api/outreach/manual-send/${prospectId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'sent_manually', note: 'Dispatched manually via LinkedIn/Email' }),
    });
    if (res.ok) {
      showToast('Recorded outreach dispatch event.', 'success');
      await loadAllData();
    }
  };

  const handleExportApproved = (format: 'csv' | 'json') => {
    window.location.href = `/api/outreach/export?format=${format}`;
    showToast('Downloading approved outreach export...', 'info');
  };

  const handleSaveICP = async (icp: ICPProfile) => {
    const res = await fetch('/api/icps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(icp),
    });
    if (res.ok) {
      showToast(`Targeting profile "${icp.name}" saved.`, 'success');
      await loadAllData();
    }
  };

  const handleDeleteICP = async (id: string) => {
    await fetch(`/api/icps/${id}`, { method: 'DELETE' });
    showToast('ICP profile deleted.', 'info');
    await loadAllData();
  };

  const handleSaveCampaign = async (campaign: Campaign) => {
    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaign),
    });
    if (res.ok) {
      showToast(`Campaign "${campaign.name}" saved.`, 'success');
      await loadAllData();
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
    showToast('Campaign deleted.', 'info');
    await loadAllData();
  };

  const handleSaveSettings = async (newSettings: Partial<AISettings>) => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    });
    if (res.ok) {
      showToast('AI engine settings updated.', 'success');
      await loadAllData();
    }
  };

  const handleResetSeedData = async () => {
    const res = await fetch('/api/db/seed', { method: 'POST' });
    if (res.ok) {
      showToast('Database reset to clean verified B2B seed data.', 'success');
      await loadAllData();
      setSelectedProspect(null);
      setReviewProspect(null);
    }
  };

  const activeJobsCount = jobs.filter(j => j.status === 'running' || j.status === 'queued').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <TopNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'settings') {
            setIsSettingsOpen(true);
          } else {
            setActiveTab(tab);
            setSelectedProspect(null);
          }
        }}
        onOpenDiscovery={() => setIsDiscoveryOpen(true)}
        onResetSeed={handleResetSeedData}
        activeJobsCount={activeJobsCount}
      />

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 border border-cyan-800 text-white rounded-xl shadow-2xl text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toast.type === 'info' && <RotateCw className="w-4 h-4 text-cyan-400 shrink-0 animate-spin" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        {isLoading ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-3">
            <RotateCw className="w-6 h-6 text-cyan-400 animate-spin" />
            <p className="text-xs text-slate-400 font-mono">Initializing GetSome Intelligence Database...</p>
          </div>
        ) : selectedProspect ? (
          <ProspectDossier
            prospect={selectedProspect}
            icp={icps.find(i => i.id === selectedProspect.icpId)}
            campaign={campaigns.find(c => c.id === selectedProspect.campaignId)}
            onBack={() => setSelectedProspect(null)}
            onOpenDraftReview={() => setReviewProspect(selectedProspect)}
            onRunResearch={() => handleRunResearch(selectedProspect.id)}
          />
        ) : activeTab === 'pipeline' ? (
          <PipelineView
            prospects={prospects}
            icps={icps}
            campaigns={campaigns}
            jobs={jobs}
            onSelectProspect={(p) => setSelectedProspect(p)}
            onOpenDraftReview={(p) => setReviewProspect(p)}
            onRunResearch={(id) => handleRunResearch(id)}
            onResumeJob={(jobId) => handleResumeJob(jobId)}
            onLaunchDiscovery={() => setIsDiscoveryOpen(true)}
            onExportApproved={handleExportApproved}
          />
        ) : activeTab === 'icp_builder' ? (
          <ICPBuilder
            icps={icps}
            onSaveICP={handleSaveICP}
            onDeleteICP={handleDeleteICP}
          />
        ) : activeTab === 'campaigns' ? (
          <CampaignManager
            campaigns={campaigns}
            icps={icps}
            onSaveCampaign={handleSaveCampaign}
            onDeleteCampaign={handleDeleteCampaign}
            onSelectCampaignForDiscovery={(campaignId) => {
              setIsDiscoveryOpen(true);
            }}
          />
        ) : null}
      </main>

      {/* Outreach Draft Review Modal */}
      {reviewProspect && (
        <DraftReviewModal
          prospect={reviewProspect}
          onClose={() => setReviewProspect(null)}
          onUpdateDraft={handleUpdateDraft}
          onRegenerateDraft={handleRegenerateDraft}
          onMarkSentManually={handleMarkSentManually}
        />
      )}

      {/* Discovery Modal */}
      {isDiscoveryOpen && (
        <DiscoveryModal
          campaigns={campaigns}
          icps={icps}
          onClose={() => setIsDiscoveryOpen(false)}
          onRunDiscovery={handleRunDiscovery}
        />
      )}

      {/* AI Settings Modal */}
      {isSettingsOpen && settings && (
        <SettingsModal
          settings={settings}
          onSaveSettings={handleSaveSettings}
          onResetSeedData={handleResetSeedData}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
