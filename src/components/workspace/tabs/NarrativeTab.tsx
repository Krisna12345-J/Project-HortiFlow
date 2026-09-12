import React, { useState } from 'react';
import {
  FileText,
  History,
  GitCompare,
  RotateCcw,
  Save,
  CheckCircle,
  Hash,
  User,
  Clock,
  Link,
  Tag,
} from 'lucide-react';
import { ContentPackage, NarrativeVersion } from '../../../types';
import { useHortiFlow } from '../../../context/HortiFlowContext';

interface NarrativeTabProps {
  pkg: ContentPackage;
}

export const NarrativeTab: React.FC<NarrativeTabProps> = ({ pkg }) => {
  const { getNarrativesForPackage, saveNarrativeVersion, getClaimsForPackage, currentUser } = useHortiFlow();

  const narratives = getNarrativesForPackage(pkg.id);
  const claims = getClaimsForPackage(pkg.id);

  const [selectedVersionNum, setSelectedVersionNum] = useState<number>(narratives[0]?.versionNumber || 1);
  const [isEditing, setIsEditing] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [diffCompareVer, setDiffCompareVer] = useState<number>(
    narratives.length > 1 ? narratives[1]?.versionNumber : 1
  );

  const currentVersion =
    narratives.find((n) => n.versionNumber === selectedVersionNum) || narratives[0];
  const compareVersion =
    narratives.find((n) => n.versionNumber === diffCompareVer) || narratives[0];

  // Editor states
  const [editTitle, setEditTitle] = useState(currentVersion?.title || pkg.title);
  const [editBody, setEditBody] = useState(currentVersion?.body || '');
  const [changeLog, setChangeLog] = useState('');
  const [selectedClaimIds, setSelectedClaimIds] = useState<string[]>(
    currentVersion?.linkedClaimIds || []
  );

  const handleStartEdit = () => {
    if (currentVersion) {
      setEditTitle(currentVersion.title);
      setEditBody(currentVersion.body);
      setSelectedClaimIds(currentVersion.linkedClaimIds);
      setChangeLog('');
    }
    setIsEditing(true);
    setShowDiff(false);
  };

  const handleSaveVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editBody.trim()) {
      alert('Judul dan naskah isi wajib diisi.');
      return;
    }

    const saved = saveNarrativeVersion(
      pkg.id,
      editTitle,
      editBody,
      changeLog || 'Pembaruan naskah redaksi.',
      selectedClaimIds
    );

    setIsEditing(false);
    setSelectedVersionNum(saved.versionNumber);
    alert(`Naskah versi ${saved.versionNumber} berhasil disimpan! Catatan: Jika ada approval manifest sebelumnya, statusnya otomatis dibatalkan karena terjadi revisi materiil baru.`);
  };

  const handleRestoreVersion = (version: NarrativeVersion) => {
    if (window.confirm(`Pulihkan naskah ke versi ${version.versionNumber}? Ini akan membuat versi baru dengan isi dari v${version.versionNumber}.`)) {
      const restored = saveNarrativeVersion(
        pkg.id,
        version.title,
        version.body,
        `Dipulihkan (Rollback) dari versi ${version.versionNumber}`,
        version.linkedClaimIds
      );
      setSelectedVersionNum(restored.versionNumber);
      alert(`Naskah berhasil dipulihkan menjadi versi baru v${restored.versionNumber}!`);
    }
  };

  const toggleClaimLink = (claimId: string) => {
    if (selectedClaimIds.includes(claimId)) {
      setSelectedClaimIds(selectedClaimIds.filter((id) => id !== claimId));
    } else {
      setSelectedClaimIds([...selectedClaimIds, claimId]);
    }
  };

  const wordCount = (isEditing ? editBody : currentVersion?.body || '').trim().split(/\s+/).filter(Boolean).length;
  const charCount = (isEditing ? editBody : currentVersion?.body || '').length;

  return (
    <div className="space-y-6 text-xs" id="workspace-tab-narrative">
      {/* Top Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Editor Naskah & Narasi (Versioned)
            </h3>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Manajemen draf tulisan berbasis versi riwayat, checksum SHA-256, dan perbandingan visual diff.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Version dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">Versi:</span>
            <select
              value={selectedVersionNum}
              onChange={(e) => {
                setSelectedVersionNum(Number(e.target.value));
                setIsEditing(false);
              }}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              {narratives.map((n) => (
                <option key={n.versionNumber} value={n.versionNumber}>
                  v{n.versionNumber} - {n.authorName ? n.authorName.split(' ')[0] : 'Author'} ({new Date(n.createdAt).toLocaleDateString('id-ID')})
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Diff Viewer */}
          {narratives.length > 1 && !isEditing && (
            <button
              onClick={() => setShowDiff(!showDiff)}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                showDiff
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>{showDiff ? 'Tutup Compare Diff' : 'Bandingkan Versi'}</span>
            </button>
          )}

          {/* Edit / New Version Button */}
          {!isEditing ? (
            <button
              onClick={handleStartEdit}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-colors"
            >
              Edit / Buat Versi Baru
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50"
            >
              Batal Edit
            </button>
          )}
        </div>
      </div>

      {/* VIEW: VISUAL DIFF VIEWER */}
      {showDiff && currentVersion && compareVersion && (
        <div className="bg-white rounded-xl border border-indigo-200 p-5 shadow-2xs space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-slate-900">
                Komparasi Versi v{selectedVersionNum} dengan Versi:
              </span>
              <select
                value={diffCompareVer}
                onChange={(e) => setDiffCompareVer(Number(e.target.value))}
                className="bg-slate-100 p-1 rounded font-bold text-slate-800"
              >
                {narratives.map((n) => (
                  <option key={n.versionNumber} value={n.versionNumber}>
                    v{n.versionNumber} ({new Date(n.createdAt).toLocaleDateString('id-ID')})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowDiff(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
            >
              Tutup Diff
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Base compare */}
            <div className="space-y-1">
              <div className="p-2 bg-slate-100 rounded text-slate-700 font-bold flex items-center justify-between">
                <span>Versi Acuan: v{compareVersion.versionNumber}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {compareVersion.checksum.substring(0, 12)}
                </span>
              </div>
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-lg whitespace-pre-wrap font-sans leading-relaxed text-slate-800 min-h-[220px]">
                <h4 className="font-bold text-slate-900 mb-2">{compareVersion.title}</h4>
                {compareVersion.body}
              </div>
            </div>

            {/* Target current */}
            <div className="space-y-1">
              <div className="p-2 bg-emerald-100 rounded text-emerald-900 font-bold flex items-center justify-between">
                <span>Versi Terpilih: v{currentVersion.versionNumber} (Aktif)</span>
                <span className="text-[10px] text-emerald-800 font-mono">
                  {currentVersion.checksum.substring(0, 12)}
                </span>
              </div>
              <div className="p-4 bg-emerald-50/30 border border-emerald-200 rounded-lg whitespace-pre-wrap font-sans leading-relaxed text-slate-900 min-h-[220px]">
                <h4 className="font-bold text-emerald-950 mb-2">{currentVersion.title}</h4>
                {currentVersion.body}
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-500">
            Catatan Perubahan v{currentVersion.versionNumber}: <b>{currentVersion.changeLog}</b>
          </div>
        </div>
      )}

      {/* FORM: EDIT NEW VERSION */}
      {isEditing ? (
        <form onSubmit={handleSaveVersion} className="bg-white rounded-xl border border-emerald-300 p-6 space-y-4 shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="font-bold text-slate-900 text-sm">
                Menyusun Naskah Versi Baru (v{(narratives[0]?.versionNumber || 0) + 1})
              </span>
              <span className="text-slate-400 block text-[11px]">
                Penulis: {currentUser.fullName} ({currentUser.role})
              </span>
            </div>
            <div className="text-right text-[11px] text-slate-500">
              <span>{wordCount} kata</span> • <span>{charCount} karakter</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Judul Naskah *</label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Isi Naskah / Narasi Lengkap *</label>
            <textarea
              required
              rows={12}
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed font-sans text-slate-900 focus:bg-white"
            />
          </div>

          {/* Link Claims in Narrative */}
          <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-semibold text-slate-800 block text-[11px]">
              Tautkan Klaim Faktual yang Tertera dalam Naskah Ini:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {claims.map((c) => {
                const isLinked = selectedClaimIds.includes(c.id);
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => toggleClaimLink(c.id)}
                    className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                      isLinked
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {c.claimCategory}: {c.claimText.substring(0, 35)}...
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Catatan Perubahan (Change Log) *</label>
            <input
              type="text"
              required
              value={changeLog}
              onChange={(e) => setChangeLog(e.target.value)}
              placeholder="Contoh: Menambahkan data produktivitas per hektar dan menyelaraskan dosis rekomendasi..."
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Versi Naskah</span>
            </button>
          </div>
        </form>
      ) : currentVersion ? (
        /* VIEW: CURRENT VERSION DISPLAY */
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-2xs">
          {/* Header Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  Naskah Versi {currentVersion.versionNumber}
                </span>
                <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                  Checksum: {currentVersion.checksum}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Disusun oleh <b>{currentVersion.authorName}</b> pada{' '}
                {new Date(currentVersion.createdAt).toLocaleString('id-ID')}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right text-[11px] text-slate-500">
                <span>{wordCount} kata</span> • <span>{charCount} karakter</span>
              </div>
              {currentVersion.versionNumber !== narratives[0]?.versionNumber && (
                <button
                  onClick={() => handleRestoreVersion(currentVersion)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded flex items-center gap-1 text-[11px]"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Pulihkan Versi Ini</span>
                </button>
              )}
            </div>
          </div>

          {/* Change log badge */}
          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-600 text-[11px]">
            <span className="font-bold text-slate-800">Change Log:</span> {currentVersion.changeLog}
          </div>

          {/* Content Title & Body */}
          <div className="space-y-4 pt-1">
            <h2 className="text-lg font-black text-slate-900 leading-tight">
              {currentVersion.title}
            </h2>
            <div className="text-slate-800 text-xs leading-relaxed whitespace-pre-wrap font-sans bg-slate-50/40 p-5 rounded-xl border border-slate-100">
              {currentVersion.body}
            </div>
          </div>

          {/* Linked Claims List */}
          <div className="pt-4 border-t border-slate-100">
            <span className="font-bold text-slate-800 block text-xs mb-2">
              Klaim Faktual Terhubung ({currentVersion.linkedClaimIds.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentVersion.linkedClaimIds.map((cId) => {
                const claim = claims.find((c) => c.id === cId);
                return claim ? (
                  <span
                    key={cId}
                    className="px-2 py-1 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] flex items-center gap-1"
                  >
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span>{claim.claimCategory}: {claim.claimText.substring(0, 45)}...</span>
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
          Belum ada narasi. Silakan klik tombol "Edit / Buat Versi Baru" di atas.
        </div>
      )}
    </div>
  );
};
