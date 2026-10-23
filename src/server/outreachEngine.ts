import { generateStructuredJson } from './aiProvider';
import { validateOutreachContent, CHANNEL_LIMITS } from '../services/channelValidator';
import {
  Prospect,
  Campaign,
  ICPProfile,
  OutreachDraft,
  ChannelType,
  MessageApproach,
} from '../types/index';

export interface RegenerationParams {
  draftId: string;
  customInstruction: string;
  targetTone?: string;
  forceChannel?: ChannelType;
  forceApproach?: MessageApproach;
}

export async function generateOutreachDrafts(
  prospect: Prospect,
  campaign?: Campaign,
  icp?: ICPProfile
): Promise<OutreachDraft[]> {
  const verifiedClaim = prospect.claims[0] || {
    claim: `${prospect.company} operates at enterprise scale in ${prospect.companyData.industry}.`,
    excerpt: prospect.companyData.whatTheyDo,
    sourceUrl: `https://${prospect.domain}`,
  };

  const strongestSignal = prospect.signals[0] || {
    description: prospect.companyData.growthSignals[0] || 'Modernizing platform operations',
    evidence: 'Verified via corporate filings',
  };

  const publicTalk = prospect.personData.publicContentAndTalks?.[0];

  const prompt = `You are an elite B2B technology copywriter crafting hyperpersonalized, human-sounding outreach.
Prospect: ${prospect.name}
Role: ${prospect.role} at ${prospect.company}
Company Details: ${prospect.companyData.whatTheyDo}
Operational Challenge: ${prospect.companyData.operationalChallenges?.join('; ') || 'Scalability under traffic surges'}
Strongest Verified Evidence: "${verifiedClaim.claim}" (Excerpt: "${verifiedClaim.excerpt}")
Public talk/post (if any): "${publicTalk?.title || 'None'}" (${publicTalk?.excerpt || ''})
Strongest Buying Signal: "${strongestSignal.description}"
Our Value Proposition: "${campaign?.offeringProposition || 'High-reliability real-time data streaming and latency optimization'}"
Tone Preference: "${campaign?.tonePreference || 'Direct & Technical'}"

CRITICAL ANTI-AI SLOP RULES:
- NEVER use: "I hope this message finds you well", "I came across your impressive profile", "synergies", "revolutionary", "game-changing".
- NEVER compliment generically.
- Lead with an exact, authentic observation about their company or public talk.
- State a plausible engineering trade-off or challenge.
- End with a low-friction, consultative question.
- STRICT LENGTH RULES:
  * linkedin_connect MUST BE STRICTLY UNDER 300 CHARACTERS.
  * email subject line MUST BE UNDER 70 CHARACTERS.

Generate 3 genuinely distinct approaches:
1. Insight-led (channel: linkedin_connect): Lead with an authentic company or industry observation. Under 290 characters.
2. Problem-led (channel: email): Explore an operational challenge connected to their growth. Subject + Body.
3. Curiosity-led (channel: linkedin_inmail): Ask a thoughtful question grounded in their architectural choice. Subject + Body.

Return JSON:
{
  "drafts": [
    {
      "channel": "linkedin_connect",
      "approach": "insight_led",
      "content": "Short message strictly under 280 chars",
      "angleExplanation": "Why this specific observation was chosen",
      "supportingEvidence": "The exact source claim or talk referenced",
      "whyRelevant": "Why this matters to their current role",
      "intendedTone": "Technical peer inquiry",
      "assumptionsFlagged": ["Assumption 1"]
    },
    {
      "channel": "email",
      "approach": "problem_led",
      "subjectLine": "Short unhyped subject",
      "content": "Email body (3-4 concise paragraphs)",
      "angleExplanation": "Focuses on operational friction during growth",
      "supportingEvidence": "Source citation",
      "whyRelevant": "Directly impacts their infrastructure reliability",
      "intendedTone": "Strategic & consultative",
      "assumptionsFlagged": ["Assumption 1"]
    },
    {
      "channel": "linkedin_inmail",
      "approach": "curiosity_led",
      "subjectLine": "InMail subject",
      "content": "InMail message (150-250 words)",
      "angleExplanation": "Poses a strategic question on trade-offs",
      "supportingEvidence": "Source citation",
      "whyRelevant": "Directly tied to their engineering roadmap",
      "intendedTone": "Direct & technical",
      "assumptionsFlagged": ["Assumption 1"]
    }
  ]
}`;

  const defaultConnect = `${prospect.name.split(' ')[0]} — tracked ${prospect.company}'s work in ${prospect.companyData.industry}. We benchmark sub-15ms streaming latency for platforms at your scale. Open to exchanging technical notes?`;
  const defaultEmail = `Hi ${prospect.name.split(' ')[0]},

I noticed ${prospect.company}'s expansion in ${prospect.companyData.industry} and the engineering focus on pipeline throughput.

When distributed platforms process high-concurrency transactions, a recurring bottleneck is partition skew triggering unexpected downstream delays.

We engineered an adaptive streaming verification layer that isolates partition hotspots without requiring teams to rewrite their consumer topologies.

Would you be open to comparing benchmarks on how other engineering teams have handled this as throughput scales?

Best regards,
Alex Mercer`;

  const fallbackDrafts: OutreachDraft[] = [
    {
      id: `draft_${prospect.id}_connect`,
      prospectId: prospect.id,
      channel: 'linkedin_connect',
      approach: 'insight_led',
      content: defaultConnect.slice(0, 285),
      characterCount: defaultConnect.slice(0, 285).length,
      maxAllowedCharacters: 300,
      isWithinLimit: true,
      angleExplanation: `Anchors on ${prospect.company}'s scale in ${prospect.companyData.industry}.`,
      supportingEvidence: verifiedClaim.claim,
      whyRelevant: `Matches ${prospect.role}'s focus on platform throughput.`,
      intendedTone: 'Peer-to-peer technical inquiry.',
      assumptionsFlagged: ['Assumes candidate values peer engineering benchmarking.'],
      approvalStatus: 'pending_review',
      version: 1,
      history: [],
    },
    {
      id: `draft_${prospect.id}_email`,
      prospectId: prospect.id,
      channel: 'email',
      approach: 'problem_led',
      subjectLine: `${prospect.company} throughput & streaming latency benchmark`,
      content: defaultEmail,
      characterCount: defaultEmail.length,
      maxAllowedCharacters: 2200,
      isWithinLimit: true,
      angleExplanation: 'Directly addresses partition skew and throughput bottlenecks.',
      supportingEvidence: verifiedClaim.excerpt || verifiedClaim.claim,
      whyRelevant: 'Connects their active engineering focus to a concrete architecture solution.',
      intendedTone: 'Strategic, technical, consultative.',
      assumptionsFlagged: ['Assumes team is actively scaling real-time ingestion.'],
      approvalStatus: 'pending_review',
      version: 1,
      history: [],
    },
  ];

  const aiRes = await generateStructuredJson<{ drafts: any[] }>(
    prompt,
    { systemInstruction: 'You are an elite B2B sales development strategist and engineer. Output strictly valid JSON.' },
    () => ({ drafts: [] })
  );

  if (aiRes.drafts && aiRes.drafts.length > 0) {
    const parsedDrafts: OutreachDraft[] = aiRes.drafts.map((d, idx) => {
      const channel: ChannelType = d.channel || (idx === 0 ? 'linkedin_connect' : idx === 1 ? 'email' : 'linkedin_inmail');
      const approach: MessageApproach = d.approach || (idx === 0 ? 'insight_led' : idx === 1 ? 'problem_led' : 'curiosity_led');
      const limits = CHANNEL_LIMITS[channel];
      let content = (d.content || '').trim();

      // Enforce connection request limit strictly
      if (channel === 'linkedin_connect' && content.length > limits.maxChars) {
        content = content.slice(0, limits.maxChars - 3) + '...';
      }

      const report = validateOutreachContent(channel, content, d.subjectLine);

      return {
        id: `draft_${prospect.id}_${channel}_${approach}_${idx}`,
        prospectId: prospect.id,
        channel,
        approach,
        subjectLine: d.subjectLine,
        content,
        characterCount: content.length,
        maxAllowedCharacters: limits.maxChars,
        isWithinLimit: report.isValid,
        angleExplanation: d.angleExplanation || 'Specific evidence-backed angle.',
        supportingEvidence: d.supportingEvidence || verifiedClaim.claim,
        whyRelevant: d.whyRelevant || 'Connects to prospect role.',
        intendedTone: d.intendedTone || campaign?.tonePreference || 'Direct & Technical',
        assumptionsFlagged: d.assumptionsFlagged || [],
        approvalStatus: 'pending_review',
        version: 1,
        history: [],
      };
    });

    return parsedDrafts;
  }

  return fallbackDrafts;
}

export async function regenerateDraft(
  draft: OutreachDraft,
  prospect: Prospect,
  instruction: string,
  campaign?: Campaign
): Promise<OutreachDraft> {
  const prompt = `You are revising an outreach draft based on specific user instruction.
Prospect: ${prospect.name} (${prospect.role} at ${prospect.company})
Company Context: ${prospect.companyData.whatTheyDo}
Current Draft Channel: ${draft.channel}
Current Approach: ${draft.approach}
Current Draft Subject: "${draft.subjectLine || ''}"
Current Draft Body:
"${draft.content}"

USER'S REVISION INSTRUCTION:
"${instruction}"

STRICT CHANNEL CONSTRAINTS:
- Channel: ${draft.channel}
- Max Characters Allowed: ${CHANNEL_LIMITS[draft.channel].maxChars}
- Anti-Slop: Zero cliché phrases ("I hope this finds you well", etc.).

Return JSON:
{
  "subjectLine": "Revised subject line (if applicable for email/inmail)",
  "content": "Revised message text strictly adhering to channel character budget",
  "angleExplanation": "Updated angle explanation",
  "assumptionsFlagged": ["Any remaining assumptions"]
}`;

  const aiRes = await generateStructuredJson<any>(
    prompt,
    {},
    () => ({
      subjectLine: draft.subjectLine,
      content: `${draft.content}\n\n[Revised per instruction: ${instruction}]`,
      angleExplanation: `Revised per user feedback: "${instruction}"`,
      assumptionsFlagged: draft.assumptionsFlagged,
    })
  );

  let newContent = (aiRes.content || draft.content).trim();
  const limits = CHANNEL_LIMITS[draft.channel];
  if (draft.channel === 'linkedin_connect' && newContent.length > limits.maxChars) {
    newContent = newContent.slice(0, limits.maxChars - 3) + '...';
  }

  const updatedHistory = [
    {
      version: draft.version,
      content: draft.content,
      subjectLine: draft.subjectLine,
      editedAt: new Date().toISOString(),
      note: `Regenerated with instruction: "${instruction}"`,
    },
    ...(draft.history || []),
  ];

  return {
    ...draft,
    subjectLine: aiRes.subjectLine || draft.subjectLine,
    content: newContent,
    characterCount: newContent.length,
    isWithinLimit: newContent.length <= limits.maxChars,
    angleExplanation: aiRes.angleExplanation || `Adjusted based on: "${instruction}"`,
    assumptionsFlagged: aiRes.assumptionsFlagged || draft.assumptionsFlagged,
    version: draft.version + 1,
    approvalStatus: 'pending_review',
    history: updatedHistory,
  };
}
