import React, { useState, useEffect, useRef } from 'react';
import {
  ChatSession,
  ChatMessage,
  ChatRoleId,
  Prospect,
  GroundingSource,
} from '../types/index';
import {
  Bot,
  User,
  Send,
  Sparkles,
  Globe,
  Compass,
  Cpu,
  Zap,
  Plus,
  Trash2,
  ExternalLink,
  ChevronDown,
  Building2,
  CheckCircle2,
  RefreshCw,
  Search,
} from 'lucide-react';

interface ChatCopilotProps {
  prospects: Prospect[];
  initialProspectId?: string;
}

interface RoleConfig {
  id: ChatRoleId;
  label: string;
  model: string;
  modelBadge: string;
  description: string;
  hasSearchGrounding: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

const ROLES: RoleConfig[] = [
  {
    id: 'researcher',
    label: 'Live Web Scout',
    model: 'gemini-3.8-flash',
    modelBadge: 'gemini-3.8-flash + Google Search',
    description: 'Real-time verified corporate intelligence with live Google Search citations.',
    hasSearchGrounding: true,
    icon: Globe,
  },
  {
    id: 'strategist',
    label: 'B2B Strategist',
    model: 'gemini-3.8-flash',
    modelBadge: 'gemini-3.8-flash',
    description: 'Strategic outreach angles, persona positioning, and objection playbooks.',
    hasSearchGrounding: false,
    icon: Compass,
  },
  {
    id: 'architect',
    label: 'Deal Architect',
    model: 'gemini-4-argon',
    modelBadge: 'gemini-4-argon (Complex Tasks)',
    description: 'Deep enterprise account plans, multi-stakeholder mapping, and ROI frameworks.',
    hasSearchGrounding: false,
    icon: Cpu,
  },
  {
    id: 'screener',
    label: 'Fast Screener',
    model: 'gemini-3.1-flash-lite',
    modelBadge: 'gemini-3.1-flash-lite (Fast)',
    description: 'Sub-second qualification verdicts, ICP fit scoring, and disqualifier checks.',
    hasSearchGrounding: false,
    icon: Zap,
  },
];

function renderFormattedMessage(content: string) {
  const lines = content.split('\n');
  return (
    <div className="space-y-1.5 font-sans leading-relaxed text-slate-800">
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-1.5" />;

        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        const formatted = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-bold text-slate-950">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        // Bullet list item
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-2 shrink-0" />
              <span>{formatted.slice(1)}</span>
            </div>
          );
        }

        // Numbered list item
        const numMatch = line.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="font-bold text-slate-900 shrink-0">{numMatch[1]}.</span>
              <span>{formatted}</span>
            </div>
          );
        }

        return <p key={idx}>{formatted}</p>;
      })}
    </div>
  );
}

export const ChatCopilot: React.FC<ChatCopilotProps> = ({ prospects, initialProspectId }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<ChatRoleId>('researcher');
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [attachedProspectId, setAttachedProspectId] = useState<string>(initialProspectId || '');
  const [directSearchQuery, setDirectSearchQuery] = useState('');
  const [directSearchResult, setDirectSearchResult] = useState<{
    query: string;
    text: string;
    sources: GroundingSource[];
  } | null>(null);
  const [isDirectSearching, setIsDirectSearching] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadSessions = async () => {
    try {
      const res = await fetch('/api/chats');
      if (res.ok) {
        const data: ChatSession[] = await res.json();
        setSessions(data);
        if (data.length > 0 && !activeSessionId) {
          setActiveSessionId(data[0].id);
          setSelectedRole(data[0].roleId);
        }
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0] || null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isSending]);

  const handleCreateNewSession = async (roleId: ChatRoleId = selectedRole) => {
    try {
      const role = ROLES.find((r) => r.id === roleId) || ROLES[0];
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `New ${role.label} Session`,
          roleId: role.id,
          model: role.model,
        }),
      });
      if (res.ok) {
        const newSession: ChatSession = await res.json();
        setSessions((prev) => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
        setSelectedRole(newSession.roleId);
      }
    } catch (err) {
      console.error('Failed to create new chat session:', err);
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/chats/${sessionId}`, { method: 'DELETE' });
      const updated = sessions.filter((s) => s.id !== sessionId);
      setSessions(updated);
      if (activeSessionId === sessionId) {
        setActiveSessionId(updated[0]?.id || null);
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputMessage.trim();
    if (!textToSend || isSending) return;

    let targetSessionId = activeSessionId;

    if (!targetSessionId) {
      const role = ROLES.find((r) => r.id === selectedRole) || ROLES[0];
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: textToSend.slice(0, 36) + '...',
          roleId: role.id,
          model: role.model,
        }),
      });
      if (res.ok) {
        const newSession: ChatSession = await res.json();
        targetSessionId = newSession.id;
        setSessions((prev) => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
      } else {
        return;
      }
    }

    let enrichedContent = textToSend;
    if (attachedProspectId) {
      const p = prospects.find((pr) => pr.id === attachedProspectId);
      if (p) {
        enrichedContent = `[PROSPECT DOSSIER CONTEXT: Candidate: ${p.name}, Role: ${p.role}, Company: ${p.company} (${p.domain}), Industry: ${p.companyData?.industry}, Core Tech: ${p.companyData?.knownTechStack?.join(', ')}, Fit Score: ${p.fitScore}%, Verified Claim: "${p.claims?.[0]?.claim || 'N/A'}"]\n\n${textToSend}`;
      }
    }

    const optimisticUserMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === targetSessionId
          ? { ...s, messages: [...s.messages, optimisticUserMsg] }
          : s
      )
    );

    setInputMessage('');
    setIsSending(true);

    try {
      const res = await fetch(`/api/chats/${targetSessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: enrichedContent }),
      });

      if (res.ok) {
        const data = await res.json();
        setSessions((prev) =>
          prev.map((s) => (s.id === targetSessionId ? data.chat : s))
        );
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleRunDirectGroundedSearch = async (q?: string) => {
    const query = q || directSearchQuery;
    if (!query.trim() || isDirectSearching) return;

    setIsDirectSearching(true);
    try {
      const res = await fetch('/api/search/grounded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setDirectSearchResult(data);
      }
    } catch (err) {
      console.error('Search grounding error:', err);
    } finally {
      setIsDirectSearching(false);
    }
  };

  const currentRoleConfig = ROLES.find(
    (r) => r.id === (activeSession?.roleId || selectedRole)
  ) || ROLES[0];

  return (
    <div className="flex h-[calc(100vh-100px)] bg-slate-50 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
      {/* Left Sidebar: Session History & Role Engine Selector */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-slate-900" />
            <h2 className="text-sm font-bold tracking-tight text-slate-900">Copilot Intel</h2>
          </div>
          <button
            onClick={() => handleCreateNewSession(selectedRole)}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        </div>

        {/* Roles selector */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
            Select Intelligence Engine:
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = (activeSession?.roleId || selectedRole) === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role.id);
                    if (activeSession && activeSession.messages.length === 0) {
                      activeSession.roleId = role.id;
                      activeSession.model = role.model;
                      activeSession.title = `New ${role.label} Session`;
                      setSessions([...sessions]);
                    }
                  }}
                  className={`text-left p-2 rounded-xl border text-xs transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#d4f34a]' : 'text-slate-400'}`} />
                    <span className="truncate">{role.label}</span>
                  </div>
                  <div className={`text-[9px] font-mono truncate ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    {role.model}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Session history */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Session History ({sessions.length})
          </span>
          {sessions.map((s) => {
            const isActive = s.id === activeSession?.id;
            const role = ROLES.find((r) => r.id === s.roleId) || ROLES[0];
            const Icon = role.icon;
            return (
              <div
                key={s.id}
                onClick={() => {
                  setActiveSessionId(s.id);
                  setSelectedRole(s.roleId);
                }}
                className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-colors border ${
                  isActive
                    ? 'bg-slate-100 border-slate-200 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-6">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                  <span className="truncate">{s.title || 'Untitled Session'}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-600 text-slate-400 transition-opacity absolute right-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Quick Grounded Search Drawer */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-sky-600" />
            <span>Live Grounded Search</span>
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              placeholder="Query live web..."
              value={directSearchQuery}
              onChange={(e) => setDirectSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRunDirectGroundedSearch();
              }}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <button
              onClick={() => handleRunDirectGroundedSearch()}
              disabled={isDirectSearching || !directSearchQuery.trim()}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shrink-0"
            >
              {isDirectSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Chat Workspace */}
      <main className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-3.5 border-b border-slate-200 bg-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 font-bold">
              <currentRoleConfig.icon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900">
                  {activeSession?.title || 'Intelligence Session'}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                  {currentRoleConfig.modelBadge}
                </span>
                {currentRoleConfig.hasSearchGrounding && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-emerald-600" />
                    Google Search Grounded
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Context Prospect Attachment */}
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={attachedProspectId}
              onChange={(e) => setAttachedProspectId(e.target.value)}
              className="text-xs font-semibold p-1.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
            >
              <option value="">Attach Prospect Context...</option>
              {prospects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.company})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {(!activeSession || activeSession.messages.length === 0) ? (
            <div className="max-w-xl mx-auto py-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#d4f34a] flex items-center justify-center text-slate-950 font-bold mx-auto shadow-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {currentRoleConfig.label} Activated
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {currentRoleConfig.description}
              </p>

              {/* Starter prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-4">
                {[
                  'What are the recent tech modernization signals at Apex Payments?',
                  'Analyze European VAT digital compliance pressures on NovaTax Cloud.',
                  'Draft a high-impact consultative question for Elena Rostova.',
                  'Compare Kafka partition bottleneck mitigations for enterprise scale.',
                ].map((promptText, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(promptText)}
                    className="p-3 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 transition-colors shadow-xs"
                  >
                    "{promptText}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            activeSession.messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-[#d4f34a] font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-2xl rounded-2xl p-4 text-xs ${
                      isUser
                        ? 'bg-slate-900 text-white shadow-xs font-medium'
                        : 'bg-white border border-slate-200 text-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
                    }`}
                  >
                    {renderFormattedMessage(msg.content)}

                    {/* Grounding sources pill */}
                    {msg.groundingSources && msg.groundingSources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Primary Sources Cited:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.groundingSources.map((src, sIdx) => (
                            <a
                              key={sIdx}
                              href={src.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-sky-600 hover:underline text-[10px]"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[180px]">{src.title}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                      PR
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isSending && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-[#d4f34a] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 shadow-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-900 animate-ping" />
                <span>Thinking & Grounding with Gemini...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask ${currentRoleConfig.label} about any prospect or industry...`}
              disabled={isSending}
              className="flex-1 text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <button
              type="submit"
              disabled={isSending || !inputMessage.trim()}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5 text-[#d4f34a]" />
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
