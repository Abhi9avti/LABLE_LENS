/**
 * METRISCAN FAST - Global Reactive Application Context & Connected State Store
 * Connects all 4 roles (Consumer, Retailer, Inspector, Admin) to a unified state engine.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Complaint,
  ComplianceReport,
  ComplianceStatus,
  InspectionOffice,
  InspectionSession,
  OfficerProfile,
  ProductScanResult,
  RuleFinding,
  UserRole,
} from '../types';
import {
  DEMO_OFFICERS,
  DEMO_OFFICES,
  DEMO_USERS,
  INITIAL_COMPLAINTS,
  INITIAL_INSPECTIONS,
  SAMPLE_PACKAGED_PRODUCTS,
} from '../data/seedData';
import { scannerService } from '../compliance/scannerService';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  complaints: Complaint[];
  inspections: InspectionSession[];
  offices: InspectionOffice[];
  officers: OfficerProfile[];
  retailerScans: ProductScanResult[];
  consumerRecentScans: ProductScanResult[];
  activeInspection: InspectionSession | null;
  offlineMode: boolean;
  setOfflineMode: (val: boolean) => void;
  pendingSyncCount: number;
  selectedEvidenceProduct: ProductScanResult | null;
  setSelectedEvidenceProduct: (prod: ProductScanResult | null) => void;
  selectedEvidenceFinding: RuleFinding | null;
  setSelectedEvidenceFinding: (finding: RuleFinding | null) => void;
  demoWalkthroughActive: boolean;
  demoStep: number;
  setDemoStep: (step: number) => void;
  startDemoWalkthrough: () => void;
  closeDemoWalkthrough: () => void;

  // Actions
  submitConsumerComplaint: (data: {
    productName: string;
    brand: string;
    consumerName: string;
    consumerContact?: string;
    sellerName: string;
    sellerAddress: string;
    district?: string;
    area?: string;
    issue: string;
    description: string;
    evidenceImage: string;
    scanResult?: ProductScanResult;
  }) => Complaint;

  assignComplaintToOfficer: (
    complaintId: string,
    officeId: string,
    officerId: string,
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    dueDate?: string
  ) => void;

  startInspectionSession: (params: {
    shopName: string;
    shopAddress: string;
    inspectionType: 'ROUTINE' | 'COMPLAINT_DIRECTED' | 'SPECIAL_DRIVE' | 'FESTIVE_SURVEILLANCE';
    complaintRefId?: string;
    district?: string;
    area?: string;
  }) => InspectionSession;

  addScanToActiveInspection: (scan: ProductScanResult) => void;
  
  overrideFindingInInspection: (
    scanId: string,
    ruleId: string,
    overrideStatus: ComplianceStatus,
    note: string,
    calibratedMeasurement?: string
  ) => void;

  finishActiveInspection: (summaryNotes?: string) => InspectionSession | null;
  syncPendingRecords: () => Promise<void>;
  addRetailerScan: (scan: ProductScanResult) => void;
  addConsumerScan: (scan: ProductScanResult) => void;
  addOffice: (office: Omit<InspectionOffice, 'id' | 'activeOfficersCount'>) => void;
  updateOffice: (office: InspectionOffice) => void;
  deleteOffice: (officeId: string) => void;
  addOfficer: (officer: Omit<OfficerProfile, 'id'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('CONSUMER');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Primary datasets
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('metriscan_complaints');
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });

  const [inspections, setInspections] = useState<InspectionSession[]>(() => {
    const saved = localStorage.getItem('metriscan_inspections');
    return saved ? JSON.parse(saved) : INITIAL_INSPECTIONS;
  });

  const [offices, setOffices] = useState<InspectionOffice[]>(() => {
    const saved = localStorage.getItem('metriscan_offices');
    return saved ? JSON.parse(saved) : DEMO_OFFICES;
  });

  const [officers, setOfficers] = useState<OfficerProfile[]>(() => {
    const saved = localStorage.getItem('metriscan_officers');
    return saved ? JSON.parse(saved) : DEMO_OFFICERS;
  });

  const [retailerScans, setRetailerScans] = useState<ProductScanResult[]>(() => {
    return [SAMPLE_PACKAGED_PRODUCTS[0].sampleResult, SAMPLE_PACKAGED_PRODUCTS[2].sampleResult];
  });

  const [consumerRecentScans, setConsumerRecentScans] = useState<ProductScanResult[]>(() => {
    return [SAMPLE_PACKAGED_PRODUCTS[1].sampleResult];
  });

  const [activeInspection, setActiveInspection] = useState<InspectionSession | null>(null);
  const [offlineMode, setOfflineMode] = useState<boolean>(false);
  const [pendingSyncInspections, setPendingSyncInspections] = useState<InspectionSession[]>([]);

  // Evidence Modal State
  const [selectedEvidenceProduct, setSelectedEvidenceProduct] = useState<ProductScanResult | null>(null);
  const [selectedEvidenceFinding, setSelectedEvidenceFinding] = useState<RuleFinding | null>(null);

  // Demo Mode Walkthrough State
  const [demoWalkthroughActive, setDemoWalkthroughActive] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(0);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('metriscan_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('metriscan_inspections', JSON.stringify(inspections));
  }, [inspections]);

  useEffect(() => {
    localStorage.setItem('metriscan_offices', JSON.stringify(offices));
  }, [offices]);

  useEffect(() => {
    localStorage.setItem('metriscan_officers', JSON.stringify(officers));
  }, [officers]);

  // Submit Consumer Complaint -> Persists to Government Dashboard
  const submitConsumerComplaint = (data: {
    productName: string;
    brand: string;
    consumerName: string;
    consumerContact?: string;
    sellerName: string;
    sellerAddress: string;
    district?: string;
    area?: string;
    issue: string;
    description: string;
    evidenceImage: string;
    scanResult?: ProductScanResult;
  }): Complaint => {
    const newId = `CMP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newComplaint: Complaint = {
      id: newId,
      productName: data.productName,
      brand: data.brand,
      consumerName: data.consumerName,
      consumerContact: data.consumerContact || '+91 98765 00000',
      sellerName: data.sellerName,
      sellerAddress: data.sellerAddress,
      district: data.district || 'Sirsa',
      area: data.area || 'Sirsa City',
      issue: data.issue,
      description: data.description,
      evidenceImage: data.evidenceImage,
      scanResult: data.scanResult,
      status: 'NEW',
      priority: 'HIGH',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          timestamp: new Date().toISOString(),
          actor: `${data.consumerName} (${role})`,
          action: 'Complaint Docket Filed into Government Compliance System',
          notes: 'AI optical extract attached as preliminary evidence.',
        },
      ],
    };

    setComplaints((prev) => [newComplaint, ...prev]);
    return newComplaint;
  };

  // Government Admin assigns complaint to field inspector
  const assignComplaintToOfficer = (
    complaintId: string,
    officeId: string,
    officerId: string,
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    dueDate?: string
  ) => {
    const targetOffice = offices.find((o) => o.id === officeId);
    const targetOfficer = officers.find((o) => o.id === officerId);

    setComplaints((prev) =>
      prev.map((cmp) => {
        if (cmp.id === complaintId) {
          return {
            ...cmp,
            status: 'ASSIGNED',
            assignedOfficeId: officeId,
            assignedOfficeName: targetOffice?.name || 'Inspection Office - Sirsa',
            assignedOfficerId: officerId,
            assignedOfficerName: targetOfficer?.name || 'Inspector Rajesh Kumar',
            priority,
            dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            updatedAt: new Date().toISOString(),
            timeline: [
              ...cmp.timeline,
              {
                timestamp: new Date().toISOString(),
                actor: 'Admin (Dr. Anita Desai)',
                action: `Assigned inspection to ${targetOfficer?.name || 'Officer'} at ${targetOffice?.name || 'Office'}`,
                notes: `Priority: ${priority}, Due: ${dueDate || 'Within 7 days'}`,
              },
            ],
          };
        }
        return cmp;
      })
    );
  };

  // Field Officer starts live inspection session
  const startInspectionSession = (params: {
    shopName: string;
    shopAddress: string;
    inspectionType: 'ROUTINE' | 'COMPLAINT_DIRECTED' | 'SPECIAL_DRIVE' | 'FESTIVE_SURVEILLANCE';
    complaintRefId?: string;
    district?: string;
    area?: string;
  }): InspectionSession => {
    const activeOfficer = officers.find((o) => o.id === 'OFF-001') || officers[0];
    const activeOffice = offices.find((o) => o.id === activeOfficer.officeId) || offices[0];
    const sessionCode = `INS-SR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newSession: InspectionSession = {
      id: `INS-${Date.now()}`,
      inspectionCode: sessionCode,
      officerId: activeOfficer.id,
      officerName: activeOfficer.name,
      officeId: activeOffice.id,
      officeName: activeOffice.name,
      district: params.district || activeOffice.district,
      area: params.area || 'Sirsa City',
      shopName: params.shopName,
      shopAddress: params.shopAddress,
      inspectionType: params.inspectionType,
      complaintRefId: params.complaintRefId,
      startTime: new Date().toISOString(),
      scannedProducts: [],
      status: 'IN_PROGRESS',
      syncedToGov: !offlineMode,
      totalScanned: 0,
      passedCount: 0,
      potentialIssuesCount: 0,
      needsReviewCount: 0,
      offlineCreated: offlineMode,
    };

    setActiveInspection(newSession);

    // If complaint directed, update complaint status to UNDER_INSPECTION
    if (params.complaintRefId) {
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === params.complaintRefId
            ? {
                ...c,
                status: 'UNDER_INSPECTION',
                updatedAt: new Date().toISOString(),
                timeline: [
                  ...c.timeline,
                  {
                    timestamp: new Date().toISOString(),
                    actor: `Inspector ${activeOfficer.name}`,
                    action: `On-site inspection initiated under ${sessionCode}`,
                  },
                ],
              }
            : c
        )
      );
    }

    return newSession;
  };

  // Add scan into the active inspection session
  const addScanToActiveInspection = (scan: ProductScanResult) => {
    if (!activeInspection) return;

    setActiveInspection((prev) => {
      if (!prev) return null;
      const updatedList = [scan, ...prev.scannedProducts];
      const passed = updatedList.filter((s) => s.overallStatus === 'PASS').length;
      const potential = updatedList.filter((s) => s.overallStatus === 'POTENTIAL_NON_COMPLIANCE').length;
      const review = updatedList.filter((s) => s.overallStatus === 'NEEDS_REVIEW').length;

      return {
        ...prev,
        scannedProducts: updatedList,
        totalScanned: updatedList.length,
        passedCount: passed,
        potentialIssuesCount: potential,
        needsReviewCount: review,
      };
    });
  };

  // Officer override for a finding in active inspection
  const overrideFindingInInspection = (
    scanId: string,
    ruleId: string,
    overrideStatus: ComplianceStatus,
    note: string,
    calibratedMeasurement?: string
  ) => {
    if (!activeInspection) return;

    setActiveInspection((prev) => {
      if (!prev) return null;
      const updatedProducts = prev.scannedProducts.map((p) => {
        if (p.id === scanId) {
          const updatedFindings = p.findings.map((f) => {
            if (f.ruleId === ruleId) {
              return {
                ...f,
                status: overrideStatus,
                officerOverride: {
                  overriddenBy: prev.officerName,
                  overrideStatus,
                  note,
                  timestamp: new Date().toISOString(),
                  calibratedMeasurement,
                },
              };
            }
            return f;
          });

          // Recompute overall product status based on overridden findings
          const hasIssue = updatedFindings.some((f) => f.status === 'POTENTIAL_NON_COMPLIANCE');
          const hasReview = updatedFindings.some((f) => f.status === 'NEEDS_REVIEW');
          const newStatus: ComplianceStatus = hasIssue ? 'POTENTIAL_NON_COMPLIANCE' : hasReview ? 'NEEDS_REVIEW' : 'PASS';

          return {
            ...p,
            findings: updatedFindings,
            overallStatus: newStatus,
          };
        }
        return p;
      });

      const passed = updatedProducts.filter((s) => s.overallStatus === 'PASS').length;
      const potential = updatedProducts.filter((s) => s.overallStatus === 'POTENTIAL_NON_COMPLIANCE').length;
      const review = updatedProducts.filter((s) => s.overallStatus === 'NEEDS_REVIEW').length;

      return {
        ...prev,
        scannedProducts: updatedProducts,
        passedCount: passed,
        potentialIssuesCount: potential,
        needsReviewCount: review,
      };
    });
  };

  // Complete and save inspection
  const finishActiveInspection = (summaryNotes?: string): InspectionSession | null => {
    if (!activeInspection) return null;

    const completedSession: InspectionSession = {
      ...activeInspection,
      endTime: new Date().toISOString(),
      status: offlineMode ? 'PENDING_SYNC' : 'SYNCED',
      syncedToGov: !offlineMode,
      officerSummaryNotes: summaryNotes || 'Inspection concluded. Non-compliant commodities documented.',
      reportId: `REP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    if (offlineMode) {
      setPendingSyncInspections((prev) => [completedSession, ...prev]);
    } else {
      setInspections((prev) => [completedSession, ...prev]);
      // If linked to complaint, update complaint to VERIFIED
      if (completedSession.complaintRefId) {
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === completedSession.complaintRefId
              ? {
                  ...c,
                  status: 'VERIFIED',
                  updatedAt: new Date().toISOString(),
                  timeline: [
                    ...c.timeline,
                    {
                      timestamp: new Date().toISOString(),
                      actor: `Inspector ${completedSession.officerName}`,
                      action: `Inspection report ${completedSession.inspectionCode} filed. Statutory notice issued.`,
                      notes: completedSession.officerSummaryNotes,
                    },
                  ],
                }
              : c
          )
        );
      }
    }

    setActiveInspection(null);
    return completedSession;
  };

  // Sync pending offline records
  const syncPendingRecords = async () => {
    if (pendingSyncInspections.length === 0) return;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const syncedList = pendingSyncInspections.map((s) => ({
      ...s,
      status: 'SYNCED' as const,
      syncedToGov: true,
    }));

    setInspections((prev) => [...syncedList, ...prev]);
    
    // Update any linked complaints
    syncedList.forEach((s) => {
      if (s.complaintRefId) {
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === s.complaintRefId
              ? {
                  ...c,
                  status: 'VERIFIED',
                  updatedAt: new Date().toISOString(),
                  timeline: [
                    ...c.timeline,
                    {
                      timestamp: new Date().toISOString(),
                      actor: `Inspector ${s.officerName} (Offline Sync)`,
                      action: `Field report ${s.inspectionCode} synced to Government Central Repository.`,
                    },
                  ],
                }
              : c
          )
        );
      }
    });

    setPendingSyncInspections([]);
  };

  const addRetailerScan = (scan: ProductScanResult) => {
    setRetailerScans((prev) => [scan, ...prev]);
  };

  const addConsumerScan = (scan: ProductScanResult) => {
    setConsumerRecentScans((prev) => [scan, ...prev]);
  };

  const addOffice = (office: Omit<InspectionOffice, 'id' | 'activeOfficersCount'>) => {
    const newOffice: InspectionOffice = {
      ...office,
      id: `OFFICE-${Date.now().toString(36).toUpperCase()}`,
      activeOfficersCount: 1,
    };
    setOffices((prev) => [...prev, newOffice]);
  };

  const updateOffice = (updated: InspectionOffice) => {
    setOffices((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  const deleteOffice = (officeId: string) => {
    setOffices((prev) => prev.filter((o) => o.id !== officeId));
  };

  const addOfficer = (officer: Omit<OfficerProfile, 'id'>) => {
    const newOfficer: OfficerProfile = {
      ...officer,
      id: `OFF-${Math.floor(100 + Math.random() * 900)}`,
    };
    setOfficers((prev) => [...prev, newOfficer]);
  };

  const startDemoWalkthrough = () => {
    setDemoWalkthroughActive(true);
    setDemoStep(1);
  };

  const closeDemoWalkthrough = () => {
    setDemoWalkthroughActive(false);
    setDemoStep(0);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        activeTab,
        setActiveTab,
        complaints,
        inspections,
        offices,
        officers,
        retailerScans,
        consumerRecentScans,
        activeInspection,
        offlineMode,
        setOfflineMode,
        pendingSyncCount: pendingSyncInspections.length,
        selectedEvidenceProduct,
        setSelectedEvidenceProduct,
        selectedEvidenceFinding,
        setSelectedEvidenceFinding,
        demoWalkthroughActive,
        demoStep,
        setDemoStep,
        startDemoWalkthrough,
        closeDemoWalkthrough,
        submitConsumerComplaint,
        assignComplaintToOfficer,
        startInspectionSession,
        addScanToActiveInspection,
        overrideFindingInInspection,
        finishActiveInspection,
        syncPendingRecords,
        addRetailerScan,
        addConsumerScan,
        addOffice,
        updateOffice,
        deleteOffice,
        addOfficer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
