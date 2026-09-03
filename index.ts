/**
 * METRISCAN FAST - Legal Metrology Compliance Data Types
 * Comprehensive data schema for Packaged Commodities Rules, 2011 compliance ecosystem.
 */

export type UserRole = 'CONSUMER' | 'RETAILER' | 'INSPECTOR' | 'ADMIN';

export type ComplianceStatus = 
  | 'PASS' 
  | 'POTENTIAL_NON_COMPLIANCE' 
  | 'NEEDS_REVIEW' 
  | 'NOT_APPLICABLE' 
  | 'ERROR';

export type ComplaintStatus = 
  | 'NEW' 
  | 'ASSIGNED' 
  | 'UNDER_INSPECTION' 
  | 'VERIFIED' 
  | 'RESOLVED' 
  | 'DISMISSED';

export type InspectionStatus = 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'SYNCED' 
  | 'PENDING_SYNC';

export interface EvidenceRegion {
  box_2d?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0-1000
  label: string;
  detectedText: string;
  confidence: number;
}

export interface RuleFinding {
  ruleId: string;
  ruleNumber: string;
  ruleTitle: string;
  field: string;
  detectedValue: string | null;
  expectedRequirement: string;
  status: ComplianceStatus;
  confidence: number;
  reason: string;
  evidenceRegion?: EvidenceRegion;
  requiresHumanVerification: boolean;
  officerOverride?: {
    overriddenBy: string;
    overrideStatus: ComplianceStatus;
    note: string;
    timestamp: string;
    calibratedMeasurement?: string;
  };
}

export interface ExtractedDeclarations {
  productName: string | null;
  brand: string | null;
  genericName: string | null;
  manufacturer: string | null;
  packer: string | null;
  importer: string | null;
  countryOfOrigin: string | null;
  netQuantity: string | null;
  quantityUnit: string | null;
  mrp: string | null;
  unitSalePrice: string | null;
  manufactureDate: string | null;
  bestBefore: string | null;
  useBy: string | null;
  consumerCare: {
    present: boolean;
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    rawText?: string;
  } | null;
  dimensions?: string | null;
  fssaiNumber?: string | null;
  batchNumber?: string | null;
  barcode?: string | null;
}

export interface ReadabilityAnalysis {
  textVisibility: 'GOOD' | 'ACCEPTABLE' | 'POOR' | 'UNREADABLE';
  contrast: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedReadability: 'EXCELLENT' | 'ACCEPTABLE' | 'MARGINAL' | 'POOR';
  potentiallySmallText: string[];
  physicalMeasurementNotice: string;
}

export interface ProductScanResult {
  id: string;
  scanTimestamp: string;
  image: string;
  additionalImages?: string[];
  category: string;
  declarations: ExtractedDeclarations;
  findings: RuleFinding[];
  readability: ReadabilityAnalysis;
  overallStatus: ComplianceStatus;
  overallConfidence: number;
  rulesCheckedCount: number;
  potentialIssuesCount: number;
  needsReviewCount: number;
  passedCount: number;
  sourceRole: UserRole;
  notes?: string;
  physicalMeasurements?: {
    actualNetWeight?: string;
    measuredFontHeightMm?: string;
    containerVolume?: string;
    notes?: string;
  };
}

export interface Complaint {
  id: string;
  productId?: string;
  productName: string;
  brand: string;
  consumerName: string;
  consumerContact?: string;
  sellerName: string;
  sellerAddress: string;
  district: string;
  area: string;
  issue: string;
  description: string;
  evidenceImage: string;
  scanResult?: ProductScanResult;
  status: ComplaintStatus;
  assignedOfficeId?: string;
  assignedOfficeName?: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  timeline: {
    timestamp: string;
    actor: string;
    action: string;
    notes?: string;
  }[];
}

export interface InspectionSession {
  id: string;
  inspectionCode: string;
  officerId: string;
  officerName: string;
  officeId: string;
  officeName: string;
  district: string;
  area: string;
  shopName: string;
  shopAddress: string;
  shopLicenseNumber?: string;
  inspectionType: 'ROUTINE' | 'COMPLAINT_DIRECTED' | 'SPECIAL_DRIVE' | 'FESTIVE_SURVEILLANCE';
  complaintRefId?: string;
  startTime: string;
  endTime?: string;
  scannedProducts: ProductScanResult[];
  status: InspectionStatus;
  syncedToGov: boolean;
  totalScanned: number;
  passedCount: number;
  potentialIssuesCount: number;
  needsReviewCount: number;
  officerSummaryNotes?: string;
  reportId?: string;
  offlineCreated?: boolean;
}

export interface InspectionOffice {
  id: string;
  name: string;
  district: string;
  state: string;
  address: string;
  contactNumber: string;
  email: string;
  jurisdictionAreas: string[];
  activeOfficersCount: number;
}

export interface OfficerProfile {
  id: string;
  name: string;
  designation: string;
  badgeNumber: string;
  pin: string;
  officeId: string;
  officeName: string;
  district: string;
  phone: string;
  email: string;
  activeDuty: boolean;
}

export interface ComplianceReport {
  id: string;
  reportCode: string;
  type: 'INSPECTION_NOTICE' | 'COMPLIANCE_CERTIFICATE' | 'RETAILER_AUDIT' | 'CONSUMER_GRIEVANCE_REPORT';
  title: string;
  generatedBy: string;
  role: UserRole;
  createdAt: string;
  inspectionId?: string;
  complaintId?: string;
  entityName: string;
  entityAddress: string;
  scannedProductsCount: number;
  findingsSummary: {
    passed: number;
    potentialIssues: number;
    needsReview: number;
  };
  detailedFindings: RuleFinding[];
  evidenceImages: string[];
  officerRemarks?: string;
  legalNoticeReference?: string;
  status: 'DRAFT' | 'OFFICIALLY_ISSUED' | 'ARCHIVED';
  downloadable: boolean;
}
