import React, { useState } from 'react';
import { HortiFlowProvider, useHortiFlow } from './context/HortiFlowContext';
import { Sidebar, ActiveView } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MainDashboard } from './components/dashboard/MainDashboard';
import { IntakeModule } from './components/intake/IntakeModule';
import { CampaignManager } from './components/views/CampaignManager';
import { EditorialCalendar } from './components/views/EditorialCalendar';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { PackageWorkspace } from './components/workspace/PackageWorkspace';
import { ActionInbox } from './components/views/ActionInbox';
import { ApprovalDesk } from './components/views/ApprovalDesk';
import { PublicationHub } from './components/views/PublicationHub';
import { ArchiveRepository } from './components/views/ArchiveRepository';
import { AnalyticsDashboard } from './components/views/AnalyticsDashboard';
import { UsersAuthorities } from './components/views/UsersAuthorities';
import { WorkflowConfig } from './components/views/WorkflowConfig';
import { AuditLogViewer } from './components/views/AuditLogViewer';
import { LoginPage } from './components/auth/LoginPage';
import { IntakeModal } from './components/intake/IntakeModal';

function AppContent() {
  const { isAuthenticated, login } = useHortiFlow();
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    // Default terbuka pada desktop (>= 768px), tertutup pada mobile (< 768px)
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState<boolean>(false);

  // Jika belum terautentikasi (belum login), tampilkan Portal Login Layar Penuh
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={(user) => {
          login(user);
          setActiveView('dashboard');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* 256px Enterprise Navigation Sidebar with Smooth Collapsible Transition */}
      <div className="print:hidden">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
      </div>

      {/* Main Content Area with Smooth Dynamic Padding */}
      <div
        className={`flex-1 flex flex-col min-w-0 print:pl-0 transition-[padding] duration-300 ease-in-out ${
          isSidebarOpen ? 'md:pl-64' : 'md:pl-0'
        }`}
      >
        {/* Global Application Header with Always-Visible Toggle Button */}
        <div className="print:hidden">
          <Header
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
            setActiveView={setActiveView}
            onOpenIntakeModal={() => setIsIntakeModalOpen(true)}
          />
        </div>

        {/* Global Quick Intake Modal */}
        <div className="print:hidden">
          <IntakeModal
            isOpen={isIntakeModalOpen}
            onClose={() => setIsIntakeModalOpen(false)}
            setActiveView={setActiveView}
          />
        </div>

        {/* Dynamic View Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto print:p-0 print:max-w-none">
          {activeView === 'dashboard' && <MainDashboard setActiveView={setActiveView} />}
          {activeView === 'intake' && <IntakeModule setActiveView={setActiveView} />}
          {activeView === 'campaigns' && <CampaignManager setActiveView={setActiveView} />}
          {activeView === 'calendar' && <EditorialCalendar setActiveView={setActiveView} />}
          {activeView === 'kanban' && <KanbanBoard setActiveView={setActiveView} />}
          {activeView === 'workspace' && <PackageWorkspace setActiveView={setActiveView} />}
          {activeView === 'inbox' && <ActionInbox setActiveView={setActiveView} />}
          {activeView === 'approvals' && <ApprovalDesk setActiveView={setActiveView} />}
          {activeView === 'publication' && <PublicationHub setActiveView={setActiveView} />}
          {activeView === 'archive' && <ArchiveRepository setActiveView={setActiveView} />}
          {activeView === 'analytics' && <AnalyticsDashboard setActiveView={setActiveView} />}
          {activeView === 'users' && <UsersAuthorities setActiveView={setActiveView} />}
          {activeView === 'workflow' && <WorkflowConfig setActiveView={setActiveView} />}
          {activeView === 'audit' && <AuditLogViewer setActiveView={setActiveView} />}
          {activeView === 'login' && (
            <LoginPage
              onLoginSuccess={() => setActiveView('dashboard')}
              onCancel={() => setActiveView('dashboard')}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <HortiFlowProvider>
      <AppContent />
    </HortiFlowProvider>
  );
}
