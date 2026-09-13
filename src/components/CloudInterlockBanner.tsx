import { useState, useEffect } from 'react';
import { CloudOff, ShieldAlert, Wifi, RefreshCw, Lock } from 'lucide-react';

interface CloudInterlockBannerProps {
  onLockOut: () => void;
}

export default function CloudInterlockBanner({ onLockOut }: CloudInterlockBannerProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [interlockTripped, setInterlockTripped] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setInterlockTripped(true);
      // Immediately enforce zero offline reliance: Lock out founder session!
      onLockOut();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onLockOut]);

  if (!interlockTripped && isOnline) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-red-500/50 rounded-2xl p-6 text-center shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-red-950/50 border border-red-500/40 flex items-center justify-center mx-auto mb-4 text-red-400">
          <CloudOff className="w-7 h-7" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono mb-2">
          <ShieldAlert className="w-3.5 h-3.5" />
          ZERO-TRUST CLOUD INTERLOCK TRIPPED
        </div>
        <h2 className="text-lg font-semibold text-white">Cloud Connection Severed</h2>
        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
          In accordance with strict Zero-Trust policy: <strong className="text-zinc-200">all offline caching and local persistence are prohibited</strong>. Stored memory has been purged. Reconnect to high-speed cloud infrastructure to re-authenticate with your founder credentials.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Verify Cloud Reconnection</span>
          </button>
        </div>
      </div>
    </div>
  );
}
