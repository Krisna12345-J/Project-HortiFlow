import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Eye,
  Heart,
  Share2,
  MousePointer,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { MetricSnapshot, ISODateString } from '../../types';

export interface ContentPerformanceMetricsProps {
  initialData?: MetricSnapshot[];
  title?: string;
  className?: string;
}

// -------------------------------------------------------------
// MOCK DATASET (MetricSnapshot Schema Compliant)
// -------------------------------------------------------------
export const MOCK_PERFORMANCE_METRICS: MetricSnapshot[] = [
  {
    id: 'met-001',
    packageId: 'pkg-001',
    channel: 'INSTAGRAM',
    reach: 12400,
    impressions: 18200,
    engagements: 1420,
    shares: 310,
    clicks: 890,
    cycleTimeHours: 18,
    recordedAt: '2026-03-01T08:00:00.000Z' as ISODateString,
    createdAt: '2026-03-01T08:00:00.000Z' as ISODateString,
  },
  {
    id: 'met-002',
    packageId: 'pkg-001',
    channel: 'INSTAGRAM',
    reach: 16800,
    impressions: 24500,
    engagements: 2150,
    shares: 480,
    clicks: 1240,
    cycleTimeHours: 16,
    recordedAt: '2026-03-04T08:00:00.000Z' as ISODateString,
    createdAt: '2026-03-04T08:00:00.000Z' as ISODateString,
  },
  {
    id: 'met-003',
    packageId: 'pkg-002',
    channel: 'YOUTUBE',
    reach: 24500,
    impressions: 38900,
    engagements: 3890,
    shares: 820,
    clicks: 2100,
    cycleTimeHours: 24,
    recordedAt: '2026-03-07T08:00:00.000Z' as ISODateString,
    createdAt: '2026-03-07T08:00:00.000Z' as ISODateString,
  },
  {
    id: 'met-004',
    packageId: 'pkg-002',
    channel: 'WEBSITE',
    reach: 31200,
    impressions: 45000,
    engagements: 4600,
    shares: 1140,
    clicks: 3450,
    cycleTimeHours: 14,
    recordedAt: '2026-03-10T08:00:00.000Z' as ISODateString,
    createdAt: '2026-03-10T08:00:00.000Z' as ISODateString,
  },
  {
    id: 'met-005',
    packageId: 'pkg-003',
    channel: 'TIKTOK',
    reach: 48900,
    impressions: 72000,
    engagements: 8100,
    shares: 2450,
    clicks: 4820,
    cycleTimeHours: 12,
    recordedAt: '2026-03-12T08:00:00.000Z' as ISODateString,
    createdAt: '2026-03-12T08:00:00.000Z' as ISODateString,
  },
  {
    id: 'met-006',
    packageId: 'pkg-003',
    channel: 'INSTAGRAM',
    reach: 56400,
    impressions: 89000,
    engagements: 9750,
    shares: 3120,
    clicks: 6100,
    cycleTimeHours: 10,
    recordedAt: '2026-03-14T08:00:00.000Z' as ISODateString,
    createdAt: '2026-03-14T08:00:00.000Z' as ISODateString,
  },
  {
    id: 'met-007',
    packageId: 'pkg-004',
    channel: 'X',
    reach: 64200,
    impressions: 104000,
    engagements: 11800,
    shares: 3980,
    clicks: 7450,
    cycleTimeHours: 8,
    recordedAt: '2026-03-15T08:00:00.000Z' as ISODateString,
    createdAt: '2026-03-15T08:00:00.000Z' as ISODateString,
  },
];

type TimeframeOption = '7D' | '30D' | '90D';

export const ContentPerformanceMetricsCard: React.FC<ContentPerformanceMetricsProps> = ({
  initialData = MOCK_PERFORMANCE_METRICS,
  title = 'Content Performance Metrics',
  className = '',
}) => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>('30D');
  const [activeMetrics, setActiveMetrics] = useState({
    reach: true,
    engagements: true,
    shares: true,
    clicks: true,
  });

  // Transform snapshot data for charting
  const chartData = useMemo(() => {
    return initialData.map((item) => {
      const dateObj = new Date(item.recordedAt);
      const formattedDate = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
      }).format(dateObj);

      const engagementRate =
        item.reach > 0 ? Number(((item.engagements / item.reach) * 100).toFixed(1)) : 0;

      return {
        date: formattedDate,
        rawDate: item.recordedAt,
        channel: item.channel,
        reach: item.reach,
        impressions: item.impressions || Math.round(item.reach * 1.4),
        engagements: item.engagements,
        shares: item.shares,
        clicks: item.clicks,
        engagementRate,
      };
    });
  }, [initialData]);

  // Aggregate summary calculations
  const totals = useMemo(() => {
    const totalReach = initialData.reduce((acc, curr) => acc + curr.reach, 0);
    const totalEngagements = initialData.reduce((acc, curr) => acc + curr.engagements, 0);
    const totalShares = initialData.reduce((acc, curr) => acc + curr.shares, 0);
    const totalClicks = initialData.reduce((acc, curr) => acc + curr.clicks, 0);
    const avgEngagementRate =
      totalReach > 0 ? ((totalEngagements / totalReach) * 100).toFixed(1) : '0';

    return {
      totalReach,
      totalEngagements,
      totalShares,
      totalClicks,
      avgEngagementRate,
    };
  }, [initialData]);

  const toggleMetric = (key: keyof typeof activeMetrics) => {
    setActiveMetrics((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div
      id="content-performance-metrics-card"
      className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-all ${className}`}
    >
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Timeline analitik jangkauan publikasi, interaksi pembaca, dan performa kanal
              </p>
            </div>
          </div>
        </div>

        {/* Timeframe Pill Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start sm:self-auto">
          {(
            [
              { id: '7D', label: '7 Hari' },
              { id: '30D', label: '30 Hari' },
              { id: '90D', label: '90 Hari' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              id={`btn-timeframe-${opt.id}`}
              onClick={() => setTimeframe(opt.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                timeframe === opt.id
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Key Metrics Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 my-5">
        <div
          onClick={() => toggleMetric('reach')}
          className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
            activeMetrics.reach
              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-medium">
              <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Total Jangkauan (Views)
            </span>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center">
              +18.4% <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            {totals.totalReach.toLocaleString('id-ID')}
          </div>
        </div>

        <div
          onClick={() => toggleMetric('engagements')}
          className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
            activeMetrics.engagements
              ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-medium">
              <Heart className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Engagements
            </span>
            <span className="text-[10px] font-bold text-blue-600">
              {totals.avgEngagementRate}% Avg
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            {totals.totalEngagements.toLocaleString('id-ID')}
          </div>
        </div>

        <div
          onClick={() => toggleMetric('shares')}
          className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
            activeMetrics.shares
              ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-medium">
              <Share2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Total Shares / Sebaran
            </span>
            <span className="text-[10px] font-bold text-amber-600 flex items-center">
              +12.6% <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            {totals.totalShares.toLocaleString('id-ID')}
          </div>
        </div>

        <div
          onClick={() => toggleMetric('clicks')}
          className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
            activeMetrics.clicks
              ? 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-medium">
              <MousePointer className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Link Clicks
            </span>
            <span className="text-[10px] font-bold text-purple-600">
              CTR: {(totals.totalClicks / (totals.totalReach || 1) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            {totals.totalClicks.toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      {/* 3. Recharts Visual Chart Container */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="gradientReach" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="gradientEngagements" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="gradientShares" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="gradientClicks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
            <XAxis
              dataKey="date"
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickFormatter={(value) => (value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value)}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs">
                      <div className="font-semibold text-slate-300 pb-1.5 mb-1.5 border-b border-slate-700 flex items-center justify-between gap-4">
                        <span>{label}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                          {payload[0]?.payload?.channel || 'MULTI-KANAL'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {payload.map((entry, index) => (
                          <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="capitalize">{entry.name}:</span>
                            </span>
                            <span className="font-mono font-bold">
                              {Number(entry.value).toLocaleString('id-ID')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
            />

            {activeMetrics.reach && (
              <Area
                type="monotone"
                name="Reach (Jangkauan)"
                dataKey="reach"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#gradientReach)"
              />
            )}

            {activeMetrics.engagements && (
              <Area
                type="monotone"
                name="Engagements"
                dataKey="engagements"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#gradientEngagements)"
              />
            )}

            {activeMetrics.shares && (
              <Area
                type="monotone"
                name="Shares"
                dataKey="shares"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradientShares)"
              />
            )}

            {activeMetrics.clicks && (
              <Area
                type="monotone"
                name="Clicks"
                dataKey="clicks"
                stroke="#a855f7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradientClicks)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 4. Footer Note */}
      <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          Sinkronisasi data metrik otomatis setiap 6 jam
        </span>
        <span className="font-medium text-slate-700 dark:text-slate-300">
          Klik kartu metrik di atas untuk filter kurva
        </span>
      </div>
    </div>
  );
};

export default ContentPerformanceMetricsCard;
