import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '../ui/Card';

interface DemographicsData {
    visitors: number;
    regulars: number; // Total - Visitors
}

interface DemographicsPieProps {
    data: DemographicsData;
}

const COLORS = ['#F59E0B', '#0891b2']; // Yellow (Visitors), Cyan (Regulars)

export const DemographicsPie: React.FC<DemographicsPieProps> = ({ data }) => {
    const chartData = [
        { name: 'Visitantes', value: data.visitors },
        { name: 'Membros', value: data.regulars },
    ];

    const total = data.visitors + data.regulars;
    const visitorPercent = total > 0 ? ((data.visitors / total) * 100).toFixed(1) : '0';

    return (
        <Card className="h-[300px] w-full flex flex-col relative" noPadding={false}>
            <h3 className="text-sm font-bold text-text-muted dark:text-slate-400 uppercase tracking-wider mb-2 px-2">
                Visitantes vs Membros
            </h3>

            {/* Central Percent */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 pointer-events-none">
                <span className="text-3xl font-black text-pop-yellow">{visitorPercent}%</span>
                <span className="text-[10px] uppercase font-bold text-text-muted dark:text-slate-500">são novos</span>
            </div>

            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={8}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            formatter={(value, entry: any) => (
                                <span className="text-xs font-bold text-text-muted dark:text-slate-400 ml-1">{value}</span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
