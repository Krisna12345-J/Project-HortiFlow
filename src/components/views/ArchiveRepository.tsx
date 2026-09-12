import React, { useState } from 'react';
import {
  Archive,
  Search,
  Filter,
  Calendar,
  Layers,
  FileDown,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useHortiFlow } from '../../context/HortiFlowContext';
import { ActiveView } from '../layout/Sidebar';

interface ArchiveRepositoryProps {
  setActiveView: (view: ActiveView) => void;
}

export const ArchiveRepository: React.FC<ArchiveRepositoryProps> = ({ setActiveView }) => {
  const { packages, setSelectedPackageId, campaigns, units } = useHortiFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnit, setFilterUnit] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  // Archived or Published packages qualify for archive repository view
  const archivedPackages = packages.filter(
    (p) => p.lifecycleStatus === 'ARCHIVED' || p.lifecycleStatus === 'PUBLISHED'
  );

  const filteredPackages = archivedPackages.filter((pkg) => {
    if (filterUnit !== 'ALL' && pkg.unitId !== filterUnit) return false;
    if (filterType !== 'ALL' && pkg.contentType !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        pkg.title.toLowerCase().includes(q) ||
        pkg.packageNumber.toLowerCase().includes(q) ||
        pkg.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleOpenWorkspace = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    setActiveView('workspace');
  };

  return (
    <div className="space-y-6 text-xs" id="archive-repository-view">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-emerald-700" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Repositori Arsip Digital Permanen
            </h1>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Pusat penyimpanan permanen seluruh materi konten terpublikasi, riwayat versi brief, aset digital master, dan audit persetujuan.
          </p>
        </div>

        <div className="text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold self-start sm:self-auto">
          Total Terarsip: <b>{archivedPackages.length} Paket</b>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan judul, kata kunci, nomor paket..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <select
          value={filterUnit}
          onChange={(e) => setFilterUnit(e.target.value)}
          className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 max-w-[200px]"
        >
          <option value="ALL">Semua Unit Kerja</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="ALL">Semua Format Konten</option>
          <option value="ARTICLE">Artikel Web</option>
          <option value="INFOGRAPHIC">Infografis</option>
          <option value="SHORT_VIDEO">Video Pendek</option>
          <option value="PRESS_RELEASE">Siaran Pers</option>
          <option value="SOCIAL_CAROUSEL">Social Carousel</option>
        </select>
      </div>

      {/* Archive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPackages.map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => handleOpenWorkspace(pkg.id)}
            className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] mb-2">
                <span className="font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                  {pkg.packageNumber}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {pkg.lifecycleStatus}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                {pkg.title}
              </h3>

              <div className="mt-2 text-slate-500 text-[11px] space-y-0.5">
                <div>Unit: <b className="text-slate-700">{pkg.unitName}</b></div>
                <div>PIC: <b className="text-slate-700">{pkg.ownerName}</b></div>
                <div>Format: <b className="text-slate-700">{pkg.contentType}</b></div>
              </div>

              <div className="flex flex-wrap gap-1 mt-3">
                {pkg.tags.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>
                {new Date(pkg.updatedAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                Buka Arsip <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
