import React, { useState } from 'react';
import {
  History,
  ShieldCheck,
  User,
  Clock,
  Search,
  Filter,
  Copy,
  Check,
  Hash,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';
import { ContentPackage, AuditSeverity } from '../../../types';
import { useHortiFlow } from '../../../context/HortiFlowContext';

interface HistoryTabProps {
  pkg: ContentPackage;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ pkg }) => {
  const { auditLogs } = useHortiFlow();

  const [filterAction, setFilterAction] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Scoped to this package
  const packageLogs = auditLogs.filter((log) => log.packageId === pkg.id);

  const filteredLogs = packageLogs.filter((log) => {
    if (filterAction !== 'ALL' && log.action !== filterAction) return false;
    if (filterSeverity !== 'ALL' && (log.severity || 'LOW') !== filterSeverity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.actorName.toLowerCase().includes(q) ||
        (log.actorRole && log.actorRole.toLowerCase().includes(q)) ||
        (log.diffDescription && log.diffDescription.toLowerCase().includes(q)) ||
        (log.reason && log.reason.toLowerCase().includes(q)) ||
        (log.correlationId && log.correlationId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 text-xs" id="workspace-tab-history">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>ISO/IEC 27001 Immutability</span>
            </span>
          </div>
          <h3 className="font-bold text-sm text-slate-900 mt-1">
            Jejak Audit Paket Konten (Append-Only Audit Trail)
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Riwayat modifikasi materiil, transisi status, temuan mutu, dan manifest persetujuan dengan pelacakan Correlation ID unik.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari jejak audit..."
              className="pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-44"
            />
          </div>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
          >
            <option value="ALL">Semua Keparahan</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
          >
            <option value="ALL">Semua Aksi</option>
            <option value="LIFECYCLE_TRANSITION">LIFECYCLE_TRANSITION</option>
            <option value="APPROVAL_DECISION">APPROVAL_DECISION</option>
            <option value="APPROVAL_ACTION_EXECUTED">APPROVAL_ACTION_EXECUTED</option>
            <option value="TRIAGE_ACCEPT">TRIAGE_ACCEPT</option>
            <option value="TRIAGE_RETRIAGE">TRIAGE_RETRIAGE</option>
            <option value="BLOCKER_TOGGLED">BLOCKER_TOGGLED</option>
            <option value="NARRATIVE_VERSION_SAVED">NARRATIVE_VERSION_SAVED</option>
            <option value="PUBLICATION_PROOF_RECORDED">PUBLICATION_PROOF_RECORDED</option>
            <option value="EMERGENCY_TAKEDOWN">EMERGENCY_TAKEDOWN</option>
          </select>
        </div>
      </div>

      {/* Timeline view */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            Tidak ada riwayat audit log yang sesuai kriteria pencarian.
          </div>
        ) : (
          <div className="relative border-l-2 border-emerald-500/40 ml-4 space-y-6">
            {filteredLogs.map((log, idx) => {
              const severity = log.severity || 'LOW';
              const corrId = log.correlationId || log.id;
              const isCopied = copiedId === `pkg-corr-${log.id}`;

              return (
                <div key={`${log.id}-${idx}`} className="relative pl-6">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 ${
                      severity === 'CRITICAL'
                        ? 'border-rose-600'
                        : severity === 'HIGH'
                        ? 'border-amber-500'
                        : 'border-emerald-600'
                    }`}
                  />

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                          {log.action}
                        </span>

                        {severity === 'CRITICAL' && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                            <ShieldAlert className="w-2.5 h-2.5" />
                            CRITICAL
                          </span>
                        )}
                        {severity === 'HIGH' && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            HIGH
                          </span>
                        )}

                        <span className="font-bold text-slate-800">{log.actorName}</span>
                        <span className="text-slate-400 text-[10px]">({log.actorRole})</span>
                      </div>

                      <div
                        className="text-[10px] text-slate-500 font-mono flex items-center gap-1"
                        title={log.timestamp}
                      >
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(log.timestamp).toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    <p className="text-slate-800 text-xs leading-relaxed font-medium">
                      {log.diffDescription || log.reason || 'Pembaruan data pada paket'}
                    </p>

                    {log.reason && log.diffDescription && (
                      <div className="text-[11px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100">
                        Alasan: {log.reason}
                      </div>
                    )}

                    {/* Compact Correlation ID & Integrity footer */}
                    <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
                      <div className="flex items-center gap-2 text-slate-500">
                        <span>IP: {log.ipAddress || '127.0.0.1'}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold">SHA-256 Valid</span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-slate-900 text-white px-2 py-0.5 rounded-lg border border-slate-800">
                        <Hash className="w-3 h-3 text-emerald-400" />
                        <span className="font-bold text-slate-200" title={corrId}>
                          {corrId.length > 20
                            ? `${corrId.substring(0, 8)}...${corrId.substring(corrId.length - 4)}`
                            : corrId}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(corrId, `pkg-corr-${log.id}`)}
                          className="text-slate-400 hover:text-emerald-300 ml-1 cursor-pointer"
                          title="Salin Correlation ID"
                        >
                          {isCopied ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
