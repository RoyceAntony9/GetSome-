export interface IndustryCategory {
  id: string;
  name: string;
  subIndustries: string[];
}

export const INDUSTRY_PRESETS: IndustryCategory[] = [
  {
    id: 'tech_saas',
    name: 'Technology and SaaS',
    subIndustries: [
      'Artificial intelligence and machine learning',
      'Enterprise software and SaaS',
      'Cybersecurity',
      'Cloud computing',
      'Developer tools',
      'IT services',
      'Digital transformation',
      'Data infrastructure',
    ],
  },
  {
    id: 'healthcare_life_sciences',
    name: 'Healthcare and Life Sciences',
    subIndustries: [
      'Healthtech and digital health',
      'Hospitals and healthcare providers',
      'Medical devices',
      'Pharmaceuticals',
      'Biotechnology',
      'Healthcare software',
    ],
  },
  {
    id: 'finance_fintech',
    name: 'Finance and Fintech',
    subIndustries: [
      'Banking and financial services',
      'Payments and financial infrastructure',
      'Insurance and insurtech',
      'Wealth management',
      'Financial software',
      'Financial operations technology',
    ],
  },
  {
    id: 'manufacturing_industrial',
    name: 'Manufacturing and Industrial Technology',
    subIndustries: [
      'Industrial automation',
      'Robotics and electronics',
      'Automotive and mobility',
      'Supply chain technology',
      'Industrial software',
      'Advanced manufacturing',
    ],
  },
  {
    id: 'professional_services',
    name: 'Professional Services',
    subIndustries: [
      'Management consulting',
      'Technology consulting',
      'Recruitment and talent solutions',
      'Legal services',
      'Accounting services',
      'Business process outsourcing',
    ],
  },
  {
    id: 'retail_ecommerce',
    name: 'Retail and E-commerce',
    subIndustries: [
      'D2C brands',
      'Online marketplaces',
      'Retail technology',
      'Consumer goods',
      'E-commerce infrastructure',
      'Retail operations',
    ],
  },
  {
    id: 'real_estate_construction',
    name: 'Real Estate and Construction',
    subIndustries: [
      'Commercial real estate',
      'Property technology',
      'Construction technology',
      'Infrastructure development',
      'Facilities management',
    ],
  },
  {
    id: 'education_edtech',
    name: 'Education and EdTech',
    subIndustries: [
      'Universities and higher education',
      'Online learning',
      'Corporate training',
      'Education technology',
      'Workforce development',
    ],
  },
  {
    id: 'logistics_transportation',
    name: 'Logistics and Transportation',
    subIndustries: [
      'Freight and logistics',
      'Warehousing',
      'Fleet management',
      'Mobility',
      'Supply chain optimization',
    ],
  },
  {
    id: 'energy_sustainability',
    name: 'Energy and Sustainability',
    subIndustries: [
      'Renewable energy',
      'Energy technology',
      'Climate technology',
      'Environmental services',
      'Sustainability solutions',
    ],
  },
  {
    id: 'telecom_media',
    name: 'Telecommunications and Media',
    subIndustries: [
      'Telecommunications',
      'Digital media',
      'Advertising technology',
      'Marketing technology',
      'Communications infrastructure',
    ],
  },
  {
    id: 'aerospace_defence',
    name: 'Aerospace and Defence',
    subIndustries: [
      'Aerospace and aviation',
      'Defence technology',
      'Drones and robotics',
      'Government acquisition',
      'Dual-use technology',
      'Defence manufacturing',
    ],
  },
];

export const ALL_SUB_INDUSTRIES = INDUSTRY_PRESETS.flatMap(cat => cat.subIndustries);
