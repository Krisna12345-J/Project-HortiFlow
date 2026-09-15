export type LifecycleStatus =
  | 'IDE'
  | 'TRIAGED'
  | 'BRIEF_READY'
  | 'ASSIGNED'
  | 'IN_PRODUCTION'
  | 'IN_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVAL_PENDING'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'PUBLISHING'
  | 'PARTIALLY_PUBLISHED'
  | 'PUBLISHED'
  | 'PUBLISH_FAILED'
  | 'WITHDRAWN'
  | 'ARCHIVED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Classification = 'PUBLIC' | 'INTERNAL' | 'RESTRICTED' | 'CONFIDENTIAL';
export type ContentType = 'ARTICLE' | 'INFOGRAPHIC' | 'SHORT_VIDEO' | 'PRESS_RELEASE' | 'SOCIAL_CAROUSEL' | 'POLICY_BRIEF';
export type ChannelType = 'WEBSITE' | 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK' | 'YOUTUBE' | 'X' | 'LINKEDIN' | 'INTERNAL_PORTAL';

export type UserRole =
  | 'PENGUSUL'
  | 'PLANNER'
  | 'EDITOR'
  | 'REVIEWER'
  | 'APPROVER'
  | 'PUBLISHER'
  | 'ARCHIVIST'
  | 'ADMINISTRATOR';

declare const __brand: unique symbol;

/**
 * Nominal branded type representing a validated ISO 8601 date-time string
 * (e.g., "2026-03-15T14:30:00.000Z", "2026-03-15T08:00:00+07:00", or "2026-03-15").
 */
export type ISODateString = string & { readonly [__brand]?: 'ISODateString' };

/**
 * Standard auditing and soft-deletion interface.
 * Preserves data history and satisfies ISO/IEC 27001 auditability.
 */
export interface SoftDeleteRecord {
  deletedAt?: ISODateString | Date | null;
  isDeleted?: boolean;
}

/**
 * Base auditing entity with identity, timestamping, and soft-delete capabilities.
 */
export interface BaseEntity extends SoftDeleteRecord {
  id: string;
  createdAt?: ISODateString | Date;
  updatedAt?: ISODateString | Date;
}

export interface User extends BaseEntity {
  username: string;
  description?: string;
  fullName: string;
  email: string;
  role: UserRole;
  unitId?: string;
  unitName?: string;
  position: string;
  isActive: boolean;
  avatarUrl?: string;
  nip?: string;
}

export interface Unit extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  echelonLevel?: string;
}

export interface Campaign extends BaseEntity {
  code: string;
  name: string;
  description?: string;
  objective: string;
  targetAudience?: string;
  theme: string;
  ownerId: string;
  ownerName: string;
  status: 'PLANNING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  startDate: ISODateString;
  endDate: ISODateString;
  kpiSummary: {
    targetReach?: number;
    targetEngagements?: number;
    targetPackages?: number;
  };
}

export interface RequestContent extends BaseEntity {
  ticketNumber: string;
  title: string;
  description?: string;
  contentType: ContentType;
  communicationGoal?: string;
  targetAudience?: string;
  topics?: string[];
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  riskLevel: RiskLevel;
  requestedDeadline?: ISODateString;
  initialSources?: string;
  unitId?: string;
  unitName?: string;
  requesterId?: string;
  requesterName: string;
  campaignId?: string;
  campaignName?: string;
  status: 'SUBMITTED' | 'IN_TRIAGE' | 'ACCEPTED' | 'REJECTED' | 'MERGED' | 'ON_HOLD';
  triageNotes?: string;
  createdPackageId?: string;
  createdAt: ISODateString;
  targetChannels?: ChannelType[];
  resourceNeeds?: string[];
  readinessScore?: number;
  keyMessages?: string[];
  clarificationNotes?: string;
}

export interface ContentPackage extends BaseEntity {
  packageNumber: string; // e.g. PKG-2026-0012
  requestId?: string;
  campaignId?: string;
  campaignName?: string;
  unitId?: string;
  unitName?: string;
  ownerId: string;
  ownerName: string;
  title: string;
  description?: string;
  contentType: ContentType;
  lifecycleStatus: LifecycleStatus;
  riskLevel: RiskLevel;
  classification: Classification;
  deadline: ISODateString;
  hasBlocker: boolean;
  blockerReason?: string;
  nextAction: string;
  tags: string[];
  rowVersion: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  channels?: ChannelType[];
  targetChannels?: ChannelType[];
}

export interface BriefVersion extends BaseEntity {
  packageId: string;
  version: number;
  angle: string;
  keyMessages: string[];
  targetAudience?: string;
  targetChannels: ChannelType[];
  productionInstructions: string;
  callToAction: string;
  classification: Classification;
  riskNotes: string;
  createdById: string;
  createdByName: string;
  createdAt: ISODateString;
}

export interface ContentSource extends BaseEntity {
  packageId: string;
  title: string;
  description?: string;
  sourceType: 'DOCUMENT' | 'URL' | 'INTERVIEW' | 'OFFICIAL_DATA' | 'REGULATION' | 'RESEARCH_PAPER';
  referenceUrl?: string;
  fileName?: string;
  snapshotHash?: string;
  extractedNotes: string;
  verified: boolean;
  verifiedById?: string;
  verifiedByName?: string;
  createdAt: ISODateString;
}

export interface Claim extends BaseEntity {
  packageId: string;
  sourceId: string;
  sourceTitle: string;
  claimText: string;
  claimCategory: 'STATISTIC' | 'DATE' | 'QUOTE' | 'POLICY' | 'VARIETY_NAME' | 'LOCATION';
  contextLocation: string; // e.g. "Paragraf 2, kalimat 1"
  isVerified: boolean;
  verifiedById?: string;
  verifiedByName?: string;
  verifiedAt?: ISODateString;
  createdAt: ISODateString;
}

export interface NarrativeVersion extends BaseEntity {
  packageId: string;
  versionNumber: number;
  title: string;
  description?: string;
  body: string;
  summary: string;
  checksum: string;
  changeLog: string;
  authorId: string;
  authorName: string;
  linkedClaimIds: string[];
  createdAt: ISODateString;
}

export interface ChannelVariant extends BaseEntity {
  packageId: string;
  channel: ChannelType;
  title?: string;
  format: string; // e.g. "Carousel 10 slides", "Reels 60s", "Artikel Website", "Thread 5 Tweet"
  aspectRatio: '1:1' | '9:16' | '16:9' | '4:5' | 'Standard Text';
  caption: string;
  hashtags: string[];
  callToAction: string;
  metadata: {
    targetAccount?: string;
    characterCount?: number;
    assetIds?: string[];
  };
  readinessStatus: 'DRAFT' | 'READY' | 'BLOCKED';
  updatedAt: ISODateString;
  assignedAssetIds?: string[];
}

export interface DigitalAsset extends BaseEntity {
  packageId?: string;
  title: string;
  description?: string;
  fileType: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'ILLUSTRATION' | 'INFOGRAPHIC' | 'DOCUMENT';
  mimeType: string;
  fileSize: number; // in bytes
  storageKey: string;
  previewUrl: string;
  checksumSha256: string;
  altText: string;
  caption: string;
  status: 'SAFE' | 'QUARANTINE' | 'INFECTED';
  classification: Classification;
  uploadedById: string;
  uploadedByName: string;
  createdAt: ISODateString;
  rights: AssetRights;
  assetType?: AssetType;
  fileName?: string;
  scanStatus?: string;
  licenseType?: LicenseType;
}

export interface AssetRights {
  ownerCopyright: string;
  licenseType: 'CC_BY' | 'ALL_RIGHTS_RESERVED' | 'GOVERNMENT_PUBLIC_DOMAIN' | 'PURCHASED_STOCK' | 'INTERNAL_PRODUCTION';
  attributionRequired: boolean;
  attributionText: string;
  permittedChannels: ChannelType[] | 'ALL';
  expiryDate?: ISODateString;
  consentEvidence?: string;
  isExpired: boolean;
  notes?: string;
}

export interface TaskItem extends BaseEntity {
  packageId: string;
  title: string;
  description?: string;
  assigneeId: string;
  assigneeName: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueDate: ISODateString;
  dependencies?: string[];
  createdAt: ISODateString;
}

export interface ReviewFinding extends BaseEntity {
  packageId: string;
  versionNumber: number;
  category: 'FACT_CHECK' | 'SUBJECT_MATTER' | 'EDITORIAL' | 'BRAND_IDENTITY' | 'PRIVACY' | 'RIGHTS' | 'ACCESSIBILITY';
  severity: 'BLOCKING' | 'MAJOR' | 'MINOR' | 'SUGGESTION';
  locationRef: string;
  comment: string;
  description?: string;
  evidenceNote?: string;
  status: 'OPEN' | 'RESOLVED_BY_AUTHOR' | 'VERIFIED_CLOSED';
  createdById: string;
  createdByName: string;
  verifiedClosedById?: string;
  verifiedClosedByName?: string;
  createdAt: ISODateString;
  title?: string;
  recommendation?: string;
  resolutionNotes?: string;
  reviewerName?: string;
}

export interface ApprovalManifest extends BaseEntity {
  packageId: string;
  contentVersionNumber: number;
  manifestHash: string;
  summaryText: string;
  claimsCount: number;
  verifiedClaimsCount: number;
  hasBlockingFindings: boolean;
  status: 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED' | 'REVOKED_BY_MUTATION';
  createdAt: ISODateString;
  action?: ApprovalAction;
  versionNumber?: number;
  decision?: ApprovalDecisionType;
  decidedByName?: string;
  decidedAt?: ISODateString;
  signature?: string;
  decisionNotes?: string;
}

export interface ApprovalAction {
  decision: 'APPROVE' | 'REQUEST_CHANGES' | 'HOLD' | 'REJECT';
  approverId: string;
  approverName: string;
  decisionReason: string;
  receiptSignature: string;
  decidedAt: ISODateString;
  delegatedById?: string;
  delegatedByName?: string;
}

export interface ApprovalDelegation extends BaseEntity {
  delegatorId: string;
  delegatorName: string;
  delegateeId: string;
  delegateeName: string;
  scope: 'ALL' | 'CAMPAIGN' | 'UNIT';
  riskCeiling: 'LOW' | 'MEDIUM';
  startDate: ISODateString;
  endDate: ISODateString;
  reason: string;
  isRevoked: boolean;
}

export interface PublicationPlan extends BaseEntity {
  packageId: string;
  manifestId: string;
  channelVariantId: string;
  targetChannel: ChannelType;
  targetAccount: string;
  scheduledTime: ISODateString;
  embargoUntil?: ISODateString;
  idempotencyKey: string;
  status: 'SCHEDULED' | 'PUBLISHING' | 'SUCCESS' | 'FAILED' | 'WITHDRAWN' | 'TAKEDOWN';
  retryCount: number;
  proof?: PublicationProof;
  channel?: ChannelType;
  liveUrl?: string;
  publishedAt?: ISODateString;
  failureReason?: string;
  takedownReason?: string;
  externalPostId?: string;
}

export interface PublicationProof extends BaseEntity {
  planId: string;
  liveUrl: string;
  externalPostId?: string;
  screenshotUrl?: string;
  targetAccount: string;
  recordedById: string;
  recordedByName: string;
  publishedAt: ISODateString;
  verificationNotes?: string;
  isTakedown: boolean;
  takedownReason?: string;
  takedownAt?: ISODateString;
  channel?: ChannelType;
}

export interface MetricSnapshot extends BaseEntity {
  packageId: string;
  channel: ChannelType;
  reach: number;
  engagements: number;
  shares: number;
  clicks: number;
  cycleTimeHours: number;
  recordedAt: ISODateString;
  impressions?: number;
  lessonsLearned?: string;
}

export interface ArchivePackage extends BaseEntity {
  packageId: string;
  archiveCompletenessHash: string;
  retentionUntil: ISODateString;
  isLegalHold: boolean;
  legalHoldReason?: string;
  archivedById: string;
  archivedByName: string;
  archivedAt: ISODateString;
}

export type AuditSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AuditLog extends BaseEntity {
  correlationId: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetType: string;
  targetId: string;
  targetTitle?: string;
  targetEntity?: string;
  diffDescription?: string;
  reason?: string;
  timestamp: ISODateString;
  ipAddress?: string;
  packageId?: string;
  severity?: AuditSeverity;
  integrityHash?: string;
  metadata?: Record<string, any>;
}

export interface AppNotification extends BaseEntity {
  recipientId: string;
  title: string;
  description?: string;
  message: string;
  actionUrl: string;
  category:
    | 'ASSIGNMENT'
    | 'DEADLINE'
    | 'REVIEW_BLOCKER'
    | 'APPROVAL_REQUEST'
    | 'PUBLICATION'
    | 'RIGHTS_EXPIRY'
    | 'WORKFLOW_STATUS'
    | 'INTAKE_UPDATE';
  isRead: boolean;
  createdAt: ISODateString;
}

export type ApprovalDecisionType =
  | 'PENDING'
  | 'APPROVED'
  | 'APPROVE'
  | 'CHANGES_REQUESTED'
  | 'REQUEST_CHANGES'
  | 'HOLD'
  | 'REJECTED'
  | 'REJECT';
export type FindingSeverity = 'BLOCKING' | 'MAJOR' | 'MINOR' | 'SUGGESTION';
export type ReviewCategory =
  | 'FACT_CHECK'
  | 'SUBJECT_MATTER'
  | 'EDITORIAL'
  | 'BRAND_IDENTITY'
  | 'LEGAL_PRIVACY'
  | 'RIGHTS_CHECK'
  | 'ACCESSIBILITY'
  | 'PRIVACY'
  | 'RIGHTS';

export type AssetType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'ILLUSTRATION' | 'INFOGRAPHIC' | 'DOCUMENT';
export type LicenseType = 'CC_BY' | 'ALL_RIGHTS_RESERVED' | 'GOVERNMENT_PUBLIC_DOMAIN' | 'PURCHASED_STOCK' | 'INTERNAL_PRODUCTION';
export type ContentMetric = MetricSnapshot;
export type PublicationRecord = PublicationPlan;
export type ProductionTask = TaskItem;
export type ContentRequest = RequestContent;
export type AuditEvent = AuditLog;

/**
 * Standard pagination metadata for enterprise collections.
 */
export interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Generic API response contract for paginated entity datasets.
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Type helper to generate paginated response signatures for any entity type.
 */
export type AsPaginated<T> = PaginatedResponse<T>;

export type PaginatedCampaign = PaginatedResponse<Campaign>;
export type PaginatedContentPackage = PaginatedResponse<ContentPackage>;
export type PaginatedDigitalAsset = PaginatedResponse<DigitalAsset>;
export type PaginatedRequestContent = PaginatedResponse<RequestContent>;
export type PaginatedAuditLog = PaginatedResponse<AuditLog>;


