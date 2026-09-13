import { Smartphone, Laptop, Check, Zap, Command, ShieldCheck, RefreshCw } from 'lucide-react';
import { DeviceProfile } from '../types';

interface DeviceSpecBarProps {
  profile: DeviceProfile;
  onSwitch: (p: DeviceProfile) => void;
  syncTimestamp: string;
}

export default function DeviceSpecBar({ profile, onSwitch, syncTimestamp }: DeviceSpecBarProps) {
  const isIPhone = profile === 'iphone16pro';
  const isMac = profile === 'macbookm2';

  return (
    <div className="bg-zinc-900/60 border-b border-zinc-800/60 px-4 py-2 text-xs font-mono">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Active Profile Info */}
        <div className="flex items-center gap-2.5">
          <span className="text-zinc-500 font-semibold">HARDWARE PROFILE:</span>
          {isIPhone && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Smartphone className="w-3.5 h-3.5" />
              <span className="font-semibold">iOS iPhone 16 Pro (A18 Pro • 128GB Base • 120Hz ProMotion)</span>
            </div>
          )}
          {isMac && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Laptop className="w-3.5 h-3.5" />
              <span className="font-semibold">macOS Tahoe MacBook Air 2022 (Apple M2 Base • 8GB Unified • 256GB SSD)</span>
            </div>
          )}
          {profile === 'auto' && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
              <span>Adaptive Responsive Cloud Stream</span>
            </div>
          )}
        </div>

        {/* Device Feature Highlights */}
        <div className="flex items-center gap-4 text-zinc-400 text-[11px]">
          {isIPhone ? (
            <>
              <span className="flex items-center gap-1 text-emerald-400/90">
                <Zap className="w-3 h-3" />
                ProMotion 120fps Gesture Layer
              </span>
              <span className="hidden sm:flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                iOS Secure Enclave E2EE
              </span>
            </>
          ) : isMac ? (
            <>
              <span className="flex items-center gap-1 text-blue-400">
                <Command className="w-3 h-3" />
                ⌘K Quick Command • Space to Quick-Look
              </span>
              <span className="hidden sm:flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                M2 Apple Silicon Hardware AES Accelerator
              </span>
            </>
          ) : (
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" />
              Cross-Platform GCS Synchronization Active
            </span>
          )}

          <div className="flex items-center gap-1 text-zinc-500">
            <RefreshCw className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Synced {syncTimestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
