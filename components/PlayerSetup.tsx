import React, { useState } from 'react';
import { PLAYER_COUNT } from '../constants';

interface PlayerSetupProps {
  onStartLeague: (leagueName: string, names: string[]) => void;
}

const PlayerSetup: React.FC<PlayerSetupProps> = ({ onStartLeague }) => {
  const [leagueName, setLeagueName] = useState('');
  const [playerNames, setPlayerNames] = useState<string[]>(Array(PLAYER_COUNT).fill(''));
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (leagueName.trim() === '') {
        setError('Por favor, dê um nome para a liga.');
        return;
    }

    if (playerNames.some(name => name.trim() === '')) {
      setError('Todos os nomes dos jogadores devem ser preenchidos.');
      return;
    }
    setError(null);
    onStartLeague(leagueName.trim(), playerNames.map(name => name.trim()));
  };

  return (
    <div className="max-w-md mx-auto bg-slate-800 p-8 rounded-xl shadow-2xl animate-fade-in-up">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-100">Nova Liga</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        
        <div>
            <label htmlFor="leagueName" className="block text-sm font-bold text-indigo-300 mb-2">
              Nome da Liga
            </label>
            <input
              type="text"
              id="leagueName"
              value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
              placeholder="Ex: Sexta Commander, Torneio da Loja..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-white font-bold placeholder-slate-500"
              autoFocus
            />
        </div>

        <div className="h-px bg-slate-700/50 my-4"></div>

        <div className="space-y-3">
            {playerNames.map((name, index) => (
            <div key={index}>
                <label htmlFor={`player-${index}`} className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">
                Jogador {index + 1}
                </label>
                <input
                type="text"
                id={`player-${index}`}
                value={name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                placeholder={`Nome do Jogador ${index + 1}`}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-100"
                />
            </div>
            ))}
        </div>

        {error && <div className="bg-red-900/30 border border-red-500/30 text-red-300 text-sm font-bold text-center p-3 rounded-lg animate-pulse">{error}</div>}
        
        <button
          type="submit"
          className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 px-4 rounded-xl shadow-lg transition-transform transform hover:scale-[1.02] active:scale-95"
        >
          Iniciar Liga
        </button>
      </form>
    </div>
  );
};

export default PlayerSetup;