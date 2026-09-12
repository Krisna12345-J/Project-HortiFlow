import React, { useState } from 'react';
import {
  Share2,
  Plus,
  CheckCircle,
  AlertTriangle,
  Clock,
  Instagram,
  Facebook,
  Globe,
  Video,
  Twitter,
  Linkedin,
  Monitor,
  Check,
  Edit2,
  Trash2,
} from 'lucide-react';
import { ContentPackage, ChannelVariant, ChannelType } from '../../../types';
import { useHortiFlow } from '../../../context/HortiFlowContext';

interface VariantsTabProps {
  pkg: ContentPackage;
}

const CHANNEL_CONFIG: Record<
  ChannelType,
  { name: string; maxChars: number; defaultAspect: string; icon: any }
> = {
  WEBSITE: { name: 'Portal Berita Web', maxChars: 10000, defaultAspect: '16:9', icon: Globe },
  INSTAGRAM: { name: 'Instagram Feed / Reels', maxChars: 2200, defaultAspect: '1:1 / 4:5 / 9:16', icon: Instagram },
  FACEBOOK: { name: 'Facebook Halaman Resmi', maxChars: 5000, defaultAspect: '16:9 / 1:1', icon: Facebook },
  TIKTOK: { name: 'TikTok Short Video', maxChars: 2200, defaultAspect: '9:16', icon: Video },
  YOUTUBE: { name: 'YouTube Shorts / Video', maxChars: 5000, defaultAspect: '16:9 / 9:16', icon: Video },
  X: { name: 'X / Twitter Thread', maxChars: 280, defaultAspect: '16:9', icon: Twitter },
  LINKEDIN: { name: 'LinkedIn Organisasi', maxChars: 3000, defaultAspect: '1:1 / 16:9', icon: Linkedin },
  INTERNAL_PORTAL: { name: 'Portal Internal Kementan', maxChars: 10000, defaultAspect: 'Standard', icon: Monitor },
};

export const VariantsTab: React.FC<VariantsTabProps> = ({ pkg }) => {
  const { getVariantsForPackage, saveChannelVariant } = useHortiFlow();
  const variants = getVariantsForPackage(pkg.id);

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    variants[0]?.id || ''
  );
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const activeVariant =
    variants.find((v) => v.id === selectedVariantId) || variants[0];

  const [channel, setChannel] = useState<ChannelType>(activeVariant?.channel || 'INSTAGRAM');
  const [aspectRatio, setAspectRatio] = useState(activeVariant?.aspectRatio || '1:1');
  const [title, setTitle] = useState(activeVariant?.title || '');
  const [caption, setCaption] = useState(activeVariant?.caption || '');
  const [hashtagsStr, setHashtagsStr] = useState(activeVariant?.hashtags?.join(' ') || '');
  const [callToAction, setCallToAction] = useState(activeVariant?.callToAction || '');
  const [readinessStatus, setReadinessStatus] = useState<'DRAFT' | 'READY' | 'BLOCKED'>(
    activeVariant?.readinessStatus || 'DRAFT'
  );

  const handleStartCreate = () => {
    setSelectedVariantId('');
    setChannel('INSTAGRAM');
    setAspectRatio('1:1');
    setTitle(`${pkg.title} [Instagram]`);
    setCaption('');
    setHashtagsStr('#Hortikultura #InovasiTani #Kementan');
    setCallToAction('Kunjungi tautan di bio untuk membaca panduan lengkap!');
    setReadinessStatus('DRAFT');
    setIsEditing(true);
  };

  const handleStartEdit = (v: ChannelVariant) => {
    setSelectedVariantId(v.id);
    setChannel(v.channel);
    setAspectRatio(v.aspectRatio);
    setTitle(v.title);
    setCaption(v.caption);
    setHashtagsStr(v.hashtags.join(' '));
    setCallToAction(v.callToAction);
    setReadinessStatus(v.readinessStatus);
    setIsEditing(true);
  };

  const handleSaveVariant = (e: React.FormEvent) => {
    e.preventDefault();
    const hashtags = hashtagsStr
      .split(/[\s,]+/)
      .map((h) => (h.startsWith('#') ? h : `#${h}`))
      .filter((h) => h.length > 1);

    const saved = saveChannelVariant(pkg.id, {
      id: selectedVariantId || undefined,
      channel,
      formatSpecification: `${channel} Post Format`,
      aspectRatio,
      title,
      caption,
      hashtags,
      callToAction,
      readinessStatus,
      assignedAssetIds: activeVariant?.assignedAssetIds || [],
    });

    setIsEditing(false);
    setSelectedVariantId(saved.id);
    alert(`Varian kanal ${channel} berhasil disimpan!`);
  };

  const currentChannelConfig = CHANNEL_CONFIG[channel];
  const charLimit = currentChannelConfig?.maxChars || 2000;
  const currentChars = caption.length;
  const isOverLimit = currentChars > charLimit;

  return (
    <div className="space-y-6 text-xs" id="workspace-tab-variants">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Varian Kanal Distribusi ({variants.length} Kanal Aktif)
            </h3>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Sesuaikan salinan narasi, rasio aspek aset, batasan karakter teks, dan tagar untuk masing-masing media.
          </p>
        </div>

        <button
          onClick={handleStartCreate}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Varian Kanal</span>
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Channel Selector Tabs (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          {variants.map((v) => {
            const isSelected = v.id === (activeVariant?.id || '');
            const config = CHANNEL_CONFIG[v.channel];
            const Icon = config?.icon || Globe;

            return (
              <div
                key={v.id}
                onClick={() => {
                  setSelectedVariantId(v.id);
                  setIsEditing(false);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50/90 border-emerald-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">{v.channel}</span>
                      <span className="text-[10px] text-slate-500">{v.aspectRatio}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      v.readinessStatus === 'READY'
                        ? 'bg-emerald-100 text-emerald-800'
                        : v.readinessStatus === 'BLOCKED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {v.readinessStatus}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 mt-2 line-clamp-2 leading-tight">
                  {v.caption}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Column: Editor or Details (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          {isEditing ? (
            <form onSubmit={handleSaveVariant} className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-900">
                  {selectedVariantId ? `Edit Varian Kanal ${channel}` : 'Buat Varian Kanal Baru'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
                >
                  Batal
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Pilih Kanal Distribusi *</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as ChannelType)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    {Object.keys(CHANNEL_CONFIG).map((ch) => (
                      <option key={ch} value={ch}>
                        {ch} - {CHANNEL_CONFIG[ch as ChannelType].name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Rasio Aspek / Format Visual *</label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="1:1">1:1 (Persegi - Instagram Feed / FB)</option>
                    <option value="4:5">4:5 (Vertikal Feed Portrait)</option>
                    <option value="9:16">9:16 (Vertikal Penuh - Reels / TikTok / Shorts)</option>
                    <option value="16:9">16:9 (Horizontal - Website / YouTube)</option>
                    <option value="Standard Article">Standard Web Article</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Judul Khusus Varian Ini</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">Teks Caption / Salinan Kanal *</label>
                  <span
                    className={`text-[11px] font-mono ${
                      isOverLimit ? 'text-rose-600 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {currentChars} / {charLimit} karakter {isOverLimit && '(Melebihi Batas!)'}
                  </span>
                </div>
                <textarea
                  required
                  rows={8}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Ketik teks caption atau salinan khusus untuk kanal ini..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Tagar / Hashtag (Pisahkan spasi)</label>
                  <input
                    type="text"
                    value={hashtagsStr}
                    onChange={(e) => setHashtagsStr(e.target.value)}
                    placeholder="#Hortikultura #InovasiTani"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Status Kesiapan (Readiness)</label>
                  <select
                    value={readinessStatus}
                    onChange={(e) => setReadinessStatus(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="DRAFT">DRAFT (Dalam Penyesuaian)</option>
                    <option value="READY">READY (Siap Publikasi)</option>
                    <option value="BLOCKED">BLOCKED (Tertunda / Ada Masalah)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Call to Action (CTA)</label>
                <input
                  type="text"
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
                  placeholder="Contoh: Kunjungi situs resmi untuk informasi lebih lanjut..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isOverLimit}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-lg shadow-xs"
                >
                  Simpan Varian
                </button>
              </div>
            </form>
          ) : activeVariant ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900">{activeVariant.channel}</h3>
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono">
                      Rasio {activeVariant.aspectRatio}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{activeVariant.title}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                      activeVariant.readinessStatus === 'READY'
                        ? 'bg-emerald-100 text-emerald-800'
                        : activeVariant.readinessStatus === 'BLOCKED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {activeVariant.readinessStatus}
                  </span>
                  <button
                    onClick={() => handleStartEdit(activeVariant)}
                    className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold text-[11px]">SALINAN TEKS / CAPTION</span>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-900 leading-relaxed whitespace-pre-wrap mt-1">
                  {activeVariant.caption}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold text-[11px]">TAGAR (HASHTAGS)</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {activeVariant.hashtags.map((h) => (
                    <span
                      key={h}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500">
                <span>CTA: <b className="text-slate-800">{activeVariant.callToAction}</b></span>
                <span className="font-mono text-[11px]">{activeVariant.caption.length} karakter</span>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">
              Belum ada varian kanal untuk paket konten ini. Klik "Tambah Varian Kanal" di atas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
