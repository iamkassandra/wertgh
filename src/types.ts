export type DeviceProfile = 'auto' | 'iphone16pro' | 'macbookm2';

export type StorageClass = 'STANDARD' | 'NEARLINE' | 'COLDLINE';

export interface GCSBucketConfig {
  bucketName: string;
  region: string;
  storageClass: StorageClass;
  versioning: boolean;
  e2eeEnabled: boolean;
  totalAssets: number;
  totalBytes: number;
}

export interface StoredAsset {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string; // ISO string
  dateCategory: string; // e.g., "2026-09-08"
  quarterCategory: string; // e.g., "2026-Q3"
  fileTypeCategory: 'IMAGE' | 'DOCUMENT' | 'CODE_CONFIG' | 'DATA_JSON' | 'AUDIO' | 'VIDEO' | 'AI_ARTIFACT' | 'OTHER';
  gcsUri: string;
  sha256Hash: string;
  e2eeEncrypted: boolean;
  encryptionAlgorithm: string;
  tags: string[];
  aiSummary?: string;
  aiSuggestedTags?: string[];
  securityStatus: 'VERIFIED' | 'SCANNED_CLEAN' | 'FLAGGED' | 'QUARANTINED';
  lastAuditedAt: string;
  sourceUrl?: string;
  dataBase64?: string; // encrypted or decrypted payload for preview
  contentPreview?: string;
}

export interface SecurityAuditEntry {
  id: string;
  timestamp: string;
  auditType: 'WEEKLY_SCHEDULED' | 'IMPORT_VERIFICATION' | 'HASH_INTEGRITY_CHECK' | 'PERIMETER_PROBE';
  status: 'PASSED' | 'WARNING' | 'CRITICAL';
  assetsChecked: number;
  anomaliesDetected: number;
  integrityScorePercent: number;
  summary: string;
  details: string[];
  verifiedBy: string;
  signature: string;
}

export interface FounderSession {
  authenticated: boolean;
  mfaVerified: boolean;
  founderEmail: string;
  founderName: string;
  sessionToken: string;
  issuedAt: number;
  expiresAt: number;
  clientIp: string;
  deviceFingerprint: string;
  e2eeKeyFingerprint: string;
}

export interface CloudSyncStatus {
  online: boolean;
  cloudLatencyMs: number;
  activeBucket: string;
  lastHeartbeat: string;
  syncedDevices: {
    deviceId: string;
    deviceName: string;
    deviceType: 'iOS (iPhone 16 Pro)' | 'macOS (MacBook Air 2022 M2)' | 'Web Client';
    lastSync: string;
    status: 'ACTIVE' | 'IDLE';
    ipHash: string;
  }[];
  zeroTrustLock: boolean;
}
