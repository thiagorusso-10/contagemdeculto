import React from 'react';
import { TrendingUp, TrendingDown, Users, UserPlus, Calendar } from 'lucide-react';

interface SummaryData {
    thisWeekTotal: number;
    lastWeekTotal: number;
    thisWeekVisitors: number;
}

interface ExecutiveSummaryCardsProps {
    data: SummaryData;
}

export const ExecutiveSummaryCards: React.FC<ExecutiveSummaryCardsProps> = ({ data }) => {
    const { thisWeekTotal, lastWeekTotal, thisWeekVisitors } = data;

    // Calculate growth percentage
    const growthPercent = lastWeekTotal > 0
        ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
        : 0;

    const isGrowing = growthPercent >= 0;

    // Visitor percentage
    const visitorPercent = thisWeekTotal > 0
        ? ((thisWeekVisitors / thisWeekTotal) * 100).toFixed(1)
        : '0';

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

            {/* Card 1: This Week Total */}
            <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl p-5 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-2 opacity-90">
                    <Calendar size={18} />
                    <span className="text-sm font-semibold uppercase tracking-wide">Esta Semana</span>
                </div>
                <div className="text-4xl font-black tracking-tight">{thisWeekTotal.toLocaleString('pt-BR')}</div>
                <div className="text-sm opacity-80 mt-1">pessoas nos cultos</div>
            </div>

            {/* Card 2: Growth */}
            <div className={`rounded-2xl p-5 text-white shadow-lg ${isGrowing
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                    : 'bg-gradient-to-br from-red-500 to-red-600'
                }`}>
                <div className="flex items-center gap-2 mb-2 opacity-90">
                    {isGrowing ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    <span className="text-sm font-semibold uppercase tracking-wide">Crescimento</span>
                </div>
                <div className="text-4xl font-black tracking-tight">
                    {isGrowing ? '+' : ''}{growthPercent}%
                </div>
                <div className="text-sm opacity-80 mt-1">vs semana passada</div>
            </div>

            {/* Card 3: Visitors */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-2 opacity-90">
                    <UserPlus size={18} />
                    <span className="text-sm font-semibold uppercase tracking-wide">Visitantes</span>
                </div>
                <div className="text-4xl font-black tracking-tight">{thisWeekVisitors}</div>
                <div className="text-sm opacity-80 mt-1">{visitorPercent}% do total</div>
            </div>

        </div>
    );
};
