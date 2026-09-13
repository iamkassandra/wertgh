/**
 * Aegis Zero Trust Cloud Fortress
 * Internal enterprise-grade data hub & AI asset suite for a single autonomous founder.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Layers,
  FileCheck,
  UploadCloud,
  Sparkles,
  Download,
  AlertTriangle,
  Lock,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { StoredAsset, FounderSession, DeviceProfile, CloudSyncStatus } from './types';
import {
  fetchAssets,
  fetchCloudSyncStatus,
  deleteAsset,
  logoutFounder,
  analyzeAssetWithAI,
} from './services/api';
import AuthFortress from './components/AuthFortress';
import TopNav from './components/TopNav';
import DeviceSpecBar from './components/DeviceSpecBar';
import VisualAssetWall from './components/VisualAssetWall';
import AssetInspectModal from './components/AssetInspectModal';
import BulkUploadModal from './components/BulkUploadModal';
import AIGenSuiteModal from './components/AIGenSuiteModal';
import SecurityAuditDashboard from './components/SecurityAuditDashboard';
import TransferExportModal from './components/TransferExportModal';
import CloudInterlockBanner from './components/CloudInterlockBanner';

export default function App() {
  const [session, setSession] = useState<FounderSession | null>(null);
  const [deviceProfile, setDeviceProfile] = useState<DeviceProfile>('macbookm2');
  const [cloudStatus, setCloudStatus] = useState<CloudSyncStatus>({
    online: true,
    cloudLatencyMs: 14,
    activeBucket: 'gs://aegis-founder-vault-prod-asia',
    lastHeartbeat: new Date().toISOString(),
    syncedDevices: [],
    zeroTrustLock: false,
  });

  const [assets, setAssets] = useState<StoredAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<'ASSETS' | 'AUDITS'>('ASSETS');

  // Modals
  const [inspectingAsset, setInspectingAsset] = useState<StoredAsset | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAiGenOpen, setIsAiGenOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Auto-detect device profile on mount
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('iphone') || (window.innerWidth < 768 && 'ontouchstart' in window)) {
      setDeviceProfile('iphone16pro');
    } else {
      setDeviceProfile('macbookm2');
    }
  }, []);

  // Load assets from cloud vault
  const loadAssets = useCallback(async () => {
    if (!session) return;
    try {
      setLoadingAssets(true);
      const res = await fetchAssets();
      if (res.assets) {
        setAssets(res.assets);
      }
    } catch (err) {
      console.error('Failed to load assets from GCS bucket:', err);
    } finally {
      setLoadingAssets(false);
    }
  }, [session]);

  // Periodic Cloud Heartbeat (enforcing zero offline reliance)
  useEffect(() => {
    if (!session) return;

    loadAssets();

    const heartbeatInterval = setInterval(async () => {
      try {
        const status = await fetchCloudSyncStatus();
        setCloudStatus(status);
      } catch (err) {
        console.warn('Cloud heartbeat packet dropped. Zero-Trust perimeter locking.');
        setCloudStatus((prev) => ({ ...prev, online: false }));
      }
    }, 15000);

    return () => clearInterval(heartbeatInterval);
  }, [session, loadAssets]);

  // Keyboard Shortcuts (macOS Tahoe style)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        setIsUploadOpen(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        setIsAiGenOpen(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsExportOpen(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        handleLockVault();
      } else if (e.key === 'Escape') {
        setIsUploadOpen(false);
        setIsAiGenOpen(false);
        setIsExportOpen(false);
        setInspectingAsset(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLockVault = async () => {
    try {
      await logoutFounder();
    } catch (e) {
      // ignore
    }
    setSession(null);
    setSelectedAssetIds([]);
  };

  const handleToggleSelectAsset = (id: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllAssets = () => {
    if (selectedAssetIds.length === assets.length) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(assets.map((a) => a.id));
    }
  };

  const handleDeleteAsset = async (id: string) => {
    const target = assets.find((a) => a.id === id);
    if (!target) return;
    const confirmShred = window.confirm(
      `Zero-Trust Purge: Are you sure you want to permanently shred "${target.name}" from the Google Cloud Bucket?`
    );
    if (!confirmShred) return;

    try {
      await deleteAsset(id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
      setSelectedAssetIds((prev) => prev.filter((item) => item !== id));
      if (inspectingAsset?.id === id) setInspectingAsset(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleDownloadSingleAsset = (asset: StoredAsset) => {
    let blob: Blob;
    if (asset.dataBase64) {
      const binary = atob(asset.dataBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      blob = new Blob([bytes], { type: asset.mimeType });
    } else {
      blob = new Blob([asset.contentPreview || ''], { type: asset.mimeType });
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = asset.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAnalyzeAsset = async (asset: StoredAsset) => {
    try {
      const res = await analyzeAssetWithAI(asset.id);
      if (res.success && res.updatedAsset) {
        setAssets((prev) => prev.map((a) => (a.id === asset.id ? res.updatedAsset : a)));
        if (inspectingAsset?.id === asset.id) {
          setInspectingAsset(res.updatedAsset);
        }
      }
    } catch (err) {
      console.error('AI inspection failed:', err);
    }
  };

  // If not authenticated, show zero-trust credential & MFA portal
  if (!session) {
    return (
      <AuthFortress
        onAuthenticated={(newSession) => setSession(newSession)}
        deviceProfile={deviceProfile}
        onSelectDeviceProfile={setDeviceProfile}
      />
    );
  }

  const isIPhoneMode = deviceProfile === 'iphone16pro';

  return (
    <div
      className={`min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] ${
        isIPhoneMode ? 'max-w-md mx-auto border-x border-zinc-800/80 shadow-2xl min-h-screen' : ''
      }`}
    >
      {/* Strict No-Offline Reliance Interlock */}
      <CloudInterlockBanner onLockOut={handleLockVault} />

      {/* Top Telemetry & Control Navigation */}
      <TopNav
        deviceProfile={deviceProfile}
        onSelectDeviceProfile={setDeviceProfile}
        cloudLatencyMs={cloudStatus.cloudLatencyMs}
        online={cloudStatus.online}
        totalAssetsCount={assets.length}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAiGen={() => setIsAiGenOpen(true)}
        onOpenAudits={() => setActiveView('AUDITS')}
        onOpenExport={() => setIsExportOpen(true)}
        onLockVault={handleLockVault}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Device Hardware Spec Bar */}
      <DeviceSpecBar
        profile={deviceProfile}
        onSwitch={setDeviceProfile}
        syncTimestamp={new Date().toLocaleTimeString()}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-6 max-w-7xl w-full mx-auto space-y-5">
        {/* Dynamic View: Assets Wall vs Security Audit Dashboard */}
        {activeView === 'ASSETS' ? (
          <VisualAssetWall
            assets={assets}
            loading={loadingAssets}
            selectedIds={selectedAssetIds}
            onToggleSelect={handleToggleSelectAsset}
            onSelectAll={handleSelectAllAssets}
            onClearSelection={() => setSelectedAssetIds([])}
            onInspectAsset={(a) => setInspectingAsset(a)}
            onAnalyzeAsset={handleAnalyzeAsset}
            onDeleteAsset={handleDeleteAsset}
            onDownloadAsset={handleDownloadSingleAsset}
            deviceProfile={deviceProfile}
          />
        ) : (
          <SecurityAuditDashboard onAuditExecuted={loadAssets} />
        )}
      </main>

      {/* Footer System Telemetry */}
      <footer className="border-t border-zinc-850/80 py-3 px-4 sm:px-6 bg-zinc-950/80 text-[11px] font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>AEGIS SENTINEL 5.0 • AUTONOMOUS FOUNDER FORTRESS</span>
          </div>
          <div className="flex items-center gap-3">
            <span>OFFLINE CACHING: PROHIBITED</span>
            <span>•</span>
            <span className="text-zinc-400">GCS BUCKET: asia-southeast1</span>
            <span>•</span>
            <span className="text-emerald-400">E2EE: AES-256-GCM</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {inspectingAsset && (
        <AssetInspectModal
          asset={inspectingAsset}
          onClose={() => setInspectingAsset(null)}
          onDownload={handleDownloadSingleAsset}
          onAssetUpdated={(updated) => {
            setAssets((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
            setInspectingAsset(updated);
          }}
        />
      )}

      {isUploadOpen && (
        <BulkUploadModal
          onClose={() => setIsUploadOpen(false)}
          onUploadComplete={loadAssets}
          deviceProfile={deviceProfile}
        />
      )}

      {isAiGenOpen && (
        <AIGenSuiteModal
          onClose={() => setIsAiGenOpen(false)}
          onAssetGenerated={(newAsset) => {
            setAssets((prev) => [newAsset, ...prev]);
          }}
        />
      )}

      {isExportOpen && (
        <TransferExportModal
          assets={assets}
          onClose={() => setIsExportOpen(false)}
        />
      )}
    </div>
  );
}
