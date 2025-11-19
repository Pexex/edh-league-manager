import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Player, League, Match } from './types';
import { WINNING_SCORE } from './constants';
import PlayerSetup from './components/PlayerSetup';
import Scoreboard from './components/Scoreboard';
import LeagueSummary from './components/WinnerDisplay';
import RecordMatchModal from './components/RecordMatchModal';
import LifeCounter from './components/LifeCounter';
import EditScoreModal from './components/EditScoreModal';
import ImportModal from './components/ImportModal';
import LeagueSettingsModal from './components/LeagueSettingsModal';
import ConfirmModal from './components/ConfirmModal';
import CopyIcon from './components/icons/CopyIcon';
import FullScreenIcon from './components/icons/FullScreenIcon';
import EditIcon from './components/icons/EditIcon';
import TrashIcon from './components/icons/TrashIcon';

const App: React.FC = () => {
  const [leagues, setLeagues] = useState<League[]>(() => {
    try {
      const savedLeagues = localStorage.getItem('mtgLeagues');
      const parsed = savedLeagues ? JSON.parse(savedLeagues) : [];
      // Migração de dados antigos: garante que todas as ligas tenham nome
      return parsed.map((l: any) => ({
        ...l,
        name: l.name || `Liga de ${new Date(l.createdAt).toLocaleDateString('pt-BR')}`
      }));
    } catch (error) {
      console.error("Falha ao carregar ligas do localStorage", error);
      return [];
    }
  });

  const [activeLeagueId, setActiveLeagueId] = useState<string | null>(null);
  const [viewingLeagueId, setViewingLeagueId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditScoreModalOpen, setIsEditScoreModalOpen] = useState(false);
  const [isLifeCounterOpen, setIsLifeCounterOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingLeague, setEditingLeague] = useState<League | null>(null); // For LeagueSettingsModal
  const [leagueToDeleteId, setLeagueToDeleteId] = useState<string | null>(null); // For ConfirmModal

  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    try {
        localStorage.setItem('mtgLeagues', JSON.stringify(leagues));
    } catch (error) {
        console.error("Falha ao salvar ligas no localStorage", error);
    }
  }, [leagues]);

  // Monitora mudanças no Fullscreen para atualizar o ícone caso o usuário use ESC ou gestos
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable full-screen mode: ${e.message} (${e.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const activeLeague = useMemo(() => leagues.find(l => l.id === activeLeagueId), [leagues, activeLeagueId]);
  const viewingLeague = useMemo(() => leagues.find(l => l.id === viewingLeagueId), [leagues, viewingLeagueId]);

  const handleCreateLeague = (leagueName: string, playerNames: string[]) => {
    const newLeague: League = {
      id: Date.now().toString(),
      name: leagueName,
      createdAt: new Date().toISOString(),
      players: playerNames.map((name, index) => ({ id: index + 1, name, score: 0 })),
      matches: [],
      winnerId: null,
    };
    setLeagues(prevLeagues => [...prevLeagues, newLeague]);
    setActiveLeagueId(newLeague.id);
    setIsCreating(false);
  };

  // --- Manage Leagues Logic (Delete / Edit) ---

  const handleRequestDelete = (leagueId: string) => {
      setLeagueToDeleteId(leagueId);
  };

  const confirmDeleteLeague = () => {
    if (leagueToDeleteId) {
        setLeagues(prev => prev.filter(l => l.id !== leagueToDeleteId));
        if (activeLeagueId === leagueToDeleteId) setActiveLeagueId(null);
        if (viewingLeagueId === leagueToDeleteId) setViewingLeagueId(null);
        setLeagueToDeleteId(null);
    }
  };

  const handleSaveLeagueDetails = (leagueId: string, newName: string, newPlayerNames: { [id: number]: string }) => {
    setLeagues(prev => prev.map(l => {
        if (l.id === leagueId) {
            return {
                ...l,
                name: newName,
                players: l.players.map(p => ({
                    ...p,
                    name: newPlayerNames[p.id] || p.name
                }))
            };
        }
        return l;
    }));
    setEditingLeague(null);
  };

  // --- Game Logic ---

  const handleUpdateScores = (newScores: { [id: number]: number }) => {
    if (!activeLeague) return;

    const updatedLeagues = leagues.map(league => {
      if (league.id === activeLeagueId) {
        const updatedPlayers = league.players.map(player => {
          if (typeof newScores[player.id] === 'number') {
            return { ...player, score: newScores[player.id] };
          }
          return player;
        });

        let newWinnerId: number | null = null;
        const winners = updatedPlayers
            .filter(p => p.score >= WINNING_SCORE)
            .sort((a, b) => b.score - a.score);
        
        if (winners.length > 0) {
            newWinnerId = winners[0].id;
        }

        return { 
          ...league, 
          players: updatedPlayers, 
          winnerId: newWinnerId 
        };
      }
      return league;
    });
    
    const updatedActiveLeague = updatedLeagues.find(l => l.id === activeLeagueId);
    setLeagues(updatedLeagues);

    if (updatedActiveLeague && updatedActiveLeague.winnerId) {
      setViewingLeagueId(activeLeagueId);
      setActiveLeagueId(null);
    }
  };

  const handleRecordWin = (wins: { [key: number]: number }) => {
    if (!activeLeague) return;

    const updatedLeagues = leagues.map(league => {
      if (league.id === activeLeagueId) {
        const newMatches: Match[] = [];
        const now = new Date().toISOString();

        const updatedPlayers = league.players.map(player => {
          const winCount = wins[player.id] || 0;
          if (winCount > 0) {
            for (let i = 0; i < winCount; i++) {
              newMatches.push({
                id: `${Date.now()}-${player.id}-${i}`,
                winnerId: player.id,
                createdAt: now,
              });
            }
            const newScore = player.score + winCount;
            return { ...player, score: newScore };
          }
          return player;
        });

        let newWinnerId: number | null = league.winnerId;
        const winners = updatedPlayers.filter(p => p.score >= WINNING_SCORE).sort((a,b) => b.score - a.score);
        if (winners.length > 0) {
            newWinnerId = winners[0].id;
        }

        return { 
          ...league, 
          players: updatedPlayers, 
          matches: [...league.matches, ...newMatches], 
          winnerId: newWinnerId 
        };
      }
      return league;
    });
    
    const updatedActiveLeague = updatedLeagues.find(l => l.id === activeLeagueId);

    setLeagues(updatedLeagues);
    setIsModalOpen(false);

    if (updatedActiveLeague && updatedActiveLeague.winnerId) {
      setViewingLeagueId(activeLeagueId);
      setActiveLeagueId(null);
    }
  };

  const handleConfirmWinner = (winnerId: number) => {
    handleRecordWin({ [winnerId]: 1 });
    setIsLifeCounterOpen(false);
  };

  const handleReturnToDashboard = () => {
    setActiveLeagueId(null);
    setViewingLeagueId(null);
    setIsCreating(false);
  };
  
  const handleResumeLeague = (leagueId: string) => setActiveLeagueId(leagueId);
  const handleViewLeague = (leagueId: string) => setViewingLeagueId(leagueId);

  const leadingScore = useMemo(() => {
    if (!activeLeague) return 0;
    return Math.max(...activeLeague.players.map(p => p.score));
  }, [activeLeague]);

  // --- Import / Export Logic ---

  const handleCopyData = async () => {
      try {
          const dataStr = JSON.stringify(leagues, null, 2);
          await navigator.clipboard.writeText(dataStr);
          alert('Dados copiados para a área de transferência! Você pode colar no WhatsApp ou em um bloco de notas para salvar.');
      } catch (err) {
          console.error('Erro ao copiar', err);
          alert('Erro ao copiar dados.');
      }
  };

  const handleExportData = async () => {
    try {
        const dataStr = JSON.stringify(leagues, null, 2);
        const fileName = `commander_backup_${new Date().toISOString().slice(0,10)}.json`;
        const file = new File([dataStr], fileName, { type: 'application/json' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'Backup Commander League',
                    text: 'Arquivo de backup dos dados do aplicativo Commander League.'
                });
                return; 
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                   console.log('Compartilhamento falhou, tentando download...', error);
                   alert('Compartilhamento direto falhou. Iniciando download do arquivo...');
                } else {
                   return; 
                }
            }
        } else {
            alert('Iniciando download do backup...');
        }

        const url = URL.createObjectURL(new Blob([dataStr], { type: 'application/json' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error("Erro na exportação:", e);
        alert("Erro ao exportar. Tente usar a opção 'Copiar Dados'.");
    }
  };

  const processImportedData = (data: any) => {
    if (Array.isArray(data)) {
        setLeagues(prevLeagues => {
            const newLeagues = [...prevLeagues];
            let addedCount = 0;
            let updatedCount = 0;

            data.forEach((importedLeague: any) => {
                if (!importedLeague.id || !importedLeague.players) return; 
                
                if (!importedLeague.name) {
                    importedLeague.name = `Liga Importada ${new Date(importedLeague.createdAt).toLocaleDateString()}`;
                }

                const existingIndex = newLeagues.findIndex(l => l.id === importedLeague.id);
                if (existingIndex >= 0) {
                    newLeagues[existingIndex] = importedLeague;
                    updatedCount++;
                } else {
                    newLeagues.push(importedLeague);
                    addedCount++;
                }
            });
            
            alert(`Importação concluída!\n${addedCount} ligas adicionadas.\n${updatedCount} ligas atualizadas.`);
            return newLeagues;
        });
        setIsImportModalOpen(false);
    } else {
        alert('Formato de dados inválido. O backup deve conter uma lista de ligas.');
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const result = e.target?.result;
            if (typeof result === 'string') {
                const importedData = JSON.parse(result);
                processImportedData(importedData);
            }
        } catch (error) {
            console.error("Erro ao importar arquivo", error);
            alert('Erro ao ler o arquivo. Verifique se é um JSON válido.');
        }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTextImport = (text: string) => {
      try {
          const importedData = JSON.parse(text);
          processImportedData(importedData);
      } catch (error) {
          console.error("Erro ao importar texto", error);
          alert('Texto inválido. Certifique-se de copiar todo o conteúdo JSON começando com [ e terminando com ].');
      }
  };

  const requestFileUpload = () => {
      if (fileInputRef.current) {
          fileInputRef.current.click();
      }
  };
  
  const renderDashboard = () => {
    const activeLeagues = leagues.filter(l => l.winnerId === null);
    const completedLeagues = leagues.filter(l => l.winnerId !== null).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
      <div className="max-w-3xl mx-auto pb-10">
        <div className="text-center mb-8">
          <button onClick={() => setIsCreating(true)} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-indigo-900/30 text-lg sm:text-xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 mx-auto">
            <span>✨</span> Criar Nova Liga
          </button>
        </div>

        {leagues.length > 0 ? (
          <div className="space-y-10 mb-12">
            {activeLeagues.length > 0 && (
              <div className="animate-fade-in-up">
                <h2 className="text-xl font-bold text-indigo-300 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Ligas em Andamento
                </h2>
                <div className="grid gap-3">
                  {activeLeagues.map(league => (
                    <div key={league.id} className="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-md hover:border-indigo-500 transition-colors relative group flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pr-16">
                        {/* Action Buttons - Unified Segmented Control */}
                        <div className="absolute top-3 right-3 flex flex-col z-30 bg-slate-900 border border-slate-600 rounded-lg shadow-xl overflow-hidden">
                            <button 
                                onClick={(e) => { 
                                    e.preventDefault();
                                    e.stopPropagation(); 
                                    setEditingLeague(league); 
                                }}
                                className="p-2.5 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 transition-colors border-b border-slate-700 flex items-center justify-center"
                                title="Editar Liga"
                            >
                                <EditIcon className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={(e) => { 
                                    e.preventDefault();
                                    e.stopPropagation(); 
                                    handleRequestDelete(league.id); 
                                }}
                                className="p-2.5 hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors flex items-center justify-center"
                                title="Excluir Liga"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>

                      <div className="w-full">
                        <div className="font-bold text-xl text-white mb-1 pr-4 truncate">{league.name}</div>
                        <div className="text-sm text-slate-400">Iniciada em {new Date(league.createdAt).toLocaleDateString('pt-BR')} às {new Date(league.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</div>
                        <div className="text-xs text-slate-500 mt-1">{league.players.map(p => p.name).join(', ')}</div>
                      </div>
                      
                      <button onClick={() => handleResumeLeague(league.id)} className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 px-6 rounded-lg transition active:bg-green-700 shadow-lg shadow-green-900/20 mt-2 sm:mt-0">
                        Continuar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {completedLeagues.length > 0 && (
              <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-xl font-bold text-slate-400 mb-4">Histórico</h2>
                <div className="grid gap-3">
                  {completedLeagues.map(league => {
                      const winner = league.players.find(p => p.id === league.winnerId);
                      return (
                          <div key={league.id} className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl hover:bg-slate-800 transition-colors relative group flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pr-16">
                              {/* Action Buttons - Unified Segmented Control */}
                                <div className="absolute top-3 right-3 flex flex-col z-30 bg-slate-900 border border-slate-600 rounded-lg shadow-xl overflow-hidden">
                                    <button 
                                        onClick={(e) => { 
                                            e.preventDefault();
                                            e.stopPropagation(); 
                                            setEditingLeague(league); 
                                        }}
                                        className="p-2.5 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 transition-colors border-b border-slate-700 flex items-center justify-center"
                                        title="Editar Liga"
                                    >
                                        <EditIcon className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={(e) => { 
                                            e.preventDefault();
                                            e.stopPropagation(); 
                                            handleRequestDelete(league.id); 
                                        }}
                                        className="p-2.5 hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors flex items-center justify-center"
                                        title="Excluir Liga"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>

                              <div className="w-full">
                                  <div className="font-bold text-lg text-slate-200 pr-4 truncate">{league.name}</div>
                                  <p className="text-xs text-slate-500 mb-1">{new Date(league.createdAt).toLocaleDateString('pt-BR')}</p>
                                  <div className="font-semibold text-md flex items-center gap-2">
                                    <span>🏆</span>
                                    <span className="text-yellow-400">{winner?.name || 'N/A'}</span>
                                  </div>
                              </div>
                              
                              <button onClick={() => handleViewLeague(league.id)} className="w-full sm:w-auto bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-5 rounded-lg transition mt-2 sm:mt-0">
                                  Detalhes
                              </button>
                          </div>
                      );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center bg-slate-800/50 border border-slate-700 p-12 rounded-2xl mb-12">
              <div className="text-4xl mb-4">👋</div>
              <h2 className="text-2xl font-bold mb-2">Bem-vindo!</h2>
              <p className="text-slate-400">Nenhuma liga criada ainda. Clique no botão acima para começar a diversão.</p>
          </div>
        )}

        <div className="border-t border-slate-800 pt-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg font-bold text-slate-500 mb-4 uppercase tracking-wider text-xs">Gerenciamento de Dados</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                    onClick={handleExportData}
                    className="flex items-center justify-center gap-3 bg-slate-800 hover:bg-indigo-900/30 border border-slate-700 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-300 font-bold py-4 px-4 rounded-xl transition-all"
                >
                    <span className="text-xl">📤</span>
                    <div className="text-left">
                        <div className="text-sm">Exportar Backup</div>
                        <div className="text-[10px] opacity-60 font-normal">Salvar ou enviar via WhatsApp</div>
                    </div>
                </button>

                <button 
                    onClick={() => setIsImportModalOpen(true)}
                    className="flex items-center justify-center gap-3 bg-slate-800 hover:bg-green-900/30 border border-slate-700 hover:border-green-500/50 text-slate-300 hover:text-green-300 font-bold py-4 px-4 rounded-xl transition-all"
                >
                    <span className="text-xl">📥</span>
                    <div className="text-left">
                        <div className="text-sm">Importar Backup</div>
                        <div className="text-[10px] opacity-60 font-normal">Arquivo ou Colar Texto</div>
                    </div>
                </button>
                <input 
                    type="file" 
                    accept=".json" 
                    ref={fileInputRef} 
                    onChange={handleFileImport} 
                    className="hidden" 
                />
            </div>
            
            <div className="mt-4 flex justify-center">
                <button 
                    onClick={handleCopyData}
                    className="flex items-center gap-2 text-slate-400 hover:text-white text-sm py-2 px-4 rounded-lg transition-colors hover:bg-slate-800"
                >
                    <CopyIcon className="w-4 h-4" />
                    <span>Copiar Dados (Alternativa)</span>
                </button>
            </div>
        </div>

        <ImportModal 
            isOpen={isImportModalOpen} 
            onClose={() => setIsImportModalOpen(false)} 
            onRequestFileUpload={requestFileUpload}
            onImportText={handleTextImport}
        />

        <LeagueSettingsModal 
            isOpen={!!editingLeague}
            onClose={() => setEditingLeague(null)}
            league={editingLeague}
            onSave={handleSaveLeagueDetails}
        />

        <ConfirmModal
            isOpen={!!leagueToDeleteId}
            title="Excluir Liga"
            message="Tem certeza que deseja excluir esta liga permanentemente? Todo o histórico de partidas e pontuações será perdido. Esta ação não pode ser desfeita."
            onConfirm={confirmDeleteLeague}
            onCancel={() => setLeagueToDeleteId(null)}
        />
      </div>
    );
  }

  const renderContent = () => {
    if (viewingLeague) return <LeagueSummary league={viewingLeague} onReturn={handleReturnToDashboard} />;

    if (isLifeCounterOpen && activeLeague) {
      return <LifeCounter players={activeLeague.players} onClose={() => setIsLifeCounterOpen(false)} onConfirmWinner={handleConfirmWinner} />;
    }
    
    if (activeLeague) {
      return (
        <>
          <Scoreboard 
            players={activeLeague.players} 
            leadingScore={leadingScore} 
            onEditScores={() => setIsEditScoreModalOpen(true)}
            leagueName={activeLeague.name}
          />
          
          <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-700 p-3 z-40 safe-area-pb">
             <div className="max-w-5xl mx-auto grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-3">
                <button 
                    onClick={handleReturnToDashboard} 
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-3 px-4 rounded-xl transition active:scale-95 flex items-center justify-center gap-2"
                >
                   <span className="text-lg">🔙</span> <span className="hidden xs:inline">Voltar</span>
                </button>
                
                <button 
                    onClick={() => setIsLifeCounterOpen(true)} 
                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-green-900/20 transition active:scale-95 flex items-center justify-center gap-2"
                >
                    <span className="text-lg">❤️</span> <span className="hidden xs:inline">Vidas</span>
                </button>
                
                <button 
                    onClick={() => setIsModalOpen(true)} 
                    className="col-span-2 sm:col-span-1 sm:flex-grow sm:max-w-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-900/30 transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="text-lg">⚔️</span> Registrar Vitórias
                </button>
             </div>
          </div>
          
          <RecordMatchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} players={activeLeague.players} onRecordWin={handleRecordWin} />
          <EditScoreModal isOpen={isEditScoreModalOpen} onClose={() => setIsEditScoreModalOpen(false)} players={activeLeague.players} onSave={handleUpdateScores} />
        </>
      );
    }
    if (isCreating) return <PlayerSetup onStartLeague={handleCreateLeague} />;
    
    return renderDashboard();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {!isLifeCounterOpen && (
            <header className="text-center mb-6 sm:mb-10 pt-2 relative">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 drop-shadow-sm tracking-tight">
                    Commander League
                </h1>
                {activeLeague && (
                    <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-400">
                        Liga Ativa
                    </div>
                )}

                {/* Full Screen Toggle Button in Header */}
                <button
                    onClick={toggleFullScreen}
                    className="absolute top-0 right-0 mt-1 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-full transition-colors"
                    title={isFullScreen ? "Sair da Tela Cheia" : "Tela Cheia"}
                >
                    <FullScreenIcon isFullScreen={isFullScreen} />
                </button>
            </header>
        )}
        <main>
          {renderContent()}
        </main>
      </div>
      <style>{`
        .safe-area-pb {
            padding-bottom: env(safe-area-inset-bottom, 12px);
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;