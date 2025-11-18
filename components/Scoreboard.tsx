import React, { useState } from 'react';
import type { Player } from '../types';
import { WINNING_SCORE } from '../constants';
import CrownIcon from './icons/CrownIcon';
import LanternIcon from './icons/LanternIcon';
import WhatsAppIcon from './icons/WhatsAppIcon';
import CopyIcon from './icons/CopyIcon';

interface ScoreboardProps {
  players: Player[];
  leadingScore: number;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ players, leadingScore }) => {
  const [showToast, setShowToast] = useState(false);
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  const scores = players.map(p => p.score);
  const minScore = Math.min(...scores);
  const isTie = scores.every(score => score === scores[0]);

  const generateRankingText = () => {
    const date = new Date().toLocaleDateString('pt-BR');
    const header = `🔥 *Ranking Liga Commander* - ${date} 🔥\n\n`;
    const body = sortedPlayers.map((p, i) => {
        const rank = i + 1;
        let medal = `${rank}º`;
        if (rank === 1) medal = '🥇';
        if (rank === 2) medal = '🥈';
        if (rank === 3) medal = '🥉';
        
        return `${medal} *${p.name}*: ${p.score} pts`;
    }).join('\n');
    
    return `${header}${body}\n\nGerado via Commander League App`;
  };

  const handleShare = async () => {
    const text = generateRankingText();
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Ranking Commander',
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
    const text = generateRankingText();
    try {
        await navigator.clipboard.writeText(text);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
        console.error('Falha ao copiar', err);
    }
  };

  return (
    <div className="mb-32 sm:mb-24 relative">
        {/* Toast Notification */}
        {showToast && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-12 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-xl border border-slate-600 z-50 animate-fade-in-up flex items-center gap-2 whitespace-nowrap">
                <span className="text-green-400">✓</span> Copiado para área de transferência!
            </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 px-1">
            <h2 className="text-lg font-bold text-slate-400 uppercase tracking-wider">Ranking Atual</h2>
            
            <div className="flex gap-2 w-full sm:w-auto">
                <button 
                    onClick={handleCopy}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-bold py-2 px-3 rounded-lg shadow transition active:scale-95 border border-slate-600"
                    title="Copiar Ranking"
                >
                    <span className="w-4 h-4"><CopyIcon /></span>
                    <span className="sm:hidden md:inline">Copiar</span>
                </button>
                
                <button 
                    onClick={handleShare}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold py-2 px-3 rounded-lg shadow transition active:scale-95"
                    title="Compartilhar no WhatsApp"
                >
                    <span className="w-4 h-4"><WhatsAppIcon /></span>
                    <span>WhatsApp</span>
                </button>
            </div>
        </div>

        {/* Grid adaptativo: 1 coluna em celular pé, 2 colunas em celular deitado/tablet, 4 em desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedPlayers.map(player => {
            const progress = (player.score / WINNING_SCORE) * 100;
            const isLeading = player.score > 0 && player.score === leadingScore && !isTie;
            const isLast = player.score === minScore && !isTie;

            return (
            <div key={player.id} className="bg-slate-800/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-700/50 flex flex-col justify-between h-full transform transition-all duration-300 hover:border-indigo-500/50">
                <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg sm:text-xl font-bold text-gray-100 flex items-center gap-2 truncate pr-2">
                    {isLeading && <span className="flex-shrink-0"><CrownIcon /></span>}
                    {isLast && <span className="flex-shrink-0"><LanternIcon /></span>}
                    <span className="truncate">{player.name}</span>
                </h3>
                <span className={`text-2xl font-black ${isLeading ? 'text-yellow-400' : 'text-indigo-400'}`}>
                    {player.score}
                </span>
                </div>
                
                <div className="space-y-2">
                    <div className="w-full bg-slate-900/50 rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${isLeading ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'}`}
                        style={{ width: `${progress}%` }}
                    ></div>
                    </div>
                    <p className="text-right text-xs font-medium text-slate-400">
                        {player.score}/{WINNING_SCORE} pts
                    </p>
                </div>
            </div>
            );
        })}
        </div>
    </div>
  );
};

export default Scoreboard;