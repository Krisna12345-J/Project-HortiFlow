import React, { useState } from 'react';
import {
  Send,
  ExternalLink,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Globe,
  Instagram,
  Facebook,
  Video,
  Twitter,
  Linkedin,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { useHortiFlow } from '../../context/HortiFlowContext';
import { ActiveView } from '../layout/Sidebar';
import { ChannelType } from '../../types';

interface PublicationHubProps {
  setActiveView: (view: ActiveView) => void;
}

export const PublicationHub: React.FC<PublicationHubProps> = ({ setActiveView }) => {
  const {
    publicationRecords,
    packages,
    retryPublication,
    setSelectedPackageId,
  } = useHortiFlow();

  const [filterChannel, setFilterChannel] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const failedRecords = publicationRecords.filter((p) => p.status === 'FAILED');
  const successRecords = publicationRecords.filter((p) => p.status === 'SUCCESS');
  const scheduledRecords = publicationRecords.filter((p) => p.status === 'SCHEDULED');
  const takedownRecords = publicationRecords.filter((p) => p.status === 'TAKEDOWN');

  const filteredRecords = publicationRecords.filter((r) => {
    if (filterChannel !== 'ALL' && r.channel !== filterChannel) return false;
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    return true;
  });

  const handleOpenPackage = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    setActiveView('workspace');
  };

  return (
    <div className="space-y-6 text-xs" id="publication-hub-view">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Pusat Publikasi & Monitoring Distribusi Kanal
            </h1>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Pemantauan siar seluruh kanal resmi, penanganan transmisi gagal (retry queue), dan repositori bukti URL tayang.
          </p>
        </div>

        {failedRecords.length > 0 && (
          <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-900 font-bold self-start sm:self-auto">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{failedRecords.length} Transmisi Gagal</span>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-[11px] font-medium block">Total Berhasil Tayang</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">{successRecords.length}</div>
          <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">Disertai URL siar sah</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-[11px] font-medium block">Terjadwal (Scheduled)</span>
          <div className="text-2xl font-black text-blue-700 mt-1">{scheduledRecords.length}</div>
          <span className="text-[10px] text-blue-600 font-semibold mt-0.5 block">Menunggu waktu tayang</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-[11px] font-medium block">Gagal Transmisi</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{failedRecords.length}</div>
          <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">Memerlukan kirim ulang</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-[11px] font-medium block">Ditarik (Takedown)</span>
          <div className="text-2xl font-black text-slate-700 mt-1">{takedownRecords.length}</div>
          <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">Tercatat di audit</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-3">
        <select
          value={filterChannel}
          onChange={(e) => setFilterChannel(e.target.value)}
          className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="ALL">Semua Kanal</option>
          <option value="WEBSITE">Website Portal</option>
          <option value="INSTAGRAM">Instagram</option>
          <option value="FACEBOOK">Facebook</option>
          <option value="TIKTOK">TikTok</option>
          <option value="YOUTUBE">YouTube</option>
          <option value="X">X (Twitter)</option>
          <option value="LINKEDIN">LinkedIn</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="ALL">Semua Status</option>
          <option value="SUCCESS">Berhasil (Success)</option>
          <option value="SCHEDULED">Terjadwal (Scheduled)</option>
          <option value="FAILED">Gagal (Failed)</option>
          <option value="TAKEDOWN">Takedown</option>
        </select>
      </div>

      {/* Publications Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-3">Kanal</th>
              <th className="p-3">Paket Konten Terkait</th>
              <th className="p-3">Status</th>
              <th className="p-3">Bukti Tautan (Live URL)</th>
              <th className="p-3">Waktu Tayang / Jadwal</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRecords.map((r) => {
              const pkg = packages.find((p) => p.id === r.packageId);
              return (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{r.channel}</td>
                  <td className="p-3">
                    {pkg ? (
                      <button
                        onClick={() => handleOpenPackage(pkg.id)}
                        className="text-left group"
                      >
                        <span className="font-mono font-bold text-slate-700 group-hover:text-emerald-700 block">
                          {pkg.packageNumber}
                        </span>
                        <span className="text-[11px] text-slate-500 line-clamp-1 group-hover:text-emerald-800">
                          {pkg.title}
                        </span>
                      </button>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        r.status === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'FAILED'
                          ? 'bg-rose-100 text-rose-800'
                          : r.status === 'SCHEDULED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {r.liveUrl ? (
                      <a
                        href={r.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-semibold"
                      >
                        <span className="truncate max-w-xs">{r.liveUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="p-3 text-slate-600">
                    {r.publishedAt
                      ? new Date(r.publishedAt).toLocaleString('id-ID')
                      : r.scheduledTime
                      ? `Jadwal: ${new Date(r.scheduledTime).toLocaleString('id-ID')}`
                      : '-'}
                  </td>
                  <td className="p-3 text-right">
                    {r.status === 'FAILED' && (
                      <button
                        onClick={() => {
                          const res = retryPublication(r.id);
                          if (res.success) alert('Publikasi berhasil dikirim ulang!');
                        }}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-[11px] flex items-center gap-1 ml-auto"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Kirim Ulang</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
