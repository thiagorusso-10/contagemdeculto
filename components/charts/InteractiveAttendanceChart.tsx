import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Card } from '../ui/Card';

export interface ChartDataPoint {
    date: string;       // Display: "12/05"
    fullDate: string;   // ID: "2024-05-12"
    time: string;       // "19:00"
    total: number;
    visitors: number;
    label: string;      // "12/05 Manhã"
    originalData: any;  // The full report object for drill-down
}

interface InteractiveAttendanceChartProps {
    data: ChartDataPoint[];
    onBarClick: (data: ChartDataPoint) => void;
    selectedIndex: number | null;
}

export const InteractiveAttendanceChart: React.FC<InteractiveAttendanceChartProps> = ({
    data,
    onBarClick,
    selectedIndex
}) => {
    return (
        <Card className="h-[300px] w-full flex flex-col bg-white dark:bg-slate-800 shadow-none border-0" noPadding={true}>
            <h3 className="text-sm font-bold text-text-muted dark:text-slate-400 uppercase tracking-wider mb-4 px-2">
                Histórico de Cultos (Clique para detalhar)
            </h3>
            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.3} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            dy={10}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                            }}
                            labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}
                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                            formatter={(value: number) => [value, 'Pessoas']}
                        />
                        <Bar
                            dataKey="total"
                            radius={[4, 4, 0, 0]}
                            onClick={(data, index) => onBarClick(data)}
                            cursor="pointer"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={selectedIndex === index ? '#F59E0B' : '#0891b2'} // Highlight selected
                                    opacity={selectedIndex === index ? 1 : 0.7}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
