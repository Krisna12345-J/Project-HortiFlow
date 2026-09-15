import React, { useState, useMemo } from 'react';
import { useHortiFlow } from '../../context/HortiFlowContext';
import { AppNotification } from '../../types';
import { ActiveView } from '../layout/Sidebar';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveView: (view: ActiveView) => void;
}

type TabType = 'ALL' | 'APPROVALS' | 'DEADLINES' | 'UNREAD';

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  setActiveView,
}) => {
  const {
    notifications,
    packages,
    currentUser,
    markNotificationRead,
    markNotificationUnread,
    deleteNotification,
    clearAllNotifications,
    setSelectedPackageId,
  } = useHortiFlow();

  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMyAccountOnly, setFilterMyAccountOnly] = useState(false);

  // Filtered Notifications based on current view preferences
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // User account filter
      if (filterMyAccountOnly && notif.recipientId !== currentUser?.id) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = notif.title.toLowerCase().includes(q);
        const matchMsg = notif.message.toLowerCase().includes(q);
        if (!matchTitle && !matchMsg) return false;
      }

      // Tab filter
      if (activeTab === 'UNREAD') {
        return !notif.isRead;
      }
      if (activeTab === 'APPROVALS') {
        return (
          notif.category === 'APPROVAL_REQUEST' ||
          notif.title.toLowerCase().includes('persetujuan') ||
          notif.title.toLowerCase().includes('manifest') ||
          notif.title.toLowerCase().includes('perubahan')
        );
      }
      if (activeTab === 'DEADLINES') {
        return notif.category === 'DEADLINE' || notif.title.toLowerCase().includes('tenggat');
      }

      return true;
    });
  }, [notifications, activeTab, searchQuery, filterMyAccountOnly, currentUser?.id]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const approvalsCount = notifications.filter(
    (n) =>
      n.category === 'APPROVAL_REQUEST' ||
      n.title.toLowerCase().includes('persetujuan') ||
      n.title.toLowerCase().includes('manifest')
  ).length;
  const deadlinesCount = notifications.filter(
    (n) => n.category === 'DEADLINE' || n.title.toLowerCase().includes('tenggat')
  ).length;

  const handleActionClick = (notif: AppNotification) => {
    markNotificationRead(notif.id);
    onClose();

    if (notif.actionUrl.startsWith('pkg-')) {
      setSelectedPackageId(notif.actionUrl);
      if (notif.category === 'APPROVAL_REQUEST') {
        setActiveView('approvals');
      } else {
        setActiveView('workspace');
      }
    } else if (notif.actionUrl.startsWith('req-')) {
      setActiveView('intake');
    } else if (notif.actionUrl.includes('calendar')) {
      setActiveView('calendar');
    } else if (notif.actionUrl.includes('approvals')) {
      setActiveView('approvals');
    } else {
      setActiveView('kanban');
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'APPROVAL_REQUEST':
        return { label: 'Persetujuan', className: 'text-amber-800 bg-amber-50 border-amber-200' };
      case 'DEADLINE':
        return { label: 'Tenggat', className: 'text-rose-800 bg-rose-50 border-rose-200' };
      case 'REVIEW_BLOCKER':
        return { label: 'Blocker', className: 'text-rose-800 bg-rose-50 border-rose-200' };
      case 'PUBLICATION':
        return { label: 'Publikasi', className: 'text-blue-800 bg-blue-50 border-blue-200' };
      case 'INTAKE_UPDATE':
        return { label: 'Usulan', className: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
      default:
        return { label: 'Sistem', className: 'text-slate-700 bg-slate-100 border-slate-200' };
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-2xs z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Popover / Panel Container */}
      <div
        id="notification-center-panel"
        className="fixed right-3 sm:right-6 top-16 w-full max-w-md sm:max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 z-50 flex flex-col overflow-hidden max-h-[calc(100vh-5rem)]"
      >
        {/* Clean Header */}
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Notifikasi
            </h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-md">
                {unreadCount} baru
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 px-2 py-1 rounded transition-colors"
              >
                Tandai semua dibaca
              </button>
            )}
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-200/50 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-2.5 border-b border-slate-100 bg-white overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua ({notifications.length})
          </button>

          <button
            onClick={() => setActiveTab('APPROVALS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'APPROVALS'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Persetujuan ({approvalsCount})
          </button>

          <button
            onClick={() => setActiveTab('DEADLINES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'DEADLINES'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tenggat ({deadlinesCount})
          </button>

          <button
            onClick={() => setActiveTab('UNREAD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'UNREAD'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Belum Dibaca ({unreadCount})
          </button>
        </div>

        {/* Minimal Search & Filter */}
        <div className="px-3 py-2 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between gap-2 text-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari notifikasi..."
            className="flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 placeholder-slate-400"
          />

          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600 shrink-0 select-none">
            <input
              type="checkbox"
              checked={filterMyAccountOnly}
              onChange={(e) => setFilterMyAccountOnly(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Akun Saya ({currentUser.role})</span>
          </label>
        </div>

        {/* Notification Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <p className="font-medium text-slate-600">Tidak ada notifikasi.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Semua pembaruan operasional terselesaikan dengan baik.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif, idx) => {
              const badge = getCategoryBadge(notif.category);

              return (
                <div
                  key={`${notif.id || 'notif'}-${idx}`}
                  className={`p-3 rounded-lg transition-colors border ${
                    !notif.isRead
                      ? 'bg-emerald-50/30 border-emerald-200/70'
                      : 'bg-white hover:bg-slate-50/70 border-slate-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                          !notif.isRead ? 'bg-emerald-500' : 'bg-transparent'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(notif.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                            })}{' '}
                            •{' '}
                            {new Date(notif.createdAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 mt-1 leading-snug">
                          {notif.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() =>
                          notif.isRead
                            ? markNotificationUnread(notif.id)
                            : markNotificationRead(notif.id)
                        }
                        title={notif.isRead ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}
                        className="text-[11px] text-slate-400 hover:text-slate-600 p-1"
                      >
                        {notif.isRead ? 'Belum' : 'Baca'}
                      </button>
                      <button
                        onClick={() => deleteNotification(notif.id)}
                        title="Hapus"
                        className="text-[11px] text-slate-400 hover:text-rose-600 p-1"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>

                  {/* Action Link Button */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {notif.actionUrl}
                    </span>
                    <button
                      onClick={() => handleActionClick(notif)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-semibold transition-colors"
                    >
                      Buka Tindakan
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Minimal Footer */}
        <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px]">HortiFlow Activity Radar</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveView('approvals');
                onClose();
              }}
              className="text-[11px] text-slate-700 hover:text-slate-950 font-semibold"
            >
              Meja Persetujuan
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => {
                setActiveView('intake');
                onClose();
              }}
              className="text-[11px] text-slate-700 hover:text-slate-950 font-semibold"
            >
              Intake
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
