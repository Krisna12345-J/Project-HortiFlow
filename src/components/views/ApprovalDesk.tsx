import React, { useState } from 'react';
import {
  Stamp,
  CheckCircle,
  AlertTriangle,
  Clock,
  Key,
  Lock,
  ArrowRight,
  ShieldAlert,
  FileCheck2,
} from 'lucide-react';
import { useHortiFlow } from '../../context/HortiFlowContext';
import { ActiveView } from '../layout/Sidebar';
import { ApprovalDecisionType } from '../../types';

interface ApprovalDeskProps {
  setActiveView: (view: ActiveView) => void;
}

export const ApprovalDesk: React.FC<ApprovalDeskProps> = ({ setActiveView }) => {
  const {
    packages,
    approvalManifests,
    setSelectedPackageId,
    currentUser,
    executeApprovalDecision,
    getClaimsForPackage,
    getReviewsForPackage,
  } = useHortiFlow();

  const [decisionNotes, setDecisionNotes] = useState('');
  const [activeDecisionPkgId, setActiveDecisionPkgId] = useState<string | null>(null);
  const [selectedDecision, setSelectedDecision] = useState<ApprovalDecisionType>('APPROVED');

  const pendingPackages = (packages || []).filter((p) => p.lifecycleStatus === 'APPROVAL_PENDING');
  const approvedPackages = (packages || []).filter(
    (p) => p.lifecycleStatus === 'APPROVED' || p.lifecycleStatus === 'SCHEDULED' || p.lifecycleStatus === 'PUBLISHED'
  );

  const handleOpenWorkspace = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    setActiveView('workspace');
  };

  const handleConfirmDecision = () => {
    if (!activeDecisionPkgId) return;

    const res = executeApprovalDecision(activeDecisionPkgId, selectedDecision, decisionNotes);
    if (!res.success) {
      alert(res.error);
    } else {
      alert(`Keputusan [${selectedDecision}] berhasil dieksekusi dengan tanda tangan digital.`);
      setActiveDecisionPkgId(null);
      setDecisionNotes('');
    }
  };

  return (
    <div className="space-y-6 text-xs" id="approval-desk-view">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Stamp className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Pusat Persetujuan & Pengesahan Dokumen
            </h1>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Antrean verifikasi akhir pimpinan, penerbitan manifest persetujuan, tanda tangan digital (HMAC/Ed25519), dan penegakan pemisahan wewenang.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
          <span className="text-slate-500">Peran Aktif:</span>
          <span className="font-bold text-slate-800">{currentUser.fullName}</span>
          <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
            {currentUser.role}
          </span>
        </div>
      </div>

      {/* Pending Approval Section */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <h2 className="font-bold text-sm text-slate-900">
              Antrean Menunggu Persetujuan ({pendingPackages.length} Paket)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Memerlukan tanda tangan pejabat penyetuju</span>
        </div>

        {pendingPackages.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            Tidak ada paket konten yang sedang menunggu persetujuan saat ini.
          </div>
        ) : (
          <div className="space-y-3.5">
            {pendingPackages.map((pkg) => {
              const manifest = approvalManifests.find(
                (m) => m.packageId === pkg.id && m.decision === 'PENDING'
              );
              const claims = getClaimsForPackage(pkg.id) || [];
              const reviews = getReviewsForPackage(pkg.id) || [];

              const unverifiedClaims = claims.filter((c) => !c.isVerified);
              const blockingFindings = reviews.filter(
                (r) => r.severity === 'BLOCKING' && r.status !== 'VERIFIED_CLOSED'
              );

              const isOwner = currentUser.id === pkg.ownerId;
              const isSelfBlocked = isOwner && pkg.riskLevel !== 'LOW';
              const isAdminBlocked = currentUser.role === 'ADMINISTRATOR';

              return (
                <div
                  key={pkg.id}
                  className="p-4 rounded-xl border border-amber-200 bg-amber-50/20 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {pkg.packageNumber}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            pkg.riskLevel === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800'
                              : pkg.riskLevel === 'HIGH'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          RISIKO {pkg.riskLevel}
                        </span>
                        <span className="text-slate-400">• {pkg.contentType}</span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900">{pkg.title}</h3>
                      <p className="text-[11px] text-slate-500">
                        Disusun oleh: <b>{pkg.ownerName}</b> ({pkg.unitName})
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenWorkspace(pkg.id)}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <span>Buka Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Manifest info */}
                  {manifest && (
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Manifest Hash (SHA-256):</span>
                        <span className="font-mono text-slate-800 font-bold">
                          {manifest.manifestHash.substring(0, 24)}...
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Status Klaim:</span>
                        <span
                          className={`font-semibold ${
                            unverifiedClaims.length === 0 ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {unverifiedClaims.length === 0
                            ? '100% Klaim Faktual Sah'
                            : `${unverifiedClaims.length} klaim belum terverifikasi`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Temuan BLOCKING:</span>
                        <span
                          className={`font-semibold ${
                            blockingFindings.length === 0 ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {blockingFindings.length === 0
                            ? '0 Temuan Aktif'
                            : `${blockingFindings.length} temuan belum tuntas`}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Separation of duties checks */}
                  {isSelfBlocked && (
                    <div className="p-2.5 bg-rose-100 text-rose-900 rounded-lg text-[11px] font-semibold flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>
                        Pemisahan Wewenang: Anda adalah penyusun paket ini (Risiko {pkg.riskLevel}). Pejabat penyetuju lain wajib mengesahkan.
                      </span>
                    </div>
                  )}

                  {isAdminBlocked && (
                    <div className="p-2.5 bg-amber-100 text-amber-900 rounded-lg text-[11px] font-semibold flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Administrator teknis dilarang memberikan persetujuan editorial. Silakan beralih ke peran APPROVER.
                      </span>
                    </div>
                  )}

                  {/* Decision Action trigger */}
                  <div className="pt-1 flex justify-end">
                    <button
                      disabled={isSelfBlocked || isAdminBlocked}
                      onClick={() => setActiveDecisionPkgId(pkg.id)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5"
                    >
                      <Stamp className="w-3.5 h-3.5" />
                      <span>Beri Keputusan Penyetujuan</span>
                    </button>
                  </div>

                  {/* Modal / Panel for decision */}
                  {activeDecisionPkgId === pkg.id && (
                    <div className="p-4 bg-white rounded-xl border border-emerald-300 space-y-3 mt-2">
                      <span className="font-bold text-slate-900 block text-xs">
                        Pilih Keputusan Pengesahan untuk {pkg.packageNumber}:
                      </span>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedDecision('APPROVED')}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                            selectedDecision === 'APPROVED'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          Setujui (Approve)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedDecision('CHANGES_REQUESTED')}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                            selectedDecision === 'CHANGES_REQUESTED'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          Minta Perubahan
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedDecision('REJECTED')}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                            selectedDecision === 'REJECTED'
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          Tolak
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-600 font-semibold text-[11px]">
                          Catatan / Instruksi Pengesahan:
                        </label>
                        <input
                          type="text"
                          value={decisionNotes}
                          onChange={(e) => setDecisionNotes(e.target.value)}
                          placeholder="Masukkan catatan pertimbangan..."
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => setActiveDecisionPkgId(null)}
                          className="px-3 py-1.5 border border-slate-200 rounded text-slate-600"
                        >
                          Batal
                        </button>
                        <button
                          onClick={handleConfirmDecision}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-xs"
                        >
                          Tandatangani & Eksekusi
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Approved Packages History */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
          Riwayat Paket yang Telah Disahkan ({approvedPackages.length})
        </h3>

        <div className="divide-y divide-slate-100">
          {approvedPackages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => handleOpenWorkspace(pkg.id)}
              className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-700">{pkg.packageNumber}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                    {pkg.lifecycleStatus}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs mt-0.5">{pkg.title}</h4>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">
                  Tenggat: {new Date(pkg.deadline).toLocaleDateString('id-ID')}
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">Lihat Detail →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
