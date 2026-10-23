import { Router } from 'express';
import { db } from './db';
import { executeDiscovery } from './discoveryEngine';
import { runResearchPipeline } from './researchPipeline';
import { generateOutreachDrafts, regenerateDraft } from './outreachEngine';
import { validateOutreachContent } from '../services/channelValidator';
import { Prospect, OutreachDraft } from '../types/index';

export const apiRouter = Router();

// Stats overview
apiRouter.get('/stats', (req, res) => {
  try {
    res.json(db.getStats());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ICPs
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

// Campaigns
apiRouter.get('/campaigns', (req, res) => {
  res.json(db.getCampaigns());
});

apiRouter.post('/campaigns', (req, res) => {
  try {
    const newCamp = {
      ...req.body,
      id: req.body.id || `camp_${Date.now()}`,
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

apiRouter.delete('/campaigns/:id', (req, res) => {
  const deleted = db.deleteCampaign(req.params.id);
  res.json({ success: deleted });
});

// Prospects
apiRouter.get('/prospects', (req, res) => {
  let prospects = db.getProspects();
  const { search, campaignId, icpId, stage, minScore, outreachStatus } = req.query;

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

// Discovery
apiRouter.post('/discovery/run', async (req, res) => {
  try {
    const { campaignId, mode, query, targetCompanyDomain, targetCompanyName, targetSignal, limit } = req.body;
    const discovered = await executeDiscovery({
      campaignId: campaignId || 'camp_fintech_q4_2026',
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

apiRouter.post('/discovery/import-csv', async (req, res) => {
  try {
    const { campaignId, csvData } = req.body;
    if (!csvData) return res.status(400).json({ error: 'csvData is required' });
    const imported = await executeDiscovery({
      campaignId: campaignId || 'camp_fintech_q4_2026',
      mode: 'csv_import',
      csvData,
    });
    res.json({ count: imported.length, prospects: imported });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Research Jobs & Execution
apiRouter.get('/jobs', (req, res) => {
  res.json(db.getJobs());
});

apiRouter.post('/research/run/:prospectId', async (req, res) => {
  try {
    const prospectId = req.params.prospectId;
    // Launch pipeline execution
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

// Outreach Drafting & Review
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
    } else if (updates.approvalStatus === 'rejected') {
      targetProspect.activityLog.unshift({
        timestamp: new Date().toISOString(),
        action: 'Draft Rejected',
        details: `Reason: ${updates.rejectionReason || 'No reason provided'}`,
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
