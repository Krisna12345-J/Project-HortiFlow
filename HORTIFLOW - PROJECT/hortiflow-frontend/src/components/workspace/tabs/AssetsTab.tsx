import React, { useState } from 'react';
import {
  Image,
  Paperclip,
  Plus,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  ExternalLink,
  Download,
  Info,
  CheckCircle,
  X,
} from 'lucide-react';
import { ContentPackage, DigitalAsset, AssetType, LicenseType } from '../../../types';
import { useHortiFlow } from '../../../context/HortiFlowContext';

interface AssetsTabProps {
  pkg: ContentPackage;
}

export const AssetsTab: React.FC<AssetsTabProps> = ({ pkg }) => {
  const { getAssetsForPackage, addDigitalAsset } = useHortiFlow();
  const assets = getAssetsForPackage(pkg.id);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<DigitalAsset | null>(assets[0] || null);

  // Form states
  const [fileName, setFileName] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('IMAGE');
  const [fileSize, setFileSize] = useState('2.4 MB');
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [copyrightOwner, setCopyrightOwner] = useState('Biro Humas dan Informasi Publik, Kementan RI');
  const [licenseType, setLicenseType] = useState<LicenseType>('GOVERNMENT_PUBLIC_DOMAIN');
  const [attribution, setAttribution] = useState('Foto: Dokumentasi Ditjen Hortikultura 2026');

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    const newAsset = addDigitalAsset(pkg.id, {
      fileName,
      assetType,
      fileSize,
      mimeType,
      storageKey: `assets/${pkg.id}/${Date.now()}_${fileName}`,
      checksumSha256: `SHA256-${Math.random().toString(36).substring(2, 14).toUpperCase()}`,
      altText,
      caption,
      copyrightOwner,
      licenseType,
      attributionRequired: Boolean(attribution),
      attributionText: attribution,
    });

    setShowAddModal(false);
    setSelectedAsset(newAsset);
    setFileName('');
    setAltText('');
    setCaption('');
  };

  return (
    <div className="space-y-6 text-xs" id="workspace-tab-assets">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Paperclip className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Repositori Aset Digital & Manajemen Hak Cipta
            </h3>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Manajemen file master, checksum integritas SHA-256, teks alternatif (aksesibilitas), dan penjaminan lisensi hak cipta.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Unggah Aset Digital</span>
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <form onSubmit={handleCreateAsset} className="bg-white rounded-xl border border-emerald-300 p-6 space-y-4 shadow-md animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-bold text-sm text-slate-900">Unggah & Daftarkan Aset Digital</span>
            <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Nama File *</label>
              <input
                type="text"
                required
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="dokumentasi_panen_grobogan_01.jpg"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Jenis Aset</label>
              <select
                value={assetType}
                onChange={(e) => setAssetType(e.target.value as AssetType)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="IMAGE">Foto / Gambar (JPG/PNG)</option>
                <option value="INFOGRAPHIC">Infografis Desain Master</option>
                <option value="VIDEO">Video Siap Tayang (MP4)</option>
                <option value="DOCUMENT">Dokumen Pendukung (PDF)</option>
                <option value="AUDIO">Rekaman Audio / Podcast</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Ukuran File</label>
              <input
                type="text"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Alt-Text Aksesibilitas (Penting untuk Difabel/Screen Reader) *</label>
              <input
                type="text"
                required
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Petani di Grobogan sedang memeriksa rumpun bawang merah TSS..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Keterangan Foto / Caption</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Keterangan gambar saat dipublikasikan..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-800 text-[11px] block">
              Manajemen Hak Cipta & Ketentuan Lisensi
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-slate-600 text-[11px] font-medium">Pemegang Hak Cipta</label>
                <input
                  type="text"
                  value={copyrightOwner}
                  onChange={(e) => setCopyrightOwner(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 text-[11px] font-medium">Tipe Lisensi</label>
                <select
                  value={licenseType}
                  onChange={(e) => setLicenseType(e.target.value as LicenseType)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                >
                  <option value="GOVERNMENT_PUBLIC_DOMAIN">Milik Pemerintah (Public Domain)</option>
                  <option value="INTERNAL_CREATION">Produksi Tim Internal Kementan</option>
                  <option value="CC_BY">Creative Commons BY (Atribusi)</option>
                  <option value="STOCK_LICENSED">Lisensi Stok Berbayar</option>
                  <option value="ALL_RIGHTS_RESERVED">Hak Cipta Dilindungi Sepenuhnya</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 text-[11px] font-medium">Teks Kredit / Atribusi Wajib</label>
                <input
                  type="text"
                  value={attribution}
                  onChange={(e) => setAttribution(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
            >
              Simpan & Daftarkan Aset
            </button>
          </div>
        </form>
      )}

      {/* Grid of Assets & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Assets Grid (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-bold text-sm text-slate-900">
              Daftar Berkas Terlampir ({assets.length})
            </h4>
            <span className="text-[11px] text-slate-400">Tersimpan dalam S3 storage</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {assets.map((asset) => {
              const isSelected = selectedAsset?.id === asset.id;
              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-300 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] mb-2">
                    <span className="font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                      {asset.assetType}
                    </span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {asset.scanStatus}
                    </span>
                  </div>

                  <h5 className="font-bold text-xs text-slate-900 line-clamp-1">{asset.fileName}</h5>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{asset.altText}</p>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{asset.fileSize}</span>
                    <span>{asset.licenseType}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Asset Details (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          {selectedAsset ? (
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {selectedAsset.assetType}
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-1 break-all">
                  {selectedAsset.fileName}
                </h3>
              </div>

              {/* Mock visual preview box */}
              <div className="h-44 bg-slate-100 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center p-4 text-center">
                <Image className="w-10 h-10 text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-slate-700">{selectedAsset.fileName}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Presigned URL aman: {selectedAsset.storageKey}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Alt-Text Aksesibilitas</span>
                  <p className="font-medium text-slate-800 bg-slate-50 p-2 rounded border border-slate-100 mt-0.5">
                    {selectedAsset.altText}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Checksum Integritas (SHA-256)</span>
                  <div className="font-mono text-[10px] bg-slate-50 p-2 rounded border border-slate-100 text-slate-700 break-all">
                    {selectedAsset.checksumSha256}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Hak Cipta</span>
                    <span className="font-semibold text-slate-800">{selectedAsset.copyrightOwner}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Lisensi</span>
                    <span className="font-semibold text-slate-800">{selectedAsset.licenseType}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Atribusi Wajib</span>
                  <span className="text-slate-700">{selectedAsset.attributionText || 'Tidak diwajibkan'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">Pilih berkas di sebelah kiri</div>
          )}
        </div>
      </div>
    </div>
  );
};
