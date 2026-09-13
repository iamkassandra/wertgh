import { useState, useRef, DragEvent, FormEvent } from 'react';
import {
  X,
  UploadCloud,
  Globe,
  File,
  CheckCircle2,
  Lock,
  Calendar,
  Layers,
  AlertCircle,
  Tag,
  Laptop,
  Smartphone,
} from 'lucide-react';
import { bulkUploadAssets, ingestAssetFromUrl } from '../services/api';
import { computeSHA256 } from '../services/crypto';
import { DeviceProfile } from '../types';

interface BulkUploadModalProps {
  onClose: () => void;
  onUploadComplete: () => void;
  deviceProfile: DeviceProfile;
}

interface StagedFile {
  file: File;
  name: string;
  size: number;
  mimeType: string;
  category: string;
  sha256: string;
  dataBase64?: string;
  contentPreview?: string;
}

export default function BulkUploadModal({
  onClose,
  onUploadComplete,
  deviceProfile,
}: BulkUploadModalProps) {
  const [activeTab, setActiveTab] = useState<'LOCAL_FILES' | 'URL_INGEST'>('LOCAL_FILES');
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // URL Ingest inputs
  const [ingestUrl, setIngestUrl] = useState('');
  const [customUrlName, setCustomUrlName] = useState('');
  const [targetBucket, setTargetBucket] = useState('gs://aegis-founder-vault-prod-asia');
  const [customTagsInput, setCustomTagsInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to categorize
  const categorize = (mime: string, name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext)) return 'IMAGE';
    if (mime.startsWith('video/') || ['mp4', 'mov', 'webm'].includes(ext)) return 'VIDEO';
    if (mime.startsWith('audio/') || ['mp3', 'wav', 'm4a'].includes(ext)) return 'AUDIO';
    if (['json', 'csv', 'tsv'].includes(ext) || mime.includes('json') || mime.includes('csv')) return 'DATA_JSON';
    if (['ts', 'tsx', 'js', 'py', 'yaml', 'yml', 'env', 'sh'].includes(ext)) return 'CODE_CONFIG';
    return 'DOCUMENT';
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);

    const staged: StagedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const buffer = await file.arrayBuffer();
      const sha256 = await computeSHA256(buffer);

      // Convert to base64 for upload
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let b = 0; b < bytes.byteLength; b++) {
        binary += String.fromCharCode(bytes[b]);
      }
      const dataBase64 = btoa(binary);

      let contentPreview: string | undefined;
      if (file.type.startsWith('text/') || file.name.endsWith('.json') || file.name.endsWith('.md') || file.name.endsWith('.ts')) {
        const text = new TextDecoder().decode(buffer);
        contentPreview = text.substring(0, 500);
      }

      staged.push({
        file,
        name: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        category: categorize(file.type, file.name),
        sha256,
        dataBase64,
        contentPreview,
      });
    }

    setStagedFiles((prev) => [...prev, ...staged]);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleRemoveStaged = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBulkUploadSubmit = async () => {
    if (stagedFiles.length === 0) return;
    setUploading(true);
    setError(null);

    const customTags = customTagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      const payload = {
        files: stagedFiles.map((sf) => ({
          name: sf.name,
          mimeType: sf.mimeType,
          sizeBytes: sf.size,
          dataBase64: sf.dataBase64,
          contentPreview: sf.contentPreview,
        })),
        targetBucket,
        customTags,
      };

      const res = await bulkUploadAssets(payload);
      if (res.success) {
        setSuccessMessage(`Successfully ingested and encrypted ${stagedFiles.length} assets to ${targetBucket}.`);
        setStagedFiles([]);
        setTimeout(() => {
          onUploadComplete();
          onClose();
        }, 1200);
      } else {
        setError(res.message || 'Bulk upload failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete cloud bucket ingest');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlIngestSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ingestUrl.trim()) return;

    setUploading(true);
    setError(null);

    const customTags = customTagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      const res = await ingestAssetFromUrl({
        url: ingestUrl.trim(),
        customName: customUrlName.trim() || undefined,
        targetBucket,
        customTags,
      });

      if (res.success) {
        setSuccessMessage(`URL asset downloaded and stored: ${res.asset.gcsUri}`);
        setIngestUrl('');
        setCustomUrlName('');
        setTimeout(() => {
          onUploadComplete();
          onClose();
        }, 1200);
      } else {
        setError(res.message || 'URL ingestion failed');
      }
    } catch (err: any) {
      setError(err.message || 'URL ingest failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-950 border border-emerald-500/30 flex items-center justify-center">
              <UploadCloud className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white font-mono">
                RAPID CLOUD INGESTION
              </h2>
              <p className="text-xs text-zinc-400">
                Direct encrypted bulk upload & URL ingest to Google Cloud Bucket
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

        {/* Tab Selector */}
        <div className="px-6 pt-4 flex gap-2 border-b border-zinc-800/80 bg-zinc-950/40">
          <button
            onClick={() => setActiveTab('LOCAL_FILES')}
            className={`pb-2.5 px-3 text-xs font-mono font-medium flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'LOCAL_FILES'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Bulk Local Files</span>
          </button>
          <button
            onClick={() => setActiveTab('URL_INGEST')}
            className={`pb-2.5 px-3 text-xs font-mono font-medium flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'URL_INGEST'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Remote URL Ingest</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs font-mono">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-red-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-emerald-200 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Target Cloud Bucket & Automatic Tagging Preview */}
          <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-[11px] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                TARGET GOOGLE CLOUD BUCKET
              </span>
              <span className="text-emerald-400 text-[10px] font-semibold">AES-256 ENVELOPE</span>
            </div>
            <input
              type="text"
              value={targetBucket}
              onChange={(e) => setTargetBucket(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-emerald-500/40"
            />

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-zinc-400">
              <span className="text-zinc-500">Auto-Incoming Tags:</span>
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-300">
                #date-{todayStr}
              </span>
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-300">
                #2026-Q3
              </span>
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                #type-[auto-detected]
              </span>
            </div>
          </div>

          {/* Custom Tag Input */}
          <div>
            <label className="block text-zinc-400 text-[11px] mb-1">
              Custom Tags (comma separated):
            </label>
            <input
              type="text"
              value={customTagsInput}
              onChange={(e) => setCustomTagsInput(e.target.value)}
              placeholder="e.g. #stealth-ip, #founder-memo, #ai-model"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40"
            />
          </div>

          {activeTab === 'LOCAL_FILES' ? (
            <>
              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 bg-zinc-950/40 hover:bg-zinc-950/80 rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={(e) => handleFilesSelected(e.target.files)}
                  className="hidden"
                />
                <UploadCloud className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-zinc-200">
                  Drag & Drop bulk assets here, or click to browse
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Supports multi-gigabyte files, images, PDFs, models, specs, and structured JSON.
                </p>

                {/* Device profile hint */}
                <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400">
                  {deviceProfile === 'iphone16pro' ? (
                    <>
                      <Smartphone className="w-3 h-3 text-emerald-400" />
                      <span>iPhone 16 Pro: Supports Photos & Files App Direct Bulk Ingest</span>
                    </>
                  ) : (
                    <>
                      <Laptop className="w-3 h-3 text-blue-400" />
                      <span>macOS Tahoe M2: Full folder drag & multi-file drop optimized</span>
                    </>
                  )}
                </div>
              </div>

              {/* Staged Files Preview */}
              {stagedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
                    <span>STAGED FOR ENCRYPTION & GCS INGEST ({stagedFiles.length})</span>
                    <button
                      onClick={() => setStagedFiles([])}
                      className="text-red-400 hover:text-red-300 text-[11px] cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-zinc-850">
                    {stagedFiles.map((sf, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-zinc-950/60 rounded-lg flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <File className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-zinc-200 truncate font-mono">{sf.name}</span>
                          <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] text-zinc-400 shrink-0">
                            {sf.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 text-[11px] text-zinc-400">
                          <span>{(sf.size / 1024).toFixed(1)} KB</span>
                          <span className="text-zinc-600 truncate max-w-[80px]">
                            {sf.sha256.substring(0, 8)}...
                          </span>
                          <button
                            onClick={() => handleRemoveStaged(idx)}
                            className="text-zinc-500 hover:text-red-400 cursor-pointer p-1"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleBulkUploadSubmit}
                    disabled={uploading}
                    className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                        <span>Encrypting & Ingesting to GCS...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Commit {stagedFiles.length} Encrypted Assets to GCS</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            /* URL Ingest Form */
            <form onSubmit={handleUrlIngestSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs mb-1.5">
                  Remote Asset URL (HTTP / HTTPS)
                </label>
                <input
                  type="url"
                  required
                  value={ingestUrl}
                  onChange={(e) => setIngestUrl(e.target.value)}
                  placeholder="https://example.com/assets/dataset.json or image.png"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs mb-1.5">
                  Custom Asset Name (Optional)
                </label>
                <input
                  type="text"
                  value={customUrlName}
                  onChange={(e) => setCustomUrlName(e.target.value)}
                  placeholder="Leave empty to auto-extract from URL"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40"
                />
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                <p>• The cloud server will fetch the URL directly with TLS 1.3 encryption.</p>
                <p>• Automatically categorizes by MIME-type and current date.</p>
                <p>• Generates immutable SHA-256 hash and applies AES-256 GCS envelope.</p>
              </div>

              <button
                type="submit"
                disabled={uploading || !ingestUrl}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    <span>Fetching & Ingesting Remote Asset...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5" />
                    <span>Fetch & Ingest URL into GCS Bucket</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
