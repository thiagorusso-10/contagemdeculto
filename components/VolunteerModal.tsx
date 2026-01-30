import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { NeoButton } from './ui/NeoButton';
import { Minus, Plus, X } from 'lucide-react';
import { VolunteerBreakdown } from '../types';

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakdown: VolunteerBreakdown;
  onChange: (breakdown: VolunteerBreakdown) => void;
}

export const VolunteerModal: React.FC<VolunteerModalProps> = ({ isOpen, onClose, breakdown, onChange }) => {
  const { volunteerAreas, addVolunteerArea } = useStore();
  const [localBreakdown, setLocalBreakdown] = useState<VolunteerBreakdown>(breakdown);
  const [isClosing, setIsClosing] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [showAddArea, setShowAddArea] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalBreakdown(breakdown);
      setIsClosing(false);
    }
  }, [isOpen, breakdown]);

  const handleSave = () => {
    onChange(localBreakdown);
    handleClose();
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 200);
  };

  const updateValue = (areaId: string, delta: number) => {
    setLocalBreakdown(prev => {
      const current = prev[areaId] || 0;
      const newVal = Math.max(0, current + delta);
      return { ...prev, [areaId]: newVal };
    });
  };

  const handleQuickAddArea = () => {
    if (newAreaName.trim()) {
      addVolunteerArea(newAreaName.trim());
      setNewAreaName('');
      setShowAddArea(false);
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${isClosing || !isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose}></div>

      <div className={`bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'}`}>
        {/* Header */}
        <div className="bg-cta p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Voluntários</h2>
            <p className="text-cta-foreground/80 text-sm font-medium">Equipes servindo hoje</p>
          </div>
          <button onClick={handleClose} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4">
          {/* Add Area Button */}
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setShowAddArea(!showAddArea)}
              className="text-xs font-bold text-primary uppercase hover:underline"
            >
              + Nova Área
            </button>
          </div>

          {showAddArea && (
            <div className="flex gap-2 mb-4 animate-in fade-in slide-in-from-top-2">
              <input
                type="text"
                placeholder="Nome da área"
                value={newAreaName}
                onChange={e => setNewAreaName(e.target.value)}
                className="flex-1 text-sm border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleQuickAddArea}
                className="bg-primary text-white px-3 rounded-lg font-bold text-sm"
              >
                OK
              </button>
            </div>
          )}

          {volunteerAreas.map(area => {
            const count = localBreakdown[area.id] || 0;
            return (
              <div key={area.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-700">
                <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">{area.name}</span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateValue(area.id, -1)}
                    className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-600 flex items-center justify-center text-gray-400 hover:text-red-500 active:scale-90 transition-all"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="w-6 text-center font-bold text-lg dark:text-white">{count}</span>

                  <button
                    onClick={() => updateValue(area.id, 1)}
                    className="w-8 h-8 rounded-full bg-cta text-white shadow-lg shadow-cta/30 flex items-center justify-center hover:bg-cta-hover active:scale-90 transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
          <NeoButton
            onClick={handleSave}
            className="w-full shadow-lg"
            size="md"
          >
            CONFIRMAR
          </NeoButton>
        </div>
      </div>
    </div>
  );
};