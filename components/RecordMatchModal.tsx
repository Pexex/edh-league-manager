import React, { useState, useEffect, useMemo } from 'react';
import type { Player } from '../types';

interface RecordMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  onRecordWin: (wins: { [key: number]: number }) => void;
}

const RecordMatchModal: React.FC<RecordMatchModalProps> = ({ isOpen, onClose, players, onRecordWin }) => {
  const [wins, setWins] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    if (isOpen) {
      const initialWins: { [key: number]: number } = {};
      players.forEach(p => {
        initialWins[p.id] = 0;
      });
      setWins(initialWins);
    }
  }, [isOpen, players]);

  const totalWins = useMemo(() => {
    return Object.values(wins).reduce((sum: number, count: number) => sum + count, 0);
  }, [wins]);

  if (!isOpen) {
    return null;
  }

  const handleWinChange = (playerId: number, delta: number) => {
    setWins(prevWins => ({
      ...prevWins,
      [playerId]: Math.max(0, (prevWins[playerId] || 0) + delta)
    }));
  };

  const handleConfirm = () => {
    if (totalWins > 0) {
      onRecordWin(wins);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-slate-700 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fadeInUp 0.3s forwards' }}
      >
        <h2 className="text-2xl font-bold text-center mb-6">Registrar vitórias da sessão</h2>
        <div className="space-y-4">
          {players.map(player => (
            <div key={player.id} className="flex items-center justify-between bg-slate-700 p-3 rounded-lg">
              <span className="text-lg font-semibold">{player.name}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleWinChange(player.id, -1)}
                  className="w-10 h-10 bg-slate-600 rounded-full text-2xl font-bold flex items-center justify-center hover:bg-slate-500 transition disabled:opacity-50"
                  disabled={(wins[player.id] || 0) === 0}
                  aria-label={`Remover vitória de ${player.name}`}
                >
                  -
                </button>
                <span className="text-2xl font-bold w-10 text-center">{wins[player.id] || 0}</span>
                <button
                  onClick={() => handleWinChange(player.id, 1)}
                  className="w-10 h-10 bg-indigo-600 rounded-full text-2xl font-bold flex items-center justify-center hover:bg-indigo-500 transition"
                  aria-label={`Adicionar vitória para ${player.name}`}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex gap-4">
          <button
            onClick={onClose}
            className="w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={totalWins === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition disabled:bg-slate-500 disabled:cursor-not-allowed"
          >
            Confirmar ({totalWins} {totalWins === 1 ? 'vitória' : 'vitórias'})
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from {
            transform: scale(0.95) translateY(20px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default RecordMatchModal;