import { StoredAsset, SecurityAuditEntry, CloudSyncStatus } from '../types';

let currentSessionToken: string | null = null;

export function setSessionToken(token: string | null) {
  currentSessionToken = token;
}

export function getSessionToken(): string | null {
  return currentSessionToken;
}

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (currentSessionToken) {
    headers['Authorization'] = `Bearer ${currentSessionToken}`;
  }
  return headers;
}

export async function loginFounder(credentials: { email: string; password: string; deviceProfile: string }) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return res.json();
}

export async function verifyMFA(payload: { email: string; code: string; passkeyVerified?: boolean; deviceProfile: string }) {
  const res = await fetch('/api/auth/verify-mfa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function logoutFounder() {
  const res = await fetch('/api/auth/logout', {
    method: 'POST',
    headers: getHeaders(),
  });
  currentSessionToken = null;
  return res.json();
}

export async function fetchCloudSyncStatus(): Promise<CloudSyncStatus> {
  const res = await fetch('/api/cloud/sync-status', {
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error('Cloud heartbeat failed. Zero-trust connection severed.');
  }
  return res.json();
}

export async function fetchAssets(params?: { search?: string; type?: string; date?: string; tag?: string }) {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.type && params.type !== 'ALL') query.set('type', params.type);
  if (params?.date && params.date !== 'ALL') query.set('date', params.date);
  if (params?.tag && params.tag !== 'ALL') query.set('tag', params.tag);

  const res = await fetch(`/api/assets?${query.toString()}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to retrieve assets from cloud vault');
  return res.json();
}

export async function bulkUploadAssets(payload: {
  files: { name: string; mimeType: string; sizeBytes: number; dataBase64?: string; content?: string; contentPreview?: string }[];
  dateOverride?: string;
  customTags?: string[];
  targetBucket?: string;
}) {
  const res = await fetch('/api/assets/bulk-upload', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function ingestAssetFromUrl(payload: {
  url: string;
  customName?: string;
  targetBucket?: string;
  customTags?: string[];
}) {
  const res = await fetch('/api/assets/url-ingest', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteAsset(id: string) {
  const res = await fetch(`/api/assets/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return res.json();
}

export async function updateAsset(id: string, updates: Partial<StoredAsset>) {
  const res = await fetch(`/api/assets/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function generateGCSManifest(selectedAssetIds?: string[]) {
  const res = await fetch('/api/assets/generate-gcs-manifest', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ selectedAssetIds }),
  });
  return res.json();
}

export async function analyzeAssetWithAI(assetId: string) {
  const res = await fetch('/api/ai/analyze-asset', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ assetId }),
  });
  return res.json();
}

export async function generateAssetWithAI(payload: {
  prompt: string;
  assetType: 'SPEC_DOC' | 'DATASET' | 'SVG_DESIGN' | 'CODE_MODULE';
  targetName?: string;
}) {
  const res = await fetch('/api/ai/generate-asset', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function fetchSecurityAudits() {
  const res = await fetch('/api/security/audits', {
    headers: getHeaders(),
  });
  return res.json();
}

export async function runSecurityAudit() {
  const res = await fetch('/api/security/run-audit', {
    method: 'POST',
    headers: getHeaders(),
  });
  return res.json();
}
