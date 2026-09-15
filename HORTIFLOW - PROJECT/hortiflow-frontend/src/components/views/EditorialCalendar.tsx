import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Filter,
  Search,
  Clock,
  Send,
  AlertTriangle,
  CheckCircle2,
  Share2,
  User,
  ShieldAlert,
  ArrowRight,
  Layers,
  Calendar as CalendarIcon,
  X,
  RotateCcw,
  Sparkles,
  CalendarCheck,
} from 'lucide-react';
import { useHortiFlow } from '../../context/HortiFlowContext';
import { ActiveView } from '../layout/Sidebar';
import { ContentPackage, ChannelType, LifecycleStatus } from '../../types';

interface EditorialCalendarProps {
  setActiveView: (view: ActiveView) => void;
}

const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

export const EditorialCalendar: React.FC<EditorialCalendarProps> = ({ setActiveView }) => {
  const { packages, campaigns, setSelectedPackageId } = useHortiFlow();

  // Dynamic Month & Year state (Defaults to September 2026 as per application reference)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(8); // 8 = September (0-indexed)
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [viewMode, setViewMode] = useState<'bulan' | 'minggu' | 'daftar'>('bulan');
  const [filterCampaign, setFilterCampaign] = useState('ALL');
  const [filterChannel, setFilterChannel] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(11);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonthIndex((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonthIndex((prev) => prev + 1);
    }
  };

  const handleSelectMonthYear = (monthIdx: number, year: number) => {
    setCurrentMonthIndex(monthIdx);
    setCurrentYear(year);
    setShowMonthPicker(false);
  };

  const handleResetToCurrent = () => {
    setCurrentMonthIndex(8);
    setCurrentYear(2026);
    setSelectedDay(11);
    setShowMonthPicker(false);
  };

  // Format formatted label e.g., "September 2026"
  const formattedMonthLabel = `${MONTH_NAMES_ID[currentMonthIndex]} ${currentYear}`;

  // Calculate dynamic days in the selected month
  const daysInMonthCount = useMemo(() => {
    return new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  }, [currentYear, currentMonthIndex]);

  // First day of week (Monday=0 ... Sunday=6)
  const firstDayOffset = useMemo(() => {
    const jsDay = new Date(currentYear, currentMonthIndex, 1).getDay();
    return (jsDay + 6) % 7; // Convert Sunday=0 to Monday=0
  }, [currentYear, currentMonthIndex]);

  // Days in previous month for empty padding cells
  const prevMonthDaysCount = useMemo(() => {
    return new Date(currentYear, currentMonthIndex, 0).getDate();
  }, [currentYear, currentMonthIndex]);

  const paddingDays = useMemo(() => {
    const list: number[] = [];
    for (let i = firstDayOffset - 1; i >= 0; i--) {
      list.push(prevMonthDaysCount - i);
    }
    return list;
  }, [firstDayOffset, prevMonthDaysCount]);

  const daysInMonthArray = useMemo(() => {
    return Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
  }, [daysInMonthCount]);

  // Status color helper matching section 11
  const getStatusBadgeColor = (pkg: ContentPackage) => {
    if (pkg.hasBlocker || pkg.lifecycleStatus === 'PUBLISH_FAILED') {
      return 'bg-rose-100 text-rose-800 border-rose-200';
    }
    if (pkg.lifecycleStatus === 'SCHEDULED' || pkg.lifecycleStatus === 'PUBLISHING') {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    if (pkg.lifecycleStatus === 'APPROVED' || pkg.lifecycleStatus === 'PUBLISHED') {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (pkg.lifecycleStatus === 'IN_REVIEW' || pkg.lifecycleStatus === 'CHANGES_REQUESTED' || pkg.lifecycleStatus === 'APPROVAL_PENDING') {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    if (pkg.lifecycleStatus === 'IN_PRODUCTION' || pkg.lifecycleStatus === 'ASSIGNED') {
      return 'bg-sky-100 text-sky-800 border-sky-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getStatusLabel = (pkg: ContentPackage) => {
    if (pkg.hasBlocker) return 'Blocked';
    if (pkg.lifecycleStatus === 'PUBLISH_FAILED') return 'Failed';
    if (pkg.lifecycleStatus === 'SCHEDULED') return 'Terjadwal';
    if (pkg.lifecycleStatus === 'PUBLISHING') return 'Publikasi';
    if (pkg.lifecycleStatus === 'APPROVED') return 'Approved';
    if (pkg.lifecycleStatus === 'PUBLISHED') return 'Published';
    if (pkg.lifecycleStatus === 'IN_REVIEW') return 'Review';
    if (pkg.lifecycleStatus === 'IN_PRODUCTION') return 'Produksi';
    return 'Draft';
  };

  const handleOpenPackage = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    setActiveView('workspace');
  };

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      if (filterCampaign !== 'ALL' && pkg.campaignId !== filterCampaign) return false;
      if (filterChannel !== 'ALL') {
        const hasChannel = pkg.channels?.includes(filterChannel as ChannelType);
        if (!hasChannel) return false;
      }
      if (filterStatus !== 'ALL' && pkg.lifecycleStatus !== filterStatus) return false;
      return true;
    });
  }, [packages, filterCampaign, filterChannel, filterStatus]);

  // Map packages to days of the currently selected month
  const packagesByDay = useMemo(() => {
    const map: Record<number, ContentPackage[]> = {};
    filteredPackages.forEach((pkg, index) => {
      let dayTarget = 1;
      const parsedDate = new Date(pkg.deadline);
      if (
        !isNaN(parsedDate.getTime()) &&
        parsedDate.getFullYear() === currentYear &&
        parsedDate.getMonth() === currentMonthIndex
      ) {
        dayTarget = parsedDate.getDate();
      } else {
        // Deterministic distribution for preview when navigating to other months
        dayTarget = ((index * 7 + 4) % daysInMonthCount) + 1;
      }
      if (!map[dayTarget]) {
        map[dayTarget] = [];
      }
      map[dayTarget].push(pkg);
    });
    return map;
  }, [filteredPackages, currentYear, currentMonthIndex, daysInMonthCount]);

  // Agenda hari ini data
  const isSelectedToday = currentYear === 2026 && currentMonthIndex === 8 && selectedDay === 11;
  const todayAgenda = [
    { time: '09.00', title: 'Infografis Produksi Cabai', channel: 'Instagram', status: 'Terjadwal', color: 'text-purple-700 bg-purple-50' },
    { time: '11.00', title: 'Berita Panen Raya Bawang Merah', channel: 'Website', status: 'Approved', color: 'text-emerald-700 bg-emerald-50' },
    { time: '13.00', title: 'Reels Panen Raya Serempak', channel: 'Instagram', status: 'Produksi', color: 'text-sky-700 bg-sky-50' },
    { time: '16.00', title: 'Siaran Pers Produksi Nasional', channel: 'Website', status: 'Review', color: 'text-amber-700 bg-amber-50' },
  ];

  return (
    <div className="space-y-6 lg:space-y-8 pb-12" id="editorial-calendar-view">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
            <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
            <span>Editorial Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
            Kalender Editorial
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Atur ritme siar, kontrol bentrok saluran, pantau tenggat waktu, dan kelola jadwal publikasi konten.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-open-schedule-modal"
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Jadwalkan Konten</span>
          </button>
        </div>
      </div>

      {/* 2. Month Selector, Views & Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        {/* Month Navigation with interactive click buttons & month/year picker */}
        <div className="flex items-center flex-wrap gap-3">
          <div className="flex items-center gap-1.5 bg-slate-50/80 p-1 rounded-xl border border-slate-200 relative">
            {/* Previous Month Button */}
            <button
              id="btn-calendar-prev-month"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 text-slate-700 transition-all active:scale-95 shadow-2xs"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Interactive Month & Year Label / Trigger */}
            <button
              id="btn-calendar-month-picker"
              onClick={() => setShowMonthPicker(!showMonthPicker)}
              className="font-bold text-sm text-slate-900 px-3 py-1 min-w-[150px] text-center hover:bg-white hover:border-slate-300 border border-transparent rounded-lg transition-all flex items-center justify-center gap-1.5 group cursor-pointer shadow-2xs"
              title="Klik untuk memilih bulan & tahun"
            >
              <span>{formattedMonthLabel}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} />
            </button>

            {/* Next Month Button */}
            <button
              id="btn-calendar-next-month"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 text-slate-700 transition-all active:scale-95 shadow-2xs"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* INTERACTIVE MONTH & YEAR POPUP PICKER */}
            {showMonthPicker && (
              <div className="absolute top-full left-0 mt-2 z-50 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentYear((y) => y - 1)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-extrabold text-sm text-slate-900 font-mono">
                      {currentYear}
                    </span>
                    <button
                      onClick={() => setCurrentYear((y) => y + 1)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleResetToCurrent}
                    className="text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Sep 2026</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {MONTH_NAMES_SHORT.map((mName, idx) => {
                    const isSelected = idx === currentMonthIndex;
                    return (
                      <button
                        key={mName}
                        onClick={() => handleSelectMonthYear(idx, currentYear)}
                        className={`p-2 rounded-lg font-bold transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {mName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* View Mode Toggle: Minggu | Bulan | Daftar */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            {(['minggu', 'bulan', 'daftar'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-md capitalize transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterCampaign}
            onChange={(e) => setFilterCampaign(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="ALL">Semua Kampanye</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterChannel}
            onChange={(e) => setFilterChannel(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="ALL">Semua Saluran</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="WEBSITE">Website Portal</option>
            <option value="TIKTOK">TikTok</option>
            <option value="YOUTUBE">YouTube</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="ALL">Semua Status</option>
            <option value="SCHEDULED">Terjadwal</option>
            <option value="APPROVED">Disetujui</option>
            <option value="IN_PRODUCTION">Produksi</option>
            <option value="IN_REVIEW">Review</option>
          </select>
        </div>
      </div>

      {/* 3. Main Two-Column Layout: Calendar Grid (2 Cols) + Editorial Sidepanel (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Calendar / List View (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {viewMode === 'bulan' ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
              {/* Day of Week Headers (Monday to Sunday) */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-slate-500 pb-2 border-b border-slate-100 uppercase tracking-wider">
                <div>Sen</div>
                <div>Sel</div>
                <div>Rab</div>
                <div>Kam</div>
                <div>Jum</div>
                <div>Sab</div>
                <div>Min</div>
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7 gap-1.5 pt-2">
                {/* Empty padding cells from previous month */}
                {paddingDays.map((padDay) => (
                  <div
                    key={`pad-${padDay}`}
                    className="min-h-[90px] p-1.5 bg-slate-50/40 rounded-lg border border-dashed border-slate-200/50 text-slate-300 text-xs font-mono"
                  >
                    <span>{padDay}</span>
                  </div>
                ))}

                {/* Actual Days of the selected month */}
                {daysInMonthArray.map((day) => {
                  const isCurrentToday =
                    currentYear === 2026 && currentMonthIndex === 8 && day === 11;
                  const isDaySelected = selectedDay === day;
                  const dayPackages = packagesByDay[day] || [];

                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`min-h-[95px] p-1.5 rounded-lg border transition-all flex flex-col justify-between cursor-pointer ${
                        isCurrentToday
                          ? 'bg-emerald-50/50 border-emerald-400 ring-1 ring-emerald-400'
                          : isDaySelected
                          ? 'bg-slate-50 border-slate-400 shadow-2xs'
                          : 'bg-white border-slate-150 hover:border-slate-300 hover:bg-slate-50/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-mono font-bold ${
                            isCurrentToday
                              ? 'text-emerald-700 font-extrabold'
                              : 'text-slate-700'
                          }`}
                        >
                          {day}
                        </span>
                        {isCurrentToday && (
                          <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1 rounded">
                            Hari Ini
                          </span>
                        )}
                      </div>

                      {/* Package badges in this date slot */}
                      <div className="space-y-1 mt-1 flex-1">
                        {dayPackages.slice(0, 2).map((pkg) => (
                          <div
                            key={pkg.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPackage(pkg.id);
                            }}
                            className={`p-1 rounded border text-[10px] cursor-pointer hover:shadow-xs transition-shadow space-y-0.5 ${getStatusBadgeColor(
                              pkg
                            )}`}
                          >
                            <div className="flex items-center justify-between font-mono text-[8.5px]">
                              <span className="font-bold">09:00</span>
                              <span className="uppercase">{getStatusLabel(pkg)}</span>
                            </div>
                            <p className="font-bold text-slate-900 line-clamp-1 leading-tight">
                              {pkg.title}
                            </p>
                          </div>
                        ))}
                        {dayPackages.length > 2 && (
                          <span className="text-[9px] font-bold text-slate-400 block text-right">
                            +{dayPackages.length - 2} lainnya
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : viewMode === 'minggu' ? (
            /* Weekly View */
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900">
                  Tampilan Jadwal Mingguan ({formattedMonthLabel})
                </h3>
                <span className="text-xs text-slate-500">7 Hari Kerja Operasional</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
                {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((dayName, idx) => {
                  const dayNum = Math.min(daysInMonthCount, Math.max(1, (selectedDay || 11) - 3 + idx));
                  const dayPkgs = packagesByDay[dayNum] || [];
                  const isToday = currentYear === 2026 && currentMonthIndex === 8 && dayNum === 11;

                  return (
                    <div
                      key={dayName}
                      className={`p-3 rounded-xl border min-h-[160px] flex flex-col justify-between ${
                        isToday ? 'bg-emerald-50/60 border-emerald-300' : 'bg-slate-50/50 border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between font-bold text-xs pb-2 border-b border-slate-200/60">
                          <span className="text-slate-500">{dayName}</span>
                          <span className="font-mono text-slate-800">{dayNum}</span>
                        </div>
                        <div className="mt-2 space-y-1.5">
                          {dayPkgs.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => handleOpenPackage(p.id)}
                              className={`p-1.5 rounded border text-[10px] cursor-pointer hover:shadow-xs transition-shadow ${getStatusBadgeColor(p)}`}
                            >
                              <p className="font-bold line-clamp-2 leading-tight">{p.title}</p>
                              <span className="font-mono text-[8.5px] mt-1 block">{p.packageNumber}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Daftar View */
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex justify-between items-center">
                <span>Daftar Jadwal Publikasi Konten Terdekat</span>
                <span className="text-slate-500 font-normal">{formattedMonthLabel}</span>
              </div>
              <div className="divide-y divide-slate-100">
                {filteredPackages.map((pkg) => (
                  <div key={pkg.id} className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-500">
                          {new Date(pkg.deadline).toLocaleDateString('id-ID', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadgeColor(pkg)}`}>
                          {getStatusLabel(pkg)}
                        </span>
                        <span className="font-mono text-xs text-slate-400">{pkg.packageNumber}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{pkg.title}</h4>
                      <span className="text-xs text-slate-500">
                        {pkg.campaignName || 'Kampanye Mandiri'} • PIC: {pkg.ownerName}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenPackage(pkg.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shrink-0"
                    >
                      <span>Detail</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Color Legend */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex flex-wrap items-center gap-4 text-slate-600">
            <span className="font-bold text-slate-700">Keterangan Warna Status:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span>Abu: Draft</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>Biru: Produksi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Amber: Review</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Hijau: Approved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>Violet: Terjadwal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Merah: Failed/Blocked</span>
            </div>
          </div>
        </div>

        {/* Right Side: Editorial Control Center Sidepanel (1 col) */}
        <div className="space-y-4">
          {/* Panel 1: AGENDA HARI INI / TANGGAL TERPILIH */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  {isSelectedToday ? 'Agenda Hari Ini' : `Agenda Tanggal ${selectedDay || 11}`}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500 font-bold">
                {selectedDay || 11} {MONTH_NAMES_SHORT[currentMonthIndex]} {currentYear}
              </span>
            </div>

            <div className="space-y-2.5">
              {todayAgenda.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-150 transition-colors flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800 text-xs">{item.time}</span>
                      <span className="text-[10px] text-slate-500">{item.channel}</span>
                    </div>
                    <h5 className="font-bold text-slate-900">{item.title}</h5>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.color}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Panel 2: DEADLINE TERDEKAT */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900">Deadline Terdekat</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/70 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-900">12 Sep 2026</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                    1 Hari Tersisa
                  </span>
                </div>
                <h5 className="font-bold text-slate-900">Video Edukasi TSS Bawang Merah</h5>
                <span className="text-[11px] text-slate-600 block">Kanal: YouTube & TikTok • PIC: Rina</span>
              </div>
            </div>
          </div>

          {/* Panel 3: KONFLIK JADWAL & PERHATIAN */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h3 className="font-bold text-sm text-slate-900">Konflik & Catatan Jadwal</h3>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-700">
                <span>Bentrok Saluran Serentak:</span>
                <span className="font-bold text-emerald-700">0 Konflik</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Paket Butuh Review Ulang:</span>
                <span className="font-bold text-amber-600">1 Paket</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Konten berhasil dijadwalkan ke kalender editorial pusat!');
              setShowScheduleModal(false);
            }}
            className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 border border-slate-200 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Jadwalkan Paket Publikasi</h3>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Paket Konten *</label>
                <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.packageNumber}] {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kanal Publikasi *</label>
                <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <option value="INSTAGRAM">Instagram Feed & Carousel</option>
                  <option value="WEBSITE">Website Portal Nasional</option>
                  <option value="TIKTOK">TikTok Video</option>
                  <option value="YOUTUBE">YouTube Channel</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Siar *</label>
                  <input
                    type="date"
                    defaultValue="2026-09-12"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Waktu Siar *</label>
                  <input
                    type="time"
                    defaultValue="09:00"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold shadow-xs hover:bg-emerald-700"
              >
                Tetapkan Jadwal Siar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
