/**
 * METRISCAN - Interactive Guided Demonstration
 * Clean, human-friendly step-by-step walkthrough guiding evaluators through the multi-role architecture.
 */

import React from 'react';
import {
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  FileCheck,
  FileText,
  Lock,
  Play,
  QrCode,
  Shield,
  ShieldAlert,
  Sparkles,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DemoWalkthroughModal: React.FC = () => {
  const {
    demoWalkthroughActive,
    demoStep,
    setDemoStep,
    closeDemoWalkthrough,
    setRole,
    setActiveTab,
    startInspectionSession,
  } = useApp();

  if (!demoWalkthroughActive) return null;

  const steps = [
    {
      step: 1,
      title: 'Citizen Scans Packaged Commodity',
      role: 'CONSUMER' as const,
      tab: 'dashboard',
      description: 'A citizen scans a package (e.g. Royal Basmati Rice 5kg) to verify mandatory legal declarations.',
      actionLabel: 'Go to Citizen Scanner',
      action: () => {
        setRole('CONSUMER');
        setActiveTab('dashboard');
        setDemoStep(2);
      },
    },
    {
      step: 2,
      title: 'AI Compliance Detection',
      role: 'CONSUMER' as const,
      tab: 'dashboard',
      description: 'The AI engine evaluates mandatory declarations under Legal Metrology Rules, 2011 and highlights missing consumer care details or unit sale price.',
      actionLabel: 'Examine & File Grievance',
      action: () => {
        setRole('CONSUMER');
        setActiveTab('dashboard');
        setDemoStep(3);
      },
    },
    {
      step: 3,
      title: 'Citizen Submits Grievance Docket',
      role: 'CONSUMER' as const,
      tab: 'dashboard',
      description: 'Citizen files formal grievance with pre-filled optical evidence. Docket CMP-2026-00142 is created and routed directly to the Government Dashboard.',
      actionLabel: 'Open Government Dashboard',
      action: () => {
        setRole('ADMIN');
        setActiveTab('complaints');
        setDemoStep(4);
      },
    },
    {
      step: 4,
      title: 'Government Admin Assigns Inspection',
      role: 'ADMIN' as const,
      tab: 'complaints',
      description: 'Assistant Controller reviews the evidence docket and assigns a field inspection to Inspector Rajesh Kumar at Inspection Office - Sirsa.',
      actionLabel: 'Switch to Inspector View',
      action: () => {
        setRole('INSPECTOR');
        setActiveTab('dashboard');
        setDemoStep(5);
      },
    },
    {
      step: 5,
      title: 'Field Officer Rapid Store Audit',
      role: 'INSPECTOR' as const,
      tab: 'dashboard',
      description: 'Inspector conducts rapid continuous store scanning. Non-compliant commodities are automatically routed into the Attention Queue.',
      actionLabel: 'Review Flagged Items & Override',
      action: () => {
        setRole('INSPECTOR');
        setActiveTab('dashboard');
        setDemoStep(6);
      },
    },
    {
      step: 6,
      title: 'Officer Overrides & Physical Measurement',
      role: 'INSPECTOR' as const,
      tab: 'dashboard',
      description: 'Officer applies statutory overrides and records physical measurements (e.g. font height 1.8mm, calibrated net weight).',
      actionLabel: 'Conclude & Generate Notice',
      action: () => {
        setRole('INSPECTOR');
        setActiveTab('dashboard');
        setDemoStep(7);
      },
    },
    {
      step: 7,
      title: 'Notice Generation & Government Sync',
      role: 'ADMIN' as const,
      tab: 'reports',
      description: 'The inspection report is generated, downloadable as official PDF, and synced to the Central Government Repository, updating the grievance status.',
      actionLabel: 'Complete Tour',
      action: () => {
        setRole('ADMIN');
        setActiveTab('overview');
        closeDemoWalkthrough();
      },
    },
  ];

  const currentStepInfo = steps.find((s) => s.step === demoStep) || steps[0];

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 px-4 py-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="font-heading font-bold text-xs">
            Interactive Walkthrough
          </span>
        </div>
        <button
          onClick={closeDemoWalkthrough}
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-100 flex">
        {steps.map((s) => (
          <div
            key={s.step}
            className={`flex-1 transition-all ${
              s.step <= demoStep ? 'bg-blue-600' : 'bg-transparent'
            }`}
          ></div>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">
            Step {currentStepInfo.step} of {steps.length} • {currentStepInfo.role}
          </span>
        </div>

        <h3 className="font-heading font-bold text-slate-900 text-sm">
          {currentStepInfo.title}
        </h3>

        <p className="text-xs text-slate-600 leading-relaxed">
          {currentStepInfo.description}
        </p>

        {/* Action button */}
        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={() => setDemoStep(Math.max(1, demoStep - 1))}
            disabled={demoStep === 1}
            className="text-xs text-slate-500 hover:text-slate-800 disabled:opacity-30 font-medium"
          >
            ← Previous
          </button>

          <button
            onClick={currentStepInfo.action}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span>{currentStepInfo.actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
