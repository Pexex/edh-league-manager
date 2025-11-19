import React, { useState, useEffect, useMemo, useCallback, useRef, ReactNode } from 'react';
import type { Player } from '../types';
import { STARTING_LIFE } from '../constants';
import ShieldIcon from './icons/ShieldIcon';
import FullScreenIcon from './icons/FullScreenIcon';

interface LifeCounterProps {
  players: Player[];
  onClose: () => void;
  onConfirmWinner: (winnerId: number) => void;
}

interface PlayerState {
  life: number;
  poison: number;
  commanderDamage: { [attackerId: number]: number };
  isImmune: boolean;
  isEliminated: boolean;
}

// Expanded Color Palette
const PLAYER_COLORS = [
  { name: 'Azul', border: 'border-blue-500', bg: 'bg-blue-900', text: 'text-blue-200', shadow: 'shadow-blue-900/50', swatch: 'bg-blue-500' },
  { name: 'Vermelho', border: 'border-red-600', bg: 'bg-red-950', text: 'text-red-200', shadow: 'shadow-red-600/50', swatch: 'bg-red-600' },
  { name: 'Verde', border: 'border-green-600', bg: 'bg-green-950', text: 'text-green-200', shadow: 'shadow-green-600/50', swatch: 'bg-green-600' },
  { name: 'Amarelo (Branco)', border: 'border-yellow-500', bg: 'bg-yellow-950', text: 'text-yellow-200', shadow: 'shadow-yellow-500/50', swatch: 'bg-yellow-500' },
  { name: 'Roxo (Preto)', border: 'border-purple-600', bg: 'bg-purple-950', text: 'text-purple-200', shadow: 'shadow-purple-900/50', swatch: 'bg-purple-600' },
  { name: 'Laranja', border: 'border-orange-500', bg: 'bg-orange-950', text: 'text-orange-200', shadow: 'shadow-orange-900/50', swatch: 'bg-orange-500' },
  { name: 'Rosa', border: 'border-pink-500', bg: 'bg-pink-950', text: 'text-pink-200', shadow: 'shadow-pink-900/50', swatch: 'bg-pink-500' },
  { name: 'Turquesa', border: 'border-cyan-500', bg: 'bg-cyan-950', text: 'text-cyan-200', shadow: 'shadow-cyan-900/50', swatch: 'bg-cyan-500' },
  { name: 'Cinza (Incolor)', border: 'border-slate-400', bg: 'bg-slate-800', text: 'text-slate-200', shadow: 'shadow-slate-600/50', swatch: 'bg-slate-400' },
  { name: 'Escuro', border: 'border-gray-600', bg: 'bg-gray-950', text: 'text-gray-300', shadow: 'shadow-gray-900/50', swatch: 'bg-gray-700' },
  { name: 'Dourado', border: 'border-yellow-600', bg: 'bg-yellow-900', text: 'text-yellow-100', shadow: 'shadow-yellow-600/50', swatch: 'bg-yellow-600' },
  { name: 'Lima', border: 'border-lime-500', bg: 'bg-lime-900', text: 'text-lime-200', shadow: 'shadow-lime-500/50', swatch: 'bg-lime-500' },
  { name: 'Fúcsia', border: 'border-fuchsia-600', bg: 'bg-fuchsia-950', text: 'text-fuchsia-200', shadow: 'shadow-fuchsia-600/50', swatch: 'bg-fuchsia-600' },
  { name: 'Âmbar', border: 'border-amber-600', bg: 'bg-amber-950', text: 'text-amber-200', shadow: 'shadow-amber-600/50', swatch: 'bg-amber-600' },
  { name: 'Índigo', border: 'border-indigo-500', bg: 'bg-indigo-950', text: 'text-indigo-200', shadow: 'shadow-indigo-500/50', swatch: 'bg-indigo-500' },
  { name: 'Verde-azulado', border: 'border-teal-500', bg: 'bg-teal-950', text: 'text-teal-200', shadow: 'shadow-teal-500/50', swatch: 'bg-teal-500' },
];

// --- Sub-Components ---

interface ColorPickerModalProps {
    player: Player;
    currentColorIndex: number;
    onSelect: (colorIndex: number) => void;
    onClose: () => void;
}

const ColorPickerModal: React.FC<ColorPickerModalProps> = ({ player, currentColorIndex, onSelect, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[120]" onClick={onClose}>
            <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-center mb-6 text-white">Cor de {player.name}</h3>
                <div className="grid grid-cols-4 gap-4 justify-items-center">
                    {PLAYER_COLORS.map((theme, index) => (
                        <button
                            key={index}
                            onClick={() => { onSelect(index); onClose(); }}
                            className={`w-12 h-12 rounded-full ${theme.swatch} border-2 transition-transform active:scale-90 flex items-center justify-center ${currentColorIndex === index ? 'border-white scale-110 shadow-lg shadow-white/20' : 'border-transparent hover:border-white/50'}`}
                            title={theme.name}
                        >
                            {currentColorIndex === index && <span className="text-white font-bold text-lg">✓</span>}
                        </button>
                    ))}
                </div>
                <button onClick={onClose} className="w-full mt-8 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-colors">
                    Cancelar
                </button>
            </div>
        </div>
    );
};

interface DiceRollerModalProps {
    onClose: () => void;
}

const DiceRollerModal: React.FC<DiceRollerModalProps> = ({ onClose }) => {
    const [numDice, setNumDice] = useState(1);
    const [dieType, setDieType] = useState(20);
    const [results, setResults] = useState<number[] | null>(null);
    const [isRolling, setIsRolling] = useState(false);

    const handleRoll = () => {
        setIsRolling(true);
        setResults(null);
        
        setTimeout(() => {
            const newResults = Array.from({ length: numDice }, () => Math.floor(Math.random() * dieType) + 1);
            setResults(newResults);
            setIsRolling(false);
        }, 300);
    };

    const total = results ? results.reduce((a, b) => a + b, 0) : 0;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[110] flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
            <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-sm p-5 shadow-2xl flex flex-col max-h-full" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-center mb-4 text-white flex-shrink-0">Rolar Dados</h3>

                <div className="overflow-y-auto flex-1 -mx-2 px-2 custom-scrollbar">
                    <div className="space-y-4 pb-2">
                        <div className="flex items-center justify-between bg-slate-800 p-3 rounded-xl">
                            <span className="text-slate-400 font-bold text-sm">Quantidade</span>
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setNumDice(Math.max(1, numDice - 1))}
                                    className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xl font-bold hover:bg-slate-600 transition-colors"
                                >-</button>
                                <span className="text-xl font-black w-6 text-center">{numDice}</span>
                                <button 
                                    onClick={() => setNumDice(Math.min(10, numDice + 1))}
                                    className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-xl font-bold hover:bg-indigo-500 transition-colors"
                                >+</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {[4, 6, 8, 10, 12, 20].map(sides => (
                                <button
                                    key={sides}
                                    onClick={() => setDieType(sides)}
                                    className={`py-2 rounded-lg font-bold border transition-all text-sm ${dieType === sides ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/50' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    d{sides}
                                </button>
                            ))}
                        </div>

                        <div className="min-h-[100px] flex flex-col items-center justify-center bg-slate-950/50 rounded-xl border border-slate-800 p-4 relative overflow-hidden">
                            {isRolling ? (
                                <div className="animate-spin text-4xl">🎲</div>
                            ) : results ? (
                                <div className="text-center animate-bounce-in">
                                    <div className="text-5xl font-black text-indigo-400 mb-2">{total}</div>
                                    {numDice > 1 && (
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {results.map((r, i) => (
                                                <span key={i} className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs font-mono border border-slate-700">
                                                    {r}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <span className="text-slate-600 text-sm">Clique em Rolar</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex-shrink-0 space-y-3 mt-auto">
                    <button 
                        onClick={handleRoll}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-900/30 active:scale-95 transition-all"
                    >
                        ROLAR
                    </button>

                    <button onClick={onClose} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-colors">
                        Voltar
                    </button>
                </div>
            </div>
        </div>
    );
};

interface GroupedHistoryItem {
    type: 'life' | 'poison' | 'commander' | 'elimination';
    playerId: number;
    attackerId?: number;
    totalDelta: number;
    finalValue: number | boolean;
    startIndex: number;
    endIndex: number;
    count: number;
}

interface HistoryModalProps {
    history: Array<{ [id: number]: PlayerState }>;
    players: Player[];
    playerIndexMap: Map<number, number>;
    playerThemes: { [id: number]: number };
    onRevertToIndex: (index: number) => void;
    onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ history, players, playerIndexMap, playerThemes, onRevertToIndex, onClose }) => {
    
    const groupedHistory = useMemo(() => {
        const groups: GroupedHistoryItem[] = [];
        if (history.length < 2) return groups;

        for (let i = history.length - 1; i > 0; i--) {
            const currState = history[i];
            const prevState = history[i - 1];
            
            let changeFound: GroupedHistoryItem | null = null;

            for (const player of players) {
                const pCurr = currState[player.id];
                const pPrev = prevState[player.id];
                if (!pCurr || !pPrev) continue;

                if (pCurr.life !== pPrev.life) {
                    changeFound = {
                        type: 'life',
                        playerId: player.id,
                        totalDelta: pCurr.life - pPrev.life,
                        finalValue: pCurr.life,
                        startIndex: i - 1,
                        endIndex: i,
                        count: 1
                    };
                }
                else if (pCurr.poison !== pPrev.poison) {
                    changeFound = {
                        type: 'poison',
                        playerId: player.id,
                        totalDelta: pCurr.poison - pPrev.poison,
                        finalValue: pCurr.poison,
                        startIndex: i - 1,
                        endIndex: i,
                        count: 1
                    };
                }
                else if (pCurr.isEliminated !== pPrev.isEliminated) {
                     changeFound = {
                        type: 'elimination',
                        playerId: player.id,
                        totalDelta: 0,
                        finalValue: pCurr.isEliminated,
                        startIndex: i - 1,
                        endIndex: i,
                        count: 1
                    };
                }
                else {
                    for (const opponent of players) {
                        if (player.id === opponent.id) continue;
                        const cCurr = pCurr.commanderDamage[opponent.id] || 0;
                        const cPrev = pPrev.commanderDamage[opponent.id] || 0;
                        if (cCurr !== cPrev) {
                             changeFound = {
                                type: 'commander',
                                playerId: player.id,
                                attackerId: opponent.id,
                                totalDelta: cCurr - cPrev,
                                finalValue: cCurr,
                                startIndex: i - 1,
                                endIndex: i,
                                count: 1
                            };
                            break;
                        }
                    }
                }

                if (changeFound) break;
            }

            if (changeFound) {
                const lastGroup = groups.length > 0 ? groups[groups.length - 1] : null;
                
                const canMerge = lastGroup &&
                    lastGroup.type === changeFound.type &&
                    lastGroup.playerId === changeFound.playerId &&
                    lastGroup.attackerId === changeFound.attackerId &&
                    lastGroup.type !== 'elimination';

                if (canMerge) {
                    lastGroup.totalDelta += changeFound.totalDelta;
                    lastGroup.startIndex = changeFound.startIndex;
                    lastGroup.count += 1;
                } else {
                    groups.push(changeFound);
                }
            }
        }

        return groups;
    }, [history, players]);

    const getPlayerName = (id: number) => {
        const p = players.find(x => x.id === id);
        return p ? p.name : 'Unknown';
    };

    const getPlayerColorClass = (id: number) => {
        const themeIdx = playerThemes[id] ?? 0;
        return PLAYER_COLORS[themeIdx % PLAYER_COLORS.length].text;
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-6 z-[60]" onClick={onClose}>
            <div className="bg-slate-800 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col p-6 border border-slate-600" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold text-center mb-6 text-slate-100">Histórico</h3>
                <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {groupedHistory.length === 0 && <p className="text-slate-500 text-center py-4">Nenhuma ação registrada.</p>}
                    
                    {groupedHistory.map((group, idx) => {
                        const pName = getPlayerName(group.playerId);
                        const pColor = getPlayerColorClass(group.playerId);
                        
                        let description = '';
                        let valueDisplay = '';

                        if (group.type === 'life') {
                            const sign = group.totalDelta > 0 ? '+' : '';
                            description = `Vida ${sign}${group.totalDelta}`;
                            valueDisplay = `(${group.finalValue})`;
                        } else if (group.type === 'poison') {
                            const sign = group.totalDelta > 0 ? '+' : '';
                            description = `Veneno ${sign}${group.totalDelta}`;
                            valueDisplay = `(${group.finalValue})`;
                        } else if (group.type === 'commander') {
                            const sign = group.totalDelta > 0 ? '+' : '';
                            const attName = getPlayerName(group.attackerId!);
                            description = `Dano Cmd de ${attName}: ${sign}${group.totalDelta}`;
                            valueDisplay = `(${group.finalValue})`;
                        } else if (group.type === 'elimination') {
                            description = group.finalValue ? 'Eliminado' : 'Reviveu';
                        }

                        return (
                            <div key={idx} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600 flex justify-between items-center">
                                <div className="text-sm">
                                    <span className={`font-bold ${pColor} mr-2`}>{pName}</span>
                                    <span className="text-slate-300 font-medium">{description}</span>
                                    <span className="text-slate-500 ml-2 text-xs">{valueDisplay}</span>
                                    {group.count > 1 && (
                                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-600 text-slate-300">
                                            {group.count} ações
                                        </span>
                                    )}
                                </div>
                                <button 
                                    onClick={() => onRevertToIndex(group.startIndex)} 
                                    className="bg-yellow-600/80 hover:bg-yellow-500 text-white text-xs font-bold py-2 px-3 rounded ml-2 transition-colors"
                                >
                                    Reverter
                                </button>
                            </div>
                        );
                    })}
                </div>
                <button onClick={onClose} className="w-full mt-6 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl">Fechar</button>
            </div>
        </div>
    );
};

interface CommanderDamageModalProps {
    defender: Player;
    attacker: Player;
    damage: number;
    attackerColorText: string;
    defenderColorText: string;
    onUpdate: (delta: number) => void;
    onClose: () => void;
}

const CommanderDamageModal: React.FC<CommanderDamageModalProps> = ({ defender, attacker, damage, attackerColorText, defenderColorText, onUpdate, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-slate-900 rounded-2xl border-2 border-slate-700 w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-center mb-8 text-xl font-bold">
                    Dano de <span className={attackerColorText}>{attacker.name}</span> em <span className={defenderColorText}>{defender.name}</span>
                </h3>
                <div className="flex items-center justify-center gap-4">
                        <button onClick={() => onUpdate(-1)} className="w-16 h-16 rounded-full bg-slate-800 border border-slate-600 text-2xl hover:bg-slate-700">-</button>
                        <span className={`text-6xl font-black w-24 text-center ${damage >= 21 ? 'text-red-500' : 'text-white'}`}>{damage}</span>
                        <button onClick={() => onUpdate(1)} className="w-16 h-16 rounded-full bg-indigo-600 border border-indigo-500 text-2xl hover:bg-indigo-500">+</button>
                </div>
                <button onClick={onClose} className="w-full mt-8 bg-slate-800 py-3 rounded-xl font-bold">Fechar</button>
            </div>
        </div>
    )
}

interface PoisonModalProps {
    player: Player;
    poison: number;
    onUpdate: (delta: number) => void;
    onClose: () => void;
}

const PoisonModal: React.FC<PoisonModalProps> = ({ player, poison, onUpdate, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-slate-900 rounded-2xl border-2 border-green-600 w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-center mb-8 text-xl font-bold text-green-500">
                    Marcadores de Veneno ({player.name})
                </h3>
                <div className="flex items-center justify-center gap-4">
                        <button onClick={() => onUpdate(-1)} className="w-16 h-16 rounded-full bg-slate-800 border border-slate-600 text-2xl hover:bg-slate-700">-</button>
                        <span className="text-6xl font-black w-24 text-center text-green-500">{poison}</span>
                        <button onClick={() => onUpdate(1)} className="w-16 h-16 rounded-full bg-green-600 border border-green-500 text-2xl hover:bg-green-500">+</button>
                </div>
                <button onClick={onClose} className="w-full mt-8 bg-slate-800 py-3 rounded-xl font-bold">Fechar</button>
            </div>
        </div>
    )
}

interface ReorderModalProps {
    players: Player[];
    orderedPlayers: Player[];
    onSave: (newOrder: Player[]) => void;
    onClose: () => void;
}

const ReorderModal: React.FC<ReorderModalProps> = ({ players, orderedPlayers, onSave, onClose }) => {
    const [newOrderIds, setNewOrderIds] = useState<number[]>(() => orderedPlayers.map(p => p.id));
    const handleSelectChange = (idx: number, val: number) => {
        const ids = [...newOrderIds];
        const oldVal = ids[idx];
        const swapIdx = ids.indexOf(val);
        ids[idx] = val;
        if (swapIdx !== -1) ids[swapIdx] = oldVal;
        setNewOrderIds(ids);
    };
    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-6 z-[70]" onClick={onClose}>
            <div className="bg-slate-800 rounded-2xl w-full max-w-sm p-6 border border-slate-600" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-center mb-6">Reordenar Jogadores</h3>
                <div className="space-y-3">
                    {newOrderIds.map((pid, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg">
                            <span className="text-slate-400 text-sm font-bold">Posição {idx + 1}</span>
                            <select value={pid} onChange={(e) => handleSelectChange(idx, Number(e.target.value))} className="bg-slate-900 border border-slate-600 rounded p-2 text-white font-semibold">
                                {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                    <button onClick={onClose} className="bg-slate-700 py-3 rounded-xl font-bold">Cancelar</button>
                    <button onClick={() => {
                        onSave(newOrderIds.map(id => players.find(p => p.id === id)!));
                        onClose();
                    }} className="bg-indigo-600 py-3 rounded-xl font-bold">Salvar</button>
                </div>
            </div>
        </div>
    );
};

interface WinnerModalProps {
    winner: Player;
    onConfirm: () => void;
    onRevert: () => void;
}

const WinnerModal: React.FC<WinnerModalProps> = ({ winner, onConfirm, onRevert }) => (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-[80]">
        <div className="bg-slate-900 border-2 border-yellow-500/50 rounded-3xl p-8 text-center max-w-md w-full animate-bounce-in">
            <div className="text-7xl mb-4">🏆</div>
            <h2 className="text-3xl font-black text-white mb-2">{winner.name} Venceu!</h2>
            <div className="flex flex-col gap-3 mt-8">
                <button onClick={onConfirm} className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20">Confirmar Vitória</button>
                <button onClick={onRevert} className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-4 rounded-xl">Foi um engano (Reverter)</button>
            </div>
        </div>
    </div>
);

interface MenuModalProps {
    onHistory: () => void;
    onReorder: () => void;
    onDiceRoller: () => void;
    onReset: () => void;
    onExit: () => void;
    onClose: () => void;
}

const MenuModal: React.FC<MenuModalProps> = ({ onHistory, onReorder, onDiceRoller, onReset, onExit, onClose }) => {
    const [isFullScreen, setIsFullScreen] = useState(!!document.fullscreenElement);

    useEffect(() => {
        const handleFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
    }, []);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.log(err));
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-8 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-xs p-6 shadow-2xl max-h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-center mb-6 text-white">Menu</h3>
                
                <div className="space-y-3">
                    <button onClick={toggleFullScreen} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl flex items-center gap-3 transition-colors">
                        <FullScreenIcon isFullScreen={isFullScreen} className="w-6 h-6" />
                        <span className="text-lg">{isFullScreen ? 'Sair Tela Cheia' : 'Tela Cheia'}</span>
                    </button>

                    <div className="h-px bg-slate-800 my-2"></div>

                    <button onClick={onHistory} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl flex items-center gap-3 transition-colors">
                        <span className="text-xl">📜</span> Histórico
                    </button>
                    
                    <button onClick={onReorder} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl flex items-center gap-3 transition-colors">
                        <span className="text-xl">🔄</span> Reordenar
                    </button>

                    <button onClick={onDiceRoller} className="w-full bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold py-3 px-4 rounded-xl flex items-center gap-3 transition-colors border border-indigo-900/50">
                        <span className="text-xl">🎲</span> Rolar Dados
                    </button>

                    <div className="h-px bg-slate-800 my-2"></div>

                    <button onClick={onReset} className="w-full bg-slate-800 hover:bg-slate-700 text-yellow-400 font-bold py-3 px-4 rounded-xl flex items-center gap-3 transition-colors">
                        <span className="text-xl">⚠️</span> Reiniciar
                    </button>
                    
                    <button onClick={onExit} className="w-full bg-slate-800 hover:bg-slate-700 text-red-400 font-bold py-3 px-4 rounded-xl flex items-center gap-3 transition-colors">
                        <span className="text-xl">🚪</span> Sair
                    </button>
                </div>

                <button onClick={onClose} className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-colors">
                    Voltar
                </button>
            </div>
        </div>
    );
}

interface PlayerQuadrantProps {
    player: Player;
    index: number;
    state: PlayerState | undefined;
    changeInfo: { dir: 'increase' | 'decrease' } | null;
    recentChange: number;
    opponents: Player[];
    playerIndexMap: Map<number, number>;
    playerThemes: { [id: number]: number };
    themeIndex: number;
    onLifeChange: (delta: number) => void;
    onPoisonEdit: () => void;
    onCommanderDamageEdit: (attacker: Player) => void;
    onToggleImmunity: () => void;
    onClearAnimation: () => void;
    onOpenColorPicker: () => void;
}

const PlayerQuadrant: React.FC<PlayerQuadrantProps> = ({ 
    player, 
    index, 
    state, 
    changeInfo, 
    recentChange,
    opponents, 
    playerIndexMap, 
    playerThemes,
    themeIndex,
    onLifeChange, 
    onPoisonEdit, 
    onCommanderDamageEdit, 
    onToggleImmunity,
    onClearAnimation,
    onOpenColorPicker
}) => {
    
    useEffect(() => {
      if (changeInfo) {
        const timer = setTimeout(() => onClearAnimation(), 500);
        return () => clearTimeout(timer);
      }
    }, [changeInfo, onClearAnimation]);

    if (!state) return null;

    const isRotated = index < 2;
    const theme = PLAYER_COLORS[themeIndex % PLAYER_COLORS.length];
    
    const animationClass = changeInfo ? (changeInfo.dir === 'increase' ? 'animate-pulse-green' : 'animate-pulse-red') : '';
    const isEliminated = state.isEliminated;
    
    return (
      <div className={`relative w-full h-full flex flex-col ${theme.bg} overflow-hidden ${isRotated ? 'rotate-180 border-b-2' : 'border-t-2'} ${theme.border} transition-all duration-500`}>
        
        {/* Player Name Header - Golden Ratio Tier 3 - Clickable for Color */}
        <div className="flex-none py-2 text-center relative z-20">
             <button 
                onClick={onOpenColorPicker}
                className={`font-bold truncate px-3 py-1 rounded-full text-[3.5vmin] leading-tight ${theme.text} opacity-90 hover:bg-white/10 transition-colors`}
             >
                {player.name}
                <span className="ml-1 text-[2vmin] opacity-50">🎨</span>
             </button>
        </div>

        {/* Main Life Area with Split Controls */}
        <div className="flex-1 relative flex w-full">
             
             {/* Minus Controls (Left Half) */}
             <div className="w-1/3 h-full z-20 flex flex-col">
                <button 
                    onClick={() => onLifeChange(-1)}
                    className="flex-1 flex items-center justify-center text-[4vmin] font-bold text-white/30 hover:bg-black/10 active:bg-black/20 transition-colors focus:outline-none select-none"
                >
                    -1
                </button>
                <div className="h-px bg-white/10 w-full mx-auto opacity-50"></div>
                <button 
                    onClick={() => onLifeChange(-10)}
                    className="flex-1 flex items-center justify-center text-[4vmin] font-bold text-white/30 hover:bg-black/10 active:bg-black/20 transition-colors focus:outline-none select-none"
                >
                    -10
                </button>
             </div>

             {/* Life Total (Center) */}
             <div className="flex-1 flex flex-col items-center justify-center z-10 pointer-events-none">
                {/* Main Number */}
                <div className={`${animationClass}`}>
                    {isEliminated ? (
                    <span className="text-[15vmin] leading-none grayscale opacity-70 filter drop-shadow-xl">💀</span>
                    ) : (
                    <span className={`font-black text-[18vmin] leading-none tracking-tighter ${state.life <= 0 ? 'text-red-500' : 'text-white'} drop-shadow-xl`}>
                        {state.life}
                    </span>
                    )}
                </div>
                
                {/* Recent Change Counter (Transient) */}
                {recentChange !== 0 && !isEliminated && (
                     <div className={`mt-2 px-3 py-1 rounded-full font-bold text-[3.5vmin] backdrop-blur-sm animate-fade-in ${recentChange > 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                         {recentChange > 0 ? '+' : ''}{recentChange}
                     </div>
                )}
             </div>

             {/* Plus Controls (Right Half) */}
             <div className="w-1/3 h-full z-20 flex flex-col">
                <button 
                    onClick={() => onLifeChange(1)}
                    className="flex-1 flex items-center justify-center text-[4vmin] font-bold text-white/30 hover:bg-white/10 active:bg-white/20 transition-colors focus:outline-none select-none"
                >
                    +1
                </button>
                <div className="h-px bg-white/10 w-full mx-auto opacity-50"></div>
                <button 
                    onClick={() => onLifeChange(10)}
                    className="flex-1 flex items-center justify-center text-[4vmin] font-bold text-white/30 hover:bg-white/10 active:bg-white/20 transition-colors focus:outline-none select-none"
                >
                    +10
                </button>
             </div>

        </div>

        {/* Counters Footer - Golden Ratio Tier 3 */}
        <div className="flex-none h-[18%] flex items-center justify-between px-3 pb-1 relative z-20 bg-black/20">
            
            {/* Poison */}
            <button onClick={onPoisonEdit} className="flex flex-col items-center justify-center w-[15%] hover:bg-white/10 rounded transition">
                 <div className="flex items-center gap-1">
                    <div className={`text-[3vmin] ${state.poison > 0 ? 'text-green-400' : 'text-slate-500'}`}>☣</div>
                 </div>
                 <span className="text-[3vmin] font-bold leading-none">{state.poison}</span>
            </button>

            {/* Commander Damage Grid */}
            <div className="flex-1 flex justify-center gap-2 px-2">
                {opponents.map(opp => {
                   const dmg = state.commanderDamage[opp.id] || 0;
                   // Use the opponent's chosen theme ID, fallback to default index logic if undefined
                   const oppThemeIdx = playerThemes[opp.id] ?? (playerIndexMap.get(opp.id) ?? 0);
                   const oppTheme = PLAYER_COLORS[oppThemeIdx % PLAYER_COLORS.length];
                   
                   return (
                       <button 
                         key={opp.id} 
                         onClick={() => onCommanderDamageEdit(opp)}
                         className={`flex flex-col items-center justify-center w-8 rounded hover:bg-white/10 transition ${dmg >= 21 ? 'animate-pulse text-red-500 font-bold' : 'text-slate-300'}`}
                       >
                           <div className={`w-3 h-3 rounded-full mb-1 border ${oppTheme.border} ${oppTheme.bg}`}></div>
                           <span className="text-[3vmin] leading-none">{dmg}</span>
                       </button>
                   ) 
                })}
            </div>

            {/* Utilities */}
            <div className="w-[15%] flex justify-end">
                 <button onClick={onToggleImmunity} className="opacity-60 hover:opacity-100">
                    <ShieldIcon active={state.isImmune} />
                 </button>
            </div>
        </div>
      </div>
    );
};


// --- Main Component ---

const LifeCounter: React.FC<LifeCounterProps> = ({ players, onClose, onConfirmWinner }) => {
  const [history, setHistory] = useState<Array<{ [id: number]: PlayerState }>>([]);
  const playerStates = history.length > 0 ? history[history.length - 1] : {};
  
  const [lifeChange, setLifeChange] = useState<{ [id: number]: { dir: 'increase' | 'decrease' } | null }>({});
  const [recentLifeChanges, setRecentLifeChanges] = useState<{ [id: number]: number }>({});
  const changeTimeouts = useRef<{ [id: number]: ReturnType<typeof setTimeout> }>({});
  
  // Theme state: Map player ID to color index
  const [playerThemes, setPlayerThemes] = useState<{ [id: number]: number }>({});

  const [editingCommanderDamageOf, setEditingCommanderDamageOf] = useState<{ defender: Player; attacker: Player } | null>(null);
  const [editingPoisonOf, setEditingPoisonOf] = useState<Player | null>(null);
  const [editingColorOf, setEditingColorOf] = useState<Player | null>(null);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDiceRollerOpen, setIsDiceRollerOpen] = useState(false);
  const [orderedPlayers, setOrderedPlayers] = useState<Player[]>(players);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const playerIndexMap = useMemo(() => new Map(players.map((p, i) => [p.id, i])), [players]);

  const initializeStates = useCallback(() => {
    const initialState: { [id: number]: PlayerState } = {};
    const initialThemes: { [id: number]: number } = {};
    
    players.forEach((player, idx) => {
      initialThemes[player.id] = idx; // Default assign colors cyclically
      initialState[player.id] = {
        life: STARTING_LIFE,
        poison: 0,
        commanderDamage: players
          .filter(p => p.id !== player.id)
          .reduce((acc, opponent) => {
            acc[opponent.id] = 0;
            return acc;
          }, {} as { [id: number]: number }),
        isImmune: false,
        isEliminated: false,
      };
    });
    setHistory([initialState]);
    setPlayerThemes(initialThemes);
    setLifeChange({});
    setRecentLifeChanges({});
    setEditingCommanderDamageOf(null);
    setEditingPoisonOf(null);
    setEditingColorOf(null);
    setIsHistoryOpen(false);
    setOrderedPlayers(players);
    setIsReorderModalOpen(false);
    setWinner(null);
    setIsMenuOpen(false);
    setIsDiceRollerOpen(false);
  }, [players]);
  
  useEffect(() => {
    initializeStates();
  }, [initializeStates]);

  useEffect(() => {
    if (!playerStates || Object.keys(playerStates).length === 0) return;

    const nonEliminatedPlayers = players.filter(p => playerStates[p.id] && !playerStates[p.id].isEliminated);

    if (nonEliminatedPlayers.length === 1) {
      setWinner(nonEliminatedPlayers[0]);
    } else {
      setWinner(null);
    }
  }, [playerStates, players]);

  const updateState = (updater: (draftState: { [id: number]: PlayerState }) => void) => {
    setHistory(prevHistory => {
      if (prevHistory.length === 0) return [];
      const latestState = prevHistory[prevHistory.length - 1];
      const draftState = JSON.parse(JSON.stringify(latestState));
      updater(draftState);
      
      Object.keys(draftState).forEach(playerIdStr => {
        const playerId = parseInt(playerIdStr, 10);
        const state = draftState[playerId];
        const hasLost = (state.life <= 0 ||
                         state.poison >= 10 ||
                         Object.values(state.commanderDamage).some((dmg: number) => dmg >= 21));
        state.isEliminated = hasLost && !state.isImmune;
      });

      return [...prevHistory, draftState];
    });
  };

  const handleStateChange = (playerId: number, field: 'life' | 'poison' | 'commanderDamage', value: number, subfieldId?: number) => {
    let lifeDelta = 0;
    if (field === 'life') {
      lifeDelta = value;
    } else if (field === 'commanderDamage' && subfieldId) {
      const currentState = playerStates[playerId];
      if (currentState) {
        const currentDmg = currentState.commanderDamage[subfieldId] || 0;
        const newDmg = Math.max(0, currentDmg + value);
        const dmgDelta = newDmg - currentDmg;
        lifeDelta = -dmgDelta;
      }
    }

    if (lifeDelta !== 0) {
      const direction = lifeDelta > 0 ? 'increase' : 'decrease';
      setLifeChange(prev => ({ ...prev, [playerId]: { dir: direction } }));
      
      setRecentLifeChanges(prev => {
          const currentDelta = prev[playerId] || 0;
          return { ...prev, [playerId]: currentDelta + lifeDelta };
      });
      
      if (changeTimeouts.current[playerId]) {
          clearTimeout(changeTimeouts.current[playerId]);
      }
      
      changeTimeouts.current[playerId] = setTimeout(() => {
          setRecentLifeChanges(prev => {
              const newState = { ...prev };
              delete newState[playerId];
              return newState;
          });
      }, 1500);
    }

    updateState(draft => {
      const playerState = draft[playerId];
      if (!playerState) return;

      if (field === 'commanderDamage' && subfieldId) {
        const currentDmg = playerState.commanderDamage[subfieldId] || 0;
        const newDmg = Math.max(0, currentDmg + value);
        const dmgDelta = newDmg - currentDmg;
        playerState.commanderDamage[subfieldId] = newDmg;
        playerState.life -= dmgDelta;
      } else if (field === 'poison') {
        playerState.poison = Math.max(0, playerState.poison + value);
      } else { // life
        playerState.life += value;
      }
    });
  };
  
  const handleToggleImmunity = (playerId: number) => {
    updateState(draft => {
      if(draft[playerId]) {
        draft[playerId].isImmune = !draft[playerId].isImmune;
      }
    });
  };

  const handleRevertToIndex = (index: number) => {
    setHistory(prev => prev.slice(0, index + 1));
    setIsHistoryOpen(false);
  };

  const handleRevertLastAction = () => {
    if (history.length > 1) {
        handleRevertToIndex(history.length - 2);
    }
  };

  const handleClearAnimation = useCallback((playerId: number) => {
    setLifeChange(prev => ({ ...prev, [playerId]: null }));
  }, []);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden font-sans select-none">
        {/* The Grid */}
        <div className="w-full h-full grid grid-cols-2 grid-rows-2">
            {orderedPlayers.map((player, index) => (
                <PlayerQuadrant 
                    key={player.id} 
                    player={player} 
                    index={index}
                    state={playerStates[player.id]}
                    changeInfo={lifeChange[player.id] || null}
                    recentChange={recentLifeChanges[player.id] || 0}
                    opponents={players.filter(p => p.id !== player.id)}
                    playerIndexMap={playerIndexMap}
                    playerThemes={playerThemes}
                    themeIndex={playerThemes[player.id] ?? index}
                    onLifeChange={(delta) => handleStateChange(player.id, 'life', delta)}
                    onPoisonEdit={() => setEditingPoisonOf(player)}
                    onCommanderDamageEdit={(attacker) => setEditingCommanderDamageOf({ defender: player, attacker })}
                    onToggleImmunity={() => handleToggleImmunity(player.id)}
                    onClearAnimation={() => handleClearAnimation(player.id)}
                    onOpenColorPicker={() => setEditingColorOf(player)}
                />
            ))}
        </div>

        {/* Central Hub Button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
            <button 
                onClick={() => setIsMenuOpen(true)}
                className="w-12 h-12 bg-slate-900 rounded-full border-4 border-slate-700 flex items-center justify-center shadow-2xl shadow-black text-white hover:scale-110 hover:border-indigo-500 transition-all"
                aria-label="Menu"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>
        </div>

        {/* Modals */}
        {isMenuOpen && (
            <MenuModal 
                onHistory={() => { setIsHistoryOpen(true); setIsMenuOpen(false); }}
                onReorder={() => { setIsReorderModalOpen(true); setIsMenuOpen(false); }}
                onDiceRoller={() => { setIsDiceRollerOpen(true); setIsMenuOpen(false); }}
                onReset={initializeStates}
                onExit={onClose}
                onClose={() => setIsMenuOpen(false)}
            />
        )}
        
        {editingColorOf && (
            <ColorPickerModal 
                player={editingColorOf}
                currentColorIndex={playerThemes[editingColorOf.id] ?? 0}
                onSelect={(newIndex) => setPlayerThemes(prev => ({ ...prev, [editingColorOf.id]: newIndex }))}
                onClose={() => setEditingColorOf(null)}
            />
        )}

        {editingCommanderDamageOf && playerStates[editingCommanderDamageOf.defender.id] && (
            <CommanderDamageModal 
                defender={editingCommanderDamageOf.defender}
                attacker={editingCommanderDamageOf.attacker}
                damage={playerStates[editingCommanderDamageOf.defender.id].commanderDamage[editingCommanderDamageOf.attacker.id] || 0}
                attackerColorText={PLAYER_COLORS[(playerThemes[editingCommanderDamageOf.attacker.id] ?? playerIndexMap.get(editingCommanderDamageOf.attacker.id) ?? 0) % PLAYER_COLORS.length].text}
                defenderColorText={PLAYER_COLORS[(playerThemes[editingCommanderDamageOf.defender.id] ?? playerIndexMap.get(editingCommanderDamageOf.defender.id) ?? 0) % PLAYER_COLORS.length].text}
                onUpdate={(delta) => handleStateChange(editingCommanderDamageOf.defender.id, 'commanderDamage', delta, editingCommanderDamageOf.attacker.id)}
                onClose={() => setEditingCommanderDamageOf(null)}
            />
        )}

        {editingPoisonOf && playerStates[editingPoisonOf.id] && (
            <PoisonModal 
                player={editingPoisonOf} 
                poison={playerStates[editingPoisonOf.id].poison}
                onUpdate={(delta) => handleStateChange(editingPoisonOf.id, 'poison', delta)}
                onClose={() => setEditingPoisonOf(null)} 
            />
        )}

        {isHistoryOpen && (
            <HistoryModal 
                history={history} 
                players={players} 
                playerIndexMap={playerIndexMap}
                playerThemes={playerThemes}
                onRevertToIndex={handleRevertToIndex}
                onClose={() => setIsHistoryOpen(false)} 
            />
        )}

        {isDiceRollerOpen && (
            <DiceRollerModal onClose={() => setIsDiceRollerOpen(false)} />
        )}

        {isReorderModalOpen && (
            <ReorderModal 
                players={players} 
                orderedPlayers={orderedPlayers}
                onSave={setOrderedPlayers}
                onClose={() => setIsReorderModalOpen(false)}
            />
        )}

        {winner && (
            <WinnerModal 
                winner={winner} 
                onConfirm={() => onConfirmWinner(winner.id)} 
                onRevert={handleRevertLastAction} 
            />
        )}

        <style>{`
            .animate-pulse-green { animation: pulseGreen 0.4s ease-out; }
            .animate-pulse-red { animation: pulseRed 0.4s ease-out; }
            .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
            .animate-bounce-in { animation: bounceIn 0.6s cubic-bezier(0.215, 0.610, 0.355, 1.000) both; }
            
            @keyframes pulseGreen {
                0% { transform: scale(1); text-shadow: 0 0 0 rgba(74, 222, 128, 0); }
                50% { transform: scale(1.2); text-shadow: 0 0 20px rgba(74, 222, 128, 0.8); color: #4ade80; }
                100% { transform: scale(1); }
            }
            @keyframes pulseRed {
                0% { transform: scale(1); text-shadow: 0 0 0 rgba(248, 113, 113, 0); }
                50% { transform: scale(1.2); text-shadow: 0 0 20px rgba(248, 113, 113, 0.8); color: #f87171; }
                100% { transform: scale(1); }
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes bounceIn {
                0% { transform: scale(0.3); opacity: 0; }
                50% { transform: scale(1.05); opacity: 1; }
                70% { transform: scale(0.9); }
                100% { transform: scale(1); }
            }
        `}</style>
    </div>
  );
};

export default LifeCounter;