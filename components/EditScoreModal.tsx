import React, { useState, useEffect } from 'react';
import type { Player } from '../types';

interface EditScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  onSave: (scores: { [id: number]: number }) => void;
}

const EditScoreModal: React.FC<EditScoreModalProps> = ({ isOpen, onClose, players, onSave }) => {
  const [scores, setScores] = useState<{ [id: number]: number }>({});

  useEffect(() => {
    if (isOpen) {
      const initialScores: { [id: number]: number } = {};
      players.forEach(p => {
        initialScores[p.id] = p.score;
      });
      setScores(initialScores);
    }
  }, [isOpen, players]);

  const handleChange = (id: number, value: string) => {
    const num = parseInt(value);
    setScores(prev => ({ ...prev, [id]: isNaN(num) ? 0 : num }));
  };

  const adjustScore = (id: number, delta: number) => {
    setScores(prev => ({ ...prev, [id]: (prev[id] || 0) + delta }));
  };

  const handleSave = () => {
    onSave(scores);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-[60]" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl w-full max-w-md p-6 border border-slate-600 shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-bold text-center mb-6 text-white">Editar Pontuações</h3>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 mb-6">
          {players.map(player => (
            <div key={player.id} className="flex items-center justify-between bg-slate-700/50 p-3 rounded-xl border border-slate-600">
              <span className="font-bold text-slate-200 truncate w-1/3">{player.name}</span>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => adjustScore(player.id, -1)}
                  className="w-10 h-10 rounded-full bg-slate-600 hover:bg-slate-500 text-white font-bold flex items-center justify-center transition active:scale-95"
                >
                  -
                </button>
                
                <input 
                  type="number" 
                  value={scores[player.id] ?? 0}
                  onChange={(e) => handleChange(player.id, e.target.value)}
                  className="w-16 bg-slate-900 border border-slate-600 rounded-lg py-2 text-center font-bold text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />

                <button 
                  onClick={() => adjustScore(player.id, 1)}
                  className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center transition active:scale-95"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-3 rounded-xl transition">
            Cancelar
          </button>
          <button onClick={handleSave} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-900/20 transition">
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditScoreModal;