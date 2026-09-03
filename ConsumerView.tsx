/**
 * METRISCAN FAST - Citizen Scanner-First Consumer Interface
 * Simple, clear, human, fast, trustworthy, scanner-first experience.
 * No internal complexity, no raw rule numbers, real camera capture.
 */

import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Image as ImageIcon,
  Info,
  Loader2,
  Plus,
  RefreshCw,
  Send,
  Shield,
  Upload,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RealCameraScanner } from './RealCameraScanner';
import { scannerService } from '../compliance/scannerService';
import { Complaint, ProductScanResult } from '../types';

export const ConsumerView: React.FC = () => {
  const {
    submitConsumerComplaint,
    addConsumerScan,
    setRole,
    setActiveTab,
  } = useApp();

  // Screen modes: 'HOME' | 'SCANNING_CAMERA' | 'PHOTO_PREVIEW' | 'ANALYZING' | 'RESULT' | 'REPORT_FORM' | 'REPORT_SUCCESS'
  const [screenMode, setScreenMode] = useState<
    'HOME' | 'SCANNING_CAMERA' | 'PHOTO_PREVIEW' | 'ANALYZING' | 'RESULT' | 'REPORT_FORM' | 'REPORT_SUCCESS'
  >('HOME');

  // Package Photos: Supports Front, Back, Side
  const [photos, setPhotos] = useState<{ id: string; label: string; dataUrl: string }[]>([]);
  const [activePhotoLabel, setActivePhotoLabel] = useState<'Front' | 'Back' | 'Side'>('Front');

  // Scanning progress state
  const [progressStep, setProgressStep] = useState<string>('Reading the package...');

  // Current Scan Result
  const [scanResult, setScanResult] = useState<ProductScanResult | null>(null);

  // Technical details toggle
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  // Grievance / Report Form State
  const [storeName, setStoreName] = useState<string>('');
  const [storeAddress, setStoreAddress] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image capture from Real Camera
  const handleCameraCapture = (capturedDataUrl: string) => {
    setPhotos((prev) => [
      ...prev,
      {
        id: `photo-${Date.now()}`,
        label: activePhotoLabel,
        dataUrl: capturedDataUrl,
      },
    ]);
    setScreenMode('PHOTO_PREVIEW');
  };

  // Handle direct file upload from device
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File, index: number) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const label = index === 0 ? 'Front' : index === 1 ? 'Back' : 'Side';
          setPhotos((prev) => [
            ...prev,
            {
              id: `photo-${Date.now()}-${index}`,
              label,
              dataUrl: reader.result as string,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });

    setScreenMode('PHOTO_PREVIEW');
  };

  // Run the analysis on all captured photos together
  const handleCheckProduct = async () => {
    if (photos.length === 0) return;

    setScreenMode('ANALYZING');

    const friendlySteps = [
      'Reading the package...',
      'Finding product information...',
      'Checking the package...',
      'Looking for anything unusual...',
      'Preparing your result...',
    ];

    for (const step of friendlySteps) {
      setProgressStep(step);
      await new Promise((r) => setTimeout(r, 450));
    }

    // Primary image is first photo, additional images are rest
    const primaryImage = photos[0].dataUrl;
    const additionalImages = photos.slice(1).map((p) => p.dataUrl);

    const result = await scannerService.scanImage(primaryImage, {
      role: 'CONSUMER',
    });

    if (additionalImages.length > 0) {
      result.additionalImages = additionalImages;
    }

    setScanResult(result);
    // Add to private local session history (does NOT go to government unless reported)
    addConsumerScan(result);
    setScreenMode('RESULT');
  };

  // Submit report to Government
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanResult) return;

    const mainIssue = scanResult.findings.find((f) => f.status !== 'PASS');
    const issueTitle = mainIssue
      ? mainIssue.ruleTitle
      : 'Incomplete or unclear mandatory package declarations';

    const complaint = submitConsumerComplaint({
      productName: scanResult.declarations.productName || 'Packaged Product',
      brand: scanResult.declarations.brand || 'Unbranded',
      consumerName: 'Concerned Citizen',
      sellerName: storeName || 'Local Retailer',
      sellerAddress: storeAddress || 'Market Area',
      issue: issueTitle,
      description:
        additionalNotes ||
        `Consumer scanned this product. Observed issue: ${mainIssue?.reason || 'Required information could not be clearly identified.'}`,
      evidenceImage: photos[0]?.dataUrl || scanResult.image,
      scanResult,
    });

    setSubmittedComplaint(complaint);
    setScreenMode('REPORT_SUCCESS');
  };

  // Reset to clean scan-first home
  const handleScanAnother = () => {
    setPhotos([]);
    setScanResult(null);
    setShowTechnicalDetails(false);
    setStoreName('');
    setStoreAddress('');
    setAdditionalNotes('');
    setSubmittedComplaint(null);
    setScreenMode('HOME');
  };

  // 1. LIVE CAMERA MODAL / SCREEN
  if (screenMode === 'SCANNING_CAMERA') {
    return (
      <RealCameraScanner
        onCapture={handleCameraCapture}
        onClose={() => setScreenMode(photos.length > 0 ? 'PHOTO_PREVIEW' : 'HOME')}
        instructionText={`Place the product label (${activePhotoLabel}) inside the frame.`}
      />
    );
  }

  // 2. SCANNING PROGRESS SCREEN
  if (screenMode === 'ANALYZING') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full text-center">
        <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-6 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <h2 className="font-heading font-bold text-slate-900 text-xl mb-2">
          Checking your product
        </h2>
        <p className="text-slate-600 text-sm font-medium animate-pulse mb-8">
          {progressStep}
        </p>

        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div className="bg-blue-600 h-full rounded-full w-3/4 animate-pulse"></div>
        </div>

        <p className="text-xs text-slate-400 mt-6">
          This takes just a couple of seconds.
        </p>
      </div>
    );
  }

  // 3. PHOTO PREVIEW & MULTI-PHOTO SCREEN
  if (screenMode === 'PHOTO_PREVIEW') {
    return (
      <div className="flex-1 p-4 sm:p-6 max-w-lg mx-auto w-full flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
            <div>
              <h2 className="font-heading font-bold text-slate-900 text-lg">
                Package Photos
              </h2>
              <p className="text-xs text-slate-500">
                You can check this photo now or add back/side labels.
              </p>
            </div>
            <button
              onClick={handleScanAnother}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          {/* Photos Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {photos.map((p, idx) => (
              <div
                key={p.id}
                className="relative bg-white border border-slate-200 rounded-xl overflow-hidden aspect-[4/5] shadow-xs group"
              >
                <img
                  src={p.dataUrl}
                  alt={p.label}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs">
                  {p.label} Photo
                </div>
                <button
                  onClick={() => setPhotos((prev) => prev.filter((item) => item.id !== p.id))}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {photos.length < 3 && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setActivePhotoLabel(photos.length === 1 ? 'Back' : 'Side');
                    setScreenMode('SCANNING_CAMERA');
                  }}
                  className="flex-1 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-4 text-center transition-colors"
                >
                  <Camera className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-700">
                    + Add {photos.length === 1 ? 'Back Label' : 'Side Label'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Use camera</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Photo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action button */}
        <div className="space-y-2 pt-4">
          <button
            onClick={handleCheckProduct}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Check Product ({photos.length} {photos.length === 1 ? 'photo' : 'photos'})
          </button>

          <button
            onClick={() => {
              setPhotos([]);
              setScreenMode('SCANNING_CAMERA');
            }}
            className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            Retake Photo
          </button>
        </div>
      </div>
    );
  }

  // 4. RESULT SCREEN (Human-Friendly)
  if (screenMode === 'RESULT' && scanResult) {
    const isPass = scanResult.overallStatus === 'PASS';
    const isReview = scanResult.overallStatus === 'NEEDS_REVIEW';
    const isIssue = scanResult.overallStatus === 'POTENTIAL_NON_COMPLIANCE';

    // Simple checklist items
    const hasName = !!scanResult.declarations.productName;
    const hasNetQty = !!scanResult.declarations.netQuantity;
    const hasPrice = !!scanResult.declarations.mrp;
    const hasManufacturer = !!scanResult.declarations.manufacturer || !!scanResult.declarations.packer;
    const hasCare = !!scanResult.declarations.consumerCare?.present;

    return (
      <div className="flex-1 p-4 sm:p-6 max-w-lg mx-auto w-full space-y-5">
        {/* Top Status Banner */}
        <div
          className={`p-5 rounded-2xl border text-center ${
            isPass
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : isIssue
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : 'bg-slate-50 border-slate-200 text-slate-900'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-full mx-auto mb-2.5 flex items-center justify-center ${
              isPass
                ? 'bg-emerald-100 text-emerald-700'
                : isIssue
                ? 'bg-amber-100 text-amber-800'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {isPass ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>

          <h2 className="font-heading font-bold text-lg">
            {isPass
              ? 'LOOKS GOOD'
              : isIssue
              ? 'SOMETHING MAY NEED ATTENTION'
              : "WE COULDN'T CHECK EVERYTHING"}
          </h2>

          <p className="text-xs mt-1 text-slate-600 max-w-xs mx-auto">
            {isPass
              ? 'All required consumer details are visible on this package.'
              : 'Some required information could not be clearly identified on the package.'}
          </p>
        </div>

        {/* Product Identity */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3.5 shadow-xs">
          <img
            src={scanResult.image}
            alt="Scanned Package"
            className="w-14 h-14 object-cover rounded-lg bg-slate-100 border border-slate-200 shrink-0"
          />
          <div className="min-w-0">
            <h3 className="font-heading font-bold text-slate-900 text-sm truncate">
              {scanResult.declarations.productName || 'Packaged Commodity'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Brand: {scanResult.declarations.brand || 'Not detected'} • MRP: {scanResult.declarations.mrp || 'N/A'}
            </p>
          </div>
        </div>

        {/* Here's what we found checklist */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <h3 className="font-heading font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
            Here's what we found
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Product name found ({scanResult.declarations.productName || 'Identified'})</span>
            </div>

            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Net quantity found ({scanResult.declarations.netQuantity || 'Declared'})</span>
            </div>

            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Price information found ({scanResult.declarations.mrp || 'Standard declaration'})</span>
            </div>

            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Manufacturer information found</span>
            </div>

            {!hasCare ? (
              <div className="flex items-center gap-2 text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="font-medium">Consumer helpline was not clearly visible.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Consumer care details found</span>
              </div>
            )}
          </div>
        </div>

        {/* If issue detected: What you can do */}
        {!isPass && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
            <h3 className="font-heading font-bold text-slate-900 text-xs uppercase tracking-wider">
              What you can do
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              You can report this product so the information can be checked by the appropriate authority. Normal scans remain private on your phone.
            </p>
          </div>
        )}

        {/* Optional Collapsed Technical Details */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <span>View Technical Details</span>
            {showTechnicalDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showTechnicalDetails && (
            <div className="px-4 pb-4 pt-1 text-xs border-t border-slate-100 space-y-2 text-slate-600">
              <p>
                <strong>Legal Reference:</strong> Evaluated under the Legal Metrology (Packaged Commodities) Rules, 2011.
              </p>
              <p>
                <strong>Label Readability:</strong> {scanResult.readability.textVisibility} visibility, {scanResult.readability.contrast} contrast.
              </p>
              <p>
                <strong>Confidence Level:</strong> High optical concordance ({Math.round(scanResult.overallConfidence * 100)}%).
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {!isPass && (
            <button
              onClick={() => setScreenMode('REPORT_FORM')}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Report Product
            </button>
          )}

          <button
            onClick={handleScanAnother}
            className="w-full py-3 bg-slate-900 hover:bg-black text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" />
            Scan Another Product
          </button>
        </div>
      </div>
    );
  }

  // 5. SIMPLE REPORT FORM
  if (screenMode === 'REPORT_FORM' && scanResult) {
    return (
      <div className="flex-1 p-4 sm:p-6 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div>
            <h2 className="font-heading font-bold text-slate-900 text-lg">
              Report a Problem
            </h2>
            <p className="text-xs text-slate-500">
              Your report will be sent to the Legal Metrology department for review.
            </p>
          </div>
          <button
            onClick={() => setScreenMode('RESULT')}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Back
          </button>
        </div>

        <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
          {/* Prefilled Product Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
            <img
              src={scanResult.image}
              alt="Product"
              className="w-12 h-12 rounded object-cover border border-slate-200 bg-white shrink-0"
            />
            <div className="min-w-0">
              <span className="font-semibold text-slate-900 block truncate">
                {scanResult.declarations.productName || 'Packaged Commodity'}
              </span>
              <span className="text-slate-500 text-[11px] block">
                Brand: {scanResult.declarations.brand || 'Standard'} • Issue: Package information may be incomplete
              </span>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Where did you see this product? *
            </label>
            <input
              type="text"
              required
              placeholder="Store / Shop Name (e.g. Bansal Departmental Store)"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Store Address / Location *
            </label>
            <input
              type="text"
              required
              placeholder="Market Area or Street Address (e.g. Main Market, Sirsa)"
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Additional description (optional)
            </label>
            <textarea
              rows={3}
              placeholder="Any other details (e.g. consumer care helpline was missing or obscured)..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <p className="text-[11px] text-slate-400">
            By submitting, this report enters the official government inspection workflow.
          </p>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setScreenMode('RESULT')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Submit Report
            </button>
          </div>
        </form>
      </div>
    );
  }

  // 6. REPORT SUCCESS SCREEN
  if (screenMode === 'REPORT_SUCCESS' && submittedComplaint) {
    return (
      <div className="flex-1 p-6 max-w-md mx-auto w-full flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <h2 className="font-heading font-bold text-slate-900 text-xl">
          Report Submitted
        </h2>

        <p className="text-xs text-slate-600 mt-2 mb-4 leading-relaxed">
          Your report has been sent for review. An inspection officer will be assigned to verify the establishment.
        </p>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl w-full text-xs text-slate-700 mb-6 font-mono">
          Report ID: <strong className="text-slate-900">{submittedComplaint.id}</strong>
        </div>

        <div className="space-y-2 w-full">
          <button
            onClick={handleScanAnother}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            Done &amp; Check Another Product
          </button>
        </div>
      </div>
    );
  }

  // 0. DEFAULT LANDING: SCANNER-FIRST SCREEN
  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 max-w-md mx-auto w-full text-center select-none">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Brand Header */}
      <div className="mb-8">
        <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 inline-block mb-3">
          Citizen Assistant
        </span>
        <h1 className="font-heading font-extrabold text-slate-900 text-3xl tracking-tight">
          METRISCAN FAST
        </h1>
        <p className="text-slate-600 text-sm mt-1.5 font-medium">
          Check a product before you buy.
        </p>
      </div>

      {/* Primary Action Buttons */}
      <div className="w-full space-y-3.5">
        <button
          onClick={() => {
            setActivePhotoLabel('Front');
            setScreenMode('SCANNING_CAMERA');
          }}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-2xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 active:scale-98"
        >
          <Camera className="w-5 h-5" />
          <span>SCAN PRODUCT</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2.5 active:scale-98"
        >
          <Upload className="w-4 h-4 text-slate-500" />
          <span>UPLOAD PHOTO</span>
        </button>
      </div>

      {/* Secondary Option: Report a problem */}
      <div className="mt-8 pt-6 border-t border-slate-100 w-full flex flex-col items-center gap-2">
        <button
          onClick={() => {
            // Direct report without scanning
            setScreenMode('SCANNING_CAMERA');
          }}
          className="text-xs text-slate-500 hover:text-slate-800 font-medium underline underline-offset-4"
        >
          Report a problem
        </button>

        <p className="text-[11px] text-slate-400 mt-2">
          Checks mandatory price, quantity, and manufacturer declarations under Indian law.
        </p>
      </div>
    </div>
  );
};
