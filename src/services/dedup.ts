export function normalizeDomain(rawUrlOrDomain: string): string {
  if (!rawUrlOrDomain) return '';
  let clean = rawUrlOrDomain.trim().toLowerCase();
  clean = clean.replace(/^(https?:\/\/)?(www\.)?/, '');
  clean = clean.split('/')[0];
  clean = clean.split('?')[0];
  clean = clean.split(':')[0];
  return clean;
}

export function normalizeProfileUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let clean = rawUrl.trim().toLowerCase();
  clean = clean.replace(/^(https?:\/\/)?(www\.)?/, 'https://');
  clean = clean.split('?')[0];
  if (clean.endsWith('/')) {
    clean = clean.slice(0, -1);
  }
  return clean;
}

export function generateProspectFingerprint(name: string, company: string, domain?: string): string {
  const normName = (name || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const normCompany = (company || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const normDomain = domain ? normalizeDomain(domain) : '';
  return `${normName}:${normDomain || normCompany}`;
}

export function isDuplicateProspect(
  newCandidate: { name: string; company: string; domain?: string; linkedinUrl?: string },
  existingProspects: Array<{ name: string; company: string; domain?: string; linkedinUrl?: string }>
): boolean {
  const newFingerprint = generateProspectFingerprint(newCandidate.name, newCandidate.company, newCandidate.domain);
  const newNormLinkedin = newCandidate.linkedinUrl ? normalizeProfileUrl(newCandidate.linkedinUrl) : '';

  for (const p of existingProspects) {
    if (newNormLinkedin && p.linkedinUrl && normalizeProfileUrl(p.linkedinUrl) === newNormLinkedin) {
      return true;
    }
    const existingFingerprint = generateProspectFingerprint(p.name, p.company, p.domain);
    if (newFingerprint && existingFingerprint && newFingerprint === existingFingerprint) {
      return true;
    }
  }
  return false;
}
