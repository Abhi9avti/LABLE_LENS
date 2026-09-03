/**
 * METRISCAN FAST - Clean Top Navigation & Role Switcher
 * Clear, human-friendly header with instant role switching between Citizen, Retailer, Inspector, and Admin.
 */

import React from 'react';
import {
  Building2,
  CheckCircle2,
  FileText,
  Play,
  Scale,
  Shield,
  Smartphone,
  User,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const TopNavigation: React.FC = () => {
  const {
    role,
    setRole,
    activeTab,
    setActiveTab,
    pendingSyncCount,
    offlineMode,
    setOfflineMode,
    syncPendingRecords,
    startDemoWalkthrough,
    complaints,
  } = useApp();

  const roleDisplayNames: Record<UserRole, { title: string; subtitle: string }> = {
    CONSUMER: { title: 'Citizen Assistant', subtitle: 'Public Consumer' },
    RETAILER: { title: 'Merchant / Retailer', subtitle: 'Store Inventory' },
    INSPECTOR: { title: 'Field Inspector', subtitle: 'On-site Officer' },
    ADMIN: { title: 'Government Workspace', subtitle: 'Enforcement HQ' },
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs select-none">
      <div className="px-4 lg:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                METRISCAN FAST
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 hidden sm:inline-block">
                Legal Metrology
              </span>
            </div>
          </div>
        </div>

        {/* Right Controls: Role Switcher, Offline Indicator, Demo Guide */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Interactive Demo Guide */}
          <button
            onClick={startDemoWalkthrough}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-xl transition-colors"
            title="Launch step-by-step interactive demonstration"
          >
            <Play className="w-3 h-3 fill-current" />
            <span className="hidden sm:inline">How It Works</span>
            <span className="sm:hidden">Demo</span>
          </button>

          {/* Offline Indicator (for Inspector & Field) */}
          {role === 'INSPECTOR' && (
            <button
              onClick={() => setOfflineMode(!offlineMode)}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                offlineMode
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {offlineMode ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span>Offline</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Online</span>
                </>
              )}
            </button>
          )}

          {/* Pending Sync if any */}
          {pendingSyncCount > 0 && (
            <button
              onClick={syncPendingRecords}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-xs font-medium hover:bg-amber-200 transition-colors animate-pulse"
            >
              <span>Sync ({pendingSyncCount})</span>
            </button>
          )}

          {/* Role Switcher Pill */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            {(['CONSUMER', 'RETAILER', 'INSPECTOR', 'ADMIN'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRole(r);
                  setActiveTab('dashboard');
                }}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs transition-all ${
                  role === r
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                {r === 'CONSUMER'
                  ? 'Citizen'
                  : r === 'RETAILER'
                  ? 'Retailer'
                  : r === 'INSPECTOR'
                  ? 'Officer'
                  : 'Gov'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
