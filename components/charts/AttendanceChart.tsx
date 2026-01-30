import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/Card';

interface AttendanceData {
    date: string;
    total: number;
    visitors: number;
}

interface AttendanceChartProps {
    data: AttendanceData[];
}

export const AttendanceChart: React.FC<AttendanceChartProps> = ({ data }) => {
    // Pegar os últimos 5-6 cultos para não poluir
    const chartData = data.slice(0, 7).reverse(); // Assumindo que vem ordenado do mais recente pro antigo

    return (
        <Card className="h-[300px] w-full flex flex-col" noPadding={false}>
            <h3 className="text-sm font-bold text-text-muted dark:text-slate-400 uppercase tracking-wider mb-4 px-2">
                Tendência de Crescimento
            </h3>
            <div className="flex-1 w-full -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.3} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            dy={10}
                        />
                        <YAxis
                            hide={true}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                            labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="total"
                            stroke="#06b6d4"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorTotal)"
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
