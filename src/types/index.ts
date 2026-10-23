export type SeniorityLevel = 'C-Level' | 'VP' | 'Director' | 'Head' | 'Manager' | 'Lead';

export interface ICPProfile {
  id: string;
  name: string;
  description: string;
  targetIndustries: string[];
  companySizeMin: number;
  companySizeMax: number;
  targetGeographies: string[];
  businessModels: string[];
  techStackKeywords: string[];
  targetRoles: string[];
  seniorityLevels: SeniorityLevel[];
  requiredConditions: string[];
  preferredAttributes: string[];
  exclusionCriteria: string[];
  positiveBuyingSignals: { signal: string; weight: number }[];
  negativeBuyingSignals: { signal: string; weight: number }[];
  minScoreThreshold: number;
  weights: {
    icpFit: number;
    decisionMakerRelevance: number;
    buyingSignalStrength: number;
    evidenceQuality: number;
    recency: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type ChannelType = 'linkedin_connect' | 'linkedin_inmail' | 'email' | 'followup';
export type MessageApproach = 'insight_led' | 'problem_led' | 'curiosity_led';

export interface Campaign {
  id: string;
  name: string;
  icpId: string;
  objective: string;
  offeringProposition: string;
  targetGeography: string[];
  targetIndustries: string[];
  targetRoles: string[];
  exclusions: string[];
  tonePreference: 'Direct & Technical' | 'Strategic & Executive' | 'Consultative & Inquisitive';
  channels: ChannelType[];
  maxDiscoveryVolume: number;
  researchDepth: 'standard' | 'deep_investigative' | 'rapid';
  qualificationThreshold: number;
  status: 'active' | 'paused' | 'completed' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export interface CompanyIntelligence {
  id: string;
  name: string;
  domain: string;
  website: string;
  industry: string;
  headquarters: string;
  employeeCount: string;
  estimatedRevenue: string;
  businessModel: string;
  whatTheyDo: string;
  productsAndServices: string[];
  targetCustomers: string[];
  strategicPriorities: string[];
  growthSignals: string[];
  operationalChallenges: string[];
  knownTechStack: string[];
  competitors: string[];
  offeringBenefitFit: string;
  verifiedAt: string;
}

export interface PersonIntelligence {
  id: string;
  fullName: string;
  currentRole: string;
  company: string;
  companyDomain: string;
  location: string;
  linkedinUrl: string;
  email: string;
  department: string;
  seniority: SeniorityLevel;
  publicBio: string;
  pastExperience: string[];
  responsibilities: string[];
  publicContentAndTalks: {
    title: string;
    type: 'article' | 'interview' | 'talk' | 'post' | 'podcast';
    url?: string;
    date?: string;
    excerpt: string;
  }[];
  publicTopics: string[];
  problemOwnership: string;
  whyThisPerson: string;
  verifiedAt: string;
}

export interface IndustryIntelligence {
  industry: string;
  keyTrends: string[];
  competitivePressures: string[];
  regulatoryOrTechShifts: string[];
  implicationsForRole: string;
  sources: string[];
}

export interface ResearchClaim {
  id: string;
  claim: string;
  claimType: 'fact' | 'inference' | 'unknown';
  sourceUrl: string;
  sourceTitle: string;
  publisher: string;
  publishedDate: string;
  retrievedDate: string;
  excerpt: string;
  confidence: 'high' | 'medium' | 'low';
  relevance: string;
  potentialOutreachApplication: string;
}

export interface BuyingSignal {
  id: string;
  type: 'expansion' | 'hiring' | 'tech_modernization' | 'funding' | 'leadership_change' | 'product_launch' | 'regulatory_pressure';
  description: string;
  evidence: string;
  sourceUrl: string;
  date: string;
  confidence: 'high' | 'medium' | 'low';
  relevanceToOffering: string;
}

export interface CriterionEvaluation {
  criterion: string;
  category: 'required' | 'preferred' | 'exclusion' | 'signal';
  status: 'satisfied' | 'uncertain' | 'contradicted' | 'unresearched';
  evidenceNotes: string;
  sourceCitation?: string;
}

export interface QualificationResult {
  overallScore: number;
  isQualified: boolean;
  dimensionScores: {
    icpFit: number;
    decisionMakerRelevance: number;
    buyingSignalStrength: number;
    evidenceQuality: number;
    recency: number;
  };
  criteriaEvaluation: CriterionEvaluation[];
  summaryExplanation: string;
  riskFactors: string[];
}

export interface OutreachDraft {
  id: string;
  prospectId: string;
  channel: ChannelType;
  approach: MessageApproach;
  subjectLine?: string;
  content: string;
  characterCount: number;
  maxAllowedCharacters: number;
  isWithinLimit: boolean;
  angleExplanation: string;
  supportingEvidence: string;
  whyRelevant: string;
  intendedTone: string;
  assumptionsFlagged: string[];
  approvalStatus: 'pending_review' | 'approved' | 'rejected' | 'regenerated';
  rejectionReason?: string;
  version: number;
  history: {
    version: number;
    content: string;
    subjectLine?: string;
    editedAt: string;
    note?: string;
  }[];
}

export type ProspectStage =
  | 'queued'
  | 'discovering'
  | 'verifying'
  | 'researching_company'
  | 'researching_person'
  | 'industry_analysis'
  | 'qualifying'
  | 'drafting'
  | 'ready_for_review'
  | 'approved'
  | 'contacted'
  | 'rejected'
  | 'failed';

export interface Prospect {
  id: string;
  campaignId: string;
  icpId: string;
  name: string;
  role: string;
  company: string;
  domain: string;
  location: string;
  linkedinUrl: string;
  email: string;
  stage: ProspectStage;
  discoverySource: string;
  discoveryTimestamp: string;
  verified: boolean;
  fitScore: number;
  buyingSignalScore: number;
  confidenceScore: number;
  companyData: CompanyIntelligence;
  personData: PersonIntelligence;
  industryData: IndustryIntelligence;
  claims: ResearchClaim[];
  signals: BuyingSignal[];
  qualification: QualificationResult;
  drafts: OutreachDraft[];
  selectedDraftId?: string;
  outreachStatus: 'none' | 'draft_ready' | 'approved' | 'sent_manually' | 'bounced' | 'replied' | 'converted';
  outreachNotes?: string;
  lastContactedAt?: string;
  activityLog: {
    timestamp: string;
    action: string;
    details: string;
    actor: 'system' | 'user';
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ResearchJob {
  id: string;
  prospectId: string;
  campaignId: string;
  prospectName: string;
  companyName: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
  currentStage: ProspectStage;
  progress: number;
  stagesCompleted: string[];
  errorMessage?: string;
  retries: number;
  startedAt: string;
  completedAt?: string;
}

export interface AISettings {
  activeProvider: 'gemini' | 'ollama' | 'openai_compatible';
  geminiModel: string;
  ollamaEndpoint: string;
  ollamaModel: string;
  taskModels: {
    queryGeneration: string;
    reasoningAndQual: string;
    outreachWriting: string;
  };
  researchDepth: 'standard' | 'deep_investigative' | 'rapid';
  rateLimitPerMinute: number;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalRuns: number;
    estimatedCostUsd: number;
  };
}
