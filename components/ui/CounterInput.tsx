import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface CounterInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  readOnly?: boolean;
  accentColor?: string;
}

// Color mapping for each category
const getLabelColor = (label: string) => {
  const lower = label.toLowerCase();
  if (lower.includes('adulto')) return {
    bg: 'bg-gradient-to-r from-cyan-500 to-cyan-600',
    text: 'text-white',
    border: 'border-cyan-400/30',
    glow: 'shadow-cyan-500/20'
  };
  if (lower.includes('criança') || lower.includes('kids')) return {
    bg: 'bg-gradient-to-r from-pink-500 to-rose-500',
    text: 'text-white',
    border: 'border-pink-400/30',
    glow: 'shadow-pink-500/20'
  };
  if (lower.includes('visita')) return {
    bg: 'bg-gradient-to-r from-amber-400 to-orange-500',
    text: 'text-white',
    border: 'border-amber-400/30',
    glow: 'shadow-amber-500/20'
  };
  if (lower.includes('pré') || lower.includes('adolesc') || lower.includes('teen')) return {
    bg: 'bg-gradient-to-r from-purple-500 to-violet-600',
    text: 'text-white',
    border: 'border-purple-400/30',
    glow: 'shadow-purple-500/20'
  };
  return {
    bg: 'bg-slate-600',
    text: 'text-white',
    border: 'border-slate-400/30',
    glow: 'shadow-slate-500/20'
  };
};

export const CounterInput: React.FC<CounterInputProps> = ({
  label,
  value,
  onChange,
  readOnly = false,
}) => {
  const colors = getLabelColor(label);

  const handleDecrement = () => {
    if (value > 0) onChange(value - 1);
  };

  const handleIncrement = () => {
    onChange(value + 1);
  };

  return (
    <div className={`flex flex-col gap-2 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg ${colors.glow} border ${colors.border} transition-all duration-200 hover:shadow-xl`}>
      {/* Vibrant Label Badge */}
      <div className={`${colors.bg} ${colors.text} px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-widest text-center shadow-md`}>
        {label}
      </div>

      <div className="flex items-center justify-between gap-3 mt-1">
        {!readOnly && (
          <button
            type="button"
            onClick={handleDecrement}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400 transition-all active:scale-90"
          >
            <Minus size={20} />
          </button>
        )}

        <input
          type="number"
          value={value}
          readOnly={readOnly}
          onChange={(e) => {
            if (!readOnly) {
              const val = parseInt(e.target.value) || 0;
              onChange(val >= 0 ? val : 0);
            }
          }}
          className={`w-full text-center font-black text-4xl bg-transparent text-text-main dark:text-white focus:outline-none ${readOnly ? 'pointer-events-none' : ''}`}
        />

        {!readOnly && (
          <button
            type="button"
            onClick={handleIncrement}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-500 dark:hover:text-green-400 transition-all active:scale-90"
          >
            <Plus size={20} />
          </button>
        )}
      </div>
    </div>
  );
};