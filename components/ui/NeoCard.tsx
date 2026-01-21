import React from 'react';

interface NeoCardProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  onClick?: () => void;
}

export const NeoCard: React.FC<NeoCardProps> = ({ 
  children, 
  className = '', 
  color = 'bg-white',
  onClick 
}) => {
  return (
    <div 
      onClick={onClick}
      className={`
        ${color} 
        border-4 border-black 
        shadow-neo 
        p-4 
        rounded-none
        ${onClick ? 'cursor-pointer active:translate-x-[3px] active:translate-y-[3px] active:shadow-neo-sm transition-all' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};