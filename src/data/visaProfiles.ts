export interface VisaOption {
  type: string;
  complexity: 'Low' | 'Medium' | 'High';
  suggestedBaseFeeNGN: number;
  suggestedMarkupNGN: number;
  duration: string;
  processingSpeed: string;
  requirements: string[];
}

export interface CountryVisaProfile {
  country: string;
  description: string;
  options: VisaOption[];
}

// Standard standard base requirement lists for modular injection
const coreIdentityDocs = [
  'Valid Nigerian Passport (minimum 6 months validity with 2 blank pages)',
  'Two recent passport-sized white background photographs',
  'Fully completed and signed online visa application form',
  'Clear color biopage photocopy of current and previous passports'
];

const standardFinancialDocs = [
  '6 Months original corporate or personal bank statements, signed and stamped by the bank',
  'Verifiable proof of income, employment contract, or CAC corporate registration certificates',
  'Recent 3 months tax clearance certificate or salary slips'
];

const logisticalDocs = [
  'Verifiable round-trip flight reservation itinerary',
  'Confirmed hotel booking or proof of legal residential accommodation host letter'
];

export const globalVisaProfiles: CountryVisaProfile[] = [
  {
    country: 'United Kingdom',
    description: 'Comprehensive entry management configuration for the United Kingdom, covering visitor tracks, academic compliance, and corporate work permits.',
    options: [
      {
        type: 'Standard Visitor Visa',
        complexity: 'High',
        suggestedBaseFeeNGN: 215000,
        suggestedMarkupNGN: 65000,
        duration: '6 Months',
        processingSpeed: '7-15 Business Days',
        requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs, 'Detailed travel itinerary with daily breakdown', 'Tuberculosis (TB) test certificate from an approved clinic']
      },
      {
        type: 'Business Visitor Visa',
        complexity: 'High',
        suggestedBaseFeeNGN: 245000,
        suggestedMarkupNGN: 75000,
        duration: '6 Months',
        processingSpeed: '7-15 Business Days',
        requirements: [...coreIdentityDocs, ...standardFinancialDocs, 'Official invitation letter from the UK registered corporate entity', 'Corporate letter of introduction explaining business intent']
      },
      {
        type: 'Student Visa',
        complexity: 'High',
        suggestedBaseFeeNGN: 380000,
        suggestedMarkupNGN: 95000,
        duration: 'Course Duration',
        processingSpeed: '15-21 Business Days',
        requirements: [...coreIdentityDocs, 'Confirmation of Acceptance for Studies (CAS) reference number', 'Proof of sufficient maintenance funds for living expenses', 'Academic qualifications and transcripts']
      },
      {
        type: 'Work Visa',
        complexity: 'High',
        suggestedBaseFeeNGN: 450000,
        suggestedMarkupNGN: 120000,
        duration: 'Up to 3 Years',
        processingSpeed: '15-21 Business Days',
        requirements: [...coreIdentityDocs, 'Certificate of Sponsorship (CoS) from a licensed UK employer', 'Proof of meeting the required English language proficiency standard', 'Financial sustainability clearance']
      },
      {
        type: 'Family Reunion Visa',
        complexity: 'High',
        suggestedBaseFeeNGN: 320000,
        suggestedMarkupNGN: 80000,
        duration: 'Settlement Track',
        processingSpeed: '30-60 Business Days',
        requirements: [...coreIdentityDocs, 'Proof of relationship to the UK sponsor', 'Sponsor financial support verification and housing capability documents']
      },
      {
        type: 'Digital Nomad Visa',
        complexity: 'Medium',
        suggestedBaseFeeNGN: 180000,
        suggestedMarkupNGN: 50000,
        duration: '1 Year',
        processingSpeed: '10-15 Business Days',
        requirements: [...coreIdentityDocs, 'Proof of continuous foreign remote employment income exceeding minimum thresholds', 'Active remote work contracts']
      },
      {
        type: 'Global Talent Visa',
        complexity: 'High',
        suggestedBaseFeeNGN: 550000,
        suggestedMarkupNGN: 150000,
        duration: 'Up to 5 Years',
        processingSpeed: '21-30 Business Days',
        requirements: [...coreIdentityDocs, 'Official endorsement letter from an authorized UK scientific, research, or cultural body', 'Professional portfolio of global achievements']
      },
      {
        type: 'Innovator Founder Visa',
        complexity: 'High',
        suggestedBaseFeeNGN: 600000,
        suggestedMarkupNGN: 180000,
        duration: '3 Years',
        processingSpeed: '21-30 Business Days',
        requirements: [...coreIdentityDocs, 'Endorsement letter validating a scalable, viable, and innovative business concept', 'Comprehensive corporate business plan']
      },
      {
        type: 'Skilled Worker Visa',
        complexity: 'High',
        suggestedBaseFeeNGN: 450000,
        suggestedMarkupNGN: 120000,
        duration: 'Up to 5 Years',
        processingSpeed: '15-21 Business Days',
        requirements: [...coreIdentityDocs, 'Valid Certificate of Sponsorship (CoS)', 'Proof of salary matching or exceeding the standard market rate criteria']
      }
    ]
  },
  {
    country: 'United States',
    description: 'Entry track controls for the United States, managing non-immigrant visitor classifications, academic exchange routes, and employer-sponsored support frameworks.',
    options: [
      {
        type: 'B1/B2 Visitor Visa',
        complexity: 'High',
        suggestedBaseFeeNGN: 260000,
        suggestedMarkupNGN: 70000,
        duration: '2 to 5 Years',
        processingSpeed: 'Embassy Dependent',
        requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs, 'Confirmation page of the DS-160 online form with barcode', 'MRV visa fee payment receipt confirmation']
      },
      {
        type: 'F1 Student Visa',
        complexity: 'High',
        suggestedBaseFeeNGN: 310000,
        suggestedMarkupNGN: 85000,
        duration: 'Course Duration',
        processingSpeed: 'Embassy Dependent',
        requirements: [...coreIdentityDocs, 'Valid Form I-20 issued by an approved US institution', 'SEVIS I-901 fee payment receipt', 'Verifiable sponsor financial backing records']
      },
      {
        type: 'H1B Work Visa Support',
        complexity: 'High',
        suggestedBaseFeeNGN: 500000,
        suggestedMarkupNGN: 150000,
        duration: '3 Years',
        processingSpeed: '15-30 Business Days',
        requirements: [...coreIdentityDocs, 'Copy of approved Form I-129 petition for non-immigrant worker', 'Form I-797 approval notice document copy']
      },
      {
        type: 'Work Permit',
        complexity: 'High',
        suggestedBaseFeeNGN: 420000,
        suggestedMarkupNGN: 110000,
        duration: '1 to 2 Years',
        processingSpeed: '30-45 Business Days',
        requirements: [...coreIdentityDocs, 'Approved Employment Authorization Document (EAD) filing documentation', 'Underlying institutional eligibility baseline']
      },
      {
        type: 'Family Sponsorship Visa',
        complexity: 'High',
        suggestedBaseFeeNGN: 350000,
        suggestedMarkupNGN: 90000,
        duration: 'Immigrant Track',
        processingSpeed: 'Variable',
        requirements: [...coreIdentityDocs, 'Filing receipts of Form I-130 petition for alien relative', 'Sponsor affidavit of financial support (Form I-864)']
      },
      {
        type: 'Temporary Worker Visa',
        complexity: 'High',
        suggestedBaseFeeNGN: 390000,
        suggestedMarkupNGN: 95000,
        duration: '1 Year',
        processingSpeed: '21-30 Business Days',
        requirements: [...coreIdentityDocs, 'Labor Condition Application (LCA) approval notice', 'Employer job assignment contract']
      },
      {
        type: 'J1 Exchange Visitor Visa',
        complexity: 'High',
        suggestedBaseFeeNGN: 280000,
        suggestedMarkupNGN: 70000,
        duration: 'Program Duration',
        processingSpeed: '14-21 Business Days',
        requirements: [...coreIdentityDocs, 'Form DS-2019 Certificate of Eligibility for Exchange Visitor Status', 'Sponsor agency placement framework documentation']
      },
      {
        type: 'O1 Extraordinary Ability Visa',
        complexity: 'High',
        suggestedBaseFeeNGN: 580000,
        suggestedMarkupNGN: 160000,
        duration: 'Up to 3 Years',
        processingSpeed: '15-21 Business Days',
        requirements: [...coreIdentityDocs, 'Extensive media, citation, and industrial award evidence portfolio verifying national/international acclaim', 'Peer advisory evaluation review letters']
      },
      {
        type: 'L1 Intracompany Transfer Visa',
        complexity: 'High',
        suggestedBaseFeeNGN: 520000,
        suggestedMarkupNGN: 140000,
        duration: '1 to 3 Years',
        processingSpeed: '15-30 Business Days',
        requirements: [...coreIdentityDocs, 'Proof of continuous employment at an executive, managerial, or specialized knowledge level for 1 of the last 3 years with a qualifying cross-border affiliate company']
      }
    ]
  },
  {
    country: 'Canada',
    description: 'Canadian migration data structures, integrating temporary resident permissions, student files, economic mobility tracks, and express initialization frameworks.',
    options: [
      {
        type: 'Temporary Resident Visa',
        complexity: 'High',
        suggestedBaseFeeNGN: 230000,
        suggestedMarkupNGN: 65000,
        duration: 'Up to 10 Years',
        processingSpeed: '15-30 Business Days',
        requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs, 'Detailed family composition information form (IMM 5645)', 'Purpose of travel explanatory brief']
      },
      {
        type: 'Study Permit',
        complexity: 'High',
        suggestedBaseFeeNGN: 320000,
        suggestedMarkupNGN: 85000,
        duration: 'Course Duration',
        processingSpeed: '21-45 Business Days',
        requirements: [...coreIdentityDocs, 'Official Letter of Acceptance (LOA) from a Designated Learning Institution (DLI)', 'Provincial Attestation Letter (PAL) if applicable', 'Proof of financial capacity']
      },
      {
        type: 'Visitor Visa',
        complexity: 'High',
        suggestedBaseFeeNGN: 230000,
        suggestedMarkupNGN: 65000,
        duration: 'Up to Passport Expiry',
        processingSpeed: '15-30 Business Days',
        requirements: [...coreIdentityDocs, ...standardFinancialDocs, 'Detailed ties to Nigeria verification data (land deeds, operational business assets, family dependents)']
      },
      {
        type: 'Work Permit',
        complexity: 'High',
        suggestedBaseFeeNGN: 410000,
        suggestedMarkupNGN: 110000,
        duration: '1 to 3 Years',
        processingSpeed: '21-45 Business Days',
        requirements: [...coreIdentityDocs, 'Positive Labor Market Impact Assessment (LMIA) or LMIA-exempt corporate tracking number', 'Employment offer letter']
      },
      {
        type: 'Family Sponsorship Visa',
        complexity: 'High',
        suggestedBaseFeeNGN: 360000,
        suggestedMarkupNGN: 90000,
        duration: 'Permanent Resident',
        processingSpeed: 'Variable',
        requirements: [...coreIdentityDocs, 'Sponsorship agreement application packages', 'Proof of sponsor Canadian Citizenship or Permanent Residence status']
      },
      {
        type: 'Temporary Worker Visa',
        complexity: 'High',
        suggestedBaseFeeNGN: 390000,
        suggestedMarkupNGN: 95000,
        duration: '1 Year',
        processingSpeed: '21-30 Business Days',
        requirements: [...coreIdentityDocs, 'Provincial trade operational licensing clearance certificates', 'Employment contract infrastructure']
      },
      {
        type: 'Post Graduate Work Permit',
        complexity: 'Medium',
        suggestedBaseFeeNGN: 190000,
        suggestedMarkupNGN: 50000,
        duration: '1 to 3 Years',
        processingSpeed: '15-30 Business Days',
        requirements: [...coreIdentityDocs, 'Official transcript confirmation graduation from an eligible DLI program', 'Valid underlying student permit logs']
      },
      {
        type: 'Express Entry Support',
        complexity: 'High',
        suggestedBaseFeeNGN: 480000,
        suggestedMarkupNGN: 120000,
        duration: 'PR Intake Profile',
        processingSpeed: '6 Months Expected',
        requirements: [...coreIdentityDocs, 'Verified Educational Credential Assessment (ECA) report', 'Valid IELTS or CELPIP language examination score matrices']
      },
      {
        type: 'Start-Up Visa Program',
        complexity: 'High',
        suggestedBaseFeeNGN: 650000,
        suggestedMarkupNGN: 200000,
        duration: 'Permanent Resident',
        processingSpeed: 'Strategic Intake',
        requirements: [...coreIdentityDocs, 'Official Letter of Support from a designated Canadian venture capital fund, angel investor group, or business incubator']
      }
    ]
  },
  {
    country: 'United Arab Emirates',
    description: 'Entry track structures for the UAE, covering digital eVisas, family sponsorship configurations, and freelance operational access profiles.',
    options: [
      {
        type: 'Tourist eVisa',
        complexity: 'Low',
        suggestedBaseFeeNGN: 75000,
        suggestedMarkupNGN: 25000,
        duration: '30 or 60 Days',
        processingSpeed: '2-4 Business Days',
        requirements: [...coreIdentityDocs, 'Confirmed return ticket itinerary with Emirates, FlyDubai, or equivalent airline', 'Valid health insurance coverage for the UAE']
      },
      {
        type: 'Transit Visa',
        complexity: 'Low',
        suggestedBaseFeeNGN: 45000,
        suggestedMarkupNGN: 15000,
        duration: '48 to 96 Hours',
        processingSpeed: '1-2 Business Days',
        requirements: [...coreIdentityDocs, 'Onward destination flight ticket confirmation', 'Valid entry visa clearance for the third country of destination']
      },
      {
        type: 'Business Visa',
        complexity: 'Medium',
        suggestedBaseFeeNGN: 140000,
        suggestedMarkupNGN: 40000,
        duration: '90 Days',
        processingSpeed: '3-5 Business Days',
        requirements: [...coreIdentityDocs, 'Letter of invitation from a UAE corporate body or Free Zone authority entity documentation']
      },
      {
        type: 'Family Visit Visa',
        complexity: 'Medium',
        suggestedBaseFeeNGN: 130000,
        suggestedMarkupNGN: 35000,
        duration: '60 Days',
        processingSpeed: '3-5 Business Days',
        requirements: [...coreIdentityDocs, 'Proof of relationship to the UAE resident host', 'Copy of the host resident card, UAE visa, and employment tenancy contract']
      },
      {
        type: 'Employment Visa',
        complexity: 'High',
        suggestedBaseFeeNGN: 310000,
        suggestedMarkupNGN: 80000,
        duration: '2 Years',
        processingSpeed: '5-10 Business Days',
        requirements: [...coreIdentityDocs, 'Official UAE Ministry of Human Resources and Emiratisation (MOHRE) offer letter document copy']
      },
      {
        type: 'Residence Visa',
        complexity: 'High',
        suggestedBaseFeeNGN: 350000,
        suggestedMarkupNGN: 90000,
        duration: '2 to 5 Years',
        processingSpeed: '7-14 Business Days',
        requirements: [...coreIdentityDocs, 'Attested real estate property asset deeds or significant company setup share tracking codes']
      },
      {
        type: 'Remote Work Visa',
        complexity: 'Medium',
        suggestedBaseFeeNGN: 160000,
        suggestedMarkupNGN: 45000,
        duration: '1 Year',
        processingSpeed: '4-7 Business Days',
        requirements: [...coreIdentityDocs, 'Proof of employment from an entity outside the UAE with a minimum monthly wage threshold of USD 3,500 equivalent']
      },
      {
        type: 'Freelance Permit Visa',
        complexity: 'Medium',
        suggestedBaseFeeNGN: 190000,
        suggestedMarkupNGN: 50000,
        duration: '1 Year',
        processingSpeed: '5-7 Business Days',
        requirements: [...coreIdentityDocs, 'Official freelance certificate issued by an approved UAE Free Zone entity (e.g., GCAA, GoFreelance)']
      }
    ]
  },
  {
    country: 'Germany',
    description: 'European Schengen and national access pathways for Germany, formatting standard short-stay parameters alongside long-term research and employment controls.',
    options: [
      {
        type: 'Schengen Tourist Visa',
        complexity: 'High',
        suggestedBaseFeeNGN: 220000,
        suggestedMarkupNGN: 60000,
        duration: 'Up to 90 Days',
        processingSpeed: '10-15 Business Days',
        requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs, 'Travel medical insurance certificate with a minimum coverage of EUR 30,000 for all Schengen states']
      },
      {
        type: 'Business Visa',
        complexity: 'High',
        suggestedBaseFeeNGN: 240000,
        suggestedMarkupNGN: 70000,
        duration: 'Up to 90 Days',
        processingSpeed: '7-12 Business Days',
        requirements: [...coreIdentityDocs, ...standardFinancialDocs, 'Formal invitation letter containing detailed schedule from the German business partner organization']
      },
      {
        type: 'Trade Fair Visa',
        complexity: 'High',
        suggestedBaseFeeNGN: 230000,
        suggestedMarkupNGN: 65000,
        duration: 'Exposition Period',
        processingSpeed: '7-12 Business Days',
        requirements: [...coreIdentityDocs, 'Valid trade fair attendee entry pass or exhibitor registration certification data codes']
      },
      {
        type: 'Long-Stay D Visa',
        complexity: 'High',
        suggestedBaseFeeNGN: 340000,
        suggestedMarkupNGN: 90000,
        duration: '3 to 12 Months',
        processingSpeed: '15-30 Business Days',
        requirements: [...coreIdentityDocs, 'Comprehensive long-term motivational brief statement of intent', 'Certified specialized qualification credentials']
      },
      {
        type: 'Airport Transit Visa',
        complexity: 'Low',
        suggestedBaseFeeNGN: 90000,
        suggestedMarkupNGN: 30000,
        duration: '24 Hours max',
        processingSpeed: '3-5 Business Days',
        requirements: [...coreIdentityDocs, 'Confirmed cross-border flight ticket to final destination', 'Underlying destination country entry clearance permissions']
      },
      {
        type: 'Medical Treatment Visa',
        complexity: 'High',
        suggestedBaseFeeNGN: 290000,
        suggestedMarkupNGN: 75000,
        duration: 'Treatment Window',
        processingSpeed: '5-10 Business Days',
        requirements: [...coreIdentityDocs, 'Official letter issued by a certified German treating medical doctor or clinical hospital confirming appointment and cost clearance payment verification']
      },
      {
        type: 'EU Blue Card',
        complexity: 'High',
        suggestedBaseFeeNGN: 460000,
        suggestedMarkupNGN: 130000,
        duration: 'Up to 4 Years',
        processingSpeed: '15-30 Business Days',
        requirements: [...coreIdentityDocs, 'Recognized higher educational degree certificate listed on Anabin data logs', 'German binding job contract with salary thresholds']
      },
      {
        type: 'Job Seeker Visa',
        complexity: 'High',
        suggestedBaseFeeNGN: 380000,
        suggestedMarkupNGN: 95000,
        duration: '6 Months',
        processingSpeed: '15-30 Business Days',
        requirements: [...coreIdentityDocs, 'Academic evaluation documentation data tracking', 'Proof of secure financial maintenance funds locked in a German blocked bank account']
      },
      {
        type: 'Opportunity Card',
        complexity: 'High',
        suggestedBaseFeeNGN: 390000,
        suggestedMarkupNGN: 100000,
        duration: '1 Year',
        processingSpeed: '15-30 Business Days',
        requirements: [...coreIdentityDocs, 'Points evaluation structural scoring validation tracking form (Chancenkarte verification documentation matrix rules)']
      }
    ]
  },
  
  // --- SCHENGEN / WESTERN EUROPE ZONE (COMPLEX STICKER PROCESSING) ---
  {
    country: 'France',
    description: 'Schengen short-stay entry tracks and long-stay talent profiles for France initialized out of local consular hubs.',
    options: [
      { type: 'Schengen Tourist Visa', complexity: 'High', suggestedBaseFeeNGN: 220000, suggestedMarkupNGN: 60000, duration: '90 Days', processingSpeed: '10-15 Days', requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs, 'Schengen standard medical emergency travel cover package'] },
      { type: 'Talent Passport Work Visa', complexity: 'High', suggestedBaseFeeNGN: 480000, suggestedMarkupNGN: 120000, duration: 'Up to 4 Years', processingSpeed: '21-30 Days', requirements: [...coreIdentityDocs, 'French corporate employment offering letter, matching specialized talent track indices'] }
    ]
  },
  {
    country: 'Italy',
    description: 'Schengen visa pathways and investment profile tracks for Italian destination processing lines.',
    options: [
      { type: 'Schengen Tourist Visa', complexity: 'High', suggestedBaseFeeNGN: 220000, suggestedMarkupNGN: 60000, duration: '90 Days', processingSpeed: '14-21 Days', requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs, 'Travel health insurance'] },
      { type: 'National Long-Stay Study Visa', complexity: 'High', suggestedBaseFeeNGN: 290000, suggestedMarkupNGN: 70000, duration: '1 Year', processingSpeed: '15-30 Days', requirements: [...coreIdentityDocs, 'Italian University matriculation certificate listing code validation proof'] }
    ]
  },
  {
    country: 'Spain',
    description: 'Schengen Short-Stay configurations and long-term remote worker access frameworks for Spain.',
    options: [
      { type: 'Schengen Tourist Visa', complexity: 'High', suggestedBaseFeeNGN: 220000, suggestedMarkupNGN: 60000, duration: '90 Days', processingSpeed: '14-21 Days', requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs] },
      { type: 'Digital Nomad Visa', complexity: 'High', suggestedBaseFeeNGN: 350000, suggestedMarkupNGN: 90000, duration: '1 Year', processingSpeed: '15-30 Days', requirements: [...coreIdentityDocs, 'Verification of non-Spanish remote employment revenue structure, clean criminal history report'] }
    ]
  },
  {
    country: 'Netherlands',
    description: 'Schengen operational travel processing arrays and highly skilled migrant profiles for the Kingdom of the Netherlands.',
    options: [
      { type: 'Schengen Tourist Visa', complexity: 'High', suggestedBaseFeeNGN: 220000, suggestedMarkupNGN: 60000, duration: '90 Days', processingSpeed: '10-15 Days', requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs] },
      { type: 'Highly Skilled Migrant Visa', complexity: 'High', suggestedBaseFeeNGN: 470000, suggestedMarkupNGN: 120000, duration: 'Contract Term', processingSpeed: '14-21 Days', requirements: [...coreIdentityDocs, 'Recognized corporate IND covenant sponsor employment authorization framework data codes'] }
    ]
  },
  {
    country: 'Switzerland',
    description: 'Premium European travel clearance configurations for Swiss operations managed via localized vetting networks.',
    options: [
      { type: 'Schengen Tourist Visa', complexity: 'High', suggestedBaseFeeNGN: 230000, suggestedMarkupNGN: 70000, duration: '90 Days', processingSpeed: '10-15 Days', requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs] },
      { type: 'Business Visitor Visa', complexity: 'High', suggestedBaseFeeNGN: 250000, suggestedMarkupNGN: 75000, duration: '90 Days', processingSpeed: '7-12 Days', requirements: [...coreIdentityDocs, 'Swiss corporate invitation records including business ledger registration proofs'] }
    ]
  },
  {
    country: 'Ireland',
    description: 'National non-Schengen travel paths for Ireland, initializing standalone visitor and student frameworks.',
    options: [
      { type: 'Short Stay "C" Tourist Visa', complexity: 'High', suggestedBaseFeeNGN: 240000, suggestedMarkupNGN: 65000, duration: '90 Days', processingSpeed: '21-30 Days', requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs, 'Detailed narrative explaining exact destination anchoring factors'] },
      { type: 'Long Stay "D" Study Visa', complexity: 'High', suggestedBaseFeeNGN: 310000, suggestedMarkupNGN: 80000, duration: 'Course Term', processingSpeed: '21-45 Days', requirements: [...coreIdentityDocs, 'Full payment receipt tracking code issued by an approved Irish academic body'] }
    ]
  },
  {
    country: 'Turkey',
    description: 'Sticker visa controls and validation rules for Turkish entry files processed out of local tracking stations.',
    options: [
      { type: 'Tourist Sticker Visa', complexity: 'Medium', suggestedBaseFeeNGN: 160000, suggestedMarkupNGN: 50000, duration: '30 to 90 Days', processingSpeed: '7-14 Days', requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs, 'Notarized letter of introduction verification data'] },
      { type: 'Student National Visa', complexity: 'Medium', suggestedBaseFeeNGN: 210000, suggestedMarkupNGN: 60000, duration: '1 Year', processingSpeed: '14-21 Days', requirements: [...coreIdentityDocs, 'Turkish institutional acceptance reference records code details'] }
    ]
  },
  {
    country: 'Cyprus',
    description: 'National short-stay travel pathways and residency operations configuration parameters for Cyprus.',
    options: [
      { type: 'Tourist Visa', complexity: 'Medium', suggestedBaseFeeNGN: 150000, suggestedMarkupNGN: 45000, duration: '90 Days', processingSpeed: '7-12 Days', requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs] },
      { type: 'Student Visa', complexity: 'Medium', suggestedBaseFeeNGN: 190000, suggestedMarkupNGN: 55000, duration: '1 Year', processingSpeed: '14-21 Days', requirements: [...coreIdentityDocs, 'Ministry of Education Cyprus approval authorization indices'] }
    ]
  },
  {
    country: 'Poland',
    description: 'Schengen short-stay entry routing and national employment permission configuration files for Poland.',
    options: [
      { type: 'Schengen Tourist Visa', complexity: 'High', suggestedBaseFeeNGN: 220000, suggestedMarkupNGN: 60000, duration: '90 Days', processingSpeed: '14-21 Days', requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs] },
      { type: 'National Work Visa', complexity: 'High', suggestedBaseFeeNGN: 390000, suggestedMarkupNGN: 100000, duration: '1 Year', processingSpeed: '30-45 Days', requirements: [...coreIdentityDocs, 'Official Voivodeship employment permission validation license document copy'] }
    ]
  },
  {
    country: 'Sweden',
    description: 'Scandinavian Schengen controls and long-term residency setup controls for Sweden.',
    options: [
      { type: 'Schengen Tourist Visa', complexity: 'High', suggestedBaseFeeNGN: 220000, suggestedMarkupNGN: 60000, duration: '90 Days', processingSpeed: '10-15 Days', requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs] },
      { type: 'Work Permit', complexity: 'High', suggestedBaseFeeNGN: 430000, suggestedMarkupNGN: 110000, duration: '2 Years', processingSpeed: '30-60 Days', requirements: [...coreIdentityDocs, 'Swedish Migrationsverket corporate validation request infrastructure records code tokens'] }
    ]
  },

  // --- AMERICAS & CARIBBEAN ZONE (CUSTOM DOCUMENTATION SPECS) ---
  {
    country: 'Brazil',
    description: 'Consular processing files and short-term visitor parameters for Brazil.',
    options: [
      { type: 'VIVIS Visitor Visa', complexity: 'Medium', suggestedBaseFeeNGN: 160000, suggestedMarkupNGN: 45000, duration: '90 Days', processingSpeed: '10-15 Days', requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs] }
    ]
  },
  {
    country: 'Mexico',
    description: 'Consular interview tracking setups and short-term access framework definitions for Mexico.',
    options: [
      { type: 'Tourist Visa', complexity: 'High', suggestedBaseFeeNGN: 240000, suggestedMarkupNGN: 70000, duration: '180 Days', processingSpeed: 'Embassy Dependent', requirements: [...coreIdentityDocs, ...standardFinancialDocs, 'Proof of strong economic balance matrices maintained over trailing 12 months consecutive intervals'] }
    ]
  },
  {
    country: 'Jamaica',
    description: 'Caribbean regional visa entry pathways and compliance constraints for Jamaica.',
    options: [
      { type: 'Tourist Entry Visa', complexity: 'Medium', suggestedBaseFeeNGN: 130000, suggestedMarkupNGN: 40000, duration: '30 Days', processingSpeed: '5-10 Days', requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs] }
    ]
  },
  {
    country: 'Barbados',
    description: 'Electronic clearance integration paths and visitor profiling options for Barbados.',
    options: [
      { type: 'Tourist Visa', complexity: 'Low', suggestedBaseFeeNGN: 85000, suggestedMarkupNGN: 25000, duration: '90 Days', processingSpeed: '3-5 Days', requirements: [...coreIdentityDocs, ...logisticalDocs] }
    ]
  },
  {
    country: 'Bahamas',
    description: 'Island transit permissions and entry control configurations for the Bahamas.',
    options: [
      { type: 'Tourist Visa', complexity: 'Medium', suggestedBaseFeeNGN: 140000, suggestedMarkupNGN: 40000, duration: '90 Days', processingSpeed: '5-10 Days', requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs] }
    ]
  },
  {
    country: 'Antigua and Barbuda',
    description: 'Digital eVisa framework infrastructure specifications for Antigua and Barbuda entry routing.',
    options: [
      { type: 'Tourist eVisa', complexity: 'Low', suggestedBaseFeeNGN: 80000, suggestedMarkupNGN: 25000, duration: '30 Days', processingSpeed: '3-5 Days', requirements: [...coreIdentityDocs, ...logisticalDocs] }
    ]
  },
  {
    country: 'Grenada',
    description: 'Entry configurations and data handling rules for Grenada visa modules.',
    options: [
      { type: 'Tourist Visa', complexity: 'Medium', suggestedBaseFeeNGN: 120000, suggestedMarkupNGN: 35000, duration: '30 Days', processingSpeed: '5-10 Days', requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs] }
    ]
  },

  // --- MIDDLE EAST & ASIA GULF ZONE (FAST E-VISA INTRODUCTIONS) ---
  {
    country: 'Saudi Arabia',
    description: 'Umrah tracks, tourist eVisa exceptions, and business delegation tracking configurations for Saudi Arabia.',
    options: [
      { type: 'Umrah Visa', complexity: 'Low', suggestedBaseFeeNGN: 95000, suggestedMarkupNGN: 25000, duration: '90 Days', processingSpeed: '2-3 Days', requirements: [...coreIdentityDocs, 'Confirmed Makkah/Madinah hospitality booking token indexes'] },
      { type: 'Business Sticker Visa', complexity: 'High', suggestedBaseFeeNGN: 260000, suggestedMarkupNGN: 70000, duration: '90 Days', processingSpeed: '5-10 Days', requirements: [...coreIdentityDocs, 'Saudi Chamber of Commerce electronic letter of invitation code document verification'] }
    ]
  },
  {
    country: 'Qatar',
    description: 'Hayya platform integration modules and electronic single-entry controls for Qatar.',
    options: [
      { type: 'Tourist eVisa', complexity: 'Low', suggestedBaseFeeNGN: 80000, suggestedMarkupNGN: 25000, duration: '30 Days', processingSpeed: '2-4 Days', requirements: [...coreIdentityDocs, ...logisticalDocs, 'Discover Qatar mandatory entry transit accommodation booking record references'] }
    ]
  },
  {
    country: 'Oman',
    description: 'Electronic entry configurations and visitor management controls for Oman.',
    options: [
      { type: 'Tourist eVisa', complexity: 'Low', suggestedBaseFeeNGN: 85000, suggestedMarkupNGN: 25000, duration: '30 Days', processingSpeed: '2-4 Days', requirements: [...coreIdentityDocs, ...logisticalDocs] }
    ]
  },
  {
    country: 'Singapore',
    description: 'Highly structured digital clearance mechanisms for Singapore entry modules.',
    options: [
      { type: 'Entry eVisa Assessment', complexity: 'Medium', suggestedBaseFeeNGN: 150000, suggestedMarkupNGN: 45000, duration: '30 Days', processingSpeed: '5-7 Days', requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs, 'Local Singaporean citizen or corporate entity proxy guarantor reference logs'] }
    ]
  },
  {
    country: 'Malaysia',
    description: 'Electronic access and sticker configuration matrices for Malaysia travel modules.',
    options: [
      { type: 'Tourist eVisa', complexity: 'Medium', suggestedBaseFeeNGN: 110000, suggestedMarkupNGN: 35000, duration: '30 Days', processingSpeed: '3-5 Days', requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs] }
    ]
  },
  {
    country: 'China',
    description: 'Corporate procurement pipelines, trade fair operations, and sticker vetting specifications for China.',
    options: [
      { type: 'Business "M" Visa', complexity: 'High', suggestedBaseFeeNGN: 270000, suggestedMarkupNGN: 75000, duration: '30 to 90 Days', processingSpeed: '5-7 Days', requirements: [...coreIdentityDocs, 'Official Chinese domestic trade organization counterpart barcoded invitation letter brief'] },
      { type: 'Tourist "L" Visa', complexity: 'High', suggestedBaseFeeNGN: 230000, suggestedMarkupNGN: 65000, duration: '30 Days', processingSpeed: '5-7 Days', requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs] }
    ]
  },
  {
    country: 'India',
    description: 'Consular paper validation procedures and trade operational configurations for India.',
    options: [
      { type: 'Business eVisa', complexity: 'Medium', suggestedBaseFeeNGN: 170000, suggestedMarkupNGN: 45000, duration: '1 Year Multiple', processingSpeed: '3-5 Days', requirements: [...coreIdentityDocs, 'Indian entity corporate registry registration details'] }
    ]
  },
  {
    country: 'Japan',
    description: 'Strict evidentiary compliance tracking structures for Japanese entry systems.',
    options: [
      { type: 'Short-Stay Tourist Visa', complexity: 'High', suggestedBaseFeeNGN: 210000, suggestedMarkupNGN: 60000, duration: '90 Days', processingSpeed: '7-12 Days', requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs, 'Granular Japanese day-by-day travel operational plan framework (IMM format code)'] }
    ]
  },
  {
    country: 'South Korea',
    description: 'Evidentiary checking pipelines and corporate delegate entry profiles for South Korea.',
    options: [
      { type: 'Tourist Visa', complexity: 'High', suggestedBaseFeeNGN: 220000, suggestedMarkupNGN: 60000, duration: '90 Days', processingSpeed: '10-14 Days', requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs] }
    ]
  },
  {
    country: 'Thailand',
    description: 'Consular sticker validation pipelines and tourism parameters for Thailand.',
    options: [
      { type: 'Tourist Sticker Visa', complexity: 'Medium', suggestedBaseFeeNGN: 140000, suggestedMarkupNGN: 40000, duration: '60 Days', processingSpeed: '7-10 Days', requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs] }
    ]
  },
  {
    country: 'Indonesia',
    description: 'Dynamic tele-visa immigration frameworks for the Republic of Indonesia.',
    options: [
      { type: 'Tourist eVisa (B211A)', complexity: 'Medium', suggestedBaseFeeNGN: 180000, suggestedMarkupNGN: 50000, duration: '60 Days', processingSpeed: '4-7 Days', requirements: [...coreIdentityDocs, ...standardFinancialDocs, 'Valid Indonesian corporate legal sponsor organization authorization guarantees'] }
    ]
  },
  {
    country: 'Vietnam',
    description: 'Pre-approval immigration clearance configuration data paths for Vietnam.',
    options: [
      { type: 'Tourist eVisa Approval Letter', complexity: 'Medium', suggestedBaseFeeNGN: 130000, suggestedMarkupNGN: 35000, duration: '30 Days', processingSpeed: '5-7 Days', requirements: [...coreIdentityDocs, ...logisticalDocs] }
    ]
  },
  {
    country: 'Maldives',
    description: 'Luxury destination vetting tracking modules for the Republic of Maldives.',
    options: [
      { type: 'Pre-Arrival Clearance eVisa', complexity: 'Low', suggestedBaseFeeNGN: 70000, suggestedMarkupNGN: 25000, duration: '30 Days', processingSpeed: '1-2 Days', requirements: [...coreIdentityDocs, ...logisticalDocs, 'IMUGA official digital declaration registration entry trace logs'] }
    ]
  },

  // --- REGIONAL AFRICA ZONE (VETTING & AD-HOC CONTROLS) ---
  {
    country: 'South Africa',
    description: 'VFS operational routing pipelines and comprehensive financial capacity checking for South Africa.',
    options: [
      { type: 'Visitor Sticker Visa', complexity: 'High', suggestedBaseFeeNGN: 190000, suggestedMarkupNGN: 55000, duration: '90 Days', processingSpeed: '14-30 Days', requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs, 'Detailed employment verification statement, signed and authorized directly by company executive HR representative'] }
    ]
  },
  {
    country: 'Egypt',
    description: 'Consular documentation rules and security checks configuration for Egypt travel operations.',
    options: [
      { type: 'Tourist Sticker Visa', complexity: 'Medium', suggestedBaseFeeNGN: 140000, suggestedMarkupNGN: 40000, duration: '30 Days', processingSpeed: '10-15 Days', requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs] }
    ]
  },
  {
    country: 'Kenya',
    description: 'Digital ETA platform validation logic tracking parameters for Kenya travel networks.',
    options: [
      { type: 'Electronic Travel Authorization (eTA)', complexity: 'Low', suggestedBaseFeeNGN: 65000, suggestedMarkupNGN: 20000, duration: 'Single Entry', processingSpeed: '1-3 Days', requirements: [...coreIdentityDocs, ...logisticalDocs] }
    ]
  },
  {
    country: 'Rwanda',
    description: 'Regional entry monitoring systems configuration parameters for Rwanda travel networks.',
    options: [
      { type: 'Electronic Entry Clearance eVisa', complexity: 'Low', suggestedBaseFeeNGN: 60000, suggestedMarkupNGN: 20000, duration: '30 Days', processingSpeed: '1-2 Days', requirements: [...coreIdentityDocs, ...logisticalDocs] }
    ]
  },
  {
    country: 'Ghana',
    description: 'ECOWAS operational baseline parameters modified for structured long-stay entries into Ghana.',
    options: [
      { type: 'Non-ECOWAS Resident Work Permit', complexity: 'Medium', suggestedBaseFeeNGN: 180000, suggestedMarkupNGN: 50000, duration: '1 Year', processingSpeed: '14-21 Days', requirements: [...coreIdentityDocs, 'GIPC corporate operational license validation document registers'] }
    ]
  },
  {
    country: 'Morocco',
    description: 'North African consular processing checks and sticker allocation paradigms for Morocco.',
    options: [
      { type: 'Tourist Sticker Visa', complexity: 'Medium', suggestedBaseFeeNGN: 150000, suggestedMarkupNGN: 45000, duration: '30 Days', processingSpeed: '7-14 Days', requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs] }
    ]
  },
  {
    country: 'Tanzania',
    description: 'Modular digital eVisa tracking and tourism checking scripts for Tanzania travel profiles.',
    options: [
      { type: 'Tourist eVisa', complexity: 'Low', suggestedBaseFeeNGN: 90000, suggestedMarkupNGN: 25000, duration: '90 Days', processingSpeed: '3-5 Days', requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs] }
    ]
  },
  {
    country: 'Uganda',
    description: 'East African unified platform electronic data collection configuration for Uganda entries.',
    options: [
      { type: 'Tourist eVisa', complexity: 'Low', suggestedBaseFeeNGN: 85000, suggestedMarkupNGN: 25000, duration: '90 Days', processingSpeed: '2-4 Days', requirements: [...coreIdentityDocs, ...logisticalDocs] }
    ]
  },
  {
    country: 'Ethiopia',
    description: 'Addis Ababa operational hub entry configurations and transit clearances for Ethiopia.',
    options: [
      { type: 'Tourist eVisa', complexity: 'Low', suggestedBaseFeeNGN: 85000, suggestedMarkupNGN: 25000, duration: '30 Days', processingSpeed: '2-3 Days', requirements: [...coreIdentityDocs, ...logisticalDocs] }
    ]
  },
  {
    country: 'Mauritius',
    description: 'Evidentiary checking modules and hospitality validations configuration for Mauritius entries.',
    options: [
      { type: 'Pre-Travel Entry Authorization', complexity: 'Low', suggestedBaseFeeNGN: 75000, suggestedMarkupNGN: 25000, duration: '60 Days', processingSpeed: '2-3 Days', requirements: [...coreIdentityDocs, ...logisticalDocs] }
    ]
  },
  {
    country: 'Seychelles',
    description: 'Digital immigration structural border clearing checks configuration for Seychelles entry operations.',
    options: [
      { type: 'Travel Authorization eVisa', complexity: 'Low', suggestedBaseFeeNGN: 60000, suggestedMarkupNGN: 20000, duration: '30 Days', processingSpeed: '1-2 Days', requirements: [...coreIdentityDocs, ...logisticalDocs, 'Mandatory Seychelles environmental tourism registration clearance records token keys'] }
    ]
  },
  {
    country: 'Namibia',
    description: 'Southern African sticker frameworks and corporate introductory vetting modules for Namibia.',
    options: [
      { type: 'Tourist Sticker Visa', complexity: 'Medium', suggestedBaseFeeNGN: 140000, suggestedMarkupNGN: 40000, duration: '90 Days', processingSpeed: '5-10 Days', requirements: [...coreIdentityDocs, ...standardFinancialDocs, ...logisticalDocs] }
    ]
  }
];