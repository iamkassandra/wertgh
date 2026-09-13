import { useState, FormEvent } from 'react';
import {
  X,
  Sparkles,
  FileCode,
  Database,
  Image as ImageIcon,
  Bot,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { generateAssetWithAI } from '../services/api';
import { StoredAsset } from '../types';

interface AIGenSuiteModalProps {
  onClose: () => void;
  onAssetGenerated: (newAsset: StoredAsset) => void;
}

export default function AIGenSuiteModal({ onClose, onAssetGenerated }: AIGenSuiteModalProps) {
  const [assetType, setAssetType] = useState<'SPEC_DOC' | 'DATASET' | 'SVG_DESIGN' | 'CODE_MODULE'>('SPEC_DOC');
  const [prompt, setPrompt] = useState(
    'Design an autonomous agent orchestration pipeline for a solo AI-driven founder, with task queues, priority weights, and fallback models.'
  );
  const [targetName, setTargetName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ asset: StoredAsset; raw: string } | null>(null);

  const presetPrompts: Record<string, string> = {
    SPEC_DOC:
      'Design an autonomous agent orchestration pipeline for a solo AI-driven founder, with task queues, priority weights, and fallback models.',
    DATASET:
      'Generate a synthetic JSON dataset of 10 enterprise zero-trust security audit logs with hardware hashes, timestamps, and threat ratings.',
    SVG_DESIGN:
      'Generate a minimalist, cybernetic geometric emblem of a fortress shield with glowing circuit nodes in emerald and obsidian.',
    CODE_MODULE:
      'Write a production-grade TypeScript cloud storage sync controller that verifies cryptographic SHA-256 integrity before writing to GCS.',
  };

  const handleSelectType = (type: 'SPEC_DOC' | 'DATASET' | 'SVG_DESIGN' | 'CODE_MODULE') => {
    setAssetType(type);
    setPrompt(presetPrompts[type]);
    setSuccessResult(null);
  };

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setGenerating(true);
    setError(null);
    setSuccessResult(null);

    try {
      const res = await generateAssetWithAI({
        prompt: prompt.trim(),
        assetType,
        targetName: targetName.trim() || undefined,
      });

      if (res.success && res.asset) {
        setSuccessResult({ asset: res.asset, raw: res.rawContent });
        onAssetGenerated(res.asset);
      } else {
        setError(res.message || 'AI generation failed');
      }
    } catch (err: any) {
      setError(err.message || 'AI Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-zinc-900 border border-purple-500/30 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-950/40 border border-purple-500/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-semibold text-white font-mono">
                  FOUNDER AI GENERATION SUITE
                </h2>
                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-mono">
                  GEMINI 3.8 FLASH
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Generate specs, data schemas, vectors, and agent code directly into GCS Vault
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs font-mono">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-red-200 text-xs">
              {error}
            </div>
          )}

          {/* Generator Type Selector */}
          <div>
            <label className="block text-zinc-400 text-xs mb-2">Select Generator Mode:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'SPEC_DOC' as const, label: 'Technical Spec', icon: FileCode },
                { type: 'DATASET' as const, label: 'Synthetic Data', icon: Database },
                { type: 'SVG_DESIGN' as const, label: 'Vector SVG', icon: ImageIcon },
                { type: 'CODE_MODULE' as const, label: 'Agent Code', icon: Bot },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = assetType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleSelectType(item.type)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/30 border-purple-500/50 text-purple-300 shadow-md ring-1 ring-purple-500/30'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-xs mb-1.5">
                Target Artifact Name (Optional):
              </label>
              <input
                type="text"
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                placeholder="e.g. founder_agent_pipeline_q3"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-xs mb-1.5">
                AI Generation Prompt:
              </label>
              <textarea
                rows={4}
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 leading-relaxed font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={generating || !prompt.trim()}
              className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {generating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing via Gemini 3.8 Flash...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate, Encrypt & Commit to GCS Bucket</span>
                </>
              )}
            </button>
          </form>

          {/* Success Preview */}
          {successResult && (
            <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Generated Asset Encrypted & Stored Successfully!
                </span>
                <span className="text-zinc-500 text-[11px] font-mono">
                  {successResult.asset.gcsUri}
                </span>
              </div>

              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-[11px] font-mono text-zinc-300 max-h-48 overflow-y-auto leading-relaxed">
                <pre>{successResult.raw}</pre>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>SHA-256: {successResult.asset.sha256Hash.substring(0, 16)}...</span>
                </div>
                <button
                  onClick={onClose}
                  className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium cursor-pointer"
                >
                  View in Vault Wall
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
