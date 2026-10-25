import { Prospect, Campaign, GmailDraftMetadata } from '../types/index';
import { generateStructuredJson } from './aiProvider';

// In-memory token storage (cached server-side)
let activeGmailToken: {
  accessToken: string;
  email?: string;
  expiresAt?: number;
} | null = null;

export function setServerGmailToken(token: string, email?: string, expiresInSeconds: number = 3600) {
  activeGmailToken = {
    accessToken: token,
    email: email || 'authenticated_user@gmail.com',
    expiresAt: Date.now() + expiresInSeconds * 1000,
  };
}

export function getServerGmailStatus() {
  if (!activeGmailToken || !activeGmailToken.accessToken) {
    return {
      connected: false,
      email: null,
      message: 'Gmail is not connected. Sign in with Google to enable real Gmail draft creation.',
    };
  }

  const isExpired = activeGmailToken.expiresAt ? Date.now() > activeGmailToken.expiresAt : false;
  return {
    connected: !isExpired,
    email: activeGmailToken.email,
    isExpired,
    message: isExpired ? 'Gmail token expired. Please reconnect.' : 'Connected to Gmail Drafts API.',
  };
}

export function disconnectServerGmail() {
  activeGmailToken = null;
}

/**
 * Encodes an RFC 2822 email message to base64url string as required by Gmail API.
 */
export function createRfc2822Raw(to: string, subject: string, body: string, from?: string): string {
  const headers = [
    from ? `From: ${from}` : '',
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject, 'utf-8').toString('base64')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
  ]
    .filter(Boolean)
    .join('\r\n');

  const fullMessage = `${headers}\r\n\r\n${body}`;

  // Convert to base64url (replace + with -, / with _, remove =)
  return Buffer.from(fullMessage, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Saves a draft directly into the user's authentic Gmail Drafts folder using the official Google Gmail REST API.
 * CRITICAL RULE: NEVER calls the send endpoint. Only creates drafts.
 */
export async function saveDraftToGmailAccount(
  recipientEmail: string,
  subject: string,
  body: string,
  customToken?: string
): Promise<{ draftId: string; messageId: string; threadId?: string }> {
  const token = customToken || activeGmailToken?.accessToken;
  if (!token) {
    throw new Error('No Gmail access token available. Please sign in to connect your Gmail account.');
  }

  const rawMessage = createRfc2822Raw(recipientEmail, subject, body);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        raw: rawMessage,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Gmail API Draft creation failed (${response.status}): ${
        (errorData as any)?.error?.message || response.statusText
      }`
    );
  }

  const result = await response.json();
  return {
    draftId: result.id,
    messageId: result.message?.id || result.id,
    threadId: result.message?.threadId,
  };
}

/**
 * Generates an evidence-backed email draft for a prospect.
 */
export async function generatePersonalizedEmailDraft(
  prospect: Prospect,
  campaign?: Campaign
): Promise<{ subject: string; body: string; angle: string }> {
  const firstName = prospect.name.split(' ')[0] || 'there';
  const verifiedClaim = prospect.claims[0] || {
    claim: `${prospect.company} is innovating platform workflows in ${prospect.companyData.industry}.`,
    excerpt: prospect.companyData.whatTheyDo,
  };

  const signal = prospect.signals[0] || {
    description: prospect.companyData.growthSignals?.[0] || 'Expanding enterprise systems',
  };

  const prompt = `You are a world-class executive communication advisor crafting a concise, evidence-backed B2B first-touch email.
Prospect: ${prospect.name} (${firstName})
Role: ${prospect.role} at ${prospect.company}
Company Mission: ${prospect.companyData.whatTheyDo}
Industry: ${prospect.companyData.industry}
Key Operational Priority: ${prospect.companyData.strategicPriorities?.[0] || 'Modernizing core transaction pipelines'}
Verified Evidence Source: "${verifiedClaim.claim}" (Context: "${verifiedClaim.excerpt}")
Buying Signal: "${signal.description}"
Our Offering: "${campaign?.offeringProposition || 'High-throughput real-time streaming and distributed platform architecture'}"
Tone: Direct, humble, consultative, zero sales hype.

ANTI-AI SLOP RULES:
- Never say: "I hope you are well", "I stumbled across your profile", "synergies", "game-changer".
- Keep email body under 140 words (3 brief paragraphs).
- Subject line must be unhyped and relevant (under 50 characters).

Return JSON:
{
  "subject": "Concise relevant subject",
  "body": "Hi ${firstName},\\n\\n[Observation grounded in verified evidence]\\n\\n[Specific architectural or business challenge]\\n\\n[Low friction consultative closing]\\n\\nBest regards,\\n[Your Name]",
  "angle": "Brief explanation of why this angle was chosen"
}`;

  const defaultSubject = `${prospect.company} / platform architecture notes`;
  const defaultBody = `Hi ${firstName},

I noticed ${prospect.company}'s work in ${prospect.companyData.industry} and your engineering team's focus on platform reliability.

When organizations scale data-intensive pipelines, recurring partition hotspots and latency spikes often create friction between ingestion and downstream analytics.

We built an adaptive streaming verification layer designed to isolate concurrency bottlenecks without requiring topology rewrites.

Would you be open to a brief exchange on how peer engineering teams have addressed this as throughput scales?

Best regards,
Alex Mercer`;

  try {
    const aiRes = await generateStructuredJson<{ subject: string; body: string; angle: string }>(
      prompt,
      {},
      () => ({
        subject: defaultSubject,
        body: defaultBody,
        angle: 'Focuses on platform reliability and real-time throughput bottlenecks.',
      })
    );

    return {
      subject: aiRes.subject || defaultSubject,
      body: aiRes.body || defaultBody,
      angle: aiRes.angle || 'Evidence-grounded operational inquiry.',
    };
  } catch {
    return {
      subject: defaultSubject,
      body: defaultBody,
      angle: 'Operational inquiry grounded in verified company intelligence.',
    };
  }
}
