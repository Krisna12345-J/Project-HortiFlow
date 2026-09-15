import React, { useState } from 'react';
import {
  CheckSquare,
  ShieldAlert,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useHortiFlow } from '../../context/HortiFlowContext';
import { ActiveView } from '../layout/Sidebar';
import { FindingSeverity, ReviewCategory } from '../../types';

interface ReviewDeskProps {
  setActiveView: (view: ActiveView) => void;
}

export const ReviewDesk: React.FC<ReviewDeskProps> = ({ setActiveView }) => {
  const { reviewFindings, packages, setSelectedPackageId, currentUser, verifyAndCloseFinding } =
    useHortiFlow();

  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFindings = reviewFindings.filter((f) => {
    if (filterSeverity !== 'ALL' && f.severity !== filterSeverity) return false;
    if (filterStatus !== 'ALL' && f.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        f.title.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.reviewerName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenPackage = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    setActiveView('workspace');
  };

  const isReviewerOrApprover = currentUser.role === 'REVIEWER' || currentUser.role === 'APPROVER';

  const blockingCount = reviewFindings.filter(
    (f) => f.severity === 'BLOCKING' && f.status !== 'VERIFIED_CLOSED'
  ).length;

  return (
    <div className="space-y-6 text-xs" id="review-desk-view">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Meja Peninjauan Mutu & Quality Gate
            </h1>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Daftar audit komprehensif seluruh temuan cek fakta, substansi teknis, gaya editorial, dan kepatuhan hak cipta.
          </p>
        </div>

        {blockingCount > 0 && (
          <div className="px-3.5 py-2 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-900 font-bold self-start sm:self-auto">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>{blockingCount} Temuan BLOCKING Menghambat Alur</span>
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kata kunci temuan atau nama reviewer..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="ALL">Semua Tingkat Keparahan</option>
          <option value="BLOCKING">BLOCKING (Kritis)</option>
          <option value="MAJOR">MAJOR</option>
          <option value="MINOR">MINOR</option>
          <option value="SUGGESTION">SUGGESTION</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="ALL">Semua Status</option>
          <option value="OPEN">Masih Terbuka (Open)</option>
          <option value="RESOLVED_BY_AUTHOR">Diperbaiki Penulis (Resolved)</option>
          <option value="VERIFIED_CLOSED">Tutup & Sah (Verified Closed)</option>
        </select>
      </div>

      {/* Findings Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Keparahan</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Judul Temuan & Deskripsi</th>
                <th className="p-3">Paket Konten Terkait</th>
                <th className="p-3">Reviewer</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFindings.map((finding) => {
                const pkg = packages.find((p) => p.id === finding.packageId);
                const isClosed = finding.status === 'VERIFIED_CLOSED';

                return (
                  <tr key={finding.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          finding.severity === 'BLOCKING'
                            ? 'bg-rose-100 text-rose-800'
                            : finding.severity === 'MAJOR'
                            ? 'bg-amber-100 text-amber-800'
                            : finding.severity === 'MINOR'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {finding.severity}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">{finding.category}</td>
                    <td className="p-3 max-w-sm">
                      <div className="font-bold text-slate-900">{finding.title}</div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {finding.description}
                      </p>
                      {finding.resolutionNotes && (
                        <p className="text-[10px] text-emerald-800 mt-1 line-clamp-1">
                          Revisi: {finding.resolutionNotes}
                        </p>
                      )}
                    </td>
                    <td className="p-3">
                      {pkg ? (
                        <button
                          onClick={() => handleOpenPackage(pkg.id)}
                          className="text-left group"
                        >
                          <span className="font-mono font-bold text-slate-700 group-hover:text-emerald-700 block">
                            {pkg.packageNumber}
                          </span>
                          <span className="text-[11px] text-slate-500 line-clamp-1 group-hover:text-emerald-800">
                            {pkg.title}
                          </span>
                        </button>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-3 text-slate-700 font-medium">{finding.reviewerName}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isClosed
                            ? 'bg-emerald-100 text-emerald-800'
                            : finding.status === 'RESOLVED_BY_AUTHOR'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {finding.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isClosed && isReviewerOrApprover && (
                          <button
                            onClick={() => verifyAndCloseFinding(finding.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px]"
                          >
                            Tutup Sah
                          </button>
                        )}
                        {pkg && (
                          <button
                            onClick={() => handleOpenPackage(pkg.id)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800"
                            title="Buka Workspace"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
