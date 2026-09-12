import React, { useState } from 'react';
import { History, Shield, User, Clock, Search, Filter } from 'lucide-react';
import { ContentPackage } from '../../../types';
import { useHortiFlow } from '../../../context/HortiFlowContext';

interface HistoryTabProps {
  pkg: ContentPackage;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ pkg }) => {
  const { auditLogs } = useHortiFlow();

  const [filterAction, setFilterAction] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Scoped to this package
  const packageLogs = auditLogs.filter((log) => log.packageId === pkg.id);

  const filteredLogs = packageLogs.filter((log) => {
    if (filterAction !== 'ALL' && log.action !== filterAction) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.actorName.toLowerCase().includes(q) ||
        (log.diffDescription && log.diffDescription.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 text-xs" id="workspace-tab-history">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Jejak Audit & Riwayat Perubahan Tak-Terhapus (Append-Only Log)
            </h3>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Rekaman historis seluruh modifikasi materiil, transisi status, temuan mutu, dan keputusan persetujuan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari aktivitas..."
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          >
            <option value="ALL">Semua Aksi</option>
            <option value="LIFECYCLE_TRANSITION">LIFECYCLE_TRANSITION</option>
            <option value="APPROVAL_DECISION">APPROVAL_DECISION</option>
            <option value="BLOCKER_TOGGLED">BLOCKER_TOGGLED</option>
            <option value="NARRATIVE_VERSION_SAVED">NARRATIVE_VERSION_SAVED</option>
            <option value="REVIEW_FINDING_RESOLVED">REVIEW_FINDING_RESOLVED</option>
          </select>
        </div>
      </div>

      {/* Timeline view */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
        <div className="relative border-l-2 border-emerald-500/40 ml-4 space-y-6">
          {filteredLogs.map((log, idx) => (
            <div key={`${log.id}-${idx}`} className="relative pl-6">
              {/* Dot */}
              <div className="absolute -left-2 top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-emerald-600"></div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      {log.action}
                    </span>
                    <span className="font-bold text-slate-800">{log.actorName}</span>
                    <span className="text-slate-400 text-[10px]">({log.actorRole})</span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleString('id-ID')}
                  </span>
                </div>

                <p className="text-slate-700 text-xs mt-1 leading-snug">
                  {log.diffDescription || log.reason || 'Pembaruan data pada paket'}
                </p>

                <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>IP: {log.ipAddress}</span>
                  <span>Corr ID: {log.correlationId}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
