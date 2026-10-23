import { ChannelType } from '../types/index';

export interface ChannelLimits {
  maxChars: number;
  maxSubjectChars?: number;
  recommendation: string;
}

export const CHANNEL_LIMITS: Record<ChannelType, ChannelLimits> = {
  linkedin_connect: {
    maxChars: 300,
    recommendation: 'Concise connection note (strictly <= 300 chars). One crisp observation and explicit reason to connect.',
  },
  linkedin_inmail: {
    maxChars: 1900,
    maxSubjectChars: 200,
    recommendation: 'Detailed business inquiry connecting researched corporate context to an executive strategic query.',
  },
  email: {
    maxChars: 2200,
    maxSubjectChars: 75,
    recommendation: 'Actionable executive email with punchy, unhyped subject line and low-friction consultative call to action.',
  },
  followup: {
    maxChars: 700,
    recommendation: 'Value-additive continuation referencing a concrete new signal or specific angle rather than "just checking in".',
  },
};

export const BANNED_OUTREACH_PHRASES = [
  'i hope this message finds you well',
  'i came across your impressive profile',
  'i noticed your company is doing amazing things',
  'i wanted to reach out to explore synergies',
  'given your extensive experience in the industry',
  'synergistic',
  'as an ai language model',
  'as an ai',
  'revolutionary solution',
  'game-changing platform',
];

export interface ValidationReport {
  isValid: boolean;
  characterCount: number;
  maxAllowed: number;
  subjectCharacterCount?: number;
  maxSubjectAllowed?: number;
  bannedPhrasesFound: string[];
  warnings: string[];
}

export function validateOutreachContent(
  channel: ChannelType,
  content: string,
  subjectLine?: string
): ValidationReport {
  const limits = CHANNEL_LIMITS[channel] || { maxChars: 2000, recommendation: '' };
  const trimmed = content.trim();
  const charCount = trimmed.length;
  const bannedFound: string[] = [];
  const warnings: string[] = [];

  const lower = trimmed.toLowerCase();
  for (const phrase of BANNED_OUTREACH_PHRASES) {
    if (lower.includes(phrase)) {
      bannedFound.push(phrase);
    }
  }

  let isSubjectValid = true;
  let subjectLength: number | undefined;
  if (channel === 'email' || channel === 'linkedin_inmail') {
    if (subjectLine !== undefined) {
      subjectLength = subjectLine.trim().length;
      if (limits.maxSubjectChars && subjectLength > limits.maxSubjectChars) {
        isSubjectValid = false;
        warnings.push(`Subject line exceeds maximum limit of ${limits.maxSubjectChars} chars (currently ${subjectLength}).`);
      }
    }
  }

  const isCharValid = charCount <= limits.maxChars && charCount > 0;
  if (charCount > limits.maxChars) {
    warnings.push(`Draft exceeds channel limit by ${charCount - limits.maxChars} characters.`);
  }

  if (trimmed.length < 20) {
    warnings.push('Draft is too short to convey meaningful context.');
  }

  return {
    isValid: isCharValid && isSubjectValid && bannedFound.length === 0,
    characterCount: charCount,
    maxAllowed: limits.maxChars,
    subjectCharacterCount: subjectLength,
    maxSubjectAllowed: limits.maxSubjectChars,
    bannedPhrasesFound: bannedFound,
    warnings,
  };
}
