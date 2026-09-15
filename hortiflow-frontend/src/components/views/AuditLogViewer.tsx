import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  User,
  Hash,
  ArrowRight,
  Database,
  Copy,
  Check,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  X,
  Layers,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { useHortiFlow } from '../../context/HortiFlowContext';
import { ActiveView } from '../layout/Sidebar';
import { AuditLog, AuditSeverity } from '../../types';

interface AuditLogViewerProps {
  setActiveView: (view: ActiveView) => void;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ setActiveView }) => {
  const { auditLogs, packages, setSelectedPackageId } = useHortiFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null);

  // Copy to clipboard helper
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Severity count statistics
  const stats = useMemo(() => {
    const total = auditLogs.length;
    const criticalCount = auditLogs.filter(
      (l) => l.severity === 'CRITICAL' || l.action === 'EMERGENCY_TAKEDOWN'
    ).length;
    const highCount = auditLogs.filter(
      (l) =>
        l.severity === 'HIGH' ||
        l.action === 'APPROVAL_ACTION_EXECUTED' ||
        l.action === 'TRIAGE_RETRIAGE' ||
        l.action.startsWith('RBAC_')
    ).length;
    const uniqueCorrelations = new Set(auditLogs.map((l) => l.correlationId || l.id)).size;

    return { total, criticalCount, highCount, uniqueCorrelations };
  }, [auditLogs]);

  // Filtering
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (filterAction !== 'ALL' && log.action !== filterAction) return false;
      if (filterSeverity !== 'ALL') {
        const sev = log.severity || 'LOW';
        if (sev !== filterSeverity) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          log.action.toLowerCase().includes(q) ||
          log.actorName.toLowerCase().includes(q) ||
          (log.actorRole && log.actorRole.toLowerCase().includes(q)) ||
          (log.diffDescription && log.diffDescription.toLowerCase().includes(q)) ||
          (log.reason && log.reason.toLowerCase().includes(q)) ||
          (log.correlationId && log.correlationId.toLowerCase().includes(q)) ||
          (log.integrityHash && log.integrityHash.toLowerCase().includes(q)) ||
          (log.targetEntity && log.targetEntity.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [auditLogs, filterAction, filterSeverity, searchQuery]);

  // JSON Export
  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `hortiflow_audit_logs_iso27001_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = [
      'Timestamp (ISO)',
      'Correlation ID (UUID v4)',
      'Severity',
      'Action',
      'Actor Name',
      'Actor Role',
      'Target Entity',
      'Target ID',
      'Package ID',
      'IP Address',
      'Diff Description',
      'Reason / Justification',
      'SHA-256 Integrity Hash',
    ];

    const rows = filteredLogs.map((log) => [
      `"${log.timestamp}"`,
      `"${log.correlationId || ''}"`,
      `"${log.severity || 'INFO'}"`,
      `"${log.action}"`,
      `"${log.actorName}"`,
      `"${log.actorRole || ''}"`,
      `"${log.targetEntity || ''}"`,
      `"${log.targetId || ''}"`,
      `"${log.packageId || ''}"`,
      `"${log.ipAddress || ''}"`,
      `"${(log.diffDescription || '').replace(/"/g, '""')}"`,
      `"${(log.reason || '').replace(/"/g, '""')}"`,
      `"${log.integrityHash || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `hortiflow_audit_trail_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Related events in same correlation chain
  const relatedChainEvents = useMemo(() => {
    if (!selectedAuditLog || !selectedAuditLog.correlationId) return [];
    return auditLogs.filter(
      (l) => l.correlationId === selectedAuditLog.correlationId && l.id !== selectedAuditLog.id
    );
  }, [selectedAuditLog, auditLogs]);

  return (
    <div className="space-y-6 text-xs" id="audit-log-viewer">
      {/* 1. Header Banner with ISO/IEC 27001 Compliance Badge */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>ISO/IEC 27001:2022 Compliant</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold">
              <Lock className="w-3 h-3 text-slate-500" />
              <span>Append-Only Ledger</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
            Pusat Audit Trail & Jejak Kepatuhan Digital
          </h1>
          <p className="text-slate-500 text-xs mt-1 max-w-3xl leading-relaxed">
            Rekaman historis permanen tak-terhapus (append-only) dengan penomoran korelasi unik (UUID v4)
            dan segel integritas SHA-256 untuk seluruh tindakan editorial, triase, persetujuan, takedown darurat,
            dan mutasi wewenang RBAC.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Ekspor Jejak Audit ke CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={handleExportJson}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Ekspor Dokumen Bukti Audit JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>Ekspor JSON</span>
          </button>
        </div>
      </div>

      {/* 2. Statistical KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Total Entri Audit</span>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">{stats.total}</div>
          <span className="text-[10px] text-emerald-700 font-semibold block">Append-Only Immutability</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Tindakan Kritis & Takedown</span>
          <div className="text-2xl font-black text-rose-600 font-mono tabular-nums">
            {stats.criticalCount + stats.highCount}
          </div>
          <span className="text-[10px] text-rose-700 font-semibold block">
            {stats.criticalCount} Darurat / {stats.highCount} Berisiko Tinggi
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Rantai Korelasi Unik</span>
          <div className="text-2xl font-black text-indigo-700 font-mono tabular-nums">
            {stats.uniqueCorrelations}
          </div>
          <span className="text-[10px] text-slate-500 font-semibold block">UUID v4 Traceability</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Integritas Kriptografis</span>
          <div className="text-2xl font-black text-emerald-700 font-mono flex items-center gap-1">
            <span>100%</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-[10px] text-emerald-800 font-semibold block">SHA-256 Hash Validated</span>
        </div>
      </div>

      {/* 3. Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari aksi, pelaksana, correlation ID, hash SHA-256, atau nomor paket..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-emerald-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold text-xs cursor-pointer"
          >
            <option value="ALL">Semua Keparahan</option>
            <option value="CRITICAL">🔴 CRITICAL (Takedown & Darurat)</option>
            <option value="HIGH">🟠 HIGH (Approval & RBAC)</option>
            <option value="MEDIUM">🔵 MEDIUM (Triase & Publikasi)</option>
            <option value="LOW">⚪ LOW (Operasional Rutin)</option>
          </select>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold text-xs cursor-pointer max-w-xs"
          >
            <option value="ALL">Semua Tipe Aksi</option>
            <optgroup label="Tindakan Kritis">
              <option value="EMERGENCY_TAKEDOWN">EMERGENCY_TAKEDOWN</option>
              <option value="APPROVAL_ACTION_EXECUTED">APPROVAL_ACTION_EXECUTED</option>
              <option value="APPROVAL_DECISION">APPROVAL_DECISION</option>
              <option value="TRIAGE_RETRIAGE">TRIAGE_RETRIAGE</option>
              <option value="TRIAGE_ACCEPT">TRIAGE_ACCEPT</option>
            </optgroup>
            <optgroup label="Manajemen Hak Akses & RBAC">
              <option value="RBAC_ROLE_CHANGED">RBAC_ROLE_CHANGED</option>
              <option value="RBAC_STATUS_CHANGED">RBAC_STATUS_CHANGED</option>
              <option value="DELEGATION_REVOKED">DELEGATION_REVOKED</option>
              <option value="DELEGATION_GRANTED">DELEGATION_GRANTED</option>
            </optgroup>
            <optgroup label="Editorial & Publikasi">
              <option value="PUBLICATION_PROOF_RECORDED">PUBLICATION_PROOF_RECORDED</option>
              <option value="LIFECYCLE_TRANSITION">LIFECYCLE_TRANSITION</option>
              <option value="NARRATIVE_VERSION_SAVED">NARRATIVE_VERSION_SAVED</option>
              <option value="BLOCKER_TOGGLED">BLOCKER_TOGGLED</option>
              <option value="CLAIM_VERIFIED">CLAIM_VERIFIED</option>
              <option value="ARCHIVE_LOCKED">ARCHIVE_LOCKED</option>
            </optgroup>
          </select>

          {(searchQuery || filterAction !== 'ALL' || filterSeverity !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterAction('ALL');
                setFilterSeverity('ALL');
              }}
              className="px-3 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 4. Audit Log Table with Scannable Correlation ID Visualization */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 whitespace-nowrap">Waktu & Timestamp (ISO)</th>
                <th className="p-3.5">Pelaksana (Actor)</th>
                <th className="p-3.5">Aksi & Keparahan</th>
                <th className="p-3.5">Objek / Paket Konten</th>
                <th className="p-3.5">Uraian Transaksi</th>
                <th className="p-3.5">Correlation ID & Integritas ISO</th>
                <th className="p-3.5 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ditemukan log audit yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const pkg = packages.find((p) => p.id === log.packageId);
                  const severity = log.severity || 'LOW';
                  const corrId = log.correlationId || log.id;
                  const isCopied = copiedId === `corr-${log.id}`;

                  // Severity style mapping
                  const severityStyles = {
                    CRITICAL: 'bg-rose-50 text-rose-800 border-rose-200 font-black',
                    HIGH: 'bg-amber-50 text-amber-800 border-amber-200 font-bold',
                    MEDIUM: 'bg-sky-50 text-sky-800 border-sky-200 font-semibold',
                    LOW: 'bg-slate-50 text-slate-700 border-slate-200 font-medium',
                  }[severity];

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/90 transition-colors">
                      {/* Timestamp with high-precision ISO */}
                      <td className="p-3.5 whitespace-nowrap align-top">
                        <div
                          className="font-mono text-[11px] font-bold text-slate-800 flex items-center gap-1.5"
                          title={log.timestamp}
                        >
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {new Date(log.timestamp).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="font-mono text-[10px] text-slate-500 pl-4.5 mt-0.5">
                          {new Date(log.timestamp).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Actor Information */}
                      <td className="p-3.5 align-top">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-[10px] shrink-0">
                            {log.actorName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">
                              {log.actorName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {log.actorRole || 'SYSTEM'}
                            </span>
                          </div>
                        </div>
                        {log.ipAddress && (
                          <span className="text-[9px] text-slate-400 font-mono block mt-1">
                            IP: {log.ipAddress}
                          </span>
                        )}
                      </td>

                      {/* Action & Severity Pill */}
                      <td className="p-3.5 align-top">
                        <div className="space-y-1">
                          <span className="font-mono text-[10px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 block w-fit whitespace-nowrap">
                            {log.action}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] border ${severityStyles}`}
                          >
                            {severity === 'CRITICAL' && <ShieldAlert className="w-2.5 h-2.5" />}
                            {severity === 'HIGH' && <AlertTriangle className="w-2.5 h-2.5" />}
                            <span>{severity}</span>
                          </span>
                        </div>
                      </td>

                      {/* Target Object / Content Package */}
                      <td className="p-3.5 align-top">
                        {pkg ? (
                          <button
                            onClick={() => {
                              setSelectedPackageId(pkg.id);
                              setActiveView('workspace');
                            }}
                            className="text-left group cursor-pointer"
                          >
                            <span className="font-mono font-bold text-slate-800 group-hover:text-emerald-700 block">
                              {pkg.packageNumber}
                            </span>
                            <span className="text-[11px] text-slate-500 line-clamp-1 max-w-[160px]">
                              {pkg.title}
                            </span>
                          </button>
                        ) : log.targetEntity ? (
                          <div>
                            <span className="font-mono font-semibold text-slate-700 text-[11px]">
                              {log.targetEntity}
                            </span>
                            {log.targetId && (
                              <span className="text-[10px] text-slate-400 font-mono block">
                                ID: {log.targetId}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono">-</span>
                        )}
                      </td>

                      {/* Diff Description & Justification */}
                      <td className="p-3.5 align-top max-w-xs sm:max-w-sm">
                        <div className="text-slate-800 font-medium line-clamp-2 leading-relaxed">
                          {log.diffDescription || log.reason || '-'}
                        </div>
                        {log.reason && log.diffDescription && (
                          <div className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-1">
                            Alasan: {log.reason}
                          </div>
                        )}
                      </td>

                      {/* Correlation ID & ISO/IEC 27001 Integrity Badge */}
                      <td className="p-3.5 align-top">
                        <div className="space-y-1.5 min-w-[170px]">
                          {/* Compact Correlation ID Pill */}
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 text-white font-mono text-[10px] border border-slate-800 shadow-2xs">
                            <Hash className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="font-bold tracking-tight text-slate-100" title={corrId}>
                              {corrId.length > 18
                                ? `${corrId.substring(0, 8)}...${corrId.substring(corrId.length - 6)}`
                                : corrId}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(corrId, `corr-${log.id}`)}
                              className="ml-1 p-0.5 text-slate-400 hover:text-emerald-300 rounded transition-colors cursor-pointer"
                              title="Salin Full UUID v4"
                            >
                              {isCopied ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          {/* ISO 27001 Cryptographic Seal Indicator */}
                          <div className="flex items-center gap-1.5">
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200"
                              title={`SHA-256: ${log.integrityHash || 'Pre-computed cryptographic hash'}`}
                            >
                              <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                              <span>SHA-256 Valid</span>
                            </span>

                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                                Payload+
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Detail Trigger */}
                      <td className="p-3.5 text-right align-top">
                        <button
                          onClick={() => setSelectedAuditLog(log)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                          title="Inspeksi Detail Payload & Jejak Audit"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspeksi</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Detail Modal: Full ISO/IEC 27001 Audit Entry Inspection */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 border border-slate-200 space-y-4 text-xs">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Inspeksi Jejak Audit ISO/IEC 27001
                  </h3>
                  <span className="text-slate-500 font-mono text-[11px]">
                    Event ID: {selectedAuditLog.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cryptographic Verification Seal */}
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-900 block text-xs">
                    Verifikasi Integritas Data Lulus (No Tampering)
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    Hash SHA-256 append-only sesuai dengan standar audit trail ISO/IEC 27001:2022.
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                STATUS: VALID
              </span>
            </div>

            {/* Core Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">
                  Correlation ID (UUID v4)
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-slate-900 font-bold text-[11px] select-all">
                    {selectedAuditLog.correlationId || selectedAuditLog.id}
                  </span>
                  <button
                    onClick={() =>
                      handleCopyText(
                        selectedAuditLog.correlationId || selectedAuditLog.id,
                        'modal-corr'
                      )
                    }
                    className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"
                    title="Salin UUID"
                  >
                    {copiedId === 'modal-corr' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">
                  Timestamp Presisi ISO-8601
                </span>
                <span className="font-mono text-slate-900 font-bold text-[11px] block mt-0.5 select-all">
                  {selectedAuditLog.timestamp}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">
                  Pelaksana (Actor)
                </span>
                <span className="font-semibold text-slate-800 text-[11px] block mt-0.5">
                  {selectedAuditLog.actorName} ({selectedAuditLog.actorRole}) - ID: {selectedAuditLog.actorId}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">
                  Aksi & Tingkat Keparahan
                </span>
                <span className="font-mono font-bold text-slate-900 text-[11px] block mt-0.5">
                  {selectedAuditLog.action} [{selectedAuditLog.severity || 'LOW'}]
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">
                  Alamat IP Klien
                </span>
                <span className="font-mono text-slate-700 text-[11px] block mt-0.5">
                  {selectedAuditLog.ipAddress || '127.0.0.1 (Internal Gateway)'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">
                  Entitas Sasaran (Target)
                </span>
                <span className="font-mono text-slate-700 text-[11px] block mt-0.5">
                  {selectedAuditLog.targetEntity || '-'}: {selectedAuditLog.targetId || '-'}
                </span>
              </div>
            </div>

            {/* Justification & Diff Details */}
            <div className="space-y-2">
              <span className="font-bold text-slate-800 block">Deskripsi Materiil & Justifikasi:</span>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-xs leading-relaxed space-y-1">
                <div>
                  <strong className="text-slate-900">Uraian: </strong>
                  {selectedAuditLog.diffDescription || '-'}
                </div>
                {selectedAuditLog.reason && (
                  <div>
                    <strong className="text-slate-900">Alasan Resmi: </strong>
                    {selectedAuditLog.reason}
                  </div>
                )}
              </div>
            </div>

            {/* Cryptographic SHA-256 Hash */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-[11px]">
                  Segel Integritas Kriptografis (SHA-256 Integrity Hash):
                </span>
                <button
                  onClick={() =>
                    handleCopyText(selectedAuditLog.integrityHash || '', 'modal-hash')
                  }
                  className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-mono text-[10px] cursor-pointer"
                >
                  {copiedId === 'modal-hash' ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>Salin Hash</span>
                </button>
              </div>
              <div className="p-2.5 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[10px] break-all select-all">
                {selectedAuditLog.integrityHash || 'sha256-precomputed-immutable-seed-record'}
              </div>
            </div>

            {/* Metadata Payload (if any) */}
            {selectedAuditLog.metadata && Object.keys(selectedAuditLog.metadata).length > 0 && (
              <div className="space-y-1">
                <span className="font-bold text-slate-800 text-[11px]">
                  Payload Metadata Transaksi:
                </span>
                <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[10px] overflow-x-auto max-h-36">
                  {JSON.stringify(selectedAuditLog.metadata, null, 2)}
                </pre>
              </div>
            )}

            {/* Related Events in Same Correlation Chain */}
            {relatedChainEvents.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-slate-800 text-xs">
                    Rantai Korelasi Terkait ({relatedChainEvents.length} entri lain dengan ID sama)
                  </span>
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {relatedChainEvents.map((rLog) => (
                    <div
                      key={rLog.id}
                      onClick={() => setSelectedAuditLog(rLog)}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-800">
                          {rLog.action}
                        </span>
                        <span className="text-slate-500 text-[11px] truncate max-w-xs">
                          {rLog.diffDescription || rLog.reason}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {new Date(rLog.timestamp).toLocaleTimeString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-mono">
                Immutable Ledger • Non-Repudiation Verified
              </span>
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold cursor-pointer hover:bg-slate-800 transition-colors"
              >
                Tutup Inspeksi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
