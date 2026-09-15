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

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  unitId: string;
  unitName: string;
  position: string;
  isActive: boolean;
  avatarUrl?: string;
  nip?: string;
}

export interface Unit {
  id: string;
  code: string;
  name: string;
  description: string;
  echelonLevel?: string;
}

export interface Campaign {
  id: string;
  code: string;
  name: string;
  objective: string;
  targetAudience: string;
  theme: string;
  ownerId: string;
  ownerName: string;
  status: 'PLANNING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  startDate: string;
  endDate: string;
  kpiSummary: {
    targetReach?: number;
    targetEngagements?: number;
    targetPackages?: number;
  };
}

export interface ContentRequest {
  id: string;
  ticketNumber: string;
  title: string;
  contentType: ContentType;
  communicationGoal: string;
  targetAudience: string;
  topics: string[];
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  riskLevel: RiskLevel;
  requestedDeadline: string;
  initialSources: string;
  unitId: string;
  unitName: string;
  requesterId: string;
  requesterName: string;
  campaignId?: string;
  campaignName?: string;
  status: 'SUBMITTED' | 'IN_TRIAGE' | 'ACCEPTED' | 'REJECTED' | 'MERGED' | 'ON_HOLD';
  triageNotes?: string;
  createdPackageId?: string;
  createdAt: string;
  targetChannels?: ChannelType[];
  resourceNeeds?: string[];
  readinessScore?: number;
  keyMessages?: string[];
  clarificationNotes?: string;
}

export interface ContentPackage {
  id: string;
  packageNumber: string; // e.g. PKG-2026-0012
  requestId?: string;
  campaignId?: string;
  campaignName?: string;
  unitId: string;
  unitName: string;
  ownerId: string;
  ownerName: string;
  title: string;
  contentType: ContentType;
  lifecycleStatus: LifecycleStatus;
  riskLevel: RiskLevel;
  classification: Classification;
  deadline: string;
  hasBlocker: boolean;
  blockerReason?: string;
  nextAction: string;
  tags: string[];
  rowVersion: number;
  createdAt: string;
  updatedAt: string;
  channels?: ChannelType[];
  targetChannels?: ChannelType[];
}

export interface BriefVersion {
  id: string;
  packageId: string;
  version: number;
  angle: string;
  keyMessages: string[];
  targetAudience: string;
  targetChannels: ChannelType[];
  productionInstructions: string;
  callToAction: string;
  classification: Classification;
  riskNotes: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
}

export interface ContentSource {
  id: string;
  packageId: string;
  title: string;
  sourceType: 'DOCUMENT' | 'URL' | 'INTERVIEW' | 'OFFICIAL_DATA' | 'REGULATION' | 'RESEARCH_PAPER';
  referenceUrl?: string;
  fileName?: string;
  snapshotHash?: string;
  extractedNotes: string;
  verified: boolean;
  verifiedById?: string;
  verifiedByName?: string;
  createdAt: string;
}

export interface Claim {
  id: string;
  packageId: string;
  sourceId: string;
  sourceTitle: string;
  claimText: string;
  claimCategory: 'STATISTIC' | 'DATE' | 'QUOTE' | 'POLICY' | 'VARIETY_NAME' | 'LOCATION';
  contextLocation: string; // e.g. "Paragraf 2, kalimat 1"
  isVerified: boolean;
  verifiedById?: string;
  verifiedByName?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface NarrativeVersion {
  id: string;
  packageId: string;
  versionNumber: number;
  title: string;
  body: string;
  summary: string;
  checksum: string;
  changeLog: string;
  authorId: string;
  authorName: string;
  linkedClaimIds: string[];
  createdAt: string;
}

export interface ChannelVariant {
  id: string;
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
  updatedAt: string;
  assignedAssetIds?: string[];
}

export interface DigitalAsset {
  id: string;
  packageId?: string;
  title: string;
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
  createdAt: string;
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
  expiryDate?: string;
  consentEvidence?: string;
  isExpired: boolean;
  notes?: string;
}

export interface TaskItem {
  id: string;
  packageId: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueDate: string;
  dependencies?: string[];
  createdAt: string;
}

export interface ReviewFinding {
  id: string;
  packageId: string;
  versionNumber: number;
  category: 'FACT_CHECK' | 'SUBJECT_MATTER' | 'EDITORIAL' | 'BRAND_IDENTITY' | 'PRIVACY' | 'RIGHTS' | 'ACCESSIBILITY';
  severity: 'BLOCKING' | 'MAJOR' | 'MINOR' | 'SUGGESTION';
  locationRef: string;
  comment: string;
  evidenceNote?: string;
  status: 'OPEN' | 'RESOLVED_BY_AUTHOR' | 'VERIFIED_CLOSED';
  createdById: string;
  createdByName: string;
  verifiedClosedById?: string;
  verifiedClosedByName?: string;
  createdAt: string;
  title?: string;
  description?: string;
  recommendation?: string;
  resolutionNotes?: string;
  reviewerName?: string;
}

export interface ApprovalManifest {
  id: string;
  packageId: string;
  contentVersionNumber: number;
  manifestHash: string;
  summaryText: string;
  claimsCount: number;
  verifiedClaimsCount: number;
  hasBlockingFindings: boolean;
  status: 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED' | 'REVOKED_BY_MUTATION';
  createdAt: string;
  action?: ApprovalAction;
  versionNumber?: number;
  decision?: ApprovalDecisionType;
  decidedByName?: string;
  decidedAt?: string;
  signature?: string;
  decisionNotes?: string;
}

export interface ApprovalAction {
  decision: 'APPROVE' | 'REQUEST_CHANGES' | 'HOLD' | 'REJECT';
  approverId: string;
  approverName: string;
  decisionReason: string;
  receiptSignature: string;
  decidedAt: string;
  delegatedById?: string;
  delegatedByName?: string;
}

export interface ApprovalDelegation {
  id: string;
  delegatorId: string;
  delegatorName: string;
  delegateeId: string;
  delegateeName: string;
  scope: 'ALL' | 'CAMPAIGN' | 'UNIT';
  riskCeiling: 'LOW' | 'MEDIUM';
  startDate: string;
  endDate: string;
  reason: string;
  isRevoked: boolean;
}

export interface PublicationPlan {
  id: string;
  packageId: string;
  manifestId: string;
  channelVariantId: string;
  targetChannel: ChannelType;
  targetAccount: string;
  scheduledTime: string;
  embargoUntil?: string;
  idempotencyKey: string;
  status: 'SCHEDULED' | 'PUBLISHING' | 'SUCCESS' | 'FAILED' | 'WITHDRAWN' | 'TAKEDOWN';
  retryCount: number;
  proof?: PublicationProof;
  channel?: ChannelType;
  liveUrl?: string;
  publishedAt?: string;
  failureReason?: string;
  takedownReason?: string;
  externalPostId?: string;
}

export interface PublicationProof {
  id: string;
  planId: string;
  liveUrl: string;
  externalPostId?: string;
  screenshotUrl?: string;
  targetAccount: string;
  recordedById: string;
  recordedByName: string;
  publishedAt: string;
  verificationNotes?: string;
  isTakedown: boolean;
  takedownReason?: string;
  takedownAt?: string;
  channel?: ChannelType;
}

export interface MetricSnapshot {
  id: string;
  packageId: string;
  channel: ChannelType;
  reach: number;
  engagements: number;
  shares: number;
  clicks: number;
  cycleTimeHours: number;
  recordedAt: string;
  impressions?: number;
  lessonsLearned?: string;
}

export interface ArchivePackage {
  id: string;
  packageId: string;
  archiveCompletenessHash: string;
  retentionUntil: string;
  isLegalHold: boolean;
  legalHoldReason?: string;
  archivedById: string;
  archivedByName: string;
  archivedAt: string;
}

export type AuditSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AuditEvent {
  id: string;
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
  timestamp: string;
  ipAddress?: string;
  packageId?: string;
  severity?: AuditSeverity;
  integrityHash?: string;
  metadata?: Record<string, any>;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  title: string;
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
  createdAt: string;
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

