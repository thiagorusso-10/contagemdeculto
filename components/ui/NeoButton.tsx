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
  const baseStyles = "font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-0.5 active:shadow-none";

  const variants = {
    primary: "bg-primary text-white shadow-pop dark:shadow-none border border-transparent hover:-translate-y-0.5 hover:shadow-lg hover:border-primary-light dark:hover:border-slate-600",
    secondary: "bg-white dark:bg-slate-800 text-text-main dark:text-gray-200 border-2 border-gray-100 dark:border-slate-700 shadow-sm hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary hover:shadow-md",
    danger: "bg-red-500 text-white shadow-pop dark:shadow-none hover:-translate-y-0.5 hover:shadow-lg hover:bg-red-600",
    ghost: "bg-transparent text-text-muted dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-text-main dark:hover:text-white shadow-none"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3.5 text-lg"
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