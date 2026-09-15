import React from 'react';
import {
  Layers,
  Clock,
  Calendar,
  User,
  Building,
  Tag,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  FileText,
  Share2,
  Paperclip,
  CheckSquare,
  Stamp,
  Send,
  AlertCircle,
} from 'lucide-react';
import { ContentPackage, LifecycleStatus } from '../../../types';
import { useHortiFlow } from '../../../context/HortiFlowContext';

interface OverviewTabProps {
  pkg: ContentPackage;
}

const LIFECYCLE_STEPS: LifecycleStatus[] = [
  'IDE',
  'TRIAGED',
  'BRIEF_READY',
  'ASSIGNED',
  'IN_PRODUCTION',
  'IN_REVIEW',
  'APPROVAL_PENDING',
  'APPROVED',
  'SCHEDULED',
  'PUBLISHED',
  'ARCHIVED',
];

export const OverviewTab: React.FC<OverviewTabProps> = ({ pkg }) => {
  const {
    transitionLifecycleStatus,
    toggleBlocker,
    getClaimsForPackage,
    getTasksForPackage,
    getReviewsForPackage,
    getAssetsForPackage,
    getVariantsForPackage,
  } = useHortiFlow();

  const claims = getClaimsForPackage(pkg.id);
  const tasks = getTasksForPackage(pkg.id);
  const reviews = getReviewsForPackage(pkg.id);
  const assets = getAssetsForPackage(pkg.id);
  const variants = getVariantsForPackage(pkg.id);

  const openBlockingFindings = reviews.filter(
    (f) => f.severity === 'BLOCKING' && f.status !== 'VERIFIED_CLOSED'
  );

  const handleStatusChange = (status: LifecycleStatus) => {
    const res = transitionLifecycleStatus(pkg.id, status, `Manual transition to ${status}`);
    if (!res.success) {
      alert(res.error);
    }
  };

  const handleToggleBlockerClick = () => {
    if (pkg.hasBlocker) {
      toggleBlocker(pkg.id, false);
    } else {
      const reason = window.prompt('Masukkan alasan pembukaan blocker:');
      if (reason) toggleBlocker(pkg.id, true, reason);
    }
  };

  const currentStepIndex = LIFECYCLE_STEPS.indexOf(pkg.lifecycleStatus);

  return (
    <div className="space-y-6 text-xs" id="workspace-tab-overview">
      {/* Blocker Alert Banner */}
      {pkg.hasBlocker && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-rose-950">
                Paket Ini Sedang Terganjal Blocker Kritis
              </h4>
              <p className="text-rose-800 text-xs mt-0.5 leading-relaxed">
                {pkg.blockerReason || 'Terdapat temuan review atau verifikasi yang menghambat alur produksi.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleBlockerClick}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shrink-0 self-start sm:self-auto"
          >
            Selesaikan Blocker
          </button>
        </div>
      )}

      {/* Lifecycle Progress Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
            Tahapan Siklus Hidup (Progress Lifecycle)
          </span>
          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
            Status: {pkg.lifecycleStatus}
          </span>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-thin">
          {LIFECYCLE_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = step === pkg.lifecycleStatus;
            return (
              <button
                key={step}
                onClick={() => handleStatusChange(step)}
                title={`Pindah ke status ${step}`}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                  isCurrent
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                <span>{step}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Core Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left 2 Cols: Main Info */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
            Informasi Paket Konten
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 block text-[11px]">Nomor Paket</span>
              <span className="font-mono font-bold text-slate-800 text-sm">{pkg.packageNumber}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Format Konten</span>
              <span className="font-bold text-slate-800">{pkg.contentType}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Penanggung Jawab (Owner)</span>
              <span className="font-semibold text-slate-900">{pkg.ownerName}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Unit Kerja Pengusul</span>
              <span className="font-semibold text-slate-800">{pkg.unitName}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Kampanye Terkait</span>
              <span className="font-medium text-slate-800">
                {pkg.campaignName || 'Bukan bagian kampanye khusus'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Tingkat Risiko & Klasifikasi</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                    pkg.riskLevel === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-800'
                      : pkg.riskLevel === 'HIGH'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  RISIKO {pkg.riskLevel}
                </span>
                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-medium">
                  {pkg.classification}
                </span>
              </div>
            </div>

            <div className="col-span-2">
              <span className="text-slate-400 block text-[11px]">Tindakan Berikutnya (Next Action)</span>
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-800 font-medium mt-1">
                {pkg.nextAction}
              </div>
            </div>

            <div className="col-span-2">
              <span className="text-slate-400 block text-[11px]">Kata Kunci / Tagar</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {pkg.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium text-[11px]"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Stats & SLA */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
            Indikator & Statistik
          </h3>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">Tenggat Waktu</span>
              </div>
              <span className="font-bold text-slate-900">
                {new Date(pkg.deadline).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span className="text-slate-600">Klaim Terdaftar</span>
              </div>
              <span className="font-bold text-slate-900">
                {claims.filter((c) => c.isVerified).length} / {claims.length} Sah
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-sky-600" />
                <span className="text-slate-600">Tugas Produksi</span>
              </div>
              <span className="font-bold text-slate-900">
                {tasks.filter((t) => t.status === 'DONE').length} / {tasks.length} Selesai
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-indigo-600" />
                <span className="text-slate-600">Aset Digital Terkait</span>
              </div>
              <span className="font-bold text-slate-900">{assets.length} file</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber-600" />
                <span className="text-slate-600">Varian Kanal</span>
              </div>
              <span className="font-bold text-slate-900">{variants.length} kanal</span>
            </div>

            <div className="pt-2">
              <button
                onClick={handleToggleBlockerClick}
                className={`w-full py-2 px-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-1.5 ${
                  pkg.hasBlocker
                    ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                }`}
              >
                {pkg.hasBlocker ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-rose-800" />
                    <span>Selesaikan Blocker</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-slate-600" />
                    <span>Angkat / Lapor Blocker</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
