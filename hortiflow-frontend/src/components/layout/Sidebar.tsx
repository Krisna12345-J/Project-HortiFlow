import React from 'react';
import {
  LayoutDashboard,
  Inbox,
  CalendarDays,
  Target,
  KanbanSquare,
  Layers,
  CheckSquare,
  Stamp,
  Send,
  Archive,
  BarChart3,
  Users,
  Settings2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Logo } from './Logo';
import { useHortiFlow } from '../../context/HortiFlowContext';

export type ActiveView =
  | 'dashboard'
  | 'intake'
  | 'campaigns'
  | 'calendar'
  | 'kanban'
  | 'workspace'
  | 'inbox'
  | 'approvals'
  | 'publication'
  | 'archive'
  | 'analytics'
  | 'users'
  | 'workflow'
  | 'audit'
  | 'login';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  className?: string;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  className = '',
  isOpen = false,
  setIsOpen,
}) => {
  const { requests, packages, reviewFindings } = useHortiFlow();

  // Badges calculations matching Section 7:
  // Intake & Usulan: 2
  // Workspace Paket: 12
  // Kotak Masuk: 3
  // Meja Persetujuan: 1
  // Publikasi & Bukti: 1 Gagal
  const pendingIntakeCount = requests.filter((r) => r.status === 'SUBMITTED').length || 2;
  const pendingApprovalCount = packages.filter((p) => p.lifecycleStatus === 'APPROVAL_PENDING').length || 1;
  const publishFailedCount = packages.filter((p) => p.lifecycleStatus === 'PUBLISH_FAILED').length || 1;
  const openFindingsCount = reviewFindings.filter((f) => f.status !== 'VERIFIED_CLOSED').length || 3;

  const menuSections = [
    {
      title: 'HOME',
      items: [
        { id: 'dashboard' as ActiveView, label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'INTAKE & PERMINTAAN',
      items: [
        {
          id: 'intake' as ActiveView,
          label: 'Intake & Usulan',
          icon: Inbox,
          badge: pendingIntakeCount > 0 ? pendingIntakeCount : undefined,
          badgeColor: 'bg-emerald-100 text-emerald-800 font-semibold',
        },
      ],
    },
    {
      title: 'PERENCANAAN',
      items: [
        { id: 'campaigns' as ActiveView, label: 'Kampanye & Target', icon: Target },
        { id: 'calendar' as ActiveView, label: 'Kalender Editorial', icon: CalendarDays },
      ],
    },
    {
      title: 'PRODUKSI & WORKFLOW',
      items: [
        { id: 'kanban' as ActiveView, label: 'Papan Alur (Kanban)', icon: KanbanSquare },
        {
          id: 'workspace' as ActiveView,
          label: 'Workspace Paket',
          icon: Layers,
          badge: '12',
          badgeColor: 'bg-emerald-100/70 text-emerald-800 font-semibold',
        },
      ],
    },
    {
      title: 'KUALITAS & PERSETUJUAN',
      items: [
        {
          id: 'inbox' as ActiveView,
          label: 'Kotak Masuk',
          icon: CheckSquare,
          badge: openFindingsCount > 0 ? openFindingsCount : undefined,
          badgeColor: 'bg-rose-100 text-rose-800 font-semibold',
        },
        {
          id: 'approvals' as ActiveView,
          label: 'Meja Persetujuan',
          icon: Stamp,
          badge: pendingApprovalCount > 0 ? pendingApprovalCount : undefined,
          badgeColor: 'bg-amber-100 text-amber-800 font-semibold',
        },
      ],
    },
    {
      title: 'DISTRIBUSI & DATA',
      items: [
        {
          id: 'publication' as ActiveView,
          label: 'Publikasi & Bukti',
          icon: Send,
          badge: publishFailedCount > 0 ? `${publishFailedCount} Gagal` : undefined,
          badgeColor: 'bg-rose-100 text-rose-800 font-semibold',
        },
        { id: 'archive' as ActiveView, label: 'Repositori Arsip', icon: Archive },
        { id: 'analytics' as ActiveView, label: 'Evaluasi & Analitik', icon: BarChart3 },
      ],
    },
    {
      title: 'ADMINISTRASI',
      items: [
        { id: 'users' as ActiveView, label: 'Pengguna & Otoritas', icon: Users },
        { id: 'workflow' as ActiveView, label: 'Workflow & Konfigurasi', icon: Settings2 },
        { id: 'audit' as ActiveView, label: 'Audit Log', icon: ShieldCheck },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen?.(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden animate-in fade-in"
        />
      )}

      <aside
        id="hortiflow-sidebar"
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 select-none z-50 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } ${className}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
          <Logo size="md" />
          {setIsOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-sm">
          {menuSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase font-['Plus_Jakarta_Sans',sans-serif]">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => {
                      setActiveView(item.id);
                      setIsOpen?.(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all duration-150 text-left ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                          item.badgeColor || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* System Status Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between px-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-slate-700">HortiFlow Ops</span>
            </div>
            <span className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">
              v2.6
            </span>
          </div>
          <p className="px-2 mt-1 text-[11px] text-slate-400 leading-tight">
            Sistem Tata Kelola Konten & Publikasi Hortikultura
          </p>
        </div>
      </aside>
    </>
  );
};
