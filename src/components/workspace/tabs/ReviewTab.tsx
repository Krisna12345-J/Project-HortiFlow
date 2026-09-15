import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  X,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { ContentPackage, ReviewFinding, ReviewCategory, FindingSeverity } from '../../../types';
import { useHortiFlow } from '../../../context/HortiFlowContext';

interface ReviewTabProps {
  pkg: ContentPackage;
}

export const ReviewTab: React.FC<ReviewTabProps> = ({ pkg }) => {
  const {
    getReviewsForPackage,
    addReviewFinding,
    resolveFindingByAuthor,
    verifyAndCloseFinding,
    currentUser,
  } = useHortiFlow();

  const reviews = getReviewsForPackage(pkg.id);

  const [showAddForm, setShowAddForm] = useState(false);
  const [category, setCategory] = useState<ReviewCategory>('FACT_CHECK');
  const [severity, setSeverity] = useState<FindingSeverity>('BLOCKING');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recommendation, setRecommendation] = useState('');

  // Author resolve prompt state
  const [resolvingFindingId, setResolvingFindingId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const handleCreateFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    addReviewFinding(pkg.id, {
      category,
      severity,
      title,
      description,
      recommendation,
    });

    setShowAddForm(false);
    setTitle('');
    setDescription('');
    setRecommendation('');
  };

  const handleResolveSubmit = (findingId: string) => {
    if (!resolutionNotes.trim()) {
      alert('Harap masukkan catatan perbaikan yang telah Anda lakukan.');
      return;
    }

    const res = resolveFindingByAuthor(findingId, resolutionNotes);
    if (!res.success) {
      alert(res.error);
    } else {
      setResolvingFindingId(null);
      setResolutionNotes('');
    }
  };

  const handleVerifyClose = (findingId: string) => {
    const res = verifyAndCloseFinding(findingId);
    if (!res.success) {
      alert(res.error);
    } else {
      alert('Temuan berhasil diverifikasi dan ditutup.');
    }
  };

  const blockingOpenCount = reviews.filter(
    (r) => r.severity === 'BLOCKING' && r.status !== 'VERIFIED_CLOSED'
  ).length;

  const isReviewerOrApprover = currentUser.role === 'REVIEWER' || currentUser.role === 'APPROVER';

  return (
    <div className="space-y-6 text-xs" id="workspace-tab-review">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Quality Gate & Peninjauan Mutu Berbasis Risiko
            </h3>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Audit substansi klaim, kejelasan redaksi, identitas jenama, privasi data, dan kepatuhan hukum sebelum rilis.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Temuan Review</span>
        </button>
      </div>

      {/* Blocking Alert Warning */}
      {blockingOpenCount > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-rose-950">
              Terdapat {blockingOpenCount} Temuan Kritis (BLOCKING) yang Belum Ditutup
            </h4>
            <p className="text-rose-800 text-xs mt-0.5 leading-relaxed">
              Aturan sistem: Paket konten dengan temuan tingkat <b>BLOCKING</b> secara otomatis dilarang masuk ke tahap <i>Approval Pending</i> atau <i>Published</i> sebelum temuan diverifikasi tutup oleh Reviewer independen.
            </p>
          </div>
        </div>
      )}

      {/* Add Finding Modal/Form */}
      {showAddForm && (
        <form onSubmit={handleCreateFinding} className="bg-white rounded-xl border border-indigo-300 p-6 space-y-4 shadow-md animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-sm text-slate-900">Catat Temuan Peninjauan (Review Finding)</span>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Kategori Peninjauan *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ReviewCategory)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="FACT_CHECK">Cek Fakta & Angka Statistik (Fact Check)</option>
                <option value="SUBJECT_MATTER">Substansi Teknis Hortikultura (Subject Matter)</option>
                <option value="EDITORIAL">Tata Bahasa & Kejelasan Narasi (Editorial)</option>
                <option value="BRAND_IDENTITY">Identitas Jenama & Logo Resmi (Brand Identity)</option>
                <option value="LEGAL_PRIVACY">Hukum, Regulasi & Privasi Data (Legal/Privacy)</option>
                <option value="RIGHTS_CHECK">Hak Cipta & Izin Visual (Rights Check)</option>
                <option value="ACCESSIBILITY">Aksesibilitas & Alt-Text (Accessibility)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Tingkat Keparahan (Severity) *</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as FindingSeverity)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
              >
                <option value="BLOCKING">BLOCKING (Mencegah publikasi / persetujuan)</option>
                <option value="MAJOR">MAJOR (Wajib diperbaiki segera)</option>
                <option value="MINOR">MINOR (Koreksi kecil redaksional)</option>
                <option value="SUGGESTION">SUGGESTION (Saran perbaikan opsional)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Judul Temuan *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Ketidaksesuaian angka produktivitas per hektar pada paragraf 2..."
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Penjelasan Masalah *</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan secara spesifik letak kesalahan dan potensi risikonya..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Rekomendasi Perbaikan</label>
            <input
              type="text"
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="Contoh: Ubah angka menjadi 26 ton/ha sesuai rujukan BPSMB Grobogan..."
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs"
            >
              Simpan Temuan
            </button>
          </div>
        </form>
      )}

      {/* Findings List */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            Belum ada temuan review. Seluruh komponen dinilai memenuhi standar.
          </div>
        ) : (
          reviews.map((finding) => {
            const isClosed = finding.status === 'VERIFIED_CLOSED';
            const isAuthorResolved = finding.status === 'RESOLVED_BY_AUTHOR';
            const isOpen = finding.status === 'OPEN';

            return (
              <div
                key={finding.id}
                className={`p-4 rounded-xl border transition-all bg-white shadow-2xs ${
                  finding.severity === 'BLOCKING' && !isClosed
                    ? 'border-rose-300'
                    : isClosed
                    ? 'border-slate-200 opacity-80'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-2 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
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
                      <span className="text-[11px] font-semibold text-slate-500">
                        {finding.category}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Oleh: {finding.reviewerName}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mt-1">{finding.title}</h4>
                  </div>

                  <div className="shrink-0">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 ${
                        isClosed
                          ? 'bg-emerald-100 text-emerald-800'
                          : isAuthorResolved
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isClosed ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Tutup & Terverifikasi</span>
                        </>
                      ) : isAuthorResolved ? (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Menunggu Cek Reviewer</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Masih Terbuka</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="py-3 space-y-2 text-slate-800 leading-relaxed">
                  <p className="text-xs">{finding.description}</p>
                  {finding.recommendation && (
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-700">
                      <b className="text-slate-900">Rekomendasi Reviewer:</b> {finding.recommendation}
                    </div>
                  )}

                  {finding.resolutionNotes && (
                    <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-900">
                      <b className="text-emerald-950">Catatan Perbaikan Penulis:</b> {finding.resolutionNotes}
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400">
                    {new Date(finding.createdAt).toLocaleString('id-ID')}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Author action */}
                    {isOpen && (
                      <button
                        onClick={() => setResolvingFindingId(finding.id)}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded text-[11px] transition-colors"
                      >
                        Tandai Telah Diperbaiki
                      </button>
                    )}

                    {/* Reviewer / Approver verification action (Separation of duties!) */}
                    {!isClosed && isReviewerOrApprover && (
                      <button
                        onClick={() => handleVerifyClose(finding.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] flex items-center gap-1 shadow-2xs transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        <span>Verifikasi & Tutup Temuan</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Author Resolution Input Box */}
                {resolvingFindingId === finding.id && (
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <label className="font-semibold text-slate-700 block text-[11px]">
                      Jelaskan tindakan perbaikan yang telah Anda lakukan pada naskah/aset:
                    </label>
                    <textarea
                      rows={2}
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Contoh: Sudah diperbarui pada Naskah v2 sesuai angka resmi BPSMB..."
                      className="w-full p-2 bg-white border border-slate-200 rounded text-xs"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setResolvingFindingId(null)}
                        className="px-2.5 py-1 text-slate-600 text-[11px]"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleResolveSubmit(finding.id)}
                        className="px-3.5 py-1 bg-emerald-600 text-white font-bold rounded text-[11px]"
                      >
                        Kirim Jawaban Revisi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
