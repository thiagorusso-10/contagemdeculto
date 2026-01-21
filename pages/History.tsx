import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';
import { ArrowLeft, Calendar, ChevronDown, ChevronUp, Users, User } from 'lucide-react';

export const History: React.FC = () => {
    const navigate = useNavigate();
    const { reports, campuses, preachers } = useStore();
    const [expandedDate, setExpandedDate] = useState<string | null>(null);

    // Group reports by date
    const historyData = useMemo(() => {
        const grouped: Record<string, { total: number; reports: typeof reports }> = {};

        reports.forEach(report => {
            if (!grouped[report.date]) {
                grouped[report.date] = { total: 0, reports: [] };
            }

            const reportTotal =
                report.attendance.adults +
                report.attendance.kids +
                report.attendance.visitors +
                report.attendance.teens +
                report.attendance.volunteers;

            grouped[report.date].reports.push(report);
            grouped[report.date].total += reportTotal;
        });

        // Convert to array and sort by date descending
        return Object.entries(grouped)
            .map(([date, data]) => ({ date, ...data }))
            .sort((a, b) => b.date.localeCompare(a.date));
    }, [reports]);

    const toggleExpand = (date: string) => {
        if (expandedDate === date) {
            setExpandedDate(null);
        } else {
            setExpandedDate(date);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Data Inválida';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const getCampusName = (id: string) => campuses.find(c => c.id === id)?.name || 'Campus Desconhecido';
    const getPreacherName = (id: string) => preachers.find(p => p.id === id)?.name || 'Preletor Desconhecido';
    const getCampusColor = (id: string) => campuses.find(c => c.id === id)?.color || 'bg-gray-200';

    return (
        <div className="min-h-screen p-6 pb-20 space-y-6 bg-neo-bg">
            <header>
                <NeoButton variant="secondary" size="sm" onClick={() => navigate('/')} className="mb-4">
                    <ArrowLeft size={16} /> VOLTAR
                </NeoButton>
                <div className="flex items-center gap-3">
                    <div className="bg-black text-white p-2 border-2 border-black">
                        <Calendar size={24} />
                    </div>
                    <h1 className="text-3xl font-bold uppercase">Histórico de Cultos</h1>
                </div>
            </header>

            <section className="space-y-4">
                {historyData.length === 0 ? (
                    <NeoCard className="opacity-70 text-center py-10">
                        <p className="text-xl font-bold text-gray-500">Nenhum histórico encontrado.</p>
                    </NeoCard>
                ) : (
                    historyData.map((item) => {
                        const isExpanded = expandedDate === item.date;

                        return (
                            <div key={item.date} className="relative">
                                {/* Date Card Header */}
                                <div
                                    onClick={() => toggleExpand(item.date)}
                                    className={`
                    bg-white border-4 border-black p-4 cursor-pointer transition-all
                    flex justify-between items-center relative z-10
                    ${isExpanded ? 'translate-x-1 translate-y-1 shadow-none' : 'shadow-neo hover:-translate-y-1 hover:shadow-neo-hover'}
                  `}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-neo-yellow border-2 border-black px-2 py-1 font-mono font-bold text-sm">
                                            {formatDate(item.date)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users size={20} className="text-gray-500" />
                                            <span className="text-2xl font-black text-blue-600">{item.total}</span>
                                            <span className="text-xs font-bold text-gray-400 uppercase self-end mb-1">Pessoas</span>
                                        </div>
                                    </div>

                                    <div>
                                        {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="bg-gray-100 border-x-4 border-b-4 border-black p-4 pt-6 -mt-2 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
                                        {item.reports.map(report => {
                                            const total = report.attendance.adults + report.attendance.kids + report.attendance.visitors + report.attendance.teens + report.attendance.volunteers;

                                            return (
                                                <NeoCard
                                                    key={report.id}
                                                    color={getCampusColor(report.campusId)}
                                                    className="flex justify-between items-center shadow-neo-sm"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div>
                                                            <h3 className="font-bold text-lg uppercase leading-none">{getCampusName(report.campusId)}</h3>
                                                            <div className="flex items-center gap-1 text-black/60 text-xs font-bold mt-1">
                                                                <User size={12} />
                                                                <span>{getPreacherName(report.preacherId)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="text-2xl font-black">{total}</div>
                                                        <div className="text-[10px] uppercase font-bold text-black/60">Pessoas</div>
                                                    </div>
                                                </NeoCard>
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
