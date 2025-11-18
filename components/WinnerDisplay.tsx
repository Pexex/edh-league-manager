import React, { useState } from 'react';
import type { League } from '../types';
import { WINNING_SCORE } from '../constants';
import CrownIcon from './icons/CrownIcon';
import WhatsAppIcon from './icons/WhatsAppIcon';
import CopyIcon from './icons/CopyIcon';

interface LeagueSummaryProps {
  league: League;
  onReturn: () => void;
}

const LeagueSummary: React.FC<LeagueSummaryProps> = ({ league, onReturn }) => {
  const [showToast, setShowToast] = useState(false);
  const winner = league.players.find(p => p.id === league.winnerId);
  const sortedPlayers = [...league.players].sort((a, b) => b.score - a.score);

  const generateResultText = () => {
    const date = new Date(league.createdAt).toLocaleDateString('pt-BR');
    const header = `🏆 *Resultado Final da Liga Commander* - ${date} 🏆\n\n`;
    const winnerText = `👑 O Campeão é: *${winner?.name}*! 👑\n\n`;
    
    const body = sortedPlayers.map((p, i) => {
        const rank = i + 1;
        let medal = `${rank}º`;
        if (rank === 1) medal = '🥇';
        if (rank === 2) medal = '🥈';
        if (rank === 3) medal = '🥉';
        
        return `${medal} *${p.name}*: ${p.score} pts`;
    }).join('\n');
    
    return `${header}${winnerText}*Placar Final:*\n${body}\n\nGerado via Commander League App`;
  };

  const handleShare = async () => {
    const text = generateResultText();
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Resultado Liga Commander',
                text: text,
            });
        } catch (err) {
            console.log('Erro ao compartilhar', err);
        }
    } else {
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    }
  };

  const handleCopy = async () => {
    const text = generateResultText();
    try {
        await navigator.clipboard.writeText(text);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
        console.error('Falha ao copiar', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-2xl border border-green-500/50 z-50 flex items-center gap-2 animate-fade-in-up">
            <span className="text-green-400 text-xl">✓</span> 
            <span className="font-bold">Resultado copiado!</span>
        </div>
      )}

      <div className="text-center bg-gradient-to-br from-slate-800 to-slate-900 p-6 sm:p-8 rounded-2xl shadow-2xl border border-indigo-500/30 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500"></div>
        <div className="mb-4 text-6xl sm:text-7xl animate-bounce">🏆</div>
        <h2 className="text-2xl sm:text-4xl font-black mb-2 text-white tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">{winner?.name || 'Desconhecido'}</span>
        </h2>
        <p className="text-indigo-300 font-bold text-lg uppercase tracking-widest mb-4">É o Campeão!</p>
        <p className="text-slate-400 text-sm">
          Liga concluída em {new Date(league.createdAt).toLocaleDateString('pt-BR')}
        </p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-lg overflow-hidden mb-8">
        <h3 className="bg-slate-900/50 p-4 text-lg font-bold text-center text-slate-300 border-b border-slate-700">Placar Final</h3>
        <div className="divide-y divide-slate-700">
          {sortedPlayers.map((player, index) => {
            const isWinner = player.id === league.winnerId;
            return (
              <div key={player.id} className={`p-4 flex justify-between items-center ${isWinner ? 'bg-yellow-500/10' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-mono w-6 h-6 flex items-center justify-center rounded-full ${index === 0 ? 'bg-yellow-500 text-black font-bold' : 'bg-slate-700 text-slate-400'}`}>
                    {index + 1}
                  </span>
                  <span className={`text-lg font-semibold flex items-center gap-2 ${isWinner ? 'text-yellow-400' : 'text-white'}`}>
                    {isWinner && <CrownIcon />}
                    {player.name}
                  </span>
                </div>
                <div className="text-right">
                    <span className={`text-xl font-bold ${isWinner ? 'text-yellow-400' : 'text-indigo-400'}`}>{player.score}</span>
                    <span className="text-xs text-slate-500 ml-1">pts</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        <button
          onClick={handleCopy}
          className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-3.5 px-6 rounded-xl shadow-lg border border-slate-600 transition-all transform active:scale-95 flex items-center justify-center gap-2"
        >
           <span className="w-5 h-5"><CopyIcon /></span>
           Copiar Texto
        </button>

        <button
          onClick={handleShare}
          className="bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-green-900/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
        >
           <span className="w-6 h-6"><WhatsAppIcon /></span>
           WhatsApp
        </button>

        <button
          onClick={onReturn}
          className="sm:col-span-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-10 rounded-xl shadow-lg shadow-indigo-900/20 transition-all transform active:scale-95 mt-2"
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  );
};

export default LeagueSummary;