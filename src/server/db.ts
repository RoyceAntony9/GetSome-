import fs from 'fs';
import path from 'path';
import {
  ICPProfile,
  Campaign,
  Prospect,
  ResearchJob,
  AISettings,
  OutreachDraft,
  ChatSession,
  LinkedInTemplateVersion,
  UnifiedProspectStatus,
} from '../types/index';
import { CANONICAL_LINKEDIN_TEMPLATE, assembleLinkedInMessage } from '../constants/linkedinTemplate';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface DatabaseSchema {
  icps: ICPProfile[];
  campaigns: Campaign[];
  prospects: Prospect[];
  jobs: ResearchJob[];
  settings: AISettings;
  chats: ChatSession[];
  linkedinTemplates?: LinkedInTemplateVersion[];
}

const DEFAULT_SETTINGS: AISettings = {
  activeProvider: 'native' as any,
  geminiModel: '',
  ollamaEndpoint: 'http://localhost:11434',
  ollamaModel: 'llama3:8b',
  taskModels: {
    queryGeneration: 'deterministic',
    reasoningAndQual: 'deterministic',
    outreachWriting: 'deterministic',
  },
  researchDepth: 'deep_investigative',
  rateLimitPerMinute: 60,
  usage: {
    promptTokens: 45200,
    completionTokens: 19800,
    totalRuns: 38,
    estimatedCostUsd: 0.0,
  },
};

const SEED_ICPS: ICPProfile[] = [
  {
    id: 'icp_fintech_enterprise',
    name: 'Enterprise FinTech & Payments Infrastructure',
    description: 'B2B FinTech, payments, and digital banking platforms scaling high-throughput distributed transaction engines.',
    targetIndustries: ['FinTech', 'Financial Services', 'Banking Technology', 'Payments'],
    companySizeMin: 150,
    companySizeMax: 3000,
    targetGeographies: ['North America', 'United States', 'United Kingdom', 'European Union'],
    businessModels: ['B2B SaaS', 'Enterprise Infrastructure', 'API Platform'],
    techStackKeywords: ['Kafka', 'Kubernetes', 'PostgreSQL', 'Go', 'Distributed Systems'],
    targetRoles: ['VP of Engineering', 'Head of Infrastructure', 'CTO', 'Chief Technology Officer', 'Head of AI Engineering'],
    seniorityLevels: ['C-Level', 'VP', 'Head'],
    requiredConditions: [
      'Operates mission-critical transaction or payment reconciliation pipelines',
      'Has dedicated engineering/infrastructure organization',
    ],
    preferredAttributes: [
      'Active cloud modernization or microservices re-architecture',
      'Actively adopting real-time streaming or AI-assisted fraud detection',
    ],
    exclusionCriteria: [
      'Crypto token gambling or unregulated ICOs',
      'Predatory payday lending',
      'Sub-50 employee early prototypes',
    ],
    positiveBuyingSignals: [
      { signal: 'Hiring distributed systems or AI leadership', weight: 25 },
      { signal: 'Recent growth funding (Series B/C/D)', weight: 20 },
      { signal: 'Public announcements regarding latency or cloud migration', weight: 15 },
    ],
    negativeBuyingSignals: [
      { signal: 'Significant headcount contraction / layoffs', weight: -30 },
      { signal: 'Leadership turmoil in engineering', weight: -20 },
    ],
    minScoreThreshold: 70,
    weights: {
      icpFit: 35,
      decisionMakerRelevance: 30,
      buyingSignalStrength: 15,
      evidenceQuality: 10,
      recency: 10,
    },
    createdAt: '2026-10-01T09:00:00Z',
    updatedAt: '2026-10-23T08:00:00Z',
  },
  {
    id: 'icp_healthtech_ai',
    name: 'Clinical HealthTech & Healthcare Data Platforms',
    description: 'Healthcare software vendors, EHR interoperability platforms, and diagnostic AI providers with HIPAA compliance.',
    targetIndustries: ['HealthTech', 'Digital Health', 'Healthcare IT', 'Biotechnology'],
    companySizeMin: 100,
    companySizeMax: 1500,
    targetGeographies: ['North America', 'United States'],
    businessModels: ['B2B SaaS', 'Enterprise Health'],
    techStackKeywords: ['FHIR', 'HL7', 'Python', 'AWS GovCloud', 'Snowflake'],
    targetRoles: ['Chief Technology Officer', 'VP of Product', 'VP of Engineering', 'Chief Medical Information Officer'],
    seniorityLevels: ['C-Level', 'VP'],
    requiredConditions: ['HIPAA compliant cloud deployment or clinical data integration'],
    preferredAttributes: ['Expanding clinical decision support or agentic documentation'],
    exclusionCriteria: ['D2C fitness supplement ecommerce', 'Non-HIPAA consumer apps'],
    positiveBuyingSignals: [
      { signal: 'New clinical hospital system partnership', weight: 30 },
      { signal: 'FDA clearance or clinical pilot announcement', weight: 25 },
    ],
    negativeBuyingSignals: [
      { signal: 'Regulatory compliance warning letter', weight: -40 },
    ],
    minScoreThreshold: 72,
    weights: {
      icpFit: 40,
      decisionMakerRelevance: 25,
      buyingSignalStrength: 15,
      evidenceQuality: 10,
      recency: 10,
    },
    createdAt: '2026-10-05T14:30:00Z',
    updatedAt: '2026-10-23T08:30:00Z',
  },
];

const SEED_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp_fintech_q4_2026',
    name: 'FinTech Modernization & Streaming Infrastructure Q4',
    icpId: 'icp_fintech_enterprise',
    objective: 'Partner with enterprise FinTech engineering leadership to audit and modernize real-time settlement & agentic transaction pipelines.',
    offeringProposition: 'High-reliability distributed streaming architecture, zero-downtime database migration, and sub-10ms transactional verification engines.',
    targetGeography: ['United States', 'United Kingdom'],
    targetIndustries: ['FinTech', 'Banking Technology'],
    targetRoles: ['VP of Engineering', 'Head of Infrastructure', 'CTO'],
    exclusions: ['Crypto gambling', 'Micro-lenders'],
    tonePreference: 'Direct & Technical',
    channels: ['linkedin_connect', 'linkedin_inmail', 'email', 'followup'],
    maxDiscoveryVolume: 25,
    researchDepth: 'deep_investigative',
    qualificationThreshold: 70,
    status: 'active',
    createdAt: '2026-10-10T10:00:00Z',
    updatedAt: '2026-10-23T09:00:00Z',
  },
  {
    id: 'camp_healthtech_interop',
    name: 'Clinical Interoperability & Agentic EHR Workflows',
    icpId: 'icp_healthtech_ai',
    objective: 'Engage clinical technology leaders facing FHIR/HL7 interoperability deadlocks and AI chart synthesis latency.',
    offeringProposition: 'Certified FHIR streaming integration layer with privacy-preserving local LLM chart extraction.',
    targetGeography: ['United States'],
    targetIndustries: ['HealthTech', 'Digital Health'],
    targetRoles: ['CTO', 'VP of Engineering'],
    exclusions: ['D2C fitness'],
    tonePreference: 'Consultative & Inquisitive',
    channels: ['linkedin_connect', 'email'],
    maxDiscoveryVolume: 15,
    researchDepth: 'standard',
    qualificationThreshold: 72,
    status: 'active',
    createdAt: '2026-10-15T11:00:00Z',
    updatedAt: '2026-10-22T16:00:00Z',
  },
];

const SEED_PROSPECTS: Prospect[] = [
  {
    id: 'prospect_apex_marcus',
    campaignId: 'camp_fintech_q4_2026',
    icpId: 'icp_fintech_enterprise',
    name: 'Marcus Vance',
    role: 'VP of Engineering',
    company: 'Apex Payments Inc',
    domain: 'apexpayments.com',
    location: 'New York, NY, United States',
    linkedinUrl: 'https://linkedin.com/in/marcus-vance-apex',
    email: 'm.vance@apexpayments.com',
    stage: 'ready_for_review',
    discoverySource: 'Signal-driven discovery (Verified Series C + Lead Eng hiring)',
    discoveryTimestamp: '2026-10-21T14:15:00Z',
    verified: true,
    fitScore: 88,
    buyingSignalScore: 92,
    confidenceScore: 94,
    companyData: {
      id: 'comp_apex',
      name: 'Apex Payments Inc',
      domain: 'apexpayments.com',
      website: 'https://apexpayments.com',
      industry: 'FinTech / Payments Infrastructure',
      headquarters: 'New York, NY',
      employeeCount: '480',
      estimatedRevenue: '$72M ARR',
      businessModel: 'B2B Enterprise SaaS & Processing API',
      whatTheyDo: 'Global payment gateway and multi-currency reconciliation engine processing over $5.2B in annualized transaction volume.',
      productsAndServices: [
        'Apex Global Gateway',
        'Apex Real-Time Settlement Hub',
        'Automated Chargeback Defense',
      ],
      targetCustomers: ['Enterprise Marketplaces', 'SaaS Platforms', 'Cross-border B2B Vendors'],
      strategicPriorities: [
        'Migrating core reconciliation from nightly batch to sub-second streaming',
        'Expanding engineering hub in Austin and New York',
        'Achieving sub-15ms p99 authorization latencies across EMEA routes',
      ],
      growthSignals: [
        'Announced $45M Series C expansion round led by Accel in August 2026',
        'Active job requisitions for Principal Distributed Systems Engineers',
      ],
      operationalChallenges: [
        'Legacy Apache Kafka cluster maintenance overhead during flash traffic spikes',
        'Complex cross-border ledger reconciliation delays',
      ],
      knownTechStack: ['Kafka', 'Kubernetes', 'Go', 'PostgreSQL', 'Redis', 'AWS'],
      competitors: ['Stripe', 'Adyen', 'Checkout.com'],
      offeringBenefitFit: 'Eliminates reconciliation latency and automates streaming cluster re-balancing without database locking.',
      verifiedAt: '2026-10-21T14:22:00Z',
    },
    personData: {
      id: 'person_marcus',
      fullName: 'Marcus Vance',
      currentRole: 'VP of Engineering',
      company: 'Apex Payments Inc',
      companyDomain: 'apexpayments.com',
      location: 'New York, NY',
      linkedinUrl: 'https://linkedin.com/in/marcus-vance-apex',
      email: 'm.vance@apexpayments.com',
      department: 'Platform Engineering & Infrastructure',
      seniority: 'VP',
      publicBio: 'Engineering executive with 14+ years building ultra-low-latency transaction systems. Previously Director of Core Payments at Block/Square.',
      pastExperience: [
        'Director of Platform Architecture at Block (2020 - 2024)',
        'Staff Infrastructure Engineer at Bloomberg LP (2015 - 2020)',
      ],
      responsibilities: [
        'Direct leadership of 65 platform and distributed systems engineers',
        'Architecture roadmap for core transaction settlement pipeline',
        'Infrastructure budget and vendor procurement authority',
      ],
      publicContentAndTalks: [
        {
          title: 'Architecting for Zero Packet Loss in High-Volume Settlement',
          type: 'talk',
          url: 'https://qconnewyork.com/speakers/marcus-vance-2026',
          date: '2026-06-18',
          excerpt: 'Marcus emphasized that transactional settlement should be treated as an immutable append-only event stream, but noted that off-the-shelf Kafka clusters hit operational walls when ledger partition skew occurs.',
        },
        {
          title: 'The Hidden Tax of Batch Reconciliation',
          type: 'article',
          url: 'https://medium.com/@marcusvance_eng/batch-reconciliation-tax-8812',
          date: '2026-04-05',
          excerpt: 'Nightly batch settlement creates a multi-million-dollar collateral float risk for high-growth merchants. Streaming reconciliation is the only durable fix.',
        },
      ],
      publicTopics: ['Event Streaming', 'Zero-Downtime Migration', 'Ledger Integrity', 'Distributed Systems'],
      problemOwnership: 'Primary executive owner of the settlement engine and transactional infrastructure.',
      whyThisPerson: 'Marcus publicly identified ledger partition skew and batch latency as his team’s primary technical bottleneck, and he holds the budget and sign-off authority for platform engineering.',
      verifiedAt: '2026-10-21T14:28:00Z',
    },
    industryData: {
      industry: 'Global FinTech & Merchant Payments',
      keyTrends: [
        'Mandatory ISO 20022 real-time settlement messaging adoption across global clearinghouses',
        'Enterprise merchants demanding instant cross-currency payout capabilities',
      ],
      competitivePressures: [
        'Margin compression on commodity interchange fees forcing platforms into higher-margin ledger software services',
      ],
      regulatoryOrTechShifts: [
        'CFPB 1033 open banking guidelines requiring strict sub-second data streaming APIs',
      ],
      implicationsForRole: 'VPs of Engineering must prove sub-50ms deterministic compliance while maintaining five-nines uptime.',
      sources: ['Federal Reserve FedNow Report 2026', 'Payments Dive Industry Analysis'],
    },
    claims: [
      {
        id: 'claim_1',
        claim: 'Apex Payments processes over $5.2B in annualized transaction volume across 1,200 merchants.',
        claimType: 'fact',
        sourceUrl: 'https://apexpayments.com/news/series-c-announcement',
        sourceTitle: 'Apex Payments Secures $45M Series C',
        publisher: 'Apex Payments Press Office',
        publishedDate: '2026-08-14',
        retrievedDate: '2026-10-21',
        excerpt: 'The funding will accelerate our real-time streaming engine, supporting over 1,200 enterprise merchants currently generating $5.2B in volume.',
        confidence: 'high',
        relevance: 'Confirms high transaction scale and production maturity.',
        potentialOutreachApplication: 'Grounding anchor acknowledging their genuine operating scale.',
      },
      {
        id: 'claim_2',
        claim: 'Marcus Vance personally led the architectural pivot away from nightly batch settlement toward continuous event streams.',
        claimType: 'fact',
        sourceUrl: 'https://qconnewyork.com/speakers/marcus-vance-2026',
        sourceTitle: 'QCon New York: Architecture Keynotes',
        publisher: 'QCon Conferences',
        publishedDate: '2026-06-18',
        retrievedDate: '2026-10-21',
        excerpt: 'Marcus Vance presented Apex Payments migration roadmap from legacy Postgres batch cronjobs to distributed stream processing.',
        confidence: 'high',
        relevance: 'Proves Marcus is the direct technical visionary and champion of this initiative.',
        potentialOutreachApplication: 'Essential hook: referencing his exact QCon talk on batch reconciliation tax.',
      },
      {
        id: 'claim_3',
        claim: 'Apex Payments is actively recruiting 6+ Senior and Principal Distributed Systems Engineers specializing in Go and Kafka.',
        claimType: 'fact',
        sourceUrl: 'https://apexpayments.com/careers',
        sourceTitle: 'Apex Careers Portal',
        publisher: 'Apex Payments Careers',
        publishedDate: '2026-10-10',
        retrievedDate: '2026-10-21',
        excerpt: 'Open Requisition: Principal Distributed Systems Engineer (Settlement Core) - Expertise in high-concurrency Go and Kafka partition tuning.',
        confidence: 'high',
        relevance: 'Active hiring signal confirming ongoing engineering investment in this exact domain.',
        potentialOutreachApplication: 'Buying trigger indicating team expansion in streaming infrastructure.',
      },
    ],
    signals: [
      {
        id: 'sig_apex_1',
        type: 'expansion',
        description: '$45M Series C funding announced in Q3 2026 dedicated to next-generation real-time settlement.',
        evidence: 'Official press release and TechCrunch coverage on August 14, 2026.',
        sourceUrl: 'https://apexpayments.com/news/series-c-announcement',
        date: '2026-08-14',
        confidence: 'high',
        relevanceToOffering: 'High capital budget available for mission-critical infrastructure modernizations.',
      },
      {
        id: 'sig_apex_2',
        type: 'hiring',
        description: 'Actively recruiting Principal Distributed Systems engineers for Settlement Core.',
        evidence: 'Open listings on official careers page for Go/Kafka platform roles.',
        sourceUrl: 'https://apexpayments.com/careers',
        date: '2026-10-10',
        confidence: 'high',
        relevanceToOffering: 'Validates active pipeline bottleneck and engineering urgency.',
      },
    ],
    qualification: {
      overallScore: 88,
      isQualified: true,
      dimensionScores: {
        icpFit: 92,
        decisionMakerRelevance: 95,
        buyingSignalStrength: 90,
        evidenceQuality: 94,
        recency: 90,
      },
      criteriaEvaluation: [
        {
          criterion: 'Target Industry (FinTech, Payments)',
          category: 'required',
          status: 'satisfied',
          evidenceNotes: 'Company is a verified B2B payments infrastructure provider with $5.2B volume.',
          sourceCitation: 'https://apexpayments.com/news/series-c-announcement',
        },
        {
          criterion: 'Company Size: 150–3000 employees',
          category: 'preferred',
          status: 'satisfied',
          evidenceNotes: 'Verified 480 employees across New York and Austin offices.',
        },
        {
          criterion: 'Target Role (VP of Engineering / CTO)',
          category: 'required',
          status: 'satisfied',
          evidenceNotes: 'Current title is VP of Engineering leading 65 infrastructure engineers.',
        },
        {
          criterion: 'Required: Mission-critical transaction pipelines',
          category: 'required',
          status: 'satisfied',
          evidenceNotes: 'Operates core payment gateway and settlement hub.',
        },
        {
          criterion: 'Exclusion Criteria Check',
          category: 'exclusion',
          status: 'satisfied',
          evidenceNotes: 'No crypto gambling or predatory lending affiliations detected.',
        },
        {
          criterion: 'Signal: Hiring engineering leadership & Series C capital',
          category: 'signal',
          status: 'satisfied',
          evidenceNotes: 'Recruiting Principal Distributed Engineers following $45M Series C.',
        },
      ],
      summaryExplanation: 'Exceptional strategic prospect (88/100). Marcus Vance has public technical ownership of the settlement streaming migration at Apex Payments ($5.2B volume), corroborated by his recent QCon address and active hiring for Go/Kafka platform engineers.',
      riskFactors: [],
    },
    drafts: [
      {
        id: 'draft_marcus_connect',
        prospectId: 'prospect_apex_marcus',
        channel: 'linkedin_connect',
        approach: 'insight_led',
        content: "Marcus — caught your QCon talk on the collateral float tax in batch reconciliation. We've been analyzing how high-throughput settlement teams eliminate partition skew without rewriting Kafka topology. Would be great to exchange technical notes.",
        characterCount: 247,
        maxAllowedCharacters: 300,
        isWithinLimit: true,
        angleExplanation: 'References his exact QCon talk concept ("batch reconciliation tax") to demonstrate immediate technical peer credibility.',
        supportingEvidence: 'QCon New York 2026 Keynote & Medium article on batch settlement tax.',
        whyRelevant: 'Directly validates the problem he spoke publicly about 4 months ago.',
        intendedTone: 'Peer-to-peer technical executive inquiry.',
        assumptionsFlagged: ['Assumes Apex is still running Apache Kafka for settlement ingestion.'],
        approvalStatus: 'approved',
        version: 1,
        history: [],
      },
      {
        id: 'draft_marcus_inmail',
        prospectId: 'prospect_apex_marcus',
        channel: 'linkedin_inmail',
        approach: 'problem_led',
        subjectLine: 'Partition skew in continuous settlement streams',
        content: `Marcus,

Your point at QCon regarding the collateral float risk inherent to nightly batch settlement resonated strongly—especially for platforms managing multi-billion dollar annualized velocity like Apex.

As your team expands the Settlement Core group following the Series C, many engineering leaders encounter a tricky inflection point: streaming append-only ledgers solve reconciliation latency, but unmanaged Kafka partition skew during merchant flash surges can stall downstream consumers.

We built an adaptive streaming verification layer that maintains deterministic sub-15ms settlement ordering under sudden volume spikes without taking on heavy custom consumer rebalancing logic.

Are you open to a brief 15-minute technical exchange next Thursday on how other payments infrastructure teams have isolated partition hotspots?

Best,
Alex`,
        characterCount: 846,
        maxAllowedCharacters: 1900,
        isWithinLimit: true,
        angleExplanation: 'Focuses on the operational friction of Kafka partition skew under traffic spikes, directly relevant to his hiring priorities.',
        supportingEvidence: 'QCon talk transcript and current career posting for Principal Distributed Systems Engineer.',
        whyRelevant: 'Connects his specific public diagnosis of the problem to an engineering solution.',
        intendedTone: 'Authoritative, respectful, technically grounded.',
        assumptionsFlagged: ['Assumes partition skew remains a bottleneck during flash traffic spikes.'],
        approvalStatus: 'pending_review',
        version: 1,
        history: [],
      },
      {
        id: 'draft_marcus_email',
        prospectId: 'prospect_apex_marcus',
        channel: 'email',
        approach: 'curiosity_led',
        subjectLine: 'Continuous settlement at Apex: partition skew benchmark',
        content: `Hi Marcus,

I read your recent breakdown on the hidden tax of batch reconciliation and noticed Apex is actively staffing the Settlement Core engineering team in New York.

When platforms transition from batch cronjobs to sub-second streaming reconciliation at the $5B+ scale, the primary headache is rarely ingestion—it is preventing partition skew from triggering collateral discrepancies across multi-currency merchant balances.

I'd be curious to learn: as you scale the new streaming ledger, are you leaning toward deterministic state-store buffering (like RocksDB on event brokers) or external coordinator locks?

We recently benchmarked sub-15ms reconciliation patterns for enterprise settlement pipelines and compiled the latency trade-offs into a short architecture briefing.

Would you be interested if I forwarded the 3-page technical brief for you and your platform staff to review?

Best regards,
Alex Mercer`,
        characterCount: 914,
        maxAllowedCharacters: 2200,
        isWithinLimit: true,
        angleExplanation: 'Curiosity-led question addressing the exact architecture choice (RocksDB state stores vs coordinator locks) that an engineering VP evaluates.',
        supportingEvidence: 'Marcus Vance Medium post and verified careers page.',
        whyRelevant: 'Offers immediate, zero-friction technical value (3-page brief) rather than an aggressive sales pitch.',
        intendedTone: 'Strategic, consultative, collegial.',
        assumptionsFlagged: ['Assumes engineering team is evaluating local state store options.'],
        approvalStatus: 'pending_review',
        version: 1,
        history: [],
      },
    ],
    selectedDraftId: 'draft_marcus_connect',
    outreachStatus: 'approved',
    activityLog: [
      {
        timestamp: '2026-10-21T14:15:00Z',
        action: 'Prospect Discovered',
        details: 'Identified via Signal-Driven Discovery (Series C announcement + Go/Kafka job requisitions).',
        actor: 'system',
      },
      {
        timestamp: '2026-10-21T14:28:00Z',
        action: 'Multi-Stage Research Completed',
        details: 'Stages A-F completed with 3 primary sources cited. Fit score: 88/100.',
        actor: 'system',
      },
      {
        timestamp: '2026-10-22T09:14:00Z',
        action: 'Draft Approved',
        details: 'User reviewed and approved LinkedIn Connection note (Insight-led angle).',
        actor: 'user',
      },
    ],
    createdAt: '2026-10-21T14:15:00Z',
    updatedAt: '2026-10-22T09:14:00Z',
  },
  {
    id: 'prospect_novatax_elena',
    campaignId: 'camp_fintech_q4_2026',
    icpId: 'icp_fintech_enterprise',
    name: 'Elena Rostova',
    role: 'Chief Technology Officer',
    company: 'NovaTax Cloud',
    domain: 'novataxcloud.io',
    location: 'London, United Kingdom',
    linkedinUrl: 'https://linkedin.com/in/elena-rostova-novatax',
    email: 'elena.rostova@novataxcloud.io',
    stage: 'ready_for_review',
    discoverySource: 'ICP-Driven Discovery (UK Enterprise Tax Compliance)',
    discoveryTimestamp: '2026-10-22T10:10:00Z',
    verified: true,
    fitScore: 84,
    buyingSignalScore: 78,
    confidenceScore: 91,
    companyData: {
      id: 'comp_novatax',
      name: 'NovaTax Cloud',
      domain: 'novataxcloud.io',
      website: 'https://novataxcloud.io',
      industry: 'FinTech / RegTech & Corporate Tax',
      headquarters: 'London, UK',
      employeeCount: '210',
      estimatedRevenue: '$28M ARR',
      businessModel: 'B2B Enterprise SaaS',
      whatTheyDo: 'Automated VAT and cross-border digital services tax calculation platform for multinational ecommerce platforms.',
      productsAndServices: [
        'NovaTax Global Engine',
        'Real-time Invoice Validation API',
        'Audit-ready Ledger Export',
      ],
      targetCustomers: ['Enterprise Marketplaces', 'Cross-border Retailers', 'Tier-2 European Banks'],
      strategicPriorities: [
        'Preparing for EU ViDA (VAT in the Digital Age) continuous real-time reporting mandates',
        'Scaling multi-region database replication across UK and EU AWS zones',
      ],
      growthSignals: [
        'Expanded European enterprise customer base by 64% year-over-year',
        'Certified as PEPPOL e-invoicing access point in 6 member states',
      ],
      operationalChallenges: [
        'Heavy latency penalty during end-of-quarter invoice reconciliation runs',
      ],
      knownTechStack: ['PostgreSQL', 'TypeScript', 'Node.js', 'Redis', 'AWS'],
      competitors: ['Avalara', 'Vertex', 'Taxjar'],
      offeringBenefitFit: 'Accelerates tax invoice calculation pipelines to under 8ms with zero multi-region replication lag.',
      verifiedAt: '2026-10-22T10:15:00Z',
    },
    personData: {
      id: 'person_elena',
      fullName: 'Elena Rostova',
      currentRole: 'Chief Technology Officer',
      company: 'NovaTax Cloud',
      companyDomain: 'novataxcloud.io',
      location: 'London, UK',
      linkedinUrl: 'https://linkedin.com/in/elena-rostova-novatax',
      email: 'elena.rostova@novataxcloud.io',
      department: 'Technology & Security',
      seniority: 'C-Level',
      publicBio: 'CTO specializing in high-security regulatory compliance, distributed ledger consistency, and fault-tolerant billing systems.',
      pastExperience: [
        'VP of Engineering at GoCardless (2018 - 2023)',
        'Senior Software Architect at Barclays UK (2014 - 2018)',
      ],
      responsibilities: [
        'Overall technology vision, architecture, and regulatory compliance posture',
        'Direct leadership of engineering, data platform, and DevSecOps teams',
      ],
      publicContentAndTalks: [
        {
          title: 'Surviving Continuous Transaction Controls Under EU ViDA',
          type: 'article',
          url: 'https://techuk.org/insights/surviving-vida-tax-engineering',
          date: '2026-07-22',
          excerpt: 'Elena wrote that the upcoming ViDA mandate turns tax from an asynchronous filing process into an synchronous latency gating factor in every online shopping checkout.',
        },
      ],
      publicTopics: ['ViDA Compliance', 'E-Invoicing APIs', 'Database Replication', 'Zero Trust Architecture'],
      problemOwnership: 'Holds complete architectural and vendor sign-off for billing calculation engines.',
      whyThisPerson: 'Elena authoritatively cited checkout latency as the greatest risk when adopting ViDA synchronous tax validation.',
      verifiedAt: '2026-10-22T10:20:00Z',
    },
    industryData: {
      industry: 'RegTech / European Corporate Tax',
      keyTrends: [
        'European Union ViDA directives requiring real-time digital reporting for cross-border transactions',
        'Shift toward mandatory B2B e-invoicing across France, Germany, and Spain',
      ],
      competitivePressures: [
        'Traditional ERP vendors struggling to deliver sub-100ms tax calculation at POS checkout',
      ],
      regulatoryOrTechShifts: [
        'Real-time tax calculation becoming mission-critical checkout path',
      ],
      implicationsForRole: 'CTOs must guarantee sub-50ms API response times without risking calculation inaccuracies.',
      sources: ['European Commission ViDA Implementation Whitepaper 2026'],
    },
    claims: [
      {
        id: 'claim_nova_1',
        claim: 'NovaTax Cloud serves over 200 European enterprise merchants with $28M ARR.',
        claimType: 'fact',
        sourceUrl: 'https://novataxcloud.io/company',
        sourceTitle: 'NovaTax Company Background',
        publisher: 'NovaTax Cloud',
        publishedDate: '2026-09-01',
        retrievedDate: '2026-10-22',
        excerpt: 'NovaTax handles tax calculation for enterprise merchants processing across 27 EU member states.',
        confidence: 'high',
        relevance: 'Verifies ICP size and customer density.',
        potentialOutreachApplication: 'Credibility context.',
      },
      {
        id: 'claim_nova_2',
        claim: 'Elena Rostova published an analysis on checkout latency penalties under EU ViDA mandates.',
        claimType: 'fact',
        sourceUrl: 'https://techuk.org/insights/surviving-vida-tax-engineering',
        sourceTitle: 'Surviving Continuous Transaction Controls',
        publisher: 'techUK Insights',
        publishedDate: '2026-07-22',
        retrievedDate: '2026-10-22',
        excerpt: 'Synchronous tax verification cannot exceed 20ms without directly impacting cart conversion rates.',
        confidence: 'high',
        relevance: 'Direct validation of their latency bottleneck.',
        potentialOutreachApplication: 'Core personalization angle on checkout latency.',
      },
    ],
    signals: [
      {
        id: 'sig_nova_1',
        type: 'regulatory_pressure',
        description: 'EU ViDA compliance enforcement timeline approaching for European clients.',
        evidence: 'techUK published article authored by Elena Rostova.',
        sourceUrl: 'https://techuk.org/insights/surviving-vida-tax-engineering',
        date: '2026-07-22',
        confidence: 'high',
        relevanceToOffering: 'High urgency to optimize real-time invoice calculation pipelines.',
      },
    ],
    qualification: {
      overallScore: 84,
      isQualified: true,
      dimensionScores: {
        icpFit: 88,
        decisionMakerRelevance: 95,
        buyingSignalStrength: 82,
        evidenceQuality: 90,
        recency: 85,
      },
      criteriaEvaluation: [
        {
          criterion: 'Target Industry (FinTech / RegTech)',
          category: 'required',
          status: 'satisfied',
          evidenceNotes: 'Enterprise tax engine for European ecommerce.',
        },
        {
          criterion: 'Company Size: 150–3000 employees',
          category: 'preferred',
          status: 'satisfied',
          evidenceNotes: '210 employees within target range.',
        },
        {
          criterion: 'Target Role (CTO)',
          category: 'required',
          status: 'satisfied',
          evidenceNotes: 'CTO with end-to-end architecture authority.',
        },
        {
          criterion: 'Signal: ViDA Regulatory Enforcement',
          category: 'signal',
          status: 'satisfied',
          evidenceNotes: 'Published analysis on ViDA checkout latency risks.',
          sourceCitation: 'https://techuk.org/insights/surviving-vida-tax-engineering',
        },
      ],
      summaryExplanation: 'Strong qualified opportunity (84/100). Elena Rostova is the primary architectural decision-maker at NovaTax Cloud, and her recent techUK paper identifies checkout calculation latency under ViDA as an immediate priority.',
      riskFactors: [],
    },
    drafts: [
      {
        id: 'draft_elena_email',
        prospectId: 'prospect_novatax_elena',
        channel: 'email',
        approach: 'problem_led',
        subjectLine: 'ViDA synchronous validation: sub-10ms invoice calculations',
        content: `Hi Elena,

Your techUK piece on avoiding checkout friction under upcoming EU ViDA mandates was spot on—particularly the point that synchronous invoice verification cannot exceed 20ms without hurting merchant cart conversion.

Many cross-border billing engines struggle when complex VAT rule matrices must be evaluated against real-time shopping cart line items across multiple jurisdictions.

We built a compiled rule-evaluation runtime that computes multi-state European VAT trees in under 6ms, even under heavy end-of-month invoice spikes.

Given NovaTax’s European expansion, would you be open to comparing benchmarks on how we isolate multi-region latency overhead?

Best regards,
Alex Mercer`,
        characterCount: 686,
        maxAllowedCharacters: 2200,
        isWithinLimit: true,
        angleExplanation: 'Directly addresses the 20ms cart conversion threshold she cited in her published techUK paper.',
        supportingEvidence: 'techUK article: Surviving Continuous Transaction Controls (July 2026).',
        whyRelevant: 'Directly matches her technical focus without offering empty compliments.',
        intendedTone: 'Executive, technical, solution-oriented.',
        assumptionsFlagged: ['Assumes NovaTax is currently evaluating sub-20ms calculation runtimes.'],
        approvalStatus: 'pending_review',
        version: 1,
        history: [],
      },
      {
        id: 'draft_elena_connect',
        prospectId: 'prospect_novatax_elena',
        channel: 'linkedin_connect',
        approach: 'insight_led',
        content: "Elena — read your techUK article on ViDA continuous controls. Your point about synchronous tax becoming a checkout latency bottleneck is spot on. We've been bench-testing sub-8ms rule runtimes across EU nodes. Would love to connect.",
        characterCount: 238,
        maxAllowedCharacters: 300,
        isWithinLimit: true,
        angleExplanation: 'Mentions her exact techUK article on ViDA continuous controls.',
        supportingEvidence: 'techUK article (July 2026).',
        whyRelevant: 'Immediate authentic peer connection.',
        intendedTone: 'Respectful, technical.',
        assumptionsFlagged: [],
        approvalStatus: 'pending_review',
        version: 1,
        history: [],
      },
    ],
    selectedDraftId: 'draft_elena_email',
    outreachStatus: 'draft_ready',
    activityLog: [
      {
        timestamp: '2026-10-22T10:10:00Z',
        action: 'Prospect Discovered',
        details: 'Identified via ICP-driven discovery for UK RegTech & Tax Infrastructure.',
        actor: 'system',
      },
      {
        timestamp: '2026-10-22T10:25:00Z',
        action: 'Multi-Stage Research Completed',
        details: 'Stages A-F completed with 2 primary sources cited. Fit score: 84/100.',
        actor: 'system',
      },
    ],
    createdAt: '2026-10-22T10:10:00Z',
    updatedAt: '2026-10-22T10:25:00Z',
  },
  {
    id: 'prospect_synapse_devon',
    campaignId: 'camp_healthtech_interop',
    icpId: 'icp_healthtech_ai',
    name: 'Dr. Devon Patel',
    role: 'Chief Technology Officer',
    company: 'Synapse Clinical Health',
    domain: 'synapsehealth.co',
    location: 'Boston, MA, United States',
    linkedinUrl: 'https://linkedin.com/in/devon-patel-synapse',
    email: 'd.patel@synapsehealth.co',
    stage: 'ready_for_review',
    discoverySource: 'Company-First Discovery (Hospital EHR Integration)',
    discoveryTimestamp: '2026-10-22T15:00:00Z',
    verified: true,
    fitScore: 86,
    buyingSignalScore: 85,
    confidenceScore: 92,
    companyData: {
      id: 'comp_synapse',
      name: 'Synapse Clinical Health',
      domain: 'synapsehealth.co',
      website: 'https://synapsehealth.co',
      industry: 'HealthTech / Clinical Decision Support',
      headquarters: 'Boston, MA',
      employeeCount: '175',
      estimatedRevenue: '$22M ARR',
      businessModel: 'B2B Enterprise Health SaaS',
      whatTheyDo: 'AI-assisted clinical trial matching and EHR interoperability platform integrated across 40+ acute care hospital systems.',
      productsAndServices: [
        'Synapse Interop Gateway',
        'Clinical Trial TrialFinder AI',
        'FHIR Resource Normalizer',
      ],
      targetCustomers: ['Academic Medical Centers', 'Health Systems', 'Clinical Research Networks'],
      strategicPriorities: [
        'Scaling FHIR Bulk Data export ingestion pipelines',
        'Ensuring zero patient-identifiable data leakage in generative chart summaries',
      ],
      growthSignals: [
        'Signed 3-year health system partnership with Mass General Brigham affiliate network',
      ],
      operationalChallenges: [
        'Heterogeneous HL7 v2 and FHIR R4 schema variations across hospital sites causing ingestion backlogs',
      ],
      knownTechStack: ['Python', 'FHIR', 'PostgreSQL', 'AWS HealthLake', 'Docker'],
      competitors: ['Redox Engine', 'Datavant', 'Particle Health'],
      offeringBenefitFit: 'Automates asynchronous FHIR schema normalization with strict HIPAA-compliant tokenization.',
      verifiedAt: '2026-10-22T15:05:00Z',
    },
    personData: {
      id: 'person_devon',
      fullName: 'Dr. Devon Patel',
      currentRole: 'Chief Technology Officer',
      company: 'Synapse Clinical Health',
      companyDomain: 'synapsehealth.co',
      location: 'Boston, MA',
      linkedinUrl: 'https://linkedin.com/in/devon-patel-synapse',
      email: 'd.patel@synapsehealth.co',
      department: 'Technology & Clinical Informatics',
      seniority: 'C-Level',
      publicBio: 'Physician-technologist (MD/MS Bioinformatics). Passionate about breaking health data silos and real-time clinical data interoperability.',
      pastExperience: [
        'VP of Informatics at Beth Israel Deaconess (2019 - 2023)',
        'Clinical Data Architect at Verily (2016 - 2019)',
      ],
      responsibilities: [
        'Technical oversight of all EHR integrations and clinical ML models',
        'HIPAA security compliance officer',
      ],
      publicContentAndTalks: [
        {
          title: 'The Reality of FHIR Bulk Data Ingestion at Scale',
          type: 'talk',
          url: 'https://amialabs.org/conferences/2026/devon-patel',
          date: '2026-05-12',
          excerpt: 'Devon discussed how FHIR NDJSON streams choke relational databases when hospitals dump 10 million observation records overnight.',
        },
      ],
      publicTopics: ['FHIR Bulk Data', 'Clinical Interoperability', 'Bioinformatics', 'Data Privacy'],
      problemOwnership: 'Primary executive owner of hospital data integration architecture.',
      whyThisPerson: 'Dr. Patel directly authored their EHR ingestion roadmap and discussed NDJSON parsing bottlenecks at AMIA.',
      verifiedAt: '2026-10-22T15:10:00Z',
    },
    industryData: {
      industry: 'HealthTech & Clinical Interoperability',
      keyTrends: [
        'ONC HTI-1 & HTI-2 regulations mandating USCDI v3 FHIR interoperability standards',
        'Hospital CIOs demanding plug-and-play integrations without custom interface engine development',
      ],
      competitivePressures: [
        'Legacy EHR vendors charging high interface maintenance fees',
      ],
      regulatoryOrTechShifts: [
        'Mandatory FHIR Bulk Data compliance deadlines approaching',
      ],
      implicationsForRole: 'HealthTech CTOs must parse irregular clinical schemas while preserving patient record provenance.',
      sources: ['Health Affairs Tech Review 2026', 'ONC Standards Bulletin'],
    },
    claims: [
      {
        id: 'claim_synapse_1',
        claim: 'Synapse Clinical Health connects to 40+ acute care hospital systems across New England.',
        claimType: 'fact',
        sourceUrl: 'https://synapsehealth.co/network',
        sourceTitle: 'Synapse Clinical Network',
        publisher: 'Synapse Clinical Health',
        publishedDate: '2026-06-15',
        retrievedDate: '2026-10-22',
        excerpt: 'Now live across 40+ medical centers, querying millions of clinical encounters.',
        confidence: 'high',
        relevance: 'Verifies scale and provider integration footprint.',
        potentialOutreachApplication: 'Credibility grounding.',
      },
      {
        id: 'claim_synapse_2',
        claim: 'Dr. Devon Patel presented on FHIR NDJSON bulk ingestion bottlenecks at AMIA 2026.',
        claimType: 'fact',
        sourceUrl: 'https://amialabs.org/conferences/2026/devon-patel',
        sourceTitle: 'AMIA Annual Symposium 2026',
        publisher: 'AMIA Informatics',
        publishedDate: '2026-05-12',
        retrievedDate: '2026-10-22',
        excerpt: 'Dr. Devon Patel highlighted that standard Postgres setups choke on overnight FHIR Bulk observation streams.',
        confidence: 'high',
        relevance: 'Identifies exact technical pain point.',
        potentialOutreachApplication: 'Direct technical hook on bulk observation ingestion.',
      },
    ],
    signals: [
      {
        id: 'sig_synapse_1',
        type: 'expansion',
        description: 'New 3-year partnership signed with Mass General Brigham affiliate hospital network.',
        evidence: 'Boston Business Journal announcement on September 18, 2026.',
        sourceUrl: 'https://bizjournals.com/boston/news/2026/synapse-expansion',
        date: '2026-09-18',
        confidence: 'high',
        relevanceToOffering: 'Massive surge in hospital clinical data ingestion volume expected.',
      },
    ],
    qualification: {
      overallScore: 86,
      isQualified: true,
      dimensionScores: {
        icpFit: 90,
        decisionMakerRelevance: 95,
        buyingSignalStrength: 85,
        evidenceQuality: 92,
        recency: 88,
      },
      criteriaEvaluation: [
        {
          criterion: 'Target Industry (HealthTech, EHR Interoperability)',
          category: 'required',
          status: 'satisfied',
          evidenceNotes: 'Clinical trial matching and FHIR EHR gateway.',
        },
        {
          criterion: 'Company Size: 100–1500 employees',
          category: 'preferred',
          status: 'satisfied',
          evidenceNotes: '175 employees based in Boston.',
        },
        {
          criterion: 'Target Role (CTO)',
          category: 'required',
          status: 'satisfied',
          evidenceNotes: 'Physician-CTO leading clinical architecture.',
        },
        {
          criterion: 'Signal: Health system partnership expansion',
          category: 'signal',
          status: 'satisfied',
          evidenceNotes: 'Mass General Brigham network expansion.',
          sourceCitation: 'https://bizjournals.com/boston/news/2026/synapse-expansion',
        },
      ],
      summaryExplanation: 'High-conviction prospect (86/100). Dr. Devon Patel is uniquely qualified as both physician and CTO, with public documentation of FHIR bulk ingestion bottlenecks at AMIA 2026.',
      riskFactors: [],
    },
    drafts: [
      {
        id: 'draft_devon_email',
        prospectId: 'prospect_synapse_devon',
        channel: 'email',
        approach: 'insight_led',
        subjectLine: 'FHIR NDJSON streaming after your MGB expansion',
        content: `Hi Dr. Patel,

Caught your AMIA talk on the hidden pitfalls of parsing overnight FHIR Bulk Data dumps—particularly how relational schemas choke when tens of millions of observation resources land simultaneously.

With Synapse onboarding the Mass General Brigham affiliate network, ingestion spikes are presumably going to multiply across differing HL7 v2 and FHIR R4 dialects.

We engineered an asynchronous streaming validator that ingests NDJSON records directly into parquet-backed analytical partitions without locking transactional patient stores.

If you are exploring ways to isolate EHR ingestion latency as the partner network expands, would you be open to reviewing a short technical architecture memo?

Best regards,
Alex Mercer`,
        characterCount: 775,
        maxAllowedCharacters: 2200,
        isWithinLimit: true,
        angleExplanation: 'Directly connects his AMIA conference presentation to his company’s newest hospital network partnership.',
        supportingEvidence: 'AMIA 2026 conference talk on FHIR Bulk Ingestion & Boston Business Journal partnership announcement.',
        whyRelevant: 'Addresses the exact technical bottleneck he diagnosed in public.',
        intendedTone: 'Respectful, peer-to-peer technical inquiry.',
        assumptionsFlagged: ['Assumes Synapse uses relational stores for initial observation landing.'],
        approvalStatus: 'pending_review',
        version: 1,
        history: [],
      },
    ],
    selectedDraftId: 'draft_devon_email',
    outreachStatus: 'draft_ready',
    activityLog: [
      {
        timestamp: '2026-10-22T15:00:00Z',
        action: 'Prospect Discovered',
        details: 'Discovered through Company-First hospital network search.',
        actor: 'system',
      },
      {
        timestamp: '2026-10-22T15:15:00Z',
        action: 'Multi-Stage Research Completed',
        details: 'Stages A-F completed with 2 primary sources cited. Fit score: 86/100.',
        actor: 'system',
      },
    ],
    createdAt: '2026-10-22T15:00:00Z',
    updatedAt: '2026-10-22T15:15:00Z',
  },
];

const SEED_CHATS: ChatSession[] = [
  {
    id: 'chat_fintech_strategist',
    title: 'FinTech Angle & Objection Strategy',
    roleId: 'strategist',
    model: 'deterministic-intelligence',
    systemInstruction: 'You are an elite B2B sales development strategist for the GetSome prospecting platform. You advise on outreach strategies, evaluate prospect qualification against configured ICPs, critique message angles (insight-led, problem-led, curiosity-led), and suggest effective objection handling.',
    messages: [
      {
        id: 'msg_1',
        role: 'user',
        content: 'How should we approach Marcus Vance at Apex Payments regarding their Kafka partition skew challenges without sounding like a generic vendor?',
        timestamp: '2026-10-23T09:00:00Z',
      },
      {
        id: 'msg_2',
        role: 'model',
        content: `Marcus Vance is deeply technical (former Director at Block and author of the QCon keynote on the "collateral float tax in batch reconciliation").

To connect authentically as an engineering peer rather than a vendor:
1. **Lead with his specific diagnosis:** Reference his observation that off-the-shelf Kafka partitions skew when sudden merchant transaction bursts hit.
2. **Pose an architectural trade-off:** Ask whether his Settlement Core team is evaluating deterministic state-store buffering (RocksDB) or coordinator locks.
3. **Offer low-friction proof:** Offer to share our 3-page latency benchmark memo rather than requesting a demo call right away.

This positions your outreach as peer-to-peer technical exchange rather than a pitch.`,
        timestamp: '2026-10-23T09:00:15Z',
        modelUsed: 'deterministic-intelligence',
      },
    ],
    createdAt: '2026-10-23T08:50:00Z',
    updatedAt: '2026-10-23T09:00:15Z',
  },
  {
    id: 'chat_live_researcher',
    title: 'Live Market & Intelligence Scout',
    roleId: 'researcher',
    model: 'deterministic-intelligence',
    systemInstruction: 'You are an investigative business development researcher for GetSome. You leverage real-time Google Search data to discover recent company funding, leadership changes, regulatory directives, and technology migrations. Always cite specific sources with URLs.',
    messages: [
      {
        id: 'msg_res_1',
        role: 'user',
        content: 'Check for the latest regulatory compliance pressures affecting European corporate tax and payments in 2026.',
        timestamp: '2026-10-23T09:15:00Z',
      },
      {
        id: 'msg_res_2',
        role: 'model',
        content: `Based on live regulatory tracking and European Commission documentation:

1. **EU ViDA (VAT in the Digital Age):** The mandatory transition to real-time digital reporting for cross-border transactions is moving into high gear across member states. This turns tax calculation into a synchronous, sub-20ms checkout latency dependency.
2. **B2B E-Invoicing Mandates:** Continuous Transaction Controls (CTC) are rolling out across France, Germany, and Spain via PEPPOL-certified access points.
3. **Implications for CTOs:** Leaders like Elena Rostova at NovaTax Cloud must guarantee sub-50ms API response times without risking calculation inaccuracies.`,
        timestamp: '2026-10-23T09:15:20Z',
        modelUsed: 'deterministic-intelligence',
        groundingSources: [
          {
            title: 'European Commission ViDA Implementation Framework',
            url: 'https://taxation-customs.ec.europa.eu/vat-digital-age',
          },
          {
            title: 'techUK Insights: Surviving Continuous Transaction Controls',
            url: 'https://techuk.org/insights/surviving-vida-tax-engineering',
          },
        ],
      },
    ],
    createdAt: '2026-10-23T09:10:00Z',
    updatedAt: '2026-10-23T09:15:20Z',
  },
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);

        // Migrate prospects to include unifiedStatus, linkedinObservations, and gmailDraft
        const prospects: Prospect[] = (parsed.prospects || SEED_PROSPECTS).map((p: Prospect) => {
          let uStatus: UnifiedProspectStatus = p.unifiedStatus;
          if (!uStatus) {
            if (p.outreachStatus === 'sent_manually' || p.outreachStatus === 'replied') {
              uStatus = 'manually_sent';
            } else if (p.stage === 'ready_for_review' || p.stage === 'approved') {
              uStatus = 'ready_for_outreach';
            } else if (p.stage === 'rejected') {
              uStatus = 'rejected';
            } else if (['verifying', 'researching_company', 'researching_person', 'industry_analysis', 'qualifying', 'drafting'].includes(p.stage)) {
              uStatus = 'research_in_progress';
            } else {
              uStatus = 'discovered';
            }
          }

          // Populate canonical LinkedIn observation alternatives if missing
          let liOpts = p.linkedinObservations;
          if (!liOpts || liOpts.length === 0) {
            const firstName = p.name ? p.name.split(' ')[0] : 'there';
            const ind = (p.companyData?.industry || '').toLowerCase();
            let obsA = 'platform architecture, high-throughput systems, and operational scaling';
            let obsB = 'enterprise infrastructure, digital modernization, and developer velocity';
            let obsC = 'mission-critical cloud data pipelines, reliability engineering, and system resilience';

            if (ind.includes('health') || ind.includes('clinical') || ind.includes('bio')) {
              obsA = 'clinical health informatics, diagnostic AI, and regulatory compliance';
              obsB = 'healthcare data interoperability, patient care workflows, and enterprise health tech';
              obsC = 'HIPAA-compliant cloud architectures, clinical AI integration, and provider efficiency';
            } else if (ind.includes('fintech') || ind.includes('bank') || ind.includes('pay')) {
              obsA = 'distributed payment systems, transaction reconciliation, and financial engineering';
              obsB = 'fintech infrastructure, real-time streaming settlement, and regulatory compliance';
              obsC = 'low-latency distributed ledgers, transaction security, and cross-border payment rails';
            } else if (ind.includes('defence') || ind.includes('defense') || ind.includes('aero')) {
              obsA = 'defence innovation, emerging technology, and government acquisition';
              obsB = 'defence technology, commercialization, and public-sector procurement';
              obsC = 'connecting emerging defence capabilities with government acquisition and real-world deployment';
            }

            liOpts = [
              {
                id: `li_opt_${p.id}_0`,
                optionType: 'Option A — Direct',
                observation: obsA,
                completeMessage: assembleLinkedInMessage(firstName, obsA, CANONICAL_LINKEDIN_TEMPLATE),
                supportingEvidence: p.claims?.[0]?.claim || `${p.company} operations in ${p.companyData?.industry}`,
                sourcesUsed: [{ title: `${p.company} Official`, url: `https://${p.domain}` }],
                isSelected: true,
              },
              {
                id: `li_opt_${p.id}_1`,
                optionType: 'Option B — Strategic',
                observation: obsB,
                completeMessage: assembleLinkedInMessage(firstName, obsB, CANONICAL_LINKEDIN_TEMPLATE),
                supportingEvidence: p.companyData?.strategicPriorities?.[0] || 'Scaling core platform operations',
                sourcesUsed: [{ title: `${p.company} Strategy`, url: `https://${p.domain}` }],
                isSelected: false,
              },
              {
                id: `li_opt_${p.id}_2`,
                optionType: 'Option C — Distinctive',
                observation: obsC,
                completeMessage: assembleLinkedInMessage(firstName, obsC, CANONICAL_LINKEDIN_TEMPLATE),
                supportingEvidence: p.signals?.[0]?.description || 'Active modernization initiative',
                sourcesUsed: [{ title: `${p.company} Signals`, url: `https://${p.domain}` }],
                isSelected: false,
              },
            ];
          }

          // Populate Gmail draft if missing
          let gmailDraft = p.gmailDraft;
          if (!gmailDraft && p.email) {
            const firstName = p.name ? p.name.split(' ')[0] : 'there';
            gmailDraft = {
              recipientEmail: p.email,
              subject: `${p.company} / platform architecture & latency`,
              body: `Hi ${firstName},\n\nI noticed ${p.company}'s work in ${p.companyData?.industry || 'enterprise tech'} and your engineering team's focus on throughput.\n\nWhen scaling distributed systems, recurring partition hotspots often trigger latency bottlenecks across transaction pipelines.\n\nWe engineered an adaptive streaming verification layer to isolate hotspots without requiring topology rewrites.\n\nWould you be open to comparing benchmarks on how peer engineering teams have addressed this?\n\nBest regards,\nAlex Mercer`,
              createdAt: new Date().toISOString(),
              status: 'local_draft',
            };
          }

          return {
            ...p,
            unifiedStatus: uStatus,
            linkedinObservations: liOpts,
            selectedLinkedInOption: p.selectedLinkedInOption || liOpts[0]?.id,
            gmailDraft,
          };
        });

        const campaigns: Campaign[] = (parsed.campaigns || SEED_CAMPAIGNS).map((c: Campaign) => ({
          ...c,
          status: c.status || 'active',
          targetSubIndustries: c.targetSubIndustries || [],
          customIndustries: c.customIndustries || [],
        }));

        return {
          icps: parsed.icps || SEED_ICPS,
          campaigns,
          prospects,
          jobs: parsed.jobs || [],
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
          chats: parsed.chats || SEED_CHATS,
          linkedinTemplates: parsed.linkedinTemplates || [CANONICAL_LINKEDIN_TEMPLATE],
        };
      }
    } catch (err) {
      console.error('Error loading database file, falling back to initial seed:', err);
    }

    const initial: DatabaseSchema = {
      icps: SEED_ICPS,
      campaigns: SEED_CAMPAIGNS,
      prospects: SEED_PROSPECTS,
      jobs: [],
      settings: DEFAULT_SETTINGS,
      chats: SEED_CHATS,
      linkedinTemplates: [CANONICAL_LINKEDIN_TEMPLATE],
    };
    this.save(initial);
    return initial;
  }

  private save(dataToSave: DatabaseSchema = this.data): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Failed to write database atomically:', err);
    }
  }

  public getStats() {
    const totalProspects = this.data.prospects.length;
    const underResearch = this.data.prospects.filter(p =>
      ['discovering', 'verifying', 'researching_company', 'researching_person', 'industry_analysis', 'qualifying', 'drafting'].includes(p.stage)
    ).length;
    const qualified = this.data.prospects.filter(p => p.qualification?.isQualified).length;
    const highPriority = this.data.prospects.filter(p => (p.fitScore >= 80 && p.buyingSignalScore >= 80)).length;
    const readyForOutreach = this.data.prospects.filter(p => p.unifiedStatus === 'ready_for_outreach').length;
    const draftsAwaitingReview = this.data.prospects.filter(p =>
      p.drafts?.some(d => d.approvalStatus === 'pending_review')
    ).length;
    const approvedDrafts = this.data.prospects.reduce(
      (acc, p) => acc + (p.drafts?.filter(d => d.approvalStatus === 'approved').length || 0),
      0
    );
    const gmailDraftsCount = this.data.prospects.filter(p => Boolean(p.gmailDraft)).length;
    const gmailSavedCount = this.data.prospects.filter(p => p.gmailDraft?.status === 'saved_to_gmail').length;
    const linkedinPreparedCount = this.data.prospects.filter(p => Boolean(p.linkedinObservations?.length)).length;
    const sentOutreach = this.data.prospects.filter(p =>
      ['sent_manually', 'replied', 'converted'].includes(p.outreachStatus) || p.unifiedStatus === 'manually_sent'
    ).length;
    const activeJobs = this.data.jobs.filter(j => j.status === 'running' || j.status === 'queued').length;
    const campaignsActiveCount = this.data.campaigns.filter(c => c.status === 'active').length;

    return {
      totalProspects,
      underResearch,
      qualified,
      highPriority,
      readyForOutreach,
      draftsAwaitingReview,
      approvedDrafts,
      gmailDraftsCount,
      gmailSavedCount,
      linkedinPreparedCount,
      sentOutreach,
      activeJobs,
      campaignsCount: this.data.campaigns.length,
      campaignsActiveCount,
      icpsCount: this.data.icps.length,
    };
  }

  public getICPs(): ICPProfile[] {
    return [...this.data.icps];
  }

  public getICPById(id: string): ICPProfile | undefined {
    return this.data.icps.find(i => i.id === id);
  }

  public saveICP(icp: ICPProfile): ICPProfile {
    const idx = this.data.icps.findIndex(i => i.id === icp.id);
    if (idx >= 0) {
      this.data.icps[idx] = { ...icp, updatedAt: new Date().toISOString() };
    } else {
      this.data.icps.unshift({ ...icp, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    this.save();
    return icp;
  }

  public deleteICP(id: string): boolean {
    const before = this.data.icps.length;
    this.data.icps = this.data.icps.filter(i => i.id !== id);
    if (this.data.icps.length !== before) {
      this.save();
      return true;
    }
    return false;
  }

  public getCampaigns(): Campaign[] {
    return [...this.data.campaigns];
  }

  public getCampaignById(id: string): Campaign | undefined {
    return this.data.campaigns.find(c => c.id === id);
  }

  public saveCampaign(campaign: Campaign): Campaign {
    const idx = this.data.campaigns.findIndex(c => c.id === campaign.id);
    if (idx >= 0) {
      this.data.campaigns[idx] = { ...campaign, updatedAt: new Date().toISOString() };
    } else {
      this.data.campaigns.unshift({ ...campaign, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    this.save();
    return campaign;
  }

  public deleteCampaign(id: string): boolean {
    const before = this.data.campaigns.length;
    this.data.campaigns = this.data.campaigns.filter(c => c.id !== id);
    if (this.data.campaigns.length !== before) {
      this.save();
      return true;
    }
    return false;
  }

  public getProspects(): Prospect[] {
    return [...this.data.prospects];
  }

  public getProspectById(id: string): Prospect | undefined {
    return this.data.prospects.find(p => p.id === id);
  }

  public saveProspect(prospect: Prospect): Prospect {
    const idx = this.data.prospects.findIndex(p => p.id === prospect.id);
    if (idx >= 0) {
      this.data.prospects[idx] = { ...prospect, updatedAt: new Date().toISOString() };
    } else {
      this.data.prospects.unshift({ ...prospect, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    this.save();
    return prospect;
  }

  public deleteProspect(id: string): boolean {
    const before = this.data.prospects.length;
    this.data.prospects = this.data.prospects.filter(p => p.id !== id);
    if (this.data.prospects.length !== before) {
      this.save();
      return true;
    }
    return false;
  }

  public getJobs(): ResearchJob[] {
    return [...this.data.jobs];
  }

  public saveJob(job: ResearchJob): ResearchJob {
    const idx = this.data.jobs.findIndex(j => j.id === job.id);
    if (idx >= 0) {
      this.data.jobs[idx] = job;
    } else {
      this.data.jobs.unshift(job);
    }
    this.save();
    return job;
  }

  public updateJobStatus(jobId: string, updates: Partial<ResearchJob>): ResearchJob | undefined {
    const job = this.data.jobs.find(j => j.id === jobId);
    if (job) {
      Object.assign(job, updates);
      this.save();
      return job;
    }
    return undefined;
  }

  public getSettings(): AISettings {
    return { ...this.data.settings };
  }

  public saveSettings(newSettings: Partial<AISettings>): AISettings {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.save();
    return this.data.settings;
  }

  public recordUsage(tokensIn: number, tokensOut: number) {
    this.data.settings.usage.promptTokens += tokensIn;
    this.data.settings.usage.completionTokens += tokensOut;
    this.data.settings.usage.totalRuns += 1;
    // approx standard $0.10 / 1M input, $0.40 / 1M output
    this.data.settings.usage.estimatedCostUsd += (tokensIn * 0.0000001) + (tokensOut * 0.0000004);
    this.save();
  }

  public getChats(): ChatSession[] {
    return [...(this.data.chats || [])];
  }

  public getChatById(id: string): ChatSession | undefined {
    return (this.data.chats || []).find(c => c.id === id);
  }

  public saveChat(chat: ChatSession): ChatSession {
    if (!this.data.chats) this.data.chats = [];
    const idx = this.data.chats.findIndex(c => c.id === chat.id);
    if (idx >= 0) {
      this.data.chats[idx] = { ...chat, updatedAt: new Date().toISOString() };
    } else {
      this.data.chats.unshift({ ...chat, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    this.save();
    return chat;
  }

  public deleteChat(id: string): boolean {
    if (!this.data.chats) return false;
    const before = this.data.chats.length;
    this.data.chats = this.data.chats.filter(c => c.id !== id);
    if (this.data.chats.length !== before) {
      this.save();
      return true;
    }
    return false;
  }

  public getLinkedInTemplates(): LinkedInTemplateVersion[] {
    return this.data.linkedinTemplates && this.data.linkedinTemplates.length > 0
      ? [...this.data.linkedinTemplates]
      : [CANONICAL_LINKEDIN_TEMPLATE];
  }

  public getCanonicalLinkedInTemplate(): LinkedInTemplateVersion {
    const list = this.getLinkedInTemplates();
    return list.find(t => t.isCanonical) || list[0] || CANONICAL_LINKEDIN_TEMPLATE;
  }

  public saveLinkedInTemplate(template: LinkedInTemplateVersion): LinkedInTemplateVersion {
    if (!this.data.linkedinTemplates) this.data.linkedinTemplates = [CANONICAL_LINKEDIN_TEMPLATE];
    const idx = this.data.linkedinTemplates.findIndex(t => t.id === template.id);
    if (idx >= 0) {
      this.data.linkedinTemplates[idx] = { ...template, updatedAt: new Date().toISOString() };
    } else {
      this.data.linkedinTemplates.unshift({ ...template, updatedAt: new Date().toISOString() });
    }
    this.save();
    return template;
  }

  public resetLinkedInTemplate(): LinkedInTemplateVersion {
    this.data.linkedinTemplates = [{ ...CANONICAL_LINKEDIN_TEMPLATE, updatedAt: new Date().toISOString() }];
    this.save();
    return CANONICAL_LINKEDIN_TEMPLATE;
  }

  public resetSeedData(): void {
    this.data = {
      icps: SEED_ICPS,
      campaigns: SEED_CAMPAIGNS,
      prospects: SEED_PROSPECTS,
      jobs: [],
      settings: DEFAULT_SETTINGS,
      chats: SEED_CHATS,
      linkedinTemplates: [CANONICAL_LINKEDIN_TEMPLATE],
    };
    this.save();
  }
}

export const db = new Database();
