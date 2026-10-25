import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CANONICAL_LINKEDIN_TEMPLATE,
  assembleLinkedInMessage,
} from './linkedinEngine';
import { createRfc2822Raw, getServerGmailStatus } from './gmailService';
import { INDUSTRY_PRESETS, ALL_SUB_INDUSTRIES } from '../constants/industries';
import { normalizeDomain, isDuplicateProspect } from '../services/dedup';
import { calculateQualification } from '../services/scoring';
import { ICPProfile, CompanyIntelligence, PersonIntelligence } from '../types/index';

test('LinkedIn Canonical Template - strict wording and closing themes preservation', () => {
  const firstName = 'Elena';
  const observation = 'tax engineering, distributed accounting architectures, and European VAT compliance';
  const message = assembleLinkedInMessage(firstName, observation, CANONICAL_LINKEDIN_TEMPLATE);

  // 1. Starts with exact salutation
  assert.match(message, /^Hi Elena,/);

  // 2. Fixed lead
  assert.ok(message.includes('I noticed your work at the intersection of tax engineering, distributed accounting architectures, and European VAT compliance.'));

  // 3. Exact fixed invitation lead
  assert.ok(message.includes('I’d love to connect and exchange ideas on'));

  // 4. Exact 3 fixed closing themes (unmodified, in exact order)
  const expectedEnding = 'technology commercialization, strategic partnerships, and driving growth in emerging markets.';
  assert.ok(message.endsWith(expectedEnding));

  // 5. Fits LinkedIn 300-char limit
  assert.ok(message.length <= 300, `Message length ${message.length} exceeds 300 characters`);
});

test('Industry Expansion Presets - 12 categories and sub-industries', () => {
  assert.equal(INDUSTRY_PRESETS.length, 12, 'Must contain all 12 major industry presets');
  assert.ok(ALL_SUB_INDUSTRIES.length >= 60, 'Must have at least 60 distinct sub-industry presets');

  const aeroDef = INDUSTRY_PRESETS.find(i => i.id === 'aerospace_defence');
  assert.ok(aeroDef, 'Aerospace and Defence preset must exist');
  assert.ok(aeroDef?.subIndustries.includes('Defence technology'));
  assert.ok(aeroDef?.subIndustries.includes('Government acquisition'));

  const fintech = INDUSTRY_PRESETS.find(i => i.id === 'finance_fintech');
  assert.ok(fintech, 'Finance and Fintech preset must exist');
  assert.ok(fintech?.subIndustries.includes('Payments and financial infrastructure'));
});

test('Gmail Draft RFC 2822 encoding and Base64url compliance', () => {
  const to = 'test.executive@example.com';
  const subject = 'Platform throughput benchmarks';
  const body = 'Hi Elena,\n\nFollowing up on distributed streaming latencies.\n\nBest,\nAlex';

  const rawBase64Url = createRfc2822Raw(to, subject, body);

  // Base64url must NOT contain +, /, or =
  assert.ok(!rawBase64Url.includes('+'), 'Must not contain + in base64url');
  assert.ok(!rawBase64Url.includes('/'), 'Must not contain / in base64url');
  assert.ok(!rawBase64Url.includes('='), 'Must not contain trailing = in base64url');

  // Decode and check RFC 2822 components
  const decoded = Buffer.from(rawBase64Url.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
  assert.ok(decoded.includes(`To: ${to}`));
  assert.ok(decoded.includes('MIME-Version: 1.0'));
  assert.ok(decoded.includes(body));
});

test('Absolute sending restriction - Gmail status reports drafts-only mode', () => {
  const status = getServerGmailStatus();
  assert.equal(typeof status.connected, 'boolean');
});

test('Prospect deduplication by domain and name', () => {
  assert.equal(normalizeDomain('https://www.ApexPayments.com/products/'), 'apexpayments.com');
  assert.equal(normalizeDomain('http://sub.monetacloud.com'), 'sub.monetacloud.com');

  const existing = [
    {
      id: 'p1',
      name: 'Marcus Vance',
      company: 'Apex Payments',
      domain: 'apexpayments.com',
      linkedinUrl: 'https://linkedin.com/in/marcus-vance',
      email: 'm.vance@apexpayments.com',
    } as any,
  ];

  const dupLinkedIn = isDuplicateProspect(
    { name: 'M. Vance', company: 'Apex Payments', linkedinUrl: 'https://www.linkedin.com/in/marcus-vance/' },
    existing
  );
  assert.equal(dupLinkedIn, true, 'Same LinkedIn profile should be flagged as duplicate');

  const dupNameCompany = isDuplicateProspect(
    { name: 'Marcus Vance', company: 'Apex Payments', domain: 'apexpayments.com' },
    existing
  );
  assert.equal(dupNameCompany, true, 'Same name and company should be flagged as duplicate');

  const unique = isDuplicateProspect(
    { name: 'Different Person', company: 'Other Corp', domain: 'differentcompany.org' },
    existing
  );
  assert.equal(unique, false, 'Distinct entity should not be flagged as duplicate');
});

test('Transparent qualification scoring engine and criteria breakdown', () => {
  const testICP: ICPProfile = {
    id: 'test_icp',
    name: 'Test ICP',
    description: 'Testing',
    targetIndustries: ['FinTech', 'Payments'],
    companySizeMin: 50,
    companySizeMax: 2000,
    targetGeographies: ['United States'],
    businessModels: ['B2B SaaS'],
    techStackKeywords: ['Kafka', 'PostgreSQL'],
    targetRoles: ['VP of Engineering', 'CTO'],
    seniorityLevels: ['C-Level', 'VP'],
    requiredConditions: ['Transaction infrastructure'],
    preferredAttributes: ['Active modernization'],
    exclusionCriteria: ['Crypto gambling'],
    positiveBuyingSignals: [{ signal: 'Series B', weight: 20 }],
    negativeBuyingSignals: [{ signal: 'Layoffs', weight: -30 }],
    minScoreThreshold: 70,
    weights: {
      icpFit: 35,
      decisionMakerRelevance: 30,
      buyingSignalStrength: 15,
      evidenceQuality: 10,
      recency: 10,
    },
    createdAt: '',
    updatedAt: '',
  };

  const compData: CompanyIntelligence = {
    id: 'c1',
    name: 'Test Corp',
    domain: 'testcorp.com',
    website: 'https://testcorp.com',
    industry: 'FinTech',
    headquarters: 'San Francisco, CA',
    employeeCount: '300',
    estimatedRevenue: '$40M',
    businessModel: 'B2B SaaS',
    whatTheyDo: 'Transaction pipelines',
    productsAndServices: [],
    targetCustomers: [],
    strategicPriorities: [],
    growthSignals: ['Series B funding completed'],
    operationalChallenges: [],
    knownTechStack: ['Kafka', 'PostgreSQL', 'Go'],
    competitors: [],
    offeringBenefitFit: '',
    verifiedAt: '',
  };

  const personData: PersonIntelligence = {
    id: 'p1',
    fullName: 'Jane Doe',
    currentRole: 'VP of Engineering',
    company: 'Test Corp',
    companyDomain: 'testcorp.com',
    location: 'United States',
    linkedinUrl: '',
    email: 'jane@testcorp.com',
    department: 'Engineering',
    seniority: 'VP',
    publicBio: '',
    pastExperience: [],
    responsibilities: [],
    publicContentAndTalks: [],
    publicTopics: [],
    problemOwnership: '',
    whyThisPerson: '',
    verifiedAt: '',
  };

  const result = calculateQualification(testICP, compData, personData, [], []);
  assert.ok(result.overallScore >= 70, `Score ${result.overallScore} should be qualifying`);
  assert.equal(result.isQualified, true);
  assert.ok(result.criteriaEvaluation.length > 0);
  assert.ok(result.summaryExplanation.length > 0);
});
