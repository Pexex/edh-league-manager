import React, { useState, useEffect } from 'react';
import type { League } from '../types';

interface LeagueSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  league: League | null;
  onSave: (leagueId: string, newName: string, newPlayerNames: { [id: number]: string }) => void;
}

const LeagueSettingsModal: React.FC<LeagueSettingsModalProps> = ({ isOpen, onClose, league, onSave }) => {
  const [leagueName, setLeagueName] = useState('');
  const [playerNames, setPlayerNames] = useState<{ [id: number]: string }>({});

  useEffect(() => {
    if (league) {
      setLeagueName(league.name);
      const pNames: { [id: number]: string } = {};
      league.players.forEach(p => {
        pNames[p.id] = p.name;
      });
      setPlayerNames(pNames);
    }
  }, [league, isOpen]);

  if (!isOpen || !league) return null;

  const handlePlayerNameChange = (id: number, value: string) => {
    setPlayerNames(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    if (leagueName.trim() === '') return;
    onSave(league.id, leagueName, playerNames);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-[100]" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-600 shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        
        <div className="p-6 border-b border-slate-700">
            <h3 className="text-xl font-bold text-white text-center">Editar Liga</h3>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
            <div className="mb-6">
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Nome da Liga</label>
                <input 
                    type="text" 
                    value={leagueName}
                    onChange={(e) => setLeagueName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>

            <div className="space-y-4">
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider">Jogadores</label>
                {league.players.map(player => (
                    <div key={player.id} className="flex items-center gap-3">
                        <span className="text-slate-500 font-mono text-sm w-6">{player.id}.</span>
                        <input 
                            type="text" 
                            value={playerNames[player.id] || ''}
                            onChange={(e) => handlePlayerNameChange(player.id, e.target.value)}
                            className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                        />
                    </div>
                ))}
            </div>
        </div>

        <div className="p-4 border-t border-slate-700 grid grid-cols-2 gap-4 bg-slate-900/50 rounded-b-2xl">
          <button onClick={onClose} className="w-full text-slate-300 hover:text-white hover:bg-slate-700 font-bold py-3 rounded-xl transition text-sm">
            Cancelar
          </button>
          <button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg transition text-sm">
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeagueSettingsModal;