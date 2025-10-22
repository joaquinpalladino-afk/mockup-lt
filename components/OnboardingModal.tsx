import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { PlusIcon, TrashIcon } from './Icons';

export const OnboardingModal: React.FC = () => {
  const { dispatch } = useAppContext();
  const [priorities, setPriorities] = useState<string[]>(['Crítico', 'Alto', 'Normal', 'Bajo']);
  const [newPriority, setNewPriority] = useState('');

  const handleAddPriority = () => {
    if (newPriority.trim() && !priorities.includes(newPriority.trim())) {
      setPriorities([...priorities, newPriority.trim()]);
      setNewPriority('');
    }
  };

  const handleRemovePriority = (priorityToRemove: string) => {
    setPriorities(priorities.filter(p => p !== priorityToRemove));
  };

  const handleSave = () => {
    if (priorities.length > 0) {
      dispatch({ type: 'COMPLETE_ONBOARDING', payload: { priorities } });
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#444444] rounded-lg shadow-2xl p-8 w-full max-w-md animate-scale-in">
        <h2 className="text-2xl font-bold text-white mb-2">Bienvenido a Loomtask</h2>
        <p className="text-gray-300 mb-6">Crea tus niveles de prioridad para organizar tu trabajo. El orden importa: el primero es el más alto.</p>
        
        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
          {priorities.map((p, index) => (
            <div key={index} className="flex items-center justify-between bg-[#1E1E1E] p-3 rounded-md transition-transform duration-200 hover:scale-[1.02]">
              <span className="text-white">{p}</span>
              <button onClick={() => handleRemovePriority(p)} className="text-red-500 hover:text-red-400 transition-colors">
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex space-x-2 mb-8">
          <input
            type="text"
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPriority()}
            placeholder="Ej: Urgente"
            className="flex-grow bg-[#1E1E1E] border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#156193]"
          />
          <button onClick={handleAddPriority} className="bg-[#156193] text-white p-2 rounded-md hover:bg-blue-800 transition-colors transform hover:scale-110">
            <PlusIcon className="h-6 w-6" />
          </button>
        </div>

        <button 
          onClick={handleSave}
          disabled={priorities.length === 0}
          className="w-full bg-[#156193] text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-800 transition-all duration-200 transform hover:scale-105 disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          Comenzar a Organizar
        </button>
      </div>
    </div>
  );
};