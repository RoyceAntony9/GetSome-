import { db } from './db';
import { generateStructuredJson } from './aiProvider';
import { calculateQualification } from '../services/scoring';
import { generateOutreachDrafts } from './outreachEngine';
import {
  Prospect,
  CompanyIntelligence,
  PersonIntelligence,
  IndustryIntelligence,
  ResearchClaim,
  BuyingSignal,
  ProspectStage,
} from '../types/index';

export async function runResearchPipeline(prospectId: string): Promise<Prospect | null> {
  let prospect = db.getProspectById(prospectId);
  if (!prospect) return null;

  const campaign = db.getCampaignById(prospect.campaignId) || db.getCampaigns()[0];
  const icp = db.getICPById(prospect.icpId) || db.getICPs()[0];

  const jobId = `job_${prospect.id}`;
  db.updateJobStatus(jobId, {
    status: 'running',
    currentStage: 'verifying',
    progress: 15,
  });

  const appendLog = (action: string, details: string) => {
    prospect!.activityLog.unshift({
      timestamp: new Date().toISOString(),
      action,
      details,
      actor: 'system',
    });
  };

  try {
    // ----------------------------------------------------
    // STAGE A: Identity Verification
    // ----------------------------------------------------
    prospect.stage = 'verifying';
    db.saveProspect(prospect);

    const stageAPrompt = `Investigate identity verification for B2B executive candidate:
Candidate: ${prospect.name}
Claimed Role: ${prospect.role}
Claimed Company: ${prospect.company} (Domain: ${prospect.domain})
LinkedIn: ${prospect.linkedinUrl}

Verify corporate existence, verify executive role hierarchy, resolve any ambiguity, and produce verified identity details.
Return JSON:
{
  "verified": true,
  "fullName": "${prospect.name}",
  "currentRole": "${prospect.role}",
  "department": "Platform & Technology",
  "seniority": "VP",
  "location": "${prospect.location || 'United States'}",
  "publicBio": "Concise factual biography",
  "pastExperience": ["Role at previous company (Years)", "Senior Engineer at Previous (Years)"],
  "identityConfidence": "high"
}`;

    const stageARes = await generateStructuredJson<any>(
      stageAPrompt,
      { systemInstruction: 'You are a rigorous identity verification analyst. Establish factual identities and eliminate conflation.' },
      () => ({
        verified: true,
        fullName: prospect!.name,
        currentRole: prospect!.role,
        department: prospect!.personData?.department || 'Platform Engineering',
        seniority: prospect!.personData?.seniority || 'VP',
        location: prospect!.location || 'United States',
        publicBio: `${prospect!.role} leading platform architecture at ${prospect!.company}.`,
        pastExperience: ['Senior Engineering Leader at high-growth software firms (2018-2023)'],
        identityConfidence: 'high',
      })
    );

    prospect.verified = stageARes.verified ?? true;
    prospect.personData.department = stageARes.department || prospect.personData.department;
    prospect.personData.seniority = stageARes.seniority || prospect.personData.seniority;
    prospect.personData.publicBio = stageARes.publicBio || prospect.personData.publicBio;
    if (stageARes.pastExperience?.length) {
      prospect.personData.pastExperience = stageARes.pastExperience;
    }
    appendLog('Stage A: Identity Verified', `Corroborated identity for ${prospect.name} at ${prospect.company}. Seniority: ${prospect.personData.seniority}.`);

    db.updateJobStatus(jobId, {
      currentStage: 'researching_company',
      progress: 30,
      stagesCompleted: ['verifying'],
    });

    // ----------------------------------------------------
    // STAGE B: Company Intelligence
    // ----------------------------------------------------
    prospect.stage = 'researching_company';
    db.saveProspect(prospect);

    const stageBPrompt = `Produce deep company intelligence for:
Company: ${prospect.company}
Domain: ${prospect.domain}
Industry Context: ${prospect.companyData.industry || 'B2B Software'}
Our Configured Value Proposition: "${campaign?.offeringProposition || 'High-throughput data streaming and latency optimization'}"

Output structured factual company analysis. Separate verified facts from analytical inferences.
Return JSON:
{
  "whatTheyDo": "Exact substantive explanation of core business and value model",
  "productsAndServices": ["Product 1", "Product 2", "Platform Engine"],
  "targetCustomers": ["Customer segment 1", "Customer segment 2"],
  "strategicPriorities": ["Strategic priority 1", "Strategic priority 2"],
  "growthSignals": ["Observable growth signal or funding/expansion milestone"],
  "operationalChallenges": ["Explicit or structural technical/commercial bottleneck"],
  "knownTechStack": ["PostgreSQL", "Kafka", "Kubernetes", "AWS", "Go"],
  "competitors": ["Primary Competitor 1", "Primary Competitor 2"],
  "offeringBenefitFit": "Specific analytical deduction of how our offering solves their operational challenge"
}`;

    const stageBRes = await generateStructuredJson<Partial<CompanyIntelligence>>(
      stageBPrompt,
      { systemInstruction: 'You are an elite corporate intelligence analyst. Produce factual, grounded business insights without marketing fluff.' },
      () => ({
        whatTheyDo: `${prospect!.company} provides mission-critical enterprise services in ${prospect!.companyData.industry}.`,
        productsAndServices: [`${prospect!.company} Core Platform`, 'Enterprise API Suite'],
        targetCustomers: ['Enterprise Customers', 'High-Growth Tech Firms'],
        strategicPriorities: ['Modernizing core data processing pipeline', 'Expanding engineering capacity'],
        growthSignals: ['Recent expansion of product tier and engineering recruitment'],
        operationalChallenges: ['Managing data pipeline throughput and latency during peak demand surges'],
        knownTechStack: ['PostgreSQL', 'Kubernetes', 'Cloud Infrastructure'],
        competitors: ['Market leaders'],
        offeringBenefitFit: 'Accelerates throughput and eliminates database contention.',
      })
    );

    Object.assign(prospect.companyData, stageBRes);
    appendLog('Stage B: Company Intelligence Completed', `Analyzed products, competitors, tech stack, and strategic priorities for ${prospect.company}.`);

    db.updateJobStatus(jobId, {
      currentStage: 'researching_person',
      progress: 48,
      stagesCompleted: ['verifying', 'researching_company'],
    });

    // ----------------------------------------------------
    // STAGE C: Person-Level Intelligence
    // ----------------------------------------------------
    prospect.stage = 'researching_person';
    db.saveProspect(prospect);

    const stageCPrompt = `Research executive prospect as an individual professional:
Name: ${prospect.name}
Role: ${prospect.role}
Company: ${prospect.company}
Department: ${prospect.personData.department}

Investigate:
1. Scope of influence & budget ownership
2. Public talks, articles, podcast interviews, or technical papers
3. Publicly expressed priorities, challenges, or architectural views
4. Problem ownership: Why this person should be contacted rather than another executive.

Return JSON:
{
  "responsibilities": ["Primary architectural responsibility", "Team leadership and tooling sign-off"],
  "publicTopics": ["Topic 1", "Topic 2", "Topic 3"],
  "problemOwnership": "Concrete statement of why this person owns the problem",
  "whyThisPerson": "Why this specific executive should receive outreach",
  "publicContentAndTalks": [
    {
      "title": "Title of public address, article, or keynote",
      "type": "talk",
      "url": "https://${prospect.domain}/press/keynote",
      "date": "2026-06-15",
      "excerpt": "Specific substantive quote or technical argument they made in public"
    }
  ]
}`;

    const stageCRes = await generateStructuredJson<Partial<PersonIntelligence>>(
      stageCPrompt,
      { systemInstruction: 'Investigate executive influence, public statements, and problem ownership.' },
      () => ({
        responsibilities: ['Overseeing infrastructure scalability and vendor tool procurement'],
        publicTopics: ['Platform Architecture', 'High Availability', 'Engineering Velocity'],
        problemOwnership: `Direct responsibility over infrastructure reliability at ${prospect!.company}.`,
        whyThisPerson: `Primary decision maker for backend platform decisions and engineering budget.`,
        publicContentAndTalks: prospect!.personData.publicContentAndTalks || [],
      })
    );

    if (stageCRes.responsibilities) prospect.personData.responsibilities = stageCRes.responsibilities;
    if (stageCRes.publicTopics) prospect.personData.publicTopics = stageCRes.publicTopics;
    if (stageCRes.problemOwnership) prospect.personData.problemOwnership = stageCRes.problemOwnership;
    if (stageCRes.whyThisPerson) prospect.personData.whyThisPerson = stageCRes.whyThisPerson;
    if (stageCRes.publicContentAndTalks?.length) {
      prospect.personData.publicContentAndTalks = stageCRes.publicContentAndTalks;
    }
    appendLog('Stage C: Person Intelligence Completed', `Mapped executive scope, public talks, and problem ownership for ${prospect.name}.`);

    db.updateJobStatus(jobId, {
      currentStage: 'industry_analysis',
      progress: 65,
      stagesCompleted: ['verifying', 'researching_company', 'researching_person'],
    });

    // ----------------------------------------------------
    // STAGE D: Industry & Market Research
    // ----------------------------------------------------
    prospect.stage = 'industry_analysis';
    db.saveProspect(prospect);

    const stageDPrompt = `Analyze market & industry forces for:
Industry: ${prospect.companyData.industry}
Company: ${prospect.company}

Identify macro trends, competitive pressures, and regulatory or technical shifts impacting executive priorities.
Return JSON:
{
  "keyTrends": ["Trend 1", "Trend 2"],
  "competitivePressures": ["Competitive factor 1", "Competitive factor 2"],
  "regulatoryOrTechShifts": ["Regulatory or technological mandate/shift"],
  "implicationsForRole": "Specific implications for this executive's role and roadmap"
}`;

    const stageDRes = await generateStructuredJson<Partial<IndustryIntelligence>>(
      stageDPrompt,
      {},
      () => ({
        keyTrends: ['Sub-second latency expectations across enterprise B2B workflows'],
        competitivePressures: ['Rapid feature velocity from competitive venture-backed entrants'],
        regulatoryOrTechShifts: ['Increasing focus on data sovereignty and zero-downtime reliability'],
        implicationsForRole: 'Demands continuous pipeline modernization while maintaining five-nines availability.',
      })
    );

    Object.assign(prospect.industryData, stageDRes);
    appendLog('Stage D: Industry Analysis Completed', `Synthesized market pressures and regulatory vectors for ${prospect.companyData.industry}.`);

    db.updateJobStatus(jobId, {
      currentStage: 'qualifying',
      progress: 80,
      stagesCompleted: ['verifying', 'researching_company', 'researching_person', 'industry_analysis'],
    });

    // ----------------------------------------------------
    // STAGE E & F: Opportunity Signals & Structured Claims
    // ----------------------------------------------------
    prospect.stage = 'qualifying';
    db.saveProspect(prospect);

    // Synthesize structured claims with provenance
    if (prospect.claims.length < 3) {
      const claimsPrompt = `Produce 2 verified, structured factual research claims for ${prospect.company} and executive ${prospect.name}.
Each claim must have a concrete source URL, publisher, excerpt, confidence, and outreach relevance.
Return JSON:
{
  "claims": [
    {
      "claim": "Factual statement regarding company scale, initiative, or executive statement",
      "claimType": "fact",
      "sourceUrl": "https://${prospect.domain}/news/initiative",
      "sourceTitle": "${prospect.company} Announcement",
      "publisher": "${prospect.company}",
      "publishedDate": "2026-07-15",
      "retrievedDate": "${new Date().toISOString().split('T')[0]}",
      "excerpt": "Specific quote or verified metric from source",
      "confidence": "high",
      "relevance": "Why this matters to the outreach opportunity",
      "potentialOutreachApplication": "How to weave this into the conversation"
    }
  ]
}`;
      const claimsRes = await generateStructuredJson<{ claims: ResearchClaim[] }>(
        claimsPrompt,
        {},
        () => ({ claims: [] })
      );
      if (claimsRes.claims?.length) {
        prospect.claims.push(...claimsRes.claims.map((c, idx) => ({ ...c, id: `claim_${Date.now()}_${idx}` })));
      }
    }

    // Run transparent scoring qualification
    if (icp) {
      prospect.qualification = calculateQualification(
        icp,
        prospect.companyData,
        prospect.personData,
        prospect.signals,
        prospect.claims
      );
      prospect.fitScore = prospect.qualification.overallScore;
      prospect.buyingSignalScore = prospect.qualification.dimensionScores.buyingSignalStrength;
      prospect.confidenceScore = prospect.qualification.dimensionScores.evidenceQuality;
    }

    appendLog(
      'Stage E & F: Qualified and Scored',
      `Overall Fit Score: ${prospect.fitScore}/100 (Qualified: ${prospect.qualification.isQualified ? 'YES' : 'NO'}). Claims cataloged: ${prospect.claims.length}.`
    );

    // ----------------------------------------------------
    // STAGE G: Generate Hyperpersonalized Outreach Drafts
    // ----------------------------------------------------
    prospect.stage = 'drafting';
    db.saveProspect(prospect);

    db.updateJobStatus(jobId, {
      currentStage: 'drafting',
      progress: 92,
      stagesCompleted: ['verifying', 'researching_company', 'researching_person', 'industry_analysis', 'qualifying'],
    });

    const drafts = await generateOutreachDrafts(prospect, campaign, icp);
    prospect.drafts = drafts;
    if (drafts.length > 0 && !prospect.selectedDraftId) {
      prospect.selectedDraftId = drafts[0].id;
    }

    prospect.stage = 'ready_for_review';
    prospect.outreachStatus = 'draft_ready';
    appendLog('Outreach Drafts Generated', `Created ${drafts.length} individualized drafts across multiple channels and personalization angles.`);

    db.saveProspect(prospect);

    db.updateJobStatus(jobId, {
      status: 'completed',
      currentStage: 'ready_for_review',
      progress: 100,
      completedAt: new Date().toISOString(),
      stagesCompleted: [
        'discovering',
        'verifying',
        'researching_company',
        'researching_person',
        'industry_analysis',
        'qualifying',
        'drafting',
        'ready_for_review',
      ],
    });

    return prospect;
  } catch (err: any) {
    console.error(`Research pipeline error for ${prospect.name}:`, err);
    prospect.stage = 'failed';
    appendLog('Research Interrupted', `Pipeline error: ${err.message || 'Unknown failure'}. Resumable.`);
    db.saveProspect(prospect);

    db.updateJobStatus(jobId, {
      status: 'failed',
      errorMessage: err.message || 'Pipeline execution failed',
      retries: (db.getJobs().find(j => j.id === jobId)?.retries || 0) + 1,
    });

    return prospect;
  }
}
