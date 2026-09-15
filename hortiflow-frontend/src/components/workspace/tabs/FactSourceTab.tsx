import React, { useState } from 'react';
import {
  FileText,
  Link,
  ShieldCheck,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Check,
  X,
  FileCheck2,
} from 'lucide-react';
import { ContentPackage, ContentSource, Claim } from '../../../types';
import { useHortiFlow } from '../../../context/HortiFlowContext';

interface FactSourceTabProps {
  pkg: ContentPackage;
}

export const FactSourceTab: React.FC<FactSourceTabProps> = ({ pkg }) => {
  const {
    getSourcesForPackage,
    addContentSource,
    verifySource,
    getClaimsForPackage,
    addClaim,
    verifyClaim,
    currentUser,
  } = useHortiFlow();

  const sources = getSourcesForPackage(pkg.id);
  const claims = getClaimsForPackage(pkg.id);

  const [showAddSource, setShowAddSource] = useState(false);
  const [showAddClaim, setShowAddClaim] = useState(false);

  // New Source form states
  const [srcTitle, setSrcTitle] = useState('');
  const [srcType, setSrcType] = useState<ContentSource['sourceType']>('OFFICIAL_DATA');
  const [srcUrl, setSrcUrl] = useState('');
  const [srcFileName, setSrcFileName] = useState('');
  const [srcNotes, setSrcNotes] = useState('');

  // New Claim form states
  const [claimText, setClaimText] = useState('');
  const [claimSourceId, setClaimSourceId] = useState(sources[0]?.id || '');
  const [claimCategory, setClaimCategory] = useState<Claim['claimCategory']>('STATISTIC');
  const [claimLocation, setClaimLocation] = useState('');

  const handleCreateSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srcTitle.trim()) return;

    addContentSource(pkg.id, {
      title: srcTitle,
      sourceType: srcType,
      referenceUrl: srcUrl || undefined,
      fileName: srcFileName || undefined,
      snapshotHash: `SHA256-${Math.random().toString(36).substring(2, 12)}`,
      extractedNotes: srcNotes,
      verified: currentUser.role === 'REVIEWER',
      verifiedById: currentUser.role === 'REVIEWER' ? currentUser.id : undefined,
      verifiedByName: currentUser.role === 'REVIEWER' ? currentUser.fullName : undefined,
    });

    setShowAddSource(false);
    setSrcTitle('');
    setSrcUrl('');
    setSrcFileName('');
    setSrcNotes('');
  };

  const handleCreateClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimText.trim()) return;

    const matchedSource = sources.find((s) => s.id === claimSourceId) || sources[0];

    addClaim(pkg.id, {
      sourceId: matchedSource?.id || 'manual',
      sourceTitle: matchedSource?.title || 'Sumber Manual',
      claimText,
      claimCategory,
      contextLocation: claimLocation || 'Paragraf naskah utama',
    });

    setShowAddClaim(false);
    setClaimText('');
    setClaimLocation('');
  };

  const isReviewerOrApprover = currentUser.role === 'REVIEWER' || currentUser.role === 'APPROVER';

  return (
    <div className="space-y-6 text-xs" id="workspace-tab-fact-source">
      {/* Header Summary */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Claim Registry & Rujukan Sumber Bukti
            </h3>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Pusat penjaminan keaslian informasi: seluruh klaim angka, kebijakan, nama varietas dan kutipan wajib terikat pada bukti sah.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddSource(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Sumber</span>
          </button>
          <button
            onClick={() => setShowAddClaim(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Daftarkan Klaim Baru</span>
          </button>
        </div>
      </div>

      {/* Modal Add Source */}
      {showAddSource && (
        <form onSubmit={handleCreateSource} className="bg-white rounded-xl border border-emerald-300 p-5 space-y-3 shadow-md animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-slate-900 text-sm">Tambah Sumber Referensi Bukti</span>
            <button type="button" onClick={() => setShowAddSource(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Judul Dokumen / Regulasi *</label>
              <input
                type="text"
                required
                value={srcTitle}
                onChange={(e) => setSrcTitle(e.target.value)}
                placeholder="Contoh: Keputusan Menteri Pertanian No. 342/2024..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Tipe Sumber *</label>
              <select
                value={srcType}
                onChange={(e) => setSrcType(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="OFFICIAL_DATA">Data Resmi Balai / Direktorat</option>
                <option value="REGULATION">Peraturan / SK Menteri / SE Dirjen</option>
                <option value="DOCUMENT">Laporan Penelitian / Riset Ilmiah</option>
                <option value="INTERVIEW">Wawancara Pejabat / Ahli / Petani</option>
                <option value="URL">Laman Berita Resmi / Jurnal Online</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">URL Tautan (Opsional)</label>
              <input
                type="url"
                value={srcUrl}
                onChange={(e) => setSrcUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Nama File Bukti (PDF / Excel)</label>
              <input
                type="text"
                value={srcFileName}
                onChange={(e) => setSrcFileName(e.target.value)}
                placeholder="Laporan_Demplot_Grobogan.pdf"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Ekstrak Catatan Bukti</label>
            <textarea
              rows={2}
              value={srcNotes}
              onChange={(e) => setSrcNotes(e.target.value)}
              placeholder="Kutipan kalimat atau angka penting yang mendasari naskah..."
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddSource(false)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
            >
              Simpan Sumber
            </button>
          </div>
        </form>
      )}

      {/* Modal Add Claim */}
      {showAddClaim && (
        <form onSubmit={handleCreateClaim} className="bg-white rounded-xl border border-emerald-300 p-5 space-y-3 shadow-md animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-slate-900 text-sm">Daftarkan Klaim Faktual Baru</span>
            <button type="button" onClick={() => setShowAddClaim(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Teks Pernyataan / Klaim *</label>
            <textarea
              required
              rows={2}
              value={claimText}
              onChange={(e) => setClaimText(e.target.value)}
              placeholder="Contoh: Kebutuhan benih biji botani hanya berkisar 3-5 kg per hektar..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Kategori Klaim</label>
              <select
                value={claimCategory}
                onChange={(e) => setClaimCategory(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="STATISTIC">Angka / Statistik Produksi / Biaya</option>
                <option value="DATE">Tanggal / Periode Pelaksanaan</option>
                <option value="POLICY">Regulasi / Ketetapan Kebijakan</option>
                <option value="VARIETY_NAME">Nama Varietas / Benih Resmi</option>
                <option value="QUOTE">Kutipan Pernyataan Pejabat</option>
                <option value="LOCATION">Nama Lokasi / Sentra Daerah</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Sumber Bukti Terkait</label>
              <select
                value={claimSourceId}
                onChange={(e) => setClaimSourceId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Letak Konteks Naskah</label>
              <input
                type="text"
                value={claimLocation}
                onChange={(e) => setClaimLocation(e.target.value)}
                placeholder="Paragraf 2, kalimat ke-1"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddClaim(false)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
            >
              Daftarkan Klaim
            </button>
          </div>
        </form>
      )}

      {/* Section 1: Daftar Klaim Terdaftar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-sm text-slate-900">
              Registri Klaim Material ({claims.filter((c) => c.isVerified).length}/{claims.length} Terverifikasi)
            </h4>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Setiap klaim diverifikasi oleh Reviewer ahli sebelum persetujuan manifest dapat diterbitkan.
            </p>
          </div>
          {isReviewerOrApprover && (
            <span className="text-[11px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
              Wewenang Verifikasi Aktif ({currentUser.role})
            </span>
          )}
        </div>

        <div className="space-y-3">
          {claims.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              Belum ada klaim terdaftar. Silakan daftarkan klaim faktual di atas.
            </div>
          ) : (
            claims.map((claim) => (
              <div
                key={claim.id}
                className={`p-4 rounded-xl border transition-all ${
                  claim.isVerified
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-amber-50/40 border-amber-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          claim.isVerified
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {claim.claimCategory}
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Letak: <b className="text-slate-700">{claim.contextLocation}</b>
                      </span>
                    </div>

                    <p className="font-bold text-slate-900 text-xs leading-snug">
                      "{claim.claimText}"
                    </p>

                    <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Sumber: <b>{claim.sourceTitle}</b></span>
                    </div>
                  </div>

                  {/* Verification action */}
                  <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                    {claim.isVerified ? (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-100 px-2.5 py-1 rounded-md">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Terverifikasi Sah</span>
                        </span>
                        {claim.verifiedByName && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Oleh: {claim.verifiedByName}
                          </span>
                        )}
                        {isReviewerOrApprover && (
                          <button
                            onClick={() => verifyClaim(claim.id, false)}
                            className="text-[10px] text-slate-400 hover:text-rose-600 block ml-auto mt-0.5"
                          >
                            Batalkan Verifikasi
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-amber-700 font-bold text-xs bg-amber-100 px-2.5 py-1 rounded-md">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Menunggu Cek Reviewer</span>
                        </span>
                        {isReviewerOrApprover && (
                          <button
                            onClick={() => verifyClaim(claim.id, true)}
                            className="mt-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded flex items-center gap-1 shadow-2xs"
                          >
                            <Check className="w-3 h-3" />
                            <span>Verifikasi Klaim</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Section 2: Sumber Referensi Bukti (Sources of Truth) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <h4 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
          Daftar Bukti Fisik & Snapshot Dokumen ({sources.length})
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {sources.map((src) => (
            <div
              key={src.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                  {src.sourceType}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    src.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {src.verified ? 'Snapshot Sah' : 'Draf Rujukan'}
                </span>
              </div>

              <h5 className="font-bold text-xs text-slate-900 leading-snug">{src.title}</h5>

              {src.extractedNotes && (
                <p className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-100 italic">
                  "{src.extractedNotes}"
                </p>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-mono">Hash: {src.snapshotHash?.substring(0, 16)}...</span>
                {src.referenceUrl && (
                  <a
                    href={src.referenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5 font-semibold"
                  >
                    <span>Tautan</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
