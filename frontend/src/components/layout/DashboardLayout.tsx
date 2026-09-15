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
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans antialiased text-slate-800 dark:text-slate-100">
      <div className="flex flex-1 overflow-hidden">
        {/* Responsive Collapsible Sidebar */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />

        {/* Main Content Area with Smooth Padding */}
        <div
          className={`flex-1 flex flex-col min-w-0 overflow-y-auto transition-[padding] duration-300 ease-in-out ${
            isSidebarOpen ? 'md:pl-64' : 'md:pl-0'
          }`}
        >
          {/* Top Header */}
          <Header
            activeView={activeView}
            setActiveView={setActiveView}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
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
