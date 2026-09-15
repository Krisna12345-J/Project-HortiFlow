import React from 'react';
import {
  Inbox,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Send,
  ArrowRight,
  ShieldAlert,
  Calendar,
  CheckSquare,
  Stamp,
  User,
  Radio,
  FileText,
  ChevronRight,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import { useHortiFlow } from '../../context/HortiFlowContext';
import { ActiveView } from '../layout/Sidebar';
import { RealTimeNotificationSystem } from './RealTimeNotificationSystem';

interface MainDashboardProps {
  setActiveView: (view: ActiveView) => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ setActiveView }) => {
  const { packages, requests, auditLogs, setSelectedPackageId } = useHortiFlow();

  // Metric counts (Quantitative stats)
  const safePackages = packages || [];
  const safeRequests = requests || [];

  const inProductionCount = safePackages.filter(
    (p) => p.lifecycleStatus === 'IN_PRODUCTION' || p.lifecycleStatus === 'ASSIGNED'
  ).length;
  const inReviewCount = safePackages.filter(
    (p) => p.lifecycleStatus === 'IN_REVIEW' || p.lifecycleStatus === 'CHANGES_REQUESTED'
  ).length;
  const pendingApprovalCount = safePackages.filter(
    (p) => p.lifecycleStatus === 'APPROVAL_PENDING'
  ).length;
  const scheduledCount = safePackages.filter((p) => p.lifecycleStatus === 'SCHEDULED').length;
  const publishedCount = safePackages.filter((p) => p.lifecycleStatus === 'PUBLISHED').length;
  const publishFailedCount = safePackages.filter((p) => p.lifecycleStatus === 'PUBLISH_FAILED').length;
  const newRequestsCount = safeRequests.filter((r) => r.status === 'SUBMITTED').length;

  // High risk & blockers
  const highRiskPackages = safePackages.filter(
    (p) => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL'
  );
  const blockedPackages = safePackages.filter((p) => p.hasBlocker);

  // Urgent deadlines (within 7 days)
  const now = new Date().getTime();
  const urgentPackages = safePackages
    .filter((p) => p.lifecycleStatus !== 'PUBLISHED' && p.lifecycleStatus !== 'ARCHIVED')
    .map((p) => {
      const deadlineTime = new Date(p.deadline).getTime();
      const diffDays = Math.ceil((deadlineTime - now) / (1000 * 60 * 60 * 24));
      return { ...p, daysRemaining: diffDays };
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 4);

  const handleOpenPackage = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    setActiveView('workspace');
  };

  return (
    <div className="space-y-6 lg:space-y-8 pb-12" id="main-dashboard-view">
      {/* 1. Header Banner: Institutional, Authoritative & Balanced */}
      <div className="bg-emerald-950 text-white rounded-2xl p-6 sm:p-7 lg:p-8 border border-emerald-900/90 shadow-sm relative overflow-hidden">
        {/* Subtle geometric backdrop pattern */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-emerald-900/30 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-700/50 text-emerald-300 text-xs font-semibold tracking-wide font-['Plus_Jakarta_Sans',sans-serif]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sistem Manajemen Konten Digital Mandiri</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-['Plus_Jakarta_Sans',sans-serif]">
              Pusat Operasional Konten HORTIFLOW
            </h1>

            <p className="text-emerald-100/80 text-sm leading-relaxed max-w-2xl font-normal font-['Plus_Jakarta_Sans',sans-serif]">
              Kelola seluruh siklus hidup konten dari usulan, brief, klaim fakta, produksi, review
              mutu bergradasi risiko, persetujuan manifest berpenanda tangan digital, hingga publikasi
              multi-kanal dan arsip permanen.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              id="btn-nav-kanban"
              onClick={() => setActiveView('kanban')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-lg text-xs transition-colors shadow-xs flex items-center gap-2 font-['Plus_Jakarta_Sans',sans-serif]"
            >
              <span>Papan Alur (Kanban)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="btn-nav-approvals"
              onClick={() => setActiveView('approvals')}
              className="px-4 py-2.5 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 font-semibold rounded-lg text-xs border border-emerald-700/60 transition-colors flex items-center gap-2 font-['Plus_Jakarta_Sans',sans-serif]"
            >
              <Stamp className="w-4 h-4 text-amber-300" />
              <span>
                Persetujuan (
                <span className="font-mono font-bold text-amber-300">{pendingApprovalCount}</span>
                )
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME NOTIFICATION & URGENT ALERT SYSTEM */}
      <RealTimeNotificationSystem setActiveView={setActiveView} />

      {/* 3. Key Operational Metrics Grid (5 Balanced Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
        {/* Card 1: Usulan Baru */}
        <div
          id="metric-card-intake"
          onClick={() => setActiveView('intake')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 font-['Plus_Jakarta_Sans',sans-serif]">
                Usulan Baru
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                <Inbox className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {newRequestsCount}
            </div>
          </div>
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-['Plus_Jakarta_Sans',sans-serif]">
            <span className="text-emerald-700 font-semibold">Menunggu triase</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Card 2: Dalam Produksi */}
        <div
          id="metric-card-production"
          onClick={() => setActiveView('kanban')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-sky-300 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 font-['Plus_Jakarta_Sans',sans-serif]">
                Dalam Produksi
              </span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {inProductionCount}
            </div>
          </div>
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-['Plus_Jakarta_Sans',sans-serif]">
            <span className="text-slate-600 font-medium">Naskah & visual</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Card 3: Sedang Direview */}
        <div
          id="metric-card-review"
          onClick={() => setActiveView('reviews')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 font-['Plus_Jakarta_Sans',sans-serif]">
                Sedang Direview
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                <CheckSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {inReviewCount}
            </div>
          </div>
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-['Plus_Jakarta_Sans',sans-serif]">
            <span className="text-indigo-700 font-semibold">Quality gate & fakta</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Card 4: Persetujuan */}
        <div
          id="metric-card-approval"
          onClick={() => setActiveView('approvals')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 font-['Plus_Jakarta_Sans',sans-serif]">
                Persetujuan
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
                <Stamp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold tracking-tight text-amber-600 font-mono tabular-nums">
              {pendingApprovalCount}
            </div>
          </div>
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-['Plus_Jakarta_Sans',sans-serif]">
            <span className="text-amber-700 font-semibold">Manifest siap tanda</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Card 5: Terjadwal & Tayang */}
        <div
          id="metric-card-publication"
          onClick={() => setActiveView('publication')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-teal-300 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 font-['Plus_Jakarta_Sans',sans-serif]">
                Tayang & Jadwal
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 group-hover:scale-105 transition-transform">
                <Send className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold tracking-tight text-teal-700 font-mono tabular-nums">
              {scheduledCount + publishedCount}
            </div>
          </div>
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-['Plus_Jakarta_Sans',sans-serif]">
            <span className="text-slate-600 font-medium">
              <span className="font-mono font-semibold">{scheduledCount}</span> jadwal •{' '}
              <span className="font-mono font-semibold">{publishedCount}</span> tayang
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>

      {/* 3. Alert & Quality Gate Panels (Blockers & Risk/Failure Monitor) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {/* Quality Gate Blockers */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-sm sm:text-base text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
                  Peringatan Blocker Aktif
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 border border-rose-200 text-rose-700 font-['Plus_Jakarta_Sans',sans-serif]">
                <span className="font-mono">{blockedPackages.length}</span> Temuan Menahan
              </span>
            </div>

            <div className="space-y-3">
              {blockedPackages.length === 0 ? (
                <div className="py-7 px-4 rounded-lg bg-emerald-50/50 border border-emerald-100 text-center flex flex-col items-center justify-center space-y-1.5">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <p className="text-xs text-emerald-800 font-semibold font-['Plus_Jakarta_Sans',sans-serif]">
                    Semua Quality Gate Bersih
                  </p>
                  <p className="text-[11px] text-emerald-700/80 font-['Plus_Jakarta_Sans',sans-serif]">
                    Tidak ada temuan peninjauan berstatus BLOCKING yang menahan alur kerja saat ini.
                  </p>
                </div>
              ) : (
                blockedPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => handleOpenPackage(pkg.id)}
                    className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/30 hover:bg-rose-50/80 transition-colors cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-rose-800 bg-rose-100/80 px-2 py-0.5 rounded">
                        {pkg.packageNumber}
                      </span>
                      <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wide font-['Plus_Jakarta_Sans',sans-serif]">
                        STOPPER AKTIF
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1 font-['Plus_Jakarta_Sans',sans-serif]">
                      {pkg.title}
                    </h3>
                    <p className="text-[11px] text-rose-700 line-clamp-2 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
                      {pkg.blockerReason}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setActiveView('inbox')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 font-['Plus_Jakarta_Sans',sans-serif]"
            >
              <span>Buka Meja Peninjauan (Review Desk)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Risk & Transmission Monitor */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-sm sm:text-base text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
                  Kepatuhan Risiko & Transmisi
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 border border-amber-200 text-amber-800 font-['Plus_Jakarta_Sans',sans-serif]">
                <span className="font-mono">{highRiskPackages.length + publishFailedCount}</span>{' '}
                Perhatian
              </span>
            </div>

            <div className="space-y-3">
              {publishFailedCount > 0 && (
                <div
                  onClick={() => setActiveView('publication')}
                  className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/40 hover:bg-rose-50/80 transition-colors cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-700 flex items-center gap-1.5 font-['Plus_Jakarta_Sans',sans-serif]">
                      <Radio className="w-3.5 h-3.5 text-rose-600" />
                      <span>
                        Publikasi Kanal Gagal (
                        <span className="font-mono">{publishFailedCount}</span>)
                      </span>
                    </span>
                    <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold uppercase font-['Plus_Jakarta_Sans',sans-serif]">
                      RETRY REQUIRED
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 line-clamp-1 font-medium font-['Plus_Jakarta_Sans',sans-serif]">
                    PKG-2026-0049: Klarifikasi Residu Pestisida — API Handshake Timeout
                  </p>
                </div>
              )}

              {highRiskPackages.slice(0, 2).map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => handleOpenPackage(pkg.id)}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {pkg.packageNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-['Plus_Jakarta_Sans',sans-serif] ${
                        pkg.riskLevel === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      RISIKO {pkg.riskLevel}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-slate-900 line-clamp-1 font-['Plus_Jakarta_Sans',sans-serif]">
                    {pkg.title}
                  </h3>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 font-['Plus_Jakarta_Sans',sans-serif]">
                    <span>{pkg.unitName}</span>
                    <span>•</span>
                    <span className="capitalize">
                      {pkg.contentType.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setActiveView('publication')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 font-['Plus_Jakarta_Sans',sans-serif]"
            >
              <span>Buka Hub Publikasi & Bukti</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Two-Column Main Content: Urgent Deadlines vs Realtime Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column: Tenggat Waktu Kritis (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="space-y-0.5">
              <h2 className="font-bold text-base sm:text-lg text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
                Tenggat Waktu Kritis & Prioritas
              </h2>
              <p className="text-xs text-slate-500 font-['Plus_Jakarta_Sans',sans-serif]">
                Paket konten aktif dengan pengawalan jadwal publikasi terdekat
              </p>
            </div>
            <button
              onClick={() => setActiveView('kanban')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 font-['Plus_Jakarta_Sans',sans-serif]"
            >
              <span>
                Lihat Semua Paket (
                <span className="font-mono font-bold">{packages.length}</span>)
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {urgentPackages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => handleOpenPackage(pkg.id)}
                className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-3 -mx-3 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {pkg.packageNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-['Plus_Jakarta_Sans',sans-serif] ${
                        pkg.lifecycleStatus === 'APPROVAL_PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : pkg.lifecycleStatus === 'IN_REVIEW'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {pkg.lifecycleStatus}
                    </span>
                    <span className="text-xs text-slate-400 font-medium font-['Plus_Jakarta_Sans',sans-serif]">
                      • {pkg.contentType.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 font-['Plus_Jakarta_Sans',sans-serif]">
                    {pkg.title}
                  </h3>

                  <div className="text-xs text-slate-500 flex items-center flex-wrap gap-3 font-['Plus_Jakarta_Sans',sans-serif]">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>
                        PIC: <b className="text-slate-700 font-medium">{pkg.ownerName}</b>
                      </span>
                    </span>
                    <span>•</span>
                    <span>
                      Tindakan: <span className="text-slate-600 font-medium">{pkg.nextAction}</span>
                    </span>
                  </div>
                </div>

                <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5">
                  <div
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md font-['Plus_Jakarta_Sans',sans-serif] ${
                      pkg.daysRemaining <= 2
                        ? 'bg-rose-100 text-rose-800'
                        : pkg.daysRemaining <= 5
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {pkg.daysRemaining <= 0 ? (
                        'Hari Ini!'
                      ) : (
                        <>
                          <span className="font-mono tabular-nums">{pkg.daysRemaining}</span> hari
                          lagi
                        </>
                      )}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono font-medium tabular-nums">
                    {new Date(pkg.deadline).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Aktivitas Audit & Rekaman Sistem (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="space-y-0.5">
              <h2 className="font-bold text-base sm:text-lg text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
                Aktivitas Audit
              </h2>
              <p className="text-xs text-slate-500 font-['Plus_Jakarta_Sans',sans-serif]">
                Jejak rekaman sistem tak terhapus
              </p>
            </div>
            <button
              onClick={() => setActiveView('audit')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 font-['Plus_Jakarta_Sans',sans-serif]"
            >
              <span>Log Penuh</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[380px] pr-1">
            {auditLogs.slice(0, 6).map((log, idx) => (
              <div
                key={`${log.id || 'aud'}-${idx}`}
                className="text-xs pb-3 border-b border-slate-100 last:border-0 last:pb-0 space-y-1"
              >
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-semibold text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
                    {log.actorName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                    {new Date(log.timestamp).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded inline-block">
                    {log.action}
                  </span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
                  {log.diffDescription || log.reason || log.targetTitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Bottom System Quick Architecture Overview (Clean footer summary) */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Separation of Duties
              </h3>
              <p className="text-slate-500 leading-relaxed text-[11px] font-['Plus_Jakarta_Sans',sans-serif]">
                Kreator dilarang menyetujui karya sendiri. Peninjauan multi-disiplin wajib tuntas
                sebelum manifest diterbitkan.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 shrink-0 mt-0.5">
              <FileText className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Klaim Faktual Terverifikasi
              </h3>
              <p className="text-slate-500 leading-relaxed text-[11px] font-['Plus_Jakarta_Sans',sans-serif]">
                Seluruh narasi dan infografis merujuk pada bukti primer dan nomor registrasi klaim
                yang telah diautentikasi.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0 mt-0.5">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Multi-Channel Proof of Publication
              </h3>
              <p className="text-slate-500 leading-relaxed text-[11px] font-['Plus_Jakarta_Sans',sans-serif]">
                Setiap materi yang didistribusikan ke Instagram, Portal Web, maupun X diverifikasi
                dengan tautan bukti siar live.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
