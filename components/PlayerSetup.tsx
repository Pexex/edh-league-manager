import React, { useState } from 'react';
import { PLAYER_COUNT } from '../constants';

interface PlayerSetupProps {
  onStartLeague: (names: string[]) => void;
}

const PlayerSetup: React.FC<PlayerSetupProps> = ({ onStartLeague }) => {
  const [playerNames, setPlayerNames] = useState<string[]>(Array(PLAYER_COUNT).fill(''));
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerNames.some(name => name.trim() === '')) {
      setError('Todos os nomes dos jogadores devem ser preenchidos.');
      return;
    }
    setError(null);
    onStartLeague(playerNames.map(name => name.trim()));
  };

  return (
    <div className="max-w-md mx-auto bg-slate-800 p-8 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-100">Insira os Nomes dos Jogadores</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {playerNames.map((name, index) => (
          <div key={index}>
            <label htmlFor={`player-${index}`} className="block text-sm font-medium text-slate-300 mb-1">
              Jogador {index + 1}
            </label>
            <input
              type="text"
              id={`player-${index}`}
              value={name}
              onChange={(e) => handleNameChange(index, e.target.value)}
              placeholder={`Insira o nome do Jogador ${index + 1}`}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
        ))}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105"
        >
          Iniciar Liga
        </button>
      </form>
    </div>
  );
};

export default PlayerSetup;