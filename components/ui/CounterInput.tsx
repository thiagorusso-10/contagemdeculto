import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface CounterInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  color?: string;
  readOnly?: boolean;
  onLabelClick?: () => void;
}

export const CounterInput: React.FC<CounterInputProps> = ({ 
  label, 
  value, 
  onChange, 
  color = 'bg-white',
  readOnly = false,
  onLabelClick
}) => {
  const handleDecrement = () => {
    if (value > 0) onChange(value - 1);
  };

  const handleIncrement = () => {
    onChange(value + 1);
  };

  return (
    <div className={`flex flex-col gap-1 border-4 border-black p-3 shadow-neo ${color}`}>
      <div 
        className={`font-bold uppercase text-sm mb-2 flex justify-between items-center ${onLabelClick ? 'cursor-pointer underline decoration-4' : ''}`}
        onClick={onLabelClick}
      >
        <span>{label}</span>
        {onLabelClick && <span className="text-xs bg-black text-white px-1">EDITAR</span>}
      </div>
      
      <div className="flex items-center justify-between gap-2">
        {!readOnly && (
           <button 
           type="button"
           onClick={handleDecrement}
           className="w-10 h-10 flex items-center justify-center bg-white border-4 border-black active:bg-gray-200 active:translate-y-1 transition-transform"
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
          className={`w-full text-center font-bold text-2xl bg-transparent focus:outline-none ${readOnly ? 'pointer-events-none' : ''}`}
        />

        {!readOnly && (
            <button 
            type="button"
            onClick={handleIncrement}
            className="w-10 h-10 flex items-center justify-center bg-white border-4 border-black active:bg-gray-200 active:translate-y-1 transition-transform"
            >
            <Plus size={20} />
            </button>
        )}
      </div>
    </div>
  );
};