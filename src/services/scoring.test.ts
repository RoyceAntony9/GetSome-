import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateQualification } from './scoring';
import { ICPProfile, CompanyIntelligence, PersonIntelligence } from '../types/index';

const sampleICP: ICPProfile = {
  id: 'icp-1',
  name: 'Enterprise FinTech AI Leaders',
  description: 'Targeting VP & C-Level engineering leaders at mid-to-large FinTech companies',
  targetIndustries: ['FinTech', 'Financial Services', 'Banking'],
  companySizeMin: 100,
  companySizeMax: 2000,
  targetGeographies: ['North America', 'United States', 'Europe'],
  businessModels: ['B2B SaaS', 'Enterprise'],
  techStackKeywords: ['Kubernetes', 'PostgreSQL', 'Kafka'],
  targetRoles: ['VP of Engineering', 'Head of AI', 'CTO', 'Chief Technology Officer'],
  seniorityLevels: ['C-Level', 'VP'],
  requiredConditions: ['B2B SaaS payment processing or cloud banking infrastructure'],
  preferredAttributes: ['Expanding AI engineering team'],
  exclusionCriteria: ['Crypto gambling', 'Direct-to-consumer micro-lending'],
  positiveBuyingSignals: [{ signal: 'Hiring engineering leadership', weight: 20 }],
  negativeBuyingSignals: [{ signal: 'Mass layoffs', weight: -30 }],
  minScoreThreshold: 70,
  weights: {
    icpFit: 35,
    decisionMakerRelevance: 30,
    buyingSignalStrength: 15,
    evidenceQuality: 10,
    recency: 10,
  },
  createdAt: '2026-10-23T00:00:00Z',
  updatedAt: '2026-10-23T00:00:00Z',
};

const sampleCompany: CompanyIntelligence = {
  id: 'c-1',
  name: 'Apex Payments Inc',
  domain: 'apexpayments.com',
  website: 'https://apexpayments.com',
  industry: 'FinTech / Payments Infrastructure',
  headquarters: 'New York, United States',
  employeeCount: '450',
  estimatedRevenue: '$60M ARR',
  businessModel: 'B2B SaaS',
  whatTheyDo: 'High-throughput B2B SaaS payment processing or cloud banking infrastructure for cross-border merchants.',
  productsAndServices: ['Payment Gateway', 'Reconciliation Engine'],
  targetCustomers: ['Enterprise Merchants'],
  strategicPriorities: ['AI-driven automated fraud mitigation', 'Expanding AI engineering team'],
  growthSignals: ['Raised $40M Series C in Q2 2026'],
  operationalChallenges: ['Legacy batch processing bottlenecks'],
  knownTechStack: ['Kafka', 'PostgreSQL', 'Go', 'Kubernetes'],
  competitors: ['Stripe', 'Adyen'],
  offeringBenefitFit: 'Accelerates streaming data pipelines and agentic reconciliation.',
  verifiedAt: '2026-10-23T00:00:00Z',
};

const samplePerson: PersonIntelligence = {
  id: 'p-1',
  fullName: 'Marcus Vance',
  currentRole: 'VP of Engineering',
  company: 'Apex Payments Inc',
  companyDomain: 'apexpayments.com',
  location: 'New York, NY',
  linkedinUrl: 'https://linkedin.com/in/marcus-vance',
  email: 'm.vance@apexpayments.com',
  department: 'Core Infrastructure',
  seniority: 'VP',
  publicBio: 'Engineering leader scaling payment orchestration systems.',
  pastExperience: ['Director of Engineering at Square'],
  responsibilities: ['Overseeing distributed systems and platform reliability.'],
  publicContentAndTalks: [
    {
      title: 'Scaling Transaction Latency',
      type: 'talk',
      excerpt: 'Discussed challenges of legacy payment reconciliation batches.',
    },
  ],
  publicTopics: ['Distributed Systems', 'Kafka', 'AI in FinTech'],
  problemOwnership: 'Direct ownership of real-time pipeline reliability.',
  whyThisPerson: 'Owns transactional pipeline infrastructure and strategic technology vendor decisions.',
  verifiedAt: '2026-10-23T00:00:00Z',
};

test('scoring correctly qualifies a high-fit prospect', () => {
  const signals = [
    {
      id: 'sig-1',
      type: 'hiring' as const,
      description: 'Hiring engineering leadership for new real-time settlement engine',
      evidence: 'Official careers portal posting verified',
      sourceUrl: 'https://apexpayments.com/careers/lead-eng',
      date: '2026-09-15',
      confidence: 'high' as const,
      relevanceToOffering: 'Direct need for high-throughput pipeline expertise',
    },
  ];

  const claims = [
    {
      id: 'cl-1',
      claim: 'Apex Payments processes $4B in annual volume',
      claimType: 'fact' as const,
      sourceUrl: 'https://apexpayments.com/about',
      sourceTitle: 'About Apex',
      publisher: 'Apex Payments',
      publishedDate: '2026-06-01',
      retrievedDate: '2026-10-23',
      excerpt: 'Trusted by enterprise clients to process over $4B annually.',
      confidence: 'high' as const,
      relevance: 'Validates enterprise scale',
      potentialOutreachApplication: 'Credibility anchor',
    },
  ];

  const result = calculateQualification(sampleICP, sampleCompany, samplePerson, signals, claims);
  assert.ok(result.overallScore >= 70, `Expected score >= 70, got ${result.overallScore}`);
  assert.equal(result.isQualified, true);
  assert.ok(result.criteriaEvaluation.length >= 5);
  assert.equal(result.riskFactors.length, 0);
});

test('scoring disqualifies when an exclusion criterion is triggered', () => {
  const cryptoCompany: CompanyIntelligence = {
    ...sampleCompany,
    whatTheyDo: 'Crypto gambling and unregulated digital token betting exchange',
  };

  const result = calculateQualification(sampleICP, cryptoCompany, samplePerson, [], []);
  assert.equal(result.isQualified, false);
  assert.ok(result.riskFactors.some(r => r.includes('exclusion')));
  assert.ok(result.overallScore <= 30);
});
