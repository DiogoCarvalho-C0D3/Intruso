import { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import Card from '../ui/Card';
import { ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RoundPhase({ gameState, onNextTurn }) {
    const { currentUser, currentRoom } = useGame();
    const [isLongTurn, setIsLongTurn] = useState(false);

    const currentPlayerId = gameState.turnOrder[gameState.currentTurnIndex];
    const currentPlayer = currentRoom.players.find(p => p.id === currentPlayerId);
    const isMyTurn = currentPlayerId === currentUser.id;

    // Calculate next player for UI
    const nextPlayerIndex = (gameState.currentTurnIndex + 1) % gameState.turnOrder.length;
    const nextPlayerId = gameState.turnOrder[nextPlayerIndex];
    const nextPlayer = currentRoom.players.find(p => p.id === nextPlayerId);

    // Show ONLY the specific category for this round
    const activeCategory = gameState.category || 'Geral';

    // Timer for vibration effect
    useEffect(() => {
        setIsLongTurn(false);
        const timer = setTimeout(() => {
            setIsLongTurn(true);
        }, 30000); // 30 seconds

        return () => clearTimeout(timer);
    }, [gameState.currentTurnIndex]);

    return (
        <div className="view-container relative flex flex-col h-full w-full overflow-hidden bg-gradient-to-b from-skin-base to-skin-card">
            {/* Header */}
            <div className="flex-none px-6 pt-4 pb-2 flex flex-row items-start justify-between w-full z-10 border-b border-skin-border/5 bg-skin-base/50 backdrop-blur-sm">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-skin-muted tracking-widest mb-0.5">Ronda</span>
                    <div className="text-xl font-black flex items-baseline gap-1">
                        <span className="text-skin-text">{gameState.round}</span>
                        <span className="text-skin-muted/50 text-sm">/{gameState.totalRounds}</span>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase font-bold text-skin-muted tracking-widest mb-1">Categoria</span>
                    <div className="px-3 py-1 bg-skin-primary/10 rounded-full text-xs font-bold border border-skin-primary/30 text-skin-primary whitespace-nowrap shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.1)]">
                        {activeCategory}
                    </div>
                </div>
            </div>

            {/* Main Stage */}
            <div className="flex-1 flex flex-col justify-center items-center relative w-full px-6">
                <motion.div
                    key={currentPlayerId}
                    initial={{ scale: 0.9, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center w-full max-w-sm"
                >
                    <div className="relative mb-8">
                        {isMyTurn && (
                            <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping opacity-75" />
                        )}
                        <div className="relative">
                            <Avatar
                                name={currentPlayer?.name}
                                seed={currentPlayer?.avatarSeed}
                                size="xl"
                                className={`relative z-10 shadow-2xl transition-all duration-300 ${isMyTurn ? 'border-4 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.3)]' : 'border-4 border-skin-border grayscale-[0.3]'}`}
                                accessory={currentPlayer?.accessory}
                            />
                            {isMyTurn && (
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg whitespace-nowrap z-20 flex items-center gap-1">
                                    <span>A TUA VEZ</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <h2 className="text-3xl font-black mb-3 text-center w-full truncate tracking-tight drop-shadow-lg text-skin-text">
                        {currentPlayer?.name}
                    </h2>

                    <div className={`w-full text-center px-6 py-4 rounded-2xl border transition-all duration-500 ${isMyTurn ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-500 shadow-[0_0_20px_rgba(250,204,21,0.1)]' : 'bg-skin-card/50 border-skin-border text-skin-muted'}`}>
                        <p className="text-sm font-bold leading-relaxed">
                            {isMyTurn ? "Diz uma palavra relacionada com a categoria!" : "A aguardar jogada..."}
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Footer */}
            <div className="flex-none p-6 pb-8 w-full z-10 bg-gradient-to-t from-skin-fill-end to-transparent">
                <div className="mb-4 flex items-center justify-center gap-2 opacity-50">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-skin-muted">Próximo:</span>
                    <div className="flex items-center gap-2 bg-skin-card/80 px-3 py-1 rounded-full border border-skin-border">
                        <Avatar name={nextPlayer?.name} seed={nextPlayer?.avatarSeed} size="xs" accessory={nextPlayer?.accessory} />
                        <span className="text-xs font-bold text-skin-text">{nextPlayer?.name}</span>
                    </div>
                </div>

                {isMyTurn ? (
                    <div className={isLongTurn ? 'animate-shake' : ''}>
                        <Button
                            onClick={onNextTurn}
                            className={`w-full shadow-xl text-lg tracking-wide border-0 relative overflow-hidden group ${isLongTurn ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-skin-primary hover:scale-[1.02]'}`}
                            style={{ height: '64px' }}
                        >
                            {isLongTurn && <Clock className="animate-pulse mr-2" size={24} />}
                            <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                                PASSAR A VEZ <ArrowRight size={24} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Button>
                        {isLongTurn && <p className="text-red-400 text-xs font-bold text-center mt-2 animate-pulse">Estás a demorar! Diz algo rápido!</p>}
                    </div>
                ) : (
                    <div className="w-full h-[64px] flex items-center justify-center text-skin-muted bg-skin-card/50 rounded-full border-2 border-dashed border-skin-border text-sm font-bold tracking-wide">
                        Aguardando {currentPlayer?.name}...
                    </div>
                )}
            </div>
        </div>
    );
}
