import React, { useState } from 'react';
import { FileText, Plus, Check, Clock, Shield } from 'lucide-react';
import { ContentPackage, BriefVersion, ChannelType } from '../../../types';
import { useHortiFlow } from '../../../context/HortiFlowContext';

interface BriefTabProps {
  pkg: ContentPackage;
}

const ALL_CHANNELS: ChannelType[] = [
  'WEBSITE',
  'INSTAGRAM',
  'FACEBOOK',
  'TIKTOK',
  'YOUTUBE',
  'X',
  'LINKEDIN',
  'INTERNAL_PORTAL',
];

export const BriefTab: React.FC<BriefTabProps> = ({ pkg }) => {
  const { getBriefsForPackage, addBriefVersion } = useHortiFlow();
  const briefs = getBriefsForPackage(pkg.id);

  const [selectedVersionNum, setSelectedVersionNum] = useState<number>(briefs[0]?.version || 1);
  const [isEditingNewVersion, setIsEditingNewVersion] = useState(false);

  // Form states for new brief version
  const currentBrief = briefs.find((b) => b.version === selectedVersionNum) || briefs[0];

  const [angle, setAngle] = useState(currentBrief?.angle || '');
  const [keyMessagesText, setKeyMessagesText] = useState(currentBrief?.keyMessages?.join('\n') || '');
  const [targetAudience, setTargetAudience] = useState(currentBrief?.targetAudience || '');
  const [targetChannels, setTargetChannels] = useState<ChannelType[]>(currentBrief?.targetChannels || ['WEBSITE']);
  const [productionInstructions, setProductionInstructions] = useState(currentBrief?.productionInstructions || '');
  const [callToAction, setCallToAction] = useState(currentBrief?.callToAction || '');
  const [riskNotes, setRiskNotes] = useState(currentBrief?.riskNotes || '');

  const handleToggleChannel = (channel: ChannelType) => {
    if (targetChannels.includes(channel)) {
      setTargetChannels(targetChannels.filter((c) => c !== channel));
    } else {
      setTargetChannels([...targetChannels, channel]);
    }
  };

  const handleSaveNewVersion = (e: React.FormEvent) => {
    e.preventDefault();
    const keyMessages = keyMessagesText.split('\n').map((k) => k.trim()).filter(Boolean);

    const created = addBriefVersion(pkg.id, {
      angle,
      keyMessages,
      targetAudience,
      targetChannels,
      productionInstructions,
      callToAction,
      classification: pkg.classification,
      riskNotes,
    });

    setIsEditingNewVersion(false);
    setSelectedVersionNum(created.version);
    alert(`Versi brief v${created.version} berhasil disimpan!`);
  };

  return (
    <div className="space-y-6 text-xs" id="workspace-tab-brief">
      {/* Header & Version Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Brief Editorial Konten (Versioned)
            </h3>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Panduan sudut pandang (angle), pesan utama, sasaran kanal, dan instruksi teknis produksi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">Versi:</span>
            <select
              value={selectedVersionNum}
              onChange={(e) => setSelectedVersionNum(Number(e.target.value))}
              disabled={isEditingNewVersion}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              {briefs.map((b) => (
                <option key={b.version} value={b.version}>
                  v{b.version} ({new Date(b.createdAt).toLocaleDateString('id-ID')})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setIsEditingNewVersion(!isEditingNewVersion);
              if (!isEditingNewVersion && currentBrief) {
                setAngle(currentBrief.angle);
                setKeyMessagesText(currentBrief.keyMessages.join('\n'));
                setTargetAudience(currentBrief.targetAudience);
                setTargetChannels(currentBrief.targetChannels);
                setProductionInstructions(currentBrief.productionInstructions);
                setCallToAction(currentBrief.callToAction);
                setRiskNotes(currentBrief.riskNotes);
              }
            }}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isEditingNewVersion ? 'Batal Revisi' : 'Buat Revisi Brief (Baru)'}</span>
          </button>
        </div>
      </div>

      {/* Editor or Viewer Form */}
      {isEditingNewVersion ? (
        <form onSubmit={handleSaveNewVersion} className="bg-white rounded-xl border border-emerald-300 p-6 space-y-4 shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-bold text-emerald-900">Menyusun Revisi Brief Baru (v{(briefs[0]?.version || 0) + 1})</span>
            <span className="text-slate-400">Penyusun: {pkg.ownerName}</span>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Sudut Pandang / Angle Komunikasi *</label>
            <textarea
              required
              rows={2}
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Pesan / Fakta Kunci (Satu poin per baris) *</label>
            <textarea
              required
              rows={3}
              value={keyMessagesText}
              onChange={(e) => setKeyMessagesText(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Target Audiens Spesifik</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Ajakan Bertindak (Call to Action / CTA)</label>
              <input
                type="text"
                value={callToAction}
                onChange={(e) => setCallToAction(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Target Kanal Publikasi</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {ALL_CHANNELS.map((ch) => (
                <button
                  type="button"
                  key={ch}
                  onClick={() => handleToggleChannel(ch)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 ${
                    targetChannels.includes(ch)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {targetChannels.includes(ch) && <Check className="w-3.5 h-3.5" />}
                  <span>{ch}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Instruksi Produksi & Referensi Desain</label>
            <textarea
              rows={2}
              value={productionInstructions}
              onChange={(e) => setProductionInstructions(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Catatan Risiko & Kepatuhan</label>
            <input
              type="text"
              value={riskNotes}
              onChange={(e) => setRiskNotes(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditingNewVersion(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs"
            >
              Simpan Versi Brief
            </button>
          </div>
        </form>
      ) : currentBrief ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="font-bold text-slate-800">Brief Versi {currentBrief.version}</span>
              <span className="text-slate-400 text-[11px] block mt-0.5">
                Disusun oleh {currentBrief.createdByName} •{' '}
                {new Date(currentBrief.createdAt).toLocaleString('id-ID')}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]">
              {currentBrief.classification}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-semibold text-[11px]">SUDUT PANDANG (ANGLE)</span>
            <p className="text-sm font-semibold text-slate-900 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {currentBrief.angle}
            </p>
          </div>

          <div>
            <span className="text-slate-400 block font-semibold text-[11px]">PESAN / FAKTA KUNCI</span>
            <div className="mt-1.5 space-y-1.5">
              {currentBrief.keyMessages.map((msg, i) => (
                <div key={i} className="flex items-start gap-2 text-slate-800 bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="leading-snug">{msg}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <span className="text-slate-400 block font-semibold text-[11px]">TARGET AUDIENS</span>
              <p className="text-slate-800 mt-1">{currentBrief.targetAudience}</p>
            </div>

            <div>
              <span className="text-slate-400 block font-semibold text-[11px]">CALL TO ACTION (CTA)</span>
              <p className="text-slate-800 mt-1 font-medium">{currentBrief.callToAction}</p>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block font-semibold text-[11px]">TARGET KANAL DISTRIBUSI</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {currentBrief.targetChannels.map((ch) => (
                <span
                  key={ch}
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-bold text-[11px]"
                >
                  {ch}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-slate-400 block font-semibold text-[11px]">INSTRUKSI TEKNIS PRODUKSI</span>
            <p className="text-slate-700 mt-1 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
              {currentBrief.productionInstructions || 'Tidak ada instruksi khusus.'}
            </p>
          </div>

          {currentBrief.riskNotes && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
              <span className="font-bold block text-[11px]">PERHATIAN RISIKO:</span>
              <p className="text-xs mt-0.5">{currentBrief.riskNotes}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl text-center text-slate-400">
          Belum ada brief. Silakan klik tombol di atas untuk membuat brief versi 1.
        </div>
      )}
    </div>
  );
};
