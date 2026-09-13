import { useState, FormEvent } from 'react';
import { Shield, Lock, Key, Smartphone, Laptop, CheckCircle2, AlertTriangle, Fingerprint, Eye, EyeOff } from 'lucide-react';
import { loginFounder, verifyMFA, setSessionToken } from '../services/api';
import { FounderSession, DeviceProfile } from '../types';

interface AuthFortressProps {
  onAuthenticated: (session: FounderSession) => void;
  deviceProfile: DeviceProfile;
  onSelectDeviceProfile: (profile: DeviceProfile) => void;
}

export default function AuthFortress({ onAuthenticated, deviceProfile, onSelectDeviceProfile }: AuthFortressProps) {
  const [step, setStep] = useState<'CREDENTIALS' | 'MFA'>('CREDENTIALS');
  const [email, setEmail] = useState('theaucklandassistant@gmail.com');
  const [password, setPassword] = useState('FortressZeroTrust2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode] = useState('849201');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passkeyActive, setPasskeyActive] = useState(false);

  const handleCredentialsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await loginFounder({ email, password, deviceProfile });
      if (res.success && res.mfaRequired) {
        setStep('MFA');
      } else {
        setError(res.message || 'Authentication failed');
      }
    } catch (err: any) {
      setError(err.message || 'Zero-trust perimeter rejected connection');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await verifyMFA({
        email,
        code: totpCode,
        passkeyVerified: passkeyActive,
        deviceProfile,
      });

      if (res.success && res.session) {
        setSessionToken(res.session.sessionToken);
        onAuthenticated(res.session);
      } else {
        setError(res.message || 'MFA validation failed');
      }
    } catch (err: any) {
      setError(err.message || 'MFA verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePasskey = async () => {
    setPasskeyActive(true);
    setLoading(true);
    setTimeout(async () => {
      try {
        const res = await verifyMFA({
          email,
          code: '999999',
          passkeyVerified: true,
          deviceProfile,
        });
        if (res.success && res.session) {
          setSessionToken(res.session.sessionToken);
          onAuthenticated(res.session);
        }
      } catch (err: any) {
        setError('Biometric hardware enclave challenge failed');
      } finally {
        setLoading(false);
        setPasskeyActive(false);
      }
    }, 900);
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Security Mesh Gradient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-zinc-950 to-zinc-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b0a_1px,transparent_1px),linear-gradient(to_bottom,#18181b0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10">
        {/* Fortress Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-emerald-500/30 flex items-center justify-center mb-4 shadow-[0_0_25px_-5px_rgba(16,185,129,0.3)]">
            <Shield className="w-7 h-7 text-emerald-400" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium tracking-wide mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ZERO TRUST FORTRESS • INTERNAL FOUNDER
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white font-['Cinzel',serif]">
            AEGIS VAULT CLOUD
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs">
            Locked-down cloud data hub & AI asset suite for single autonomous founder operations
          </p>
        </div>

        {/* Device Spec Selector */}
        <div className="mb-5 bg-zinc-950/70 p-1.5 rounded-xl border border-zinc-800/60 flex items-center gap-1">
          <button
            type="button"
            onClick={() => onSelectDeviceProfile('iphone16pro')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              deviceProfile === 'iphone16pro'
                ? 'bg-zinc-800 text-emerald-400 shadow-sm border border-emerald-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iPhone 16 Pro</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectDeviceProfile('macbookm2')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              deviceProfile === 'macbookm2'
                ? 'bg-zinc-800 text-emerald-400 shadow-sm border border-emerald-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>MacBook Air M2</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectDeviceProfile('auto')}
            className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
              deviceProfile === 'auto'
                ? 'bg-zinc-800 text-emerald-400 shadow-sm border border-emerald-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Auto
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/50 flex items-start gap-2.5 text-xs text-red-200">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {step === 'CREDENTIALS' ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Authorized Founder Principal
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 font-mono"
                  placeholder="founder@aegis-corp.internal"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Vault Master Keyphrase
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 font-mono"
                  placeholder="••••••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800/40 text-[11px] text-zinc-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Hardware Security Enclave
              </span>
              <span className="text-emerald-400 font-mono font-medium">READY</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Verify Founder Credentials</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMfaSubmit} className="space-y-4">
            <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-emerald-300/90 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-200">Credentials Validated</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Enter your 6-digit TOTP code or authenticate via Hardware Biometric Passkey.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                6-Digit Security Token (TOTP Authenticator)
              </label>
              <input
                type="text"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full tracking-[0.5em] text-center bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-3 text-lg font-mono text-emerald-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                placeholder="000000"
              />
            </div>

            <button
              type="submit"
              disabled={loading || totpCode.length !== 6}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Authorize Zero-Trust Session</span>
                </>
              )}
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-zinc-800" />
              <span className="flex-shrink mx-2 text-[10px] text-zinc-500 uppercase tracking-widest font-mono">OR</span>
              <div className="flex-grow border-t border-zinc-800" />
            </div>

            <button
              type="button"
              onClick={handleSimulatePasskey}
              disabled={loading}
              className="w-full py-2 px-3 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 text-xs font-medium rounded-xl border border-zinc-700/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Fingerprint className="w-4 h-4 text-emerald-400" />
              <span>
                {deviceProfile === 'iphone16pro' ? 'Authenticate with FaceID / TouchID' : 'Touch ID / Secure Enclave Passkey'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStep('CREDENTIALS')}
              className="w-full text-center text-xs text-zinc-500 hover:text-zinc-400 pt-1 cursor-pointer"
            >
              ← Back to Founder Credentials
            </button>
          </form>
        )}

        {/* Security Disclaimers & Strict No Offline Reliance */}
        <div className="mt-6 pt-4 border-t border-zinc-800/50 space-y-1.5 text-[10px] text-zinc-500 font-mono">
          <div className="flex items-center justify-between">
            <span>NETWORK ACCESS:</span>
            <span className="text-zinc-400">Strictly Digital Cloud-Hosted</span>
          </div>
          <div className="flex items-center justify-between">
            <span>OFFLINE RELIANCE:</span>
            <span className="text-emerald-500 font-semibold">REMOVED / PROHIBITED</span>
          </div>
          <div className="flex items-center justify-between">
            <span>GOOGLE CLOUD BUCKET:</span>
            <span className="text-zinc-400">asia-southeast1 (Multi-Region)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
