import { Router } from 'express';
import { db } from './db';
import { executeDiscovery } from './discoveryEngine';
import { runResearchPipeline } from './researchPipeline';
import { generateOutreachDrafts, regenerateDraft } from './outreachEngine';
import { validateOutreachContent } from '../services/channelValidator';
import { generateGroundedSearchContent, executeChatTurn } from './aiProvider';
import { generateLinkedInObservations, assembleLinkedInMessage, CANONICAL_LINKEDIN_TEMPLATE } from './linkedinEngine';
import {
  saveDraftToGmailAccount,
  setServerGmailToken,
  getServerGmailStatus,
  disconnectServerGmail,
  generatePersonalizedEmailDraft,
} from './gmailService';
import {
  Prospect,
  OutreachDraft,
  ChatSession,
  ChatMessage,
  ChatRoleId,
  Campaign,
  LinkedInTemplateVersion,
  UnifiedProspectStatus,
} from '../types/index';

export const apiRouter = Router();

// Stats overview
apiRouter.get('/stats', (req, res) => {
  try {
    const stats = db.getStats();
    const gmailStatus = getServerGmailStatus();
    res.json({
      ...stats,
      gmailConnected: gmailStatus.connected,
      gmailEmail: gmailStatus.email,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ICP Profiles CRUD
// ==========================================
apiRouter.get('/icps', (req, res) => {
  res.json(db.getICPs());
});

apiRouter.get('/icps/:id', (req, res) => {
  const icp = db.getICPById(req.params.id);
  if (!icp) return res.status(404).json({ error: 'ICP not found' });
  res.json(icp);
});

apiRouter.post('/icps', (req, res) => {
  try {
    const newICP = {
      ...req.body,
      id: req.body.id || `icp_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.saveICP(newICP);
    res.json(newICP);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/icps/:id', (req, res) => {
  const existing = db.getICPById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'ICP not found' });
  const updated = db.saveICP({ ...existing, ...req.body, id: req.params.id });
  res.json(updated);
});

apiRouter.delete('/icps/:id', (req, res) => {
  const deleted = db.deleteICP(req.params.id);
  res.json({ success: deleted });
});

// ==========================================
// Campaigns CRUD & Operations
// ==========================================
apiRouter.get('/campaigns', (req, res) => {
  res.json(db.getCampaigns());
});

apiRouter.get('/campaigns/:id', (req, res) => {
  const camp = db.getCampaignById(req.params.id);
  if (!camp) return res.status(404).json({ error: 'Campaign not found' });
  res.json(camp);
});

apiRouter.post('/campaigns', (req, res) => {
  try {
    const newCamp: Campaign = {
      ...req.body,
      id: req.body.id || `camp_${Date.now()}`,
      status: req.body.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.saveCampaign(newCamp);
    res.json(newCamp);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/campaigns/:id', (req, res) => {
  const existing = db.getCampaignById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Campaign not found' });
  const updated = db.saveCampaign({ ...existing, ...req.body, id: req.params.id });
  res.json(updated);
});

apiRouter.post('/campaigns/:id/duplicate', (req, res) => {
  const existing = db.getCampaignById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Campaign not found' });
  const duplicated: Campaign = {
    ...existing,
    id: `camp_${Date.now()}`,
    name: `${existing.name} (Copy)`,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.saveCampaign(duplicated);
  res.json(duplicated);
});

apiRouter.post('/campaigns/:id/pause', (req, res) => {
  const existing = db.getCampaignById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Campaign not found' });
  existing.status = 'paused';
  existing.updatedAt = new Date().toISOString();
  db.saveCampaign(existing);
  res.json(existing);
});

apiRouter.post('/campaigns/:id/resume', (req, res) => {
  const existing = db.getCampaignById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Campaign not found' });
  existing.status = 'active';
  existing.updatedAt = new Date().toISOString();
  db.saveCampaign(existing);
  res.json(existing);
});

apiRouter.delete('/campaigns/:id', (req, res) => {
  const deleted = db.deleteCampaign(req.params.id);
  res.json({ success: deleted });
});

// ==========================================
// Prospects & Intelligence
// ==========================================
apiRouter.get('/prospects', (req, res) => {
  let prospects = db.getProspects();
  const { search, campaignId, icpId, stage, minScore, outreachStatus, unifiedStatus } = req.query;

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    prospects = prospects.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.company.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.companyData?.industry?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q)
    );
  }

  if (campaignId && typeof campaignId === 'string' && campaignId !== 'all') {
    prospects = prospects.filter(p => p.campaignId === campaignId);
  }

  if (icpId && typeof icpId === 'string' && icpId !== 'all') {
    prospects = prospects.filter(p => p.icpId === icpId);
  }

  if (stage && typeof stage === 'string' && stage !== 'all') {
    prospects = prospects.filter(p => p.stage === stage);
  }

  if (unifiedStatus && typeof unifiedStatus === 'string' && unifiedStatus !== 'all') {
    prospects = prospects.filter(p => p.unifiedStatus === unifiedStatus);
  }

  if (outreachStatus && typeof outreachStatus === 'string' && outreachStatus !== 'all') {
    prospects = prospects.filter(p => p.outreachStatus === outreachStatus);
  }

  if (minScore && !isNaN(Number(minScore))) {
    const scoreVal = Number(minScore);
    prospects = prospects.filter(p => p.fitScore >= scoreVal);
  }

  res.json(prospects);
});

apiRouter.get('/prospects/:id', (req, res) => {
  const prospect = db.getProspectById(req.params.id);
  if (!prospect) return res.status(404).json({ error: 'Prospect not found' });
  res.json(prospect);
});

apiRouter.post('/prospects', (req, res) => {
  try {
    const p = req.body as Prospect;
    const saved = db.saveProspect(p);
    res.json(saved);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/prospects/:id', (req, res) => {
  const existing = db.getProspectById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Prospect not found' });
  const updated = db.saveProspect({ ...existing, ...req.body, id: req.params.id });
  res.json(updated);
});

apiRouter.delete('/prospects/:id', (req, res) => {
  const deleted = db.deleteProspect(req.params.id);
  res.json({ success: deleted });
});

// Manual Qualification Override
apiRouter.post('/prospects/:id/override-qualification', (req, res) => {
  const prospect = db.getProspectById(req.params.id);
  if (!prospect) return res.status(404).json({ error: 'Prospect not found' });

  const { isOverridden, note, overriddenScore } = req.body;
  prospect.manualOverride = {
    isOverridden: Boolean(isOverridden),
    note: note || 'Manually approved by human reviewer',
    overriddenScore: overriddenScore ? Number(overriddenScore) : prospect.fitScore,
    overriddenAt: new Date().toISOString(),
  };

  if (isOverridden) {
    prospect.qualification.isQualified = true;
    if (overriddenScore) prospect.fitScore = Number(overriddenScore);
    prospect.unifiedStatus = 'ready_for_outreach';
    prospect.activityLog.unshift({
      timestamp: new Date().toISOString(),
      action: 'Qualification Manually Overridden',
      details: note || 'Prospect manually qualified by operator.',
      actor: 'user',
    });
  } else {
    prospect.qualification.isQualified = prospect.fitScore >= (db.getICPById(prospect.icpId)?.minScoreThreshold || 70);
    prospect.activityLog.unshift({
      timestamp: new Date().toISOString(),
      action: 'Qualification Override Removed',
      details: 'Restored automatic algorithmic qualification score.',
      actor: 'user',
    });
  }

  db.saveProspect(prospect);
  res.json(prospect);
});

// Discovery
apiRouter.post('/discovery/run', async (req, res) => {
  try {
    const { campaignId, mode, query, targetCompanyDomain, targetCompanyName, targetSignal, limit } = req.body;
    const discovered = await executeDiscovery({
      campaignId: campaignId || db.getCampaigns()[0]?.id || 'camp_fintech_q4_2026',
      mode: mode || 'natural_language',
      query,
      targetCompanyDomain,
      targetCompanyName,
      targetSignal,
      limit: limit ? Number(limit) : 5,
    });
    res.json({ count: discovered.length, prospects: discovered });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Research Pipeline Execution
apiRouter.get('/jobs', (req, res) => {
  res.json(db.getJobs());
});

apiRouter.post('/research/run/:prospectId', async (req, res) => {
  try {
    const prospectId = req.params.prospectId;
    const updated = await runResearchPipeline(prospectId);
    if (!updated) return res.status(404).json({ error: 'Prospect not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/research/resume/:jobId', async (req, res) => {
  try {
    const job = db.getJobs().find(j => j.id === req.params.jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    db.updateJobStatus(job.id, { status: 'running', errorMessage: undefined });
    const updated = await runResearchPipeline(job.prospectId);
    res.json({ success: true, prospect: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/research/cancel/:jobId', (req, res) => {
  const job = db.updateJobStatus(req.params.jobId, { status: 'cancelled' });
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

// ==========================================
// PART IV: Gmail Integration Endpoints
// ==========================================
apiRouter.get('/gmail/status', (req, res) => {
  const status = getServerGmailStatus();
  res.json(status);
});

apiRouter.post('/gmail/connect', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const { email } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Bearer token is required in Authorization header' });
    }

    setServerGmailToken(token, email);
    res.json({
      connected: true,
      email: email || 'authenticated_user@gmail.com',
      message: 'Gmail Drafts integration authenticated successfully.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/gmail/disconnect', (req, res) => {
  disconnectServerGmail();
  res.json({ connected: false, message: 'Gmail disconnected.' });
});

apiRouter.post('/prospects/:id/gmail/generate', async (req, res) => {
  try {
    const prospect = db.getProspectById(req.params.id);
    if (!prospect) return res.status(404).json({ error: 'Prospect not found' });

    const campaign = db.getCampaignById(prospect.campaignId);
    const draft = await generatePersonalizedEmailDraft(prospect, campaign);

    prospect.gmailDraft = {
      recipientEmail: prospect.email,
      subject: draft.subject,
      body: draft.body,
      createdAt: new Date().toISOString(),
      status: 'local_draft',
    };
    prospect.unifiedStatus = 'email_draft_generated';
    db.saveProspect(prospect);

    res.json(prospect.gmailDraft);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/prospects/:id/gmail/draft', (req, res) => {
  const prospect = db.getProspectById(req.params.id);
  if (!prospect) return res.status(404).json({ error: 'Prospect not found' });

  const { subject, body, recipientEmail } = req.body;
  if (!prospect.gmailDraft) {
    prospect.gmailDraft = {
      recipientEmail: recipientEmail || prospect.email,
      subject: subject || `${prospect.company} / collaboration`,
      body: body || '',
      createdAt: new Date().toISOString(),
      status: 'local_draft',
    };
  } else {
    prospect.gmailDraft.subject = subject ?? prospect.gmailDraft.subject;
    prospect.gmailDraft.body = body ?? prospect.gmailDraft.body;
    prospect.gmailDraft.recipientEmail = recipientEmail ?? prospect.gmailDraft.recipientEmail;
  }

  db.saveProspect(prospect);
  res.json(prospect.gmailDraft);
});

// SAVE REAL DRAFT TO GMAIL ACCOUNT (ABSOLUTELY NEVER SENDS)
apiRouter.post('/prospects/:id/gmail/save-to-account', async (req, res) => {
  try {
    const prospect = db.getProspectById(req.params.id);
    if (!prospect) return res.status(404).json({ error: 'Prospect not found' });

    if (!prospect.gmailDraft) {
      return res.status(400).json({ error: 'No email draft prepared for this prospect.' });
    }

    const { customToken } = req.body;
    const recipient = prospect.gmailDraft.recipientEmail || prospect.email;
    if (!recipient) {
      return res.status(400).json({ error: 'Recipient email address is required.' });
    }

    // Call Gmail REST API users.drafts.create
    const gmailResult = await saveDraftToGmailAccount(
      recipient,
      prospect.gmailDraft.subject,
      prospect.gmailDraft.body,
      customToken
    );

    prospect.gmailDraft.draftId = gmailResult.draftId;
    prospect.gmailDraft.messageId = gmailResult.messageId;
    prospect.gmailDraft.threadId = gmailResult.threadId;
    prospect.gmailDraft.savedToGmailAt = new Date().toISOString();
    prospect.gmailDraft.status = 'saved_to_gmail';
    prospect.gmailDraft.webUrl = `https://mail.google.com/mail/u/0/#drafts`;
    prospect.unifiedStatus = 'email_draft_saved_to_gmail';

    prospect.activityLog.unshift({
      timestamp: new Date().toISOString(),
      action: 'Saved to Gmail Drafts',
      details: `Draft successfully created in user's Gmail account (Draft ID: ${gmailResult.draftId}). Ready for manual review and send in Gmail.`,
      actor: 'user',
    });

    db.saveProspect(prospect);

    res.json({
      success: true,
      draftId: gmailResult.draftId,
      webUrl: prospect.gmailDraft.webUrl,
      prospect,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/prospects/:id/gmail/draft', (req, res) => {
  const prospect = db.getProspectById(req.params.id);
  if (!prospect) return res.status(404).json({ error: 'Prospect not found' });

  if (prospect.gmailDraft) {
    prospect.gmailDraft.status = 'discarded';
  }
  db.saveProspect(prospect);
  res.json({ success: true, message: 'Draft discarded.' });
});

// ==========================================
// PART V: LinkedIn Canonical Messaging Endpoints
// ==========================================
apiRouter.get('/linkedin/templates', (req, res) => {
  res.json(db.getLinkedInTemplates());
});

apiRouter.put('/linkedin/templates/:id', (req, res) => {
  const updated = db.saveLinkedInTemplate(req.body);
  res.json(updated);
});

apiRouter.post('/linkedin/templates/reset', (req, res) => {
  const reset = db.resetLinkedInTemplate();
  res.json(reset);
});

apiRouter.post('/prospects/:id/linkedin/generate', async (req, res) => {
  try {
    const prospect = db.getProspectById(req.params.id);
    if (!prospect) return res.status(404).json({ error: 'Prospect not found' });

    const template = db.getCanonicalLinkedInTemplate();
    const options = await generateLinkedInObservations(prospect, template);

    prospect.linkedinObservations = options;
    if (options.length > 0) {
      prospect.selectedLinkedInOption = options[0].id;
    }
    prospect.unifiedStatus = 'linkedin_message_prepared';
    db.saveProspect(prospect);

    res.json(options);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/prospects/:id/linkedin/select', (req, res) => {
  const prospect = db.getProspectById(req.params.id);
  if (!prospect) return res.status(404).json({ error: 'Prospect not found' });

  const { optionId } = req.body;
  if (!prospect.linkedinObservations) {
    return res.status(400).json({ error: 'No observations generated.' });
  }

  prospect.selectedLinkedInOption = optionId;
  prospect.linkedinObservations = prospect.linkedinObservations.map(o => ({
    ...o,
    isSelected: o.id === optionId,
  }));
  prospect.unifiedStatus = 'linkedin_message_prepared';

  prospect.activityLog.unshift({
    timestamp: new Date().toISOString(),
    action: 'LinkedIn Observation Selected',
    details: `Selected observation: ${prospect.linkedinObservations.find(o => o.id === optionId)?.optionType}`,
    actor: 'user',
  });

  db.saveProspect(prospect);
  res.json(prospect);
});

apiRouter.put('/prospects/:id/linkedin/option/:optionId', (req, res) => {
  const prospect = db.getProspectById(req.params.id);
  if (!prospect) return res.status(404).json({ error: 'Prospect not found' });

  const { optionId } = req.params;
  const { observation } = req.body;
  if (!prospect.linkedinObservations) return res.status(404).json({ error: 'No observations' });

  const template = db.getCanonicalLinkedInTemplate();
  const firstName = prospect.name.split(' ')[0] || 'there';

  prospect.linkedinObservations = prospect.linkedinObservations.map(o => {
    if (o.id === optionId) {
      const full = assembleLinkedInMessage(firstName, observation, template);
      return {
        ...o,
        observation,
        completeMessage: full,
      };
    }
    return o;
  });

  db.saveProspect(prospect);
  res.json(prospect);
});

// Update Unified Status
apiRouter.put('/prospects/:id/unified-status', (req, res) => {
  const prospect = db.getProspectById(req.params.id);
  if (!prospect) return res.status(404).json({ error: 'Prospect not found' });

  const { status, note } = req.body;
  prospect.unifiedStatus = status as UnifiedProspectStatus;
  if (status === 'manually_sent') {
    prospect.outreachStatus = 'sent_manually';
    prospect.lastContactedAt = new Date().toISOString();
  }

  prospect.activityLog.unshift({
    timestamp: new Date().toISOString(),
    action: `Status Updated to: ${status}`,
    details: note || 'Workflow status transition confirmed by operator.',
    actor: 'user',
  });

  db.saveProspect(prospect);
  res.json(prospect);
});

// ==========================================
// Existing Outreach Draft Endpoints
// ==========================================
apiRouter.post('/outreach/generate/:prospectId', async (req, res) => {
  try {
    const prospect = db.getProspectById(req.params.prospectId);
    if (!prospect) return res.status(404).json({ error: 'Prospect not found' });
    const campaign = db.getCampaignById(prospect.campaignId);
    const icp = db.getICPById(prospect.icpId);

    const drafts = await generateOutreachDrafts(prospect, campaign, icp);
    prospect.drafts = drafts;
    if (drafts.length > 0) prospect.selectedDraftId = drafts[0].id;
    prospect.outreachStatus = 'draft_ready';
    prospect.activityLog.unshift({
      timestamp: new Date().toISOString(),
      action: 'Outreach Drafts Re-generated',
      details: `Generated ${drafts.length} fresh channel drafts.`,
      actor: 'user',
    });
    db.saveProspect(prospect);
    res.json(drafts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/outreach/regenerate/:draftId', async (req, res) => {
  try {
    const { draftId } = req.params;
    const { customInstruction } = req.body;
    if (!customInstruction) return res.status(400).json({ error: 'customInstruction required' });

    let targetProspect: Prospect | undefined;
    let targetDraft: OutreachDraft | undefined;

    for (const p of db.getProspects()) {
      const d = p.drafts?.find(dr => dr.id === draftId);
      if (d) {
        targetProspect = p;
        targetDraft = d;
        break;
      }
    }

    if (!targetProspect || !targetDraft) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    const campaign = db.getCampaignById(targetProspect.campaignId);
    const revised = await regenerateDraft(targetDraft, targetProspect, customInstruction, campaign);

    targetProspect.drafts = targetProspect.drafts.map(d => (d.id === draftId ? revised : d));
    targetProspect.activityLog.unshift({
      timestamp: new Date().toISOString(),
      action: 'Draft Regenerated with Instruction',
      details: `Instruction: "${customInstruction}". New version: v${revised.version}.`,
      actor: 'user',
    });
    db.saveProspect(targetProspect);

    res.json(revised);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/outreach/drafts/:draftId', (req, res) => {
  try {
    const { draftId } = req.params;
    const updates = req.body as Partial<OutreachDraft>;

    let targetProspect: Prospect | undefined;
    let targetDraft: OutreachDraft | undefined;

    for (const p of db.getProspects()) {
      const d = p.drafts?.find(dr => dr.id === draftId);
      if (d) {
        targetProspect = p;
        targetDraft = d;
        break;
      }
    }

    if (!targetProspect || !targetDraft) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    const updatedDraft: OutreachDraft = {
      ...targetDraft,
      ...updates,
    };

    if (updates.content) {
      const report = validateOutreachContent(updatedDraft.channel, updates.content, updatedDraft.subjectLine);
      updatedDraft.characterCount = updates.content.length;
      updatedDraft.isWithinLimit = report.isValid;
    }

    if (updates.approvalStatus === 'approved') {
      targetProspect.outreachStatus = 'approved';
      targetProspect.activityLog.unshift({
        timestamp: new Date().toISOString(),
        action: 'Draft Approved',
        details: `Approved ${updatedDraft.channel} draft for ${targetProspect.name}.`,
        actor: 'user',
      });
    }

    targetProspect.drafts = targetProspect.drafts.map(d => (d.id === draftId ? updatedDraft : d));
    db.saveProspect(targetProspect);
    res.json(updatedDraft);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/outreach/manual-send/:prospectId', (req, res) => {
  const prospect = db.getProspectById(req.params.prospectId);
  if (!prospect) return res.status(404).json({ error: 'Prospect not found' });
  const { status, note } = req.body;
  prospect.outreachStatus = status || 'sent_manually';
  prospect.unifiedStatus = 'manually_sent';
  prospect.outreachNotes = note || prospect.outreachNotes;
  prospect.lastContactedAt = new Date().toISOString();
  prospect.activityLog.unshift({
    timestamp: new Date().toISOString(),
    action: `Outreach Status Updated: ${prospect.outreachStatus}`,
    details: note || 'Manual dispatch recorded by user.',
    actor: 'user',
  });
  db.saveProspect(prospect);
  res.json(prospect);
});

apiRouter.get('/outreach/export', (req, res) => {
  const { format, campaignId } = req.query;
  let prospects = db.getProspects();
  if (campaignId && typeof campaignId === 'string' && campaignId !== 'all') {
    prospects = prospects.filter(p => p.campaignId === campaignId);
  }

  const exportRows = prospects.flatMap(p => {
    return (p.drafts || [])
      .filter(d => d.approvalStatus === 'approved' || req.query.includeAll === 'true')
      .map(d => ({
        prospect_name: p.name,
        role: p.role,
        company: p.company,
        domain: p.domain,
        location: p.location,
        linkedin_url: p.linkedinUrl,
        email: p.email,
        fit_score: p.fitScore,
        channel: d.channel,
        approach: d.approach,
        subject: d.subjectLine || '',
        message: d.content,
        character_count: d.characterCount,
        approved_at: p.updatedAt,
        evidence_citation: d.supportingEvidence,
      }));
  });

  if (format === 'csv') {
    if (exportRows.length === 0) {
      return res.type('text/csv').send('prospect_name,company,role,channel,subject,message\n');
    }
    const headers = Object.keys(exportRows[0]).join(',');
    const lines = exportRows.map(row =>
      Object.values(row)
        .map(val => `"${String(val).replace(/"/g, '""')}"`)
        .join(',')
    );
    res.type('text/csv').attachment('getsome_approved_outreach.csv').send([headers, ...lines].join('\n'));
  } else {
    res.json(exportRows);
  }
});

// Settings & Seed
apiRouter.get('/settings', (req, res) => {
  res.json(db.getSettings());
});

apiRouter.put('/settings', (req, res) => {
  const updated = db.saveSettings(req.body);
  res.json(updated);
});

apiRouter.post('/db/seed', (req, res) => {
  db.resetSeedData();
  res.json({ success: true, message: 'Database reset to initial curated state.' });
});

// Gemini Chats & Grounding
apiRouter.get('/chats', (req, res) => {
  res.json(db.getChats());
});

apiRouter.get('/chats/:id', (req, res) => {
  const chat = db.getChatById(req.params.id);
  if (!chat) return res.status(404).json({ error: 'Chat session not found' });
  res.json(chat);
});

apiRouter.post('/chats', (req, res) => {
  try {
    const { title, roleId, model, systemInstruction, initialPrompt } = req.body;
    const rId: ChatRoleId = roleId || 'strategist';

    let defaultModel = 'gemini-3.8-flash';
    let defaultSys = 'You are an elite B2B sales intelligence and pipeline strategist.';

    if (rId === 'architect') {
      defaultModel = 'gemini-4-argon';
      defaultSys = 'You are a principal enterprise sales engineer and account architect specializing in complex multi-stakeholder enterprise deal strategy.';
    } else if (rId === 'screener') {
      defaultModel = 'gemini-3.1-flash-lite';
      defaultSys = 'You are a rapid B2B SDR screener. Deliver ultra-concise, high-velocity qualification summaries and ICP fit verdicts.';
    } else if (rId === 'researcher') {
      defaultModel = 'gemini-3.8-flash';
      defaultSys = 'You are an autonomous corporate researcher powered by live Google Search grounding. Identify verifiable corporate facts, signals, and executives.';
    }

    const newChat: ChatSession = {
      id: `chat_${Date.now()}`,
      title: title || (initialPrompt ? initialPrompt.slice(0, 36) + '...' : 'New Intel Session'),
      roleId: rId,
      model: model || defaultModel,
      systemInstruction: systemInstruction || defaultSys,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.saveChat(newChat);
    res.json(newChat);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/chats/:id/messages', async (req, res) => {
  try {
    const chat = db.getChatById(req.params.id);
    if (!chat) return res.status(404).json({ error: 'Chat session not found' });

    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const userMessage: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    chat.messages.push(userMessage);

    const turnResult = await executeChatTurn(chat, content.trim());

    const modelMessage: ChatMessage = {
      id: `msg_m_${Date.now()}`,
      role: 'model',
      content: turnResult.reply,
      timestamp: new Date().toISOString(),
      modelUsed: turnResult.modelUsed,
      groundingSources: turnResult.sources,
    };

    chat.messages.push(modelMessage);

    if (chat.messages.length === 2 && (chat.title === 'New Intel Session' || chat.title.startsWith('New '))) {
      chat.title = content.slice(0, 40) + (content.length > 40 ? '...' : '');
    }

    db.saveChat(chat);

    res.json({
      userMessage,
      modelMessage,
      chat,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/chats/:id', (req, res) => {
  const deleted = db.deleteChat(req.params.id);
  res.json({ success: deleted });
});

apiRouter.post('/search/grounded', async (req, res) => {
  try {
    const { query, model } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });
    const result = await generateGroundedSearchContent(query, model || 'gemini-3.8-flash');
    res.json({
      query,
      model: model || 'gemini-3.8-flash',
      text: result.text,
      sources: result.sources,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
