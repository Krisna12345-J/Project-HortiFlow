import React, { useState } from 'react';
import {
  GitFork,
  Settings2,
  Tag,
  ShieldCheck,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Sliders,
  Plus,
} from 'lucide-react';
import { useHortiFlow } from '../../context/HortiFlowContext';
import { ActiveView } from '../layout/Sidebar';

interface WorkflowConfigProps {
  setActiveView: (view: ActiveView) => void;
}

export const WorkflowConfig: React.FC<WorkflowConfigProps> = ({ setActiveView }) => {
  const { packages, exportDataSnapshot, restoreDataSnapshot } = useHortiFlow();

  const [activeTab, setActiveTab] = useState<'lifecycle' | 'gates' | 'taxonomies' | 'backup'>('lifecycle');

  // State Machine definitions from Section 27
  const lifecycleStates = [
    { state: 'IDEA', desc: 'Ide awal usulan konten diajukan melalui modul Intake', gate: 'Proposal diajukan' },
    { state: 'TRIAGED', desc: 'Kelayakan diverifikasi & diperiksa redundansi duplikasi', gate: 'Triage disetujui Planner' },
    { state: 'BRIEF_READY', desc: 'Brief target komunikasi & pesan kunci terkunci', gate: 'Brief diverifikasi' },
    { state: 'ASSIGNED', desc: 'Penugasan PIC naskah, desain grafis & multimedia', gate: 'PIC & tenggat ditetapkan' },
    { state: 'IN_PRODUCTION', desc: 'Penyusunan narasi, penautan klaim data BPS & aset grafis', gate: 'Naskah v1 diunggah' },
    { state: 'IN_REVIEW', desc: 'Pemeriksaan fakta, substansi hortikultura & hak cipta', gate: 'Klaim terverifikasi' },
    { state: 'CHANGES_REQUESTED', desc: 'Revisi perbaikan oleh author atas temuan reviewer', gate: 'Author menyelesaikan revisi' },
    { state: 'APPROVAL_PENDING', desc: 'Manifest persetujuan dikunci, menunggu tanda tangan pejabat', gate: 'Nol temuan BLOCKING' },
    { state: 'APPROVED', desc: 'Paket disahkan resmi dengan tanda tangan digital bersegil', gate: 'Tanda tangan dibubuhkan' },
    { state: 'SCHEDULED', desc: 'Rencana siar terdaftar di kalender editorial resmi', gate: 'Jadwal terkunci' },
    { state: 'PUBLISHING', desc: 'Proses penayangan otomatis atau manual ke saluran target', gate: 'Trigger penayangan' },
    { state: 'PUBLISHED', desc: 'Konten live di kanal publik & bukti siar (proof) tersimpan', gate: 'URL & screenshot diverifikasi' },
    { state: 'ARCHIVED', desc: 'Paket dikunci permanen dengan hash integritas ke repositori', gate: 'Retensi 5 tahun aktif' },
  ];

  // Invalidation & Gate Rules from Section 28
  const gateRules = [
    {
      title: 'Aturan Invalidation Material Change',
      rule: 'Jika narasi naskah atau aset visual diubah secara material setelah status APPROVED, maka approval manifest OTOMATIS BATAL (REVOKED_BY_MUTATION) dan paket turun kembali ke IN_REVIEW.',
      status: 'Enforced',
    },
    {
      title: 'Prasyarat Menuju APPROVAL_PENDING',
      rule: 'Paket tidak dapat diajukan ke Meja Persetujuan jika masih memiliki temuan review berderajat BLOCKING yang belum diverifikasi tutup oleh reviewer berwenang.',
      status: 'Enforced',
    },
    {
      title: 'Integritas Penjadwalan Siar',
      rule: 'Rencana publikasi tidak dapat dijadwalkan ke saluran resmi tanpa approval manifest bertanda tangan digital yang sah.',
      status: 'Enforced',
    },
    {
      title: 'Pemisahan Wewenang Approval (SoD)',
      rule: 'Author / Creator pembuat paket konten dilarang secara otomatis menjadi pejabat yang menyetujui paket buatannya sendiri.',
      status: 'Enforced',
    },
  ];

  // Taxonomies
  const commodities = ['Cabai Rawit', 'Cabai Merah Besar', 'Bawang Merah', 'Bawang Putih', 'Kentang', 'Jeruk', 'Mangga', 'Pisang'];
  const varieties = ['Trisula', 'Bima Brebes', 'Tajuk', 'Kencana', 'Gayo 1', 'Arumanis 143'];
  const topics = ['Pengendalian HPT', 'Pascapanen & Pengolahan', 'Pola Tanam Presisi', 'Benih Unggul Bersertifikat', 'Harga & Pasokan Pasar'];

  const handleExportBackup = () => {
    const jsonStr = exportDataSnapshot();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hortiflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 lg:space-y-8 pb-12" id="workflow-config-view">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
            <Settings2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Konfigurasi Alur Kerja & Mesin State Lifecycle</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
            Workflow & Konfigurasi
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Konfigurasi 16-tahap siklus hidup konten, gerbang verifikasi (transition gates), taksonomi komoditas, dan cadangan sistem.
          </p>
        </div>

        <button
          onClick={handleExportBackup}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Cadangkan Data (Backup JSON)</span>
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Siklus Hidup (States)</span>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">16</div>
          <span className="text-[10px] text-emerald-700 font-semibold block">State machine aktif</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Gerbang Transisi</span>
          <div className="text-2xl font-black text-emerald-700 font-mono tabular-nums">4 Gerbang</div>
          <span className="text-[10px] text-emerald-700 font-semibold block">Ketat otomatis</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Taksonomi Komoditas</span>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">19 Entitas</div>
          <span className="text-[10px] text-slate-500 font-semibold block">Standar Ditjen Horti</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Status Backup</span>
          <div className="text-2xl font-black text-emerald-700 font-mono tabular-nums">Siap</div>
          <span className="text-[10px] text-emerald-700 font-semibold block">Integritas 100%</span>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold overflow-x-auto">
          {[
            { id: 'lifecycle', label: '16-State Lifecycle Machine' },
            { id: 'gates', label: 'Aturan Gerbang & Invalidation' },
            { id: 'taxonomies', label: 'Taksonomi Hortikultura' },
            { id: 'backup', label: 'Cadangan & Pemulihan' },
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
      </div>

      {/* 4. Tab 1: State Machine */}
      {activeTab === 'lifecycle' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Mesin Alur Siklus Hidup Konten (Content Lifecycle State Machine)
              </h3>
              <p className="text-xs text-slate-500">
                Setiap perubahan status dikawal validasi otomatis untuk menjamin integritas data publik.
              </p>
            </div>
          </div>

          <div className="relative border-l-2 border-emerald-500 ml-4 pl-6 space-y-6 pt-2">
            {lifecycleStates.map((st, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-4 border-emerald-600 shadow-xs" />
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-extrabold text-slate-900 text-xs">{st.state}</span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Gerbang: {st.gate}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Tab 2: Transition Gates */}
      {activeTab === 'gates' && (
        <div className="space-y-4">
          {gateRules.map((gate, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-sm text-slate-900">{gate.title}</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {gate.status}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {gate.rule}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 6. Tab 3: Taxonomies */}
      {activeTab === 'taxonomies' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-slate-900">Komoditas Hortikultura</h4>
            <div className="flex flex-wrap gap-1.5">
              {commodities.map((c) => (
                <span key={c} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-slate-900">Varietas Unggul</h4>
            <div className="flex flex-wrap gap-1.5">
              {varieties.map((v) => (
                <span key={v} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-medium border border-emerald-100">
                  {v}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-slate-900">Topik Komunikasi</h4>
            <div className="flex flex-wrap gap-1.5">
              {topics.map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. Tab 4: Backup & Restore */}
      {activeTab === 'backup' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
          <h4 className="font-bold text-sm text-slate-900">Cadangan & Pemulihan Data HORTIFLOW</h4>
          <p className="text-slate-600 leading-relaxed">
            Data operasional HORTIFLOW dapat diekspor secara instan sebagai berkas JSON lengkap mencakup paket konten, klaim fakta, riwayat review temuan, manifest segel persetujuan, dan catatan audit trail.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleExportBackup}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Snapshot JSON</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
