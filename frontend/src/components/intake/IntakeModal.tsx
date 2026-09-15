import React from 'react';
import {
  X,
  PlusCircle,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Send,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { ContentType, RiskLevel } from '../../types';
import { ActiveView } from '../layout/Sidebar';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useIntakeForm } from '../../hooks/useIntakeForm';

interface IntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveView: (view: ActiveView) => void;
}

export const IntakeModal: React.FC<IntakeModalProps> = ({ isOpen, onClose, setActiveView }) => {
  const {
    title,
    setTitle,
    contentType,
    setContentType,
    communicationGoal,
    setCommunicationGoal,
    targetAudience,
    setTargetAudience,
    topicsInput,
    setTopicsInput,
    urgency,
    setUrgency,
    riskLevel,
    setRiskLevel,
    requestedDeadline,
    setRequestedDeadline,
    initialSources,
    setInitialSources,
    unitId,
    setUnitId,
    selectedChannels,
    selectedResources,
    detectedDuplicates,
    readinessIndex,
    submittedTicket,
    selectedPreset,
    toggleChannel,
    toggleResource,
    handleApplyPreset,
    handleResetForm,
    handleSubmit,
    setSelectedPackageId,
    units,
    currentUser,
    presets: INTAKE_PRESETS,
    availableChannels: AVAILABLE_CHANNELS,
    availableResources: AVAILABLE_RESOURCES,
  } = useIntakeForm();

  const modalRef = useFocusTrap<HTMLDivElement>(isOpen, {
    onEscape: onClose,
  });

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-50 animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        id="quick-intake-modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="intake-modal-title"
        aria-describedby="intake-modal-desc"
        tabIndex={-1}
        className="fixed inset-x-2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 top-8 sm:top-12 w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 max-h-[calc(100vh-4rem)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 focus:outline-none"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl" aria-hidden="true">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="intake-modal-title" className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  Ajukan Usulan Konten Baru
                </h2>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                  Intake Editorial
                </span>
              </div>
              <p id="intake-modal-desc" className="text-xs text-slate-500 mt-0.5">
                Pintu masuk permohonan produksi konten resmi Ditjen Hortikultura Kementan
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog usulan konten (Esc)"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {submittedTicket ? (
            /* Success Feedback View */
            <div className="py-8 px-4 text-center space-y-4 animate-in fade-in duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Pengajuan Berhasil Tercatat
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1 font-['Plus_Jakarta_Sans']">
                  Nomor Tiket: {submittedTicket.ticketNumber}
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
                  Usulan Anda telah resmi masuk ke antrean triase editorial Ditjen Hortikultura.
                  Planner editorial dan penanggung jawab unit kerja telah menerima notifikasi alur.
                </p>
              </div>

              {submittedTicket.duplicateScore && submittedTicket.duplicateScore > 30 && (
                <div className="max-w-md mx-auto p-3 bg-amber-50 border border-amber-200 rounded-xl text-left flex items-start gap-2.5 text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Potensi Kemiripan Materi ({submittedTicket.duplicateScore}%):</span>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Ditemukan topik serupa dengan paket <b>{submittedTicket.duplicatePkgNum}</b>.
                      Planner dapat menyatukan materi saat triase jika diperlukan.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setActiveView('intake');
                    onClose();
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  Buka Antrean Triase Intake
                </button>
                <button
                  onClick={handleResetForm}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
                >
                  Ajukan Usulan Lain
                </button>
              </div>
            </div>
          ) : (
            /* Main Submission Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Presets / Templates Bar */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Pilih Template Usulan Cepat (Autofill Instan):
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    {selectedPreset ? 'Klik card aktif untuk batal pilih' : 'Klik untuk isi otomatis'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {INTAKE_PRESETS.map((preset) => {
                    const isSelected = selectedPreset === preset.name;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className={`p-2.5 text-left rounded-xl text-xs transition-all relative group flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-50/90 border-2 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'bg-white hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-300 shadow-2xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                isSelected
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800'
                              }`}
                            >
                              {preset.badgeLabel || preset.contentType}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                          </div>
                          <p
                            className={`font-bold text-[11px] leading-tight line-clamp-1 ${
                              isSelected ? 'text-emerald-950' : 'text-slate-800 group-hover:text-emerald-900'
                            }`}
                          >
                            {preset.name}
                          </p>
                        </div>
                        <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 truncate max-w-[100px]">{preset.unit.replace('Direktorat ', 'Dit. ')}</span>
                          <span
                            className={`font-semibold ${
                              isSelected ? 'text-emerald-700' : 'text-slate-400 group-hover:text-emerald-600'
                            }`}
                          >
                            {isSelected ? 'Aktif ✕' : 'Pilih →'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quality & Readiness Score Bar */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-800">
                      Indeks Kelayakan Usulan (Intake Quality):
                    </span>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                        readinessIndex >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : readinessIndex >= 50
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {readinessIndex}%{' '}
                      {readinessIndex >= 80 ? 'Sangat Lengkap' : readinessIndex >= 50 ? 'Cukup Lengkap' : 'Perlu Detail'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {readinessIndex >= 80
                      ? 'Usulan telah memenuhi standar kelayakan triase cepat.'
                      : 'Lengkapi rujukan fakta, kanal prioritas, dan tujuan komunikasi.'}
                  </p>
                </div>

                <div className="w-full sm:w-36 bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      readinessIndex >= 80
                        ? 'bg-emerald-500'
                        : readinessIndex >= 50
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                    style={{ width: `${readinessIndex}%` }}
                  />
                </div>
              </div>

              {/* Duplicate Warning if Detected */}
              {detectedDuplicates.length > 0 && detectedDuplicates[0]?.package && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 animate-in fade-in duration-150">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">
                        Peringatan Duplikasi ({detectedDuplicates[0]?.score || 0}% Kemiripan)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (detectedDuplicates[0]?.package?.id) {
                            setSelectedPackageId(detectedDuplicates[0].package.id);
                            setActiveView('workspace');
                            onClose();
                          }
                        }}
                        className="text-[11px] text-amber-800 underline font-semibold flex items-center gap-0.5"
                      >
                        <span>Lihat Paket Terkait</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Topik ini mirip dengan <b>{detectedDuplicates[0]?.package?.packageNumber}</b>:{' '}
                      "{detectedDuplicates[0]?.package?.title}" (Status:{' '}
                      {detectedDuplicates[0]?.package?.lifecycleStatus}).
                    </p>
                  </div>
                </div>
              )}

              {/* Basic Meta Fields */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Judul / Topik Usulan Konten *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Diseminasi Inovasi Panen Bawang Merah TSS di Brebes..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Format Konten Utama *
                    </label>
                    <select
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value as ContentType)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none text-xs"
                    >
                      <option value="ARTICLE">Artikel Web / Siaran Tulisan</option>
                      <option value="INFOGRAPHIC">Infografis Visual</option>
                      <option value="SHORT_VIDEO">Video Pendek (Reels / TikTok / Shorts)</option>
                      <option value="PRESS_RELEASE">Siaran Pers Resmi</option>
                      <option value="SOCIAL_CAROUSEL">Carousel Media Sosial</option>
                      <option value="POLICY_BRIEF">Policy Brief / Kajian Teknis</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Unit Kerja Pengusul *
                    </label>
                    <select
                      value={unitId}
                      onChange={(e) => setUnitId(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none text-xs"
                    >
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tujuan Komunikasi Publik *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={communicationGoal}
                    onChange={(e) => setCommunicationGoal(e.target.value)}
                    placeholder="Jelaskan pesan kunci, urgensi fakta, dan perubahan perilaku/persepsi yang diharapkan dari audiens..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Audiens</label>
                    <input
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="Petani milenial, eksportir, penyuluh..."
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Kata Kunci / Tag (Koma dipisah)
                    </label>
                    <input
                      type="text"
                      value={topicsInput}
                      onChange={(e) => setTopicsInput(e.target.value)}
                      placeholder="Bawang Merah, Benih TSS, Efisiensi Biaya"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none text-xs"
                    />
                  </div>
                </div>

                {/* Priority Distribution Channels */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Kanal Diseminasi Prioritas
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_CHANNELS.map((ch) => {
                      const isSelected = selectedChannels.includes(ch.id);
                      return (
                        <button
                          type="button"
                          key={ch.id}
                          onClick={() => toggleChannel(ch.id)}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSelected ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          />
                          <span>{ch.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Resource Requirements Checklist */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Estimasi Kebutuhan Tim & Sumber Daya
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AVAILABLE_RESOURCES.map((resName) => {
                      const isChecked = selectedResources.includes(resName);
                      return (
                        <label
                          key={resName}
                          className={`p-2 rounded-lg border text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-semibold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleResource(resName)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="truncate">{resName}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Risk, Urgency, and Deadline */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tingkat Urgensi</label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as any)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none text-xs"
                    >
                      <option value="LOW">Rendah (Fleksibel)</option>
                      <option value="MEDIUM">Sedang (Standar)</option>
                      <option value="HIGH">Tinggi (Segera)</option>
                      <option value="URGENT">Mendesak (Prioritas 1x24 Jam)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tingkat Risiko</label>
                    <select
                      value={riskLevel}
                      onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none text-xs"
                    >
                      <option value="LOW">LOW (Edukasi Umum)</option>
                      <option value="MEDIUM">MEDIUM (Teknis Budidaya)</option>
                      <option value="HIGH">HIGH (Regulasi / Isu Sensitif)</option>
                      <option value="CRITICAL">CRITICAL (Krisis Komunikasi)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tenggat Diinginkan</label>
                    <input
                      type="datetime-local"
                      value={requestedDeadline}
                      onChange={(e) => setRequestedDeadline(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none text-xs"
                    />
                  </div>
                </div>

                {/* Sources */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Sumber Rujukan / Bahan Fakta Awal
                  </label>
                  <input
                    type="text"
                    value={initialSources}
                    onChange={(e) => setInitialSources(e.target.value)}
                    placeholder="Contoh: Laporan Neraca Pangan Kementan 2026, SK Dirjen No. 44/2026..."
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">
                  Diajukan oleh: <b>{currentUser.fullName}</b> ({currentUser.role})
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Usulan Konten</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};
