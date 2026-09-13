import { useState } from 'react';
import {
  X,
  Download,
  FileArchive,
  Cloud,
  Terminal,
  Check,
  Copy,
  FolderArchive,
  AlertCircle,
  FileJson,
} from 'lucide-react';
import JSZip from 'jszip';
import { StoredAsset } from '../types';
import { generateGCSManifest } from '../services/api';

interface TransferExportModalProps {
  assets: StoredAsset[];
  onClose: () => void;
}

export default function TransferExportModal({ assets, onClose }: TransferExportModalProps) {
  const [exportingZip, setExportingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [manifestData, setManifestData] = useState<any>(null);
  const [loadingManifest, setLoadingManifest] = useState(false);

  const handleDownloadAllZip = async () => {
    try {
      setExportingZip(true);
      setZipProgress(10);

      const zip = new JSZip();
      const manifestFolder = zip.folder('aegis_vault_export');

      // Create manifest file
      const manifest = {
        exportVersion: '1.0',
        exportedAt: new Date().toISOString(),
        totalAssets: assets.length,
        totalBytes: assets.reduce((acc, a) => acc + a.sizeBytes, 0),
        sourceBucket: 'gs://aegis-founder-vault-prod-asia',
        items: assets.map((a) => ({
          name: a.name,
          category: a.fileTypeCategory,
          dateBucket: a.dateCategory,
          sha256Hash: a.sha256Hash,
          gcsUri: a.gcsUri,
          tags: a.tags,
          aiSummary: a.aiSummary,
        })),
      };

      manifestFolder?.file('manifest.json', JSON.stringify(manifest, null, 2));
      setZipProgress(30);

      // Add each asset file
      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        let content: string | Uint8Array = asset.contentPreview || `// Stored asset ${asset.name}\n// SHA-256: ${asset.sha256Hash}\n`;
        if (asset.dataBase64) {
          const binary = atob(asset.dataBase64);
          const bytes = new Uint8Array(binary.length);
          for (let b = 0; b < binary.length; b++) {
            bytes[b] = binary.charCodeAt(b);
          }
          content = bytes;
        }
        manifestFolder?.file(`${asset.dateCategory}/${asset.fileTypeCategory}/${asset.name}`, content);
        setZipProgress(30 + Math.floor(((i + 1) / assets.length) * 50));
      }

      const blob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        setZipProgress(80 + Math.floor(metadata.percent * 0.2));
      });

      // Trigger instant download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Aegis_Founder_Vault_Export_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setZipProgress(100);
      setTimeout(() => setExportingZip(false), 800);
    } catch (err) {
      console.error('ZIP generation error:', err);
      setExportingZip(false);
    }
  };

  const handleFetchManifest = async () => {
    try {
      setLoadingManifest(true);
      const res = await generateGCSManifest();
      if (res.success && res.manifest) {
        setManifestData(res.manifest);
      }
    } catch (err) {
      console.error('Failed to generate GCS manifest:', err);
    } finally {
      setLoadingManifest(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(key);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const gcloudCmd = `gcloud storage transfer jobs create gs://aegis-founder-vault-prod-asia gs://founder-backup-bucket --name=aegis-transfer-${Date.now()}`;
  const gsutilCmd = `gsutil -m rsync -r -c gs://aegis-founder-vault-prod-asia ./founder_vault_local_archive/`;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-950 border border-emerald-500/30 flex items-center justify-center">
              <Download className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white font-mono">
                DOWNLOAD & TRANSFER AT WILL
              </h2>
              <p className="text-xs text-zinc-400">
                Zero lock-in: Seamlessly extract or migrate all data assets across platforms
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs font-mono">
          {/* Option 1: Instant Decrypted ZIP Archive */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileArchive className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white text-xs">
                  PACKAGE ALL {assets.length} ASSETS INTO STRUCTURED ZIP
                </span>
              </div>
              <span className="text-emerald-400 text-[10px] font-semibold">CLIENT-SIDE PACK</span>
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed">
              Downloads a self-contained archive containing all decrypted data files, folderized by Date and Type category, along with a cryptographic <code className="text-emerald-400">manifest.json</code> audit index.
            </p>

            <button
              onClick={handleDownloadAllZip}
              disabled={exportingZip || assets.length === 0}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {exportingZip ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>Packaging Archive ({zipProgress}%)...</span>
                </>
              ) : (
                <>
                  <FolderArchive className="w-4 h-4" />
                  <span>Download Full Vault Archive (.ZIP)</span>
                </>
              )}
            </button>
          </div>

          {/* Option 2: Google Cloud Storage Transfer Service */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-white text-xs">
                  GOOGLE CLOUD STORAGE TRANSFER CLI
                </span>
              </div>
              <span className="text-zinc-500 text-[10px]">GCS BUCKET-TO-BUCKET</span>
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed">
              Use standard Google Cloud CLI tools to transfer, sync, or replicate your founder vault directly into any external bucket or local workstation.
            </p>

            {/* CLI Snippet 1 */}
            <div className="space-y-1">
              <span className="text-zinc-500 text-[10px]">GCS CLI Transfer Job:</span>
              <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-between gap-2 text-zinc-300 text-[11px]">
                <code className="truncate font-mono text-emerald-300">{gcloudCmd}</code>
                <button
                  onClick={() => copyToClipboard(gcloudCmd, 'gcloud')}
                  className="p-1 text-zinc-400 hover:text-zinc-100"
                >
                  {copiedCmd === 'gcloud' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* CLI Snippet 2 */}
            <div className="space-y-1">
              <span className="text-zinc-500 text-[10px]">gsutil Direct Rsync Mirror:</span>
              <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-between gap-2 text-zinc-300 text-[11px]">
                <code className="truncate font-mono text-emerald-300">{gsutilCmd}</code>
                <button
                  onClick={() => copyToClipboard(gsutilCmd, 'gsutil')}
                  className="p-1 text-zinc-400 hover:text-zinc-100"
                >
                  {copiedCmd === 'gsutil' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Generate JSON Manifest */}
            <div className="pt-2">
              <button
                onClick={handleFetchManifest}
                disabled={loadingManifest}
                className="w-full py-2 px-3 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs rounded-xl border border-zinc-700/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileJson className="w-3.5 h-3.5 text-blue-400" />
                <span>
                  {loadingManifest ? 'Generating GCS Manifest...' : 'Generate Official GCS Transfer Manifest JSON'}
                </span>
              </button>
            </div>

            {manifestData && (
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 max-h-40 overflow-y-auto">
                <pre className="text-[10px] text-zinc-300">{JSON.stringify(manifestData, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
