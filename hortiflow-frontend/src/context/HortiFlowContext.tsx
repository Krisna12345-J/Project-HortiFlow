import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
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
  ChannelType,
  ApprovalDecisionType,
  UserRole,
  AuditSeverity,
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
import {
  generateUUIDv4,
  generateAuditCorrelationId,
  computeAuditIntegrityHash,
  getAuditSeverity,
} from '../utils/auditUtils';

// Stable default communication channels configuration
export const DEFAULT_CHANNELS = [
  { id: 'ch-web', name: 'Website Portal Resmi Ditjen Hortikultura', handleOrUrl: 'https://hortikultura.pertanian.go.id', characterLimit: 10000 },
  { id: 'ch-ig', name: 'Instagram Resmi @ditjenhorti', handleOrUrl: '@ditjenhorti', characterLimit: 2200 },
  { id: 'ch-fb', name: 'Facebook Fanpage Ditjen Hortikultura', handleOrUrl: 'DitjenHortikulturaKementan', characterLimit: 5000 },
  { id: 'ch-tt', name: 'TikTok Official Ditjen Horti', handleOrUrl: '@hortikultura.kementan', characterLimit: 2200 },
  { id: 'ch-yt', name: 'YouTube Official Channel', handleOrUrl: 'Ditjen Hortikultura Kementan', characterLimit: 5000 },
  { id: 'ch-x', name: 'X / Twitter @ditjenhorti', handleOrUrl: '@ditjenhorti', characterLimit: 280 },
  { id: 'ch-li', name: 'LinkedIn Organisasi', handleOrUrl: 'Direktorat Jenderal Hortikultura', characterLimit: 3000 },
  { id: 'ch-int', name: 'Portal Berita Internal Kementan', handleOrUrl: 'https://intra.kementan.go.id', characterLimit: 10000 },
];

// Unique ID generator with entropy and monotonic counter to avoid collisions
let idCounter = 0;
export const generateUniqueId = (prefix: string): string => {
  idCounter = (idCounter + 1) % 1000000;
  return `${prefix}-${Date.now()}-${idCounter}-${Math.random().toString(36).substring(2, 8)}`;
};

/* =========================================================================
   1. STATIC / CONFIG CONTEXT TYPE (Rarely changes: User Session, Master Data)
   ========================================================================= */
export interface StaticConfigContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  setCurrentUserId: (id: string) => void;
  users: User[];
  units: Unit[];
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  delegations: ApprovalDelegation[];
  addDelegation: (delegation: Omit<ApprovalDelegation, 'id' | 'isRevoked'>) => void;
  revokeDelegation: (delegationId: string, reason: string) => { success: boolean; correlationId?: string; error?: string };
  updateUserRole: (userId: string, newRole: UserRole, reason: string) => { success: boolean; correlationId?: string; error?: string };
  updateUserStatus: (userId: string, isActive: boolean, reason: string) => { success: boolean; correlationId?: string; error?: string };
  channels: { id: string; name: string; handleOrUrl: string; characterLimit?: number }[];
  resetAllData: () => void;
  resetToSeedData: () => void;
  exportDataSnapshot: () => string;
  restoreDataSnapshot: (jsonStr: string) => boolean;
}

/* =========================================================================
   2. CONTENT DATA CONTEXT TYPE (Core Editorial Domain State & Lifecycle Engine)
   ========================================================================= */
export interface ContentDataContextType {
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
  briefs: Record<string, BriefVersion[]>;
  getBriefsForPackage: (packageId: string) => BriefVersion[];
  addBriefVersion: (
    packageId: string,
    briefData: Omit<BriefVersion, 'id' | 'packageId' | 'version' | 'createdAt' | 'createdById' | 'createdByName'>
  ) => BriefVersion;

  // Sources & Claims
  sources: Record<string, ContentSource[]>;
  getSourcesForPackage: (packageId: string) => ContentSource[];
  addContentSource: (packageId: string, source: Omit<ContentSource, 'id' | 'packageId' | 'createdAt'>) => ContentSource;
  verifySource: (sourceId: string, verified: boolean) => void;
  claims: Record<string, Claim[]>;
  getClaimsForPackage: (packageId: string) => Claim[];
  addClaim: (packageId: string, claim: Omit<Claim, 'id' | 'packageId' | 'createdAt' | 'isVerified'>) => Claim;
  verifyClaim: (claimId: string, isVerified: boolean) => void;

  // Narratives
  narratives: Record<string, NarrativeVersion[]>;
  getNarrativesForPackage: (packageId: string) => NarrativeVersion[];
  saveNarrativeVersion: (
    packageId: string,
    title: string,
    body: string,
    changeLog: string,
    linkedClaimIds: string[]
  ) => NarrativeVersion;

  // Variants
  variants: Record<string, ChannelVariant[]>;
  getVariantsForPackage: (packageId: string) => ChannelVariant[];
  saveChannelVariant: (packageIdOrVariant: any, maybeVariant?: any) => ChannelVariant;
  addChannelVariant: (packageId: string, channel: ChannelType) => ChannelVariant;

  // Assets
  assets: DigitalAsset[];
  getAssetsForPackage: (packageId: string) => DigitalAsset[];
  addAsset: (asset: Omit<DigitalAsset, 'id' | 'createdAt'>) => DigitalAsset;
  addDigitalAsset: (packageIdOrAsset: any, maybeAsset?: any) => DigitalAsset;

  // Tasks
  tasks: Record<string, TaskItem[]>;
  getTasksForPackage: (packageId: string) => TaskItem[];
  addTask: (packageId: string, task: Omit<TaskItem, 'id' | 'packageId' | 'createdAt'>) => TaskItem;
  addProductionTask: (packageId: string, task: any) => TaskItem;
  updateTaskStatus: (taskId: string, status: TaskItem['status']) => void;

  // Reviews
  reviews: Record<string, ReviewFinding[]>;
  reviewFindings: ReviewFinding[];
  getReviewsForPackage: (packageId: string) => ReviewFinding[];
  addReviewFinding: (packageId: string, finding: any) => ReviewFinding;
  resolveReviewFinding: (findingId: string, notes?: string) => { success: boolean; error?: string };
  resolveFindingByAuthor: (findingId: string, notes?: string) => { success: boolean; error?: string };
  verifyCloseReviewFinding: (findingId: string) => { success: boolean; error?: string };
  verifyAndCloseFinding: (findingId: string) => { success: boolean; error?: string };

  // Approvals & Manifests
  manifests: Record<string, ApprovalManifest>;
  approvalManifests: ApprovalManifest[];
  getManifestForPackage: (packageId: string) => ApprovalManifest | undefined;
  getManifestsForPackage: (packageId: string) => ApprovalManifest[];
  generateApprovalManifest: (packageId: string) => ApprovalManifest;
  submitForApproval: (packageId: string) => { success: boolean; manifest?: ApprovalManifest; error?: string };
  executeApprovalDecision: (
    manifestIdOrPkgId: string,
    decision: 'APPROVE' | 'APPROVED' | 'REQUEST_CHANGES' | 'HOLD' | 'REJECT' | 'REJECTED' | ApprovalDecisionType,
    reason: string
  ) => { success: boolean; error?: string };

  // Publication & Proof
  publicationPlans: Record<string, PublicationPlan[]>;
  publicationRecords: PublicationPlan[];
  getPublicationPlansForPackage: (packageId: string) => PublicationPlan[];
  getPublicationsForPackage: (packageId: string) => PublicationPlan[];
  createPublicationPlan: (plan: Omit<PublicationPlan, 'id' | 'retryCount'>) => PublicationPlan;
  recordPublicationProof: (
    packageIdOrPlanId: string,
    proof: any
  ) => { success: boolean; error?: string };
  retryPublication: (planId: string) => { success: boolean; error?: string };
  takedownPublication: (planId: string, reason: string) => { success: boolean; error?: string };

  // Metrics & Archive
  metrics: Record<string, MetricSnapshot[]>;
  getMetricsForPackage: (packageId: string) => MetricSnapshot[];
  addMetricSnapshot: (packageIdOrSnapshot: any, maybeSnapshot?: any) => void;
  archives: Record<string, ArchivePackage>;
  getArchiveForPackage: (packageId: string) => ArchivePackage | undefined;
  checkArchiveCompleteness: (packageId: string) => { isComplete: boolean; issues: string[] };
  archivePackage: (packageId: string, retentionYears: number) => { success: boolean; error?: string };
}

/* =========================================================================
   3. LIVE ACTIVITY CONTEXT TYPE (Frequently updated: Notifications & Audit Trail)
   ========================================================================= */
export interface LiveActivityContextType {
  notifications: AppNotification[];
  unreadNotificationsCount: number;
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
  auditLogs: AuditEvent[];
  logAudit: (
    action: string,
    targetType: string,
    targetId: string,
    targetTitle?: string,
    diffDescription?: string,
    reason?: string,
    packageId?: string,
    customCorrelationId?: string,
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    metadata?: Record<string, any>
  ) => AuditEvent;
}

/* =========================================================================
   4. UNIFIED CONTEXT TYPE (Union for 100% backward compatibility)
   ========================================================================= */
export type HortiFlowContextType = StaticConfigContextType &
  ContentDataContextType &
  LiveActivityContextType;

// React Context instances
export const StaticConfigContext = createContext<StaticConfigContextType | undefined>(undefined);
export const ContentDataContext = createContext<ContentDataContextType | undefined>(undefined);
export const LiveActivityContext = createContext<LiveActivityContextType | undefined>(undefined);
export const HortiFlowContext = createContext<HortiFlowContextType | undefined>(undefined);

// Safe local storage helper to guard against corrupted or mismatched schema in browser cache
function safeLoadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved || saved === 'undefined' || saved === 'null') return fallback;
    const parsed = JSON.parse(saved);
    if (parsed === null || parsed === undefined) return fallback;
    if (Array.isArray(fallback)) {
      if (!Array.isArray(parsed)) return fallback;
      return parsed as T;
    }
    if (typeof fallback === 'object' && !Array.isArray(fallback)) {
      if (typeof parsed !== 'object' || Array.isArray(parsed)) return fallback;
      return parsed as T;
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}

/* =========================================================================
   HORTIFLOW PROVIDER IMPLEMENTATION
   ========================================================================= */
export const HortiFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // -------------------------------------------------------------
  // A. STATIC / CONFIG STATE
  // -------------------------------------------------------------
  const [users, setUsers] = useState<User[]>(() => safeLoadFromStorage('hortiflow_users', INITIAL_USERS));
  const [units] = useState<Unit[]>(INITIAL_UNITS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => safeLoadFromStorage('hortiflow_campaigns', INITIAL_CAMPAIGNS));
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const loadedUsers = safeLoadFromStorage('hortiflow_users', INITIAL_USERS);
    return loadedUsers[1] || INITIAL_USERS[1];
  });
  const [delegations, setDelegations] = useState<ApprovalDelegation[]>(() => safeLoadFromStorage('hortiflow_delegations', INITIAL_DELEGATIONS));

  // -------------------------------------------------------------
  // B. CONTENT LIFECYCLE DOMAIN STATE
  // -------------------------------------------------------------
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>('pkg-42');

  const [packages, setPackages] = useState<ContentPackage[]>(() => safeLoadFromStorage('hortiflow_packages', INITIAL_PACKAGES));
  const [requests, setRequests] = useState<ContentRequest[]>(() => safeLoadFromStorage('hortiflow_requests', INITIAL_REQUESTS));
  const [briefs, setBriefs] = useState<Record<string, BriefVersion[]>>(() => safeLoadFromStorage('hortiflow_briefs', INITIAL_BRIEFS));
  const [sources, setSources] = useState<Record<string, ContentSource[]>>(() => safeLoadFromStorage('hortiflow_sources', INITIAL_SOURCES));
  const [claims, setClaims] = useState<Record<string, Claim[]>>(() => safeLoadFromStorage('hortiflow_claims', INITIAL_CLAIMS));
  const [narratives, setNarratives] = useState<Record<string, NarrativeVersion[]>>(() => safeLoadFromStorage('hortiflow_narratives', INITIAL_NARRATIVES));
  const [variants, setVariants] = useState<Record<string, ChannelVariant[]>>(() => safeLoadFromStorage('hortiflow_variants', INITIAL_VARIANTS));
  const [assets, setAssets] = useState<DigitalAsset[]>(() => safeLoadFromStorage('hortiflow_assets', INITIAL_ASSETS));
  const [tasks, setTasks] = useState<Record<string, TaskItem[]>>(() => safeLoadFromStorage('hortiflow_tasks', INITIAL_TASKS));
  const [reviews, setReviews] = useState<Record<string, ReviewFinding[]>>(() => safeLoadFromStorage('hortiflow_reviews', INITIAL_REVIEWS));
  const [manifests, setManifests] = useState<Record<string, ApprovalManifest>>(() => safeLoadFromStorage('hortiflow_manifests', INITIAL_MANIFESTS));
  const [publicationPlans, setPublicationPlans] = useState<Record<string, PublicationPlan[]>>(() => safeLoadFromStorage('hortiflow_pub_plans', INITIAL_PUBLICATION_PLANS));
  const [metrics, setMetrics] = useState<Record<string, MetricSnapshot[]>>(() => safeLoadFromStorage('hortiflow_metrics', INITIAL_METRICS));
  const [archives, setArchives] = useState<Record<string, ArchivePackage>>(() => safeLoadFromStorage('hortiflow_archives', INITIAL_ARCHIVES));

  // -------------------------------------------------------------
  // C. LIVE ACTIVITY STATE (Audits & Notifications)
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // D. STABLE REFS TO PREVENT HANDLER RE-CREATIONS
  // -------------------------------------------------------------
  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const packagesRef = useRef(packages);
  useEffect(() => {
    packagesRef.current = packages;
  }, [packages]);

  const requestsRef = useRef(requests);
  useEffect(() => {
    requestsRef.current = requests;
  }, [requests]);

  const briefsRef = useRef(briefs);
  useEffect(() => {
    briefsRef.current = briefs;
  }, [briefs]);

  const sourcesRef = useRef(sources);
  useEffect(() => {
    sourcesRef.current = sources;
  }, [sources]);

  const claimsRef = useRef(claims);
  useEffect(() => {
    claimsRef.current = claims;
  }, [claims]);

  const narrativesRef = useRef(narratives);
  useEffect(() => {
    narrativesRef.current = narratives;
  }, [narratives]);

  const variantsRef = useRef(variants);
  useEffect(() => {
    variantsRef.current = variants;
  }, [variants]);

  const assetsRef = useRef(assets);
  useEffect(() => {
    assetsRef.current = assets;
  }, [assets]);

  const tasksRef = useRef(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const reviewsRef = useRef(reviews);
  useEffect(() => {
    reviewsRef.current = reviews;
  }, [reviews]);

  const manifestsRef = useRef(manifests);
  useEffect(() => {
    manifestsRef.current = manifests;
  }, [manifests]);

  const publicationPlansRef = useRef(publicationPlans);
  useEffect(() => {
    publicationPlansRef.current = publicationPlans;
  }, [publicationPlans]);

  const usersRef = useRef(users);
  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  // -------------------------------------------------------------
  // E. LOCAL STORAGE SYNCHRONIZATION
  // -------------------------------------------------------------
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
    localStorage.setItem('hortiflow_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('hortiflow_audits', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('hortiflow_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // -------------------------------------------------------------
  // F. MEMOIZED LIVE ACTIVITY HANDLERS
  // -------------------------------------------------------------
  const logAudit = useCallback(
    (
      action: string,
      targetType: string,
      targetId: string,
      targetTitle?: string,
      diffDescription?: string,
      reason?: string,
      packageId?: string,
      customCorrelationId?: string,
      severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
      metadata?: Record<string, any>
    ): AuditEvent => {
      const user = currentUserRef.current;
      const correlationId = customCorrelationId || generateUUIDv4();
      const timestamp = new Date().toISOString();
      const ipAddress =
        user.role === 'APPROVER'
          ? '10.24.11.2'
          : user.role === 'ADMINISTRATOR' || user.role === 'PLANNER'
          ? '10.24.12.8'
          : '10.24.12.15';
      const resolvedSeverity = severity || getAuditSeverity(action);
      const integrityHash = computeAuditIntegrityHash(
        correlationId,
        timestamp,
        user.id,
        action,
        targetId,
        reason || ''
      );

      const newEvent: AuditEvent = {
        id: generateUniqueId('aud'),
        correlationId,
        actorId: user.id,
        actorName: user.fullName,
        actorRole: user.role,
        action,
        targetType,
        targetId,
        targetTitle,
        diffDescription,
        reason,
        timestamp,
        ipAddress,
        packageId,
        severity: resolvedSeverity,
        integrityHash,
        metadata,
      };

      // Append-only guarantee: strictly prepends without mutating or destroying previous records
      setAuditLogs((prev) => [newEvent, ...prev]);
      return newEvent;
    },
    []
  );

  const sendNotification = useCallback(
    (
      recipientId: string,
      title: string,
      message: string,
      actionUrl: string,
      category: AppNotification['category']
    ) => {
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
    },
    []
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }, []);

  const markNotificationUnread = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  // -------------------------------------------------------------
  // G. MEMOIZED STATIC CONFIG HANDLERS
  // -------------------------------------------------------------
  const setCurrentUserId = useCallback(
    (id: string) => {
      const found = usersRef.current.find((u) => u.id === id);
      if (found) setCurrentUser(found);
    },
    []
  );

  const addDelegation = useCallback(
    (delegationData: Omit<ApprovalDelegation, 'id' | 'isRevoked'>) => {
      const newDel: ApprovalDelegation = {
        ...delegationData,
        id: generateUniqueId('dlg'),
        isRevoked: false,
      };
      setDelegations((prev) => [newDel, ...prev]);
      logAudit(
        'DELEGATION_CREATED',
        'approval_delegations',
        newDel.id,
        `Delegasi untuk ${newDel.delegateeName}`,
        `Pemberian delegasi persetujuan ke ${newDel.delegateeName} (Ceiling risiko: ${newDel.riskCeiling})`,
        `Delegasi wewenang aktif s/d ${newDel.endDate}`
      );
    },
    [logAudit]
  );

  const revokeDelegation = useCallback(
    (delegationId: string, reason: string) => {
      const target = delegations.find((d) => d.id === delegationId);
      if (!target) return { success: false, error: 'Data delegasi tidak ditemukan' };
      if (!reason || !reason.trim()) {
        return { success: false, error: 'Alasan pencabutan delegasi wewenang wajib diisi untuk integritas audit.' };
      }

      setDelegations((prev) =>
        prev.map((d) => (d.id === delegationId ? { ...d, isRevoked: true } : d))
      );

      const auditEntry = logAudit(
        'DELEGATION_REVOKED',
        'approval_delegations',
        delegationId,
        `Delegasi untuk ${target.delegateeName}`,
        `Pencabutan wewenang delegasi persetujuan dari ${target.delegateeName} (Ceiling: ${target.riskCeiling}). Alasan: ${reason}`,
        reason,
        undefined,
        undefined,
        'HIGH',
        {
          delegationId,
          delegatorId: target.delegatorId,
          delegateeId: target.delegateeId,
          revocationReason: reason,
        }
      );

      return { success: true, correlationId: auditEntry.correlationId };
    },
    [delegations, logAudit]
  );

  const updateUserRole = useCallback(
    (userId: string, newRole: UserRole, reason: string) => {
      const admin = currentUserRef.current;
      if (!reason || !reason.trim()) {
        return {
          success: false,
          error: 'Alasan administratif dan nomor referensi SK/penugasan wajib diisi untuk kepatuhan audit RBAC.',
        };
      }

      const targetUser = usersRef.current.find((u) => u.id === userId);
      if (!targetUser) return { success: false, error: 'Pengguna tidak ditemukan.' };

      const oldRole = targetUser.role;
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );

      if (currentUser.id === userId) {
        setCurrentUser((prev) => ({ ...prev, role: newRole }));
      }

      const auditEntry = logAudit(
        'RBAC_ROLE_CHANGED',
        'users',
        userId,
        targetUser.fullName,
        `Perubahan hak akses peran RBAC: ${targetUser.fullName} dialihkan dari [${oldRole}] menjadi [${newRole}]. Alasan: ${reason}`,
        reason,
        undefined,
        undefined,
        'CRITICAL',
        {
          modifiedUserId: userId,
          targetUsername: targetUser.username,
          oldRole,
          newRole,
          modifiedByAdminId: admin.id,
          adminName: admin.fullName,
          justification: reason,
        }
      );

      return { success: true, correlationId: auditEntry.correlationId };
    },
    [currentUser.id, logAudit]
  );

  const updateUserStatus = useCallback(
    (userId: string, isActive: boolean, reason: string) => {
      const admin = currentUserRef.current;
      if (!reason || !reason.trim()) {
        return {
          success: false,
          error: 'Alasan administratif wajib diisi untuk modifikasi status akun pengguna.',
        };
      }

      const targetUser = usersRef.current.find((u) => u.id === userId);
      if (!targetUser) return { success: false, error: 'Pengguna tidak ditemukan.' };

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive } : u))
      );

      const auditEntry = logAudit(
        'RBAC_STATUS_CHANGED',
        'users',
        userId,
        targetUser.fullName,
        `Status otorisasi akun ${targetUser.fullName} diubah menjadi: [${isActive ? 'AKTIF' : 'DINONAKTIFKAN (SUSPENDED)'}]. Alasan: ${reason}`,
        reason,
        undefined,
        undefined,
        'CRITICAL',
        {
          modifiedUserId: userId,
          isActive,
          adminId: admin.id,
          adminName: admin.fullName,
          justification: reason,
        }
      );

      return { success: true, correlationId: auditEntry.correlationId };
    },
    [logAudit]
  );

  const resetAllData = useCallback(() => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
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
  }, []);

  const exportDataSnapshot = useCallback(() => {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        system: 'HORTIFLOW Editorial Operating System',
        version: '2.6',
        packages: packagesRef.current,
        requests: requestsRef.current,
        campaigns,
        briefs: briefsRef.current,
        sources: sourcesRef.current,
        claims: claimsRef.current,
        narratives: narrativesRef.current,
        variants: variantsRef.current,
        assets: assetsRef.current,
        tasks: tasksRef.current,
        reviews: reviewsRef.current,
        manifests: manifestsRef.current,
        delegations,
        publicationPlans: publicationPlansRef.current,
      },
      null,
      2
    );
  }, [campaigns, delegations]);

  const restoreDataSnapshot = useCallback((jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.packages) setPackages(parsed.packages);
      if (parsed.requests) setRequests(parsed.requests);
      if (parsed.campaigns) setCampaigns(parsed.campaigns);
      if (parsed.briefs) setBriefs(parsed.briefs);
      if (parsed.sources) setSources(parsed.sources);
      if (parsed.claims) setClaims(parsed.claims);
      if (parsed.narratives) setNarratives(parsed.narratives);
      if (parsed.variants) setVariants(parsed.variants);
      if (parsed.assets) setAssets(parsed.assets);
      if (parsed.tasks) setTasks(parsed.tasks);
      if (parsed.reviews) setReviews(parsed.reviews);
      if (parsed.manifests) setManifests(parsed.manifests);
      if (parsed.delegations) setDelegations(parsed.delegations);
      if (parsed.publicationPlans) setPublicationPlans(parsed.publicationPlans);
      return true;
    } catch (err) {
      console.error('Gagal memulihkan snapshot data HORTIFLOW:', err);
      return false;
    }
  }, []);

  // -------------------------------------------------------------
  // H. MEMOIZED CONTENT DATA & LIFECYCLE HANDLERS
  // -------------------------------------------------------------

  // Duplication Engine
  const findDuplicates = useCallback(
    (title: string, topics: string[]): { package: ContentPackage; score: number }[] => {
      const titleTokens = title.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
      const results: { package: ContentPackage; score: number }[] = [];

      packagesRef.current.forEach((pkg) => {
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
    },
    []
  );

  // Submit Content Request
  const submitContentRequest = useCallback(
    (requestData: Omit<ContentRequest, 'id' | 'ticketNumber' | 'createdAt' | 'status'>) => {
      const nextSeq = requestsRef.current.length + 101;
      const ticketNumber = `REQ-2026-${String(nextSeq).padStart(4, '0')}`;
      const newReq: ContentRequest = {
        ...requestData,
        id: generateUniqueId('req'),
        ticketNumber,
        status: 'SUBMITTED',
        createdAt: new Date().toISOString(),
      };

      setRequests((prev) => [newReq, ...prev]);
      logAudit(
        'INTAKE_REQUEST_SUBMIT',
        'content_requests',
        newReq.id,
        newReq.title,
        `Mengajukan permintaan ${ticketNumber}`
      );

      // Notify planners
      usersRef.current
        .filter((u) => u.role === 'PLANNER')
        .forEach((planner) => {
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
    },
    [findDuplicates, logAudit, sendNotification]
  );

  // Triage Content Request
  const triageRequest = useCallback(
    (
      requestId: string,
      action: 'ACCEPT' | 'REQUEST_INFO' | 'MERGE' | 'HOLD' | 'REJECT',
      options?: { notes?: string; targetPackageId?: string }
    ) => {
      const req = requestsRef.current.find((r) => r.id === requestId);
      if (!req) return { success: false, error: 'Permintaan tidak ditemukan' };
      const user = currentUserRef.current;

      const isRetriage = req.status !== 'SUBMITTED';
      const priorStatus = req.status;

      if (action === 'ACCEPT') {
        const nextPkgNum = `PKG-2026-${String(packagesRef.current.length + 42).padStart(4, '0')}`;
        const newPkgId = generateUniqueId('pkg');
        const newPkg: ContentPackage = {
          id: newPkgId,
          packageNumber: nextPkgNum,
          requestId: req.id,
          campaignId: req.campaignId,
          campaignName: req.campaignName,
          unitId: req.unitId,
          unitName: req.unitName,
          ownerId: user.id,
          ownerName: user.fullName,
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

        // Initial Brief v1
        const initialBrief: BriefVersion = {
          id: generateUniqueId(`brf-${newPkgId}`),
          packageId: newPkgId,
          version: 1,
          angle: req.communicationGoal,
          keyMessages: [req.communicationGoal],
          targetAudience: req.targetAudience,
          targetChannels: ['WEBSITE', 'INSTAGRAM'],
          productionInstructions: `Sumber awal: ${req.initialSources}`,
          callToAction: 'Pelajari lebih lanjut di portal resmi Kementan.',
          classification: 'INTERNAL',
          riskNotes:
            req.riskLevel === 'HIGH'
              ? 'Harap verifikasi semua data ke pejabat teknis sebelum persetujuan.'
              : '',
          createdById: user.id,
          createdByName: user.fullName,
          createdAt: new Date().toISOString(),
        };
        setBriefs((prev) => ({ ...prev, [newPkgId]: [initialBrief] }));

        // Initial Narrative v1
        const initialNarrative: NarrativeVersion = {
          id: generateUniqueId(`nrv-${newPkgId}`),
          packageId: newPkgId,
          versionNumber: 1,
          title: req.title,
          body: `[DRAF AWAL]\n\n${req.communicationGoal}\n\nTopik Utama: ${req.topics.join(', ')}`,
          summary: 'Draf inisiasi dari intake permintaan konten.',
          checksum: Math.random().toString(36).substring(2),
          changeLog: 'Inisialisasi naskah pasca triase usulan.',
          authorId: user.id,
          authorName: user.fullName,
          linkedClaimIds: [],
          createdAt: new Date().toISOString(),
        };
        setNarratives((prev) => ({ ...prev, [newPkgId]: [initialNarrative] }));

        const audit = logAudit(
          isRetriage ? 'TRIAGE_RETRIAGE' : 'TRIAGE_ACCEPT',
          'content_requests',
          req.id,
          req.title,
          isRetriage
            ? `Triase Ulang (Re-Triage) usulan [${req.ticketNumber}] dari status [${priorStatus}] menjadi [ACCEPTED]. Paket diterbitkan: ${nextPkgNum}. Catatan: ${options?.notes || '-'}`
            : `Triase usulan [${req.ticketNumber}] diterima dan menerbitkan Paket Konten ${nextPkgNum}`,
          options?.notes,
          newPkgId,
          undefined,
          isRetriage ? 'HIGH' : 'MEDIUM',
          {
            ticketNumber: req.ticketNumber,
            isRetriage,
            priorStatus,
            newStatus: 'ACCEPTED',
            createdPackageId: newPkgId,
          }
        );
        setSelectedPackageId(newPkgId);
        return { success: true, createdPackage: newPkg, correlationId: audit.correlationId };
      }

      if (action === 'MERGE') {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  status: 'MERGED',
                  triageNotes: `Digabung dengan paket ${options?.targetPackageId}: ${options?.notes}`,
                }
              : r
          )
        );
        const audit = logAudit(
          isRetriage ? 'TRIAGE_RETRIAGE' : 'TRIAGE_MERGE',
          'content_requests',
          req.id,
          req.title,
          isRetriage
            ? `Triase Ulang (Re-Triage): Penggabungan usulan [${req.ticketNumber}] (status sebelumnya [${priorStatus}]) ke paket sasaran ${options?.targetPackageId}`
            : `Menggabungkan usulan [${req.ticketNumber}] ke paket ${options?.targetPackageId}`,
          options?.notes,
          options?.targetPackageId,
          undefined,
          'HIGH',
          {
            ticketNumber: req.ticketNumber,
            isRetriage,
            priorStatus,
            newStatus: 'MERGED',
            targetPackageId: options?.targetPackageId,
          }
        );
        return { success: true, correlationId: audit.correlationId };
      }

      if (action === 'REJECT') {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === requestId ? { ...r, status: 'REJECTED', triageNotes: options?.notes } : r
          )
        );
        const audit = logAudit(
          isRetriage ? 'TRIAGE_RETRIAGE' : 'TRIAGE_REJECT',
          'content_requests',
          req.id,
          req.title,
          isRetriage
            ? `Triase Ulang (Re-Triage): Penolakan usulan [${req.ticketNumber}] (status sebelumnya [${priorStatus}]). Alasan: ${options?.notes}`
            : `Menolak usulan [${req.ticketNumber}]: ${options?.notes}`,
          options?.notes,
          undefined,
          undefined,
          'HIGH',
          {
            ticketNumber: req.ticketNumber,
            isRetriage,
            priorStatus,
            newStatus: 'REJECTED',
          }
        );
        return { success: true, correlationId: audit.correlationId };
      }

      if (action === 'REQUEST_INFO') {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === requestId ? { ...r, status: 'IN_TRIAGE', triageNotes: options?.notes } : r
          )
        );
        sendNotification(
          req.requesterId,
          'Permintaan Informasi Tambahan',
          `Planner meminta keterangan lebih lanjut untuk ${req.ticketNumber}: ${options?.notes}`,
          req.id,
          'ASSIGNMENT'
        );
        const audit = logAudit(
          isRetriage ? 'TRIAGE_RETRIAGE' : 'TRIAGE_REQUEST_INFO',
          'content_requests',
          req.id,
          req.title,
          isRetriage
            ? `Triase Ulang (Re-Triage): Permintaan klarifikasi lanjutan untuk [${req.ticketNumber}] (status sebelumnya [${priorStatus}]): ${options?.notes}`
            : `Meminta info tambahan untuk [${req.ticketNumber}]: ${options?.notes}`,
          options?.notes,
          undefined,
          undefined,
          'MEDIUM',
          {
            ticketNumber: req.ticketNumber,
            isRetriage,
            priorStatus,
            newStatus: 'IN_TRIAGE',
          }
        );
        return { success: true, correlationId: audit.correlationId };
      }

      if (action === 'HOLD') {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === requestId ? { ...r, status: 'ON_HOLD', triageNotes: options?.notes } : r
          )
        );
        const audit = logAudit(
          isRetriage ? 'TRIAGE_RETRIAGE' : 'TRIAGE_HOLD',
          'content_requests',
          req.id,
          req.title,
          isRetriage
            ? `Triase Ulang (Re-Triage): Penundaan sementara usulan [${req.ticketNumber}] (status sebelumnya [${priorStatus}]). Alasan: ${options?.notes}`
            : `Menunda usulan [${req.ticketNumber}]: ${options?.notes}`,
          options?.notes,
          undefined,
          undefined,
          'MEDIUM',
          {
            ticketNumber: req.ticketNumber,
            isRetriage,
            priorStatus,
            newStatus: 'ON_HOLD',
          }
        );
        return { success: true, correlationId: audit.correlationId };
      }

      return { success: false, error: 'Aksi triase tidak dikenal' };
    },
    [logAudit, sendNotification]
  );

  const respondToClarification = useCallback(
    (requestId: string, notes: string): { success: boolean; error?: string } => {
      const req = requestsRef.current.find((r) => r.id === requestId);
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

      usersRef.current
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

      logAudit(
        'INTAKE_CLARIFICATION_PROVIDED',
        'content_requests',
        req.id,
        req.title,
        `Pengusul memberikan tanggapan: ${notes}`
      );
      return { success: true };
    },
    [logAudit, sendNotification]
  );

  // Update Package Metadata
  const updatePackageMetadata = useCallback(
    (packageId: string, updates: Partial<ContentPackage>) => {
      const pkg = packagesRef.current.find((p) => p.id === packageId);
      if (!pkg) return { success: false, error: 'Paket konten tidak ditemukan' };

      const updatedPkg: ContentPackage = {
        ...pkg,
        ...updates,
        rowVersion: pkg.rowVersion + 1,
        updatedAt: new Date().toISOString(),
      };

      setPackages((prev) => prev.map((p) => (p.id === packageId ? updatedPkg : p)));
      logAudit(
        'PACKAGE_UPDATE',
        'content_packages',
        packageId,
        updatedPkg.title,
        `Pembaruan metadata paket (versi baris: ${updatedPkg.rowVersion})`
      );
      return { success: true };
    },
    [logAudit]
  );

  // Completeness Checker for Archive
  const checkArchiveCompleteness = useCallback((packageId: string) => {
    const issues: string[] = [];
    const manifest = manifestsRef.current[packageId];
    if (!manifest || manifest.status !== 'APPROVED') {
      issues.push('Approval manifest belum ditandatangani');
    }

    const packagePlans = publicationPlansRef.current[packageId] || [];
    const hasProof = packagePlans.some((p) => p.status === 'SUCCESS' && p.proof);
    const targetPkg = packagesRef.current.find((p) => p.id === packageId);
    if (!hasProof && targetPkg?.lifecycleStatus !== 'WITHDRAWN') {
      issues.push('Belum terdapat bukti publikasi (Publication Proof) yang terverifikasi');
    }

    const packageAssets = assetsRef.current.filter((a) => a.packageId === packageId);
    const missingRights = packageAssets.some((a) => !a.rights || !a.rights.ownerCopyright);
    if (missingRights) {
      issues.push('Terdapat aset digital yang belum memiliki metadata hak cipta lengkap');
    }

    return {
      isComplete: issues.length === 0,
      issues,
    };
  }, []);

  // Lifecycle State Machine Transition
  const transitionLifecycleStatus = useCallback(
    (
      packageId: string,
      targetStatus: LifecycleStatus,
      reason?: string
    ): { success: boolean; error?: string } => {
      const pkg = packagesRef.current.find((p) => p.id === packageId);
      if (!pkg) return { success: false, error: 'Paket konten tidak ditemukan' };

      // GUARD RULES EVALUATION
      if (targetStatus === 'ASSIGNED') {
        const packageBriefs = briefsRef.current[packageId] || [];
        if (packageBriefs.length === 0) {
          return {
            success: false,
            error: 'GUARD GAGAL: Brief editorial wajib dibuat sebelum paket dapat di-assign ke kreator.',
          };
        }
      }

      if (targetStatus === 'IN_REVIEW') {
        const packageNarratives = narrativesRef.current[packageId] || [];
        if (packageNarratives.length === 0) {
          return {
            success: false,
            error: 'GUARD GAGAL: Minimal 1 versi narasi konten harus sudah dibuat.',
          };
        }
        const packageClaims = claimsRef.current[packageId] || [];
        const unlinkedSources = packageClaims.some((c) => !c.sourceId);
        if (unlinkedSources) {
          return {
            success: false,
            error: 'GUARD GAGAL: Semua klaim material wajib terhubung ke sumber bukti yang sah.',
          };
        }
      }

      if (targetStatus === 'APPROVAL_PENDING') {
        const packageFindings = reviewsRef.current[packageId] || [];
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
        const manifest = manifestsRef.current[packageId];
        if (!manifest || manifest.status !== 'APPROVED') {
          return {
            success: false,
            error: 'GUARD GAGAL: Approval Manifest belum ditandatangani oleh approver yang berwenang.',
          };
        }
      }

      if (targetStatus === 'SCHEDULED' || targetStatus === 'PUBLISHING') {
        const packageAssets = assetsRef.current.filter((a) => a.packageId === packageId);
        const expiredOrUnsafe = packageAssets.some(
          (a) => a.status === 'INFECTED' || a.rights.isExpired
        );
        if (expiredOrUnsafe) {
          return {
            success: false,
            error: 'GUARD GAGAL: Terdapat aset dengan status terinfeksi atau hak cipta telah kedaluwarsa.',
          };
        }
      }

      if (targetStatus === 'ARCHIVED') {
        const check = checkArchiveCompleteness(packageId);
        if (!check.isComplete) {
          return {
            success: false,
            error: `GUARD GAGAL: Paket belum memenuhi kelengkapan arsip: ${check.issues.join(', ')}`,
          };
        }
      }

      // Next Action Suggestion Text
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
    },
    [checkArchiveCompleteness, logAudit, sendNotification]
  );

  const toggleBlocker = useCallback(
    (packageId: string, hasBlocker: boolean, reason?: string) => {
      const pkg = packagesRef.current.find((p) => p.id === packageId);
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
    },
    [logAudit, sendNotification]
  );

  // Brief Handlers
  const getBriefsForPackage = useCallback((packageId: string) => briefsRef.current[packageId] || [], []);
  const addBriefVersion = useCallback(
    (
      packageId: string,
      briefData: Omit<BriefVersion, 'id' | 'packageId' | 'version' | 'createdAt' | 'createdById' | 'createdByName'>
    ) => {
      const user = currentUserRef.current;
      const existing = briefsRef.current[packageId] || [];
      const nextVer = existing.length + 1;
      const newBrief: BriefVersion = {
        ...briefData,
        id: generateUniqueId(`brf-${packageId}-v${nextVer}`),
        packageId,
        version: nextVer,
        createdById: user.id,
        createdByName: user.fullName,
        createdAt: new Date().toISOString(),
      };

      setBriefs((prev) => ({ ...prev, [packageId]: [newBrief, ...(prev[packageId] || [])] }));
      logAudit(
        'BRIEF_VERSION_CREATED',
        'briefs',
        newBrief.id,
        undefined,
        `Menyimpan revisi brief versi ${nextVer}`
      );
      return newBrief;
    },
    [logAudit]
  );

  // Sources & Claims Handlers
  const getSourcesForPackage = useCallback((packageId: string) => sourcesRef.current[packageId] || [], []);
  const addContentSource = useCallback(
    (packageId: string, sourceData: Omit<ContentSource, 'id' | 'packageId' | 'createdAt'>) => {
      const newSrc: ContentSource = {
        ...sourceData,
        id: generateUniqueId('src'),
        packageId,
        createdAt: new Date().toISOString(),
      };
      setSources((prev) => ({ ...prev, [packageId]: [newSrc, ...(prev[packageId] || [])] }));
      logAudit('SOURCE_ADDED', 'content_sources', newSrc.id, newSrc.title, 'Menambahkan sumber referensi bukti');
      return newSrc;
    },
    [logAudit]
  );

  const verifySource = useCallback(
    (sourceId: string, verified: boolean) => {
      const user = currentUserRef.current;
      setSources((prev) => {
        const nextState: Record<string, ContentSource[]> = {};
        Object.keys(prev).forEach((pkgId) => {
          nextState[pkgId] = prev[pkgId].map((s) =>
            s.id === sourceId
              ? {
                  ...s,
                  verified,
                  verifiedById: verified ? user.id : undefined,
                  verifiedByName: verified ? user.fullName : undefined,
                }
              : s
          );
        });
        return nextState;
      });
      logAudit(
        'SOURCE_VERIFICATION',
        'content_sources',
        sourceId,
        undefined,
        `Status verifikasi sumber diubah menjadi: ${verified ? 'TERVERIFIKASI' : 'BELUM'}`
      );
    },
    [logAudit]
  );

  const getClaimsForPackage = useCallback((packageId: string) => claimsRef.current[packageId] || [], []);
  const addClaim = useCallback(
    (packageId: string, claimData: Omit<Claim, 'id' | 'packageId' | 'createdAt' | 'isVerified'>) => {
      const newClaim: Claim = {
        ...claimData,
        id: generateUniqueId('clm'),
        packageId,
        isVerified: false,
        createdAt: new Date().toISOString(),
      };
      setClaims((prev) => ({ ...prev, [packageId]: [newClaim, ...(prev[packageId] || [])] }));
      logAudit('CLAIM_REGISTERED', 'claims', newClaim.id, newClaim.claimText, 'Mendaftarkan klaim faktual baru');
      return newClaim;
    },
    [logAudit]
  );

  const verifyClaim = useCallback(
    (claimId: string, isVerified: boolean) => {
      const user = currentUserRef.current;
      setClaims((prev) => {
        const nextState: Record<string, Claim[]> = {};
        Object.keys(prev).forEach((pkgId) => {
          nextState[pkgId] = prev[pkgId].map((c) =>
            c.id === claimId
              ? {
                  ...c,
                  isVerified,
                  verifiedById: isVerified ? user.id : undefined,
                  verifiedByName: isVerified ? user.fullName : undefined,
                  verifiedAt: isVerified ? new Date().toISOString() : undefined,
                }
              : c
          );
        });
        return nextState;
      });
      logAudit(
        'CLAIM_VERIFIED',
        'claims',
        claimId,
        undefined,
        `Verifikasi klaim: ${isVerified ? 'SAH' : 'BELUM TERVERIFIKASI'}`
      );
    },
    [logAudit]
  );

  // Narratives Handlers
  const getNarrativesForPackage = useCallback((packageId: string) => narrativesRef.current[packageId] || [], []);
  const saveNarrativeVersion = useCallback(
    (
      packageId: string,
      title: string,
      body: string,
      changeLog: string,
      linkedClaimIds: string[]
    ) => {
      const user = currentUserRef.current;
      const existing = narrativesRef.current[packageId] || [];
      const nextVer = existing.length + 1;
      const newVersion: NarrativeVersion = {
        id: generateUniqueId(`nrv-${packageId}-v${nextVer}`),
        packageId,
        versionNumber: nextVer,
        title,
        body,
        summary: body.substring(0, 160) + '...',
        checksum: `sha256-${Math.random().toString(36).substring(2, 12)}`,
        changeLog,
        authorId: user.id,
        authorName: user.fullName,
        linkedClaimIds,
        createdAt: new Date().toISOString(),
      };

      setNarratives((prev) => ({ ...prev, [packageId]: [newVersion, ...(prev[packageId] || [])] }));

      // Revoke pending approval manifest on content mutation
      if (manifestsRef.current[packageId] && manifestsRef.current[packageId].status === 'PENDING') {
        setManifests((prev) => ({
          ...prev,
          [packageId]: {
            ...prev[packageId],
            status: 'REVOKED_BY_MUTATION',
          },
        }));
        logAudit(
          'APPROVAL_MANIFEST_REVOKED',
          'approval_manifests',
          manifestsRef.current[packageId].id,
          undefined,
          'Manifest otomatis dibatalkan karena naskah mengalami revisi materiil baru.'
        );
      }

      logAudit('NARRATIVE_VERSION_SAVED', 'content_versions', newVersion.id, title, `Menyimpan naskah versi ${nextVer}: ${changeLog}`);
      return newVersion;
    },
    [logAudit]
  );

  // Variants Handlers
  const getVariantsForPackage = useCallback((packageId: string) => variantsRef.current[packageId] || [], []);
  const saveChannelVariant = useCallback(
    (packageIdOrVariant: any, maybeVariant?: any): ChannelVariant => {
      let pkgId = '';
      let data: any = {};
      if (typeof packageIdOrVariant === 'string') {
        pkgId = packageIdOrVariant;
        data = maybeVariant || {};
      } else {
        data = packageIdOrVariant || {};
        pkgId = data.packageId;
      }

      const varId = data.id || generateUniqueId(`var-${pkgId}-${(data.channel || 'web').toLowerCase()}`);
      const updatedVariant: ChannelVariant = {
        id: varId,
        packageId: pkgId,
        channel: data.channel || 'WEBSITE',
        title: data.title || '',
        format: data.format || data.formatSpecification || 'Standard Post',
        aspectRatio: data.aspectRatio || 'Standard Text',
        caption: data.caption || '',
        hashtags: data.hashtags || [],
        callToAction: data.callToAction || '',
        metadata: data.metadata || { assetIds: data.assignedAssetIds || [] },
        readinessStatus: data.readinessStatus || 'DRAFT',
        updatedAt: new Date().toISOString(),
        assignedAssetIds: data.assignedAssetIds,
      };

      setVariants((prev) => {
        const existing = prev[pkgId] || [];
        const index = existing.findIndex((v) => v.id === varId);
        let updated: ChannelVariant[];
        if (index >= 0) {
          updated = existing.map((v) => (v.id === varId ? updatedVariant : v));
        } else {
          updated = [...existing, updatedVariant];
        }
        return { ...prev, [pkgId]: updated };
      });

      logAudit('VARIANT_UPDATED', 'channel_variants', varId, updatedVariant.channel, `Pembaruan varian kanal ${updatedVariant.channel}`);
      return updatedVariant;
    },
    [logAudit]
  );

  const addChannelVariant = useCallback(
    (packageId: string, channel: ChannelType) => {
      const newVariant: ChannelVariant = {
        id: generateUniqueId(`var-${packageId}-${channel.toLowerCase()}`),
        packageId,
        channel,
        format:
          channel === 'INSTAGRAM'
            ? 'Post Carousel'
            : channel === 'TIKTOK'
            ? 'Short Video'
            : 'Artikel Web',
        aspectRatio:
          channel === 'TIKTOK' || channel === 'YOUTUBE'
            ? '9:16'
            : channel === 'INSTAGRAM'
            ? '4:5'
            : 'Standard Text',
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
    },
    [logAudit]
  );

  // Assets Handlers
  const getAssetsForPackage = useCallback(
    (packageId: string) => (assetsRef.current || []).filter((a) => a && a.packageId === packageId),
    []
  );

  const addAsset = useCallback(
    (assetData: Omit<DigitalAsset, 'id' | 'createdAt'>) => {
      const newAsset: DigitalAsset = {
        ...assetData,
        id: generateUniqueId('ast'),
        createdAt: new Date().toISOString(),
      };
      setAssets((prev) => [newAsset, ...prev]);
      logAudit('ASSET_UPLOADED', 'assets', newAsset.id, newAsset.title, `Upload aset digital baru (${newAsset.fileType})`);
      return newAsset;
    },
    [logAudit]
  );

  const addDigitalAsset = useCallback(
    (packageIdOrAsset: any, maybeAsset?: any): DigitalAsset => {
      let pkgId: string | undefined = undefined;
      let assetData: any = {};
      if (typeof packageIdOrAsset === 'string') {
        pkgId = packageIdOrAsset;
        assetData = maybeAsset || {};
      } else {
        assetData = packageIdOrAsset || {};
        pkgId = assetData.packageId;
      }

      const user = currentUserRef.current;
      const newAsset: DigitalAsset = {
        id: generateUniqueId('ast'),
        packageId: pkgId,
        title: assetData.title || assetData.fileName || 'Aset Digital Tanpa Judul',
        fileType: assetData.fileType || assetData.assetType || 'IMAGE',
        mimeType: assetData.mimeType || 'image/jpeg',
        fileSize: typeof assetData.fileSize === 'number' ? assetData.fileSize : 1024 * 1024 * 2,
        storageKey: assetData.storageKey || `assets/${pkgId || 'misc'}/${Date.now()}`,
        previewUrl:
          assetData.previewUrl ||
          'https://images.unsplash.com/photo-1592417817098-8f3d6eb22533?w=800&auto=format&fit=crop&q=80',
        checksumSha256: assetData.checksumSha256 || `SHA256-${Math.random().toString(36).substring(2, 14).toUpperCase()}`,
        altText: assetData.altText || '',
        caption: assetData.caption || '',
        status: assetData.status || 'SAFE',
        classification: assetData.classification || 'INTERNAL',
        uploadedById: user.id,
        uploadedByName: user.fullName,
        createdAt: new Date().toISOString(),
        rights: assetData.rights || {
          ownerCopyright: assetData.copyrightOwner || 'Kementerian Pertanian RI',
          licenseType: assetData.licenseType || 'GOVERNMENT_PUBLIC_DOMAIN',
          attributionRequired: Boolean(assetData.attributionText),
          attributionText: assetData.attributionText || '',
          permittedChannels: 'ALL',
          isExpired: false,
        },
        assetType: assetData.assetType || assetData.fileType || 'IMAGE',
        fileName: assetData.fileName || assetData.title,
        scanStatus: 'CLEAN',
        licenseType: assetData.licenseType,
      };

      setAssets((prev) => [newAsset, ...prev]);
      logAudit('ASSET_UPLOADED', 'assets', newAsset.id, newAsset.title, `Upload aset digital baru (${newAsset.fileType})`);
      return newAsset;
    },
    [logAudit]
  );

  // Tasks Handlers
  const getTasksForPackage = useCallback((packageId: string) => tasksRef.current[packageId] || [], []);
  const addTask = useCallback(
    (packageId: string, taskData: Omit<TaskItem, 'id' | 'packageId' | 'createdAt'>) => {
      const newTask: TaskItem = {
        ...taskData,
        id: generateUniqueId('tsk'),
        packageId,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => ({ ...prev, [packageId]: [...(prev[packageId] || []), newTask] }));
      sendNotification(
        newTask.assigneeId,
        'Penugasan Baru',
        `Anda ditugaskan mengerjakan: ${newTask.title}`,
        packageId,
        'ASSIGNMENT'
      );
      logAudit('TASK_CREATED', 'tasks', newTask.id, newTask.title, `Menugaskan kepada ${newTask.assigneeName}`);
      return newTask;
    },
    [logAudit, sendNotification]
  );

  const updateTaskStatus = useCallback(
    (taskId: string, status: TaskItem['status']) => {
      setTasks((prev) => {
        const nextState: Record<string, TaskItem[]> = {};
        Object.keys(prev).forEach((pkgId) => {
          nextState[pkgId] = prev[pkgId].map((t) => (t.id === taskId ? { ...t, status } : t));
        });
        return nextState;
      });
      logAudit('TASK_STATUS_CHANGED', 'tasks', taskId, undefined, `Status tugas diubah menjadi: ${status}`);
    },
    [logAudit]
  );

  // Reviews Handlers
  const getReviewsForPackage = useCallback((packageId: string) => reviewsRef.current[packageId] || [], []);
  const addReviewFinding = useCallback(
    (packageId: string, findingData: any) => {
      const user = currentUserRef.current;
      const commentText = findingData.comment || findingData.description || '';
      const newFinding: ReviewFinding = {
        id: generateUniqueId('fnd'),
        packageId,
        versionNumber: findingData.versionNumber || 1,
        category: findingData.category || 'EDITORIAL',
        severity: findingData.severity || 'MINOR',
        locationRef: findingData.locationRef || 'Naskah Utama',
        comment: commentText,
        description: commentText,
        title: findingData.title || `Temuan ${findingData.severity || 'Review'}`,
        recommendation: findingData.recommendation || '',
        evidenceNote: findingData.evidenceNote || '',
        status: 'OPEN',
        createdById: user.id,
        createdByName: user.fullName,
        reviewerName: user.fullName,
        createdAt: new Date().toISOString(),
      };
      setReviews((prev) => ({ ...prev, [packageId]: [newFinding, ...(prev[packageId] || [])] }));

      const pkg = packagesRef.current.find((p) => p.id === packageId);
      if (newFinding.severity === 'BLOCKING') {
        toggleBlocker(packageId, true, `Temuan Review BLOCKING: ${newFinding.comment}`);
        if (pkg) {
          sendNotification(
            pkg.ownerId,
            'Temuan Review BLOCKING!',
            `Reviewer menemukan blocker: ${newFinding.comment}`,
            packageId,
            'REVIEW_BLOCKER'
          );
        }
      }

      logAudit(
        'REVIEW_FINDING_CREATED',
        'review_findings',
        newFinding.id,
        newFinding.category,
        `Temuan ${newFinding.severity}: ${newFinding.comment}`
      );
      return newFinding;
    },
    [logAudit, sendNotification, toggleBlocker]
  );

  const resolveReviewFinding = useCallback(
    (findingId: string, notes?: string) => {
      setReviews((prev) => {
        const nextState: Record<string, ReviewFinding[]> = {};
        Object.keys(prev).forEach((pkgId) => {
          nextState[pkgId] = prev[pkgId].map((f) =>
            f.id === findingId
              ? {
                  ...f,
                  status: 'RESOLVED_BY_AUTHOR',
                  resolutionNotes: notes || f.resolutionNotes || 'Telah diperbaiki oleh author.',
                }
              : f
          );
        });
        return nextState;
      });
      logAudit(
        'REVIEW_FINDING_RESOLVED_BY_AUTHOR',
        'review_findings',
        findingId,
        undefined,
        `Kreator menandai perbaikan selesai: ${notes || 'Revisi naskah diterapkan'}`
      );
      return { success: true };
    },
    [logAudit]
  );

  const verifyCloseReviewFinding = useCallback(
    (findingId: string) => {
      const user = currentUserRef.current;
      if (user.role !== 'REVIEWER' && user.role !== 'APPROVER') {
        return {
          success: false,
          error: 'KEPATUHAN: Penutupan temuan hanya dapat diverifikasi oleh Reviewer atau Approver yang berwenang!',
        };
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
                verifiedClosedById: user.id,
                verifiedClosedByName: user.fullName,
              };
            }
            return f;
          });
        });
        return nextState;
      });

      if (resolvedPackageId) {
        const remainingBlocking = (reviewsRef.current[resolvedPackageId] || []).filter(
          (f) => f.id !== findingId && f.severity === 'BLOCKING' && f.status !== 'VERIFIED_CLOSED'
        );
        if (remainingBlocking.length === 0) {
          toggleBlocker(resolvedPackageId, false);
        }
      }

      logAudit(
        'REVIEW_FINDING_VERIFIED_CLOSED',
        'review_findings',
        findingId,
        undefined,
        `Diverifikasi tutup oleh ${user.fullName}`
      );
      return { success: true };
    },
    [logAudit, toggleBlocker]
  );

  // Approval Handlers
  const getManifestForPackage = useCallback((packageId: string) => manifestsRef.current[packageId], []);
  const getManifestsForPackage = useCallback((packageId: string): ApprovalManifest[] => {
    const m = manifestsRef.current[packageId];
    return m ? [m] : [];
  }, []);

  const submitForApproval = useCallback(
    (packageId: string) => {
      const pkg = packagesRef.current.find((p) => p.id === packageId);
      if (!pkg) return { success: false, error: 'Paket tidak ditemukan' };

      const packageFindings = reviewsRef.current[packageId] || [];
      const openBlocking = packageFindings.filter(
        (f) => f.severity === 'BLOCKING' && f.status !== 'VERIFIED_CLOSED'
      );
      if (openBlocking.length > 0) {
        return {
          success: false,
          error: `Tidak dapat diajukan: masih ada ${openBlocking.length} temuan review BLOCKING yang belum ditutup!`,
        };
      }

      const packageClaims = claimsRef.current[packageId] || [];
      const verifiedClaims = packageClaims.filter((c) => c.isVerified);
      const packageNarratives = narrativesRef.current[packageId] || [];
      const currentVer = packageNarratives[0]?.versionNumber || 1;
      const manifestHash = `SHA256-${Math.random().toString(36).substring(2, 14)}${Math.random().toString(36).substring(2, 14)}`;

      const newManifest: ApprovalManifest = {
        id: generateUniqueId(`mnf-${packageId}`),
        packageId,
        contentVersionNumber: currentVer,
        versionNumber: currentVer,
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
      usersRef.current
        .filter((u) => u.role === 'APPROVER')
        .forEach((approver) => {
          sendNotification(
            approver.id,
            'Persetujuan Menunggu Tindakan',
            `Paket ${pkg.packageNumber}: ${pkg.title} siap ditinjau`,
            packageId,
            'APPROVAL_REQUEST'
          );
        });

      logAudit(
        'APPROVAL_MANIFEST_CREATED',
        'approval_manifests',
        newManifest.id,
        pkg.title,
        `Membuat Approval Manifest hash ${manifestHash}`
      );
      return { success: true, manifest: newManifest };
    },
    [logAudit, sendNotification, transitionLifecycleStatus]
  );

  const generateApprovalManifest = useCallback(
    (packageId: string): ApprovalManifest => {
      const res = submitForApproval(packageId);
      if (res.manifest) return res.manifest;
      return manifestsRef.current[packageId] || INITIAL_MANIFESTS[packageId];
    },
    [submitForApproval]
  );

  const executeApprovalDecision = useCallback(
    (
      manifestIdOrPkgId: string,
      decision: 'APPROVE' | 'APPROVED' | 'REQUEST_CHANGES' | 'HOLD' | 'REJECT' | 'REJECTED' | ApprovalDecisionType,
      reason: string
    ) => {
      const user = currentUserRef.current;
      const allManifests = Object.values(manifestsRef.current) as ApprovalManifest[];
      const manifest = allManifests.find(
        (m) => m.id === manifestIdOrPkgId || m.packageId === manifestIdOrPkgId
      );
      if (!manifest) return { success: false, error: 'Manifest persetujuan tidak ditemukan' };

      const pkg = packagesRef.current.find((p) => p.id === manifest.packageId);
      if (!pkg) return { success: false, error: 'Paket konten tidak ditemukan' };

      // SEPARATION OF DUTIES ENFORCEMENT
      if (user.id === pkg.ownerId && pkg.riskLevel !== 'LOW') {
        return {
          success: false,
          error: `SEPARATION OF DUTIES: Anda tercatat sebagai pemilik/kreator paket dengan tingkat risiko ${pkg.riskLevel}. Anda dilarang memberikan persetujuan final untuk karya sendiri!`,
        };
      }

      if (user.role === 'ADMINISTRATOR') {
        return {
          success: false,
          error: 'SEPARATION OF DUTIES: Administrator teknis dilarang memberikan approval editorial demi integritas kepatuhan.',
        };
      }

      const receiptSignature = `HMAC-SHA256:${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}:${user.id}:${Date.now()}`;

      const normDecision: 'APPROVE' | 'REQUEST_CHANGES' | 'HOLD' | 'REJECT' =
        decision === 'APPROVED' ? 'APPROVE' : decision === 'REJECTED' ? 'REJECT' : (decision as any);

      const updatedManifest: ApprovalManifest = {
        ...manifest,
        status:
          normDecision === 'APPROVE'
            ? 'APPROVED'
            : normDecision === 'REQUEST_CHANGES'
            ? 'CHANGES_REQUESTED'
            : 'REJECTED',
        decision: decision === 'APPROVE' ? 'APPROVED' : decision === 'REJECT' ? 'REJECTED' : (decision as any),
        decidedByName: user.fullName,
        decidedAt: new Date().toISOString(),
        signature: receiptSignature,
        decisionNotes: reason,
        action: {
          decision: normDecision,
          approverId: user.id,
          approverName: user.fullName,
          decisionReason: reason,
          receiptSignature,
          decidedAt: new Date().toISOString(),
        },
      };

      setManifests((prev) => ({ ...prev, [manifest.packageId]: updatedManifest }));

      if (normDecision === 'APPROVE') {
        transitionLifecycleStatus(manifest.packageId, 'APPROVED', `Disetujui oleh ${user.fullName}: ${reason}`);
        sendNotification(
          pkg.ownerId,
          'Paket Konten Disetujui',
          `Paket ${pkg.packageNumber} telah disetujui untuk publikasi`,
          manifest.packageId,
          'APPROVAL_REQUEST'
        );
      } else if (normDecision === 'REQUEST_CHANGES') {
        transitionLifecycleStatus(manifest.packageId, 'CHANGES_REQUESTED', `Perubahan diminta oleh ${user.fullName}: ${reason}`);
        sendNotification(
          pkg.ownerId,
          'Perubahan Konten Diminta',
          `Approver meminta revisi pada ${pkg.packageNumber}: ${reason}`,
          manifest.packageId,
          'APPROVAL_REQUEST'
        );
      } else if (normDecision === 'REJECT') {
        transitionLifecycleStatus(manifest.packageId, 'WITHDRAWN', `Ditolak oleh approver: ${reason}`);
      }

      const audit = logAudit(
        'APPROVAL_ACTION_EXECUTED',
        'approval_manifests',
        manifest.id,
        pkg.title,
        `Keputusan ${normDecision} disahkan oleh ${user.fullName} (${user.role}). Receipt: ${receiptSignature}`,
        reason,
        manifest.packageId,
        undefined,
        normDecision === 'REJECT' ? 'HIGH' : 'HIGH',
        {
          decision: normDecision,
          receiptSignature,
          approverId: user.id,
          approverName: user.fullName,
          approverRole: user.role,
          packageId: pkg.id,
          packageNumber: pkg.packageNumber,
        }
      );

      return { success: true, correlationId: audit.correlationId };
    },
    [logAudit, sendNotification, transitionLifecycleStatus]
  );

  // Publication Handlers
  const getPublicationPlansForPackage = useCallback(
    (packageId: string) => publicationPlansRef.current[packageId] || [],
    []
  );

  const createPublicationPlan = useCallback(
    (planData: Omit<PublicationPlan, 'id' | 'retryCount'>) => {
      const newPlan: PublicationPlan = {
        ...planData,
        id: generateUniqueId('pub'),
        retryCount: 0,
      };
      setPublicationPlans((prev) => ({
        ...prev,
        [planData.packageId]: [...(prev[planData.packageId] || []), newPlan],
      }));
      logAudit(
        'PUBLICATION_PLAN_CREATED',
        'publication_plans',
        newPlan.id,
        newPlan.targetChannel,
        `Menjadwalkan publikasi pada kanal ${newPlan.targetChannel}`
      );
      return newPlan;
    },
    [logAudit]
  );

  const recordPublicationProof = useCallback(
    (packageIdOrPlanId: string, proofData: any, customCorrelationId?: string) => {
      const user = currentUserRef.current;
      const correlationId = customCorrelationId || generateAuditCorrelationId();
      let pkgIdFound = '';
      setPublicationPlans((prev) => {
        const nextState: Record<string, PublicationPlan[]> = {};
        Object.keys(prev).forEach((pkgId) => {
          nextState[pkgId] = prev[pkgId].map((plan) => {
            if (plan.id === packageIdOrPlanId || pkgId === packageIdOrPlanId) {
              pkgIdFound = pkgId;
              const newProof: PublicationProof = {
                id: generateUniqueId('prf'),
                planId: plan.id,
                liveUrl: proofData.liveUrl,
                externalPostId: proofData.externalPostId,
                screenshotUrl: proofData.screenshotProofUrl || proofData.screenshotUrl,
                targetAccount: proofData.targetAccount || plan.targetAccount || '@ditjenhorti',
                recordedById: user.id,
                recordedByName: user.fullName,
                publishedAt: new Date().toISOString(),
                isTakedown: false,
                verificationNotes: proofData.notes || proofData.verificationNotes,
                channel: proofData.channel || plan.targetChannel,
              };
              return {
                ...plan,
                status: 'SUCCESS',
                channel: proofData.channel || plan.targetChannel,
                liveUrl: proofData.liveUrl,
                publishedAt: new Date().toISOString(),
                externalPostId: proofData.externalPostId,
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
        logAudit(
          'PUBLICATION_PROOF_RECORDED',
          'publication_proofs',
          packageIdOrPlanId,
          proofData.liveUrl,
          `Mencatat bukti publikasi resmi pada kanal ${proofData.channel || 'resmi'}`,
          proofData.verificationNotes,
          pkgIdFound,
          correlationId,
          'HIGH',
          {
            liveUrl: proofData.liveUrl,
            externalPostId: proofData.externalPostId,
            channel: proofData.channel,
            packageId: pkgIdFound,
            recordedAt: new Date().toISOString(),
          }
        );
      }

      return { success: true, correlationId };
    },
    [logAudit, transitionLifecycleStatus]
  );

  const retryPublication = useCallback(
    (planId: string, customCorrelationId?: string) => {
      let found = false;
      const correlationId = customCorrelationId || generateAuditCorrelationId();
      let pkgIdFound: string | undefined;

      setPublicationPlans((prev) => {
        const nextState: Record<string, PublicationPlan[]> = {};
        Object.keys(prev).forEach((pkgId) => {
          nextState[pkgId] = prev[pkgId].map((plan) => {
            if (plan.id === planId) {
              found = true;
              pkgIdFound = pkgId;
              return { ...plan, status: 'SCHEDULED', retryCount: plan.retryCount + 1 };
            }
            return plan;
          });
        });
        return nextState;
      });

      logAudit(
        'PUBLICATION_RETRY',
        'publication_plans',
        planId,
        undefined,
        'Mencoba kembali publikasi pada kanal yang gagal',
        undefined,
        pkgIdFound,
        correlationId,
        'MEDIUM',
        { planId, retriedAt: new Date().toISOString() }
      );
      return { success: found, correlationId };
    },
    [logAudit]
  );

  const takedownPublication = useCallback(
    (planId: string, reason: string) => {
      let pkgIdFound = '';
      setPublicationPlans((prev) => {
        const nextState: Record<string, PublicationPlan[]> = {};
        Object.keys(prev).forEach((pkgId) => {
          nextState[pkgId] = prev[pkgId].map((plan) => {
            if (plan.id === planId) {
              pkgIdFound = pkgId;
              return {
                ...plan,
                status: 'WITHDRAWN',
                takedownReason: reason,
                proof: plan.proof
                  ? {
                      ...plan.proof,
                      isTakedown: true,
                      takedownReason: reason,
                      takedownAt: new Date().toISOString(),
                    }
                  : undefined,
              };
            }
            return plan;
          });
        });
        return nextState;
      });

      if (pkgIdFound) {
        const pkg = packagesRef.current.find((p) => p.id === pkgIdFound);
        transitionLifecycleStatus(pkgIdFound, 'WITHDRAWN', `Takedown publikasi: ${reason}`);
        const audit = logAudit(
          'EMERGENCY_TAKEDOWN',
          'publication_plans',
          planId,
          pkg ? pkg.title : `Publikasi ${planId}`,
          `Penarikan darurat (Takedown) konten dari kanal publikasi resmi. Alasan: ${reason}`,
          reason,
          pkgIdFound,
          undefined,
          'CRITICAL',
          {
            planId,
            packageId: pkgIdFound,
            packageNumber: pkg?.packageNumber,
            takedownReason: reason,
            executedAt: new Date().toISOString(),
          }
        );
        return { success: true, correlationId: audit.correlationId };
      }
      return { success: true };
    },
    [logAudit, transitionLifecycleStatus]
  );

  // Metrics Handlers
  const getMetricsForPackage = useCallback((packageId: string) => metrics[packageId] || [], [metrics]);
  const addMetricSnapshot = useCallback(
    (packageIdOrSnapshot: any, maybeSnapshot?: any) => {
      let pkgId = '';
      let data: any = {};
      if (typeof packageIdOrSnapshot === 'string') {
        pkgId = packageIdOrSnapshot;
        data = maybeSnapshot || {};
      } else {
        data = packageIdOrSnapshot || {};
        pkgId = data.packageId;
      }

      const newMetric: MetricSnapshot = {
        id: generateUniqueId('mtr'),
        packageId: pkgId,
        channel: data.channel || 'WEBSITE',
        reach: Number(data.reach) || 0,
        engagements: Number(data.engagements) || 0,
        shares: Number(data.shares) || 0,
        clicks: Number(data.clicks) || 0,
        cycleTimeHours: Number(data.cycleTimeHours) || 24,
        impressions: Number(data.impressions) || 0,
        lessonsLearned: data.lessonsLearned || '',
        recordedAt: new Date().toISOString(),
      };

      setMetrics((prev) => ({
        ...prev,
        [pkgId]: [newMetric, ...(prev[pkgId] || [])],
      }));
      logAudit(
        'METRIC_RECORDED',
        'metric_snapshots',
        newMetric.id,
        newMetric.channel,
        `Pencatatan metrik performa: ${newMetric.reach} jangkauan`
      );
    },
    [logAudit]
  );

  // Archives Handlers
  const getArchiveForPackage = useCallback((packageId: string) => archives[packageId], [archives]);
  const archivePackage = useCallback(
    (packageId: string, retentionYears: number, customCorrelationId?: string) => {
      const check = checkArchiveCompleteness(packageId);
      if (!check.isComplete) {
        return { success: false, error: `Kelengkapan arsip gagal: ${check.issues.join(', ')}` };
      }

      const user = currentUserRef.current;
      const correlationId = customCorrelationId || generateAuditCorrelationId();
      const retentionDate = new Date();
      retentionDate.setFullYear(retentionDate.getFullYear() + retentionYears);

      const newArchive: ArchivePackage = {
        id: generateUniqueId(`arc-${packageId}`),
        packageId,
        archiveCompletenessHash: `SHA256-${Math.random().toString(36).substring(2, 14)}`,
        retentionUntil: retentionDate.toISOString(),
        isLegalHold: false,
        archivedById: user.id,
        archivedByName: user.fullName,
        archivedAt: new Date().toISOString(),
      };

      setArchives((prev) => ({ ...prev, [packageId]: newArchive }));
      transitionLifecycleStatus(packageId, 'ARCHIVED', `Pengarsipan lengkap dengan retensi ${retentionYears} tahun`);
      logAudit(
        'PACKAGE_ARCHIVED',
        'archive_packages',
        newArchive.id,
        undefined,
        `Arsip permanen dibuat dengan retensi hingga ${retentionDate.toLocaleDateString('id-ID')}`,
        undefined,
        packageId,
        correlationId,
        'MEDIUM',
        {
          archiveId: newArchive.id,
          retentionUntil: retentionDate.toISOString(),
          retentionYears,
          completenessHash: newArchive.archiveCompletenessHash,
        }
      );
      return { success: true, correlationId };
    },
    [checkArchiveCompleteness, logAudit, transitionLifecycleStatus]
  );

  // -------------------------------------------------------------
  // I. MEMOIZED DERIVED COLLECTIONS
  // -------------------------------------------------------------
  const reviewFindings = useMemo<ReviewFinding[]>(() => {
    if (!reviews || typeof reviews !== 'object') return [];
    return (Object.values(reviews) as ReviewFinding[][]).flat().filter(Boolean);
  }, [reviews]);

  const approvalManifests = useMemo<ApprovalManifest[]>(() => {
    if (!manifests || typeof manifests !== 'object') return [];
    return (Object.values(manifests) as ApprovalManifest[]).filter(Boolean);
  }, [manifests]);

  const publicationRecords = useMemo<PublicationPlan[]>(() => {
    if (!publicationPlans || typeof publicationPlans !== 'object') return [];
    return (Object.values(publicationPlans) as PublicationPlan[][]).flat().filter(Boolean);
  }, [publicationPlans]);

  // -------------------------------------------------------------
  // J. MEMOIZED CONTEXT VALUE OBJECTS
  // -------------------------------------------------------------

  // 1. Static Config Value
  const staticConfigValue = useMemo<StaticConfigContextType>(
    () => ({
      currentUser,
      setCurrentUser,
      setCurrentUserId,
      users,
      units,
      campaigns,
      setCampaigns,
      delegations,
      addDelegation,
      revokeDelegation,
      updateUserRole,
      updateUserStatus,
      channels: DEFAULT_CHANNELS,
      resetAllData,
      resetToSeedData: resetAllData,
      exportDataSnapshot,
      restoreDataSnapshot,
    }),
    [
      currentUser,
      setCurrentUserId,
      users,
      units,
      campaigns,
      delegations,
      addDelegation,
      revokeDelegation,
      updateUserRole,
      updateUserStatus,
      resetAllData,
      exportDataSnapshot,
      restoreDataSnapshot,
    ]
  );

  // 2. Live Activity Value
  const liveActivityValue = useMemo<LiveActivityContextType>(
    () => ({
      notifications,
      unreadNotificationsCount,
      sendNotification,
      markNotificationRead,
      markNotificationUnread,
      deleteNotification,
      clearAllNotifications,
      auditLogs,
      logAudit,
    }),
    [
      notifications,
      unreadNotificationsCount,
      sendNotification,
      markNotificationRead,
      markNotificationUnread,
      deleteNotification,
      clearAllNotifications,
      auditLogs,
      logAudit,
    ]
  );

  // 3. Content Data Value
  const contentDataValue = useMemo<ContentDataContextType>(
    () => ({
      packages,
      selectedPackageId,
      setSelectedPackageId,
      updatePackageMetadata,
      transitionLifecycleStatus,
      toggleBlocker,
      requests,
      submitContentRequest,
      triageRequest,
      respondToClarification,
      findDuplicates,
      briefs,
      getBriefsForPackage,
      addBriefVersion,
      sources,
      getSourcesForPackage,
      addContentSource,
      verifySource,
      claims,
      getClaimsForPackage,
      addClaim,
      verifyClaim,
      narratives,
      getNarrativesForPackage,
      saveNarrativeVersion,
      variants,
      getVariantsForPackage,
      saveChannelVariant,
      addChannelVariant,
      assets,
      getAssetsForPackage,
      addAsset,
      addDigitalAsset,
      tasks,
      getTasksForPackage,
      addTask,
      addProductionTask: addTask,
      updateTaskStatus,
      reviews,
      reviewFindings,
      getReviewsForPackage,
      addReviewFinding,
      resolveReviewFinding,
      resolveFindingByAuthor: resolveReviewFinding,
      verifyCloseReviewFinding,
      verifyAndCloseFinding: verifyCloseReviewFinding,
      manifests,
      approvalManifests,
      getManifestForPackage,
      getManifestsForPackage,
      generateApprovalManifest,
      submitForApproval,
      executeApprovalDecision,
      publicationPlans,
      publicationRecords,
      getPublicationPlansForPackage,
      getPublicationsForPackage: getPublicationPlansForPackage,
      createPublicationPlan,
      recordPublicationProof,
      retryPublication,
      takedownPublication,
      metrics,
      getMetricsForPackage,
      addMetricSnapshot,
      archives,
      getArchiveForPackage,
      checkArchiveCompleteness,
      archivePackage,
    }),
    [
      packages,
      selectedPackageId,
      updatePackageMetadata,
      transitionLifecycleStatus,
      toggleBlocker,
      requests,
      submitContentRequest,
      triageRequest,
      respondToClarification,
      findDuplicates,
      briefs,
      getBriefsForPackage,
      addBriefVersion,
      sources,
      getSourcesForPackage,
      addContentSource,
      verifySource,
      claims,
      getClaimsForPackage,
      addClaim,
      verifyClaim,
      narratives,
      getNarrativesForPackage,
      saveNarrativeVersion,
      variants,
      getVariantsForPackage,
      saveChannelVariant,
      addChannelVariant,
      assets,
      getAssetsForPackage,
      addAsset,
      addDigitalAsset,
      tasks,
      getTasksForPackage,
      addTask,
      updateTaskStatus,
      reviews,
      reviewFindings,
      getReviewsForPackage,
      addReviewFinding,
      resolveReviewFinding,
      verifyCloseReviewFinding,
      manifests,
      approvalManifests,
      getManifestForPackage,
      getManifestsForPackage,
      generateApprovalManifest,
      submitForApproval,
      executeApprovalDecision,
      publicationPlans,
      publicationRecords,
      getPublicationPlansForPackage,
      createPublicationPlan,
      recordPublicationProof,
      retryPublication,
      takedownPublication,
      metrics,
      getMetricsForPackage,
      addMetricSnapshot,
      archives,
      getArchiveForPackage,
      checkArchiveCompleteness,
      archivePackage,
    ]
  );

  // 4. Combined HortiFlow Context Value (Unified interface)
  const combinedContextValue = useMemo<HortiFlowContextType>(
    () => ({
      ...staticConfigValue,
      ...contentDataValue,
      ...liveActivityValue,
    }),
    [staticConfigValue, contentDataValue, liveActivityValue]
  );

  return (
    <StaticConfigContext.Provider value={staticConfigValue}>
      <ContentDataContext.Provider value={contentDataValue}>
        <LiveActivityContext.Provider value={liveActivityValue}>
          <HortiFlowContext.Provider value={combinedContextValue}>
            {children}
          </HortiFlowContext.Provider>
        </LiveActivityContext.Provider>
      </ContentDataContext.Provider>
    </StaticConfigContext.Provider>
  );
};

/* =========================================================================
   CUSTOM REACT HOOKS
   ========================================================================= */

/**
 * Hook for consuming static/config state only (User session, Master data, Units).
 * Components using this hook NEVER re-render when notifications or content updates happen.
 */
export const useStaticConfig = (): StaticConfigContextType => {
  const context = useContext(StaticConfigContext);
  if (!context) throw new Error('useStaticConfig must be used within HortiFlowProvider');
  return context;
};

/**
 * Hook for consuming core editorial packages & lifecycle domain data.
 * Components using this hook NEVER re-render when live notifications or audits tick.
 */
export const useContentData = (): ContentDataContextType => {
  const context = useContext(ContentDataContext);
  if (!context) throw new Error('useContentData must be used within HortiFlowProvider');
  return context;
};

/**
 * Hook for consuming live alerts, notifications, and immutable audit logs.
 */
export const useLiveActivity = (): LiveActivityContextType => {
  const context = useContext(LiveActivityContext);
  if (!context) throw new Error('useLiveActivity must be used within HortiFlowProvider');
  return context;
};

/**
 * Convenience alias for notification-specific components
 */
export const useNotifications = useLiveActivity;

/**
 * Unified Hook providing full access to all HortiFlow operational states.
 * 100% backward compatible with all existing views and tabs.
 */
export const useHortiFlow = (): HortiFlowContextType => {
  const context = useContext(HortiFlowContext);
  if (!context) throw new Error('useHortiFlow must be used within HortiFlowProvider');
  return context;
};
