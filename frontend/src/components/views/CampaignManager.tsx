import React, { useState } from 'react';
import {
  Target,
  Plus,
  Calendar,
  User,
  Layers,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Search,
  ChevronRight,
  BarChart3,
  FileText,
  Send,
  X,
} from 'lucide-react';
import { useHortiFlow } from '../../context/HortiFlowContext';
import { ActiveView } from '../layout/Sidebar';
import { Campaign } from '../../types';

interface CampaignManagerProps {
  setActiveView: (view: ActiveView) => void;
}

export const CampaignManager: React.FC<CampaignManagerProps> = ({ setActiveView }) => {
  const { campaigns, packages, users, setSelectedPackageId } = useHortiFlow();

  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<
    'ringkasan' | 'target' | 'paket' | 'kalender' | 'kpi' | 'evaluasi' | 'riwayat'
  >('ringkasan');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New campaign form state
  const [newCode, setNewCode] = useState('CMP-2026-');
  const [newName, setNewName] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [newTheme, setNewTheme] = useState('');
  const [newAudience, setNewAudience] = useState('');
  const [newStartDate, setNewStartDate] = useState('2026-09-15');
  const [newEndDate, setNewEndDate] = useState('2026-11-30');
  const [targetPackagesCount, setTargetPackagesCount] = useState(10);
  const [targetReachCount, setTargetReachCount] = useState(500000);

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((c) => {
    if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.theme.toLowerCase().includes(q) ||
        c.ownerName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];
  const campaignPackages = selectedCampaign
    ? packages.filter((p) => p.campaignId === selectedCampaign.id)
    : [];

  // Summary counts
  const totalCampaigns = campaigns.length;
  const activeCount = campaigns.filter((c) => c.status === 'ACTIVE').length;
  const onTargetCount = campaigns.filter((c) => c.status === 'ACTIVE').length;
  const nearDeadlineCount = 1;
  const atRiskCount = 1;
  const totalAssociatedPackages = packages.filter((p) => p.campaignId).length;
  const avgProgress = 76;

  return (
    <div className="space-y-6 lg:space-y-8 pb-12" id="campaign-manager-view">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
            <Target className="w-3.5 h-3.5 text-emerald-600" />
            <span>Perencanaan Strategis Komunikasi Publik</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
            Kampanye & Target
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Pantau orkestrasi kampanye prioritas nasional, capaian kuota paket konten, dan realisasi target dampak.
          </p>
        </div>

        <button
          id="btn-create-campaign"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Kampanye Baru</span>
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Kampanye Aktif</span>
          <div className="text-2xl font-black text-emerald-700 font-mono tabular-nums">{activeCount}</div>
          <span className="text-[10px] text-emerald-700 font-semibold block">Berjalan lancar</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Sesuai Target</span>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">{onTargetCount}</div>
          <span className="text-[10px] text-slate-500 font-semibold block">KPI terpenuhi</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Mendekati Deadline</span>
          <div className="text-2xl font-black text-amber-600 font-mono tabular-nums">{nearDeadlineCount}</div>
          <span className="text-[10px] text-amber-700 font-semibold block">Kurang 30 hari</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Berisiko</span>
          <div className="text-2xl font-black text-rose-600 font-mono tabular-nums">{atRiskCount}</div>
          <span className="text-[10px] text-rose-700 font-semibold block">Perlu perhatian</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Total Paket Konten</span>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">{totalAssociatedPackages}</div>
          <span className="text-[10px] text-slate-500 font-semibold block">Terhubung kampanye</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Rata-rata Progress</span>
          <div className="text-2xl font-black text-emerald-600 font-mono tabular-nums">{avgProgress}%</div>
          <span className="text-[10px] text-emerald-700 font-semibold block">Siklus produksi</span>
        </div>
      </div>

      {/* 3. Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kampanye, kode, tema, owner..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {['ALL', 'ACTIVE', 'PLANNING', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  filterStatus === st
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'Semua' : st === 'ACTIVE' ? 'Aktif' : st === 'PLANNING' ? 'Rencana' : 'Selesai'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Campaign Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {filteredCampaigns.map((camp) => {
          const campPkgs = packages.filter((p) => p.campaignId === camp.id);
          const publishedPkgs = campPkgs.filter((p) => p.lifecycleStatus === 'PUBLISHED').length;
          const targetPkg = camp.kpiSummary.targetPackages || 12;
          const progressPercent = Math.min(100, Math.round((publishedPkgs / targetPkg) * 100)) || 65;

          return (
            <div
              key={camp.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-emerald-300 transition-all space-y-4 relative"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-500">{camp.code}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-100 text-emerald-800">
                      {camp.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{camp.name}</h3>
                </div>
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
                  <Target className="w-5 h-5" />
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {camp.objective}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Periode Kampanye</span>
                  <span className="font-semibold text-slate-700 font-mono text-[11px]">
                    {camp.startDate} s/d {camp.endDate}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Penanggung Jawab (Owner)</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    {camp.ownerName}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Target Audiens</span>
                  <span className="font-semibold text-slate-800">{camp.targetAudience}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Paket Konten</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    {campPkgs.length} paket ({publishedPkgs} terbit)
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">Realisasi Publikasi</span>
                  <span className="font-bold text-slate-900 font-mono">{progressPercent}% dari target</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedCampaignId(camp.id)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <span>Kelola Target & KPI</span>
                </button>
                <button
                  onClick={() => setSelectedCampaignId(camp.id)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span>Lihat Kampanye</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Campaign Workspace Detail Modal / Expanded View */}
      {selectedCampaignId && selectedCampaign && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500">{selectedCampaign.code}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {selectedCampaign.status}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">{selectedCampaign.name}</h2>
                <p className="text-xs text-slate-600">{selectedCampaign.objective}</p>
              </div>
              <button
                onClick={() => setSelectedCampaignId(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="px-6 border-b border-slate-200 flex gap-4 overflow-x-auto bg-white text-xs font-semibold">
              {[
                { id: 'ringkasan', label: 'Ringkasan' },
                { id: 'target', label: 'Target' },
                { id: 'paket', label: `Paket Konten (${campaignPackages.length})` },
                { id: 'kalender', label: 'Kalender' },
                { id: 'kpi', label: 'KPI' },
                { id: 'evaluasi', label: 'Evaluasi' },
                { id: 'riwayat', label: 'Riwayat' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDetailTab(tab.id as any)}
                  className={`py-3 border-b-2 whitespace-nowrap transition-colors ${
                    activeDetailTab === tab.id
                      ? 'border-emerald-600 text-emerald-700 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {activeDetailTab === 'ringkasan' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Detail Informasi
                      </span>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-200/50">
                          <span className="text-slate-500">Tema Komunikasi:</span>
                          <span className="font-semibold text-slate-800">{selectedCampaign.theme}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200/50">
                          <span className="text-slate-500">Target Audiens:</span>
                          <span className="font-semibold text-slate-800">{selectedCampaign.targetAudience}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200/50">
                          <span className="text-slate-500">Pemilik Kampanye:</span>
                          <span className="font-semibold text-slate-800">{selectedCampaign.ownerName}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Periode:</span>
                          <span className="font-semibold text-slate-800 font-mono">
                            {selectedCampaign.startDate} s/d {selectedCampaign.endDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/70 space-y-2">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                        Rangkuman Target & Capaian
                      </span>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between py-1 border-b border-emerald-200/40">
                          <span className="text-slate-600">Target Paket Konten:</span>
                          <span className="font-bold text-slate-900 font-mono">
                            {selectedCampaign.kpiSummary.targetPackages || 12} Paket
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-emerald-200/40">
                          <span className="text-slate-600">Realisasi Produksi:</span>
                          <span className="font-bold text-emerald-700 font-mono">{campaignPackages.length} Paket</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-emerald-200/40">
                          <span className="text-slate-600">Target Jangkauan Publik:</span>
                          <span className="font-bold text-slate-900 font-mono">
                            {(selectedCampaign.kpiSummary.targetReach || 500000).toLocaleString('id-ID')} Akun
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-600">Target Keterlibatan:</span>
                          <span className="font-bold text-slate-900 font-mono">
                            {(selectedCampaign.kpiSummary.targetEngagements || 45000).toLocaleString('id-ID')} Aksi
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeDetailTab === 'target' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800">Daftar Parameter Target Kampanye</h4>
                    <span className="text-xs text-slate-500">Relasi: Campaign → Target → Paket Konten → Publication</span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                        <tr>
                          <th className="p-3">Indikator Kunci (KPI)</th>
                          <th className="p-3">Target Saluran</th>
                          <th className="p-3">Baseline</th>
                          <th className="p-3">Target Value</th>
                          <th className="p-3">Capaian Saat Ini</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-3 font-semibold text-slate-800">Volume Paket Publikasi</td>
                          <td className="p-3">Semua Kanal</td>
                          <td className="p-3 font-mono">0 Paket</td>
                          <td className="p-3 font-mono font-bold">12 Paket</td>
                          <td className="p-3 font-mono text-emerald-700 font-bold">{campaignPackages.length} Paket</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              On Track
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-800">Jangkauan Edukasi Petani</td>
                          <td className="p-3">Instagram & Web</td>
                          <td className="p-3 font-mono">150.000</td>
                          <td className="p-3 font-mono font-bold">500.000</td>
                          <td className="p-3 font-mono text-emerald-700 font-bold">410.000</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              82%
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-800">Download SOP & Panduan</td>
                          <td className="p-3">Website Portal</td>
                          <td className="p-3 font-mono">500 berkas</td>
                          <td className="p-3 font-mono font-bold">5.000 berkas</td>
                          <td className="p-3 font-mono text-amber-600 font-bold">3.240 berkas</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              Perlu Boost
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeDetailTab === 'paket' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Paket Konten Terdaftar ({campaignPackages.length})
                    </span>
                    <button
                      onClick={() => {
                        setSelectedCampaignId(null);
                        setActiveView('intake');
                      }}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajukan Paket untuk Kampanye Ini</span>
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {campaignPackages.map((pkg) => (
                      <div key={pkg.id} className="p-3.5 hover:bg-slate-50 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-emerald-700">{pkg.packageNumber}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                              {pkg.contentType}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {pkg.lifecycleStatus}
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-900 text-xs">{pkg.title}</h5>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedPackageId(pkg.id);
                            setSelectedCampaignId(null);
                            setActiveView('workspace');
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <span>Buka Workspace</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeDetailTab === 'kalender' && (
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                  <Calendar className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-slate-800 text-sm">Jadwal Penayangan Kampanye</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Seluruh penayangan konten dalam kampanye ini tersinkronisasi otomatis dengan kalender editorial pusat.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCampaignId(null);
                      setActiveView('calendar');
                    }}
                    className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors"
                  >
                    Buka Kalender Editorial
                  </button>
                </div>
              )}

              {activeDetailTab === 'kpi' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-slate-500 block font-medium">Realisasi Engagement</span>
                      <div className="text-xl font-bold text-slate-900 font-mono">82%</div>
                      <span className="text-[10px] text-emerald-700 font-semibold">Tinggi di kanal Instagram</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-slate-500 block font-medium">SLA Ketepatan Waktu</span>
                      <div className="text-xl font-bold text-emerald-700 font-mono">94%</div>
                      <span className="text-[10px] text-emerald-700 font-semibold">Memenuhi target</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-slate-500 block font-medium">Tingkat Retensi</span>
                      <div className="text-xl font-bold text-slate-900 font-mono">4.2 Menit</div>
                      <span className="text-[10px] text-slate-500 font-semibold">Rata-rata baca artikel</span>
                    </div>
                  </div>
                </div>
              )}

              {activeDetailTab === 'evaluasi' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-800">Catatan Evaluasi Lapangan</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Kampanye Panen Raya 2026 menunjukkan penerimaan positif yang sangat kuat pada format infografis cabai dan video pendek Reels. Respons petani milenial menunjukkan peningkatan adopsi varietas bersertifikasi sebesar 18%. Rekomendasi putaran berikutnya adalah menambah konten infografis harga pasar harian.
                  </p>
                </div>
              )}

              {activeDetailTab === 'riwayat' && (
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">Kampanye Dibuat & Disetujui</span>
                      <span className="text-slate-500 block text-[11px]">Oleh Budi Sanjaya (Planner)</span>
                    </div>
                    <span className="font-mono text-slate-400 text-[11px]">{selectedCampaign.startDate}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert(`Kampanye ${newName} (${newCode}) berhasil didaftarkan ke sistem!`);
              setShowCreateModal(false);
            }}
            className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Buat Kampanye Prioritas Baru</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Kode Kampanye *</label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Kampanye *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: PANEN RAYA 2026"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tujuan Komunikasi *</label>
                <textarea
                  required
                  rows={2}
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder="Meningkatkan awareness produksi hortikultura nasional..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tema Komunikasi</label>
                  <input
                    type="text"
                    value={newTheme}
                    onChange={(e) => setNewTheme(e.target.value)}
                    placeholder="Ketahanan Pangan"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Audiens</label>
                  <input
                    type="text"
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value)}
                    placeholder="Petani dan masyarakat umum"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Berakhir</label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs"
              >
                Simpan & Aktifkan Kampanye
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
