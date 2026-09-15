import React, { useState } from 'react';
import {
  Layers,
  FileText,
  ShieldCheck,
  Edit3,
  Share2,
  Paperclip,
  CheckSquare,
  Search,
  Stamp,
  Send,
  TrendingUp,
  History,
  ArrowLeft,
  ChevronDown,
  ShieldAlert,
  Calendar,
  User,
  Building,
  Lock,
} from 'lucide-react';
import { useHortiFlow } from '../../context/HortiFlowContext';
import { ActiveView } from '../layout/Sidebar';
import { OverviewTab } from './tabs/OverviewTab';
import { BriefTab } from './tabs/BriefTab';
import { FactSourceTab } from './tabs/FactSourceTab';
import { NarrativeTab } from './tabs/NarrativeTab';
import { VariantsTab } from './tabs/VariantsTab';
import { AssetsTab } from './tabs/AssetsTab';
import { TasksTab } from './tabs/TasksTab';
import { ReviewTab } from './tabs/ReviewTab';
import { ApprovalTab } from './tabs/ApprovalTab';
import { PublicationTab } from './tabs/PublicationTab';
import { MetricsTab } from './tabs/MetricsTab';
import { HistoryTab } from './tabs/HistoryTab';

interface PackageWorkspaceProps {
  setActiveView: (view: ActiveView) => void;
}

export type WorkspaceTabId =
  | 'overview'
  | 'brief'
  | 'sources'
  | 'narrative'
  | 'variants'
  | 'assets'
  | 'tasks'
  | 'reviews'
  | 'approvals'
  | 'publication'
  | 'metrics'
  | 'history';

const WORKSPACE_TABS: { id: WorkspaceTabId; label: string; icon: any; countKey?: string }[] = [
  { id: 'overview', label: '1. Ringkasan', icon: Layers },
  { id: 'brief', label: '2. Brief', icon: FileText },
  { id: 'sources', label: '3. Fakta & Sumber', icon: ShieldCheck, countKey: 'claims' },
  { id: 'narrative', label: '4. Narasi', icon: Edit3 },
  { id: 'variants', label: '5. Varian Kanal', icon: Share2, countKey: 'variants' },
  { id: 'assets', label: '6. Aset', icon: Paperclip, countKey: 'assets' },
  { id: 'tasks', label: '7. Tugas', icon: CheckSquare, countKey: 'tasks' },
  { id: 'reviews', label: '8. Peninjauan', icon: Search, countKey: 'reviews' },
  { id: 'approvals', label: '9. Persetujuan', icon: Stamp },
  { id: 'publication', label: '10. Publikasi & Bukti', icon: Send, countKey: 'publications' },
  { id: 'metrics', label: '11. Metrik', icon: TrendingUp },
  { id: 'history', label: '12. Riwayat', icon: History },
];

export const PackageWorkspace: React.FC<PackageWorkspaceProps> = ({ setActiveView }) => {
  const {
    packages,
    selectedPackageId,
    setSelectedPackageId,
    currentUser,
    getClaimsForPackage,
    getReviewsForPackage,
    getTasksForPackage,
    getAssetsForPackage,
    getVariantsForPackage,
    getPublicationsForPackage,
  } = useHortiFlow();

  const [activeTab, setActiveTab] = useState<WorkspaceTabId>('overview');

  const currentPackage =
    packages.find((p) => p.id === selectedPackageId) || packages[0];

  if (!currentPackage) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-slate-500 text-sm">Tidak ada paket konten yang dipilih.</p>
        <button
          onClick={() => setActiveView('kanban')}
          className="mt-3 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg"
        >
          Kembali ke Papan Alur
        </button>
      </div>
    );
  }

  // Count indicators for badges
  const claims = getClaimsForPackage(currentPackage.id);
  const reviews = getReviewsForPackage(currentPackage.id);
  const tasks = getTasksForPackage(currentPackage.id);
  const assets = getAssetsForPackage(currentPackage.id);
  const variants = getVariantsForPackage(currentPackage.id);
  const publications = getPublicationsForPackage(currentPackage.id);

  const counts: Record<string, number> = {
    claims: claims.length,
    reviews: reviews.filter((r) => r.status !== 'VERIFIED_CLOSED').length,
    tasks: tasks.filter((t) => t.status !== 'DONE').length,
    assets: assets.length,
    variants: variants.length,
    publications: publications.length,
  };

  return (
    <div className="space-y-5" id="package-workspace-module">
      {/* Top Navigation & Package Switcher Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('kanban')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
            title="Kembali ke Papan Alur"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                {currentPackage.packageNumber}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  currentPackage.lifecycleStatus === 'APPROVAL_PENDING'
                    ? 'bg-amber-100 text-amber-800'
                    : currentPackage.lifecycleStatus === 'IN_REVIEW'
                    ? 'bg-indigo-100 text-indigo-800'
                    : currentPackage.lifecycleStatus === 'PUBLISHED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {currentPackage.lifecycleStatus}
              </span>

              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                  currentPackage.riskLevel === 'CRITICAL'
                    ? 'bg-rose-100 text-rose-800'
                    : currentPackage.riskLevel === 'HIGH'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                RISIKO {currentPackage.riskLevel}
              </span>

              {currentPackage.hasBlocker && (
                <span className="text-[10px] bg-rose-600 text-white font-bold px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                  <ShieldAlert className="w-3 h-3" />
                  <span>BLOCKER AKTIF</span>
                </span>
              )}
            </div>

            <h1 className="text-base font-black text-slate-900 mt-1 line-clamp-1">
              {currentPackage.title}
            </h1>
          </div>
        </div>

        {/* Quick Switch Package Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400">Pilih Paket:</span>
          <select
            value={currentPackage.id}
            onChange={(e) => setSelectedPackageId(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-[240px]"
          >
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.packageNumber} - {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 12 Horizontal Workspace Tabs */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-1.5 shadow-2xs overflow-x-auto scrollbar-thin">
        <div className="flex items-center gap-1 min-w-max">
          {WORKSPACE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = tab.countKey ? counts[tab.countKey] : undefined;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {count !== undefined && count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-emerald-700 text-white'
                        : tab.countKey === 'reviews'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Panels */}
      <div className="min-h-[500px]">
        {activeTab === 'overview' && <OverviewTab pkg={currentPackage} />}
        {activeTab === 'brief' && <BriefTab pkg={currentPackage} />}
        {activeTab === 'sources' && <FactSourceTab pkg={currentPackage} />}
        {activeTab === 'narrative' && <NarrativeTab pkg={currentPackage} />}
        {activeTab === 'variants' && <VariantsTab pkg={currentPackage} />}
        {activeTab === 'assets' && <AssetsTab pkg={currentPackage} />}
        {activeTab === 'tasks' && <TasksTab pkg={currentPackage} />}
        {activeTab === 'reviews' && <ReviewTab pkg={currentPackage} />}
        {activeTab === 'approvals' && <ApprovalTab pkg={currentPackage} />}
        {activeTab === 'publication' && <PublicationTab pkg={currentPackage} />}
        {activeTab === 'metrics' && <MetricsTab pkg={currentPackage} />}
        {activeTab === 'history' && <HistoryTab pkg={currentPackage} />}
      </div>
    </div>
  );
};
