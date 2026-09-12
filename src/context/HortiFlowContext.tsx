import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Unit,
  Campaign,
  ContentRequest,
  ContentPackage,
  BriefVersion,
  ContentSource,
  Claim,
  NarrativeVersion,
  ChannelVariant,
  DigitalAsset,
  TaskItem,
  ReviewFinding,
  ApprovalManifest,
  ApprovalDelegation,
  PublicationPlan,
  PublicationProof,
  MetricSnapshot,
  ArchivePackage,
  AuditEvent,
  AppNotification,
  LifecycleStatus,
  RiskLevel,
  ContentType,
  ChannelType,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_UNITS,
  INITIAL_CAMPAIGNS,
  INITIAL_REQUESTS,
  INITIAL_PACKAGES,
  INITIAL_BRIEFS,
  INITIAL_SOURCES,
  INITIAL_CLAIMS,
  INITIAL_NARRATIVES,
  INITIAL_VARIANTS,
  INITIAL_ASSETS,
  INITIAL_TASKS,
  INITIAL_REVIEWS,
  INITIAL_MANIFESTS,
  INITIAL_DELEGATIONS,
  INITIAL_PUBLICATION_PLANS,
  INITIAL_METRICS,
  INITIAL_ARCHIVES,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';

interface HortiFlowContextType {
  // Current session
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  units: Unit[];
  campaigns: Campaign[];

  // Packages & Lifecycle
  packages: ContentPackage[];
  selectedPackageId: string | null;
  setSelectedPackageId: (id: string | null) => void;
  updatePackageMetadata: (
    packageId: string,
    updates: Partial<ContentPackage>
  ) => { success: boolean; error?: string };
  transitionLifecycleStatus: (
    packageId: string,
    targetStatus: LifecycleStatus,
    reason?: string
  ) => { success: boolean; error?: string };
  toggleBlocker: (packageId: string, hasBlocker: boolean, reason?: string) => void;

  // Intake & Triage
  requests: ContentRequest[];
  submitContentRequest: (request: Omit<ContentRequest, 'id' | 'ticketNumber' | 'createdAt' | 'status'>) => {
    request: ContentRequest;
    duplicates: { package: ContentPackage; score: number }[];
  };
  triageRequest: (
    requestId: string,
    action: 'ACCEPT' | 'REQUEST_INFO' | 'MERGE' | 'HOLD' | 'REJECT',
    options?: { notes?: string; targetPackageId?: string }
  ) => { success: boolean; createdPackage?: ContentPackage; error?: string };
  respondToClarification: (requestId: string, notes: string) => { success: boolean; error?: string };
  findDuplicates: (title: string, topics: string[]) => { package: ContentPackage; score: number }[];

  // Briefs
  getBriefsForPackage: (packageId: string) => BriefVersion[];
  addBriefVersion: (packageId: string, briefData: Omit<BriefVersion, 'id' | 'packageId' | 'version' | 'createdAt' | 'createdById' | 'createdByName'>) => BriefVersion;

  // Sources & Claims
  getSourcesForPackage: (packageId: string) => ContentSource[];
  addContentSource: (packageId: string, source: Omit<ContentSource, 'id' | 'packageId' | 'createdAt'>) => ContentSource;
  verifySource: (sourceId: string, verified: boolean) => void;
  getClaimsForPackage: (packageId: string) => Claim[];
  addClaim: (packageId: string, claim: Omit<Claim, 'id' | 'packageId' | 'createdAt' | 'isVerified'>) => Claim;
  verifyClaim: (claimId: string, isVerified: boolean) => void;

  // Narratives
  getNarrativesForPackage: (packageId: string) => NarrativeVersion[];
  saveNarrativeVersion: (
    packageId: string,
    title: string,
    body: string,
    changeLog: string,
    linkedClaimIds: string[]
  ) => NarrativeVersion;

  // Variants
  getVariantsForPackage: (packageId: string) => ChannelVariant[];
  saveChannelVariant: (variant: ChannelVariant) => void;
  addChannelVariant: (packageId: string, channel: ChannelType) => ChannelVariant;

  // Assets
  assets: DigitalAsset[];
  getAssetsForPackage: (packageId: string) => DigitalAsset[];
  addAsset: (asset: Omit<DigitalAsset, 'id' | 'createdAt'>) => DigitalAsset;

  // Tasks
  getTasksForPackage: (packageId: string) => TaskItem[];
  addTask: (packageId: string, task: Omit<TaskItem, 'id' | 'packageId' | 'createdAt'>) => TaskItem;
  updateTaskStatus: (taskId: string, status: TaskItem['status']) => void;

  // Reviews
  getReviewsForPackage: (packageId: string) => ReviewFinding[];
  addReviewFinding: (packageId: string, finding: Omit<ReviewFinding, 'id' | 'packageId' | 'createdAt' | 'status'>) => ReviewFinding;
  resolveReviewFinding: (findingId: string) => { success: boolean; error?: string };
  verifyCloseReviewFinding: (findingId: string) => { success: boolean; error?: string };

  // Approvals & Manifest
  getManifestForPackage: (packageId: string) => ApprovalManifest | undefined;
  submitForApproval: (packageId: string) => { success: boolean; manifest?: ApprovalManifest; error?: string };
  executeApprovalDecision: (
    manifestId: string,
    decision: 'APPROVE' | 'REQUEST_CHANGES' | 'HOLD' | 'REJECT',
    reason: string
  ) => { success: boolean; error?: string };
  delegations: ApprovalDelegation[];
  addDelegation: (delegation: Omit<ApprovalDelegation, 'id' | 'isRevoked'>) => void;

  // Publication & Proof
  getPublicationPlansForPackage: (packageId: string) => PublicationPlan[];
  createPublicationPlan: (plan: Omit<PublicationPlan, 'id' | 'retryCount'>) => PublicationPlan;
  recordPublicationProof: (planId: string, proof: Omit<PublicationProof, 'id' | 'planId' | 'recordedById' | 'recordedByName' | 'publishedAt' | 'isTakedown'>) => { success: boolean; error?: string };
  retryPublication: (planId: string) => void;
  takedownPublication: (planId: string, reason: string) => void;

  // Metrics & Archive
  getMetricsForPackage: (packageId: string) => MetricSnapshot[];
  addMetricSnapshot: (snapshot: Omit<MetricSnapshot, 'id' | 'recordedAt'>) => void;
  getArchiveForPackage: (packageId: string) => ArchivePackage | undefined;
  checkArchiveCompleteness: (packageId: string) => { isComplete: boolean; issues: string[] };
  archivePackage: (packageId: string, retentionYears: number) => { success: boolean; error?: string };

  // Audits & Notifications
  auditLogs: AuditEvent[];
  notifications: AppNotification[];
  sendNotification: (
    recipientId: string,
    title: string,
    message: string,
    actionUrl: string,
    category: AppNotification['category']
  ) => void;
  markNotificationRead: (id: string) => void;
  markNotificationUnread: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  resetAllData: () => void;

  // Additional workspace & desk helpers
  reviews: Record<string, ReviewFinding[]>;
  reviewFindings: ReviewFinding[];
  approvalManifests: ApprovalManifest[];
  publicationRecords: PublicationPlan[];
  channels: { id: string; name: string; handleOrUrl: string; characterLimit?: number }[];
  setCurrentUserId: (id: string) => void;
  resetToSeedData: () => void;
  addProductionTask: (packageId: string, task: any) => TaskItem;
  resolveFindingByAuthor: (findingId: string, notes: string) => { success: boolean; error?: string };
  verifyAndCloseFinding: (findingId: string) => { success: boolean; error?: string };
  generateApprovalManifest: (packageId: string) => ApprovalManifest;
  getManifestsForPackage: (packageId: string) => ApprovalManifest[];
  getPublicationsForPackage: (packageId: string) => PublicationPlan[];
}

const HortiFlowContext = createContext<HortiFlowContextType | undefined>(undefined);

let idCounter = 0;
const generateUniqueId = (prefix: string): string => {
  idCounter = (idCounter + 1) % 1000000;
  return `${prefix}-${Date.now()}-${idCounter}-${Math.random().toString(36).substring(2, 8)}`;
};

export const HortiFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or initial
  const [users] = useState<User[]>(INITIAL_USERS);
  const [units] = useState<Unit[]>(INITIAL_UNITS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem('hortiflow_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[1]); // Default Budi Sanjaya (Planner)
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>('pkg-42');

  const [requests, setRequests] = useState<ContentRequest[]>(() => {
    const saved = localStorage.getItem('hortiflow_requests');
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  const [packages, setPackages] = useState<ContentPackage[]>(() => {
    const saved = localStorage.getItem('hortiflow_packages');
    return saved ? JSON.parse(saved) : INITIAL_PACKAGES;
  });

  const [briefs, setBriefs] = useState<Record<string, BriefVersion[]>>(() => {
    const saved = localStorage.getItem('hortiflow_briefs');
    return saved ? JSON.parse(saved) : INITIAL_BRIEFS;
  });

  const [sources, setSources] = useState<Record<string, ContentSource[]>>(() => {
    const saved = localStorage.getItem('hortiflow_sources');
    return saved ? JSON.parse(saved) : INITIAL_SOURCES;
  });

  const [claims, setClaims] = useState<Record<string, Claim[]>>(() => {
    const saved = localStorage.getItem('hortiflow_claims');
    return saved ? JSON.parse(saved) : INITIAL_CLAIMS;
  });

  const [narratives, setNarratives] = useState<Record<string, NarrativeVersion[]>>(() => {
    const saved = localStorage.getItem('hortiflow_narratives');
    return saved ? JSON.parse(saved) : INITIAL_NARRATIVES;
  });

  const [variants, setVariants] = useState<Record<string, ChannelVariant[]>>(() => {
    const saved = localStorage.getItem('hortiflow_variants');
    return saved ? JSON.parse(saved) : INITIAL_VARIANTS;
  });

  const [assets, setAssets] = useState<DigitalAsset[]>(() => {
    const saved = localStorage.getItem('hortiflow_assets');
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [tasks, setTasks] = useState<Record<string, TaskItem[]>>(() => {
    const saved = localStorage.getItem('hortiflow_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [reviews, setReviews] = useState<Record<string, ReviewFinding[]>>(() => {
    const saved = localStorage.getItem('hortiflow_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [manifests, setManifests] = useState<Record<string, ApprovalManifest>>(() => {
    const saved = localStorage.getItem('hortiflow_manifests');
    return saved ? JSON.parse(saved) : INITIAL_MANIFESTS;
  });

  const [delegations, setDelegations] = useState<ApprovalDelegation[]>(() => {
    const saved = localStorage.getItem('hortiflow_delegations');
    return saved ? JSON.parse(saved) : INITIAL_DELEGATIONS;
  });

  const [publicationPlans, setPublicationPlans] = useState<Record<string, PublicationPlan[]>>(() => {
    const saved = localStorage.getItem('hortiflow_pub_plans');
    return saved ? JSON.parse(saved) : INITIAL_PUBLICATION_PLANS;
  });

  const [metrics, setMetrics] = useState<Record<string, MetricSnapshot[]>>(() => {
    const saved = localStorage.getItem('hortiflow_metrics');
    return saved ? JSON.parse(saved) : INITIAL_METRICS;
  });

  const [archives, setArchives] = useState<Record<string, ArchivePackage>>(() => {
    const saved = localStorage.getItem('hortiflow_archives');
    return saved ? JSON.parse(saved) : INITIAL_ARCHIVES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(() => {
    const saved = localStorage.getItem('hortiflow_audits');
    if (!saved) return INITIAL_AUDIT_LOGS;
    try {
      const parsed = JSON.parse(saved) as AuditEvent[];
      const seen = new Set<string>();
      return parsed.map((item, idx) => {
        let id = item.id;
        if (!id || seen.has(id)) {
          id = `aud-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`;
        }
        seen.add(id);
        return { ...item, id };
      });
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('hortiflow_notifications');
    if (!saved) return INITIAL_NOTIFICATIONS;
    try {
      const parsed = JSON.parse(saved) as AppNotification[];
      const seen = new Set<string>();
      return parsed.map((item, idx) => {
        let id = item.id;
        if (!id || seen.has(id)) {
          id = `notif-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`;
        }
        seen.add(id);
        return { ...item, id };
      });
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('hortiflow_packages', JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem('hortiflow_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('hortiflow_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem('hortiflow_briefs', JSON.stringify(briefs));
  }, [briefs]);

  useEffect(() => {
    localStorage.setItem('hortiflow_sources', JSON.stringify(sources));
  }, [sources]);

  useEffect(() => {
    localStorage.setItem('hortiflow_claims', JSON.stringify(claims));
  }, [claims]);

  useEffect(() => {
    localStorage.setItem('hortiflow_narratives', JSON.stringify(narratives));
  }, [narratives]);

  useEffect(() => {
    localStorage.setItem('hortiflow_variants', JSON.stringify(variants));
  }, [variants]);

  useEffect(() => {
    localStorage.setItem('hortiflow_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('hortiflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('hortiflow_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('hortiflow_manifests', JSON.stringify(manifests));
  }, [manifests]);

  useEffect(() => {
    localStorage.setItem('hortiflow_delegations', JSON.stringify(delegations));
  }, [delegations]);

  useEffect(() => {
    localStorage.setItem('hortiflow_pub_plans', JSON.stringify(publicationPlans));
  }, [publicationPlans]);

  useEffect(() => {
    localStorage.setItem('hortiflow_metrics', JSON.stringify(metrics));
  }, [metrics]);

  useEffect(() => {
    localStorage.setItem('hortiflow_archives', JSON.stringify(archives));
  }, [archives]);

  useEffect(() => {
    localStorage.setItem('hortiflow_audits', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('hortiflow_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Helper to log audit
  const logAudit = (action: string, targetType: string, targetId: string, targetTitle?: string, diffDescription?: string, reason?: string) => {
    const newEvent: AuditEvent = {
      id: generateUniqueId('aud'),
      correlationId: `corr-${Math.random().toString(36).substring(2, 9)}`,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action,
      targetType,
      targetId,
      targetTitle,
      diffDescription,
      reason,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newEvent, ...prev]);
  };

  // Helper to trigger notification
  const sendNotification = (recipientId: string, title: string, message: string, actionUrl: string, category: AppNotification['category']) => {
    const newNotif: AppNotification = {
      id: generateUniqueId('notif'),
      recipientId,
      title,
      message,
      actionUrl,
      category,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Duplication Detection Engine
  const findDuplicates = (title: string, topics: string[]): { package: ContentPackage; score: number }[] => {
    const titleTokens = title.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
    const results: { package: ContentPackage; score: number }[] = [];

    packages.forEach((pkg) => {
      const pkgTitleLower = pkg.title.toLowerCase();
      let matchCount = 0;
      titleTokens.forEach((token) => {
        if (pkgTitleLower.includes(token)) matchCount += 1;
      });

      let topicMatch = 0;
      topics.forEach((top) => {
        if (pkg.tags.some((t) => t.toLowerCase() === top.toLowerCase())) topicMatch += 2;
      });

      const totalTokens = titleTokens.length || 1;
      const similarity = (matchCount / totalTokens) * 70 + Math.min(topicMatch * 15, 30);
      const normalizedScore = Math.min(Math.round(similarity), 100);

      if (normalizedScore > 25) {
        results.push({ package: pkg, score: normalizedScore });
      }
    });

    return results.sort((a, b) => b.score - a.score);
  };

  // Submit Content Request
  const submitContentRequest = (requestData: Omit<ContentRequest, 'id' | 'ticketNumber' | 'createdAt' | 'status'>) => {
    const nextSeq = requests.length + 101;
    const ticketNumber = `REQ-2026-${String(nextSeq).padStart(4, '0')}`;
    const newReq: ContentRequest = {
      ...requestData,
      id: `req-${Date.now()}`,
      ticketNumber,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
    };

    setRequests((prev) => [newReq, ...prev]);
    logAudit('INTAKE_REQUEST_SUBMIT', 'content_requests', newReq.id, newReq.title, `Mengajukan permintaan ${ticketNumber}`);

    // Notify planners
    users.filter((u) => u.role === 'PLANNER').forEach((planner) => {
      sendNotification(
        planner.id,
        'Usulan Konten Baru',
        `Permintaan baru ${ticketNumber} diajukan oleh ${requestData.requesterName}: "${newReq.title}"`,
        newReq.id,
        'INTAKE_UPDATE'
      );
    });

    // Notify requester
    sendNotification(
      requestData.requesterId,
      'Usulan Berhasil Dikirim',
      `Tiket ${ticketNumber} ("${newReq.title}") telah masuk ke antrean triase editorial Ditjen Hortikultura.`,
      newReq.id,
      'INTAKE_UPDATE'
    );

    const duplicates = findDuplicates(newReq.title, newReq.topics);
    return { request: newReq, duplicates };
  };

  // Triage Content Request
  const triageRequest = (
    requestId: string,
    action: 'ACCEPT' | 'REQUEST_INFO' | 'MERGE' | 'HOLD' | 'REJECT',
    options?: { notes?: string; targetPackageId?: string }
  ) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return { success: false, error: 'Permintaan tidak ditemukan' };

    if (action === 'ACCEPT') {
      const nextPkgNum = `PKG-2026-${String(packages.length + 42).padStart(4, '0')}`;
      const newPkgId = `pkg-${Date.now()}`;
      const newPkg: ContentPackage = {
        id: newPkgId,
        packageNumber: nextPkgNum,
        requestId: req.id,
        campaignId: req.campaignId,
        campaignName: req.campaignName,
        unitId: req.unitId,
        unitName: req.unitName,
        ownerId: currentUser.id,
        ownerName: currentUser.fullName,
        title: req.title,
        contentType: req.contentType,
        lifecycleStatus: 'TRIAGED',
        riskLevel: req.riskLevel,
        classification: 'INTERNAL',
        deadline: req.requestedDeadline,
        hasBlocker: false,
        nextAction: 'Lengkapi brief editorial dan tetapkan tim produksi',
        tags: req.topics,
        rowVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setPackages((prev) => [newPkg, ...prev]);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: 'ACCEPTED', triageNotes: options?.notes, createdPackageId: newPkgId }
            : r
        )
      );

      // Create default brief v1
      const initialBrief: BriefVersion = {
        id: `brf-${Date.now()}`,
        packageId: newPkgId,
        version: 1,
        angle: req.communicationGoal,
        keyMessages: [req.communicationGoal],
        targetAudience: req.targetAudience,
        targetChannels: ['WEBSITE', 'INSTAGRAM'],
        productionInstructions: `Sumber awal: ${req.initialSources}`,
        callToAction: 'Pelajari lebih lanjut di portal resmi Kementan.',
        classification: 'INTERNAL',
        riskNotes: req.riskLevel === 'HIGH' ? 'Harap verifikasi semua data ke pejabat teknis sebelum persetujuan.' : '',
        createdById: currentUser.id,
        createdByName: currentUser.fullName,
        createdAt: new Date().toISOString(),
      };
      setBriefs((prev) => ({ ...prev, [newPkgId]: [initialBrief] }));

      // Create initial narrative v1
      const initialNarrative: NarrativeVersion = {
        id: `nrv-${Date.now()}`,
        packageId: newPkgId,
        versionNumber: 1,
        title: req.title,
        body: `[DRAF AWAL]\n\n${req.communicationGoal}\n\nTopik Utama: ${req.topics.join(', ')}`,
        summary: 'Draf inisiasi dari intake permintaan konten.',
        checksum: Math.random().toString(36).substring(2),
        changeLog: 'Inisialisasi naskah pasca triase usulan.',
        authorId: currentUser.id,
        authorName: currentUser.fullName,
        linkedClaimIds: [],
        createdAt: new Date().toISOString(),
      };
      setNarratives((prev) => ({ ...prev, [newPkgId]: [initialNarrative] }));

      logAudit('TRIAGE_ACCEPT', 'content_requests', req.id, req.title, `Triase menerima usulan dan membuat Paket Konten ${nextPkgNum}`);
      setSelectedPackageId(newPkgId);
      return { success: true, createdPackage: newPkg };
    }

    if (action === 'MERGE') {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: 'MERGED', triageNotes: `Digabung dengan paket ${options?.targetPackageId}: ${options?.notes}` }
            : r
        )
      );
      logAudit('TRIAGE_MERGE', 'content_requests', req.id, req.title, `Menggabungkan usulan ke paket ${options?.targetPackageId}`);
      return { success: true };
    }

    if (action === 'REJECT') {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status: 'REJECTED', triageNotes: options?.notes } : r
        )
      );
      logAudit('TRIAGE_REJECT', 'content_requests', req.id, req.title, `Menolak usulan: ${options?.notes}`);
      return { success: true };
    }

    if (action === 'REQUEST_INFO') {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status: 'IN_TRIAGE', triageNotes: options?.notes } : r
        )
      );
      sendNotification(req.requesterId, 'Permintaan Informasi Tambahan', `Planner meminta keterangan lebih lanjut untuk ${req.ticketNumber}: ${options?.notes}`, req.id, 'ASSIGNMENT');
      logAudit('TRIAGE_REQUEST_INFO', 'content_requests', req.id, req.title, `Meminta info tambahan: ${options?.notes}`);
      return { success: true };
    }

    if (action === 'HOLD') {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status: 'ON_HOLD', triageNotes: options?.notes } : r
        )
      );
      logAudit('TRIAGE_HOLD', 'content_requests', req.id, req.title, `Menunda usulan: ${options?.notes}`);
      return { success: true };
    }

    return { success: false, error: 'Aksi triase tidak dikenal' };
  };

  const respondToClarification = (requestId: string, notes: string): { success: boolean; error?: string } => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return { success: false, error: 'Permintaan tidak ditemukan' };

    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'SUBMITTED',
              clarificationNotes: notes,
              triageNotes: `Klarifikasi dari pengusul: ${notes}`,
            }
          : r
      )
    );

    // Notify planners
    users
      .filter((u) => u.role === 'PLANNER')
      .forEach((p) => {
        sendNotification(
          p.id,
          'Tanggapan Klarifikasi Usulan',
          `Pengusul ${req.requesterName} telah melampirkan tanggapan untuk tiket ${req.ticketNumber}: "${notes}"`,
          req.id,
          'INTAKE_UPDATE'
        );
      });

    logAudit('INTAKE_CLARIFICATION_PROVIDED', 'content_requests', req.id, req.title, `Pengusul memberikan tanggapan: ${notes}`);
    return { success: true };
  };

  // Update Package Metadata with Optimistic Concurrency Control
  const updatePackageMetadata = (packageId: string, updates: Partial<ContentPackage>) => {
    const pkg = packages.find((p) => p.id === packageId);
    if (!pkg) return { success: false, error: 'Paket konten tidak ditemukan' };

    const updatedPkg: ContentPackage = {
      ...pkg,
      ...updates,
      rowVersion: pkg.rowVersion + 1,
      updatedAt: new Date().toISOString(),
    };

    setPackages((prev) => prev.map((p) => (p.id === packageId ? updatedPkg : p)));
    logAudit('PACKAGE_UPDATE', 'content_packages', packageId, updatedPkg.title, `Pembaruan metadata paket (versi baris: ${updatedPkg.rowVersion})`);
    return { success: true };
  };

  // Lifecycle State Machine Guard Validator
  const transitionLifecycleStatus = (
    packageId: string,
    targetStatus: LifecycleStatus,
    reason?: string
  ): { success: boolean; error?: string } => {
    const pkg = packages.find((p) => p.id === packageId);
    if (!pkg) return { success: false, error: 'Paket konten tidak ditemukan' };

    // GUARD RULES EVALUATION
    if (targetStatus === 'ASSIGNED') {
      const packageBriefs = briefs[packageId] || [];
      if (packageBriefs.length === 0) {
        return { success: false, error: 'GUARD GAGAL: Brief editorial wajib dibuat sebelum paket dapat di-assign ke kreator.' };
      }
    }

    if (targetStatus === 'IN_REVIEW') {
      const packageNarratives = narratives[packageId] || [];
      if (packageNarratives.length === 0) {
        return { success: false, error: 'GUARD GAGAL: Minimal 1 versi narasi konten harus sudah dibuat.' };
      }
      const packageClaims = claims[packageId] || [];
      const unlinkedSources = packageClaims.some((c) => !c.sourceId);
      if (unlinkedSources) {
        return { success: false, error: 'GUARD GAGAL: Semua klaim material wajib terhubung ke sumber bukti yang sah.' };
      }
    }

    if (targetStatus === 'APPROVAL_PENDING') {
      const packageFindings = reviews[packageId] || [];
      const openBlocking = packageFindings.filter(
        (f) => f.severity === 'BLOCKING' && f.status !== 'VERIFIED_CLOSED'
      );
      if (openBlocking.length > 0) {
        return {
          success: false,
          error: `GUARD GAGAL: Terdapat ${openBlocking.length} temuan review berstatus BLOCKING yang belum diverifikasi tutup oleh Reviewer!`,
        };
      }
    }

    if (targetStatus === 'APPROVED') {
      const manifest = manifests[packageId];
      if (!manifest || manifest.status !== 'APPROVED') {
        return { success: false, error: 'GUARD GAGAL: Approval Manifest belum ditandatangani oleh approver yang berwenang.' };
      }
    }

    if (targetStatus === 'SCHEDULED' || targetStatus === 'PUBLISHING') {
      const packageAssets = assets.filter((a) => a.packageId === packageId);
      const expiredOrUnsafe = packageAssets.some(
        (a) => a.status === 'INFECTED' || a.rights.isExpired
      );
      if (expiredOrUnsafe) {
        return { success: false, error: 'GUARD GAGAL: Terdapat aset dengan status terinfeksi atau hak cipta telah kedaluwarsa.' };
      }
    }

    if (targetStatus === 'ARCHIVED') {
      const check = checkArchiveCompleteness(packageId);
      if (!check.isComplete) {
        return { success: false, error: `GUARD GAGAL: Paket belum memenuhi kelengkapan arsip: ${check.issues.join(', ')}` };
      }
    }

    // Determine next action suggestion
    let nextAction = pkg.nextAction;
    if (targetStatus === 'BRIEF_READY') nextAction = 'Tugaskan ke creator/editor untuk mulai produksi';
    else if (targetStatus === 'ASSIGNED') nextAction = 'Creator memulai penulisan draf dan desain aset';
    else if (targetStatus === 'IN_PRODUCTION') nextAction = 'Lengkapi naskah, klaim fakta, dan varian kanal';
    else if (targetStatus === 'IN_REVIEW') nextAction = 'Reviewer melakukan pemeriksaan fakta, editorial, dan mutu';
    else if (targetStatus === 'APPROVAL_PENDING') nextAction = 'Approver meneliti manifest dan memberikan persetujuan';
    else if (targetStatus === 'APPROVED') nextAction = 'Publisher menjadwalkan rencana tayang di kanal terkait';
    else if (targetStatus === 'SCHEDULED') nextAction = 'Menunggu waktu tayang atau rilis manual';
    else if (targetStatus === 'PUBLISHED') nextAction = 'Pantau analitik metrik dan lengkapi arsip';
    else if (targetStatus === 'ARCHIVED') nextAction = 'Tersimpan permanen di repositori arsip';

    const updatedPkg: ContentPackage = {
      ...pkg,
      lifecycleStatus: targetStatus,
      nextAction,
      rowVersion: pkg.rowVersion + 1,
      updatedAt: new Date().toISOString(),
    };

    setPackages((prev) => prev.map((p) => (p.id === packageId ? updatedPkg : p)));
    logAudit(
      'LIFECYCLE_TRANSITION',
      'content_packages',
      packageId,
      pkg.title,
      `Perubahan status: ${pkg.lifecycleStatus} -> ${targetStatus}`,
      reason
    );

    // Send notification tracking workflow status update
    const isApprovalRelated =
      targetStatus === 'APPROVAL_PENDING' ||
      targetStatus === 'APPROVED' ||
      targetStatus === 'CHANGES_REQUESTED';
    sendNotification(
      pkg.ownerId,
      `Status Alur: ${targetStatus}`,
      `Paket ${pkg.packageNumber} ("${pkg.title}") beralih ke status ${targetStatus}.${reason ? ` Catatan: ${reason}` : ''}`,
      pkg.id,
      isApprovalRelated ? 'APPROVAL_REQUEST' : 'WORKFLOW_STATUS'
    );

    return { success: true };
  };

  const toggleBlocker = (packageId: string, hasBlocker: boolean, reason?: string) => {
    const pkg = packages.find((p) => p.id === packageId);
    setPackages((prev) =>
      prev.map((p) =>
        p.id === packageId
          ? {
              ...p,
              hasBlocker,
              blockerReason: hasBlocker ? reason : undefined,
              rowVersion: p.rowVersion + 1,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
    logAudit(
      hasBlocker ? 'BLOCKER_RAISED' : 'BLOCKER_RESOLVED',
      'content_packages',
      packageId,
      undefined,
      hasBlocker ? `Blocker dibuka: ${reason}` : 'Blocker diselesaikan'
    );

    if (pkg) {
      sendNotification(
        pkg.ownerId,
        hasBlocker ? 'Peringatan Kendala (Blocker)!' : 'Kendala Diselesaikan',
        hasBlocker
          ? `Paket ${pkg.packageNumber} ditandai memiliki blocker: ${reason || 'Memerlukan perbaikan segera'}`
          : `Blocker pada paket ${pkg.packageNumber} telah diselesaikan. Alur produksi dapat dilanjutkan.`,
        pkg.id,
        'REVIEW_BLOCKER'
      );
    }
  };

  // Briefs
  const getBriefsForPackage = (packageId: string) => briefs[packageId] || [];
  const addBriefVersion = (
    packageId: string,
    briefData: Omit<BriefVersion, 'id' | 'packageId' | 'version' | 'createdAt' | 'createdById' | 'createdByName'>
  ) => {
    const existing = briefs[packageId] || [];
    const nextVer = existing.length + 1;
    const newBrief: BriefVersion = {
      ...briefData,
      id: `brf-${packageId}-v${nextVer}`,
      packageId,
      version: nextVer,
      createdById: currentUser.id,
      createdByName: currentUser.fullName,
      createdAt: new Date().toISOString(),
    };

    setBriefs((prev) => ({ ...prev, [packageId]: [newBrief, ...existing] }));
    logAudit('BRIEF_VERSION_CREATED', 'briefs', newBrief.id, undefined, `Menyimpan revisi brief versi ${nextVer}`);
    return newBrief;
  };

  // Sources & Claims
  const getSourcesForPackage = (packageId: string) => sources[packageId] || [];
  const addContentSource = (packageId: string, sourceData: Omit<ContentSource, 'id' | 'packageId' | 'createdAt'>) => {
    const existing = sources[packageId] || [];
    const newSrc: ContentSource = {
      ...sourceData,
      id: `src-${Date.now()}`,
      packageId,
      createdAt: new Date().toISOString(),
    };
    setSources((prev) => ({ ...prev, [packageId]: [newSrc, ...existing] }));
    logAudit('SOURCE_ADDED', 'content_sources', newSrc.id, newSrc.title, 'Menambahkan sumber referensi bukti');
    return newSrc;
  };

  const verifySource = (sourceId: string, verified: boolean) => {
    setSources((prev) => {
      const nextState: Record<string, ContentSource[]> = {};
      Object.keys(prev).forEach((pkgId) => {
        nextState[pkgId] = prev[pkgId].map((s) =>
          s.id === sourceId
            ? {
                ...s,
                verified,
                verifiedById: verified ? currentUser.id : undefined,
                verifiedByName: verified ? currentUser.fullName : undefined,
              }
            : s
        );
      });
      return nextState;
    });
    logAudit('SOURCE_VERIFICATION', 'content_sources', sourceId, undefined, `Status verifikasi sumber diubah menjadi: ${verified ? 'TERVERIFIKASI' : 'BELUM'}`);
  };

  const getClaimsForPackage = (packageId: string) => claims[packageId] || [];
  const addClaim = (packageId: string, claimData: Omit<Claim, 'id' | 'packageId' | 'createdAt' | 'isVerified'>) => {
    const existing = claims[packageId] || [];
    const newClaim: Claim = {
      ...claimData,
      id: `clm-${Date.now()}`,
      packageId,
      isVerified: false,
      createdAt: new Date().toISOString(),
    };
    setClaims((prev) => ({ ...prev, [packageId]: [newClaim, ...existing] }));
    logAudit('CLAIM_REGISTERED', 'claims', newClaim.id, newClaim.claimText, 'Mendaftarkan klaim faktual baru');
    return newClaim;
  };

  const verifyClaim = (claimId: string, isVerified: boolean) => {
    setClaims((prev) => {
      const nextState: Record<string, Claim[]> = {};
      Object.keys(prev).forEach((pkgId) => {
        nextState[pkgId] = prev[pkgId].map((c) =>
          c.id === claimId
            ? {
                ...c,
                isVerified,
                verifiedById: isVerified ? currentUser.id : undefined,
                verifiedByName: isVerified ? currentUser.fullName : undefined,
                verifiedAt: isVerified ? new Date().toISOString() : undefined,
              }
            : c
        );
      });
      return nextState;
    });
    logAudit('CLAIM_VERIFIED', 'claims', claimId, undefined, `Verifikasi klaim: ${isVerified ? 'SAH' : 'BELUM TERVERIFIKASI'}`);
  };

  // Narratives
  const getNarrativesForPackage = (packageId: string) => narratives[packageId] || [];
  const saveNarrativeVersion = (
    packageId: string,
    title: string,
    body: string,
    changeLog: string,
    linkedClaimIds: string[]
  ) => {
    const existing = narratives[packageId] || [];
    const nextVer = existing.length + 1;
    const newVersion: NarrativeVersion = {
      id: `nrv-${packageId}-v${nextVer}`,
      packageId,
      versionNumber: nextVer,
      title,
      body,
      summary: body.substring(0, 160) + '...',
      checksum: `sha256-${Math.random().toString(36).substring(2, 12)}`,
      changeLog,
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      linkedClaimIds,
      createdAt: new Date().toISOString(),
    };

    setNarratives((prev) => ({ ...prev, [packageId]: [newVersion, ...existing] }));

    // If an approval manifest existed for previous version, revoke it because content mutated!
    if (manifests[packageId] && manifests[packageId].status === 'PENDING') {
      setManifests((prev) => ({
        ...prev,
        [packageId]: {
          ...prev[packageId],
          status: 'REVOKED_BY_MUTATION',
        },
      }));
      logAudit('APPROVAL_MANIFEST_REVOKED', 'approval_manifests', manifests[packageId].id, undefined, 'Manifest otomatis dibatalkan karena naskah mengalami revisi materiil baru.');
    }

    logAudit('NARRATIVE_VERSION_SAVED', 'content_versions', newVersion.id, title, `Menyimpan naskah versi ${nextVer}: ${changeLog}`);
    return newVersion;
  };

  // Variants
  const getVariantsForPackage = (packageId: string) => variants[packageId] || [];
  const saveChannelVariant = (variant: ChannelVariant) => {
    setVariants((prev) => {
      const existing = prev[variant.packageId] || [];
      const updated = existing.map((v) => (v.id === variant.id ? variant : v));
      return { ...prev, [variant.packageId]: updated };
    });
    logAudit('VARIANT_UPDATED', 'channel_variants', variant.id, variant.channel, `Pembaruan varian kanal ${variant.channel}`);
  };

  const addChannelVariant = (packageId: string, channel: ChannelType) => {
    const newVariant: ChannelVariant = {
      id: generateUniqueId(`var-${packageId}-${channel.toLowerCase()}`),
      packageId,
      channel,
      format: channel === 'INSTAGRAM' ? 'Post Carousel' : channel === 'TIKTOK' ? 'Short Video' : 'Artikel Web',
      aspectRatio: channel === 'TIKTOK' || channel === 'YOUTUBE' ? '9:16' : channel === 'INSTAGRAM' ? '4:5' : 'Standard Text',
      caption: '',
      hashtags: ['HortiFlow', 'KementanRI'],
      callToAction: 'Kunjungi website resmi kami untuk informasi selengkapnya.',
      metadata: {},
      readinessStatus: 'DRAFT',
      updatedAt: new Date().toISOString(),
    };

    setVariants((prev) => ({
      ...prev,
      [packageId]: [...(prev[packageId] || []), newVariant],
    }));
    logAudit('VARIANT_ADDED', 'channel_variants', newVariant.id, channel, `Menambahkan varian kanal baru: ${channel}`);
    return newVariant;
  };

  // Assets
  const getAssetsForPackage = (packageId: string) => assets.filter((a) => a.packageId === packageId);
  const addAsset = (assetData: Omit<DigitalAsset, 'id' | 'createdAt'>) => {
    const newAsset: DigitalAsset = {
      ...assetData,
      id: generateUniqueId('ast'),
      createdAt: new Date().toISOString(),
    };
    setAssets((prev) => [newAsset, ...prev]);
    logAudit('ASSET_UPLOADED', 'assets', newAsset.id, newAsset.title, `Upload aset digital baru (${newAsset.fileType})`);
    return newAsset;
  };

  // Tasks
  const getTasksForPackage = (packageId: string) => tasks[packageId] || [];
  const addTask = (packageId: string, taskData: Omit<TaskItem, 'id' | 'packageId' | 'createdAt'>) => {
    const newTask: TaskItem = {
      ...taskData,
      id: generateUniqueId('tsk'),
      packageId,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => ({ ...prev, [packageId]: [...(prev[packageId] || []), newTask] }));
    sendNotification(newTask.assigneeId, 'Penugasan Baru', `Anda ditugaskan mengerjakan: ${newTask.title}`, packageId, 'ASSIGNMENT');
    logAudit('TASK_CREATED', 'tasks', newTask.id, newTask.title, `Menugaskan kepada ${newTask.assigneeName}`);
    return newTask;
  };

  const updateTaskStatus = (taskId: string, status: TaskItem['status']) => {
    setTasks((prev) => {
      const nextState: Record<string, TaskItem[]> = {};
      Object.keys(prev).forEach((pkgId) => {
        nextState[pkgId] = prev[pkgId].map((t) => (t.id === taskId ? { ...t, status } : t));
      });
      return nextState;
    });
    logAudit('TASK_STATUS_CHANGED', 'tasks', taskId, undefined, `Status tugas diubah menjadi: ${status}`);
  };

  // Reviews
  const getReviewsForPackage = (packageId: string) => reviews[packageId] || [];
  const addReviewFinding = (
    packageId: string,
    findingData: Omit<ReviewFinding, 'id' | 'packageId' | 'createdAt' | 'status'>
  ) => {
    const newFinding: ReviewFinding = {
      ...findingData,
      id: generateUniqueId('fnd'),
      packageId,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => ({ ...prev, [packageId]: [newFinding, ...(prev[packageId] || [])] }));

    const pkg = packages.find((p) => p.id === packageId);
    if (findingData.severity === 'BLOCKING') {
      toggleBlocker(packageId, true, `Temuan Review BLOCKING: ${findingData.comment}`);
      if (pkg) {
        sendNotification(pkg.ownerId, 'Temuan Review BLOCKING!', `Reviewer menemukan blocker: ${findingData.comment}`, packageId, 'REVIEW_BLOCKER');
      }
    }

    logAudit('REVIEW_FINDING_CREATED', 'review_findings', newFinding.id, findingData.category, `Temuan ${findingData.severity}: ${findingData.comment}`);
    return newFinding;
  };

  const resolveReviewFinding = (findingId: string) => {
    setReviews((prev) => {
      const nextState: Record<string, ReviewFinding[]> = {};
      Object.keys(prev).forEach((pkgId) => {
        nextState[pkgId] = prev[pkgId].map((f) =>
          f.id === findingId ? { ...f, status: 'RESOLVED_BY_AUTHOR' } : f
        );
      });
      return nextState;
    });
    logAudit('REVIEW_FINDING_RESOLVED_BY_AUTHOR', 'review_findings', findingId, undefined, 'Kreator menandai perbaikan naskah selesai, menunggu re-check reviewer');
    return { success: true };
  };

  // Strictly only REVIEWER or APPROVER can verify and close finding! (Anti-cheat rule)
  const verifyCloseReviewFinding = (findingId: string) => {
    if (currentUser.role !== 'REVIEWER' && currentUser.role !== 'APPROVER') {
      return { success: false, error: 'KEPATUHAN: Penutupan temuan hanya dapat diverifikasi oleh Reviewer atau Approver yang berwenang!' };
    }

    let resolvedPackageId = '';
    setReviews((prev) => {
      const nextState: Record<string, ReviewFinding[]> = {};
      Object.keys(prev).forEach((pkgId) => {
        nextState[pkgId] = prev[pkgId].map((f) => {
          if (f.id === findingId) {
            resolvedPackageId = pkgId;
            return {
              ...f,
              status: 'VERIFIED_CLOSED',
              verifiedClosedById: currentUser.id,
              verifiedClosedByName: currentUser.fullName,
            };
          }
          return f;
        });
      });
      return nextState;
    });

    if (resolvedPackageId) {
      // Check if all blocking findings are cleared
      const remainingBlocking = (reviews[resolvedPackageId] || []).filter(
        (f) => f.id !== findingId && f.severity === 'BLOCKING' && f.status !== 'VERIFIED_CLOSED'
      );
      if (remainingBlocking.length === 0) {
        toggleBlocker(resolvedPackageId, false);
      }
    }

    logAudit('REVIEW_FINDING_VERIFIED_CLOSED', 'review_findings', findingId, undefined, `Diverifikasi tutup oleh ${currentUser.fullName}`);
    return { success: true };
  };

  // Approval & Separation of Duties
  const getManifestForPackage = (packageId: string) => manifests[packageId];

  const submitForApproval = (packageId: string) => {
    const pkg = packages.find((p) => p.id === packageId);
    if (!pkg) return { success: false, error: 'Paket tidak ditemukan' };

    const packageFindings = reviews[packageId] || [];
    const openBlocking = packageFindings.filter(
      (f) => f.severity === 'BLOCKING' && f.status !== 'VERIFIED_CLOSED'
    );
    if (openBlocking.length > 0) {
      return { success: false, error: `Tidak dapat diajukan: masih ada ${openBlocking.length} temuan review BLOCKING yang belum ditutup!` };
    }

    const packageClaims = claims[packageId] || [];
    const verifiedClaims = packageClaims.filter((c) => c.isVerified);
    const packageNarratives = narratives[packageId] || [];
    const currentVer = packageNarratives[0]?.versionNumber || 1;

    const manifestHash = `SHA256-${Math.random().toString(36).substring(2, 14)}${Math.random().toString(36).substring(2, 14)}`;

    const newManifest: ApprovalManifest = {
      id: `mnf-${packageId}`,
      packageId,
      contentVersionNumber: currentVer,
      manifestHash,
      summaryText: `Snapshot final naskah v${currentVer} dengan ${verifiedClaims.length} klaim terverifikasi bebas temuan blocking.`,
      claimsCount: packageClaims.length,
      verifiedClaimsCount: verifiedClaims.length,
      hasBlockingFindings: false,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    setManifests((prev) => ({ ...prev, [packageId]: newManifest }));
    transitionLifecycleStatus(packageId, 'APPROVAL_PENDING', 'Paket diajukan ke meja persetujuan approver');

    // Notify approvers
    users.filter((u) => u.role === 'APPROVER').forEach((approver) => {
      sendNotification(approver.id, 'Persetujuan Menunggu Tindakan', `Paket ${pkg.packageNumber}: ${pkg.title} siap ditinjau`, packageId, 'APPROVAL_REQUEST');
    });

    logAudit('APPROVAL_MANIFEST_CREATED', 'approval_manifests', newManifest.id, pkg.title, `Membuat Approval Manifest hash ${manifestHash}`);
    return { success: true, manifest: newManifest };
  };

  const executeApprovalDecision = (
    manifestId: string,
    decision: 'APPROVE' | 'REQUEST_CHANGES' | 'HOLD' | 'REJECT',
    reason: string
  ) => {
    const manifest = (Object.values(manifests) as ApprovalManifest[]).find((m) => m.id === manifestId);
    if (!manifest) return { success: false, error: 'Manifest tidak ditemukan' };

    const pkg = packages.find((p) => p.id === manifest.packageId);
    if (!pkg) return { success: false, error: 'Paket konten tidak ditemukan' };

    // SEPARATION OF DUTIES ENFORCEMENT
    // Creator cannot approve their own package unless explicitly LOW risk
    if (currentUser.id === pkg.ownerId && pkg.riskLevel !== 'LOW') {
      return {
        success: false,
        error: `SEPARATION OF DUTIES: Anda tercatat sebagai pemilik/kreator paket dengan tingkat risiko ${pkg.riskLevel}. Anda dilarang memberikan persetujuan final untuk karya sendiri!`,
      };
    }

    // Role check: Admin cannot approve editorial content directly
    if (currentUser.role === 'ADMINISTRATOR') {
      return {
        success: false,
        error: 'SEPARATION OF DUTIES: Administrator teknis dilarang memberikan approval editorial demi integritas kepatuhan.',
      };
    }

    // Cryptographic signature receipt simulation
    const receiptSignature = `HMAC-SHA256:${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}:${currentUser.id}:${Date.now()}`;

    const updatedManifest: ApprovalManifest = {
      ...manifest,
      status: decision === 'APPROVE' ? 'APPROVED' : decision === 'REQUEST_CHANGES' ? 'CHANGES_REQUESTED' : 'REJECTED',
      action: {
        decision,
        approverId: currentUser.id,
        approverName: currentUser.fullName,
        decisionReason: reason,
        receiptSignature,
        decidedAt: new Date().toISOString(),
      },
    };

    setManifests((prev) => ({ ...prev, [manifest.packageId]: updatedManifest }));

    if (decision === 'APPROVE') {
      transitionLifecycleStatus(manifest.packageId, 'APPROVED', `Disetujui oleh ${currentUser.fullName}: ${reason}`);
      sendNotification(pkg.ownerId, 'Paket Konten Disetujui', `Paket ${pkg.packageNumber} telah disetujui untuk publikasi`, manifest.packageId, 'APPROVAL_REQUEST');
    } else if (decision === 'REQUEST_CHANGES') {
      transitionLifecycleStatus(manifest.packageId, 'CHANGES_REQUESTED', `Perubahan diminta oleh ${currentUser.fullName}: ${reason}`);
      sendNotification(pkg.ownerId, 'Perubahan Konten Diminta', `Approver meminta revisi pada ${pkg.packageNumber}: ${reason}`, manifest.packageId, 'APPROVAL_REQUEST');
    } else if (decision === 'REJECT') {
      transitionLifecycleStatus(manifest.packageId, 'WITHDRAWN', `Ditolak oleh approver: ${reason}`);
    }

    logAudit(
      'APPROVAL_ACTION_EXECUTED',
      'approval_manifests',
      manifestId,
      pkg.title,
      `Keputusan ${decision} oleh ${currentUser.fullName}. Receipt: ${receiptSignature}`,
      reason
    );

    return { success: true };
  };

  const addDelegation = (delegationData: Omit<ApprovalDelegation, 'id' | 'isRevoked'>) => {
    const newDel: ApprovalDelegation = {
      ...delegationData,
      id: generateUniqueId('dlg'),
      isRevoked: false,
    };
    setDelegations((prev) => [newDel, ...prev]);
    logAudit('DELEGATION_CREATED', 'approval_delegations', newDel.id, undefined, `Delegasi persetujuan ke ${newDel.delegateeName} (Ceiling: ${newDel.riskCeiling})`);
  };

  // Publication & Proof
  const getPublicationPlansForPackage = (packageId: string) => publicationPlans[packageId] || [];
  const createPublicationPlan = (planData: Omit<PublicationPlan, 'id' | 'retryCount'>) => {
    const newPlan: PublicationPlan = {
      ...planData,
      id: generateUniqueId('pub'),
      retryCount: 0,
    };
    setPublicationPlans((prev) => ({
      ...prev,
      [planData.packageId]: [...(prev[planData.packageId] || []), newPlan],
    }));
    logAudit('PUBLICATION_PLAN_CREATED', 'publication_plans', newPlan.id, newPlan.targetChannel, `Menjadwalkan publikasi pada kanal ${newPlan.targetChannel}`);
    return newPlan;
  };

  const recordPublicationProof = (
    planId: string,
    proofData: Omit<PublicationProof, 'id' | 'planId' | 'recordedById' | 'recordedByName' | 'publishedAt' | 'isTakedown'>
  ) => {
    let pkgIdFound = '';
    setPublicationPlans((prev) => {
      const nextState: Record<string, PublicationPlan[]> = {};
      Object.keys(prev).forEach((pkgId) => {
        nextState[pkgId] = prev[pkgId].map((plan) => {
          if (plan.id === planId) {
            pkgIdFound = pkgId;
            const newProof: PublicationProof = {
              ...proofData,
              id: generateUniqueId('prf'),
              planId,
              recordedById: currentUser.id,
              recordedByName: currentUser.fullName,
              publishedAt: new Date().toISOString(),
              isTakedown: false,
            };
            return {
              ...plan,
              status: 'SUCCESS',
              proof: newProof,
            };
          }
          return plan;
        });
      });
      return nextState;
    });

    if (pkgIdFound) {
      transitionLifecycleStatus(pkgIdFound, 'PUBLISHED', `Publikasi dibuktikan live di ${proofData.liveUrl}`);
      logAudit('PUBLICATION_PROOF_RECORDED', 'publication_proofs', planId, proofData.liveUrl, 'Mencatat bukti publikasi resmi');
    }

    return { success: true };
  };

  const retryPublication = (planId: string) => {
    setPublicationPlans((prev) => {
      const nextState: Record<string, PublicationPlan[]> = {};
      Object.keys(prev).forEach((pkgId) => {
        nextState[pkgId] = prev[pkgId].map((plan) =>
          plan.id === planId ? { ...plan, status: 'SCHEDULED', retryCount: plan.retryCount + 1 } : plan
        );
      });
      return nextState;
    });
    logAudit('PUBLICATION_RETRY', 'publication_plans', planId, undefined, 'Mencoba kembali publikasi pada kanal yang gagal');
  };

  const takedownPublication = (planId: string, reason: string) => {
    let pkgIdFound = '';
    setPublicationPlans((prev) => {
      const nextState: Record<string, PublicationPlan[]> = {};
      Object.keys(prev).forEach((pkgId) => {
        nextState[pkgId] = prev[pkgId].map((plan) => {
          if (plan.id === planId && plan.proof) {
            pkgIdFound = pkgId;
            return {
              ...plan,
              status: 'WITHDRAWN',
              proof: {
                ...plan.proof,
                isTakedown: true,
                takedownReason: reason,
                takedownAt: new Date().toISOString(),
              },
            };
          }
          return plan;
        });
      });
      return nextState;
    });

    if (pkgIdFound) {
      transitionLifecycleStatus(pkgIdFound, 'WITHDRAWN', `Takedown publikasi: ${reason}`);
      logAudit('PUBLICATION_TAKEDOWN', 'publication_plans', planId, undefined, `Penarikan konten dari peredaran publik: ${reason}`, reason);
    }
  };

  // Metrics
  const getMetricsForPackage = (packageId: string) => metrics[packageId] || [];
  const addMetricSnapshot = (snapshotData: Omit<MetricSnapshot, 'id' | 'recordedAt'>) => {
    const newMetric: MetricSnapshot = {
      ...snapshotData,
      id: generateUniqueId('mtr'),
      recordedAt: new Date().toISOString(),
    };
    setMetrics((prev) => ({
      ...prev,
      [snapshotData.packageId]: [newMetric, ...(prev[snapshotData.packageId] || [])],
    }));
    logAudit('METRIC_RECORDED', 'metric_snapshots', newMetric.id, snapshotData.channel, `Pencatatan metrik performa: ${newMetric.reach} jangkauan`);
  };

  // Archives & Completeness Check
  const getArchiveForPackage = (packageId: string) => archives[packageId];
  const checkArchiveCompleteness = (packageId: string): { isComplete: boolean; issues: string[] } => {
    const issues: string[] = [];
    const manifest = manifests[packageId];
    if (!manifest || manifest.status !== 'APPROVED') {
      issues.push('Approval manifest belum ditandatangani');
    }

    const packagePlans = publicationPlans[packageId] || [];
    const hasProof = packagePlans.some((p) => p.status === 'SUCCESS' && p.proof);
    if (!hasProof && packages.find((p) => p.id === packageId)?.lifecycleStatus !== 'WITHDRAWN') {
      issues.push('Belum terdapat bukti publikasi (Publication Proof) yang terverifikasi');
    }

    const packageAssets = assets.filter((a) => a.packageId === packageId);
    const missingRights = packageAssets.some((a) => !a.rights || !a.rights.ownerCopyright);
    if (missingRights) {
      issues.push('Terdapat aset digital yang belum memiliki metadata hak cipta lengkap');
    }

    return {
      isComplete: issues.length === 0,
      issues,
    };
  };

  const archivePackage = (packageId: string, retentionYears: number) => {
    const check = checkArchiveCompleteness(packageId);
    if (!check.isComplete) {
      return { success: false, error: `Kelengkapan arsip gagal: ${check.issues.join(', ')}` };
    }

    const retentionDate = new Date();
    retentionDate.setFullYear(retentionDate.getFullYear() + retentionYears);

    const newArchive: ArchivePackage = {
      id: `arc-${packageId}`,
      packageId,
      archiveCompletenessHash: `SHA256-${Math.random().toString(36).substring(2, 14)}`,
      retentionUntil: retentionDate.toISOString(),
      isLegalHold: false,
      archivedById: currentUser.id,
      archivedByName: currentUser.fullName,
      archivedAt: new Date().toISOString(),
    };

    setArchives((prev) => ({ ...prev, [packageId]: newArchive }));
    transitionLifecycleStatus(packageId, 'ARCHIVED', `Pengarsipan lengkap dengan retensi ${retentionYears} tahun`);
    logAudit('PACKAGE_ARCHIVED', 'archive_packages', newArchive.id, undefined, `Arsip permanen dibuat dengan retensi hingga ${retentionDate.toLocaleDateString('id-ID')}`);
    return { success: true };
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markNotificationUnread = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const resetAllData = () => {
    localStorage.clear();
    setPackages(INITIAL_PACKAGES);
    setRequests(INITIAL_REQUESTS);
    setCampaigns(INITIAL_CAMPAIGNS);
    setBriefs(INITIAL_BRIEFS);
    setSources(INITIAL_SOURCES);
    setClaims(INITIAL_CLAIMS);
    setNarratives(INITIAL_NARRATIVES);
    setVariants(INITIAL_VARIANTS);
    setAssets(INITIAL_ASSETS);
    setTasks(INITIAL_TASKS);
    setReviews(INITIAL_REVIEWS);
    setManifests(INITIAL_MANIFESTS);
    setDelegations(INITIAL_DELEGATIONS);
    setPublicationPlans(INITIAL_PUBLICATION_PLANS);
    setMetrics(INITIAL_METRICS);
    setArchives(INITIAL_ARCHIVES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSelectedPackageId('pkg-42');
  };

  const DEFAULT_CHANNELS = [
    { id: 'ch-web', name: 'Website Portal Resmi Ditjen Hortikultura', handleOrUrl: 'https://hortikultura.pertanian.go.id', characterLimit: 10000 },
    { id: 'ch-ig', name: 'Instagram Resmi @ditjenhorti', handleOrUrl: '@ditjenhorti', characterLimit: 2200 },
    { id: 'ch-fb', name: 'Facebook Fanpage Ditjen Hortikultura', handleOrUrl: 'DitjenHortikulturaKementan', characterLimit: 5000 },
    { id: 'ch-tt', name: 'TikTok Official Ditjen Horti', handleOrUrl: '@hortikultura.kementan', characterLimit: 2200 },
    { id: 'ch-yt', name: 'YouTube Official Channel', handleOrUrl: 'Ditjen Hortikultura Kementan', characterLimit: 5000 },
    { id: 'ch-x', name: 'X / Twitter @ditjenhorti', handleOrUrl: '@ditjenhorti', characterLimit: 280 },
    { id: 'ch-li', name: 'LinkedIn Organisasi', handleOrUrl: 'Direktorat Jenderal Hortikultura', characterLimit: 3000 },
    { id: 'ch-int', name: 'Portal Berita Internal Kementan', handleOrUrl: 'https://intra.kementan.go.id', characterLimit: 10000 },
  ];

  const setCurrentUserId = (id: string) => {
    const found = users.find((u) => u.id === id);
    if (found) setCurrentUser(found);
  };

  const reviewFindings: ReviewFinding[] = (Object.values(reviews) as ReviewFinding[][]).flat();
  const approvalManifests: ApprovalManifest[] = Object.values(manifests) as ApprovalManifest[];
  const publicationRecords: PublicationPlan[] = (Object.values(publicationPlans) as PublicationPlan[][]).flat();

  const getManifestsForPackage = (packageId: string): ApprovalManifest[] => {
    const m = manifests[packageId];
    return m ? [m] : [];
  };

  const getPublicationsForPackage = (packageId: string): PublicationPlan[] => {
    return publicationPlans[packageId] || [];
  };

  const addProductionTask = (packageId: string, task: any) => {
    return addTask(packageId, task);
  };

  const resolveFindingByAuthor = (findingId: string, notes: string) => {
    return resolveReviewFinding(findingId);
  };

  const verifyAndCloseFinding = (findingId: string) => {
    return verifyCloseReviewFinding(findingId);
  };

  const generateApprovalManifest = (packageId: string): ApprovalManifest => {
    const res = submitForApproval(packageId);
    if (res.manifest) return res.manifest;
    return manifests[packageId] || INITIAL_MANIFESTS[packageId];
  };

  return (
    <HortiFlowContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        units,
        campaigns,
        packages,
        selectedPackageId,
        setSelectedPackageId,
        updatePackageMetadata,
        transitionLifecycleStatus,
        toggleBlocker,
        requests,
        submitContentRequest,
        triageRequest,
        findDuplicates,
        getBriefsForPackage,
        addBriefVersion,
        getSourcesForPackage,
        addContentSource,
        verifySource,
        getClaimsForPackage,
        addClaim,
        verifyClaim,
        getNarrativesForPackage,
        saveNarrativeVersion,
        getVariantsForPackage,
        saveChannelVariant,
        addChannelVariant,
        assets,
        getAssetsForPackage,
        addAsset,
        getTasksForPackage,
        addTask,
        updateTaskStatus,
        getReviewsForPackage,
        addReviewFinding,
        resolveReviewFinding,
        verifyCloseReviewFinding,
        getManifestForPackage,
        submitForApproval,
        executeApprovalDecision,
        delegations,
        addDelegation,
        getPublicationPlansForPackage,
        createPublicationPlan,
        recordPublicationProof,
        retryPublication,
        takedownPublication,
        getMetricsForPackage,
        addMetricSnapshot,
        getArchiveForPackage,
        checkArchiveCompleteness,
        archivePackage,
        auditLogs,
        notifications,
        sendNotification,
        markNotificationRead,
        markNotificationUnread,
        deleteNotification,
        clearAllNotifications,
        resetAllData,
        resetToSeedData: resetAllData,
        respondToClarification,
        reviews,
        reviewFindings,
        approvalManifests,
        publicationRecords,
        channels: DEFAULT_CHANNELS,
        setCurrentUserId,
        addProductionTask,
        resolveFindingByAuthor,
        verifyAndCloseFinding,
        generateApprovalManifest,
        getManifestsForPackage,
        getPublicationsForPackage,
      }}
    >
      {children}
    </HortiFlowContext.Provider>
  );
};

export const useHortiFlow = () => {
  const context = useContext(HortiFlowContext);
  if (!context) throw new Error('useHortiFlow must be used within HortiFlowProvider');
  return context;
};
