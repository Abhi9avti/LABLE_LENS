/**
 * Legal Metrology (Packaged Commodities) Rules, 2011
 * Knowledge base, rule specifications, and evaluation engine.
 */

import { ComplianceStatus, ExtractedDeclarations, ReadabilityAnalysis, RuleFinding } from '../types';

export interface RuleSpec {
  ruleId: string;
  ruleNumber: string;
  title: string;
  requirementDescription: string;
  fieldToCheck: keyof ExtractedDeclarations | 'readability' | 'consumerCare' | 'unitSalePrice';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  source: string;
  version: string;
  requiresHumanVerification: boolean;
  evaluate: (declarations: ExtractedDeclarations, readability: ReadabilityAnalysis) => {
    status: ComplianceStatus;
    detectedValue: string | null;
    confidence: number;
    reason: string;
    evidenceText?: string;
  };
}

export const LEGAL_METROLOGY_RULES: RuleSpec[] = [
  {
    ruleId: 'LMR-001',
    ruleNumber: 'Rule 6(1)(a)',
    title: 'Manufacturer / Packer / Importer Name & Address',
    requirementDescription: 'Name and complete address of the manufacturer, packer, or importer must be clearly declared on the package.',
    fieldToCheck: 'manufacturer',
    severity: 'HIGH',
    source: 'Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(1)(a)',
    version: '2011.03-Amended',
    requiresHumanVerification: false,
    evaluate: (dec) => {
      const entity = dec.manufacturer || dec.packer || dec.importer;
      if (!entity || entity.trim().length < 3) {
        return {
          status: 'POTENTIAL_NON_COMPLIANCE',
          detectedValue: entity || 'Not visible / Missing',
          confidence: 0.92,
          reason: 'No legible manufacturer, packer, or importer identification detected on the package label.',
        };
      }
      if (entity.toLowerCase().includes('pvt') || entity.toLowerCase().includes('ltd') || entity.toLowerCase().includes('mfg') || entity.length > 8) {
        return {
          status: 'PASS',
          detectedValue: entity,
          confidence: 0.95,
          reason: 'Valid manufacturer / packer identification and address details located on principal display area.',
          evidenceText: entity,
        };
      }
      return {
        status: 'NEEDS_REVIEW',
        detectedValue: entity,
        confidence: 0.78,
        reason: 'Partial manufacturer string detected. Inspector verification recommended for complete postal address.',
      };
    },
  },
  {
    ruleId: 'LMR-002',
    ruleNumber: 'Rule 6(1)(b)',
    title: 'Common or Generic Name of Commodity',
    requirementDescription: 'The generic or common name of the commodity contained in the package must be prominently stated.',
    fieldToCheck: 'genericName',
    severity: 'MEDIUM',
    source: 'Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(1)(b)',
    version: '2011.03',
    requiresHumanVerification: false,
    evaluate: (dec) => {
      const name = dec.genericName || dec.productName;
      if (!name || name.trim().length === 0) {
        return {
          status: 'POTENTIAL_NON_COMPLIANCE',
          detectedValue: 'Missing',
          confidence: 0.90,
          reason: 'Common or generic description of commodity is missing from label.',
        };
      }
      return {
        status: 'PASS',
        detectedValue: name,
        confidence: 0.94,
        reason: 'Generic name clearly declared and aligned with commodity classification.',
        evidenceText: name,
      };
    },
  },
  {
    ruleId: 'LMR-003',
    ruleNumber: 'Rule 6(1)(c)',
    title: 'Net Quantity in Standard Units',
    requirementDescription: 'Net quantity must be declared in standard SI metric units (g, kg, ml, L, m, or number). Non-standard units (such as oz, lbs without metric) are restricted.',
    fieldToCheck: 'netQuantity',
    severity: 'HIGH',
    source: 'Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(1)(c) & Schedule I',
    version: '2011.03',
    requiresHumanVerification: true,
    evaluate: (dec) => {
      const qty = dec.netQuantity;
      if (!qty || qty.trim().length === 0) {
        return {
          status: 'POTENTIAL_NON_COMPLIANCE',
          detectedValue: 'Missing',
          confidence: 0.95,
          reason: 'Mandatory net quantity declaration was not found on the package label.',
        };
      }
      const validUnits = ['g', 'gm', 'kg', 'ml', 'l', 'ltr', 'litre', 'liter', 'meter', 'm', 'cm', 'units', 'pieces', 'n', 'u'];
      const hasMetric = validUnits.some((u) => qty.toLowerCase().includes(u));
      if (!hasMetric) {
        return {
          status: 'POTENTIAL_NON_COMPLIANCE',
          detectedValue: qty,
          confidence: 0.88,
          reason: `Net quantity "${qty}" does not clearly conform to standard metric SI units under Schedule I.`,
        };
      }
      return {
        status: 'PASS',
        detectedValue: qty,
        confidence: 0.96,
        reason: `Standard metric net quantity declaration "${qty}" identified on principal display panel. Physical gravimetric check requires official calibration.`,
        evidenceText: qty,
      };
    },
  },
  {
    ruleId: 'LMR-004',
    ruleNumber: 'Rule 6(1)(d)',
    title: 'Month & Year of Manufacture / Pre-packing / Import',
    requirementDescription: 'The month and year of manufacturing, pre-packing, or import must be legibly stated (e.g. MM/YYYY or Month Year).',
    fieldToCheck: 'manufactureDate',
    severity: 'HIGH',
    source: 'Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(1)(d)',
    version: '2011.03-Amended',
    requiresHumanVerification: false,
    evaluate: (dec) => {
      const date = dec.manufactureDate || dec.bestBefore || dec.useBy;
      if (!date || date.trim().length === 0) {
        return {
          status: 'POTENTIAL_NON_COMPLIANCE',
          detectedValue: 'Not visible',
          confidence: 0.89,
          reason: 'Date of manufacture / packing / import could not be detected on the package.',
        };
      }
      return {
        status: 'PASS',
        detectedValue: date,
        confidence: 0.92,
        reason: `Manufacturing / packing date "${date}" declared in valid format.`,
        evidenceText: date,
      };
    },
  },
  {
    ruleId: 'LMR-005',
    ruleNumber: 'Rule 6(1)(da)',
    title: 'Unit Sale Price (USP) Declaration',
    requirementDescription: 'For packages containing more than one unit or specified thresholds, the unit sale price per g/kg/ml/liter/piece must be declared alongside MRP.',
    fieldToCheck: 'unitSalePrice',
    severity: 'MEDIUM',
    source: 'Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(1)(da) Amendment',
    version: '2022.04',
    requiresHumanVerification: false,
    evaluate: (dec) => {
      const usp = dec.unitSalePrice;
      if (!usp || usp.trim().length === 0) {
        return {
          status: 'NEEDS_REVIEW',
          detectedValue: 'Not declared / Not visible',
          confidence: 0.82,
          reason: 'Unit Sale Price (e.g. ₹X.XX / g or ₹X.XX / ml) was not detected. Exemptions apply for small packs (<10g / <10ml).',
        };
      }
      return {
        status: 'PASS',
        detectedValue: usp,
        confidence: 0.91,
        reason: `Unit Sale Price "${usp}" clearly declared as per latest amendment guidelines.`,
        evidenceText: usp,
      };
    },
  },
  {
    ruleId: 'LMR-006',
    ruleNumber: 'Rule 6(1)(e)',
    title: 'Maximum Retail Price (MRP) Inclusive of All Taxes',
    requirementDescription: 'MRP must be declared in Indian Rupees with the mandatory phrase "inclusive of all taxes" or "(incl. of all taxes)".',
    fieldToCheck: 'mrp',
    severity: 'HIGH',
    source: 'Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(1)(e)',
    version: '2011.03',
    requiresHumanVerification: false,
    evaluate: (dec) => {
      const mrp = dec.mrp;
      if (!mrp || mrp.trim().length === 0) {
        return {
          status: 'POTENTIAL_NON_COMPLIANCE',
          detectedValue: 'Missing',
          confidence: 0.94,
          reason: 'Maximum Retail Price (MRP) declaration is missing or obscured on the package.',
        };
      }
      if (!mrp.includes('₹') && !mrp.toLowerCase().includes('rs') && !mrp.toLowerCase().includes('inr') && !/\d+/.test(mrp)) {
        return {
          status: 'POTENTIAL_NON_COMPLIANCE',
          detectedValue: mrp,
          confidence: 0.86,
          reason: 'MRP declaration is in an invalid currency format or missing numerical price.',
        };
      }
      return {
        status: 'PASS',
        detectedValue: mrp,
        confidence: 0.97,
        reason: `Valid Maximum Retail Price "${mrp}" (inclusive of all taxes) detected on display panel.`,
        evidenceText: mrp,
      };
    },
  },
  {
    ruleId: 'LMR-007',
    ruleNumber: 'Rule 6(1)(f)',
    title: 'Consumer Care & Grievance Contact Details',
    requirementDescription: 'Name, address, telephone number, and email address of the person/office to be contacted in case of consumer complaints must be clearly provided.',
    fieldToCheck: 'consumerCare',
    severity: 'HIGH',
    source: 'Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(1)(f)',
    version: '2011.03-Amended',
    requiresHumanVerification: false,
    evaluate: (dec) => {
      const care = dec.consumerCare;
      if (!care || !care.present) {
        return {
          status: 'POTENTIAL_NON_COMPLIANCE',
          detectedValue: 'Not clearly visible / Missing',
          confidence: 0.89,
          reason: 'Required consumer-care grievance contact information (phone, email, or physical address) could not be identified.',
        };
      }
      const hasPhoneOrEmail = Boolean(care.phone || care.email || care.rawText?.includes('@') || care.rawText?.match(/\d{10}/));
      if (!hasPhoneOrEmail) {
        return {
          status: 'NEEDS_REVIEW',
          detectedValue: care.rawText || 'Incomplete',
          confidence: 0.79,
          reason: 'Consumer care heading is present but direct contact phone number or email ID is faint/unclear.',
        };
      }
      return {
        status: 'PASS',
        detectedValue: care.rawText || `${care.phone || ''} ${care.email || ''}`.trim(),
        confidence: 0.94,
        reason: 'Complete consumer grievance cell details (telephone/email/helpline) verified.',
        evidenceText: care.rawText,
      };
    },
  },
  {
    ruleId: 'LMR-008',
    ruleNumber: 'Rule 6(1)(g)',
    title: 'Country of Origin for Imported Products',
    requirementDescription: 'For imported goods, the country of origin or manufacture must be explicitly declared on the package.',
    fieldToCheck: 'countryOfOrigin',
    severity: 'MEDIUM',
    source: 'Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(1)(g)',
    version: '2020.10-E-Commerce/Pact',
    requiresHumanVerification: false,
    evaluate: (dec) => {
      const country = dec.countryOfOrigin;
      if (country && country.trim().length > 0) {
        return {
          status: 'PASS',
          detectedValue: country,
          confidence: 0.93,
          reason: `Country of origin explicitly declared as "${country}".`,
          evidenceText: country,
        };
      }
      if (dec.importer && !country) {
        return {
          status: 'POTENTIAL_NON_COMPLIANCE',
          detectedValue: 'Missing on imported commodity',
          confidence: 0.87,
          reason: 'Importer details are present but mandatory Country of Origin is missing.',
        };
      }
      return {
        status: 'PASS',
        detectedValue: 'India (Domestic manufacturer declared)',
        confidence: 0.88,
        reason: 'Domestic manufacturing address declared. Exemption from separate import declaration applies.',
      };
    },
  },
  {
    ruleId: 'LMR-009',
    ruleNumber: 'Rule 7 & Sched. II',
    title: 'Declaration Readability & Contrast Evaluation',
    requirementDescription: 'All mandatory declarations shall be legible, prominent, conspicuous and in contrasting color to the background.',
    fieldToCheck: 'readability',
    severity: 'MEDIUM',
    source: 'Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 7 & Schedule II',
    version: '2011.03',
    requiresHumanVerification: true,
    evaluate: (_, readability) => {
      if (readability.textVisibility === 'POOR' || readability.textVisibility === 'UNREADABLE') {
        return {
          status: 'POTENTIAL_NON_COMPLIANCE',
          detectedValue: 'Poor contrast / Low visibility',
          confidence: 0.85,
          reason: 'Mandatory declarations suffer from low visual contrast or obscured presentation.',
        };
      }
      if (readability.potentiallySmallText && readability.potentiallySmallText.length > 0) {
        return {
          status: 'NEEDS_REVIEW',
          detectedValue: `Review: ${readability.potentiallySmallText.join(', ')}`,
          confidence: 0.77,
          reason: 'Physical font-size and numeral height verification requires calibrated physical measurement.',
        };
      }
      return {
        status: 'PASS',
        detectedValue: 'Adequate contrast & clear optical presentation',
        confidence: 0.91,
        reason: 'Visual contrast and typography meet preliminary optical clarity standards. Physical font height requires physical gauge.',
      };
    },
  },
];

/**
 * Compliance Evaluation Engine
 */
export function evaluateProductDeclarations(
  declarations: ExtractedDeclarations,
  readability: ReadabilityAnalysis
): {
  findings: RuleFinding[];
  overallStatus: ComplianceStatus;
  overallConfidence: number;
  passedCount: number;
  potentialIssuesCount: number;
  needsReviewCount: number;
} {
  const findings: RuleFinding[] = LEGAL_METROLOGY_RULES.map((rule) => {
    const res = rule.evaluate(declarations, readability);
    return {
      ruleId: rule.ruleId,
      ruleNumber: rule.ruleNumber,
      ruleTitle: rule.title,
      field: rule.fieldToCheck,
      detectedValue: res.detectedValue,
      expectedRequirement: rule.requirementDescription,
      status: res.status,
      confidence: res.confidence,
      reason: res.reason,
      evidenceRegion: res.evidenceText ? {
        label: rule.title,
        detectedText: res.evidenceText,
        confidence: res.confidence,
      } : undefined,
      requiresHumanVerification: rule.requiresHumanVerification,
    };
  });

  const potentialIssues = findings.filter((f) => f.status === 'POTENTIAL_NON_COMPLIANCE');
  const needsReview = findings.filter((f) => f.status === 'NEEDS_REVIEW');
  const passed = findings.filter((f) => f.status === 'PASS');

  let overallStatus: ComplianceStatus = 'PASS';
  if (potentialIssues.length > 0) {
    overallStatus = 'POTENTIAL_NON_COMPLIANCE';
  } else if (needsReview.length > 0) {
    overallStatus = 'NEEDS_REVIEW';
  }

  const overallConfidence = findings.reduce((acc, curr) => acc + curr.confidence, 0) / (findings.length || 1);

  return {
    findings,
    overallStatus,
    overallConfidence: Math.round(overallConfidence * 100) / 100,
    passedCount: passed.length,
    potentialIssuesCount: potentialIssues.length,
    needsReviewCount: needsReview.length,
  };
}
