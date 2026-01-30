import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export interface WeeklyDataPoint {
    date: string;       // Display: "04/01"
    fullDate: string;   // ISO: "2026-01-04"
    total: number;
    visitors: number;
    index: number;
}

interface WeeklyTrendChartProps {
    data: WeeklyDataPoint[];
    onBarClick?: (data: WeeklyDataPoint) => void;
    selectedIndex?: number | null;
}

export const WeeklyTrendChart: React.FC<WeeklyTrendChartProps> = ({
    data,
    onBarClick,
    selectedIndex
}) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-sm font-bold text-text-muted dark:text-slate-400 uppercase tracking-wider mb-4">
                Presença por Culto
            </h3>
            <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.3} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                            dy={10}
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                            height={50}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            width={45}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.25)',
                                padding: '12px 16px'
                            }}
                            formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Pessoas']}
                            labelFormatter={(label) => `Culto: ${label}`}
                        />
                        <Bar
                            dataKey="total"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={50}
                            onClick={(data) => onBarClick && onBarClick(data)}
                            cursor={onBarClick ? 'pointer' : 'default'}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={selectedIndex === index ? '#F59E0B' : '#0891b2'}
                                    opacity={selectedIndex === null || selectedIndex === index ? 1 : 0.5}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="text-center text-xs text-text-muted dark:text-slate-500 mt-2">
                {onBarClick ? '👆 Clique em uma barra para ver detalhes' : 'Total de pessoas por culto'}
            </div>
        </div>
    );
};
