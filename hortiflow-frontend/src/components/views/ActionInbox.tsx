import React, { useState } from 'react';
import {
  Inbox,
  CheckSquare,
  Stamp,
  Clock,
  AlertTriangle,
  ArrowRight,
  Filter,
  Search,
  CheckCircle2,
  FileText,
  User,
  ShieldAlert,
} from 'lucide-react';
import { useHortiFlow } from '../../context/HortiFlowContext';
import { ActiveView } from '../layout/Sidebar';

interface ActionInboxProps {
  setActiveView: (view: ActiveView) => void;
}

export const ActionInbox: React.FC<ActionInboxProps> = ({ setActiveView }) => {
  const { packages, reviewFindings, manifests, setSelectedPackageId, currentUser } = useHortiFlow();

  const [activeTab, setActiveTab] = useState<'semua' | 'tindakan' | 'mention' | 'deadline' | 'selesai'>('tindakan');
  const [searchQuery, setSearchQuery] = useState('');

  // Actionable items data calculation
  // 1. Review items
  const openFindings = reviewFindings.filter((f) => f.status !== 'VERIFIED_CLOSED');
  // 2. Approval items
  const pendingApprovals = packages.filter((p) => p.lifecycleStatus === 'APPROVAL_PENDING');
  // 3. Deadline items
  const nearDeadlinePackages = packages.filter((p) => {
    const diff = new Date(p.deadline).getTime() - new Date().getTime();
    return diff > 0 && diff < 3 * 86400000;
  });

  const totalActionNeeded = openFindings.length + pendingApprovals.length + nearDeadlinePackages.length;

  const handleOpenPackage = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    setActiveView('workspace');
  };

  const handleOpenApprovals = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    setActiveView('approvals');
  };

  return (
    <div className="space-y-6 lg:space-y-8 pb-12" id="action-inbox-view">
      {/* 1. Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
          <Inbox className="w-3.5 h-3.5 text-emerald-600" />
          <span>Pusat Tindakan & Pekerjaan Pengguna</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
          Kotak Masuk
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Daftar terpusat seluruh tugas operasional, permintaan review temuan, meja persetujuan, dan tenggat waktu yang membutuhkan tindakan Anda.
        </p>
      </div>

      {/* 2. Top Summary KPI Cards matching Section 17 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Perlu Tindakan</span>
          <div className="text-2xl font-black text-rose-600 font-mono tabular-nums">{totalActionNeeded}</div>
          <span className="text-[10px] text-rose-700 font-semibold block">Prioritas utama</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Review Mutu</span>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">{openFindings.length}</div>
          <span className="text-[10px] text-slate-500 font-semibold block">Temuan terbuka</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Persetujuan (Approval)</span>
          <div className="text-2xl font-black text-amber-600 font-mono tabular-nums">{pendingApprovals.length}</div>
          <span className="text-[10px] text-amber-700 font-semibold block">Menunggu keputusan</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Tugas (Task)</span>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">4</div>
          <span className="text-[10px] text-slate-500 font-semibold block">Dalam pengerjaan</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Mendekati Deadline</span>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">{nearDeadlinePackages.length}</div>
          <span className="text-[10px] text-slate-500 font-semibold block">Kurang 3 hari</span>
        </div>
      </div>

      {/* 3. Tabs Navigation & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs: Semua | Perlu Tindakan | Mention Saya | Deadline | Selesai */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold overflow-x-auto">
          {[
            { id: 'tindakan', label: `Perlu Tindakan (${totalActionNeeded})` },
            { id: 'semua', label: 'Semua Item' },
            { id: 'mention', label: 'Mention Saya (1)' },
            { id: 'deadline', label: `Deadline (${nearDeadlinePackages.length})` },
            { id: 'selesai', label: 'Selesai' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari item pekerjaan..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      {/* 4. Actionable Cards Stream matching Section 17 */}
      <div className="space-y-3.5">
        {/* Example Item 1: APPROVAL */}
        {pendingApprovals.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white rounded-2xl border border-amber-200 p-5 shadow-xs hover:border-amber-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-50/30 to-white"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  <Stamp className="w-3 h-3" />
                  <span>APPROVAL WAJIB</span>
                </span>
                <span className="font-mono text-xs font-bold text-slate-500">{pkg.packageNumber}</span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500">{pkg.campaignName || 'Kampanye Mandiri'}</span>
              </div>

              <h4 className="text-base font-bold text-slate-900">{pkg.title}</h4>
              <p className="text-xs text-slate-600">
                Menunggu persetujuan final bertanda tangan digital sebelum dijadwalkan ke saluran siar.
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                <span>Pengusul: <b>{pkg.ownerName}</b></span>
                <span>Klasifikasi: <b>{pkg.classification}</b></span>
                <span>Tingkat Risiko: <b className="text-amber-700">{pkg.riskLevel}</b></span>
              </div>
            </div>

            <button
              onClick={() => handleOpenApprovals(pkg.id)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-2 shrink-0 self-start sm:self-auto"
            >
              <Stamp className="w-4 h-4" />
              <span>Review Sekarang</span>
            </button>
          </div>
        ))}

        {/* Example Item 2: REVIEW FINDING */}
        {openFindings.map((finding) => {
          const pkg = packages.find((p) => p.id === finding.packageId);
          return (
            <div
              key={finding.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                finding.severity === 'BLOCKING'
                  ? 'border-rose-300 bg-rose-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      finding.severity === 'BLOCKING'
                        ? 'bg-rose-100 text-rose-900 border border-rose-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    REVIEW • {finding.severity}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {pkg?.packageNumber || 'PKG'}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">{finding.category}</span>
                </div>

                <h4 className="text-base font-bold text-slate-900">{finding.title}</h4>
                <p className="text-xs text-slate-600">{finding.comment}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>Dari Reviewer: <b>{finding.reviewerName}</b></span>
                  <span>Lokasi Acuan: <b>{finding.locationRef}</b></span>
                </div>
              </div>

              <button
                onClick={() => pkg && handleOpenPackage(pkg.id)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-2 shrink-0 self-start sm:self-auto"
              >
                <span>Buka Paket Konten</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        {/* Example Item 3: TASK ITEM */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-100 text-sky-900 border border-sky-300">
                TUGAS PRODUKSI
              </span>
              <span className="font-mono text-xs font-bold text-slate-500">PKG-2026-0042</span>
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Perbaiki varian narasi & caption Instagram Carousel
            </h4>
            <p className="text-xs text-slate-600">
              Selaraskan dosis rekomendasi pupuk dengan tabel baku Ditjen Hortikultura.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
              <span>Diberikan oleh: <b>Budi Sanjaya</b></span>
              <span>Batas Waktu: <b className="font-mono text-slate-700">Hari ini 17:00</b></span>
            </div>
          </div>

          <button
            onClick={() => packages[0] && handleOpenPackage(packages[0].id)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <span>Kerjakan Tugas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Example Item 4: DEADLINE ITEM */}
        {nearDeadlinePackages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300">
                  TENGGAT WAKTU KRITIS
                </span>
                <span className="font-mono text-xs font-bold text-slate-500">{pkg.packageNumber}</span>
              </div>
              <h4 className="text-base font-bold text-slate-900">{pkg.title}</h4>
              <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                <span>Tenggat: <b className="font-mono text-rose-700">{pkg.deadline}</b></span>
                <span>PIC: <b>{pkg.ownerName}</b></span>
              </div>
            </div>

            <button
              onClick={() => handleOpenPackage(pkg.id)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
            >
              <span>Lihat Paket</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
