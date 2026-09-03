/**
 * METRISCAN - Evidence Viewer Modal
 * Clean, human-friendly side-by-side inspection view: Image -> Evidence Crop -> Rule -> Findings.
 */

import React from 'react';
import { AlertTriangle, CheckCircle2, ChevronRight, Eye, FileText, Info, ShieldAlert, X } from 'lucide-react';
import { ProductScanResult, RuleFinding } from '../types';

interface EvidenceViewerModalProps {
  product: ProductScanResult | null;
  finding?: RuleFinding | null;
  onClose: () => void;
  onOpenComplaint?: (product: ProductScanResult) => void;
}

export const EvidenceViewerModal: React.FC<EvidenceViewerModalProps> = ({
  product,
  finding,
  onClose,
  onOpenComplaint,
}) => {
  if (!product) return null;

  const activeFinding = finding || product.findings.find((f) => f.status !== 'PASS') || product.findings[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span className="font-heading font-bold text-slate-900 text-sm">
              Evidence &amp; Rule Compliance Verification
            </span>
            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">
              {product.id}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Panel: Package Image & Evidence Crop */}
          <div className="lg:col-span-6 bg-slate-50 p-6 border-r border-slate-200 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-600" />
                Original Package Label
              </span>
              <span className="text-xs text-emerald-700 font-medium">
                Optimal Resolution
              </span>
            </div>

            {/* Image Preview Box */}
            <div className="relative flex-1 min-h-[340px] bg-white border border-slate-200 rounded-xl flex items-center justify-center p-4 overflow-hidden shadow-xs">
              <img
                src={product.image}
                alt="Packaged Label Evidence"
                className="max-h-[340px] w-auto object-contain rounded"
              />

              {/* Evidence Box */}
              <div className="absolute inset-8 pointer-events-none border-2 border-dashed border-amber-400 rounded-lg flex flex-col justify-between p-2">
                <div className="bg-white/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-semibold text-amber-900 w-fit rounded border border-amber-300 shadow-xs">
                  OCR Region Target
                </div>
                <div className="text-right text-[10px] font-medium text-slate-700 bg-white/90 px-2 py-0.5 w-fit ml-auto rounded border border-slate-200 shadow-xs">
                  Ref: {activeFinding?.ruleNumber}
                </div>
              </div>
            </div>

            {/* Readability Telemetry */}
            <div className="mt-4 p-3 bg-white border border-slate-200 rounded-xl grid grid-cols-3 gap-2 text-center text-xs shadow-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Visibility</span>
                <span className="text-emerald-700 font-bold">{product.readability.textVisibility}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Contrast</span>
                <span className="text-blue-700 font-bold">{product.readability.contrast}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Confidence</span>
                <span className="text-slate-900 font-bold">{Math.round(product.overallConfidence * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Rule citations, extracted values, notes */}
          <div className="lg:col-span-6 bg-white p-6 flex flex-col overflow-y-auto">
            {/* Status Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-heading font-bold text-slate-900 text-base">
                  {product.declarations.productName || 'Packaged Commodity'}
                </h3>
                <span className="text-xs text-slate-500">
                  Brand: <strong className="text-slate-700">{product.declarations.brand || 'N/A'}</strong> • Category: {product.category}
                </span>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  product.overallStatus === 'PASS'
                    ? 'bg-emerald-100 text-emerald-800'
                    : product.overallStatus === 'POTENTIAL_NON_COMPLIANCE'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {product.overallStatus === 'PASS' ? 'Compliant' : product.overallStatus === 'POTENTIAL_NON_COMPLIANCE' ? 'Non-Compliant' : 'Review Needed'}
              </div>
            </div>

            {/* Active Finding Detail Card */}
            {activeFinding && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    {activeFinding.ruleNumber}: {activeFinding.ruleTitle}
                  </span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                      activeFinding.status === 'PASS'
                        ? 'bg-emerald-100 text-emerald-800'
                        : activeFinding.status === 'POTENTIAL_NON_COMPLIANCE'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {activeFinding.status === 'PASS' ? 'Conforming' : 'Flagged'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Detected Label Extract:</span>
                    <p className="text-slate-900 font-medium bg-white p-2.5 rounded-lg border border-slate-200 mt-1">
                      {activeFinding.detectedValue || 'None / Not Visible'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Statutory Mandate:</span>
                    <p className="text-slate-700 leading-relaxed text-xs mt-0.5">
                      {activeFinding.expectedRequirement}
                    </p>
                  </div>
                  {activeFinding.reason && (
                    <div>
                      <span className="text-slate-500 block text-[11px]">Evaluation Reasoning:</span>
                      <p className="text-rose-700 font-medium text-xs mt-0.5 leading-relaxed">
                        {activeFinding.reason}
                      </p>
                    </div>
                  )}
                </div>

                {activeFinding.officerOverride && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 text-xs text-emerald-700 font-medium">
                    <span>✓ Officer Override by {activeFinding.officerOverride.overriddenBy}:</span>
                    <p className="text-slate-700 mt-0.5 italic">"{activeFinding.officerOverride.note}"</p>
                  </div>
                )}
              </div>
            )}

            {/* Declarations Extraction Table */}
            <span className="text-xs font-bold text-slate-800 mb-2 block">
              Mandatory Declarations Status:
            </span>
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-4 max-h-[160px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 sticky top-0 font-medium">
                  <tr>
                    <th className="p-2.5 border-b border-r border-slate-200">Rule</th>
                    <th className="p-2.5 border-b border-r border-slate-200">Declaration</th>
                    <th className="p-2.5 border-b border-r border-slate-200">Detected Value</th>
                    <th className="p-2.5 border-b border-slate-200">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {product.findings.map((f, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2.5 font-semibold text-blue-700 border-r border-slate-200">{f.ruleNumber}</td>
                      <td className="p-2.5 text-slate-800 border-r border-slate-200">{f.ruleTitle}</td>
                      <td className="p-2.5 text-slate-600 border-r border-slate-200 max-w-[140px] truncate">
                        {f.detectedValue || '—'}
                      </td>
                      <td className="p-2.5">
                        {f.status === 'PASS' ? (
                          <span className="text-emerald-700 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                          </span>
                        ) : (
                          <span className="text-rose-700 flex items-center gap-1 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" /> Flagged
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Disclaimer */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-blue-900 mb-4">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p>
                <strong>Legal Metrology Notice:</strong> Automated OCR findings constitute preliminary verification. Official penalties require validation by an authorized Legal Metrology Officer.
              </p>
            </div>

            {/* Actions */}
            <div className="mt-auto pt-2 flex items-center justify-between gap-3">
              {onOpenComplaint && product.overallStatus !== 'PASS' && (
                <button
                  onClick={() => onOpenComplaint(product)}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-xs"
                >
                  <AlertTriangle className="w-4 h-4" />
                  File Grievance Docket
                </button>
              )}
              <button
                onClick={onClose}
                className="ml-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
