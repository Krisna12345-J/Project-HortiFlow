import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Filter,
  Calendar,
  Eye,
  Heart,
  Share2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Info,
  Layers,
  Printer,
  FileText,
  ChevronDown,
  X,
  Check,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { useHortiFlow } from '../../context/HortiFlowContext';
import { ActiveView } from '../layout/Sidebar';
import { Logo } from '../layout/Logo';
import {
  DateRangeSelector,
  PredefinedPeriodKey,
  DateRangePeriod,
  PREDEFINED_PERIODS,
  MONTH_NAMES_ID,
  MONTH_SHORT_ID,
} from '../analytics/DateRangeSelector';
import {
  ViewPresetsManager,
  ViewPreset,
  DashboardWidgetConfig,
  DEFAULT_VIEW_PRESETS,
} from '../analytics/ViewPresetsManager';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface AnalyticsDashboardProps {
  setActiveView: (view: ActiveView) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ setActiveView }) => {
  const { packages, campaigns, publicationPlans } = useHortiFlow();

  // Active View Preset tracking
  const [activePreset, setActivePreset] = useState<ViewPreset>(DEFAULT_VIEW_PRESETS[0]);

  // Date Range Filter State
  const [activePeriodKey, setActivePeriodKey] = useState<PredefinedPeriodKey>('MTD');
  const [activePeriodObj, setActivePeriodObj] = useState<DateRangePeriod>(PREDEFINED_PERIODS[2]); // Default Bulan Ini (Sep 2026)
  const [customStartDate, setCustomStartDate] = useState('2026-09-01');
  const [customEndDate, setCustomEndDate] = useState('2026-09-11');
  const [campaignFilter, setCampaignFilter] = useState('ALL');
  const [channelFilter, setChannelFilter] = useState('ALL');

  // Widget Visibility State for View Presets
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidgetConfig>({
    kpiCards: true,
    operationalInsights: true,
    charts: true,
    channelTable: true,
    campaignScorecard: true,
  });

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [exportSuccessToast, setExportSuccessToast] = useState<string | null>(null);

  // Focus trap for PDF Modal
  const pdfModalRef = useFocusTrap<HTMLDivElement>(showPdfModal, {
    onEscape: () => setShowPdfModal(false),
  });

  // Apply Preset Handler
  const handleApplyPreset = (preset: ViewPreset) => {
    setActivePreset(preset);
    setActivePeriodKey(preset.periodKey);
    const foundPeriod = PREDEFINED_PERIODS.find((p) => p.key === preset.periodKey);
    if (foundPeriod) {
      setActivePeriodObj(foundPeriod);
    }
    if (preset.campaignFilter) setCampaignFilter(preset.campaignFilter);
    if (preset.channelFilter) setChannelFilter(preset.channelFilter);
    if (preset.widgets) setDashboardWidgets(preset.widgets);
  };

  const handleToggleWidget = (key: keyof DashboardWidgetConfig) => {
    setDashboardWidgets((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleResetWidgets = () => {
    setActivePreset(DEFAULT_VIEW_PRESETS[0]);
    setDashboardWidgets({
      kpiCards: true,
      operationalInsights: true,
      charts: true,
      channelTable: true,
      campaignScorecard: true,
    });
  };

  const handleSelectPeriod = (period: DateRangePeriod) => {
    setActivePeriodKey(period.key);
    setActivePeriodObj(period);
  };

  // Dynamic calculations based on activePeriodKey and selected Month/Quarter
  const periodData = useMemo(() => {
    // 1. Specific Single Month in 2026, 2027, etc.
    if (activePeriodKey === 'MONTH' && activePeriodObj.year && activePeriodObj.monthIndex !== undefined) {
      const yr = activePeriodObj.year;
      const mIdx = activePeriodObj.monthIndex;
      const monthName = MONTH_NAMES_ID[mIdx];
      const monthShort = MONTH_SHORT_ID[mIdx];
      
      // Calculate realistic seasonal values based on month index & year
      const seed = (mIdx + 1) * 3 + (yr - 2026) * 5;
      const totalProduced = 18 + (seed % 14);
      const publishedCount = totalProduced - (seed % 3);
      const sla = (95.5 + ((seed % 45) / 10)).toFixed(1);
      const totalEngage = `${(85 + (seed * 4.2)).toFixed(1)}K`;

      return {
        periodLabel: `${monthName} ${yr} (01 ${monthShort} - ${activePeriodObj.endDate.slice(8, 10)} ${monthShort} ${yr})`,
        totalProduced: totalProduced,
        publishedCount: publishedCount,
        slaCompliance: Number(sla),
        avgCycleTime: `${40 + (seed % 12)} Jam`,
        blockedCount: seed % 3,
        approvalSuccessRate: 98.4,
        totalEngagement: totalEngage,
        archiveCompletion: 100,
        trendTitle: `Tren Produksi & Publikasi Konten (Mingguan - ${monthName} ${yr})`,
        trendSubtext: `${monthShort} ${yr}`,
        trendMax: Math.max(12, Math.ceil(totalProduced / 2)),
        trendData: [
          { label: `M1 ${monthShort}`, produced: Math.ceil(totalProduced * 0.22), published: Math.floor(publishedCount * 0.22) },
          { label: `M2 ${monthShort}`, produced: Math.ceil(totalProduced * 0.28), published: Math.floor(publishedCount * 0.27) },
          { label: `M3 ${monthShort}`, produced: Math.ceil(totalProduced * 0.25), published: Math.floor(publishedCount * 0.26) },
          { label: `M4 ${monthShort}`, produced: Math.ceil(totalProduced * 0.25), published: Math.floor(publishedCount * 0.25) },
        ],
        lifecycle: [
          { label: 'Published / Selesai Siar', count: publishedCount, total: totalProduced, color: 'bg-emerald-500' },
          { label: 'Scheduled / Siap Tayang', count: Math.max(1, totalProduced - publishedCount), total: totalProduced, color: 'bg-purple-500' },
          { label: 'Approval Pending', count: 1, total: totalProduced, color: 'bg-amber-500' },
          { label: 'In Review / Triaged', count: 2, total: totalProduced, color: 'bg-sky-500' },
          { label: 'In Production / Draft', count: 1, total: totalProduced, color: 'bg-slate-400' },
        ],
        channels: [
          { channel: 'Instagram Feed & Carousel', pubCount: Math.ceil(publishedCount * 0.45), engagement: `${(publishedCount * 4.2).toFixed(1)}K`, target: `${(publishedCount * 3.5).toFixed(1)}K`, variance: '+20.0%' },
          { channel: 'Website Portal Resmi', pubCount: Math.ceil(publishedCount * 0.65), engagement: `${(publishedCount * 2.8).toFixed(1)}K`, target: `${(publishedCount * 2.6).toFixed(1)}K`, variance: '+7.6%' },
          { channel: 'YouTube Video & Shorts', pubCount: Math.ceil(publishedCount * 0.18), engagement: `${(publishedCount * 1.5).toFixed(1)}K`, target: `${(publishedCount * 1.8).toFixed(1)}K`, variance: '-16.6%' },
          { channel: 'TikTok Edukasi Tani', pubCount: Math.ceil(publishedCount * 0.25), engagement: `${(publishedCount * 2.2).toFixed(1)}K`, target: `${(publishedCount * 2.0).toFixed(1)}K`, variance: '+10.0%' },
          { channel: 'X / Twitter Resmi', pubCount: Math.ceil(publishedCount * 0.38), engagement: `${(publishedCount * 1.1).toFixed(1)}K`, target: `${(publishedCount * 1.1).toFixed(1)}K`, variance: '0.0%' },
        ],
      };
    }

    // 2. Specific Quarter
    if (activePeriodKey === 'QUARTER' && activePeriodObj.year && activePeriodObj.quarterIndex !== undefined) {
      const yr = activePeriodObj.year;
      const qIdx = activePeriodObj.quarterIndex;
      const totalProduced = 65 + qIdx * 4;
      const publishedCount = totalProduced - 3;
      return {
        periodLabel: `Kuartal ${qIdx === 1 ? 'I' : qIdx === 2 ? 'II' : qIdx === 3 ? 'III' : 'IV'} ${yr} (${activePeriodObj.badge})`,
        totalProduced: totalProduced,
        publishedCount: publishedCount,
        slaCompliance: 96.5,
        avgCycleTime: '43 Jam',
        blockedCount: 2,
        approvalSuccessRate: 98.1,
        totalEngagement: '315.8K',
        archiveCompletion: 100,
        trendTitle: `Tren Produksi & Publikasi Konten (Kuartal ${qIdx} ${yr})`,
        trendSubtext: `Q${qIdx} ${yr}`,
        trendMax: 30,
        trendData: [
          { label: 'Bulan 1', produced: Math.floor(totalProduced / 3), published: Math.floor(publishedCount / 3) },
          { label: 'Bulan 2', produced: Math.ceil(totalProduced / 3), published: Math.ceil(publishedCount / 3) },
          { label: 'Bulan 3', produced: Math.floor(totalProduced / 3), published: Math.floor(publishedCount / 3) },
        ],
        lifecycle: [
          { label: 'Published / Selesai Siar', count: publishedCount, total: totalProduced, color: 'bg-emerald-500' },
          { label: 'Scheduled / Siap Tayang', count: 2, total: totalProduced, color: 'bg-purple-500' },
          { label: 'Approval Pending', count: 1, total: totalProduced, color: 'bg-amber-500' },
          { label: 'In Review / Triaged', count: 1, total: totalProduced, color: 'bg-sky-500' },
          { label: 'In Production / Draft', count: 0, total: totalProduced, color: 'bg-slate-400' },
        ],
        channels: [
          { channel: 'Instagram Feed & Carousel', pubCount: 30, engagement: '148.0K', target: '120.0K', variance: '+23.3%' },
          { channel: 'Website Portal Resmi', pubCount: 45, engagement: '92.0K', target: '88.0K', variance: '+4.5%' },
          { channel: 'YouTube Video & Shorts', pubCount: 12, engagement: '38.0K', target: '48.0K', variance: '-20.8%' },
          { channel: 'TikTok Edukasi Tani', pubCount: 18, engagement: '72.0K', target: '65.0K', variance: '+10.7%' },
          { channel: 'X / Twitter Resmi', pubCount: 26, engagement: '31.5K', target: '32.0K', variance: '-1.5%' },
        ],
      };
    }

    // 3. Predefined Standard Keys
    switch (activePeriodKey) {
      case '7D':
        return {
          periodLabel: '7 Hari Terakhir (04 Sep - 11 Sep 2026)',
          totalProduced: 8,
          publishedCount: 7,
          slaCompliance: 98.2,
          avgCycleTime: '34 Jam',
          blockedCount: 0,
          approvalSuccessRate: 100,
          totalEngagement: '34.2K',
          archiveCompletion: 100,
          trendTitle: 'Tren Produksi & Publikasi Konten (Harian - 7 Hari Terakhir)',
          trendSubtext: '04 Sep - 11 Sep 2026',
          trendMax: 3,
          trendData: [
            { label: '05 Sep', produced: 1, published: 1 },
            { label: '06 Sep', produced: 2, published: 2 },
            { label: '07 Sep', produced: 1, published: 1 },
            { label: '08 Sep', produced: 0, published: 0 },
            { label: '09 Sep', produced: 2, published: 1 },
            { label: '10 Sep', produced: 1, published: 1 },
            { label: '11 Sep', produced: 1, published: 1 },
          ],
          lifecycle: [
            { label: 'Published / Selesai Siar', count: 7, total: 8, color: 'bg-emerald-500' },
            { label: 'Scheduled / Siap Tayang', count: 1, total: 8, color: 'bg-purple-500' },
            { label: 'Approval Pending', count: 0, total: 8, color: 'bg-amber-500' },
            { label: 'In Review / Triaged', count: 0, total: 8, color: 'bg-sky-500' },
            { label: 'In Production / Draft', count: 0, total: 8, color: 'bg-slate-400' },
          ],
          channels: [
            { channel: 'Instagram Feed & Carousel', pubCount: 4, engagement: '18.5K', target: '14.0K', variance: '+32.1%' },
            { channel: 'Website Portal Resmi', pubCount: 6, engagement: '12.0K', target: '10.0K', variance: '+20.0%' },
            { channel: 'YouTube Video & Shorts', pubCount: 1, engagement: '4.2K', target: '6.0K', variance: '-30.0%' },
            { channel: 'TikTok Edukasi Tani', pubCount: 2, engagement: '8.5K', target: '7.5K', variance: '+13.3%' },
            { channel: 'X / Twitter Resmi', pubCount: 3, engagement: '3.8K', target: '4.0K', variance: '-5.0%' },
          ],
        };

      case '30D':
        return {
          periodLabel: '30 Hari Terakhir (12 Agu - 11 Sep 2026)',
          totalProduced: 28,
          publishedCount: 26,
          slaCompliance: 96.8,
          avgCycleTime: '46 Jam',
          blockedCount: 1,
          approvalSuccessRate: 98.5,
          totalEngagement: '118.4K',
          archiveCompletion: 100,
          trendTitle: 'Tren Produksi & Publikasi Konten (4 Minggu Terakhir)',
          trendSubtext: '12 Agu - 11 Sep 2026',
          trendMax: 10,
          trendData: [
            { label: 'M1 (12-18 Agu)', produced: 6, published: 6 },
            { label: 'M2 (19-25 Agu)', produced: 7, published: 6 },
            { label: 'M3 (26 Agu-1 Sep)', produced: 7, published: 7 },
            { label: 'M4 (2-11 Sep)', produced: 8, published: 7 },
          ],
          lifecycle: [
            { label: 'Published / Selesai Siar', count: 26, total: 28, color: 'bg-emerald-500' },
            { label: 'Scheduled / Siap Tayang', count: 1, total: 28, color: 'bg-purple-500' },
            { label: 'Approval Pending', count: 1, total: 28, color: 'bg-amber-500' },
            { label: 'In Review / Triaged', count: 0, total: 28, color: 'bg-sky-500' },
            { label: 'In Production / Draft', count: 0, total: 28, color: 'bg-slate-400' },
          ],
          channels: [
            { channel: 'Instagram Feed & Carousel', pubCount: 13, engagement: '61.2K', target: '48.0K', variance: '+27.5%' },
            { channel: 'Website Portal Resmi', pubCount: 20, engagement: '39.5K', target: '38.0K', variance: '+3.9%' },
            { channel: 'YouTube Video & Shorts', pubCount: 5, engagement: '16.5K', target: '22.0K', variance: '-25.0%' },
            { channel: 'TikTok Edukasi Tani', pubCount: 7, engagement: '29.8K', target: '28.0K', variance: '+6.4%' },
            { channel: 'X / Twitter Resmi', pubCount: 11, engagement: '13.9K', target: '14.0K', variance: '-0.7%' },
          ],
        };

      case 'Q3':
        return {
          periodLabel: 'Kuartal III 2026 (01 Jul - 30 Sep 2026)',
          totalProduced: 68,
          publishedCount: 64,
          slaCompliance: 95.8,
          avgCycleTime: '44 Jam',
          blockedCount: 2,
          approvalSuccessRate: 97.6,
          totalEngagement: '342.1K',
          archiveCompletion: 100,
          trendTitle: 'Tren Produksi & Publikasi Konten (Bulanan - Q3 2026)',
          trendSubtext: 'Kuartal III (Jul - Sep 2026)',
          trendMax: 30,
          trendData: [
            { label: 'Juli 2026', produced: 22, published: 20 },
            { label: 'Agustus 2026', produced: 24, published: 23 },
            { label: 'September 2026', produced: 22, published: 21 },
          ],
          lifecycle: [
            { label: 'Published / Selesai Siar', count: 64, total: 68, color: 'bg-emerald-500' },
            { label: 'Scheduled / Siap Tayang', count: 2, total: 68, color: 'bg-purple-500' },
            { label: 'Approval Pending', count: 1, total: 68, color: 'bg-amber-500' },
            { label: 'In Review / Triaged', count: 1, total: 68, color: 'bg-sky-500' },
            { label: 'In Production / Draft', count: 0, total: 68, color: 'bg-slate-400' },
          ],
          channels: [
            { channel: 'Instagram Feed & Carousel', pubCount: 32, engagement: '158.0K', target: '130.0K', variance: '+21.5%' },
            { channel: 'Website Portal Resmi', pubCount: 48, engagement: '96.2K', target: '90.0K', variance: '+6.9%' },
            { channel: 'YouTube Video & Shorts', pubCount: 14, engagement: '42.0K', target: '55.0K', variance: '-23.6%' },
            { channel: 'TikTok Edukasi Tani', pubCount: 19, engagement: '78.4K', target: '70.0K', variance: '+12.0%' },
            { channel: 'X / Twitter Resmi', pubCount: 28, engagement: '34.5K', target: '35.0K', variance: '-1.4%' },
          ],
        };

      case 'YTD':
        return {
          periodLabel: `Tahun ${activePeriodObj.year || 2026} (01 Jan - 31 Des ${activePeriodObj.year || 2026})`,
          totalProduced: 218,
          publishedCount: 210,
          slaCompliance: 96.2,
          avgCycleTime: '45 Jam',
          blockedCount: 4,
          approvalSuccessRate: 98.0,
          totalEngagement: '894.6K',
          archiveCompletion: 100,
          trendTitle: `Tren Produksi & Publikasi Konten (Kuartalan - ${activePeriodObj.year || 2026})`,
          trendSubtext: `Tahun ${activePeriodObj.year || 2026}`,
          trendMax: 90,
          trendData: [
            { label: 'Q1 (Jan-Mar)', produced: 68, published: 65 },
            { label: 'Q2 (Apr-Jun)', produced: 76, published: 73 },
            { label: 'Q3 (Jul-Sep)', produced: 68, published: 66 },
            { label: 'Q4 (Est.)', produced: 6, published: 6 },
          ],
          lifecycle: [
            { label: 'Published / Selesai Siar', count: 210, total: 218, color: 'bg-emerald-500' },
            { label: 'Scheduled / Siap Tayang', count: 4, total: 218, color: 'bg-purple-500' },
            { label: 'Approval Pending', count: 2, total: 218, color: 'bg-amber-500' },
            { label: 'In Review / Triaged', count: 2, total: 218, color: 'bg-sky-500' },
            { label: 'In Production / Draft', count: 0, total: 218, color: 'bg-slate-400' },
          ],
          channels: [
            { channel: 'Instagram Feed & Carousel', pubCount: 98, engagement: '412.0K', target: '350.0K', variance: '+17.7%' },
            { channel: 'Website Portal Resmi', pubCount: 154, engagement: '260.5K', target: '240.0K', variance: '+8.5%' },
            { channel: 'YouTube Video & Shorts', pubCount: 42, engagement: '115.0K', target: '140.0K', variance: '-17.8%' },
            { channel: 'TikTok Edukasi Tani', pubCount: 56, engagement: '210.2K', target: '190.0K', variance: '+10.6%' },
            { channel: 'X / Twitter Resmi', pubCount: 84, engagement: '98.4K', target: '100.0K', variance: '-1.6%' },
          ],
        };

      case 'CUSTOM':
        return {
          periodLabel: `Rentang Kustom (${customStartDate} s.d ${customEndDate})`,
          totalProduced: 15,
          publishedCount: 14,
          slaCompliance: 97.0,
          avgCycleTime: '42 Jam',
          blockedCount: 1,
          approvalSuccessRate: 98.6,
          totalEngagement: '68.5K',
          archiveCompletion: 100,
          trendTitle: `Tren Produksi & Publikasi (${customStartDate} s.d ${customEndDate})`,
          trendSubtext: 'Rentang Kustom Pilihan',
          trendMax: 10,
          trendData: [
            { label: 'Periode Awal', produced: 5, published: 5 },
            { label: 'Periode Tengah', produced: 6, published: 5 },
            { label: 'Periode Akhir', produced: 4, published: 4 },
          ],
          lifecycle: [
            { label: 'Published / Selesai Siar', count: 14, total: 15, color: 'bg-emerald-500' },
            { label: 'Scheduled / Siap Tayang', count: 1, total: 15, color: 'bg-purple-500' },
            { label: 'Approval Pending', count: 0, total: 15, color: 'bg-amber-500' },
            { label: 'In Review / Triaged', count: 0, total: 15, color: 'bg-sky-500' },
            { label: 'In Production / Draft', count: 0, total: 15, color: 'bg-slate-400' },
          ],
          channels: [
            { channel: 'Instagram Feed & Carousel', pubCount: 6, engagement: '28.4K', target: '22.0K', variance: '+29.0%' },
            { channel: 'Website Portal Resmi', pubCount: 9, engagement: '18.1K', target: '17.0K', variance: '+6.5%' },
            { channel: 'YouTube Video & Shorts', pubCount: 3, engagement: '8.5K', target: '11.0K', variance: '-22.7%' },
            { channel: 'TikTok Edukasi Tani', pubCount: 4, engagement: '14.2K', target: '13.0K', variance: '+9.2%' },
            { channel: 'X / Twitter Resmi', pubCount: 5, engagement: '6.4K', target: '6.5K', variance: '-1.5%' },
          ],
        };

      case 'MTD':
      default:
        return {
          periodLabel: 'Bulan Ini (01 Sep - 30 Sep 2026)',
          totalProduced: packages.length || 18,
          publishedCount: packages.filter((p) => p.lifecycleStatus === 'PUBLISHED').length || 12,
          slaCompliance: 96.4,
          avgCycleTime: '48 Jam',
          blockedCount: packages.filter((p) => p.hasBlocker).length || 1,
          approvalSuccessRate: 98.2,
          totalEngagement: '124.5K',
          archiveCompletion: 100,
          trendTitle: 'Tren Produksi & Publikasi Konten (Mingguan - Bulan Ini)',
          trendSubtext: 'Sep 2026',
          trendMax: 20,
          trendData: [
            { label: 'M1 Sep', produced: 12, published: 10 },
            { label: 'M2 Sep', produced: 16, published: 14 },
            { label: 'M3 Sep', produced: 14, published: 13 },
            { label: 'M4 Sep', produced: 18, published: 17 },
          ],
          lifecycle: [
            { label: 'Published / Selesai Siar', count: 18, total: 32, color: 'bg-emerald-500' },
            { label: 'Scheduled / Siap Tayang', count: 4, total: 32, color: 'bg-purple-500' },
            { label: 'Approval Pending', count: 2, total: 32, color: 'bg-amber-500' },
            { label: 'In Review / Triaged', count: 5, total: 32, color: 'bg-sky-500' },
            { label: 'In Production / Draft', count: 3, total: 32, color: 'bg-slate-400' },
          ],
          channels: [
            { channel: 'Instagram Feed & Carousel', pubCount: 14, engagement: '64.2K', target: '50.0K', variance: '+28.4%' },
            { channel: 'Website Portal Resmi', pubCount: 22, engagement: '42.1K', target: '40.0K', variance: '+5.2%' },
            { channel: 'YouTube Video & Shorts', pubCount: 6, engagement: '18.2K', target: '25.0K', variance: '-27.2%' },
            { channel: 'TikTok Edukasi Tani', pubCount: 8, engagement: '32.0K', target: '30.0K', variance: '+6.7%' },
            { channel: 'X / Twitter Resmi', pubCount: 12, engagement: '14.5K', target: '15.0K', variance: '-3.3%' },
          ],
        };
    }
  }, [activePeriodKey, activePeriodObj, customStartDate, customEndDate, packages]);

  // Campaign Scorecard data
  const campaignScorecards = [
    {
      name: 'PANEN RAYA 2026',
      objective: 'Meningkatkan awareness produksi hortikultura nasional & edukasi benih TSS',
      target: '500.000 Akun / 12 Paket',
      actual: '410.000 Akun / 10 Paket',
      variance: '-18% (Mendekati Target)',
      lessonsLearned: 'Format Carousel Instagram dan Reels menunjukkan laju konversi tertinggi dibanding rilis teks murni.',
    },
    {
      name: 'EDUKASI BENIH UNGGUL HORTIKULTURA',
      objective: 'Sosialisasi keunggulan varietas nasional tahan virus & adaptif iklim',
      target: '300.000 Akun / 8 Paket',
      actual: '315.000 Akun / 8 Paket',
      variance: '+5% (Memenuhi Target)',
      lessonsLearned: 'Infografis komparasi biaya benih per hektar sangat efektif disebarkan lewat grup komunitas tani.',
    },
  ];

  // Filter channel data if channelFilter is selected
  const displayedChannels = useMemo(() => {
    if (channelFilter === 'ALL') return periodData.channels;
    return periodData.channels.filter((c) =>
      c.channel.toLowerCase().includes(channelFilter.toLowerCase())
    );
  }, [channelFilter, periodData.channels]);

  // Count active visible widgets
  const visibleWidgetCount = Object.values(dashboardWidgets).filter(Boolean).length;
  const isCustomViewActive = visibleWidgetCount < 5;

  // Handle Export to CSV for Selected Preset or All Modules
  const handleExportCSV = (mode: 'preset' | 'all' = 'preset') => {
    setShowExportMenu(false);
    const csvRows: string[] = [];
    csvRows.push('HORTIFLOW - LAPORAN EVALUASI & ANALITIK KINERJA KONTEN');
    csvRows.push(`Nama Preset Dipilih:,"${activePreset.name}"`);
    csvRows.push(`Deskripsi Preset:,"${activePreset.description}"`);
    csvRows.push(`Periode Evaluasi:,"${periodData.periodLabel}"`);
    csvRows.push(`Filter Kampanye:,"${campaignFilter}"`);
    csvRows.push(`Filter Saluran Siar:,"${channelFilter}"`);
    csvRows.push(`Cakupan Data:,"${mode === 'preset' ? 'Sesuai Preset Tampilan (' + activePreset.name + ')' : 'Seluruh Modul Analitik'}"`);
    csvRows.push(`Tanggal Ekspor:,"${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}"`);
    csvRows.push('');

    // Determine which modules to include based on mode and widget configuration
    const includeKpis = mode === 'all' || dashboardWidgets.kpiCards;
    const includeCharts = mode === 'all' || dashboardWidgets.charts;
    const includeChannels = mode === 'all' || dashboardWidgets.channelTable;
    const includeScorecards = mode === 'all' || dashboardWidgets.campaignScorecard;

    // 1. KPI Operasional
    if (includeKpis) {
      csvRows.push('--- RINGKASAN METRIK KPI OPERASIONAL ---');
      csvRows.push('Indikator Kinerja,Nilai Capaian,Satuan,Target / Catatan Evaluasi');
      csvRows.push(`Total Paket Diproduksi,${periodData.totalProduced},Paket,Volume Produksi Periode`);
      csvRows.push(`Publikasi Berhasil,${periodData.publishedCount},Paket,Sukses Siar`);
      csvRows.push(`Kepatuhan SLA,${periodData.slaCompliance}%,Persen,Target Minimum >= 95%`);
      csvRows.push(`Rata-rata Waktu Siklus (Cycle Time),${periodData.avgCycleTime},Waktu,Durasi Rata-rata Pemrosesan`);
      csvRows.push(`Paket Terkendala (Blocker),${periodData.blockedCount},Paket,Status Tertahan / Butuh Intervensi`);
      csvRows.push(`Tingkat Persetujuan Redaksi,${periodData.approvalSuccessRate}%,Persen,Kelulusan Telaah Eselon`);
      csvRows.push(`Total Akumulasi Engagement,${periodData.totalEngagement},Interaksi,Jangkauan & Reaksi Publik`);
      csvRows.push(`Kelengkapan Manifest Arsip,${periodData.archiveCompletion}%,Persen,Kepatuhan Metadata Terverifikasi`);
      csvRows.push('');
    }

    // 2. Data Tren & Evaluasi Siklus Hidup
    if (includeCharts) {
      csvRows.push(`--- ${periodData.trendTitle.toUpperCase()} ---`);
      csvRows.push('Interval Periode,Jumlah Diproduksi,Berhasil Terbit,Tingkat Keberhasilan (%)');
      periodData.trendData.forEach((w) => {
        const rate = Math.round((w.published / (w.produced || 1)) * 100);
        csvRows.push(`"${w.label}",${w.produced},${w.published},"${rate}%"`);
      });
      csvRows.push('');

      csvRows.push('--- DISTRIBUSI STATUS SIKLUS HIDUP KONTEN ---');
      csvRows.push('Status Siklus Hidup,Jumlah Paket,Proporsi (%)');
      periodData.lifecycle.forEach((l) => {
        csvRows.push(`"${l.label}",${l.count},"${Math.round((l.count / l.total) * 100)}%"`);
      });
      csvRows.push('');
    }

    // 3. Kinerja Kanal Publikasi Resmi
    if (includeChannels) {
      csvRows.push('--- KINERJA KANAL PUBLIKASI RESMI (CHANNEL PERFORMANCE) ---');
      csvRows.push('Saluran Publikasi,Volume Siar (Postingan),Realisasi Engagement,Target Capaian,Variansi (%),Evaluasi Kinerja');
      displayedChannels.forEach((row) => {
        csvRows.push(
          `"${row.channel}","${row.pubCount} Postingan","${row.engagement}","${row.target}","${row.variance}","${
            row.variance.startsWith('+') ? 'Melampaui Target' : 'Perlu Evaluasi'
          }"`
        );
      });
      csvRows.push('');
    }

    // 4. Campaign Scorecard
    if (includeScorecards) {
      csvRows.push('--- LEMBAR SKOR KAMPANYE (CAMPAIGN SCORECARD) ---');
      csvRows.push('Nama Kampanye,Objektif Utama,Target Capaian,Capaian Aktual,Variansi,Lessons Learned');
      campaignScorecards.forEach((sc) => {
        csvRows.push(
          `"${sc.name}","${sc.objective.replace(/"/g, '""')}","${sc.target}","${sc.actual}","${sc.variance}","${sc.lessonsLearned.replace(
            /"/g,
            '""'
          )}"`
        );
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvRows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    const safePresetName = activePreset.name.replace(/[^a-zA-Z0-9]/g, '_');
    link.setAttribute(
      'download',
      mode === 'preset'
        ? `HortiFlow_Analytics_${safePresetName}_${activePeriodKey}_${new Date().toISOString().slice(0, 10)}.csv`
        : `HortiFlow_Analytics_AllData_${activePeriodKey}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const toastMsg =
      mode === 'preset'
        ? `Laporan CSV Preset "${activePreset.name}" (${periodData.periodLabel}) berhasil diunduh!`
        : `Laporan CSV Lengkap (${periodData.periodLabel}) berhasil diunduh!`;
    setExportSuccessToast(toastMsg);
    setTimeout(() => setExportSuccessToast(null), 4000);
  };

  // Open PDF Preview Modal
  const handleOpenPdfModal = () => {
    setShowExportMenu(false);
    setShowPdfModal(true);
  };

  // Print PDF Function
  const handlePrintPDF = () => {
    window.print();
  };

  // Direct Quick Print
  const handleDirectPrint = () => {
    setShowExportMenu(false);
    setShowPdfModal(true);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div
      className={`space-y-6 lg:space-y-8 pb-12 ${showPdfModal ? 'print:hidden' : ''}`}
      id="analytics-dashboard-view"
    >
      {/* Toast Notification */}
      {exportSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 print:hidden">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{exportSuccessToast}</span>
        </div>
      )}

      {/* 1. Header with Title, View Presets & Export Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pusat Evaluasi Kinerja & Dampak Publik</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
            Evaluasi & Analitik
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Analisis menyeluruh metrik operasional, kinerja saluran siar, scorecard kampanye, dan efisiensi alur kerja konten.
          </p>
        </div>

        {/* Action Controls: View Presets Manager + Export Dropdown */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-auto print:hidden">
          {/* VIEW PRESETS MANAGER COMPONENT */}
          <ViewPresetsManager
            currentPeriodKey={activePeriodKey}
            currentSelectedMonth={
              activePeriodKey === 'MONTH' && activePeriodObj.year && activePeriodObj.monthIndex !== undefined
                ? { year: activePeriodObj.year, monthIndex: activePeriodObj.monthIndex }
                : null
            }
            currentCampaignFilter={campaignFilter}
            currentChannelFilter={channelFilter}
            currentWidgets={dashboardWidgets}
            onApplyPreset={handleApplyPreset}
            onToggleWidget={handleToggleWidget}
            onResetWidgets={handleResetWidgets}
          />

          {/* Export Dropdown */}
          <div className="relative">
            <button
              id="btn-export-analytics-report"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-2"
              title="Pilihan Ekspor dan Cetak Laporan"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Ekspor & Cetak Laporan</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {/* Export Dropdown Menu */}
            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs divide-y divide-slate-100">
                  <div className="px-3.5 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Opsi Ekspor & Cetak</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-medium max-w-[120px] truncate">
                      {activePreset.name}
                    </span>
                  </div>

                  <div className="p-1 space-y-0.5">
                    <button
                      id="btn-export-csv-preset"
                      onClick={() => handleExportCSV('preset')}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2.5 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-200 shrink-0">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 group-hover:text-emerald-950 truncate">
                          Ekspor CSV (Sesuai Preset)
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          Preset: {activePreset.name}
                        </div>
                      </div>
                    </button>

                    <button
                      id="btn-export-csv-all"
                      onClick={() => handleExportCSV('all')}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-100 flex items-center gap-2.5 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-200 shrink-0">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800">Ekspor CSV Lengkap</div>
                        <div className="text-[10px] text-slate-500">Semua metrik dan tabel modul</div>
                      </div>
                    </button>
                  </div>

                  <div className="p-1 space-y-0.5">
                    <button
                      id="btn-export-pdf"
                      onClick={handleOpenPdfModal}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-rose-50 hover:text-rose-900 flex items-center gap-2.5 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-md bg-rose-100 flex items-center justify-center text-rose-700 group-hover:bg-rose-200 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 group-hover:text-rose-950">
                          Pratinjau & Cetak Laporan PDF
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Format resmi standar A4 Ditjen Hortikultura
                        </div>
                      </div>
                    </button>

                    <button
                      id="btn-direct-print"
                      onClick={handleDirectPrint}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2.5 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-200 shrink-0">
                        <Printer className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800">Cetak Langsung (Quick Print)</div>
                        <div className="text-[10px] text-slate-500">Buka dialog cetak browser langsung</div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. DATE RANGE & ALL MONTHS SELECTOR COMPONENT */}
      <DateRangeSelector
        activePeriod={activePeriodKey}
        activePeriodObj={activePeriodObj}
        onSelectPeriod={handleSelectPeriod}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onCustomDateChange={(start, end) => {
          setCustomStartDate(start);
          setCustomEndDate(end);
        }}
      />

      {/* 3. Secondary Filter Bar (Campaign & Channel) + Active View Banner */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-700">Filter Tambahan:</span>

          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Kampanye</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Saluran Siar</option>
            <option value="instagram">Instagram Feed & Carousel</option>
            <option value="website">Website Portal Resmi</option>
            <option value="youtube">YouTube Video & Shorts</option>
            <option value="tiktok">TikTok Edukasi Tani</option>
            <option value="twitter">X / Twitter Resmi</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-slate-400 font-mono text-[11px]">
          {isCustomViewActive && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-sans font-semibold text-[11px]">
              <span>Fokus Tampilan: {visibleWidgetCount}/5 Widget Aktif</span>
              <button
                type="button"
                onClick={handleResetWidgets}
                className="underline hover:text-amber-950 font-bold ml-1"
              >
                Reset Semua
              </button>
            </div>
          )}
          <span>Menampilkan rentang:</span>
          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150">
            {periodData.periodLabel}
          </span>
        </div>
      </div>

      {/* 4. 8 Top KPI Cards dynamically reacting to Date Range & Presets */}
      {dashboardWidgets.kpiCards && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 animate-in fade-in" id="analytics-kpi-cards">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-medium text-slate-500 block">Paket Diproduksi</span>
            <div className="text-xl font-black text-slate-900 font-mono tabular-nums">{periodData.totalProduced}</div>
            <span className="text-[9px] text-emerald-700 font-semibold block">Volume periode</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-medium text-slate-500 block">Publikasi Berhasil</span>
            <div className="text-xl font-black text-emerald-700 font-mono tabular-nums">{periodData.publishedCount}</div>
            <span className="text-[9px] text-emerald-700 font-semibold block">98.5% sukses</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-medium text-slate-500 block">Kepatuhan SLA</span>
            <div className="text-xl font-black text-emerald-700 font-mono tabular-nums">{periodData.slaCompliance}%</div>
            <span className="text-[9px] text-emerald-700 font-semibold block">Target: 95%</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-medium text-slate-500 block">Avg Cycle Time</span>
            <div className="text-xl font-black text-slate-900 font-mono tabular-nums">{periodData.avgCycleTime}</div>
            <span className="text-[9px] text-emerald-700 font-semibold block">Stabil</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-medium text-slate-500 block">Terkendala</span>
            <div className="text-xl font-black text-amber-600 font-mono tabular-nums">{periodData.blockedCount}</div>
            <span className="text-[9px] text-amber-700 font-semibold block">
              {periodData.blockedCount > 0 ? `${periodData.blockedCount} Blocker` : 'Nihil'}
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-medium text-slate-500 block">Approval Sukses</span>
            <div className="text-xl font-black text-slate-900 font-mono tabular-nums">{periodData.approvalSuccessRate}%</div>
            <span className="text-[9px] text-slate-500 font-semibold block">Tingkat lolos</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-medium text-slate-500 block">Total Engagement</span>
            <div className="text-xl font-black text-slate-900 font-mono tabular-nums">{periodData.totalEngagement}</div>
            <span className="text-[9px] text-emerald-700 font-semibold block">Aksi interaksi</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-medium text-slate-500 block">Arsip Selesai</span>
            <div className="text-xl font-black text-emerald-700 font-mono tabular-nums">{periodData.archiveCompletion}%</div>
            <span className="text-[9px] text-emerald-700 font-semibold block">Manifest lengkap</span>
          </div>
        </div>
      )}

      {/* 5. Operational Insights matching active range & Presets */}
      {dashboardWidgets.operationalInsights && (
        <div className="bg-emerald-950 text-white rounded-2xl p-6 border border-emerald-900/90 shadow-sm space-y-3 animate-in fade-in" id="analytics-operational-insights">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm tracking-wide text-emerald-200 uppercase font-['Plus_Jakarta_Sans',sans-serif]">
              Rangkuman Wawasan Operasional ({periodData.periodLabel})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-emerald-900/50 rounded-xl border border-emerald-800/80 space-y-1">
              <span className="text-emerald-400 font-bold block">Peningkatan Instagram:</span>
              <p className="text-emerald-100/90 leading-relaxed">
                Publikasi Instagram mencatatkan engagement konsisten dengan format Carousel edukasi varietas benih.
              </p>
            </div>

            <div className="p-3 bg-emerald-900/50 rounded-xl border border-emerald-800/80 space-y-1">
              <span className="text-amber-300 font-bold block">Evaluasi Saluran Siar:</span>
              <p className="text-emerald-100/90 leading-relaxed">
                Saluran video YouTube mencatatkan variansi target di bawah proyeksi, direkomendasikan penguatan judul & thumbnail.
              </p>
            </div>

            <div className="p-3 bg-emerald-900/50 rounded-xl border border-emerald-800/80 space-y-1">
              <span className="text-emerald-400 font-bold block">Kinerja SLA & Review:</span>
              <p className="text-emerald-100/90 leading-relaxed">
                Kepatuhan SLA stabil di angka {periodData.slaCompliance}% dengan rata-rata siklus {periodData.avgCycleTime}.
              </p>
            </div>

            <div className="p-3 bg-emerald-900/50 rounded-xl border border-emerald-800/80 space-y-1">
              <span className="text-emerald-400 font-bold block">Kepatuhan Aksesibilitas:</span>
              <p className="text-emerald-100/90 leading-relaxed">
                Seluruh materi rilis telah diverifikasi memiliki teks alternatif dan kontras rasio WCAG AA.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. Production & Channel Graphical Analysis */}
      {dashboardWidgets.charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in" id="analytics-charts">
          {/* Visual Chart 1: Dynamic Trend Produksi vs Publikasi */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                {periodData.trendTitle}
              </h3>
              <span className="text-xs text-slate-500 font-mono">{periodData.trendSubtext}</span>
            </div>

            <div className="h-44 flex items-end justify-between gap-2 sm:gap-3 pt-4 px-2">
              {periodData.trendData.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-32">
                    <div
                      className="w-4 sm:w-5 bg-slate-200 rounded-t-sm transition-all duration-300"
                      style={{ height: `${Math.min(100, Math.max(15, (item.produced / periodData.trendMax) * 100))}%` }}
                      title={`Produksi: ${item.produced}`}
                    />
                    <div
                      className="w-4 sm:w-5 bg-emerald-600 rounded-t-sm transition-all duration-300"
                      style={{ height: `${Math.min(100, Math.max(15, (item.published / periodData.trendMax) * 100))}%` }}
                      title={`Publikasi: ${item.published}`}
                    />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 font-mono text-center">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-slate-300" />
                <span>Paket Diproduksi</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-emerald-600" />
                <span>Paket Berhasil Terbit</span>
              </div>
            </div>
          </div>

          {/* Visual Chart 2: Dynamic Lifecycle Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Distribusi Status Siklus Hidup Konten
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                Total {periodData.totalProduced} Paket
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {periodData.lifecycle.map((item, idx) => {
                const percent = item.total > 0 ? Math.round((item.count / item.total) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-700">{item.label}</span>
                      <span className="font-mono font-bold text-slate-900">
                        {item.count} paket ({percent}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all duration-300`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 7. Channel Performance Data Table */}
      {dashboardWidgets.channelTable && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-0 animate-in fade-in" id="analytics-channel-table">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Tabel Kinerja Kanal Publikasi (Channel Performance)</h3>
              <p className="text-xs text-slate-500">
                Evaluasi efektivitas konten per saluran distribusi resmi periode {periodData.periodLabel}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100/60 px-2.5 py-1 rounded-lg border border-emerald-200/80 self-start sm:self-auto">
              {displayedChannels.length} Saluran Terdaftar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                <tr>
                  <th className="p-3.5">Saluran Publikasi</th>
                  <th className="p-3.5">Volume Siar (Publication)</th>
                  <th className="p-3.5">Realisasi Engagement</th>
                  <th className="p-3.5">Target Capaian</th>
                  <th className="p-3.5">Variansi (%)</th>
                  <th className="p-3.5">Status Kinerja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedChannels.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{row.channel}</td>
                    <td className="p-3.5 font-mono text-slate-700 font-semibold">{row.pubCount} Postingan</td>
                    <td className="p-3.5 font-mono font-bold text-slate-900">{row.engagement}</td>
                    <td className="p-3.5 font-mono text-slate-500">{row.target}</td>
                    <td
                      className={`p-3.5 font-mono font-bold ${
                        row.variance.startsWith('+') ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {row.variance}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          row.variance.startsWith('+')
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {row.variance.startsWith('+') ? 'Melampaui Target' : 'Perlu Evaluasi'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. Campaign Scorecard matching Section 20 */}
      {dashboardWidgets.campaignScorecard && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 animate-in fade-in" id="analytics-campaign-scorecards">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Campaign Scorecard (Lembar Skor Kampanye)
              </h3>
              <p className="text-xs text-slate-500">
                Komparasi objektif tujuan, target numerik, capaian aktual, variansi, dan pelajaran yang dipetik.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {campaignScorecards.map((sc, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900">{sc.name}</span>
                  <span className="font-mono text-emerald-700 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full text-[11px]">
                    {sc.variance}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-slate-150">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Objektif Utama</span>
                    <span className="font-semibold text-slate-800">{sc.objective}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Target Capaian</span>
                    <span className="font-bold text-slate-900 font-mono">{sc.target}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Capaian Aktual</span>
                    <span className="font-bold text-emerald-700 font-mono">{sc.actual}</span>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block mb-0.5">Lessons Learned (Pelajaran Evaluasi):</span>
                  <p className="text-slate-600 leading-relaxed italic">{sc.lessonsLearned}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. PDF Preview & Print Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in print:static print:inset-auto print:z-auto print:bg-white print:p-0 print:m-0 print:overflow-visible print:block">
          <div
            ref={pdfModalRef}
            className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] print:max-w-none print:w-full print:shadow-none print:border-none print:max-h-none print:overflow-visible print:rounded-none"
          >
            {/* Modal Action Bar - Hidden in Print */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm">Pratinjau Dokumen Laporan Evaluasi & Kinerja (PDF Resmi)</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded font-mono">
                  Preset: {activePreset.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-print-pdf-report"
                  onClick={handlePrintPDF}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                  title="Tutup Pratinjau"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Report Document Container */}
            <div
              className="p-8 sm:p-10 overflow-y-auto space-y-7 text-slate-900 bg-white print:p-6 print:overflow-visible print:space-y-6 print:text-black"
              id="printable-analytics-report"
            >
              {/* Kop Surat Resmi Ditjen Hortikultura */}
              <div className="border-b-2 border-emerald-800 pb-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <Logo size="md" />
                    <div className="border-l border-slate-200 pl-3.5">
                      <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 leading-tight">
                        Kementerian Pertanian Republik Indonesia
                      </h2>
                      <p className="text-xs font-semibold text-emerald-800">
                        Direktorat Jenderal Hortikultura
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Sistem Manajemen & Evaluasi Dampak Publikasi Terpadu (HortiFlow)
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-xs space-y-1">
                    <div className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">
                      Laporan Evaluasi & Analitik Kinerja
                    </div>
                    <div className="text-slate-600">
                      No. Dokumen: <span className="font-mono font-bold text-slate-800">RPT/HF/{new Date().getFullYear()}/09/01</span>
                    </div>
                    <div className="text-slate-600">
                      Tanggal Terbit: <span className="font-mono">{new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px]">
                      <span>Periode: {periodData.periodLabel}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-slate-150 text-[11px] text-slate-500">
                  <div>
                    <span>Preset Analisis: </span>
                    <strong className="text-slate-800">{activePreset.name}</strong>
                    <span className="text-slate-400"> — {activePreset.description}</span>
                  </div>
                  <div className="font-mono text-slate-400">Klasifikasi: DOKUMEN EVALUASI INTERNAL</div>
                </div>
              </div>

              {/* Ringkasan Eksekutif (Executive Summary) */}
              <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-5 space-y-3.5 print-break-inside-avoid">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                      Ringkasan Eksekutif Kinerja Publikasi ({periodData.periodLabel})
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    Status Kinerja: Memenuhi Target
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed text-justify">
                  Berdasarkan pemantauan siklus hidup konten hortikultura pada periode <strong>{periodData.periodLabel}</strong>,
                  total <strong>{periodData.totalProduced} paket materi informasi</strong> telah diproduksi dengan <strong>{periodData.publishedCount} paket</strong> berhasil disiarkan secara multikanal.
                  Tingkat kepatuhan terhadap Service Level Agreement (SLA) operasional mencapai <strong className="text-emerald-700">{periodData.slaCompliance}%</strong> (target minimum 95.0%).
                  Akumulasi interaksi dan keterlibatan masyarakat (engagement) tercatat sebesar <strong className="text-slate-900">{periodData.totalEngagement}</strong> reaksi dan tanggapan aktif masyarakat terhadap kampanye prioritas.
                </p>

                {/* 3 Executive Highlight Callout Cards */}
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Kepatuhan SLA</span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-lg font-black font-mono text-emerald-700">{periodData.slaCompliance}%</span>
                      <span className="text-[10px] text-slate-500 font-medium">Target ≥95%</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Kecepatan telaah eselon & distribusi tepat waktu.</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Rasio Terbit Sukses</span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-lg font-black font-mono text-slate-900">
                        {Math.round((periodData.publishedCount / (periodData.totalProduced || 1)) * 100)}%
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium font-mono">({periodData.publishedCount}/{periodData.totalProduced} Paket)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Konversi paket naskah & grafis siap tayang.</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Interaksi Publik</span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-lg font-black font-mono text-slate-900">{periodData.totalEngagement}</span>
                      <span className="text-[10px] text-emerald-700 font-medium">Total Respon</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Jangkauan gabungan kanal portal & media sosial.</p>
                  </div>
                </div>
              </div>

              {/* 1. Rekapitulasi Statistik KPI Operasional (8 Kartu Lengkap) */}
              {dashboardWidgets.kpiCards && (
                <div className="space-y-2.5 print-break-inside-avoid">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
                      1. Rekapitulasi Metrik Kinerja Utama (KPI Operasional)
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">8 Indikator Terpantau</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2.5 text-xs">
                    <div className="p-3 border border-slate-200 rounded-lg bg-white kpi-print-card">
                      <span className="text-[10px] text-slate-500 font-medium block">Total Diproduksi</span>
                      <span className="text-lg font-black font-mono text-slate-900">{periodData.totalProduced} Paket</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Volume Periode</span>
                    </div>

                    <div className="p-3 border border-slate-200 rounded-lg bg-white kpi-print-card">
                      <span className="text-[10px] text-slate-500 font-medium block">Publikasi Berhasil</span>
                      <span className="text-lg font-black font-mono text-emerald-700">{periodData.publishedCount} Paket</span>
                      <span className="text-[10px] text-emerald-600 block mt-0.5">Siap & Terdistribusi</span>
                    </div>

                    <div className="p-3 border border-slate-200 rounded-lg bg-white kpi-print-card">
                      <span className="text-[10px] text-slate-500 font-medium block">Kepatuhan SLA</span>
                      <span className="text-lg font-black font-mono text-emerald-700">{periodData.slaCompliance}%</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Standar ≥95.0%</span>
                    </div>

                    <div className="p-3 border border-slate-200 rounded-lg bg-white kpi-print-card">
                      <span className="text-[10px] text-slate-500 font-medium block">Total Engagement</span>
                      <span className="text-lg font-black font-mono text-slate-900">{periodData.totalEngagement}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Respon Publik</span>
                    </div>

                    <div className="p-3 border border-slate-200 rounded-lg bg-white kpi-print-card">
                      <span className="text-[10px] text-slate-500 font-medium block">Rata-rata Cycle Time</span>
                      <span className="text-lg font-black font-mono text-slate-900">{periodData.avgCycleTime}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Durasi Produksi</span>
                    </div>

                    <div className="p-3 border border-slate-200 rounded-lg bg-white kpi-print-card">
                      <span className="text-[10px] text-slate-500 font-medium block">Tingkat Persetujuan</span>
                      <span className="text-lg font-black font-mono text-emerald-700">{periodData.approvalSuccessRate}%</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Lolos Telaah Eselon</span>
                    </div>

                    <div className="p-3 border border-slate-200 rounded-lg bg-white kpi-print-card">
                      <span className="text-[10px] text-slate-500 font-medium block">Kendala Produksi</span>
                      <span className="text-lg font-black font-mono text-amber-700">{periodData.blockedCount} Blocker</span>
                      <span className="text-[10px] text-amber-600 block mt-0.5">Status Tertahan</span>
                    </div>

                    <div className="p-3 border border-slate-200 rounded-lg bg-white kpi-print-card">
                      <span className="text-[10px] text-slate-500 font-medium block">Kelengkapan Arsip</span>
                      <span className="text-lg font-black font-mono text-emerald-700">{periodData.archiveCompletion}%</span>
                      <span className="text-[10px] text-emerald-600 block mt-0.5">Manifest Digital 100%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Grafik Evaluasi Tren Konten (Visual Print-Friendly Bar Chart & Lifecycle) */}
              {dashboardWidgets.charts && (
                <div className="space-y-3.5 print-break-inside-avoid">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <div>
                      <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
                        2. Grafik Evaluasi Tren Produksi & Publikasi Konten
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {periodData.trendTitle} — Analisis komparasi volume materi naskah diproduksi terhadap realisasi paket berhasil tayang.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-xs bg-slate-700 inline-block" />
                        <span className="text-slate-600 font-medium">Diproduksi</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block" />
                        <span className="text-slate-600 font-medium">Berhasil Terbit</span>
                      </div>
                    </div>
                  </div>

                  {/* Clean Dual Bar Breakdown */}
                  <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3.5 chart-print-card">
                    {periodData.trendData.map((item, idx) => {
                      const rate = Math.round((item.published / (item.produced || 1)) * 100);
                      const producedPct = Math.min(100, Math.round((item.produced / periodData.trendMax) * 100));
                      const publishedPct = Math.min(100, Math.round((item.published / periodData.trendMax) * 100));

                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                            <span className="font-mono text-slate-900 font-bold">{item.label}</span>
                            <div className="flex items-center gap-3 text-[11px]">
                              <span className="text-slate-500 font-mono">{item.produced} Paket Diproduksi</span>
                              <span className="text-emerald-700 font-mono font-bold">{item.published} Terbit</span>
                              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-white border border-slate-200 font-bold text-slate-700">
                                {rate}% Sukses
                              </span>
                            </div>
                          </div>

                          {/* Dual Bar Comparison */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-slate-200/80 rounded h-3 overflow-hidden">
                              <div
                                className="bg-slate-700 h-full rounded"
                                style={{ width: `${producedPct}%` }}
                              />
                            </div>
                            <div className="bg-emerald-100/80 rounded h-3 overflow-hidden">
                              <div
                                className="bg-emerald-600 h-full rounded"
                                style={{ width: `${publishedPct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Lifecycle Proportional Distribution Bar */}
                    <div className="pt-3 border-t border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700 uppercase tracking-wider">
                          Distribusi Status Siklus Hidup Materi
                        </span>
                        <span className="font-mono text-slate-500">Total {periodData.totalProduced} Paket Terdaftar</span>
                      </div>

                      {/* Segmented Bar */}
                      <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-200">
                        {periodData.lifecycle.map((l, lIdx) => {
                          const pct = Math.round((l.count / l.total) * 100);
                          return (
                            <div
                              key={lIdx}
                              title={`${l.label}: ${l.count} Paket (${pct}%)`}
                              className={`${l.color} h-full transition-all`}
                              style={{ width: `${pct}%` }}
                            />
                          );
                        })}
                      </div>

                      {/* Legend */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 pt-1">
                        {periodData.lifecycle.map((l, lIdx) => (
                          <div key={lIdx} className="flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-xs ${l.color}`} />
                            <span className="font-medium text-slate-700">{l.label}:</span>
                            <span className="font-mono font-bold text-slate-900">{l.count}</span>
                            <span className="font-mono text-[10px] text-slate-400">
                              ({Math.round((l.count / l.total) * 100)}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Kinerja Kanal Publikasi Resmi (Channel Performance Table) */}
              {dashboardWidgets.channelTable && (
                <div className="space-y-2.5 print-break-inside-avoid">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
                      3. Kinerja Kanal Publikasi Resmi
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">Evaluasi Efektivitas Saluran</span>
                  </div>

                  <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-100/80 border-b border-slate-200 font-bold text-slate-700">
                      <tr>
                        <th className="p-2.5">Saluran Publikasi</th>
                        <th className="p-2.5">Volume Siar</th>
                        <th className="p-2.5">Realisasi Engagement</th>
                        <th className="p-2.5">Target Capaian</th>
                        <th className="p-2.5">Variansi (%)</th>
                        <th className="p-2.5">Evaluasi Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {displayedChannels.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-semibold text-slate-900">{row.channel}</td>
                          <td className="p-2.5 font-mono text-slate-700">{row.pubCount} Postingan</td>
                          <td className="p-2.5 font-mono font-bold text-slate-900">{row.engagement}</td>
                          <td className="p-2.5 font-mono text-slate-500">{row.target}</td>
                          <td
                            className={`p-2.5 font-mono font-bold ${
                              row.variance.startsWith('+') ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {row.variance}
                          </td>
                          <td className="p-2.5 font-semibold">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                row.variance.startsWith('+')
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {row.variance.startsWith('+') ? 'Melampaui Target' : 'Perlu Evaluasi'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 4. Evaluasi Skor Kampanye (Campaign Scorecard) */}
              {dashboardWidgets.campaignScorecard && (
                <div className="space-y-2.5 print-break-inside-avoid">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
                      4. Evaluasi Skor Kampanye Strategis
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">Pencapaian Objektif & Pelajaran Evaluasi</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {campaignScorecards.map((sc, idx) => (
                      <div
                        key={idx}
                        className="p-3 border border-slate-200 rounded-lg bg-slate-50/60 scorecard-print-card space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900 text-xs">{sc.name}</span>
                          <span className="text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                            {sc.variance}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[11px] bg-white p-2 rounded border border-slate-200">
                          <div>
                            <span className="text-slate-400 block">Objektif Utama:</span>
                            <span className="font-medium text-slate-800">{sc.objective}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Target:</span>
                            <span className="font-mono font-bold text-slate-900">{sc.target}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Realisasi Aktual:</span>
                            <span className="font-mono font-bold text-emerald-700">{sc.actual}</span>
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-600 italic bg-white p-2 rounded border border-slate-150">
                          <strong className="text-slate-700 font-semibold not-italic">Lessons Learned: </strong>
                          {sc.lessonsLearned}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Lembar Pengesahan & Tanda Tangan Resmi */}
              <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-600 print-break-inside-avoid">
                <div>
                  <p className="font-medium text-slate-500">Disiapkan & Diverifikasi Oleh:</p>
                  <p className="font-bold text-slate-900 mt-0.5 text-sm">Tim Analitik & Kualitas Konten HortiFlow</p>
                  <p className="text-[11px] text-slate-400">Subdirektorat Pengelolaan Opini & Media Informasi</p>
                  <div className="h-14 border-b border-slate-400 w-56 mt-4" />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Tanggal: {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="font-medium text-slate-500">Mengetahui & Menyetujui:</p>
                  <p className="font-bold text-slate-900 mt-0.5 text-sm">Koordinator Publikasi & Distribusi Hortikultura</p>
                  <p className="text-[11px] text-slate-400">Direktorat Jenderal Hortikultura - Kementan RI</p>
                  <div className="h-14 border-b border-slate-400 w-56 mt-4" />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Jakarta, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
