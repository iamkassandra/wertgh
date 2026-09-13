import { useState } from 'react';
import {
  X,
  Lock,
  ShieldCheck,
  Sparkles,
  Download,
  Copy,
  Check,
  Tag,
  Calendar,
  Layers,
  FileCode,
  ExternalLink,
} from 'lucide-react';
import { StoredAsset } from '../types';
import { analyzeAssetWithAI, updateAsset } from '../services/api';

interface AssetInspectModalProps {
  asset: StoredAsset | null;
  onClose: () => void;
  onDownload: (asset: StoredAsset) => void;
  onAssetUpdated: (updated: StoredAsset) => void;
}

export default function AssetInspectModal({
  asset,
  onClose,
  onDownload,
  onAssetUpdated,
}: AssetInspectModalProps) {
  if (!asset) return null;

  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedUri, setCopiedUri] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const copyToClipboard = (text: string, type: 'hash' | 'uri') => {
    navigator.clipboard.writeText(text);
    if (type === 'hash') {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } else {
      setCopiedUri(true);
      setTimeout(() => setCopiedUri(false), 2000);
    }
  };

  const handleRunAiAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await analyzeAssetWithAI(asset.id);
      if (res.success && res.updatedAsset) {
        onAssetUpdated(res.updatedAsset);
      }
    } catch (err) {
      console.error('AI analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTagInput.trim()) return;
    const formatted = newTagInput.trim().startsWith('#') ? newTagInput.trim() : `#${newTagInput.trim()}`;
    if (asset.tags.includes(formatted)) return;

    const updatedTags = [...asset.tags, formatted];
    try {
      const res = await updateAsset(asset.id, { tags: updatedTags });
      if (res.success && res.asset) {
        onAssetUpdated(res.asset);
        setNewTagInput('');
      }
    } catch (err) {
      console.error('Failed to add tag:', err);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedTags = asset.tags.filter((t) => t !== tagToRemove);
    try {
      const res = await updateAsset(asset.id, { tags: updatedTags });
      if (res.success && res.asset) {
        onAssetUpdated(res.asset);
      }
    } catch (err) {
      console.error('Failed to remove tag:', err);
    }
  };

  // Determine media preview
  const isImage = asset.fileTypeCategory === 'IMAGE' || asset.mimeType.startsWith('image/');
  const isAudio = asset.fileTypeCategory === 'AUDIO' || asset.mimeType.startsWith('audio/');
  const isCodeOrJson = asset.fileTypeCategory === 'CODE_CONFIG' || asset.fileTypeCategory === 'DATA_JSON';

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-zinc-950 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-semibold text-white font-mono truncate">
                  {asset.name}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  VERIFIED CLEAN
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-mono truncate">{asset.gcsUri}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownload(asset)}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Decrypted Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs font-mono">
          {/* Visual Asset Preview Section */}
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800/80 p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-2 text-zinc-400 text-[11px]">
              <span>ASSET PREVIEW & CONTENT PAYLOAD</span>
              <span className="text-emerald-400">ENVELOPE DECRYPTED (IN-MEMORY)</span>
            </div>

            {isImage && asset.contentPreview && asset.contentPreview.startsWith('<svg') ? (
              <div
                className="w-full flex items-center justify-center p-8 bg-zinc-900/50 rounded-xl border border-zinc-800"
                dangerouslySetInnerHTML={{ __html: asset.contentPreview }}
              />
            ) : isImage && asset.dataBase64 ? (
              <div className="w-full flex items-center justify-center p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 max-h-80 overflow-hidden">
                <img
                  src={`data:${asset.mimeType};base64,${asset.dataBase64}`}
                  alt={asset.name}
                  className="max-h-72 object-contain rounded-lg shadow-md"
                />
              </div>
            ) : isCodeOrJson && asset.contentPreview ? (
              <pre className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-850 text-emerald-300/90 text-xs overflow-x-auto max-h-72 leading-relaxed">
                <code>{asset.contentPreview}</code>
              </pre>
            ) : asset.contentPreview ? (
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-850 text-zinc-300 text-xs max-h-60 overflow-y-auto">
                {asset.contentPreview}
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500 rounded-xl bg-zinc-900/30">
                <FileCode className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                <p>Binary encrypted object payload stored in Google Cloud Bucket.</p>
                <p className="text-[10px] text-zinc-600 mt-1">Use Decrypted Download to extract full object.</p>
              </div>
            )}
          </div>

          {/* AI Vision & Intelligence Inspection */}
          <div className="bg-gradient-to-br from-purple-950/20 via-zinc-950 to-zinc-950 p-4 rounded-2xl border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-purple-300 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>GEMINI AI ASSET INTELLIGENCE</span>
              </div>
              <button
                onClick={handleRunAiAnalysis}
                disabled={analyzing}
                className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg border border-purple-500/30 text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <div className="w-3 h-3 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    <span>Run AI Analysis</span>
                  </>
                )}
              </button>
            </div>

            {asset.aiSummary ? (
              <p className="text-zinc-200 text-xs leading-relaxed bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                {asset.aiSummary}
              </p>
            ) : (
              <p className="text-zinc-500 text-[11px]">
                Click &quot;Run AI Analysis&quot; to inspect this asset with Gemini 3.8 Flash, generate autonomous executive summaries, and extract high-signal tags.
              </p>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1">
              <span className="text-zinc-500 text-[10px]">GOOGLE CLOUD STORAGE URI</span>
              <div className="flex items-center justify-between text-zinc-200 text-xs">
                <span className="truncate mr-2 font-mono">{asset.gcsUri}</span>
                <button
                  onClick={() => copyToClipboard(asset.gcsUri, 'uri')}
                  className="p-1 text-zinc-400 hover:text-zinc-200"
                >
                  {copiedUri ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1">
              <span className="text-zinc-500 text-[10px]">IMMUTABLE SHA-256 CHECKSUM</span>
              <div className="flex items-center justify-between text-zinc-200 text-xs">
                <span className="truncate mr-2 font-mono">{asset.sha256Hash}</span>
                <button
                  onClick={() => copyToClipboard(asset.sha256Hash, 'hash')}
                  className="p-1 text-zinc-400 hover:text-zinc-200"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1">
              <span className="text-zinc-500 text-[10px]">ENCRYPTION SPECIFICATION</span>
              <p className="text-emerald-400 font-semibold text-xs">
                {asset.encryptionAlgorithm} (256-bit Envelope)
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1">
              <span className="text-zinc-500 text-[10px]">INCOMING CHRONOLOGY TAGS</span>
              <p className="text-zinc-300 text-xs">
                Date: {asset.dateCategory} • Quarter: {asset.quarterCategory}
              </p>
            </div>
          </div>

          {/* Tag Management */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
            <span className="text-zinc-400 text-xs font-semibold flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              SEMANTIC TAGS & CLASSIFICATIONS
            </span>
            <div className="flex flex-wrap gap-1.5">
              {asset.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-750 text-xs text-emerald-300"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-zinc-500 hover:text-red-400 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Add Tag Input */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add new tag (e.g. #investor-deck)..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/40"
              />
              <button
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-xl transition-all cursor-pointer"
              >
                Add Tag
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
