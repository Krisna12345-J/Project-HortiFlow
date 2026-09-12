import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Shield,
  Clock,
  User,
  Hash,
  ArrowRight,
  Database,
} from 'lucide-react';
import { useHortiFlow } from '../../context/HortiFlowContext';
import { ActiveView } from '../layout/Sidebar';

interface AuditLogViewerProps {
  setActiveView: (view: ActiveView) => void;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ setActiveView }) => {
  const { auditLogs, packages, setSelectedPackageId } = useHortiFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    if (filterAction !== 'ALL' && log.action !== filterAction) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.actorName.toLowerCase().includes(q) ||
        (log.diffDescription && log.diffDescription.toLowerCase().includes(q)) ||
        (log.correlationId && log.correlationId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `hortiflow_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 text-xs" id="audit-log-viewer">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Pusat Audit Trail & Jejak Kepatuhan Terpusat
            </h1>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Rekaman historis permanen tak-terhapus (append-only) untuk seluruh aktivitas perubahan status, klaim, persetujuan, dan operasional sistem.
          </p>
        </div>

        <button
          onClick={handleExportJson}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Ekspor Log JSON</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari aksi, nama staf, uraian perubahan, atau correlation ID..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
        >
          <option value="ALL">Semua Tipe Aksi</option>
          <option value="INTAKE_ACCEPTED">INTAKE_ACCEPTED</option>
          <option value="LIFECYCLE_TRANSITION">LIFECYCLE_TRANSITION</option>
          <option value="APPROVAL_DECISION">APPROVAL_DECISION</option>
          <option value="BLOCKER_TOGGLED">BLOCKER_TOGGLED</option>
          <option value="NARRATIVE_VERSION_SAVED">NARRATIVE_VERSION_SAVED</option>
          <option value="BRIEF_UPDATED">BRIEF_UPDATED</option>
          <option value="CLAIM_VERIFIED">CLAIM_VERIFIED</option>
          <option value="PUBLICATION_PROOF_RECORDED">PUBLICATION_PROOF_RECORDED</option>
          <option value="EMERGENCY_TAKEDOWN">EMERGENCY_TAKEDOWN</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-3">Waktu & Tanggal</th>
              <th className="p-3">Pelaksana (Actor)</th>
              <th className="p-3">Aksi Sistem</th>
              <th className="p-3">Paket Konten Terkait</th>
              <th className="p-3">Deskripsi Perubahan</th>
              <th className="p-3 font-mono">Correlation ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map((log, idx) => {
              const pkg = packages.find((p) => p.id === log.packageId);

              return (
                <tr key={`${log.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{log.actorName}</div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3">
                    {pkg ? (
                      <button
                        onClick={() => {
                          setSelectedPackageId(pkg.id);
                          setActiveView('workspace');
                        }}
                        className="text-left group"
                      >
                        <span className="font-mono font-bold text-slate-700 group-hover:text-emerald-700 block">
                          {pkg.packageNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">
                          {pkg.title}
                        </span>
                      </button>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="p-3 text-slate-700 max-w-sm">
                    <div className="line-clamp-2">{log.diffDescription || log.reason || '-'}</div>
                  </td>
                  <td className="p-3 font-mono text-[10px] text-slate-400">
                    {log.correlationId ? log.correlationId.substring(0, 16) + '...' : '-'}
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
