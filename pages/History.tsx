import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { NeoButton } from '../components/ui/NeoButton';
import { Card } from '../components/ui/Card';
import { ArrowLeft, Calendar, ChevronDown, Users, User, Sun, Moon } from 'lucide-react';
import { formatServiceTime, getCampusColorBg } from '../lib/utils';

const MONTHS_PT = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const History: React.FC = () => {
    const navigate = useNavigate();
    const { reports, campuses, preachers } = useStore();
    const { assignedCampusId } = useAuth();

    const [expandedYear, setExpandedYear] = useState<string | null>(null);
    const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
    const [expandedDate, setExpandedDate] = useState<string | null>(null);

    // Group reports by Year → Month → Date
    const historyData = useMemo(() => {
        let filteredReports = reports;

        if (assignedCampusId) {
            filteredReports = reports.filter(r => r.campusId === assignedCampusId);
        }

        // Structure: { year: { month: { date: { total, reports } } } }
        const grouped: Record<string, Record<string, Record<string, { total: number; reports: typeof reports }>>> = {};

        filteredReports.forEach(report => {
            const [year, month, day] = report.date.split('-');

            if (!grouped[year]) grouped[year] = {};
            if (!grouped[year][month]) grouped[year][month] = {};
            if (!grouped[year][month][report.date]) {
                grouped[year][month][report.date] = { total: 0, reports: [] };
            }

            const reportTotal =
                report.attendance.adults +
                report.attendance.kids +
                report.attendance.visitors +
                report.attendance.teens +
                report.attendance.volunteers;

            grouped[year][month][report.date].reports.push(report);
            grouped[year][month][report.date].total += reportTotal;
        });

        // Convert to array structure sorted descending
        const result = Object.entries(grouped)
            .map(([year, months]) => ({
                year,
                totalYear: Object.values(months).reduce((acc, dates) =>
                    acc + Object.values(dates).reduce((a, d) => a + d.total, 0), 0),
                months: Object.entries(months)
                    .map(([month, dates]) => ({
                        month,
                        monthName: MONTHS_PT[parseInt(month) - 1],
                        totalMonth: Object.values(dates).reduce((a, d) => a + d.total, 0),
                        dates: Object.entries(dates)
                            .map(([date, data]) => ({
                                date,
                                total: data.total,
                                reports: data.reports.sort((a, b) => {
                                    const nameA = campuses.find(c => c.id === a.campusId)?.name || '';
                                    const nameB = campuses.find(c => c.id === b.campusId)?.name || '';
                                    if (nameA < nameB) return -1;
                                    if (nameA > nameB) return 1;
                                    return a.time.localeCompare(b.time);
                                })
                            }))
                            .sort((a, b) => b.date.localeCompare(a.date))
                    }))
                    .sort((a, b) => b.month.localeCompare(a.month))
            }))
            .sort((a, b) => b.year.localeCompare(a.year));

        // Auto-expand latest year
        if (result.length > 0 && !expandedYear) {
            setExpandedYear(result[0].year);
        }

        return result;
    }, [reports, campuses, assignedCampusId]);

    const formatDate = (dateString: string) => {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const getCampusName = (id: string) => campuses.find(c => c.id === id)?.name || 'Campus Desconhecido';
    const getPreacherName = (id: string) => preachers.find(p => p.id === id)?.name || 'Preletor Desconhecido';

    return (
        <div className="min-h-screen p-6 pb-24 space-y-6 bg-primary-bg dark:bg-slate-900 transition-colors duration-300">
            <header className="max-w-xl mx-auto">
                <NeoButton variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-4 pl-0 hover:bg-transparent">
                    <ArrowLeft size={16} /> VOLTAR
                </NeoButton>
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                        <Calendar size={28} />
                    </div>
                    <h1 className="text-3xl font-black uppercase text-text-main dark:text-white tracking-tight">Histórico</h1>
                </div>
            </header>

            <section className="max-w-xl mx-auto space-y-4">
                {historyData.length === 0 ? (
                    <Card className="opacity-70 text-center py-12 border-dashed">
                        <p className="text-lg font-bold text-text-muted dark:text-slate-500">Nenhum histórico encontrado.</p>
                    </Card>
                ) : (
                    historyData.map((yearData) => {
                        const isYearExpanded = expandedYear === yearData.year;

                        return (
                            <div key={yearData.year} className="space-y-2">
                                {/* Year Header */}
                                <div
                                    onClick={() => setExpandedYear(isYearExpanded ? null : yearData.year)}
                                    className={`
                    bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-4 cursor-pointer
                    flex justify-between items-center text-white shadow-lg
                    hover:from-slate-600 hover:to-slate-700 transition-all duration-300
                    ${isYearExpanded ? 'ring-2 ring-primary' : ''}
                  `}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl font-black">{yearData.year}</span>
                                    </div>
                                    <ChevronDown size={24} className={`transition-transform ${isYearExpanded ? 'rotate-180' : ''}`} />
                                </div>

                                {/* Months */}
                                {isYearExpanded && (
                                    <div className="pl-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        {yearData.months.map((monthData) => {
                                            const monthKey = `${yearData.year}-${monthData.month}`;
                                            const isMonthExpanded = expandedMonth === monthKey;

                                            return (
                                                <div key={monthKey} className="space-y-2">
                                                    {/* Month Header */}
                                                    <div
                                                        onClick={() => setExpandedMonth(isMonthExpanded ? null : monthKey)}
                                                        className={`
                              bg-white dark:bg-slate-800 rounded-xl p-3 cursor-pointer
                              flex justify-between items-center border border-gray-100 dark:border-slate-700
                              hover:shadow-md transition-all duration-200
                              ${isMonthExpanded ? 'ring-2 ring-cyan-400' : ''}
                            `}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg font-bold text-sm uppercase">
                                                                {monthData.monthName}
                                                            </span>
                                                        </div>
                                                        <ChevronDown size={18} className={`text-text-muted transition-transform ${isMonthExpanded ? 'rotate-180' : ''}`} />
                                                    </div>

                                                    {/* Dates */}
                                                    {isMonthExpanded && (
                                                        <div className="pl-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                                            {monthData.dates.map((dateData) => {
                                                                const isDateExpanded = expandedDate === dateData.date;

                                                                return (
                                                                    <div key={dateData.date}>
                                                                        {/* Date Header */}
                                                                        <div
                                                                            onClick={() => setExpandedDate(isDateExpanded ? null : dateData.date)}
                                                                            className={`
                                        bg-gray-50 dark:bg-slate-900/50 rounded-lg p-3 cursor-pointer
                                        flex justify-between items-center border border-gray-100 dark:border-slate-700
                                        hover:bg-gray-100 dark:hover:bg-slate-800 transition-all
                                        ${isDateExpanded ? 'ring-1 ring-primary/50' : ''}
                                      `}
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <span className="font-mono font-bold text-primary text-sm">{formatDate(dateData.date)}</span>
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <Users size={14} className="text-text-muted" />
                                                                                    <span className="font-bold text-text-main dark:text-white">{dateData.total}</span>
                                                                                </div>
                                                                            </div>
                                                                            <ChevronDown size={16} className={`text-text-muted transition-transform ${isDateExpanded ? 'rotate-180' : ''}`} />
                                                                        </div>

                                                                        {/* Reports for this date */}
                                                                        {isDateExpanded && (
                                                                            <div className="mt-2 pl-4 space-y-3 border-l-2 border-primary/20 animate-in fade-in slide-in-from-top-2 duration-200">
                                                                                {dateData.reports.map(report => {
                                                                                    const total = report.attendance.adults + report.attendance.kids + report.attendance.visitors + report.attendance.teens + report.attendance.volunteers;
                                                                                    const campusName = getCampusName(report.campusId);
                                                                                    const accentClass = getCampusColorBg(campusName);
                                                                                    const timeLabel = formatServiceTime(report.time);
                                                                                    const isMorning = timeLabel.includes('MANHÃ');

                                                                                    return (
                                                                                        <Card key={report.id} accentColor={accentClass} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30">
                                                                                            <div className="flex justify-between items-start mb-4 gap-4">
                                                                                                <div className="flex-1">
                                                                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                                                                        <span className={`text-[10px] font-black text-white ${accentClass} px-2 py-1 rounded uppercase tracking-wider`}>
                                                                                                            {campusName}
                                                                                                        </span>
                                                                                                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border ${isMorning
                                                                                                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/40'
                                                                                                            : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-900/40'}`}>
                                                                                                            {isMorning ? <Sun size={10} /> : <Moon size={10} />}
                                                                                                            {timeLabel}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                    <div className="flex items-center gap-1.5 text-text-muted dark:text-slate-300 text-sm font-medium">
                                                                                                        <User size={14} className="text-primary" />
                                                                                                        <span>{getPreacherName(report.preacherId)}</span>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className="text-right shrink-0">
                                                                                                    <div className="text-3xl font-black text-text-main dark:text-white leading-none">{total}</div>
                                                                                                    <div className="text-[10px] uppercase font-bold text-text-muted dark:text-slate-500 mt-0.5">Total</div>
                                                                                                </div>
                                                                                            </div>

                                                                                            <div className="pt-3 border-t border-gray-100 dark:border-slate-700 grid grid-cols-5 gap-2">
                                                                                                {[
                                                                                                    { label: 'Adultos', val: report.attendance.adults, color: 'text-primary' },
                                                                                                    { label: 'Crianças', val: report.attendance.kids, color: 'text-pop-pink' },
                                                                                                    { label: 'Visitas', val: report.attendance.visitors, color: 'text-pop-yellow' },
                                                                                                    { label: 'Pré', val: report.attendance.teens, color: 'text-pop-purple' },
                                                                                                    { label: 'Volunt.', val: report.attendance.volunteers, color: 'text-cta' },
                                                                                                ].map((stat, idx) => (
                                                                                                    <div key={idx} className="flex flex-col items-center bg-gray-50 dark:bg-slate-900/50 p-1.5 rounded-lg border border-gray-100/50 dark:border-slate-700/50">
                                                                                                        <span className="text-[9px] uppercase font-bold text-gray-400 dark:text-slate-500 mb-0.5">{stat.label}</span>
                                                                                                        <span className={`font-bold text-lg leading-none ${stat.color}`}>{stat.val}</span>
                                                                                                    </div>
                                                                                                ))}
                                                                                            </div>
                                                                                        </Card>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </section>
        </div>
    );
};
