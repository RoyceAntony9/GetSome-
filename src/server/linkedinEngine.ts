import { generateStructuredJson } from './aiProvider';
import {
  Prospect,
  LinkedInObservationAlternative,
  LinkedInTemplateVersion,
} from '../types/index';

export { CANONICAL_LINKEDIN_TEMPLATE, assembleLinkedInMessage } from '../constants/linkedinTemplate';
import { CANONICAL_LINKEDIN_TEMPLATE, assembleLinkedInMessage } from '../constants/linkedinTemplate';

export async function generateLinkedInObservations(
  prospect: Prospect,
  template: LinkedInTemplateVersion = CANONICAL_LINKEDIN_TEMPLATE
): Promise<LinkedInObservationAlternative[]> {
  const firstName = prospect.name.split(' ')[0] || 'there';
  const verifiedClaim = prospect.claims[0] || {
    claim: `${prospect.company} operates in ${prospect.companyData.industry}.`,
    excerpt: prospect.companyData.whatTheyDo,
    sourceUrl: `https://${prospect.domain}`,
    sourceTitle: `${prospect.company} profile`,
  };

  const sources = (prospect.claims || [])
    .filter(c => c.sourceUrl)
    .slice(0, 3)
    .map(c => ({ title: c.sourceTitle || c.publisher || prospect.company, url: c.sourceUrl }));

  if (sources.length === 0) {
    sources.push({ title: `${prospect.company} Corporate`, url: `https://${prospect.domain}` });
  }

  const prompt = `You are a specialist researcher identifying exact professional intersections for a high-level B2B LinkedIn connection request.
Prospect Name: ${prospect.name} (First Name: ${firstName})
Current Role: ${prospect.role} at ${prospect.company}
Industry: ${prospect.companyData.industry} (Sub-industry: ${prospect.companyData.subIndustry || 'N/A'})
Company Mission & Products: ${prospect.companyData.whatTheyDo}
Responsibilities: ${prospect.personData.responsibilities?.join(', ') || 'Technology leadership & platform operations'}
Known Initiatives / Talks / Publications: ${prospect.personData.publicTopics?.join(', ') || 'N/A'}
Strongest Verified Evidence: "${verifiedClaim.claim}"
Buying Signals: ${prospect.signals?.map(s => s.description).join('; ') || 'Platform expansion'}

MANDATORY RULES:
1. Generate exactly 3 distinct observation alternatives describing the intersection of their real professional work:
   - Option A — Direct: A concise, factual description of the person's professional focus (e.g. "defence innovation, emerging technology, and government acquisition").
   - Option B — Strategic: A description emphasizing the intersection of their responsibilities, commercial priorities, or industry (e.g. "defence technology, commercialization, and public-sector procurement").
   - Option C — Distinctive: A more specific observation highlighting a meaningful, evidence-backed aspect of their work (e.g. "connecting emerging defence capabilities with government acquisition and real-world deployment").
2. DO NOT include "I noticed your work at the intersection of" in the observation field itself. Only output the 2-4 professional domains connected by commas/and.
3. Observations must be grounded in verified facts from the prospect dossier. Do NOT invent interests, degrees, or imaginary initiatives.
4. Total resulting message character length MUST be under 300 characters to fit LinkedIn's connection request limit.

Return JSON format:
{
  "options": [
    {
      "optionType": "Option A — Direct",
      "observation": "factual intersection phrase",
      "supportingEvidence": "The specific evidence from the dossier this is based on"
    },
    {
      "optionType": "Option B — Strategic",
      "observation": "strategic commercial intersection phrase",
      "supportingEvidence": "The strategic priority or growth signal this reflects"
    },
    {
      "optionType": "Option C — Distinctive",
      "observation": "distinctive evidence-backed intersection phrase",
      "supportingEvidence": "The specific technical or operational nuance referenced"
    }
  ]
}`;

  // Domain-aware fallbacks in case AI is offline or slow
  const industryLower = (prospect.companyData.industry || '').toLowerCase();
  let defaultA = 'platform architecture, high-throughput systems, and operational scaling';
  let defaultB = 'enterprise infrastructure, digital modernization, and developer velocity';
  let defaultC = 'mission-critical cloud data pipelines, reliability engineering, and system resilience';

  if (industryLower.includes('health') || industryLower.includes('clinical') || industryLower.includes('bio')) {
    defaultA = 'clinical health informatics, diagnostic AI, and regulatory compliance';
    defaultB = 'healthcare data interoperability, patient care workflows, and enterprise health tech';
    defaultC = 'HIPAA-compliant cloud architectures, clinical AI integration, and provider efficiency';
  } else if (industryLower.includes('fintech') || industryLower.includes('bank') || industryLower.includes('pay')) {
    defaultA = 'distributed payment systems, transaction reconciliation, and financial engineering';
    defaultB = 'fintech infrastructure, real-time streaming settlement, and regulatory compliance';
    defaultC = 'low-latency distributed ledgers, transaction security, and cross-border payment rails';
  } else if (industryLower.includes('defence') || industryLower.includes('defense') || industryLower.includes('aero')) {
    defaultA = 'defence innovation, emerging technology, and government acquisition';
    defaultB = 'defence technology, commercialization, and public-sector procurement';
    defaultC = 'connecting emerging defence capabilities with government acquisition and real-world deployment';
  }

  const fallbackObservations = [
    {
      optionType: 'Option A — Direct' as const,
      observation: defaultA,
      supportingEvidence: verifiedClaim.claim,
    },
    {
      optionType: 'Option B — Strategic' as const,
      observation: defaultB,
      supportingEvidence: prospect.companyData.strategicPriorities?.[0] || verifiedClaim.claim,
    },
    {
      optionType: 'Option C — Distinctive' as const,
      observation: defaultC,
      supportingEvidence: prospect.signals?.[0]?.description || verifiedClaim.excerpt || verifiedClaim.claim,
    },
  ];

  try {
    const aiResult = await generateStructuredJson<{ options: { optionType: any; observation: string; supportingEvidence: string }[] }>(
      prompt,
      { systemInstruction: 'You are an expert executive researcher. Deliver precise factual intersections.' },
      () => ({ options: fallbackObservations })
    );

    const generated = (aiResult.options && aiResult.options.length > 0) ? aiResult.options : fallbackObservations;

    return generated.map((opt, idx) => {
      const fullMessage = assembleLinkedInMessage(firstName, opt.observation, template);
      return {
        id: `li_opt_${prospect.id}_${idx}_${Date.now()}`,
        optionType: (opt.optionType as any) || (idx === 0 ? 'Option A — Direct' : idx === 1 ? 'Option B — Strategic' : 'Option C — Distinctive'),
        observation: opt.observation.trim(),
        completeMessage: fullMessage,
        supportingEvidence: opt.supportingEvidence || verifiedClaim.claim,
        sourcesUsed: sources,
        isSelected: idx === 0,
      };
    });
  } catch (err) {
    console.warn('[LinkedInEngine] Fallback to structured templates:', err);
    return fallbackObservations.map((opt, idx) => {
      const fullMessage = assembleLinkedInMessage(firstName, opt.observation, template);
      return {
        id: `li_opt_${prospect.id}_${idx}_${Date.now()}`,
        optionType: opt.optionType,
        observation: opt.observation,
        completeMessage: fullMessage,
        supportingEvidence: opt.supportingEvidence,
        sourcesUsed: sources,
        isSelected: idx === 0,
      };
    });
  }
}
