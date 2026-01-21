import React from 'react';

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const NeoButton: React.FC<NeoButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  icon,
  ...props 
}) => {
  const baseStyles = "font-bold border-4 border-black flex items-center justify-center gap-2 transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-neo-sm";
  
  const variants = {
    primary: "bg-neo-yellow text-black shadow-neo hover:-translate-y-[1px] hover:-translate-x-[1px] hover:shadow-neo-hover",
    secondary: "bg-white text-black shadow-neo hover:-translate-y-[1px] hover:-translate-x-[1px] hover:shadow-neo-hover",
    danger: "bg-red-500 text-white shadow-neo hover:-translate-y-[1px] hover:-translate-x-[1px] hover:shadow-neo-hover",
    ghost: "bg-transparent border-none shadow-none text-black underline decoration-4 decoration-black active:translate-x-0 active:translate-y-0"
  };

  const sizes = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-6 py-4 text-lg"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {children}
    </button>
  );
};