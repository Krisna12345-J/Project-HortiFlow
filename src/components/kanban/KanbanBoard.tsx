import React, { useState } from 'react';
import {
  KanbanSquare,
  List,
  Calendar,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  Layers,
  CheckCircle,
  Plus,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { useHortiFlow } from '../../context/HortiFlowContext';
import { LifecycleStatus, ContentType, RiskLevel, ContentPackage } from '../../types';
import { ActiveView } from '../layout/Sidebar';

interface KanbanBoardProps {
  setActiveView: (view: ActiveView) => void;
}

// Group stages for columns
const KANBAN_STAGES: { id: LifecycleStatus; label: string; color: string }[] = [
  { id: 'IDE', label: 'Ide & Konsep', color: 'border-slate-400' },
  { id: 'TRIAGED', label: 'Triaged', color: 'border-blue-400' },
  { id: 'BRIEF_READY', label: 'Brief Ready', color: 'border-cyan-400' },
  { id: 'ASSIGNED', label: 'Assigned', color: 'border-indigo-400' },
  { id: 'IN_PRODUCTION', label: 'Dalam Produksi', color: 'border-sky-500' },
  { id: 'IN_REVIEW', label: 'Sedang Direview', color: 'border-purple-500' },
  { id: 'CHANGES_REQUESTED', label: 'Perlu Revisi', color: 'border-amber-500' },
  { id: 'APPROVAL_PENDING', label: 'Approval Pending', color: 'border-amber-600' },
  { id: 'APPROVED', label: 'Disetujui', color: 'border-emerald-500' },
  { id: 'SCHEDULED', label: 'Terjadwal', color: 'border-teal-500' },
  { id: 'PUBLISHED', label: 'Tayang (Published)', color: 'border-emerald-700' },
  { id: 'PUBLISH_FAILED', label: 'Gagal Publikasi', color: 'border-rose-600' },
  { id: 'ARCHIVED', label: 'Diarsipkan', color: 'border-slate-600' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ setActiveView }) => {
  const { packages, setSelectedPackageId, transitionLifecycleStatus, campaigns, units } = useHortiFlow();

  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [filterCampaign, setFilterCampaign] = useState<string>('ALL');
  const [filterBlockerOnly, setFilterBlockerOnly] = useState(false);

  // Filter packages
  const filteredPackages = packages.filter((pkg) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        pkg.title.toLowerCase().includes(q) ||
        pkg.packageNumber.toLowerCase().includes(q) ||
        pkg.tags.some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (filterType !== 'ALL' && pkg.contentType !== filterType) return false;
    if (filterRisk !== 'ALL' && pkg.riskLevel !== filterRisk) return false;
    if (filterCampaign !== 'ALL' && pkg.campaignId !== filterCampaign) return false;
    if (filterBlockerOnly && !pkg.hasBlocker) return false;
    return true;
  });

  const handleCardClick = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    setActiveView('workspace');
  };

  const handleQuickStatusMove = (pkg: ContentPackage, targetStatus: LifecycleStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = transitionLifecycleStatus(pkg.id, targetStatus, `Dipindahkan via aksi cepat papan alur`);
    if (!res.success) {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-5" id="kanban-board-module">
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <KanbanSquare className="w-5 h-5 text-emerald-600" />
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Papan Alur Kerja Paket Konten
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Pantau dan kelola seluruh siklus hidup paket konten dari tahap ide hingga pengarsipan permanen.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KanbanSquare className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabel List</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Kalender</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div className="relative min-w-[200px] flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Saring berdasarkan judul, tag, kode..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="ALL">Semua Format Konten</option>
            <option value="ARTICLE">Artikel</option>
            <option value="INFOGRAPHIC">Infografis</option>
            <option value="SHORT_VIDEO">Video Pendek</option>
            <option value="PRESS_RELEASE">Siaran Pers</option>
            <option value="SOCIAL_CAROUSEL">Social Carousel</option>
            <option value="POLICY_BRIEF">Policy Brief</option>
          </select>

          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="ALL">Semua Risiko</option>
            <option value="LOW">Risiko LOW</option>
            <option value="MEDIUM">Risiko MEDIUM</option>
            <option value="HIGH">Risiko HIGH</option>
            <option value="CRITICAL">Risiko CRITICAL</option>
          </select>

          <select
            value={filterCampaign}
            onChange={(e) => setFilterCampaign(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 max-w-[180px]"
          >
            <option value="ALL">Semua Kampanye</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium ml-1">
            <input
              type="checkbox"
              checked={filterBlockerOnly}
              onChange={(e) => setFilterBlockerOnly(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500"
            />
            <span className="text-rose-700 font-semibold">Hanya Blocker Aktif</span>
          </label>
        </div>
      </div>

      {/* VIEW 1: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1 min-h-[600px] scrollbar-thin">
          {KANBAN_STAGES.map((stage) => {
            const stagePackages = filteredPackages.filter((p) => p.lifecycleStatus === stage.id);
            return (
              <div
                key={stage.id}
                className="w-72 shrink-0 flex flex-col bg-slate-100/70 rounded-xl border border-slate-200/70 p-3 max-h-[750px]"
              >
                {/* Stage Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full border-2 ${stage.color} bg-white`}></span>
                    <h3 className="font-bold text-xs text-slate-800 tracking-tight">
                      {stage.label}
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold px-1.5 py-0.2 bg-white text-slate-600 rounded-md border border-slate-200">
                    {stagePackages.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {stagePackages.length === 0 ? (
                    <div className="h-24 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-[11px] text-slate-400">
                      Kosong
                    </div>
                  ) : (
                    stagePackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        onClick={() => handleCardClick(pkg.id)}
                        className={`bg-white rounded-lg p-3 border shadow-2xs hover:shadow-xs transition-all cursor-pointer group ${
                          pkg.hasBlocker
                            ? 'border-rose-300 bg-rose-50/30'
                            : 'border-slate-200/90 hover:border-emerald-300'
                        }`}
                      >
                        {/* Header card */}
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-1 rounded">
                            {pkg.packageNumber}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              pkg.riskLevel === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-800'
                                : pkg.riskLevel === 'HIGH'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {pkg.riskLevel}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                          {pkg.title}
                        </h4>

                        {/* Blocker alert if any */}
                        {pkg.hasBlocker && (
                          <div className="mt-2 p-1.5 bg-rose-100/80 border border-rose-200 rounded text-[10px] text-rose-900 font-medium flex items-start gap-1">
                            <ShieldAlert className="w-3 h-3 text-rose-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{pkg.blockerReason}</span>
                          </div>
                        )}

                        {/* Footer & Meta */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="truncate max-w-[120px]">{pkg.ownerName ? pkg.ownerName.split(' ')[0] : 'Owner'}</span>
                          <div className="flex items-center gap-1 font-medium text-[10px]">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>
                              {new Date(pkg.deadline).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Quick Action Suggestion on Hover */}
                        <div className="mt-2 pt-1 text-[10px] text-emerald-700 font-semibold flex items-center justify-between opacity-80 group-hover:opacity-100">
                          <span>Buka Workspace</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: LIST / TABLE VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Kode Paket</th>
                  <th className="p-3">Judul Konten</th>
                  <th className="p-3">Status Lifecycle</th>
                  <th className="p-3">Format</th>
                  <th className="p-3">Tingkat Risiko</th>
                  <th className="p-3">PIC / Unit</th>
                  <th className="p-3">Tenggat Waktu</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPackages.map((pkg) => (
                  <tr
                    key={pkg.id}
                    onClick={() => handleCardClick(pkg.id)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="p-3 font-mono font-bold text-slate-800">{pkg.packageNumber}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 line-clamp-1">{pkg.title}</div>
                      {pkg.hasBlocker && (
                        <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 mt-0.5">
                          <ShieldAlert className="w-3 h-3" /> Blocker: {pkg.blockerReason}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {pkg.lifecycleStatus}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-600">{pkg.contentType}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          pkg.riskLevel === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800'
                            : pkg.riskLevel === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {pkg.riskLevel}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{pkg.ownerName}</div>
                      <div className="text-[10px] text-slate-400">{pkg.unitName ? pkg.unitName.split(' ')[0] : 'Unit'}</div>
                    </td>
                    <td className="p-3 font-medium text-slate-700">
                      {new Date(pkg.deadline).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-3 text-right">
                      <button className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded font-semibold text-[11px] transition-colors">
                        Buka
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">
              Agenda Tayang & Tenggat Waktu (September 2026)
            </h3>
            <span className="text-xs text-slate-500">Berdasarkan tanggal deadline paket konten</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => handleCardClick(pkg.id)}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-300 transition-all cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono font-bold text-slate-600">{pkg.packageNumber}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {new Date(pkg.deadline).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                  {pkg.title}
                </h4>
                <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>{pkg.contentType}</span>
                  <span className="font-semibold text-slate-700">{pkg.lifecycleStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
