import React, { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  CalendarDays,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export type PredefinedPeriodKey =
  | '7D'
  | '30D'
  | 'MTD'
  | 'Q3'
  | 'YTD'
  | 'MONTH'
  | 'QUARTER'
  | 'CUSTOM';

export interface DateRangePeriod {
  key: PredefinedPeriodKey;
  label: string;
  sublabel: string;
  badge: string;
  startDate: string;
  endDate: string;
  year?: number;
  monthIndex?: number; // 0 = Jan, 11 = Des
  quarterIndex?: number; // 1, 2, 3, 4
}

export const MONTH_NAMES_ID = [
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

export const MONTH_SHORT_ID = [
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

export const PREDEFINED_PERIODS: DateRangePeriod[] = [
  {
    key: '7D',
    label: '7 Hari Terakhir',
    sublabel: 'Last 7 Days',
    badge: '04 Sep - 11 Sep 2026',
    startDate: '2026-09-04',
    endDate: '2026-09-11',
  },
  {
    key: '30D',
    label: '30 Hari Terakhir',
    sublabel: 'Last 30 Days',
    badge: '12 Agu - 11 Sep 2026',
    startDate: '2026-08-12',
    endDate: '2026-09-11',
  },
  {
    key: 'MTD',
    label: 'Bulan Ini',
    sublabel: 'Sep 2026',
    badge: '01 Sep - 30 Sep 2026',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    year: 2026,
    monthIndex: 8,
  },
  {
    key: 'Q3',
    label: 'Kuartal III',
    sublabel: 'Jul - Sep 2026',
    badge: '01 Jul - 30 Sep 2026',
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    year: 2026,
    quarterIndex: 3,
  },
  {
    key: 'YTD',
    label: 'Tahun 2026 (YTD)',
    sublabel: 'Tahun Berjalan',
    badge: '01 Jan - 31 Des 2026',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    year: 2026,
  },
];

interface DateRangeSelectorProps {
  activePeriod: PredefinedPeriodKey;
  activePeriodObj: DateRangePeriod;
  onSelectPeriod: (period: DateRangePeriod) => void;
  customStartDate: string;
  customEndDate: string;
  onCustomDateChange: (startDate: string, endDate: string) => void;
  className?: string;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  activePeriod,
  activePeriodObj,
  onSelectPeriod,
  customStartDate,
  customEndDate,
  onCustomDateChange,
  className = '',
}) => {
  const [showMonthCalendarModal, setShowMonthCalendarModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [tempStart, setTempStart] = useState(customStartDate || '2026-09-01');
  const [tempEnd, setTempEnd] = useState(customEndDate || '2026-09-11');

  // Focus traps for popups
  const monthCalendarRef = useFocusTrap<HTMLDivElement>(showMonthCalendarModal, {
    onEscape: () => {
      setShowMonthCalendarModal(false);
      document.getElementById('btn-calendar-all-months')?.focus();
    },
    preventScroll: false,
  });

  const customModalRef = useFocusTrap<HTMLDivElement>(showCustomModal, {
    onEscape: () => {
      setShowCustomModal(false);
      document.getElementById('period-btn-custom')?.focus();
    },
    preventScroll: false,
  });

  // Available years for selection (2026 - 2030+)
  const availableYears = [2026, 2027, 2028, 2029, 2030];

  // Helper to get days in month
  const getDaysInMonth = (year: number, monthIndex: number) => {
    return new Date(year, monthIndex + 1, 0).getDate();
  };

  // Select a specific month in year (e.g. Januari 2026, Oktober 2026, Februari 2027...)
  const handleSelectSpecificMonth = (year: number, monthIndex: number) => {
    const days = getDaysInMonth(year, monthIndex);
    const monthNum = String(monthIndex + 1).padStart(2, '0');
    const start = `${year}-${monthNum}-01`;
    const end = `${year}-${monthNum}-${String(days).padStart(2, '0')}`;
    const monthName = MONTH_NAMES_ID[monthIndex];

    onSelectPeriod({
      key: 'MONTH',
      label: `${monthName} ${year}`,
      sublabel: `${MONTH_SHORT_ID[monthIndex]} ${year}`,
      badge: `01 ${MONTH_SHORT_ID[monthIndex]} - ${days} ${MONTH_SHORT_ID[monthIndex]} ${year}`,
      startDate: start,
      endDate: end,
      year: year,
      monthIndex: monthIndex,
    });
    setShowMonthCalendarModal(false);
  };

  // Select a specific quarter for chosen year
  const handleSelectQuarter = (year: number, quarterNum: number) => {
    let startMonth = 0;
    let endMonth = 2;
    if (quarterNum === 2) {
      startMonth = 3;
      endMonth = 5;
    } else if (quarterNum === 3) {
      startMonth = 6;
      endMonth = 8;
    } else if (quarterNum === 4) {
      startMonth = 9;
      endMonth = 11;
    }

    const start = `${year}-${String(startMonth + 1).padStart(2, '0')}-01`;
    const endDays = getDaysInMonth(year, endMonth);
    const end = `${year}-${String(endMonth + 1).padStart(2, '0')}-${String(endDays).padStart(2, '0')}`;

    onSelectPeriod({
      key: 'QUARTER',
      label: `Kuartal ${quarterNum === 1 ? 'I' : quarterNum === 2 ? 'II' : quarterNum === 3 ? 'III' : 'IV'} ${year}`,
      sublabel: `Q${quarterNum} ${year}`,
      badge: `01 ${MONTH_SHORT_ID[startMonth]} - ${endDays} ${MONTH_SHORT_ID[endMonth]} ${year}`,
      startDate: start,
      endDate: end,
      year: year,
      quarterIndex: quarterNum,
    });
    setShowMonthCalendarModal(false);
  };

  // Select Full Year
  const handleSelectFullYear = (year: number) => {
    onSelectPeriod({
      key: 'YTD',
      label: `Tahun Penuh ${year}`,
      sublabel: `${year} (Full Year)`,
      badge: `01 Jan - 31 Des ${year}`,
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
      year: year,
    });
    setShowMonthCalendarModal(false);
  };

  const handleApplyCustom = () => {
    if (tempStart && tempEnd) {
      onCustomDateChange(tempStart, tempEnd);
      onSelectPeriod({
        key: 'CUSTOM',
        label: 'Rentang Kustom',
        sublabel: 'Custom Range',
        badge: `${tempStart} s.d ${tempEnd}`,
        startDate: tempStart,
        endDate: tempEnd,
      });
      setShowCustomModal(false);
    }
  };

  return (
    <div
      id="analytics-date-range-selector"
      className={`bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Label & Active Range Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Periode Analitik:
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100/70 border border-emerald-200/80 text-emerald-800 font-mono text-[11px] font-bold">
                {activePeriodObj.badge || 'Sep 2026'}
              </span>
              <span className="text-[11px] font-bold text-slate-700 hidden md:inline">
                ({activePeriodObj.label})
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Menyesuaikan data metrik, grafik tren siar, dan lembar skor kampanye
            </p>
          </div>
        </div>

        {/* Right Info / Quick Action */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 self-start sm:self-auto font-mono text-[11px]">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Sinkronisasi Data Real-time (WIB)</span>
        </div>
      </div>

      {/* Segmented Preset Period Pills + Full Calendar Month Picker */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
        {/* Standard Preset Buttons */}
        {PREDEFINED_PERIODS.map((period) => {
          const isActive =
            activePeriod === period.key &&
            (period.key !== 'MTD' || activePeriodObj.label.includes('Bulan Ini') || activePeriodObj.label.includes('September 2026'));
          return (
            <button
              key={period.key}
              id={`period-btn-${period.key.toLowerCase()}`}
              type="button"
              onClick={() => onSelectPeriod(period)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
              }`}
            >
              {isActive && <Check className="w-3.5 h-3.5 text-emerald-100 stroke-[3]" />}
              <span>{period.label}</span>
            </button>
          );
        })}

        {/* CALENDAR & ALL MONTHS 2026+ BUTTON */}
        <div className="relative">
          <button
            id="btn-calendar-all-months"
            type="button"
            aria-haspopup="dialog"
            aria-expanded={showMonthCalendarModal}
            aria-controls="month-calendar-popup"
            aria-label={`Pilih Bulan dan Kuartal. Periode aktif: ${activePeriod === 'MONTH' ? activePeriodObj.label : 'September 2026'}. Klik untuk membuka kalender.`}
            onClick={() => setShowMonthCalendarModal(!showMonthCalendarModal)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              activePeriod === 'MONTH' || (activePeriod === 'QUARTER' && activePeriodObj.year !== 2026)
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            <span>
              {activePeriod === 'MONTH' ? activePeriodObj.label : 'Pilih Bulan (2026 - Seterusnya)...'}
            </span>
            <ChevronDown className="w-3 h-3 opacity-70" aria-hidden="true" />
          </button>

          {/* Month Calendar Modal & Year Picker */}
          {showMonthCalendarModal && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => {
                  setShowMonthCalendarModal(false);
                  document.getElementById('btn-calendar-all-months')?.focus();
                }}
                aria-hidden="true"
              />
              <div
                id="month-calendar-popup"
                ref={monthCalendarRef}
                role="dialog"
                aria-modal="true"
                aria-label={`Pemilih Bulan dan Kuartal Tahun ${calendarYear}`}
                tabIndex={-1}
                className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-84 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-40 text-xs space-y-3.5 animate-in fade-in focus:outline-none"
              >
                {/* Year Navigator */}
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setCalendarYear((prev) => Math.max(2026, prev - 1))}
                    disabled={calendarYear <= 2026}
                    aria-label="Pilih tahun sebelumnya"
                    className="p-1.5 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    title="Tahun Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 font-mono">
                      Tahun {calendarYear}
                    </span>
                    <select
                      id="select-calendar-year"
                      aria-label="Pilih Tahun Kalender"
                      value={calendarYear}
                      onChange={(e) => setCalendarYear(Number(e.target.value))}
                      className="p-1 bg-white border border-slate-200 rounded-md font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {availableYears.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCalendarYear((prev) => prev + 1)}
                    aria-label="Pilih tahun berikutnya"
                    className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    title="Tahun Berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                {/* 12 Months Grid for Selected Year (2026 - onwards) */}
                <div>
                  <div className="font-bold text-[11px] uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                    <span>Pilih Bulan ({calendarYear})</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">12 Bulan Tersedia</span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                    {MONTH_NAMES_ID.map((monthName, idx) => {
                      const isSelected =
                        activePeriod === 'MONTH' &&
                        activePeriodObj.year === calendarYear &&
                        activePeriodObj.monthIndex === idx;

                      const isCurrentMonth2026 = calendarYear === 2026 && idx === 8; // September 2026

                      return (
                        <button
                          key={monthName}
                          type="button"
                          role="button"
                          aria-pressed={isSelected}
                          aria-label={`${monthName} ${calendarYear}`}
                          onClick={() => handleSelectSpecificMonth(calendarYear, idx)}
                          className={`p-2 rounded-xl text-left transition-all relative border flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 text-slate-800 border-slate-200/80'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-bold text-xs">{MONTH_SHORT_ID[idx]}</span>
                            <span className="text-[9px] font-mono opacity-70">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] truncate ${
                              isSelected ? 'text-emerald-100 font-medium' : 'text-slate-500'
                            }`}
                          >
                            {monthName}
                          </span>
                          {isCurrentMonth2026 && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Quarters & Full Year Selector */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <div className="font-bold text-[11px] uppercase tracking-wider text-slate-500">
                    Opsi Periode Kuartal & Tahunan ({calendarYear})
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-[11px]">
                    {[1, 2, 3, 4].map((qNum) => (
                      <button
                        key={qNum}
                        type="button"
                        aria-label={`Pilih Kuartal ${qNum} Tahun ${calendarYear}`}
                        onClick={() => handleSelectQuarter(calendarYear, qNum)}
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-bold text-center transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        Q{qNum}
                      </button>
                    ))}
                    <button
                      type="button"
                      aria-label={`Pilih Tahun Penuh ${calendarYear}`}
                      onClick={() => handleSelectFullYear(calendarYear)}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-center transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      FY {calendarYear}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Custom Range Button */}
        <div className="relative">
          <button
            id="period-btn-custom"
            type="button"
            aria-haspopup="dialog"
            aria-expanded={showCustomModal}
            aria-controls="custom-date-range-popup"
            aria-label="Pilih rentang tanggal kustom. Klik untuk membuka input tanggal."
            onClick={() => setShowCustomModal(!showCustomModal)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              activePeriod === 'CUSTOM'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Rentang Kustom...</span>
            <ChevronDown className="w-3 h-3 opacity-70" aria-hidden="true" />
          </button>

          {/* Custom Date Range Popup */}
          {showCustomModal && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => {
                  setShowCustomModal(false);
                  document.getElementById('period-btn-custom')?.focus();
                }}
                aria-hidden="true"
              />
              <div
                id="custom-date-range-popup"
                ref={customModalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="custom-range-dialog-title"
                tabIndex={-1}
                className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-40 text-xs space-y-3 animate-in fade-in focus:outline-none"
              >
                <div id="custom-range-dialog-title" className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>Pilih Rentang Tanggal Kustom</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <label htmlFor="custom-date-start" className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Tanggal Mulai:
                    </label>
                    <input
                      id="custom-date-start"
                      type="date"
                      value={tempStart}
                      onChange={(e) => setTempStart(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="custom-date-end" className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Tanggal Selesai:
                    </label>
                    <input
                      id="custom-date-end"
                      type="date"
                      value={tempEnd}
                      onChange={(e) => setTempEnd(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(false)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyCustom}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    Terapkan Rentang
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
