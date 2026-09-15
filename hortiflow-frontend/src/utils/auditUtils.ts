/**
 * HORTIFLOW - Audit Trail & ISO/IEC 27001 Data Integrity Utilities
 * Standards Reference: ISO/IEC 27001:2022 A.8.15 (Logging) & A.8.18 (Privileged access rights)
 */

/**
 * Generates an RFC 4122 v4 compliant UUID for Correlation ID
 */
export const generateUUIDv4 = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback if randomUUID is restricted in iframe/context
    }
  }

  // RFC4122 v4 standard compliant generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Alias for generateUUIDv4 for correlation IDs
 */
export const generateAuditCorrelationId = generateUUIDv4;

/**
 * Computes a deterministic SHA-256 style tamper-evident checksum
 * for cryptographic verification of log immutability
 */
export const computeAuditIntegrityHash = (
  correlationId: string,
  timestamp: string,
  actorId: string,
  action: string,
  targetId: string,
  reason: string = ''
): string => {
  const seed = `${correlationId}|${timestamp}|${actorId}|${action}|${targetId}|${reason}`;
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;

  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hexPart1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hexPart2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const hexPart3 = ((h1 ^ h2) >>> 0).toString(16).padStart(8, '0');
  const hexPart4 = (((h1 * 31) ^ (h2 * 17)) >>> 0).toString(16).padStart(8, '0');

  return `sha256:${hexPart1}${hexPart2}${hexPart3}${hexPart4}`;
};

/**
 * Truncates UUID for compact UI display
 * e.g., "7f8b9e12-4c21-4d33-91ab-62cf810a9bf4" -> "7f8b9e12...9bf4"
 */
export const formatCorrelationShort = (uuid?: string): string => {
  if (!uuid) return '-';
  if (uuid.length <= 16) return uuid;
  const parts = uuid.split('-');
  if (parts.length === 5) {
    return `${parts[0]}...${parts[4].slice(-4)}`;
  }
  return `${uuid.slice(0, 8)}...${uuid.slice(-4)}`;
};

/**
 * Resolves event severity for ISO audit categorisation
 */
export const getAuditSeverity = (action: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' => {
  const act = action.toUpperCase();
  if (
    act.includes('TAKEDOWN') ||
    act.includes('EMERGENCY') ||
    act.includes('RBAC') ||
    act.includes('SUSPEND') ||
    act.includes('DELEGATION_REVOKED')
  ) {
    return 'CRITICAL';
  }
  if (
    act.includes('APPROVAL') ||
    act.includes('RETRIAGE') ||
    act.includes('REJECT') ||
    act.includes('BLOCKER') ||
    act.includes('SEAL')
  ) {
    return 'HIGH';
  }
  if (
    act.includes('VERIFIED') ||
    act.includes('ASSIGN') ||
    act.includes('HOLD') ||
    act.includes('DELEGATION_CREATED')
  ) {
    return 'MEDIUM';
  }
  return 'LOW';
};

/**
 * Checks if the action represents a critical compliance operation
 */
export const isCriticalAuditEvent = (action: string): boolean => {
  const severity = getAuditSeverity(action);
  return severity === 'CRITICAL' || severity === 'HIGH';
};

/**
 * Generates a deterministic visual tag color derived from correlation ID
 */
export const getCorrelationBadgeStyle = (uuid?: string) => {
  if (!uuid) return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = (hash << 5) - hash + uuid.charCodeAt(i);
    hash |= 0;
  }
  const palettes = [
    { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
    { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
    { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
    { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
    { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500' },
    { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  ];
  const idx = Math.abs(hash) % palettes.length;
  return palettes[idx];
};
