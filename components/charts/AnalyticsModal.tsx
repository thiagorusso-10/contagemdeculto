import React, { useMemo, useState } from 'react';
import { X, BarChart3, Eye } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ExecutiveSummaryCards } from './ExecutiveSummaryCards';
import { WeeklyTrendChart, WeeklyDataPoint } from './WeeklyTrendChart';
import { DemographicsPie } from './DemographicsPie';
import { NeoButton } from '../ui/NeoButton';

interface AnalyticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    campusId?: string;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ isOpen, onClose, campusId }) => {
    const { reports } = useStore();
    const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);

    const analyticsData = useMemo(() => {
        let filtered = reports;
        if (campusId) {
            filtered = reports.filter(r => r.campusId === campusId);
        }
        if (filtered.length === 0) {
            return {
                summary: { thisWeekTotal: 0, lastWeekTotal: 0, thisWeekVisitors: 0 },
                dailyTrend: [],
            };
        }

        // Group reports by DATE (not week)
        const dailyData: Record<string, { total: number; visitors: number }> = {};

        filtered.forEach(r => {
            if (!dailyData[r.date]) {
                dailyData[r.date] = { total: 0, visitors: 0 };
            }

            const total = r.attendance.adults + r.attendance.kids + r.attendance.visitors + r.attendance.teens + r.attendance.volunteers;
            dailyData[r.date].total += total;
            dailyData[r.date].visitors += r.attendance.visitors;
        });

        // Sort dates and take last 8
        const sortedDates = Object.keys(dailyData).sort();
        const recentDates = sortedDates.slice(-8);

        // Build daily trend with Brazilian date format
        const dailyTrend: WeeklyDataPoint[] = recentDates.map((dateStr, index) => {
            const [year, month, day] = dateStr.split('-');
            return {
                date: `${day}/${month}`,
                fullDate: dateStr,
                total: dailyData[dateStr].total,
                visitors: dailyData[dateStr].visitors,
                index
            };
        });

        // Calculate this week vs last week
        const today = new Date();
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const twoWeeksAgo = new Date(today);
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        let thisWeekTotal = 0, thisWeekVisitors = 0, lastWeekTotal = 0;

        Object.entries(dailyData).forEach(([dateStr, data]) => {
            const date = new Date(dateStr);
            if (date >= oneWeekAgo) {
                thisWeekTotal += data.total;
                thisWeekVisitors += data.visitors;
            } else if (date >= twoWeeksAgo && date < oneWeekAgo) {
                lastWeekTotal += data.total;
            }
        });

        // If no recent data, use all data
        if (thisWeekTotal === 0 && sortedDates.length > 0) {
            const latest = sortedDates[sortedDates.length - 1];
            thisWeekTotal = dailyData[latest].total;
            thisWeekVisitors = dailyData[latest].visitors;
            if (sortedDates.length >= 2) {
                const secondLatest = sortedDates[sortedDates.length - 2];
                lastWeekTotal = dailyData[secondLatest].total;
            }
        }

        return {
            summary: { thisWeekTotal, lastWeekTotal, thisWeekVisitors },
            dailyTrend,
        };
    }, [reports, campusId]);

    // Get pie data based on selection
    const pieData = useMemo(() => {
        if (selectedBarIndex !== null && analyticsData.dailyTrend[selectedBarIndex]) {
            const selected = analyticsData.dailyTrend[selectedBarIndex];
            return {
                visitors: selected.visitors,
                regulars: selected.total - selected.visitors,
                label: `Culto ${selected.date}`
            };
        }

        // Default: latest or sum
        if (analyticsData.dailyTrend.length > 0) {
            const latest = analyticsData.dailyTrend[analyticsData.dailyTrend.length - 1];
            return {
                visitors: latest.visitors,
                regulars: latest.total - latest.visitors,
                label: `Culto ${latest.date}`
            };
        }

        return { visitors: 0, regulars: 0, label: 'Sem dados' };
    }, [selectedBarIndex, analyticsData.dailyTrend]);

    const handleBarClick = (data: WeeklyDataPoint) => {
        setSelectedBarIndex(data.index);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

                {/* Header - Changed to "Visão Geral" */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <Eye size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Visão Geral</h2>
                            <p className="text-sm opacity-80">Acompanhamento de presença</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-slate-900/50">

                    {/* Executive Summary Cards */}
                    <ExecutiveSummaryCards data={analyticsData.summary} />

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Daily Trend (2 cols) */}
                        <div className="lg:col-span-2">
                            <WeeklyTrendChart
                                data={analyticsData.dailyTrend}
                                onBarClick={handleBarClick}
                                selectedIndex={selectedBarIndex}
                            />
                        </div>

                        {/* Demographics Pie */}
                        <div className="space-y-3">
                            {/* Selected context */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-gray-100 dark:border-slate-700 text-center">
                                <div className="text-xs font-bold text-text-muted dark:text-slate-400 uppercase">Exibindo</div>
                                <div className="text-lg font-black text-primary">{pieData.label}</div>
                            </div>
                            <DemographicsPie data={{ visitors: pieData.visitors, regulars: pieData.regulars }} />
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 flex justify-end">
                    <NeoButton onClick={onClose} size="md">Fechar</NeoButton>
                </div>
            </div>
        </div>
    );
};
