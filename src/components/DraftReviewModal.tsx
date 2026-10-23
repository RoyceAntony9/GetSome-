import React, { useState } from 'react';
import {
  Prospect,
  OutreachDraft,
  ChannelType,
  MessageApproach,
} from '../types/index';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCw,
  Send,
  Sparkles,
  HelpCircle,
  ExternalLink,
  MessageSquare,
  Mail,
  Linkedin,
  FileCheck,
  ChevronRight,
} from 'lucide-react';
import { CHANNEL_LIMITS } from '../services/channelValidator';

interface DraftReviewModalProps {
  prospect: Prospect;
  onClose: () => void;
  onUpdateDraft: (draftId: string, updates: Partial<OutreachDraft>) => Promise<void>;
  onRegenerateDraft: (draftId: string, customInstruction: string) => Promise<void>;
  onMarkSentManually: (prospectId: string) => Promise<void>;
}

export const DraftReviewModal: React.FC<DraftReviewModalProps> = ({
  prospect,
  onClose,
  onUpdateDraft,
  onRegenerateDraft,
  onMarkSentManually,
}) => {
  const [selectedDraftId, setSelectedDraftId] = useState<string>(
    prospect.selectedDraftId || (prospect.drafts?.[0]?.id ?? '')
  );
  const [editedContent, setEditedContent] = useState<string>('');
  const [editedSubject, setEditedSubject] = useState<string>('');
  const [customInstruction, setCustomInstruction] = useState<string>('');
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showRejectForm, setShowRejectForm] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const currentDraft = prospect.drafts?.find(d => d.id === selectedDraftId) || prospect.drafts?.[0];

  // Initialize edited states when active draft changes
  React.useEffect(() => {
    if (currentDraft) {
      setEditedContent(currentDraft.content);
      setEditedSubject(currentDraft.subjectLine || '');
    }
  }, [currentDraft?.id]);

  if (!currentDraft) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full text-center space-y-4">
          <p className="text-white">No drafts generated yet for this prospect.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const limits = CHANNEL_LIMITS[currentDraft.channel] || { maxChars: 2000, recommendation: '' };
  const currentChars = editedContent.length;
  const isOverLimit = currentChars > limits.maxChars;

  const handleSaveEdit = async () => {
    await onUpdateDraft(currentDraft.id, {
      content: editedContent,
      subjectLine: editedSubject || undefined,
      characterCount: editedContent.length,
    });
  };

  const handleApprove = async () => {
    await onUpdateDraft(currentDraft.id, {
      content: editedContent,
      subjectLine: editedSubject || undefined,
      approvalStatus: 'approved',
    });
  };

  const handleReject = async () => {
    await onUpdateDraft(currentDraft.id, {
      approvalStatus: 'rejected',
      rejectionReason: rejectionReason || 'User marked not suitable',
    });
    setShowRejectForm(false);
  };

  const handleRegenerate = async () => {
    if (!customInstruction.trim()) return;
    setIsRegenerating(true);
    try {
      await onRegenerateDraft(currentDraft.id, customInstruction);
      setCustomInstruction('');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopy = () => {
    let payload = '';
    if (currentDraft.channel === 'email' && editedSubject) {
      payload = `Subject: ${editedSubject}\n\n${editedContent}`;
    } else {
      payload = editedContent;
    }
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Outreach Review & Generation Suite</h2>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-cyan-400 font-semibold">{prospect.name}</span>
              <span className="text-xs text-slate-400">({prospect.role} at {prospect.company})</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Review, calibrate angles, check character budgets, and approve compliant messages.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Channel & Approach Selector Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {prospect.drafts?.map((d) => {
                const isActive = d.id === currentDraft.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDraftId(d.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {d.channel === 'linkedin_connect' && <Linkedin className="w-3.5 h-3.5" />}
                    {d.channel === 'email' && <Mail className="w-3.5 h-3.5" />}
                    {d.channel === 'linkedin_inmail' && <MessageSquare className="w-3.5 h-3.5" />}
                    <span className="capitalize">{d.channel.replace('linkedin_', 'LI ')}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({d.approach.replace('_', ' ')})</span>
                    {d.approvalStatus === 'approved' && (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span
                className={`px-2 py-0.5 rounded font-mono text-[11px] font-semibold ${
                  isOverLimit
                    ? 'bg-rose-950 text-rose-400 border border-rose-800'
                    : 'bg-slate-900 text-slate-300 border border-slate-800'
                }`}
              >
                {currentChars} / {limits.maxChars} chars
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] uppercase font-semibold ${
                  currentDraft.approvalStatus === 'approved'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : currentDraft.approvalStatus === 'rejected'
                    ? 'bg-rose-950 text-rose-400 border border-rose-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}
              >
                {currentDraft.approvalStatus.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Personalization Intelligence Context Box */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-cyan-400 uppercase tracking-wider text-[11px]">
                Active Personalization Angle: {currentDraft.approach.replace('_', ' ')}
              </span>
              <span className="text-slate-500 font-mono">Tone: {currentDraft.intendedTone}</span>
            </div>
            <p className="text-slate-300">{currentDraft.angleExplanation}</p>
            <div className="pt-1 text-slate-400 flex items-start gap-1.5">
              <span className="text-slate-500 shrink-0 font-medium">Supporting Evidence:</span>
              <span className="italic text-slate-300">"{currentDraft.supportingEvidence}"</span>
            </div>
            {currentDraft.assumptionsFlagged && currentDraft.assumptionsFlagged.length > 0 && (
              <div className="pt-1 text-amber-400/90 flex items-start gap-1">
                <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Assumptions: {currentDraft.assumptionsFlagged.join('; ')}</span>
              </div>
            )}
          </div>

          {/* Subject Line for Email & InMail */}
          {(currentDraft.channel === 'email' || currentDraft.channel === 'linkedin_inmail') && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Subject Line</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {editedSubject.length} / 75 chars max
                </span>
              </label>
              <input
                type="text"
                value={editedSubject}
                onChange={(e) => setEditedSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="Subject line..."
              />
            </div>
          )}

          {/* Message Content Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Message Content (Directly Editable)
              </label>
              <span className="text-[11px] text-slate-500">
                Anti-AI Slop Guard: Zero generic compliments allowed
              </span>
            </div>
            <textarea
              rows={currentDraft.channel === 'linkedin_connect' ? 4 : 8}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className={`w-full bg-slate-950 border rounded-lg p-3.5 text-sm text-slate-100 font-sans leading-relaxed focus:outline-none transition-colors ${
                isOverLimit
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-slate-800 focus:border-cyan-500'
              }`}
              placeholder="Draft content..."
            />
            {isOverLimit && (
              <p className="text-xs text-rose-400 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>
                  Message exceeds channel maximum limit by {currentChars - limits.maxChars} characters!
                </span>
              </p>
            )}
          </div>

          {/* Guided AI Regeneration Section */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <label className="text-xs font-semibold text-slate-200">
                Calibrate or Re-Angle with Custom Instruction
              </label>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder="e.g., Shorten by 30%, emphasize their recent QCon keynote, or adopt a more direct executive tone..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRegenerate();
                }}
              />
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating || !customInstruction.trim()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 disabled:opacity-50 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
              >
                {isRegenerating ? (
                  <RotateCw className="w-3 h-3 animate-spin" />
                ) : (
                  <RotateCw className="w-3 h-3" />
                )}
                <span>{isRegenerating ? 'Refining...' : 'Regenerate'}</span>
              </button>
            </div>
            {currentDraft.history && currentDraft.history.length > 0 && (
              <p className="text-[11px] text-slate-500 font-mono">
                Version history: v{currentDraft.version} ({currentDraft.history.length} prior revisions stored)
              </p>
            )}
          </div>

          {/* Rejection Form if triggered */}
          {showRejectForm && (
            <div className="p-4 bg-rose-950/40 border border-rose-900/60 rounded-xl space-y-2">
              <label className="text-xs font-semibold text-rose-300">
                Record Reason for Rejection (Feeds Learning Loop):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Tone too informal, wrong assumption on tech stack..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <button
                  onClick={handleReject}
                  className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/90 gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Message'}</span>
            </button>

            <button
              onClick={handleSaveEdit}
              className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Save Edits
            </button>

            <button
              onClick={() => setShowRejectForm(!showRejectForm)}
              className="px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-950/60 rounded-lg transition-colors"
            >
              Reject Draft
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                await onMarkSentManually(prospect.id);
                onClose();
              }}
              className="px-3.5 py-2 text-xs font-medium text-purple-300 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/80 rounded-lg transition-colors flex items-center gap-1.5"
              title="Record that you dispatched this message through LinkedIn or Mail client"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Mark as Sent</span>
            </button>

            <button
              onClick={async () => {
                await handleApprove();
              }}
              disabled={isOverLimit}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-cyan-500/20"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve Draft</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
