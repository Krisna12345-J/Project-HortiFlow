import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  Plus,
  Trash2,
  Check,
  ChevronDown,
  SlidersHorizontal,
  LayoutGrid,
  Eye,
  EyeOff,
  Sparkles,
  RotateCcw,
  X,
  Layers,
  Save,
} from 'lucide-react';
import { PredefinedPeriodKey } from './DateRangeSelector';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export interface DashboardWidgetConfig {
  kpiCards: boolean;
  operationalInsights: boolean;
  charts: boolean;
  channelTable: boolean;
  campaignScorecard: boolean;
}

export interface ViewPreset {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
  icon?: string;
  periodKey: PredefinedPeriodKey;
  selectedMonth?: { year: number; monthIndex: number } | null;
  campaignFilter: string;
  channelFilter: string;
  widgets: DashboardWidgetConfig;
}

export const DEFAULT_VIEW_PRESETS: ViewPreset[] = [
  {
    id: 'preset-all',
    name: 'Semua Widget (Lengkap)',
    description: 'Menampilkan seluruh ringkasan KPI, grafik, saluran, dan lembar skor kampanye.',
    isDefault: true,
    periodKey: 'MTD',
    campaignFilter: 'ALL',
    channelFilter: 'ALL',
    widgets: {
      kpiCards: true,
      operationalInsights: true,
      charts: true,
      channelTable: true,
      campaignScorecard: true,
    },
  },
  {
    id: 'preset-executive',
    name: 'Eksekutif & Kepatuhan SLA',
    description: 'Fokus pada metrik makro, kepatuhan tenggat waktu SLA, dan wawasan efisiensi.',
    isDefault: true,
    periodKey: 'MTD',
    campaignFilter: 'ALL',
    channelFilter: 'ALL',
    widgets: {
      kpiCards: true,
      operationalInsights: true,
      charts: true,
      channelTable: false,
      campaignScorecard: false,
    },
  },
  {
    id: 'preset-channels',
    name: 'Kinerja Saluran & Distribusi',
    description: 'Fokus pada evaluasi volume siar, engagement per kanal, dan tren mingguan.',
    isDefault: true,
    periodKey: '30D',
    campaignFilter: 'ALL',
    channelFilter: 'ALL',
    widgets: {
      kpiCards: true,
      operationalInsights: false,
      charts: true,
      channelTable: true,
      campaignScorecard: false,
    },
  },
  {
    id: 'preset-campaigns',
    name: 'Evaluasi Kampanye Strategis',
    description: 'Fokus pada pencapaian target kampanye, variansi numerik, dan evaluasi pembelajaran.',
    isDefault: true,
    periodKey: 'Q3',
    campaignFilter: 'ALL',
    channelFilter: 'ALL',
    widgets: {
      kpiCards: true,
      operationalInsights: true,
      charts: false,
      channelTable: false,
      campaignScorecard: true,
    },
  },
];

interface ViewPresetsManagerProps {
  currentPeriodKey: PredefinedPeriodKey;
  currentSelectedMonth: { year: number; monthIndex: number } | null;
  currentCampaignFilter: string;
  currentChannelFilter: string;
  currentWidgets: DashboardWidgetConfig;
  onApplyPreset: (preset: ViewPreset) => void;
  onToggleWidget: (key: keyof DashboardWidgetConfig) => void;
  onResetWidgets: () => void;
}

const STORAGE_KEY = 'hortiflow_analytics_view_presets_v1';

export const ViewPresetsManager: React.FC<ViewPresetsManagerProps> = ({
  currentPeriodKey,
  currentSelectedMonth,
  currentCampaignFilter,
  currentChannelFilter,
  currentWidgets,
  onApplyPreset,
  onToggleWidget,
  onResetWidgets,
}) => {
  const [presets, setPresets] = useState<ViewPreset[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_VIEW_PRESETS;
  });

  const [activePresetId, setActivePresetId] = useState<string>('preset-all');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showWidgetCustomizer, setShowWidgetCustomizer] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Focus trap hooks for accessibility
  const saveModalRef = useFocusTrap<HTMLDivElement>(showSaveModal, {
    onEscape: () => setShowSaveModal(false),
  });

  const customizerModalRef = useFocusTrap<HTMLDivElement>(showWidgetCustomizer, {
    onEscape: () => setShowWidgetCustomizer(false),
  });

  // Escape key handler for presets dropdown
  useEffect(() => {
    if (!showDropdown) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        setShowDropdown(false);
        const btn = document.getElementById('btn-view-presets');
        btn?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDropdown]);

  // Save to localStorage when custom presets are added/removed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    } catch {
      // ignore
    }
  }, [presets]);

  const activePreset = presets.find((p) => p.id === activePresetId) || presets[0];

  const handleSelectPreset = (preset: ViewPreset) => {
    setActivePresetId(preset.id);
    onApplyPreset(preset);
    setShowDropdown(false);
    showToast(`Preset "${preset.name}" diterapkan!`);
  };

  const handleSaveNewPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    const newPreset: ViewPreset = {
      id: `custom-${Date.now()}`,
      name: newPresetName.trim(),
      description: newPresetDesc.trim() || 'Preset kustom yang disimpan oleh pengguna.',
      periodKey: currentPeriodKey,
      selectedMonth: currentSelectedMonth,
      campaignFilter: currentCampaignFilter,
      channelFilter: currentChannelFilter,
      widgets: { ...currentWidgets },
    };

    const updated = [...presets, newPreset];
    setPresets(updated);
    setActivePresetId(newPreset.id);
    setShowSaveModal(false);
    setNewPresetName('');
    setNewPresetDesc('');
    showToast(`Preset kustom "${newPreset.name}" berhasil disimpan!`);
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = presets.filter((p) => p.id !== id);
    setPresets(updated);
    if (activePresetId === id) {
      setActivePresetId(updated[0]?.id || 'preset-all');
      if (updated[0]) onApplyPreset(updated[0]);
    }
    showToast('Preset kustom telah dihapus.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const widgetLabels: { key: keyof DashboardWidgetConfig; label: string; desc: string }[] = [
    { key: 'kpiCards', label: '8 Kartu Ringkasan Metrik KPI', desc: 'Produksi, publikasi, kepatuhan SLA, waktu siklus' },
    { key: 'operationalInsights', label: 'Wawasan & Analisis Operasional', desc: 'Sorotan strategis dan rekomendasi evaluasi' },
    { key: 'charts', label: 'Grafik Visual Tren & Distribusi Siklus', desc: 'Grafik batang perbandingan dan bar progres' },
    { key: 'channelTable', label: 'Tabel Kinerja Kanal Publikasi', desc: 'Volume postingan, capaian engagement vs target' },
    { key: 'campaignScorecard', label: 'Campaign Scorecard & Evaluasi', desc: 'Target numerik, variansi, dan pelajaran evaluasi' },
  ];

  return (
    <div className="relative inline-flex items-center gap-2">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Preset Selector Dropdown Button */}
      <div className="relative">
        <button
          id="btn-view-presets"
          type="button"
          aria-haspopup="dialog"
          aria-expanded={showDropdown}
          aria-controls="presets-dropdown-panel"
          aria-label={`Fokus Tampilan Dashboard: ${activePreset?.name || 'Preset Tampilan'}. Klik untuk membuka daftar preset.`}
          onClick={() => setShowDropdown(!showDropdown)}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-xs border border-slate-200/90 shadow-2xs transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <Bookmark className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
          <span className="hidden sm:inline text-slate-500 font-normal">Fokus Tampilan:</span>
          <span className="text-slate-900 font-bold max-w-[150px] truncate">{activePreset?.name || 'Preset Tampilan'}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" aria-hidden="true" />
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => {
                setShowDropdown(false);
                document.getElementById('btn-view-presets')?.focus();
              }}
              aria-hidden="true"
            />
            <div
              id="presets-dropdown-panel"
              role="dialog"
              aria-modal="false"
              aria-label="Preset Tampilan Dashboard"
              className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-40 text-xs divide-y divide-slate-100 animate-in fade-in"
            >
              <div className="px-4 py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-slate-900 text-xs">Preset Tampilan Dashboard</div>
                  <div className="text-[11px] text-slate-500">Pilih susunan widget & filter fokus</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowDropdown(false);
                    setShowSaveModal(true);
                  }}
                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <Plus className="w-3 h-3" aria-hidden="true" />
                  <span>Simpan Baru</span>
                </button>
              </div>

              <div className="p-1.5 space-y-1 max-h-72 overflow-y-auto" role="list">
                {presets.map((preset) => {
                  const isSelected = preset.id === activePresetId;
                  return (
                    <div
                      key={preset.id}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectPreset(preset);
                        }
                      }}
                      onClick={() => handleSelectPreset(preset)}
                      className={`w-full text-left p-2.5 rounded-xl cursor-pointer transition-all flex items-start justify-between gap-2 group focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        isSelected
                          ? 'bg-emerald-50/80 border border-emerald-200 text-emerald-950'
                          : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" aria-hidden="true" />}
                          <span className="font-bold text-xs truncate">{preset.name}</span>
                          {preset.isDefault && (
                            <span className="px-1.5 py-0.2 bg-slate-100 text-slate-500 text-[9px] rounded font-medium">
                              Bawaan
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                          {preset.description}
                        </p>
                      </div>

                      {!preset.isDefault && (
                        <button
                          type="button"
                          onClick={(e) => handleDeletePreset(preset.id, e)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0 focus:outline-none focus:ring-2 focus:ring-rose-500"
                          title="Hapus preset ini"
                          aria-label={`Hapus preset ${preset.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-2 bg-slate-50/70 flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setShowDropdown(false);
                    setShowWidgetCustomizer(true);
                  }}
                  className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md p-1"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Kustomisasi Susunan Widget...</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Customize Widget Layout Button */}
      <button
        id="btn-customize-widgets"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={showWidgetCustomizer}
        aria-controls="widget-customizer-modal"
        aria-label="Sesuaikan widget dashboard yang ditampilkan"
        onClick={() => setShowWidgetCustomizer(true)}
        className="p-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200/90 shadow-2xs transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
        title="Sesuaikan widget yang ditampilkan"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
      </button>

      {/* Save Preset Modal */}
      {showSaveModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
          role="presentation"
        >
          <div
            id="save-preset-modal"
            ref={saveModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-preset-modal-title"
            aria-describedby="save-preset-modal-desc"
            tabIndex={-1}
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden focus:outline-none"
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <h3 id="save-preset-modal-title" className="font-bold text-sm text-slate-900">
                  Simpan Preset Tampilan Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                aria-label="Tutup dialog simpan preset (Esc)"
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSaveNewPreset} className="p-5 space-y-4 text-xs">
              <p id="save-preset-modal-desc" className="text-slate-600 leading-relaxed">
                Pengaturan filter aktif (periode, kanal, kampanye) serta susunan visibilitas widget saat ini akan disimpan ke dalam preset cepat.
              </p>

              <div>
                <label htmlFor="input-new-preset-name" className="font-bold text-slate-700 block mb-1">
                  Nama Preset Tampilan *
                </label>
                <input
                  id="input-new-preset-name"
                  type="text"
                  required
                  aria-required="true"
                  placeholder="Misal: Laporan Mingguan Pimpinan"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label htmlFor="textarea-new-preset-desc" className="font-bold text-slate-700 block mb-1">
                  Deskripsi / Catatan Fokus
                </label>
                <textarea
                  id="textarea-new-preset-desc"
                  rows={2}
                  placeholder="Catatan fokus pelaporan untuk preset ini..."
                  value={newPresetDesc}
                  onChange={(e) => setNewPresetDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none font-medium"
                />
              </div>

              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80 space-y-1.5">
                <span className="font-bold text-emerald-900 block text-[11px]">Ringkasan Konfigurasi yang Disimpan:</span>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-emerald-800 font-medium">
                  <div>• Periode: {currentPeriodKey}</div>
                  <div>• Filter Kampanye: {currentCampaignFilter}</div>
                  <div>• Filter Saluran: {currentChannelFilter}</div>
                  <div>
                    • Widget Aktif: {Object.values(currentWidgets).filter(Boolean).length}/5 Aktif
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <Save className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Simpan Preset</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Widget Customizer Modal */}
      {showWidgetCustomizer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
          role="presentation"
        >
          <div
            id="widget-customizer-modal"
            ref={customizerModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="widget-customizer-modal-title"
            aria-describedby="widget-customizer-modal-desc"
            tabIndex={-1}
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden focus:outline-none"
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <h3 id="widget-customizer-modal-title" className="font-bold text-sm text-slate-900">
                  Kustomisasi Visibilitas Widget Dashboard
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowWidgetCustomizer(false)}
                aria-label="Tutup dialog kustomisasi widget (Esc)"
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p id="widget-customizer-modal-desc" className="text-slate-600 leading-relaxed">
                Aktifkan atau nonaktifkan bagian widget sesuai kebutuhan laporan Anda.
              </p>

              <div className="space-y-2">
                {widgetLabels.map(({ key, label, desc }) => {
                  const isVisible = currentWidgets[key];
                  return (
                    <div
                      key={key}
                      onClick={() => onToggleWidget(key)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isVisible
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : 'bg-slate-50/70 border-slate-200/80 opacity-70'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className={`font-bold block ${isVisible ? 'text-emerald-950' : 'text-slate-700'}`}>
                          {label}
                        </span>
                        <span className="text-[11px] text-slate-500">{desc}</span>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={isVisible}
                        aria-label={`Alihkan visibilitas ${label}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWidget(key);
                        }}
                        className={`p-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          isVisible
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isVisible ? <Eye className="w-3.5 h-3.5" aria-hidden="true" /> : <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onResetWidgets}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-bold flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Tampilkan Semua</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowWidgetCustomizer(false);
                      setShowSaveModal(true);
                    }}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <Bookmark className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                    <span>Simpan sbg Preset</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWidgetCustomizer(false)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    Selesai
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
