import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  ContentPackage,
  RequestContent,
  AuditLog,
  User,
  LifecycleStatus,
  RiskLevel
} from '../types/index';

// 1. Definisikan bentuk dari Context State & Functions
interface HortiFlowContextType {
  currentUser: User | null;
  packages: ContentPackage[];
  requests: RequestContent[];
  auditLogs: AuditLog[];
  
  // Fungsi Mutasi
  addPackage: (newPackage: Omit<ContentPackage, 'id' | 'tanggalDibuat' | 'createdAt' | 'updatedAt' | 'rowVersion'>) => void;
  updatePackageStatus: (packageId: string, newStatus: LifecycleStatus) => void;
  triageRequest: (requestId: string, assignedRisk: RiskLevel, triageNotes: string) => void;
}

// 2. Buat Context dengan default undefined untuk pengecekan validasi Hook
const HortiFlowContext = createContext<HortiFlowContextType | undefined>(undefined);

// 3. Data Mockup / Dummy (Sistem Informasi Hortikultura)
const MOCK_USER: User = {
  id: 'usr-101',
  username: 'agri_planner',
  fullName: 'Budi Santoso',
  email: 'budi.santoso@pertanian.go.id',
  role: 'PLANNER',
  unitId: 'unit-01',
  unitName: 'Ditjen Hortikultura',
  position: 'Pranata Humas Ahli Muda',
  isActive: true
};

const INITIAL_REQUESTS: RequestContent[] = [
  {
    id: 'req-001',
    ticketNumber: 'TRX-2026-001',
    title: 'Infografis Panduan Budidaya Bawang Merah Off-Season',
    deskripsi: 'Membutuhkan infografis untuk petani terkait teknik budidaya bawang merah di luar musim agar harga stabil.',
    contentType: 'INFOGRAPHIC',
    urgency: 'HIGH',
    riskLevel: 'Medium',
    requesterName: 'Siti Aminah',
    status: 'SUBMITTED',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_PACKAGES: ContentPackage[] = [
  {
    id: 'pkg-001',
    packageNumber: 'PKG-2026-0012',
    title: 'Kampanye Gemar Makan Buah Lokal',
    deskripsi: 'Paket konten edukasi mencakup artikel dan video singkat untuk promosi buah Nusantara.',
    contentType: 'ARTICLE',
    lifecycleStatus: 'Draft',
    riskLevel: 'Low',
    ownerId: 'usr-101',
    ownerName: 'Budi Santoso',
    unitId: 'unit-01',
    unitName: 'Ditjen Hortikultura',
    classification: 'PUBLIC',
    deadline: '2026-10-15T00:00:00.000Z',
    hasBlocker: false,
    nextAction: 'Lengkapi Briefing Konten',
    tags: ['Buah Lokal', 'Edukasi'],
    rowVersion: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_AUDITS: AuditLog[] = [
  {
    id: 'adt-001',
    correlationId: 'corr-1234',
    timestamp: new Date().toISOString(),
    action: 'SYSTEM_STARTUP',
    actorId: 'system',
    actorName: 'System',
    actorRole: 'ADMINISTRATOR',
    targetType: 'system',
    targetId: 'sys-0',
    severity: 'LOW',
    reason: 'Inisialisasi sistem HortiFlow'
  }
];

// 4. Provider Component
export const HortiFlowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser] = useState<User | null>(MOCK_USER);
  const [packages, setPackages] = useState<ContentPackage[]>(INITIAL_PACKAGES);
  const [requests, setRequests] = useState<RequestContent[]>(INITIAL_REQUESTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDITS);

  // Helper function untuk mencatat jejak audit
  const logAuditAction = (action: string, targetType: string, targetId: string, reason?: string) => {
    const newLog: AuditLog = {
      id: `adt-${Date.now()}`,
      correlationId: `corr-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      actorId: currentUser?.id || 'unknown',
      actorName: currentUser?.fullName || 'Unknown',
      actorRole: currentUser?.role || 'PENGUSUL',
      targetType,
      targetId,
      reason,
      severity: 'MEDIUM' // Default severity untuk contoh
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Mutasi: Tambah Paket Konten
  const addPackage = (newPackageData: Omit<ContentPackage, 'id' | 'tanggalDibuat' | 'createdAt' | 'updatedAt' | 'rowVersion'>) => {
    const newId = `pkg-${Date.now()}`;
    const newPackage: ContentPackage = {
      ...newPackageData,
      id: newId,
      rowVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setPackages((prev) => [...prev, newPackage]);
    logAuditAction('PACKAGE_CREATED', 'ContentPackage', newId, 'Pembuatan paket konten baru dari Dashboard');
  };

  // Mutasi: Perbarui Status Publikasi/Lifecycle Paket
  const updatePackageStatus = (packageId: string, newStatus: LifecycleStatus) => {
    setPackages((prev) =>
      prev.map((pkg) => {
        if (pkg.id === packageId) {
          return {
            ...pkg,
            lifecycleStatus: newStatus,
            updatedAt: new Date().toISOString(),
            rowVersion: pkg.rowVersion + 1
          };
        }
        return pkg;
      })
    );
    logAuditAction('STATUS_UPDATED', 'ContentPackage', packageId, `Status diperbarui menjadi ${newStatus}`);
  };

  // Mutasi: Triase Usulan Konten (Menilai Risiko & Menerima Usulan)
  const triageRequest = (requestId: string, assignedRisk: RiskLevel, triageNotes: string) => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            status: 'ACCEPTED',
            riskLevel: assignedRisk,
            triageNotes: triageNotes
          };
        }
        return req;
      })
    );
    logAuditAction('REQUEST_TRIAGED', 'RequestContent', requestId, `Triase selesai: Risiko ditetapkan ke ${assignedRisk}. Catatan: ${triageNotes}`);
  };

  const contextValue: HortiFlowContextType = {
    currentUser,
    packages,
    requests,
    auditLogs,
    addPackage,
    updatePackageStatus,
    triageRequest
  };

  return (
    <HortiFlowContext.Provider value={contextValue}>
      {children}
    </HortiFlowContext.Provider>
  );
};

// 5. Custom Hook dengan Error Handling
export const useHortiFlow = (): HortiFlowContextType => {
  const context = useContext(HortiFlowContext);
  
  if (context === undefined) {
    throw new Error('useHortiFlow harus digunakan di dalam komponen yang dibungkus oleh <HortiFlowProvider>');
  }
  
  return context;
};
