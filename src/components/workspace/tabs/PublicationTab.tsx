import React, { useState } from 'react';
import {
  Send,
  ExternalLink,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Plus,
  ShieldAlert,
  FileDown,
  X,
  Copy,
} from 'lucide-react';
import { ContentPackage, PublicationRecord, ChannelType } from '../../../types';
import { useHortiFlow } from '../../../context/HortiFlowContext';

interface PublicationTabProps {
  pkg: ContentPackage;
}

export const PublicationTab: React.FC<PublicationTabProps> = ({ pkg }) => {
  const {
    getPublicationsForPackage,
    recordPublicationProof,
    retryPublication,
    takedownPublication,
    getVariantsForPackage,
    currentUser,
  } = useHortiFlow();

  const publications = getPublicationsForPackage(pkg.id);
  const variants = getVariantsForPackage(pkg.id);

  const [showAddProofModal, setShowAddProofModal] = useState(false);
  const [channel, setChannel] = useState<ChannelType>('INSTAGRAM');
  const [liveUrl, setLiveUrl] = useState('');
  const [externalPostId, setExternalPostId] = useState('');
  const [screenshotProofUrl, setScreenshotProofUrl] = useState('');
  const [notes, setNotes] = useState('');

  // Takedown state
  const [takedownRecordId, setTakedownRecordId] = useState<string | null>(null);
  const [takedownReason, setTakedownReason] = useState('');

  const handleRecordProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveUrl.trim()) return;

    recordPublicationProof(pkg.id, {
      channel,
      status: 'SUCCESS',
      liveUrl,
      externalPostId: externalPostId || `EXT-${Date.now()}`,
      screenshotProofUrl: screenshotProofUrl || undefined,
      notes,
    });

    setShowAddProofModal(false);
    setLiveUrl('');
    setExternalPostId('');
    setScreenshotProofUrl('');
    setNotes('');
  };

  const handleConfirmTakedown = () => {
    if (!takedownRecordId || !takedownReason.trim()) {
      alert('Alasan penarikan konten (takedown) wajib dicatat dalam audit trail.');
      return;
    }

    const res = takedownPublication(takedownRecordId, takedownReason);
    if (!res.success) {
      alert(res.error);
    } else {
      alert('Konten berhasil ditarik/takedown dan dicatat dalam audit trail.');
      setTakedownRecordId(null);
      setTakedownReason('');
    }
  };

  const handleExportPackageJson = () => {
    const exportBundle = {
      packageNumber: pkg.packageNumber,
      title: pkg.title,
      riskLevel: pkg.riskLevel,
      status: pkg.lifecycleStatus,
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser.fullName,
      variants,
      publications,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${pkg.packageNumber}_publication_manifest.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 text-xs" id="workspace-tab-publication">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Manajemen Publikasi, Jadwal & Bukti Tayang (Proof of Publication)
            </h3>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Ekspor paket distribusi terintegrasi, pemantauan status kanal, mitigasi kegagalan, dan repositori bukti URL siar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPackageJson}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Ekspor Bundle JSON</span>
          </button>

          <button
            onClick={() => setShowAddProofModal(true)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Catat Bukti Tayang</span>
          </button>
        </div>
      </div>

      {/* Record Proof Modal */}
      {showAddProofModal && (
        <form onSubmit={handleRecordProof} className="bg-white rounded-xl border border-emerald-300 p-6 space-y-4 shadow-md animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-sm text-slate-900">Catat Bukti Publikasi (Proof of Publication)</span>
            <button type="button" onClick={() => setShowAddProofModal(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Kanal Publikasi *</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as ChannelType)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="WEBSITE">Website Portal Resmi</option>
                <option value="INSTAGRAM">Instagram Feed / Reels</option>
                <option value="FACEBOOK">Facebook Fanpage</option>
                <option value="TIKTOK">TikTok</option>
                <option value="YOUTUBE">YouTube</option>
                <option value="X">X (Twitter)</option>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="INTERNAL_PORTAL">Portal Internal</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Tautan Live (URL Siar) *</label>
              <input
                type="url"
                required
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://hortikultura.pertanian.go.id/berita/..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">ID Post Eksternal (API / Meta ID)</label>
              <input
                type="text"
                value={externalPostId}
                onChange={(e) => setExternalPostId(e.target.value)}
                placeholder="1798329482934..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Screenshot URL / Bukti Tangkapan Layar</label>
              <input
                type="text"
                value={screenshotProofUrl}
                onChange={(e) => setScreenshotProofUrl(e.target.value)}
                placeholder="https://storage.../proof.png"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Catatan Tambahan Petugas</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Dipublikasikan manual oleh tim medsos pagi hari..."
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddProofModal(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
            >
              Simpan Bukti Tayang
            </button>
          </div>
        </form>
      )}

      {/* Publications List */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <h4 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
          Riwayat Kanal Publikasi ({publications.length})
        </h4>

        <div className="space-y-3">
          {publications.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              Belum ada rekaman publikasi untuk paket ini. Klik "Catat Bukti Tayang" di atas saat konten telah mengudara.
            </div>
          ) : (
            publications.map((record) => {
              const isSuccess = record.status === 'SUCCESS';
              const isFailed = record.status === 'FAILED';
              const isTakedown = record.status === 'TAKEDOWN';
              const isScheduled = record.status === 'SCHEDULED';

              return (
                <div
                  key={record.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isSuccess
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : isFailed
                      ? 'bg-rose-50/60 border-rose-300'
                      : isTakedown
                      ? 'bg-slate-100 border-slate-300 opacity-80'
                      : 'bg-blue-50/50 border-blue-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{record.channel}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isSuccess
                              ? 'bg-emerald-100 text-emerald-800'
                              : isFailed
                              ? 'bg-rose-100 text-rose-800'
                              : isTakedown
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {record.status}
                        </span>
                        {record.retryCount > 0 && (
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                            Retry: {record.retryCount}
                          </span>
                        )}
                      </div>

                      {record.liveUrl && (
                        <a
                          href={record.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                        >
                          <span>{record.liveUrl}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {record.failureReason && (
                        <div className="p-2 bg-rose-100 text-rose-900 rounded font-medium text-[11px]">
                          Penyebab Kegagalan: {record.failureReason}
                        </div>
                      )}

                      {record.takedownReason && (
                        <div className="p-2 bg-slate-200 text-slate-800 rounded text-[11px]">
                          Alasan Penarikan (Takedown): <b>{record.takedownReason}</b>
                        </div>
                      )}

                      <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-2">
                        <span>ID: <code className="text-slate-700">{record.externalPostId || '-'}</code></span>
                        <span>•</span>
                        <span>
                          {record.publishedAt
                            ? `Tayang: ${new Date(record.publishedAt).toLocaleString('id-ID')}`
                            : 'Belum tayang'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                      {isFailed && (
                        <button
                          onClick={() => {
                            const res = retryPublication(record.id);
                            if (res.success) alert('Publikasi berhasil dikirim ulang (retry)!');
                          }}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded flex items-center gap-1 text-xs shadow-xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Coba Kirim Ulang</span>
                        </button>
                      )}

                      {isSuccess && (
                        <button
                          onClick={() => setTakedownRecordId(record.id)}
                          className="px-2.5 py-1 text-rose-700 hover:bg-rose-100 rounded font-semibold text-[11px] transition-colors"
                        >
                          Takedown / Tarik
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Takedown Confirmation Box */}
                  {takedownRecordId === record.id && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-rose-300 space-y-2">
                      <span className="font-bold text-rose-950 block text-[11px]">
                        Konfirmasi Penarikan Konten (Emergency Takedown):
                      </span>
                      <input
                        type="text"
                        required
                        value={takedownReason}
                        onChange={(e) => setTakedownReason(e.target.value)}
                        placeholder="Wajib masukkan alasan penarikan materi dari peredaran publik..."
                        className="w-full p-2 border border-slate-200 rounded text-xs"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setTakedownRecordId(null)}
                          className="px-3 py-1 border border-slate-200 rounded text-slate-600 font-medium"
                        >
                          Batal
                        </button>
                        <button
                          onClick={handleConfirmTakedown}
                          className="px-3 py-1 bg-rose-600 text-white font-bold rounded"
                        >
                          Eksekusi Takedown
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
    </div>
  );
};
