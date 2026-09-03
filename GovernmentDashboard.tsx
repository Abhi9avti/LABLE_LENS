/**
 * METRISCAN FAST - Government Administration & Case Management Workspace
 * Professional case management for Legal Metrology directors, grievance routing,
 * field officer assignments, and office jurisdiction oversight.
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Eye,
  FileCheck,
  FileDown,
  FileText,
  Filter,
  Layers,
  MapPin,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Complaint, InspectionOffice, InspectionSession, OfficerProfile } from '../types';
import { downloadComplaintPDF, downloadInspectionPDF } from '../services/pdfExport';

export const GovernmentDashboard: React.FC = () => {
  const {
    complaints,
    inspections,
    offices,
    officers,
    assignComplaintToOfficer,
    setSelectedEvidenceProduct,
    setSelectedEvidenceFinding,
    addOffice,
    deleteOffice,
    addOfficer,
  } = useApp();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'WORKSPACE' | 'COMPLAINTS' | 'INSPECTIONS' | 'OFFICES'>('WORKSPACE');

  // Selected Case / Modal state
  const [selectedCase, setSelectedCase] = useState<Complaint | null>(null);
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [assignOfficeId, setAssignOfficeId] = useState<string>(offices[0]?.id || '');
  const [assignOfficerId, setAssignOfficerId] = useState<string>(officers[0]?.id || '');
  const [assignPriority, setAssignPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');
  const [assignDueDate, setAssignDueDate] = useState<string>(
    new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  );

  // New Office Modal
  const [showNewOfficeModal, setShowNewOfficeModal] = useState<boolean>(false);
  const [newOfficeName, setNewOfficeName] = useState<string>('');
  const [newOfficeDistrict, setNewOfficeDistrict] = useState<string>('Sirsa');
  const [newOfficeAddress, setNewOfficeAddress] = useState<string>('');
  const [newOfficeAreas, setNewOfficeAreas] = useState<string>('Sirsa City, Dabwali, Ellenabad');

  // New Officer Modal
  const [showNewOfficerModal, setShowNewOfficerModal] = useState<boolean>(false);
  const [newOfficerName, setNewOfficerName] = useState<string>('');
  const [newOfficerBadge, setNewOfficerBadge] = useState<string>('LM-INSP-2026');
  const [newOfficerOfficeId, setNewOfficerOfficeId] = useState<string>(offices[0]?.id || '');

  // Filter & Search
  const [complaintSearch, setComplaintSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Metric computations
  const newComplaintsCount = complaints.filter((c) => c.status === 'NEW').length;
  const underInspectionCount = complaints.filter((c) => c.status === 'ASSIGNED' || c.status === 'UNDER_INSPECTION').length;
  const verifiedCount = complaints.filter((c) => c.status === 'VERIFIED').length;
  const todayInspectionsCount = inspections.length;
  const awaitingReviewCount = complaints.filter((c) => c.priority === 'HIGH' || c.priority === 'URGENT').length;

  // Cases needing attention
  const attentionRequiredCases = complaints.filter((c) => c.status === 'NEW' || c.priority === 'HIGH' || c.priority === 'URGENT');

  // Assignment Handler
  const handleAssignCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    assignComplaintToOfficer(
      selectedCase.id,
      assignOfficeId,
      assignOfficerId,
      assignPriority,
      assignDueDate
    );

    setShowAssignModal(false);
    setSelectedCase(null);
  };

  // Add Office Handler
  const handleAddOffice = (e: React.FormEvent) => {
    e.preventDefault();
    addOffice({
      name: newOfficeName,
      district: newOfficeDistrict,
      state: 'Haryana',
      address: newOfficeAddress,
      contactNumber: '01666-299800',
      email: `lm.${newOfficeDistrict.toLowerCase()}@haryana.gov.in`,
      jurisdictionAreas: newOfficeAreas.split(',').map((s) => s.trim()),
    });

    setNewOfficeName('');
    setNewOfficeAddress('');
    setShowNewOfficeModal(false);
  };

  // Add Officer Handler
  const handleAddOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    addOfficer({
      name: newOfficerName,
      badgeNumber: newOfficerBadge,
      designation: 'Legal Metrology Inspector',
      officeId: newOfficerOfficeId,
      phone: '+91 98765 11111',
      email: `${newOfficerName.toLowerCase().replace(/\s+/g, '.')}@haryana.gov.in`,
      activeInspectionsCount: 0,
      totalInspectionsCompleted: 0,
    });

    setNewOfficerName('');
    setShowNewOfficerModal(false);
  };

  return (
    <div className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            Government Case Workspace
          </span>
          <h1 className="font-heading font-extrabold text-slate-900 text-2xl mt-1">
            Good morning — here's what needs your attention today.
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department of Food, Civil Supplies &amp; Consumer Affairs • Legal Metrology Enforcement Division
          </p>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start md:self-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('WORKSPACE')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'WORKSPACE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Workspace
          </button>
          <button
            onClick={() => setActiveTab('COMPLAINTS')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'COMPLAINTS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Grievances ({complaints.length})
          </button>
          <button
            onClick={() => setActiveTab('INSPECTIONS')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'INSPECTIONS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inspections ({inspections.length})
          </button>
          <button
            onClick={() => setActiveTab('OFFICES')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'OFFICES' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Offices &amp; Teams
          </button>
        </div>
      </div>

      {/* Quick Status Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-2xl font-extrabold text-blue-600 block">{newComplaintsCount}</span>
          <span className="text-xs font-semibold text-slate-700">New Complaints</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Filed by citizens</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-2xl font-extrabold text-slate-900 block">{todayInspectionsCount}</span>
          <span className="text-xs font-semibold text-slate-700">Inspections Conducted</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Across jurisdiction</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-2xl font-extrabold text-amber-600 block">{underInspectionCount}</span>
          <span className="text-xs font-semibold text-slate-700">Active Field Cases</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Assigned to officers</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-2xl font-extrabold text-emerald-600 block">{verifiedCount}</span>
          <span className="text-xs font-semibold text-slate-700">Cases Verified</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Notices &amp; compounding</span>
        </div>
      </div>

      {/* ========================================= */}
      {/* TAB 1: WORKSPACE & ATTENTION REQUIRED */}
      {/* ========================================= */}
      {activeTab === 'WORKSPACE' && (
        <div className="space-y-6">
          {/* Attention Required Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h2 className="font-heading font-bold text-slate-900 text-base">
                  Attention Required ({attentionRequiredCases.length})
                </h2>
              </div>
              <span className="text-xs text-slate-400">Cases that need officer assignment or immediate review</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {attentionRequiredCases.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{c.sellerName}</span>
                      <span className="text-[10px] bg-rose-100 text-rose-800 font-semibold px-2 py-0.5 rounded">
                        {c.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      <strong>Product:</strong> {c.productName} ({c.brand})
                    </p>

                    <p className="text-xs text-amber-800 font-medium">
                      <strong>Observed:</strong> {c.issue}
                    </p>

                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      "{c.description}"
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">{c.id}</span>
                    <button
                      onClick={() => setSelectedCase(c)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1"
                    >
                      <span>View Case</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Completed Inspections Stream */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-slate-900 text-base">
                Recent Completed Inspections
              </h2>
              <button
                onClick={() => setActiveTab('INSPECTIONS')}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                View All Inspections
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {inspections.slice(0, 4).map((ins) => (
                <div key={ins.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{ins.shopName}</span>
                    <span className="text-slate-500 text-[11px]">
                      {ins.inspectionCode} • {ins.officerName} • {ins.scannedProducts.length} commodities audited
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-emerald-700 font-medium">
                      {ins.passedCount} Pass
                    </span>
                    {ins.potentialIssuesCount > 0 && (
                      <span className="text-rose-700 font-bold">
                        • {ins.potentialIssuesCount} Flagged
                      </span>
                    )}
                    <button
                      onClick={() => downloadInspectionPDF(ins)}
                      className="ml-2 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <FileDown className="w-3 h-3" />
                      PDF Notice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* TAB 2: COMPLAINTS / GRIEVANCE DIRECTORY */}
      {/* ========================================= */}
      {activeTab === 'COMPLAINTS' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-heading font-bold text-slate-900 text-base">
                Citizen Grievances ({complaints.length})
              </h2>
              <p className="text-xs text-slate-500">
                Track and assign citizen reports under the Legal Metrology Act.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search store, product, docket..."
                value={complaintSearch}
                onChange={(e) => setComplaintSearch(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {complaints
              .filter(
                (c) =>
                  c.productName.toLowerCase().includes(complaintSearch.toLowerCase()) ||
                  c.sellerName.toLowerCase().includes(complaintSearch.toLowerCase()) ||
                  c.id.toLowerCase().includes(complaintSearch.toLowerCase())
              )
              .map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{c.sellerName}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                        {c.id}
                      </span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                        {c.status}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {c.productName} • Issue: {c.issue} • Reported by {c.consumerName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadComplaintPDF(c)}
                      className="px-2.5 py-1 text-slate-600 hover:text-slate-900 text-xs border border-slate-200 rounded-lg flex items-center gap-1"
                    >
                      <FileDown className="w-3 h-3" />
                      PDF
                    </button>
                    <button
                      onClick={() => setSelectedCase(c)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* TAB 3: INSPECTION SURVEILLANCE DIRECTORY */}
      {/* ========================================= */}
      {activeTab === 'INSPECTIONS' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-slate-900 text-base">
                Field Inspection Records ({inspections.length})
              </h2>
              <p className="text-xs text-slate-500">
                Official statutory memoranda generated by field officers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inspections.map((ins) => (
              <div
                key={ins.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{ins.shopName}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                    {ins.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  {ins.shopAddress} • Officer: {ins.officerName}
                </p>

                <div className="flex items-center gap-4 text-xs font-medium">
                  <span>Checked: {ins.scannedProducts.length}</span>
                  <span className="text-emerald-700">Conforming: {ins.passedCount}</span>
                  <span className="text-rose-700">Violations: {ins.potentialIssuesCount}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">{ins.inspectionCode}</span>
                  <button
                    onClick={() => downloadInspectionPDF(ins)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    Download Notice PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* TAB 4: OFFICES & TEAMS MANAGEMENT */}
      {/* ========================================= */}
      {activeTab === 'OFFICES' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-bold text-slate-900 text-base">
                  Jurisdiction Offices ({offices.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Manage Legal Metrology offices and assigned surveillance territories.
                </p>
              </div>

              <button
                onClick={() => setShowNewOfficeModal(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Office
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offices.map((office) => (
                <div
                  key={office.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{office.name}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                      {office.district}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">{office.address}</p>

                  <div className="text-[11px] text-slate-600">
                    <strong>Jurisdiction Areas:</strong> {office.jurisdictionAreas.join(', ')}
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Officers: {officers.filter((o) => o.officeId === office.id).length}
                    </span>
                    <button
                      onClick={() => deleteOffice(office.id)}
                      className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Officers List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-bold text-slate-900 text-base">
                  Authorized Field Officers ({officers.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Inspectors holding active enforcement credentials.
                </p>
              </div>

              <button
                onClick={() => setShowNewOfficerModal(true)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Officer
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {officers.map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{o.name}</span>
                    <span className="text-slate-500 text-[11px]">
                      {o.designation} • Badge: {o.badgeNumber} • Office: {offices.find((of) => of.id === o.officeId)?.name || 'Central'}
                    </span>
                  </div>
                  <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL 1: CASE DETAILS & ACTION VIEW */}
      {/* ========================================= */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <span className="text-[11px] font-mono text-slate-400 block">{selectedCase.id}</span>
                <h3 className="font-heading font-bold text-slate-900 text-base">
                  Grievance Case Record
                </h3>
              </div>
              <button onClick={() => setSelectedCase(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Case Details */}
            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-900">{selectedCase.sellerName}</span>
                  <span className="text-rose-700 font-semibold">{selectedCase.status}</span>
                </div>
                <p className="text-slate-500">{selectedCase.sellerAddress}</p>
                <p className="text-slate-700 font-medium">Product: {selectedCase.productName} ({selectedCase.brand})</p>
              </div>

              <div>
                <strong className="text-slate-800 block mb-1">Reported Issue:</strong>
                <p className="text-slate-600 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
                  {selectedCase.issue}
                </p>
              </div>

              <div>
                <strong className="text-slate-800 block mb-1">Citizen Statement:</strong>
                <p className="text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  "{selectedCase.description}"
                </p>
              </div>

              {selectedCase.evidenceImage && (
                <div>
                  <strong className="text-slate-800 block mb-1">Attached Package Photograph:</strong>
                  <img
                    src={selectedCase.evidenceImage}
                    alt="Package Evidence"
                    className="w-full h-44 object-cover rounded-xl border border-slate-200"
                  />
                </div>
              )}
            </div>

            {/* Case Action Buttons */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                onClick={() => downloadComplaintPDF(selectedCase)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1"
              >
                <FileDown className="w-3.5 h-3.5" />
                Download PDF Dossier
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  Assign Field Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL 2: ASSIGN INSPECTOR MODAL */}
      {/* ========================================= */}
      {showAssignModal && selectedCase && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-heading font-bold text-slate-900 text-sm">
                Assign Field Inspection to Officer
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Docket: {selectedCase.id} • {selectedCase.sellerName}
            </p>

            <form onSubmit={handleAssignCase} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Jurisdiction Office *</label>
                <select
                  value={assignOfficeId}
                  onChange={(e) => setAssignOfficeId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                >
                  {offices.map((o) => (
                    <option key={o.id} value={o.id}>{o.name} ({o.district})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Inspecting Officer *</label>
                <select
                  value={assignOfficerId}
                  onChange={(e) => setAssignOfficerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                >
                  {officers.map((o) => (
                    <option key={o.id} value={o.id}>{o.name} ({o.designation})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Priority Level</label>
                  <select
                    value={assignPriority}
                    onChange={(e) => setAssignPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent (48 hrs)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Inspection Date</label>
                  <input
                    type="date"
                    value={assignDueDate}
                    onChange={(e) => setAssignDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL 3: ADD OFFICE MODAL */}
      {/* ========================================= */}
      {showNewOfficeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-heading font-bold text-slate-900 text-sm">Add New Legal Metrology Office</h3>
              <button onClick={() => setShowNewOfficeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddOffice} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Office Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Legal Metrology Office - Fatehabad"
                  value={newOfficeName}
                  onChange={(e) => setNewOfficeName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">District *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fatehabad"
                  value={newOfficeDistrict}
                  onChange={(e) => setNewOfficeDistrict(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Mini Secretariat, Court Road"
                  value={newOfficeAddress}
                  onChange={(e) => setNewOfficeAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Jurisdiction Areas (comma separated)</label>
                <input
                  type="text"
                  value={newOfficeAreas}
                  onChange={(e) => setNewOfficeAreas(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewOfficeModal(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                >
                  Create Office
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL 4: ADD OFFICER MODAL */}
      {/* ========================================= */}
      {showNewOfficerModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-heading font-bold text-slate-900 text-sm">Add Enforcement Officer</h3>
              <button onClick={() => setShowNewOfficerModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddOfficer} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Officer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Inspector Suresh Verma"
                  value={newOfficerName}
                  onChange={(e) => setNewOfficerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Badge Number *</label>
                <input
                  type="text"
                  required
                  value={newOfficerBadge}
                  onChange={(e) => setNewOfficerBadge(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assign to Office *</label>
                <select
                  value={newOfficerOfficeId}
                  onChange={(e) => setNewOfficerOfficeId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                >
                  {offices.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewOfficerModal(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                >
                  Register Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
