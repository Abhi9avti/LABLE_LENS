/**
 * METRISCAN FAST - Seed Data & Realistic Packaged Commodity Scenarios
 * For Smart India Hackathon 2026 Legal Metrology Demonstration.
 */

import { Complaint, InspectionOffice, InspectionSession, OfficerProfile, ProductScanResult } from '../types';

export const DEMO_USERS: Record<string, { email: string; name: string; role: 'CONSUMER' | 'RETAILER' | 'INSPECTOR' | 'ADMIN'; office?: string; pin?: string }> = {
  consumer: {
    email: 'consumer@demo.com',
    name: 'Aarav Sharma (Citizen)',
    role: 'CONSUMER',
  },
  retailer: {
    email: 'retailer@demo.com',
    name: 'Suresh Singhal (Retailer - Singhal Mart)',
    role: 'RETAILER',
  },
  inspector: {
    email: 'inspector@demo.com',
    name: 'Inspector Rajesh Kumar (Legal Metrology)',
    role: 'INSPECTOR',
    office: 'Inspection Office - Sirsa',
    pin: '1234',
  },
  admin: {
    email: 'admin@demo.gov.in',
    name: 'Dr. Anita Desai (Assistant Controller, Legal Metrology)',
    role: 'ADMIN',
    office: 'Headquarters - Chandigarh / District Office Sirsa',
  },
};

export const DEMO_OFFICERS: OfficerProfile[] = [
  {
    id: 'OFF-001',
    name: 'Rajesh Kumar',
    designation: 'Senior Legal Metrology Inspector',
    badgeNumber: 'HR-LMO-2024-089',
    pin: '1234',
    officeId: 'OFFICE-SIRSA',
    officeName: 'Inspection Office - Sirsa',
    district: 'Sirsa',
    phone: '+91 98765 43210',
    email: 'rajesh.kumar@haryana.gov.in',
    activeDuty: true,
  },
  {
    id: 'OFF-002',
    name: 'Pooja Verma',
    designation: 'Field Inspection Officer',
    badgeNumber: 'HR-LMO-2025-112',
    pin: '5678',
    officeId: 'OFFICE-SIRSA',
    officeName: 'Inspection Office - Sirsa',
    district: 'Sirsa',
    phone: '+91 98123 45678',
    email: 'pooja.verma@haryana.gov.in',
    activeDuty: true,
  },
  {
    id: 'OFF-003',
    name: 'Vikram Singh',
    designation: 'Legal Metrology Officer',
    badgeNumber: 'HR-LMO-2023-045',
    pin: '9900',
    officeId: 'OFFICE-HISAR',
    officeName: 'District Metrology Center - Hisar',
    district: 'Hisar',
    phone: '+91 99887 76655',
    email: 'vikram.singh@haryana.gov.in',
    activeDuty: true,
  },
];

export const DEMO_OFFICES: InspectionOffice[] = [
  {
    id: 'OFFICE-SIRSA',
    name: 'Inspection Office - Sirsa',
    district: 'Sirsa',
    state: 'Haryana',
    address: 'Mini Secretariat, 2nd Floor, Barnala Road, Sirsa - 125055',
    contactNumber: '01666-248190',
    email: 'lm.sirsa@haryana.gov.in',
    jurisdictionAreas: ['Sirsa City', 'Rania', 'Ellenabad', 'Dabwali'],
    activeOfficersCount: 2,
  },
  {
    id: 'OFFICE-HISAR',
    name: 'District Metrology Center - Hisar',
    district: 'Hisar',
    state: 'Haryana',
    address: 'District Administrative Complex, Hisar - 125001',
    contactNumber: '01662-289450',
    email: 'lm.hisar@haryana.gov.in',
    jurisdictionAreas: ['Hisar Urban', 'Hansi', 'Barwala', 'Uklana'],
    activeOfficersCount: 3,
  },
  {
    id: 'OFFICE-ROHTAK',
    name: 'Divisional Enforcement Wing - Rohtak',
    district: 'Rohtak',
    state: 'Haryana',
    address: 'Civil Lines, Delhi Road, Rohtak - 124001',
    contactNumber: '01262-254320',
    email: 'lm.rohtak@haryana.gov.in',
    jurisdictionAreas: ['Rohtak City', 'Meham', 'Sampla'],
    activeOfficersCount: 4,
  },
];

// Helper to create high-detail SVG packaged commodity mock labels as data URLs
export function createPackageLabelSvg(
  title: string,
  category: string,
  color: string,
  details: {
    mrp: string;
    netQty: string;
    mfg: string;
    consumerCare?: string;
    usp?: string;
    country?: string;
    extraNote?: string;
  }
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
    <rect width="600" height="750" rx="20" fill="#0B0E14"/>
    <rect x="15" y="15" width="570" height="720" rx="16" fill="#131822" stroke="${color}" stroke-width="2"/>
    
    <!-- Top Branding Banner -->
    <rect x="25" y="25" width="550" height="110" rx="10" fill="${color}20" stroke="${color}60" stroke-width="1.5"/>
    <circle cx="70" cy="80" r="28" fill="${color}" opacity="0.9"/>
    <path d="M 60 80 L 67 87 L 82 72" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round"/>
    <text x="115" y="70" fill="#F8FAFC" font-family="system-ui, sans-serif" font-size="24" font-weight="bold">${title}</text>
    <text x="115" y="95" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="13" font-weight="600" letter-spacing="1">COMMODITY: ${category.toUpperCase()}</text>
    <rect x="460" y="45" width="95" height="30" rx="6" fill="#0F172A" stroke="#334155" stroke-width="1"/>
    <text x="507" y="65" fill="#38BDF8" font-family="monospace" font-size="11" text-anchor="middle">PRE-PACKED</text>

    <!-- Principal Display Panel (PDP) Box -->
    <rect x="25" y="150" width="550" height="230" rx="10" fill="#1E293B" stroke="#334155" stroke-width="1"/>
    <text x="45" y="180" fill="#38BDF8" font-family="monospace" font-size="12" font-weight="bold">PRINCIPAL DISPLAY PANEL [RULE 6 &amp; 7]</text>
    
    <line x1="45" y1="195" x2="555" y2="195" stroke="#334155" stroke-width="1"/>
    
    <text x="45" y="225" fill="#94A3B8" font-family="sans-serif" font-size="13">NET QUANTITY / भार:</text>
    <text x="220" y="225" fill="#F1F5F9" font-family="monospace" font-size="15" font-weight="bold">${details.netQty}</text>
    
    <text x="45" y="260" fill="#94A3B8" font-family="sans-serif" font-size="13">MAX. RETAIL PRICE (MRP):</text>
    <text x="220" y="260" fill="#34D399" font-family="monospace" font-size="16" font-weight="bold">${details.mrp}</text>
    <text x="360" y="260" fill="#64748B" font-family="sans-serif" font-size="11">(Incl. of all taxes)</text>

    <text x="45" y="295" fill="#94A3B8" font-family="sans-serif" font-size="13">UNIT SALE PRICE (USP):</text>
    <text x="220" y="295" fill="#E2E8F0" font-family="monospace" font-size="13">${details.usp || 'Not Declared'}</text>

    <text x="45" y="330" fill="#94A3B8" font-family="sans-serif" font-size="13">MFG / PKG DATE:</text>
    <text x="220" y="330" fill="#E2E8F0" font-family="monospace" font-size="13">${details.mfg}</text>

    <text x="45" y="360" fill="#94A3B8" font-family="sans-serif" font-size="13">COUNTRY OF ORIGIN:</text>
    <text x="220" y="360" fill="#E2E8F0" font-family="sans-serif" font-size="13">${details.country || 'India'}</text>

    <!-- Manufacturing & Packer Details Box -->
    <rect x="25" y="395" width="550" height="150" rx="10" fill="#0F172A" stroke="#334155" stroke-width="1"/>
    <text x="45" y="425" fill="#38BDF8" font-family="monospace" font-size="12" font-weight="bold">MANUFACTURED &amp; PACKED BY [RULE 6(1)(a)]</text>
    <text x="45" y="455" fill="#CBD5E1" font-family="sans-serif" font-size="12">${title} Consumer Goods Industries Ltd.</text>
    <text x="45" y="475" fill="#94A3B8" font-family="sans-serif" font-size="11">Plot 45-48, Sector 18 Industrial Area, Gurugram, Haryana - 122015</text>
    <text x="45" y="495" fill="#64748B" font-family="monospace" font-size="11">FSSAI Lic. No: 10821004000189 | Batch: BN-2026/089</text>
    <text x="45" y="525" fill="#94A3B8" font-family="sans-serif" font-size="11">Best Before 12 Months from Packing Date.</text>

    <!-- Consumer Care Cell Box -->
    <rect x="25" y="560" width="550" height="100" rx="10" fill="${details.consumerCare ? '#1E293B' : '#450a0a'}" stroke="${details.consumerCare ? '#334155' : '#EF4444'}" stroke-width="1.5"/>
    <text x="45" y="585" fill="${details.consumerCare ? '#38BDF8' : '#FCA5A5'}" font-family="monospace" font-size="12" font-weight="bold">CONSUMER CARE HELPLINE [RULE 6(1)(f)]</text>
    ${
      details.consumerCare
        ? `<text x="45" y="615" fill="#E2E8F0" font-family="sans-serif" font-size="12">${details.consumerCare}</text>
           <text x="45" y="640" fill="#94A3B8" font-family="sans-serif" font-size="11">Address: Consumer Support Division, Plot 45, Sector 18, Gurugram.</text>`
        : `<text x="45" y="618" fill="#EF4444" font-family="monospace" font-size="13" font-weight="bold">⚠ DECLARATION MISSING OR OBSCURED</text>
           <text x="45" y="640" fill="#FCA5A5" font-family="sans-serif" font-size="11">No consumer complaint phone, email, or contact officer declared on label.</text>`
    }

    <!-- Barcode & Disclaimer Footer -->
    <g transform="translate(45, 680)">
      <rect x="0" y="0" width="4" height="35" fill="#CBD5E1"/>
      <rect x="7" y="0" width="2" height="35" fill="#CBD5E1"/>
      <rect x="12" y="0" width="6" height="35" fill="#CBD5E1"/>
      <rect x="22" y="0" width="3" height="35" fill="#CBD5E1"/>
      <rect x="28" y="0" width="7" height="35" fill="#CBD5E1"/>
      <rect x="38" y="0" width="2" height="35" fill="#CBD5E1"/>
      <rect x="44" y="0" width="5" height="35" fill="#CBD5E1"/>
      <rect x="52" y="0" width="3" height="35" fill="#CBD5E1"/>
      <rect x="58" y="0" width="8" height="35" fill="#CBD5E1"/>
      <rect x="70" y="0" width="2" height="35" fill="#CBD5E1"/>
      <rect x="76" y="0" width="4" height="35" fill="#CBD5E1"/>
      <text x="95" y="22" fill="#64748B" font-family="monospace" font-size="10">8 901030 892109</text>
    </g>

    <text x="320" y="700" fill="#64748B" font-family="monospace" font-size="9" text-anchor="start">METRISCAN VISUAL EVIDENCE MOCK</text>
    ${
      details.extraNote
        ? `<text x="320" y="718" fill="#F59E0B" font-family="sans-serif" font-size="10">${details.extraNote}</text>`
        : ''
    }
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Pre-seeded sample packaged commodities for scanning & testing
export const SAMPLE_PACKAGED_PRODUCTS: Array<{
  id: string;
  name: string;
  brand: string;
  category: string;
  complianceState: 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_REVIEW';
  highlightIssue?: string;
  sampleResult: ProductScanResult;
}> = [
  {
    id: 'PROD-001',
    name: 'Sunrise Digestive High-Fiber Biscuits',
    brand: 'Sunrise Foods',
    category: 'Bakery & Biscuits',
    complianceState: 'COMPLIANT',
    sampleResult: {
      id: 'SCAN-SUNRISE-001',
      scanTimestamp: '2026-09-02T10:14:00Z',
      image: createPackageLabelSvg('Sunrise Digestive Biscuits', 'Biscuits', '#10B981', {
        mrp: '₹40.00',
        netQty: '100 g',
        usp: '₹0.40 / g',
        mfg: '08/2026',
        consumerCare: 'Toll-Free: 1800-180-2244 | Email: care@sunrisefoods.in',
        country: 'India',
      }),
      category: 'Biscuits / Packaged Snacks',
      declarations: {
        productName: 'Sunrise Digestive High-Fiber Biscuits',
        brand: 'Sunrise Foods',
        genericName: 'Biscuits',
        manufacturer: 'Sunrise Foods Pvt. Ltd., Plot 12, Industrial Estate, Sirsa, Haryana - 125055',
        packer: 'Sunrise Foods Pvt. Ltd.',
        importer: null,
        countryOfOrigin: 'India',
        netQuantity: '100 g',
        quantityUnit: 'g',
        mrp: '₹40.00 (Incl. of all taxes)',
        unitSalePrice: '₹0.40 / g',
        manufactureDate: '08/2026',
        bestBefore: '02/2027',
        useBy: null,
        consumerCare: {
          present: true,
          phone: '1800-180-2244',
          email: 'care@sunrisefoods.in',
          name: 'Consumer Care Executive',
          address: 'Sunrise Foods Pvt. Ltd., Sirsa',
          rawText: 'Toll Free: 1800-180-2244, Email: care@sunrisefoods.in',
        },
        dimensions: '140mm x 55mm',
        fssaiNumber: '10821004000189',
        batchNumber: 'BN-2026/089',
        barcode: '8901030892109',
      },
      findings: [
        {
          ruleId: 'LMR-001',
          ruleNumber: 'Rule 6(1)(a)',
          ruleTitle: 'Manufacturer / Packer Details',
          field: 'manufacturer',
          detectedValue: 'Sunrise Foods Pvt. Ltd., Plot 12, Industrial Estate, Sirsa',
          expectedRequirement: 'Name and complete address of manufacturer/packer.',
          status: 'PASS',
          confidence: 0.98,
          reason: 'Complete manufacturer name, postal address and state PIN verified.',
          requiresHumanVerification: false,
        },
        {
          ruleId: 'LMR-002',
          ruleNumber: 'Rule 6(1)(b)',
          ruleTitle: 'Generic Name',
          field: 'genericName',
          detectedValue: 'Biscuits',
          expectedRequirement: 'Generic or common name of commodity.',
          status: 'PASS',
          confidence: 0.96,
          reason: 'Generic name clearly declared on principal display panel.',
          requiresHumanVerification: false,
        },
        {
          ruleId: 'LMR-003',
          ruleNumber: 'Rule 6(1)(c)',
          ruleTitle: 'Net Quantity',
          field: 'netQuantity',
          detectedValue: '100 g',
          expectedRequirement: 'Standard metric SI weight/measure declaration.',
          status: 'PASS',
          confidence: 0.99,
          reason: 'Standard SI metric unit (100 g) clearly formatted.',
          requiresHumanVerification: true,
        },
        {
          ruleId: 'LMR-005',
          ruleNumber: 'Rule 6(1)(da)',
          ruleTitle: 'Unit Sale Price (USP)',
          field: 'unitSalePrice',
          detectedValue: '₹0.40 / g',
          expectedRequirement: 'Unit sale price in standard units.',
          status: 'PASS',
          confidence: 0.95,
          reason: 'Unit sale price calculated and legibly printed.',
          requiresHumanVerification: false,
        },
        {
          ruleId: 'LMR-006',
          ruleNumber: 'Rule 6(1)(e)',
          ruleTitle: 'MRP Declaration',
          field: 'mrp',
          detectedValue: '₹40.00 (Incl. of all taxes)',
          expectedRequirement: 'MRP in Indian currency with tax inclusion text.',
          status: 'PASS',
          confidence: 0.99,
          reason: 'MRP declaration formatted with rupee symbol and tax inclusion note.',
          requiresHumanVerification: false,
        },
        {
          ruleId: 'LMR-007',
          ruleNumber: 'Rule 6(1)(f)',
          ruleTitle: 'Consumer Care Cell',
          field: 'consumerCare',
          detectedValue: 'Toll-Free: 1800-180-2244 | Email: care@sunrisefoods.in',
          expectedRequirement: 'Complete consumer grievance contact details.',
          status: 'PASS',
          confidence: 0.97,
          reason: 'Both phone helpline and email ID detected on package.',
          requiresHumanVerification: false,
        },
        {
          ruleId: 'LMR-009',
          ruleNumber: 'Rule 7 & Sched. II',
          ruleTitle: 'Readability & Contrast',
          field: 'readability',
          detectedValue: 'High contrast black text on white panel',
          expectedRequirement: 'Conspicuous and legible lettering.',
          status: 'PASS',
          confidence: 0.94,
          reason: 'Declaration text optical contrast exceeds readability threshold.',
          requiresHumanVerification: true,
        },
      ],
      readability: {
        textVisibility: 'GOOD',
        contrast: 'HIGH',
        estimatedReadability: 'EXCELLENT',
        potentiallySmallText: [],
        physicalMeasurementNotice: 'Physical font-size measurement requires calibrated millimeter gauge.',
      },
      overallStatus: 'PASS',
      overallConfidence: 0.97,
      rulesCheckedCount: 7,
      potentialIssuesCount: 0,
      needsReviewCount: 0,
      passedCount: 7,
      sourceRole: 'CONSUMER',
    },
  },
  {
    id: 'PROD-002',
    name: 'Royal Heritage Basmati Rice (5kg)',
    brand: 'Royal Agro Millers',
    category: 'Food Grains / Rice',
    complianceState: 'NON_COMPLIANT',
    highlightIssue: 'Rule 6(1)(f) Missing Consumer Care & Rule 6(1)(da) Missing Unit Sale Price',
    sampleResult: {
      id: 'SCAN-RICE-002',
      scanTimestamp: '2026-09-02T10:22:00Z',
      image: createPackageLabelSvg('Royal Heritage Basmati Rice', 'Packaged Food Grain', '#EF4444', {
        mrp: '₹420.00',
        netQty: '5 kg',
        mfg: '07/2026',
        country: 'India',
        extraNote: '⚠ Non-compliance: Consumer Care Helpline Missing',
      }),
      category: 'Food Grains / Packaged Rice',
      declarations: {
        productName: 'Royal Heritage Basmati Rice',
        brand: 'Royal Agro Millers',
        genericName: 'Basmati Rice',
        manufacturer: 'Royal Agro Millers, Grain Market Road, Sirsa, Haryana',
        packer: 'Royal Agro Millers',
        importer: null,
        countryOfOrigin: 'India',
        netQuantity: '5 kg',
        quantityUnit: 'kg',
        mrp: '₹420.00 (Incl. of all taxes)',
        unitSalePrice: null, // Missing!
        manufactureDate: '07/2026',
        bestBefore: '24 Months',
        useBy: null,
        consumerCare: null, // Missing!
        dimensions: '420mm x 310mm',
        fssaiNumber: '10822005000412',
        batchNumber: 'RICE-092B',
        barcode: '8906045812903',
      },
      findings: [
        {
          ruleId: 'LMR-001',
          ruleNumber: 'Rule 6(1)(a)',
          ruleTitle: 'Manufacturer / Packer Details',
          field: 'manufacturer',
          detectedValue: 'Royal Agro Millers, Grain Market Road, Sirsa',
          expectedRequirement: 'Name and complete address of manufacturer/packer.',
          status: 'PASS',
          confidence: 0.94,
          reason: 'Manufacturer name and city address detected.',
          requiresHumanVerification: false,
        },
        {
          ruleId: 'LMR-003',
          ruleNumber: 'Rule 6(1)(c)',
          ruleTitle: 'Net Quantity',
          field: 'netQuantity',
          detectedValue: '5 kg',
          expectedRequirement: 'Standard metric SI weight/measure declaration.',
          status: 'PASS',
          confidence: 0.96,
          reason: 'Declared net quantity 5 kg is in standard SI units. Requires physical scale verification.',
          requiresHumanVerification: true,
        },
        {
          ruleId: 'LMR-005',
          ruleNumber: 'Rule 6(1)(da)',
          ruleTitle: 'Unit Sale Price (USP)',
          field: 'unitSalePrice',
          detectedValue: 'Not declared',
          expectedRequirement: 'Unit sale price (₹/kg) is mandatory for packages > 1kg.',
          status: 'POTENTIAL_NON_COMPLIANCE',
          confidence: 0.91,
          reason: 'Mandatory Unit Sale Price (e.g. ₹84.00 / kg) is absent on the principal display panel.',
          requiresHumanVerification: false,
        },
        {
          ruleId: 'LMR-006',
          ruleNumber: 'Rule 6(1)(e)',
          ruleTitle: 'MRP Declaration',
          field: 'mrp',
          detectedValue: '₹420.00 (Incl. of all taxes)',
          expectedRequirement: 'MRP in Indian currency with tax inclusion text.',
          status: 'PASS',
          confidence: 0.97,
          reason: 'MRP declaration is visible and properly phrased.',
          requiresHumanVerification: false,
        },
        {
          ruleId: 'LMR-007',
          ruleNumber: 'Rule 6(1)(f)',
          ruleTitle: 'Consumer Care & Grievance Contact',
          field: 'consumerCare',
          detectedValue: 'Not clearly visible / Missing',
          expectedRequirement: 'Name, address, phone number, and email ID for consumer complaints.',
          status: 'POTENTIAL_NON_COMPLIANCE',
          confidence: 0.94,
          reason: 'Required consumer-care grievance cell information (helpline phone number and email ID) could not be identified on the package.',
          requiresHumanVerification: false,
        },
        {
          ruleId: 'LMR-009',
          ruleNumber: 'Rule 7 & Sched. II',
          ruleTitle: 'Readability & Font Height',
          field: 'readability',
          detectedValue: 'Acceptable optical contrast',
          expectedRequirement: 'Legible lettering with minimum numeral height.',
          status: 'NEEDS_REVIEW',
          confidence: 0.81,
          reason: 'Physical font-size verification on 5kg polybag requires calibrated millimeter scale.',
          requiresHumanVerification: true,
        },
      ],
      readability: {
        textVisibility: 'ACCEPTABLE',
        contrast: 'HIGH',
        estimatedReadability: 'ACCEPTABLE',
        potentiallySmallText: ['Batch code', 'FSSAI License number'],
        physicalMeasurementNotice: 'Physical font-size verification requires calibrated/reference measurement.',
      },
      overallStatus: 'POTENTIAL_NON_COMPLIANCE',
      overallConfidence: 0.92,
      rulesCheckedCount: 6,
      potentialIssuesCount: 2,
      needsReviewCount: 1,
      passedCount: 3,
      sourceRole: 'CONSUMER',
    },
  },
  {
    id: 'PROD-003',
    name: 'ShinePro Multi-Surface Detergent Powder (1kg)',
    brand: 'Shine Chemical Industries',
    category: 'Household Detergents',
    complianceState: 'NEEDS_REVIEW',
    highlightIssue: 'Rule 7 Font Height / Calibrated Physical Measurement Required',
    sampleResult: {
      id: 'SCAN-DET-003',
      scanTimestamp: '2026-09-02T10:35:00Z',
      image: createPackageLabelSvg('ShinePro Detergent Powder', 'Detergent', '#F59E0B', {
        mrp: '₹135.00',
        netQty: '1 kg',
        usp: '₹135.00 / kg',
        mfg: '06/2026',
        consumerCare: 'Email: support@shinechem.com (Phone missing)',
        country: 'India',
        extraNote: '⚠ Font size in consumer care is very small (requires gauge)',
      }),
      category: 'Detergents & Cleaners',
      declarations: {
        productName: 'ShinePro Multi-Surface Detergent Powder',
        brand: 'Shine Chemical Industries',
        genericName: 'Detergent Powder',
        manufacturer: 'Shine Chemical Industries, Industrial Area Phase II, Sirsa',
        packer: 'Shine Chemical Industries',
        importer: null,
        countryOfOrigin: 'India',
        netQuantity: '1 kg',
        quantityUnit: 'kg',
        mrp: '₹135.00 (Incl. of all taxes)',
        unitSalePrice: '₹135.00 / kg',
        manufactureDate: '06/2026',
        bestBefore: '36 Months',
        useBy: null,
        consumerCare: {
          present: true,
          email: 'support@shinechem.com',
          rawText: 'Feedback: support@shinechem.com',
        },
        dimensions: '220mm x 160mm',
        batchNumber: 'SH-260601',
        barcode: '8908812903412',
      },
      findings: [
        {
          ruleId: 'LMR-001',
          ruleNumber: 'Rule 6(1)(a)',
          ruleTitle: 'Manufacturer Details',
          field: 'manufacturer',
          detectedValue: 'Shine Chemical Industries, Sirsa',
          expectedRequirement: 'Name and complete address.',
          status: 'PASS',
          confidence: 0.93,
          reason: 'Valid manufacturer details located on back panel.',
          requiresHumanVerification: false,
        },
        {
          ruleId: 'LMR-003',
          ruleNumber: 'Rule 6(1)(c)',
          ruleTitle: 'Net Quantity',
          field: 'netQuantity',
          detectedValue: '1 kg',
          expectedRequirement: 'Standard metric SI weight.',
          status: 'PASS',
          confidence: 0.96,
          reason: 'Declared 1 kg in standard metric SI unit.',
          requiresHumanVerification: true,
        },
        {
          ruleId: 'LMR-007',
          ruleNumber: 'Rule 6(1)(f)',
          ruleTitle: 'Consumer Care Details',
          field: 'consumerCare',
          detectedValue: 'Email: support@shinechem.com (Phone number not detected)',
          expectedRequirement: 'Complete contact details including phone & address.',
          status: 'NEEDS_REVIEW',
          confidence: 0.78,
          reason: 'Email is provided but phone number is faint or missing.',
          requiresHumanVerification: true,
        },
        {
          ruleId: 'LMR-009',
          ruleNumber: 'Rule 7 & Sched. II',
          ruleTitle: 'Readability & Font Height',
          field: 'readability',
          detectedValue: 'Potentially small font on consumer contact lines (<2mm)',
          expectedRequirement: 'Minimum letter height based on package volume/area.',
          status: 'NEEDS_REVIEW',
          confidence: 0.74,
          reason: 'Physical font-size verification requires calibrated/reference measurement.',
          requiresHumanVerification: true,
        },
      ],
      readability: {
        textVisibility: 'ACCEPTABLE',
        contrast: 'MEDIUM',
        estimatedReadability: 'MARGINAL',
        potentiallySmallText: ['Consumer care email', 'Batch number', 'Active matter %'],
        physicalMeasurementNotice: 'Physical font-size verification requires calibrated/reference measurement.',
      },
      overallStatus: 'NEEDS_REVIEW',
      overallConfidence: 0.85,
      rulesCheckedCount: 6,
      potentialIssuesCount: 0,
      needsReviewCount: 2,
      passedCount: 4,
      sourceRole: 'RETAILER',
    },
  },
  {
    id: 'PROD-004',
    name: 'Kisan Pure Mustard Oil (1 Litre Bottle)',
    brand: 'Kisan Agrotech',
    category: 'Edible Oils',
    complianceState: 'COMPLIANT',
    sampleResult: {
      id: 'SCAN-OIL-004',
      scanTimestamp: '2026-09-02T10:40:00Z',
      image: createPackageLabelSvg('Kisan Pure Mustard Oil', 'Edible Vegetable Oil', '#10B981', {
        mrp: '₹165.00',
        netQty: '1 L (910 g approx.)',
        usp: '₹165.00 / L',
        mfg: '08/2026',
        consumerCare: 'Helpline: 01666-298711 | care@kisanagrotech.in',
        country: 'India',
      }),
      category: 'Edible Oils & Fats',
      declarations: {
        productName: 'Kisan Pure Kachi Ghani Mustard Oil',
        brand: 'Kisan Agrotech',
        genericName: 'Mustard Oil',
        manufacturer: 'Kisan Agrotech Mills, Hisar Road, Sirsa - 125055',
        packer: 'Kisan Agrotech Mills',
        importer: null,
        countryOfOrigin: 'India',
        netQuantity: '1 L (Net Volume: 1 Litre / Equivalent Net Weight: 910 g)',
        quantityUnit: 'L',
        mrp: '₹165.00 (Incl. of all taxes)',
        unitSalePrice: '₹165.00 / L',
        manufactureDate: '08/2026',
        bestBefore: '09/2027',
        useBy: null,
        consumerCare: {
          present: true,
          phone: '01666-298711',
          email: 'care@kisanagrotech.in',
          rawText: 'Toll Helpline: 01666-298711, care@kisanagrotech.in',
        },
        dimensions: 'Bottle: 280mm x 85mm',
        fssaiNumber: '10819003000871',
        batchNumber: 'MST-260814',
        barcode: '8907812903881',
      },
      findings: [
        {
          ruleId: 'LMR-001',
          ruleNumber: 'Rule 6(1)(a)',
          ruleTitle: 'Manufacturer Details',
          field: 'manufacturer',
          detectedValue: 'Kisan Agrotech Mills, Hisar Road, Sirsa',
          expectedRequirement: 'Name and complete address.',
          status: 'PASS',
          confidence: 0.96,
          reason: 'Complete manufacturer and packaging unit address identified.',
          requiresHumanVerification: false,
        },
        {
          ruleId: 'LMR-003',
          ruleNumber: 'Rule 6(1)(c)',
          ruleTitle: 'Net Volume & Equivalent Mass',
          field: 'netQuantity',
          detectedValue: '1 L (Volume) & 910 g (Mass)',
          expectedRequirement: 'Dual net volume and mass declaration for edible oils.',
          status: 'PASS',
          confidence: 0.98,
          reason: 'Complies with edible oil standard metric volume and mass rules.',
          requiresHumanVerification: true,
        },
        {
          ruleId: 'LMR-005',
          ruleNumber: 'Rule 6(1)(da)',
          ruleTitle: 'Unit Sale Price',
          field: 'unitSalePrice',
          detectedValue: '₹165.00 / L',
          expectedRequirement: 'Unit sale price declaration.',
          status: 'PASS',
          confidence: 0.94,
          reason: 'Unit sale price clearly stated per liter.',
          requiresHumanVerification: false,
        },
        {
          ruleId: 'LMR-006',
          ruleNumber: 'Rule 6(1)(e)',
          ruleTitle: 'MRP Declaration',
          field: 'mrp',
          detectedValue: '₹165.00 (Incl. of all taxes)',
          expectedRequirement: 'MRP with tax declaration.',
          status: 'PASS',
          confidence: 0.99,
          reason: 'Clear MRP declaration with tax inclusion phrase.',
          requiresHumanVerification: false,
        },
        {
          ruleId: 'LMR-007',
          ruleNumber: 'Rule 6(1)(f)',
          ruleTitle: 'Consumer Care Cell',
          field: 'consumerCare',
          detectedValue: '01666-298711 | care@kisanagrotech.in',
          expectedRequirement: 'Helpline phone number & email address.',
          status: 'PASS',
          confidence: 0.95,
          reason: 'Complete grievance contact details verified.',
          requiresHumanVerification: false,
        },
      ],
      readability: {
        textVisibility: 'GOOD',
        contrast: 'HIGH',
        estimatedReadability: 'EXCELLENT',
        potentiallySmallText: [],
        physicalMeasurementNotice: 'Volumetric calibration check requires certified standard cylinder.',
      },
      overallStatus: 'PASS',
      overallConfidence: 0.96,
      rulesCheckedCount: 6,
      potentialIssuesCount: 0,
      needsReviewCount: 0,
      passedCount: 6,
      sourceRole: 'INSPECTOR',
    },
  },
  {
    id: 'PROD-005',
    name: 'Aroma Herbal Refreshing Tea (500g)',
    brand: 'Aroma Plantations',
    category: 'Beverages / Tea',
    complianceState: 'NON_COMPLIANT',
    highlightIssue: 'Rule 6(1)(a) Incomplete Manufacturer Address / No PIN code',
    sampleResult: {
      id: 'SCAN-TEA-005',
      scanTimestamp: '2026-09-02T10:45:00Z',
      image: createPackageLabelSvg('Aroma Herbal Green Tea', 'Tea / Beverage', '#EF4444', {
        mrp: '₹280.00',
        netQty: '500 g',
        usp: '₹0.56 / g',
        mfg: '08/2026',
        consumerCare: 'care@aromatea.com',
        country: 'India',
        extraNote: '⚠ Non-compliance: Incomplete manufacturer postal address',
      }),
      category: 'Beverages / Packaged Tea',
      declarations: {
        productName: 'Aroma Herbal Green Tea',
        brand: 'Aroma Plantations',
        genericName: 'Green Tea',
        manufacturer: 'Aroma Plantations, Assam', // Incomplete!
        packer: 'Aroma Plantations',
        importer: null,
        countryOfOrigin: 'India',
        netQuantity: '500 g',
        quantityUnit: 'g',
        mrp: '₹280.00',
        unitSalePrice: '₹0.56 / g',
        manufactureDate: '08/2026',
        bestBefore: '18 Months',
        useBy: null,
        consumerCare: {
          present: true,
          email: 'care@aromatea.com',
          rawText: 'Email: care@aromatea.com',
        },
        dimensions: '180mm x 110mm',
        fssaiNumber: '10014002000129',
        barcode: '8904412903123',
      },
      findings: [
        {
          ruleId: 'LMR-001',
          ruleNumber: 'Rule 6(1)(a)',
          ruleTitle: 'Manufacturer Address Specificity',
          field: 'manufacturer',
          detectedValue: 'Aroma Plantations, Assam (Incomplete postal address)',
          expectedRequirement: 'Complete postal address with premises, city, state, and postal code.',
          status: 'POTENTIAL_NON_COMPLIANCE',
          confidence: 0.93,
          reason: 'Manufacturer address lacks complete plot/street number and postal PIN code as mandated by Rule 6(1)(a).',
          requiresHumanVerification: false,
        },
        {
          ruleId: 'LMR-003',
          ruleNumber: 'Rule 6(1)(c)',
          ruleTitle: 'Net Quantity',
          field: 'netQuantity',
          detectedValue: '500 g',
          expectedRequirement: 'Standard metric SI weight.',
          status: 'PASS',
          confidence: 0.97,
          reason: 'Declared net quantity 500 g complies with SI standard.',
          requiresHumanVerification: true,
        },
        {
          ruleId: 'LMR-006',
          ruleNumber: 'Rule 6(1)(e)',
          ruleTitle: 'MRP Declaration',
          field: 'mrp',
          detectedValue: '₹280.00',
          expectedRequirement: 'MRP with inclusive tax clause.',
          status: 'PASS',
          confidence: 0.92,
          reason: 'Valid price declared.',
          requiresHumanVerification: false,
        },
      ],
      readability: {
        textVisibility: 'GOOD',
        contrast: 'HIGH',
        estimatedReadability: 'ACCEPTABLE',
        potentiallySmallText: ['FSSAI number'],
        physicalMeasurementNotice: 'Physical font-size verification requires calibrated/reference measurement.',
      },
      overallStatus: 'POTENTIAL_NON_COMPLIANCE',
      overallConfidence: 0.94,
      rulesCheckedCount: 5,
      potentialIssuesCount: 1,
      needsReviewCount: 0,
      passedCount: 4,
      sourceRole: 'RETAILER',
    },
  },
];

// Seeded Complaints for Government & Inspector workflows
export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'CMP-2026-00127',
    productName: 'Royal Heritage Basmati Rice (5kg)',
    brand: 'Royal Agro Millers',
    consumerName: 'Aarav Sharma',
    consumerContact: '+91 98765 00127',
    sellerName: 'Bansal Departmental Store',
    sellerAddress: 'Shop 14, Main Market, Sirsa City, Sirsa - 125055',
    district: 'Sirsa',
    area: 'Sirsa City',
    issue: 'Missing mandatory Consumer Care helpline and missing Unit Sale Price on 5kg polybag.',
    description: 'Purchased a 5kg bag of Royal Heritage Basmati Rice. The packet contains no consumer helpline number or email ID, and no Unit Sale Price per kg is printed.',
    evidenceImage: SAMPLE_PACKAGED_PRODUCTS[1].sampleResult.image,
    scanResult: SAMPLE_PACKAGED_PRODUCTS[1].sampleResult,
    status: 'NEW',
    priority: 'HIGH',
    createdAt: '2026-09-01T14:30:00Z',
    updatedAt: '2026-09-01T14:30:00Z',
    timeline: [
      {
        timestamp: '2026-09-01T14:30:00Z',
        actor: 'Consumer (Aarav Sharma)',
        action: 'Complaint Filed via METRISCAN FAST Mobile Assistant',
        notes: 'AI optical analysis flagged Rule 6(1)(f) and Rule 6(1)(da) potential non-compliances.',
      },
    ],
  },
  {
    id: 'CMP-2026-00124',
    productName: 'Kisan Atta Chakki Fresh (10kg)',
    brand: 'Kisan Agro',
    consumerName: 'Kavita Rani',
    consumerContact: '+91 98111 22334',
    sellerName: 'Gupta Traders',
    sellerAddress: 'Shop 8, Grain Market, Rania, Sirsa - 125076',
    district: 'Sirsa',
    area: 'Rania',
    issue: 'Dual MRP sticker pasted over original printed price.',
    description: 'Found a sticker of ₹480 pasted over printed MRP of ₹430 on the packaging.',
    evidenceImage: SAMPLE_PACKAGED_PRODUCTS[2].sampleResult.image,
    status: 'UNDER_INSPECTION',
    assignedOfficeId: 'OFFICE-SIRSA',
    assignedOfficeName: 'Inspection Office - Sirsa',
    assignedOfficerId: 'OFF-001',
    assignedOfficerName: 'Rajesh Kumar',
    priority: 'URGENT',
    dueDate: '2026-09-05',
    createdAt: '2026-08-28T11:15:00Z',
    updatedAt: '2026-08-29T09:00:00Z',
    timeline: [
      {
        timestamp: '2026-08-28T11:15:00Z',
        actor: 'Consumer (Kavita Rani)',
        action: 'Complaint Filed',
      },
      {
        timestamp: '2026-08-29T09:00:00Z',
        actor: 'Admin (Dr. Anita Desai)',
        action: 'Assigned to Inspection Office - Sirsa (Officer: Rajesh Kumar)',
        notes: 'Priority set to URGENT due to alleged price tampering (Rule 18).',
      },
    ],
  },
  {
    id: 'CMP-2026-00119',
    productName: 'Aroma Herbal Green Tea',
    brand: 'Aroma Plantations',
    consumerName: 'Retailer Audit (Singhal Mart)',
    consumerContact: '+91 98999 11223',
    sellerName: 'Singhal Mart',
    sellerAddress: 'Circular Road, Sirsa - 125055',
    district: 'Sirsa',
    area: 'Sirsa City',
    issue: 'Defective Manufacturer Address from Supplier Batch.',
    description: 'Retailer pre-shelf audit detected incomplete manufacturer address on incoming consignment.',
    evidenceImage: SAMPLE_PACKAGED_PRODUCTS[4].sampleResult.image,
    scanResult: SAMPLE_PACKAGED_PRODUCTS[4].sampleResult,
    status: 'ASSIGNED',
    assignedOfficeId: 'OFFICE-SIRSA',
    assignedOfficeName: 'Inspection Office - Sirsa',
    assignedOfficerId: 'OFF-002',
    assignedOfficerName: 'Pooja Verma',
    priority: 'MEDIUM',
    dueDate: '2026-09-08',
    createdAt: '2026-08-30T16:00:00Z',
    updatedAt: '2026-08-31T10:00:00Z',
    timeline: [
      {
        timestamp: '2026-08-30T16:00:00Z',
        actor: 'Retailer (Suresh Singhal)',
        action: 'Retailer Voluntarily Reported Supplier Batch Non-Compliance',
      },
      {
        timestamp: '2026-08-31T10:00:00Z',
        actor: 'Admin (Dr. Anita Desai)',
        action: 'Assigned to Officer Pooja Verma',
      },
    ],
  },
];

// Seeded Inspection Sessions
export const INITIAL_INSPECTIONS: InspectionSession[] = [
  {
    id: 'INS-2026-041',
    inspectionCode: 'INS-SR-2026-0041',
    officerId: 'OFF-001',
    officerName: 'Rajesh Kumar',
    officeId: 'OFFICE-SIRSA',
    officeName: 'Inspection Office - Sirsa',
    district: 'Sirsa',
    area: 'Sirsa City',
    shopName: 'Aggarwal Provision Store',
    shopAddress: 'Shop 22, Old Bus Stand Road, Sirsa',
    inspectionType: 'ROUTINE',
    startTime: '2026-08-25T11:00:00Z',
    endTime: '2026-08-25T12:30:00Z',
    scannedProducts: [
      SAMPLE_PACKAGED_PRODUCTS[0].sampleResult,
      SAMPLE_PACKAGED_PRODUCTS[3].sampleResult,
    ],
    status: 'SYNCED',
    syncedToGov: true,
    totalScanned: 24,
    passedCount: 22,
    potentialIssuesCount: 1,
    needsReviewCount: 1,
    officerSummaryNotes: 'Routine quarterly verification. Found one unverified edible oil batch; test weight samples conformed to declared gravimetric tolerances under First Schedule.',
    reportId: 'REP-2026-089',
  },
];
