/**
 * METRISCAN - Legal Metrology Compliance Assistant
 * Clean, human-friendly interface for consumer verification, retailer audit, and enforcement.
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopNavigation } from './components/TopNavigation';
import { ConsumerView } from './components/ConsumerView';
import { GovernmentDashboard } from './components/GovernmentDashboard';
import { InspectorView } from './components/InspectorView';
import { RetailerDashboard } from './components/RetailerDashboard';
import { ProductRepository } from './components/ProductRepository';
import { EvidenceViewerModal } from './components/EvidenceViewerModal';
import { DemoWalkthroughModal } from './components/DemoWalkthroughModal';

const AppContent: React.FC = () => {
  const {
    role,
    activeTab,
    selectedEvidenceProduct,
    setSelectedEvidenceProduct,
    selectedEvidenceFinding,
    setSelectedEvidenceFinding,
  } = useApp();

  const renderMainView = () => {
    if (activeTab === 'repository') {
      return <ProductRepository />;
    }

    switch (role) {
      case 'CONSUMER':
        return <ConsumerView />;
      case 'RETAILER':
        return <RetailerDashboard />;
      case 'INSPECTOR':
        return <InspectorView />;
      case 'ADMIN':
        return <GovernmentDashboard />;
      default:
        return <ConsumerView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased">
      {/* Clean Top Navigation */}
      <TopNavigation />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {renderMainView()}
      </main>

      {/* Optical Evidence Viewer Modal */}
      {selectedEvidenceProduct && (
        <EvidenceViewerModal
          product={selectedEvidenceProduct}
          finding={selectedEvidenceFinding}
          onClose={() => {
            setSelectedEvidenceProduct(null);
            setSelectedEvidenceFinding(null);
          }}
        />
      )}

      {/* Guided Walkthrough Step-by-Step Modal */}
      <DemoWalkthroughModal />

      {/* Clean Simple Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 px-4 lg:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">MetriScan</span>
          <span>•</span>
          <span>Legal Metrology (Packaged Commodities) Rules, 2011 Compliance</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <span>Rule 6 &amp; 7 Declarations</span>
          <span>•</span>
          <span className="text-emerald-600 font-medium">Ready</span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
