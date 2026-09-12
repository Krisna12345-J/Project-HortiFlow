import React, { useState, useMemo } from 'react';
import { useHortiFlow } from '../../context/HortiFlowContext';
import { ActiveView } from '../layout/Sidebar';

interface RealTimeNotificationSystemProps {
  setActiveView: (view: ActiveView) => void;
}

export type AlertCategory = 'ALL' | 'APPROVAL_URGENT' | 'DEADLINE_CRITICAL' | 'BLOCKER_RISK';

export interface RealTimeAlertItem {
  id: string;
  type: 'APPROVAL_URGENT' | 'DEADLINE_CRITICAL' | 'BLOCKER_RISK';
  title: string;
  message: string;
  packageId?: string;
  packageNumber?: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  timeAgo: string;
  targetView: ActiveView;
  actionLabel: string;
  slaRemaining?: string;
  deadlineDate?: string;
}

export const RealTimeNotificationSystem: React.FC<RealTimeNotificationSystemProps> = ({ setActiveView }) => {
  const { packages, setSelectedPackageId } = useHortiFlow();

  const [activeCategory, setActiveCategory] = useState<AlertCategory>('ALL');
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);

  // Derive real-time alerts from actual application state
  const derivedAlerts = useMemo<RealTimeAlertItem[]>(() => {
    const alerts: RealTimeAlertItem[] = [];
    const now = new Date('2026-09-11T12:00:00Z').getTime();

    // 1. URGENT APPROVAL REQUESTS
    const pendingApprovalPkgs = packages.filter((p) => p.lifecycleStatus === 'APPROVAL_PENDING');
    pendingApprovalPkgs.forEach((pkg, idx) => {
      alerts.push({
        id: `alert-appr-${pkg.id}`,
        type: 'APPROVAL_URGENT',
        title: `Persetujuan Mandat: ${pkg.packageNumber}`,
        message: `Paket '${pkg.title}' memerlukan tanda tangan verifikasi editorial.`,
        packageId: pkg.id,
        packageNumber: pkg.packageNumber,
        urgency: pkg.riskLevel === 'CRITICAL' || pkg.riskLevel === 'HIGH' ? 'CRITICAL' : 'HIGH',
        timeAgo: `${idx === 0 ? '15m' : '45m'} lalu`,
        targetView: 'approvals',
        actionLabel: 'Tinjau Persetujuan',
        slaRemaining: 'SLA: 2j 45m',
      });
    });

    // 2. CRITICAL DEADLINES
    const activePackages = packages.filter(
      (p) => p.lifecycleStatus !== 'PUBLISHED' && p.lifecycleStatus !== 'ARCHIVED' && p.lifecycleStatus !== 'WITHDRAWN'
    );

    activePackages.forEach((pkg) => {
      const deadlineTime = new Date(pkg.deadline).getTime();
      const diffHours = (deadlineTime - now) / (1000 * 60 * 60);

      if (diffHours <= 24 && diffHours >= -48) {
        alerts.push({
          id: `alert-dl-${pkg.id}`,
          type: 'DEADLINE_CRITICAL',
          title: `Tenggat Publikasi: ${pkg.packageNumber}`,
          message: `Jadwal tayang '${pkg.title}' jatuh tempo hari ini (${pkg.deadline}).`,
          packageId: pkg.id,
          packageNumber: pkg.packageNumber,
          urgency: diffHours <= 6 ? 'CRITICAL' : 'HIGH',
          timeAgo: '1j lalu',
          targetView: 'workspace',
          actionLabel: 'Buka Workspace',
          deadlineDate: `Jadwal: ${pkg.deadline}`,
        });
      }
    });

    // 3. QUALITY GATE BLOCKERS
    const blockedPkgs = packages.filter((p) => p.hasBlocker);
    blockedPkgs.forEach((pkg) => {
      alerts.push({
        id: `alert-blocker-${pkg.id}`,
        type: 'BLOCKER_RISK',
        title: `Quality Blocker: ${pkg.packageNumber}`,
        message: pkg.blockerReason || `Temuan review menahan rilis paket '${pkg.title}'.`,
        packageId: pkg.id,
        packageNumber: pkg.packageNumber,
        urgency: 'CRITICAL',
        timeAgo: '2j lalu',
        targetView: 'inbox',
        actionLabel: 'Lihat Temuan',
      });
    });

    return alerts;
  }, [packages]);

  const activeAlerts = useMemo(() => {
    return derivedAlerts.filter((a) => !dismissedAlertIds.includes(a.id));
  }, [derivedAlerts, dismissedAlertIds]);

  const filteredAlerts = useMemo(() => {
    if (activeCategory === 'ALL') return activeAlerts;
    return activeAlerts.filter((a) => a.type === activeCategory);
  }, [activeAlerts, activeCategory]);

  const approvalsCount = activeAlerts.filter((a) => a.type === 'APPROVAL_URGENT').length;
  const deadlinesCount = activeAlerts.filter((a) => a.type === 'DEADLINE_CRITICAL').length;
  const blockersCount = activeAlerts.filter((a) => a.type === 'BLOCKER_RISK').length;

  const handleAlertAction = (alert: RealTimeAlertItem) => {
    if (alert.packageId) {
      setSelectedPackageId(alert.packageId);
    }
    setActiveView(alert.targetView);
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedAlertIds((prev) => [...prev, id]);
  };

  const handleDismissAll = () => {
    setDismissedAlertIds(derivedAlerts.map((a) => a.id));
  };

  if (activeAlerts.length === 0) {
    return null;
  }

  return (
    <div
      id="realtime-notification-system"
      className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden"
    >
      {/* Header bar: minimal, clean, professional */}
      <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-bold text-slate-800 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
            Notifikasi Operasional
          </span>
          <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
            {activeAlerts.length} Perlu Tindakan
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              activeCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Semua ({activeAlerts.length})
          </button>
          {approvalsCount > 0 && (
            <button
              onClick={() => setActiveCategory('APPROVAL_URGENT')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeCategory === 'APPROVAL_URGENT'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Persetujuan ({approvalsCount})
            </button>
          )}
          {deadlinesCount > 0 && (
            <button
              onClick={() => setActiveCategory('DEADLINE_CRITICAL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeCategory === 'DEADLINE_CRITICAL'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Tenggat ({deadlinesCount})
            </button>
          )}
          {blockersCount > 0 && (
            <button
              onClick={() => setActiveCategory('BLOCKER_RISK')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeCategory === 'BLOCKER_RISK'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Blocker ({blockersCount})
            </button>
          )}
          <span className="text-slate-300 mx-1">|</span>
          <button
            onClick={handleDismissAll}
            className="text-[11px] text-slate-500 hover:text-slate-800 font-medium px-1 py-0.5 rounded transition-colors"
          >
            Tandai Selesai
          </button>
        </div>
      </div>

      {/* Scannable & clean list */}
      <div className="divide-y divide-slate-100 max-h-[260px] overflow-y-auto">
        {filteredAlerts.map((alert) => {
          const typeBadge =
            alert.type === 'APPROVAL_URGENT'
              ? 'Persetujuan'
              : alert.type === 'DEADLINE_CRITICAL'
              ? 'Tenggat Waktu'
              : 'Quality Blocker';

          const badgeClass =
            alert.type === 'APPROVAL_URGENT'
              ? 'text-amber-800 bg-amber-50/80 border-amber-200'
              : alert.type === 'DEADLINE_CRITICAL'
              ? 'text-rose-800 bg-rose-50/80 border-rose-200'
              : 'text-slate-800 bg-slate-100 border-slate-200';

          return (
            <div
              key={alert.id}
              className="p-3.5 sm:px-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border ${badgeClass}`}>
                    {typeBadge}
                  </span>
                  {alert.packageNumber && (
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {alert.packageNumber}
                    </span>
                  )}
                  {alert.slaRemaining && (
                    <span className="text-[11px] font-mono text-amber-800 font-medium bg-amber-50/60 px-1.5 py-0.5 rounded">
                      {alert.slaRemaining}
                    </span>
                  )}
                  {alert.deadlineDate && (
                    <span className="text-[11px] font-mono text-rose-800 font-medium bg-rose-50/60 px-1.5 py-0.5 rounded">
                      {alert.deadlineDate}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">({alert.timeAgo})</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {alert.message}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => handleAlertAction(alert)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                >
                  {alert.actionLabel}
                </button>
                <button
                  onClick={(e) => handleDismiss(alert.id, e)}
                  className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
