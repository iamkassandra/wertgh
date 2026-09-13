import { useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Code,
  Database,
  Music,
  Video,
  Sparkles,
  Lock,
  CheckCircle2,
  Download,
  Trash2,
  Eye,
  Search,
  Filter,
  Calendar,
  Layers,
  ExternalLink,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { StoredAsset, DeviceProfile } from '../types';

interface VisualAssetWallProps {
  assets: StoredAsset[];
  loading: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onInspectAsset: (asset: StoredAsset) => void;
  onAnalyzeAsset: (asset: StoredAsset) => void;
  onDeleteAsset: (id: string) => void;
  onDownloadAsset: (asset: StoredAsset) => void;
  deviceProfile: DeviceProfile;
}

export default function VisualAssetWall({
  assets,
  loading,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onInspectAsset,
  onAnalyzeAsset,
  onDeleteAsset,
  onDownloadAsset,
  deviceProfile,
}: VisualAssetWallProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('ALL');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // Extract unique dates and tags for filter chips
  const allDates = Array.from(new Set(assets.map((a) => a.dateCategory))).sort().reverse();
  const allTags = Array.from(new Set(assets.flatMap((a) => a.tags)));

  // Filter assets
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (asset.aiSummary && asset.aiSummary.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'ALL' || asset.fileTypeCategory === selectedType;
    const matchesDate = selectedDate === 'ALL' || asset.dateCategory === selectedDate;
    const matchesTag = selectedTag === 'ALL' || asset.tags.includes(selectedTag);

    return matchesSearch && matchesType && matchesDate && matchesTag;
  });

  const getFileIcon = (cat: string) => {
    switch (cat) {
      case 'IMAGE':
        return <ImageIcon className="w-5 h-5 text-emerald-400" />;
      case 'DOCUMENT':
        return <FileText className="w-5 h-5 text-blue-400" />;
      case 'CODE_CONFIG':
        return <Code className="w-5 h-5 text-amber-400" />;
      case 'DATA_JSON':
        return <Database className="w-5 h-5 text-cyan-400" />;
      case 'AUDIO':
        return <Music className="w-5 h-5 text-purple-400" />;
      case 'VIDEO':
        return <Video className="w-5 h-5 text-pink-400" />;
      case 'AI_ARTIFACT':
        return <Sparkles className="w-5 h-5 text-indigo-400" />;
      default:
        return <FileText className="w-5 h-5 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Tag Filter Bar */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5 sm:p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets by filename, SHA-256, tag (#founder-ip), or AI summary..."
              className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
              >
                Clear
              </button>
            )}
          </div>

          {/* Date & Type Selectors */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Date Bucket Filter */}
            <div className="flex items-center gap-1 bg-zinc-950/80 border border-zinc-800 rounded-xl px-2.5 py-1.5 font-mono text-zinc-300">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-zinc-900">All Dates</option>
                {allDates.map((d) => (
                  <option key={d} value={d} className="bg-zinc-900">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-zinc-950/80 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setViewMode('GRID')}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                  viewMode === 'GRID' ? 'bg-zinc-800 text-emerald-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                  viewMode === 'TABLE' ? 'bg-zinc-800 text-emerald-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Incoming File Type Tagging Filter Pills */}
        <div className="mt-3 pt-3 border-t border-zinc-800/60 flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <span className="text-zinc-500 text-[11px] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> TYPE:
          </span>
          {[
            { key: 'ALL', label: 'All Types' },
            { key: 'IMAGE', label: 'Images' },
            { key: 'DOCUMENT', label: 'Documents' },
            { key: 'DATA_JSON', label: 'Data & JSON' },
            { key: 'CODE_CONFIG', label: 'Code & Specs' },
            { key: 'AUDIO', label: 'Audio' },
            { key: 'VIDEO', label: 'Video' },
            { key: 'AI_ARTIFACT', label: 'AI Artifacts' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setSelectedType(item.key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                selectedType === item.key
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'bg-zinc-950/40 text-zinc-400 hover:text-zinc-200 border border-zinc-850'
              }`}
            >
              {item.label}
            </button>
          ))}

          {/* Quick Tag Pills */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 ml-auto pt-2 sm:pt-0">
              <span className="text-zinc-500 text-[11px] flex items-center gap-1">
                <Tag className="w-3 h-3" /> TAG:
              </span>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-zinc-300 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Semantic Tags</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Batch Actions Header (when items selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs font-mono text-emerald-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">{selectedIds.length} Assets Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClearSelection}
              className="text-zinc-400 hover:text-zinc-200 underline cursor-pointer mr-2"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Assets Grid / Table */}
      {loading ? (
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-12 text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-zinc-400 font-mono">Synchronizing encrypted GCS bucket objects...</p>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-12 text-center">
          <Layers className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-zinc-300">No assets match your filter criteria</p>
          <p className="text-xs text-zinc-500 mt-1">Try clearing your filters or ingest new files into the vault.</p>
        </div>
      ) : viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredAssets.map((asset) => {
            const isSelected = selectedIds.includes(asset.id);
            return (
              <div
                key={asset.id}
                className={`group bg-zinc-900/80 hover:bg-zinc-900 border rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between relative shadow-lg ${
                  isSelected
                    ? 'border-emerald-500/60 ring-1 ring-emerald-500/40 bg-zinc-900'
                    : 'border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                {/* Card Top: Checkbox, Icon, Category, Security Badge */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(asset.id)}
                        className="rounded border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-emerald-500/30 w-4 h-4 cursor-pointer"
                      />
                      <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                        {getFileIcon(asset.fileTypeCategory)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-[10px]">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Lock className="w-2.5 h-2.5" />
                        AES-256
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-750">
                        {asset.dateCategory}
                      </span>
                    </div>
                  </div>

                  {/* Asset Name */}
                  <h3
                    onClick={() => onInspectAsset(asset)}
                    title={asset.name}
                    className="text-sm font-medium text-zinc-100 hover:text-emerald-400 transition-colors truncate cursor-pointer font-mono"
                  >
                    {asset.name}
                  </h3>

                  {/* GCS Path */}
                  <p className="text-[11px] text-zinc-500 font-mono truncate mt-0.5">
                    {asset.gcsUri}
                  </p>

                  {/* AI Summary / Preview */}
                  {asset.aiSummary ? (
                    <div className="mt-2.5 p-2 rounded-xl bg-zinc-950/60 border border-zinc-850 text-xs text-zinc-300 leading-relaxed flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] line-clamp-2">{asset.aiSummary}</span>
                    </div>
                  ) : asset.contentPreview ? (
                    <div className="mt-2.5 p-2 rounded-xl bg-zinc-950/60 border border-zinc-850 text-[11px] font-mono text-zinc-400 line-clamp-2">
                      {asset.contentPreview}
                    </div>
                  ) : null}

                  {/* Incoming Category & Semantic Tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400">
                      {asset.fileTypeCategory}
                    </span>
                    {asset.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-emerald-400/90"
                      >
                        {tag}
                      </span>
                    ))}
                    {asset.tags.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded bg-zinc-950 text-[10px] font-mono text-zinc-500">
                        +{asset.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer: Checksum & Action Buttons */}
                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1 text-[10px] text-zinc-500" title={`SHA-256: ${asset.sha256Hash}`}>
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>{(asset.sizeBytes / 1024).toFixed(1)} KB</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onAnalyzeAsset(asset)}
                      title="Run Gemini AI Vision & Security Inspection"
                      className="p-1.5 text-zinc-400 hover:text-purple-400 hover:bg-purple-950/20 rounded-lg transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onInspectAsset(asset)}
                      title="Inspect full asset and metadata"
                      className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDownloadAsset(asset)}
                      title="Direct Decrypted Download"
                      className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-950/20 rounded-lg transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteAsset(asset.id)}
                      title="Cryptographic Shred from Cloud Vault"
                      className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono text-zinc-300">
              <thead className="bg-zinc-950/80 text-[11px] text-zinc-500 border-b border-zinc-800 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredAssets.length && filteredAssets.length > 0}
                      onChange={onSelectAll}
                      className="rounded border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-emerald-500/30 w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5">Asset Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Date Bucket</th>
                  <th className="p-3.5">Size</th>
                  <th className="p-3.5">Integrity SHA-256</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-zinc-850/50 transition-colors">
                    <td className="p-3.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(asset.id)}
                        onChange={() => onToggleSelect(asset.id)}
                        className="rounded border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-emerald-500/30 w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        {getFileIcon(asset.fileTypeCategory)}
                        <div>
                          <p
                            onClick={() => onInspectAsset(asset)}
                            className="font-medium text-zinc-100 hover:text-emerald-400 cursor-pointer"
                          >
                            {asset.name}
                          </p>
                          <p className="text-[10px] text-zinc-500 truncate max-w-xs">{asset.gcsUri}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px]">
                        {asset.fileTypeCategory}
                      </span>
                    </td>
                    <td className="p-3.5 text-zinc-400">{asset.dateCategory}</td>
                    <td className="p-3.5 text-zinc-400">{(asset.sizeBytes / 1024).toFixed(1)} KB</td>
                    <td className="p-3.5 text-zinc-500 text-[10px] font-mono">
                      {asset.sha256Hash.substring(0, 12)}...
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onAnalyzeAsset(asset)}
                          className="p-1.5 text-zinc-400 hover:text-purple-400 rounded transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onInspectAsset(asset)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDownloadAsset(asset)}
                          className="p-1.5 text-zinc-400 hover:text-emerald-400 rounded transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteAsset(asset.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-400 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
