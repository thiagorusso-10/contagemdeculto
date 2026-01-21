import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { VolunteerBreakdown } from '../types';
import { NeoButton } from './ui/NeoButton';

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakdown: VolunteerBreakdown;
  onChange: (newBreakdown: VolunteerBreakdown) => void;
}

export const VolunteerModal: React.FC<VolunteerModalProps> = ({ 
  isOpen, 
  onClose, 
  breakdown,
  onChange 
}) => {
  const { volunteerAreas, addVolunteerArea, deleteVolunteerArea } = useStore();
  const [newAreaName, setNewAreaName] = useState('');
  const [showAddArea, setShowAddArea] = useState(false);

  if (!isOpen) return null;

  const handleCountChange = (areaId: string, delta: number) => {
    const current = breakdown[areaId] || 0;
    const next = current + delta;
    if (next < 0) return;
    
    onChange({
      ...breakdown,
      [areaId]: next
    });
  };

  const handleCreateArea = () => {
    if (newAreaName.trim()) {
      addVolunteerArea(newAreaName.trim());
      setNewAreaName('');
      setShowAddArea(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-4 border-black bg-neo-pink">
          <h2 className="text-xl font-bold uppercase">Áreas de Serviço</h2>
          <button onClick={onClose} className="p-1 hover:bg-black hover:text-white transition-colors border-2 border-transparent hover:border-black">
            <X size={24} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {volunteerAreas.map(area => (
            <div key={area.id} className="flex items-center justify-between gap-4 p-2 border-4 border-gray-200 hover:border-black transition-colors">
              <span className="font-bold flex-1">{area.name}</span>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleCountChange(area.id, -1)}
                  className="w-10 h-10 flex items-center justify-center border-4 border-black bg-white hover:bg-gray-100 active:translate-y-1 transition-all"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-lg">
                  {breakdown[area.id] || 0}
                </span>
                <button 
                  onClick={() => handleCountChange(area.id, 1)}
                  className="w-10 h-10 flex items-center justify-center border-4 border-black bg-neo-yellow hover:brightness-95 active:translate-y-1 transition-all"
                >
                  +
                </button>
              </div>
            </div>
          ))}

          {volunteerAreas.length === 0 && (
            <div className="text-center text-gray-500 py-4 italic">
              Nenhuma área cadastrada.
            </div>
          )}

          {/* New Area Form inside Modal */}
          {showAddArea ? (
            <div className="flex gap-2 mt-4 animate-in slide-in-from-bottom-2">
              <input 
                autoFocus
                type="text" 
                placeholder="Nome da área"
                className="flex-1 border-4 border-black p-2 font-bold focus:outline-none focus:ring-4 focus:ring-neo-yellow"
                value={newAreaName}
                onChange={(e) => setNewAreaName(e.target.value)}
              />
              <button onClick={handleCreateArea} className="bg-black text-white px-4 font-bold border-4 border-black">OK</button>
            </div>
          ) : (
            <NeoButton 
              variant="secondary" 
              className="w-full mt-4" 
              onClick={() => setShowAddArea(true)}
              icon={<Plus size={18} />}
            >
              CRIAR NOVA ÁREA
            </NeoButton>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-4 border-black bg-gray-50">
          <NeoButton className="w-full" onClick={onClose}>
            CONCLUIR
          </NeoButton>
        </div>
      </div>
    </div>
  );
};