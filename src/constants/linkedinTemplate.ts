import { LinkedInTemplateVersion } from '../types/index';

export const CANONICAL_LINKEDIN_TEMPLATE: LinkedInTemplateVersion = {
  id: 'template_canonical_v1',
  name: 'Canonical GetSome Inquisitive Connection',
  salutation: 'Hi {firstName},',
  observationLead: 'I noticed your work at the intersection of',
  closingLead: 'I’d love to connect and exchange ideas on',
  closingThemes: [
    'technology commercialization',
    'strategic partnerships',
    'driving growth in emerging markets',
  ],
  rawTemplate: `Hi {firstName}, I noticed your work at the intersection of {observation}. I’d love to connect and exchange ideas on technology commercialization, strategic partnerships, and driving growth in emerging markets.`,
  isCanonical: true,
  updatedAt: new Date().toISOString(),
};

export function assembleLinkedInMessage(
  firstName: string,
  observation: string,
  template: LinkedInTemplateVersion = CANONICAL_LINKEDIN_TEMPLATE
): string {
  const cleanFirst = firstName || 'there';
  const cleanObs = observation.replace(/^the intersection of\s+/i, '').replace(/\.$/, '').trim();
  const themes = template.closingThemes || [
    'technology commercialization',
    'strategic partnerships',
    'driving growth in emerging markets',
  ];
  const themesStr = themes.length === 3
    ? `${themes[0]}, ${themes[1]}, and ${themes[2]}`
    : themes.join(', ');

  const salutation = (template.salutation || 'Hi {firstName},').replace('{firstName}', cleanFirst);
  const obsLead = template.observationLead || 'I noticed your work at the intersection of';
  const closingLead = template.closingLead || 'I’d love to connect and exchange ideas on';

  return `${salutation} ${obsLead} ${cleanObs}. ${closingLead} ${themesStr}.`;
}
