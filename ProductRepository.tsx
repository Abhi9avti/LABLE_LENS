/**
 * METRISCAN - Legal Metrology Standards & Commodity Rules Repository
 * Clean, human-friendly reference guide for Legal Metrology (Packaged Commodities) Rules, 2011.
 */

import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileCheck,
  FileText,
  HelpCircle,
  Info,
  Layers,
  Scale,
  Search,
  Shield,
  Table,
} from 'lucide-react';
import { LEGAL_METROLOGY_RULES } from '../compliance/rules';
import { SAMPLE_PACKAGED_PRODUCTS } from '../data/seedData';

export const ProductRepository: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rules' | 'font_tables' | 'penalties' | 'commodities'>('rules');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredRules = LEGAL_METROLOGY_RULES.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.ruleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.requirementDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 bg-slate-50 p-4 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Statutory Knowledge Base</span>
          </div>
          <h1 className="font-heading font-bold text-slate-900 text-2xl tracking-tight">
            Legal Metrology (Packaged Commodities) Rules, 2011
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Official statutory references, font height calculation matrices, unit sale price mandates, and penalty schedules.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto">
          {[
            { id: 'rules', label: 'Mandatory Declarations' },
            { id: 'font_tables', label: 'Font Matrix (Rule 7)' },
            { id: 'penalties', label: 'Penalties (Rule 32)' },
            { id: 'commodities', label: 'Sample Products' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* RULES TAB */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search rule number, title, keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium hidden sm:block">
              {filteredRules.length} Statutory Rules
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRules.map((rule) => (
              <div key={rule.ruleId} className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                      {rule.ruleNumber}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium uppercase">
                      Severity: {rule.severity}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-slate-900 text-base mb-1">{rule.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{rule.requirementDescription}</p>

                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                    <span className="text-slate-400 block text-[11px] font-semibold">Statutory Source:</span>
                    <p className="text-slate-700 mt-0.5 font-medium">{rule.source}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
                  <span>Enforcement: Mandatory</span>
                  <span>Penalty: Section 36(1)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FONT MATRIX TAB */}
      {activeTab === 'font_tables' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-heading font-bold text-slate-900 text-lg">
              Rule 7: Minimum Height of Numerals and Letters on Principal Display Panel (PDP)
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Table specifying statutory minimum font heights based on net quantity packaged to guarantee consumer readability.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="p-3.5 border-b border-r border-slate-200 font-semibold">Net Quantity (Weight / Volume)</th>
                  <th className="p-3.5 border-b border-r border-slate-200 font-semibold">Principal Display Panel Area (A)</th>
                  <th className="p-3.5 border-b border-r border-slate-200 font-semibold">Min. Normal Font Height</th>
                  <th className="p-3.5 border-b border-slate-200 font-semibold">Min. Blown / Molded Height</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3.5 font-semibold text-slate-900 border-r border-slate-200">Up to 50 g / ml</td>
                  <td className="p-3.5 border-r border-slate-200">A ≤ 50 cm²</td>
                  <td className="p-3.5 border-r border-slate-200 text-emerald-700 font-bold">1.0 mm</td>
                  <td className="p-3.5 text-slate-500">2.0 mm</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3.5 font-semibold text-slate-900 border-r border-slate-200">50 g to 200 g / ml</td>
                  <td className="p-3.5 border-r border-slate-200">50 cm² &lt; A ≤ 100 cm²</td>
                  <td className="p-3.5 border-r border-slate-200 text-emerald-700 font-bold">2.0 mm</td>
                  <td className="p-3.5 text-slate-500">4.0 mm</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3.5 font-semibold text-slate-900 border-r border-slate-200">200 g to 1 kg / L</td>
                  <td className="p-3.5 border-r border-slate-200">100 cm² &lt; A ≤ 500 cm²</td>
                  <td className="p-3.5 border-r border-slate-200 text-emerald-700 font-bold">4.0 mm</td>
                  <td className="p-3.5 text-slate-500">6.0 mm</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3.5 font-semibold text-slate-900 border-r border-slate-200">More than 1 kg / L</td>
                  <td className="p-3.5 border-r border-slate-200">A &gt; 500 cm²</td>
                  <td className="p-3.5 border-r border-slate-200 text-emerald-700 font-bold">6.0 mm</td>
                  <td className="p-3.5 text-slate-500">8.0 mm</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              <strong>Optical Field Verification Note:</strong> Optical detection estimates font height ratios. Certified enforcement actions require measuring physical packages with a calibrated 10x optical loupe reticle.
            </p>
          </div>
        </div>
      )}

      {/* PENALTIES TAB */}
      {activeTab === 'penalties' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-heading font-bold text-slate-900 text-lg">
              Statutory Penalties &amp; Compounding Provisions (Rule 32 &amp; Act Section 36)
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Fines and compounding structures applicable to manufacturers, packers, importers, and distributors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="text-rose-700 font-semibold text-xs block">First Offense</span>
              <span className="text-slate-900 text-xl font-bold block mt-1">₹25,000 Fine</span>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Fine up to twenty-five thousand rupees for manufacturing, packing, importing, or selling non-compliant commodities.
              </p>
            </div>

            <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-amber-700 font-semibold text-xs block">Second Offense</span>
              <span className="text-slate-900 text-xl font-bold block mt-1">₹50,000 Fine</span>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                For the second offense, compounding fees increase up to fifty thousand rupees.
              </p>
            </div>

            <div className="p-5 bg-purple-50 border border-purple-200 rounded-xl">
              <span className="text-purple-700 font-semibold text-xs block">Subsequent Offenses</span>
              <span className="text-slate-900 text-xl font-bold block mt-1">₹1,00,000 + Jail</span>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Fine extending to one lakh rupees or imprisonment for a term which may extend to one year, or both.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SAMPLE COMMODITIES TAB */}
      {activeTab === 'commodities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SAMPLE_PACKAGED_PRODUCTS.map((prod) => (
            <div key={prod.id} className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between">
              <div>
                <img
                  src={prod.sampleResult.image}
                  alt={prod.name}
                  className="w-full h-44 object-contain rounded-lg bg-slate-50 p-2 border border-slate-200 mb-3"
                />
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-slate-900">{prod.name}</span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                      prod.complianceState === 'COMPLIANT'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {prod.complianceState === 'COMPLIANT' ? 'Compliant' : 'Non-Compliant'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">Brand: {prod.brand}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
                <span>Category: {prod.category}</span>
                <span className="text-blue-700 font-semibold">{prod.sampleResult.passedCount}/7 Compliant</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
