import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
    accentColor?: string; // Optional top border color
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    noPadding = false,
    accentColor
}) => {
    return (
        <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-card dark:shadow-none dark:border-slate-700 border border-gray-100/50 backdrop-blur-sm relative overflow-hidden group hover:shadow-lg dark:hover:border-slate-600 hover:-translate-y-0.5 transition-all duration-300 ${noPadding ? '' : 'p-6'} ${className}`}>
            {accentColor && (
                <div className={`absolute top-0 left-0 w-full h-1.5 ${accentColor}`}></div>
            )}
            {children}
        </div>
    );
};
