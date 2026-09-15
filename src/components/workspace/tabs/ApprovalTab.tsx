import React, { useState } from 'react';
import {
  Stamp,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  CheckCircle,
  XCircle,
  Clock,
  Key,
  Lock,
  ArrowRight,
  ShieldAlert,
  Hash,
} from 'lucide-react';
import { ContentPackage, ApprovalDecisionType } from '../../../types';
import { useHortiFlow } from '../../../context/HortiFlowContext';

interface ApprovalTabProps {
  pkg: ContentPackage;
}

export const ApprovalTab: React.FC<ApprovalTabProps> = ({ pkg }) => {
  const {
    getManifestsForPackage,
    generateApprovalManifest,
    executeApprovalDecision,
    currentUser,
    getClaimsForPackage,
    getReviewsForPackage,
  } = useHortiFlow();

  const manifests = getManifestsForPackage(pkg.id);
  const activeManifest = manifests.find((m) => m.decision === 'PENDING') || manifests[0];

  const claims = getClaimsForPackage(pkg.id);
  const reviews = getReviewsForPackage(pkg.id);

  const [notes, setNotes] = useState('');
  const [selectedDecision, setSelectedDecision] = useState<ApprovalDecisionType | null>(null);

  // Separation of duties checks
  const isOwner = currentUser.id === pkg.ownerId;
  const isHighOrCritical = pkg.riskLevel === 'HIGH' || pkg.riskLevel === 'CRITICAL';
  const isSelfApprovalBlocked = isOwner && pkg.riskLevel !== 'LOW';
  const isAdminBlocked = currentUser.role === 'ADMINISTRATOR';

  const unverifiedClaims = claims.filter((c) => !c.isVerified);
  const openBlockingFindings = reviews.filter(
    (r) => r.severity === 'BLOCKING' && r.status !== 'VERIFIED_CLOSED'
  );

  const hasBlockingIssues = unverifiedClaims.length > 0 || openBlockingFindings.length > 0;

  const handleGenerateNewManifest = () => {
    const m = generateApprovalManifest(pkg.id);
    alert(`Manifest Persetujuan v${m.versionNumber} berhasil digenerate dengan SHA-256: ${m.manifestHash.substring(0, 16)}...`);
  };

  const handleExecuteApproval = (decision: ApprovalDecisionType) => {
    const res = executeApprovalDecision(pkg.id, decision, notes);
    if (!res.success) {
      alert(res.error);
    } else {
      alert(`Keputusan persetujuan [${decision}] berhasil dieksekusi dengan tanda tangan digital.`);
      setSelectedDecision(null);
      setNotes('');
    }
  };

  return (
    <div className="space-y-6 text-xs" id="workspace-tab-approval">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Stamp className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Meja Persetujuan (Approval Desk & Immutable Manifest)
            </h3>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Penerbitan persetujuan resmi berbasis ringkasan manifest tak-berubah (immutable), penegakan pemisahan wewenang, dan tanda tangan digital.
          </p>
        </div>

        {!activeManifest && (
          <button
            onClick={handleGenerateNewManifest}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Generate Approval Manifest</span>
          </button>
        )}
      </div>

      {/* Separation of Duties Warning */}
      {isSelfApprovalBlocked && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-rose-950">
              Peringatan Pemisahan Wewenang (Separation of Duties Enforced)
            </h4>
            <p className="text-rose-800 text-xs mt-0.5 leading-relaxed">
              Anda tercatat sebagai <b>Pemilik/Penyusun (Owner)</b> paket ini ({currentUser.fullName}), dan paket ini berisiko <b>{pkg.riskLevel}</b>. Berdasarkan prinsip integritas sistem, pembuat materi dilarang menyetujui karyanya sendiri. Gunakan tombol switcher peran di pojok kanan atas untuk beralih ke <b>Approver / Pejabat Penyetuju</b>.
            </p>
          </div>
        </div>
      )}

      {isAdminBlocked && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-amber-950">
              Batasan Peran Administrator Sistem
            </h4>
            <p className="text-amber-800 text-xs mt-0.5 leading-relaxed">
              Administrator teknis dilarang memberikan persetujuan editorial (Separation of Operational and Editorial Duties). Beralihlah ke peran APPROVER untuk mengesahkan naskah.
            </p>
          </div>
        </div>
      )}

      {/* Manifest Content */}
      {activeManifest ? (
        <div className="space-y-6">
          {/* Manifest Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">
                    Approval Manifest v{activeManifest.versionNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      activeManifest.decision === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : activeManifest.decision === 'CHANGES_REQUESTED'
                        ? 'bg-amber-100 text-amber-800'
                        : activeManifest.decision === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    STATUS: {activeManifest.decision}
                  </span>
                </div>
                <div className="font-mono text-[10px] text-slate-500 mt-1 break-all">
                  Hash SHA-256: <b>{activeManifest.manifestHash}</b>
                </div>
              </div>

              {activeManifest.decision !== 'PENDING' && (
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block">Keputusan Oleh:</span>
                  <span className="font-bold text-slate-900">{activeManifest.decidedByName}</span>
                  <span className="text-[10px] text-slate-400 block">
                    {new Date(activeManifest.decidedAt!).toLocaleString('id-ID')}
                  </span>
                </div>
              )}
            </div>

            {/* Checklist items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-[11px]">
                  Pemeriksaan Mutu & Kepatuhan:
                </span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span>Seluruh Klaim Faktual Sah:</span>
                    <span
                      className={`font-bold ${
                        unverifiedClaims.length === 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {unverifiedClaims.length === 0
                        ? '100% Terverifikasi'
                        : `${unverifiedClaims.length} klaim belum sah`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Temuan BLOCKING Tertutup:</span>
                    <span
                      className={`font-bold ${
                        openBlockingFindings.length === 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {openBlockingFindings.length === 0
                        ? '0 Temuan Aktif'
                        : `${openBlockingFindings.length} temuan belum beres`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Tingkat Risiko:</span>
                    <span className="font-bold text-slate-900">
                      {pkg.riskLevel} (Klasifikasi: {pkg.classification})
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-[11px]">
                  Bukti & Tanda Tangan Digital:
                </span>
                <div className="space-y-1 text-[11px]">
                  <div className="text-slate-500">Tanda Tangan Kriptografis (HMAC/Ed25519):</div>
                  <div className="font-mono text-[10px] bg-white p-2 rounded border border-slate-200 text-slate-700 break-all">
                    {activeManifest.signature || 'Belum ditandatangani'}
                  </div>
                </div>
              </div>
            </div>

            {/* Decision Notes if exists */}
            {activeManifest.decisionNotes && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px]">
                <span className="font-bold text-slate-800">Catatan Pejabat Penyetuju:</span>
                <p className="text-slate-700 mt-0.5">{activeManifest.decisionNotes}</p>
              </div>
            )}

            {/* Approver Action Panel */}
            {activeManifest.decision === 'PENDING' && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Eksekusi Keputusan Penyetujuan
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Masuk sebagai: <b>{currentUser.fullName}</b> ({currentUser.role})
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">
                    Catatan / Pertimbangan Persetujuan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Disetujui untuk ditayangkan sesuai jadwal setelah klarifikasi data Grobogan sah..."
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    disabled={isSelfApprovalBlocked || isAdminBlocked || hasBlockingIssues}
                    onClick={() => handleExecuteApproval('APPROVED')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Setujui (Approve & Tandatangani)</span>
                  </button>

                  <button
                    disabled={isSelfApprovalBlocked || isAdminBlocked}
                    onClick={() => handleExecuteApproval('CHANGES_REQUESTED')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Minta Perubahan / Revisi</span>
                  </button>

                  <button
                    disabled={isSelfApprovalBlocked || isAdminBlocked}
                    onClick={() => handleExecuteApproval('REJECTED')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Tolak Usulan Paket</span>
                  </button>
                </div>

                {hasBlockingIssues && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">
                    * Tombol persetujuan dinonaktifkan karena masih terdapat klaim atau temuan review tingkat BLOCKING yang belum tuntas.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center text-slate-400 rounded-xl border border-slate-200">
          Belum ada Approval Manifest yang digenerate untuk paket konten ini. Klik "Generate Approval Manifest" di atas untuk membuat rangkuman snapshot materiil.
        </div>
      )}
    </div>
  );
};
