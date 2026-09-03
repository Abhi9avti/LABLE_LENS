/**
 * METRISCAN FAST - Field Inspector Mobile/Field Interface
 * Built for a field officer standing in a store aisle holding a phone.
 * Real continuous camera scanning loop, rapid shelf auditing, Attention Queue,
 * offline sync, and calibrated physical checks.
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Edit3,
  Eye,
  FileCheck,
  FileDown,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Info,
  Layers,
  Loader2,
  MapPin,
  Play,
  Plus,
  RefreshCw,
  Ruler,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Store,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RealCameraScanner } from './RealCameraScanner';
import { scannerService } from '../compliance/scannerService';
import { ComplianceStatus, InspectionSession, ProductScanResult } from '../types';
import { downloadInspectionPDF } from '../services/pdfExport';

export const InspectorView: React.FC = () => {
  const {
    complaints,
    inspections,
    activeInspection,
    startInspectionSession,
    addScanToActiveInspection,
    overrideFindingInInspection,
    finishActiveInspection,
    offlineMode,
    setOfflineMode,
    pendingSyncCount,
    syncPendingRecords,
    setSelectedEvidenceProduct,
    setSelectedEvidenceFinding,
  } = useApp();

  // Active view modes: 'HOME' | 'START_FORM' | 'CAMERA_LOOP' | 'ATTENTION_QUEUE' | 'SUMMARY_CONCLUDE'
  const [activeScreen, setActiveScreen] = useState<
    'HOME' | 'START_FORM' | 'CAMERA_LOOP' | 'ATTENTION_QUEUE' | 'SUMMARY_CONCLUDE'
  >(activeInspection ? 'CAMERA_LOOP' : 'HOME');

  // Start Inspection Form State
  const [shopName, setShopName] = useState<string>('Bansal Departmental Store');
  const [shopAddress, setShopAddress] = useState<string>('Shop 14, Main Market, Sirsa City');
  const [inspectionType, setInspectionType] = useState<
    'ROUTINE' | 'COMPLAINT_DIRECTED' | 'SPECIAL_DRIVE' | 'FESTIVE_SURVEILLANCE'
  >('COMPLAINT_DIRECTED');
  const [selectedComplaintRef, setSelectedComplaintRef] = useState<string>('');

  // Continuous Camera Loop State
  const [isProcessingFrame, setIsProcessingFrame] = useState<boolean>(false);
  const [scanToast, setScanToast] = useState<{ message: string; type: 'PASS' | 'FLAG' | 'INFO' } | null>(null);

  // Attention Queue Selected Item
  const [selectedAttentionItem, setSelectedAttentionItem] = useState<ProductScanResult | null>(null);

  // Calibrated Physical Measurement Modal State
  const [showMeasurementModal, setShowMeasurementModal] = useState<boolean>(false);
  const [measuredValue, setMeasuredValue] = useState<string>('1.8');
  const [measuredUnit, setMeasuredUnit] = useState<string>('mm');
  const [measuredEquipment, setMeasuredEquipment] = useState<string>('Calibrated Optical Reticle #W&M-882');
  const [measurementNotes, setMeasurementNotes] = useState<string>('Physical font height verified under Rule 7.');

  // Finish Inspection Modal State
  const [officerNotes, setOfficerNotes] = useState<string>(
    'Field surveillance conducted. Non-compliant commodities documented for compounding under Rule 32.'
  );
  const [finishedNotice, setFinishedNotice] = useState<InspectionSession | null>(null);

  // Get greeting based on current hour
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'GOOD MORNING' : currentHour < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';

  // Open/Assigned Complaints
  const assignedComplaints = complaints.filter(
    (c) => c.status === 'ASSIGNED' || c.status === 'NEW' || c.status === 'UNDER_INSPECTION'
  );

  // Start new inspection
  const handleStartInspection = (e: React.FormEvent) => {
    e.preventDefault();
    startInspectionSession({
      shopName,
      shopAddress,
      inspectionType,
      complaintRefId: inspectionType === 'COMPLAINT_DIRECTED' && selectedComplaintRef ? selectedComplaintRef : undefined,
      district: 'Sirsa',
      area: 'Sirsa City',
    });
    setActiveScreen('CAMERA_LOOP');
  };

  // Rapid Scan Capture Handler (Runs inside the RealCameraScanner loop)
  const handleContinuousCapture = async (base64Image: string) => {
    if (isProcessingFrame || !activeInspection) return;

    setIsProcessingFrame(true);

    try {
      const result = await scannerService.scanImage(base64Image, { role: 'INSPECTOR' });
      addScanToActiveInspection(result);

      if (result.overallStatus === 'PASS') {
        setScanToast({
          message: `✓ PASS: ${result.declarations.productName || 'Commodity'} conforms`,
          type: 'PASS',
        });
      } else {
        setScanToast({
          message: `⚠ Added to Attention Queue: ${result.declarations.productName || 'Item'}`,
          type: 'FLAG',
        });
      }

      setTimeout(() => setScanToast(null), 1800);
    } catch (e) {
      console.warn('Scan frame failed:', e);
    } finally {
      setIsProcessingFrame(false);
    }
  };

  // Quick officer action: Confirm violation
  const handleConfirmViolation = (item: ProductScanResult) => {
    const mainRule = item.findings.find((f) => f.status !== 'PASS') || item.findings[0];
    if (mainRule) {
      overrideFindingInInspection(
        item.id,
        mainRule.ruleId,
        'POTENTIAL_NON_COMPLIANCE',
        'Officer physically confirmed violation on shelf package.'
      );
    }
  };

  // Quick officer action: Mark as OK
  const handleMarkAsOk = (item: ProductScanResult) => {
    const mainRule = item.findings.find((f) => f.status !== 'PASS') || item.findings[0];
    if (mainRule) {
      overrideFindingInInspection(
        item.id,
        mainRule.ruleId,
        'PASS',
        'Officer physically verified package declaration is present and legible.'
      );
    }
  };

  // Save Physical Measurement
  const handleSaveMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAttentionItem) return;

    overrideFindingInInspection(
      selectedAttentionItem.id,
      'RULE-7-FONT-SIZE',
      'PASS',
      `Physical check: ${measuredValue} ${measuredUnit} measured with ${measuredEquipment}. ${measurementNotes}`,
      `${measuredValue} ${measuredUnit}`
    );

    setShowMeasurementModal(false);
    setSelectedAttentionItem(null);
  };

  // Finish and download report
  const handleConcludeInspection = () => {
    const completed = finishActiveInspection(officerNotes);
    if (completed) {
      setFinishedNotice(completed);
      downloadInspectionPDF(completed);
    }
  };

  // Attention queue items in active session
  const attentionItems = activeInspection?.scannedProducts.filter((p) => p.overallStatus !== 'PASS') || [];

  // ==========================================
  // VIEW: CONTINUOUS CAMERA SCANNING LOOP
  // ==========================================
  if (activeInspection && activeScreen === 'CAMERA_LOOP') {
    const totalCount = activeInspection.scannedProducts.length;
    const passedCount = activeInspection.passedCount;
    const attentionCount = activeInspection.potentialIssuesCount + activeInspection.needsReviewCount;

    return (
      <div className="relative w-full h-full flex-1 flex flex-col">
        {/* Floating Quick Stats Bar Over Camera */}
        <div className="fixed top-14 left-0 right-0 z-50 px-4 py-2 bg-slate-900/90 backdrop-blur-md text-white border-b border-slate-700 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="font-bold text-blue-400 truncate max-w-[120px] sm:max-w-xs">
              {activeInspection.shopName}
            </span>
            <span className="text-slate-400">|</span>
            <span className="font-semibold text-slate-200">Total: {totalCount}</span>
            <span className="text-emerald-400 font-semibold">Pass: {passedCount}</span>
            {attentionCount > 0 && (
              <span className="text-amber-400 font-bold bg-amber-500/20 px-1.5 py-0.5 rounded">
                Attention: {attentionCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {attentionCount > 0 && (
              <button
                onClick={() => setActiveScreen('ATTENTION_QUEUE')}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-[11px] font-bold shadow-xs transition-colors"
              >
                Review ({attentionCount})
              </button>
            )}
            <button
              onClick={() => setActiveScreen('SUMMARY_CONCLUDE')}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-bold shadow-xs transition-colors"
            >
              Finish
            </button>
          </div>
        </div>

        {/* Scan Toast feedback */}
        {scanToast && (
          <div className="fixed top-28 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg text-xs font-semibold backdrop-blur-md animate-bounce">
            <div
              className={`px-3 py-1 rounded-full ${
                scanToast.type === 'PASS'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}
            >
              {scanToast.message}
            </div>
          </div>
        )}

        {/* Real Continuous Camera Scanner Component */}
        <RealCameraScanner
          onCapture={handleContinuousCapture}
          onClose={() => setActiveScreen('SUMMARY_CONCLUDE')}
          instructionText="Hold phone to shelf product label. Tap capture to audit."
          continuousMode={true}
          scanCountText={`Checked: ${totalCount}`}
          isProcessing={isProcessingFrame}
        />
      </div>
    );
  }

  // ==========================================
  // VIEW: ATTENTION QUEUE (OFFICER DECISION LIST)
  // ==========================================
  if (activeInspection && activeScreen === 'ATTENTION_QUEUE') {
    return (
      <div className="flex-1 p-4 lg:p-6 max-w-4xl mx-auto w-full space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
              Officer Decision Queue
            </span>
            <h2 className="font-heading font-bold text-slate-900 text-xl mt-1">
              Items Requiring Attention ({attentionItems.length})
            </h2>
            <p className="text-xs text-slate-500">
              {activeInspection.shopName} • AI optical flags awaiting officer physical confirmation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveScreen('CAMERA_LOOP')}
              className="px-3 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Camera className="w-4 h-4" />
              Keep Scanning Shelf
            </button>
            <button
              onClick={() => setActiveScreen('SUMMARY_CONCLUDE')}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              Conclude
            </button>
          </div>
        </div>

        {attentionItems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-bold text-slate-900 text-base">No Items in Attention Queue</h3>
            <p className="text-xs text-slate-500 mt-1">
              All scanned commodities are currently marked conforming.
            </p>
            <button
              onClick={() => setActiveScreen('CAMERA_LOOP')}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
            >
              Scan More Shelf Commodities
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {attentionItems.map((item, idx) => {
              const mainIssue = item.findings.find((f) => f.status !== 'PASS') || item.findings[0];
              const isOverridden = mainIssue.officerOverride;

              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={item.image}
                        alt="Product"
                        className="w-16 h-16 rounded-lg object-cover border border-slate-200 bg-slate-50 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            #{idx + 1} {item.declarations.productName || 'Packaged Commodity'}
                          </span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">
                            {mainIssue.ruleNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Brand: {item.declarations.brand || 'N/A'} • Qty: {item.declarations.netQuantity || 'N/A'} • MRP: {item.declarations.mrp || 'N/A'}
                        </p>
                        <p className="text-xs font-medium text-amber-800 mt-1">
                          Reason: {mainIssue.reason}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => {
                          setSelectedEvidenceProduct(item);
                          setSelectedEvidenceFinding(mainIssue);
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Evidence
                      </button>

                      <button
                        onClick={() => {
                          setSelectedAttentionItem(item);
                          setShowMeasurementModal(true);
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1"
                      >
                        <Ruler className="w-3.5 h-3.5" />
                        Physical Check
                      </button>
                    </div>
                  </div>

                  {/* Officer Decision Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-500">
                      {isOverridden ? (
                        <span className="text-blue-700 font-semibold">
                          ✓ Officer Decision: {isOverridden.overrideStatus} ({isOverridden.note})
                        </span>
                      ) : (
                        <span>Action needed: Verify physical package declaration.</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleConfirmViolation(item)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Confirm Violation
                      </button>

                      <button
                        onClick={() => handleMarkAsOk(item)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark as OK
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Physical Measurement Modal */}
        {showMeasurementModal && selectedAttentionItem && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="font-heading font-bold text-slate-900 text-sm">
                  Add Calibrated Physical Measurement
                </h3>
                <button
                  onClick={() => setShowMeasurementModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Record calibrated instrument measurement for {selectedAttentionItem.declarations.productName}.
              </p>

              <form onSubmit={handleSaveMeasurement} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Measured Value *
                    </label>
                    <input
                      type="text"
                      required
                      value={measuredValue}
                      onChange={(e) => setMeasuredValue(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Unit *</label>
                    <select
                      value={measuredUnit}
                      onChange={(e) => setMeasuredUnit(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                    >
                      <option value="mm">mm (Font Height / Dimensions)</option>
                      <option value="g">g (Net Weight)</option>
                      <option value="kg">kg (Bulk Pack)</option>
                      <option value="ml">ml (Liquid Volume)</option>
                      <option value="L">L (Oil / Milk Pack)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Equipment Used *
                  </label>
                  <input
                    type="text"
                    required
                    value={measuredEquipment}
                    onChange={(e) => setMeasuredEquipment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Officer Observation Notes
                  </label>
                  <textarea
                    rows={2}
                    value={measurementNotes}
                    onChange={(e) => setMeasurementNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMeasurementModal(false)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                  >
                    Save Measurement &amp; Mark Conforming
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW: INSPECTION SUMMARY & CONCLUDE
  // ==========================================
  if (activeInspection && activeScreen === 'SUMMARY_CONCLUDE') {
    const total = activeInspection.scannedProducts.length;
    const passed = activeInspection.passedCount;
    const flagged = activeInspection.potentialIssuesCount;
    const review = activeInspection.needsReviewCount;

    return (
      <div className="flex-1 p-4 lg:p-6 max-w-2xl mx-auto w-full space-y-6">
        <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-slate-900 text-xl">
              Inspection Summary
            </h2>
            <p className="text-xs text-slate-500">
              Establishment: {activeInspection.shopName} • Code: {activeInspection.inspectionCode}
            </p>
          </div>

          <button
            onClick={() => setActiveScreen('CAMERA_LOOP')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
          >
            Back to Camera
          </button>
        </div>

        {/* Audit Metrics */}
        <div className="grid grid-cols-4 gap-2.5">
          <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
            <span className="text-lg font-extrabold text-slate-900 block">{total}</span>
            <span className="text-[10px] text-slate-500 font-medium">Checked</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
            <span className="text-lg font-extrabold text-emerald-700 block">{passed}</span>
            <span className="text-[10px] text-emerald-800 font-medium">Conforming</span>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-center">
            <span className="text-lg font-extrabold text-rose-700 block">{flagged}</span>
            <span className="text-[10px] text-rose-800 font-medium">Violations</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
            <span className="text-lg font-extrabold text-amber-700 block">{review}</span>
            <span className="text-[10px] text-amber-800 font-medium">Under Review</span>
          </div>
        </div>

        {/* Officer Summary Remarks */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
          <label className="font-bold text-slate-800 text-xs block">
            Officer Findings &amp; Directives (Printed on Official Notice):
          </label>
          <textarea
            rows={3}
            value={officerNotes}
            onChange={(e) => setOfficerNotes(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
          />
        </div>

        {/* Finished Notice confirmation if concluded */}
        {finishedNotice ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-emerald-900 text-base">
              Inspection Concluded &amp; Filed
            </h3>
            <p className="text-xs text-emerald-800">
              Notice #{finishedNotice.inspectionCode} has been generated and saved.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => downloadInspectionPDF(finishedNotice)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <FileDown className="w-4 h-4" />
                Download Official PDF
              </button>
              <button
                onClick={() => {
                  setFinishedNotice(null);
                  setActiveScreen('HOME');
                }}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Return to Officer Console
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-2">
            <button
              onClick={handleConcludeInspection}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              Conclude Inspection &amp; Generate Statutory Notice
            </button>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW: START INSPECTION FORM
  // ==========================================
  if (activeScreen === 'START_FORM') {
    return (
      <div className="flex-1 p-4 lg:p-6 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div>
            <h2 className="font-heading font-bold text-slate-900 text-lg">
              Start New Inspection
            </h2>
            <p className="text-xs text-slate-500">
              Enter shop premises information to begin shelf scanning.
            </p>
          </div>
          <button
            onClick={() => setActiveScreen('HOME')}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleStartInspection} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Shop / Establishment Name *</label>
            <input
              type="text"
              required
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Premises Address *</label>
            <input
              type="text"
              required
              value={shopAddress}
              onChange={(e) => setShopAddress(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Inspection Type *</label>
            <select
              value={inspectionType}
              onChange={(e) => setInspectionType(e.target.value as any)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:border-blue-600 focus:outline-none"
            >
              <option value="ROUTINE">Routine Surveillance Audit</option>
              <option value="COMPLAINT_DIRECTED">Complaint-Directed On-Site Inspection</option>
              <option value="SPECIAL_DRIVE">Special Enforcement Drive (Festive / Commodity)</option>
              <option value="FESTIVE_SURVEILLANCE">Sweets &amp; Edible Packaged Commodities</option>
            </select>
          </div>

          {inspectionType === 'COMPLAINT_DIRECTED' && (
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Link to Citizen Grievance Docket
              </label>
              <select
                value={selectedComplaintRef}
                onChange={(e) => {
                  setSelectedComplaintRef(e.target.value);
                  const cmp = complaints.find((c) => c.id === e.target.value);
                  if (cmp) {
                    setShopName(cmp.sellerName);
                    setShopAddress(cmp.sellerAddress);
                  }
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="">-- Select Assigned Docket --</option>
                {assignedComplaints.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} • {c.sellerName} ({c.issue})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900">
            Scanning immediately launches the continuous camera. Conforming packages are recorded rapidly without interrupting your shelf inspection.
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setActiveScreen('HOME')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Start Scanning Shelf
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ==========================================
  // VIEW: INSPECTOR HOME SCREEN
  // ==========================================
  return (
    <div className="flex-1 p-4 lg:p-6 max-w-4xl mx-auto w-full space-y-6">
      {/* Officer Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-blue-700 tracking-wider uppercase">
            {greeting}, OFFICER
          </span>
          <h1 className="font-heading font-extrabold text-slate-900 text-2xl mt-0.5">
            Inspector Rajesh Kumar
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Legal Metrology (Packaged Commodities) Division • Sirsa District
          </p>
        </div>

        {/* Offline Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
          {offlineMode ? (
            <WifiOff className="w-4 h-4 text-amber-600" />
          ) : (
            <Wifi className="w-4 h-4 text-emerald-600" />
          )}
          <span className="text-xs font-medium text-slate-700">
            {offlineMode ? 'Offline Mode' : 'Online'}
          </span>
          <button
            onClick={() => setOfflineMode(!offlineMode)}
            className="ml-2 text-[10px] font-bold text-blue-600 hover:underline"
          >
            Toggle
          </button>
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        onClick={() => {
          if (activeInspection) {
            setActiveScreen('CAMERA_LOOP');
          } else {
            setActiveScreen('START_FORM');
          }
        }}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-2xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2.5 active:scale-98"
      >
        <Play className="w-5 h-5 fill-current" />
        <span>{activeInspection ? 'RESUME ACTIVE INSPECTION' : 'START INSPECTION'}</span>
      </button>

      {/* Offline Pending Sync Bar */}
      {pendingSyncCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-amber-900">
            <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>{pendingSyncCount} completed inspection(s)</strong> stored locally on this device.
            </span>
          </div>
          <button
            onClick={syncPendingRecords}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs"
          >
            Sync Records ({pendingSyncCount})
          </button>
        </div>
      )}

      {/* Assigned Inspections List (From Government Assignment) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-blue-600" />
            <h2 className="font-heading font-bold text-slate-900 text-sm">
              Assigned Inspections ({assignedComplaints.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">Transmitted from Government Portal</span>
        </div>

        {assignedComplaints.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            No pending citizen grievance assignments for your jurisdiction today.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {assignedComplaints.map((cmp) => (
              <div
                key={cmp.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{cmp.sellerName}</span>
                    <span className="text-[10px] bg-rose-50 text-rose-700 font-semibold px-2 py-0.5 rounded border border-rose-100">
                      {cmp.priority || 'HIGH'} PRIORITY
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{cmp.id}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {cmp.sellerAddress} • Issue: {cmp.issue}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShopName(cmp.sellerName);
                    setShopAddress(cmp.sellerAddress);
                    setInspectionType('COMPLAINT_DIRECTED');
                    setSelectedComplaintRef(cmp.id);
                    setActiveScreen('START_FORM');
                  }}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Audit Store
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Inspection Sessions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <h2 className="font-heading font-bold text-slate-900 text-sm">
          Recent Completed Inspections
        </h2>

        <div className="divide-y divide-slate-100">
          {inspections.slice(0, 3).map((ins) => (
            <div key={ins.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 block">{ins.shopName}</span>
                <span className="text-slate-500 text-[11px]">
                  {new Date(ins.startTime).toLocaleDateString('en-IN')} • {ins.scannedProducts.length} items audited
                </span>
              </div>

              <button
                onClick={() => downloadInspectionPDF(ins)}
                className="px-2.5 py-1 text-blue-600 hover:text-blue-800 font-semibold border border-blue-200 rounded-lg"
              >
                Download Notice
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
