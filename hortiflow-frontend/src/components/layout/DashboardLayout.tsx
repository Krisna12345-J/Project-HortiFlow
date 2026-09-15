import React, { useState } from 'react';
import { Sidebar, ActiveView } from './Sidebar';
import { Header } from './Header';

export interface DashboardLayoutProps {
  children?: React.ReactNode;
  activeView?: ActiveView;
  setActiveView?: (view: ActiveView) => void;
  pageTitle?: string;
  breadcrumb?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeView = 'dashboard',
  setActiveView = (_view: ActiveView) => {},
  pageTitle,
  breadcrumb,
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans antialiased text-slate-800 dark:text-slate-100">
      <div className="flex flex-1 overflow-hidden">
        {/* Responsive Collapsible Sidebar */}
        <Sidebar
          activeView={activeView}
          setActiveView={(view) => {
            setActiveView(view);
            setIsMobileSidebarOpen(false);
          }}
          isOpen={isMobileSidebarOpen}
          setIsOpen={setIsMobileSidebarOpen}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Header */}
          <Header
            activeView={activeView}
            setActiveView={setActiveView}
            onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          />

          {/* Dynamic Page Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {/* Optional Breadcrumb / Page Header bar */}
            {(pageTitle || breadcrumb) && (
              <div className="mb-6">
                {breadcrumb && (
                  <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                    <span>HortiFlow</span>
                    <span>/</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{breadcrumb}</span>
                  </nav>
                )}
                {pageTitle && (
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {pageTitle}
                  </h1>
                )}
              </div>
            )}

            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
