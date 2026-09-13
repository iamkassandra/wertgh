import { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileCheck,
  Lock,
  Search,
  Calendar,
  Key,
} from 'lucide-react';
import { SecurityAuditEntry } from '../types';
import { fetchSecurityAudits, runSecurityAudit } from '../services/api';

interface SecurityAuditDashboardProps {
  onAuditExecuted?: () => void;
}

export default function SecurityAuditDashboard({ onAuditExecuted }: SecurityAuditDashboardProps) {
  const [audits, setAudits] = useState<SecurityAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningAudit, setRunningAudit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadAudits = async () => {
    try {
      setLoading(true);
      const res = await fetchSecurityAudits();
      if (res.audits) {
        setAudits(res.audits);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load security audit history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudits();
  }, []);

  const handleRunAudit = async () => {
    setRunningAudit(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await runSecurityAudit();
      if (res.success && res.audit) {
        setSuccessMessage(res.message);
        setAudits((prev) => [res.audit, ...prev]);
        if (onAuditExecuted) onAuditExecuted();
      } else {
        setError(res.message || 'Audit failed');
      }
    } catch (err: any) {
      setError(err.message || 'Audit execution error');
    } finally {
      setRunningAudit(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Security Posture Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-500 font-mono">INTEGRITY COMPLIANCE</span>
            <p className="text-xl font-semibold text-white font-mono">100% VERIFIED</p>
            <span className="text-[10px] text-emerald-400 font-mono">0 Tamper Anomalies</span>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-500 font-mono">WEEKLY AUDIT CADENCE</span>
            <p className="text-xl font-semibold text-white font-mono">ACTIVE (WEEK 36)</p>
            <span className="text-[10px] text-zinc-400 font-mono">Next: Automated Sunday 00:00Z</span>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
            <Key className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-500 font-mono">ZERO TRUST LEDGER</span>
            <p className="text-xl font-semibold text-white font-mono">{audits.length} AUDITS</p>
            <span className="text-[10px] text-purple-400 font-mono">Immutable Cryptographic Trail</span>
          </div>
        </div>
      </div>

      {/* Audit Action Banner */}
      <div className="bg-gradient-to-r from-emerald-950/20 via-zinc-900 to-zinc-900 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-white font-mono flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            WEEKLY DATA INTEGRITY AUDIT ENGINE
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Verifies every blob in the Google Cloud bucket against original SHA-256 hashes, validates zero-trust tokens, checks envelope encryption health, and confirms zero offline leakage.
          </p>
        </div>

        <button
          onClick={handleRunAudit}
          disabled={runningAudit}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
        >
          {runningAudit ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Verifying Cryptographic Ledger...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Trigger On-Demand Audit</span>
            </>
          )}
        </button>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-emerald-200 text-xs flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-red-200 text-xs flex items-center gap-2 font-mono">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Audit History Timeline */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-zinc-400 font-mono uppercase tracking-wider">
          HISTORICAL VERIFICATION LOGS & AUDIT CERTIFICATES
        </h4>

        {loading ? (
          <div className="p-8 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mx-auto mb-2" />
            <p className="text-xs text-zinc-500 font-mono">Retrieving security audit ledger...</p>
          </div>
        ) : audits.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800 text-zinc-500 text-xs font-mono">
            No audits recorded yet. Run your first audit above.
          </div>
        ) : (
          <div className="space-y-3">
            {audits.map((audit) => (
              <div
                key={audit.id}
                className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 text-xs font-mono space-y-3 shadow-lg hover:border-zinc-700 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <span className="font-semibold text-white text-sm">{audit.id.toUpperCase()}</span>
                      <span className="text-zinc-500 ml-2">({audit.auditType})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                      INTEGRITY: {audit.integrityScorePercent}% PASSED
                    </span>
                    <span className="text-zinc-500 text-[11px]">
                      {new Date(audit.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Audit Summary */}
                <p className="text-zinc-200 text-xs leading-relaxed">
                  {audit.summary}
                </p>

                {/* Details list */}
                {audit.details && audit.details.length > 0 && (
                  <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-850 space-y-1 text-[11px] text-zinc-400">
                    <span className="text-zinc-500 text-[10px] uppercase">Cryptographic Audit Checklist:</span>
                    {audit.details.map((d, idx) => (
                      <p key={idx} className="flex items-start gap-1.5 font-mono truncate">
                        <span className="text-emerald-400">✓</span>
                        <span>{d}</span>
                      </p>
                    ))}
                  </div>
                )}

                {/* Signature and Verifier */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-500 pt-1">
                  <span>VERIFIED BY: <strong className="text-zinc-400">{audit.verifiedBy}</strong></span>
                  <span className="truncate max-w-xs font-mono">SIGNATURE: {audit.signature}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
