import React, { useState, useMemo } from 'react';
import {
  Inbox,
  PlusCircle,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  GitMerge,
  HelpCircle,
  ArrowRight,
  Send,
  Sparkles,
  ShieldCheck,
  Search,
  ExternalLink,
  MessageSquare,
  BarChart3,
  User,
} from 'lucide-react';
import { useHortiFlow } from '../../context/HortiFlowContext';
import { ContentType, RiskLevel, ChannelType } from '../../types';
import { ActiveView } from '../layout/Sidebar';
import { useIntakeForm } from '../../hooks/useIntakeForm';

interface IntakeModuleProps {
  setActiveView: (view: ActiveView) => void;
}

export const IntakeModule: React.FC<IntakeModuleProps> = ({ setActiveView }) => {
  const {
    requests,
    triageRequest,
    packages,
    setSelectedPackageId,
    currentUser,
    respondToClarification,
  } = useHortiFlow();

  const [activeMainTab, setActiveMainTab] = useState<'QUEUE' | 'MY_SUBMISSIONS' | 'METRICS'>('QUEUE');
  const [showForm, setShowForm] = useState(false);
  const [selectedReqId, setSelectedReqId] = useState<string | null>(requests[0]?.id || null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterUnit, setFilterUnit] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Triage modal / action states
  const [triageAction, setTriageAction] = useState<
    'ACCEPT' | 'REQUEST_INFO' | 'MERGE' | 'HOLD' | 'REJECT' | null
  >(null);
  const [triageNotes, setTriageNotes] = useState('');
  const [mergeTargetPackageId, setMergeTargetPackageId] = useState('');

  // Clarification response state
  const [clarificationInput, setClarificationInput] = useState('');
  const [showClarificationInput, setShowClarificationInput] = useState(false);

  // Hook for intake form state, validation, duplication detection, and index quality calculation
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
    campaignId,
    setCampaignId,
    selectedChannels,
    selectedResources,
    detectedDuplicates,
    readinessIndex,
    toggleChannel,
    toggleResource,
    handleApplyPreset,
    handleResetForm,
    handleSubmit,
    presets: INTAKE_PRESETS,
    availableChannels: AVAILABLE_CHANNELS,
    availableResources: AVAILABLE_RESOURCES,
    campaigns,
  } = useIntakeForm({
    onSuccess: ({ request, duplicates }) => {
      setShowForm(false);
      setSelectedReqId(request.id);
      handleResetForm();

      if (duplicates && duplicates.length > 0 && duplicates[0]?.package) {
        alert(
          `Permintaan berhasil diajukan dengan tiket ${request.ticketNumber}. Ditemukan potensi kemiripan dengan ${duplicates[0].package.packageNumber} (${duplicates[0].score}% similar).`
        );
      } else {
        alert(`Permintaan berhasil diajukan dengan nomor tiket ${request.ticketNumber}.`);
      }
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !communicationGoal.trim()) {
      alert('Judul dan tujuan komunikasi wajib diisi.');
      return;
    }
    handleSubmit(e);
  };

  const handleExecuteTriage = () => {
    if (!selectedReqId || !triageAction) return;

    const res = triageRequest(selectedReqId, triageAction, {
      notes: triageNotes,
      targetPackageId: mergeTargetPackageId,
    });

    if (res.success) {
      setTriageAction(null);
      setTriageNotes('');
      if (res.createdPackage) {
        if (
          window.confirm(
            `Paket Konten ${res.createdPackage.packageNumber} berhasil dibuat! Buka Workspace sekarang?`
          )
        ) {
          setSelectedPackageId(res.createdPackage.id);
          setActiveView('workspace');
        }
      } else {
        alert('Tindakan triase berhasil dieksekusi.');
      }
    } else {
      alert(res.error || 'Gagal mengeksekusi triase');
    }
  };

  const handleSendClarification = (requestId: string) => {
    if (!clarificationInput.trim()) return;
    const res = respondToClarification(requestId, clarificationInput.trim());
    if (res.success) {
      setClarificationInput('');
      setShowClarificationInput(false);
      alert('Tanggapan klarifikasi Anda berhasil dikirimkan ke Planner.');
    } else {
      alert(res.error || 'Gagal mengirim klarifikasi.');
    }
  };

  const selectedRequest = requests.find((r) => r.id === selectedReqId);

  // Filter requests according to view tab and filters
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (activeMainTab === 'MY_SUBMISSIONS' && r.requesterId !== currentUser.id) {
        return false;
      }
      if (filterStatus !== 'ALL' && r.status !== filterStatus) {
        return false;
      }
      if (filterUnit !== 'ALL' && r.unitId !== filterUnit) {
        return false;
      }
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matchTitle = r.title.toLowerCase().includes(q);
        const matchTicket = r.ticketNumber.toLowerCase().includes(q);
        const matchRequester = r.requesterName.toLowerCase().includes(q);
        if (!matchTitle && !matchTicket && !matchRequester) return false;
      }
      return true;
    });
  }, [requests, activeMainTab, filterStatus, filterUnit, searchFilter, currentUser.id]);

  // Statistics calculation for METRICS tab
  const metrics = useMemo(() => {
    const total = requests.length;
    const accepted = requests.filter((r) => r.status === 'ACCEPTED').length;
    const inTriage = requests.filter((r) => r.status === 'IN_TRIAGE' || r.status === 'SUBMITTED').length;
    const onHold = requests.filter((r) => r.status === 'ON_HOLD').length;
    const rejected = requests.filter((r) => r.status === 'REJECTED').length;
    const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

    // Unit breakdown
    const unitCounts: Record<string, number> = {};
    requests.forEach((r) => {
      unitCounts[r.unitName] = (unitCounts[r.unitName] || 0) + 1;
    });

    return { total, accepted, inTriage, onHold, rejected, acceptanceRate, unitCounts };
  }, [requests]);

  return (
    <div className="space-y-6" id="intake-module">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Inbox className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans'] tracking-tight">
              Intake & Triase Usulan Konten
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pintu masuk permintaan konten resmi Ditjen Hortikultura, deteksi duplikasi cerdas, dan meja triase perencanaan.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{showForm ? 'Tutup Form Usulan' : 'Ajukan Konten Baru'}</span>
        </button>
      </div>

      {/* Main Mode Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2 rounded-xl shadow-2xs">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveMainTab('QUEUE')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
              activeMainTab === 'QUEUE'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Antrean Usulan Masuk</span>
            <span className="text-[10px] opacity-75">({requests.length})</span>
          </button>

          <button
            onClick={() => setActiveMainTab('MY_SUBMISSIONS')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
              activeMainTab === 'MY_SUBMISSIONS'
                ? 'bg-emerald-700 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Usulan Saya</span>
            <span className="text-[10px] opacity-75">
              ({requests.filter((r) => r.requesterId === currentUser.id).length})
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab('METRICS')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
              activeMainTab === 'METRICS'
                ? 'bg-blue-700 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Statistik & SLA Triase</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Pengguna Aktif: <b>{currentUser.fullName}</b> ({currentUser.role})
        </span>
      </div>

      {/* Inline Quick Intake Form */}
      {showForm && (
        <form
          onSubmit={handleCreateSubmit}
          className="bg-white rounded-2xl border border-emerald-300 p-6 shadow-md space-y-4 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                Formulir Pengajuan Usulan Konten Baru
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Pengusul: <b>{currentUser.fullName}</b> ({currentUser.role})
            </span>
          </div>

          {/* Quick Presets Bar */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Template Usulan Cepat (Autofill Instan):
              </span>
              <span className="text-[10px] text-emerald-700">Klik untuk isi otomatis formulir</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {INTAKE_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="p-2 text-left bg-white hover:bg-emerald-100/50 border border-emerald-200 hover:border-emerald-300 rounded-lg text-xs transition-colors group shadow-2xs"
                >
                  <p className="font-bold text-slate-800 group-hover:text-emerald-800 text-[11px] truncate">
                    {preset.name}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{preset.contentType}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Readiness Index */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800">
                  Indeks Kelayakan Usulan (Intake Quality Index):
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
                  ? 'Usulan telah siap untuk ditriase langsung menjadi paket produksi.'
                  : 'Sertakan rujukan regulasi/data, kanal prioritas, dan tujuan komunikasi.'}
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

          {/* Real-time duplication alert */}
          {detectedDuplicates.length > 0 && detectedDuplicates[0]?.package && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">
                    Peringatan Deteksi Duplikasi ({detectedDuplicates[0]?.score || 0}% Serupa)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (detectedDuplicates[0]?.package?.id) {
                        setSelectedPackageId(detectedDuplicates[0].package.id);
                        setActiveView('workspace');
                      }
                    }}
                    className="text-[11px] text-amber-800 underline font-semibold flex items-center gap-0.5"
                  >
                    <span>Buka Paket Terkait</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  Topik ini mirip dengan paket yang sedang aktif: <b>{detectedDuplicates[0]?.package?.packageNumber}</b> - "
                  {detectedDuplicates[0]?.package?.title}" (Status: {detectedDuplicates[0]?.package?.lifecycleStatus}).
                  Planner dapat mempertimbangkan penggabungan materi saat triase.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Judul / Topik Usulan *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Liputan Inovasi Panen Bawang Merah TSS di Brebes..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Format Konten Utama *</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentType)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
              >
                <option value="ARTICLE">Artikel Web / Siaran Tulisan</option>
                <option value="INFOGRAPHIC">Infografis Visual</option>
                <option value="SHORT_VIDEO">Video Pendek (Reels / TikTok / Shorts)</option>
                <option value="PRESS_RELEASE">Siaran Pers Resmi</option>
                <option value="SOCIAL_CAROUSEL">Carousel Media Sosial</option>
                <option value="POLICY_BRIEF">Policy Brief / Kajian Teknis</option>
              </select>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-semibold text-slate-700">Tujuan Komunikasi *</label>
            <textarea
              required
              rows={2}
              value={communicationGoal}
              onChange={(e) => setCommunicationGoal(e.target.value)}
              placeholder="Jelaskan apa yang ingin dicapai, pesan kunci yang harus tersampaikan, dan dampak ke publik..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Target Audiens</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Petani milenial, eksportir, ibu rumah tangga..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Kata Kunci / Topik (Pisahkan koma)</label>
              <input
                type="text"
                value={topicsInput}
                onChange={(e) => setTopicsInput(e.target.value)}
                placeholder="Bawang Merah, Benih TSS, Efisiensi Biaya"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Kampanye Terkait (Opsional)</label>
              <select
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-900"
              >
                <option value="">-- Bukan Bagian Kampanye Khusus --</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Distribution Channels */}
          <div className="text-xs space-y-1.5">
            <label className="font-semibold text-slate-700">Kanal Diseminasi Prioritas</label>
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
          <div className="text-xs space-y-1.5">
            <label className="font-semibold text-slate-700">Estimasi Kebutuhan Tim & Sumber Daya</label>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Tingkat Urgensi</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-900"
              >
                <option value="LOW">Rendah (Fleksibel)</option>
                <option value="MEDIUM">Sedang (Standar)</option>
                <option value="HIGH">Tinggi (Segera)</option>
                <option value="URGENT">Mendesak (Prioritas 1x24 Jam)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Tingkat Risiko Konten</label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-900"
              >
                <option value="LOW">LOW (Informasi Edukasi Umum)</option>
                <option value="MEDIUM">MEDIUM (Rekomendasi Teknis Budidaya)</option>
                <option value="HIGH">HIGH (Kebijakan Regulasi / Ekspor / Isu Sensitif)</option>
                <option value="CRITICAL">CRITICAL (Krisis Komunikasi / Klarifikasi Darurat)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Tenggat Waktu Publikasi Diinginkan</label>
              <input
                type="datetime-local"
                value={requestedDeadline}
                onChange={(e) => setRequestedDeadline(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-900"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-semibold text-slate-700">Sumber Bukti Awal / Referensi Data</label>
            <input
              type="text"
              value={initialSources}
              onChange={(e) => setInitialSources(e.target.value)}
              placeholder="Contoh: Laporan BPSMB Grobogan 2026, Surat Edaran Dirjen No. 142..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Pengajuan Usulan</span>
            </button>
          </div>
        </form>
      )}

      {/* METRICS VIEW (If activeMainTab is METRICS) */}
      {activeMainTab === 'METRICS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500">Total Usulan Masuk</span>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{metrics.total}</p>
              <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
                Seluruh unit eselon
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500">Tingkat Penerimaan (Acceptance)</span>
              <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">
                {metrics.acceptanceRate}%
              </p>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                {metrics.accepted} usulan jadi paket
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500">Dalam Proses Triase</span>
              <p className="text-2xl font-bold font-mono text-amber-700 mt-1">{metrics.inTriage}</p>
              <span className="text-[11px] text-amber-700 font-semibold mt-0.5 block">
                Menunggu penelaahan
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500">Rata-rata SLA Triase</span>
              <p className="text-2xl font-bold font-mono text-blue-700 mt-1">4.2 Jam</p>
              <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
                Target: &lt; 24 Jam
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 font-['Plus_Jakarta_Sans']">
              Aktivitas Pengajuan Berdasarkan Unit Kerja
            </h3>
            <div className="space-y-3">
              {Object.entries(metrics.unitCounts).map(([uName, count]) => {
                const countNum = Number(count);
                const pct = metrics.total > 0 ? Math.round((countNum / metrics.total) * 100) : 0;
                return (
                  <div key={uName} className="text-xs">
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>{uName}</span>
                      <span className="font-mono">
                        {countNum} tiket ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* QUEUE & MY SUBMISSIONS VIEW */}
      {activeMainTab !== 'METRICS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Request List (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-sm text-slate-900 font-['Plus_Jakarta_Sans']">
                  {activeMainTab === 'MY_SUBMISSIONS' ? 'Daftar Usulan Saya' : 'Antrean Tiket Triase'}
                </span>
                <span className="text-xs font-mono font-semibold px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                  {filteredRequests.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 text-slate-700 focus:outline-none"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="SUBMITTED">Diajukan (Submitted)</option>
                  <option value="IN_TRIAGE">Dalam Triase</option>
                  <option value="ACCEPTED">Diterima (Accepted)</option>
                  <option value="ON_HOLD">Ditunda (On Hold)</option>
                  <option value="REJECTED">Ditolak (Rejected)</option>
                </select>
              </div>
            </div>

            {/* Search filter within list */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Cari tiket, judul, atau nama pengusul..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="divide-y divide-slate-100 max-h-[620px] overflow-y-auto pr-1">
              {filteredRequests.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <Inbox className="w-7 h-7 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-slate-600">Tidak ada usulan ditemukan.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Gunakan tombol "Ajukan Konten Baru" untuk membuat usulan pertama.
                  </p>
                </div>
              ) : (
                filteredRequests.map((req) => {
                  const isSelected = req.id === selectedReqId;
                  return (
                    <div
                      key={req.id}
                      onClick={() => setSelectedReqId(req.id)}
                      className={`p-3 rounded-xl transition-all cursor-pointer my-1 ${
                        isSelected
                          ? 'bg-emerald-50/80 border border-emerald-200 shadow-2xs'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-slate-700">{req.ticketNumber}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            req.status === 'ACCEPTED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'SUBMITTED'
                              ? 'bg-blue-100 text-blue-800'
                              : req.status === 'IN_TRIAGE'
                              ? 'bg-amber-100 text-amber-800'
                              : req.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 mt-1.5 line-clamp-2 leading-snug">
                        {req.title}
                      </h4>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                        <span className="truncate max-w-[140px]">{req.unitName ? req.unitName.split(' ')[0] : 'Unit'}</span>
                        <span
                          className={`font-semibold ${
                            req.urgency === 'URGENT'
                              ? 'text-rose-600 font-bold'
                              : req.urgency === 'HIGH'
                              ? 'text-amber-600 font-semibold'
                              : 'text-slate-500'
                          }`}
                        >
                          {req.urgency}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Triage Details & Decision Desk (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
            {selectedRequest ? (
              <div className="space-y-5">
                {/* Top Info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        {selectedRequest.ticketNumber}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        Diajukan oleh {selectedRequest.requesterName}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900 mt-1.5 leading-snug font-['Plus_Jakarta_Sans']">
                      {selectedRequest.title}
                    </h2>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-400 block">Tenggat Diinginkan</span>
                    <span className="text-xs font-bold font-mono text-slate-800">
                      {new Date(selectedRequest.requestedDeadline).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Detail Fields */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Unit Pengusul</span>
                    <span className="font-semibold text-slate-800">{selectedRequest.unitName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Format & Risiko</span>
                    <span className="font-semibold text-slate-800">
                      {selectedRequest.contentType} • Risiko {selectedRequest.riskLevel}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block">Tujuan Komunikasi Publik</span>
                    <p className="text-slate-800 mt-0.5 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {selectedRequest.communicationGoal}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block">Sumber Bukti & Rujukan Awal</span>
                    <p className="text-slate-700 mt-0.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {selectedRequest.initialSources || 'Tidak dilampirkan secara eksplisit.'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Target Audiens</span>
                    <span className="text-slate-800 font-medium">
                      {selectedRequest.targetAudience || 'Masyarakat luas'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Topik / Tag</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedRequest.topics.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Target Channels & Resources */}
                {(selectedRequest.targetChannels || selectedRequest.resourceNeeds) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedRequest.targetChannels && selectedRequest.targetChannels.length > 0 && (
                      <div>
                        <span className="text-slate-400 block text-[11px]">Kanal Diseminasi</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedRequest.targetChannels.map((c) => (
                            <span
                              key={c}
                              className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-medium"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedRequest.resourceNeeds && selectedRequest.resourceNeeds.length > 0 && (
                      <div>
                        <span className="text-slate-400 block text-[11px]">Kebutuhan Sumber Daya</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedRequest.resourceNeeds.map((r) => (
                            <span
                              key={r}
                              className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded font-medium"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Clarification Notes / Conversation from Planner */}
                {selectedRequest.triageNotes && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      <span>Catatan / Permintaan Informasi dari Tim Triase:</span>
                    </div>
                    <p className="text-amber-900 bg-white/70 p-2.5 rounded-lg border border-amber-200/60 leading-relaxed">
                      {selectedRequest.triageNotes}
                    </p>

                    {/* Requester Clarification Response Form */}
                    {selectedRequest.status === 'IN_TRIAGE' && (
                      <div className="pt-2">
                        {!showClarificationInput ? (
                          <button
                            onClick={() => setShowClarificationInput(true)}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Balas / Kirimkan Penjelasan Tambahan</span>
                          </button>
                        ) : (
                          <div className="space-y-2 pt-1">
                            <textarea
                              rows={2}
                              value={clarificationInput}
                              onChange={(e) => setClarificationInput(e.target.value)}
                              placeholder="Tuliskan jawaban klarifikasi, rujukan data pelengkap, atau penjelasan untuk tim planner..."
                              className="w-full p-2.5 bg-white border border-amber-300 rounded-lg text-xs text-slate-900 focus:outline-none"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setShowClarificationInput(false)}
                                className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium"
                              >
                                Batal
                              </button>
                              <button
                                onClick={() => handleSendClarification(selectedRequest.id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                              >
                                Kirim Tanggapan
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* If already accepted and created a package */}
                {selectedRequest.createdPackageId && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-emerald-900 block font-['Plus_Jakarta_Sans']">
                        Paket Konten Berhasil Diterbitkan
                      </span>
                      <span className="text-emerald-700 text-[11px]">
                        Permintaan ini telah ditriase menjadi paket aktif di sistem.
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPackageId(selectedRequest.createdPackageId!);
                        setActiveView('workspace');
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs"
                    >
                      <span>Buka Workspace Paket</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Triage Decision Desk (for Planners) */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-['Plus_Jakarta_Sans']">
                      Meja Keputusan Triase Editorial
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Wewenang: Content Planner ({currentUser.role})
                    </span>
                  </div>

                  {triageAction ? (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">
                          Konfirmasi Tindakan: {triageAction}
                        </span>
                        <button
                          onClick={() => setTriageAction(null)}
                          className="text-slate-400 hover:text-slate-600 text-[11px]"
                        >
                          Batal
                        </button>
                      </div>

                      {triageAction === 'MERGE' && (
                        <div className="text-xs space-y-1">
                          <label className="font-semibold text-slate-700">
                            Pilih Paket Sasaran Gabungan
                          </label>
                          <select
                            value={mergeTargetPackageId}
                            onChange={(e) => setMergeTargetPackageId(e.target.value)}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                          >
                            <option value="">-- Pilih Paket Konten --</option>
                            {packages.map((pkg) => (
                              <option key={pkg.id} value={pkg.id}>
                                {pkg.packageNumber} - {pkg.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="text-xs space-y-1">
                        <label className="font-semibold text-slate-700">
                          Catatan / Instruksi Triase
                        </label>
                        <textarea
                          rows={2}
                          value={triageNotes}
                          onChange={(e) => setTriageNotes(e.target.value)}
                          placeholder="Berikan alasan atau instruksi awal bagi tim produksi..."
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setTriageAction(null)}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-medium rounded-lg"
                        >
                          Batal
                        </button>
                        <button
                          onClick={handleExecuteTriage}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg"
                        >
                          Eksekusi Triase
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setTriageAction('ACCEPT')}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Terima & Buat Paket</span>
                      </button>

                      <button
                        onClick={() => setTriageAction('REQUEST_INFO')}
                        className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Minta Info Tambahan</span>
                      </button>

                      <button
                        onClick={() => setTriageAction('MERGE')}
                        className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                      >
                        <GitMerge className="w-3.5 h-3.5" />
                        <span>Gabungkan (Merge)</span>
                      </button>

                      <button
                        onClick={() => setTriageAction('HOLD')}
                        className="px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Tunda (Hold)</span>
                      </button>

                      <button
                        onClick={() => setTriageAction('REJECT')}
                        className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Tolak Usulan</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                Pilih salah satu usulan di sebelah kiri untuk melihat rincian dan melakukan triase.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
