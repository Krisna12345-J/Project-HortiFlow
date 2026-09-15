import React, { useState } from 'react';
import {
  TrendingUp,
  Eye,
  Heart,
  Share2,
  MousePointer,
  Clock,
  Plus,
  BarChart3,
  CheckCircle,
} from 'lucide-react';
import { ContentPackage, ContentMetric } from '../../../types';
import { useHortiFlow } from '../../../context/HortiFlowContext';

interface MetricsTabProps {
  pkg: ContentPackage;
}

export const MetricsTab: React.FC<MetricsTabProps> = ({ pkg }) => {
  const { getMetricsForPackage, addMetricSnapshot } = useHortiFlow();
  const metrics = getMetricsForPackage(pkg.id);

  const [showAddModal, setShowAddModal] = useState(false);
  const [channel, setChannel] = useState(pkg?.targetChannels?.[0] || 'WEBSITE');
  const [reach, setReach] = useState(12000);
  const [impressions, setImpressions] = useState(18500);
  const [engagements, setEngagements] = useState(1450);
  const [clicks, setClicks] = useState(620);
  const [shares, setShares] = useState(180);
  const [lessonsLearned, setLessonsLearned] = useState('');

  const handleSaveMetric = (e: React.FormEvent) => {
    e.preventDefault();
    addMetricSnapshot(pkg.id, {
      channel,
      reach: Number(reach),
      impressions: Number(impressions),
      engagements: Number(engagements),
      clicks: Number(clicks),
      shares: Number(shares),
      lessonsLearned,
    });
    setShowAddModal(false);
    setLessonsLearned('');
  };

  const totalReach = metrics.reduce((acc, m) => acc + m.reach, 0);
  const totalImpressions = metrics.reduce((acc, m) => acc + m.impressions, 0);
  const totalEngagements = metrics.reduce((acc, m) => acc + m.engagements, 0);
  const totalClicks = metrics.reduce((acc, m) => acc + m.clicks, 0);
  const totalShares = metrics.reduce((acc, m) => acc + m.shares, 0);

  const avgEngagementRate =
    totalImpressions > 0 ? ((totalEngagements / totalImpressions) * 100).toFixed(2) : '0.00';

  return (
    <div className="space-y-6 text-xs" id="workspace-tab-metrics">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Evaluasi Kinerja & Dampak Komunikasi
            </h3>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Pengukuran jangkauan, interaksi publik, waktu siklus produksi (cycle time), dan catatan pembelajaran strategis.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Catat Metrik Baru</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-medium text-[11px]">Total Jangkauan (Reach)</span>
            <Eye className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {totalReach.toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">Akun unik</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-medium text-[11px]">Impresi Tayang</span>
            <BarChart3 className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {totalImpressions.toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">Frekuensi siar</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-medium text-[11px]">Interaksi (Engagements)</span>
            <Heart className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {totalEngagements.toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-rose-700 font-semibold mt-0.5 block">Rate: {avgEngagementRate}%</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-medium text-[11px]">Klik Tautan (Clicks)</span>
            <MousePointer className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {totalClicks.toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-indigo-700 font-semibold mt-0.5 block">CTR konversi</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-medium text-[11px]">Waktu Siklus (Cycle Time)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">48 Jam</div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">Sesuai SLA</span>
        </div>
      </div>

      {/* Add Metric Snapshot Modal */}
      {showAddModal && (
        <form onSubmit={handleSaveMetric} className="bg-white rounded-xl border border-emerald-300 p-6 space-y-4 shadow-md animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-sm text-slate-900">Catat Snapshot Data Kinerja</span>
            <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
              Tutup
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Kanal</label>
              <input
                type="text"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Reach</label>
              <input
                type="number"
                value={reach}
                onChange={(e) => setReach(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Impressions</label>
              <input
                type="number"
                value={impressions}
                onChange={(e) => setImpressions(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Engagements</label>
              <input
                type="number"
                value={engagements}
                onChange={(e) => setEngagements(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Clicks</label>
              <input
                type="number"
                value={clicks}
                onChange={(e) => setClicks(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Catatan Pembelajaran & Evaluasi (Lessons Learned)</label>
            <textarea
              rows={2}
              value={lessonsLearned}
              onChange={(e) => setLessonsLearned(e.target.value)}
              placeholder="Contoh: Format visual infografis 1:1 menghasilkan interaksi 40% lebih tinggi dibanding format artikel standar..."
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-3 py-1.5 border border-slate-200 rounded text-slate-600"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded shadow-xs"
            >
              Simpan Metrik
            </button>
          </div>
        </form>
      )}

      {/* Metric Snapshots Log */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <h4 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
          Catatan Pembelajaran & Rekaman Snapshot ({metrics.length})
        </h4>

        <div className="space-y-3">
          {metrics.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              Belum ada data evaluasi. Klik "Catat Metrik Baru" untuk mengukur performa tayang.
            </div>
          ) : (
            metrics.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{m.channel}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(m.recordedAt).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-[11px] bg-white p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Reach</span>
                    <span className="font-bold text-slate-800">{m.reach.toLocaleString('id-ID')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Impresi</span>
                    <span className="font-bold text-slate-800">{m.impressions.toLocaleString('id-ID')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Interaksi</span>
                    <span className="font-bold text-slate-800">{m.engagements.toLocaleString('id-ID')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Clicks</span>
                    <span className="font-bold text-slate-800">{m.clicks.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {m.lessonsLearned && (
                  <p className="text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100">
                    <b>Lessons Learned:</b> {m.lessonsLearned}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
