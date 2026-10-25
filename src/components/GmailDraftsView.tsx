import React, { useState } from 'react';
import {
  Mail,
  Send,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit3,
  Trash2,
  ShieldCheck,
  Sparkles,
  Lock,
  LogIn,
  LogOut,
  Clock,
} from 'lucide-react';
import { Prospect } from '../types/index';
import { googleSignIn, logout, getCurrentUser } from '../services/firebaseAuth';

interface GmailDraftsViewProps {
  prospects: Prospect[];
  gmailConnected: boolean;
  gmailEmail?: string;
  onUpdateProspect: (updated: Prospect) => void;
  onRefreshAll: () => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const GmailDraftsView: React.FC<GmailDraftsViewProps> = ({
  prospects,
  gmailConnected,
  gmailEmail,
  onUpdateProspect,
  onRefreshAll,
  showToast,
}) => {
  const [selectedProspectId, setSelectedProspectId] = useState<string>(
    prospects.find(p => p.gmailDraft)?.id || prospects[0]?.id || ''
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSavingToGmail, setIsSavingToGmail] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');

  const prospectsWithDrafts = prospects.filter(p => p.gmailDraft);
  const activeProspect = prospects.find(p => p.id === selectedProspectId) || prospectsWithDrafts[0] || prospects[0];

  const handleConnectGmail = async () => {
    setIsConnecting(true);
    try {
      const res = await googleSignIn();
      if (res) {
        showToast(`Connected to Gmail as ${res.user.email}!`, 'success');
        await onRefreshAll();
      }
    } catch (err: any) {
      console.error('Gmail connection error:', err);
      showToast(`Connection error: ${err.message || 'OAuth popup closed'}`, 'error');
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

  const handleSaveToGmailAccount = async () => {
    if (!activeProspect || !activeProspect.gmailDraft) return;
    setIsSavingToGmail(true);
    try {
      const res = await fetch(`/api/prospects/${activeProspect.id}/gmail/save-to-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          `Draft successfully created in your Gmail account (ID: ${data.draftId}). Ready for manual send in Gmail!`,
          'success'
        );
        onUpdateProspect(data.prospect);
      } else {
        throw new Error(data.error || 'Failed to save draft to Gmail.');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSavingToGmail(false);
    }
  };

  const handleSaveDraftEdits = async () => {
    if (!activeProspect) return;
    try {
      const res = await fetch(`/api/prospects/${activeProspect.id}/gmail/draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: editSubject,
          body: editBody,
        }),
      });
      if (res.ok) {
        const updatedDraft = await res.json();
        const updatedProspect = {
          ...activeProspect,
          gmailDraft: updatedDraft,
        };
        onUpdateProspect(updatedProspect);
        setIsEditing(false);
        showToast('Draft updated locally.', 'success');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDiscardDraft = async () => {
    if (!activeProspect) return;
    const ok = window.confirm(`Discard email draft for ${activeProspect.name}?`);
    if (!ok) return;

    try {
      const res = await fetch(`/api/prospects/${activeProspect.id}/gmail/draft`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Draft discarded.', 'info');
        await onRefreshAll();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleGenerateFreshDraft = async () => {
    if (!activeProspect) return;
    try {
      const res = await fetch(`/api/prospects/${activeProspect.id}/gmail/generate`, {
        method: 'POST',
      });
      if (res.ok) {
        showToast('Fresh email draft generated.', 'success');
        await onRefreshAll();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Connection status & Absolute Send Restriction Notice */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Official Gmail Drafts Integration
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Saves hyperpersonalized first-touch emails directly into your real Gmail account's Drafts folder using Google's official Gmail API.
          </p>
        </div>

        {/* Auth status & connect button */}
        <div className="flex items-center gap-3">
          {gmailConnected ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-2xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <div className="text-left">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Connected to Gmail</span>
                <span className="text-xs font-semibold text-emerald-900">{gmailEmail || 'Google Account'}</span>
              </div>
              <button
                onClick={handleDisconnectGmail}
                title="Disconnect Gmail"
                className="ml-2 text-slate-400 hover:text-slate-700"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectGmail}
              disabled={isConnecting}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <LogIn className="w-4 h-4 text-[#d4f34a]" />
              {isConnecting ? 'Opening Google Auth...' : 'Connect Gmail Account'}
            </button>
          )}
        </div>
      </div>

      {/* Safety Compliance Guardrail Alert */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 flex items-start gap-3 text-xs">
        <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Strict Safety Restriction Enforced:</span> GetSome{' '}
          <strong>never sends emails automatically</strong>. All generated messages are saved strictly as drafts
          in your Gmail account so you can personally review, verify, and click Send manually from your own email client.
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Prospects with Drafts */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3 h-fit">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Drafts Queue ({prospectsWithDrafts.length})
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Select Prospect</span>
          </div>

          <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1">
            {prospectsWithDrafts.map((p) => {
              const isSelected = p.id === activeProspect?.id;
              const isSaved = p.gmailDraft?.status === 'saved_to_gmail';

              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProspectId(p.id);
                    setIsEditing(false);
                  }}
                  className={`w-full text-left p-3 rounded-2xl transition-all border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200/60 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs truncate max-w-[130px]">{p.name}</span>
                    {isSaved ? (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> In Gmail
                      </span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full font-semibold bg-slate-200 text-slate-700">
                        Local Draft
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {p.company}
                  </p>
                  <p className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                    {p.email}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 3 Columns: Draft Review, Editor & Saving Controls */}
        <div className="lg:col-span-3 space-y-5">
          {activeProspect && activeProspect.gmailDraft ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
              {/* Draft Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-lg">
                      Email to {activeProspect.name}
                    </h3>
                    {activeProspect.gmailDraft.status === 'saved_to_gmail' ? (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Saved in Gmail Drafts
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                        Awaiting Sync to Gmail
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeProspect.role} at {activeProspect.company} • Recipient:{' '}
                    <code className="text-slate-800 font-semibold">{activeProspect.email}</code>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateFreshDraft}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    title="Regenerate draft"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(!isEditing);
                      setEditSubject(activeProspect.gmailDraft?.subject || '');
                      setEditBody(activeProspect.gmailDraft?.body || '');
                    }}
                    className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors ${
                      isEditing ? 'bg-slate-900 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {isEditing ? 'Cancel Editing' : 'Edit Draft'}
                  </button>
                  <button
                    onClick={handleDiscardDraft}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                    title="Discard draft"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Draft Fields (Subject, Body) */}
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Email Subject Line:
                    </label>
                    <input
                      type="text"
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="w-full text-sm font-semibold p-3 rounded-xl bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Email Body (Plain Text RFC 2822):
                    </label>
                    <textarea
                      rows={10}
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      className="w-full text-xs font-mono p-3 rounded-xl bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveDraftEdits}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs"
                    >
                      Save Local Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                      Subject Line:
                    </span>
                    <p className="text-sm font-bold text-slate-900">
                      {activeProspect.gmailDraft.subject}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50/60 border border-slate-200/80">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2">
                      Draft Body:
                    </span>
                    <pre className="text-xs font-sans whitespace-pre-wrap text-slate-800 leading-relaxed">
                      {activeProspect.gmailDraft.body}
                    </pre>
                  </div>
                </div>
              )}

              {/* Research Dossier Context Sidebar */}
              <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 text-xs space-y-2">
                <span className="font-bold text-sky-950 block">
                  Grounding Evidence Used in Draft:
                </span>
                <p className="text-sky-900 italic">
                  "{activeProspect.claims?.[0]?.claim || activeProspect.companyData?.whatTheyDo}"
                </p>
                <div className="flex items-center justify-between text-[11px] text-sky-700 pt-1 border-t border-sky-200/60">
                  <span>Buying Signal: {activeProspect.signals?.[0]?.description || 'Active scaling initiative'}</span>
                  <span>Confidence: 94%</span>
                </div>
              </div>

              {/* Action Buttons: Save to Gmail Drafts & Open in Gmail */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  {activeProspect.gmailDraft.savedToGmailAt ? (
                    <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Created in your Gmail Drafts on {new Date(activeProspect.gmailDraft.savedToGmailAt).toLocaleTimeString()}
                    </span>
                  ) : (
                    <span>Ready to push into your authentic Gmail account.</span>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {activeProspect.gmailDraft.status === 'saved_to_gmail' ? (
                    <a
                      href={activeProspect.gmailDraft.webUrl || 'https://mail.google.com/mail/u/0/#drafts'}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-[#d4f34a] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Draft in Gmail
                    </a>
                  ) : (
                    <button
                      onClick={handleSaveToGmailAccount}
                      disabled={isSavingToGmail}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#d4f34a] hover:bg-[#c4e33d] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                    >
                      <Mail className="w-4 h-4" />
                      {isSavingToGmail ? 'Saving to Gmail...' : 'Save Draft to Gmail Account'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
              <Mail className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-base">No Prospect Selected</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Select a qualified prospect to generate an evidence-backed email draft and save it to your Gmail Drafts folder.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
