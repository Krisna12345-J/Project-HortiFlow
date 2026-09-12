import React, { useState } from 'react';
import {
  Bell,
  Search,
  PlusCircle,
  RotateCcw,
  Check,
  Shield,
  UserCheck,
  ChevronDown,
  ExternalLink,
  Info,
  Layers,
  Menu,
  LogIn,
} from 'lucide-react';
import { useHortiFlow } from '../../context/HortiFlowContext';
import { ActiveView } from './Sidebar';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { Logo } from './Logo';

interface HeaderProps {
  activeView?: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onOpenIntakeModal?: () => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeView, setActiveView, onOpenIntakeModal, onToggleSidebar }) => {
  const {
    currentUser,
    setCurrentUser,
    users,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    resetAllData,
    setSelectedPackageId,
    packages,
  } = useHortiFlow();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.isRead);

  // Search through packages
  const searchResults = searchQuery.trim()
    ? packages.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.packageNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const handleSelectPackageFromSearch = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    setActiveView('workspace');
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleNotificationClick = (actionUrl: string, notifId: string) => {
    markNotificationRead(notifId);
    setShowNotifMenu(false);
    if (actionUrl.startsWith('pkg-')) {
      setSelectedPackageId(actionUrl);
      setActiveView('workspace');
    } else if (actionUrl.startsWith('req-')) {
      setActiveView('intake');
    }
  };

  return (
    <header
      id="hortiflow-header"
      className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20"
    >
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 -ml-1 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Mobile Brand Logo */}
        <div className="md:hidden flex items-center">
          <Logo size="sm" showSubtitle={false} />
        </div>

        {/* Search Bar */}
        <div className="relative w-64 sm:w-80 md:w-96">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            id="global-package-search"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder="Cari paket konten, nomor PKG, atau topik..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Live Search Popup */}
        {showSearchResults && searchQuery.trim() && (
          <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50">
            <div className="p-2 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase">
              Hasil Pencarian ({searchResults.length})
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
              {searchResults.length === 0 ? (
                <div className="p-3 text-xs text-slate-500 text-center">
                  Tidak ada paket konten yang sesuai.
                </div>
              ) : (
                searchResults.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => handleSelectPackageFromSearch(pkg.id)}
                    className="w-full text-left p-2.5 hover:bg-slate-50 transition-colors flex items-start gap-2.5"
                  >
                    <Layers className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-slate-600">{pkg.packageNumber}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded font-medium">
                          {pkg.lifecycleStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 line-clamp-1 font-medium mt-0.5">{pkg.title}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
            <button
              onClick={() => setShowSearchResults(false)}
              className="w-full py-1.5 text-center text-xs text-slate-500 bg-slate-50 hover:bg-slate-100 border-t border-slate-100"
            >
              Tutup
            </button>
          </div>
        )}
        </div>
      </div>

      {/* Right Actions: Quick Intake, Notifications, User/Role Switcher */}
      <div className="flex items-center gap-2.5">
        {/* Quick Intake Button */}
        <button
          id="btn-quick-intake"
          onClick={() => {
            if (onOpenIntakeModal) {
              onOpenIntakeModal();
            } else {
              setActiveView('intake');
            }
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Ajukan Konten</span>
        </button>

        {/* Notification Center Trigger & Component */}
        <div className="relative">
          <button
            id="btn-notifications"
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="Pusat Notifikasi & Tenggat"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          <NotificationCenter
            isOpen={showNotifMenu}
            onClose={() => setShowNotifMenu(false)}
            setActiveView={setActiveView}
          />
        </div>

        {/* Demo Data Reset Button */}
        <button
          onClick={() => {
            if (window.confirm('Reset seluruh data HORTIFLOW ke nilai awal sistem?')) {
              resetAllData();
            }
          }}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Reset Data Percobaan"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-slate-200"></div>

        {/* Role & User Switcher (Critical for Separation of Duties testing) */}
        <div className="relative">
          <button
            id="btn-user-role-switcher"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 pl-2 hover:bg-slate-100 rounded-lg border border-slate-200/80 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {currentUser?.fullName || 'Pengguna'}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded">
                  {currentUser?.role || 'USER'}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[110px]">
                  {currentUser?.unitName ? currentUser.unitName.split(' ')[0] : 'Hortikultura'}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {/* User & Role Switcher Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-2 border-b border-slate-100 mb-1">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Simulasi Otoritas (RBAC)
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Ganti profil pengguna untuk menguji batasan wewenang dan Separation of Duties.
                </p>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-1">
                {users.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                        isCurrent
                          ? 'bg-emerald-50 text-emerald-900 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          {u.fullName}
                          {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <span className="px-1 py-0.2 rounded bg-slate-100 font-mono font-bold text-slate-700">
                            {u.role}
                          </span>
                          <span>• {u.position}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100">
                <button
                  id="btn-goto-login-page"
                  onClick={() => {
                    setActiveView('login');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Buka Halaman Masuk (Portal SSO)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
