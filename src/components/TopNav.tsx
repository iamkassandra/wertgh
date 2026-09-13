import { Shield, Lock, UploadCloud, Sparkles, FileCheck, Download, Smartphone, Laptop, LogOut, Radio } from 'lucide-react';
import { DeviceProfile } from '../types';

interface TopNavProps {
  deviceProfile: DeviceProfile;
  onSelectDeviceProfile: (p: DeviceProfile) => void;
  cloudLatencyMs: number;
  online: boolean;
  totalAssetsCount: number;
  onOpenUpload: () => void;
  onOpenAiGen: () => void;
  onOpenAudits: () => void;
  onOpenExport: () => void;
  onLockVault: () => void;
  activeView: 'ASSETS' | 'AUDITS';
  setActiveView: (view: 'ASSETS' | 'AUDITS') => void;
}

export default function TopNav({
  deviceProfile,
  onSelectDeviceProfile,
  cloudLatencyMs,
  online,
  totalAssetsCount,
  onOpenUpload,
  onOpenAiGen,
  onOpenAudits,
  onOpenExport,
  onLockVault,
  activeView,
  setActiveView,
}: TopNavProps) {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-850 px-3 sm:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand & Zero Trust Status */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-white font-['Cinzel',serif]">
                AEGIS FORTRESS
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ZERO TRUST
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
              <span className="hidden md:inline text-zinc-500">GCS BUCKET:</span>
              <span className="text-zinc-300 truncate max-w-[140px] sm:max-w-none">
                gs://aegis-founder-vault-prod-asia
              </span>
            </div>
          </div>
        </div>

        {/* Center: Real-Time Cloud Telemetry (Strictly Online, No Offline) */}
        <div className="hidden lg:flex items-center gap-3 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800/80 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Radio className={`w-3.5 h-3.5 ${online ? 'text-emerald-400 animate-pulse' : 'text-red-400'}`} />
            <span>CLOUD SYNC:</span>
            <span className="text-emerald-400 font-medium">{online ? `${cloudLatencyMs}ms` : 'OFFLINE LOCK'}</span>
          </div>
          <span className="text-zinc-700">|</span>
          <div className="flex items-center gap-1 text-zinc-400">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>AES-256 E2EE</span>
          </div>
          <span className="text-zinc-700">|</span>
          <div className="text-zinc-400">
            <span>OFFLINE: </span>
            <span className="text-emerald-400/90 font-semibold">BLOCKED</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Device Profile Switcher */}
          <div className="flex bg-zinc-900/90 p-1 rounded-lg border border-zinc-800 text-xs">
            <button
              onClick={() => onSelectDeviceProfile('iphone16pro')}
              title="Optimize view for iOS iPhone 16 Pro base specs"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                deviceProfile === 'iphone16pro'
                  ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSelectDeviceProfile('macbookm2')}
              title="Optimize view for macOS Tahoe MacBook Air 2022 M2 specs"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                deviceProfile === 'macbookm2'
                  ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* View Toggle */}
          <div className="hidden sm:flex bg-zinc-900/90 p-1 rounded-lg border border-zinc-800 text-xs font-medium">
            <button
              onClick={() => setActiveView('ASSETS')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                activeView === 'ASSETS'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Data Assets ({totalAssetsCount})
            </button>
            <button
              onClick={() => setActiveView('AUDITS')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                activeView === 'AUDITS'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileCheck className="w-3 h-3 text-emerald-400" />
              <span>Weekly Audits</span>
            </button>
          </div>

          {/* Rapid Bulk Upload Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold rounded-lg shadow-sm shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Bulk Ingest</span>
          </button>

          {/* AI Gen Suite Button */}
          <button
            onClick={onOpenAiGen}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-zinc-850 hover:bg-zinc-800 text-purple-300 hover:text-purple-200 text-xs font-medium rounded-lg border border-purple-500/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">AI Gen Suite</span>
          </button>

          {/* Download / Transfer at Will */}
          <button
            onClick={onOpenExport}
            title="Download/Transfer assets at will (GCS Manifest / ZIP Export)"
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-medium rounded-lg border border-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden md:inline">Transfer</span>
          </button>

          {/* Lock / Logout */}
          <button
            onClick={onLockVault}
            title="Purge session & Lock Zero-Trust Vault"
            className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-950/20 rounded-lg border border-transparent hover:border-red-800/40 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
