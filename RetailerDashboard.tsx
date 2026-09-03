/**
 * METRISCAN FAST - Retailer Pre-Shelf Stock Audit Console
 * Practical business tool for shopkeepers & distributors to audit incoming stock
 * before putting items on the shelf to prevent non-compliance liability under Section 36.
 */

import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Download,
  Eye,
  FileCheck,
  FileDown,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Info,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Store,
  Upload,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RealCameraScanner } from './RealCameraScanner';
import { scannerService } from '../compliance/scannerService';
import { ProductScanResult } from '../types';
import { downloadRetailerPDF } from '../services/pdfExport';

export const RetailerDashboard: React.FC = () => {
  const {
    retailerScans,
    addRetailerScan,
    setSelectedEvidenceProduct,
    setSelectedEvidenceFinding,
    submitConsumerComplaint,
  } = useApp();

  const [activeScan, setActiveScan] = useState<ProductScanResult | null>(retailerScans[0] || null);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanMessage, setScanMessage] = useState<string>('');

  // Report Supplier Modal
  const [showSupplierModal, setShowSupplierModal] = useState<boolean>(false);
  const [supplierName, setSupplierName] = useState<string>('Om Wholesale Distributors');
  const [supplierAddress, setSupplierAddress] = useState<string>('Plot 42, Grain Market Yard, Sirsa');
  const [supplierNote, setSupplierNote] = useState<string>(
    'Received shipment containing 50 packages with missing mandatory consumer care helpline.'
  );
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle capture from real camera
  const handleCameraCapture = async (base64Image: string) => {
    setShowCamera(false);
    setIsScanning(true);
    setScanMessage('Auditing stock package label...');

    try {
      const result = await scannerService.scanImage(base64Image, { role: 'RETAILER' });
      setActiveScan(result);
      addRetailerScan(result);
    } catch (e) {
      console.warn('Retailer scan failed:', e);
    } finally {
      setIsScanning(false);
    }
  };

  // Handle direct file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        setIsScanning(true);
        setScanMessage('Auditing stock package label...');
        const result = await scannerService.scanImage(reader.result, { role: 'RETAILER' });
        setActiveScan(result);
        addRetailerScan(result);
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit report to Supplier & Legal Metrology
  const handleReportSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeScan) return;

    const complaint = submitConsumerComplaint({
      productName: activeScan.declarations.productName || 'Stock Commodity',
      brand: activeScan.declarations.brand || 'Unspecified',
      consumerName: 'Singhal Departmental Store (Retailer Pre-Shelf Audit)',
      consumerContact: '+91 94160 55412',
      sellerName: supplierName,
      sellerAddress: supplierAddress,
      district: 'Sirsa',
      area: 'Grain Market',
      issue: `Defective Supplier Stock: ${activeScan.findings.find((f) => f.status !== 'PASS')?.reason || 'Missing declarations'}`,
      description: supplierNote,
      evidenceImage: activeScan.image,
      scanResult: activeScan,
    });

    setReportSuccess(complaint.id);
    setShowSupplierModal(false);
  };

  if (showCamera) {
    return (
      <RealCameraScanner
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
        instructionText="Hold phone to stock package label. Tap capture to audit."
      />
    );
  }

  return (
    <div className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            Retailer &amp; Merchant Console
          </span>
          <h1 className="font-heading font-extrabold text-slate-900 text-2xl mt-1">
            Check Products Before Stocking
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit delivered wholesale cartons to ensure mandatory Legal Metrology compliance before display on store shelves.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCamera(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            <span>SCAN PRODUCT</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Photo</span>
          </button>
        </div>
      </div>

      {/* Report Success Toast */}
      {reportSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Supplier shipment non-compliance reported. Docket Reference:{' '}
              <strong className="font-mono text-emerald-950">{reportSuccess}</strong>
            </span>
          </div>
          <button
            onClick={() => setReportSuccess(null)}
            className="text-emerald-700 hover:text-emerald-950 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Scanning Loader */}
      {isScanning && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-sm">{scanMessage}</h3>
          <p className="text-xs text-slate-500 mt-1">
            Checking mandatory declarations under Legal Metrology Rules...
          </p>
        </div>
      )}

      {/* Active Audit Card */}
      {activeScan && !isScanning && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3.5">
              <img
                src={activeScan.image}
                alt="Audited Stock"
                className="w-16 h-16 rounded-xl object-cover border border-slate-200 bg-slate-50 shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading font-bold text-slate-900 text-lg">
                    {activeScan.declarations.productName || 'Stock Commodity'}
                  </h2>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      activeScan.overallStatus === 'PASS'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {activeScan.overallStatus === 'PASS' ? '✓ SHELF READY' : '⚠ ATTENTION NEEDED'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Brand: {activeScan.declarations.brand || 'N/A'} • Declared Qty: {activeScan.declarations.netQuantity || 'N/A'} • MRP: {activeScan.declarations.mrp || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadRetailerPDF(activeScan)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <FileDown className="w-4 h-4" />
                Download Report PDF
              </button>

              {activeScan.overallStatus !== 'PASS' && (
                <button
                  onClick={() => setShowSupplierModal(true)}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Report Supplier Product
                </button>
              )}
            </div>
          </div>

          {/* Declarations Grid */}
          <div>
            <h3 className="font-heading font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Mandatory Declarations Assessment
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeScan.findings.map((finding) => (
                <div
                  key={finding.ruleId}
                  className={`p-3.5 rounded-xl border text-xs ${
                    finding.status === 'PASS'
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900">{finding.ruleTitle}</span>
                    {finding.status === 'PASS' ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                      </span>
                    ) : (
                      <span className="text-amber-800 font-bold flex items-center gap-1 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" /> Issue
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {finding.status === 'PASS'
                      ? `Detected: ${finding.detectedValue || 'Conforming declaration verified'}`
                      : finding.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Merchant Advisory */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block">Retailer Protection Notice:</span>
            <p>
              Under Section 36 of the Legal Metrology Act, 2009, retailers can be penalized for displaying packaged goods with missing or obscured declarations. Auditing stock upon delivery safeguards your retail license.
            </p>
          </div>
        </div>
      )}

      {/* Recent Stock Audits List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <h2 className="font-heading font-bold text-slate-900 text-base">
          Recent Stock Audits ({retailerScans.length})
        </h2>

        <div className="divide-y divide-slate-100">
          {retailerScans.map((item) => (
            <div
              key={item.id}
              className="py-3.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 px-2 rounded-lg transition-colors"
              onClick={() => setActiveScan(item)}
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt="Stock"
                  className="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-slate-100"
                />
                <div>
                  <span className="font-bold text-slate-900 block">
                    {item.declarations.productName || 'Packaged Product'}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Brand: {item.declarations.brand || 'N/A'} • {new Date(item.scanTimestamp).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    item.overallStatus === 'PASS'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-800'
                  }`}
                >
                  {item.overallStatus === 'PASS' ? '✓ Conforming' : '⚠ Non-compliant'}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadRetailerPDF(item);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Supplier Modal */}
      {showSupplierModal && activeScan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-heading font-bold text-slate-900 text-sm">
                Report Defective Stock to Supplier &amp; Authority
              </h3>
              <button onClick={() => setShowSupplierModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Notify the wholesale supplier and create an official complaint docket for non-compliant batch stock.
            </p>

            <form onSubmit={handleReportSupplier} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Distributor / Supplier Name *</label>
                <input
                  type="text"
                  required
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Distributor Address / Yard *</label>
                <input
                  type="text"
                  required
                  value={supplierAddress}
                  onChange={(e) => setSupplierAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Batch / Delivery Description *</label>
                <textarea
                  rows={3}
                  required
                  value={supplierNote}
                  onChange={(e) => setSupplierNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Submit Supplier Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
